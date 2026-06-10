---
name: git-sync-branches
description: Merges all feature branches into develop, syncs master/main with develop, commits any uncommitted changes, and deletes all feature branches (local and remote). Handles git submodules automatically. Use when you want to clean up branches and leave only develop and master/main in sync.
---

# git-sync-branches

Commit everything, merge all feature branches into develop, sync master/main, delete feature branches. Handles submodules.

## Workflow

### Step 1: Commit uncommitted changes

```bash
git status
```

If there are untracked files or modifications, commit them:

```bash
git add <specific files or dirs>
git commit -m "chore: commit pending changes before branch sync"
```

### Step 2: Identify the main branch name

- Check for `master` vs `main` — use whichever exists
- Check for `develop` — this is the integration branch

```bash
git branch | grep -E "^\*? *(master|main|develop)$"
```

### Step 3: Process submodules (if any)

For each git submodule, run the full sync workflow **inside** the submodule first:

```bash
git submodule status
```

For each submodule that has feature branches:
1. `cd <submodule-path>`
2. Run Steps 1–6 of this workflow inside the submodule
3. `cd ..` back to parent

### Step 4: Find all feature branches ahead of develop

```bash
git branch | grep "feat/"
```

For each feature branch, check how many commits it's ahead of develop:

```bash
git log --oneline develop..<branch> | wc -l
```

Only merge branches that are actually ahead (non-zero).

#### Step 4b: Triage each branch — keep, rebase, or close (don't blanket-merge)

Before merging, classify every feature branch and state the recommendation with a reason. Blanket "merge everything ahead" buries dead experiments and stale spikes into `develop`.

For each branch ahead of develop:

```bash
git log --oneline develop..<branch>          # what work is on it
git log --oneline <branch>..develop | wc -l  # how far behind develop it is (drift)
git log -1 --format='%cr' <branch>           # how stale (last commit age)
```

Recommend one of:
- **Merge** — real, finished, in-scope work. Proceed to Step 6.
- **Rebase first** — useful work but far behind develop (drift) or conflicting; `git rebase develop <branch>` (or recommend the author do it) before merging.
- **Close** — stale spike, superseded, or abandoned (old last-commit + no unique value vs develop). Recommend deleting WITHOUT merging; in Step 9/11 delete it but do NOT fold its commits into develop.

Print the verdict list (one line per branch: `branch — verdict — reason`) and proceed. Only branches marked **Merge**/**Rebase** flow into Steps 5–7; **Close** branches skip straight to deletion.

### Step 5: Switch to develop and pull

```bash
git checkout develop
git pull origin develop
```

### Step 6: Merge each feature branch

For each branch that has commits ahead of develop:

```bash
git merge <branch> --no-ff -m "feat: merge <branch> into develop"
```

**Submodule conflict resolution**: If a merge fails with `add_cacheinfo failed to refresh for path '<submodule>'`:
1. Abort: `git merge --abort`
2. First commit the current submodule pointer: `git add <submodule> && git commit -m "chore: update submodule pointer"`
3. Retry the merge

**Other conflicts**: Resolve manually, then `git add . && git commit`.

### Step 7: Update submodule pointer (if submodules exist)

After submodule sync, update the parent's pointer to the latest submodule commit:

```bash
git add <submodule-path>
git commit -m "chore: update <submodule> submodule to latest develop/main"
```

### Step 8: Merge develop into master/main

```bash
git checkout master   # or: git checkout main
git merge develop --ff-only 2>/dev/null || git merge develop --no-ff -m "chore: merge develop into master — branch sync"
```

### Step 9: Delete all local feature branches

```bash
git branch | grep "feat/" | while read branch; do git branch -D "$branch"; done
```

### Step 10: Push develop and master/main

```bash
git push origin develop master   # or: git push origin develop main
```

### Step 11: Delete remote feature branches

```bash
git branch -r | grep "origin/feat/" | sed 's|origin/||' | while read branch; do
  git push origin --delete "$branch" 2>&1 || true
done
```

If you get "remote ref does not exist" errors, the branches are already gone — prune stale refs:

```bash
git fetch --prune
```

### Step 12: Final verification

```bash
git branch -a
git log --oneline -3 master   # or main
git log --oneline -3 develop
```

Both `master`/`main` and `develop` should point to the same commit (or master should be ≥ develop).

## Key rules

- **Always merge feature branches into `develop` first**, never directly into `master`/`main`
- **Submodules first** — sync submodule repos before updating parent's pointer
- **Submodule pointer conflict**: commit the current pointer before retrying the conflicted merge
- **Protected branches**: if `main` rejects force-push, use `git pull origin main --rebase` first
- **Only delete branches that are fully merged** — `git branch -D` force-deletes; verify with `git log develop..<branch>` first

## Example: parent repo + submodule layout

Parent repo branches: `master` (prod) + `develop` (default work branch)
Submodule (`base/`) branches: `main` (prod) + `develop`

Order of operations:
1. Sync `base/` submodule: merge features → `develop` → `main`
2. Return to parent: commit updated `base` pointer
3. Merge parent feature branches → `develop`
4. Merge `develop` → `master`
5. Delete all `feat/*` branches in both repos
