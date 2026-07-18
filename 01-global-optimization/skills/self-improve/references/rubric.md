# self-improve — evaluation rubric & signal-mining protocol

## Signal mining (frequency threshold)
A correction becomes a **rule candidate** only once it recurs. Sources, in priority order:
1. `feedback_*` auto-memories (the user has many) — each is already a "this recurred" marker.
2. PR review threads — comments that got silently accepted (agreed) vs disputed (don't promote).
3. Repeated in-session corrections of the same kind.

**Threshold:** ~3 independent occurrences of the *same* corrective pattern in a window.
- Below threshold → leave it as a memory; do **not** promote. (Prevents the loop mutating on noise.)
- At/above threshold → it is an undocumented requirement → promote (Svod policy) + fold into the generator.
- Signal that got **disputed** by a human is negative signal — it calibrates the rule *down*
  (stop enforcing), exactly as the bot learns "what humans don't care about".

**Efficacy metric:** count how often each pattern recurs per cycle. A pattern that appeared
5× last window and 0× this window has been internalised. Declining repeat-frequency = the loop
works. Rising frequency on a *new* pattern = a convention changed; restart the loop there.

## Tier 1 — Trigger accuracy protocol
Run via an independent subagent with the real skill environment loaded (competing skills present).
- Author **10 should-trigger** queries (paraphrases a user would really type) and **10 should-not**
  (adjacent tasks a *sibling* skill owns — this is where collisions hide).
- The subagent, given only the skill descriptions, picks which skill (if any) fires per query.
- **Pass bar:** ≥9/10 should-trigger fire correctly AND ≥9/10 should-not stay silent / route elsewhere.
- A should-not that fires this skill = a trigger collision → tighten the `description` (the
  deterministic linter's similarity warning is the cheap pre-filter for this).

## Tier 3 — LLM-as-judge rubric
Grade the SKILL.md on each dimension (score 1–5; a `≤2` on any is a blocking fail):
| Dimension | 5 = | 1 = |
|---|---|---|
| **Scope precision** | "when NOT to" names the simpler alternative | fires on everything / vague |
| **Progressive disclosure** | thin core; depth in `references/`, loaded on demand | one monolith, or dead refs |
| **Boundary clarity** | Always / Ask-first / Never, consequential ops gated | no boundaries, or destructive ops ungated |
| **Convention adherence** | matches the library's authoring conventions | reinvents structure/naming |
| **Signal fidelity** | encodes the *actual* recurring requirement | gold-plates beyond the signal |

Reuse the `output-evaluator` agent where its APPROVE/NEEDS_REVIEW/REJECT verdict fits; add the
dimensions above. Deterministic facts stay in Tier 2 — the judge only rules on what needs context.

## Bounded-edit discipline
Per cycle: **≤5 improvements, ≤100 changed lines.** Larger scope → split across cycles. This
bounds blast radius so a bad rule can't cascade, and keeps each cycle's evidence bundle small
and reviewable. Any Tier-2 regression aborts the cycle before delivery.
