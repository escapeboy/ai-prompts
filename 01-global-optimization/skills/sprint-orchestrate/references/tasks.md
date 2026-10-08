# Task list in the architecture doc

Plan writes it, Build ticks it, Review verifies it, Test records the result. Tools (the `/company` dashboard) parse these lines with a regex, so keep the exact shape.

## Format

At the end of `docs/architecture-[feature].md`:

```markdown
## Tasks
- [ ] T1 Payment model and migration
- [x] T2 Refund endpoint
- [x] T3 Webhook handler {verified}
- [x] T4 Idempotency keys {rejected: no test for a duplicate webhook}
- [ ] T5 Retry on 5xx {added}
```

One task per line, directly under `## Tasks`, until the next heading:

```
- [ |x] T<n> <title> [{added}] [{verified} | {rejected: <reason>}]
```

| Mark | Written by | Means |
|---|---|---|
| `- [ ] T<n> …` | Plan | not started |
| `- [x] …` | Build | the builder says it is done |
| `{verified}` | Review | a stronger model checked it against the diff and tests |
| `{rejected: <reason>}` | Review | the check failed; the reason is one line |
| `{added}` | Build | a task found during Build, not in the plan |

## Rules per phase

**Plan**
- Tasks are small: about half a day or less, each one checkable in the diff.
- IDs are `T1`, `T2`, … in order, unique, never reused.
- Cover the test plan too: a task for the tests of each risky path.

**Build**
- Tick `[x]` when a task is done, in the same commit as the work when possible.
- Never delete, rename or renumber a task. A task that turns out unnecessary stays `[ ]` with a note in the PR, not removed.
- A new task found during Build gets the next free ID and `{added}`.
- Do not write `{verified}` or `{rejected}` — that is Review's.

**Review**
- Run on a stronger model than the builder's (Opus by default, `model: "opus"`), as part of the normal review — not an extra agent.
- For every `[x]` line without a mark: find the code and the test that make it true. Append `{verified}`, or `{rejected: <what is missing>}`.
- On a re-review after a fix, replace `{rejected: …}` with `{verified}` once it holds; keep a still-failing one with an updated reason.
- An unticked `[ ]` is not a finding by itself; it blocks the gate (see SKILL.md).

**Test**
- After `/qa --full`, write one line right under the title of `docs/test-plan-[feature].md`:
  `Result: PASS 2026-10-08` or `Result: FAIL 2026-10-08 — <one-line reason>`.
- Replace the previous `Result:` line; there is only ever one.
