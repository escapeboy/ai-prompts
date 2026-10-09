# Memory: start from what worked

## Recall (phase 0)

Search your durable memory store (a notes vault MCP, Serena memories, or plain files under
`~/claudedocs/company/`) for past company projects:
```
search("<task type> <stack> company project")
list("company/")
```
Read the 1–3 closest notes. Reuse their split and team shapes when the task is similar; say so on
the stop-2 page ("modelled on <project>"). Also read `.continuity/STATE.md` in the repo when present.

## Record (phase 6)

After `mcp__company-hq__close_project` (it returns spend and the roster with prompts), write
`company/<YYYY-MM-DD>-<slug>.md` in the same store:

```markdown
---
type: Note
title: company: <title>
tags: [company, <task type>, <stack>]
---
# <title>
Task: … · Type: … · Repo: … · Result: PR <url> | report <path> | ops change list
Cost: $<spent> (cap $<cap> | none) · Agents: <n> · Fix rounds: <n>

## Split and teams
| Part | Files | Lead (model) | Specialists | Status |

## What worked
## What failed and why
## Hired specialists
<name> (model): one line on its prompt; kept? yes/no
```

If a lesson is a rule for the future (e.g. "split migrations into their own part"), also
store it as a rule the user reviews before it takes effect.

Update `.continuity/STATE.md` with the evidence-tagged outcome (continuity skill format).

## Keeping a specialist

Offer only those whose part finished DONE without a fix round. On yes, write
`~/.claude/agents/<name>.md` with frontmatter `name`, `description`, `model` and the prompt from
`close_project`, and add it to the table in `roster.md`.
