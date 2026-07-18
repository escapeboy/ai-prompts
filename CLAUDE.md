# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a **documentation-only** library of reusable prompts, guides, and agent definitions for optimizing Claude Code workflows. There is no application code, no build system, no tests. All content is Markdown files organized in numbered directories.

## Architecture

The library follows a sequential learning path (01 through 14), where each directory is a self-contained topic:

- **01-global-optimization** - One-time `~/.claude/` setup (CLAUDE.md global instructions, agents, skills)
- **02-project-activation** - Per-project Serena MCP activation and memory creation
- **03-custom-skills** - Skill authoring guide + template (YAML frontmatter + Markdown body, placed in `~/.claude/skills/<name>/SKILL.md`)
- **04-research-integration** - Keeping docs current with Claude API changes
- **05-token-optimization** - Token reduction techniques and measurement
- **06-advanced-patterns** - Multi-agent coordination, Agent Teams (v2.1.32+), checkpoint systems, constitutions, selective deep plan analysis, session observability
- **07-custom-commands** - Ready-to-use slash commands (debug, i18n, qa, seo, deploy, refactor, perf)
- **08-ui-ux-development** - UI/UX implementation workflow with browser testing via Chrome MCP
- **09-laravel-mcp-integration** - Laravel Boost + LaraPlugins.io MCP setup, CLAUDE.md template for Laravel projects
- **10-subagents** - Custom subagent creation (YAML frontmatter format with model/tools/mcpServers fields)
- **11-mobile-development** - iOS, Android, React Native, Flutter guides with MCP servers, subagents, CLAUDE.md templates, and cross-platform skills
- **12-desktop-development** - macOS, Tauri, Electron guides with MCP servers, subagents, CLAUDE.md templates, and cross-platform skills
- **13-security-hardening** - MCP CVEs, vetting checklists, prompt injection defense hooks, production safety rules, permissions.deny templates
- **14-webmcp** - WebMCP (W3C Draft) integration guide: navigator.modelContext API, browser tool registration, Chrome/Playwright MCP integration
- **15-context-mode** - context-mode MCP plugin: sandbox tool output to protect context window, session continuity after compaction, tool hierarchy (ctx_batch_execute → ctx_search → ctx_execute)
- **16-autonomous-agents** - Running Claude Code unattended: cron journaling agents, heartbeat watchdog protocol, watchdog detection patterns, /loop usage, heartbeat template + session-summary Stop hook

## Key Patterns

**Document format**: Most files use YAML frontmatter (`---` delimited) for metadata, followed by structured Markdown. Skill files and subagent definitions both use this pattern.

**Two types of actionable files**:
1. **Guides** (`guide.md`) - Human-readable walkthroughs meant to be read
2. **Agents** (`*-agent.md`, subagent examples) - Executable prompts meant to be pasted into Claude Code conversations

**Serena MCP integration**: Many guides reference Serena memories (stored in `.serena/memories/`) for project-specific context. Memory files use plain Markdown.

**Constitution files**: Architectural decision frameworks stored as JSON in `.claude/settings/constitution.json` per project.

## Conventions

- Directory names are zero-padded numbers followed by kebab-case topic names
- Each directory has a `guide.md` as its primary entry point
- Templates use bracket placeholders: `[Description]`, `[Step 1]`
- Token savings estimates are included in guides where applicable
- Version history is tracked in the root `README.md` (current: v1.22.0)
- Compatible with Claude Fable 5, Opus 4.8/4.7/4.6, Sonnet 5/4.6, Haiku 4.5

## When Editing

- Maintain the existing Markdown heading hierarchy and section structure
- Preserve YAML frontmatter fields and format in skill/agent templates
- Keep the numbered directory ordering consistent (don't renumber)
- Update the version history in `README.md` when adding new sections or making significant changes
- Cross-reference related guides when adding new content, and make links **bidirectional** — if a new file points at an existing one, add a reciprocal link back from that file. Use relative paths (e.g., link a new skill to `03-custom-skills/guide.md`, and the related numbered sections back to the skill). Treat the library as a network of cross-links, not a flat list.
- For content that spans many variants (frameworks, platforms, providers), use the reference-split (matrix) shape: a thin core with a dispatcher table routing to per-variant files, as in `11-mobile-development` / `12-desktop-development`. See `03-custom-skills/guide.md` → *Pattern 5*.

## Releasing

Every version bump produces four artifacts, kept in sync:

1. **CHANGELOG.md** — full entry (`## [X.Y.Z] — YYYY-MM-DD` with Added/Updated sections)
2. **README.md** — "Version History" entry + footer `**Version**:` bump; also bump the `current: vX.Y.Z` line in this file
3. **Annotated git tag** — `git tag -a vX.Y.Z -m "vX.Y.Z — <theme>"`, pushed with `--follow-tags`
4. **GitHub Release** — `gh release create vX.Y.Z --verify-tag --title "vX.Y.Z — <Theme>" --notes-file <file>`, where the notes file is that version's CHANGELOG section body

Before publishing, sweep changed files for private references (personal project names, hostnames, usernames, local paths) — this is a public repo.
