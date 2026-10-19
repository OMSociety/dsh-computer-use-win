<!-- maintain-file-logs schema=1 -->
# 文件导航

## 目录

- 当前子项
- 按需读取
- 历史查询

索引 revision：6。仅登记直接子项；原文件是当前内容事实来源。

## 当前子项

| 路径 | 类型 | 内容简介 | 何时读取 | 定位点/子索引 | 验证 |
| --- | --- | --- | --- | --- | --- |
| [activation-cancellation.mjs](activation-cancellation.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [activity-series.mjs](activity-series.mjs) | file | Existing file; contents not reviewed in this task. | Read only when relevant to the requested change. |  | unread |
| [backend-lifecycle.mjs](backend-lifecycle.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [bench-latency.mjs](bench-latency.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [bench-persistent.mjs](bench-persistent.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [bundle-startup.mjs](bundle-startup.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [client-settings-contract.mjs](client-settings-contract.mjs) | file | 启动隔离 Chromium 渲染实际浏览器入口；检查子进程结果与退出状态。 | 需要该入口的行为、配置或回归细节时，打开原文件核实。 | settings | stale |
| [client-settings-electron.cjs](client-settings-electron.cjs) | file | Chromium UI regression covering Lazy save/remount, languages and custom-list preservation. | Read when investigating version 0.5.0 behavior, tests or packaging. | settings-lazy.png | verified |
| [debug-dpi.mjs](debug-dpi.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [debug-homing.mjs](debug-homing.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [host-client-discovery.mjs](host-client-discovery.mjs) | file | Existing file; contents not reviewed in this task. | Read only when relevant to the requested change. |  | unread |
| [host-settings-integration.mjs](host-settings-integration.mjs) | file | Real DSH settings and MCP registry reload, Lazy restart and batch notification tests. | Read when investigating version 0.5.0 behavior, tests or packaging. | lazyDynamicRegistry | verified |
| [host-settings-lock.ps1](host-settings-lock.ps1) | file | Existing file; contents not reviewed in this task. | Read only when relevant to the requested change. |  | unread |
| [input-upgrade-contract.ps1](input-upgrade-contract.ps1) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [install-electron.mjs](install-electron.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [lazy-native-smoke.mjs](lazy-native-smoke.mjs) | file | Native health, screenshot and wait after Lazy loading; no physical input. | Read when investigating version 0.5.0 behavior, tests or packaging. | screenshotBytes | verified |
| [lazy-tools.mjs](lazy-tools.mjs) | file | MCP regression for Lazy startup, wildcard restrictions, invalid-batch atomicity and reset. | Read when investigating version 0.5.0 behavior, tests or packaging. | reports.push | verified |
| [mcp-test-client.mjs](mcp-test-client.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [mcp-test.mjs](mcp-test.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [native-health-contract.ps1](native-health-contract.ps1) | file | 故障注入验证 health 不查询 UIA provider，涵盖无前台、窗口消失与响应状态。 | 需要该入口的行为、配置或回归细节时，打开原文件核实。 | ExpectLegacyFailure | stale |
| [native-input-errors.ps1](native-input-errors.ps1) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [native-window-contract.ps1](native-window-contract.ps1) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [native-window-discovery.mjs](native-window-discovery.mjs) | file | 用覆盖模块路径的 Utility 夹具验证原生后端启动、有限枚举和 HWND/PID 拒绝。 | 需要该入口的行为、配置或回归细节时，打开原文件核实。 | moduleRoot | stale |
| [notepad-e2e.mjs](notepad-e2e.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [observation-contract.mjs](observation-contract.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [ocr-query-contract.ps1](ocr-query-contract.ps1) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [profile-resolution.mjs](profile-resolution.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [run-tests.mjs](run-tests.mjs) | file | Sequential isolated runner for 26 Windows regression suites. | Read when investigating version 0.5.0 behavior, tests or packaging. | lazy-tools | verified |
| [schema-compatibility.mjs](schema-compatibility.mjs) | file | Existing file; contents not reviewed in this task. | Read only when relevant to the requested change. |  | unread |
| [source-encoding.mjs](source-encoding.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [sparse-canvas-smoke.mjs](sparse-canvas-smoke.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [takeover-cancellation.ps1](takeover-cancellation.ps1) | file | Existing file; contents not reviewed in this task. | Read only when relevant to the requested change. |  | unread |
| [takeover-event.ps1](takeover-event.ps1) | file | Existing file; contents not reviewed in this task. | Read only when relevant to the requested change. |  | unread |
| [takeover-native.mjs](takeover-native.mjs) | file | Existing file; contents not reviewed in this task. | Read only when relevant to the requested change. |  | unread |
| [test-capture.mjs](test-capture.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [test-features.mjs](test-features.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [tool-context.mjs](tool-context.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [uia-cache-contract.ps1](uia-cache-contract.ps1) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [uia-chromium-fixture.cjs](uia-chromium-fixture.cjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [uia-chromium-smoke.mjs](uia-chromium-smoke.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [uia-native-fixture.ps1](uia-native-fixture.ps1) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [uia-native-smoke.mjs](uia-native-smoke.mjs) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |
| [window-capture-contract.ps1](window-capture-contract.ps1) | file | 现有业务文件；本輪未复核完整正文与原始生成过程。 | 按精确路径需要该文件时，先打开原文件核实。 |  | stale |

## 按需读取

先检索路径/用途，再打开相关子索引或原文件片段。详细字段见 FILE_INDEX.json。unread/partial/stale 条目需要进一步核实。

## 历史查询

按路径或稳定 ID 搜索 FILE_HISTORY.jsonl；仅在需要追溯时读取命中事件。历史从首次登记开始，来源未知与未观察的中间版本不可推断。
