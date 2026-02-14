---
name: desktop-test
description: Cross-platform desktop test skill - auto-detects platform and runs tests for macOS, Tauri, or Electron
version: 1.0.0
---

# Desktop Test

Run tests for desktop applications across macOS native, Tauri, and Electron with automatic platform detection.

---

## Usage

```
/desktop-test [platform] [options]
```

### Quick Examples

```bash
/desktop-test                              # Auto-detect platform and run all tests
/desktop-test macos                        # Run macOS tests
/desktop-test tauri --filter="file_ops"    # Run Tauri Rust tests matching "file_ops"
/desktop-test electron --e2e               # Run Electron Playwright tests
/desktop-test electron --coverage          # Run Electron tests with coverage
```

---

## Actions

### 1. Auto-Detect Platform (Default)

When invoked without a platform argument, detect the platform from project files:

**Detection rules** (same as `/desktop-build`):
- `*.xcodeproj` or `*.xcworkspace` (without `ios/` subdirectory) → **macOS**
- `src-tauri/tauri.conf.json` → **Tauri**
- `electron` in `package.json` dependencies → **Electron**

**Process**:
1. Scan project root for platform indicator files
2. Identify platform
3. Run the platform-specific test action
4. Report test results summary

---

### 2. macOS Tests

**Usage**:
```
/desktop-test macos [options]
```

**Process**:
1. Identify test scheme and target
2. Run: `xcodebuild test -scheme [Scheme] -destination 'platform=macOS'`
3. Parse test results
4. Report pass/fail summary

**Options**:
- `--filter=PATTERN` - Run tests matching pattern (`-only-testing:TestTarget/TestClass`)
- `--ui` - Run UI tests instead of unit tests
- `--coverage` - Generate code coverage report

**Example**:
```
/desktop-test macos --filter="PreferencesViewTests" --coverage
```

---

### 3. Tauri Tests

Tauri projects have two test layers: Rust backend and frontend.

**Usage**:
```
/desktop-test tauri [options]
```

**Process**:
1. Run Rust tests: `cd src-tauri && cargo test`
2. Run frontend tests: `npm test`
3. Report combined pass/fail summary

**Options**:
- `--filter=PATTERN` - Filter Rust tests (`cargo test PATTERN`) and frontend tests
- `--rust-only` - Run only Rust backend tests
- `--frontend-only` - Run only frontend tests
- `--coverage` - Generate coverage for both layers
- `--verbose` - Show full test output

**Example**:
```
/desktop-test tauri --filter="commands" --rust-only
```

---

### 4. Electron Tests

Electron projects have three test layers: main process, renderer, and E2E.

**Usage**:
```
/desktop-test electron [options]
```

**Process**:
1. Run unit tests: `npm test` (covers main + renderer)
2. If `--e2e`: Run Playwright tests: `npx playwright test e2e/`
3. Report pass/fail summary

**Options**:
- `--filter=PATTERN` - Filter tests by name or path
- `--e2e` - Run Playwright E2E tests (requires app to be buildable)
- `--coverage` - Generate coverage report
- `--verbose` - Show full test output

**Example**:
```
/desktop-test electron --e2e --filter="settings"
```

---

## Options

### Flags (Boolean)

| Flag | Short | Description |
|------|-------|-------------|
| `--coverage` | | Generate code coverage report |
| `--verbose` | `-v` | Show detailed test output |
| `--ui` | | Run UI tests (macOS only) |
| `--e2e` | | Run E2E / Playwright tests |
| `--rust-only` | | Tauri: run only Rust tests |
| `--frontend-only` | | Tauri: run only frontend tests |

### Options (With Values)

| Option | Description | Default |
|--------|-------------|---------|
| `--filter=PATTERN` | Test name/path filter | All tests |

---

## Token Optimization

**Estimated token usage**:
- Auto-detect + run tests: ~2.5K tokens
- Platform-specific tests: ~2K tokens
- With coverage report: ~3K tokens
- E2E tests: ~4K tokens

**Optimization features**:
- Parses test output and reports only the summary (pass/fail counts)
- Shows individual test names only for failures
- Uses `--filter` to avoid running unrelated tests
- Coverage report summarized as percentage, not full line-by-line output
- Disambiguates from mobile projects (checks for `ios/` subdirectory)

---

## Error Handling

### Error: "No tests found"

**Symptom**: Test runner reports 0 tests executed

**Cause**: Test files not in expected location or naming convention wrong

**Solution**:
- macOS: Tests must be in a test target, files end with `Tests.swift`
- Tauri (Rust): Tests in `#[cfg(test)]` modules or `tests/` directory
- Tauri (frontend): Files match `**/*.test.{ts,tsx}` or `**/*.spec.{ts,tsx}`
- Electron: Check Jest/Vitest config for test file patterns

### Error: "Test compilation failed"

**Symptom**: Tests fail to compile before running

**Cause**: Test code references unavailable symbols or has syntax errors

**Solution**: Build the project first with `/desktop-build`, then retry tests

### Error: "Playwright cannot launch Electron"

**Symptom**: E2E tests fail with "Cannot find Electron executable"

**Cause**: Electron not installed or not in expected location

**Solution**:
```bash
# Ensure Electron is installed
npm install electron

# Or specify path in test config
# _electron.launch({ executablePath: './node_modules/.bin/electron', args: ['.'] })
```

---

## See Also

- [desktop-build.md](desktop-build.md) - Cross-platform build skill
- [../setup-guide.md](../setup-guide.md) - MCP server installation
- [03-custom-skills/guide.md](../../03-custom-skills/guide.md) - How to create skills
