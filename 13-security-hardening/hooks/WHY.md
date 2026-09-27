# Why each hook exists

One line per hook: the failure it answers, and when it can go. Controls usually compensate for something the model used to get wrong; once it stops, the control is pure cost (latency, context, false refusals). Without a recorded reason no hook can be removed safely. Copy this file next to your hooks and keep it current: add a row with every new hook, write `[unknown]` rather than guess, and review the table after a model upgrade.

| Hook | Failure it answers | Remove when |
|---|---|---|
| dangerous-actions-blocker.py — rm/dd/mkfs/chmod/force-push/DROP/credential files | Destructive commands in bypass/auto mode, where no prompt stands in the way. The substring predecessor was wrong in 12 of 38 audited cases. | Never while sessions run without per-action approval. |
| dangerous-actions-blocker.py — pkill/killall/kill rules | `pkill -f "cat" -U <uid> -x`: on macOS options after the pattern become extra patterns, `-f cat` matched every path under `/Applications/`, ~30 apps terminated. | A model reliably uses `kill <PID>`; check the deny count in transcripts first. |
| block-interactive-sudo.py | Bash tool has no TTY; interactive sudo hung until the call timed out. | The harness gains a TTY or sudo prompt passthrough. |
| pre-commit-secrets.py | Secrets committed to git; the shell predecessor never matched private keys and skipped whole directories. | A server-side secret scanner covers every repo. |
| shell-habits.py | `cd X &&` prefixes and grep-via-Bash wasted calls (39% of Bash calls in one log audit) despite a prose rule. | Transcripts show neither habit for a month with no denies. |
| check-package-latest.sh (reports only) | Pinning stale package versions from training-data memory. | The model checks registries on its own. |
