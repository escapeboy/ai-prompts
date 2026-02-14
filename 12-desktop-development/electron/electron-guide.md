# Electron Development Guide

**Workflows and best practices for Electron desktop development with Claude Code and MCP servers.**

---

## Overview

Claude Code integrates with Electron development through:

| MCP Server | Type | Purpose |
|------------|------|---------|
| **electron-mcp-server** | stdio | UI automation, DevTools integration, window management |
| **electron-playwright-mcp** | stdio | Playwright-based end-to-end testing for Electron |

Electron uses Chromium for rendering and Node.js for system access. Apps are larger (80-200 MB) but benefit from full web ecosystem compatibility.

---

## Architecture

```
Electron App
  +-- main/                # Main process (Node.js)
  |     +-- index.ts       # App entry point, window creation
  |     +-- ipc.ts         # IPC handlers
  |     +-- menu.ts        # Application menu
  |     +-- updater.ts     # Auto-update logic
  |
  +-- preload/             # Preload scripts (bridge)
  |     +-- index.ts       # contextBridge API exposure
  |
  +-- renderer/            # Renderer process (Chromium)
  |     +-- src/
  |     |     +-- App.tsx  # Root component
  |     |     +-- components/
  |     |     +-- pages/
  |     +-- index.html
  |
  +-- shared/              # Shared types between processes
  |     +-- types.ts
  |
  +-- package.json
  +-- forge.config.ts      # or electron-builder.yml
```

### Process Model

```
Main Process (Node.js)
  |
  +-- Full Node.js API access
  +-- System resources (file system, OS, native modules)
  +-- Window management (BrowserWindow)
  +-- Application lifecycle
  |
  +-- IPC Bridge -----> Preload Script (contextBridge)
                              |
                              +-- Renderer Process (Chromium)
                                    +-- Web APIs only
                                    +-- UI rendering
                                    +-- No direct Node.js access
```

---

## Core Workflow: Dev Loop

```
1. Start dev server: npm start (or electron-forge start)
2. Modify renderer code (hot-reload via webpack/vite)
3. Modify main process code (restart required)
4. Test IPC communication
5. Package: npm run make (or npm run dist)
```

### Example Session

```
You: "Add a file watcher that shows notifications when files change in a directory"

Claude Code:
  1. Creates IPC handler in main/ipc.ts using fs.watch (Serena)
  2. Exposes API via preload/index.ts using contextBridge
  3. Creates renderer component for directory selection
  4. Wires IPC invoke/on calls
  5. Uses Notification API from main process
  6. Tests via npm start
```

---

## IPC Patterns

Electron IPC has three communication patterns.

### Renderer → Main (invoke/handle)

```typescript
// main/ipc.ts
import { ipcMain } from "electron";
import { readFile } from "fs/promises";

ipcMain.handle("read-file", async (_event, path: string) => {
  return readFile(path, "utf-8");
});
```

```typescript
// preload/index.ts
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  readFile: (path: string) => ipcRenderer.invoke("read-file", path),
});
```

```typescript
// renderer/src/App.tsx
const content = await window.api.readFile("/tmp/data.txt");
```

### Main → Renderer (webContents.send)

```typescript
// main/index.ts
mainWindow.webContents.send("file-changed", { path, event: "modify" });
```

```typescript
// preload/index.ts
contextBridge.exposeInMainWorld("api", {
  onFileChanged: (callback: (data: FileEvent) => void) => {
    ipcRenderer.on("file-changed", (_event, data) => callback(data));
  },
});
```

### Renderer → Main (one-way, send/on)

```typescript
// preload/index.ts
contextBridge.exposeInMainWorld("api", {
  logEvent: (event: string) => ipcRenderer.send("log-event", event),
});

// main/ipc.ts
ipcMain.on("log-event", (_event, eventName: string) => {
  logger.info(eventName);
});
```

---

## Electron Forge vs Electron Builder

| Feature | Electron Forge | electron-builder |
|---------|---------------|------------------|
| **Maintained by** | Electron team (official) | Community |
| **Config format** | `forge.config.ts` | `electron-builder.yml` |
| **Build system** | Webpack/Vite plugin | External bundler |
| **macOS formats** | DMG, ZIP, pkg | DMG, ZIP, pkg, mas |
| **Auto-updates** | `@electron-forge/publisher-*` | `electron-updater` |
| **Code signing** | Built-in support | Built-in support |
| **Recommendation** | New projects | Existing projects, advanced packaging |

### Forge Configuration (Recommended)

```typescript
// forge.config.ts
import type { ForgeConfig } from "@electron-forge/shared-types";

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    osxSign: {},
    osxNotarize: {
      appleId: process.env.APPLE_ID!,
      appleIdPassword: process.env.APPLE_PASSWORD!,
      teamId: process.env.APPLE_TEAM_ID!,
    },
  },
  makers: [
    { name: "@electron-forge/maker-dmg", config: {} },
    { name: "@electron-forge/maker-zip", platforms: ["darwin"] },
  ],
};

export default config;
```

### Builder Configuration

```yaml
# electron-builder.yml
appId: com.yourcompany.yourapp
productName: YourApp
mac:
  category: public.app-category.productivity
  hardenedRuntime: true
  entitlements: build/entitlements.mac.plist
dmg:
  sign: false
afterSign: scripts/notarize.js
```

---

## Testing with Playwright

Playwright has experimental Electron support for end-to-end testing.

### Setup

```typescript
// e2e/electron.spec.ts
import { test, expect, _electron as electron } from "@playwright/test";

test("app launches and shows main window", async () => {
  const app = await electron.launch({ args: ["."] });
  const window = await app.firstWindow();

  await expect(window).toHaveTitle(/YourApp/);

  const heading = window.locator("h1");
  await expect(heading).toBeVisible();

  await app.close();
});
```

### Running Tests

```bash
# Run Playwright Electron tests
npx playwright test e2e/

# Run with UI mode
npx playwright test e2e/ --ui

# Run specific test
npx playwright test e2e/electron.spec.ts
```

---

## macOS Packaging

### Code Signing

```bash
# Sign with Developer ID
export APPLE_ID="your@email.com"
export APPLE_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="TEAM_ID"

# Forge handles signing automatically when osxSign is configured
npm run make
```

### Notarization

```bash
# With Forge (automatic when osxNotarize is configured)
npm run make

# Manual notarization
xcrun notarytool submit out/make/YourApp.dmg \
  --apple-id "$APPLE_ID" \
  --team-id "$APPLE_TEAM_ID" \
  --password "$APPLE_PASSWORD" \
  --wait
```

### Auto-Updates

```typescript
// main/updater.ts
import { autoUpdater } from "electron-updater";

export function initAutoUpdater() {
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on("update-available", () => {
    // Notify user
  });

  autoUpdater.on("update-downloaded", () => {
    autoUpdater.quitAndInstall();
  });
}
```

---

## Security

### Required Settings

```typescript
// main/index.ts
const mainWindow = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,    // Always true
    nodeIntegration: false,    // Always false
    sandbox: true,             // Enable renderer sandbox
    preload: path.join(__dirname, "../preload/index.js"),
  },
});
```

### Content Security Policy

```html
<!-- renderer/index.html -->
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'">
```

### Preload Script Safety

```typescript
// preload/index.ts - GOOD: expose specific functions
contextBridge.exposeInMainWorld("api", {
  readFile: (path: string) => ipcRenderer.invoke("read-file", path),
});

// BAD: never expose ipcRenderer directly
// contextBridge.exposeInMainWorld("ipcRenderer", ipcRenderer);
```

---

## Common Electron Gotchas

### 1. Bundle Size

Electron apps ship with Chromium (~80 MB baseline).

**Mitigations**:
- Use `asar: true` in packager config
- Exclude dev dependencies: set `devDependencies` in package.json
- Use `files` field in builder config to exclude unnecessary files
- Consider Tauri if binary size is critical

### 2. Memory Leaks

Common sources: unclosed IPC listeners, unreleased BrowserWindows, accumulating event listeners.

**Fix**:
```typescript
// Remove listeners when window closes
mainWindow.on("closed", () => {
  ipcMain.removeHandler("read-file");
});

// Use once() for one-time listeners
ipcMain.once("init", handler);
```

### 3. Native Modules

Node native modules (`.node` files) need rebuilding for Electron's Node version.

```bash
# With Forge (automatic)
# forge.config.ts handles this

# Manual rebuild
npx electron-rebuild

# Or specify in package.json
"scripts": {
  "postinstall": "electron-rebuild"
}
```

### 4. Notarization Failures

```
"The signature of the binary is invalid"
```

**Fix**: Ensure hardened runtime is enabled and all binaries are signed:

```bash
# Check all binaries in the app bundle
codesign --verify --deep --strict YourApp.app
```

### 5. IPC Serialization

IPC uses structured clone algorithm. Some types cannot be sent:

| Sendable | Not Sendable |
|----------|-------------|
| Primitives, arrays, plain objects | Functions |
| Date, RegExp, Map, Set | DOM elements |
| ArrayBuffer, TypedArray | Error objects (use `.message`) |
| Blob | Symbols, WeakRef |

---

## Recommended Workflow by Task Type

| Task | Tools | Approach |
|------|-------|----------|
| New IPC channel | Serena + Write | Create handler in main, expose in preload, use in renderer |
| UI component | Write + Edit | Create component in renderer, test with hot-reload |
| Main process feature | Serena + Write + Bash | Write Node.js code, restart app to test |
| Fix memory leak | Read + Grep + Edit | Find listener registration, ensure cleanup |
| Package for macOS | Bash | `npm run make` with signing/notarization config |
| E2E test | Write + Bash | Create Playwright spec, `npx playwright test` |

---

## See Also

- [setup-guide.md](../setup-guide.md) - MCP installation instructions
- [electron-subagent.md](electron-subagent.md) - Electron specialist subagent definition
- [electron-claude-md-template.md](electron-claude-md-template.md) - CLAUDE.md template for Electron projects
- [10-subagents/guide.md](../../10-subagents/guide.md) - General subagent creation guide
