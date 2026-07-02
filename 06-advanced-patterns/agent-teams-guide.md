# Agent Teams Guide

**Run multiple Claude instances that coordinate autonomously on a shared codebase.**

Agent Teams is an experimental feature (v2.1.32+, Opus 4.6 or newer required) where one Claude session acts as team lead, spawns teammates, and all coordinate via git-based messaging without human intervention between steps.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Agent Teams vs Other Patterns](#2-agent-teams-vs-other-patterns)
3. [Setup](#3-setup)
4. [Architecture](#4-architecture)
5. [When to Use](#5-when-to-use)
6. [Quick-Start Patterns](#6-quick-start-patterns)
7. [/agent-team Skill (Recommended)](#7-agent-team-skill-recommended)
8. [Limitations & Red Flags](#8-limitations--red-flags)
9. [Navigation](#9-navigation)

---

## 1. Overview

Agent Teams enable multiple Claude instances to work in parallel on different subtasks while coordinating through a git-based system.

**Key characteristics**:
- Autonomous coordination — team lead delegates, teammates communicate via mailbox
- Peer-to-peer messaging — direct communication between agents (not just hierarchical)
- Git-based locking — agents claim tasks by writing to a shared directory
- Continuous merge — changes pulled/pushed without manual intervention
- Independent context — each agent has its own 1M token context window

**Cost**: Multiple simultaneous Opus model calls = high token cost. Use only when the task clearly benefits.

**When introduced**: v2.1.32 (2026-02-05) as research preview.

**Subsequent improvements** (relevant to teams):
- **v2.1.50** — declarative `isolation: worktree` field in agent frontmatter (no more manual `git worktree add`). New `WorktreeCreate` and `WorktreeRemove` hook events fire when isolated worktrees are created/removed — wire these to set up env, install deps, or tear down state. Memory leak in agent-teams session state was fixed in this release.
- **v2.1.110** — push-notification tool (Claude can ping your phone when a long-running team finishes), `/focus` view to isolate one teammate's transcript, `/tui fullscreen` for flicker-free rendering during multi-pane work, distributed-tracing env vars (`TRACEPARENT` / `TRACESTATE`) for linking team traces in your APM.
- **Auto-memory** (since v2.1.32) — Claude automatically records and recalls memories across team sessions, reducing context-priming overhead per teammate.

---

## 2. Agent Teams vs Other Patterns

| Pattern | Coordination | Setup | Best For |
|---------|--------------|-------|----------|
| **Agent Teams** | Automatic (built-in) | Experimental flag | Complex read-heavy tasks requiring coordination |
| **Parallel Agents** (Task tool) | Human-orchestrated | Native feature | Independent parallel tasks, sub-agent delegation |
| **Dual-Instance** | Manual (2 terminals) | 2 terminals | QA, plan-execute separation |
| **Multi-Instance** | Manual (human oversight) | N terminals | Fully independent tasks, no shared state |

**Key distinction**:
- **Parallel Agents** = you launch sub-agents via Task tool, you synthesize
- **Agent Teams** = Claude manages coordination, agents communicate peer-to-peer

Agent Teams are NOT a replacement for the Task tool — they're a higher-level abstraction for tasks that require emergent coordination.

---

## 3. Setup

### Prerequisites

```bash
# Check version (v2.1.32+ required)
claude --version

# Switch to Opus model inside Claude Code
> /model opus
# Expected: "Model changed to claude-opus-4-8"
```

### Enable Feature Flag

```bash
# Add to ~/.bashrc or ~/.zshrc for persistence
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1

# Then launch Claude Code
claude
```

### Verify

```
> Are agent teams enabled?
```

Expected response:
```
Yes, agent teams are enabled. I can create teams of agents to work
in parallel on complex tasks using multi-agent coordination, git-based
task claiming, and autonomous team coordination.
```

If disabled: `echo $CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` — should output `1`.

### First Test (2 minutes)

```
> Create a 2-agent team to review this README:
> - Agent 1: Check structure (sections, TOC, completeness)
> - Agent 2: Check content quality (clarity, examples, accuracy)
```

Claude spawns 2 agents, they work in parallel, then you see consolidated findings.

**Navigation**:
- `Shift+Down` — cycle through teammate outputs (in-process mode)
- Main view — consolidated synthesis

---

## 4. Architecture

```
┌─────────────────────────────────────────────────┐
│                  Team Lead                       │
│  (your Claude session, Opus model)               │
│  - Breaks task into subtasks                     │
│  - Assigns to teammates                          │
│  - Synthesizes final output                      │
└────────────┬────────────────┬────────────────────┘
             │                │
             ▼                ▼
┌────────────────┐    ┌────────────────┐
│   Teammate A   │    │   Teammate B   │
│  (1M ctx)      │◄──►│  (1M ctx)      │
│  Mailbox: /A   │    │  Mailbox: /B   │
└────────────────┘    └────────────────┘
         │                    │
         └──────┬─────────────┘
                ▼
         Git repo (shared)
         task-claims/ directory
```

**Coordination mechanics**:
- Agents claim tasks by writing files to a shared `task-claims/` directory
- Peer-to-peer messages go through mailbox directories
- Context windows are isolated (1M tokens each) — agents don't share context
- Changes are git-pushed continuously, teammates pull before working

---

## 5. When to Use

### Good fit

| Scenario | Why it fits |
|----------|-------------|
| Pre-release audit (docs, broken links, version consistency) | Independent checks across many files |
| Security PR review (multiple perspectives simultaneously) | Parallel analysis without waiting |
| Large documentation update across 10+ files | Divide by file group, no conflicts |
| Cross-cutting refactor with clear file boundaries | Each agent owns a module |

### Bad fit

| Scenario | Why it doesn't fit | Use instead |
|----------|-------------------|-------------|
| Sequential tasks (B depends on A) | Agents can't wait for each other well | Pipeline pattern with Task tool |
| Single-file changes | Overhead exceeds benefit | Just do it |
| Tight budget | Multiple Opus calls = high cost | Parallel agents with Sonnet |
| Unstable/monolithic codebase | Merge conflicts kill coordination | Task tool |

### Decision checklist

Before using Agent Teams, confirm:
- [ ] Task is naturally parallelizable (no sequential dependencies)
- [ ] Files are modular (agents can work without stepping on each other)
- [ ] Budget allows for multiple simultaneous Opus calls
- [ ] Claude Code version is v2.1.32+

---

## 6. Quick-Start Patterns

### Pattern A — Pre-Release Documentation Review

```
> Create a 3-agent review team before I version-bump:
>
> - Agent 1 (Consistency): Check all version numbers match across README, CHANGELOG, guide headers
> - Agent 2 (Links): Verify all internal cross-references and file paths exist
> - Agent 3 (Completeness): Check that every section referenced in TOC actually exists
>
> Report: list of failures only, grouped by agent. Merge if all pass.
```

**Expected output**: ~3-5 min. Consolidated list of issues across all three concerns.

### Pattern B — Security PR Review

```
> Review this PR with a 2-agent security team:
>
> - Agent 1 (Attack Surface): Look for injection vectors, exposed secrets, new dependencies without audit
> - Agent 2 (Defense): Check that existing security controls still apply to the changed code
>
> Each agent reports: findings with file:line references and severity (critical/high/medium).
> Synthesize: unique + shared findings, final go/no-go recommendation.
```

### Pattern C — Multi-File Documentation Update

```
> Update all platform guides to reflect v2.1.32 features. Create a team:
>
> - Agent 1: Update 11-mobile-development/ (iOS, Android, React Native, Flutter guides)
> - Agent 2: Update 12-desktop-development/ (macOS, Tauri, Electron guides)
> - Agent 3: Update 06-advanced-patterns/ and README.md version history
>
> Each agent: make changes, commit with message "feat: update for v2.1.32".
> Team lead: verify no conflicts, create final summary of changes.
```

### Pattern D — Parallel Code Refactor

```
> Refactor the service layer with a 2-agent team:
>
> Shared context (both agents must follow):
> - New base class: BaseService with handle() method
> - Naming: FooService not ServiceFoo
> - Do NOT change public method signatures
>
> - Agent 1: Refactor app/Services/Auth/* and app/Services/User/*
> - Agent 2: Refactor app/Services/Payment/* and app/Services/Notification/*
>
> Each agent: refactor, run tests for their module, report pass/fail.
```

---

## 7. /agent-team Skill (Recommended)

Instead of crafting ad-hoc team prompts, use the `/agent-team` skill. It enforces best practices: confirms team structure before spawning, warns about token cost, briefs each teammate with the right context, waits for completion, synthesizes results, and cleans up automatically.

### Setup

```bash
# Skill file location
~/.claude/skills/agent-team/SKILL.md

# Feature flag (in settings.json, not just env var)
# settings.json:
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### Usage

```
/agent-team pr-review
/agent-team debug the /api/alerts requests return 500 after the latest deploy
/agent-team feature new module for subscription billing
/agent-team custom [freeform description]
```

### Preset modes

| Mode | Teammates | What each does |
|------|-----------|----------------|
| `pr-review` | 3 | Security / Logic / Test coverage — each reviews independently |
| `debug` | 3-5 | Competing hypotheses — each investigates different layer, actively tries to disprove the others |
| `feature` | N | Owns independent file group — Claude decomposes automatically |
| `custom` | N | Free-form team structure |

### Skill behavior

The skill instructs Claude to:
1. Show proposed team structure and confirm before spawning
2. Warn about token cost (3 teammates ≈ 3-5× normal cost)
3. Brief each teammate: which files they own, focus area, what NOT to touch
4. Wait for all teammates to finish — do not start doing work itself
5. Synthesize findings into structured report
6. Run `Clean up the team` when done

### Navigation during a team session

| Action | Key |
|--------|-----|
| Cycle between teammates | `Shift+Down` |
| Message a teammate directly | Cycle to them, then type |
| Toggle task list | `Ctrl+T` |
| Interrupt a teammate | `Escape` while viewing their session |

---

## 8. Limitations & Red Flags

### Current limitations (research preview)

- Stability not guaranteed — experimental flag, may change between versions
- Merge conflicts: agents working on nearby code sections will conflict
- No human-in-the-loop mid-task — team lead runs autonomously until completion
- Cost: 3 agents x 2 min task = ~6x single-agent token cost (all Opus)
- Session-scoped — teams dissolve when the session ends, no persistent scheduling
- Single-machine — all agents share the same local environment and git repo

### Red flags — stop and switch to Task tool if

- Any subtask depends on another agent's output (sequential dependency)
- Agents need to negotiate shared mutable state (same file, same config)
- You need to review and approve intermediate steps before agents proceed
- Budget is tight — consider parallel Sonnet agents via Task tool instead

### Avoiding common mistakes

```
❌ "Review everything in parallel" — 8 agents simultaneously = merge chaos + truncated context

✅ "Review in 3 focused agents with clear, non-overlapping scopes"
   Max 3-4 agents for most tasks. More is rarely better.

❌ "Update the same config file from two agents"

✅ "One agent owns config, the other reads it (no writes)"

❌ "Agent B starts after Agent A finishes a step"

✅ Use Task tool with sequential sub-agents instead — agent teams are for parallel work
```

---

## 9. Navigation

After launching a team, use these controls:

| Action | Key |
|--------|-----|
| Cycle through teammate outputs | `Shift+Down` |
| Return to main synthesis view | `Shift+Up` or click main pane |
| See agent status | Main view header shows "Idle" / "Working" per agent |

"Idle" messages during execution are normal — agents wait for git sync between steps.

---

**See also**:
- [Parallel Agents Guide](./parallel-agents-guide.md) — Task tool-based parallelism (no flag required)
- [Checkpoint System Guide](./checkpoint-system-guide.md) — Save/resume long workflows
- [Security Hardening Guide](../13-security-hardening/guide.md) — Secure multi-agent setups
- For persistent multi-agent orchestration beyond a single session (scheduled runs, cross-project coordination, supervisor/worker hierarchies), see [CLI Agent Orchestrator](https://github.com/awslabs/cli-agent-orchestrator) (tmux-based, self-hosted) or [agent-fleet-o](https://github.com/escapeboy/agent-fleet-o) / [FleetQ Cloud](https://fleetq.net) (managed fleet control with MCP integration)

**Requirements**: Claude Code v2.1.32+, Opus 4.6 or newer, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
