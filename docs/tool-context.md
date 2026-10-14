# 按需工具 / On-demand tools

## 简体中文

DSH 默认精简模式，插件配置的 `mode` 可选 `lite` 或 `full`，由宿主的配置表单展示。保存后重载插件/MCP worker。当前插件使用自己的配置适配器，仍调用官方 `@deepseek-ai/dsh-mcp-client`，不再直接把桥的全部底层连接参数当作用户配置。移除早期 `mcp-dsh-computer-use-win` 完整配置覆盖，避免旧配置替代新版模式设置。

精简模式有九个常用工具：`list_windows`、`find`、`click`、`scroll`、`type_text`、`keypress`、`ocr`、`screenshot`、`wait_for`，另有发现工具 `windows_computer_use_tools`。全能模式有原来的 23 项桌面工具及发现工具。原工具名称、调用参数和后台实现都保留。

发现工具操作示例（在 DSH 中名称为 `mcp__wincu__windows_computer_use_tools`）：

```json
{"operation":"list"}
{"operation":"describe","names":["drag"]}
{"operation":"enable","names":["drag"]}
{"operation":"disable","names":["drag"]}
{"operation":"reset"}
```

`describe` 只读取一个工具的完整说明和原始参数定义；它不会启用该工具，也不会启动 PowerShell 或读取桌面。`enable` 加载指定工具的精简定义；随后用原来的工具名调用，例如 `windows_computer_use_drag`。名称可写短名或完整原名。`disable` 卸载定义，`reset` 恢复启动模式的集合。加载状态仅属于当前 MCP worker，不写入用户模式配置，不跨 worker 或 profile 保存。

这是按需注入工具定义，不是删除后端功能或模型自动判断语义。标准 MCP `notifications/tools/list_changed` 通知客户端刷新；已验证官方 DSH 桥的注册、调用、移除流程。其他客户端若不处理该通知，需要显式刷新工具列表、重连，或使用全能模式。已有对话中的说明、调用结果和历史消息不会因卸载而消失。

直接使用 MCP/`wcu-mcp` 时默认全能模式，保持已有工具名可见。设置 MCP 子进程的 `WCU_TOOL_MODE=lite` 可选择精简模式；其他值会明确报错。MCP server 无第三方运行时依赖；DSH 配置适配器使用宿主已有的 Schemastery 与官方 MCP 桥，声明为 optional peers，不会为独立 MCP 自动安装一份 DSH。

0.4.0 同样序列化的 `tools/list`：0.3.1 是 43,495 字符；精简模式 9,046 字符（减少 79.2%），全能模式 20,259 字符（减少 53.4%）。字符数可复核；token 数必须由目标模型的分词器和真实宿主请求测量。参数 schema 的约束与执行校验没有删减，只缩短注入模型的说明。

## English

The DSH configuration adapter exposes `mode: lite | full`, defaulting to Lite. Save and reload the plugin/MCP worker. Remove legacy complete `mcp-dsh-computer-use-win` overrides before upgrading. The adapter delegates transport, lifecycle and cancellation to the official MCP bridge.

Lite initially advertises nine common desktop tools plus `windows_computer_use_tools`. Full advertises all original 23 desktop tools plus discovery. `list` returns a concise capability catalogue; `describe` returns one original full contract without enabling it or starting PowerShell. `enable` advertises named tools; call them by their original names. `disable` removes their definitions, and `reset` restores the startup set. State is worker-local and does not overwrite the user's saved mode.

The examples above accept short or complete original names. Standard MCP tool-list change notifications update the official DSH registry. Other clients must support notifications, explicitly refresh/reconnect, or use Full. Unloading cannot remove instructions or results already recorded in conversation history.

Standalone MCP defaults to Full; set the child environment `WCU_TOOL_MODE=lite` for Lite. Invalid values fail explicitly. The standalone server has no third-party runtime dependencies. The DSH adapter consumes the host's existing Schemastery and MCP bridge as optional peers.

Measured `tools/list`: 43,495 characters in 0.3.1, 9,046 in Lite and 20,259 in Full. Token counts depend on the target tokenizer and host request. Type, enum, bounds, required-property and default validation remains intact; only model-facing prose is shortened.
