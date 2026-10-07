---
name: codebase-memory
description: Use the codebase knowledge graph for structural code queries. Triggers on: explore the codebase, understand the architecture, what functions exist, show me the structure, who calls this function, what does X call, trace the call chain, find callers of, show dependencies, impact analysis, dead code, unused functions, high fan-out, refactor candidates, code quality audit, graph query syntax, Cypher query examples, edge types, how to use search_graph.
---

# Codebase Memory — Knowledge Graph Tools

Graph tools return precise structural results in ~500 tokens vs ~80K for grep.

## When to Use (and When NOT to)

| Use the graph | Use something simpler instead |
|---|---|
| Who calls X / what X calls / blast radius of a change | An exact string, error message or config key → `search_code` or Grep |
| Architecture overview of an unfamiliar area | Non-code files (JSON, YAML, Markdown) → Read |
| Dead code, fan-in / fan-out, refactor candidates | Editing by symbol → Serena (`replace_symbol_body`, `rename_symbol`); the graph is read-only |
| Cross-service HTTP / async edges | A whole-codebase audit with many agents → [`code-research`](../code-research/SKILL.md), which builds on this |

Requires the [codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) server and an indexed project (`index_repository`).

## Quick Decision Matrix

| Question | Tool call |
|----------|----------|
| Who calls X? | `trace_path(direction="inbound")` |
| What does X call? | `trace_path(direction="outbound")` |
| Full call context | `trace_path(direction="both")` |
| Find by name pattern | `search_graph(name_pattern="...")` |
| Dead code | `search_graph(max_degree=0, exclude_entry_points=true)` |
| Cross-service edges | `query_graph` with Cypher |
| Impact of local changes | `detect_changes()` |
| Risk-classified trace | `trace_path(risk_labels=true)` |
| Text search | `search_code` or Grep |

## Exploration Workflow
1. `list_projects` — check if project is indexed
2. `get_graph_schema` — understand node/edge types
3. `search_graph(label="Function", name_pattern=".*Pattern.*")` — find code
4. `get_code_snippet(qualified_name="project.path.FuncName")` — read source

## Tracing Workflow
1. `search_graph(name_pattern=".*FuncName.*")` — discover exact name
2. `trace_path(function_name="FuncName", direction="both", depth=3)` — trace
3. `detect_changes()` — map git diff to affected symbols

## Quality Analysis
- Dead code: `search_graph(max_degree=0, exclude_entry_points=true)`
- High fan-out: `search_graph(min_degree=10, relationship="CALLS", direction="outbound")`
- High fan-in: `search_graph(min_degree=10, relationship="CALLS", direction="inbound")`

## 14 MCP Tools
`index_repository`, `index_status`, `list_projects`, `delete_project`,
`search_graph`, `search_code`, `trace_path`, `detect_changes`,
`query_graph`, `get_graph_schema`, `get_code_snippet`, `get_architecture`,
`manage_adr`, `ingest_traces`

## Edge Types
CALLS, HTTP_CALLS, ASYNC_CALLS, IMPORTS, DEFINES, DEFINES_METHOD,
HANDLES, IMPLEMENTS, OVERRIDE, USAGE, FILE_CHANGES_WITH,
CONTAINS_FILE, CONTAINS_FOLDER, CONTAINS_PACKAGE

## Cypher Examples (for query_graph)
```
MATCH (a)-[r:HTTP_CALLS]->(b) RETURN a.name, b.name, r.url_path, r.confidence LIMIT 20
MATCH (f:Function) WHERE f.name =~ '.*Handler.*' RETURN f.name, f.file_path
MATCH (a)-[r:CALLS]->(b) WHERE a.name = 'main' RETURN b.name
```

## Gotchas
1. `search_graph(relationship="HTTP_CALLS")` filters nodes by degree — use `query_graph` with Cypher to see actual edges.
2. `query_graph` has a 200-row cap — use `search_graph` with degree filters for counting.
3. `trace_path` needs exact names — use `search_graph(name_pattern=...)` first.
4. `direction="outbound"` misses cross-service callers — use `direction="both"`.
5. Results default to 10 per page — check `has_more` and use `offset`.

## Boundaries

**Always**
- Check `list_projects` / `index_status` first; index the repo if it is missing.
- Trust graph results for structure — do not re-verify every edge with grep.

**Ask first**
- Before `delete_project` or re-indexing a very large monorepo.

**Never**
- Treat a 0-result `trace_path` as "no callers" before confirming the exact name with `search_graph`.

## Related skills
- [`code-research`](../code-research/SKILL.md) — multi-agent audit that grounds its findings through this graph.
- [`optimize`](../optimize/SKILL.md) — symbol-first exploration workflow.
- [`continuity`](../continuity/SKILL.md) and [`self-improve`](../self-improve/SKILL.md) — use the graph for blast-radius checks.
