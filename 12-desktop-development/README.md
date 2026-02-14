# Desktop Development with Claude Code

**Connect Claude Code with native and cross-platform desktop development toolchains via MCP servers.**

This section covers macOS native (SwiftUI/AppKit), Tauri (Rust + Web), and Electron (Node.js + Chromium) development with Claude Code. Each platform has dedicated MCP servers, subagent definitions, and CLAUDE.md templates.

---

## Platform Comparison

| Platform | Language | UI Framework | Primary MCP | Secondary MCP | Typical App Size |
|----------|----------|-------------|-------------|---------------|------------------|
| **macOS** | Swift | SwiftUI / AppKit | XcodeBuildMCP (59 tools, stdio) | xclaude-plugin (24 tools) | 5-30 MB |
| **Tauri** | Rust + JS/TS | Web (React/Vue/Svelte) | tauri-plugin-mcp (screenshots, DOM) | tauri-mcp-server (external debug) | 2-10 MB |
| **Electron** | JS/TS | Web (React/Vue/Svelte) | electron-mcp-server (UI, DevTools) | electron-playwright-mcp (testing) | 80-200 MB |

**No shared MCP** across platforms (unlike mobile-mcp in section 11). Each desktop platform uses its own MCP servers.

---

## Quick Start

```bash
# 1. Choose your platform and follow the platform-specific guide
#    macos/macos-guide.md | tauri/tauri-guide.md | electron/electron-guide.md

# 2. Install MCP servers (see setup-guide.md for all platforms)
#    Example for macOS:
claude mcp add xcodebuildmcp -- npx -y xcodebuildmcp@latest

# 3. Copy the CLAUDE.md template to your project
#    Example for macOS:
cp 12-desktop-development/macos/macos-claude-md-template.md ./CLAUDE.md
```

See [setup-guide.md](setup-guide.md) for detailed installation instructions for all platforms.

---

## Files in This Section

| File | Description |
|------|-------------|
| [setup-guide.md](setup-guide.md) | MCP server installation for all 3 platforms |
| **macOS** | |
| [macos/macos-guide.md](macos/macos-guide.md) | macOS native workflows and best practices |
| [macos/macos-subagent.md](macos/macos-subagent.md) | macOS specialist subagent definition |
| [macos/macos-claude-md-template.md](macos/macos-claude-md-template.md) | CLAUDE.md template for macOS projects |
| **Tauri** | |
| [tauri/tauri-guide.md](tauri/tauri-guide.md) | Tauri v2 workflows and best practices |
| [tauri/tauri-subagent.md](tauri/tauri-subagent.md) | Tauri specialist subagent definition |
| [tauri/tauri-claude-md-template.md](tauri/tauri-claude-md-template.md) | CLAUDE.md template for Tauri projects |
| **Electron** | |
| [electron/electron-guide.md](electron/electron-guide.md) | Electron workflows and best practices |
| [electron/electron-subagent.md](electron/electron-subagent.md) | Electron specialist subagent definition |
| [electron/electron-claude-md-template.md](electron/electron-claude-md-template.md) | CLAUDE.md template for Electron projects |
| **Skills** | |
| [skills/desktop-build.md](skills/desktop-build.md) | `/desktop-build` cross-platform build skill |
| [skills/desktop-test.md](skills/desktop-test.md) | `/desktop-test` cross-platform test skill |

---

## How It Fits Together

```
Claude Code Session
    |
    +-- Platform MCP (per-project)
    |     +-- macOS: XcodeBuildMCP / xclaude-plugin
    |     +-- Tauri: tauri-plugin-mcp / tauri-mcp-server
    |     +-- Electron: electron-mcp-server / electron-playwright-mcp
    |
    +-- Serena MCP (code intelligence)
    |     +-- Symbols, references, navigation
    |
    +-- CLAUDE.md (project conventions)
          +-- Platform-specific patterns
          +-- Architecture decisions
```

**Combined benefit**: Claude Code can build and package your desktop app (platform MCP), navigate code symbolically (Serena), and follow your project conventions (CLAUDE.md).

---

## Compatibility

| Requirement | Version |
|-------------|---------|
| **Claude Code** | All versions with MCP support |
| **Models** | Opus 4.6, Sonnet 4.5, Haiku 4.5 |
| **Xcode** | 16.0+ (macOS native) |
| **Rust** | 1.77+ (Tauri) |
| **Tauri CLI** | 2.x (Tauri) |
| **Node.js** | 18+ (Electron, XcodeBuildMCP) |
| **Electron** | 30+ (Electron) |
