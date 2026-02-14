# Tauri CLAUDE.md Template

**Copy this template to your Tauri project root as `CLAUDE.md` and customize for your project.**

---

```markdown
# CLAUDE.md - [Project Name]

## Project Overview

- **Type**: Desktop application (Tauri v2)
- **Backend**: Rust
- **Frontend**: [React / Vue / Svelte / Solid] with TypeScript
- **Bundler**: [Vite / Webpack / Turbopack]
- **Minimum Tauri**: 2.x
- **Target Platforms**: [macOS / Windows / Linux / All]
- **Description**: [Brief description of what this app does]

## Architecture

### Stack
- **Backend**: Rust (src-tauri/)
- **Frontend**: [React / Vue / Svelte] with [TypeScript / JavaScript]
- **Styling**: [Tailwind CSS / CSS Modules / Styled Components / Plain CSS]
- **State Management**: [Zustand / Pinia / Svelte stores / Redux / None]
- **Storage**: [tauri-plugin-store / SQLite (rusqlite) / sled / File-based]
- **Routing**: [React Router / Vue Router / SvelteKit routing / None]

### Directory Structure
```
[ProjectName]/
  src/                    # Frontend source
    components/           # UI components
    lib/                  # Utilities, API bindings
    styles/               # Global styles
    App.tsx               # Root component
    main.tsx              # Frontend entry point
  src-tauri/              # Rust backend
    src/
      lib.rs              # App setup, plugin and command registration
      main.rs             # Entry point (generated)
      commands.rs         # IPC command handlers
      state.rs            # Shared application state
    capabilities/         # Permission definitions
      default.json        # Default window permissions
    Cargo.toml            # Rust dependencies
    tauri.conf.json       # App configuration
  package.json            # Frontend dependencies
  tsconfig.json           # TypeScript configuration
```

## Conventions

### Rust Backend
- Use `#[tauri::command]` for all IPC handlers
- Prefer `async` commands for I/O-bound operations
- Return `Result<T, String>` from commands (or custom serializable error types)
- Use `tauri::State<>` for shared state
- Group related commands in separate modules
- Use official Tauri plugins before writing custom code

### Frontend
- Use `invoke<T>()` from `@tauri-apps/api/core` for IPC calls
- Define TypeScript interfaces matching Rust structs exactly
- Handle all IPC errors with try/catch
- Use `@tauri-apps/api/path` for file paths (never hardcode)
- Use `@tauri-apps/api/event` for backend-to-frontend events

### IPC Naming
- Rust commands: `snake_case` (`read_file`, `save_document`)
- Frontend invoke calls: match Rust names exactly
- Events: `kebab-case` (`download-progress`, `file-changed`)

### Security
- Declare minimum permissions in `src-tauri/capabilities/`
- Keep CSP restrictive in `tauri.conf.json`
- Validate all inputs in Rust command handlers
- Use `fs:scope` to limit file system access
- Never expose `shell:allow-execute` without path restrictions

## Testing

### Rust Tests
```bash
# Run all Rust tests
cd src-tauri && cargo test

# Run specific test
cd src-tauri && cargo test test_name
```

### Frontend Tests
```bash
# Run frontend tests
npm test

# Run with coverage
npm test -- --coverage
```

### Integration Testing
```bash
# Run with dev server for manual testing
cargo tauri dev
```

## Commands

### Development
```bash
# Start dev server with hot-reload
cargo tauri dev

# Check Rust compilation without building
cd src-tauri && cargo check

# Frontend type-check
npx tsc --noEmit
```

### Build
```bash
# Build for current platform
cargo tauri build

# Build macOS DMG
cargo tauri build --bundles dmg

# Build with debug symbols
cargo tauri build --debug
```

### Code Quality
```bash
# Rust linting
cd src-tauri && cargo clippy

# Rust formatting
cd src-tauri && cargo fmt

# Frontend linting
npm run lint

# Frontend formatting
npx prettier --write src/
```

## MCP Servers

This project uses the following MCP servers:
- **tauri-plugin-mcp** (project): Screenshots, DOM inspection, window management
- **Serena** (user): Code intelligence and symbol navigation

## Important Notes

- **Tauri v2 only** - This project uses Tauri v2 APIs; do not reference v1 patterns
- **Capabilities required** - Any new plugin or system access needs a capability declaration
- **CSP** - External resources must be whitelisted in the Content Security Policy
- [Add project-specific notes here]
- [Example: "Uses SQLite for local data persistence"]
- [Example: "Auto-updates via tauri-plugin-updater"]
```

---

## Customization Guide

### If Using React Frontend

```markdown
### React
- Framework: React 18+ with TypeScript
- State: [Zustand / Redux Toolkit / Context]
- Routing: [React Router v6 / TanStack Router / None]
- Data fetching: IPC invoke (no REST/GraphQL)
- Components in: `src/components/`
```

### If Using Vue Frontend

```markdown
### Vue
- Framework: Vue 3 with Composition API
- State: [Pinia / Vuex / None]
- Routing: [Vue Router / None]
- Styling: [Tailwind / UnoCSS / Scoped CSS]
- Components in: `src/components/`
```

### If Using Svelte Frontend

```markdown
### Svelte
- Framework: Svelte 4+ (or Svelte 5 with runes)
- State: Svelte stores
- Routing: [SvelteKit routing / None]
- Styling: Scoped component styles
- Components in: `src/lib/components/`
```

### If Using SQLite Storage

```markdown
### Storage
- Database: SQLite via rusqlite (Rust) or tauri-plugin-sql
- Database location: `appDataDir()/[app-name].db`
- Migrations: [sqlx migrations / manual SQL / diesel]
- Queries: Prepared statements with parameterized inputs
```

### If Using Custom Plugins

```markdown
### Custom Plugins
- Plugin source: `src-tauri/src/plugins/`
- Each plugin has its own module with `init<R: Runtime>() -> TauriPlugin<R>`
- Plugin commands namespaced: `plugin:my-plugin|command-name`
- Plugin permissions in dedicated capability files
```
