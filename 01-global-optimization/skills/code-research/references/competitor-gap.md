# Variant — Competitor / feature-gap analysis (two codebases)

Research a competitor (or any reference) codebase, compare it to YOUR documented features, and produce a prioritized "what we're missing" gap + implementation-ready per-integration specs. Assumes your own project is already researched (or research it first with the main workflow).

## 1. Inventory the competitor (grounded)
- Acquire + scope + index it (→ `setup.md`). Competitor codebases are often huge (thousands of files) → structural inventory, not full reads.
- Fan out agents by **feature domain**: commerce/catalog/promo, integrations/channels, marketing/analytics/storefront, platform/apps/API/tenancy. Each writes a grounded feature inventory (feature → one-line + evidence path + "notable/advanced" flag).
- Then agents by **feature deep-dive** for the areas that matter (page builder, analytics pipeline, promotions engine, B2B/reseller/tenancy) — detailed enough to design against.

## 2. Gap analysis (you author this — you hold both sides)
Write a gap note comparing competitor features to your documented feature set:
- A table per feature: competitor has X (evidence) vs your project today (link your KB).
- Tag each gap: 🔴 table-stakes (blocks real users) · 🟠 major competitive · 🟡 nice-to-have.
- A **readiness estimate** (weighted, honest — "estimate not measurement"): break down by domain, note it's usually bimodal (strong platform foundation vs weak market-facing breadth).
- Where YOU are ahead (don't lose those) + the competitor's own gaps (leapfrog openings).
- A prioritized build order by real-world viability.

## 3. Per-integration implementation specs (the reusable gold)
For integration-heavy competitors, produce ONE self-contained spec per integration so you can build WITHOUT the competitor's code later:
- Enumerate the integration dirs → group into ~10 categories → one agent per category → one note per integration (`competitor/integrations/<prefix>-<slug>.md`).
- Prefixes keep them navigable: `pay- ship- feed- erp- channel- import- mkt- infra- tool- supplier-`.
- Each note: summary · direction (in/out/bi) · external protocol (endpoints/auth/format) · data mapping · flows · config/credentials · error handling · YOUR-project fit · evidence paths · **⚠️ modernization flags**.
- **Mandatory on every note:** "⚠️ Source is <year> — verify the CURRENT provider API/SDK/version before implementing." Old competitor code is a shape/reference, not a spec to copy verbatim.
- Capture the **framework** notes first (feed engine, courier-adapter contract, import upsert engine, webhook system) — "build the framework once, each item is a thin adapter."

## 4. Implementation plans (optional, grounded in BOTH codebases)
Turn the gap + specs into per-vertical plans (payments, couriers, feeds, …). Each plan: verified current state of YOUR code · target architecture (framework + thin adapters) · domain model · **security = the opposite of the competitor's mistakes** (encrypted creds, signed callbacks, TLS on) · phasing · where code lives · risks · decisions needed. Model them on one another for consistency.

## Security note (critical)
Competitor code frequently contains committed live secrets, disabled TLS, unsigned callbacks, and other unsafe patterns. **Never copy these in.** Document them explicitly as "do the opposite" anti-patterns in the specs. Never send competitor code or findings to an external service.
