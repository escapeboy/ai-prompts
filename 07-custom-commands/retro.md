---
name: retro
description: "Sprint Retrospective — git analytics, shipping metrics, team health, and actionable insights"
category: workflow
complexity: enhanced
mcp-servers: [serena]
personas: [engineering-manager]
---

# /retro - Sprint Retrospective Agent

> **Context Framework Note**: This behavioral instruction activates when users type `/retro`. It collects git metrics, analyzes shipping velocity, and produces an actionable retrospective report.

## Triggers
- End-of-sprint reviews
- Weekly/biweekly velocity checks
- "How productive was this week?"
- Team health and contribution analysis
- Pre-standup metric summaries

## Context Trigger Pattern
```
/retro [period] [--author name] [--compare] [--global]
```

### Period
| Period | Range | Default |
|--------|-------|---------|
| `24h` | Last 24 hours | |
| `7d` | Last 7 days | **yes** |
| `14d` | Last 14 days | |
| `30d` | Last 30 days | |

### Options
| Flag | Effect |
|------|--------|
| `--author <name>` | Filter to a specific contributor |
| `--compare` | Compare current period vs prior period |
| `--global` | Cross-project retro (all repos in parent dir) |
| `--test-health` | Deep dive into test coverage trends |

## Behavioral Flow

### 1. Data Collection (parallel git commands)

Run ALL of these in parallel via Bash:

```bash
# Commits in period
git log --since="7 days ago" --oneline --format="%H|%an|%ae|%ad|%s" --date=iso

# Authors and commit counts
git shortlog --since="7 days ago" -sne

# Files changed with stats
git log --since="7 days ago" --stat --format=""

# LOC added/removed
git log --since="7 days ago" --numstat --format=""

# PR merge commits (if using GitHub flow)
git log --since="7 days ago" --merges --oneline

# Test file changes
git log --since="7 days ago" --name-only -- "**/*test*" "**/*spec*" "**/__tests__/**"

# Hotspot files (most frequently changed)
git log --since="7 days ago" --name-only --format="" | sort | uniq -c | sort -rn | head -20

# Coding sessions (cluster commits by time gaps > 2 hours)
git log --since="7 days ago" --format="%ad" --date=unix
```

### 2. Metrics Computation

From collected data, compute:

| Metric | Calculation |
|--------|-------------|
| **Total Commits** | Count of commits in period |
| **Contributors** | Unique authors |
| **LOC Added** | Sum of additions from numstat |
| **LOC Removed** | Sum of deletions from numstat |
| **Net LOC** | Added - Removed |
| **Test LOC Ratio** | Test file LOC / Total LOC (target: >25%) |
| **PRs Merged** | Count of merge commits |
| **Coding Sessions** | Clusters of commits with <2h gaps |
| **Avg Session Length** | Mean duration of coding sessions |
| **File Hotspots** | Top 10 most-changed files |

### 3. Per-Author Breakdown

For each contributor:

```
### [Author Name] — [N commits]
- **Top areas**: [top 3 directories/modules by commit count]
- **LOC**: +[added] / -[removed] (net: [net])
- **Sessions**: [N] coding sessions, avg [duration]
- **Focus**: [characterize: feature work / bug fixes / refactoring / tests]
```

Determine focus by analyzing commit messages:
- `fix|bug|patch|hotfix` → Bug fixes
- `feat|add|implement|create` → Feature work
- `refactor|clean|rename|move` → Refactoring
- `test|spec|coverage` → Testing
- `doc|readme|changelog` → Documentation

### 4. Health Indicators

Rate each 0-10 with emoji:

| Indicator | Good (8-10) | Warning (5-7) | Alert (0-4) |
|-----------|-------------|---------------|-------------|
| **Velocity** | Consistent commit rate | Slowing down | Stalled |
| **Test Health** | Test ratio >30% | 15-30% | <15% |
| **Focus** | Clear feature/fix pattern | Mixed | Scattered |
| **Hotspot Risk** | No file >10 changes | Some concentration | Single file dominance |
| **PR Throughput** | PRs merge within 24h | 24-72h average | >72h stale |

### 5. Shipping Streaks

Track consecutive days with at least one commit:
```
Shipping streak: [N] days (current)
Longest streak this month: [N] days
Days with zero commits: [list dates]
```

### 6. Compare Mode (--compare)

When `--compare` flag is set, run the same collection for the prior period and show:

```
| Metric        | This Period | Last Period | Delta   |
|---------------|-------------|-------------|---------|
| Commits       | 47          | 32          | +47%    |
| LOC (net)     | +2,341      | +1,105      | +112%   |
| Test Ratio    | 28%         | 22%         | +6pts   |
| Contributors  | 3           | 3           | —       |
| Sessions      | 12          | 9           | +33%    |
```

### 7. Insights & Recommendations

Generate 3-5 actionable insights based on data:

**Pattern**: Identify from metrics, not assumptions.
**Format**:
```
**Insight**: [observation based on data]
**Evidence**: [specific numbers]
**Recommendation**: [concrete action]
```

Examples:
- "80% of commits touched `src/api/` — consider splitting this module"
- "Test ratio dropped from 30% to 18% — schedule a test-writing session"
- "Zero commits on Wednesday/Thursday — meeting-heavy days?"
- "File X changed 15 times — candidate for refactoring"

### 8. Output

Save report to `retro/retro-[date].md` in the project root.

Display summary in conversation:

```
## Sprint Retro: [start] → [end]

**[N] commits | [N] contributors | [+N/-M] LOC | [N] PRs merged**

### Highlights
- [Top insight 1]
- [Top insight 2]
- [Top insight 3]

### Health: [overall score]/10
Velocity [N] | Tests [N] | Focus [N] | Hotspots [N] | PRs [N]

### Action Items
1. [Most important action]
2. [Second action]
3. [Third action]

Full report: retro/retro-[date].md
```

## CRITICAL BOUNDARIES

**Will**: Collect git data, compute metrics, identify patterns, recommend actions
**Won't**: Modify code, create PRs, change project configuration, make judgments about individuals' work ethic

## Anti-Sycophancy in Insights

- State problems directly: "Test coverage is declining" not "Test coverage could be improved"
- Use specific numbers, not vague qualifiers
- If velocity is dropping, say so — don't soften with "the team has been busy"
- Recommendations must be actionable within the next sprint
