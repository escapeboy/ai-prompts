# Global Claude Code Optimization Setup Guide

**Time**: 2-3 hours (ONE-TIME setup)
**Benefit**: 70-90% token reduction on ALL future projects
**ROI**: Pays for itself in 2-3 sessions

This guide walks you through setting up global Claude Code optimization that applies to all your projects automatically.

---

> **IMPORTANT — What Claude Code Actually Reads (updated 2026-03-20)**
>
> Not everything placed in `~/.claude/` is automatically loaded. Only these locations are effective:
>
> | Location | Loaded? | Purpose |
> |----------|---------|---------|
> | `~/.claude/CLAUDE.md` | **YES** | Global instructions — applied to ALL projects |
> | `~/.claude/settings.json` | **YES** | Permissions, plugins, allowed tools |
> | `~/.claude/skills/*/SKILL.md` | **YES** | Slash commands (auto-discovered) |
> | `~/.claude/agents/*.md` | **YES** | Agent definitions (auto-discovered) |
> | `~/.claude/commands/*.md` | **YES** | Legacy commands (still supported, skills take precedence) |
> | `~/.claude/system-prompts/` | **NO** | Not read by Claude Code — use `CLAUDE.md` instead |
> | `~/.claude/settings/*.json` | **NO** | Not Claude Code config — use root `settings.json` |
> | `~/.claude/README.md` etc. | **NO** | Not loaded — dead documentation |
>
> **Key action**: Put your global optimization rules in `~/.claude/CLAUDE.md`, not in `system-prompts/`.
> The 4 JSON files in `settings/` (prompt-caching, beta-features, model-strategy, token-optimization) are reference documentation only — they do not configure Claude Code behavior. Prompt caching and model selection are handled automatically by the Anthropic API.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Overview](#overview)
3. [Step 1: Create Directory Structure](#step-1-create-directory-structure)
4. [Step 2: Create PM Orchestrator](#step-2-create-pm-orchestrator)
5. [Step 3: Create Global Settings](#step-3-create-global-settings)
6. [Step 4: Create Global Skills](#step-4-create-global-skills)
7. [Step 5: Create System Prompts](#step-5-create-system-prompts)
8. [Step 6: Create Documentation](#step-6-create-documentation)
9. [Verification](#verification)
10. [Troubleshooting](#troubleshooting)
11. [Next Steps](#next-steps)

---

## Prerequisites

Before starting, ensure you have:

- [ ] **Claude Code installed** and working
- [ ] **MCP servers available** (Serena recommended, Codex-CLI optional)
- [ ] **Command-line access** to create directories and files
- [ ] **2-3 hours** of uninterrupted time
- [ ] **Text editor** for editing JSON and Markdown files

**Check MCP availability**:
```bash
# In Claude Code conversation
/help

# Look for MCP tools like:
# - mcp__serena__*
# - mcp__codex-cli__*
```

If you don't have Serena MCP, many optimizations still work, but you'll get 40-50% savings instead of 70-90%.

---

## Overview

### What We're Building

**Global configuration** in `~/.claude/`:
- **1 central orchestrator** (PM agent)
- **4 global settings files** (prompt caching, beta features, model strategy, token optimization)
- **5 global skills** (slash commands: /optimize, /context, /cache-inspector, /update-docs, /init-project)
- **2 system prompts** (global optimization, symbol-first protocol)
- **3 documentation files** (README, INSTALLATION-COMPLETE, QUICK-REFERENCE)

**Total**: 15 files, ~50K tokens of documentation (cached after first load = 5K tokens per subsequent read)

### Token Savings Breakdown

| Optimization | Savings | How It Works |
|--------------|---------|--------------|
| **Prompt Caching** | **90%** | Caches system prompts, tools, memories for 10% cost reads |
| Serena Memories | 60-70% | Load architecture context once vs reading files repeatedly |
| Symbol-First | 65-75% | Find specific symbols vs reading entire files |
| Adaptive Planning | 40-50% | Skip unnecessary phases for simple tasks |
| Token-Efficient Tools | 14-70% | Beta header reduces tool output tokens |
| Model Selection | 60% | Haiku ($1/M) vs Sonnet ($3/M) for simple tasks |
| Pattern Reuse | 50% | Reference existing work vs create from scratch |

**Combined**: 70-90% total reduction

---

## Step 1: Create Directory Structure

### 1.1 Create Base Directories

```bash
mkdir -p ~/.claude/{agents,settings,skills,system-prompts}
```

**Result**:
```
~/.claude/
├── agents/          # Orchestration agents
├── settings/        # Configuration files
├── skills/          # Slash commands
└── system-prompts/  # Global behavior
```

### 1.2 Create Skill Subdirectories

```bash
cd ~/.claude/skills
mkdir -p optimize context cache-inspector update-docs init-project
```

**Result**:
```
~/.claude/skills/
├── optimize/
├── context/
├── cache-inspector/
├── update-docs/
└── init-project/
```

### 1.3 Verify Structure

```bash
ls -R ~/.claude
```

You should see all directories created with no errors.

---

## Step 2: Create PM Orchestrator

The PM Orchestrator is the central coordinator that analyzes task complexity and routes to optimal strategies.

### 2.1 Create File

```bash
touch ~/.claude/agents/pm-orchestrator.md
```

### 2.2 Copy Content

Open `~/.claude/agents/pm-orchestrator.md` in your text editor and paste:

```markdown
---
name: pm-orchestrator
description: Central project management coordinator with adaptive planning and token optimization
model: claude-sonnet-4-6
version: 1.0.0
---

# PM Orchestrator - Central Coordinator

**Purpose**: Analyze task complexity, select optimal strategy, coordinate agents, enforce optimizations, capture learnings.

## Adaptive Planning Strategies

### 1. Planning-Only (Complex: 8+ tasks)
**Use when**: Large features, new modules, architectural changes

**Workflow**:
1. spec-requirements (Haiku) → requirements.md
2. spec-design (Sonnet) → design.md
3. spec-tasks (Haiku) → tasks.md
4. spec-impl (Sonnet) → implementation
5. spec-test (Sonnet) → tests
6. spec-judge (Opus) → evaluate if n≥3 options

**Token usage**: High upfront (15-20K), saves long-term via clarity

### 2. Intent-Planning (Medium: 3-7 tasks)
**Use when**: New features, moderate refactoring, API additions

**Workflow**:
1. Design sketch (Sonnet) → design-sketch.md (lightweight)
2. Implementation plan (Haiku) → task list
3. Direct implementation (Sonnet)
4. Tests (Sonnet)

**Token savings**: 40-50% vs full spec workflow (skip formal requirements)

### 3. Unified (Simple: 1-2 tasks)
**Use when**: Bug fixes, small tweaks, single-file changes

**Workflow**:
1. Analyze with symbol-first exploration
2. Direct implementation (Sonnet or Haiku)
3. Verify with tests

**Token savings**: 60-70% vs full spec workflow (minimal overhead)

## Complexity Analysis

Analyze task to determine strategy:

**Count subtasks**:
- Add new feature → How many files? New models? API changes?
- Fix bug → Isolated or widespread?
- Refactor → How many symbols affected?

**Complexity indicators**:
- **Simple** (1-2 tasks): Single file, clear solution, no dependencies
- **Medium** (3-7 tasks): Multiple files, some design needed, limited dependencies
- **Complex** (8+ tasks): New module, architectural impact, many dependencies

**Override**: User can specify strategy explicitly

## Context Preparation (MANDATORY)

Before delegating to any agent:

### 1. Load Serena Memories (if available)

```
mcp__serena__list_memories()

Load relevant memories:
- architecture.md (always)
- codebase-conventions.md (always)
- module-structure.md (if module work)
- testing-strategy.md (if tests needed)
- docker-workflow.md (if docker detected)
```

**Token savings**: 60-70% vs reading 5-10 full files

### 2. Symbolic Discovery (if Serena available)

```
# Find similar work
mcp__serena__search_for_pattern(
  substring_pattern="similar feature name",
  restrict_search_to_code_files=true
)

# Get relevant symbols
mcp__serena__find_symbol(
  name_path_pattern="RelatedClass",
  include_body=false,
  depth=1
)
```

**Token savings**: 65-75% vs reading full files

### 3. Check Constitution (if exists)

```
Read: .claude/settings/constitution.json

Verify task complies with:
- Architectural principles
- Code quality rules
- Security requirements
```

**Prevents**: Violations that require rework

### 4. Search for Similar Patterns

```
# Check existing specs
ls .claude/specs/

# Find similar implementations
Grep: pattern="similar feature"
```

**Token savings**: 50% if pattern exists (reuse vs create)

## Agent Selection & Model Strategy

### Agent-to-Model Mapping

| Agent | Model | Why | Cost |
|-------|-------|-----|------|
| spec-requirements | **Haiku** | Template-driven, fast | $1/$5/M |
| spec-tasks | **Haiku** | Structured decomposition | $1/$5/M |
| spec-design | **Sonnet** | Architectural thinking | $3/$15/M |
| spec-impl | **Sonnet** | Complex implementation | $3/$15/M |
| spec-test | **Sonnet** | Comprehensive testing | $3/$15/M |
| spec-judge | **Opus** | Critical evaluation (3+ options) | $5/$25/M |
| pm-orchestrator | **Sonnet** | Coordination | $3/$15/M |

**Cost optimization**: 40% Haiku, 55% Sonnet, 5% Opus (target distribution)

### When to Override

Use Opus for:
- Security reviews (vulnerabilities)
- Architectural decisions (long-term impact)
- Judge evaluation with 3+ competing designs

Use Haiku for:
- Template generation
- Task decomposition
- Simple formatting

Use Sonnet (default) for:
- Most implementation
- Design work
- Testing

## Continuous Learning

After each session, capture learnings:

### 1. Common Patterns

File: `.claude/learnings/common-patterns.md`

```markdown
## Pattern: [Name]
**Date**: YYYY-MM-DD
**Context**: [When this pattern applies]
**Solution**: [How to implement]
**Files**: [Example files]
**Token savings**: [Reuse vs rediscover]

Example:
## Pattern: Service Layer Extraction
**Date**: 2026-01-04
**Context**: Complex controller logic
**Solution**: Extract to Service class in app/Services/
**Files**: app/Services/UserService.php
**Token savings**: 30% (reuse pattern vs design from scratch)
```

### 2. Anti-Patterns

File: `.claude/learnings/anti-patterns.md`

```markdown
## Anti-Pattern: [Name]
**Date**: YYYY-MM-DD
**Problem**: [What went wrong]
**Why**: [Root cause]
**Fix**: [Correct approach]
**Prevention**: [How to avoid]

Example:
## Anti-Pattern: Inline Validation
**Date**: 2026-01-04
**Problem**: Validation in controller instead of FormRequest
**Why**: Violated constitution, hard to test, not reusable
**Fix**: Extract to FormRequest class
**Prevention**: Always check constitution before implementation
```

### 3. Optimization Log

File: `.claude/learnings/optimization-log.md`

```markdown
## Session: YYYY-MM-DD HH:MM
**Task**: [Description]
**Strategy**: [Unified|Intent-Planning|Planning-Only]
**Tokens used**: [Actual]
**Estimated baseline**: [Without optimization]
**Savings**: [Percentage]
**Optimizations applied**:
- Symbol-first: [X]%
- Memory system: [X]%
- Adaptive planning: [X]%
- Prompt caching: [X]%
- Pattern reuse: [X]%
- Model selection: [Model]
- Token-efficient tools: [X]%
```

## Session Summary Template

At end of each session, provide:

```markdown
## Session Summary

**Task**: [description]
**Strategy**: [Unified|Intent-Planning|Planning-Only]
**Duration**: [X minutes]

### Optimizations Applied:
- ✅ Symbol-First Exploration: [X]% savings
- ✅ Memory System: [X]% savings
- ✅ Adaptive Planning: [X]% savings
- ✅ Prompt Caching: [X]% savings
- ✅ Pattern Reuse: [X]% savings
- ✅ Model Selection: [Haiku|Sonnet|Opus]
- ✅ Token-Efficient Tools: [X]% savings

### Results:
- **Tokens used**: [X] tokens
- **Estimated baseline**: [Y] tokens (without optimization)
- **Total savings**: [Z]% reduction
- **Cost**: $[X] (vs $[Y] baseline)
- **Cache hit rate**: [X]%

### Learnings Captured:
- [Pattern/anti-pattern/optimization discovered]

### Files Modified:
- [List of changed files with brief description]
```

---

[Orchestrator definition continues with delegation rules, error handling, constitution enforcement, etc...]
```

**File size**: ~3K tokens (will be cached, so 300 tokens on subsequent reads)

---

## Step 3: Create Global Settings

Create 4 JSON configuration files in `~/.claude/settings/`.

### 3.1 Prompt Caching Config

**File**: `~/.claude/settings/prompt-caching.json`

```json
{
  "version": "1.0.0",
  "description": "Prompt caching configuration for 90% cost savings on repeated content reads",
  "cache_control": {
    "type": "ephemeral",
    "auto_enable": true
  },
  "caching_rules": {
    "system_prompts": {
      "enabled": true,
      "min_tokens": 1024,
      "ttl_minutes": 60,
      "description": "Cache all agent system prompts (pm-orchestrator, KFC agents, etc.)"
    },
    "tool_definitions": {
      "enabled": true,
      "min_tokens": 1024,
      "ttl_minutes": 60,
      "description": "Cache MCP tool definitions (Serena, Codex-CLI, etc.)"
    },
    "memories": {
      "enabled": true,
      "min_tokens": 1024,
      "ttl_minutes": 60,
      "auto_cache": ["architecture.md", "codebase-conventions.md", "module-structure.md"],
      "description": "Cache Serena memories for 60-70% session savings"
    },
    "specs": {
      "enabled": true,
      "min_tokens": 2048,
      "ttl_minutes": 60,
      "conditional": true,
      "description": "Cache large spec documents during implementation"
    },
    "constitution": {
      "enabled": true,
      "min_tokens": 1024,
      "ttl_minutes": 60,
      "description": "Cache constitution for fast decision checks"
    }
  },
  "cache_warming": {
    "enabled": false,
    "description": "Pre-cache frequently used content on session start (experimental)"
  },
  "metrics": {
    "track_hit_rate": true,
    "track_cost_savings": true,
    "log_file": ".claude/learnings/cache-performance.log"
  }
}
```

**Expected savings**: 90% cost reduction on cached content reads, 85% latency reduction

> **Field naming note**: `ttl_minutes` is an internal config knob used by `/cache-inspector`. The actual Anthropic API surface is `cache_control: { type: "ephemeral", ttl: "5m" | "1h" }` — only those two TTL tiers are supported, not arbitrary minute values.

### 3.2 Beta Features Config

**File**: `~/.claude/settings/beta-features.json`

```json
{
  "version": "1.0.0",
  "description": "Claude API beta features configuration",
  "features": {
    "token_efficient_tools": {
      "enabled": true,
      "beta_header": null,
      "note": "Built-in on Claude 4+. The legacy `token-efficient-tools-2025-02-19` header is a no-op as of Claude 4 and should NOT be sent.",
      "description": "Tool output is automatically token-compressed by the model",
      "apply_to": ["all_agents"]
    },
    "adaptive_thinking": {
      "enabled": true,
      "config": { "type": "adaptive" },
      "effort": "high",
      "description": "Claude decides per-turn whether and how much to think. Pairs with the GA `effort` parameter (low / medium / high / max).",
      "apply_to": ["spec-design", "spec-judge"],
      "use_max_effort_for": [
        "Architectural decisions with long-term impact",
        "Security reviews",
        "Judge evaluation with 3+ competing designs"
      ],
      "note": "Replaces the deprecated `extended_thinking { thinking_budget_tokens }` block. Adaptive thinking auto-enables interleaved thinking; the `interleaved-thinking-2025-05-14` beta header is no longer required on Claude 4.6."
    },
    "context_management": {
      "enabled": false,
      "beta_header": "context-management-2025-06-27",
      "description": "Server-side context editing — clear_thinking_20251015 and clear_tool_uses_20250919 strategies trim stale tool results and old thinking blocks before they consume window space.",
      "apply_to": ["long_running_agents", "agent_teams"],
      "default": false,
      "reason_disabled": "Opt-in per-workflow; pairs well with server-side compaction."
    }
  },
  "rollout_strategy": {
    "gradual": true,
    "test_before_global": true,
    "rollback_on_issues": true
  }
}
```

**Expected savings**: tool-output compression is built-in on Claude 4+ (no header). Adaptive thinking + `effort` lets you scale reasoning depth per workflow. Context-management beta clears stale tool results / thinking blocks server-side.

### 3.3 Model Strategy Config

**File**: `~/.claude/settings/model-strategy.json`

```json
{
  "version": "1.0.0",
  "description": "Model selection strategy for cost optimization",
  "default_model": "claude-sonnet-4-6",
  "models": {
    "haiku": {
      "id": "claude-haiku-4-5",
      "cost_per_million": {
        "input": 1,
        "output": 5
      },
      "use_for": [
        "Requirements generation (template-driven)",
        "Task decomposition (structured)",
        "Simple refactoring (clear patterns)",
        "Code formatting (deterministic)"
      ],
      "agents": ["spec-requirements", "spec-tasks"],
      "cost_savings_vs_sonnet": "60%"
    },
    "sonnet": {
      "id": "claude-sonnet-4-6",
      "cost_per_million": {
        "input": 3,
        "output": 15
      },
      "use_for": [
        "Implementation (balanced)",
        "Design (architectural thinking)",
        "Testing (comprehensive)",
        "Debugging (analysis)",
        "PM orchestration (coordination)"
      ],
      "agents": ["spec-design", "spec-impl", "spec-test", "pm-orchestrator"],
      "default": true
    },
    "opus": {
      "id": "claude-opus-4-8",
      "cost_per_million": {
        "input": 5,
        "output": 25
      },
      "use_for": [
        "Architectural decisions (critical, long-term impact)",
        "Security reviews (safety-critical)",
        "Judge evaluation (3+ options to evaluate)"
      ],
      "agents": ["spec-judge"],
      "require_justification": true,
      "cost_premium_vs_sonnet": "67%",
      "usage_target": "<5% of total operations"
    }
  },
  "complexity_overrides": {
    "simple_task": {
      "criteria": "1-2 subtasks, single file, no dependencies",
      "model": "haiku",
      "reason": "Fast, cheap, sufficient quality"
    },
    "medium_task": {
      "criteria": "3-7 subtasks, multiple files, some dependencies",
      "model": "sonnet",
      "reason": "Balanced cost/quality"
    },
    "complex_task": {
      "criteria": "8+ subtasks, architectural impact, many dependencies",
      "model": "sonnet",
      "reason": "Default for complexity"
    },
    "critical_decision": {
      "criteria": "Security, architecture, judge with 3+ options",
      "model": "opus",
      "reason": "Highest quality for high-stakes decisions"
    }
  },
  "target_distribution": {
    "haiku": "40%",
    "sonnet": "55%",
    "opus": "5%",
    "description": "Ideal usage across all operations for cost optimization"
  },
  "metrics": {
    "track_usage": true,
    "track_cost": true,
    "log_file": ".claude/learnings/model-usage.log"
  }
}
```

**Expected savings**: 40% of work on Haiku (60% cheaper than Sonnet)

### 3.4 Token Optimization Config

**File**: `~/.claude/settings/token-optimization.json`

```json
{
  "version": "1.0.0",
  "description": "Comprehensive token optimization strategies",
  "optimizations": {
    "symbol_first_exploration": {
      "enabled": true,
      "priority": "critical",
      "enforcement": "mandatory",
      "description": "Use Serena symbolic tools before reading full files",
      "savings": "65-75%",
      "required_tools": ["mcp__serena__find_symbol", "mcp__serena__get_symbols_overview"],
      "fallback": "Read tool if Serena unavailable",
      "protocol_file": "~/.claude/system-prompts/symbol-first-protocol.md"
    },
    "memory_system": {
      "enabled": true,
      "priority": "critical",
      "enforcement": "mandatory",
      "description": "Load Serena memories before exploring code",
      "savings": "60-70%",
      "auto_load": ["architecture.md", "codebase-conventions.md"],
      "conditional_load": ["module-structure.md", "testing-strategy.md", "docker-workflow.md"],
      "required_tools": ["mcp__serena__list_memories", "mcp__serena__read_memory"]
    },
    "adaptive_planning": {
      "enabled": true,
      "priority": "high",
      "enforcement": "automatic",
      "description": "Skip unnecessary phases for simple tasks",
      "savings": "40-50%",
      "strategies": {
        "unified": {
          "criteria": "1-2 tasks",
          "savings": "60-70% vs full spec"
        },
        "intent_planning": {
          "criteria": "3-7 tasks",
          "savings": "40-50% vs full spec"
        },
        "planning_only": {
          "criteria": "8+ tasks",
          "savings": "Long-term via clarity"
        }
      },
      "orchestrator": "pm-orchestrator.md"
    },
    "checkpoint_system": {
      "enabled": true,
      "priority": "medium",
      "enforcement": "automatic",
      "description": "Save/resume from checkpoints for 80-90% continuation savings",
      "savings": "80-90% on resume",
      "checkpoint_triggers": [
        "After requirements approval",
        "After design approval",
        "After implementation phase",
        "Before long-running operations"
      ],
      "checkpoint_location": ".claude/specs/{feature}/checkpoints/"
    },
    "pattern_reuse": {
      "enabled": true,
      "priority": "medium",
      "enforcement": "automatic",
      "description": "Search existing specs/code for similar patterns",
      "savings": "50%",
      "search_locations": [
        ".claude/specs/",
        ".claude/learnings/common-patterns.md"
      ],
      "tools": ["Grep", "mcp__serena__search_for_pattern"]
    }
  },
  "enforcement_rules": {
    "violations": {
      "read_before_symbol_search": {
        "action": "log_and_warn",
        "exception": "Non-code files or Serena unavailable"
      },
      "skip_memory_load": {
        "action": "prompt_user",
        "exception": "New project without memories"
      },
      "unnecessary_opus_usage": {
        "action": "log_and_justify",
        "exception": "Security, architecture, judge (3+ options)"
      }
    }
  },
  "success_metrics": {
    "symbol_first_adoption": {
      "target": "95%",
      "calculation": "symbol_first_calls / (symbol_first_calls + full_file_reads)"
    },
    "cache_hit_rate": {
      "target": "80%",
      "measurement": "cached_reads / total_reads"
    },
    "token_reduction": {
      "minimum": "30-50%",
      "aggressive": "50-70%",
      "maximum_with_caching": "70-90%"
    },
    "model_cost_efficiency": {
      "target": "40% Haiku usage",
      "measurement": "haiku_operations / total_operations"
    },
    "opus_usage_limit": {
      "target": "<5%",
      "measurement": "opus_operations / total_operations"
    }
  },
  "logging": {
    "enabled": true,
    "log_file": ".claude/learnings/optimization-log.md",
    "include_metrics": true,
    "include_violations": true,
    "include_fallbacks": true
  }
}
```

**Expected savings**: Orchestrates all optimizations for 70-90% total reduction

---

## Step 4: Create Global Skills

Create 5 slash command skills. Due to length, I'll show the structure for each:

### 4.1 `/optimize` Skill

**File**: `~/.claude/skills/optimize/SKILL.md`

**Source**: Copy from [`skills/optimize/SKILL.md`](skills/optimize/SKILL.md) in this directory.

**Key features**:
- Analyzes task complexity and routes to the correct planning strategy (Unified / Intent-Planning / Planning-Only)
- Enforces symbol-first exploration and memory loading
- Selects the cheapest model that produces acceptable quality
- Reports token savings at the end of each session

### 4.2 `/context` Skill

**File**: `~/.claude/skills/context/SKILL.md`

**Source**: Copy from [`skills/context/SKILL.md`](skills/context/SKILL.md) in this directory.

**Actions**:
- `load` — Load all relevant memories for the current project
- `save [name]` — Create or update a named memory
- `list` — Show all available memories with timestamps
- `refresh [name]` — Regenerate a stale memory from the current codebase
- `inspect` — Show loaded context + cache hit rate
- `clear` — Unload all memories from context

### 4.3 `/cache-inspector` Skill

**File**: `~/.claude/skills/cache-inspector/SKILL.md`

**Source**: Copy from [`skills/cache-inspector/SKILL.md`](skills/cache-inspector/SKILL.md) in this directory.

**Actions**:
- `status` — Current cache entries, hit rate, and estimated savings
- `analyze` — Performance trends and cost breakdown
- `optimize` — Actionable recommendations to improve hit rate
- `report` — Full report saved to `.claude/learnings/cache-performance.md`
- `clear` — Clear cache entries (for testing only)

### 4.4 `/update-docs` Skill

**File**: `~/.claude/skills/update-docs/SKILL.md`

**Source**: Copy from [`skills/update-docs/SKILL.md`](skills/update-docs/SKILL.md) in this directory.

**Actions**:
- `research [topic]` — Search web for latest patterns and API changes
- `collect [url]` — Fetch content from a specific documentation URL
- `analyze` — Compare research findings to existing docs, identify outdated content
- `update [target]` — Apply targeted updates to a file or scope
- `validate` — Scan docs for stale model IDs, broken URLs, old API patterns

### 4.5 `/init-project` Skill

**File**: `~/.claude/skills/init-project/SKILL.md`

**Source**: Copy from [`skills/init-project/SKILL.md`](skills/init-project/SKILL.md) in this directory.

**Actions**:
- `detect` — Auto-detect tech stack (Rails, Laravel, Next.js, FastAPI, Flutter, iOS, etc.)
- `fetch [framework]` — Fetch current best practices for the detected stack
- `constitution` — Generate `.claude/settings/constitution.json` with architectural rules
- `memories` — Create initial Serena memories by analyzing the codebase
- `optimize` — Configure project-level token optimization settings
- `--full` — Run all steps in sequence (recommended, 10-15 min)

---

## Step 5: Create System Prompts

Create 2 global system prompts that apply to all projects and agents.

### 5.1 Global Optimization Prompt

**File**: `~/.claude/system-prompts/global-optimization.md`

**Source**: Copy from [`system-prompts/global-optimization.md`](system-prompts/global-optimization.md) in this directory.

**Key sections**:
- Symbol-first exploration (MANDATORY) — never read full files before symbolic discovery
- Memory-first context loading (MANDATORY) — load Serena memories before code exploration
- Prompt caching (AUTOMATIC) — 90% savings on re-reads of large content
- Adaptive planning strategy (AUTOMATIC) — Unified / Intent-Planning / Planning-Only
- Model selection strategy (AUTOMATIC) — 40% Haiku / 55% Sonnet / 5% Opus target
- Pattern reuse (AUTOMATIC) — search existing specs and learnings before creating new code
- Constitution enforcement — validates task against `.claude/settings/constitution.json`
- Continuous learning — captures patterns and anti-patterns after sessions
- Session summary template — reports token savings per task

### 5.2 Symbol-First Protocol

**File**: `~/.claude/system-prompts/symbol-first-protocol.md`

**Source**: Copy from [`system-prompts/symbol-first-protocol.md`](system-prompts/symbol-first-protocol.md) in this directory.

**Key sections**:
- Core principle — NEVER read a full file first; always find the specific symbol
- Step-by-step protocol — verify Serena → get overview → find symbol → targeted read
- Common patterns — update method, add method, trace dependencies, refactor module
- Advanced techniques — substring matching, path filtering, cross-codebase search
- Fallback strategy — efficient `Read` + `Grep` approach when Serena is unavailable
- Token savings table — 85-96% reduction examples for common tasks
- Troubleshooting guide — symbol not found, wrong project, tracing definitions

---

## Step 6: Create Documentation

Create 3 documentation files to help you understand and use the system.

### 6.1 Main README

**File**: `~/.claude/README.md`

Create this file to document your global `~/.claude/` setup for future reference.

**Recommended sections**:
- Quick start (15 min for new projects)
- Directory structure with purpose of each file
- Available skills (slash commands with brief descriptions)
- Token savings breakdown
- Configuration files reference
- Monitoring & metrics commands
- Maintenance schedule (monthly `/update-docs`, weekly `/cache-inspector analyze`)

### 6.2 Installation Summary

**File**: `~/.claude/INSTALLATION-COMPLETE.md`

Create this as a checklist to verify your installation is correct.

**Recommended sections**:
- What was installed (file list)
- Expected outcomes per skill
- Verification checklist (`ls ~/.claude/skills/*/SKILL.md`)
- Next steps for first project activation

### 6.3 Quick Reference

**File**: `~/.claude/QUICK-REFERENCE.md`

Create a quick reference card:

```markdown
# Claude Code Optimization - Quick Reference

## Global Skills (Slash Commands)

### `/optimize [task]`
Maximum token efficiency mode
Example: `/optimize "Add email verification feature"`

### `/context [action]`
Memory management
- load - Load all memories
- save [name] - Create memory
- list - Show available
- refresh [name] - Update stale
- inspect - Show loaded + cache
- clear - Clear loaded

### `/cache-inspector [action]`
Cache performance monitoring
- status - Current status
- analyze - Performance analysis
- optimize - Get recommendations
- report - Detailed report

### `/update-docs [action]`
Update documentation from research
- research [topic] - Search web
- collect [source] - Fetch URL
- analyze - Compare with docs
- update [target] - Update docs
- validate - Check accuracy

### `/init-project [action]`
Initialize new project
- detect - Auto-detect language
- fetch [lang] - Get best practices
- constitution - Generate rules
- memories - Create templates
- optimize - Configure settings
- --full - Complete init

## Token Savings Targets

| Optimization | Savings |
|--------------|---------|
| Prompt Caching | 90% |
| Memories | 60-70% |
| Symbol-First | 65-75% |
| Adaptive Planning | 40-50% |
| Token-Efficient Tools | 14-70% |
| Model Selection | 60% |
| Pattern Reuse | 50% |

**Combined**: 70-90% total reduction

## Quick Checks

**Cache status**: `/cache-inspector status`
**Memory list**: `/context list`
**Verify optimization**: Check session summary

## Common Workflows

**New project**:
1. `/init-project --full` (10 min)
2. `/context load`
3. `/optimize "first task"`

**Existing project**:
1. `/context load`
2. `/optimize "your task"`

**Update docs**:
1. `/update-docs research [topic]`
2. `/update-docs analyze`
3. `/update-docs update [target]`

## Troubleshooting

**Low savings?**
- Check `/cache-inspector analyze`
- Verify memories exist: `/context list`
- Ensure Serena activated: `/context load`

**Serena not working?**
- `/context load` (auto-activates)
- Check MCP availability
- Fallback to Read tool (still get 40-50% savings)

## Files Reference

**Settings**: `~/.claude/settings/`
- prompt-caching.json
- beta-features.json
- model-strategy.json
- token-optimization.json

**Agents**: `~/.claude/agents/`
- pm-orchestrator.md

**Skills**: `~/.claude/skills/`
- optimize/, context/, cache-inspector/, update-docs/, init-project/

**System Prompts**: `~/.claude/system-prompts/`
- global-optimization.md
- symbol-first-protocol.md

---

**Questions?** See ~/.claude/README.md for full documentation
```

---

## Verification

After completing all steps, verify your installation:

### Use the Checklist

See `checklist.md` in this directory for complete verification steps.

**Quick verification**:

```bash
# Check all files exist
ls ~/.claude/agents/pm-orchestrator.md
ls ~/.claude/settings/*.json
ls ~/.claude/skills/*/SKILL.md
ls ~/.claude/system-prompts/*.md
ls ~/.claude/*.md

# Count files (should be 15+)
find ~/.claude -type f | wc -l
```

### Test Commands

In Claude Code conversation:

```
/optimize "test"
# Should recognize command and explain optimization mode

/context list
# Should list available memories (may be empty if no project activated)

/cache-inspector status
# Should show cache configuration

/update-docs validate
# Should check documentation files

/init-project detect
# Should attempt to detect project type
```

If all commands work, installation is successful!

---

## Troubleshooting

### Common Issues

#### "Command not found: /optimize"

**Cause**: Skill file doesn't exist or has wrong name

**Fix**:
```bash
# Check file exists
ls ~/.claude/skills/optimize/SKILL.md

# Verify filename is exactly "SKILL.md" (case-sensitive)
# Recreate if needed
```

#### "Serena not available"

**Cause**: Serena MCP not installed or not activated

**Fix**:
- Serena not required for global setup
- You'll activate Serena per-project later
- Many optimizations still work (40-50% savings vs 70-90%)

#### "Cache not working"

**Cause**: prompt-caching.json has errors

**Fix**:
```bash
# Validate JSON syntax
cat ~/.claude/settings/prompt-caching.json | python -m json.tool

# Fix any syntax errors
# Recreate if needed
```

#### "PM Orchestrator not coordinating"

**Cause**: pm-orchestrator.md has errors or not loaded

**Fix**:
- Verify file exists
- Check YAML frontmatter syntax
- Ensure no extra characters

### Getting Help

If issues persist:

1. Re-read this guide carefully
2. Check the verification checklist
3. Review ~/.claude/README.md
4. Try setup-agent.md for automated setup instead

---

## Next Steps

### For Current Project

Now that global setup is complete, activate for your current project:

1. **Navigate to project directory**:
   ```bash
   cd ~/projects/your-project
   ```

2. **Follow project activation guide**:
   See `../02-project-activation/guide.md`

3. **Or use automation**:
   Copy contents of `../02-project-activation/activation-agent.md` and paste into Claude Code

**Time**: 10-15 minutes

### For Future Projects

For every new project:

1. Navigate to project
2. Run `/init-project --full` (10 min)
3. Start coding with 70-90% token savings

**That's it!** Global setup done once, all future projects benefit automatically.

---

## Success Metrics

Track your installation success:

**Setup completion**:
- [ ] 15+ files created
- [ ] All 5 skills working
- [ ] PM Orchestrator file valid
- [ ] All 4 settings JSON valid
- [ ] Documentation readable

**First project activation**:
- [ ] Serena activated
- [ ] 3-5 memories created
- [ ] First `/optimize` task completed
- [ ] 60-70% token reduction observed

**After 5 sessions**:
- [ ] Cache hit rate >80%
- [ ] Consistent 70-90% token reduction
- [ ] PM Orchestrator routing correctly
- [ ] Learnings captured

---

## Time Investment vs Savings

**Setup time**: 2-3 hours (one-time)

**Savings per session**:
- Baseline: 85K tokens = $2.55
- Optimized: 18K tokens = $0.54
- **Saved**: $2.01 per session

**ROI**: After 2-3 sessions, setup time is recovered

**Annual savings** (360 sessions):
- $723.60 for single project
- $2,170.80 for 3 projects
- Setup pays for itself in first week!

---

**Congratulations!** You've completed the global Claude Code optimization setup.

**Next**: Activate for your first project using `../02-project-activation/guide.md`

**Remember**: This is a ONE-TIME setup. All future projects benefit automatically with just 10-15 minutes of activation.
