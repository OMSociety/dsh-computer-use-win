[English](README.en.md)

# dsh-computer-use-win

[![version](https://img.shields.io/github/v/release/Yu-tao-Li/dsh-computer-use-win?label=version&color=blue)](https://github.com/Yu-tao-Li/dsh-computer-use-win/releases)
[![CI](https://github.com/Yu-tao-Li/dsh-computer-use-win/actions/workflows/ci.yml/badge.svg)](https://github.com/Yu-tao-Li/dsh-computer-use-win/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)
![platform](https://img.shields.io/badge/platform-Windows-0078D6)
[![stars](https://img.shields.io/github/stars/Yu-tao-Li/dsh-computer-use-win?style=social)](https://github.com/Yu-tao-Li/dsh-computer-use-win)

[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)

**给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 装上 Windows 电脑操控能力**——MCP stdio 服务器 + PowerShell/UIA 桌面引擎，23 个工具让 agent 能**看**（UIA 无障碍树、窗口裁剪截图、OCR 词框）也能**做**（鼠标、键盘、UIA 语义动作、窗口管理）真实的 Windows 桌面应用。

通过 DSH 内置的 `@deepseek-ai/dsh-mcp-client` 桥接，**不改 DSH 本体**，零运行时依赖。

| ① 文件资源管理器：`find` 定位 + 语义 `invoke` 选中文件（状态栏"选中 1 个项目"） | ② `type_text` 写入真实文档（剪贴板路径，`verifyValue` 回读） | ③ UWP 计算器：`find` 定位按钮 + 语义 `Invoke` 点击（25×4=100） |
|---|---|---|
| ![1](assets/screenshot-1.png) | ![2](assets/screenshot-2.png) | ![3](assets/screenshot-3.png) |

## 特性

- **文本优先的观察**——UIA 无障碍树三视图（`control`/`content`/`raw`）；按 name/automationId/类名/值找控件，不靠猜像素。元素 id 用 UIA RuntimeId（UI 刷新后仍稳定，过期报 `stale` 而非点错地方）。
- **三级截图链**——`PrintWindow`（非前台窗口也能抓）→ **WGC**（`Windows.Graphics.Capture`，DirectComposition/被遮挡窗口）→ 屏幕区域兜底（带 `occludedPossible` 标记）。窗口裁剪 + 降采样 + `imageScale/origin` 坐标映射，PNG 30 分钟自动清理。
- **三条输入路径，诚实上报**——语义（UIA pattern，不碰鼠标）/ 前台（`SetCursorPos` + SendInput + 剪贴板 / `KEYEVENTF_UNICODE`）/ 后台（PostMessage 直进窗口消息队列，不抢前台；投递未验证，如实 `verified:false`——Chromium/Electron/WinUI 会静默丢合成消息，工具会明说）。
- **UIA 盲区 OCR 回退**——`Windows.Media.Ocr`（csc 编译的 C# WinRT 助手）；返回文字、逐词屏幕坐标词框和整行矩形。`query` 忽略大小写与空白，支持按字符分词的 CJK 文本；默认不查询 UIA；只有显式 `resolveControl:true` 才在联合矩形中心回查控件。回查结果可能是整页，点击文字使用 `matched[].word.x/y`。
- **内置安全机制**
  - *坐标 homing*——观察后窗口被移动，点击自动补偿并回报 `homed:{dx,dy}`
  - *急停 failsafe*——物理鼠标停屏幕角落 500ms，所有输入被拒（`EMERGENCY STOP`），只有人把鼠标移开才恢复
  - *identity guard*——按 `windowTitle` 操作时窗口 HWND/PID 变了就拒绝（`identity_changed`）
  - *前台校验*——输入 fail-closed：目标窗口不是真前台就直接报错，绝不打进别的窗口
  - *Win 键黑名单*——`Win+R/X/L/S` 类组合按设计拦截
- **持久化后端**——一个常驻 PowerShell 进程 + JSON 行协议，热态延迟 6–100ms（首次 ~500ms 冷启动）；C# P/Invoke 助手按 hash 编译成缓存 DLL，重启免重编。

## 0.3 观察与验证

- `find` 在 UIA 无匹配且树稀疏（最多 20 节点的启发式）或截断时自动接 OCR；`ocrFallback:false` 可禁用。指定 `controlType` 的查询只返回 UIA 控件，因为 OCR 无法可靠证明控件类型。
- OCR 是字面匹配。`query:"搜索"` 可能不匹配写着“大家都在搜”的搜索框，空结果仍保留 `ocr.lines` 供调用方改写查询。OCR 候选带 `source:"ocr"` 和屏幕坐标，不伪造 UIA ID。
- 独立 `screenshot` 与默认 OCR 使用原生 HWND，跳过 UIA。`ocr(includeScreenshot:true)` 同时返回 MCP 图片，支持有视觉能力的调用方判断图标和布局。
- 先通过 OCR 或截图点击，再 `type_text`。新版默认 `focusMode:"preserve"`，保留当前焦点；旧版寻找最大文本控件的行为需显式 `focusMode:"main"`。
- 动作返回 `verification:"sent"` 仅证明已调度。随后使用 `wait_for(condition:"text",query:"实际文字")` 或 `condition:"element"` 确认效果。只在观察满足条件时返回 `verification:"observed"`；截断的 UIA 树不能证明元素消失。
- 参数在 Node 端按公开 schema 校验并应用默认值；`maxDepth` 上限仍为 12。排队请求的超时从实际发送开始。树看门狗为遍历预算加 10 秒，超时后替换后端并尝试原生截图，仍明确返回 UIA 错误。
- RuntimeId 在同一后端内缓存已观察到的元素，最多 6000 项、有效期 5 分钟；未知或失效 ID 要求重新观察，避免跨桌面搜索。剪贴板所有格式在替换前读取，成功和异常路径都还原。

本版本接通 UIA、OCR、截图和结果验证。OmniParser、UI-TARS 等可由调用方或独立视觉服务使用截图；本包不附带这些模型，也不宣称 OCR 能识别任意图标的语义。

## 安装

```powershell
# 从 npm（推荐）
dsh plugin --profile web add dsh-computer-use-win

# 从 GitHub（--profile 指定装进哪个 profile）
dsh plugin --profile web add github:Yu-tao-Li/dsh-computer-use-win
# 或在 DSH 设置的插件市场（dshmarket）搜索 dsh-computer-use-win
```

重启 `dsh web`，工具以 `mcp__wincu__windows_computer_use_*` 出现。

> bundle 在启动时通过所在 profile 的 `package.json` 解析已安装包中的 `server.mjs`，因此适用于任意 profile / `$DSH_HOME`，也兼容 pnpm 布局，无硬编码路径。同一 profile 只保留一个 `serverName: wincu` 行。

DSH Desktop 的 `process.execPath` 指向 Electron 可执行程序。自 0.2.4 起，bundle 为 MCP 子进程显式设置 `ELECTRON_RUN_AS_NODE=1`，让服务以 Node 模式运行；普通 Node 启动同样适用。自定义 Electron 构建需启用 `runAsNode` fuse。此前为 #13 添加过完整用户配置覆盖的用户，升级后应移除该专用覆盖，再检查 `health`，使新版默认配置生效。

## 工具清单（23 个，前缀 `mcp__wincu__`）

| 分组 | 工具 |
|---|---|
| 观察 | `health` · `snapshot`（树+截图）· `accessibility_tree` · `list_windows` · `find` · `element_info` · `ocr` · `screenshot` |
| 动作 | `click` · `double_click` · `move` · `drag` · `scroll` · `type_text`（clipboard/sendinput/background）· `keypress` · `focus` · `invoke` · `set_value` |
| 窗口 | `activate_window` · `move_window` · `close_window`（WM_CLOSE，应用可弹保存框否决）· `wait_for` · `wait` |

UIA 树采用逐节点缓存与惰性遍历，默认时间预算为 5000 ms；超限返回部分结果及原因。`element_info` 默认 `detailLevel: "compact"`，需要 value/patterns 时传 `"full"`。窗口激活失败返回 warning 和原生窗口信息。参数与 Chromium/CEF 降级建议见 [工具文档](docs/wiki/mcp-tools.md)。

支持窗口定位的工具可使用（`windowTitle` 子串 / `processId` / `nativeWindowHandle`）+ `activate: true`；不指定 = 当前前台窗口。`activate` 在影响结果的路径上都会生效（输入类、坐标点击/滚动、`ocr` 截屏、`move_window` 等）；`close_window` 忽略它（WM_CLOSE 后台即可），`activate_window` 恒定激活。各工具的确切语义见 `docs/wiki/mcp-tools.md`。

## 架构

```
DSH agent
   │  模型看到 mcp__wincu__windows_computer_use_* 工具
   ▼
@deepseek-ai/dsh-mcp-client   ← DSH 内置桥接（官方 MCP SDK StdioClientTransport）
   │  JSON-RPC 2.0 over stdio（按行分帧）
   ▼
mcp/server.mjs                ← 本仓库：MCP 服务器（Node ≥22，零依赖）
   │  保活一个持久化后端；JSON 行协议
   ▼
scripts/windows-uia.ps1       ← 本仓库：桌面引擎（PowerShell 5.1 兼容）
   ├─ UI Automation 程序集        → 无障碍树
   ├─ user32 P/Invoke（C# 缓存 DLL）→ 鼠标/键盘/窗口操作
   ├─ Windows.Media.Ocr（C# WinRT）→ OCR
   └─ Windows.Graphics.Capture   → WGC 窗口捕获
```

## 安全与限制

- **动作是真实的**——敏感操作前让 agent 先 `snapshot`；重要窗口用 `windowTitle` 明确限定。
- **WinUI / Chromium / Electron** 会丢弃 PostMessage 合成输入（`verified:false` 是诚实上报，不是成功）。这类目标走前台/剪贴板路径。
- **提权窗口**（UAC/管理员程序）UIA 与合成输入都被 Windows 拦截，读不到也点不了。
- 坐标以**物理像素**为准（显式 Per-Monitor V2 DPI）。
- OCR 对 CJK 按**字符**给词框（引擎特性）；自 0.2.5 起，`query` 可跨字符匹配，`matched[].boundingBox` 和 `lines[].boundingBox` 提供屏幕坐标矩形，原有 `matched[].word.x/y` 提供命中范围的中心坐标。
- 仅支持 Windows。

## 开发

```
mcp/server.mjs          MCP stdio 服务器 + 持久化后端管理
scripts/windows-uia.ps1 桌面引擎（one-shot 与 -Persistent 双模式）
test/                   self-test / MCP 协议 / Notepad E2E / 功能综合 / 延迟基准
docs/wiki/              当前工具文档及上游历史说明（见 THIRD_PARTY.md）
docs/dev-notes.md       设计原理、踩坑记录、性能数据、测试记录
```

```powershell
npm ci                             # 安装仅用于测试的 Electron / MCP SDK / YAML 依赖
node mcp/server.mjs --self-test     # 全栈自检（仅 Windows）
node test/mcp-test.mjs              # initialize → tools/list → tools/call
node test/profile-resolution.mjs    # DSH profile node_modules 路径回归测试
node test/bundle-startup.mjs        # 实际 bundle 的 Node / Electron 启动回归
node test/notepad-e2e.mjs           # 真实输入端到端（会开记事本）
```

`npm test` 运行自检、MCP 协议、profile 路径、Node/Electron bundle 启动、worker 生命周期、激活取消、窗口枚举/坐标缓存/参数校验及输入错误回归测试。每项测试使用独立进程和临时目录，日志与自检截图留在输出所示目录；不发送物理输入，也不修改已安装的 DSH profile。bundle 启动回归使用确定性的 PowerShell 协议 fixture；输入和窗口移动场景使用模拟接口。自检和只读窗口测试验证真实桌面后端。

默认使用 Windows PowerShell 5.1；可设置 `$env:WINDOWS_CU_POWERSHELL = (Get-Command pwsh).Source` 后运行 `npm test` 验证 PowerShell 7。CI（`.github/workflows/ci.yml`）在每次 push/PR 时分别测试这两种运行时。

## 许可

MIT，见 [LICENSE](LICENSE)。本项目是 [cgissing/windows-computer-use](https://github.com/cgissing/windows-computer-use)（MIT）的**衍生作品**，上游版权声明保留于 [THIRD_PARTY.md](THIRD_PARTY.md)。
