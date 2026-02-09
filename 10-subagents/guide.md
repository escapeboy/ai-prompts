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
| `model` | string | inherits | `haiku`, `sonnet`, or `opus` |
| `tools` | list | all | Which tools the agent can use |
| `mcpServers` | object | none | Inline MCP server definitions |
| `allowedTools` | list | none | MCP tool whitelist (e.g., `mcp__server__tool`) |

### Model Selection Guide

| Model | Cost | Speed | Best For |
|-------|------|-------|----------|
| `haiku` | Low | Fast | Exploration, search, simple tasks |
| `sonnet` | Medium | Balanced | Code generation, analysis, standard dev |
| `opus` | High | Slower | Architecture decisions, complex reasoning |

**Rule of thumb**: Start with `haiku` for read-only tasks, `sonnet` for code writing, `opus` only for critical decisions.

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
