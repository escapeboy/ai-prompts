# Mobile MCP Setup Guide

**Step-by-step MCP server installation for iOS, Android, React Native, and Flutter.**

---

## Prerequisites

- Claude Code installed and working
- At least one mobile development environment set up:
  - **iOS**: macOS with Xcode 16.0+
  - **Android**: Android Studio 2025.2+ with ADB
  - **React Native**: Node.js 18+, Expo CLI or React Native CLI
  - **Flutter**: Dart SDK 3.9+, Flutter 3.29+

---

## Shared: mobile-mcp (All Platforms)

mobile-mcp provides simulator/emulator/device control across all platforms. Install once, use everywhere.

### Install

```bash
# Install mobile-mcp (user scope - available in all projects)
claude mcp add --scope user mobile-mcp -- npx -y @anthropic/mobile-mcp@latest
```

### Verify

```bash
claude mcp list
# Expected: mobile-mcp   user   stdio   npx -y @anthropic/mobile-mcp@latest
```

### Capabilities

- Boot/shutdown simulators and emulators
- Take screenshots
- Tap, swipe, scroll gestures
- Read device logs
- Install/launch apps

---

## iOS

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
# mobile-mcp      user   stdio   npx -y @anthropic/mobile-mcp@latest
```

### Step 4: Create CLAUDE.md

```bash
cp /path/to/ai-prompts/11-mobile-development/ios/ios-claude-md-template.md ./CLAUDE.md
# Edit to match your project
```

---

## Android

### Step 1: Enable JetBrains MCP (Primary)

JetBrains MCP is built into Android Studio 2025.2+. No separate installation needed.

```
1. Open Android Studio 2025.2+
2. Go to Settings > Tools > AI Assistant
3. Enable "MCP Server" toggle
4. The MCP server starts automatically when AS is running
```

Register in Claude Code:

```bash
# JetBrains MCP uses HTTP transport
claude mcp add --transport http jetbrains-mcp http://localhost:63342/mcp
```

### Step 2: Install android-mcp-server (Optional)

android-mcp-server provides ADB device control for builds and deployment.

```bash
# Install via npm
claude mcp add android-mcp -- npx -y android-mcp-server@latest
```

### Step 3: Verify

```bash
claude mcp list
# Expected:
# jetbrains-mcp   user   http    http://localhost:63342/mcp
# android-mcp     user   stdio   npx -y android-mcp-server@latest (optional)
# mobile-mcp      user   stdio   npx -y @anthropic/mobile-mcp@latest

# Verify ADB connection
adb devices
```

### Step 4: Create CLAUDE.md

```bash
cp /path/to/ai-prompts/11-mobile-development/android/android-claude-md-template.md ./CLAUDE.md
# Edit to match your project
```

---

## React Native

### Step 1: Install Expo MCP (Primary)

Expo MCP provides EAS Build, Update, and project management tools.

```bash
# Install Expo MCP
claude mcp add expo-mcp -- npx -y @expo/mcp@latest
```

### Step 2: Authenticate with Expo

```bash
# Login to Expo (required for EAS features)
npx expo login

# Verify authentication
npx expo whoami
```

### Step 3: Verify

```bash
claude mcp list
# Expected:
# expo-mcp        user   stdio   npx -y @expo/mcp@latest
# mobile-mcp      user   stdio   npx -y @anthropic/mobile-mcp@latest
```

### Step 4: Create CLAUDE.md

```bash
cp /path/to/ai-prompts/11-mobile-development/react-native/react-native-claude-md-template.md ./CLAUDE.md
# Edit to match your project
```

---

## Flutter

### Step 1: Install Dart/Flutter MCP (Primary)

The official Dart/Flutter MCP is included with Dart SDK 3.9+.

```bash
# Enable the built-in MCP server
claude mcp add dart-mcp -- dart language-server --protocol=mcp
```

### Step 2: Install Flutter MCP (Optional - Docs)

Flutter MCP provides documentation for 50,000+ pub.dev packages.

```bash
# Install Flutter docs MCP
claude mcp add flutter-mcp -- npx -y flutter-mcp@latest
```

### Step 3: Install DCM MCP (Optional - Lint)

DCM (Dart Code Metrics) MCP provides 450+ lint rules.

```bash
# Install DCM
dart pub global activate dart_code_metrics

# Register DCM MCP
claude mcp add dcm-mcp -- dcm mcp-server
```

### Step 4: Verify

```bash
claude mcp list
# Expected:
# dart-mcp        user   stdio   dart language-server --protocol=mcp
# flutter-mcp     user   stdio   npx -y flutter-mcp@latest (optional)
# dcm-mcp         user   stdio   dcm mcp-server (optional)
# mobile-mcp      user   stdio   npx -y @anthropic/mobile-mcp@latest
```

### Step 5: Create CLAUDE.md

```bash
cp /path/to/ai-prompts/11-mobile-development/flutter/flutter-claude-md-template.md ./CLAUDE.md
# Edit to match your project
```

---

## Multi-Platform Projects

If your project targets multiple platforms (e.g., React Native for iOS + Android):

```bash
# Register platform-specific MCPs as needed
claude mcp add xcodebuildmcp -- npx -y xcodebuildmcp@latest       # iOS builds
claude mcp add android-mcp -- npx -y android-mcp-server@latest     # Android builds
claude mcp add expo-mcp -- npx -y @expo/mcp@latest                 # Expo/RN tools
claude mcp add mobile-mcp -- npx -y @anthropic/mobile-mcp@latest   # Device control

# All MCPs coexist - Claude Code selects the right one per task
```

---

## Troubleshooting

### "MCP server not found"

```bash
# Verify the server is registered
claude mcp list

# Re-add if missing
claude mcp add <name> -- <command>

# Restart Claude Code session (MCP servers load at session start)
```

### "XcodeBuildMCP build failed"

```bash
# Ensure Xcode command line tools are installed
xcode-select --install

# Verify Xcode is selected
xcode-select -p
# Expected: /Applications/Xcode.app/Contents/Developer

# Check that the project has a valid scheme
xcodebuild -list
```

### "JetBrains MCP connection refused"

```bash
# Ensure Android Studio is running
# Check the MCP port (default: 63342)
curl -I http://localhost:63342/mcp

# If port differs, update the registration
claude mcp remove jetbrains-mcp
claude mcp add --transport http jetbrains-mcp http://localhost:<actual-port>/mcp
```

### "Expo MCP authentication error"

```bash
# Re-login to Expo
npx expo logout
npx expo login

# Verify authentication
npx expo whoami
```

### "Dart MCP not available"

```bash
# Check Dart SDK version (must be 3.9+)
dart --version

# Update Dart SDK
# macOS: brew upgrade dart-sdk
# Or update Flutter: flutter upgrade
```

### "mobile-mcp cannot find simulator"

```bash
# iOS: Check available simulators
xcrun simctl list devices

# Android: Check available emulators
emulator -list-avds

# Boot a simulator/emulator first, then retry
```

---

## Performance Tips

1. **Start with primary MCP only** - Add secondary MCPs as needed to reduce startup time
2. **Use project scope for build MCPs** - Register build MCPs at project scope if they differ per project
3. **mobile-mcp at user scope** - Keep device control available globally
4. **Close unused IDEs** - JetBrains MCP requires Android Studio running; close it when working on iOS
5. **Combine with Serena** - Use platform MCPs for build/run, Serena for code navigation
