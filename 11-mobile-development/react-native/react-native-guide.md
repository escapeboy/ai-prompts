# React Native Development Guide

**Workflows and best practices for React Native development with Claude Code and MCP servers.**

---

## Overview

Claude Code integrates with React Native development through the Expo MCP server:

| MCP Server | Purpose |
|------------|---------|
| **Expo MCP** | EAS Build, EAS Update, project management, Expo tooling |

Plus **mobile-mcp** for simulator/emulator control (screenshots, gestures, logs).

---

## Core Workflow: Build-Test-Verify Loop

The recommended React Native development loop with Claude Code:

```
1. Write/modify TypeScript components
2. Hot reload verifies on running dev server
3. Take screenshot to verify UI (mobile-mcp)
4. Run tests (jest)
5. For production: build via EAS Build (Expo MCP)
6. Iterate
```

### Example Session

```
You: "Add a settings screen with toggles for push notifications and dark mode"

Claude Code:
  1. Reads existing navigation structure (Serena)
  2. Creates SettingsScreen.tsx
  3. Adds screen to navigation stack
  4. Dev server hot reloads automatically
  5. Takes screenshot (mobile-mcp)
  6. Verifies UI matches requirements
  7. Runs tests (jest --testPathPattern=Settings)
```

---

## Expo Managed vs Bare Workflow

### Expo Managed (Recommended for Most Projects)

```
Pros:
  - EAS Build handles native compilation
  - OTA updates via EAS Update
  - Expo SDK provides pre-built native modules
  - No Xcode/Android Studio needed for most tasks

Cons:
  - Limited native module customization
  - Some libraries require custom dev client
```

### Bare Workflow

```
Pros:
  - Full access to native code (ios/, android/)
  - Any native library can be integrated
  - Direct Xcode/Android Studio access

Cons:
  - Must manage native dependencies manually
  - No OTA updates without additional setup
  - More complex CI/CD
```

### With Claude Code

- **Managed**: Use Expo MCP for builds and updates; Claude Code edits TypeScript only
- **Bare**: Use Expo MCP + XcodeBuildMCP (iOS) or android-mcp-server (Android) for native builds

---

## Hot Reload Development Loop

### Starting the Dev Server

```bash
# Start Expo dev server
npx expo start

# Start with specific platform
npx expo start --ios
npx expo start --android

# Start with tunnel (for physical devices on different networks)
npx expo start --tunnel
```

### Hot Reload Workflow with Claude Code

```
1. Claude Code edits a component file
2. Metro bundler detects the change
3. Fast Refresh updates the running app
4. mobile-mcp takes a screenshot to verify
5. If incorrect, Claude Code edits again (repeat)
```

Key points:
- Changes to components with `useState`/`useEffect` preserve state during Fast Refresh
- Changes to module-level code (imports, constants) trigger a full reload
- If Fast Refresh fails, shake device or press `r` in terminal for manual reload

---

## Cross-Platform Testing (iOS + Android)

### Running on Both Platforms

```bash
# Start iOS simulator
npx expo start --ios

# In another terminal, start Android emulator
npx expo start --android

# Or use mobile-mcp
"Boot the iPhone 16 simulator and Pixel 8 emulator"
"Take screenshots of both devices"
```

### Platform-Specific Code

```typescript
import { Platform } from 'react-native';

// Platform-specific styling
const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
});

// Platform-specific files
// SettingsScreen.ios.tsx  - iOS-only version
// SettingsScreen.android.tsx - Android-only version
// SettingsScreen.tsx - Shared (fallback)
```

### Testing Both Platforms with Claude Code

```
"Run the app on both iOS and Android simulators and compare the settings screen"
```

Claude Code will:
1. Boot both simulators via mobile-mcp
2. Take screenshots of both
3. Compare for visual differences
4. Flag platform-specific issues

---

## Native Module Creation

### When You Need a Native Module

- Accessing platform APIs not covered by Expo SDK
- Integrating existing native SDKs
- Performance-critical operations

### Creating with Expo Modules API

```bash
# Create a new Expo module
npx create-expo-module my-native-module

# Structure:
# my-native-module/
#   src/
#     MyNativeModule.ts        # TypeScript interface
#     MyNativeModule.web.ts    # Web implementation
#   ios/
#     MyNativeModule.swift     # iOS implementation
#   android/
#     src/main/java/.../
#       MyNativeModule.kt     # Android implementation
```

### With Claude Code

Claude Code can:
- Generate the TypeScript interface
- Write Swift implementation for iOS
- Write Kotlin implementation for Android
- Create tests for all platforms

Use platform-specific subagents for native code review.

---

## EAS Build and Update Integration

### EAS Build

```bash
# Build for iOS (development)
eas build --platform ios --profile development

# Build for Android (preview)
eas build --platform android --profile preview

# Build both platforms
eas build --platform all --profile production
```

### EAS Update (Over-the-Air)

```bash
# Push an OTA update
eas update --branch production --message "Fix settings screen toggle"

# Preview update before pushing
eas update --branch preview --message "Test dark mode toggle"
```

### Via Expo MCP in Claude Code

```
"Build the app for iOS development profile"
"Push an OTA update to the preview branch with message 'Add settings screen'"
"Check the build status for the latest iOS build"
```

---

## Common React Native Gotchas

### 1. Metro Bundler Cache

If changes don't appear after editing:

```bash
# Clear Metro cache
npx expo start --clear

# Or manually:
rm -rf node_modules/.cache
npx expo start
```

### 2. Native Module Version Mismatch

```
Error: Invariant Violation: Native module cannot be null
```

**Fix**: Rebuild the dev client after adding native modules:

```bash
# Managed workflow
eas build --platform ios --profile development

# Bare workflow
cd ios && pod install && cd ..
npx react-native run-ios
```

### 3. Flipper/Debugger Issues

React Native debugger can interfere with network requests:

```typescript
// Disable in dev if causing issues
if (__DEV__) {
  // @ts-ignore
  global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest;
}
```

### 4. FlatList Performance

```typescript
// BAD: Renders all items
<ScrollView>
  {items.map(item => <ItemComponent key={item.id} />)}
</ScrollView>

// GOOD: Virtualized list
<FlatList
  data={items}
  renderItem={({ item }) => <ItemComponent item={item} />}
  keyExtractor={item => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### 5. TypeScript Path Aliases

Configure path aliases in `tsconfig.json` and `babel.config.js`:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        alias: { '@': './src' },
      }],
    ],
  };
};
```

---

## Recommended Workflow by Task Type

| Task | Tools | Approach |
|------|-------|----------|
| New screen | Serena + Write | Read navigation, create component, hot reload |
| Fix a bug | Serena + Read + Edit | Navigate to symbol, read, edit, hot reload |
| Add dependency | Bash (npm/yarn) | Install package, rebuild if native |
| UI polish | mobile-mcp + Edit | Screenshot, identify issues, edit, re-screenshot |
| Write tests | Serena + Write + Bash | Read component, create test, run jest |
| Production build | Expo MCP | EAS Build for iOS/Android |
| OTA update | Expo MCP | EAS Update to target branch |

---

## See Also

- [setup-guide.md](../setup-guide.md) - MCP installation instructions
- [react-native-subagent.md](react-native-subagent.md) - React Native specialist subagent definition
- [react-native-claude-md-template.md](react-native-claude-md-template.md) - CLAUDE.md template for RN/Expo projects
- [10-subagents/guide.md](../../10-subagents/guide.md) - General subagent creation guide
