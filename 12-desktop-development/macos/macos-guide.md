# macOS Development Guide

**Workflows and best practices for macOS native development with Claude Code and MCP servers.**

---

## Overview

Claude Code integrates with macOS development through two MCP servers:

| MCP Server | Tools | Purpose |
|------------|-------|---------|
| **XcodeBuildMCP** | 59 | Build, test, scheme management, project queries |
| **xclaude-plugin** | 24 | Xcode editor integration, 87% token savings |

These are the same servers used for iOS development (see [11-mobile-development](../../11-mobile-development/)), but target macOS destinations (`platform=macOS,arch=arm64`) instead of iOS simulators.

---

## Core Workflow: Build-Test-Verify Loop

The recommended macOS development loop with Claude Code:

```
1. Write/modify Swift code
2. Build via XcodeBuildMCP (destination: macOS)
3. Run the app locally
4. Verify behavior
5. Run tests via XcodeBuildMCP
6. Iterate
```

### Example Session

```
You: "Add a preferences window with a general tab and an appearance tab"

Claude Code:
  1. Reads existing window structure (Serena)
  2. Creates PreferencesView.swift with SwiftUI TabView
  3. Adds Settings scene to App struct
  4. Builds project (XcodeBuildMCP: xcodebuild -destination 'platform=macOS,arch=arm64')
  5. Verifies compilation succeeds
  6. Runs tests (XcodeBuildMCP: test)
```

---

## macOS Build Destinations

macOS targets differ from iOS in destination format:

```bash
# Apple Silicon Mac (primary)
xcodebuild -scheme MyApp -destination 'platform=macOS,arch=arm64' build

# Intel Mac
xcodebuild -scheme MyApp -destination 'platform=macOS,arch=x86_64' build

# Mac Catalyst (iPad app on Mac)
xcodebuild -scheme MyApp -destination 'platform=macOS,variant=Mac Catalyst' build

# Any Mac (universal)
xcodebuild -scheme MyApp -destination 'platform=macOS' build
```

When using Claude Code, specify the destination naturally:

```
"Build MyApp for macOS on Apple Silicon"
"Build MyApp as a Mac Catalyst app"
```

---

## SwiftUI for macOS

macOS SwiftUI has platform-specific constructs not available on iOS.

### Window Management

```swift
@main
struct MyApp: App {
    var body: some Scene {
        // Main window
        WindowGroup {
            ContentView()
        }

        // Preferences (Cmd+,)
        Settings {
            PreferencesView()
        }

        // Menu bar extra
        MenuBarExtra("MyApp", systemImage: "star.fill") {
            MenuBarView()
        }
        .menuBarExtraStyle(.window)
    }
}
```

### Key macOS Views

| View | Purpose |
|------|---------|
| `NavigationSplitView` | Sidebar + detail layout |
| `Table` | Multi-column sortable data |
| `Settings` | Preferences window (Cmd+,) |
| `MenuBarExtra` | Menu bar app/widget |
| `HSplitView` / `VSplitView` | Resizable split panes |
| `GroupBox` | Grouped content with label |

### Navigation Pattern

```swift
struct ContentView: View {
    @State private var selection: SidebarItem? = .general

    var body: some View {
        NavigationSplitView {
            List(SidebarItem.allCases, selection: $selection) { item in
                Label(item.title, systemImage: item.icon)
            }
            .navigationSplitViewColumnWidth(min: 180, ideal: 200)
        } detail: {
            if let selection {
                selection.detailView
            } else {
                Text("Select an item")
            }
        }
    }
}
```

---

## AppKit Integration

When SwiftUI lacks a macOS capability, bridge to AppKit.

### NSViewRepresentable

```swift
struct WebView: NSViewRepresentable {
    let url: URL

    func makeNSView(context: Context) -> WKWebView {
        WKWebView()
    }

    func updateNSView(_ webView: WKWebView, context: Context) {
        webView.load(URLRequest(url: url))
    }
}
```

### Common AppKit Bridges

| Need | AppKit Class | Bridge Pattern |
|------|-------------|----------------|
| Web content | `WKWebView` | `NSViewRepresentable` |
| Custom drawing | `NSView` (custom) | `NSViewRepresentable` |
| Toolbar customization | `NSToolbar` | `NSApplicationDelegateAdaptor` |
| Custom menus | `NSMenu` | `NSApplicationDelegateAdaptor` |
| Window access | `NSWindow` | `NSWindowDelegateAdaptor` or `NSApp.windows` |
| Drag and drop | `NSView` DnD | `onDrop()` modifier or `NSViewRepresentable` |

### NSToolbar Integration

```swift
class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        if let window = NSApp.windows.first {
            let toolbar = NSToolbar(identifier: "MainToolbar")
            toolbar.delegate = self
            toolbar.displayMode = .iconOnly
            window.toolbar = toolbar
        }
    }
}
```

---

## Safe .pbxproj Handling

**Never edit `.pbxproj` files directly with Claude Code.** These are Xcode-managed binary-like files that break easily.

| Operation | Safe Method |
|-----------|-------------|
| Add a new Swift file | Create the `.swift` file, then use XcodeBuildMCP to add it to the target |
| Add a framework | Use Swift Package Manager via `Package.swift` or XcodeBuildMCP |
| Change build settings | Use XcodeBuildMCP tools or `xcconfig` files |
| Add a target | Use XcodeBuildMCP's project management tools |

---

## Sandboxing and Entitlements

macOS apps use entitlements to declare capabilities. The App Sandbox restricts what the app can access.

### Common Entitlements

| Entitlement | Key | Purpose |
|-------------|-----|---------|
| App Sandbox | `com.apple.security.app-sandbox` | Required for Mac App Store |
| Network (client) | `com.apple.security.network.client` | Outbound network access |
| Network (server) | `com.apple.security.network.server` | Listen for connections |
| File access (user) | `com.apple.security.files.user-selected.read-write` | User-picked files |
| File access (downloads) | `com.apple.security.files.downloads.read-write` | Downloads folder |
| Camera | `com.apple.security.device.camera` | Camera access |
| Microphone | `com.apple.security.device.audio-input` | Microphone access |
| Hardened Runtime | `com.apple.security.cs.allow-unsigned-executable-memory` | JIT, FFI |

### Entitlements File

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.app-sandbox</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
</dict>
</plist>
```

### Hardened Runtime

Required for notarization. Enable in Xcode under Signing & Capabilities, or via entitlements:

```bash
# Verify hardened runtime is enabled
codesign -d --entitlements - MyApp.app
```

---

## Code Signing and Notarization

### Distribution Methods

| Method | Signing | Notarization | Gatekeeper |
|--------|---------|-------------|------------|
| **Mac App Store** | Required (App Store cert) | Handled by Apple | N/A |
| **Direct (notarized)** | Required (Developer ID) | Required | Passes |
| **Direct (unsigned)** | Optional | No | User must override |

### Notarization Workflow

```bash
# 1. Archive the app
xcodebuild archive \
  -scheme MyApp \
  -archivePath build/MyApp.xcarchive

# 2. Export the archive
xcodebuild -exportArchive \
  -archivePath build/MyApp.xcarchive \
  -exportPath build/export \
  -exportOptionsPlist ExportOptions.plist

# 3. Submit for notarization
xcrun notarytool submit build/export/MyApp.app.zip \
  --apple-id "your@email.com" \
  --team-id "TEAM_ID" \
  --password "@keychain:AC_PASSWORD" \
  --wait

# 4. Staple the ticket
xcrun stapler staple build/export/MyApp.app

# 5. Verify
spctl -a -t exec -vvv build/export/MyApp.app
```

### Signing with codesign

```bash
# Sign the app
codesign --force --sign "Developer ID Application: Your Name (TEAM_ID)" \
  --options runtime \
  --entitlements MyApp.entitlements \
  MyApp.app

# Verify signature
codesign --verify --deep --strict MyApp.app
```

---

## xclaude-plugin Token Savings

xclaude-plugin reduces token usage by 87% by keeping context in Xcode rather than sending full file contents to Claude Code.

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

## Common macOS Gotchas

### 1. Signing Issues

Claude Code cannot manage code signing. If builds fail with signing errors:

```
"Build failed: Signing requires a development team"
```

**Fix**: Set signing team in Xcode manually, then retry the build.

### 2. Sandbox Denials

Sandbox violations are silent by default. Check Console.app for sandbox deny logs:

```bash
# Check recent sandbox denials
log show --predicate 'process == "MyApp" && eventMessage CONTAINS "deny"' --last 5m
```

**Fix**: Add the required entitlement to your `.entitlements` file.

### 3. Window Lifecycle

macOS apps survive all windows closing (unlike iOS). Handle this explicitly:

```swift
class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        true // Quit when last window closes
    }
}
```

### 4. Menu Bar Apps

Menu bar apps have no dock icon and no main window. Declare this in Info.plist:

```xml
<key>LSUIElement</key>
<true/>
```

Or programmatically:

```swift
NSApp.setActivationPolicy(.accessory)
```

### 5. Notarization Failures

Common notarization rejections and fixes:

| Error | Fix |
|-------|-----|
| Hardened runtime not enabled | Enable in Signing & Capabilities |
| Unsigned frameworks | Sign all embedded frameworks with `--deep` |
| Missing secure timestamp | Use `--timestamp` flag with codesign |
| Unnotarized helper tools | Submit all helper executables separately |

### 6. @available Checks

macOS version checks differ from iOS. Always check deployment target:

```swift
if #available(macOS 14.0, *) {
    // Use macOS 14+ API
} else {
    // Fallback for older versions
}
```

---

## Recommended Workflow by Task Type

| Task | Tools | Approach |
|------|-------|----------|
| New SwiftUI window | Serena + Write + XcodeBuildMCP | Read existing scenes, create new view, add to App, build |
| AppKit integration | Serena + Read + Write + XcodeBuildMCP | Read existing views, create NSViewRepresentable, build |
| Fix a bug | Serena + Read + Edit + XcodeBuildMCP | Navigate to symbol, read body, edit, build and test |
| Add SPM dependency | XcodeBuildMCP | Use project management tools to add package |
| Notarize for distribution | Bash + XcodeBuildMCP | Archive, export, notarytool submit, staple |
| Write tests | Serena + Write + XcodeBuildMCP | Read code under test, create test file, run tests |
| Refactor | xclaude-plugin + Serena | Use xclaude for edits, Serena for finding references |

---

## See Also

- [setup-guide.md](../setup-guide.md) - MCP installation instructions
- [macos-subagent.md](macos-subagent.md) - macOS specialist subagent definition
- [macos-claude-md-template.md](macos-claude-md-template.md) - CLAUDE.md template for macOS projects
- [10-subagents/guide.md](../../10-subagents/guide.md) - General subagent creation guide
- [11-mobile-development/ios/ios-guide.md](../../11-mobile-development/ios/ios-guide.md) - iOS guide (shares XcodeBuildMCP)
