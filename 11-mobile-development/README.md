# Mobile Development with Claude Code

**Connect Claude Code with native and cross-platform mobile development toolchains via MCP servers.**

This section covers iOS (Swift/SwiftUI), Android (Kotlin/Jetpack Compose), React Native, and Flutter development with Claude Code. Each platform has dedicated MCP servers, subagent definitions, and CLAUDE.md templates.

---

## Platform Comparison

| Platform | Language | UI Framework | Primary MCP | Secondary MCP | Device Control |
|----------|----------|-------------|-------------|---------------|----------------|
| **iOS** | Swift | SwiftUI / UIKit | XcodeBuildMCP (59 tools, stdio) | xclaude-plugin (24 tools) | mobile-mcp |
| **Android** | Kotlin | Jetpack Compose / Views | JetBrains MCP (built-in AS 2025.2+) | android-mcp-server (ADB, stdio) | mobile-mcp |
| **React Native** | TypeScript | React Native / Expo | Expo MCP (EAS Build/Update) | — | mobile-mcp |
| **Flutter** | Dart | Flutter Widgets | Dart/Flutter MCP (Dart SDK 3.9+) | Flutter MCP (docs), DCM MCP (lint) | mobile-mcp |

**mobile-mcp** is shared across all platforms for simulator/emulator/device control.

---

## Quick Start

```bash
# 1. Choose your platform and follow the platform-specific guide
#    ios/ios-guide.md | android/android-guide.md | react-native/react-native-guide.md | flutter/flutter-guide.md

# 2. Install MCP servers (see setup-guide.md for all platforms)
#    Example for iOS:
claude mcp add xcodebuildmcp -- npx -y xcodebuildmcp@latest

# 3. Copy the CLAUDE.md template to your project
#    Example for iOS:
cp 11-mobile-development/ios/ios-claude-md-template.md ./CLAUDE.md
```

See [setup-guide.md](setup-guide.md) for detailed installation instructions for all platforms.

---

## Files in This Section

| File | Description |
|------|-------------|
| [setup-guide.md](setup-guide.md) | MCP server installation for all 4 platforms |
| **iOS** | |
| [ios/ios-guide.md](ios/ios-guide.md) | iOS workflows and best practices |
| [ios/ios-subagent.md](ios/ios-subagent.md) | iOS specialist subagent definition |
| [ios/ios-claude-md-template.md](ios/ios-claude-md-template.md) | CLAUDE.md template for Swift/SwiftUI projects |
| **Android** | |
| [android/android-guide.md](android/android-guide.md) | Android workflows and best practices |
| [android/android-subagent.md](android/android-subagent.md) | Android specialist subagent definition |
| [android/android-claude-md-template.md](android/android-claude-md-template.md) | CLAUDE.md template for Kotlin/Compose projects |
| **React Native** | |
| [react-native/react-native-guide.md](react-native/react-native-guide.md) | React Native workflows and best practices |
| [react-native/react-native-subagent.md](react-native/react-native-subagent.md) | React Native specialist subagent definition |
| [react-native/react-native-claude-md-template.md](react-native/react-native-claude-md-template.md) | CLAUDE.md template for RN/Expo projects |
| **Flutter** | |
| [flutter/flutter-guide.md](flutter/flutter-guide.md) | Flutter workflows and best practices |
| [flutter/flutter-subagent.md](flutter/flutter-subagent.md) | Flutter specialist subagent definition |
| [flutter/flutter-claude-md-template.md](flutter/flutter-claude-md-template.md) | CLAUDE.md template for Flutter/Dart projects |
| **Skills** | |
| [skills/mobile-build.md](skills/mobile-build.md) | `/mobile-build` cross-platform build skill |
| [skills/mobile-test.md](skills/mobile-test.md) | `/mobile-test` cross-platform test skill |

---

## How It Fits Together

```
Claude Code Session
    |
    +-- Platform MCP (per-project)
    |     +-- iOS: XcodeBuildMCP / xclaude-plugin
    |     +-- Android: JetBrains MCP / android-mcp-server
    |     +-- React Native: Expo MCP
    |     +-- Flutter: Dart/Flutter MCP / Flutter MCP / DCM MCP
    |
    +-- mobile-mcp (shared, user scope)
    |     +-- Simulator / emulator control
    |     +-- Device screenshots, gestures, logs
    |
    +-- Serena MCP (code intelligence)
    |     +-- Symbols, references, navigation
    |
    +-- CLAUDE.md (project conventions)
          +-- Platform-specific patterns
          +-- Architecture decisions
```

**Combined benefit**: Claude Code can build and run your app (platform MCP), control simulators/devices (mobile-mcp), navigate code symbolically (Serena), and follow your project conventions (CLAUDE.md).

---

## Compatibility

| Requirement | Version |
|-------------|---------|
| **Claude Code** | All versions with MCP support |
| **Models** | Opus 4.6, Sonnet 4.5, Haiku 4.5 |
| **Xcode** | 16.0+ (iOS) |
| **Android Studio** | 2025.2+ (Android, for JetBrains MCP) |
| **Node.js** | 18+ (React Native, XcodeBuildMCP) |
| **Dart SDK** | 3.9+ (Flutter, for official MCP) |
| **Flutter** | 3.29+ |
