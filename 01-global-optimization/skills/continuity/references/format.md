# `.continuity/STATE.md` format

The single living resume/finalize surface. **Bounded** (aim ≤ 1 screen). Overwrite in
place on `finalize` — it is not an append-only journal (git already gives you history).

## Provenance line
Directly under the `# Continuity — <project>` title:
```
_Last finalized: 2026-07-18 · session: auth-refresh-rate-limit_
```
`resume` warns if this date is stale (> ~14 days) → treat the surface as low-trust and re-verify.

## Evidence tags
One tag at the start of each bullet. It encodes **how much to trust the fact**, which is the
whole point — hidden uncertainty is where bad continuations start.

| Tag | Meaning | Trust |
|-----|---------|-------|
| `[observed]` | runtime/tooling actually showed this (log, error, test run) | high |
| `[validated]` | a check/test confirms it now | high |
| `[user]` | the user directed or corrected this | high |
| `[claimed]` | an agent asserted it, not yet verified | **low** |
| `[contradicted]` | later work contradicted this earlier belief | **low** |
| `[unknown]` | open question, not investigated | **low** |

`lint` rejects any `[tag]` outside this set.

## Required sections (`## `)
| Section | Holds |
|---------|-------|
| `Now` | what is mid-flight right this moment |
| `Next action` | the single next concrete step (not a backlog) |
| `Decisions` | choices made + *why*, tagged |
| `Known failures` | commands/approaches that failed — so they aren't repeated |
| `Validation expectations` | how we prove it works (test cmd, endpoint, check) |
| `Entry points` | `file:line` / symbol → what it is (fill from codebase-memory-mcp) |
| `Unresolved risks` | open risks, unknowns, contradictions |

## Worked example

```markdown
# Continuity — acme-api

_Last finalized: 2026-07-18 · session: auth-refresh-rate-limit_

## Now
Adding a per-IP rate limit to the token-refresh endpoint; middleware wired, tuning the window.

## Next action
[unknown] Decide the window: 5/min was too tight in manual testing — try 20/min and re-check.

## Decisions
- [user] Rate-limit refresh, NOT login — user said login already has Fail2ban upstream.
- [validated] Use the framework's built-in limiter (no new dependency) — test green.

## Known failures
- [observed] `redis-cli` limiter store failed under the parallel test suite (connection race) —
  switched the test env to the array store; prod stays on redis.

## Validation expectations
- [validated] `pytest tests/auth/test_refresh_rate_limit.py` must stay green.
- [observed] Manual: 6th refresh within 60s returns HTTP 429.

## Entry points
- `src/auth/middleware/rate_limit.py:42` — the limiter binding.
- `src/auth/routes.py:88` — refresh route the middleware attaches to.

## Unresolved risks
- [unknown] Does the limiter key survive behind the CDN, or does it see one shared IP?
- [contradicted] Earlier assumed a global limiter would do — per-IP is required (user).
```

## Local vs portable split
- `STATE.md` is the **portable** subset — safe to commit and share with a team (decisions, next
  step, validation). No secrets, no machine paths.
- `.continuity/local/` is **gitignored** — machine-specific scratch, throwaway notes, anything you
  don't want in a shared diff.
The scaffold writes a `.continuity/.gitignore` that ignores `local/` for you.
