# iOS Development Guide

**Workflows and best practices for iOS development with Claude Code and MCP servers.**

---

## Overview

Claude Code integrates with iOS development through two MCP servers:

| MCP Server | Tools | Purpose |
|------------|-------|---------|
| **XcodeBuildMCP** | 59 | Build, test, scheme management, project queries |
| **xclaude-plugin** | 24 | Xcode editor integration, 87% token savings |

Plus **mobile-mcp** for simulator control (screenshots, gestures, logs).

---

## Core Workflow: Build-Test-Verify Loop

The recommended iOS development loop with Claude Code:

```
1. Write/modify Swift code
2. Build via XcodeBuildMCP
3. Run on simulator via mobile-mcp
4. Take screenshot to verify UI
5. Run tests via XcodeBuildMCP
6. Iterate
```

### Example Session

```
You: "Add a settings screen with toggle for dark mode"

Claude Code:
  1. Reads existing navigation structure (Serena)
  2. Creates SettingsView.swift with SwiftUI
  3. Builds project (XcodeBuildMCP: xcodebuild)
  4. Launches simulator (mobile-mcp: boot simulator)
  5. Navigates to settings (mobile-mcp: tap)
  6. Takes screenshot (mobile-mcp: screenshot)
  7. Verifies UI matches requirements
  8. Runs tests (XcodeBuildMCP: test)
```

---

## SwiftUI View Verification

When working with SwiftUI views, follow this pattern:

### 1. Write the View

```swift
struct SettingsView: View {
    @AppStorage("isDarkMode") private var isDarkMode = false

    var body: some View {
        Form {
            Toggle("Dark Mode", isOn: $isDarkMode)
        }
        .navigationTitle("Settings")
    }
}
```

### 2. Build and Verify

```
"Build the project and take a screenshot of the settings screen"
```

Claude Code will:
- Build via `xcodebuild` through XcodeBuildMCP
- Boot simulator via mobile-mcp
- Navigate to the screen
- Capture screenshot for visual verification

### 3. Preview Verification

For SwiftUI previews, use xclaude-plugin to render previews directly in Xcode without full builds.

---

## Safe .pbxproj Handling

**Never edit `.pbxproj` files directly with Claude Code.** These are Xcode-managed binary-like files that break easily.

### Safe Operations

| Operation | Method |
|-----------|--------|
| Add a new Swift file | Create the `.swift` file, then use XcodeBuildMCP to add it to the target |
| Add a framework | Use Swift Package Manager via `Package.swift` or XcodeBuildMCP |
| Change build settings | Use XcodeBuildMCP tools or `xcconfig` files |
| Add a target | Use XcodeBuildMCP's project management tools |

### Unsafe Operations (Avoid)

- Editing `.pbxproj` with text editors or Claude Code's Edit tool
- Manual UUID generation for project references
- Direct manipulation of build phases in the project file

### If .pbxproj Breaks

```bash
# Revert to last working state
git checkout -- YourProject.xcodeproj/project.pbxproj

# Or resolve in Xcode
# Open Xcode > File > Resolve Package Versions
```

---

## Simulator Testing with XcodeBuildMCP

### Available Commands

```
# Build for simulator
"Build MyApp for iPhone 16 simulator"

# Run tests
"Run all unit tests for MyApp"

# Run specific test
"Run tests in MyAppTests/SettingsViewTests"

# List schemes
"List all available schemes"

# Clean build
"Clean and rebuild MyApp"
```

### Simulator Control via mobile-mcp

```
# Boot simulator
"Boot the iPhone 16 Pro simulator"

# Install and launch
"Install and launch MyApp on the booted simulator"

# Take screenshot
"Take a screenshot of the current screen"

# Interact
"Tap the Settings tab bar item"
"Scroll down in the settings list"
"Type 'John' in the name field"
```

---

## xclaude-plugin Token Savings

xclaude-plugin reduces token usage by 87% by keeping context in Xcode rather than sending full file contents to Claude Code.

### How It Works

```
Without xclaude-plugin:
  Claude Code reads entire file (1000 tokens)
  Claude Code writes entire file back (1000 tokens)
  Total: 2000 tokens

With xclaude-plugin:
  Claude Code sends edit instructions (130 tokens)
  xclaude-plugin applies in Xcode (130 tokens)
  Total: 260 tokens (87% savings)
```

### When to Use

- **Use xclaude-plugin**: For editing existing files, refactoring, small changes
- **Use standard tools**: For creating new files, reading full architecture

---

## Common iOS Gotchas

### 1. Signing Issues

Claude Code cannot manage code signing. If builds fail with signing errors:

```
"Build failed: Signing requires a development team"
```

**Fix**: Set signing team in Xcode manually, then retry the build.

### 2. SwiftUI Preview Crashes

Previews may crash with incomplete data. Always provide preview data:

```swift
#Preview {
    SettingsView()
        .environment(\.managedObjectContext, PersistenceController.preview.container.viewContext)
}
```

### 3. Async/Await Context

Claude Code should use `@MainActor` for UI-related async code:

```swift
@MainActor
class SettingsViewModel: ObservableObject {
    @Published var settings: [Setting] = []

    func loadSettings() async {
        settings = await settingsService.fetchAll()
    }
}
```

### 4. SPM Resolution

After adding Swift Package dependencies, resolution happens at build time. If packages fail to resolve:

```bash
# Reset package caches
rm -rf ~/Library/Caches/org.swift.swiftpm
rm -rf .build

# Resolve in Xcode
# File > Packages > Reset Package Caches
```

### 5. Simulator State

Simulator state persists between runs. For clean testing:

```
"Erase all content and settings on the booted simulator"
```

---

## Recommended Workflow by Task Type

| Task | Tools | Approach |
|------|-------|----------|
| New SwiftUI view | Serena + Write + XcodeBuildMCP | Read existing views, create new file, build to verify |
| Fix a bug | Serena + Read + Edit + XcodeBuildMCP | Navigate to symbol, read body, edit, build and test |
| Add SPM dependency | XcodeBuildMCP | Use project management tools to add package |
| UI polish | mobile-mcp + Edit | Screenshot, identify issues, edit, re-screenshot |
| Write tests | Serena + Write + XcodeBuildMCP | Read code under test, create test file, run tests |
| Refactor | xclaude-plugin + Serena | Use xclaude for edits, Serena for finding references |

---

## See Also

- [setup-guide.md](../setup-guide.md) - MCP installation instructions
- [ios-subagent.md](ios-subagent.md) - iOS specialist subagent definition
- [ios-claude-md-template.md](ios-claude-md-template.md) - CLAUDE.md template for iOS projects
- [10-subagents/guide.md](../../10-subagents/guide.md) - General subagent creation guide
