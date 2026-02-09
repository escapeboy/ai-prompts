# Claude Code Subagents

**Create custom AI agents with specialized knowledge, tools, and behaviors.**

Subagents are reusable agent definitions that extend Claude Code with domain-specific expertise. They run as specialized Task tool agents with their own system prompts, tool access, and optional MCP server configurations.

---

## Overview

### What Are Subagents?

Subagents are Markdown files with YAML frontmatter that define:

- **Name** - How the agent is referenced
- **Description** - What the agent does (shown in agent selection)
- **Model** - Which Claude model to use (haiku, sonnet, opus)
- **Tools** - Which Claude Code tools the agent can access
- **MCP Servers** - Optional inline MCP server configurations
- **System Prompt** - Specialized instructions and knowledge

### Why Use Subagents?

| Benefit | Description |
|---------|-------------|
| **Specialization** | Agents focused on specific tasks perform better |
| **Reusability** | Define once, use across projects and conversations |
| **Isolation** | Each agent runs in its own context, preventing interference |
| **Cost control** | Use cheaper models (haiku) for simple tasks |
| **Tool restriction** | Limit which tools an agent can access for safety |

### Subagents vs Skills vs Main Conversation

| Feature | Subagent | Skill | Main Conversation |
|---------|----------|-------|-------------------|
| **Invocation** | `Task` tool / `--agent` flag | `/command` | Direct chat |
| **Own context** | Yes (isolated) | No (shared) | N/A |
| **Custom tools** | Yes | No | All tools |
| **Custom model** | Yes | No | Session model |
| **MCP servers** | Yes (inline) | No | Session MCP |
| **Best for** | Complex specialized tasks | Quick workflows | General work |

---

## Quick Start

### 1. Create a Subagent

Create a file at `~/.claude/agents/my-agent.md`:

```markdown
---
name: my-agent
description: A brief description of what this agent does
model: sonnet
tools:
  - Read
  - Glob
  - Grep
  - Bash
---

You are a specialized agent for [domain].

## Instructions

[Your system prompt here]
```

### 2. Use the Subagent

**From CLI:**
```bash
claude --agent my-agent "Your task here"
```

**From Task tool (in conversation):**
The agent appears automatically in the Task tool's available agents.

### 3. Verify

```bash
# List available agents
ls ~/.claude/agents/
ls .claude/agents/  # Project-specific
```

---

## Scopes

Subagents can be defined at different scopes:

| Scope | Location | Visibility |
|-------|----------|------------|
| **User** | `~/.claude/agents/` | All projects for this user |
| **Project** | `.claude/agents/` | This project only |
| **CLI** | `--agent` flag | One-time use |
| **Plugin** | MCP plugin agents | Depends on plugin scope |

**Priority**: Project agents override user agents with the same name.

---

## Files in This Section

| File | Description |
|------|-------------|
| [guide.md](guide.md) | Complete guide to creating subagents |
| [examples/code-reviewer.md](examples/code-reviewer.md) | Read-only code review agent |
| [examples/laravel-specialist.md](examples/laravel-specialist.md) | Laravel development agent |
| [examples/debugger.md](examples/debugger.md) | Debugging specialist agent |
| [examples/test-generator.md](examples/test-generator.md) | Test generation agent |

---

## Common Patterns

### Read-Only Agents (Safe for Review)

```yaml
tools:
  - Read
  - Glob
  - Grep
```

### Research Agents (Exploration)

```yaml
tools:
  - Read
  - Glob
  - Grep
  - WebFetch
  - WebSearch
model: haiku  # Fast and cheap for research
```

### Code Writing Agents (Full Access)

```yaml
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
model: sonnet  # Balanced for code generation
```

### Critical Decision Agents (Maximum Quality)

```yaml
tools:
  - Read
  - Glob
  - Grep
model: opus  # Best reasoning for decisions
```
