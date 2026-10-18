// DSH owns MCP transport/cancellation. Display changes do not kill input.
import z from '@deepseek-ai/schemastery';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DEFAULT_SETTINGS, normalizeSettings, enabledToolsForSettings, STOP_SHORTCUT_PATTERN, TOOL_NAMES } from './settings.mjs';
import { atomicJson } from './takeover.mjs';

export const name = 'windows-computer-use';
export const inject = ['tools'];
const fields = {
  mode: z.union([z.const('lite'),z.const('full')]).default('full').description('旧版工具模式 / Legacy tool mode'),
  toolPreset: z.union(['auto','full','lite','custom'].map(value=>z.const(value))).default('auto').description('工具加载方案 / Tool preset'),
  enabledTools: z.array(z.union(TOOL_NAMES.map(name=>z.const(name)))).max(24).default([...TOOL_NAMES]).description('启用的工具 / Enabled tools'),
  indicatorEnabled: z.boolean().default(true).description('接管提示 / Takeover indicator'),
  cursorIndicatorEnabled: z.boolean().default(true).description('鼠标指示 / Pointer indicator'),
  remoteIndicatorVisible: z.boolean().default(true).description('远程与录屏可见 / Visible in remote sessions and recordings'),
  indicatorText: z.string().default(DEFAULT_SETTINGS.indicatorText).description('提示文字 / Banner text'),
  indicatorPosition: z.union([z.const('top'),z.const('bottom')]).default('top').description('提示位置 / Banner position'),
  indicatorIdleMs: z.number().min(200).max(3000).default(800).description('结束后隐藏延时（毫秒） / Hide delay (ms)'),
  stopShortcut: z.string().pattern(STOP_SHORTCUT_PATTERN).default('').description('自定义停止快捷键 / Custom stop shortcut'),
  resumeToken: z.number().min(0).default(0),
  previewToken: z.number().min(0).default(0)
};
export const SettingsConfig = z.object(fields);
export const Config = z.object({ ...Object.fromEntries(Object.entries(fields).map(([key,field])=>[key,typeof field.volatile === 'function' ? field.volatile() : field])),
  toolCallTimeoutMs: z.number().min(1).default(60000).description('工具调用超时（毫秒） / Tool timeout (ms)'),
  failOnStartupError: z.boolean().default(false)
});
export function bridgeConfig(config = {}, runtime = {}) {
  const settings = normalizeSettings(config);
  return {
    serverName: 'wincu', transport: 'stdio', command: process.execPath,
    args: [fileURLToPath(new URL('./server.mjs', import.meta.url))],
    env: { ELECTRON_RUN_AS_NODE: '1', WCU_TOOL_MODE: settings.mode, WCU_ENABLED_TOOLS: JSON.stringify(enabledToolsForSettings(settings)), WCU_SETTINGS_JSON: JSON.stringify(settings),
      ...(runtime.configFile ? { WCU_CONFIG_FILE: runtime.configFile, WCU_STATE_FILE: runtime.stateFile } : {}) },
    toolCallTimeoutMs: config.toolCallTimeoutMs ?? 60000,
    failOnStartupError: config.failOnStartupError ?? false
  };
}
export async function apply(ctx, config) {
  const bridge = await import('@deepseek-ai/dsh-mcp-client');
  const root = mkdtempSync(path.join(os.tmpdir(), 'dsh-wcu-control-'));
  const runtime = { configFile: path.join(root,'settings.json'), stateFile: path.join(root,'state.json') };
  let desired = normalizeSettings(config), runningSelection, connection, stopped = false;
  let updates = Promise.resolve();
  atomicJson(runtime.configFile, desired);
  ctx.effect(() => () => { stopped = true; });
  const applySettings = next => {
    const nextSettings = normalizeSettings(next);
    atomicJson(runtime.configFile, nextSettings);
    // Windows readers can briefly deny replacement. Keep desired unchanged
    // on a failed write so the next poll retries the pending settings.
    desired = nextSettings;
    const pending = updates.then(async () => {
      if (!connection || stopped) return;
      await connection.await();
      const nextSelection=JSON.stringify(enabledToolsForSettings(nextSettings));
      if (stopped || runningSelection === nextSelection) return;
      const deadline = Date.now() + 65000;
      for (;;) {
        let active = false;
        try { active = JSON.parse(readFileSync(runtime.stateFile,'utf8')).active > 0; }
        catch (error) { if (error.code !== 'ENOENT') throw error; }
        if (!active || stopped) break;
        if (Date.now() > deadline) throw new Error('Tool selection change is waiting for the current desktop action to finish');
        await new Promise(resolve => setTimeout(resolve,100));
      }
      if (stopped) return;
      await connection.update(bridgeConfig({ ...config, ...nextSettings }, runtime), true);
      await connection.await(); runningSelection = nextSelection;
    });
    updates = pending.catch(() => {});
    return pending;
  };
  // Volatile references belong to this adapter. Keep their polling lifetime
  // with the owner rather than a settings-service injection child.
  if (Object.values(config).some(value => typeof value?.get === 'function')) ctx.effect(() => {
    const timer = setInterval(()=>{
      try {const next=normalizeSettings(config);if(JSON.stringify(next)!==JSON.stringify(desired))applySettings(next).catch(error=>ctx.logger.error(error));}
      catch(error){ctx.logger.error(error);}
    },250);
    timer.unref(); return ()=>clearInterval(timer);
  });
  ctx.inject(['settings'], settingsContext => {
    if (typeof settingsContext.settings.register !== 'function') {
      // DSH 0.2 uses volatile Config fields keyed by the profile entry id.
      if (settingsContext.settings.configure) settingsContext.effect(()=>settingsContext.settings.configure({auto:false},ctx.fiber));
      return;
    }
    const scope = settingsContext.settings.register('windows-computer-use', SettingsConfig, {
      base: normalizeSettings(config), applies: 'live', validate: normalizeSettings
    });
    desired = normalizeSettings(scope.get()); atomicJson(runtime.configFile, desired);
    settingsContext.effect(() => scope.watch(applySettings));
    if (connection) return applySettings(desired);
  });
  runningSelection = JSON.stringify(enabledToolsForSettings(desired));
  connection = ctx.plugin(bridge, bridgeConfig({ ...config, ...desired }, runtime));
  await connection;
  await applySettings(desired);
}
