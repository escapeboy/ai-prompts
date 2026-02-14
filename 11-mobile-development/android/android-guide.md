# Android Development Guide

**Workflows and best practices for Android development with Claude Code and MCP servers.**

---

## Overview

Claude Code integrates with Android development through two MCP servers:

| MCP Server | Tools | Purpose |
|------------|-------|---------|
| **JetBrains MCP** | Built-in (AS 2025.2+) | IDE integration, code intelligence, refactoring |
| **android-mcp-server** | ADB-based | Device/emulator control, builds, deployment |

Plus **mobile-mcp** for emulator control (screenshots, gestures, logs).

---

## Core Workflow: Build-Test-Verify Loop

The recommended Android development loop with Claude Code:

```
1. Write/modify Kotlin code
2. Build via Gradle (Bash or android-mcp-server)
3. Deploy to emulator via ADB
4. Take screenshot to verify UI
5. Run tests
6. Iterate
```

### Example Session

```
You: "Add a settings screen with Material 3 switches for notifications and dark theme"

Claude Code:
  1. Reads existing navigation graph (Serena)
  2. Creates SettingsScreen.kt with Jetpack Compose
  3. Adds navigation route
  4. Builds project (./gradlew assembleDebug)
  5. Installs on emulator (adb install)
  6. Takes screenshot (mobile-mcp)
  7. Verifies UI matches Material 3 guidelines
  8. Runs tests (./gradlew testDebugUnitTest)
```

---

## Gradle Build Optimization

### Recommended Gradle Commands

```bash
# Debug build (fastest for development)
./gradlew assembleDebug

# Run unit tests
./gradlew testDebugUnitTest

# Run instrumented tests
./gradlew connectedDebugAndroidTest

# Clean build
./gradlew clean assembleDebug

# Build specific module
./gradlew :feature:settings:assembleDebug

# Check for dependency updates
./gradlew dependencyUpdates
```

### Gradle Performance Tips for Claude Code

- Use `assembleDebug` instead of `assemble` (skips release variants)
- Use `--parallel` for multi-module projects
- Use `--build-cache` to reuse outputs across builds
- Avoid `clean` unless resolving cache issues
- Use module-specific tasks (`:app:assembleDebug`) to skip unrelated modules

---

## Compose Recomposition Debugging

### Identifying Unnecessary Recompositions

When working with Compose, watch for performance issues caused by excessive recomposition:

```kotlin
// BAD: Lambda recreated on every recomposition
@Composable
fun SettingsList(viewModel: SettingsViewModel) {
    LazyColumn {
        items(viewModel.settings) { setting ->
            SettingItem(
                setting = setting,
                onToggle = { viewModel.toggle(setting.id) } // New lambda each time
            )
        }
    }
}

// GOOD: Stable lambda reference
@Composable
fun SettingsList(viewModel: SettingsViewModel) {
    val onToggle = remember<(String) -> Unit> { { id -> viewModel.toggle(id) } }
    LazyColumn {
        items(viewModel.settings, key = { it.id }) { setting ->
            SettingItem(
                setting = setting,
                onToggle = { onToggle(setting.id) }
            )
        }
    }
}
```

### Compose Stability Rules

- Mark data classes as `@Stable` or `@Immutable` when all properties are stable
- Use `key` parameter in `LazyColumn`/`LazyRow` items
- Hoist state to prevent unnecessary recompositions
- Use `derivedStateOf` for computed values
- Use `remember` with proper keys for expensive computations

---

## ADB Device Control Patterns

### Common ADB Commands via Claude Code

```bash
# List connected devices
adb devices

# Install APK
adb install -r app/build/outputs/apk/debug/app-debug.apk

# Launch app
adb shell am start -n com.example.app/.MainActivity

# Clear app data
adb shell pm clear com.example.app

# Take screenshot
adb exec-out screencap -p > screenshot.png

# Record screen
adb shell screenrecord /sdcard/recording.mp4

# View logs
adb logcat -s "MyApp" --format=brief

# Forward port (for debugging)
adb forward tcp:8081 tcp:8081
```

### Using mobile-mcp for Device Control

```
"Boot the Pixel 8 emulator"
"Install and launch the debug build"
"Take a screenshot"
"Tap the Settings icon in the bottom navigation"
"Scroll down in the settings list"
"Type 'test@example.com' in the email field"
```

---

## Material 3 Theming

### Setting Up Material 3 with Claude Code

When creating Material 3 themed components, follow these patterns:

```kotlin
// Theme.kt - Dynamic color with fallback
@Composable
fun AppTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context)
            else dynamicLightColorScheme(context)
        }
        darkTheme -> darkColorScheme()
        else -> lightColorScheme()
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
```

### Material 3 Component Usage

- Use `MaterialTheme.colorScheme` for colors (not hardcoded values)
- Use `MaterialTheme.typography` for text styles
- Follow Material 3 spacing: 4dp, 8dp, 12dp, 16dp, 24dp, 32dp
- Use `Scaffold` with `TopAppBar`, `BottomAppBar`, `FloatingActionButton`
- Use `Surface` for elevation-based containers

---

## Multi-Module Navigation

### Type-Safe Navigation with Compose

```kotlin
// Define routes as sealed classes or enums
@Serializable
sealed class Route {
    @Serializable data object Home : Route()
    @Serializable data object Settings : Route()
    @Serializable data class Detail(val id: String) : Route()
}

// NavHost setup
NavHost(navController = navController, startDestination = Route.Home) {
    composable<Route.Home> { HomeScreen(onNavigate = { navController.navigate(it) }) }
    composable<Route.Settings> { SettingsScreen() }
    composable<Route.Detail> { backStackEntry ->
        val detail: Route.Detail = backStackEntry.toRoute()
        DetailScreen(id = detail.id)
    }
}
```

### Multi-Module Navigation Pattern

```
:app (NavHost, routes)
:feature:home (HomeScreen, HomeViewModel)
:feature:settings (SettingsScreen, SettingsViewModel)
:core:data (repositories, data sources)
:core:ui (shared composables, theme)
:core:model (data classes)
```

---

## Common Android Gotchas

### 1. Gradle Sync Failures

```
"Gradle sync failed: Could not resolve dependencies"
```

**Fix**: Check `build.gradle.kts` for version conflicts. Use `./gradlew dependencies` to identify conflicts.

### 2. Compose Compiler Version Mismatch

The Compose compiler must match the Kotlin version:

```kotlin
// build.gradle.kts
composeOptions {
    kotlinCompilerExtensionVersion = "1.5.14" // Must match Kotlin version
}
```

For Kotlin 2.0+, use the Compose compiler Gradle plugin instead.

### 3. ProGuard/R8 Stripping

If release builds crash but debug works:

```
# Add keep rules in proguard-rules.pro
-keep class com.example.app.models.** { *; }
-keepclassmembers class * implements java.io.Serializable { *; }
```

### 4. Configuration Changes

Compose handles configuration changes automatically, but watch for:
- ViewModel state not surviving process death (use `SavedStateHandle`)
- One-shot events lost on rotation (use `Channel` or `SharedFlow`)

### 5. Emulator Performance

```bash
# Use hardware acceleration
emulator -avd Pixel_8_API_35 -gpu host

# Or use a physical device for better performance
adb devices
```

---

## Recommended Workflow by Task Type

| Task | Tools | Approach |
|------|-------|----------|
| New Compose screen | Serena + Write + Bash (Gradle) | Read existing screens, create composable, build |
| Fix a bug | Serena + Read + Edit + Bash | Navigate to symbol, read, edit, build and test |
| Add dependency | Edit (build.gradle.kts) + Bash | Edit Gradle file, sync, build |
| UI polish | mobile-mcp + Edit | Screenshot, identify issues, edit, re-screenshot |
| Write tests | Serena + Write + Bash | Read code under test, create test, run tests |
| Multi-module feature | JetBrains MCP + Serena | Use IDE tools for refactoring across modules |

---

## See Also

- [setup-guide.md](../setup-guide.md) - MCP installation instructions
- [android-subagent.md](android-subagent.md) - Android specialist subagent definition
- [android-claude-md-template.md](android-claude-md-template.md) - CLAUDE.md template for Android projects
- [10-subagents/guide.md](../../10-subagents/guide.md) - General subagent creation guide
