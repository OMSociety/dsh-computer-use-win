// Browser module: DSH React, settings transport, and real navigation slots.
window.__ModuleLoader__.load({
  id: 'dsh-computer-use-win',
  factory: (require) => {
    const React = require('react'), h = React.createElement;
    const NS = 'windowsComputerUse.settings';
    const allToolNames='health snapshot accessibility_tree list_windows find element_info click double_click move drag scroll type_text keypress focus invoke set_value activate_window wait ocr screenshot wait_for close_window move_window tools'.split(' ');
    const toolGroups=[
      ['observe',[
        ['health','检查连接','Check connection','检查桌面工具是否可用','Check desktop tool availability'],
        ['snapshot','截图与控件概览','Screen and controls','同时查看画面和界面控件','Capture the screen and UI controls'],
        ['accessibility_tree','读取界面控件','Read UI controls','查看窗口里的控件结构','Read the control hierarchy'],
        ['find','查找控件','Find controls','按文字或类型查找控件','Find controls by text or type'],
        ['element_info','查看控件详情','Inspect a control','读取控件属性和可用操作','Read control properties and actions'],
        ['ocr','识别屏幕文字','Read screen text','从画面中识别文字和位置','Recognize visible text and positions'],
        ['screenshot','截取屏幕','Take a screenshot','查看窗口或桌面的画面','Capture a window or desktop']
      ]],
      ['input',[
        ['click','单击','Click','点击控件或屏幕位置','Click a control or screen position'],
        ['double_click','双击','Double-click','双击控件或屏幕位置','Double-click a control or position'],
        ['move','移动鼠标','Move pointer','移动鼠标到指定位置','Move the pointer to a position'],
        ['drag','拖动鼠标','Drag','按指定路径拖动','Drag along a specified path'],
        ['scroll','滚动','Scroll','滚动页面或控件','Scroll a page or control'],
        ['type_text','输入文字','Type text','在当前输入位置填写文字','Enter text at the current focus'],
        ['keypress','按键与组合键','Press keys','发送按键或组合键','Send a key or key combination']
      ]],
      ['windows',[
        ['list_windows','查看窗口列表','List windows','查找已打开的窗口','Find open windows'],
        ['activate_window','切换窗口','Activate a window','将目标窗口切到前台','Bring a window to the foreground'],
        ['move_window','移动窗口','Move a window','调整窗口在屏幕上的位置','Reposition a window'],
        ['close_window','关闭窗口','Close a window','请求应用关闭窗口','Ask an app to close a window'],
        ['focus','聚焦控件','Focus a control','将输入焦点移到控件','Move input focus to a control'],
        ['invoke','执行控件操作','Use a control','调用按钮、选项或展开操作','Invoke, toggle, select or expand a control'],
        ['set_value','设置控件内容','Set a control value','直接填写可编辑控件','Fill an editable control directly']
      ]],
      ['other',[
        ['wait','等待片刻','Wait briefly','等待指定时间后继续','Pause before continuing'],
        ['wait_for','等待目标出现','Wait for a target','等待窗口、控件或文字出现','Wait for a window, control or text'],
        ['tools','工具说明与管理','Tool reference and management','查看说明并管理已获准的工具','Describe and manage user-allowed tools']
      ]]
    ];
    const liteToolNames='list_windows find click scroll type_text keypress ocr screenshot wait_for tools'.split(' ');
    const defaults = {toolPreset:'full',enabledTools:allToolNames,indicatorEnabled:true,cursorIndicatorEnabled:true,remoteIndicatorVisible:true,indicatorText:'DSH 正在控制电脑',indicatorPosition:'top',indicatorIdleMs:800,stopShortcut:''};
    const equal=(left,right)=>JSON.stringify(left)===JSON.stringify(right);
    const dictionaries = {
      zh: {nav:'Computer Use',title:'Windows 桌面操作',intro:'查看接管提示，使用 Esc 停止桌面操作。',mode:'工具模式',lite:'精简模式',full:'全能模式',modeHint:'精简模式保留常用工具，其余按需加载。切换模式会在当前动作结束后重载工具。',indicator:'显示接管提示',indicatorHint:'显示屏幕边缘光晕和提示条；关闭后仍可按 Esc 停止。',text:'提示文字',position:'提示位置',top:'屏幕顶部',bottom:'屏幕底部',delay:'操作结束后隐藏延时（毫秒）',delayHint:'连续动作共用提示，避免每次点击都闪烁。范围 200–3000 毫秒。',corner:'用鼠标停止操作',cornerHint:'鼠标停在屏幕左上角约 500 毫秒可拒绝后续输入；普通鼠标移动不会停止。',stop:'停止与恢复',stopHint:'用户按 Esc 后保持暂停。普通鼠标和其他按键不触发停止，程序发送的 Esc 也不触发停止。恢复前请确认 agent 的任务仍符合你的意图。',resume:'恢复桌面控制',resumed:'已请求恢复桌面控制',preview:'预览接管提示',previewed:'已请求预览；如果之前按 Esc 暂停，请先恢复控制。',save:'保存',discard:'取消修改',saved:'已保存',failed:'保存失败',unavailable:'当前宿主未提供可写设置，请在本机 DSH 中打开此页面。',invalid:'请填写 1–120 字的单行提示文字，并将隐藏延时设为 200–3000 的整数。',persistFailed:'宿主未确认设置已保存，请刷新后重试。'},
      en: {nav:'Computer Use',title:'Windows computer use',intro:'See when the agent controls your desktop. Press Esc to stop.',mode:'Tool mode',lite:'Lite',full:'Full',modeHint:'Lite keeps common tools and loads others on demand. A mode change reloads tools after the current action finishes.',indicator:'Show takeover indicator',indicatorHint:'Show the screen-edge glow and banner. Esc remains available when the indicator is off.',text:'Banner text',position:'Banner position',top:'Top of screen',bottom:'Bottom of screen',delay:'Hide delay after an action (ms)',delayHint:'Keep the indicator between consecutive actions. Range: 200–3000 ms.',corner:'Keep the mouse-corner failsafe',cornerHint:'Parking the pointer in the top-left corner for about 500 ms can refuse further input. Ordinary mouse movement does not stop control.',stop:'Stop and resume',stopHint:'Physical Esc keeps desktop input paused. Other mouse/keyboard input and agent-generated Esc do not stop control. Check the task before resuming.',resume:'Resume desktop control',resumed:'Desktop control resume requested',preview:'Preview takeover indicator',previewed:'Preview requested; resume first if you previously stopped with Esc.',save:'Save',discard:'Discard changes',saved:'Saved',failed:'Save failed',unavailable:'Writable settings are unavailable. Open this page in your local DSH host.',invalid:'Use 1–120 characters on one line and an integer hide delay between 200 and 3000.',persistFailed:'The host did not confirm the saved settings. Refresh and retry.'}
    };
    const extraCopy={
      zh:{intro:'选择 agent 使用的工具，设置接管提示与停止方式。',toolsTitle:'工具模式',toolsHint:'精简模式覆盖日常操作，需要时可继续加载更多工具。',lite:'精简',full:'全能',liteSummary:'常用工具，减少上下文占用',fullSummary:'启动时提供全部桌面工具',liteCount:'10 个初始工具',fullCount:'24 个初始工具',modeAfter:'切换模式会等当前动作结束后生效。',indicatorTitle:'接管提示',indicator:'显示屏幕边缘与提示条',indicatorHint:'让你知道 agent 何时正在操作电脑。',position:'提示位置',top:'顶部',bottom:'底部',preview:'预览接管提示',previewHint:'请先保存更改，再预览屏幕上的实际效果。',previewOff:'提示已关闭',previewOn:'接管时的屏幕示意',previewNote:'提示不抢焦点，鼠标可以穿透。',appearance:'提示的更多选项',text:'提示文字',delay:'操作后保留提示',delayHint:'连续动作保持显示，减少闪烁。200–3000 毫秒。',stop:'停止与恢复',escTitle:'按 Esc 停止操作',stopHint:'停止后保持暂停，准备好再恢复。普通鼠标移动和其他按键不会停止接管。',resume:'恢复桌面控制',extraStop:'其他停止方式',corner:'用鼠标停止操作',cornerHint:'鼠标在屏幕左上角停留约 500 毫秒后拒绝后续输入；关闭后仍可按 Esc 停止。',save:'保存更改',discard:'放弃更改',dirty:'有未保存的更改',clean:'更改后点击保存',ms:'毫秒'},
      en:{intro:'Choose the agent’s tools and how desktop control is shown and stopped.',toolsTitle:'Tool mode',toolsHint:'Lite covers everyday tasks. More tools can be loaded when needed.',lite:'Lite',full:'Full',liteSummary:'Common tools with less context',fullSummary:'All desktop tools at startup',liteCount:'10 initial tools',fullCount:'24 initial tools',modeAfter:'Mode changes take effect after the current action finishes.',indicatorTitle:'Takeover indicator',indicator:'Show screen edges and a banner',indicatorHint:'See when the agent is operating your computer.',position:'Banner position',top:'Top',bottom:'Bottom',preview:'Preview indicator',previewHint:'Save changes before previewing the actual screen indicator.',previewOff:'Indicator is off',previewOn:'Screen preview during control',previewNote:'The indicator keeps focus and lets clicks pass through.',appearance:'More indicator options',text:'Banner text',delay:'Keep visible after an action',delayHint:'Stay visible between consecutive actions. 200–3000 milliseconds.',stop:'Stop and resume',escTitle:'Press Esc to stop',stopHint:'Control stays paused until you resume. Ordinary mouse movement and other keys do not stop it.',resume:'Resume desktop control',extraStop:'Additional stop option',corner:'Top-left mouse-corner failsafe',cornerHint:'Refuse further input after the pointer stays in the top-left corner for about 500 ms. Turn off to use Esc alone.',save:'Save changes',discard:'Discard changes',dirty:'Unsaved changes',clean:'Save after making changes',ms:'ms'}
    };
    for(const lang of ['zh','en'])Object.assign(dictionaries[lang],extraCopy[lang]);
    Object.assign(dictionaries.zh,{intro:'选择 agent 使用的工具，设置接管提示与停止方式。',extraStop:'其他停止方式',corner:'用鼠标停止操作',cornerHint:'将鼠标移到桌面最左上角，停留约半秒，工具就会停止点击和输入。移开鼠标后可继续；Esc 始终可用。',githubLink:'GitHub · dsh-computer-use-win ↗',starRequest:'您的 Star 就是我更新的动力，球球了，这对我很重要！',issueBefore:'如果有问题，欢迎去',issueLink:'提 Issue',issueAfter:'，您来许愿，我来实现！我的响应也会很迅速的！'});
    Object.assign(dictionaries.en,{extraStop:'Other ways to stop',corner:'Stop using the mouse',cornerHint:'Move the pointer to the top-left corner of the desktop and leave it there for about half a second to stop clicks and typing. Move it away to continue. Esc is always available.',githubLink:'GitHub · dsh-computer-use-win ↗',starRequest:'Your Star keeps me motivated to update this project. Please, it means a lot to me!',issueBefore:'Found a problem or have a wish? ',issueLink:'Open an issue',issueAfter:' — you make the wish, I’ll work on it! I’ll be quick to respond.'});
    Object.assign(dictionaries.zh,{starPrefix:'您的 ',starLink:'Star',starAfter:' 就是我更新的动力，球球了，这对我很重要！',issueBefore:'如有问题，欢迎去',issueAfter:'，您来许愿，我来实现！'});
    Object.assign(dictionaries.en,{starPrefix:'Your ',starLink:'Star',starAfter:' keeps me motivated to update this project. Please, it means a lot to me! ',issueBefore:'Found a problem or have a wish? ',issueAfter:' — you make the wish, I’ll work on it!'});
    Object.assign(dictionaries.zh,{extraStop:'自定义停止方式',stopHint:'停止后保持暂停，准备好再恢复。普通鼠标移动不会停止接管。',shortcutHint:'点击“录制快捷键”，再按下想用的按键或组合键，例如 F8 或 Ctrl + Alt + K。保存后生效，Esc 始终保留。',record:'录制快捷键',rerecord:'重新录制',cancelRecord:'取消录制',clearShortcut:'清除',noShortcut:'尚未设置',listening:'请按下快捷键…（Esc 取消）',unsupportedKey:'请使用字母、数字、功能键或常用按键，可搭配 Ctrl、Alt、Shift、Win。',recordCancelled:'已取消录制',recordTimedOut:'录制已超时，请点击按钮重试。'});
    Object.assign(dictionaries.en,{extraStop:'Custom stop shortcut',stopHint:'Control stays paused until you resume. Ordinary mouse movement does not stop it.',shortcutHint:'Click Record shortcut, then press a key or combination, such as F8 or Ctrl + Alt + K. Save to apply. Esc always remains available.',record:'Record shortcut',rerecord:'Record again',cancelRecord:'Cancel recording',clearShortcut:'Clear',noShortcut:'Not set',listening:'Press your shortcut… (Esc to cancel)',unsupportedKey:'Use a letter, number, function key or common key, optionally with Ctrl, Alt, Shift or Win.',recordCancelled:'Recording cancelled',recordTimedOut:'Recording timed out. Click the button to try again.'});
    Object.assign(dictionaries.zh,{clearShortcut:'恢复默认（Esc）',noShortcut:'Esc（默认）',shortcutHint:'点击“录制快捷键”，再按下想用的按键或组合键，例如 F8 或 Ctrl + Alt + K。保存后生效；恢复默认后仅保留 Esc。',starTitle:'在 GitHub 上给项目 Star（在新窗口打开）',issueTitle:'在 GitHub 上提 Issue（在新窗口打开）'});
    Object.assign(dictionaries.en,{clearShortcut:'Restore default (Esc)',noShortcut:'Esc (default)',shortcutHint:'Click Record shortcut, then press a key or combination, such as F8 or Ctrl + Alt + K. Save to apply. Restoring the default keeps only Esc.',starTitle:'Star this project on GitHub (opens in a new window)',issueTitle:'Open a GitHub issue (opens in a new window)'});
    Object.assign(dictionaries.zh,{cursorIndicator:'突出显示鼠标',cursorIndicatorHint:'接管时在鼠标旁显示蓝色光环和 DSH 标识，便于看清操作位置。停止或接管结束后自动消失。'});
    Object.assign(dictionaries.en,{cursorIndicator:'Highlight the pointer',cursorIndicatorHint:'Show a blue halo and DSH badge beside the pointer during control. They disappear when control stops or ends.'});
    Object.assign(dictionaries.zh,{toolsTitle:'工具加载',toolsHint:'默认加载全部工具。需要调整时，展开下方设置，选择 agent 可以使用的工具。',customTools:'自定义工具',toolsSelected:'已启用',toolsUnit:'个工具',allTools:'恢复默认（全部启用）',noTools:'全部关闭',toolAfter:'保存后，会在当前动作结束时更新可用工具。',toolGroup_observe:'屏幕与内容',toolGroup_input:'鼠标与键盘',toolGroup_windows:'窗口与控件',toolGroup_other:'等待与工具管理'});
    Object.assign(dictionaries.en,{toolsTitle:'Tool loading',toolsHint:'All tools are loaded by default. Expand the options below to choose which tools the agent can use.',customTools:'Customize tools',toolsSelected:'Enabled',toolsUnit:'tools',allTools:'Restore defaults (enable all)',noTools:'Disable all',toolAfter:'Saved tool changes take effect after the current action finishes.',toolGroup_observe:'Screen and content',toolGroup_input:'Mouse and keyboard',toolGroup_windows:'Windows and controls',toolGroup_other:'Waiting and tool management'});
    for(const entries of toolGroups.map(group=>group[1]))for(const [name,zh,en,zhHint,enHint]of entries){dictionaries.zh['tool_'+name]=zh;dictionaries.en['tool_'+name]=en;dictionaries.zh['toolHint_'+name]=zhHint;dictionaries.en['toolHint_'+name]=enHint;}
    Object.assign(dictionaries.zh,{toolsHint:'先选择整体加载方案，需要逐项调整时选择“自定义”。',full:'全部',fullSummary:'加载全部桌面工具，默认推荐',lite:'精简',liteSummary:'只加载常用工具，减少上下文占用',custom:'自定义',customSummary:'自己选择需要加载的工具',customTools:'自定义工具清单',allTools:'全选',customMemory:'切换方案会保留自定义清单。更改后点击保存。'});
    Object.assign(dictionaries.en,{toolsHint:'Choose a loading preset. Select Custom to choose individual tools.',full:'All',fullSummary:'Load every desktop tool; the default',lite:'Lite',liteSummary:'Common tools with less context',custom:'Custom',customSummary:'Choose exactly which tools to load',customTools:'Custom tool selection',allTools:'Select all',customMemory:'Switching presets keeps your custom selection. Save to apply.'});
    Object.assign(dictionaries.zh,{remoteVisible:'远程与录屏可见',remoteVisibleHint:'让 UU 远程、屏幕共享和录屏看到接管提示与鼠标标识。默认开启，也适用于虚拟屏幕。'});
    Object.assign(dictionaries.en,{remoteVisible:'Visible in remote sessions and recordings',remoteVisibleHint:'Show the takeover indicator and pointer marker in remote access, screen sharing and recordings. On by default, including virtual displays.'});
    function shortcutFromEvent(event) {
      const code=event.code||'',special={Space:'Space',Enter:'Enter',NumpadEnter:'Enter',Tab:'Tab',Backspace:'Backspace',Delete:'Delete',Insert:'Insert',Home:'Home',End:'End',PageUp:'PageUp',PageDown:'PageDown',ArrowUp:'Up',ArrowDown:'Down',ArrowLeft:'Left',ArrowRight:'Right',Pause:'Pause',CapsLock:'CapsLock',NumLock:'NumLock',ScrollLock:'ScrollLock'};
      let key=/^Key[A-Z]$/.test(code)?code.slice(3):/^Digit[0-9]$/.test(code)?code.slice(5):/^F(?:[1-9]|1[0-9]|2[0-4])$/.test(code)?code:special[code];
      if(!key&&event.keyCode>=65&&event.keyCode<=90)key=String.fromCharCode(event.keyCode);
      if(!key&&event.keyCode>=48&&event.keyCode<=57)key=String.fromCharCode(event.keyCode);
      if(!key&&event.keyCode>=112&&event.keyCode<=135)key='F'+(event.keyCode-111);
      return key?[event.ctrlKey&&'Ctrl',event.altKey&&'Alt',event.shiftKey&&'Shift',event.metaKey&&'Win',key].filter(Boolean).join('+'):null;
    }
    const css=`
      [data-wincu-settings]{--wcu-bg:var(--dsw-alias-bg-layer-2,Canvas);--wcu-control:var(--dsw-alias-bg-layer-1,Canvas);--wcu-raised:var(--dsw-alias-bg-layer-3,Canvas);--wcu-fg:var(--dsw-alias-label-primary,CanvasText);--wcu-muted:var(--dsw-alias-label-secondary,#7b8088);--wcu-border:var(--dsw-alias-border-l2,rgba(128,128,128,.3));--wcu-accent:#2674ce;color:var(--wcu-fg);font:14px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI','Microsoft YaHei',sans-serif;max-width:760px;list-style:none;box-sizing:border-box;margin:0;padding:0 0 8px}
      [data-wincu-settings] *{box-sizing:border-box}
      [data-wincu-settings] h2{font-size:22px;line-height:1.4;font-weight:600;margin:0 0 6px}
      [data-wincu-settings] h3{font-size:15px;line-height:1.5;font-weight:600;margin:0}
      [data-wincu-settings] p{margin:5px 0 0;color:var(--wcu-muted);font-size:13px;line-height:1.55}
      [data-wincu-settings] .wcu-header{padding:0 0 22px}
      [data-wincu-settings] .wcu-community{padding:10px 13px;margin:0 0 18px;border:1px solid var(--wcu-border);border-radius:9px;background:var(--wcu-control)}
      [data-wincu-settings] .wcu-community a{display:inline-flex;align-items:center;gap:5px;vertical-align:baseline;white-space:nowrap;margin:2px 3px;padding:3px 8px;border:1px solid color-mix(in srgb,var(--wcu-accent) 75%,var(--wcu-border));border-radius:6px;background:color-mix(in srgb,var(--wcu-accent) 15%,var(--wcu-control));color:var(--wcu-fg);font-size:12px;line-height:1.5;font-weight:600;text-decoration:none;cursor:pointer;transition:background .15s,border-color .15s}
      [data-wincu-settings] .wcu-community a:hover{background:color-mix(in srgb,var(--wcu-accent) 28%,var(--wcu-control));border-color:#6ba9ef;text-decoration:underline;text-underline-offset:3px}
      [data-wincu-settings] .wcu-community a:focus-visible{outline:2px solid #6ba9ef;outline-offset:3px}
      [data-wincu-settings] .wcu-community svg{width:14px;height:14px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      [data-wincu-settings] .wcu-community p{font-size:12px;margin:0;line-height:1.9}
      [data-wincu-settings] .wcu-section{border:1px solid var(--wcu-border);border-radius:12px;padding:20px;margin-bottom:16px;background:var(--wcu-bg)}
      [data-wincu-settings] .wcu-row{display:flex;justify-content:space-between;align-items:center;gap:16px}
      [data-wincu-settings] .wcu-modes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:14px 0 8px;border:0;padding:0;min-width:0}
      [data-wincu-settings] .wcu-tool-detail[hidden]{display:none}
      @media(max-width:560px){[data-wincu-settings] .wcu-modes{grid-template-columns:1fr}}
      [data-wincu-settings] .wcu-mode{display:flex;gap:9px;align-items:flex-start;border:1px solid var(--wcu-border);border-radius:9px;padding:13px;background:var(--wcu-control);cursor:pointer;min-width:0}
      [data-wincu-settings] .wcu-mode:has(input:checked){border-color:var(--wcu-accent);background:color-mix(in srgb,var(--wcu-accent) 11%,var(--wcu-control))}
      [data-wincu-settings] .wcu-mode strong{display:block;font-size:14px;font-weight:600}
      [data-wincu-settings] .wcu-mode small{display:block;font-size:12px;color:var(--wcu-muted);line-height:1.5;margin-top:4px}
      [data-wincu-settings] .wcu-mode .wcu-count{color:var(--wcu-fg);margin-top:9px}
      [data-wincu-settings] input[type=radio],[data-wincu-settings] input[type=checkbox]{accent-color:var(--wcu-accent);width:16px;height:16px;flex:none;margin:3px 0 0}
      [data-wincu-settings] .wcu-toggle{position:relative;display:inline-flex;align-items:center;gap:10px;cursor:pointer}
      [data-wincu-settings] .wcu-toggle input{appearance:none;width:36px;height:21px;border:1px solid var(--wcu-border);border-radius:12px;background:var(--wcu-raised);margin:0;position:relative;cursor:pointer;transition:background .15s}
      [data-wincu-settings] .wcu-toggle input:after{content:'';position:absolute;width:15px;height:15px;left:2px;top:2px;border-radius:50%;background:var(--wcu-fg);transition:transform .15s}
      [data-wincu-settings] .wcu-toggle input:checked{background:var(--wcu-accent);border-color:var(--wcu-accent)}
      [data-wincu-settings] .wcu-toggle input:checked:after{transform:translateX(15px);background:white}
      [data-wincu-settings] .wcu-indicator-label{margin-top:14px}
      [data-wincu-settings] .wcu-cursor-preview{position:absolute;left:60%;top:55%;width:23px;height:23px;border:2px solid #70aefa;border-radius:50%;box-shadow:0 0 0 4px #70aefa22;pointer-events:none}
      [data-wincu-settings] .wcu-cursor-preview:before{content:'↖';position:absolute;left:6px;top:-1px;font-size:19px;line-height:1;color:var(--wcu-fg)}
      [data-wincu-settings] .wcu-cursor-preview:after{content:'DSH';position:absolute;left:20px;top:17px;padding:1px 5px;border:1px solid #70aefa;border-radius:5px;background:#15395f;color:#edf7ff;font-size:9px;line-height:1.4}
      [data-wincu-settings] .wcu-preview{display:grid;grid-template-columns:minmax(160px,1.1fr) minmax(100px,1fr);gap:20px;align-items:center;margin-top:18px}
      [data-wincu-settings] .wcu-screen{height:108px;border:2px solid var(--wcu-border);border-radius:8px;position:relative;background:var(--wcu-control);display:flex;align-items:center;justify-content:center;overflow:hidden;color:var(--wcu-muted);font-size:11px}
      [data-wincu-settings] .wcu-screen[data-enabled=true]{border-color:#70aefa;box-shadow:inset 0 0 12px #75b5ff33}
      [data-wincu-settings] .wcu-banner{position:absolute;left:12px;right:12px;padding:3px 8px;text-align:center;border-radius:4px;background:#176dcc;color:white;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      [data-wincu-settings] .wcu-choice{display:flex;gap:12px;margin:7px 0 8px;flex-wrap:wrap}
      [data-wincu-settings] .wcu-choice label{display:flex;gap:6px;align-items:center;cursor:pointer}
      [data-wincu-settings] .wcu-choice input{margin:0}
      [data-wincu-settings] .wcu-label{font-size:13px;font-weight:500;display:block;margin:0 0 7px}
      [data-wincu-settings] .wcu-control{font:inherit;color:var(--wcu-fg);background:var(--wcu-control);border:1px solid var(--wcu-border);border-radius:7px;padding:8px 10px;min-height:36px;max-width:100%;width:100%}
      [data-wincu-settings] .wcu-control:focus-visible,[data-wincu-settings] button:focus-visible,[data-wincu-settings] input:focus-visible,[data-wincu-settings] summary:focus-visible{outline:2px solid #6ba9ef;outline-offset:2px}
      [data-wincu-settings] .wcu-detail{border-top:1px solid var(--wcu-border);margin-top:18px;padding-top:14px}
      [data-wincu-settings] summary{cursor:pointer;color:var(--wcu-muted);font-size:13px;width:fit-content}
      [data-wincu-settings] .wcu-field{margin-top:16px}
      [data-wincu-settings] .wcu-tool-detail{margin-top:14px}
      [data-wincu-settings] .wcu-tool-body{margin:14px 0 0 5px;padding-left:16px;border-left:2px solid var(--wcu-border)}
      [data-wincu-settings] .wcu-tool-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:15px}
      [data-wincu-settings] .wcu-tool-group{border:0;border-top:1px solid var(--wcu-border);padding:14px 0 8px;margin:10px 0 0;min-width:0}
      [data-wincu-settings] .wcu-tool-group legend{padding:0 8px 0 0}
      [data-wincu-settings] .wcu-tool-group-label{display:flex;gap:8px;align-items:center;font-size:13px;font-weight:600;cursor:pointer}
      [data-wincu-settings] .wcu-tool-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px 14px}
      [data-wincu-settings] .wcu-tool-item{display:flex;align-items:flex-start;gap:8px;padding:8px;border:1px solid var(--wcu-border);border-radius:7px;background:var(--wcu-control);cursor:pointer;min-width:0}
      [data-wincu-settings] .wcu-tool-item strong{display:block;font-size:13px;font-weight:500}
      [data-wincu-settings] .wcu-tool-item small{display:block;font-size:11px;color:var(--wcu-muted);margin-top:3px;line-height:1.5}
      [data-wincu-settings] .wcu-tool-count{font-size:12px;color:var(--wcu-muted);white-space:nowrap}
      @media(max-width:500px){[data-wincu-settings] .wcu-tool-grid{grid-template-columns:1fr}}
      [data-wincu-settings] .wcu-number{display:flex;gap:8px;align-items:center;color:var(--wcu-muted);font-size:13px}
      [data-wincu-settings] .wcu-number input{width:104px}
      [data-wincu-settings] .wcu-stop{align-items:flex-start;margin-top:13px}
      [data-wincu-settings] .wcu-key{font-size:12px;font-weight:600;font-family:inherit;line-height:1.4;border:1px solid var(--wcu-border);border-bottom-width:3px;border-radius:5px;background:var(--wcu-control);padding:3px 7px;margin-right:7px;white-space:nowrap}
      [data-wincu-settings] .wcu-stop-title{font-weight:500;display:flex;align-items:center}
      [data-wincu-settings] .wcu-shortcut-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:14px}
      [data-wincu-settings] .wcu-shortcut-value{min-width:110px;min-height:36px;display:inline-flex;align-items:center;padding:6px 10px;border:1px solid var(--wcu-border);border-radius:7px;background:var(--wcu-control);color:var(--wcu-fg)}
      [data-wincu-settings] .wcu-shortcut-value[data-recording=true]{border-color:#6ba9ef;outline:2px solid #6ba9ef33}
      [data-wincu-settings] button{font:inherit;border:1px solid var(--wcu-border);border-radius:7px;background:var(--wcu-raised);color:var(--wcu-fg);padding:7px 12px;min-height:34px;cursor:pointer;white-space:nowrap}
      [data-wincu-settings] button:hover:enabled{filter:brightness(1.08)}
      [data-wincu-settings] button.wcu-primary{background:#176dcc;border-color:#176dcc;color:white}
      [data-wincu-settings] button:disabled,[data-wincu-settings] input:disabled,[data-wincu-settings] fieldset:disabled{opacity:.5;cursor:not-allowed}
      [data-wincu-settings] .wcu-footer{position:sticky;bottom:-24px;background:var(--wcu-bg);padding:14px 0 12px;border-top:1px solid var(--wcu-border);display:flex;gap:12px;justify-content:space-between;align-items:center;z-index:1;box-shadow:0 -10px 14px var(--wcu-bg)}
      [data-wincu-settings] .wcu-actions{display:flex;gap:8px}
      [data-wincu-settings] .wcu-status{font-size:12px;color:var(--wcu-muted)}
      [data-wincu-settings] [data-tone=error]{color:var(--dsw-alias-label-error,#d56868)}
      [data-wincu-settings] [data-tone=success]{color:var(--dsw-alias-label-success,#4fa77b)}
      @media(max-width:700px){[data-wincu-settings] .wcu-section{padding:16px}[data-wincu-settings] .wcu-preview{grid-template-columns:1fr}[data-wincu-settings] .wcu-stop{flex-direction:column}[data-wincu-settings] .wcu-footer{flex-wrap:wrap}}
    `;
    function Card({scope,t,savePatch,as='li',idPrefix='wincu'}) {
      const state = React.useSyncExternalStore(listener => scope.subscribe(listener), () => scope.getSnapshot());
      const saved = {...defaults,...state.value};
      if(!state.value?.toolPreset||saved.toolPreset==='auto')saved.toolPreset=saved.enabledTools.length===allToolNames.length?'full':'custom';
      const [draft,setDraft] = React.useState(saved), [dirty,setDirty] = React.useState(false);
      const [saving,setSaving] = React.useState(false), [message,setMessage] = React.useState(''),[tone,setTone]=React.useState('');
      const [recording,setRecording] = React.useState(false), [recordMessage,setRecordMessage] = React.useState('');
      const savedKey = JSON.stringify(Object.fromEntries(Object.keys(defaults).map(key=>[key,saved[key]])));
      React.useEffect(()=>{if(!dirty)setDraft(saved);},[savedKey,dirty]);
      const change = (field,value) => {const next={...draft,[field]:value};setDraft(next);setDirty(Object.keys(defaults).some(key=>!equal(next[key],saved[key])));setMessage('');};
      const selectTools=(names,enabled)=>{const selected=new Set(draft.enabledTools);for(const name of names)enabled?selected.add(name):selected.delete(name);change('enabledTools',allToolNames.filter(name=>selected.has(name)));};
      React.useEffect(()=>{
        if(!recording)return;
        if(!state.writable||saving){setRecording(false);return;}
        const cancel=()=>{setRecording(false);setRecordMessage('recordCancelled');};
        const keydown=event=>{
          if(event.isComposing)return;
          event.preventDefault();event.stopImmediatePropagation();
          if(event.key==='Escape'||event.code==='Escape'){cancel();return;}
          if(event.repeat||['Control','Alt','Shift','Meta','OS'].includes(event.key))return;
          const shortcut=shortcutFromEvent(event);
          if(!shortcut){setRecordMessage('unsupportedKey');return;}
          change('stopShortcut',shortcut);setRecordMessage('');setRecording(false);
        };
        const timer=setTimeout(()=>{setRecording(false);setRecordMessage('recordTimedOut');},15000);
        window.addEventListener('keydown',keydown,true);window.addEventListener('blur',cancel);
        return ()=>{clearTimeout(timer);window.removeEventListener('keydown',keydown,true);window.removeEventListener('blur',cancel);};
      },[recording,state.writable,saving,savedKey]);
      const run = async (patch,success) => {
        setSaving(true);setMessage('');
        try {await savePatch(patch);setMessage(t(success));setTone('success');return true;}
        catch(error){setMessage(t('failed')+': '+String(error.message||error));setTone('error');return false;}
        finally{setSaving(false);}
      };
      const save = async () => {
        if(!draft.indicatorText.trim()||draft.indicatorText.length>120||/[\r\n\x00-\x1f]/.test(draft.indicatorText)||!Number.isInteger(draft.indicatorIdleMs)||draft.indicatorIdleMs<200||draft.indicatorIdleMs>3000){setMessage(t('invalid'));setTone('error');return;}
        const patch=Object.fromEntries(Object.keys(defaults).filter(key=>!equal(draft[key],saved[key])).map(key=>[key,draft[key]]));
        if(await run(patch,'saved'))setDirty(false);
      };
      const disabled = saving||!state.writable||recording,indicatorDisabled=disabled||!draft.indicatorEnabled;
      const activeTools=draft.toolPreset==='full'?allToolNames:draft.toolPreset==='lite'?liteToolNames:draft.enabledTools;
      const customDisabled=disabled||draft.toolPreset!=='custom';
      const radio=(field,value,label)=>h('label',{key:value},h('input',{type:'radio',name:idPrefix+'-'+field,id:idPrefix+'-'+field+'-'+value,value,checked:draft[field]===value,disabled:indicatorDisabled,onChange:()=>change(field,value)}),label);
      const button=(label,props)=>h('button',{type:'button',...props},t(label));
      const linkIcon=kind=>h('svg',{viewBox:'0 0 24 24','aria-hidden':true,focusable:false},h('path',{d:kind==='star'?'m12 3 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3L2.9 9.6l6.3-.9L12 3Z':kind==='issue'?'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 4 11.5a8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9H13a8.5 8.5 0 0 1 8 8v.5Z':'M14 3h7v7M21 3 10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5'}));
      const communityLink=(href,label,kind,title)=>h('a',{href,target:'_blank',rel:'noopener noreferrer',title:t(title),'aria-label':t(title)},linkIcon(kind),h('span',null,t(label)),linkIcon('external'));
      return h(as,{'data-wincu-settings':'true'},h('style',null,css),
        h('header',{className:'wcu-header'},
          h('aside',{className:'wcu-community','data-wincu-community':'true'},h('p',null,t('starPrefix'),
            communityLink('https://github.com/Yu-tao-Li/dsh-computer-use-win','starLink','star','starTitle'),t('starAfter'),t('issueBefore'),
            communityLink('https://github.com/Yu-tao-Li/dsh-computer-use-win/issues/new','issueLink','issue','issueTitle'),t('issueAfter'))),
          h('h2',null,t('title')),h('p',null,t('intro'))),
        h('section',{className:'wcu-section','aria-labelledby':idPrefix+'-tools-title'},
          h('div',{className:'wcu-row'},h('h3',{id:idPrefix+'-tools-title'},t('toolsTitle')),h('span',{className:'wcu-tool-count','data-wincu-tool-count':true},t('toolsSelected')+' '+activeTools.length+' / '+allToolNames.length)),h('p',null,t('toolsHint')),
          h('div',{className:'wcu-modes',role:'radiogroup','aria-label':t('toolsTitle')},...['lite','full','custom'].map(preset=>h('label',{className:'wcu-mode',key:preset},h('input',{type:'radio',name:idPrefix+'-toolPreset',id:idPrefix+'-toolPreset-'+preset,value:preset,checked:draft.toolPreset===preset,disabled,onChange:()=>change('toolPreset',preset)}),h('span',null,h('strong',null,t(preset)),h('small',null,t(preset+'Summary')),h('small',{className:'wcu-count'},(preset==='lite'?liteToolNames.length:preset==='full'?allToolNames.length:draft.enabledTools.length)+' / '+allToolNames.length))))),
          h('details',{className:'wcu-tool-detail','data-wincu-tools':true,hidden:draft.toolPreset!=='custom',open:draft.toolPreset==='custom'},h('summary',null,t('customTools')),
            h('div',{className:'wcu-tool-body'},h('div',{className:'wcu-tool-toolbar'},button('allTools',{disabled:customDisabled||draft.enabledTools.length===allToolNames.length,onClick:()=>change('enabledTools',[...allToolNames])}),button('noTools',{disabled:customDisabled||!draft.enabledTools.length,onClick:()=>change('enabledTools',[])})),
              ...toolGroups.map(([group,entries])=>{const names=entries.map(entry=>entry[0]),count=names.filter(name=>draft.enabledTools.includes(name)).length;return h('fieldset',{className:'wcu-tool-group',disabled:customDisabled,key:group},
                h('legend',null,h('label',{className:'wcu-tool-group-label'},h('input',{type:'checkbox',id:idPrefix+'-tool-group-'+group,checked:count===names.length,'aria-checked':count&&count<names.length?'mixed':count===names.length,ref:input=>{if(input)input.indeterminate=count>0&&count<names.length;},onChange:e=>selectTools(names,e.target.checked)}),t('toolGroup_'+group),h('span',{className:'wcu-tool-count'},count+' / '+names.length))),
                h('div',{className:'wcu-tool-grid'},...entries.map(([name])=>h('label',{className:'wcu-tool-item',key:name,title:'windows_computer_use_'+name},h('input',{type:'checkbox',id:idPrefix+'-tool-'+name,'data-wincu-tool':name,checked:draft.enabledTools.includes(name),disabled:customDisabled,onChange:e=>selectTools([name],e.target.checked)}),h('span',null,h('strong',null,t('tool_'+name)),h('small',null,t('toolHint_'+name)))))));}))),
          h('p',null,t('customMemory')),h('p',null,t('toolAfter'))),
        h('section',{className:'wcu-section','aria-labelledby':idPrefix+'-indicator-title'},
          h('div',{className:'wcu-row'},h('h3',{id:idPrefix+'-indicator-title'},t('indicatorTitle')),button('preview',{disabled:disabled||dirty||(!draft.indicatorEnabled&&!draft.cursorIndicatorEnabled),onClick:()=>run({previewToken:Date.now()},'previewed'),title:dirty?t('previewHint'):undefined})),
          h('label',{className:'wcu-toggle wcu-indicator-label'},h('input',{id:idPrefix+'-indicatorEnabled',type:'checkbox',role:'switch',checked:draft.indicatorEnabled,disabled,onChange:e=>change('indicatorEnabled',e.target.checked)}),h('span',null,t('indicator'))),h('p',null,t('indicatorHint')),
          h('label',{className:'wcu-toggle wcu-indicator-label'},h('input',{id:idPrefix+'-cursorIndicatorEnabled',type:'checkbox',role:'switch',checked:draft.cursorIndicatorEnabled,disabled,onChange:e=>change('cursorIndicatorEnabled',e.target.checked)}),h('span',null,t('cursorIndicator'))),h('p',null,t('cursorIndicatorHint')),
          h('label',{className:'wcu-toggle wcu-indicator-label'},h('input',{id:idPrefix+'-remoteIndicatorVisible',type:'checkbox',role:'switch',checked:draft.remoteIndicatorVisible,disabled,onChange:e=>change('remoteIndicatorVisible',e.target.checked)}),h('span',null,t('remoteVisible'))),h('p',null,t('remoteVisibleHint')),
          h('div',{className:'wcu-preview'},h('div',{className:'wcu-screen','data-enabled':draft.indicatorEnabled,'aria-hidden':true},
            draft.indicatorEnabled&&h('div',{className:'wcu-banner',style:{[draft.indicatorPosition==='top'?'top':'bottom']:'8px'}},draft.indicatorText),draft.cursorIndicatorEnabled&&h('span',{className:'wcu-cursor-preview'}),h('span',null,t(draft.indicatorEnabled||draft.cursorIndicatorEnabled?'previewOn':'previewOff'))),
            h('div',null,h('span',{className:'wcu-label'},t('position')),h('div',{className:'wcu-choice',role:'radiogroup','aria-label':t('position')},radio('indicatorPosition','top',t('top')),radio('indicatorPosition','bottom',t('bottom'))),h('p',null,t('previewNote')))),
          h('details',{className:'wcu-detail'},h('summary',null,t('appearance')),
            h('div',{className:'wcu-field'},h('label',{className:'wcu-label',htmlFor:idPrefix+'-text'},t('text')),h('input',{className:'wcu-control',id:idPrefix+'-text',type:'text',maxLength:120,value:draft.indicatorText,disabled:indicatorDisabled,onChange:e=>change('indicatorText',e.target.value)})),
            h('div',{className:'wcu-field'},h('label',{className:'wcu-label',htmlFor:idPrefix+'-delay'},t('delay')),h('div',{className:'wcu-number'},h('input',{className:'wcu-control',id:idPrefix+'-delay',type:'number',min:200,max:3000,step:100,value:draft.indicatorIdleMs,disabled:indicatorDisabled,onChange:e=>change('indicatorIdleMs',Number(e.target.value))}),h('span',null,t('ms'))),h('p',null,t('delayHint'))))),
        h('section',{className:'wcu-section','aria-labelledby':idPrefix+'-stop-title'},h('h3',{id:idPrefix+'-stop-title'},t('stop')),
          h('div',{className:'wcu-row wcu-stop'},h('div',null,h('div',{className:'wcu-stop-title'},h('kbd',{className:'wcu-key'},'Esc'),t('escTitle')),h('p',null,t('stopHint'))),button('resume',{disabled,onClick:()=>run({resumeToken:Date.now()},'resumed')})),
          h('div',{className:'wcu-detail','data-wincu-shortcut':'true'},h('span',{className:'wcu-label'},t('extraStop')),h('p',null,t('shortcutHint')),
            h('div',{className:'wcu-shortcut-row'},h('output',{className:'wcu-shortcut-value','data-recording':recording,'aria-live':'polite','aria-label':t('extraStop')},recording?t('listening'):(draft.stopShortcut?draft.stopShortcut.split('+').join(' + '):t('noShortcut'))),
              button(recording?'cancelRecord':draft.stopShortcut?'rerecord':'record',{disabled:saving||!state.writable,onClick:()=>{setRecordMessage('');setRecording(!recording);}}),
              button('clearShortcut',{disabled:disabled||!draft.stopShortcut,onClick:()=>{change('stopShortcut','');setRecordMessage('');}})),
            recordMessage&&h('p',{role:'status'},t(recordMessage)))),
        !state.writable&&h('p',{role:'status','data-tone':'error'},t('unavailable')),
        h('footer',{className:'wcu-footer'},h('span',{className:'wcu-status',role:'status','aria-live':'polite','data-tone':message?tone:undefined},message||t(dirty?'dirty':'clean')),
          h('div',{className:'wcu-actions'},button('discard',{disabled:!dirty||saving||recording,onClick:()=>{setDraft(saved);setDirty(false);setMessage('');setRecordMessage('');}}),button('save',{className:'wcu-primary',disabled:!dirty||disabled,onClick:save}))));
    }
    function apply(ctx) {
      ctx.effect(()=>ctx.locale.register(NS,dictionaries));
      const t=ctx.locale.bind?ctx.locale.bind(NS):key=>key;
      let mounted=false;
      const mount=(scope,owner,namespace)=>{
      if(mounted)return;mounted=true;
      const connection=typeof scope.mutate==='function'?undefined:owner.connection;
      const savePatch=async patch=>{
        if(typeof scope.mutate==='function'){
          const accepted=await scope.mutate(Object.entries(patch).map(([field,value])=>({op:'set',path:[field],value})),scope.getSnapshot().revision);
          if(!accepted)throw Error(t('persistFailed'));
        }else if(connection?.api?.settings?.mutate){
          const snapshot=scope.getSnapshot();
          const response=await connection.api.settings.mutate({ns:namespace,ops:Object.entries(patch).map(([field,value])=>({op:'set',path:[field],value})),...(snapshot.revision===undefined?{}:{expectedRevision:snapshot.revision})});
          if(!response.result?.ok)throw Error(response.result?.message||response.result?.error||t('persistFailed'));
          await scope.load();
        }else{
          for(const [field,value]of Object.entries(patch))await scope.set(field,value);
        }
        const value=scope.getSnapshot().value??{};
        if(Object.entries(patch).some(([key,next])=>!equal(value[key],next)))throw Error(t('persistFailed'));
      };
      ctx.slots.inject('settings.section',()=>ctx.slots.register({name:'settings.section',id:'computer-use',order:16,label:()=>t('nav'),locale:NS,inject:()=>({scope,savePatch,as:'section',idPrefix:'wincu-page'})},Card));
      ctx.slots.inject('plugins.item',()=>ctx.slots.register({name:'plugins.item',id:'windows-computer-use',order:30,label:()=>t('nav'),locale:NS,inject:()=>({scope,savePatch,as:'section',idPrefix:'wincu-plugin'})},Card));
      ctx.slots.inject('settings.plugin.item',()=>ctx.slots.register({name:'settings.plugin.item',id:'windows-computer-use',order:30,locale:NS,inject:()=>({scope,savePatch})},Card));
      };
      ctx.inject(['configForms'],owner=>mount(owner.configForms.get('mcp-dsh-computer-use-win'),owner,'mcp-dsh-computer-use-win'));
      ctx.inject(['settingsScope','connection','remote'],owner=>mount(owner.settingsScope.bind({namespace:'windows-computer-use'}),owner,'windows-computer-use'));
    }
    return {apply,inject:['slots','locale']};
  }
});
