# Android CLAUDE.md Template

**Copy this template to your Android project root as `CLAUDE.md` and customize for your project.**

---

```markdown
# CLAUDE.md - [Project Name]

## Project Overview

- **Type**: Android application
- **Language**: Kotlin [1.9.x / 2.0.x]
- **UI Framework**: [Jetpack Compose / Views (XML) / Mixed]
- **Min SDK**: [26 / 28 / 31]
- **Target SDK**: [34 / 35]
- **Description**: [Brief description of what this app does]

## Architecture

### Stack
- **UI**: [Jetpack Compose / XML Views / Compose + Views interop]
- **Architecture**: [MVVM / MVI / Clean Architecture / Multi-module]
- **DI**: [Hilt / Koin / Manual]
- **Networking**: [Retrofit / Ktor / OkHttp]
- **Serialization**: [Kotlin Serialization / Moshi / Gson]
- **Local DB**: [Room / SQLDelight / DataStore]
- **Navigation**: [Compose Navigation / Navigation Component / Custom]
- **Image Loading**: [Coil / Glide]

### Directory Structure
```
app/
  src/main/
    java/com/example/app/
      di/                 # Hilt modules
      ui/                 # Screens and composables
        theme/            # Material 3 theme
        components/       # Shared UI components
        screens/          # Feature screens
      data/               # Data layer
        local/            # Room database, DAOs
        remote/           # API interfaces, DTOs
        repository/       # Repository implementations
      domain/             # Domain layer
        model/            # Domain models
        repository/       # Repository interfaces
        usecase/          # Use cases (optional)
      util/               # Utility functions
    res/                  # Resources (strings, drawables, etc.)
  src/test/               # Unit tests
  src/androidTest/        # Instrumented tests
```

## Conventions

### Coding Standards
- Follow Kotlin coding conventions (kotlinlang.org/docs/coding-conventions.html)
- Use Kotlin coroutines for all asynchronous operations
- Use Flow for reactive data streams
- Prefer immutable data (val, data class, List vs MutableList)
- Use sealed classes/interfaces for modeling states and events

### Naming
- **Packages**: lowercase, dot-separated (`com.example.app.data.repository`)
- **Classes**: PascalCase (`UserRepository`, `SettingsScreen`)
- **Functions**: camelCase (`fetchUser()`, `onSettingsChanged()`)
- **Composables**: PascalCase (`@Composable fun SettingsScreen()`)
- **State classes**: Suffix with `UiState` (`SettingsUiState`)
- **ViewModels**: Suffix with `ViewModel` (`SettingsViewModel`)
- **Constants**: UPPER_SNAKE_CASE in companion objects

### Compose Patterns
- Composables are stateless; hoist state to ViewModel
- Use `Modifier` as the first optional parameter
- Provide `@Preview` with sample data for every screen
- Use `LaunchedEffect` for side effects, `rememberCoroutineScope` for event handlers
- Use `collectAsStateWithLifecycle()` for Flow collection in composables
- Group related composables in the same file

### Gradle
- Use Kotlin DSL (`build.gradle.kts`)
- Centralize versions in `libs.versions.toml`
- Use convention plugins for shared build logic
- Keep module-level build files minimal

## Testing

- **Unit Test Framework**: [JUnit 5 / JUnit 4]
- **Mocking**: [MockK / Mockito-Kotlin]
- **Flow Testing**: [Turbine]
- Run all tests: `./gradlew testDebugUnitTest`
- Run specific test: `./gradlew testDebugUnitTest --tests "com.example.app.SettingsViewModelTest"`
- Run instrumented tests: `./gradlew connectedDebugAndroidTest`
- Run lint: `./gradlew lintDebug`

## Commands

### Build
```bash
./gradlew assembleDebug                    # Debug build
./gradlew assembleRelease                  # Release build
./gradlew :feature:settings:assembleDebug  # Module-specific build
```

### Test
```bash
./gradlew testDebugUnitTest                # All unit tests
./gradlew connectedDebugAndroidTest        # Instrumented tests
./gradlew check                            # All checks (lint + tests)
```

### Install & Run
```bash
./gradlew installDebug                     # Install on connected device
adb shell am start -n com.example.app/.MainActivity  # Launch app
```

### Code Quality
```bash
./gradlew lintDebug                        # Android Lint
./gradlew detekt                           # Detekt (if configured)
./gradlew ktlintCheck                      # ktlint (if configured)
```

## MCP Servers

This project uses the following MCP servers:
- **JetBrains MCP** (user): IDE integration when Android Studio is running
- **android-mcp-server** (user/local): ADB device control and builds
- **mobile-mcp** (user): Emulator control, screenshots, gestures
- **Serena** (user): Code intelligence and symbol navigation

## Important Notes

- [Add project-specific notes here]
- [Example: "Uses product flavors for free/premium variants"]
- [Example: "Baseline profiles generated for release builds"]
- [Example: "All strings must be extracted to strings.xml for localization"]
```

---

## Customization Guide

### If Using Multi-Module Architecture

Add this section to your CLAUDE.md:

```markdown
### Modules
- `:app` - Application module, navigation host, DI setup
- `:feature:home` - Home screen feature
- `:feature:settings` - Settings feature
- `:core:data` - Repositories, data sources
- `:core:network` - Retrofit setup, API interfaces
- `:core:database` - Room database, DAOs
- `:core:ui` - Shared composables, theme
- `:core:model` - Domain models shared across features
- `:core:common` - Utilities, extensions

Module dependency rules:
- `:feature:*` depends on `:core:*` only
- `:core:data` depends on `:core:network` and `:core:database`
- `:app` depends on all `:feature:*` modules
- No `:feature` to `:feature` dependencies
```

### If Using KMP (Kotlin Multiplatform)

```markdown
### Kotlin Multiplatform
- Shared module: `shared/` (commonMain, androidMain, iosMain)
- Shared logic: networking, data models, business rules
- Platform-specific: UI, platform APIs, DI
- Use expect/actual for platform abstractions
- Use Koin for multiplatform DI
```

### If Using XML Views (Legacy)

```markdown
### Views (XML)
- Layouts in: `res/layout/`
- Use ViewBinding (not DataBinding or findViewById)
- Use Fragments with FragmentContainerView
- Use Navigation Component with nav_graph.xml
- Use ListAdapter + DiffUtil for RecyclerView
```
