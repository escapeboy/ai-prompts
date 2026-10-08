# company-hq → FleetQ ingest contract (v1)

The company-hq mod (Claude Code) sends one company snapshot at a time. FleetQ stores it per team and shows it read-only, live.

## Request

`POST /api/company-hq/ingest`

Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`

```json
{
  "machine": "laptop",
  "snapshot": { "...": "the full state.json object, schema 1 (see below)" },
  "docs": [
    { "key": "0:docs/design-api.md", "path": "docs/design-api.md", "branch": "main", "sha256": "<hex>", "content": "<markdown, optional>" }
  ]
}
```

- `snapshot` is the company state file as written by the mod (fields below). Unknown fields are kept as-is in the stored JSON.
- `docs` is the full current list of the company's plan documents. `content` is sent only when the sender thinks the server lacks that `sha256`; otherwise omitted. A doc missing from the list is deleted on the server.
- `key` = `<root index>:<path>`; root 0 is the project dir, 1+ are git worktrees. `path` matches `^(docs/(design|architecture|test-plan)-[a-z0-9][a-z0-9-]*\.md|<docsDir>/[^/]+\.md)$`.
- Limits: body ≤ 4 MB, snapshot ≤ 512 KB, one doc ≤ 1 MB. Over a limit → 413.

## Response

| Status | Body | When |
|---|---|---|
| 200 | `{"ok":true,"seq":N,"missingDocs":["key"],"rejectedDocs":["key"]}` | stored. `missingDocs`: keys sent without `content` whose `sha256` the server does not have — the client re-sends them with content. `rejectedDocs`: docs whose content matched a secret pattern; not stored |
| 200 | `{"ok":true,"ignored":"stale","seq":N}` | `snapshot.seq` < stored seq for (team, machine, snapshot.id): nothing is changed |
| 200 | same as the first row | `snapshot.seq` == stored seq: the snapshot row is kept, the docs are processed as usual (this is how the client re-sends `missingDocs` without a state change) |
| 401 | `{"ok":false,"error":"unauthorized"}` | missing/unknown/revoked token |
| 413 | `{"ok":false,"error":"too_large"}` | limits |
| 422 | `{"ok":false,"error":"invalid","fields":{...}}` | schema |
| 429 | — | throttle (60/min per token is enough: the client debounces to one send per 2 s per company) |

Idempotent: same body twice → same stored state.

## Snapshot (schema 1) fields the server relies on

`schema` (=1), `id` (`^[a-z0-9][a-z0-9-]{0,80}$`), `slug`, `title`, `task`, `kind`, `machine`, `status` (`open|closed`), `phase`, `note`, `budget {capUsd, spentUsd}`, `teams [{name, members[{name, agent, model, description}]}]`, `agents [{agentId?, type, model?, part|null, description, status (running|done|denied), startedAt, endedAt?}]`, `questions [{id, part, class, text, options[], askedAt, status (open|answered), answer, answeredAt}]` (may be absent), `decisions [{id, part, class, text, options[], scorer?{name, scores[], mode}, chosen, by (agent|scorer), at}]` (may be absent), `result {pr?, report?}`, `seq`, `openedAt`, `updatedAt`, `closedAt|null`, `docsDir`.

The snapshot never contains specialists' system prompts (they stay on the machine in `private.json`).

## Secret patterns (reject a doc if any matches)

```
-----BEGIN [A-Z ]*PRIVATE KEY-----
\bops_[A-Za-z0-9_-]{20,}
\bsk-ant-[A-Za-z0-9_-]{20,}
\bsk-[A-Za-z0-9]{20,}
\bgh[pousr]_[A-Za-z0-9]{30,}
\bgithub_pat_[A-Za-z0-9_]{40,}
\bglpat-[A-Za-z0-9_-]{20,}
\bxox[abprs]-[A-Za-z0-9-]{10,}
\bAKIA[0-9A-Z]{16}\b
\bsntry[su]_[A-Za-z0-9+/=_-]{20,}
\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}
Bearer\s+[A-Za-z0-9._~+/=-]{20,}
```

The client redacts the same patterns to `[REDACTED]` before sending, so a match on the server means the client missed one.

## Parts, phases, tasks (derived by the server from the stored docs)

Same rules as the local dashboard (`server/company-dashboard.py`, reference implementation):

- Parts: every `docs/design-<part>.md` among the docs. Root per part: newest… on the server there is no mtime, so: the root whose `architecture-<part>.md` exists (highest root index wins if several), else a root whose branch contains `<part>` as a `-`-separated word, else root 0.
- Tasks: lines under `## Tasks` (until the next heading) in `architecture-<part>.md` matching `^\s*-\s\[( |x|X)\]\s+(T\d+)\s+(.*?)\s*$`; marks in the rest: `{added}`, `{verified}`, `{rejected: <reason>}`. Status: unticked → `todo` (marks ignored); ticked + verified → `verified`; ticked + rejected → `rejected`; ticked → `done`.
- Test result: first line matching `^Result:\s*(PASS|FAIL)\b` in `test-plan-<part>.md`.
- Phase, first match wins: done (result PASS and company phase in integrate/deliver, or company closed with a PR) → build (any rejected task, or result FAIL) → test (result PASS) → test (all tasks verified) → review (all tasks ticked) → build (any ticked task or a running agent with that part) → plan.

### Fixture (must parse to the expected values)

```markdown
# Architecture: api

## Tasks
- [ ] T1 Payment model and migration
- [x] T2 Refund endpoint
- [x] T3 Webhook handler {verified}
- [x] T4 Idempotency keys {rejected: no test for a duplicate webhook}
- [ ] T5 Retry on 5xx {added}
- not a task line
- [x] T6 Late addition {added} {verified}

## Notes
- [ ] T9 not under Tasks
```

Expected: ids T1..T6; statuses `todo, done, verified, rejected, todo, verified`; T4 reason `no test for a duplicate webhook`, T4 title `Idempotency keys`; T5 and T6 added; T6 title `Late addition`. `## Tasks\n- [ ] T1 x {verified}` → status `todo`.
