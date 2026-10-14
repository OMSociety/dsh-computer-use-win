# dsh-computer-use-win

**Windows desktop tools for DeepSeek Harness**

[![npm](https://img.shields.io/npm/v/dsh-computer-use-win?label=npm&color=blue)](https://www.npmjs.com/package/dsh-computer-use-win) [![CI](https://github.com/Yu-tao-Li/dsh-computer-use-win/actions/workflows/ci.yml/badge.svg)](https://github.com/Yu-tao-Li/dsh-computer-use-win/actions/workflows/ci.yml) ![Windows](https://img.shields.io/badge/platform-Windows-0078D6) [![MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**语言 / Language:** [简体中文](#简体中文) · [English](#english)

[Releases](https://github.com/Yu-tao-Li/dsh-computer-use-win/releases) · [npm](https://www.npmjs.com/package/dsh-computer-use-win) · [Issues](https://github.com/Yu-tao-Li/dsh-computer-use-win/issues)

---
## 简体中文

让 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的 agent 读取并操作真实 Windows 应用：找控件、看截图、识别文字、点击、输入和管理窗口。

**23 项桌面能力 · 精简 / 全能模式 · 默认支持 PowerShell 5.1**

[快速开始](#快速开始) · [使用示例](#使用示例) · [实际演示](#实际演示) · [工具与进阶](#工具与进阶) · [常见问题](#常见问题) · [English ↑](#english)

### 快速开始

**需要：** Windows 交互桌面、已安装的 DSH。普通 Node 宿主需 Node.js ≥ 22；DSH Desktop 使用自己的 Electron 运行时。默认后端为系统自带的 Windows PowerShell 5.1。

```powershell
dsh plugin --profile web add dsh-computer-use-win
```

重启 `dsh web`；DSH Desktop 用户重新加载对应宿主和 MCP worker。将 `web` 换成**实际使用的 profile**，让 agent 检查连接；需要 `health` 时可按需加载。工具在 DSH 中显示为 `mcp__wincu__windows_computer_use_*`。

<details open>
<summary>其他安装方式与升级检查</summary>

从 GitHub 安装：

```powershell
dsh plugin --profile web add github:Yu-tao-Li/dsh-computer-use-win
```

也可在 DSH 插件市场搜索 **dsh-computer-use-win**。升级后完整重载 MCP worker；可通过 MCP `initialize.serverInfo.version` 核对运行版本。

安装路径由当前 profile 的 `package.json` 解析，支持 pnpm 布局和自定义 `$DSH_HOME`。同一 profile 保留一个 `serverName: wincu` 配置。安装在另一个 profile 中不会自动改变当前宿主使用的版本。

曾为 [#13](https://github.com/Yu-tao-Li/dsh-computer-use-win/issues/13) 添加专用完整配置覆盖的用户，应移除那项旧覆盖后检查 `health`。新版默认 bundle 已为 Electron 子进程设置 `ELECTRON_RUN_AS_NODE=1`；自定义 Electron 构建需要启用 `runAsNode` fuse。

</details>

### 工具模式与上下文

默认使用**精简模式**。打开 **设置 → 插件 → 可配置插件 → Windows 桌面操作**，选择精简或全能并保存；MCP worker 会重新加载。已安装的旧版完整 MCP 配置覆盖应先移除。

| 模式 | 模型初始可见的工具 | 工具定义字符数 |
|---|---|---|
| 精简（默认） | 9 个常用工具 + 1 个发现入口 | 9,046，较 0.3.1 减少 79.2% |
| 全能 | 23 项桌面工具 + 1 个发现入口 | 20,259，较 0.3.1 减少 53.4% |

精简模式保留窗口列表、查找、点击、滚动、输入、按键、OCR、截图和条件等待。需要拖动、无障碍树或窗口管理时，agent 可通过 `tools` 发现入口读取单个工具的详细说明，再加载它；用完可卸载或 `reset` 恢复默认集合。能力和参数校验都保留。

数字来自同一序列化方式下的实际 MCP `tools/list` 定义，原版为 43,495 字符；模型 token 数取决于分词器、宿主包装和会话历史。加载的说明及历史消息不会从已有对话中自动消失。更多配置与调用示例见[按需工具说明](docs/tool-context.md)。

### 能做什么

| 你想完成的事 | agent 可以使用的能力 |
|---|---|
| 找到按钮、输入框或窗口 | UIA 无障碍树、控件查询、原生窗口枚举 |
| 读取自绘界面或 canvas 中的文字 | OCR 文字及屏幕坐标；稀疏 UIA 查询可自动补 OCR |
| 点击、输入、填写表单 | UIA 语义动作、前台鼠标键盘、保留焦点的文本输入 |
| 判断操作有没有产生效果 | 等待窗口、控件或可见文字出现；重新截图观察 |

截图也可交给有视觉能力的调用方。插件本身提供桌面工具，不附带模型、API key 或视觉模型服务。

### 使用示例

装好后，可以把下面的任务直接交给 agent；结果取决于目标应用、可用模型和当前页面状态。

> 在记事本中输入“会议纪要”，再读取文本确认写入成功。

> 在已打开的计算器中计算 25 × 4，并读取结果。

> 打开网易云音乐，搜索“晴天”，确认结果页出现“周杰伦”。若无障碍树看不到搜索框，就用 OCR 定位可见文字后继续操作。

一次可靠的操作通常是：**观察目标 → 定位 → 执行动作 → 确认结果**。

`verification: "sent"` 表示动作已调度；`wait_for` 返回 `verification: "observed"` 才表示指定条件已被观察到。OCR 点击后，`type_text` 默认保留焦点。目标不是真正前台时，带目标的前台输入会被拒绝。

### 实际演示

以下截图来自实际桌面操作。

#### 网易云音乐：搜索《晴天》

**打开应用 → OCR 定位搜索框 → 输入“晴天” → 确认搜索结果。**

网易云的默认无障碍树只暴露少量节点，OCR 让插件仍能定位搜索入口并完成操作。0.3.1 在独立 Windows 虚拟机中完成了两次冷启动搜索，结果页可见“晴天”和“周杰伦”。

![网易云音乐搜索晴天的实际结果页，显示搜索词晴天和歌手周杰伦](assets/netease-qingtian-search.png)

| 文件资源管理器 | 文档输入 | 计算器 |
|---|---|---|
| ![通过 find 与 invoke 选中文件](assets/screenshot-1.png) | ![文本输入与内容回读](assets/screenshot-2.png) | ![计算器显示 25 乘 4 的结果 100](assets/screenshot-3.png) |
| 查询并选择文件 | 写入后读取内容 | 定位按钮并读取结果 |

<details open>
<summary>0.3.1 的真实任务验证</summary>

在独立 Windows 11 家庭中文版 22621.4112 虚拟机中，使用 PowerShell 5.1.22621.4111、2560×1600、150% DPI 和网易云 3.1.41.205529，完成两次冷启动搜索：OCR 定位 → 点击 → 输入“晴天” → 回车 → 在最终 OCR/截图中确认“单曲”和“周杰伦”。文本、图片及文件列表剪贴板内容均恢复，所有测前/测后原生响应探测通过。

该测试通过官方 Cordis / ToolRuntime / MCP bridge 程序化执行，没有模型参与，未验证播放；[#18](https://github.com/Yu-tao-Li/dsh-computer-use-win/issues/18) 中报告的应用卡死仍未复现。更多证据见 [0.3.1 发布说明](https://github.com/Yu-tao-Li/dsh-computer-use-win/releases/tag/v0.3.1) 和 [测试记录](docs/dev-notes.md)。

</details>

### 工具与进阶

通常从 `health`、`list_windows`、`find` / `snapshot` 开始，再按目标选择动作。下表使用工具短名；完整 MCP 名称为 `windows_computer_use_<短名>`，DSH bridge 再加 `mcp__wincu__`。

<details open>
<summary>查看全部 23 个工具</summary>

| 用途 | 工具 |
|---|---|
| 连接与窗口定位 | `health` · `list_windows` |
| UIA 观察 | `snapshot` · `accessibility_tree` · `find` · `element_info` |
| 可见画面与文字 | `screenshot` · `ocr` |
| 鼠标 | `click` · `double_click` · `move` · `drag` · `scroll` |
| 文本与控件 | `type_text` · `keypress` · `focus` · `invoke` · `set_value` |
| 窗口管理 | `activate_window` · `move_window` · `close_window` |
| 等待与验证 | `wait_for` · `wait` |

支持窗口定位的工具可用 `windowTitle`、`processId` 或 `nativeWindowHandle` 限定目标。前台操作按需传 `activate:true`。`close_window` 发送 WM_CLOSE，应用可能弹出保存框或拒绝关闭。

[完整参数及返回约定](docs/wiki/mcp-tools.md) · [应用技术差异](docs/wiki/app-technology-matrix.md)

</details>

<details open>
<summary>UIA、OCR 与截图应该怎样选择？</summary>

| 当前观察 | 下一步 |
|---|---|
| 能读到所需控件 | 使用 UIA ID 与 `invoke` / `set_value` 等语义动作 |
| 树很少或查询截断 | 查看 `find` 自动补充的 OCR，或直接调用 `ocr` |
| OCR 查询为空 | 检查 `ocr.lines`：搜索框可能写着“大家都在搜”，而非“搜索” |
| 目标只有图标或视觉布局 | 用 `screenshot`，由具备视觉能力的调用方定位 |
| 目标已经未响应 | 停止追加 UIA / 输入，先检查原生窗口状态及恢复情况 |

`find` 对无匹配且稀疏（≤20 节点的启发式）或截断的 UIA 查询自动补 OCR。`ocrFallback:false` 可禁用；指定 `controlType` 时保留 UIA 类型约束。

OCR 候选带 `source:"ocr"` 和物理屏幕坐标，不提供伪造的 UIA ID。默认 OCR 和独立截图跳过 UIA；`resolveControl:true` 才执行 UIA 点查询，其结果可能是整页。`ocr(includeScreenshot:true)` 同时返回 MCP 图片。

前台且无遮挡的窗口优先采集真实屏幕内容，采集前后检查窗口位置和遮挡；其他情况按 PrintWindow → Windows.Graphics.Capture → 屏幕区域回退。屏幕区域采集用 `occludedPossible` 区分已检查无遮挡和可能被覆盖的情况。缩放图片中的点映射为：`屏幕坐标 = bounds 原点 + 图片坐标 / imageScale`。

</details>

<details>
<summary>0.3 的行为变化与可靠性设置</summary>

- `type_text` 默认 `focusMode:"preserve"`；显式 `"main"` 才寻找主文本控件。
- `wait_for` 支持 `condition:"window" / "element" / "text"`。截断树不能证明元素消失，可能被遮挡的 OCR 也不会作为确定证据。
- UIA 采用逐节点缓存和惰性遍历，默认 `treeTimeoutMs:5000`；`maxDepth` 上限为 12。超限返回部分结果及原因，单次同步 Provider 调用仍可能阻塞。
- 树 watchdog 为遍历预算加 10 秒；退休超时 worker 后可补充原生截图，但 UIA 结果仍保留失败标记，不重放输入。排队请求从实际发送时开始计时。
- 已观察 RuntimeId 在同一后端缓存最多 6000 项、有效期 5 分钟；未知或失效 ID 要求重新观察，并校验窗口归属。
- 参数按公开 schema 校验；JSON 输出去掉缩进。剪贴板格式在替换前读取并在 finally 还原；拖动异常时尝试释放鼠标按键。
- `element_info` 默认 `detailLevel:"compact"`；需要 value/patterns 时传 `"full"`。激活拒绝会带 warning、响应状态和原生窗口信息。

[完整更新记录](CHANGELOG.md)

</details>

### 常见问题

<details>
<summary>安装了，但没有工具或仍运行旧版本？</summary>

先核对当前宿主使用的 profile，再重载 MCP worker 并运行 `health`。检查同一 profile 是否重复配置 `serverName: wincu`，以及是否有旧版自定义 bundle 覆盖。DSH Desktop 与命令行可能使用不同 profile。

</details>

<details>
<summary>点击或输入没有效果？怎样中断？</summary>

Chromium、Electron 和部分 WinUI 控件可能忽略后台 PostMessage；优先使用明确目标的前台输入和剪贴板路径，并观察结果。`sent` 或后台 `verified:false` 都不代表任务已完成。

输入前确认目标窗口。窗口移动后会进行坐标补偿；按标题定位时若 HWND/PID 改变，身份校验会拒绝使用旧观察。将物理鼠标停在默认屏幕角落约 500 ms 可触发输入急停，移开后恢复。

Windows 权限隔离可能阻止操作提权窗口或 UAC 安全桌面。插件适用于可访问的交互桌面；只有坐标或文字不足以判断任意图标的语义。

</details>

<details>
<summary>PowerShell 7、其他系统和视觉模型支持如何？</summary>

仅支持 Windows。PowerShell 5.1 是默认并已验证的 WinRT OCR 路径。CI 覆盖 PowerShell 5.1 / 7；PowerShell 7 的真实测试覆盖 UIA/截图，OCR 使用确定性协议测试，不代表支持其真实 WinRT OCR。

本包不捆绑 OmniParser、UI-TARS 或其他视觉模型。可由调用方或独立服务消费截图，再把定位坐标交给输入工具。

</details>

### 文档与开发

[工具参数](docs/wiki/mcp-tools.md) · [架构](docs/wiki/architecture.md) · [测试记录](docs/dev-notes.md) · [更新日志](CHANGELOG.md) · [反馈问题](https://github.com/Yu-tao-Li/dsh-computer-use-win/issues)

<details>
<summary>开发环境、项目结构与回归测试</summary>

```text
DSH agent → 官方 MCP bridge → Node MCP server → 常驻 PowerShell 后端
                                             ├ UI Automation
                                             ├ 原生鼠标 / 键盘 / 窗口
                                             └ 截图 / Windows OCR
```

| 位置 | 内容 |
|---|---|
| `mcp/server.mjs` | MCP 服务、参数校验、worker 管理 |
| `scripts/windows-uia.ps1` | 桌面引擎，兼容 PowerShell 5.1 |
| `test/` | 隔离回归与专属窗口夹具 |
| `docs/wiki/` | 工具及架构说明 |
| `docs/dev-notes.md` | 设计、实验与测试记录 |

```powershell
npm ci
npm test
```

测试依赖只用于开发；运行时没有 npm 依赖。17 项套件使用独立进程和临时目录，包含真实 WinForms、Chromium 和稀疏 canvas，以及模拟输入/异常测试。`npm test` 不发送物理输入，不修改已安装的 DSH profile；日志保存到命令输出的目录。

验证 PowerShell 7：

```powershell
$env:WINDOWS_CU_POWERSHELL = (Get-Command pwsh).Source
npm test
```

`node test/notepad-e2e.mjs` 是另外的真实输入测试，会打开记事本；在专属测试桌面运行。

</details>

MIT 许可。基于 [cgissing/windows-computer-use](https://github.com/cgissing/windows-computer-use) 的衍生作品，版权与来源见 [THIRD_PARTY.md](THIRD_PARTY.md)。[插件市场](https://awesome-dsh-plugin.com) · [English ↑](#english) · [返回中文顶部 ↑](#简体中文)

---

## English

Give a [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) agent access to real Windows apps: find controls, inspect screenshots, read visible text, click, type and manage windows.

**23 desktop capabilities · Lite / Full modes · PowerShell 5.1 by default**

[Quick start](#quick-start) · [Try a task](#try-a-task) · [See it in action](#see-it-in-action) · [Tools and options](#tools-and-options) · [FAQ](#faq) · [简体中文 ↑](#简体中文)

### Quick start

**Requires:** an interactive Windows desktop and DSH. Ordinary Node hosts need Node.js ≥ 22; DSH Desktop uses its Electron runtime. The default backend is Windows PowerShell 5.1, included with Windows.

```powershell
dsh plugin --profile web add dsh-computer-use-win
```

Restart `dsh web`; Desktop users should reload their host and MCP worker. Replace `web` with **the profile your host actually uses**, then run `health` to check the connection. DSH exposes the tools as `mcp__wincu__windows_computer_use_*`.

<details open>
<summary>Other installation options and upgrade checks</summary>

Install from GitHub:

```powershell
dsh plugin --profile web add github:Yu-tao-Li/dsh-computer-use-win
```

Or search for **dsh-computer-use-win** in the DSH plugin market. After upgrading, fully reload the MCP worker; `initialize.serverInfo.version` identifies the running server version.

The bundle resolves the package through the current profile's `package.json`, supporting pnpm layouts and custom `$DSH_HOME`. Keep one `serverName: wincu` configuration per profile. Installing into another profile does not update the version used by the active host.

If you added a dedicated full configuration override for [#13](https://github.com/Yu-tao-Li/dsh-computer-use-win/issues/13), remove that old override and check `health`. The default bundle sets `ELECTRON_RUN_AS_NODE=1` for its Electron child; custom Electron builds need the `runAsNode` fuse enabled.

</details>

### Tool modes and context

**Lite is the default.** Open **Settings → Plugins → Configurable plugins → Windows computer use**, choose **Tool mode**, and save. The MCP worker reloads. Remove legacy full MCP configuration overrides first.

| Mode | Initially visible tools | Tool-definition characters |
|---|---|---|
| Lite (default) | 9 common tools + 1 discovery tool | 9,046; 79.2% less than 0.3.1 |
| Full | 23 desktop tools + 1 discovery tool | 20,259; 53.4% less than 0.3.1 |

Lite includes window listing, find, click, scroll, typing, keys, OCR, screenshots and condition waits. For dragging, UIA trees or window management, the agent can use `tools` to read one tool's full instructions and load it on demand. Disable it afterward or use `reset` to restore the initial set. Capabilities and argument validation are preserved.

These are measured MCP `tools/list` character counts using the same serialization (0.3.1: 43,495). Token counts depend on the tokenizer, host wrapping and conversation history. Unloading does not erase instructions or messages already in a conversation. See [on-demand tools](docs/tool-context.md) for configuration and call examples.

### What it can do

| Your task | Available capabilities |
|---|---|
| Locate a button, input or window | UIA accessibility trees, control queries and native window enumeration |
| Read text in custom interfaces or canvases | OCR with screen coordinates; sparse UIA searches can automatically add OCR |
| Click, type or fill a form | Semantic UIA actions, foreground mouse/keyboard and focus-preserving typing |
| Check whether an action had the expected effect | Wait for windows, controls or visible text; inspect a fresh screenshot |

A vision-capable caller can also inspect screenshots. This plugin supplies desktop tools; it does not bundle a model, API key or visual-model service.

### Try a task

After installation, give the agent a task like these. Results depend on the target app, calling model and current page state.

> Type “Meeting notes” into Notepad, then read the text back to verify it.

> Calculate 25 × 4 in the open Calculator window and read the result.

> Open NetEase Cloud Music, search for “晴天” (Qing Tian), and confirm “周杰伦” (Jay Chou) on the results page. If the accessibility tree does not expose the search field, use OCR to locate visible text and continue.

A typical workflow is **observe the target → locate → act → verify**.

`verification: "sent"` means an action was dispatched. A satisfied `wait_for` reports `verification: "observed"` for the specified condition. After an OCR click, `type_text` preserves focus by default. Targeted foreground input is refused when the requested window is not actually foreground.

### See it in action

These screenshots come from actual desktop operations.

#### NetEase Cloud Music: search for “晴天”

**Open the app → locate the search field with OCR → type “晴天” → verify the results.**

NetEase's default accessibility tree exposes only a few nodes. OCR lets the plugin locate the search entry and complete the task. Version 0.3.1 completed two cold-start searches in an independent Windows VM, with “晴天” and “周杰伦” visible on the results page.

![Actual NetEase Cloud Music search results showing 晴天 and artist 周杰伦](assets/netease-qingtian-search.png)

| File Explorer | Document input | Calculator |
|---|---|---|
| ![File selection using find and invoke](assets/screenshot-1.png) | ![Text input and content read-back](assets/screenshot-2.png) | ![Calculator result of 25 times 4 equals 100](assets/screenshot-3.png) |
| Query and select a file | Write, then read back | Locate buttons and read the result |

<details open>
<summary>0.3.1 task validation in a real application</summary>

An owned Windows 11 Home China 22621.4112 VM, PowerShell 5.1.22621.4111, 2560×1600 display, 150% DPI and NetEase 3.1.41.205529 completed two cold-start searches: OCR location → click → type “晴天” → Enter → observe “单曲” and “周杰伦” in the final OCR/screenshot. Clipboard text, bitmap and file-drop contents were restored; every before/after native responsiveness probe passed.

The task used the official Cordis / ToolRuntime / MCP bridge programmatically, without a model. Playback was not tested, and the app freeze reported in [#18](https://github.com/Yu-tao-Li/dsh-computer-use-win/issues/18) remains unreproduced. See the [0.3.1 release](https://github.com/Yu-tao-Li/dsh-computer-use-win/releases/tag/v0.3.1) and [test notes](docs/dev-notes.md) for evidence.

</details>

### Tools and options

Start with `health`, `list_windows`, and `find` / `snapshot`, then choose an action for the target. Short names below map to `windows_computer_use_<name>`; the DSH bridge adds `mcp__wincu__`.

<details open>
<summary>All 23 tools</summary>

| Purpose | Tools |
|---|---|
| Connection and window discovery | `health` · `list_windows` |
| UIA observation | `snapshot` · `accessibility_tree` · `find` · `element_info` |
| Visible images and text | `screenshot` · `ocr` |
| Mouse | `click` · `double_click` · `move` · `drag` · `scroll` |
| Text and controls | `type_text` · `keypress` · `focus` · `invoke` · `set_value` |
| Window management | `activate_window` · `move_window` · `close_window` |
| Waiting and verification | `wait_for` · `wait` |

Tools supporting window targeting accept `windowTitle`, `processId` or `nativeWindowHandle`. Use `activate:true` when foreground activation is needed. `close_window` sends WM_CLOSE; the app may show a save dialog or refuse to close.

[Full parameters and return contracts](docs/wiki/mcp-tools.md) · [Application technology differences](docs/wiki/app-technology-matrix.md)

</details>

<details open>
<summary>When should I use UIA, OCR or screenshots?</summary>

| Current observation | Next step |
|---|---|
| The desired control is accessible | Use its UIA ID with semantic `invoke` / `set_value` actions |
| The tree is sparse or the query is truncated | Inspect automatic OCR from `find`, or call `ocr` directly |
| An OCR query has no match | Read `ocr.lines`: a search field might display a suggestion instead of “Search” |
| Only icons or visual layout identify the target | Use `screenshot` with a vision-capable caller |
| The target has become unresponsive | Stop additional UIA/input calls; check native window state and recovery |

Empty sparse (≤20 nodes, a heuristic) or incomplete UIA searches can automatically add OCR. Disable this with `ocrFallback:false`; a `controlType` filter retains UIA type constraints.

OCR candidates carry `source:"ocr"` and physical screen coordinates, without invented UIA IDs. Default OCR and standalone screenshots skip UIA. Explicit `resolveControl:true` requests a UIA point lookup, whose result may be a whole document. `ocr(includeScreenshot:true)` also returns MCP image content.

An unobstructed foreground window uses actual screen pixels, with window geometry and occlusion checked before and after capture. Other cases try PrintWindow → Windows.Graphics.Capture → screen region. Screen-region captures use `occludedPossible` to distinguish a checked clear crop from a potentially covered fallback. Map a scaled image point with `screen coordinate = bounds origin + image coordinate / imageScale`.

</details>

<details>
<summary>0.3 behavior changes and reliability settings</summary>

- `type_text` defaults to `focusMode:"preserve"`; explicit `"main"` requests the main-text-control heuristic.
- `wait_for` supports `condition:"window" / "element" / "text"`. An incomplete tree cannot prove disappearance; potentially occluded OCR remains inconclusive.
- UIA uses element-scoped caching and lazy traversal, defaulting to `treeTimeoutMs:5000`; maximum depth is 12. Limits return partial results and reasons. An individual synchronous provider call can still block.
- The tree watchdog allows its budget plus 10 seconds. A replacement worker may attach a native screenshot after timeout, while preserving UIA failure and never replaying input. Queued deadlines start at dispatch.
- Observed RuntimeIds are cached in the same worker for five minutes, at most 6000 references. Unknown/stale IDs require a fresh observation; window ownership is checked.
- Arguments are validated against the advertised schemas; JSON output is compact. Clipboard formats are read before replacement and restored in finally; drag cleanup attempts button release.
- `element_info` defaults to `detailLevel:"compact"`; use `"full"` for value/patterns. Activation refusals include a warning, responsiveness and native window information.

[Full changelog](CHANGELOG.md)

</details>

### FAQ

<details>
<summary>Installed, but no tools—or an older version is still running?</summary>

Check the active host's profile, reload the MCP worker and run `health`. Look for duplicate `serverName: wincu` entries or old custom bundle overrides. Desktop and command-line hosts may use different profiles.

</details>

<details>
<summary>Input has no effect. How do I stop it?</summary>

Chromium, Electron and some WinUI controls may ignore background PostMessage input. Prefer a clearly targeted foreground/clipboard path and observe the result. Neither `sent` nor background `verified:false` establishes task completion.

Confirm the target before input. Coordinate homing compensates for window movement; title-based identity checks refuse stale observations when HWND/PID changes. Park the physical mouse in the default screen corner for about 500 ms to engage the input failsafe; move it away to resume.

Windows privilege boundaries may block elevated windows or the UAC secure desktop. The plugin operates on an accessible interactive desktop. Text or coordinates alone do not establish arbitrary icon semantics.

</details>

<details>
<summary>What about PowerShell 7, other platforms and visual models?</summary>

Windows only. PowerShell 5.1 is the default validated WinRT OCR path. CI covers both PowerShell 5.1 and 7; real PowerShell 7 tests cover UIA/screenshots, with deterministic OCR protocol tests rather than supported real WinRT OCR.

OmniParser, UI-TARS and other visual models are not bundled. A calling model or independent service can consume screenshots and return coordinates to the input tools.

</details>

### Docs and development

[Tool parameters](docs/wiki/mcp-tools.md) · [Architecture](docs/wiki/architecture.md) · [Test notes](docs/dev-notes.md) · [Changelog](CHANGELOG.md) · [Report an issue](https://github.com/Yu-tao-Li/dsh-computer-use-win/issues)

<details>
<summary>Development setup, project layout and regression tests</summary>

```text
DSH agent → Official MCP bridge → Node MCP server → Persistent PowerShell backend
                                                  ├ UI Automation
                                                  ├ Native mouse / keys / windows
                                                  └ Screenshots / Windows OCR
```

| Location | Contents |
|---|---|
| `mcp/server.mjs` | MCP service, argument validation and worker management |
| `scripts/windows-uia.ps1` | Desktop engine compatible with PowerShell 5.1 |
| `test/` | Isolated regressions and dedicated window fixtures |
| `docs/wiki/` | Tool and architecture documentation |
| `docs/dev-notes.md` | Design, experiments and test records |

```powershell
npm ci
npm test
```

Dependencies are for development only; the runtime has no npm dependencies. The 17 suites use isolated processes and temporary directories, covering actual WinForms, Chromium and sparse canvas providers plus simulated input/error handling. `npm test` sends no physical input and does not change installed DSH profiles; logs stay in the printed artifacts directory.

To check PowerShell 7:

```powershell
$env:WINDOWS_CU_POWERSHELL = (Get-Command pwsh).Source
npm test
```

`node test/notepad-e2e.mjs` is a separate real-input test that opens Notepad; run it on a dedicated test desktop.

</details>

MIT licensed. Derived from [cgissing/windows-computer-use](https://github.com/cgissing/windows-computer-use); copyright and attribution are preserved in [THIRD_PARTY.md](THIRD_PARTY.md). [Plugin market](https://awesome-dsh-plugin.com) · [简体中文 ↑](#简体中文) · [Back to English ↑](#english)
