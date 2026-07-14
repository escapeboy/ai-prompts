---
name: agent-ready
description: >-
  Audit the current project's website for AI-agent readiness using Cloudflare's
  isitagentready.com scanner (robots.txt, sitemap, llms.txt, Link headers, Content
  Signals, Markdown-for-Agents, MCP / OAuth / A2A / Agent-Skills discovery, agentic
  commerce), triage which gaps are actually worth fixing for THIS kind of site, then
  implement the worthwhile ones in the project's own stack and re-scan to verify. Use
  when the user wants to check or improve agent readiness, run "is it agent ready",
  add an llms.txt / MCP card / agent discovery endpoints, or "make my site agent-ready".
---

# Agent-Ready audit & implementation

Turn a raw isitagentready.com scan into a *selective* remediation: scan → triage by ROI
for this site type → implement only what pays back → re-scan to prove it. Do **not**
blindly implement every failing check — most agentic-API/commerce checks are irrelevant
to content sites and implementing them is pure gold-plating.

The scanner is Cloudflare's; its checks map to real emerging standards. The authoritative
engine is its JSON API: `POST https://isitagentready.com/api/scan` `{"url":"..."}`.

## Phase 0 — Determine the target URL (the PUBLIC/production site)

The scan must hit the deployed public site, not `localhost`. Find the candidate, in order:
1. Explicit arg the user passed to the skill.
2. Project config: Laravel `.env` `APP_URL`; Next/Node `package.json` `homepage` or
   `NEXT_PUBLIC_SITE_URL`; static site `CNAME`/deploy config; else the `git remote` /
   README canonical domain.
3. If the candidate is `localhost`/an IP/obviously non-public, **ask the user** for the
   production domain. Never scan localhost — the emerging endpoints won't exist there.

Normalize to `https://<domain>`.

## Phase 1 — Scan

Run the scanner (saves full JSON, prints a compact triage table):

```
python3 <skill_dir>/scripts/scan.py https://<domain> --out <scratchpad>/agentready.json
```

It prints: `level` / `levelName`, every check's status (pass / fail / neutral /
unableToCheck), `isCommerce`, and `nextLevel.requirements` (the official next-step fixes,
each with a `prompt` and a `skillUrl` to Cloudflare's own SKILL.md for that fix). If the
API is unreachable, the script falls back to direct endpoint probes (`--probe` forces it).

Treat `neutral` as **not applicable — no action** (the scanner already decided the check
doesn't apply, e.g. commerce checks on a non-commerce site). Only `fail` is a candidate
for fixing. Treat `unableToCheck` as *couldn't reach it* (usually a 403/timeout) — probe
the endpoint directly (`--probe`) before deciding; don't assume it's simply absent.

## Phase 2 — Triage: which fails are worth fixing for THIS site

Load `references/applicability.md` and classify the project into one of:
**content/marketing site**, **web app with an API**, or **agentic-commerce site**
(use `isCommerce` from the scan + what you know of the repo).

Produce a keep/skip table of every `fail`, each tagged:
- **DO** — cheap, low-risk, broadly useful (robots.txt hygiene, sitemap, llms.txt, Link
  headers, Content Signals). Implement for essentially any public site.
- **DECISION** — AI-crawler policy (allow vs. block training crawlers). Not automatic;
  it's a business call. Surface the trade-off and get the user's intent before touching it.
- **CONDITIONAL** — MCP card, OAuth discovery/protected-resource, A2A card, Agent Skills,
  API Catalog, auth.md, WebMCP. Implement **only if the project actually exposes (or wants
  to expose) an agent-callable API/tool surface**. For a pure content site: skip — say so.
- **SKIP** — commerce (x402/MPP/UCP/ACP/AP2) unless it's genuinely an agentic-commerce
  site; DNS-AID / Web Bot Auth unless the user specifically wants them (thin adoption).

State the reasoning per row in one line. Be honest when the right call is to skip — a low
score is fine and expected for a content site; chasing it wastes effort.

## Phase 3 — Confirm the plan (single checkpoint)

Present the DO list + the two questions that need a human: (a) AI-crawler policy
allow/block, (b) does this project have/want an agent API surface (gates the CONDITIONAL
items). Use AskUserQuestion. After this one approval, implement autonomously.

Skip the checkpoint only if the user already answered these (e.g. "just do the cheap wins,
block AI training bots, no API surface").

## Phase 4 — Implement

Load `references/implementations.md`. Detect the stack (presence of `artisan` → Laravel;
`next.config.*` → Next.js; `package.json` framework; plain `public/`/`dist/` → static) to
know WHERE files live and how headers/routes are added. For each approved check:
1. Fetch the official spec: the check's `skillUrl` from the scan (`ctx_fetch_and_index` or
   read it) — it states exact requirements + how the scanner validates. Follow it.
2. Implement in the project's own idiom (robots.txt in the public root, a real sitemap the
   scanner can find at `/sitemap.xml`, `/llms.txt`, `.well-known/*` files or routes, Link
   headers via the web-server/app middleware, markdown negotiation, etc.).
3. Keep it real and minimal — no placeholder/fake endpoints. An MCP card that points at no
   server, or an OAuth doc for auth you don't have, is worse than absent. Only ship
   discovery docs backed by something real.

Respect the project's deploy & caching rules (robots.txt/sitemap are often CDN/edge-cached
and SEO-sensitive). Follow the repo's CLAUDE.md / memories for deploy + cache-busting; get
approval before pushing prod-facing changes if the repo requires it.

## Phase 5 — Verify (and optionally climb the ladder)

Re-run `scripts/scan.py`. Confirm the targeted checks flipped to `pass` and report the
`level`/`levelName` delta. If a check you *know* is now live still reads `fail`, suspect a
stale cache before concluding the fix failed — the scanner re-fetches per call, but the
site's own CDN/edge cache is the usual culprit; bust it and re-scan. The API returns a fresh
`nextLevel` — if the user wants to keep
going and the next requirements are still worthwhile per Phase 2, loop Phases 3–5. Stop at
the level where remaining requirements are CONDITIONAL/SKIP for this site.

Report: what was implemented, what was deliberately skipped and why, the level change, and
any prod deploy/cache-purge step still owed.

## Guardrails
- Selective by default. Implementing every check is the failure mode, not the goal.
- `neutral` ≠ fix it. It means not applicable.
- Never fabricate an agent/API/commerce surface just to pass a check.
- The scan hits production — confirm the URL is the public site first.
- AI-crawler blocking *lowers* the agent-ready score by design; for many content sites it's
  still the right call. Present it as a decision, not a defect.
- The scan submits the target URL to Cloudflare's third-party API. Fine for a public site;
  flag it first before scanning a client's pre-launch/private or not-yet-announced domain.
