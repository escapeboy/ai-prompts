# Phase 3 — Synthesize

Turn the agents' per-slice notes into ONE navigable knowledge base with a single entry point. The agents already wrote the detail; your job is the index, the cross-links, the corrections, and the durable pointer.

## KB structure (progressive disclosure)
Thin top index → sub-indexes → detail notes. Everything reachable from the entry point.
```
projects/<name>/
  00-index.md              # ENTRY POINT: what it is, one-line verdict, navigation map, top findings
  <domain notes>.md        # architecture, feature-inventory, gaps, security, ui-ux, services
  verification-<date>.md   # the re-audit
  deep/00-deep-index.md    # (if line-level) consolidated severity list → 11 per-area notes
  reference/*.md           # navigation aids (data-model, auth/tenancy)
  plans/*.md               # implementation plans (if produced)
  competitor/...           # gap analysis + per-integration specs (if a competitor run)
```

## The index (00-index.md)
- Header: repo, branch/commit, index slug, date.
- **One-line verdict** — the single most useful sentence.
- **Navigation map** — grouped `[[wikilinks]]` to every note (and sub-index → its detail notes enumerated), so nothing is orphaned. Keep sub-index detail in the sub-index (don't inline 100+ notes in the top index).
- **Top things to fix / know** — severity-ranked, each linking its source note.
- **Corrections** — any earlier claim that verification overturned, stated plainly.

## Cross-linking
- Use `[[note-slug]]` liberally; a link to a not-yet-written note is fine (marks intent).
- Bidirectional where it matters (index ↔ sub-index ↔ detail).
- When you split or supersede a note, leave a **redirect stub** at the old path pointing to the replacements so inbound links don't break.

## Corrections discipline
- Fold verification results into the affected notes (don't keep contradictory versions).
- If a high-level note and a deep note disagree, the deep/verified one wins; fix the summary.

## Durable memory pointer
Leave a thin pointer in the harness project-memory dir (`~/.claude/projects/<slug>/memory/`) — a `reference`-type note naming where the KB lives (Svod path + entry point) + a one-paragraph status, plus a line in that dir's `MEMORY.md`. Do NOT duplicate KB content into memory — it's a pointer. Update the existing pointer instead of creating duplicates as the KB grows.

## Editing gotcha
`mcp__svod__edit` takes `oldString`/`newString`. A wrong param name (`old_string`/`new_string`) can silently delete the matched block — **re-read the note after any edit** to confirm it applied as intended.

## Cleanup
After synthesis: stop any agent still alive in a heartbeat-wait (`TaskStop`), and kill leftover waiter-loop shells (`ps` for `seq 1 …; sleep` polling loops). Confirm no background tasks remain.
