# Subagent Creation Guide

**Complete reference for creating custom Claude Code subagents.**

---

## File Format

Subagent files are Markdown (`.md`) with YAML frontmatter. The frontmatter defines the agent's configuration, and the Markdown body is the system prompt.

```markdown
---
name: agent-name
description: What this agent does (shown in selection UI)
model: sonnet
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

Your system prompt goes here in Markdown format.
```

### Full-Featured Example (v2.1.83+)

```markdown
---
name: safe-refactor
description: Refactors code in an isolated worktree, runs tests before merging
model: sonnet
effort: medium
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
disallowedTools:
  - WebSearch
permissionMode: acceptEdits
isolation: worktree
background: true
maxTurns: 30
memory: project
skills:
  - refactor
  - test
initialPrompt: |
  Load the project architecture from Serena memories,
  then wait for the user's refactor instructions.
hooks:
  Stop:
    - command: "echo 'Refactor agent done' | notify"
---

You are a safe refactoring agent. You work in an isolated git worktree
so your changes never affect the main branch until explicitly merged.

Always run tests after refactoring. Report what changed and why.
```

---

## YAML Frontmatter Fields

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Unique identifier for the agent |
| `description` | string | Brief description (shown when selecting agents) |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `model` | string | inherits | `haiku`, `sonnet`, `opus`, or full model ID (e.g. `claude-sonnet-5`) |
| `tools` | list | all | Which tools the agent can use |
| `disallowedTools` | list | none | Explicitly block tools (e.g. `Bash`, `Task(AgentName)`) |
| `permissionMode` | string | inherits | `default`, `acceptEdits`, `plan`, `bypassPermissions` |
| `mcpServers` | object | none | Inline MCP server definitions |
| `allowedTools` | list | none | MCP tool whitelist (e.g., `mcp__server__tool`) |
| `background` | bool | false | Always run as background task (v2.1.49) |
| `isolation` | string | none | `"worktree"` — run in isolated git worktree (v2.1.49) |
| `effort` | string | inherits | `low`, `medium`, `high` — model effort level (v2.1.78) |
| `maxTurns` | int | none | Max turns before stopping (v2.1.78) |
| `hooks` | object | none | PreToolUse/PostToolUse/Stop hooks scoped to this agent (v2.0.43) |
| `memory` | string | none | `user`, `project`, or `local` — persistent memory scope (v2.1.33) |
| `initialPrompt` | string | none | Auto-submit first turn on agent start (v2.1.83) |
| `skills` | list | none | Skills to auto-load for this agent (v2.0.43) |

### Model Selection Guide

| Model | Cost | Speed | Best For |
|-------|------|-------|----------|
| `haiku` | Low | Fast | Exploration, search, simple tasks |
| `sonnet` | Medium | Balanced | Code generation, analysis, standard dev |
| `opus` | High | Slower | Architecture decisions, complex reasoning |

**Rule of thumb**: Start with `haiku` for read-only tasks, `sonnet` for code writing, `opus` only for critical decisions.

**Full model IDs**: `model:` also accepts full identifiers: `claude-sonnet-5`, `claude-opus-4-8`, `claude-fable-5`, `claude-haiku-4-5-20251001`. Useful when you want to pin a specific version instead of an alias.

---

## Available Tools

### File System Tools

| Tool | Access | Description |
|------|--------|-------------|
| `Read` | Read | Read file contents |
| `Write` | Write | Create or overwrite files |
| `Edit` | Write | Edit existing files (find/replace) |
| `Glob` | Read | Find files by pattern |
| `Grep` | Read | Search file contents |
| `LS` | Read | List directory contents |

### Execution Tools

| Tool | Access | Description |
|------|--------|-------------|
| `Bash` | Execute | Run shell commands |
| `Task` | Delegate | Launch sub-tasks (nested agents) |

### Web Tools

| Tool | Access | Description |
|------|--------|-------------|
| `WebFetch` | Read | Fetch and process web pages |
| `WebSearch` | Read | Search the web |

### Notebook Tools

| Tool | Access | Description |
|------|--------|-------------|
| `NotebookRead` | Read | Read Jupyter notebooks |
| `NotebookEdit` | Write | Edit Jupyter notebooks |

---

## Tool Access Patterns

### Pattern: Read-Only (Safest)

For code review, analysis, and research agents that should never modify code:

```yaml
tools:
  - Read
  - Glob
  - Grep
```

### Pattern: Research

For agents that need to explore code and search the web:

```yaml
tools:
  - Read
  - Glob
  - Grep
  - WebFetch
  - WebSearch
  - Bash  # For running read-only commands like git log
```

### Pattern: Code Writer

For agents that generate and modify code:

```yaml
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
```

### Pattern: Full Access

For orchestration agents that need everything:

```yaml
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
  - Task
  - WebFetch
  - WebSearch
```

---

## Inline MCP Servers

Subagents can define their own MCP server connections:

```yaml
mcpServers:
  laravel-boost:
    command: php
    args: ["artisan", "boost:mcp"]
    transport: stdio
  custom-server:
    command: npx
    args: ["-y", "@my/mcp-server"]
    transport: stdio
    env:
      API_KEY: "${API_KEY}"
```

### Restricting MCP Tools

Use `allowedTools` to whitelist specific MCP tools:

```yaml
allowedTools:
  - mcp__laravel-boost__routes
  - mcp__laravel-boost__models
  - mcp__laravel-boost__schema
```

This prevents the agent from using other MCP tools that may be available.

---

## Advanced Patterns

### Fork Subagent (Context Protection)

Calling the Agent tool **without a `subagent_type`** creates a fork — a background agent that keeps its tool output out of your main context window. This is Claude Code's built-in mechanism for context protection.

**When to use forks**:
- Research or multi-step exploration that would fill your context with raw output you won't need again
- Parallel implementation tasks that can run independently
- Any work where the intermediate tool results are disposable but the final summary matters

**Key rule**: If you ARE the fork — execute directly; do not re-delegate. Forks that spawn forks waste tokens and add latency.

**Example**: Delegating codebase research to a fork:
```
Agent tool call:
  prompt: "Find all API endpoints that accept file uploads, list their paths,
           validation rules, and max file sizes"
  # No subagent_type → creates a fork
  # Fork runs in background, returns summary when done
  # Raw grep/read output stays out of main context
```

### Read-Only Agent Template (Explore Pattern)

For agents that must never modify the codebase, use an explicit prohibition list. This is how Claude Code's built-in Explore agent works:

```markdown
---
name: codebase-explorer
description: Read-only codebase exploration — never modifies files
model: haiku
tools:
  - Read
  - Glob
  - Grep
  - Bash
---

You are a file search specialist. You excel at navigating and exploring codebases.

=== CRITICAL: READ-ONLY MODE — NO FILE MODIFICATIONS ===
You are STRICTLY PROHIBITED from:
- Creating new files (no Write, touch, or file creation)
- Modifying existing files (no Edit operations)
- Deleting, moving, or copying files
- Creating temporary files anywhere, including /tmp
- Using redirect operators (>, >>, |) to write to files
- Running ANY commands that change system state

Your role is EXCLUSIVELY to search and analyze existing code.

Use Bash ONLY for: ls, git status, git log, git diff, find, cat, head, tail.
NEVER use Bash for: mkdir, touch, rm, cp, mv, git add, git commit, npm install.

NOTE: You are meant to be a fast agent. Make efficient use of tools:
- Make all independent searches in parallel
- Don't ask for permission — just search
- When results are ambiguous, try multiple approaches at once
```

### Anti-Delegation Rule

When building agent chains, add this to prevent infinite delegation:

```
If you ARE a subagent — execute the task directly. Do not spawn further
subagents to do your work. Re-delegation wastes tokens and adds latency.
```

---

## System Prompt Best Practices

### Structure

```markdown
---
[frontmatter]
---

[One-line role description]

## Core Principles

[3-5 guiding principles]

## Instructions

[Step-by-step task instructions]

## Output Format

[How the agent should structure its responses]

## Constraints

[What the agent should NOT do]
```

### Tips

1. **Be specific** - Vague prompts produce vague results
2. **Define output format** - Tell the agent exactly what you want back
3. **Set constraints** - Explicitly state what the agent should avoid
4. **Include examples** - Show the agent what good output looks like
5. **Keep it focused** - One agent = one specialty

---

## File Locations

### User Scope (Global)

```
~/.claude/agents/
  code-reviewer.md
  debugger.md
  laravel-specialist.md
```

Available in all projects for this user.

### Project Scope

```
.claude/agents/
  project-specific-agent.md
```

Available only in this project. Add to `.gitignore` or commit to share with team.

### Recommended Organization

```
~/.claude/agents/
  # General-purpose agents
  code-reviewer.md
  debugger.md
  test-generator.md

  # Language-specific agents
  laravel-specialist.md
  react-specialist.md
  python-specialist.md

  # Domain-specific agents
  security-auditor.md
  performance-analyzer.md
  documentation-writer.md
```

---

## Invocation Methods

### CLI Flag

```bash
# Run agent with a task
claude --agent code-reviewer "Review the authentication module"

# Run agent in a specific directory
claude --agent laravel-specialist --cwd /path/to/project "Add soft deletes to Order model"
```

### Task Tool (In Conversation)

When custom agents are installed, they appear in the Task tool's available agent types:

```
Task tool -> subagent_type: "code-reviewer" -> "Review the PR changes"
```

### Programmatic (Agent SDK)

```javascript
import { Agent } from '@anthropic-ai/claude-code';

const agent = new Agent({
  agent: 'code-reviewer',
  task: 'Review recent changes',
});
const result = await agent.run();
```

---

## Debugging Subagents

### Common Issues

**Agent not found:**
```bash
# Check file exists and has correct extension
ls ~/.claude/agents/*.md
ls .claude/agents/*.md
```

**YAML parse error:**
```bash
# Validate YAML frontmatter (must start and end with ---)
head -20 ~/.claude/agents/my-agent.md
```

**Tools not working:**
- Ensure tool names are exact (case-sensitive): `Read`, not `read`
- Check that MCP servers are properly configured
- Verify Bash is included if the agent needs to run commands

**MCP server not starting:**
- Check the command path is correct
- Verify environment variables are set
- Test the MCP server command manually

---

## Example: Building a Custom Agent Step-by-Step

### Goal: Create a migration review agent

**Step 1**: Define the agent's purpose
- Review database migrations for safety issues
- Check for missing indexes, rollback support, data loss risks

**Step 2**: Choose tools and model
- Tools: Read, Glob, Grep (read-only - it should only review, not modify)
- Model: sonnet (needs good reasoning but not opus-level)

**Step 3**: Write the file

```markdown
---
name: migration-reviewer
description: Reviews database migrations for safety, performance, and rollback support
model: sonnet
tools:
  - Read
  - Glob
  - Grep
---

You are a database migration safety reviewer. You analyze Laravel migrations for potential issues.

## Review Checklist

For each migration, check:

1. **Rollback safety**: Does `down()` properly reverse `up()`?
2. **Data loss risk**: Could this migration destroy existing data?
3. **Index coverage**: Are foreign keys indexed? Are frequently queried columns indexed?
4. **Null handling**: Are nullable columns explicitly defined?
5. **Default values**: Do new columns have sensible defaults for existing rows?
6. **Table locking**: Will this migration lock large tables for extended periods?
7. **Naming**: Do column and table names follow project conventions?

## Output Format

For each migration file:

### [filename]
- **Risk level**: Low / Medium / High / Critical
- **Issues found**: [list]
- **Recommendations**: [list]
- **Verdict**: Safe to run / Needs changes / Block deployment

## Constraints

- Do NOT modify any files
- Do NOT run any commands
- Focus only on migration files in `database/migrations/`
- If unsure about risk, err on the side of caution (flag it)
```

**Step 4**: Save and test

```bash
# Save the file
# ~/.claude/agents/migration-reviewer.md

# Test it
claude --agent migration-reviewer "Review all pending migrations"
```

---

## Production Agents (Real Examples)

Three production-ready agents installed globally in `~/.claude/agents/`.

### plan-challenger (Opus)

Adversarial plan review before implementation. Attacks a plan across 5 dimensions (Assumptions, Missing Cases, Security Risks, Architectural Concerns, Complexity Creep), then applies refutation reasoning to eliminate false positives.

**Use before** any multi-day implementation effort or irreversible architectural decision.

```markdown
---
name: plan-challenger
description: Adversarial plan review — attacks plans across 5 dimensions before implementation
model: opus
tools: Read, Grep, Glob
---
```

**Laravel-specific checks built in**: org scoping on all queries, `$fillable` mass-assignment, `authorize()` on model-bound methods, additive-only migrations, `DB::transaction()` on multi-step mutations.

**Invocation**:
```
I have a plan to [describe plan]. Use the plan-challenger agent to review it.
```

### output-evaluator (Haiku)

LLM-as-Judge pattern. Scores code changes 0–10 across Correctness, Completeness, and Safety before commit. Returns `APPROVE / NEEDS_REVIEW / REJECT` verdict with specific file:line issues.

```markdown
---
name: output-evaluator
description: Evaluate code changes for quality before commit — scores correctness, completeness, safety
model: haiku
tools: Read, Grep, Glob
---
```

**When to invoke**: after significant code generation, before committing staged changes, after bulk refactors.

```
Use the output-evaluator agent to review the staged changes before I commit.
```

### loop-monitor (Haiku)

Watchdog for unattended autonomous sessions (`qa-security-agent.sh`, `deploy-pipeline.sh`). Detects stalls (no tool call > N seconds), token runaway (abnormally high consumption), and repeated action loops (same call 5+ times).

```markdown
---
name: loop-monitor
description: Monitors autonomous sessions for stalls, token runaway, and infinite loops
model: haiku
tools: Read, Bash
---
```

**Integration**:
```bash
# Run alongside qa-security-agent.sh
while true; do
  sleep 30
  STATUS=$(claude --agent loop-monitor --var SESSION_LOG="$LOG" --print "Check session status")
  [[ "$STATUS" =~ ^(STALL|LOOP|RUNAWAY) ]] && osascript -e "display notification \"$STATUS\""
  [[ "$STATUS" =~ ^COMPLETE ]] && break
done
```

---

## Managing Agent Fleets at Scale

The patterns above work well for a handful of agents on a single machine. When you need to coordinate 10+ agents, schedule recurring runs, or manage agents across multiple repositories, consider dedicated orchestration tools:

- **[CLI Agent Orchestrator](https://github.com/awslabs/cli-agent-orchestrator)** — lightweight tmux-based orchestration with supervisor/worker hierarchy, session isolation, and scheduled flows
- **[agent-fleet-o](https://github.com/escapeboy/agent-fleet-o)** / **[FleetQ Cloud](https://fleetq.net)** — fleet management with persistent agent state, triggers, workflow graphs, and cross-project coordination via MCP
