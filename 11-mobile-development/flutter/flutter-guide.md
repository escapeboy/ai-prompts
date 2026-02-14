# Flutter Development Guide

**Workflows and best practices for Flutter development with Claude Code and MCP servers.**

---

## Overview

Claude Code integrates with Flutter development through multiple MCP servers:

| MCP Server | Purpose |
|------------|---------|
| **Dart/Flutter MCP** | Official language server with MCP protocol (Dart SDK 3.9+) |
| **Flutter MCP** | Documentation for 50,000+ pub.dev packages |
| **DCM MCP** | Dart Code Metrics with 450+ lint rules |

Plus **mobile-mcp** for simulator/emulator control (screenshots, gestures, logs).

---

## Core Workflow: Hot Reload Development Loop

The recommended Flutter development loop with Claude Code:

```
1. Write/modify Dart code
2. Hot reload (sub-second UI update)
3. Take screenshot to verify UI (mobile-mcp)
4. Run tests (flutter test)
5. Iterate
```

### Example Session

```
You: "Add a settings page with switches for notifications and dark mode"

Claude Code:
  1. Reads existing navigation structure (Serena)
  2. Creates settings_screen.dart
  3. Adds route to navigation
  4. Hot reload updates the running app instantly
  5. Takes screenshot (mobile-mcp)
  6. Verifies UI matches Material 3 guidelines
  7. Runs tests (flutter test test/settings_screen_test.dart)
```

---

## Hot Reload Loop

### Starting Development

```bash
# Run on default device
flutter run

# Run on specific device
flutter run -d "iPhone 16"
flutter run -d "emulator-5554"

# Run on Chrome (web)
flutter run -d chrome

# Run multiple devices simultaneously
flutter run -d all
```

### Hot Reload vs Hot Restart

| Action | Preserves State | Speed | Use When |
|--------|----------------|-------|----------|
| **Hot reload** (`r`) | Yes | Sub-second | Changing widget build methods, styling |
| **Hot restart** (`R`) | No | 1-2 seconds | Changing `initState`, adding new fields |
| **Full restart** | No | 5-15 seconds | Changing native code, plugins |

### With Claude Code

```
1. Claude Code edits a widget file
2. Save triggers hot reload automatically
3. mobile-mcp takes screenshot to verify
4. If incorrect, Claude Code edits again
```

---

## Widget Testing with Golden Files

### Creating Golden Tests

Golden tests compare rendered widgets against reference images:

```dart
testWidgets('SettingsScreen matches golden', (tester) async {
  await tester.pumpWidget(
    MaterialApp(
      home: SettingsScreen(),
    ),
  );

  await expectLater(
    find.byType(SettingsScreen),
    matchesGoldenFile('goldens/settings_screen.png'),
  );
});
```

### Running Golden Tests

```bash
# Generate golden files (first time)
flutter test --update-goldens

# Run golden comparison tests
flutter test test/goldens/

# Run all tests
flutter test
```

### Golden Testing Best Practices

- Store goldens in `test/goldens/` directory
- Run `--update-goldens` when intentionally changing UI
- Use `MaterialApp` wrapper with fixed theme for consistent goldens
- Set fixed size with `tester.view.physicalSize` for deterministic renders
- CI should run golden tests without `--update-goldens`

---

## DCM Code Quality

### Using DCM with Claude Code

DCM provides 450+ lint rules specific to Dart and Flutter:

```bash
# Run DCM analysis
dcm analyze lib

# Run DCM with fixes
dcm fix lib

# Check unused code
dcm check-unused-code lib

# Check unused files
dcm check-unused-files lib

# Check dependencies
dcm check-dependencies
```

### Via DCM MCP

```
"Run DCM analysis on the lib directory"
"Check for unused code in the project"
"Fix all auto-fixable DCM issues"
```

### Key DCM Rules

- `avoid-unnecessary-setstate` - Prevent unnecessary rebuilds
- `prefer-const-border-radius` - Use `BorderRadius.circular` constant
- `avoid-shrink-wrap-in-lists` - Performance anti-pattern
- `prefer-extracting-callbacks` - Extract callbacks for readability
- `avoid-returning-widgets` - Use separate widget classes

---

## Platform-Adaptive Design

### Writing Platform-Adaptive Code

```dart
import 'dart:io' show Platform;

// Platform-specific behavior
Widget buildAdaptiveNavigation() {
  if (Platform.isIOS) {
    return CupertinoTabBar(/* ... */);
  }
  return NavigationBar(/* ... */); // Material 3
}

// Or use the adaptive widgets
Switch.adaptive(value: isDark, onChanged: onChanged)
Slider.adaptive(value: volume, onChanged: onChanged)
```

### Material 3 + Cupertino

```dart
// Use Material 3 as base, adapt for iOS
ThemeData(
  useMaterial3: true,
  colorSchemeSeed: Colors.blue,
  platform: TargetPlatform.iOS, // Forces Cupertino overscroll, etc.
)
```

---

## pub.dev Package Research with Flutter MCP

### Finding Packages

```
"Search pub.dev for a state management package with good documentation"
"What are the most popular HTTP client packages for Flutter?"
"Show me the API documentation for the dio package"
```

### Evaluating Packages

Flutter MCP provides package metadata including:
- Pub score and popularity
- Platform support (iOS, Android, web, desktop)
- Latest version and changelog
- API documentation
- License information

### Adding Dependencies

```bash
# Add a package
flutter pub add dio

# Add a dev dependency
flutter pub add --dev mockito

# Add with version constraint
flutter pub add 'dio:^5.0.0'

# Update dependencies
flutter pub upgrade
```

---

## Code Generation (freezed, build_runner)

### Setting Up Code Generation

```bash
# Add build_runner and generators
flutter pub add --dev build_runner
flutter pub add --dev freezed
flutter pub add freezed_annotation
flutter pub add --dev json_serializable
flutter pub add json_annotation
```

### Using freezed for Data Classes

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _$User {
  const factory User({
    required String id,
    required String name,
    required String email,
    @Default(false) bool isActive,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}
```

### Running Code Generation

```bash
# One-time generation
dart run build_runner build --delete-conflicting-outputs

# Watch mode (regenerates on file changes)
dart run build_runner watch --delete-conflicting-outputs
```

### With Claude Code

When Claude Code creates or modifies freezed classes:
1. Writes the annotated Dart file
2. Runs `dart run build_runner build` via Bash
3. Verifies generated files exist
4. Uses generated code in dependent files

---

## Common Flutter Gotchas

### 1. Build Runner Conflicts

```
Error: Conflicting outputs
```

**Fix**: Always use `--delete-conflicting-outputs`:

```bash
dart run build_runner build --delete-conflicting-outputs
```

### 2. Hot Reload Not Working

Hot reload fails when:
- Changing `enum` values or adding `enum` cases
- Modifying generic type arguments
- Changing native plugin code

**Fix**: Use hot restart (`R`) or full restart for these changes.

### 3. Widget Test Pump Timing

```dart
// BAD: May not resolve futures
await tester.pumpWidget(MyWidget());
expect(find.text('Loaded'), findsOneWidget); // Fails!

// GOOD: Pump until settled
await tester.pumpWidget(MyWidget());
await tester.pumpAndSettle(); // Waits for animations and futures
expect(find.text('Loaded'), findsOneWidget);
```

### 4. Platform Channel Errors in Tests

```
MissingPluginException: No implementation found for method X
```

**Fix**: Mock platform channels in tests:

```dart
TestWidgetsFlutterBinding.ensureInitialized();
TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
    .setMockMethodCallHandler(channel, (call) async {
  return null; // Mock response
});
```

### 5. State Management with Provider/Riverpod

When using Riverpod, always dispose providers properly:

```dart
// Use autoDispose for automatic cleanup
final settingsProvider = StateNotifierProvider.autoDispose<SettingsNotifier, SettingsState>(
  (ref) => SettingsNotifier(),
);
```

---

## Recommended Workflow by Task Type

| Task | Tools | Approach |
|------|-------|----------|
| New widget/screen | Serena + Write + Bash | Read existing widgets, create new file, hot reload |
| Fix a bug | Serena + Read + Edit + Bash | Navigate to symbol, read, edit, hot reload |
| Add dependency | Bash (flutter pub) | Add package, run build_runner if needed |
| UI polish | mobile-mcp + Edit | Screenshot, identify issues, edit, re-screenshot |
| Write tests | Serena + Write + Bash | Read widget, create test, run flutter test |
| Golden tests | Write + Bash | Create golden test, update goldens, verify |
| Code quality | DCM MCP + Edit | Run DCM analysis, fix issues |
| Package research | Flutter MCP | Search pub.dev, read docs, evaluate options |

---

## See Also

- [setup-guide.md](../setup-guide.md) - MCP installation instructions
- [flutter-subagent.md](flutter-subagent.md) - Flutter specialist subagent definition
- [flutter-claude-md-template.md](flutter-claude-md-template.md) - CLAUDE.md template for Flutter projects
- [10-subagents/guide.md](../../10-subagents/guide.md) - General subagent creation guide
