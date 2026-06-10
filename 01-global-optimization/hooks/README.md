# Productivity Hooks Library

Hooks that automate the optimization workflow from [guide.md](../guide.md) at the harness level. The principle: **anything you find yourself reminding Claude to do every session belongs in a hook, not in a prompt.** Prompts are advisory and consume attention; hooks are deterministic and free.

Security-focused hooks (destructive-command blocker, staged-secrets scanner) live in [`13-security-hardening/hooks/`](../../13-security-hardening/hooks/).

## Hooks

| Hook | Event | What it does |
|------|-------|--------------|
| [check-package-latest.sh](check-package-latest.sh) | `PreToolUse` (Bash) | When Claude runs `composer require` / `npm install` / `pip install` / `cargo add` / `go get`, queries the package registry (3s cap) and injects the actual latest stable version into context — so Claude pins current versions instead of stale training-data ones |
| [session-start-memory-load.sh](session-start-memory-load.sh) | `SessionStart` | Maps the current working directory to relevant memory files and injects them into context on turn one — deterministic memory loading with zero tool calls |

## Installation

```bash
mkdir -p ~/.claude/hooks
cp check-package-latest.sh session-start-memory-load.sh ~/.claude/hooks/
chmod +x ~/.claude/hooks/*.sh
# Edit the case blocks in session-start-memory-load.sh to map YOUR project paths
```

Register in `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "~/.claude/hooks/check-package-latest.sh" }
        ]
      }
    ],
    "SessionStart": [
      {
        "hooks": [
          { "type": "command", "command": "~/.claude/hooks/session-start-memory-load.sh" }
        ]
      }
    ]
  }
}
```

## Design rules learned in production

1. **Fast-exit first.** Every hook starts by checking whether it applies (`[[ "$TOOL_NAME" != "Bash" ]] && exit 0`) — hooks run on *every* matching event, so the common path must cost near zero.
2. **Cap network calls hard.** `check-package-latest` uses `--max-time 3` per registry; a hanging registry must never block the session.
3. **Keep injected context small.** SessionStart stdout lands in the context window for the whole session. Inject the 1–3 memories that match the cwd, never "everything".
4. **Fail open.** `|| true` and `// empty` everywhere — a malformed payload or missing `jq` should result in "hook does nothing", never "session broken".
5. **A session-summary Stop hook** pairs well with these — see [`16-autonomous-agents/`](../../16-autonomous-agents/) for the daily-note journaling recipe.
