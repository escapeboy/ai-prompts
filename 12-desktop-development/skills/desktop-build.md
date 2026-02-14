---
name: desktop-build
description: Cross-platform desktop build skill - auto-detects platform and builds for macOS, Tauri, or Electron
version: 1.0.0
---

# Desktop Build

Build desktop applications across macOS native, Tauri, and Electron with automatic platform detection.

---

## Usage

```
/desktop-build [platform] [options]
```

### Quick Examples

```bash
/desktop-build                        # Auto-detect platform and build debug
/desktop-build macos                  # Build macOS native
/desktop-build tauri --release        # Build Tauri release
/desktop-build electron --clean       # Clean build Electron
/desktop-build macos --target=x86_64  # Build macOS for Intel
```

---

## Actions

### 1. Auto-Detect Platform (Default)

When invoked without a platform argument, detect the platform from project files:

**Detection rules**:
- `*.xcodeproj` or `*.xcworkspace` (without `ios/` subdirectory) → **macOS**
- `src-tauri/tauri.conf.json` → **Tauri**
- `electron` in `package.json` dependencies → **Electron**
- If `*.xcodeproj` exists with `ios/` subdirectory, this is an iOS project — use `/mobile-build` instead

**Process**:
1. Scan project root for platform indicator files
2. Identify platform
3. Run the platform-specific build action
4. Report build result

---

### 2. macOS Build

**Usage**:
```
/desktop-build macos [options]
```

**Process**:
1. Identify scheme: `xcodebuild -list` or use XcodeBuildMCP
2. Build: `xcodebuild -scheme [Scheme] -destination 'platform=macOS,arch=arm64' build`
3. Report success/failure with build time

**Options**:
- `--release` - Build release configuration
- `--target=ARCH` - Target architecture: `arm64` (default), `x86_64`, `universal`
- `--clean` - Clean before building

**Example**:
```
/desktop-build macos --release --target=universal
```

---

### 3. Tauri Build

**Usage**:
```
/desktop-build tauri [options]
```

**Process**:
1. Run `cargo tauri build` (or `cargo tauri dev` for debug)
2. For release: produces DMG/app bundle in `src-tauri/target/release/bundle/`
3. Report success/failure with output location

**Options**:
- `--release` - Build release (default for `cargo tauri build`)
- `--bundles=FORMAT` - Output format: `dmg`, `app`, `updater` (macOS)
- `--clean` - Run `cargo clean` first
- `--verbose` - Show full Cargo output

**Example**:
```
/desktop-build tauri --bundles=dmg
```

---

### 4. Electron Build

**Usage**:
```
/desktop-build electron [options]
```

**Process**:
1. Detect build tool: `forge.config.ts` → Forge, `electron-builder.yml` → Builder
2. **Forge**: `npm run make`
3. **Builder**: `npm run dist`
4. Report success/failure with output location

**Options**:
- `--release` - Build production (default for make/dist)
- `--clean` - Remove `out/` or `dist/` first
- `--target=PLATFORM` - Target platform: `darwin`, `win32`, `linux`
- `--verbose` - Show full build output

**Example**:
```
/desktop-build electron --target=darwin
```

---

## Options

### Flags (Boolean)

| Flag | Short | Description |
|------|-------|-------------|
| `--release` | `-r` | Build in release/production mode |
| `--clean` | `-c` | Clean build artifacts before building |
| `--verbose` | `-v` | Show detailed build output |

### Options (With Values)

| Option | Description | Default |
|--------|-------------|---------|
| `--target=VALUE` | Target arch (macOS: arm64/x86_64) or platform (Electron: darwin/win32/linux) | Current platform |
| `--bundles=FORMAT` | Tauri bundle format (dmg, app, updater) | All |

---

## Token Optimization

**Estimated token usage**:
- Auto-detect + build: ~3K tokens
- Platform-specific build: ~2K tokens
- Clean + build: ~3.5K tokens

**Optimization features**:
- Auto-detects platform to avoid unnecessary file reads
- Uses MCP tools when available (XcodeBuildMCP) for lower-token builds
- Reports only build result summary, not full build log
- Disambiguates from mobile projects (checks for `ios/` subdirectory)

---

## Error Handling

### Error: "No platform detected"

**Symptom**: `/desktop-build` cannot identify the platform

**Cause**: Project root doesn't contain recognizable platform files

**Solution**: Specify platform explicitly: `/desktop-build macos`

### Error: "Build failed"

**Symptom**: Build command returns non-zero exit code

**Cause**: Compilation errors, missing dependencies, or configuration issues

**Solution**: Check build output for specific error. Common fixes:
- macOS: `xcode-select --install`, check signing team
- Tauri: `cargo check` for Rust errors, check `tauri.conf.json`
- Electron: `npm install` for missing deps, check forge/builder config

### Error: "Detected iOS project, not macOS"

**Symptom**: `/desktop-build` detects an iOS project instead of macOS

**Cause**: Project has `ios/` subdirectory alongside `.xcodeproj`

**Solution**: Use `/desktop-build macos` to force macOS, or use `/mobile-build ios` for iOS

---

## See Also

- [desktop-test.md](desktop-test.md) - Cross-platform test skill
- [../setup-guide.md](../setup-guide.md) - MCP server installation
- [03-custom-skills/guide.md](../../03-custom-skills/guide.md) - How to create skills
