# Phase 2 — Verify

A first pass, however careful, contains overstatements and misses. A cheap independent re-audit turns "probably accurate" into "verified", and reliably surfaces the highest-value findings the first pass skipped. Do this before treating the KB as authoritative.

## Spawn independent re-audit agents
One per domain (or one covering all notes if small), each doing TWO things:

1. **Verify the existing notes.** Read each KB note; for every claim, open the cited `path:line` and mark:
   - **CONFIRMED-ACCURATE** — claim matches code.
   - **INACCURATE / WRONG** — with the real value.
   - **OVERSTATED** — real but exploitability/impact narrower than stated (e.g. "SSRF" that has no caller → latent, not live).
   - **UNDERSTATED** — worse or broader than stated (e.g. "in 2 places" → actually 5).
   Re-check "verified-safe" claims **hardest** — a wrong "safe" (a real IDOR / injection labeled safe) is the worst possible miss.

2. **Hunt what was missed.** Domain-specific second-order checks the first pass tends to skip: CSRF on state-changing routes, webhook/callback auth, transaction/race/idempotency, cross-DB atomicity, information-exposure via serializers, dead code that still ships secrets, config posture (session/mail/queue), etc.

## Apply corrections
- When verification finds an error, **fix the note** — don't leave both versions. Add a short "corrections applied" record (what was wrong → right) so the audit trail survives.
- Deeper dedicated agents routinely correct earlier high-level agents (e.g. "that's a shipping-carton model, not a page-builder model"; "reseller is agency revenue-share, not a product reseller"). Treat the **deeper/verified** note as authoritative.
- Roll new findings into the severity list and the index's "top things" section.

## Output
A verification note (`verification-<date>.md`) with: verdicts table (claim → verdict → evidence), NEW findings (severity, file:line, scenario), and an explicit "NOT verified this pass" list. Link it from the index.

## Honesty rules
- State what you could NOT verify rather than implying it passed.
- Distinguish CONFIRMED from PLAUSIBLE/NEEDS-REVIEW throughout.
- Never launder a guess as a finding.
