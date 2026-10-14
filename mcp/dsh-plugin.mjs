// DSH adapter: configuration uses the host's existing Schemastery and MCP
// bridge. The standalone MCP server remains dependency-free.
import z from '@deepseek-ai/schemastery';
import { fileURLToPath } from 'node:url';

export const name = 'windows-computer-use';
export const inject = ['tools'];
const modeSchema = z.union([
    z.const('lite').description('精简模式 / Lite: common tools, load others on demand'),
    z.const('full').description('全能模式 / Full: all desktop tools')
  ]).default('lite').description('工具模式 / Tool mode');
export const SettingsConfig = z.object({ mode: modeSchema });
export const Config = z.object({
  mode: modeSchema,
  toolCallTimeoutMs: z.number().min(1).default(60000).description('工具调用超时（毫秒） / Tool timeout (ms)'),
  failOnStartupError: z.boolean().default(false)
});
export function bridgeConfig(config = {}) {
  const mode = config.mode ?? 'lite';
  if (!['lite', 'full'].includes(mode)) throw new Error('mode must be lite or full');
  return {
    serverName: 'wincu', transport: 'stdio', command: process.execPath,
    args: [fileURLToPath(new URL('./server.mjs', import.meta.url))],
    env: { ELECTRON_RUN_AS_NODE: '1', WCU_TOOL_MODE: mode },
    toolCallTimeoutMs: config.toolCallTimeoutMs ?? 60000,
    failOnStartupError: config.failOnStartupError ?? false
  };
}
export async function apply(ctx, config) {
  // Keep connection ownership, lifecycle and cancellation on the official
  // bridge, rather than implementing another MCP client.
  const bridge = await import('@deepseek-ai/dsh-mcp-client');
  let desiredMode = config.mode ?? 'lite';
  let runningMode;
  let connection;
  let stopped = false;
  let updates = Promise.resolve();
  ctx.effect(() => () => { stopped = true; });
  const changeMode = mode => {
    desiredMode = mode;
    const next = updates.then(async () => {
      if (!connection || stopped) return;
      await connection.await();
      if (stopped || runningMode === mode) return;
      await connection.update(bridgeConfig({ ...config, mode }), true);
      await connection.await();
      runningMode = mode;
    });
    // Keep future saves usable after a contained lifecycle error, while the
    // current observer still receives the rejection for host diagnostics.
    updates = next.catch(() => {});
    return next;
  };
  ctx.inject(['settings'], settingsContext => {
    const scope = settingsContext.settings.register('windows-computer-use', SettingsConfig, {
      base: { mode: config.mode ?? 'lite' }, applies: 'live'
    });
    desiredMode = scope.get().mode;
    settingsContext.effect(() => scope.watch(next => changeMode(next.mode)));
    // A provider can mount after connection startup in an optional host.
    if (connection) return changeMode(desiredMode);
  });
  runningMode = desiredMode;
  connection = ctx.plugin(bridge, bridgeConfig({ ...config, mode: desiredMode }));
  await connection;
  await changeMode(desiredMode);
}
