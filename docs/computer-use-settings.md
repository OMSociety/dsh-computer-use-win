# Computer Use 设置 / Settings

## 简体中文

升级插件并完整退出、重新启动 DSH Desktop，打开 **设置 → Computer Use**。新版插件页面也有入口；旧宿主保留可配置插件卡片。DSH 0.2 使用插件条目 ID `mcp-dsh-computer-use-win` 的 Config 表单；旧接口使用 `windows-computer-use`。

若曾为 #29 手动添加独立的 `windows-computer-use` 或 `wincu` 覆盖条目，请先备份 profile 配置，再移除该临时重复条目，使用插件 bundle 提供的入口。避免同时启动两个桌面操作服务。

### 工具加载

外层选择 **精简 / 全部 / 自定义**，默认全部 24 项（23 项桌面工具加管理入口）。精简固定加载 10 项；自定义才展开内部缩进清单，支持逐项、分组、全选和全部关闭。切换方案会保留自定义勾选，保存后在当前动作结束时生效，重启保留选择。agent 不能重新启用用户关闭的工具。

### 接管提示

屏幕边缘与提示条、鼠标光环／DSH 标识独立开关。可设置提示文字、顶部／底部、结束后的隐藏延时（200–3000 毫秒），保存后可预览。提示层不抢焦点、鼠标可穿透，不修改系统光标主题。

“远程与录屏可见”默认开启，让 UU、屏幕共享及录屏可以捕获提示。关闭后请求 Windows 在支持的捕获路径中排除提示。组件通过原生活动显示器枚举、显示／会话事件及接管期间 500 毫秒复核刷新，处理虚拟屏幕新增、移除、重连和布局／DPI 变化。

提示只在本插件执行桌面输入或预览时出现，空闲不常驻。普通文件读写或 shell 命令不触发桌面接管提示。

### 停止与恢复

按物理 **Esc** 停止。也可在“自定义停止方式”点击“录制快捷键”，按 F8 或 Ctrl + Alt + K 等按键／组合键并保存；“恢复默认（Esc）”清除额外快捷键。录制时 Esc 用于取消；失焦或 15 秒未录入会退出录制。

停止后保持暂停，准备好再点击“恢复桌面控制”。普通鼠标移动与其他按键不会停止；程序发送的按键不视为物理停止输入。关闭提示仍保留停止监听。

取消会在可分段输入与 UIA 解析后的执行边界检查，并在收尾时释放按住的输入。已送达应用的操作无法撤回，阻塞的应用 Provider 调用需要先返回。当前官方桥未提供对话轮次 ID，因此恢复是显式用户操作；完整重启插件会建立新的控制实例。

## English

Upgrade and fully restart DSH Desktop, then open **Settings → Computer Use**. A plugin-page entry and the legacy configurable card are also available. Modern DSH uses the `mcp-dsh-computer-use-win` Config namespace; the older API uses `windows-computer-use`. Back up and remove any temporary duplicate adapter/MCP override added for #29 before using the bundled entry.

Choose **Lite / All / Custom** in the outer selector. All is the default (24 entries); Lite loads 10. Custom reveals the indented checklist with individual/group selection, select-all and disable-all. Preset changes preserve your custom selection. Save applies after the current action finishes and survives restart. Management cannot re-enable user-disabled tools.

Screen edges/banner and the pointer halo/DSH badge have independent controls. Customize text, top/bottom placement and the 200–3000ms hide delay, save and preview. The layers let clicks pass through, keep focus and leave Windows cursor themes intact. **Visible in remote sessions and recordings** is on by default, including virtual displays. Turning it off requests capture exclusion on supported Windows capture paths. Active monitor enumeration, display/session events and a 500ms topology check refresh the layers after display, layout or DPI changes. Indicators appear only for this plugin's desktop input or preview.

Physical **Esc**, or a recorded key/combination, stops and keeps input paused until **Resume desktop control** is clicked. Record a shortcut and save; Restore default (Esc) clears the additional key. Esc cancels recording, and blur or 15 seconds of inactivity exits it. Ordinary mouse movement, other keys and injected keys do not trigger a physical stop. Hiding the indicator keeps the listener active.

Cancellation is cooperative at segmented-input and post-resolution execution boundaries, with held-input cleanup. Delivered actions cannot be undone, and a blocking application Provider call must return first. The current bridge supplies no conversation-turn ID, so resume is explicit; a complete plugin restart creates a new control instance.
