# Git hooks

Version-controlled hooks for this repo. Not active until you point git at them:

```bash
git config core.hooksPath .githooks
```

Run that once per clone (it is a local git setting, not carried by `git clone`).

## `pre-commit`

Runs `skill-lint.py` (Tier-2 deterministic validation) over
`01-global-optimization/skills/` whenever a staged change touches that tree.
Errors (bad frontmatter, name mismatch, duplicate names, …) block the commit;
warnings are advisory. Docs-only commits pass straight through.

- Bypass once: `git commit --no-verify`
- Block on warnings too: add `--strict` to the linter call in `pre-commit`.
