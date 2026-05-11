# Lovix Desktop App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Electron desktop app that wraps lovix.app in a custom frameless window with glassmorphism titlebar, tray icon, and splash screen — distributed as .exe (Windows) and .dmg (macOS).

**Architecture:** Thin Electron wrapper. `BrowserWindow` renders local `titlebar.html`. A `WebContentsView` child loads `https://lovix.app` below the titlebar. No local copy of the React app — updates deploy automatically via the website.

**Tech Stack:** Electron 32, electron-builder, Node.js 20+

---

## File Map

```
C:\Users\infoe\Desktop\lovix-desktop\
├── main.js                  # Main process: window, splash, tray, IPC
├── preload.js               # Context bridge for titlebar window controls
├── titlebar.html            # Glassmorphism titlebar (local file, 38px)
├── splash.html              # Splash screen (logo only, 220×220)
├── assets/
│   ├── icon.png             # 512×512 (copy of lovix-app/public/logo.png)
│   ├── icon.icns            # macOS icon (generated from icon.png)
│   └── icon.ico             # Windows icon (generated from icon.png)
├── package.json
├── electron-builder.yml
└── .gitignore
```

Website addition:
```
C:\Users\infoe\Desktop\lovix-app\src\pages\Index.tsx   # Add download CTA section
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `C:\Users\infoe\Desktop\lovix-desktop\package.json`
- Create: `C:\Users\infoe\Desktop\lovix-desktop\.gitignore`
- Create: `C:\Users\infoe\Desktop\lovix-desktop\assets\` (empty dir placeholder)

- [ ] **Step 1: Create project directory and package.json**

```bash
cd "C:\Users\infoe\Desktop"
mkdir lovix-desktop
cd lovix-desktop
```

Create `package.json`:
```json
{
  "name": "lovix-desktop",
  "version": "1.0.0",
  "description": "Lovix AI Creative Platform — Desktop App",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:all": "electron-builder --win --mac"
  },
  "devDependencies": {
    "electron": "^32.0.0",
    "electron-builder": "^25.0.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, `package-lock.json` generated.

- [ ] **Step 3: Create .gitignore**

```
node_modules/
dist/
release/
*.log
```

- [ ] **Step 4: Create assets directory and copy icon**

```bash
mkdir assets
cp "C:\Users\infoe\Desktop\lovix-app\public\logo.png" assets/icon.png
```

- [ ] **Step 5: Smoke test — electron runs**

Create a minimal `main.js` to verify Electron works:
```js
const { app, BrowserWindow } = require('electron');
app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 800, height: 600 });
  win.loadURL('https://lovix.app');
});
app.on('window-all-closed', () => app.quit());
```

```bash
npm start
```

Expected: Window opens and loads lovix.app. Close it.

- [ ] **Step 6: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold lovix-desktop Electron project"
```

---

## Task 2: Splash Screen

**Files:**
- Create: `splash.html`
- Modify: `main.js` (replace with full implementation — see Task 3 for final version; add splash logic incrementally)

- [ ] **Step 1: Create splash.html**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 220px; height: 220px;
      background: transparent;
      overflow: hidden;
      border-radius: 24px;
    }
    .wrap {
      width: 220px; height: 220px;
      background: rgb(10, 5, 25);
      border-radius: 24px;
      border: 1px solid rgba(139, 92, 246, 0.35);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0;
      position: relative;
      overflow: hidden;
    }
    .glow {
      position: absolute;
      width: 180px; height: 180px;
      background: radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%);
      border-radius: 50%;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
    .glow2 {
      position: absolute;
      width: 120px; height: 120px;
      background: radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%);
      border-radius: 50%;
      bottom: -20px; right: -10px;
      pointer-events: none;
    }
    img {
      width: 72px; height: 72px;
      border-radius: 18px;
      box-shadow: 0 0 40px rgba(139,92,246,0.5), 0 0 15px rgba(6,182,212,0.2);
      position: relative;
      z-index: 1;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="glow"></div>
    <div class="glow2"></div>
    <img src="assets/icon.png" alt="LOVIX">
  </div>
</body>
</html>
```

- [ ] **Step 2: Update main.js to show splash on launch**

Replace `main.js` entirely:
```js
const { app, BrowserWindow, WebContentsView } = require('electron');
const path = require('path');

const TITLEBAR_HEIGHT = 38;
const APP_URL = 'https://lovix.app';

let mainWin = null;
let splashWin = null;

function createSplash() {
  splashWin = new BrowserWindow({
    width: 220,
    height: 220,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    center: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });
  splashWin.loadFile('splash.html');
}

function closeSplash() {
  if (splashWin && !splashWin.isDestroyed()) {
    splashWin.setOpacity(0);
    setTimeout(() => {
      if (splashWin && !splashWin.isDestroyed()) splashWin.close();
      splashWin = null;
    }, 200);
  }
}

app.whenReady().then(() => {
  createSplash();
  // Main window created in Task 3 — placeholder for now
  setTimeout(closeSplash, 2000); // temp: close after 2s
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

- [ ] **Step 3: Test splash appears and fades**

```bash
npm start
```

Expected: Small centered splash with logo appears, fades after 2s.

- [ ] **Step 4: Commit**

```bash
git add main.js splash.html
git commit -m "feat: add splash screen with logo and aurora glow"
```

---

## Task 3: Main Window with Titlebar

**Files:**
- Create: `titlebar.html`
- Create: `preload.js`
- Modify: `main.js` (add createMainWindow, tie splash close to did-finish-load)

- [ ] **Step 1: Create preload.js**

```js
const { contextBridge, ipcRenderer } = require('electron');

const ALLOWED_CHANNELS = ['window-minimize', 'window-maximize', 'window-close'];

contextBridge.exposeInMainWorld('__lovixDesktop', {
  platform: process.platform,
  ipc: (channel) => {
    if (ALLOWED_CHANNELS.includes(channel)) {
      ipcRenderer.send(channel);
    }
  },
});
```

- [ ] **Step 2: Create titlebar.html**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      height: 38px;
      background: transparent;
      overflow: hidden;
      user-select: none;
      -webkit-user-select: none;
    }
    .titlebar {
      width: 100%;
      height: 38px;
      background: rgba(15, 10, 30, 0.97);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.05);
      display: flex;
      align-items: center;
      -webkit-app-region: drag;
      position: relative;
    }
    .controls {
      display: flex;
      gap: 6px;
      padding: 0 14px;
      -webkit-app-region: no-drag;
      flex-shrink: 0;
    }
    .btn {
      width: 12px; height: 12px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      transition: filter 0.15s;
    }
    .btn:hover { filter: brightness(1.3); }
    .btn-close  { background: #ff5f57; }
    .btn-min    { background: #febc2e; }
    .btn-max    { background: #28c840; }
    .brand {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 7px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      padding: 4px 14px;
      -webkit-app-region: drag;
    }
    .logo {
      width: 18px; height: 18px;
      border-radius: 5px;
    }
    .name {
      color: rgba(255,255,255,0.85);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.1em;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    /* Windows: right-side controls */
    .win-controls {
      margin-left: auto;
      display: none;
      -webkit-app-region: no-drag;
      padding: 0 4px;
    }
    .win-btn {
      width: 46px; height: 38px;
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.6);
      font-size: 11px;
      cursor: pointer;
      transition: background 0.1s, color 0.1s;
    }
    .win-btn:hover { background: rgba(255,255,255,0.08); color: white; }
    .win-btn.close:hover { background: #e81123; color: white; }
  </style>
</head>
<body>
  <div class="titlebar">
    <!-- macOS: traffic lights left -->
    <div class="controls" id="mac-controls">
      <button class="btn btn-close"  onclick="ipc('window-close')"></button>
      <button class="btn btn-min"    onclick="ipc('window-minimize')"></button>
      <button class="btn btn-max"    onclick="ipc('window-maximize')"></button>
    </div>

    <!-- Center brand pill -->
    <div class="brand">
      <img class="logo" src="assets/icon.png" alt="">
      <span class="name">LOVIX</span>
    </div>

    <!-- Windows: right-side controls -->
    <div class="win-controls" id="win-controls">
      <button class="win-btn" onclick="ipc('window-minimize')">─</button>
      <button class="win-btn" onclick="ipc('window-maximize')">□</button>
      <button class="win-btn close" onclick="ipc('window-close')">✕</button>
    </div>
  </div>

  <script>
    function ipc(channel) {
      if (window.__lovixDesktop) window.__lovixDesktop.ipc(channel);
    }

    // Show platform-appropriate controls
    if (window.__lovixDesktop && window.__lovixDesktop.platform !== 'darwin') {
      document.getElementById('mac-controls').style.display = 'none';
      document.getElementById('win-controls').style.display = 'flex';
    }
  </script>
</body>
</html>
```

- [ ] **Step 3: Update main.js with full createMainWindow**

Replace `main.js`:
```js
const { app, BrowserWindow, WebContentsView, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

const TITLEBAR_HEIGHT = 38;
const APP_URL = 'https://lovix.app';

let mainWin = null;
let contentView = null;
let tray = null;
let splashWin = null;

function createSplash() {
  splashWin = new BrowserWindow({
    width: 220,
    height: 220,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    center: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });
  splashWin.loadFile('splash.html');
}

function closeSplash() {
  if (splashWin && !splashWin.isDestroyed()) {
    splashWin.webContents.executeJavaScript(
      'document.body.style.transition="opacity 0.2s";document.body.style.opacity="0"'
    );
    setTimeout(() => {
      if (splashWin && !splashWin.isDestroyed()) splashWin.close();
      splashWin = null;
    }, 220);
  }
}

function getWindowSize() {
  const { screen } = require('electron');
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  return {
    width: Math.round(width * 0.5),
    height: Math.round(height * 0.5),
  };
}

function createMainWindow() {
  const { width, height } = getWindowSize();

  mainWin = new BrowserWindow({
    width,
    height,
    minWidth: 800,
    minHeight: 600,
    center: true,
    frame: false,
    roundedCorners: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // Load titlebar
  mainWin.loadFile('titlebar.html');

  // Attach lovix.app as a child WebContentsView
  contentView = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });
  mainWin.contentView.addChildView(contentView);

  function resizeContentView() {
    const [w, h] = mainWin.getContentSize();
    contentView.setBounds({ x: 0, y: TITLEBAR_HEIGHT, width: w, height: h - TITLEBAR_HEIGHT });
  }

  mainWin.on('resize', resizeContentView);
  resizeContentView();

  contentView.webContents.loadURL(APP_URL);

  // Show main window and close splash when lovix.app is ready
  contentView.webContents.once('did-finish-load', () => {
    mainWin.show();
    closeSplash();
  });

  // Hide to tray instead of closing
  mainWin.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWin.hide();
    }
  });

  // IPC: titlebar buttons
  ipcMain.on('window-minimize', () => mainWin.minimize());
  ipcMain.on('window-maximize', () => {
    mainWin.isMaximized() ? mainWin.unmaximize() : mainWin.maximize();
  });
  ipcMain.on('window-close', () => mainWin.hide());
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  tray = new Tray(icon);
  tray.setToolTip('LOVIX');

  const menu = Menu.buildFromTemplate([
    { label: 'Open LOVIX', click: () => { mainWin.show(); mainWin.focus(); } },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } },
  ]);
  tray.setContextMenu(menu);

  tray.on('click', () => {
    if (mainWin.isVisible()) {
      mainWin.focus();
    } else {
      mainWin.show();
    }
  });
}

app.whenReady().then(() => {
  createSplash();
  createMainWindow();
  createTray();
});

app.on('window-all-closed', () => {
  // Do not quit — tray keeps app alive
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

app.on('activate', () => {
  // macOS: click dock icon shows window
  if (mainWin) mainWin.show();
});
```

- [ ] **Step 4: Test full window**

```bash
npm start
```

Expected:
- Splash appears centered with logo
- After ~1-2s (lovix.app loads), splash fades, main window appears
- Window is 50% screen, centered
- Glassmorphism titlebar with logo pill
- lovix.app renders below titlebar
- macOS: traffic lights on left; Windows: custom close/min/max on right

- [ ] **Step 5: Commit**

```bash
git add main.js preload.js titlebar.html
git commit -m "feat: main window with glassmorphism titlebar and lovix.app WebContentsView"
```

---

## Task 4: Tray + Window Behavior Polish

**Files:**
- Modify: `main.js` (already complete in Task 3 — verify behaviors below)

- [ ] **Step 1: Verify tray appears**

```bash
npm start
```

Expected: After window opens, a tray icon appears in system tray (Windows: bottom-right; macOS: top-right menu bar).

- [ ] **Step 2: Verify close → hide (not quit)**

Click the red close button in the titlebar. Expected: window disappears but app stays in tray (tray icon still visible).

- [ ] **Step 3: Verify tray left-click shows window**

Click tray icon. Expected: main window reappears.

- [ ] **Step 4: Verify tray right-click menu**

Right-click tray icon. Expected: menu with "Open LOVIX" and "Quit".

- [ ] **Step 5: Verify Quit actually quits**

Right-click tray → Quit. Expected: app fully exits (tray icon gone).

- [ ] **Step 6: Commit**

```bash
git add main.js
git commit -m "feat: tray icon — minimize to tray on close, context menu with quit"
```

---

## Task 5: App Icons

**Files:**
- Create: `assets/icon.icns` (macOS)
- Create: `assets/icon.ico` (Windows)

- [ ] **Step 1: Verify icon.png exists and is 512×512**

```bash
file assets/icon.png
# Should report: PNG image data, 512 x 512
```

If not 512×512, resize: `magick assets/icon.png -resize 512x512 assets/icon.png` (requires ImageMagick) or use an online tool.

- [ ] **Step 2: Generate icon.icns (macOS)**

Option A — using ImageMagick + iconutil (macOS only):
```bash
mkdir icon.iconset
for size in 16 32 64 128 256 512; do
  magick assets/icon.png -resize ${size}x${size} icon.iconset/icon_${size}x${size}.png
  magick assets/icon.png -resize $((size*2))x$((size*2)) icon.iconset/icon_${size}x${size}@2x.png
done
iconutil -c icns icon.iconset -o assets/icon.icns
rm -rf icon.iconset
```

Option B — use https://cloudconvert.com/png-to-icns online, upload `assets/icon.png`, download `icon.icns` to `assets/`.

- [ ] **Step 3: Generate icon.ico (Windows)**

Option A — using ImageMagick:
```bash
magick assets/icon.png -define icon:auto-resize=256,128,64,48,32,16 assets/icon.ico
```

Option B — use https://cloudconvert.com/png-to-ico online, upload `assets/icon.png`, download `icon.ico` to `assets/`.

- [ ] **Step 4: Commit**

```bash
git add assets/
git commit -m "chore: add app icons for Windows and macOS"
```

---

## Task 6: electron-builder Config

**Files:**
- Create: `electron-builder.yml`

- [ ] **Step 1: Create electron-builder.yml**

```yaml
appId: app.lovix.desktop
productName: LOVIX
copyright: Copyright © 2026 LOVIX

directories:
  output: dist

files:
  - main.js
  - preload.js
  - titlebar.html
  - splash.html
  - assets/**
  - node_modules/**
  - package.json

win:
  target:
    - target: nsis
      arch: [x64]
  icon: assets/icon.ico

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: LOVIX

mac:
  target:
    - target: dmg
      arch: [universal]
  icon: assets/icon.icns
  category: public.app-category.graphics-design
  hardenedRuntime: true
  gatekeeperAssess: false

dmg:
  title: LOVIX

linux:
  # Not in scope for v1
```

- [ ] **Step 2: Add electron as external (not bundled)**

In `package.json`, add:
```json
{
  "build": {
    "electronVersion": "32.0.0"
  }
}
```

- [ ] **Step 3: Test Windows build**

On Windows machine:
```bash
npm run build:win
```

Expected: `dist/LOVIX-Setup-1.0.0.exe` created. Install it and verify app launches.

- [ ] **Step 4: Test macOS build**

On macOS machine (or CI):
```bash
npm run build:mac
```

Expected: `dist/LOVIX-1.0.0.dmg` created. Mount and drag to Applications, verify app launches.

- [ ] **Step 5: Commit**

```bash
git add electron-builder.yml package.json
git commit -m "chore: add electron-builder config for Windows NSIS and macOS DMG"
```

---

## Task 7: Website Download CTA

**Files:**
- Modify: `C:\Users\infoe\Desktop\lovix-app\src\pages\Index.tsx`

The `.exe` and `.dmg` will be hosted on GitHub Releases. Before this step, create a GitHub release at `https://github.com/lovixapp/lovix-desktop/releases` and upload both files. The URLs will be:
- Windows: `https://github.com/lovixapp/lovix-desktop/releases/latest/download/LOVIX-Setup-1.0.0.exe`
- macOS: `https://github.com/lovixapp/lovix-desktop/releases/latest/download/LOVIX-1.0.0.dmg`

Update these URLs in the code below once the repo and release exist.

- [ ] **Step 1: Find the hero section end in Index.tsx**

Open `src/pages/Index.tsx`. Find the closing `</section>` of the hero section (the section with the aurora hero headline). Insert the download section immediately after it.

- [ ] **Step 2: Add download section**

Add this JSX block after the hero `</section>`:

```tsx
{/* Desktop App Download */}
<section className="py-12 sm:py-16 px-4">
  <div className="max-w-2xl mx-auto text-center">
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6 text-xs font-semibold uppercase tracking-widest"
      style={{
        background: "hsl(var(--violet)/0.08)",
        borderColor: "hsl(var(--violet)/0.25)",
        color: "hsl(var(--violet))",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      Desktop App — Free Download
    </div>

    <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
      <span className="gradient-text-aurora">LOVIX for Desktop</span>
    </h2>
    <p className="text-muted-foreground mb-8 text-base sm:text-lg max-w-lg mx-auto">
      Native desktop experience. Same powerful AI tools, dedicated window, tray icon. No browser needed.
    </p>

    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <a
        href="https://github.com/lovixapp/lovix-desktop/releases/latest/download/LOVIX-Setup-1.0.0.exe"
        className="btn-gradient inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white no-underline"
        download
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
        </svg>
        Download for Windows
      </a>
      <a
        href="https://github.com/lovixapp/lovix-desktop/releases/latest/download/LOVIX-1.0.0.dmg"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors no-underline text-foreground"
        download
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        Download for macOS
      </a>
    </div>

    <p className="text-xs text-muted-foreground/60 mt-4">
      Windows 10/11 · macOS 12+ · Free to download
    </p>
  </div>
</section>
```

- [ ] **Step 3: Build and verify**

```bash
cd "C:\Users\infoe\Desktop\lovix-app"
npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 4: Deploy**

```bash
npx wrangler pages deploy dist --project-name lovix-app --branch=main --commit-dirty=true
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/Index.tsx
git commit -m "feat: add desktop app download CTA to homepage"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✅ Thin wrapper (Electron + WebContentsView loads lovix.app)
- ✅ Frameless window, 50% screen, centered, rounded corners (`roundedCorners: true`)
- ✅ Glassmorphism titlebar option C — logo pill centered, traffic lights left (macOS) / win controls right (Windows)
- ✅ Splash screen — solo logo icon, aurora glow, fades out on did-finish-load
- ✅ Tray icon — minimize to tray on close, left-click to show, right-click Quit
- ✅ electron-builder — Windows NSIS .exe + macOS DMG
- ✅ Website CTA — download section with Windows + macOS buttons

**Placeholder check:**
- GitHub repo URL is a placeholder (`lovixapp/lovix-desktop`). Create the repo and update the download URLs in Task 7 before building the final release.

**Type/name consistency:**
- `closeSplash()` called consistently
- `TITLEBAR_HEIGHT = 38` used in both main window and WebContentsView bounds
- `app.isQuitting` flag used in both close handler and before-quit
