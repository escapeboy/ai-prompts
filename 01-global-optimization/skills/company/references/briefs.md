# Briefing an agent

Subagents get CLAUDE.md files but not this conversation, and built-in types (Explore, Plan) get
neither. Every brief is self-contained, in English, and has these blocks:

```
ROLE: <team> / <role> on project <slug>.
GOAL: <one paragraph: what done looks like for this part>.
OWNED FILES: <globs>. Do not edit anything else. If a change outside them is needed, stop and
  report it instead of making it.
INPUTS: docs/design-<part>.md, claudedocs/company/<slug>/research.md, <contract files>.
HOW: run `/sprint-orchestrate plan build review test <part> --from-design docs/design-<part>.md`
  (code parts) | <the skill for this task type>.
CHECKS: <exact commands, e.g. `php artisan test --filter=…`, `npm run build`>. Paste their real
  output in your report. A check you did not run is reported as not run.
DELIVERABLE: <branch name / report path / list of commands run>, plus a short status:
  DONE | BLOCKED (why) | PARTIAL (what is missing).
LIMITS: no push, merge, deploy, server writes or deletes — report them as next steps.
```

Append your tool-routing block (e.g. the text of a shared `~/.claude/agents/TOOLING.md`: which tool
reads code, which edits by symbol, where decisions are stored, what gates consequential acts,
"verify, don't assume"). Reference it by content, not by path — the agent may not read files outside
its worktree.

For read-only researchers, replace HOW/CHECKS with: sources required for every claim; label
anything unverified as an assumption.

For a reviewer or verifier: give the diff range and the design doc, and say "try to disprove it;
default to FAIL when unsure".
