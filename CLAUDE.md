# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a **documentation-only** library of reusable prompts, guides, and agent definitions for optimizing Claude Code workflows. There is no application code, no build system, no tests. All content is Markdown files organized in numbered directories.

## Architecture

The library follows a sequential learning path (01 through 12), where each directory is a self-contained topic:

- **01-global-optimization** - One-time `~/.claude/` setup (agents, settings, skills, system prompts)
- **02-project-activation** - Per-project Serena MCP activation and memory creation
- **03-custom-skills** - Skill authoring guide + template (YAML frontmatter + Markdown body, placed in `~/.claude/skills/<name>/SKILL.md`)
- **04-research-integration** - Keeping docs current with Claude API changes
- **05-token-optimization** - Token reduction techniques and measurement
- **06-advanced-patterns** - Multi-agent coordination, checkpoint systems, constitutions, selective deep plan analysis
- **07-custom-commands** - Ready-to-use slash commands (debug, i18n, qa, seo, deploy, refactor, perf)
- **08-ui-ux-development** - UI/UX implementation workflow with browser testing via Chrome MCP
- **09-laravel-mcp-integration** - Laravel Boost + LaraPlugins.io MCP setup, CLAUDE.md template for Laravel projects
- **10-subagents** - Custom subagent creation (YAML frontmatter format with model/tools/mcpServers fields)
- **11-mobile-development** - iOS, Android, React Native, Flutter guides with MCP servers, subagents, CLAUDE.md templates, and cross-platform skills
- **12-desktop-development** - macOS, Tauri, Electron guides with MCP servers, subagents, CLAUDE.md templates, and cross-platform skills

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
- Version history is tracked in the root `README.md` (current: v1.4.0)
- Compatible with Claude Opus 4.6, Sonnet 4.5, Haiku 4.5

## When Editing

- Maintain the existing Markdown heading hierarchy and section structure
- Preserve YAML frontmatter fields and format in skill/agent templates
- Keep the numbered directory ordering consistent (don't renumber)
- Update the version history in `README.md` when adding new sections or making significant changes
- Cross-reference related guides when adding new content (e.g., link from a new skill to `03-custom-skills/guide.md`)
