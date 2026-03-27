# Changelog

All notable changes to this library are documented here.

---

## [1.12.0] — 2026-03-27

### Added

**13-security-hardening/guide.md** — нова секция "Production Hook Library" (секция 8)

- Пълна файлова структура: `~/.claude/hooks/` с 3 bash скрипта
- `settings.json` регистрация с matcher-based формат (нов в Claude Code)
- `dangerous-actions-blocker.sh` — PreToolUse (всички tools): блокира `rm -rf /`, `DROP TABLE`, force push към main, protected files
- `pre-commit-secrets.sh` — PreToolUse (Bash): сканира staged файлове за API ключове преди `git commit`
- `smart-suggest.sh` — UserPromptSubmit: предлага правилния инструмент на базата на prompt intent (1 suggestion max, silent on no match)
- Обяснение на `exit 2` vs `exit 0` семантиката и `async: true` за Stop hooks
- PostToolUse hook примери: PHP syntax check, migration safety warning, .env guard

**06-advanced-patterns/agent-teams-guide.md** — нова секция 7 "/agent-team Skill (Recommended)"

- `/agent-team` skill като препоръчан начин за стартиране на agent teams (вместо ad-hoc prompts)
- 4 preset режима: `pr-review`, `debug`, `feature`, `custom`
- Feature flag чрез `settings.json env` блок (не само environment variable)
- Навигационна таблица: `Shift+Down`, `Ctrl+T`, `Escape`
- Skill поведение: confirm → warn cost → brief teammates → wait → synthesize → cleanup

**10-subagents/guide.md** — нова секция "Production Agents (Real Examples)"

- `plan-challenger` (Opus) — adversarial plan review по 5 измерения с refutation check. Laravel-специфични проверки включени
- `output-evaluator` (Haiku) — LLM-as-Judge: APPROVE/NEEDS_REVIEW/REJECT verdict преди commit
- `loop-monitor` (Haiku) — watchdog за автономни сесии: stall/runaway/loop detection с bash integration пример

### Updated

- `CHANGELOG.md` — bumped to v1.12.0

---

## [1.11.0] — 2026-03-26

### Updated

**10-subagents/guide.md** — нови frontmatter полета от v2.0.43–v2.1.83

- `disallowedTools` — explicitly block tools incl. `Task(AgentName)` syntax
- `permissionMode` — `default` / `acceptEdits` / `plan` / `bypassPermissions`
- `background: true` — always run as background task (v2.1.49)
- `isolation: "worktree"` — isolated git worktree per agent run (v2.1.49)
- `effort` — `low` / `medium` / `high` model effort level (v2.1.78)
- `maxTurns` — max turns before stopping (v2.1.78)
- `hooks` — PreToolUse/PostToolUse/Stop hooks scoped to agent lifecycle (v2.0.43)
- `memory` — persistent memory scope: `user` / `project` / `local` (v2.1.33)
- `initialPrompt` — auto-submit first turn on agent start (v2.1.83)
- `skills` — skills to auto-load for this agent (v2.0.43)
- Full model IDs accepted in `model:` field (e.g. `claude-sonnet-4-6`) (v2.1.74)
- Full-featured example с всички нови полета добавен

**03-custom-skills/guide.md** — нови frontmatter полета и variables

- `context: fork` — run in isolated forked sub-agent (v2.1.0)
- `agent` — delegate execution to specific agent type (v2.1.0)
- `user-invocable: false` — hide from slash command menu (v2.1.0)
- `effort` — override model effort level per skill (v2.1.76)
- `allowed-tools` — YAML list syntax + wildcard `mcp__server__*` (v2.1.0)
- `hooks` — hooks scoped to skill run (v2.0.43)
- Arguments: `$0`, `$1` shorthand (v2.1.19) и `$ARGUMENTS[N]` bracket syntax
- Variables: `${CLAUDE_SESSION_ID}` (v2.1.9), `${CLAUDE_SKILL_DIR}` (v2.1.69)

### Updated

- `CHANGELOG.md` — bumped to v1.11.0

---

## [1.10.0] — 2026-03-21

### Added

**07-custom-commands/content-review.md** — `/content-review` skill for auditing user-facing content

- Comprehensive content audit: documentation, UI copy, error messages, translations
- Scope filtering: `docs`, `ui`, `errors`, `api`, or full audit (default)
- Technical accuracy checks against codebase (models, routes, config)
- Consistency audit: terminology, capitalization, duplicate PHP array keys
- Language-specific checks: Bulgarian sentence case, comma rules, Latin/Cyrillic mixing, formal register
- Structured report output: Critical/High/Medium categories with file:line references
- Quality checklist for all content types (labels, errors, placeholders, buttons, docs)
- Based on production audits of Zonex/Signalio translation files (23+ issues found and fixed)

### Updated

- `README.md` — added content-review to 07-custom-commands listing, bumped to v1.10.0
- `CHANGELOG.md` — documented v1.10.0 changes

---

## [1.9.0] — 2026-03-20

### Added

**WebMCP Integration Guide** (`14-webmcp/guide.md`) — structured browser tools for AI agents

- W3C Draft Community Group Report (February 2026), jointly developed by Google and Microsoft
- `navigator.modelContext` API: `registerTool()`, `unregisterTool()`, `requestUserInteraction()`
- WebMCP vs MCP comparison — frontend/ephemeral (browser tab) vs backend/persistent (server-side)
- Three implementation patterns: read-only data exposure, form actions with user confirmation, declarative HTML
- Integration workflows for Chrome MCP (`claude-in-chrome`) and Playwright MCP
- CLAUDE.md template section for WebMCP-enabled projects
- Browser support matrix: Chrome 146 Canary (behind flag), Edge expected, Firefox/Safari no plans
- Current limitations: tab-bound, no discovery, spec instability, same-origin only
- **89% token savings** vs screenshot-based agent approaches

### Updated

- `README.md` — added 14-webmcp section, bumped version to 1.9.0

---

## [1.8.0] — 2026-03-20

### Fixed

**Critical: ~/.claude/ setup audit** — identified and fixed files Claude Code never reads

- `~/.claude/system-prompts/` is NOT loaded by Claude Code — migrated global optimization rules and symbol-first protocol to `~/.claude/CLAUDE.md` (the only file Claude Code reads as global instructions)
- `~/.claude/settings/*.json` (prompt-caching.json, beta-features.json, model-strategy.json, token-optimization.json) are reference documentation only — they do not configure Claude Code behavior
- Removed 13 duplicate SKILL.md copies from `~/.claude/settings/` (canonical copies already in `~/.claude/skills/`)
- Removed 15 misplaced .md files from `~/.claude/settings/` (agent/command copies that don't belong there)
- Removed dead docs from `~/.claude/` root: README.md, QUICK-REFERENCE.md, INSTALLATION-COMPLETE.md (never loaded by Claude Code)
- Updated all model IDs to current: `claude-opus-4-6`, `claude-sonnet-4-6`, `claude-haiku-4-5-20251001`

**01-global-optimization/guide.md** — added compatibility notice table explaining what Claude Code actually reads from `~/.claude/`

### Updated

- `CLAUDE.md` — corrected architecture description (system prompts → CLAUDE.md), updated model compatibility to Sonnet 4.6
- `README.md` — bumped to v1.8.0, documented audit findings

---

## [1.7.1] — 2026-03-20

### Added

**06-advanced-patterns/parallel-agents-guide.md** — Git isolation with Worktrunk

- New section: "Git Isolation with Worktrunk" for running parallel Claude agents in isolated git worktrees
- [Worktrunk](https://worktrunk.dev/) CLI — manages worktrees so each agent operates on a separate branch/directory
- Installation instructions (Homebrew, Cargo, shell integration)
- Core commands reference (`wt switch`, `wt list`, `wt merge`, `wt remove`)
- Claude Code parallel workflow example with 3 concurrent agents
- Hooks integration (`.worktrunk.toml` — `on-create`, `post-merge`)
- Decision table: when to use worktrees vs in-process parallelism

### Updated

- `README.md` — added Worktrunk to Related Tools, updated parallel-agents-guide description, bumped to v1.7.1

---

## [1.7.0] — 2026-03-18

### Fixed

**01-global-optimization/** — resolved issue #1 (skills with no content, side notes breaking structure)

- Created all 5 missing `SKILL.md` files for global skills:
  - `skills/optimize/SKILL.md` — task complexity analysis, planning strategy selection, model routing, session metrics
  - `skills/context/SKILL.md` — full memory lifecycle (load, save, list, refresh, inspect, clear), token savings documentation
  - `skills/cache-inspector/SKILL.md` — cache hit rate monitoring, cost breakdown, optimization recommendations, full report action
  - `skills/update-docs/SKILL.md` — web research + doc comparison + targeted update workflow with `--scope` flag
  - `skills/init-project/SKILL.md` — stack detection for 8+ frameworks, constitution generation, memory creation, per-framework templates
- Created 2 missing system prompt files (previously referenced as placeholders):
  - `system-prompts/global-optimization.md` — all MANDATORY/AUTOMATIC optimization rules, ready to copy to `~/.claude/`
  - `system-prompts/symbol-first-protocol.md` — complete protocol with 5 usage patterns, token savings table, fallback strategy
- Removed circular reference in `setup-agent.md` — no longer references `*[Copy from your machine]*`; now points to actual files in repo with copy commands
- Updated `guide.md` Steps 4–6 to replace placeholder text with real links and descriptions

**README.md** — fixed section ordering (12-desktop-development now appears before 13-security-hardening)

### Added

**03-custom-skills/guide.md** — added `pwa.md` and global skills as examples in the Examples section

**04-research-integration/guide.md** — added cross-reference to `sources.md`

### Fixed

**01-global-optimization/skills/init-project/SKILL.md** — fixed broken iOS link (`ios/guide.md` → `ios/ios-guide.md`)

---

## [1.6.0] — 2026-03-09

### Added

**13-security-hardening/** — new section

- MCP CVE table (2025-2026): 11 vulnerabilities with affected versions, CVSS scores, and patches
- 5-minute MCP audit checklist + community-vetted safe/unsafe list
- Prompt injection defense hooks (PreToolUse scanner + PostToolUse output monitor)
- 6 production safety rules with concrete `settings.json` deny rules and bash hook implementations:
  - Port Stability, Database Safety, Feature Completeness, Infrastructure Lock, Dependency Safety, Pattern Conformance
- `permissions.deny` hardening templates (global `~/.claude/` and per-project `.claude/`)
- Agent Skills supply chain risk data (36.8% of public skills have security flaws per Snyk 2026 scan)
- Incident response playbook (detect, contain, rotate, patch)

**06-advanced-patterns/agent-teams-guide.md**

- Native Agent Teams experimental feature (Claude Code v2.1.32+, Opus 4.6, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)
- Architecture overview: peer-to-peer messaging, git-based task claiming, isolated 1M-token contexts per agent
- Decision matrix: Agent Teams vs Task tool (Parallel Agents) vs Dual-Instance vs Multi-Instance
- Setup guide with verification steps
- 4 copy-paste prompt patterns: pre-release review, security PR review, multi-file doc update, parallel refactor
- Limitations and anti-patterns

**06-advanced-patterns/observability-guide.md**

- `cs` bash alias for fast session search (keyword + project filter, ~15ms)
- Community tools comparison (session-search.sh vs claude-conversation-extractor vs ran CLI)
- Per-session and weekly cost tracking scripts (Python, no external deps)
- Pricing reference table (Opus 4.6, Sonnet 4.5, Haiku 4.5)
- Most-read files analysis (candidates for Serena memory or prompt caching)
- Tool usage distribution analysis
- Cross-folder session migration guide
- Team aggregate usage reporting

### Updated

- `README.md` — bumped to v1.6.0, documented all new guides, added claude-code-ultimate-guide to community resources
- `CLAUDE.md` — updated architecture section with sections 06 and 13 descriptions

---

## [1.5.0] — 2026-02-15

### Added

**03-custom-skills/examples/module-mcp/** — `/module:mcp` skill
- Full MCP server implementation for any Laravel project
- Domain analysis → tool scaffolding → implementation workflow
- Read/Write/Destructive tool patterns with proper annotations
- Dual transport (HTTP/SSE + stdio), auth bootstrap trait, global scope fix
- `analyze`, `add <domain>`, `sync` subcommands

**03-custom-skills/examples/module-assistant/** — `/module:assistant` skill
- AI assistant chat panel (Livewire, PrismPHP, resizable sidebar)
- Three provider strategies: cloud (native tools), Claude Code (`<tool_call>` loop), Codex (MCP native)
- Role-based tool registry (read/write/destructive tiers)

---

## [1.4.0] — 2026-02-14

### Added

**12-desktop-development/** — desktop development section
- macOS native (SwiftUI/AppKit) with XcodeBuildMCP + xclaude-plugin
- Tauri v2 (Rust + web) with tauri-plugin-mcp
- Electron (Node.js + Chromium) with electron-mcp-server
- Platform-specific subagents and CLAUDE.md templates for all three platforms
- Cross-platform `/desktop-build` and `/desktop-test` skills

---

## [1.3.0] — 2026-02-14

### Added

**11-mobile-development/** — mobile development section
- iOS (Swift/SwiftUI) with XcodeBuildMCP (59 tools) and xclaude-plugin (87% token savings)
- Android (Kotlin/Compose) with JetBrains MCP and android-mcp-server (ADB)
- React Native with Expo MCP (EAS Build/Update)
- Flutter with Dart/Flutter MCP, Flutter MCP, DCM MCP (450+ rules)
- Platform-specific subagents and CLAUDE.md templates for all four platforms
- Cross-platform `/mobile-build` and `/mobile-test` skills

---

## [1.2.0] — 2026-02-09

### Added

**09-laravel-mcp-integration/** — Laravel MCP ecosystem
- Laravel Boost MCP setup guide (official Laravel MCP server)
- LaraPlugins.io MCP configuration for package discovery
- CLAUDE.md template for Laravel projects (Livewire, Inertia, Filament variants)
- Laravel-specialized subagent with Boost MCP integration

**10-subagents/** — custom subagent system
- Complete subagent creation guide with YAML frontmatter format
- Tool access patterns (read-only, research, code writer, full access)
- Model selection guide (haiku/sonnet/opus by task type)
- Four example subagents: code-reviewer, laravel-specialist, debugger, test-generator

**06-advanced-patterns/** — selective deep plan analysis
- Tiered agent selection system (Tier 1/2/3) to prevent context overflow
- Context budget calculator formula
- Agent priority matrix by project type
- Compact-between-agents and background agent patterns

### Updated

- Model compatibility to Claude 4.6 (Opus 4.6, Sonnet 4.5, Haiku 4.5)

---

## [1.1.0] — 2026-01-22

### Added

**08-ui-ux-development/** — UI/UX development section
- UI/UX Pro Max skill: 50+ styles, 21 color palettes, 50 font pairings
- Dashboard workflow guide with real API integration patterns
- Browser testing guide with Chrome DevTools automation (Claude in Chrome MCP)
- Security best practices: XSS prevention, CSRF protection, empty state patterns

---

## [1.0.0] — 2026-01-04

### Added

Initial release:
- **01-global-optimization** — `~/.claude/` setup: PM Orchestrator, settings, skills, system prompts
- **02-project-activation** — Serena MCP activation and memory templates
- **03-custom-skills** — Skill authoring guide, template, and examples
- **04-research-integration** — Research agent for keeping docs current
- **05-token-optimization** — Token reduction techniques and measurement
- **06-advanced-patterns** — Parallel agents, checkpoint system, constitution framework
- **07-custom-commands** — debug, i18n, qa, seo, deploy, refactor, perf skills
