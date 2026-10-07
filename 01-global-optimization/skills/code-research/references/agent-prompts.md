# Reusable agent-prompt templates

Every research agent gets the same **grounding contract** + a slice-specific task + an explicit output path. Copy and fill the brackets.

## The grounding contract (prepend to every agent)
```
READ-ONLY. Do NOT modify any code. Do NOT assume — read the real files end-to-end
and cite `path:line` for every claim. Repo: <ABS PATH>. Indexed in codebase-memory-mcp
project "<SLUG>" — use search_graph / trace_path / get_code_snippet / get_architecture
for structure, then Read/Grep to verify. Feature *presence* may be inferred from concrete
files/routes/models, but never invent behavior; an unknown is a finding ("not verified"),
not a guess.
```

## Discovery / audit agent (domain or directory slice)
```
<grounding contract>
YOUR SCOPE (read every file): <exact dirs/files>.
For each component document: purpose, <domain-specific: validation/authz/logic/completeness/
correctness/security/reliability>, and any issue (severity-tagged, with file:line).
Cross-reference the existing KB where relevant (confirm/contradict, don't re-derive).
DELIVERABLE: write dense markdown to Svod `projects/<name>/<slice>.md` via
mcp__svod__write(path, content) — tables where useful, findings severity-tagged with
file:line. Then return a SHORT summary (top findings + a coverage statement: every file read?).
Your final message IS the report (returned to the orchestrator, not shown to a human).
```

## Verification agent (see verification.md)
```
<grounding contract>
STEP 1 — VERIFY: read the existing KB note `projects/<name>/<note>.md`. For EACH claim,
open the cited file:line and mark CONFIRMED-ACCURATE / INACCURATE / OVERSTATED / UNDERSTATED
with evidence. Re-check the "verified-safe" claims hardest — a wrong "safe" is the worst miss.
STEP 2 — HUNT what was missed in <domain>: <specific extra checks>.
DELIVERABLE: report Section 1 (verdict table) + Section 2 (NEW findings, file:line). Say
explicitly what you could NOT verify.
```

## Per-integration spec agent (see competitor-gap.md)
```
<grounding contract>
Enumerate <integration dir>. For EACH integration, READ its code and write ONE note
`projects/<name>/.../<prefix>-<slug>.md` following this template: summary · direction
(in/out/bi) · external protocol (endpoints/auth/format) · data mapping · flows
(triggers/webhooks/polling/retries) · config & credentials · error/edge handling ·
<our-project> fit · evidence paths · ⚠️ modernization flags. End EVERY note with:
"⚠️ Source code is <year> — verify the CURRENT provider API/SDK/version before implementing."
Return a SHORT summary listing the notes written.
```

## Tips
- Name each agent's output path yourself and keep them disjoint (`<slice>.md`, `<prefix>-<slug>.md`).
- If a slice is large, tell the agent it MAY spawn sub-agents but each must write its own note.
- For competitor/private repos add: "Do NOT copy secrets or unsafe patterns into our project — flag them as anti-patterns."
