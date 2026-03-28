# context-mode Guide

**Sandbox MCP tool output to protect your context window**

context-mode is a Claude Code plugin and MCP server that prevents raw tool output from flooding your context window. It sandboxes commands, indexes results into SQLite FTS5, and restores session state after conversation compaction.

**Source**: [github.com/mksglu/context-mode](https://github.com/mksglu/context-mode)

---

## Table of Contents

1. [What Problem It Solves](#what-problem-it-solves)
2. [Installation](#installation)
3. [Tool Reference](#tool-reference)
4. [Tool Selection Hierarchy](#tool-selection-hierarchy)
5. [Forbidden Patterns](#forbidden-patterns)
6. [Session Continuity](#session-continuity)
7. [Configuration](#configuration)
8. [Integration with Other Optimizations](#integration-with-other-optimizations)
9. [Diagnostics](#diagnostics)

---

## What Problem It Solves

Raw MCP tool output is expensive and destructive to long sessions:

| Raw operation | Context cost |
|---|---|
| Playwright page snapshot | ~56 KB |
| 20 GitHub issues | ~59 KB |
| Log file analysis | ~45 KB |
| Deep repo research (30 calls) | ~986 KB |

context-mode sandboxes these calls. Only a small BM25-ranked summary enters context:

| Operation | Raw | With context-mode | Savings |
|---|---|---|---|
| Repo research (5 calls) | 986 KB | 62 KB | 94% |
| Git history (500 commits) | ~300 KB | 5.6 KB | 98% |
| Large JSON API | 7.5 MB | 0.9 KB | 99.9% |
| Log file | 45 KB | 155 B | 99.6% |

**Second problem**: After Claude Code compacts the conversation, the model loses in-progress file edits, task state, and decisions. context-mode captures all events to SQLite and restores them via search on `--continue`.

---

## Installation

### Claude Code plugin (recommended)

Requires Claude Code v1.0.33+.

```bash
/plugin marketplace add mksglu/context-mode
/plugin install context-mode@context-mode
```

Restart Claude Code, then verify:

```
/context-mode:ctx-doctor
```

All checks should show `[x]`.

### MCP-only (no hooks, no slash commands)

```bash
claude mcp add context-mode -- npx -y context-mode
```

This works but loses slash commands and the `sessionStart` hook that powers session continuity.

---

## Tool Reference

### `ctx_batch_execute` — Primary tool

Run multiple shell commands **and** search multiple queries in a single call. This is the default tool for any research or multi-step execution.

```python
ctx_batch_execute(
  commands=["git log --oneline -50", "npm test 2>&1 | tail -20"],
  queries=["recent breaking changes", "test failures"]
)
```

- Replaces 30+ Bash calls + 10+ search calls
- Auto-indexes all output for later `ctx_search`
- **986 KB raw → 62 KB in context**

### `ctx_search` — Follow-up queries

Query the knowledge base built by prior `ctx_batch_execute` or `ctx_index` calls. Always batch multiple questions in one call.

```python
ctx_search(queries=["auth middleware", "session token storage", "compliance requirements"])
```

### `ctx_execute` — Sandboxed code execution

Run code in 11 languages (JS, TS, Python, Shell, Ruby, Go, Rust, PHP, Perl, R, Elixir). Only stdout enters context.

```python
ctx_execute(language="python", code="import json, sys; data=json.load(open('big.json')); print(len(data['items']))")
```

Use the `intent` parameter to trigger auto-indexing when output exceeds 5 KB.

### `ctx_execute_file` — Sandboxed file processing

Process files without their raw content ever entering context.

```python
ctx_execute_file(path="storage/logs/laravel.log", language="shell", code="grep ERROR | tail -20")
```

- **45 KB log → 155 B summary**

### `ctx_fetch_and_index` — URL fetching

Fetch a URL, auto-detect HTML/JSON/text, convert, chunk, and index. The raw page never enters context.

```python
ctx_fetch_and_index("https://laravel.com/docs/11.x/routing")
# then:
ctx_search(queries=["named routes", "route model binding"])
```

- Replaces WebFetch entirely
- **60 KB page → 40 B index confirmation**

### `ctx_index` — Manual indexing

Chunk any markdown string into SQLite FTS5 for later search.

```python
ctx_index(content="...", source="architecture-notes")
```

### `ctx_stats` — Session statistics

Show context savings, call counts, and token reduction for the current session.

```
/context-mode:ctx-stats
```

### `ctx_doctor` — Diagnostics

Check runtimes, hooks, FTS5 support, and plugin registration.

```
/context-mode:ctx-doctor
```

### `ctx_upgrade` — Upgrade in place

Upgrade to latest version, rebuild, reconfigure hooks.

```
/context-mode:ctx-upgrade
```

---

## Tool Selection Hierarchy

Follow this order. Never skip to a lower tier when a higher tier applies.

### Tier 1 — Gather (use first)

```
ctx_batch_execute(commands=[...], queries=[...])
```

- One call for ALL initial research
- Combines shell execution + knowledge base population + search
- If you find yourself making 3+ Bash calls for related research, consolidate into one `ctx_batch_execute`

### Tier 2 — Follow-up (use after Tier 1)

```
ctx_search(queries=["q1", "q2", "q3"])
```

- Batch ALL follow-up questions in a single call
- Never call `ctx_search` once per question

### Tier 3 — Processing (use for specific transformations)

```
ctx_execute(language, code)
ctx_execute_file(path, language, code)
```

- API calls, log analysis, data transformation
- When you need to process a specific file or run a specific computation

---

## Forbidden Patterns

These patterns waste context and must be avoided when context-mode is available:

| Forbidden | Use instead |
|---|---|
| `Bash` for commands producing >20 lines | `ctx_batch_execute` or `ctx_execute` |
| `Read` for file analysis | `ctx_execute_file` |
| `WebFetch` | `ctx_fetch_and_index` |
| Multiple separate `ctx_search` calls | One `ctx_search(queries=[...])` call |
| Multiple separate Bash calls for related research | One `ctx_batch_execute` |

---

## Session Continuity

context-mode captures every event to SQLite FTS5:

- File reads, edits, writes
- Task create/update/complete
- Git operations
- Bash commands
- Errors and user decisions

On `--continue` or after compaction, the model queries the event log and resumes without re-prompting the user for context.

**Supported editors**:

| Editor | Continuity support |
|---|---|
| Claude Code | Full |
| Gemini CLI | Full |
| VS Code Copilot | Full |
| OpenCode | Full |
| Cursor | Partial (missing `sessionStart` hook) |
| Codex CLI / Zed | None (no hook support) |

---

## Configuration

Security rules from `.claude/settings.json` (or `~/.claude/settings.json`) are automatically inherited and enforced inside the sandbox. Any `deny` rules in your settings file block the same commands inside `ctx_execute` and `ctx_batch_execute`. No extra configuration needed.

All data is local. No telemetry, no cloud sync, no account required. SQLite databases live in your home directory and are deleted at session end unless `--continue` is passed.

---

## Integration with Other Optimizations

context-mode stacks with the other techniques in this library:

| Combined with | Effect |
|---|---|
| Serena symbolic tools (02) | Symbol search stays efficient; large file dumps never needed |
| Memory system (02) | Memories answer "what did we decide" without re-reading files |
| Prompt caching (05) | Cached prompts + sandboxed tool output = near-zero context growth |
| Adaptive planning (05) | Research phase uses `ctx_batch_execute`; no file flooding |
| Agent Teams (06) | Each subagent gets a clean sandbox; parent context protected |

**Practical rule**: Use Serena for code navigation (symbols, references, edits). Use context-mode for everything that would produce bulk output (logs, APIs, web pages, shell commands, git history).

---

## Diagnostics

```
# Check everything is working
/context-mode:ctx-doctor

# See how much context you've saved this session
/context-mode:ctx-stats

# Upgrade to latest version
/context-mode:ctx-upgrade
```

If `ctx-doctor` shows a failing check:
1. Confirm Node.js 18+ is installed: `node --version`
2. Re-run the plugin install: `/plugin install context-mode@context-mode`
3. Restart Claude Code and re-run `ctx-doctor`
