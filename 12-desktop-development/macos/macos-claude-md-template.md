# macOS CLAUDE.md Template

**Copy this template to your macOS project root as `CLAUDE.md` and customize for your project.**

---

```markdown
# CLAUDE.md - [Project Name]

## Project Overview

- **Type**: macOS application
- **Language**: Swift [5.9/6.0]
- **UI Framework**: [SwiftUI / AppKit / Mixed]
- **Minimum Target**: macOS [13.0/14.0/15.0]
- **Distribution**: [Mac App Store / Direct (notarized) / Both]
- **Description**: [Brief description of what this app does]

## Architecture

### Stack
- **UI**: [SwiftUI / AppKit / SwiftUI + AppKit bridging]
- **Architecture**: [MVVM / MVC / TCA / Clean Architecture]
- **Persistence**: [SwiftData / Core Data / SQLite / UserDefaults only / File-based]
- **Networking**: [URLSession / Alamofire / Custom]
- **Dependency Injection**: [Environment / Swinject / Factory / Manual]

### Directory Structure
```
[ProjectName]/
  App/                  # App entry point, configuration, AppDelegate
  Models/               # Data models, DTOs
  Views/                # SwiftUI views
    Windows/            # Window-level views
    Components/         # Reusable view components
    Preferences/        # Settings/Preferences views
  ViewModels/           # View models (if MVVM)
  Services/             # Business logic, API clients
  AppKit/               # AppKit bridges (NSViewRepresentable, delegates)
  Extensions/           # Swift extensions
  Utilities/            # Helper functions, constants
  Resources/            # Assets, localization, fonts
[ProjectName]Tests/     # Unit tests
[ProjectName]UITests/   # UI tests
```

## Conventions

### Coding Standards
- Follow Swift API Design Guidelines
- Use Swift concurrency (async/await) for all asynchronous code
- Prefer value types (struct, enum) over reference types (class)
- Use access control (`private`, `internal`, `public`) explicitly
- Use `guard` for early returns, `if let` for optional binding

### Naming
- **Types**: PascalCase (`UserProfile`, `DocumentWindow`)
- **Functions/Properties**: camelCase (`fetchUser()`, `isLoggedIn`)
- **Protocols**: Adjective or noun (`Identifiable`, `DataService`)
- **Views**: Noun + View suffix (`SettingsView`, `SidebarView`)
- **View Models**: Noun + ViewModel suffix (`SettingsViewModel`)
- **Windows**: Noun + Window suffix (`DocumentWindow`, `InspectorWindow`)

### macOS SwiftUI Patterns
- Use `NavigationSplitView` for sidebar layouts
- Use `Table` for multi-column data
- Use `Settings` scene for preferences (Cmd+,)
- Use `MenuBarExtra` for menu bar functionality
- Set `defaultSize` on `WindowGroup` for initial window dimensions
- Support keyboard shortcuts via `.keyboardShortcut()` modifiers
- Handle `Cmd+Q`, `Cmd+W`, `Cmd+,` correctly

### Error Handling
- Define typed error enums per domain (`NetworkError`, `StorageError`)
- Use `Result` type for synchronous operations that can fail
- Present user-facing errors via `NSAlert` or SwiftUI `.alert()`
- Log errors via `os.Logger` for debugging

## Sandboxing

- **App Sandbox**: [Enabled / Disabled]
- **Entitlements file**: `[ProjectName]/[ProjectName].entitlements`
- **Required permissions**: [List active entitlements]
  - Network (client): [Yes/No]
  - File access (user-selected): [Yes/No]
  - File access (downloads): [Yes/No]
  - Camera: [Yes/No]

## Testing

- **Framework**: [XCTest / Swift Testing]
- Run all tests: `cmd+U` in Xcode or `xcodebuild test -destination 'platform=macOS'`
- Run specific test: `xcodebuild test -only-testing:[TestTarget]/[TestClass]/[testMethod] -destination 'platform=macOS'`
- Use `@MainActor` on test classes testing UI code
- Mock dependencies via protocol conformance

## Commands

### Build
```bash
# Build for macOS (Apple Silicon)
xcodebuild -scheme [SchemeName] -destination 'platform=macOS,arch=arm64' build

# Build via XcodeBuildMCP (preferred with Claude Code)
# "Build [SchemeName] for macOS"
```

### Test
```bash
# Run all tests
xcodebuild test -scheme [SchemeName] -destination 'platform=macOS'

# Run specific test class
xcodebuild test -scheme [SchemeName] -only-testing:[TestTarget]/[TestClass] -destination 'platform=macOS'
```

### Archive and Notarize
```bash
# Archive
xcodebuild archive -scheme [SchemeName] -archivePath build/[ProjectName].xcarchive

# Export
xcodebuild -exportArchive -archivePath build/[ProjectName].xcarchive -exportPath build/export -exportOptionsPlist ExportOptions.plist

# Notarize
xcrun notarytool submit build/export/[ProjectName].app.zip --apple-id "EMAIL" --team-id "TEAM" --password "@keychain:AC_PASSWORD" --wait

# Staple
xcrun stapler staple build/export/[ProjectName].app
```

### Code Quality
```bash
# SwiftLint (if installed)
swiftlint

# SwiftFormat (if installed)
swiftformat .
```

## MCP Servers

This project uses the following MCP servers:
- **XcodeBuildMCP** (user/local): Build, test, and project management
- **Serena** (user): Code intelligence and symbol navigation

## Important Notes

- **Never edit `.pbxproj` directly** - Use XcodeBuildMCP or Xcode for project file changes
- **macOS destinations**: Always use `platform=macOS,arch=arm64` (not iOS Simulator)
- [Add project-specific notes here]
- [Example: "Uses Swift Package Manager exclusively"]
- [Example: "Direct distribution with notarization, no App Store"]
- [Example: "Menu bar app with LSUIElement=true"]
```

---

## Customization Guide

### If Using AppKit Primarily

Add this section to your CLAUDE.md:

```markdown
### AppKit
- Window controllers in: `WindowControllers/`
- View controllers in: `ViewControllers/`
- Storyboards: [None - programmatic / MainMenu.xib / Per-window storyboards]
- Auto Layout: [Programmatic / Interface Builder]
- NSDocument-based: [Yes/No]
- Uses NSToolbar: [Yes/No]
```

### If Using Mac Catalyst

```markdown
### Mac Catalyst
- iPad app running on Mac via Catalyst
- Destination: `platform=macOS,variant=Mac Catalyst`
- Optimize for Mac: [Yes/No] (Settings > General > "Optimize Interface for Mac")
- Mac-specific code: Use `#if targetEnvironment(macCatalyst)`
- Toolbar: Use UIToolbar or UINavigationBar
```

### If Using Swift Package Manager (Library)

```markdown
### SPM Package
- Package.swift defines all targets
- Build: `swift build`
- Test: `swift test`
- Platforms: `.macOS(.v13)` minimum
- No Xcode project file - use `swift package generate-xcodeproj` if needed
```

### If Using Direct Distribution

```markdown
### Distribution
- Distribution method: Direct (developer website)
- Signing identity: Developer ID Application
- Notarization: Required for all releases
- Auto-updates: [Sparkle / custom / none]
- DMG creation: [create-dmg / manual / Packages app]
```
