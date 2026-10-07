---
name: git-sync-branches
description: Merges finished feature branches into develop, syncs master/main with develop, commits any uncommitted changes, and deletes the merged feature branches plus those triaged as Close (local and remote); unmerged work it did not close is kept and reported. Handles git submodules automatically. Use when you want to clean up branches and leave only develop and master/main in sync.
---

# git-sync-branches

Commit everything, merge finished feature branches into develop, sync master/main, delete merged and Close branches. Handles submodules.

## When to Use (and When NOT to)

| Use this skill for | Use a simpler approach for |
|---|---|
| Cleaning up multiple stale feature branches across a repo (and submodules) into develop/master | Merging a single branch you're actively working on — just `git merge <branch>` |
| Bulk local + remote branch deletion after a sprint/release | Deleting one branch you already know is safe — `git branch -d <branch>` |
| Repos with git submodules needing coordinated branch sync | Single-repo, no-submodule projects — plain `git merge` + `git push` |
| Restoring master/develop to a known-clean, in-sync state | Reviewing a PR before merge — use the code-review skill instead |

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
2. Run Steps 1–12 of this workflow inside the submodule (its own `develop` → `main`, deletions and push)
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

#### Step 4b: Triage each branch — merge, hold, or close (don't blanket-merge)

Before merging, classify every feature branch and state the recommendation with a reason. Blanket "merge everything ahead" buries dead experiments and stale spikes into `develop`.

For each branch ahead of develop:

```bash
git log --oneline develop..<branch>          # what work is on it
git log --oneline <branch>..develop | wc -l  # how far behind develop it is (drift)
git log -1 --format='%cr' <branch>           # how stale (last commit age)
```

Recommend one of:
- **Merge** — real, finished, in-scope work. Proceed to Step 6.
- **Hold** — useful but not ready: unfinished, or it conflicts in a way you cannot resolve with confidence. Do not merge and do not delete it; report it so its author can finish it. Drift behind develop alone is not a reason to hold — a `--no-ff` merge handles it. Never rebase a branch here: rewriting a pushed branch would need a force-push.
- **Close** — stale spike, superseded, or abandoned (old last-commit + no unique value vs develop). Recommend deleting WITHOUT merging; in Step 9/11 delete it but do NOT fold its commits into develop.

Print the verdict list (one line per branch: `branch — verdict — reason`) and proceed. Only **Merge** branches flow into Steps 5–7; **Close** branches skip straight to deletion; **Hold** branches are left as they are.

### Step 5: Switch to develop and pull

```bash
git checkout develop
git pull origin develop
```

### Step 6: Merge each feature branch

For each branch marked **Merge** in Step 4b:

```bash
git merge <branch> --no-ff -m "feat: merge <branch> into develop"
```

**Submodule conflict resolution**: If a merge fails with `add_cacheinfo failed to refresh for path '<submodule>'`:
1. Abort: `git merge --abort`
2. First commit the current submodule pointer: `git add <submodule> && git commit -m "chore: update submodule pointer"`
3. Retry the merge

**Other conflicts**: list the conflicted files and resolve each one:

```bash
git diff --name-only --diff-filter=U
```

Stage only those files by name (`git add <file> ...`) and `git commit` — never `git add .`, which would also sweep in unrelated files. If a conflict cannot be resolved with confidence, `git merge --abort` and re-mark the branch **Hold**.

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

### Step 9: Delete local feature branches — merged ones and Close verdicts

```bash
# Merged into develop: safe delete (-d refuses anything unmerged)
git branch --merged develop | grep "feat/" | while read branch; do git branch -d "$branch"; done

# Close verdicts from Step 4b: deleted WITHOUT merging, by design
git branch -D <close-branch> [<close-branch> ...]
```

Any `feat/` branch still left is unmerged and was not marked Close — a **Hold** branch, or a merge that was aborted. Keep it and list it in the Step 12 report.

### Step 10: Push develop and master/main

```bash
git push origin develop master   # or: git push origin develop main
```

### Step 11: Delete remote feature branches

```bash
# Merged into develop (develop was pushed in Step 10)
git branch -r --merged develop | grep "origin/feat/" | sed 's|^ *origin/||' | while read branch; do
  git push origin --delete "$branch" 2>&1 || true
done

# Close verdicts from Step 4b
git push origin --delete <close-branch> [<close-branch> ...]
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

Report any `feat/` branch that is still there (local or remote) with the reason it was kept.

## Boundaries

**Always**
- Merge feature branches into `develop` first, never directly into `master`/`main`
- Sync submodules before updating the parent's pointer
- Delete only branches that are merged into `develop` or marked **Close** in Step 4b. Close branches are deleted unmerged by design; every other unmerged branch is kept and reported

**Ask first**
- Nothing beyond the invocation itself — branch deletion, remote deletion, and pushes are exactly this skill's stated purpose

**Never**
- Delete an unmerged branch that was not marked Close
- Rebase or otherwise rewrite a feature branch
- `git add .` while resolving conflicts — stage the resolved files by name
- Force-push
- Delete `develop`, `main`, or `master`

## Example: parent repo + submodule layout

Parent repo branches: `master` (prod) + `develop` (default work branch)
Submodule (`base/`) branches: `main` (prod) + `develop`

Order of operations:
1. Sync `base/` submodule: merge features → `develop` → `main`
2. Return to parent: commit updated `base` pointer
3. Merge parent feature branches → `develop`
4. Merge `develop` → `master`
5. Delete merged and Close `feat/*` branches in both repos; report any Hold branch
