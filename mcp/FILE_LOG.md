<!-- maintain-file-logs schema=1 -->
# 文件导航

## 目录

- 当前子项
- 按需读取
- 历史查询

索引 revision：2。仅登记直接子项；原文件是当前内容事实来源。

## 当前子项

| 路径 | 类型 | 内容简介 | 何时读取 | 定位点/子索引 | 验证 |
| --- | --- | --- | --- | --- | --- |
| [activity.mjs](activity.mjs) | file | Existing file; contents not reviewed in this task. | Read only when relevant to the requested change. |  | unread |
| [client.js](client.js) | file | Bilingual settings UI with four presets and explicit Lazy startup/permission counts. | Read when investigating version 0.5.0 behavior, tests or packaging. | lazyCount | verified |
| [dsh-plugin.mjs](dsh-plugin.mjs) | file | Official DSH bridge configuration and live preset reconnect handling. | Read when investigating version 0.5.0 behavior, tests or packaging. | toolSelectionKey | verified |
| [server.mjs](server.mjs) | file | MCP server with Lazy management-only startup and atomic allowed-tool wildcard batches. | Read when investigating version 0.5.0 behavior, tests or packaging. | const initialNames | verified |
| [settings.mjs](settings.mjs) | file | Normalize saved presets and permissions; reconnect key distinguishes Lazy startup. | Read when investigating version 0.5.0 behavior, tests or packaging. | toolSelectionKey | verified |
| [takeover.mjs](takeover.mjs) | file | Existing file; contents not reviewed in this task. | Read only when relevant to the requested change. |  | unread |

## 按需读取

先检索路径/用途，再打开相关子索引或原文件片段。详细字段见 FILE_INDEX.json。unread/partial/stale 条目需要进一步核实。

## 历史查询

按路径或稳定 ID 搜索 FILE_HISTORY.jsonl；仅在需要追溯时读取命中事件。历史从首次登记开始，来源未知与未观察的中间版本不可推断。
