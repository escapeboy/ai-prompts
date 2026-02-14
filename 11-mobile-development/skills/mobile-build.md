---
name: mobile-build
description: Cross-platform mobile build skill - auto-detects platform and builds for iOS, Android, React Native, or Flutter
version: 1.0.0
---

# Mobile Build

Build mobile applications across iOS, Android, React Native, and Flutter with automatic platform detection.

---

## Usage

```
/mobile-build [platform] [options]
```

### Quick Examples

```bash
/mobile-build                        # Auto-detect platform and build debug
/mobile-build ios                    # Build iOS debug
/mobile-build android --release      # Build Android release
/mobile-build --clean                # Clean build
/mobile-build flutter --device="iPhone 16"  # Build Flutter for specific device
```

---

## Actions

### 1. Auto-Detect Platform (Default)

When invoked without a platform argument, detect the platform from project files:

**Detection rules**:
- `*.xcodeproj` or `*.xcworkspace` or `Package.swift` → **iOS**
- `build.gradle.kts` or `build.gradle` (with `com.android`) → **Android**
- `app.json` or `expo.json` or `metro.config.js` → **React Native**
- `pubspec.yaml` → **Flutter**
- If multiple detected (e.g., RN project has ios/ and android/), prefer the highest-level framework

**Process**:
1. Scan project root for platform indicator files
2. Identify platform
3. Run the platform-specific build action
4. Report build result

---

### 2. iOS Build

**Usage**:
```
/mobile-build ios [options]
```

**Process**:
1. Identify scheme: `xcodebuild -list` or use XcodeBuildMCP
2. Build: `xcodebuild -scheme [Scheme] -destination 'platform=iOS Simulator,name=iPhone 16' build`
3. Report success/failure with build time

**Options**:
- `--release` - Build release configuration
- `--device=NAME` - Target specific simulator (default: iPhone 16)
- `--clean` - Clean before building

**Example**:
```
/mobile-build ios --device="iPad Pro 13-inch"
```

---

### 3. Android Build

**Usage**:
```
/mobile-build android [options]
```

**Process**:
1. Identify build variant
2. Build: `./gradlew assembleDebug` (or `assembleRelease`)
3. Report success/failure with APK location

**Options**:
- `--release` - Build release variant
- `--module=NAME` - Build specific module (default: app)
- `--clean` - Run `./gradlew clean` first

**Example**:
```
/mobile-build android --release --clean
```

---

### 4. React Native Build

**Usage**:
```
/mobile-build react-native [options]
```

**Process**:
1. Detect Expo managed vs bare workflow
2. **Managed**: Use EAS Build via Expo MCP
3. **Bare**: Use native build tools (xcodebuild / gradlew)
4. Report build result

**Options**:
- `--platform=ios|android|all` - Target platform (default: both)
- `--profile=PROFILE` - EAS Build profile (default: development)
- `--local` - Build locally instead of EAS cloud

**Example**:
```
/mobile-build react-native --platform=ios --profile=preview
```

---

### 5. Flutter Build

**Usage**:
```
/mobile-build flutter [options]
```

**Process**:
1. Run `flutter pub get` if needed
2. Run `dart run build_runner build` if freezed files are modified
3. Build: `flutter build [target]`
4. Report build result

**Options**:
- `--platform=ios|android|web|all` - Target platform (default: current device)
- `--release` - Build release mode
- `--clean` - Run `flutter clean` first
- `--device=NAME` - Target specific device

**Example**:
```
/mobile-build flutter --platform=apk --release
```

---

## Options

### Flags (Boolean)

| Flag | Short | Description |
|------|-------|-------------|
| `--release` | `-r` | Build in release/production mode |
| `--clean` | `-c` | Clean build artifacts before building |
| `--verbose` | `-v` | Show detailed build output |

### Options (With Values)

| Option | Description | Default |
|--------|-------------|---------|
| `--device=NAME` | Target device/simulator name | Platform default |
| `--platform=VALUE` | Target platform (ios, android, web, all) | Auto-detect |
| `--profile=VALUE` | EAS Build profile (RN only) | `development` |
| `--module=VALUE` | Gradle module (Android only) | `app` |

---

## Token Optimization

**Estimated token usage**:
- Auto-detect + build: ~3K tokens
- Platform-specific build: ~2K tokens
- Clean + build: ~3.5K tokens

**Optimization features**:
- Auto-detects platform to avoid unnecessary file reads
- Uses MCP tools when available (XcodeBuildMCP, Expo MCP) for lower-token builds
- Reports only build result summary, not full build log

---

## Error Handling

### Error: "No platform detected"

**Symptom**: `/mobile-build` cannot identify the platform

**Cause**: Project root doesn't contain recognizable platform files

**Solution**: Specify platform explicitly: `/mobile-build ios`

### Error: "Build failed"

**Symptom**: Build command returns non-zero exit code

**Cause**: Compilation errors, missing dependencies, or configuration issues

**Solution**: Check build output for specific error. Common fixes:
- iOS: `xcode-select --install`, check signing
- Android: `./gradlew --stacktrace` for details
- RN: `npx expo doctor` for dependency issues
- Flutter: `flutter doctor` for environment issues

---

## See Also

- [mobile-test.md](mobile-test.md) - Cross-platform test skill
- [../setup-guide.md](../setup-guide.md) - MCP server installation
- [03-custom-skills/guide.md](../../03-custom-skills/guide.md) - How to create skills
