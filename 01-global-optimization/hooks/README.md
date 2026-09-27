# Productivity Hooks Library

Hooks that automate the optimization workflow from [guide.md](../guide.md) at the harness level. The principle: **anything you find yourself reminding Claude to do every session belongs in a hook, not in a prompt.** Prompts are advisory and consume attention; hooks are deterministic and free.

Security-focused hooks (destructive-command blocker, staged-secrets scanner) live in [`13-security-hardening/hooks/`](../../13-security-hardening/hooks/).

## Hooks

| Hook | Event | What it does |
|------|-------|--------------|
| [check-package-latest.sh](check-package-latest.sh) | `PreToolUse` (Bash) | When Claude runs `composer require` / `npm install` / `pip install` / `cargo add` / `go get`, queries the package registry (3s cap) and injects the actual latest stable version into context — so Claude pins current versions instead of stale training-data ones |
| [session-start-memory-load.sh](session-start-memory-load.sh) | `SessionStart` | Maps the current working directory to relevant memory files and injects them into context on turn one — deterministic memory loading with zero tool calls |
| [shell-habits.py](shell-habits.py) | `PreToolUse` (Bash) | Refuses `cd X && cmd` (use absolute paths, `git -C`, `make -C`, or a separate `cd` call — the working directory persists) and standalone `grep`/`rg` (use the Grep tool; grep inside a pipeline is allowed). Each refusal names the fix. Replaces two prose rules that a log audit showed were not followed. Tested in [`13-security-hardening/hooks/tests/test_guards.py`](../../13-security-hardening/hooks/tests/test_guards.py) |

## Installation

```bash
mkdir -p ~/.claude/hooks
cp check-package-latest.sh session-start-memory-load.sh shell-habits.py ~/.claude/hooks/
chmod +x ~/.claude/hooks/*.sh ~/.claude/hooks/*.py
# Edit the case blocks in session-start-memory-load.sh to map YOUR project paths
```

Register `shell-habits.py` like the others: `{ "type": "command", "command": "$HOME/.claude/hooks/shell-habits.py", "timeout": 5 }` under a `"matcher": "Bash"` entry.

### Shell aliases leak into the Bash tool

Claude Code's Bash tool sources your `~/.zshrc`, so "better defaults" aliases apply to the agent too: `du -sh` runs `dust`, `curl -s` runs `xh`, `cd` runs zoxide — and standard flags fail. Claude Code sets `CLAUDECODE=1` in that shell, so drop them there only:

```bash
# ~/.zshrc, after the aliases
if [[ -n "$CLAUDECODE" ]]; then
  unalias cd ls cat grep find diff du df top curl 2>/dev/null
fi
```

Your interactive terminal keeps the aliases. Check with `CLAUDECODE=1 zsh -ic 'type du'` → `/usr/bin/du`.

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
