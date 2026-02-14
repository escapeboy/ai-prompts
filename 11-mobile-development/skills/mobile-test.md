---
name: mobile-test
description: Cross-platform mobile test skill - auto-detects platform and runs tests for iOS, Android, React Native, or Flutter
version: 1.0.0
---

# Mobile Test

Run tests for mobile applications across iOS, Android, React Native, and Flutter with automatic platform detection.

---

## Usage

```
/mobile-test [platform] [options]
```

### Quick Examples

```bash
/mobile-test                             # Auto-detect platform and run all tests
/mobile-test ios                         # Run iOS tests
/mobile-test android --filter="Settings" # Run Android tests matching "Settings"
/mobile-test flutter --coverage          # Run Flutter tests with coverage
/mobile-test react-native --watch        # Run RN tests in watch mode
```

---

## Actions

### 1. Auto-Detect Platform (Default)

When invoked without a platform argument, detect the platform from project files:

**Detection rules** (same as `/mobile-build`):
- `*.xcodeproj` or `*.xcworkspace` → **iOS**
- `build.gradle.kts` with `com.android` → **Android**
- `app.json` or `metro.config.js` → **React Native**
- `pubspec.yaml` → **Flutter**

**Process**:
1. Scan project root for platform indicator files
2. Identify platform
3. Run the platform-specific test action
4. Report test results summary

---

### 2. iOS Tests

**Usage**:
```
/mobile-test ios [options]
```

**Process**:
1. Identify test scheme and target
2. Run: `xcodebuild test -scheme [Scheme] -destination 'platform=iOS Simulator,name=iPhone 16'`
3. Parse test results
4. Report pass/fail summary

**Options**:
- `--filter=PATTERN` - Run tests matching pattern (`-only-testing:TestTarget/TestClass`)
- `--device=NAME` - Target simulator (default: iPhone 16)
- `--ui` - Run UI tests instead of unit tests
- `--coverage` - Generate code coverage report

**Example**:
```
/mobile-test ios --filter="SettingsViewTests" --coverage
```

---

### 3. Android Tests

**Usage**:
```
/mobile-test android [options]
```

**Process**:
1. Identify test type (unit vs instrumented)
2. Unit: `./gradlew testDebugUnitTest`
3. Instrumented: `./gradlew connectedDebugAndroidTest`
4. Report pass/fail summary

**Options**:
- `--filter=PATTERN` - Run tests matching pattern (`--tests "*.SettingsViewModelTest"`)
- `--instrumented` - Run instrumented tests (requires device/emulator)
- `--module=NAME` - Test specific module
- `--coverage` - Generate JaCoCo coverage report

**Example**:
```
/mobile-test android --filter="SettingsViewModel" --coverage
```

---

### 4. React Native Tests

**Usage**:
```
/mobile-test react-native [options]
```

**Process**:
1. Run: `npx jest [options]`
2. Parse Jest output
3. Report pass/fail summary

**Options**:
- `--filter=PATTERN` - Run tests matching pattern (`--testPathPattern=Settings`)
- `--watch` - Run in watch mode
- `--coverage` - Generate coverage report
- `--update-snapshots` - Update snapshot tests

**Example**:
```
/mobile-test react-native --filter="Settings" --coverage
```

---

### 5. Flutter Tests

**Usage**:
```
/mobile-test flutter [options]
```

**Process**:
1. Run: `flutter test [options]`
2. If `--goldens`: run with `--update-goldens`
3. Parse test output
4. Report pass/fail summary

**Options**:
- `--filter=PATTERN` - Run specific test file or directory
- `--coverage` - Generate lcov coverage report
- `--goldens` - Update golden files
- `--integration` - Run integration tests (`flutter test integration_test/`)

**Example**:
```
/mobile-test flutter --filter="test/widget/settings" --coverage
```

---

## Options

### Flags (Boolean)

| Flag | Short | Description |
|------|-------|-------------|
| `--coverage` | | Generate code coverage report |
| `--watch` | `-w` | Watch mode (RN only) |
| `--verbose` | `-v` | Show detailed test output |
| `--ui` | | Run UI/instrumented tests |
| `--goldens` | | Update golden files (Flutter only) |
| `--integration` | | Run integration tests |

### Options (With Values)

| Option | Description | Default |
|--------|-------------|---------|
| `--filter=PATTERN` | Test name/path filter | All tests |
| `--device=NAME` | Target device (iOS/Android) | Platform default |
| `--module=NAME` | Gradle module (Android only) | All modules |

---

## Token Optimization

**Estimated token usage**:
- Auto-detect + run tests: ~2.5K tokens
- Platform-specific tests: ~2K tokens
- With coverage report: ~3K tokens

**Optimization features**:
- Parses test output and reports only the summary (pass/fail counts)
- Shows individual test names only for failures
- Uses `--filter` to avoid running unrelated tests when working on a specific feature
- Coverage report summarized as percentage, not full line-by-line output

---

## Error Handling

### Error: "No tests found"

**Symptom**: Test runner reports 0 tests executed

**Cause**: Test files not in expected location or naming convention wrong

**Solution**:
- iOS: Tests must be in a test target, files end with `Tests.swift`
- Android: Tests in `src/test/` (unit) or `src/androidTest/` (instrumented)
- RN: Files match `**/__tests__/**` or `**/*.test.{ts,tsx}`
- Flutter: Files in `test/` directory, end with `_test.dart`

### Error: "Test compilation failed"

**Symptom**: Tests fail to compile before running

**Cause**: Test code references unavailable symbols or has syntax errors

**Solution**: Build the project first with `/mobile-build`, then retry tests

### Error: "No device available" (UI/Instrumented tests)

**Symptom**: Tests requiring a device/simulator cannot find one

**Cause**: No simulator/emulator is booted

**Solution**: Boot a device first:
```
"Boot the iPhone 16 simulator"
"Start the Pixel 8 emulator"
```

---

## See Also

- [mobile-build.md](mobile-build.md) - Cross-platform build skill
- [../setup-guide.md](../setup-guide.md) - MCP server installation
- [03-custom-skills/guide.md](../../03-custom-skills/guide.md) - How to create skills
