# Session Observability Guide

**Track Claude Code usage, estimate costs, and find patterns across development sessions.**

---

## Table of Contents

1. [Why Monitor](#1-why-monitor)
2. [Session Search & Resume](#2-session-search--resume)
3. [Cost Tracking](#3-cost-tracking)
4. [Usage Pattern Analysis](#4-usage-pattern-analysis)
5. [Team Visibility](#5-team-visibility)

---

## 1. Why Monitor

Claude Code usage accumulates quickly. Without monitoring you're flying blind on:

- **Cost**: API spend visible only after invoices arrive
- **Efficiency**: Which files get re-read repeatedly (wasted tokens)
- **Patterns**: Which tools you actually use vs avoid
- **Optimization opportunities**: Sessions where token savings are low

**Payoff**: 10 minutes of monitoring setup → identify 20-30% waste in most workflows.

---

## 2. Session Search & Resume

After weeks of use, finding past sessions becomes painful. Native commands + a script solve this.

### Native Commands

| Command | Use |
|---------|-----|
| `claude -c` | Resume most recent session |
| `claude -r <id>` | Resume specific session by ID |
| `claude --resume` | Interactive session picker |

Sessions are stored at `~/.claude/projects/<encoded-path>/` as JSONL files.

### session-search.sh (Recommended)

Zero-dependency bash script for fast session lookup. Save as `~/.claude/scripts/cs`:

```bash
#!/bin/bash
# ~/.claude/scripts/cs — Claude Code session search
SESSIONS_DIR="${HOME}/.claude/projects"
MAX_RESULTS="${1:-10}"
KEYWORD="${2:-}"

find "$SESSIONS_DIR" -name "*.jsonl" -newer /tmp/.claude_idx 2>/dev/null \
    | sort -t/ -k1 -r \
    | head -50 \
    | while read -r file; do
        project=$(basename "$(dirname "$file")")
        first=$(head -1 "$file" 2>/dev/null)
        ts=$(echo "$first" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('timestamp','')[:16])" 2>/dev/null || true)
        summary=$(echo "$first" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('message',{}).get('content','')[:60])" 2>/dev/null || true)
        id=$(basename "$file" .jsonl)
        echo "$ts|$project|$summary|$id"
    done \
    | grep -i "${KEYWORD}" \
    | head -"$MAX_RESULTS" \
    | while IFS='|' read -r ts project summary id; do
        printf "%s │ %-24s │ %s\n" "$ts" "${project:0:24}" "${summary:0:60}"
        printf "  claude --resume %s\n\n" "$id"
    done
```

**Install**:
```bash
mkdir -p ~/.claude/scripts
chmod +x ~/.claude/scripts/cs
echo "alias cs='~/.claude/scripts/cs'" >> ~/.zshrc
source ~/.zshrc
```

**Usage**:
```bash
cs              # 10 most recent sessions
cs 20           # Show 20 results
cs 10 auth      # Search for "auth" in 10 results
```

**Output**:
```
2026-01-15 08:32 │ users-myapp              │ Implement OAuth flow for...
  claude --resume 84287c0d-8778-4a8d-abf1-eb2807e327a8

2026-01-14 21:13 │ users-other-project      │ Fix database migration...
  claude --resume 1340c42e-eac5-4181-8407-cc76e1a76219
```

### Community Tools Comparison

| Tool | Install | Speed | Resume support |
|------|---------|-------|----------------|
| **session-search.sh** (above) | Copy script | Fast | Yes |
| claude-conversation-extractor | `pip install` | Medium | No |
| ran CLI | `npm -g` | Fast | No |

### Cross-Folder Session Migration

Sessions are scoped to the project's absolute path. If you move a project folder, resume breaks.

**Manual migration**:
```bash
# Get current encoded path
OLD_ENCODED=$(pwd | sed 's|/|-|g' | sed 's|^-||')

# Move your project
mv /old/location/myapp /new/location/myapp
cd /new/location/myapp

# Move session directory to match new path
NEW_ENCODED=$(pwd | sed 's|/|-|g' | sed 's|^-||')
mv ~/.claude/projects/$OLD_ENCODED ~/.claude/projects/$NEW_ENCODED
```

---

## 3. Cost Tracking

### Reading Raw Session Data

Sessions are JSONL files at `~/.claude/projects/<project>/`. Each line is a JSON object with token counts.

```bash
# Token usage for the most recent session in current project
PROJ=$(pwd | sed 's|/|-|g' | sed 's|^-||')
LATEST=$(ls -t ~/.claude/projects/$PROJ/*.jsonl 2>/dev/null | head -1)

cat "$LATEST" | python3 - <<'PYEOF'
import sys, json
total_in = total_out = 0
for line in sys.stdin:
    try:
        d = json.loads(line)
        usage = d.get('usage', {})
        total_in += usage.get('input_tokens', 0)
        total_out += usage.get('output_tokens', 0)
    except Exception:
        pass
cost = total_in / 1_000_000 * 3 + total_out / 1_000_000 * 15
print(f"Input:  {total_in:,} tokens  (${total_in/1_000_000*3:.4f})")
print(f"Output: {total_out:,} tokens  (${total_out/1_000_000*15:.4f})")
print(f"Total:  ${cost:.4f}")
PYEOF
```

### Weekly Cost Report

```bash
# Save as ~/.claude/scripts/weekly-cost.sh
#!/bin/bash
SESSIONS_DIR="$HOME/.claude/projects"

find "$SESSIONS_DIR" -name "*.jsonl" -mtime -7 -print0 \
    | xargs -0 cat 2>/dev/null \
    | python3 - <<'PYEOF'
import sys, json
total_in = total_out = 0
for line in sys.stdin:
    try:
        d = json.loads(line)
        usage = d.get('usage', {})
        total_in += usage.get('input_tokens', 0)
        total_out += usage.get('output_tokens', 0)
    except Exception:
        pass
cost = total_in / 1_000_000 * 3 + total_out / 1_000_000 * 15
print(f"Last 7 days:")
print(f"  Input:  {total_in:,} tokens")
print(f"  Output: {total_out:,} tokens")
print(f"  Cost:   ${cost:.2f}")
PYEOF
```

### Pricing Reference (June 2026)

| Model | Input | Output | Cache read (0.10×) |
|-------|-------|--------|--------------------|
| Fable 5 | $10/M | $50/M | $1/M |
| Opus 4.8 / 4.7 / 4.6 | $5/M | $25/M | $0.50/M |
| Sonnet 4.6 | $3/M | $15/M | $0.30/M |
| Haiku 4.5 | $1/M | $5/M | $0.10/M |

**Rule of thumb**: Medium task (new feature, ~8,500 tokens optimized) ≈ $0.26 on Sonnet 4.6.

---

## 4. Usage Pattern Analysis

### Most-Read Files

Find which files Claude reads most — candidates for Serena memory or prompt caching:

```bash
PROJ=$(pwd | sed 's|/|-|g' | sed 's|^-||')

cat ~/.claude/projects/$PROJ/*.jsonl 2>/dev/null \
    | python3 - <<'PYEOF'
import sys, json
from collections import Counter
reads = Counter()
for line in sys.stdin:
    try:
        d = json.loads(line)
        if d.get('tool') == 'Read':
            path = d.get('tool_input', {}).get('file_path', '')
            if path:
                reads[path] += 1
    except Exception:
        pass
for path, count in reads.most_common(10):
    print(f"{count:4d}x  {path}")
PYEOF
```

Files read 5+ times are strong candidates for:
- Serena memory (architecture, conventions)
- Prompt caching (large stable files)

### Tool Usage Distribution

```bash
PROJ=$(pwd | sed 's|/|-|g' | sed 's|^-||')

cat ~/.claude/projects/$PROJ/*.jsonl 2>/dev/null \
    | python3 - <<'PYEOF'
import sys, json
from collections import Counter
tools = Counter()
for line in sys.stdin:
    try:
        d = json.loads(line)
        tool = d.get('tool', '')
        if tool:
            tools[tool] += 1
    except Exception:
        pass
for tool, count in tools.most_common():
    print(f"{count:5d}  {tool}")
PYEOF
```

**Interpretation**:
- Unexpected high `Read` counts → missing Serena memories for those files
- High `Bash` counts → consider creating skills for repetitive commands
- Low `mcp__serena__*` counts → Serena not being used effectively

---

## 5. Team Visibility

### Aggregate Team Usage

If teammates sync sessions to a shared location:

```bash
TEAM_SESSIONS_DIR="/shared/claude-sessions"

find "$TEAM_SESSIONS_DIR" -name "*.jsonl" -print0 \
    | xargs -0 cat 2>/dev/null \
    | python3 - <<'PYEOF'
import sys, json
from collections import defaultdict
by_user = defaultdict(lambda: {'input': 0, 'output': 0})
for line in sys.stdin:
    try:
        d = json.loads(line)
        user = d.get('user', 'unknown')
        usage = d.get('usage', {})
        by_user[user]['input'] += usage.get('input_tokens', 0)
        by_user[user]['output'] += usage.get('output_tokens', 0)
    except Exception:
        pass
for user, stats in sorted(by_user.items(), key=lambda x: x[1]['input'], reverse=True):
    cost = stats['input'] / 1_000_000 * 3 + stats['output'] / 1_000_000 * 15
    print(f"{user:20s}  {stats['input']:>10,} in  {stats['output']:>10,} out  ${cost:.2f}")
PYEOF
```

---

## Quick Reference

```bash
# Recent sessions
cs

# Cost for last session in current project
PROJ=$(pwd | sed 's|/|-|g' | sed 's|^-||')
LATEST=$(ls -t ~/.claude/projects/$PROJ/*.jsonl 2>/dev/null | head -1)
cat "$LATEST" | python3 -c "
import sys, json
t_i = t_o = 0
for line in sys.stdin:
    try:
        d = json.loads(line)
        u = d.get('usage', {})
        t_i += u.get('input_tokens', 0)
        t_o += u.get('output_tokens', 0)
    except Exception:
        pass
print(f'\${(t_i/1e6*3+t_o/1e6*15):.3f}')
"
```

---

**See also**:
- [Token Optimization Guide](../05-token-optimization/guide.md) — reduce the tokens being tracked
- [Cache Inspector skill](../01-global-optimization/guide.md) — `/cache-inspector` for real-time cache analysis
