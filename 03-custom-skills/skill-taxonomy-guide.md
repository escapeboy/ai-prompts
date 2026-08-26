# Skill Taxonomy — Designing Families of 40+ Skills

**How to structure a large skill library so the right knowledge loads at the right time — without flooding context**

[guide.md](guide.md) covers authoring a *single* skill. This guide covers what happens when one domain outgrows one file: the dispatcher → leaf-skill architecture, validation gates, and versioning conventions, distilled from a production security-testing library of ~60 skills that is actively maintained and routinely extended.

The case study is security testing, but the architecture is domain-agnostic — the same shape works for a compliance library (one leaf per regulation), a framework library (one leaf per subsystem), or a writing library (one leaf per content type).

## The Problem a Taxonomy Solves

A single "do-everything" skill for a rich domain fails twice:

1. **Context cost** — a 5,000-line mega-skill loads entirely even when the task needs 5% of it
2. **Maintenance cost** — every edit risks the whole file; two workflows can't evolve independently

But 60 *uncoordinated* skills fail differently: the model can't choose between overlapping descriptions, and knowledge duplicates across files until they disagree.

The fix is a **three-layer taxonomy**:

```
Layer 1: METHODOLOGY (1 skill)     — when/why: phases, mindset, routing by situation
Layer 2: DISPATCHER  (1 skill)     — which: fingerprints the target, loads the right leaves
Layer 3: LEAF SKILLS (N skills)    — how: one narrow workflow each, self-contained
         + GATES     (2-4 skills)  — quality control: validation, reporting standards
```

## Layer 1: The Methodology Orchestrator

One skill that owns the *process*: phases, decision points, and "what should I do next?" routing. It contains **no domain payloads** — only the map.

Key sections (from the production methodology skill):

- **Mode/scope confirmation first** — before anything else, confirm what the user authorized (in security work this is literal authorization; in other domains it's scope: which app, which regulation set, which output format)
- **Phase model** — explicit phases with entry/exit criteria, and a *non-linear* navigation table ("found X in phase 3 → jump back to phase 1 with new scope")
- **Anti-pattern list** — what practitioners do wrong, stated as stop-rules
- **Routing table** — "in phase N working on X → invoke leaf skill Y"

The methodology skill is the **only** skill a user needs to remember. Its description triggers on session-start phrases ("starting a new audit", "where am I in the process", "what next").

## Layer 2: The Dispatcher

A small router skill that turns *observations about the target* into *a set of leaf skills to load*:

```markdown
## step 1 — fingerprint
Identify the target's surface: stack, auth mechanism, API style, hosting.

## step 2 — load skill set
| Fingerprint signal | Load leaves |
|---|---|
| OAuth/OIDC endpoints present | hunt-oauth, hunt-ato |
| GraphQL endpoint | hunt-graphql, hunt-idor |
| File upload forms | hunt-file-upload, hunt-rce |
| SAML SSO | hunt-saml, hunt-auth-bypass |

## step 3 — taxonomy print (once per session)
Print the loaded set so the human sees (and can correct) the routing.

## step 4 — return control to the methodology skill
```

Two design rules:

1. **The dispatcher prints its routing decision.** Silent routing is undebuggable; one visible table per session lets the human catch a wrong fingerprint immediately.
2. **The dispatcher loads *sets*, not single skills.** Real situations map to 2–4 leaves; forcing a single choice loses the cross-checks (e.g. IDOR testing belongs alongside any GraphQL work).

## Layer 3: Leaf Skills

One leaf = one narrow, self-contained workflow. The production library averages ~150 lines per leaf. Conventions that keep 40+ of them coherent:

- **Uniform naming**: a family prefix + the specific topic (`hunt-idor`, `hunt-ssrf`, `hunt-oauth`, …). The prefix makes the family visible in any listing, and the model learns the pattern: "this class of problem → look for a `hunt-*` skill"
- **Uniform internal structure**: every leaf has the same section skeleton (when to use → prerequisites → workflow → evidence to collect → common false positives → related leaves). Predictable structure means the model spends zero effort orienting
- **Cross-references, not duplication**: a leaf links to sibling leaves ("if you find X here, switch to `hunt-Y`") instead of inlining their content. Knowledge lives in exactly one file
- **Self-contained execution**: once loaded, a leaf must work without the dispatcher — a user invoking `/hunt-idor` directly gets the full workflow

### Token economics

This is where the taxonomy pays: a session loads the methodology (~3K tokens) + dispatcher (~1K) + 2–4 relevant leaves (~2K each). Total ≈ 8–12K tokens of *exactly relevant* instructions, vs ~80K+ if the whole library were one skill — and vs the description-only cost (~50 tokens/skill) for the 50+ leaves that stay unloaded.

## The Gates: Validation and Reporting Skills

The layer most libraries forget. Findings/outputs pass through dedicated **gate skills** before reaching the user or an external system:

- **Validation gate** — a checklist skill that interrogates each finding ("Can you reproduce it? Is it exploitable or theoretical? Is it in scope? Would the first triager understand it?"). In the production library this is a hard gate: nothing is reported that hasn't passed
- **Reporting gate** — templates and tone rules for the final artifact, per output type, including an "always-rejected" list of finding classes known to be worthless

Gates encode *quality standards* separately from *discovery techniques* — so tightening your standards is a one-file edit, not a 40-file sweep.

## Versioning: Dated Backups Before Bulk Edits

Skill libraries get bulk-edited (a new convention, a renamed prefix, a model migration). The production convention: before any multi-file edit, snapshot each touched skill as a sibling copy:

```
hunt-idor/
  SKILL.md
hunt-idor.backup-20260604-072858/
  SKILL.md
```

Why not just git? The skill directory (`~/.claude/skills/`) often *isn't* a repo, the backup is visible right where you work, and a wrong bulk edit is recoverable per-skill with `mv`. Prune backups older than a couple of months. If your skills live in a synced repo (recommended — see [`01-global-optimization/`](../01-global-optimization/)), use both: git for history, dated copies for the in-flight bulk edit.

## When to Split a Skill (signals)

Split a growing skill into a taxonomy when any of these appear:

- The skill has **mode switches** ("if doing X, skip to section 7") — those are separate leaves
- You scroll past more than ~half the file on typical invocations — context waste
- Two sections evolve at different speeds (techniques vs reporting standards) — separate gates
- The description has grown to a paragraph of OR-clauses — that's a dispatcher's routing table trying to live inside one description

And the inverse: **don't** build a taxonomy for a domain with 3 workflows. The dispatcher layer pays for itself at roughly 8–10 leaves; below that, well-named individual skills with cross-references are simpler.

## Case Studies (external skill libraries)

Two large public libraries validate the dispatcher→leaf shape in the wild (analysed 2026-08-26):

- **[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)** — 24 skills mapped onto an
  explicit lifecycle (DEFINE→PLAN→BUILD→VERIFY→REVIEW→SHIP) with 8 slash commands (`/spec /plan /build
  /test /review /webperf /code-simplify /ship`) as the dispatcher layer, plus **auto-activation** (designing
  an API triggers `api-and-interface-design`, building UI triggers `frontend-ui-engineering`). It also
  documents a real portability gap — a per-skill `npx` install drops the shared `references/` dir — the
  exact failure mode this guide's "keep leaves self-contained or vendor shared refs" advice prevents.
- **[mattpocock/skills](https://github.com/mattpocock/skills)** — the *counter-position*: deliberately
  **small, composable, model-agnostic** leaves with **no owning framework** ("approaches like GSD/BMAD/
  Spec-Kit take away your control"). Useful tension for our own library — a dispatcher should route, not
  seize the workflow. Its `setup-*` skill is the install-time configurator; its `grill-with-docs` leaf
  produces the `CONTEXT.md` glossary (adopted into `09-laravel-mcp-integration/`).

The lesson across both: **the dispatcher is a routing table, not a controller.** Lifecycle taxonomies
(addyosmani) and flat composable sets (mattpocock) both work; what fails is a mega-skill or a dispatcher
that removes the operator's control.

## Related

- [guide.md](guide.md) — authoring individual skills (leaf-level craft)
- [`16-autonomous-agents/`](../16-autonomous-agents/guide.md) — running skill-driven sessions unattended
- [`10-subagents/`](../10-subagents/guide.md) — when a leaf should be a subagent instead of a skill
