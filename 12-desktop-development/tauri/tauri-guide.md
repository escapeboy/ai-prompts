# Tauri Development Guide

**Workflows and best practices for Tauri v2 desktop development with Claude Code and MCP servers.**

---

## Overview

Claude Code integrates with Tauri development through:

| MCP Server | Type | Purpose |
|------------|------|---------|
| **tauri-plugin-mcp** | Cargo plugin | Screenshots, DOM inspection, window management (in-app) |
| **tauri-mcp-server** | External (stdio) | Debugging and inspection independent of the running app |

Tauri v2 is a Rust-based framework that uses web technologies (HTML/CSS/JS) for the frontend and Rust for the backend. Apps are lightweight (2-10 MB) compared to Electron (80-200 MB).

---

## Architecture

```
Tauri App
  +-- src-tauri/          # Rust backend
  |     +-- src/
  |     |     +-- lib.rs  # Plugin registration, app setup
  |     |     +-- main.rs # Entry point
  |     |     +-- commands.rs  # IPC command handlers
  |     +-- Cargo.toml    # Rust dependencies
  |     +-- tauri.conf.json    # App configuration
  |     +-- capabilities/      # Permission definitions
  |
  +-- src/                # Web frontend
  |     +-- App.tsx       # Root component (React/Vue/Svelte)
  |     +-- components/   # UI components
  |     +-- lib/          # Utilities, API bindings
  |
  +-- package.json        # Frontend dependencies
```

---

## Core Workflow: Dev Loop

```
1. Start dev server: cargo tauri dev
2. Modify frontend (hot-reload) or Rust backend (auto-rebuild)
3. Test IPC commands
4. Build for distribution: cargo tauri build
```

### Example Session

```
You: "Add a file picker that reads a CSV and displays it in a table"

Claude Code:
  1. Creates a Rust command for file dialog + CSV parsing (Serena)
  2. Registers the command in lib.rs
  3. Adds capability permissions for file dialog
  4. Creates a frontend table component
  5. Wires the IPC invoke call
  6. Tests via cargo tauri dev
```

---

## IPC Patterns

Tauri v2 uses a command-based IPC system between the Rust backend and the web frontend.

### Commands (Frontend → Backend)

```rust
// src-tauri/src/commands.rs
#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
```

Register commands:

```rust
// src-tauri/src/lib.rs
tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![read_file, greet])
    .run(tauri::generate_context!())
    .expect("error running app");
```

Call from frontend:

```typescript
import { invoke } from "@tauri-apps/api/core";

const content = await invoke<string>("read_file", { path: "/tmp/data.csv" });
const greeting = await invoke<string>("greet", { name: "World" });
```

### Events (Backend → Frontend)

```rust
// Emit from Rust
app_handle.emit("download-progress", ProgressPayload { percent: 50 })?;
```

```typescript
// Listen in frontend
import { listen } from "@tauri-apps/api/event";

const unlisten = await listen<{ percent: number }>("download-progress", (event) => {
  console.log(`Progress: ${event.payload.percent}%`);
});
```

### Typed Payloads

Always define types on both sides:

```rust
#[derive(serde::Serialize, serde::Deserialize)]
struct FileEntry {
    name: String,
    size: u64,
    is_dir: bool,
}

#[tauri::command]
async fn list_directory(path: String) -> Result<Vec<FileEntry>, String> {
    // ...
}
```

```typescript
interface FileEntry {
  name: string;
  size: number;
  is_dir: boolean;
}

const entries = await invoke<FileEntry[]>("list_directory", { path: "/home" });
```

---

## Plugin System

### Official Plugins

| Plugin | Purpose | Install |
|--------|---------|---------|
| `tauri-plugin-dialog` | File/message dialogs | `cargo add tauri-plugin-dialog` |
| `tauri-plugin-fs` | File system access | `cargo add tauri-plugin-fs` |
| `tauri-plugin-shell` | Run system commands | `cargo add tauri-plugin-shell` |
| `tauri-plugin-store` | Persistent key-value store | `cargo add tauri-plugin-store` |
| `tauri-plugin-http` | HTTP client | `cargo add tauri-plugin-http` |
| `tauri-plugin-notification` | System notifications | `cargo add tauri-plugin-notification` |
| `tauri-plugin-clipboard-manager` | Clipboard access | `cargo add tauri-plugin-clipboard-manager` |
| `tauri-plugin-updater` | Auto-updates | `cargo add tauri-plugin-updater` |

### Registering Plugins

```rust
tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_store::Builder::default().build())
    .invoke_handler(tauri::generate_handler![/* commands */])
    .run(tauri::generate_context!())
    .expect("error running app");
```

### Custom Plugins

```rust
// src-tauri/src/my_plugin.rs
use tauri::plugin::{Builder, TauriPlugin};
use tauri::Runtime;

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("my-plugin")
        .invoke_handler(tauri::generate_handler![my_command])
        .build()
}

#[tauri::command]
fn my_command() -> String {
    "Hello from plugin".into()
}
```

---

## Security Model

Tauri v2 uses capability-based permissions. Apps must explicitly declare what they can access.

### Capabilities

```json
// src-tauri/capabilities/default.json
{
  "identifier": "default",
  "description": "Default permissions",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "dialog:default",
    "fs:default",
    "shell:allow-open"
  ]
}
```

### CSP (Content Security Policy)

Configure in `tauri.conf.json`:

```json
{
  "app": {
    "security": {
      "csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
    }
  }
}
```

### Best Practices

- Grant minimum permissions per window
- Use `deny` permissions to restrict dangerous operations
- Validate all IPC inputs on the Rust side
- Never expose `shell:allow-execute` without path restrictions
- Use `fs:scope` to restrict file access to specific directories

---

## Build and Packaging

### Development

```bash
# Start dev server with hot-reload
cargo tauri dev

# Start with specific frontend dev server
cargo tauri dev --port 3000
```

### Production Build

```bash
# Build for current platform
cargo tauri build

# Build specific format (macOS)
cargo tauri build --bundles dmg
cargo tauri build --bundles app

# Build with debug symbols
cargo tauri build --debug
```

### macOS Signing and Notarization

```bash
# Set signing identity
export APPLE_SIGNING_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"

# Set notarization credentials
export APPLE_ID="your@email.com"
export APPLE_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="TEAM_ID"

# Build will auto-sign and notarize
cargo tauri build
```

Configure in `tauri.conf.json`:

```json
{
  "bundle": {
    "macOS": {
      "signingIdentity": null,
      "entitlements": "./Entitlements.plist"
    }
  }
}
```

---

## Common Tauri Gotchas

### 1. Cargo Build Times

First build compiles all Rust dependencies. Subsequent builds are incremental.

**Fix**: Use `sccache` for faster compilation:

```bash
cargo install sccache
export RUSTC_WRAPPER=sccache
```

### 2. CSP Blocking Resources

Default CSP blocks external resources (fonts, images, API calls).

**Fix**: Update CSP in `tauri.conf.json`:

```json
"csp": "default-src 'self'; connect-src 'self' https://api.example.com; img-src 'self' https:"
```

### 3. v1 vs v2 API Differences

Tauri v2 has breaking changes from v1. Common migrations:

| v1 | v2 |
|----|-----|
| `tauri::command` (sync by default) | Same, but async recommended |
| `tauri.conf.json > tauri > allowlist` | `capabilities/*.json` |
| `@tauri-apps/api/tauri` | `@tauri-apps/api/core` |
| `appDir()` | `appDataDir()` (from `@tauri-apps/api/path`) |

### 4. Path Handling (Cross-Platform)

Use Tauri's path APIs instead of hardcoded paths:

```typescript
import { appDataDir, join } from "@tauri-apps/api/path";

const dataDir = await appDataDir();
const filePath = await join(dataDir, "config.json");
```

### 5. WebView Differences

macOS uses WebKit (WKWebView), Windows uses WebView2, Linux uses webkit2gtk. Test on all target platforms for CSS/JS compatibility.

---

## Recommended Workflow by Task Type

| Task | Tools | Approach |
|------|-------|----------|
| New IPC command | Serena + Write + Bash | Create Rust handler, register, wire frontend, `cargo tauri dev` |
| Frontend component | Write + Edit | Create component, test with hot-reload |
| Add Tauri plugin | Bash + Edit | `cargo add`, register in lib.rs, add capabilities |
| Fix Rust bug | Serena + Read + Edit + Bash | Navigate symbol, read, edit, `cargo check` |
| Package for release | Bash | `cargo tauri build --bundles dmg` |
| Security audit | Read + Grep | Check capabilities, CSP, IPC input validation |

---

## See Also

- [setup-guide.md](../setup-guide.md) - MCP installation instructions
- [tauri-subagent.md](tauri-subagent.md) - Tauri specialist subagent definition
- [tauri-claude-md-template.md](tauri-claude-md-template.md) - CLAUDE.md template for Tauri projects
- [10-subagents/guide.md](../../10-subagents/guide.md) - General subagent creation guide
