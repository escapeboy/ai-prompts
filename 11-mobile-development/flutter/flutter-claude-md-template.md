# Flutter CLAUDE.md Template

**Copy this template to your Flutter project root as `CLAUDE.md` and customize for your project.**

---

```markdown
# CLAUDE.md - [Project Name]

## Project Overview

- **Type**: Flutter application
- **Dart SDK**: [3.9+]
- **Flutter**: [3.29+]
- **Platforms**: [iOS, Android / iOS, Android, Web / All]
- **Description**: [Brief description of what this app does]

## Architecture

### Stack
- **UI**: Flutter (Material 3)
- **State Management**: [Riverpod / Bloc / Provider / GetX]
- **Navigation**: [go_router / auto_route / Navigator 2.0]
- **Networking**: [dio / http / graphql_flutter]
- **Local Storage**: [Hive / Isar / SharedPreferences / drift]
- **DI**: [Riverpod / get_it + injectable / Manual]
- **Code Generation**: [freezed + json_serializable + build_runner / None]

### Directory Structure
```
lib/
  main.dart               # App entry point
  app/                    # App configuration, theme, routing
  features/               # Feature modules
    settings/
      presentation/       # Screens, widgets
      application/        # State management (notifiers, blocs)
      domain/             # Models, repository interfaces
      data/               # Repository implementations, DTOs
  core/                   # Shared code
    theme/                # App theme, colors, typography
    widgets/              # Reusable widgets
    services/             # API clients, platform services
    utils/                # Helper functions, extensions
    constants/            # App-wide constants
test/
  unit/                   # Unit tests
  widget/                 # Widget tests
  goldens/                # Golden file tests
  integration/            # Integration tests
```

## Conventions

### Coding Standards
- Follow official Dart style guide (dart.dev/guides/language/effective-dart/style)
- Enable strict analysis options (`analysis_options.yaml`)
- Use `const` constructors wherever possible
- Prefer immutable data (final fields, freezed classes)
- Use named parameters for functions with 3+ parameters

### Naming
- **Files**: snake_case (`settings_screen.dart`, `user_repository.dart`)
- **Classes**: PascalCase (`SettingsScreen`, `UserRepository`)
- **Variables/Functions**: camelCase (`userName`, `fetchSettings()`)
- **Constants**: camelCase (`defaultPadding`, `apiBaseUrl`)
- **Enums**: PascalCase with camelCase values (`enum UserRole { admin, editor }`)
- **Private members**: prefix with `_` (`_isLoading`, `_fetchData()`)

### Widget Patterns
- Extract subwidgets when `build()` exceeds ~40 lines
- Use `const` constructors for stateless widgets
- Accept data and callbacks via constructor (composition)
- Use `Key` for list items and widgets that move in the tree
- Follow single-responsibility: one widget, one purpose
- Place `build` method last in widget classes

### State Management
- Keep state immutable (use freezed or manual copyWith)
- Separate UI state from business logic
- Handle tri-state: loading, error, data
- Dispose resources in `dispose()` or use auto-dispose

### Error Handling
- Define typed exception classes per domain
- Use `Either` or `Result` pattern for fallible operations
- Show user-friendly error messages via snackbars or inline
- Log errors with structured context

## Testing

- **Widget Tests**: `flutter test test/widget/`
- **Unit Tests**: `flutter test test/unit/`
- **Golden Tests**: `flutter test test/goldens/`
- **Integration Tests**: `flutter test integration_test/`
- Update goldens: `flutter test --update-goldens`
- Run all: `flutter test`
- Run with coverage: `flutter test --coverage`

## Commands

### Development
```bash
flutter run                         # Run on default device
flutter run -d "iPhone 16"          # Run on specific device
flutter run -d chrome               # Run on web
flutter run -d all                  # Run on all connected devices
```

### Build
```bash
flutter build ios                   # iOS release build
flutter build apk                  # Android APK
flutter build appbundle             # Android App Bundle
flutter build web                   # Web build
```

### Testing
```bash
flutter test                        # All tests
flutter test test/widget/           # Widget tests only
flutter test --coverage             # With coverage
flutter test --update-goldens       # Update golden files
```

### Code Generation
```bash
dart run build_runner build --delete-conflicting-outputs   # One-time
dart run build_runner watch --delete-conflicting-outputs   # Watch mode
```

### Code Quality
```bash
dart analyze                        # Dart analyzer
dcm analyze lib                     # DCM analysis (if installed)
dcm check-unused-code lib           # Find unused code
dart format lib                     # Format code
```

### Dependencies
```bash
flutter pub add [package]           # Add dependency
flutter pub add --dev [package]     # Add dev dependency
flutter pub upgrade                 # Upgrade dependencies
flutter pub outdated                # Check for outdated packages
```

## MCP Servers

This project uses the following MCP servers:
- **Dart/Flutter MCP** (user): Language server with code analysis
- **Flutter MCP** (user): pub.dev package documentation
- **DCM MCP** (user): Dart Code Metrics analysis
- **mobile-mcp** (user): Simulator/emulator control, screenshots
- **Serena** (user): Code intelligence and symbol navigation

## Important Notes

- **Run build_runner** after modifying freezed/json_serializable classes
- [Add project-specific notes here]
- [Example: "Uses flavor system for dev/staging/prod environments"]
- [Example: "All widgets must support both LTR and RTL layouts"]
- [Example: "Golden tests run on Linux CI - update goldens on Linux"]
```

---

## Customization Guide

### If Using Riverpod

Add this section to your CLAUDE.md:

```markdown
### Riverpod
- Version: [2.x with code generation / 2.x without codegen]
- Providers in: feature-level `providers/` directory
- Use `@riverpod` annotation with code generation
- Use `ref.watch` for reactive state, `ref.read` for one-time reads
- Use `AsyncNotifier` for async state with loading/error handling
- Auto-dispose by default; use `keepAlive` for persistent state
```

### If Using Bloc

```markdown
### Bloc
- Version: [8.x]
- Blocs in: `feature/application/` directory
- Events: sealed class per Bloc (`SettingsEvent`)
- States: freezed class per Bloc (`SettingsState`)
- Use `BlocProvider` for DI, `BlocBuilder`/`BlocListener` for UI
- Separate Cubits (simple state) from Blocs (event-driven)
```

### If Using go_router

```markdown
### go_router
- Router config in: `lib/app/router.dart`
- Use `TypedGoRoute` with code generation for type-safe routes
- Shell routes for persistent navigation (bottom tabs)
- Use `GoRouterState` for accessing route parameters
- Handle deep links via `initialLocation` and URI patterns
```

### If Targeting Web

```markdown
### Web Support
- Web-specific code in: `lib/core/web/`
- Use `kIsWeb` for web-specific behavior
- Use `HtmlElementView` for embedding HTML elements
- SEO: use `flutter build web --web-renderer html` for content sites
- Use conditional imports for dart:html dependencies
```
