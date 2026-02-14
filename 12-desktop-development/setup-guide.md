# Desktop MCP Setup Guide

**Step-by-step MCP server installation for macOS, Tauri, and Electron.**

---

## Prerequisites

- Claude Code installed and working
- At least one desktop development environment set up:
  - **macOS**: macOS with Xcode 16.0+
  - **Tauri**: Rust 1.77+, Tauri CLI 2.x, Node.js 18+
  - **Electron**: Node.js 18+, npm or yarn

---

## macOS

macOS native development uses the same MCP servers as iOS development (XcodeBuildMCP and xclaude-plugin) but targets macOS destinations instead of iOS simulators.

### Step 1: Install XcodeBuildMCP (Primary)

XcodeBuildMCP provides 59 tools for Xcode project management, building, and testing.

```bash
# Install globally (user scope)
claude mcp add xcodebuildmcp -- npx -y xcodebuildmcp@latest
```

### Step 2: Install xclaude-plugin (Optional)

xclaude-plugin provides 24 tools with 87% token savings via Xcode integration.

```bash
# Install the Xcode extension
# Download from: https://github.com/anthropics/xclaude-plugin/releases
# Open xclaude-plugin.app and follow the installation wizard

# Register MCP
claude mcp add xclaude -- npx -y xclaude-plugin@latest
```

### Step 3: Verify

```bash
claude mcp list
# Expected:
# xcodebuildmcp   user   stdio   npx -y xcodebuildmcp@latest
# xclaude         user   stdio   npx -y xclaude-plugin@latest (optional)
```

### Step 4: Create CLAUDE.md

```bash
cp /path/to/ai-prompts/12-desktop-development/macos/macos-claude-md-template.md ./CLAUDE.md
# Edit to match your project
```

---

## Tauri

Tauri v2 development uses tauri-plugin-mcp (integrated into the app at dev time) and optionally tauri-mcp-server for external debugging.

### Step 1: Install tauri-plugin-mcp (Primary)

tauri-plugin-mcp integrates into your Tauri app as a plugin, providing screenshot capture, DOM inspection, and window management during development.

```bash
# Add to your Tauri project via Cargo
cd src-tauri
cargo add tauri-plugin-mcp

# Register the plugin in your Tauri app (src-tauri/src/lib.rs)
# tauri::Builder::default()
#     .plugin(tauri_plugin_mcp::init())

# Register MCP with Claude Code (connects to running dev app)
claude mcp add tauri-mcp --transport http http://localhost:3456/mcp
```

### Step 2: Install tauri-mcp-server (Optional)

tauri-mcp-server provides external debugging capabilities independent of the running app.

```bash
# Install via npm
claude mcp add tauri-debug -- npx -y tauri-mcp-server@latest
```

### Step 3: Verify

```bash
claude mcp list
# Expected:
# tauri-mcp       user   http    http://localhost:3456/mcp
# tauri-debug     user   stdio   npx -y tauri-mcp-server@latest (optional)

# Verify Tauri CLI
cargo tauri --version
# Expected: tauri-cli 2.x.x
```

### Step 4: Create CLAUDE.md

```bash
cp /path/to/ai-prompts/12-desktop-development/tauri/tauri-claude-md-template.md ./CLAUDE.md
# Edit to match your project
```

---

## Electron

Electron development uses electron-mcp-server for UI automation and DevTools access, and optionally electron-playwright-mcp for end-to-end testing.

### Step 1: Install electron-mcp-server (Primary)

electron-mcp-server provides UI automation, DevTools integration, and window management for Electron apps.

```bash
# Install via npm
claude mcp add electron-mcp -- npx -y electron-mcp-server@latest
```

### Step 2: Install electron-playwright-mcp (Optional)

electron-playwright-mcp provides Playwright-based testing for Electron apps.

```bash
# Install Playwright Electron support in your project
npm install --save-dev @playwright/test electron

# Register MCP
claude mcp add electron-playwright -- npx -y electron-playwright-mcp@latest
```

### Step 3: Verify

```bash
claude mcp list
# Expected:
# electron-mcp          user   stdio   npx -y electron-mcp-server@latest
# electron-playwright   user   stdio   npx -y electron-playwright-mcp@latest (optional)

# Verify Electron
npx electron --version
# Expected: v30.x.x or later
```

### Step 4: Create CLAUDE.md

```bash
cp /path/to/ai-prompts/12-desktop-development/electron/electron-claude-md-template.md ./CLAUDE.md
# Edit to match your project
```

---

## Multi-Framework Projects

If your project uses multiple desktop frameworks (e.g., Tauri app with a macOS-native companion):

```bash
# Register all needed MCPs
claude mcp add xcodebuildmcp -- npx -y xcodebuildmcp@latest       # macOS native
claude mcp add tauri-mcp --transport http http://localhost:3456/mcp  # Tauri dev
claude mcp add electron-mcp -- npx -y electron-mcp-server@latest    # Electron

# All MCPs coexist - Claude Code selects the right one per task
```

---

## Troubleshooting

### "XcodeBuildMCP build failed for macOS target"

```bash
# Ensure Xcode command line tools are installed
xcode-select --install

# Verify macOS SDK is available
xcrun --show-sdk-path --sdk macosx
# Expected: /Applications/Xcode.app/.../MacOSX.sdk

# Check that the project has a macOS scheme
xcodebuild -list | grep -i mac
```

### "tauri-plugin-mcp connection refused"

```bash
# Ensure the Tauri dev server is running
cargo tauri dev

# Check that the MCP plugin is registered in src-tauri/src/lib.rs
grep "tauri_plugin_mcp" src-tauri/src/lib.rs

# Verify the MCP port (default: 3456)
curl -I http://localhost:3456/mcp
```

### "electron-mcp-server cannot find app"

```bash
# Ensure the Electron app is running in development mode
npm start
# or
npx electron .

# Verify the app exposes DevTools protocol
# Check main process for: app.commandLine.appendSwitch('remote-debugging-port', '9222')
```

### "Tauri cargo build takes too long"

```bash
# Use sccache for faster Rust compilation
cargo install sccache
export RUSTC_WRAPPER=sccache

# Or enable incremental compilation (default in dev)
# Ensure CARGO_INCREMENTAL=1 is set

# Use --dev flag during development (skip optimizations)
cargo tauri dev  # Already uses dev profile
```

### "Electron app too large"

```bash
# Check bundle size
du -sh dist/

# Use electron-builder with compression
# In package.json: "build": { "compression": "maximum" }

# Exclude unnecessary files in package.json
# "files": ["dist/**/*", "main/**/*", "preload/**/*"]
```

---

## Performance Tips

1. **Start with primary MCP only** - Add secondary MCPs as needed to reduce startup time
2. **Use project scope for build MCPs** - Register build MCPs at project scope if they differ per project
3. **Tauri: Use sccache** - Rust compilation benefits significantly from build caching
4. **Electron: Minimize dependencies** - Fewer node_modules means faster rebuilds and smaller bundles
5. **Combine with Serena** - Use platform MCPs for build/run, Serena for code navigation
