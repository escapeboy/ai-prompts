# Cross-Project Agent Delegation (Concept)

**An MCP message bus that lets agents working on different repos delegate tasks and ask each other questions**

> **Status: concept guide.** This documents a pattern proven with a self-built MCP server in daily use; no public implementation is bundled. The value here is the protocol design — the surface is small enough to reimplement in an afternoon with any MCP framework.

## The Problem

Multi-repo systems (an API repo, a frontend repo, an infra repo, shared packages) break the one-session-one-repo assumption. Real tasks span them: "add this field" touches API + frontend + shared types. Workarounds all hurt:

- One session with all repos in scope → context bloat, wrong-repo edits, no per-project memory
- Human as message bus ("ask the API session what the contract is") → you become the bottleneck
- Agent teams in one repo → great for parallel work *inside* a codebase, doesn't give each project its own persistent context, memories, and conventions

## The Pattern

A small MCP server acts as a **message bus between project-scoped agents**. Each Claude Code session stays in its own repo with its own memories — and gains tools to talk to the others:

```
        ┌─────────────────────────────┐
        │   Delegation MCP server      │
        │   (registry + task queue +   │
        │    Q&A inbox, persistent)    │
        └──┬──────────┬───────────┬───┘
           │          │           │
     ┌─────┴───┐ ┌────┴────┐ ┌────┴────┐
     │ API repo │ │ Frontend│ │  Infra  │
     │ session  │ │ session │ │ session │
     └──────────┘ └─────────┘ └─────────┘
```

### Tool surface (the part worth copying)

| Tool | Purpose |
|------|---------|
| `list_projects` / `list_hosts` | Registry: which projects exist, where, and whether an agent is active there |
| `delegate_task(project, brief)` | Queue a self-contained task for another project's agent; returns a task id |
| `await_delegated_task(id)` | Block on / poll a delegated task's completion and result |
| `record_delegation_result(id, result)` | The *worker* side: report the outcome back to the bus |
| `ask_project(project, question)` | Lightweight Q&A — "what's the response shape of endpoint X?" — without delegating work |
| `fan_out_ask(projects, question)` | Same question to several projects at once (e.g. "does anything consume this field?") |
| `request_clarification(task_id, question)` / `answer_clarification` | A worker agent that received an underspecified brief asks the *delegator* instead of guessing |
| `await_inbox` | A long-running session waits for incoming tasks/questions |
| `recall_qa(project, topic)` | Search past Q&A — answers become a shared, queryable knowledge base |

### Design decisions that made it work

1. **Briefs are self-contained, same as subagent prompts.** The receiving agent doesn't see the sender's conversation. A delegation brief includes: the goal, exact file/endpoint names, acceptance criteria, and the expected deliverable shape. (Same rule as background delegation in `01-global-optimization` — the bus just makes it cross-repo.)
2. **The clarification loop is first-class.** The single biggest quality lever: a worker that *can* ask "which of the two auth flows did you mean?" stops guessing. Without that tool, cross-repo delegation reproduces the classic outsourcing failure — confident delivery of the wrong thing.
3. **Q&A persists and is recallable.** Half the bus traffic is questions, and the same questions recur. Persisting answers turns the bus into an inter-project FAQ that agents check before asking again.
4. **The bus stores state, not sessions.** Tasks and answers survive session restarts; either side can disconnect and resume. Don't couple the bus to live sessions — queue semantics, not RPC semantics.
5. **Authorization boundary per project.** A delegated task runs with the *receiving* project's permissions and conventions — the sender can request, not command. Destructive asks still go through that project's normal confirmation rules.

## When to Use vs Alternatives

| Situation | Reach for |
|-----------|-----------|
| Parallel work *within* one repo | Agent Teams ([agent-teams-guide.md](agent-teams-guide.md)) |
| One long wait (CI, deploy) | A background subagent (see `01-global-optimization` background-delegation rules) |
| Recurring cross-repo contracts ("what does the API return?") | This pattern — Q&A tools + recall |
| True multi-repo features touching 3+ codebases | This pattern — delegation + clarification loop |
| One-off two-repo task | Often simplest: one session, two worktrees — the bus pays off with *recurring* coordination |

## Implementation sketch

Any MCP framework works. Minimum viable version: a SQLite-backed server exposing the table above, with `await_*` tools implemented as long-polls. Registry can be a static config (project name → path/host). Total surface is ~12 tools; the protocol above matters more than the stack.

## Related

- [agent-teams-guide.md](agent-teams-guide.md) — intra-repo peer coordination
- [parallel-agents-guide.md](parallel-agents-guide.md) — fan-out within one session
- [`16-autonomous-agents/`](../16-autonomous-agents/guide.md) — keeping the long-running listener sessions budgeted and watched
