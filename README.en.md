[中文](README.md)

# dsh-computer-use-win

[![version](https://img.shields.io/github/v/release/Yu-tao-Li/dsh-computer-use-win?label=version&color=blue)](https://github.com/Yu-tao-Li/dsh-computer-use-win/releases)
[![CI](https://github.com/Yu-tao-Li/dsh-computer-use-win/actions/workflows/ci.yml/badge.svg)](https://github.com/Yu-tao-Li/dsh-computer-use-win/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)
![platform](https://img.shields.io/badge/platform-Windows-0078D6)
[![stars](https://img.shields.io/github/stars/Yu-tao-Li/dsh-computer-use-win?style=social)](https://github.com/Yu-tao-Li/dsh-computer-use-win)

[![Awesome DSH Plugin](https://awesome-dsh-plugin.com/badge.svg)](https://awesome-dsh-plugin.com)

**Windows computer use for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)** — an MCP stdio server backed by a PowerShell + UI Automation engine. It lets the agent **see** the desktop (accessibility tree, window-cropped screenshots, OCR with word boxes) and **act** on it (mouse, keyboard, semantic UIA actions, window management) across 23 tools.

Bridges into DSH through the in-box `@deepseek-ai/dsh-mcp-client` — no DSH modifications. Zero runtime dependencies.

| ① File Explorer: `find` locates the file, semantic `invoke` selects it (status bar: "1 item selected") | ② `type_text` writing a real document (clipboard path, `verifyValue` read-back) | ③ UWP Calculator: `find` locates buttons, semantic `Invoke` clicks (25×4=100) |
|---|---|---|
| ![1](assets/screenshot-1.png) | ![2](assets/screenshot-2.png) | ![3](assets/screenshot-3.png) |

## Features

- **Text-first observation** — UIA accessibility tree in three views (`control` / `content` / `raw`); find controls by name, automation id, class or value instead of guessing pixels. Element ids use UIA RuntimeIds (stable across UI refresh; stale ids report `stale` instead of mis-clicking).
- **Three-level screenshot chain** — `PrintWindow` (works on non-foreground windows) → **WGC** (`Windows.Graphics.Capture`, for DirectComposition/occluded windows) → screen-region fallback with an `occludedPossible` flag. Window crop + downscale + `imageScale`/`origin` coordinate mapping; PNGs auto-GC after 30 min.
- **Three input paths, honestly reported** — semantic (UIA `Invoke`/`Toggle`/`Value` patterns, no mouse), foreground (`SetCursorPos` + SendInput + clipboard paste / `KEYEVENTF_UNICODE`), background (PostMessage into the window queue, no foreground steal; delivery is unverified and reported as `verified:false` — Chromium/Electron/WinUI silently drop synthetic messages, and the tool tells you).
- **OCR fallback for UIA-blind apps** — `Windows.Media.Ocr` via a csc-compiled C# WinRT helper; returns text, per-word screen-coordinate boxes, and line bounding boxes. `query` ignores case and whitespace, supports CJK segmented into individual characters, and optionally hit-tests the union-box center with resolveControl:true. The default returns OCR geometry without UIA.
- **Safety built in**
  - *Coordinate homing* — window moves after observation are compensated; the click reports `homed:{dx,dy}`.
  - *Failsafe panic brake* — park the physical mouse in the screen corner for 500 ms and all input is refused (`EMERGENCY STOP`); only a human moving the mouse releases it.
  - *Identity guard* — acting on a `windowTitle` whose HWND/PID changed since last observation is refused (`identity_changed`).
  - *Foreground verification* — typed input is fail-closed: if the target window is not truly foreground, the action errors instead of hitting the wrong app.
  - *Win-key blacklist* — `Win+R/X/L/S` style chords are refused by design.
- **Persistent backend** — one long-lived PowerShell process with a JSON-line protocol; hot latency 6–100 ms (first call ~500 ms cold). C# P/Invoke helpers compile once to hash-named cached DLLs.

## 0.3 observation and verification

`find` automatically attaches OCR after an empty sparse (at most 20 nodes, a heuristic) or incomplete UIA query. Disable with `ocrFallback:false`. A `controlType` filter stays UIA-only. OCR candidates carry `source:"ocr"` and screen coordinates, not UIA ids; inspect `ocr.lines` when a literal query misses a placeholder.

The standalone `screenshot` tool and default OCR use native HWND metadata without UIA. `ocr(includeScreenshot:true)` returns MCP image content for a vision-capable caller. `resolveControl:true` opts into potentially blocking UIA hit-testing; that control may represent a whole page.

After an OCR/visual click, `type_text` preserves focus by default. `focusMode:"main"` explicitly requests the old largest-text-control behavior. Actions report `verification:"sent"`; verify effects with `wait_for(condition:"text",query:...)` or `condition:"element"`. Only a satisfied observable condition reports `verification:"observed"`; incomplete trees cannot prove absence.

Advertised schemas validate arguments and supply defaults before launching the worker. Queue deadlines start at dispatch. A tree watchdog allows its traversal budget plus 10 seconds; a UIA timeout remains an error even if a replacement worker supplies a native screenshot. RuntimeIds are cached for five minutes (6000 entries maximum), with native owner checks. Unknown/stale ids require re-observation. Clipboard formats are eagerly preserved and restored during exception cleanup.

No OmniParser or UI-TARS model is bundled. A separate vision service or capable calling model can consume screenshots; literal OCR does not provide general icon semantics.

## Install

```sh
# from npm (recommended)
dsh plugin --profile web add dsh-computer-use-win

# from GitHub (choose your profile)
dsh plugin --profile web add github:Yu-tao-Li/dsh-computer-use-win
# or from the dshmarket plugin market: search "dsh-computer-use-win"
```

Restart `dsh web`. The tools appear as `mcp__wincu__windows_computer_use_*`.

> At boot the bundle resolves `server.mjs` from the installed package through the host profile's `package.json`, so it works in any profile / `$DSH_HOME` and with pnpm layouts — no hardcoded paths. Keep only one `serverName: wincu` row per profile.

In DSH Desktop, `process.execPath` points to the Electron executable. Since 0.2.4, the bundle explicitly sets `ELECTRON_RUN_AS_NODE=1` for the MCP child, so Electron runs the server in Node mode; ordinary Node also works with this flag. Custom Electron builds must enable the `runAsNode` fuse. If you added a full user-config override for #13, remove that dedicated override after upgrading and check `health` so the updated bundle defaults take effect.

## Tools (23, prefix `mcp__wincu__`)

| Group | Tools |
|---|---|
| Observe | `health` · `snapshot` (tree + screenshot) · `accessibility_tree` · `list_windows` · `find` · `element_info` · `ocr` · `screenshot` |
| Act | `click` · `double_click` · `move` · `drag` · `scroll` · `type_text` (clipboard / sendinput / background) · `keypress` · `focus` · `invoke` · `set_value` |
| Window | `activate_window` · `move_window` · `close_window` (WM_CLOSE; the app may veto with a save dialog) · `wait_for` · `wait` |

UIA trees use cached metadata and lazy traversal with a default 5000 ms budget; exceeded limits return partial results and a reason. `element_info` defaults to `detailLevel: "compact"`; request `"full"` for value/patterns. Activation refusals include a warning and native window metadata. See the [tool documentation](docs/wiki/mcp-tools.md) for parameters and Chromium/CEF fallback guidance.

Every tool accepts optional window targeting (`windowTitle` substring / `processId` / `nativeWindowHandle`) plus `activate: true`; untargeted calls act on the foreground window. `activate` is honoured wherever it changes the outcome (input tools, coordinate clicks/scroll, `ocr` capture, `move_window`); `close_window` ignores it (WM_CLOSE works in the background) and `activate_window` always activates. See `docs/wiki/mcp-tools.md` for exact per-tool semantics.

## Architecture

```
DSH agent
   │  sees mcp__wincu__windows_computer_use_* tools
   ▼
@deepseek-ai/dsh-mcp-client   ← DSH in-box bridge (official MCP SDK, StdioClientTransport)
   │  JSON-RPC 2.0 over stdio (newline-framed)
   ▼
mcp/server.mjs                ← this repo: MCP server (Node ≥ 22, zero deps)
   │  spawns one persistent backend; JSON-line stdio protocol
   ▼
scripts/windows-uia.ps1       ← this repo: desktop engine (PowerShell 5.1)
   ├─ UI Automation assemblies        → accessibility tree
   ├─ user32 P/Invoke (cached C# DLL) → mouse / keys / window ops
   ├─ Windows.Media.Ocr (C# WinRT)    → OCR
   └─ Windows.Graphics.Capture        → WGC window capture
```

## Safety & limitations

- **Actions are real.** Have the agent `snapshot` before sensitive operations; scope important windows with `windowTitle`.
- **WinUI / Chromium / Electron** drop PostMessage synthetic input (`verified:false` is honest reporting, not success). Use the foreground/clipboard paths for them.
- **Elevated windows** (UAC/admin) are not readable or clickable — Windows blocks both UIA and synthetic input.
- Coordinates are **physical pixels** (explicit Per-Monitor V2 DPI).
- OCR word boxes for CJK text are per-character (engine behavior). Since 0.2.5, `query` can match across characters; `matched[].boundingBox` and `lines[].boundingBox` provide screen-coordinate rectangles, while the existing `matched[].word.x/y` fields give the matched run's center.
- Windows only.

## Development

```
mcp/server.mjs        MCP stdio server + persistent backend manager
scripts/windows-uia.ps1  desktop engine (one-shot & -Persistent modes)
test/                 self-test / MCP protocol / Notepad E2E / features / benchmarks
docs/wiki/            current tool docs and upstream historical notes (see THIRD_PARTY.md)
docs/dev-notes.md     design rationale, pitfalls, benchmarks, test log
```

```sh
npm ci                                 # test-only Electron / MCP SDK / YAML dependencies
node mcp/server.mjs --self-test          # full stack smoke test (Windows only)
node test/mcp-test.mjs                   # initialize → tools/list → tools/call
node test/profile-resolution.mjs         # DSH profile node_modules resolution regression
node test/bundle-startup.mjs             # actual bundle startup in Node / Electron
node test/notepad-e2e.mjs                # real input E2E (opens Notepad)
```

`npm test` runs smoke, MCP protocol, profile-resolution, Node/Electron bundle startup, worker lifecycle, activation cancellation, window discovery/coordinate-cache/argument validation, and input-error regressions. Each suite uses a separate process and temporary directory; logs and smoke-test screenshots remain in the printed artifacts directory. Tests send no physical input and do not change installed DSH profiles. Bundle startup uses a deterministic PowerShell protocol fixture; input and window-movement scenarios use fake APIs. Selftest and read-only window checks cover the real desktop backend.

Windows PowerShell 5.1 is the default. Set `$env:WINDOWS_CU_POWERSHELL = (Get-Command pwsh).Source` before `npm test` to use PowerShell 7. CI (`.github/workflows/ci.yml`) tests both runtimes on every push/PR.

## License

MIT — see [LICENSE](LICENSE). This project is a **derivative of [cgissing/windows-computer-use](https://github.com/cgissing/windows-computer-use)** (MIT); upstream copyright is preserved and detailed in [THIRD_PARTY.md](THIRD_PARTY.md).
