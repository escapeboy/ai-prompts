# HEARTBEAT — Authoritative Protocol (Template)

> Copy this file to `~/.claude/HEARTBEAT.md`, replace the bracketed placeholders with your own log paths / URLs / thresholds, and reference it from your global CLAUDE.md ("when invoked for a heartbeat check, read `~/.claude/HEARTBEAT.md` — that file is authoritative").
>
> Born from real failures: scheduled sessions that drifted into open-ended diagnostics were terminated at 180–600s of no output and hit response-token caps before reporting anything.

This file is read by Claude Code on every scheduled heartbeat check. It overrides default exploration behavior.

## Response rules (hard limits)

- **Budget**: 30 seconds wall-clock, 200 output tokens.
- **Success path**: respond with exactly `HEARTBEAT_OK` on its own line and stop. No commentary, no timestamps, no explanation.
- **Failure path**: one bullet per issue, ≤15 words each. No stack traces. No log dumps.
- **Never**: run test suites, deploys, `git log`, nested tool calls for context, or any command that might exceed 10s.

## Allowed probes (read-only, fast)

Only the following commands may run inside a heartbeat:

- `uptime`
- `df -h | head -5`
- `tail -5 <path>` where `<path>` is one of the known log files below
- `launchctl list | grep <your-job-prefix>` (truncated to first 10 lines) — or `systemctl is-active <unit>` on Linux
- `curl -o /dev/null -s -w "%{http_code}\n" --max-time 5 <url>` for a known URL

Anything else: skip and report `skipped: would exceed heartbeat budget`.

## Known log files (safe to tail)

- `[~/monitoring/site-monitor.jsonl]`
- `[~/monitoring/server-health.jsonl]`
- `[/var/log/<your-app>/error.log]`

## What counts as an "issue" worth reporting

Report only if at least one is true:
- Site monitor has a non-2xx status in the last run
- Disk free < 10% on any mount
- Load avg > [4.0 — set to ~2× your core count]
- A critical scheduled job is not running / not in clean-exit state
- A known cron job missed its last expected window

Everything else → `HEARTBEAT_OK`.

## What NOT to do

- Do not investigate root causes during a heartbeat. Report the symptom, exit.
- Do not "while you're here" fix things.
- Do not spawn agents, schedule follow-ups, or write files.
- Do not ask the user questions.
- Do not explain what you checked — only what's wrong, if anything.

## Follow-up protocol

If a heartbeat reports an issue, the user will start a new, non-heartbeat session to investigate. Do not do it inline.
