---
name: code-research
description: Deep, grounded codebase research/audit using parallel background agents — on a LOCAL project OR a GIT repo (clone first). Produces a durable, cross-linked knowledge base. Use for "analyze/audit this codebase", "what's built / what's missing / security / gaps / ui-ux", "review every line", researching an unfamiliar repo, or competitor/gap analysis. NOT for single-file lookups or quick one-off questions.
version: 1.0.0
---

# Code Research

Systematic, **grounded** research of a codebase by fanning out **parallel background agents** over non-overlapping slices, verifying their findings, and synthesizing a durable **knowledge base**. Works identically on a local project or a cloned git repo. This is the method behind a multi-agent "understand + audit + gap-analyze this codebase" run.

## When to use (and when NOT)

| Use this skill | Use something simpler instead |
|---|---|
| "Analyze / audit this whole codebase" | One symbol/file lookup → `codebase-memory-mcp` `search_graph` / Grep directly |
| "What's built / missing / unfinished / security / UI-UX" | "How does function X work" → 2-3 `get_code_snippet` + `trace_path` calls |
| "Review every line / 100% coverage" | A quick question answerable from one file → just Read it |
| Research an unfamiliar repo (local or git URL) | A change you're about to make in a known area → make it |
| Competitor / feature-gap analysis across two codebases | A diff review of pending changes → `/code-review` |
| Produce implementation plans grounded in an existing codebase | Spawning agents that must talk to each other mid-task → `agent-team` |

If the answer fits in a few tool calls, do NOT spin up agents — this skill is for breadth that overflows one context.

## Core principles (non-negotiable)

- **Grounded, don't assume.** Every claim cites `path:line` and is verified against real code. Feature *presence* may be inferred from concrete files/routes/models, but never invented. Tell agents this verbatim.
- **Parallel + non-overlapping.** Each agent owns a disjoint slice (domain, directory, or integration) so there are no shared-file write conflicts. Agents run in the background; you acknowledge completions and wait.
- **Agents write their own notes.** Each agent writes to its OWN knowledge-base path (distinct filename) and returns a short summary — never a shared file. This is what makes parallel writes safe.
- **Progressive-disclosure KB.** A thin top index → sub-indexes → detail notes. Everything reachable from one entry point. Cross-link with `[[wikilinks]]`.
- **Verify, then correct.** A second independent pass re-checks claims at cited lines and hunts missed logic. When it finds an error, fix the note — do not leave both versions.

## Workflow (4 phases)

Read the referenced file for each phase before executing it.

0. **Acquire · scope · index** → `references/setup.md`
   Clone the git repo (or point at the local dir) → scope size/stack (file counts, framework markers, exclude vendor/node_modules) → decide "too big to read fully?" → index with `codebase-memory-mcp` `index_repository`. If replacing another tool's artifacts (e.g. codegraph in `.cursor/`), see setup notes.
1. **Decompose · fan out** → `references/decomposition.md` + `references/agent-prompts.md`
   Split into non-overlapping slices by the right axis (domain / directory / integration / line-level). Spawn one background agent per slice with a grounded, "cite paths, write to your own note, return a summary" prompt. Enumerate the target first so slices are exhaustive (no gaps).
2. **Verify** → `references/verification.md`
   Spawn independent re-audit agents that verify the first pass at `path:line` (CONFIRMED / OVERSTATED / verified-safe) AND hunt what was missed. Apply corrections to the notes.
3. **Synthesize** → `references/synthesis.md`
   Consolidate agent reports into a cross-linked KB with an index entry point. Correct earlier errors. Update a durable memory pointer to where the KB lives.

## Variants (dispatch table)

| Goal | Slicing axis | Extra reference |
|---|---|---|
| Understand what exists + gaps + security + UI/UX | by domain (feature-inventory / gaps / security / ui-ux / services) | — |
| 100% "every line" coverage | by directory slice (controllers A/B, models, services, …), each agent confirms coverage | `references/decomposition.md` §line-level |
| Competitor / feature-gap between two codebases | by feature domain in competitor → diff vs your documented features | `references/competitor-gap.md` |
| Per-integration implementation specs / plans | by integration or vertical, grounded in both codebases | `references/competitor-gap.md` §per-integration |

## Output store

Default to **Svod** (`mcp__svod__write`/`read`/`edit`) — versioned, linkable, survives sessions — under a `projects/<name>/` prefix with a `00-index.md` entry point. If Svod is unavailable, use the harness project-memory dir or a `docs/research/` folder in the repo. Always leave a thin **memory pointer** (`~/.claude/projects/.../memory/`) naming where the KB lives so the next session finds it without re-discovery. `mcp__svod__edit` uses params `oldString`/`newString` — a wrong param name silently deletes the matched block; re-read after editing.

## Operational notes (background agents)

- Spawn with `run_in_background: true`; you'll be notified on completion. Acknowledge each briefly, relay load-bearing findings, and wait for the rest before synthesizing.
- Concurrency caps at ~10-16 concurrent; extra agents queue — fine to spawn many.
- After a big run, **clean up leftover waiter-loop shells** (`ps` for `seq 1`/`sleep` polling loops the harness spawned) and stop any agent still alive in a heartbeat-wait (`TaskStop`).
- Deeper dedicated agents often correct earlier high-level agents — treat the deeper/verified note as authoritative and fix the summary.

## Boundaries

**Always**
- Ground every finding in real code with `path:line`; mark unverified items as such.
- Give each agent a disjoint slice and its own output note path.
- Leave an index entry point + a memory pointer to the KB.

**Ask first**
- Before a very large fan-out (≫10 agents / "every line") — confirm scope + cost with the user (agent runs are token-heavy; ~3-10×+ a normal session).
- Before cloning to a specific location, or before any write outside the KB store.

**Never**
- Modify the researched code as part of research (read-only unless the user asks for changes separately).
- Copy secrets, credentials, or unsafe patterns found in a researched/competitor repo into your project — document them as "do the opposite" anti-patterns.
- Invent features/behavior to fill a slice — an unknown is a finding ("not verified"), not a guess.
- Send code or findings from a private/competitor repo to any external service.

## Related skills
- [`agent-team`](../agent-team/SKILL.md) — parallel agents that **communicate with each other** (competing hypotheses, PR review). This skill is the **read-only research** counterpart: agents fan out, don't talk, and write durable notes. Use agent-team when teammates must coordinate mid-task; use code-research to map/audit a codebase.
- [`optimize`](../optimize/SKILL.md) / [`codebase-memory`](../codebase-memory/SKILL.md) — symbol-first exploration that this skill builds on for grounding.
