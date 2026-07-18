---
name: continuity
description: >-
  Preserve the OPERATIONAL THREAD across coding sessions with a repo-local,
  inspectable .continuity/ surface and a resume -> work -> finalize lifecycle.
  Not another memory store — a thin lifecycle layer over the memory you already
  have. Use at the START of substantial work on a repo ("resume", "where were
  we", "pick up") and at the END ("finalize", "hand off", "wrap up") so the next
  session starts from bounded, evidence-weighted state instead of re-orienting
  from scratch. Complements (never replaces) Serena/Svod/codebase-memory/auto-memory.
---

# Continuity — resume → work → finalize

The bottleneck between coding sessions is not memory *volume*, it is the lost
**operational thread**: what is mid-flight, what already failed, what to do next.
Big context, vector recall, and chat history all "remember more" yet still miss the
one fact that matters (*this command already failed*). This skill keeps that thread
in a small repo-local artifact and runs a lifecycle over it.

**Core loop:** `resume` (bounded start surface) → work → `finalize` (leave evidence).
Without the lifecycle, memory is passive archaeology. With it, memory becomes execution.

## When to Use This Skill (and When NOT to)

| Use this skill for | Use a simpler approach for |
|--------------------|----------------------------|
| Multi-session work on one repo (feature, refactor, migration) | A one-shot question or single-file edit — just answer |
| Picking up work where re-orientation would otherwise eat the first 10 min | A repo you'll touch once and never return to |
| Recording *why* a decision/dead-end happened so it isn't repeated | Facts already better held elsewhere (arch → Serena, cross-project → Harbormaster, durable policy → Svod) |
| Handing a repo to another agent or teammate | Ephemeral session chatter — let auto-memory handle it |

**Start simple. Reach for this skill only when the work spans more than one session
on the same repo.** Do NOT create a `.continuity/` for throwaway or single-shot tasks —
that is the sixth-memory-store trap this skill is explicitly built to avoid.

## The artifact

Repo-local `.continuity/` (scaffold with the script below):
- `.continuity/STATE.md` — the **bounded** resume surface AND the finalize target
  (one living, compacted doc — not an append-only journal). Portable → committable/shareable.
- `.continuity/local/` — gitignored, machine-specific operational scratch. Local-only.

Every fact carries an **evidence tag** (weight, not decoration):
`[observed]` `[validated]` `[user]` — trust · `[claimed]` `[contradicted]` `[unknown]` — low trust.
Full section spec, tag semantics, and a worked example: **`references/format.md`**.

## Actions

### `resume` (session start)
1. If `.continuity/STATE.md` is absent → offer `init` (don't force it; see "When NOT to").
2. Read STATE.md. Emit a **compact** surface (≤ ~12 lines): Now · Next action ·
   top Known-failures · Validation expectations · Entry points.
3. **Surface uncertainty**: flag `[claimed]`/`[unknown]`/`[contradicted]` items as low-trust,
   and warn if `_Last finalized:` is stale (> ~14 days) — verify before trusting.
4. Then start work from the Next action.

### `finalize` (session end)
Synthesize the session INTO STATE.md (compact, don't append endlessly):
- **Now** ← current mid-flight state · **Next action** ← the single next step
- **Decisions / Known failures / Validation expectations / Entry points / Unresolved risks**
  — update in place, each bullet evidence-tagged. Demote anything later work contradicted to
  `[contradicted]`; delete what's resolved and no longer load-bearing.
- Update the `_Last finalized:` line (date + short session tag).
- Then `lint` (below). Keep STATE.md bounded — if it grows past ~1 screen, compact it.

### `init` / `lint` (via the script)
```bash
python3 ~/.claude/skills/continuity/scripts/continuity.py init <repo>   # scaffold .continuity/
python3 ~/.claude/skills/continuity/scripts/continuity.py lint <repo>   # validate structure + tags
```
`lint` checks required sections, valid evidence tags, and the provenance line. Run it after
`finalize`; treat a non-zero exit as "the surface is malformed — fix before ending the session".

## Relationship to existing memory (complement, not replace)
- **Serena** — stable architecture/conventions of a project. Continuity ≠ this; it's the *live thread*.
- **Svod** — durable, versioned, cross-session policies/facts with provenance. Promote a continuity
  fact that outlives the task INTO Svod; leave transient operational state in `.continuity/`.
- **codebase-memory-mcp** — structural repo map (use it to fill Entry points).
- **auto-memory / MEMORY.md** — ephemeral session facts. Continuity is the *bounded, evidence-weighted*
  operational subset, co-located with the code and diffable.

## Boundaries

**Always**
- Keep STATE.md bounded and evidence-tagged; make uncertainty visible.
- Prefer updating the existing surface over spawning a parallel one.
- `lint` after `finalize`.

**Ask first**
- Committing `.continuity/STATE.md` to a shared/team repo (it becomes visible in diffs & to teammates).
- Writing anything sensitive (tokens, internal URLs, credentials) — those never go in the portable STATE.md;
  local-only scratch goes under `.continuity/local/`.

**Never**
- Turn this into a general knowledge dump — it is the operational thread only.
- Create `.continuity/` for single-session/throwaway work.
- Trust a `[claimed]`/`[unknown]` item or a stale surface without re-verifying.
