# iOS CLAUDE.md Template

**Copy this template to your iOS project root as `CLAUDE.md` and customize for your project.**

---

```markdown
# CLAUDE.md - [Project Name]

## Project Overview

- **Type**: iOS application
- **Language**: Swift [5.9/6.0]
- **UI Framework**: [SwiftUI / UIKit / Mixed]
- **Minimum Target**: iOS [16.0/17.0/18.0]
- **Description**: [Brief description of what this app does]

## Architecture

### Stack
- **UI**: [SwiftUI / UIKit / SwiftUI + UIKit bridging]
- **Architecture**: [MVVM / MVC / TCA / VIPER / Clean Architecture]
- **Persistence**: [SwiftData / Core Data / Realm / UserDefaults only]
- **Networking**: [URLSession / Alamofire / Custom]
- **Dependency Injection**: [Environment / Swinject / Factory / Manual]
- **Navigation**: [NavigationStack / Coordinator pattern / UINavigationController]

### Directory Structure
```
[ProjectName]/
  App/                  # App entry point, configuration
  Models/               # Data models, DTOs
  Views/                # SwiftUI views or UIKit view controllers
    Components/         # Reusable view components
  ViewModels/           # View models (if MVVM)
  Services/             # Business logic, API clients
  Repositories/         # Data access layer
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
- **Types**: PascalCase (`UserProfile`, `OrderStatus`)
- **Functions/Properties**: camelCase (`fetchUser()`, `isLoggedIn`)
- **Protocols**: Adjective or noun (`Identifiable`, `DataService`)
- **Views**: Noun + View suffix (`SettingsView`, `ProfileHeaderView`)
- **View Models**: Noun + ViewModel suffix (`SettingsViewModel`)
- **Constants**: camelCase in enum namespace (`Constants.apiBaseURL`)

### SwiftUI Patterns
- Extract subviews when body exceeds ~30 lines
- Use `@State` for view-local state only
- Use `@Observable` classes for shared state (iOS 17+)
- Provide `#Preview` for every view
- Use `.task {}` modifier for async data loading
- Group related modifiers with comments

### Error Handling
- Define typed error enums per domain (`NetworkError`, `StorageError`)
- Use `Result` type for synchronous operations that can fail
- Use `do/catch` with specific error types, not generic `Error`
- Present user-facing errors via alerts or inline messages

## Testing

- **Framework**: [XCTest / Swift Testing]
- Run all tests: `cmd+U` in Xcode or `xcodebuild test`
- Run specific test: `xcodebuild test -only-testing:[TestTarget]/[TestClass]/[testMethod]`
- Use `@MainActor` on test classes testing UI code
- Mock dependencies via protocol conformance
- Aim for logic coverage, not 100% line coverage

## Commands

### Build
```bash
# Build via Xcode command line
xcodebuild -scheme [SchemeName] -destination 'platform=iOS Simulator,name=iPhone 16' build

# Build via XcodeBuildMCP (preferred with Claude Code)
# "Build [SchemeName] for iPhone 16 simulator"
```

### Test
```bash
# Run all tests
xcodebuild test -scheme [SchemeName] -destination 'platform=iOS Simulator,name=iPhone 16'

# Run specific test class
xcodebuild test -scheme [SchemeName] -only-testing:[TestTarget]/[TestClass]
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
- **mobile-mcp** (user): Simulator control, screenshots, gestures
- **Serena** (user): Code intelligence and symbol navigation

## Important Notes

- **Never edit `.pbxproj` directly** - Use XcodeBuildMCP or Xcode for project file changes
- [Add project-specific notes here]
- [Example: "Uses Swift Package Manager exclusively - no CocoaPods"]
- [Example: "All views support Dynamic Type and VoiceOver"]
- [Example: "Offline-first architecture with sync queue"]
```

---

## Customization Guide

### If Using UIKit

Add this section to your CLAUDE.md:

```markdown
### UIKit
- View controllers in: `ViewControllers/`
- Storyboards: [None - programmatic / Main.storyboard / Per-feature storyboards]
- Auto Layout: [Programmatic with NSLayoutConstraint / SnapKit / Anchors]
- Navigation: [UINavigationController / Coordinator pattern]
- Cells: Use compositional layout with diffable data source
```

### If Using The Composable Architecture (TCA)

```markdown
### TCA
- Version: [1.x]
- Features in: `Features/[FeatureName]/`
- Each feature has: Reducer, View, and optional Client
- Use `@Dependency` for service injection
- Test with `TestStore` for exhaustive state assertions
- Use `StackState` / `StackAction` for navigation
```

### If Using Core Data

```markdown
### Core Data
- Model file: `[ProjectName].xcdatamodeld`
- Managed object subclasses in: `Models/CoreData/`
- Use `NSPersistentContainer` with `viewContext` for main thread
- Use `newBackgroundContext()` for background operations
- Prefer `NSFetchRequest` with predicates over manual filtering
```

### If Using SwiftData

```markdown
### SwiftData
- Models annotated with `@Model`
- Use `@Query` in views for automatic fetching
- ModelContainer configured in App entry point
- Use `modelContext.save()` explicitly for critical writes
```
