# self-improve — integration seams

The loop is useful on its own (script + subagents). These seams let it compose with platforms
you may already run. All are **optional** — the loop degrades gracefully without them.

## Deterministic-execution / evidence platform
The three-tier gate is a DAG: `mine → apply(bounded) → [Tier1 ∥ Tier2 ∥ Tier3] → gate → deliver`.
Running it on a deterministic-execution platform (DAG validation, topological ordering,
hash-chained audit, replay) buys **provenance**, not just the check: who ran it, over what
inputs, with what result, replayable.

- **Seam:** `skill-lint.py --json` emits `{tool, tier, input_sha256, errors, warnings, verdict}`.
  A sealing node consumes that record into a tamper-evident, cache-keyable evidence bundle.
- **Why not a bare script:** the script gives you the check; the platform gives you the audit
  trail. For a loop that edits its *own* conventions, that trail is the safety rail.

## Decision-memory store (promoted rules)
Promote a threshold-crossing rule as durable `policy` memory (enters `provisional`, graduates to
`active` once it survives a cycle uncontradicted). Use a supersede/revoke op to replace an
outdated rule — never silently edit a contradiction. This loop is a primary *producer* of
decision truth: *what we decided, why, what we rejected.*

## Governance gate (consequential steps)
Read-only eval steps (Tier 1/2/3 reads, lint) pass freely. Mutations — auto-editing a skill,
`git push`, opening a PR — are consequential and route through an approval gate that classifies
tool consequence (e.g. from MCP `readOnlyHint`/`destructiveHint` annotations). This is the
enforcement arm of the skill's *Ask first* boundary: governance is a gate, not a habit of
remembering to ask.

## Code-intelligence engine (blast radius)
Before delivering a change to *code* (not just a markdown skill), scope its blast radius and
intersect with test coverage: *"touched N symbols, M untested with K callers → escalate to a
human."* A code-graph engine that distinguishes type-resolved edges from textual guesses keeps
the blast radius from inflating into noise.

## Salesforce → seam mapping
| Salesforce loop part | Seam | Runs without it? |
|---|---|---|
| Tier-2 deterministic validation (`validate-skills.ts`) | `skill-lint.py`, optionally sealed | ✅ script alone |
| Tier-1 trigger accuracy | subagent over real skill env | ✅ |
| Tier-3 rubric LLM-judge | subagent | ✅ |
| Recurring feedback → requirement | decision-memory `remember` + freq threshold | ✅ manual |
| Bounded edit + regression-abort | loop caps + Tier-2 gate | ✅ |
| Consequential apply / draft PR | governance gate + human | ✅ manual gate |
| Blast radius of the edit | code-intelligence engine | ✅ skip for md-only |
| Replayable audit per cycle | evidence platform | ✅ script logs |
