# Electron CLAUDE.md Template

**Copy this template to your Electron project root as `CLAUDE.md` and customize for your project.**

---

```markdown
# CLAUDE.md - [Project Name]

## Project Overview

- **Type**: Desktop application (Electron)
- **Language**: TypeScript
- **Renderer Framework**: [React / Vue / Svelte / Vanilla]
- **Build Tool**: [Electron Forge / electron-builder]
- **Electron Version**: [30+ / specify]
- **Target Platforms**: [macOS / Windows / Linux / All]
- **Description**: [Brief description of what this app does]

## Architecture

### Stack
- **Main Process**: TypeScript (Node.js)
- **Renderer**: [React / Vue / Svelte] with TypeScript
- **Styling**: [Tailwind CSS / CSS Modules / Styled Components / Plain CSS]
- **State Management**: [Zustand / Redux / Pinia / Svelte stores / None]
- **Storage**: [electron-store / SQLite (better-sqlite3) / IndexedDB / File-based]
- **Bundler**: [Vite / Webpack] (via Forge or standalone)

### Directory Structure
```
[ProjectName]/
  main/                   # Main process
    index.ts              # App entry, window creation
    ipc.ts                # IPC handlers (ipcMain.handle/on)
    menu.ts               # Application menu
    updater.ts            # Auto-update logic
  preload/                # Preload scripts
    index.ts              # contextBridge API exposure
  renderer/               # Renderer process
    src/
      App.tsx             # Root component
      components/         # UI components
      pages/              # Page-level components
      hooks/              # Custom hooks
      lib/                # Utilities
    index.html            # HTML entry point
  shared/                 # Shared between processes
    types.ts              # IPC payload types
    channels.ts           # IPC channel name constants
  e2e/                    # Playwright E2E tests
  package.json
  [forge.config.ts / electron-builder.yml]
```

## Conventions

### Process Isolation
- **Main process**: System access, file I/O, native modules, window management
- **Preload script**: Bridge only; expose typed functions via `contextBridge`
- **Renderer process**: UI rendering only; access main via `window.api.*`
- **Never** enable `nodeIntegration` in renderer
- **Always** use `contextIsolation: true` and `sandbox: true`

### IPC Patterns
- Use `ipcMain.handle()` / `ipcRenderer.invoke()` for request/response
- Use `webContents.send()` / `ipcRenderer.on()` for main-to-renderer
- Use `ipcRenderer.send()` / `ipcMain.on()` for fire-and-forget
- Define channel names in `shared/channels.ts`
- Define payload types in `shared/types.ts`

### Naming
- **IPC channels**: `kebab-case` (`read-file`, `save-document`)
- **Preload API**: camelCase (`window.api.readFile()`)
- **Components**: PascalCase (`FileExplorer`, `SettingsPanel`)
- **Files**: kebab-case (`file-explorer.tsx`, `settings-panel.tsx`)

### Security
- CSP in `renderer/index.html` restricts resource loading
- Preload exposes only specific functions, never raw IPC
- Validate all IPC inputs in main process handlers
- Use `safeStorage` for sensitive data encryption
- Use `session.defaultSession.setPermissionRequestHandler()` for permission control

## Testing

### Unit Tests (Main Process)
```bash
# Run unit tests
npm test

# Run specific test file
npx vitest run main/__tests__/ipc.test.ts
```

### Component Tests (Renderer)
```bash
# Run renderer tests
npx vitest run renderer/

# With coverage
npx vitest run renderer/ --coverage
```

### E2E Tests (Playwright)
```bash
# Run E2E tests
npx playwright test e2e/

# Run specific test
npx playwright test e2e/app.spec.ts

# UI mode
npx playwright test e2e/ --ui
```

## Commands

### Development
```bash
# Start dev server
npm start

# Type-check all processes
npx tsc --noEmit
```

### Build
```bash
# Package for current platform (Forge)
npm run make

# Package for current platform (electron-builder)
npm run dist

# Package for specific platform
npm run make -- --platform=darwin
```

### Code Quality
```bash
# Lint
npm run lint

# Format
npx prettier --write .

# Type-check
npx tsc --noEmit
```

## MCP Servers

This project uses the following MCP servers:
- **electron-mcp-server** (user/local): UI automation, DevTools access
- **Serena** (user): Code intelligence and symbol navigation

## Important Notes

- **Process separation is mandatory** - Never bypass contextBridge for IPC
- **Clean up IPC handlers** - Remove handlers when windows close to prevent memory leaks
- **Test both processes** - Main process logic and renderer UI need separate test strategies
- [Add project-specific notes here]
- [Example: "Uses electron-forge with Vite plugin"]
- [Example: "Auto-updates via GitHub releases with electron-updater"]
- [Example: "Native module: better-sqlite3 (requires electron-rebuild)"]
```

---

## Customization Guide

### If Using React Renderer

```markdown
### React
- Framework: React 18+ with TypeScript
- State: [Zustand / Redux Toolkit / Context API]
- Routing: [React Router v6 / None (single page)]
- Components in: `renderer/src/components/`
- Pages in: `renderer/src/pages/`
```

### If Using Vue Renderer

```markdown
### Vue
- Framework: Vue 3 with Composition API and TypeScript
- State: [Pinia / Vuex]
- Routing: [Vue Router / None]
- Components in: `renderer/src/components/`
```

### If Using Svelte Renderer

```markdown
### Svelte
- Framework: Svelte 4+ with TypeScript
- State: Svelte stores
- Components in: `renderer/src/lib/components/`
```

### If Using Electron Forge

```markdown
### Build (Forge)
- Config: `forge.config.ts`
- Plugins: [@electron-forge/plugin-vite / @electron-forge/plugin-webpack]
- Makers: [DMG, ZIP, deb, rpm, squirrel]
- Publishers: [GitHub / S3 / custom]
- Start: `npm start` (runs `electron-forge start`)
- Package: `npm run make` (runs `electron-forge make`)
```

### If Using electron-builder

```markdown
### Build (electron-builder)
- Config: `electron-builder.yml`
- Targets: [DMG, NSIS, AppImage, snap]
- Auto-updates: electron-updater with [GitHub / S3 / generic] provider
- Start: `npm start` (custom dev script)
- Package: `npm run dist` (runs `electron-builder`)
```

### If Using Auto-Updates

```markdown
### Auto-Updates
- Library: [electron-updater / @electron-forge/publisher-*]
- Provider: [GitHub releases / S3 / custom server]
- Channel: [latest / beta / alpha]
- Check interval: [On startup / Every N hours / Manual]
- User notification: [Dialog / In-app banner / Silent]
```
