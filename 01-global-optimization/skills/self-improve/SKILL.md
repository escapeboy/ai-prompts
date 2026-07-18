---
name: self-improve
description: >-
  Close the loop on a skill/prompt/convention library: mine recurring review
  feedback into rules, fold them back into the generator, and gate every change
  through a three-tier evaluation (deterministic lint + trigger accuracy + LLM
  judge) that converges instead of drifting. Use when a correction keeps recurring
  across skills/PRs, when adding or revising skills warrants a quality gate, or when
  asked to "harden the skill library", "run the eval", "lint skills", or "close the
  loop". Composes with your existing execution, memory, and governance layers.
---

# self-improve — closing the loop on a convention library

A review comment that recurs is not a comment — it is an **undocumented requirement**.
Once the same guidance appears often enough it belongs in the *system*, not in a human
review. This skill turns that insight into a **converging** loop: mine the recurring
signal → fold it into the generator/conventions → prove the change with a three-tier
gate. As the library improves it produces fewer repeat comments → less signal → smaller
changes → **steady state** (natural damping, not infinite mutation). When conventions
change, the surge of new comments restarts the loop exactly where needed.

Adapted from Salesforce Engineering, *"Closing the Loop: How to Build Self-Improving AI
Systems with Automated Feedback Loops"* (2026-07-17, `forcedotcom/sf-skills`).

## When to Use This Skill (and When NOT to)

| Use this skill for | Use a simpler approach for |
|--------------------|----------------------------|
| A correction that has recurred ~3+ times across skills/PRs/sessions | A one-off fix — just fix it |
| Adding/revising a skill and wanting a real quality gate before release | A trivial typo/wording edit |
| Periodic "harden the library" / trigger-collision sweep | A single skill you already know is fine |
| Promoting a repeated preference into a durable rule | An ephemeral session fact |

**Start simple.** Do not run the full loop for a single edit. The loop earns its cost
only when the same signal repeats — that repetition is the whole trigger.

## The loop

```
mine signal → apply (bounded) → three-tier gate → promote rule → measure → converge
```

1. **Mine the signal.** Collect recurring corrections (from feedback memories, PR review
   threads, repeated session corrections). Apply a **frequency threshold**: a pattern seen
   ~3+ times is a requirement, not a one-off. See `references/rubric.md`.
2. **Apply, bounded.** Fold the rule into the generator surface (skill body, a global
   `CLAUDE.md` convention, a template). **Blast-radius caps: ≤5 improvements and ≤100
   changed lines per cycle.** Larger → split into cycles. Any regression in the gate **aborts**.
3. **Three-tier gate** (below). All three must pass before delivery.
4. **Promote the rule** to durable memory (a decision-memory store; see integration seams).
5. **Deliver transparently.** Consequential steps (auto-edit, push PR) pass a governance
   gate and produce a **draft PR for human review**, never an auto-merge.
6. **Measure convergence.** Track the decline in repeat-signal frequency across cycles (the
   direct efficacy metric). When signal dries up, stop; it restarts on the next convention change.

## Three-tier evaluation

Deterministic checks where quality is objectively measurable; LLM judgement only where it
needs context. Neither replaces the other — they answer different questions.

- **Tier 1 — Trigger accuracy** (semantic, subagent). Does the skill fire when it should and
  stay silent when it should not, in the *real* crowded skill environment? 10 should-trigger +
  10 should-not queries via an independent subagent. Protocol → `references/rubric.md`.
- **Tier 2 — Structural validation** (deterministic, script). The mechanical CI checks:
  ```bash
  python3 ~/.claude/skills/self-improve/scripts/skill-lint.py <skills-dir> [--json] [--strict]
  ```
  Validates frontmatter, kebab-case name matching the dir, description bounds, unreferenced
  bundled files (dead weight), duplicate names, and trigger-collision (near-duplicate
  descriptions). `--json` emits an evidence record. A non-zero exit is a hard gate — treat like
  a failing CI check that blocks the PR. Ship it as a pre-commit hook.
- **Tier 3 — Rubric LLM-as-judge** (semantic, subagent). Grade the artifact on the dimensions
  in `references/rubric.md` (scope precision, progressive disclosure, boundary clarity,
  convention adherence, signal fidelity).

## Integration seams (optional)

The loop composes with whatever platforms you run — it does not require them. See
`references/integration-seams.md`:

- **Deterministic-execution / evidence platform** — run the Tier-2 gate as a sealed node; the
  `--json` record + input digest make each cycle replayable and auditable.
- **Decision-memory store** (e.g. [Svod](https://github.com/FleetQ/svod-engine)) — promoted
  rules and cycle decisions land here as durable policy, provisional→active.
- **Governance gate** (e.g. [Lattice](https://github.com/escapeboy/lattice)) — consequential
  steps (auto-edit, push PR) route through an approval gate; read-only eval steps pass freely.
- **Code-intelligence engine** (e.g. `codebase-memory-mcp`) — blast-radius ∩ test-coverage of a
  *code* edit: if it touches untested symbols, escalate to a human.
- **MCP aggregator** (e.g. [Harbormaster](https://github.com/FleetQ/harbormaster)) — surfaces
  all of the above as one MCP surface.

## Boundaries

**Always**
- Enforce the frequency threshold — do not promote a one-off correction into a rule.
- Run all three tiers; a red Tier-2 aborts the cycle. Keep edits within the ≤5 / ≤100 caps.
- Promote durable rules to a decision-memory store; keep ephemeral facts out of it.

**Ask first**
- Pushing a PR or editing a shared/team skill library (consequential → governance gate + human).
- Widening the blast-radius caps for a single cycle.

**Never**
- Auto-merge a self-generated change without human review (stop at draft PR — the blocker is the
  reviewer, by design).
- Let the loop mutate on thin signal — below threshold, do nothing and let it converge.
- Duplicate an existing rule/memory instead of superseding it.
