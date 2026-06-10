# Autonomous & Scheduled Agents

**Run Claude Code unattended — cron jobs, heartbeat watchdogs, and session journaling — without runaway sessions**

Everything in this guide comes from running headless Claude Code in production for months: a journaling agent that fires several times a day, scheduled health checks, and the failure modes that killed early versions (sessions drifting into open-ended investigations, burning their token budget, and getting terminated mid-flight).

## The Three Primitives

| Primitive | Trigger | Lives where | Use for |
|-----------|---------|-------------|---------|
| **Headless run** (`claude -p "..."`) | cron / launchd / CI | Your machine or server | Recurring jobs: journaling, health checks, report generation |
| **`/loop`** | In-session interval or self-paced | Inside a running session | Polling within a workday: "check the deploy every 5m" |
| **Hooks** (`SessionStart` / `Stop`) | Harness events | `~/.claude/hooks/` | Per-session automation: context injection, session summarizing |

`/schedule` (cloud routines) covers the same ground as cron-driven headless runs when you want Anthropic to host the schedule instead of your own crontab.

## The Core Design Problem

An unattended agent has no human to say "stop". Every recipe below is shaped by the same three rules:

1. **Hard budget, stated in the prompt.** Wall-clock, token count, and an allowed-commands list. Sessions without budgets drift into investigations and get killed by timeouts mid-write.
2. **Idempotent effects.** The agent may run twice, crash mid-run, or fire while the previous run is still finishing. Design every write so a re-run converges instead of duplicating.
3. **Self-contained brief.** The cron prompt is the *entire* context — the agent doesn't see your conversation history. Include data-gathering order, edit rules, and output shape explicitly.

---

## Recipe 1: The Daily Journaling Agent

The highest-leverage autonomous agent we run: a cron job that fires 2–4×/day and maintains a daily note **in place**. Each run harvests what actually happened (commits, logs, monitors) and updates structured sections idempotently — by end of day the note is a complete, accurate work journal nobody had to write.

### The cron entry

```cron
# crontab -e  (or a launchd plist on macOS)
0 9,13,18,22 * * * cd ~ && claude -p "$(cat ~/.claude/prompts/daily-journal.md)" --max-turns 30 >> ~/logs/journal-agent.log 2>&1
```

### The prompt template (`~/.claude/prompts/daily-journal.md`)

```markdown
You are the daily journaling agent. Update today's daily note at
~/notes/daily/$(date +%Y-%m-%d).md. Create it from the template below if missing.

## Data gathering (in this order, nothing else)
1. Today's commits across all local repos:
   for d in ~/projects/*/.git; do
     git -C "${d%/.git}" log --author="$(git config user.name)" \
       --since=midnight --oneline 2>/dev/null | sed "s|^|${d%/.git}: |"
   done
2. Monitoring signals: grep -hE "ERROR|ALERT| 5[0-9][0-9] " ~/logs/monitors/*.log | tail -20
3. Calendar/tasks (optional): today's items from your task source

## Edit rules (idempotent — this note is updated several times a day)
- Sections: ## Commits, ## Incidents, ## Notes. Update ONLY the first two.
- REPLACE the full content of ## Commits with the current harvest (it is
  cumulative since midnight, so replacement converges). Never append duplicates.
- APPEND to ## Incidents only entries not already present (match on timestamp).
- NEVER touch ## Notes — that section belongs to the human.

## Budget
- Max 30 turns, no command longer than 10s, no network calls except listed ones.
- If a data source is unavailable: write "(source unavailable)" and move on.
  Do NOT debug it.

When done: reply with one line — "journal updated: N commits, M incidents".
```

### Why this shape works

- **Replace-vs-append per section** is the idempotency trick. Cumulative data (commits since midnight) gets *replaced*; event data (incidents) gets *deduped appends*; human data is *untouchable*. A run firing twice changes nothing.
- **"Do NOT debug it"** is load-bearing. The single biggest failure mode of unattended agents is treating a broken data source as an invitation to investigate. Name the fallback behavior explicitly.
- **One-line completion report** makes the cron log scannable: `grep "journal updated" journal-agent.log` is your uptime monitor.

### Companion: per-session summaries via a Stop hook

The journaling agent captures *outcomes*; a `Stop` hook captures *Claude Code work itself*. [session-summary-hook.py](session-summary-hook.py) runs after every session that made real tool calls, summarizes the transcript with Haiku (~$0.001/session), and appends a timestamped entry to the same daily note. Wire it as a `Stop` hook in `settings.json`. Together they produce a daily note where your manual work and your agents' work land in one place.

---

## Recipe 2: The Heartbeat Watchdog Protocol

Scheduled health checks are the easiest agents to build and the easiest to ruin. The failure sequence we hit repeatedly: heartbeat fires → agent notices something mildly off → starts investigating → blows through the response window → gets terminated at 180–600s with nothing reported. The fix is a **protocol file** the agent must read, with hard limits — see [heartbeat-template.md](heartbeat-template.md) for the full copy-paste version.

The five rules that matter:

1. **Exact success token.** On success the agent replies with exactly `HEARTBEAT_OK` — nothing else. This makes the monitoring side trivial (`grep -q HEARTBEAT_OK`) and removes the temptation to narrate.
2. **Token budget for failures.** Issues are reported in ≤200 tokens, one bullet per issue, ≤15 words each. No stack traces, no log dumps.
3. **Allowlist of probes.** Enumerate the exact commands the heartbeat may run (`uptime`, `df -h | head -5`, `tail -5 <known-log>`, one `curl --max-time 5`). Everything else: "skipped: would exceed heartbeat budget".
4. **Symptoms, not causes.** A heartbeat reports *that* disk is at 92%, never *why*. Root-causing happens in a separate, human-initiated session. No "while you're here" fixes.
5. **Explicit issue thresholds.** Define what counts as reportable (non-2xx in last monitor run, disk <10% free, load >4.0). Everything else is `HEARTBEAT_OK` — otherwise the agent invents concerns to seem useful.

Add a corresponding section to your global CLAUDE.md so any session that receives a heartbeat-style prompt knows to switch into this mode (see `01-global-optimization/system-prompts/`).

---

## Recipe 3: Watchdogs for the Watchers

Long autonomous runs fail in ways that produce no error: stalls, token runaway, and repeated-action loops. Pair any unattended pipeline with a cheap read-only monitor agent (Haiku-tier) that tails the session log every 30s and classifies: `OK / STALL / RUNAWAY / LOOP / COMPLETE`, alerting a human on anything non-OK. A full agent definition is in [`10-subagents/examples/loop-monitor.md`](../10-subagents/examples/loop-monitor.md).

Detection heuristics that work:
- **Stall** — last log entry older than N seconds (tune N to task cadence; migrations and compiles pause legitimately)
- **Runaway** — token delta per tool call far above session baseline (usually a reasoning loop)
- **Loop** — last 5 tool calls identical (same tool, same input)

The monitor is **read-only by design** — it alerts, a human decides. An agent that can kill other agents is a new failure mode, not a fix.

---

## Recipe 4: `/loop` for In-Session Recurrence

For recurrence *within* a working session (deploy watching, CI polling), prefer `/loop` over cron — it keeps the context: `/loop 5m check the deploy status and summarize changes`. Self-paced mode (`/loop` without an interval) lets the model pick wake-up timing matched to what it's waiting on. Same budget rules apply: give the loop body an explicit "if X hasn't changed, say so in one line and go back to sleep" instruction, or each tick produces a paragraph of filler.

---

## Anti-Patterns (each one cost us a real incident)

| Anti-pattern | What happens | Fix |
|---|---|---|
| No budget in the prompt | Agent investigates, gets killed at the timeout, reports nothing | Hard limits + allowlist in the prompt itself |
| Append-only journal edits | Note fills with duplicate sections after every run | Replace cumulative sections, dedupe event sections |
| Heartbeat that fixes things | "Minor" inline fix mutates prod state with nobody watching | Symptoms only; separate human-initiated session for fixes |
| Cron prompt references "the project" | Agent in a cron context has no idea which project | Absolute paths, explicit repo lists, self-contained brief |
| Monitoring the monitor's prose | Status parsing breaks when phrasing varies | Exact tokens (`HEARTBEAT_OK`) and one-line machine-greppable reports |

## Files in This Section

- [guide.md](guide.md) — this guide
- [heartbeat-template.md](heartbeat-template.md) — copy-paste HEARTBEAT protocol file
- [session-summary-hook.py](session-summary-hook.py) — Stop hook: Haiku-summarized session entries appended to a daily note

## Related Sections

- [`06-advanced-patterns/`](../06-advanced-patterns/) — multi-agent coordination, headless review fan-out
- [`10-subagents/`](../10-subagents/) — loop-monitor and other watchdog agent definitions
- [`01-global-optimization/hooks/`](../01-global-optimization/hooks/) — SessionStart/PreToolUse hook library
