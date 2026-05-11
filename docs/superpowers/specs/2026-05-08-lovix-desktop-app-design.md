# Lovix Desktop App — Design Spec

**Date:** 2026-05-08  
**Status:** Approved  

---

## Overview

Electron-based desktop wrapper for lovix.app. Thin wrapper that loads `https://lovix.app` in a custom frameless window. No code duplication — the web app remains the single source of truth. Updates reach users automatically via the website.

Separate project: `Desktop/lovix-desktop`

---

## Architecture

### Approach: Thin Wrapper

The Electron app loads `https://lovix.app` in a `BrowserWindow`. No local React build. All AI calls, auth, and business logic remain on the web stack.

```
lovix-desktop/
├── main.js          # Electron main process (window, tray, splash)
├── preload.js       # Context bridge (titlebar controls → IPC)
├── splash.html      # Splash screen (logo only, no text)
├── assets/
│   ├── icon.png     # 512×512 app icon (reuse public/logo.png)
│   ├── icon.icns    # macOS
│   └── icon.ico     # Windows
├── package.json
└── electron-builder.yml
```

### Process Communication

```
Main process (main.js)
  ├── creates BrowserWindow (lovix.app)
  ├── creates SplashWindow (splash.html)
  ├── manages Tray icon
  └── handles IPC:
        "window-minimize"  → win.minimize()
        "window-maximize"  → win.isMaximized() ? unmaximize : maximize
        "window-close"     → win.hide() (→ tray, not quit)
        "window-quit"      → app.quit()

Preload (preload.js)
  └── exposes window.__lovixDesktop.ipc(channel) to renderer

Renderer (lovix.app loaded in BrowserWindow)
  └── custom titlebar injected via BrowserWindow CSS injection
      calls window.__lovixDesktop.ipc() for traffic light buttons
```

---

## Window

| Property | Value |
|----------|-------|
| Size | 50% of screen width × 50% of screen height |
| Position | Centered on launch |
| Frame | `false` (frameless) |
| Border radius | 12px (CSS on html/body) |
| Min size | 800 × 600 |
| Resizable | Yes |
| Titlebar style | Custom glassmorphism (injected CSS + overlay div) |

### Custom Titlebar

Injected into every page load via `BrowserWindow.webContents.insertCSS()` + a floating `<div>` appended to the DOM via `executeJavaScript()`.

Titlebar structure:
```
[ ● ● ●  ]  [ logo pill: 🟣 LOVIX ]  [ — □ × ]
  traffic       centered brand         win controls
  lights
```

- Background: `rgba(15, 10, 30, 0.97)` + `backdrop-filter: blur(20px)`
- Border-bottom: `1px solid rgba(255,255,255,0.05)`
- Height: 38px
- Draggable region: `-webkit-app-region: drag` on titlebar; buttons `no-drag`
- Traffic lights: macOS uses native positions, Windows gets custom close/min/max buttons on the right
- Platform detection: `process.platform === 'darwin'` in preload, passed to renderer via IPC

---

## Splash Screen

Shown while `lovix.app` is loading (typically 1–2s).

- Separate `BrowserWindow`: 220×220px, centered, frameless, `alwaysOnTop: true`
- Content: `splash.html` — only the Lovix icon (reuses `logo.png`), no text, no progress bar, aurora glow background
- Closes on `BrowserWindow` `did-finish-load` event
- Fade out: 200ms opacity transition before hide

---

## Tray Icon

- Icon: `assets/icon.png` resized to 16×16 (tray standard)
- Tooltip: "LOVIX"
- Left click: show/focus main window
- Right click menu:
  - "Open LOVIX" → show window
  - separator
  - "Quit" → app.quit()
- Window `close` event → `event.preventDefault()` + `win.hide()` (minimize to tray)
- Quit only via tray → Quit or `app.quit()`

---

## Build & Distribution

### Tool: electron-builder

```yaml
# electron-builder.yml
appId: app.lovix.desktop
productName: LOVIX
icon: assets/icon
win:
  target: nsis
  icon: assets/icon.ico
mac:
  target: dmg
  icon: assets/icon.icns
  category: public.app-category.graphics-design
  hardenedRuntime: true
  gatekeeperAssess: false
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
```

### Output files
- Windows: `LOVIX-Setup-x.x.x.exe` (~150MB, NSIS installer)
- macOS: `LOVIX-x.x.x.dmg` (~150MB, drag-to-Applications)

### Hosting
- GitHub Releases on `github.com/lovixapp/lovix-desktop` (or private repo)
- Direct download URLs in lovix.app website CTA

---

## Website CTA — Download Section

Add a "Desktop App" section to `src/pages/Index.tsx` (after hero, before features).

Two download buttons:
- **Download for Windows** → link to GitHub Release `.exe`
- **Download for macOS** → link to GitHub Release `.dmg`

Style: same aurora gradient buttons as existing CTA. Badge "Free Download" above buttons.

---

## Security

- `nodeIntegration: false` (default)
- `contextIsolation: true` (default)
- `sandbox: true` on main BrowserWindow
- Preload only exposes `ipc(channel)` with allowlist of valid channels
- No `shell.openExternal` calls

---

## Out of Scope

- Auto-updater (lovix.app updates automatically via web)
- Offline mode (all AI features require internet)
- Linux build (first release Windows + macOS only)
- Deep linking / protocol handler
- Native notifications (web app handles these)
