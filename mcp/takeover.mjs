import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, renameSync, unlinkSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_SETTINGS, normalizeSettings } from './settings.mjs';

export const STOPPED = 'COMPUTER_USE_STOPPED_BY_USER: The user pressed Esc or their custom stop shortcut. Stop desktop input; do not retry or resume automatically. The user can click Resume desktop control in Settings > Computer Use.';
const helperScript = fileURLToPath(new URL('../scripts/windows-takeover.ps1', import.meta.url));

export function atomicJson(file, value) {
  if (!file) return;
  mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporary, JSON.stringify(value) + '\n', 'utf8');
    renameSync(temporary, file);
  } catch (error) {
    // This temporary file belongs to this failed write and has no further use.
    try { unlinkSync(temporary); } catch { }
    throw error;
  }
}

export class TakeoverControl {
  constructor({ powershell = 'powershell.exe', onStop = () => {}, configFile = process.env.WCU_CONFIG_FILE,
    stateFile = process.env.WCU_STATE_FILE, testMode = false, config = {} } = {}) {
    this.powershell = powershell; this.onStop = onStop; this.configFile = configFile; this.stateFile = stateFile;
    this.testMode = testMode; this.config = normalizeSettings(config); this.active = 0; this.paused = false;
    this.eventName = `Local\\DSH-WCU-${randomUUID()}`; this.waiters = new Map(); this.nextId = 0;
    this.resumeToken = this.config.resumeToken; this.previewToken = this.config.previewToken; this.pauseMessage = STOPPED;
    this.disabledForTest = process.env.NODE_ENV === 'test' && process.env.WCU_TEST_NO_TAKEOVER === '1';
    try {
      const saved = JSON.parse(readFileSync(this.stateFile, 'utf8'));
      this.paused = saved.paused === true;
      this.pauseMessage = saved.pauseMessage ?? STOPPED;
      this.resumeToken = saved.resumeToken ?? this.resumeToken;
    } catch (error) { if (this.stateFile && error.code !== 'ENOENT') throw error; }
    if (configFile) {
      this.poll = setInterval(() => { this.sync().catch(error => this.fail(error)); }, 250);
      this.poll.unref();
    }
  }
  persist(reason) {
    atomicJson(this.stateFile, { paused: this.paused, active: this.active, reason: reason ?? null,
      resumeToken: this.resumeToken, pauseMessage: this.paused ? this.pauseMessage : null, updatedAt: new Date().toISOString() });
  }
  async sync() {
    if (this.syncing) return this.syncing;
    this.syncing = this.syncInner().finally(() => { this.syncing = null; });
    return this.syncing;
  }
  async syncInner() {
    if (this.closed) return;
    if (this.configFile) this.config = normalizeSettings(JSON.parse(await readFile(this.configFile, 'utf8')));
    if (this.child && (this.sentShortcut !== this.config.stopShortcut || this.sentCursorIndicator !== this.config.cursorIndicatorEnabled || this.sentRemoteVisible !== this.config.remoteIndicatorVisible)) {
      await this.command('configure', { stopShortcut: this.config.stopShortcut, cursorIndicatorEnabled: this.config.cursorIndicatorEnabled,remoteIndicatorVisible:this.config.remoteIndicatorVisible });
      this.sentShortcut = this.config.stopShortcut; this.sentCursorIndicator = this.config.cursorIndicatorEnabled;this.sentRemoteVisible=this.config.remoteIndicatorVisible;
    }
    if (this.config.resumeToken !== this.resumeToken && this.active === 0) {
      if (this.child) await this.command('resume');
      this.resumeToken = this.config.resumeToken; this.paused = false; this.persist('resumed-by-user');
    }
    if (this.config.previewToken !== this.previewToken) {
      this.previewToken = this.config.previewToken;
      if (!this.paused && this.active === 0 && !this.disabledForTest) await this.command('preview', this.config);
    }
  }
  async begin() {
    await this.sync();
    if (this.paused) throw new Error(this.pauseMessage);
    if (this.closed) throw new Error('COMPUTER_USE_STOPPING');
    if (!this.disabledForTest) {
      try { await this.command('begin', this.config); this.sentShortcut = this.config.stopShortcut; this.sentCursorIndicator = this.config.cursorIndicatorEnabled;this.sentRemoteVisible=this.config.remoteIndicatorVisible; }
      catch (error) { this.fail(error); throw error; }
    }
    if (this.paused) throw new Error(this.pauseMessage);
    this.active++; this.persist();
  }
  async end() {
    this.active = Math.max(0, this.active - 1); this.persist(this.paused ? 'stopped-by-user' : null);
    if (this.active === 0 && this.child && !this.paused) await this.command('end').catch(error => this.fail(error));
  }
  fail(error) {
    if (this.closed || this.paused) return;
    this.paused = true;
    this.pauseMessage = error?.message === STOPPED ? STOPPED : `COMPUTER_USE_PAUSED: ${error?.message ?? error}. Desktop input is paused; restore the stop listener and resume in Settings > Computer Use.`;
    this.persist(String(error?.message ?? error));
    // This also covers a control-file or presentation failure while input runs.
    this.child?.stdin.write(JSON.stringify({command:'stop'})+'\n',()=>{});
    this.onStop(new Error(this.pauseMessage));
  }
  async start() {
    if (this.starting) return this.starting;
    if (this.child) return;
    this.starting = new Promise((resolve, reject) => {
      let buffer = '', diagnostic = '', ready = false;
      const args = ['-NoLogo', '-NoProfile', '-NonInteractive', '-STA', '-ExecutionPolicy', 'Bypass', '-File', helperScript, '-CancelEvent', this.eventName];
      if (this.testMode) args.push('-TestMode');
      const child = this.child = spawn(this.powershell, args, { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
      const deadline = setTimeout(() => { reject(new Error('Takeover stop listener startup timed out')); child.kill(); }, 15000);
      child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
      child.stderr.on('data', chunk => { diagnostic = (diagnostic + chunk).slice(-6000); });
      child.stdout.on('data', chunk => {
        buffer += chunk;
        for (;;) {
          const at = buffer.indexOf('\n'); if (at < 0) break;
          const line = buffer.slice(0, at).trim(); buffer = buffer.slice(at + 1); if (!line) continue;
          let message; try { message = JSON.parse(line); } catch { continue; }
          if (message.kind === 'ready') { ready = true; clearTimeout(deadline); resolve(); }
          else if (message.kind === 'stopped') this.fail(new Error(STOPPED));
          else {
            const pending = this.waiters.get(message.id); if (!pending) continue;
            clearTimeout(pending.timer); this.waiters.delete(message.id);
            message.ok ? pending.resolve(message) : pending.reject(new Error(message.error));
          }
        }
      });
      const died = error => {
        clearTimeout(deadline);
        if (this.child === child) this.child = null;
        const failure = error ?? new Error(`Takeover stop listener exited${diagnostic ? ': ' + diagnostic : ''}`);
        if (!ready) reject(failure);
        for (const [id, pending] of this.waiters) { clearTimeout(pending.timer); pending.reject(failure); this.waiters.delete(id); }
        if (!this.closed) this.fail(failure);
      };
      child.once('error', died); child.once('exit', () => died());
      child.stdin.on('error', () => {});
    }).finally(() => { this.starting = null; });
    return this.starting;
  }
  async command(command, params = {}) {
    await this.start();
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.waiters.delete(id); reject(new Error(`Takeover ${command} timed out`)); }, 5000);
      this.waiters.set(id, { resolve, reject, timer });
      this.child.stdin.write(JSON.stringify({ ...params, id, command }) + '\n', error => {
        if (error) { clearTimeout(timer); this.waiters.delete(id); reject(error); }
      });
    });
  }
  async close() {
    this.closed = true; clearInterval(this.poll);
    if (this.child) {
      const child = this.child;
      await this.command('close').catch(() => {});
      child.stdin.end();
      const force = setTimeout(() => { if (child.exitCode === null) child.kill(); }, 1000); force.unref();
    }
  }
}
