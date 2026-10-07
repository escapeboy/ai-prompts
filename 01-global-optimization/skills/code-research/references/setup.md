# Phase 0 — Acquire · Scope · Index

## Acquire
- **Git repo:** clone into a sensible location (ask the user if unsure where). `git clone <url> <dir>`, then verify: `git -C <dir> log --oneline -1`, `git -C <dir> remote -v`, current branch.
- **Local project:** just note the absolute path. Confirm it's a git repo if you'll want history/diff.

## Scope FIRST (decide "too big to read fully?")
Run cheap structure probes before any deep read — this shapes the whole decomposition. Bash `ls/find/grep` only (not `du` if it's aliased to `dust`):
```
find <root> -type f -not -path '*/.git/*' -not -path '*/node_modules/*' -not -path '*/vendor/*' | wc -l   # file count
# file-type histogram:
find <root> -type f -not -path '*/node_modules/*' -not -path '*/vendor/*' | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -25
ls <root>                                  # top-level layout
ls <root>/composer.json <root>/package.json <root>/artisan <root>/go.mod <root>/*.gemspec 2>/dev/null   # framework markers
```
Record: total files, dominant languages, framework(s), monorepo services, and which dirs are vendored deps (exclude from analysis). A codebase with 6k+ app files or a multi-service monorepo is "too big to read fully" → rely on structural indexing + grounded agents, not full reads.

## Index with codebase-memory-mcp
```
mcp__codebase-memory-mcp__index_repository(repo_path="<absolute path>")
```
Returns node/edge counts and the project slug (e.g. `Users-...-platform`). A background watcher then keeps it fresh via git change detection. Agents use `search_graph` / `trace_path` / `get_code_snippet` / `get_architecture` for structural discovery, then Read/Grep to verify. Prefer this over grep for "where is X / what calls Y / signatures".

## Housekeeping
- If a prior tool left artifacts (e.g. `codegraph` writes `.codegraph/*.db` + a `.cursor/rules/*.mdc`), and you're standardizing on codebase-memory-mcp, remove them only after confirming they're untracked and unreferenced (`git status`, grep for references).
- Note excluded dirs so agents don't waste passes on `vendor/`, `node_modules/`, `dist/`, build output.

## Output of Phase 0
A short scoping note (can be the first section of the KB index): stack, size, services, DB(s), excluded dirs, index status, and the chosen decomposition axis (→ `decomposition.md`).
