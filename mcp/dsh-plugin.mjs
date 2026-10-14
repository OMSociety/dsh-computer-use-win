// DSH adapter: configuration uses the host's existing Schemastery and MCP
// bridge. The standalone MCP server remains dependency-free.
import z from '@deepseek-ai/schemastery';
import { fileURLToPath } from 'node:url';

export const name = 'windows-computer-use';
export const inject = ['tools'];
export const Config = z.object({
  mode: z.union([
    z.const('lite').description('精简模式 / Lite: common tools, load others on demand'),
    z.const('full').description('全能模式 / Full: all desktop tools')
  ]).default('lite').description('工具模式 / Tool mode'),
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
  await bridge.apply(ctx, bridgeConfig(config));
}
