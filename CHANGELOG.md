# Changelog

All notable changes to this library are documented here.

---

## [1.35.1] — 2026-10-09

### Changed

- **`/company` has no budget cap by default.** `capUsd` on `company-hq`'s `open_project` is now optional; omitted or `0` means no cap (`company-hq` mod 0.4.1). The `company` skill no longer opens every project with a $25 cap: the user can still set one at stop 2, and the mod then refuses spawns past it as before. The stop-2 page shows `cap: none | $Z`, and the project note records `cap $<cap> | none`.
- `17-mods/guide.md`, marketplace and plugin descriptions say the cap is optional. New mod test: a company opened without `capUsd` never denies a spawn.

## [1.35.0] — 2026-10-08

### Added

- **Optional live dashboard for `/company`** (`company-hq` mod 0.4.0). Every `/company` run is now its own company with its own state file, and several can be open at once. A read-only web page served on `127.0.0.1` by a Python standard-library server inside the mod (`python3` >= 3.9, default port 7420) shows the org, spend, parts, task lists, open questions and logged decisions. It is off by default: enable it with `/company --dashboard[=local|fleetq|local+fleetq]`, the `dashboard` key in `~/.claude/company-hq/config.json`, or the new question at stop 1. In `local` mode nothing leaves the machine. `fleetq` also sends a redacted snapshot to a FleetQ instance (`fleetq.url` in the config, token in `COMPANY_HQ_FLEETQ_TOKEN`); the format is in `server/INGEST-CONTRACT.md`. New config keys: `dashboard`, `port`, `machine`, `fleetq.url`.
- **Questions and decisions during unattended work.** New `company-hq` tools `ask_user`, `answer_question` and `record_decision`, and `company/references/questions.md`: User-class questions block only the part that needs them and send a notification; Mechanical/Taste choices are decided by the recommendation and logged. Part agents carry the rule in their brief.
- **`sprint-orchestrate` task list** (skill 1.2.0, new `references/tasks.md`). Plan writes a `## Tasks` checklist in the architecture doc, Build ticks it, Review checks each ticked task on a stronger model than the builder's and marks it `{verified}` or `{rejected: <reason>}`, Test writes a `Result:` line in the test plan. The phase gates, artifact table and Always boundary were extended to match.

### Updated

- `company` skill: Dashboard section, dashboard question at stop 1, `open_project` parameters `task`, `kind`, `dashboard`, `resume`, part agents labelled `<part>: …` (fixed the workflows example label) so the dashboard can place them.
- `17-mods/guide.md`, `INSTALL.md`, `llms.txt`: company-hq entry, dependency notes and cross-links.
- Dashboard page: English by default, Bulgarian when the browser asks for it. Logged decisions carry an optional generic `scorer {name, scores, mode}` (an external ranker; it never decides User-class questions).

### Security

- The dashboard server has no state-changing GET (no `/shutdown`; stop it by its pid in `server.json`), answers only `127.0.0.1`/`localhost` Host headers, and serves only plan documents under the project dir or its worktrees.
- `open_project({resume})` accepts only a company id whose state file carries the same id (no path traversal).
- A company's `docsDir` must be a relative path without `..`, in the mod and in the server, so nothing outside the project is read or sent.
- The FleetQ token is sent only over `https://` (plain `http://` only to localhost); documents are redacted before sending.

## [1.34.1] — 2026-10-08

### Fixed

- **Removed a stray compiled file** `self-improve/scripts/__pycache__/deepeval_tier3.cpython-312.pyc`, committed by accident in v1.30.0. It was stale (the script changed three times since), nothing referenced it, and Python regenerates it anyway — but agents following `INSTALL.md` copied it into every `~/.claude/skills/self-improve/`. `.gitignore` now ignores `__pycache__/` and `*.pyc`.

## [1.34.0] — 2026-10-08

### Changed

- **Repository renamed `escapeboy/ai-prompts` → `escapeboy/claude-code-kit`.** The library is now mostly installable parts — skills, mods, hooks, subagents, commands — rather than prompts. GitHub redirects the old web, git and raw URLs; existing clones keep working, and `git remote set-url origin git@github.com:escapeboy/claude-code-kit.git` makes it explicit. All links, the suggested clone path (`~/claude-code-kit`) and the `CLAUDE.md` merge markers (`<!-- claude-code-kit <TAG>: begin -->`) use the new name. The mods marketplace keeps its name `ai-prompts-mods`, so installed mods need no reinstall.

## [1.33.0] — 2026-10-08

### Added

- **`INSTALL.md` — an install runbook for AI agents.** Point a coding agent at it ("read INSTALL.md and install what fits my setup") and it inspects the environment, proposes bundles (starter, code intelligence, delivery, multi-agent, mods, security, unattended, stack-specific, maintenance), installs from the latest release tag after the user's yes, never overwrites existing files without a diff, merges into `CLAUDE.md` / `settings.json` instead of replacing them, and verifies with real commands. It includes the skill dependency table (e.g. `company` needs `sprint-orchestrate`, `agent-team`, `code-research`, `decision-classify`, `confidence-check`, `continuity` and the `company-hq` mod) and an update procedure.
- **`llms.txt`** — index of the library for agents, pointing at `INSTALL.md` and every installable component.

### Updated

- **17-mods:** the guide states that running the mod tests needs Claude Code ≥ 2.1.294 (the 2.1.291 test kit has no `mock.session`, so the `aside` and `lang-guard` tests fail there; the mods themselves need ≥ 2.1.287).
- README gains an *Install with an agent* section; `CLAUDE.md` asks contributors to keep `INSTALL.md` and `llms.txt` in sync when components change.

## [1.32.0] — 2026-10-08

### Added

- **`/company` skill** (`01-global-optimization/skills/company/`). Runs a task the way a small IT company would: intake → **stop 1** (clarifying questions, ≤4 per round) → read-only research → **stop 2** (parts with disjoint files, teams from the roster, hired specialists only where no agent fits, models, cost estimate and cap) → execution → integration → delivery and a project note in memory. It manages and does not orchestrate code itself: each code part runs `/sprint-orchestrate … --from-design docs/design-<part>.md` in its own worktree, and the integration branch goes through one `ship --no-merge`. A task that turns out small gets the simpler path proposed, and that proposal is stop 2, so both stops always happen. References: `org-design.md`, `roster.md`, `briefs.md`, `workflows.md`, `memory.md`.
- **Section 17-mods.** `guide.md` covers what mods can do that settings hooks cannot, the event and engine API, and the patterns that held up (`.catch` guards, result remapping that also cleans the transcript, `userConfig`, `claude plugin update` after a version bump, bottom hooks in tests). `marketplace/` is an installable example marketplace `ai-prompts-mods` with 13 mods and 34 tests: `context-meter`, `cache-guard`, `spend-ledger`, `subagent-models`, `secret-redactor`, `ssh-guard`, `deploy-verify`, `ci-watch`, `cleanup-tracker`, `aside`, `fleet-status`, `lang-guard`, `company-hq`.
- **Security hardening before release** (from a commit security review): `deploy-verify` runs a project's config only after `/deploy-verify trust` approved that exact content and refuses an ssh host starting with `-`; `company-hq` re-registers hired agents only inside the open project's folder; `secret-redactor` restores real values only into local tools, not web or MCP calls.
- **`company-hq` mod** — back office for `/company`: tools `open_project`, `hire` (registers a specialist as agent type `company-hq:<name>`), `set_phase`, `close_project`; a budget cap enforced on every subagent spawn inside the project folder; `/company-status` pane.

### Updated

- **`sprint-orchestrate`** 1.1.0: `--from-design <path>` skips Think and treats an already agreed design as the Think → Plan gate; `--no-merge` stops Ship at a green PR so the caller merges after the user's yes.
- **`agent-team`** links to `company` (depended-on-by) and back.

## [1.31.4] — 2026-10-07

### Fixed

- **`git-sync-branches` no longer rebases.** The *Rebase first* verdict ran `git rebase develop <branch>`, which rewrites a branch that is usually already pushed — fixing that needs a force-push, which the skill forbids. It is now **Hold**: useful but unfinished or with a conflict that cannot be resolved with confidence; not merged, not deleted, reported for its author. Drift alone is not a reason to hold, since a `--no-ff` merge handles it.
- **No more `git add .` while resolving conflicts** — it could commit unrelated files. The skill lists the conflicted files (`git diff --name-only --diff-filter=U`), stages them by name, and on a conflict it cannot resolve runs `git merge --abort` and marks the branch Hold. Both rules are in *Never*.
- Smaller mismatches between the steps and the rules: Step 6 merges only branches marked **Merge**; Step 3 runs the whole workflow (1–12) inside each submodule, as its example already did; the example no longer says "delete all `feat/*` branches".
- Tier-3 judge after the fix: boundary clarity 0.6 → 0.7, signal fidelity 0.5 → 0.7, pass.

## [1.31.3] — 2026-10-07

### Fixed

- **`git-sync-branches` could delete unmerged work.** Step 9 force-deleted *every* `feat/` branch (`git branch -D`) and Step 11 every `origin/feat/` branch — including a *Rebase first* branch left to its author and any branch whose merge failed — while the *Always* rule said to verify each branch was merged first. Steps 9 and 11 now delete only branches merged into `develop` (local `-d`, which refuses unmerged) plus those triaged **Close** in Step 4b, which are deleted unmerged by design. Anything else is kept and listed in the Step 12 report. *Always* / *Never* and the description say the same. Found by the Tier-3 judge; boundary clarity 0.4 → 0.6.

## [1.31.2] — 2026-10-07

### Fixed

- **Tier-3 boundary-clarity no longer penalizes a skill for doing its job.** The judge marked `git-sync-branches` down (0.4, fail) for deleting branches without a confirmation, though deleting merged branches is exactly what the user invokes it for. The rubric now follows the library's convention: an explicitly invoked skill authorizes its own stated purpose; only operations *beyond* that purpose must be gated, and boundaries must not contradict the procedure. Same skill re-judged: 0.5, pass — the judge states the deletions are authorized and keeps only the real deduction (an *Always* rule the steps break).
- `03-custom-skills/guide.md` now states that convention under *Boundaries*; it previously said every destructive step must hand control back, which contradicted it. `self-improve/references/rubric.md` links to it.

## [1.31.1] — 2026-10-07

### Added

- `deepeval_tier3.py` grades a whole skills directory: point it at e.g. `~/.claude/skills/` and it grades every subdirectory with a `SKILL.md`, `TIER3_CONCURRENCY` skills at a time (default 3), one line per skill; `--json` returns `{skills:[…], verdict}`. A judge call that errors is reported for that skill instead of aborting the batch. Previously a directory without its own `SKILL.md` was a setup error. Measured: 32 skills in ~4 minutes with the Opus judge.

### Fixed

- `GPTModel` deprecation warning on DeepEval 4.2: the script imports `OpenAIModel` (same class), falling back to `GPTModel` on 4.1.
- Scanning a directory with an unreadable subdirectory no longer crashes.

## [1.31.0] — 2026-10-07

### Added

- **Claude Code CLI as the Tier-3 judge** — `TIER3_JUDGE=claude-cli` (model via `TIER3_CLAUDE_MODEL`, default `opus`) in `self-improve/scripts/deepeval_tier3.py`. A `DeepEvalBaseLLM` wrapper calls `claude -p --json-schema …` with your Claude Code login, no API key. Each call is stripped to the prompt alone: no tools, MCP, skills, settings, hooks or `CLAUDE.md` (`--setting-sources ""`), from an empty temp dir.

### Changed

- **Stable scores**: each dimension now has fixed `evaluation_steps` and a 1–5 `Rubric` mapped onto G-Eval's 0–10 scale. With only `criteria`, G-Eval regenerated its own steps every run and the same skill moved by up to ±0.3. Threshold 0.6 → **0.5** (= 3/5, the rubric's pass line). One judge call per dimension instead of two, and the five dimensions run concurrently.
- The judge now gets the list of files bundled with the skill, so progressive disclosure is scored against what exists.
- Measured on all 17 skills: two Opus runs differ by mean 0.02 (max 0.1) with identical verdicts 17/17; `qwen2.5:7b-instruct` agrees with Opus on 10/17. Numbers and the same-family-bias caveat are in `references/deepeval-setup.md`.

### Fixed

- **`confidence-check`** had no *when NOT to* cases and its description fired on any implementation — the Opus judge scored scope precision 0.1. It now has a *When to Use (and When NOT to)* table naming the simpler path for trivial edits, known root causes, single API lookups and research-only work; re-judged 0.8.

## [1.30.0] — 2026-10-07

### Added

- **`self-improve/scripts/deepeval_tier3.py`** — runs the Tier-3 rubric as five DeepEval G-Eval metrics (scope precision, progressive disclosure, boundary clarity, convention adherence, signal fidelity), threshold 0.6 = the rubric's 3/5. A scripted, CI-runnable alternative to the subagent judge. The judge is any OpenAI-compatible endpoint set by `TIER3_BASE_URL` / `TIER3_MODEL` / `TIER3_API_KEY` (LM Studio by default; Ollama, OpenAI, OpenRouter). Exit 0 pass, 1 a dimension failed, 2 setup error; `--json` emits a Tier-3 evidence record.
- **`self-improve/references/deepeval-setup.md`** — install, judge options, and the caveat that small local judges miscalibrate (correct reasoning, wrong number), so their scores are smoke-only.

### Updated

- `self-improve` `SKILL.md`, `references/rubric.md` and `references/integration-seams.md` point to the script as the scripted Tier-3 option.

## [1.29.0] — 2026-10-07

### Added

Eight skills that were in daily local use but missing from the library, now in `01-global-optimization/skills/`:

- **`code-research`** — parallel background agents audit a local or cloned codebase in non-overlapping slices; a second, independent pass re-checks every claim at `path:line`; results land in a cross-linked knowledge base with one index entry point. Thin core + per-phase `references/` (setup, decomposition, agent prompts, verification, synthesis, competitor gap).
- **`agent-team`** — Agent Teams presets (`pr-review`, `debug`, `feature`, `custom`) with a cost warning before spawning. Already listed in the README file inventory; the skill itself was missing.
- **`codebase-memory`** — query reference for the codebase-memory-mcp graph (callers, call chains, dead code, fan-in/out, Cypher, gotchas). `continuity` and `self-improve` already pointed at it.
- **`confidence-check`** — readiness score before implementation; proceed at ≥90%, present alternatives at 70–89%, stop below 70%. Includes `confidence.ts`. The "100% precision and recall in production" claim is reworded to what was measured: 8/8 internal test cases.
- **`decision-classify`** — Mechanical / Taste / User Challenge classification; the skill form of `06-advanced-patterns/decision-classification-guide.md`.
- **`sprint-orchestrate`** — Think → Plan → Build → Review → Test → Ship → Reflect with decision gates. The Ship step no longer depends on a private pre-triage script or a local-only agent: it requires an independent verifier subagent (e.g. `10-subagents/examples/output-evaluator.md`) that did not write the code.
- **`sync-features`** — syncs a project's feature inventory into Serena memories and auto-memory.
- **`ui-ux-review`** — audits existing UI code for design consistency and accessibility (+ examples and a sample report).

### Updated

- `agent-team`, `codebase-memory` and `confidence-check` gain the *When to Use (and When NOT to)* table and/or *Boundaries* section the other skills use; all eight gain relative links to their sibling skills and guides.
- Reciprocal links back to the skills from `06-advanced-patterns/{agent-teams,sprint-orchestration,decision-classification}-guide.md`, `08-ui-ux-development/README.md`, `continuity` and `self-improve`.
- Skill counts 9 → 17 across README, `01-global-optimization/{guide,setup-agent,checklist}.md` and `03-custom-skills/guide.md`; new §4.8 table in `01-global-optimization/guide.md`. The README skills list now also includes `video-digest`.
- `03-custom-skills/skill-template.md` *See Also*: the related-skill links use the `[placeholder]` convention, and the guide link is absolute — the relative `../guide.md` pointed nowhere once the template is copied to `~/.claude/skills/<name>/`. A code-fence-aware link check over all 160 Markdown files now finds 0 broken relative links.
- `skill-lint.py`: 17 skills, 0 errors, 0 warnings.

## [1.28.0] — 2026-10-02

### Added

- **`video-digest` skill** (`01-global-optimization/skills/video-digest/`) — a video link or local recording becomes a short digest in the user's language, linked to related notes, with fact-checked takeaways; saved to a knowledge store only after asking where.
  - `scripts/fetch_text.py`: existing subtitles first (manual, then the spoken-language auto track; YouTube's `<lang>-orig`), local transcription otherwise — Parakeet TDT v3 for its 25 European languages, Whisper large-v3-turbo for the rest (both via MLX on Apple Silicon). Measured on an M4 Pro: subtitles ~5 s, Parakeet 85 min of speech in 72 s. Keeps the description (correct spelling of names) and chapters (inserted as `## [mm:ss]` headings). Every yt-dlp call passes `--no-playlist`, so a `&list=` URL does not pull the whole playlist.
  - **Separate fact-check subagent**: memory candidates are checked against a source the subagent actually opened — a verdict from a search snippet alone is at most "unverifiable". On the first real run it marked one of two candidates disputed, and an earlier draft of the prompt had let it judge from snippets only.
  - Related-notes step: searches the store and links only notes that are actually related; says so when the video contradicts an existing decision.
  - Facts enter Svod as `provisional` (human review before agents see them), never as policy; the raw transcript never enters the store; transcript and description are treated as untrusted input.

### Updated

- Skill counts 8 → 9 across README, `01-global-optimization/{guide,setup-agent,checklist}.md` and `03-custom-skills/guide.md`; new §4.7 in `01-global-optimization/guide.md`.
- `13-security-hardening/guide.md` §3 links to the skill as a transcript-as-untrusted-input example (reciprocal to the skill's See also).

## [1.27.0] — 2026-09-27

### Changed

- **Guard hooks rewritten in Python** (`13-security-hardening/hooks/`). `dangerous-actions-blocker.py` and `pre-commit-secrets.py` replace the `.sh` versions — **update the paths in `settings.json`**. The shell versions matched substrings and failed both ways: the blocker caught one spelling of the recursive root delete while letting `rm -r -f /`, `rm -fr /` and `rm --recursive --force /` through, and refused the harmless `rm -rf /tmp/scratch`; the secrets scanner never matched a private key (`grep -E` read the leading `-----` as options) and skipped every file whose *path* contained `md`, `txt`, `sample` or `example`, so a key in `cmd/server.go` passed. The Python versions tokenize with `shlex`, split on `;` `&&` `||` `|`, step over `sudo`/`env` prefixes and judge the real command.
- `dangerous-actions-blocker.py` also refuses over-broad process kills: `pkill`/`pgrep` options written after the pattern (BSD reads them as extra patterns), `-f` patterns shorter than 5 characters or matching the hook's own shell, patterns that hit a GUI `.app` or more than 3 processes, `killall -m`, `killall` without a name, `kill -1`. Incident: `pkill -f "cat" -U <uid> -x` terminated ~30 macOS apps.
- `dangerous-actions-blocker.py` and `block-interactive-sudo.py` skip heredoc bodies fed to a non-shell (`python3 - <<'EOF'`, `cat <<EOF > file`) — a changelog that *described* `rm -r -f /` or `sudo b` was refused as if it ran them. Bodies fed to `bash`/`sh`/`ssh`/`sudo` are still checked.
- Denials use the structured `permissionDecision: "deny"` JSON, and every reason names the fix.
- `13-security-hardening/guide.md` §8 no longer inlines the old bash hooks; it points at `hooks/` and states the two rules that carry over (match the shape, test both directions).

### Added

- `13-security-hardening/hooks/block-interactive-sudo.py` — the Bash tool has no TTY, so sudo without `-n`/`-S`/`-A` hangs until timeout; each simple command is judged on its own.
- `01-global-optimization/hooks/shell-habits.py` — refuses `cd X && cmd` and standalone `grep`/`rg`, with the fix in the message. Replaces two prose rules a log audit showed were not followed.
- **Two-sided test matrices**: `hooks/tests/test_guards.py` (76 cases, 41 must-block / 35 must-pass, including the secrets scanner against a throwaway git repo) and `hooks/tests/test_kill_rules.py` (22). A block-only matrix lets a guard drift toward refusing everything unnoticed.
- `13-security-hardening/hooks/WHY.md` — one line per hook: the failure it answers and when it can be removed.
- `01-global-optimization/hooks/README.md` — shell aliases (`du`→dust, `curl`→xh, `cd`→zoxide) leak into the Bash tool; `unalias` them when `$CLAUDECODE` is set.
- Idea source: [marmelab — The State Of AI Harness Engineering 2026](https://marmelab.com/blog/2026/09/24/the-state-of-ai-harness-engineering-2026.html) (test guards both ways, replace prose rules with executable checks, record why each control exists).

## [1.26.1] — 2026-09-24

### Changed

- `agent-ready`: leading *When to Use (and When NOT to)* table; closing *Boundaries* (Always / Ask first / Never) that absorbs the former Phase-3 checkpoint and Guardrails.
- `init-project`: description gains a "Use when …" trigger clause (skill selection reads only the description).
- `03-custom-skills/examples/` — `compliance-audit`, `fix-bug`, `git-sync-branches`, `image-optimize`, `onepassword-integrate` now carry the When-to-Use table and Boundaries the guide teaches. Skills whose purpose is the action itself (branch cleanup, image compression) say so under *Ask first* instead of adding a confirmation gate; `compliance-audit` keeps its per-fix approval.
- `image-optimize` example: new "Keep the originals first" step — pngquant is lossy and the loops overwrite in place, so originals are copied to a dated folder before a batch run.

## [1.26.0] — 2026-09-24

### Changed

- **`/context` skill renamed to `/ctx`** (`skills/context/` → `skills/ctx/`). Claude Code ships a built-in `/context` (context-window usage); the skill of the same name shadowed it. Every `/context load|save|refresh|list|inspect|clear|create` reference across the guides, checklists and sibling skills now reads `/ctx`. The description gains a trigger clause and names the built-in it is not. Re-install: remove `~/.claude/skills/context`, copy `skills/ctx`.

### Fixed

- `skill-lint.py` skips `synced/` — Claude Code (v2.1.273+) downloads the claude.ai account's skills into `~/.claude/skills/synced/`; the linter read it as a skill without `SKILL.md` and failed every run on an installed library.
- "See also" links in `ctx`, `init-project`, `optimize`, `update-docs` and `cache-inspector` that pointed outside the skill folder (`../../../0X-…`) resolved only inside the repo, not from `~/.claude/skills/`. They are now absolute GitHub URLs. Three were broken in the repo too: `optimize` had one `../` too few, `init-project` linked a non-existent `09-laravel-mcp-integration/guide.md` (now `README.md`), `cache-inspector` linked a non-existent `settings/prompt-caching.json` (now the global guide section that sets it up).

## [1.25.0] — 2026-09-23

### Added

- **`self-improve` Tier 4 — behavioral eval.** Tiers 1–3 grade the SKILL.md *text*; nothing measured whether the skill changes what the agent *does*. Tier 4 runs the skill's `evals/` cases through Claude Code's built-in `claude plugin eval`, which by default runs every case with and without the skill (clean baseline: only built-in skills are loaded in both arms).
- **`scripts/behavior-stats.py`** (stdlib) — reads the `plugin eval --json` result and adds normalized gain, unbiased pass^k (`C(c,k)/C(n,k)`) for cases tagged `critical`, and a discrimination check. Fails (exit 1) on any regression, a with-skill pass rate below threshold, or a `critical` case below the pass^k bar; reports mean gain ≈ 0 as dead weight (removal candidate, never auto-removed). Emits a sealable evidence record like `skill-lint.py --json`.
- **`references/behavior-eval.md`** — when to run Tier 4, case layout and grader types, case-writing rules (grade outcomes not steps, name the output file, keep the answer key out of the prompt), grader validation (smoke run + discrimination check, since the runner has no reference-solution step), cost, and runner behavior verified on 2.1.280 (bare skill folders resolve as plugins; result JSON drops `tags`).

### Changed

- `skill-lint.py` skips `evals/` (test fixtures are not agent-loaded content, so they are not "dead weight").
- `behavior-stats.py` also lists `low_fire` cases (skill fired in < 50% of with-runs — the case then measures triggering, not content). `behavior-eval.md` documents the gotchas found in the first 16-skill sweep: regex graders are JavaScript `RegExp` (use `flags: i`, never `(?i)`; single-quote every `pattern`), gated tools in `allowed_tools` need `--allow-tools`, haiku often does not invoke the Skill tool (use it for grader smoke runs, not the verdict), and `runs: 3` is noisy.
- `self-improve` SKILL.md, `integration-seams.md`, the global system prompt and README describe the gate as tiered (1–4) instead of three-tier.
- Idea source: [mgechev/skillgrade](https://github.com/mgechev/skillgrade) — evaluated; not adopted as a tool for a Claude-only library (the built-in runner already covers ablation, skill-fired detection, MCP mocks and cost caps), its metrics and grader-validation practice were borrowed.

## [1.24.2] — 2026-08-06

### Docs

- **Model-lineup refresh for the Claude Opus 5 release.** Added Opus 5 (`claude-opus-5`, $5/$25 per M tokens — current Opus, drop-in upgrade from Opus 4.8; thinking on by default, `thinking:{type:"disabled"}` 400s at `xhigh`/`max`; separate rate-limit bucket from the Opus 4.x pool) to the live lineup surfaces: `04-research-integration/sources.md` (Models Overview line + pricing table) and `CLAUDE.md` compatibility line.
- **Corrected Fast mode facts.** `speed: "fast"` (beta `fast-mode-2026-02-01`) is **Opus 5 / Opus 4.8 only** at **$10/$50 per MTok** — previously documented as "Opus 4.6 only" at "$30/$150", which was stale (Opus 4.7 fast mode was removed; `claude-opus-4-6-fast` retired). Also noted it is first-party Claude API only (not Bedrock / Vertex / Foundry). Fixed in `01-global-optimization/system-prompts/global-optimization.md` and `05-token-optimization/guide.md`.
- Historical version-history and CHANGELOG entries left frozen per the retro-edit convention.

## [1.24.1] — 2026-07-18

### Docs

- **Doc-sync for the 8-skill count + multi-file structure.** Updated stale skill counts and structure notes after the v1.22–v1.24 skill additions/restructures: `README.md` (skills-list now marks the 5 restructured skills as multi-file; the *Bundled Files* list adds the missing `agent-ready`/`continuity`/`self-improve`), `01-global-optimization/guide.md` (6→8 skills, "all multi-file", file total), `01-global-optimization/setup-agent.md` (6→8, "all multi-file", file total), `01-global-optimization/checklist.md` (6→8), `03-custom-skills/guide.md` (5→8, "all multi-file"). Historical version-history entries left as-is. No content behavior change.

---

## [1.24.0] — 2026-07-18

### Changed

- **5 global skills brought to the authoring conventions** — `optimize`, `context`, `cache-inspector`, `update-docs`, `init-project` restructured to the v1.21 conventions (leading *When to Use (and When NOT to)* table, closing *Boundaries* Always/Ask-first/Never, and **progressive-disclosure split** into `references/`) **without changing what they do**. Each was a 250–333-line monolith with no `references/`; each SKILL.md is now a thin decision core (87–180 lines) and the deep detail (per-action process, output formats, templates, troubleshooting) was **moved, not deleted**, into linked `references/*.md`. Total content grew (added the two convention sections), verified by line count + Tier-2 `skill-lint` (0 errors).
- **How this was found & fixed** — dogfooded the `self-improve` loop's own **Tier-3 subagent judge** across the whole installed library: these 5 scored 0.2–0.4 (failing scope-precision / progressive-disclosure / boundary-clarity). After restructure, the same judge re-scored them **0.8–1.0 (all pass)**. The restructure ran as 5 parallel isolated agents; the audit + re-judge as fan-out workflows.
- `self-improve` skill (local) — Boundaries now scope audits to **our** authored skills (`01-global-optimization/skills/`) and forbid grading third-party installed skills.

---

## [1.23.1] — 2026-07-18

### Added

- **`.githooks/pre-commit`** — wires `skill-lint.py` (Tier-2) as a version-controlled pre-commit gate. Runs over `01-global-optimization/skills/` only when a staged change touches that tree (docs-only commits pass through); errors block the commit, warnings are advisory, `git commit --no-verify` bypasses. Enable once per clone with `git config core.hooksPath .githooks`. `.githooks/README.md` documents enabling it and the `--strict` (block-on-warnings) opt-in.
- Root `CLAUDE.md` *When Editing* — a line pointing contributors at the hook.

---

## [1.23.0] — 2026-07-18

### Added

- **`/self-improve` global skill** (`01-global-optimization/skills/self-improve/`) — the 8th global skill. A **converging** feedback loop for the skill/convention library: a review comment that recurs is an *undocumented requirement* → fold it into the system, gated by evaluation. Premise from Salesforce Engineering, *"Closing the Loop: How to Build Self-Improving AI Systems with Automated Feedback Loops"* (2026-07-17, `forcedotcom/sf-skills`).
  - **Loop**: `mine recurring signal (frequency threshold) → apply bounded (≤5 edits / ≤100 lines, regression-aborts) → three-tier gate → promote rule → measure convergence`. Natural damping — a better generator emits fewer repeat comments → less signal → smaller changes → steady state; a convention change restarts it.
  - **`scripts/skill-lint.py`** — Tier-2 deterministic validation (the `validate-skills.ts` analogue), stdlib-only: frontmatter present/valid, kebab-case `name` matching the directory, description length bounds, unreferenced bundled files (dead weight), duplicate names across the library, and trigger-collision (near-duplicate descriptions via token Jaccard). `--json` emits an evidence record (`input_sha256` + per-rule results + verdict) shaped to be sealed by a deterministic-execution platform; non-zero exit is a hard gate. Ready as a pre-commit hook.
  - **`references/rubric.md`** — the frequency-threshold signal-mining protocol (with the efficacy metric = decline in repeat-signal per cycle), the Tier-1 trigger-accuracy protocol (10 should-trigger / 10 should-not, ≥9/10 bar), and the Tier-3 judge rubric (scope precision, progressive disclosure, boundary clarity, convention adherence, signal fidelity).
  - **`references/integration-seams.md`** — optional composition points (deterministic-execution/evidence platform, decision-memory store, governance gate, code-intelligence engine, MCP aggregator); the loop degrades gracefully without any of them.
  - **Philosophy match**: deterministic validation where quality is objectively measurable, LLM judgement only where it needs context — neither replaces the other. Bounded blast radius and **draft-PR-not-auto-merge** (the reviewer is the deliberate stopping point) mirror the repo's Code Discipline + Action Safety ethos.

### Updated

- `01-global-optimization/system-prompts/global-optimization.md` (the global `~/.claude/CLAUDE.md` rule set) — new **Convention Promotion (recurring feedback → rule)** section: a corrective pattern seen ~3+ times across feedback memories / PR threads / session corrections is an undocumented requirement → promote it into the generator surface + a durable policy, rather than accumulating a fourth near-duplicate memory. Below threshold, leave it as a memory; human-disputed signal calibrates the rule *down*.

---

## [1.22.0] — 2026-07-18

### Added

- **`/continuity` global skill** (`01-global-optimization/skills/continuity/`) — the 7th global skill. It preserves the **operational thread** across coding sessions with a repo-local `.continuity/STATE.md` surface and a **resume → work → finalize** lifecycle. The premise (from Santi Santamaria Medel, *"Maybe Coding Agents Don't Need a Bigger Memory. Maybe They Need Continuity."*, Level Up Coding, 2026-06-18): the between-session gap is the lost thread (*what's mid-flight, what already failed, what's next*), not memory volume — big context, vector recall, and chat history all "remember more" yet miss the one fact that matters.
  - **`scripts/continuity.py`** — stdlib-only `init` (scaffold `.continuity/` with a portable `STATE.md` + gitignored `local/` split) and `lint` (validate required sections, evidence tags, and the `_Last finalized:` provenance line; non-zero exit = malformed surface). Doubles as the skill's test harness.
  - **`references/format.md`** — the `STATE.md` section spec, evidence-tag semantics table, a worked example, and the local-vs-portable (committable) split.
  - **Evidence-weighted continuity**: every fact carries a tag — `[observed]`/`[validated]`/`[user]` (trust) vs `[claimed]`/`[contradicted]`/`[unknown]` (low-trust) — so hidden uncertainty (where bad continuations begin) is made visible; `resume` also flags a stale surface.
  - **Philosophy match**: explicitly a *thin lifecycle layer over* the existing memory stack (Serena / Svod / codebase-memory-mcp / auto-memory), **not** a new store. The skill forbids creating `.continuity/` for single-shot/throwaway work — "add another memory store" is treated as the failure mode, mirroring the repo's Code Discipline ethos.

### Updated

- `01-global-optimization/system-prompts/global-optimization.md` (the global `~/.claude/CLAUDE.md` rule set) — new **Session Continuity (resume → work → finalize)** section placed with *Memory-First Context Loading*, wiring the lifecycle into the session-start (`resume`) and session-end (`finalize`) rituals, with the low-trust-tag and stale-surface guardrails.

---

## [1.21.0] — 2026-07-14

### Added

Skill-authoring patterns adapted from [garrettw/php-arch-skills](https://github.com/garrettw/php-arch-skills), whose skills lead with decision tables, close with explicit boundaries, and split deep detail into `references/`. Five patterns folded into the repo's skill-authoring system:

- **"When to Use (and When NOT to)" decision table** — a standard leading section (in `03-custom-skills/skill-template.md` and the guide's SKILL.md anatomy) that names the cases where a *simpler* approach wins. The operational form of the Code Discipline / don't-gold-plate rule.
- **"Boundaries" (Always Do / Ask First / Never Do)** — a consistent closing rubric on every non-trivial skill; the `Ask First` bucket is aligned with the global Action Safety rule (hand control back for destructive / hard-to-reverse / shared-state operations).
- **`references/` progressive disclosure as the default** — the skill template now ships a multi-file structure (thin `SKILL.md` core + `scripts/` + `references/`), and `03-custom-skills/guide.md` documents it as the norm for any non-trivial skill, not an edge case.
- **Explicit, bidirectional cross-linking** — a new *Cross-Linking Skills* section in the guide + a strengthened *When Editing* rule in the root `CLAUDE.md`: link sibling skills with relative paths, state the relationship, and add the reciprocal link back. Treat the library as a network, not a list.
- **Reference-split (matrix) skill** — a new **Pattern 5** in the guide for one concern across many variants (frameworks, platforms, providers): a thin core with a dispatcher table routing to per-variant `references/` files. `11-mobile-development` and `12-desktop-development` are cited as existing worked examples of the shape.

### Updated

- `03-custom-skills/skill-template.md` — added the *When to Use*, *Boundaries*, and *Bundled Files (Progressive Disclosure)* sections, and reworked *See Also* into explicit relative sibling-skill links.
- `03-custom-skills/guide.md` — single-file **and** multi-file directory structures; the two new standard sections in the SKILL.md anatomy; Pattern 5 + Cross-Linking sections; the quick-reference pattern table and skill-file checklist updated.
- Root `CLAUDE.md` — *When Editing* now mandates bidirectional cross-links and the matrix reference-split for multi-variant content.

---

## [1.20.0] — 2026-07-14

### Added

- **`/agent-ready` global skill** (`01-global-optimization/skills/agent-ready/`) — the 6th global skill and the repo's first **multi-file** skill (SKILL.md + `scripts/` + `references/`). It audits a project's *public* site for AI-agent readiness using Cloudflare's [isitagentready.com](https://isitagentready.com) scanner and drives a five-phase workflow: determine the production URL → scan → triage each failing check by ROI → confirm the plan at a single checkpoint → implement only the worthwhile fixes → re-scan to verify the level delta.
  - **`scripts/scan.py`** — stdlib-only scanner that calls the `POST /api/scan` JSON API, prints a compact triage table (per-check `pass`/`fail`/`neutral`/`unableToCheck`, `isCommerce`, and the official `nextLevel` remediation with each fix's `skillUrl`), and saves the full JSON to `--out` so it never floods context. Falls back to direct `.well-known` / robots / sitemap endpoint probes when the API is unreachable.
  - **`references/applicability.md`** — site-type classification (content vs. web-app-with-API vs. agentic-commerce) and a per-check ROI decision table (DO / DECISION / CONDITIONAL / SKIP), plus the AI-crawler allow-vs-block policy (with the major crawler UA list) framed as a business decision, not a defect.
  - **`references/implementations.md`** — per-stack recipes (Laravel / Next.js / Node / static) for robots.txt + Content Signals, sitemap, llms.txt, Link headers, Markdown-for-Agents, and the `.well-known` discovery docs.
  - **Philosophy match**: the skill is *selective by default* — "implement every failing check" is treated as the failure mode (gold-plating), `neutral` means not-applicable, and fabricating an agent/API/commerce surface just to pass a check is forbidden. This mirrors the repo's Code Discipline ethos.

### Cross-referenced

- `14-webmcp/guide.md` — the scanner's `webMcp` discovery check now points back to this section for the in-page tool implementation, and vice versa.
- `07-custom-commands/seo.md` — `/agent-ready` and the SEO+GEO command share the robots.txt / sitemap / AI-crawler / Markdown-for-Agents surface; each now references the other so they aren't run blindly in conflict.

---

## [1.19.0] — 2026-07-02

### Added

- **Default Tooling Stack** section in `01-global-optimization/system-prompts/global-optimization.md` — standardizes the MCP tools to prefer when available, each with a graceful fallback: **Lattice** ([escapeboy/lattice](https://github.com/escapeboy/lattice)) for browser automation + internet search, **Svod** ([FleetQ/svod-engine](https://github.com/FleetQ/svod-engine)) for persistent/durable memory, **Svod Foundry** ([FleetQ/svod-foundry](https://github.com/FleetQ/svod-foundry)) for reusable tools/artifacts, and **Harbormaster MCP** ([FleetQ/harbormaster](https://github.com/FleetQ/harbormaster)) for cross-project agent communication.

### Updated

**`/update-docs` skill hardened** (`01-global-optimization/skills/update-docs/SKILL.md`, → v1.1.0) from the lessons of two real end-to-end runs:

- Research / collect now prefer **Lattice** for browser + search, and note that plain `WebFetch` is intercepted by context-mode → use `ctx_fetch_and_index(url, source)` + `ctx_search`.
- **Primary sources** now lead with `platform.claude.com/docs` (models overview / pricing / migration guide) and the bundled `claude-api` skill, instead of community mirrors.
- Bare `/update-docs` now defaults to `analyze` (read-only drift check) instead of an undefined interactive mode.
- Added an **immutable-records rule** (never retro-edit model IDs / prices / dates in CHANGELOG, README version history, or `.backups/`) and a pointer to the repo **Releasing** four-artifact convention in the `update` action.
- De-staled the `analyze` / `validate` examples (dropped frozen 2024–2025 model IDs and beta headers) in favor of the real drift-hotspot checklist.
- Clarified scope vs `/content-review` (external freshness vs internal consistency) and recalibrated the token-cost note for a full refresh-and-release cycle.

---

## [1.18.0] — 2026-07-02

### Updated

**Sonnet 5 model refresh** — a `/update-docs` research pass against the live Claude Platform docs confirmed **Claude Sonnet 5** (`claude-sonnet-5`) is the current Sonnet: a drop-in upgrade for Sonnet 4.6 with adaptive thinking on by default, manual extended thinking and non-default sampling params returning 400, and a 1M context window by default. The Fable 5 / Opus 4.8 / Haiku 4.5 lineup and all pricing were re-verified against the live docs and are unchanged (the circulating "Fable 5 suspended" claim was checked and is false).

- **Model-ID sweep** — live `claude-sonnet-4-6` example/frontmatter/config references bumped to `claude-sonnet-5` in 01 (settings example, pm-orchestrator, checklist), 02 (activation agent), 03 (skills guide + complex/module-assistant examples), 04 (research agent), 05 (optimization agent), and 10 (subagents guide). Historical CHANGELOG / version-history entries left untouched as records.
- **Compatibility lines** — README footer, `CLAUDE.md`, and the 09 / 11 / 12 section READMEs now list Sonnet 5.
- **Pricing** — Sonnet 5 added to the pricing tables in 04 / 05 / 06 with its introductory $2/$10 rate (through 2026-08-31) alongside the $3/$15 standard rate.
- **Beta headers / API params** — Sonnet 5 added to the `compact-2026-01-12` support list (04, 05) and to the migration note about sampling params returning 400 (04).

**Content hygiene** — translated untranslated Bulgarian fragments in public prose/comments to English: model-ID and MCP-wildcard comments in 03, the full-model-ID note in 10, and `/agent-team` usage examples in 06. Deliberate example content that uses Bulgarian as a concrete illustration was kept: the 07 content-review command's Bulgarian (`bg/`) language-check rules, and the native-script language-switcher sample ("Български") in 08.

---

## [1.17.1] — 2026-06-15

### Added

- **LICENSE** — the repository is now released under the MIT License. Previously the README declared an informal "freely shared" intent but no `LICENSE` file existed, so GitHub reported "No license" (legally all-rights-reserved). MIT covers both the prose guides and the executable hook/skill files, and is recognized by GitHub's license detection.

### Updated

- **README.md** — License section now points to the `LICENSE` file and describes MIT terms (use/copy/modify/share, keep the copyright notice) instead of the prior ambiguous free-text wording.

---

## [1.17.0] — 2026-06-10

### Added

**Production patterns from real usage** — distilled from ~3 months / ~450 Claude Code sessions; everything sanitized (no personal projects, hostnames, or infrastructure details):

- **16-autonomous-agents/** (new section) — `guide.md` (cron journaling agent with idempotent in-place note editing, heartbeat watchdog protocol, watchdog detection heuristics, `/loop`, anti-pattern table), `heartbeat-template.md` (copy-paste protocol file), `session-summary-hook.py` (Stop hook: Haiku session summaries → daily note)
- **13-security-hardening/hooks/** — hooks library as real files: `dangerous-actions-blocker.sh`, `pre-commit-secrets.sh`, README with settings.json wiring + PreToolUse contract
- **01-global-optimization/hooks/** — productivity hooks: `check-package-latest.sh` (registry lookup on package installs), `session-start-memory-load.sh` (cwd-mapped memory injection), README with production design rules
- **06-advanced-patterns/headless-review-fanout-guide.md** — diff-scoped parallel review pipeline: worktree per branch, 4–6 lens-sharded headless sessions, structured JSON findings, dedupe + adversarial verify pass
- **06-advanced-patterns/cross-project-delegation-guide.md** — concept: MCP message bus between project-scoped agents (12-tool surface: delegate/await/ask/fan-out/clarify/recall)
- **03-custom-skills/skill-taxonomy-guide.md** — three-layer architecture for 40+ skill families (methodology orchestrator → dispatcher → leaf skills + gates), uniform leaf conventions, dated-backup versioning, when-to-split signals
- **03-custom-skills/examples/** — 5 new full skill examples: `fix-bug`, `git-sync-branches`, `image-optimize`, `compliance-audit`, `onepassword-integrate`
- **10-subagents/examples/** — 4 new agent definitions: `loop-monitor`, `output-evaluator`, `plan-challenger`, `self-review`

### Updated

- **01-global-optimization/system-prompts/global-optimization.md** — ported 11 sections that previously existed only as changelog descriptions or weren't documented at all: Code Discipline, Faithful Reporting, Code Changes (rename/removal discipline), Bug Fix Completeness, Background Delegation, Communication Protocol, Action Safety, Worktree Isolation, Auto-Memory, Recurring Tasks, Effort Levels
- **02-project-activation/guide.md** — Memory Hygiene & Garbage Collection section: write discipline (durable-facts-only, append-don't-create, immediate deletion of wrong memories), monthly GC pass, feature-inventory sync
- **04-research-integration/guide.md** — Evaluating External Code & Vendor Contributions: license-compatibility gate (incl. AGPL/SSPL concept-only rule), 4-step procedure for unsolicited vendor audit PRs
- **README.md** — 16-autonomous-agents TOC section, hooks library links, bumped to 1.17.0

---

## [1.16.0] — 2026-06-10

### Updated

**Model lineup refresh** — docs were last synced in the Claude 4.6 era; current lineup is Fable 5 / Opus 4.8 / Opus 4.7 / Sonnet 4.6 / Haiku 4.5:

- **README.md** — compatibility line now lists Fable 5 (`claude-fable-5`), Opus 4.8 (`claude-opus-4-8`), Opus 4.7 (`claude-opus-4-7`); version bumped to 1.16.0
- **06-advanced-patterns/observability-guide.md** — corrected pricing table: Opus 4.x is $5/$25 per MTok (was wrongly listed as $15/$75), Haiku 4.5 is $1/$5 (was $0.80/$4); added Fable 5 ($10/$50) and Sonnet 4.6 rows
- **01-global-optimization/system-prompts/global-optimization.md** — added Fable 5 tier to model-selection table; fast-mode note now flags `speed: "fast"` as Opus 4.6-only
- **05-token-optimization/guide.md** — token-levers section refreshed: `budget_tokens` and sampling params **removed (400)** on Fable 5 / Opus 4.8 / 4.7; `effort: xhigh` (Claude Code default for coding); thinking display omitted by default on 4.7+; new levers — Task Budgets (`task-budgets-2026-03-13`), compaction header (`compact-2026-01-12`), mid-conversation system messages (`mid-conversation-system-2026-04-07`)
- **04-research-integration/sources.md** — key-articles list points at platform.claude.com models overview + migration guide; beta-headers table gained `compact-2026-01-12`, `task-budgets-2026-03-13`, `mid-conversation-system-2026-04-07`
- **Model ID sweep** — `claude-opus-4-6` → `claude-opus-4-8` in skill frontmatter (03), settings examples (01), agent-teams guide (06), and research examples (04); `claude-sonnet-4-5` default → `claude-sonnet-4-6` in module-assistant example. Sonnet 4.6 / Haiku 4.5 references unchanged (still current).

---

## [1.15.0] — 2026-03-31

### Added

**Source-informed improvements** — based on analysis of Claude Code's actual system prompt architecture (reverse-engineered TypeScript source)

**~/.claude/CLAUDE.md** — 4 new MANDATORY sections derived from Anthropic's internal prompt patterns:

- **Code Discipline** — anti-overengineering rules: don't gold-plate, don't add comments to untouched code, don't abstract one-time operations, "three similar lines > premature abstraction"
- **Faithful Reporting** — false-claims mitigation: never claim tests pass when output shows failures, never suppress failing checks, never characterize broken work as done
- **Communication Protocol** — inverted pyramid pattern: lead with action not reasoning, brief updates at milestones, match response format to task complexity
- **Action Safety** — reversibility × blast radius framework: freely take local/reversible actions, confirm destructive/shared-state/hard-to-reverse ops

**02-project-activation/guide.md** — new Step 3 "Understand the Memory Type System":

- Closed 4-type taxonomy: user, feedback, project, reference (with structured body formats)
- "What NOT to save" exclusion list (code patterns, git history, debugging solutions — all derivable from current state)
- "Trusting recall" verification pattern: memory claims ≠ current state, verify before recommending
- Feedback captures BOTH corrections AND confirmations to prevent overcautious drift

**05-token-optimization/guide.md** — new Section 0 "Cache-Friendly Prompt Ordering":

- Static/dynamic boundary pattern from Claude Code's actual cache architecture
- Rule: stable instructions at top (cached at 90% discount), volatile context at bottom
- Prefix-matching explanation: one volatile line early invalidates cache for everything after it

**10-subagents/guide.md** — new "Advanced Patterns" section:

- Fork subagent pattern: context protection via background forks that keep tool output out of main context
- Read-only agent template: explicit prohibition list (Claude Code's Explore agent approach)
- Anti-delegation rule: "if you ARE the subagent, execute directly; do not re-delegate"

**03-custom-skills/guide.md** — new Example 5 "Output Style Skills":

- Explanatory style template (insight boxes with educational points)
- Audit style template (evidence-based, no assumptions, FINDING → EVIDENCE → SEVERITY format)
- Teaching style template (pause for learner practice, progressive challenges)

**claudedocs/research_claude-code-source-analysis_2026-03-31.md** — full research report

- 10 improvement areas identified from Claude Code source (53KB prompts.ts, 20KB memdir.ts, 22KB memoryTypes.ts)
- Priority-ranked recommendations with code examples
- Key insight: Anthropic's prompts are anti-maximalist — power comes from constraints, not capabilities

**07-custom-commands/retro.md** — `/retro` sprint retrospective skill (inspired by gstack)

- Git-based data collection (12+ parallel commands): commits, authors, LOC, PRs, test files, hotspots
- Per-author breakdown with top areas, LOC, coding sessions, focus classification
- Health indicators rated 0-10: velocity, test health, focus, hotspot risk, PR throughput
- Shipping streaks tracking (consecutive days with commits)
- Compare mode (`--compare`) for period-over-period velocity comparison
- Anti-sycophancy rules in insights — state problems directly with numbers

**06-advanced-patterns/sprint-orchestration-guide.md** — skill pipeline lifecycle

- Think → Plan → Build → Review → Test → Ship → Reflect lifecycle
- Artifact flow between phases (design doc → architecture plan → test plan → review → retro)
- Decision gates at each phase transition
- Full pipeline, quick pipeline, and automated pipeline variants
- Maps all existing skills to lifecycle phases

**06-advanced-patterns/decision-classification-guide.md** — decision framework

- Three decision types: Mechanical (auto-decide), Taste (auto-decide + surface), User Challenge (always ask)
- Classification flowchart for quick reference
- Anti-sycophancy rules with banned phrases table and positive rules
- Dual effort scales: show `(human: ~X / Claude Code: ~Y)` on every option

### Updated

- **03-custom-skills/skill-template.md** — added "Voice & Decision Authority" section with anti-sycophancy rules, decision classification, and dual effort scales
- **08-ui-ux-development/ui-ux-pro-skill.md** — added "AI Slop Detection" section: 0-10 scoring rubric, 10 common slop patterns with fixes
- **CLAUDE.md** — version bumped to v1.15.0
- **README.md** — updated to reflect all new content

### Research

- **research/gstack-analysis.md** — comprehensive analysis of garrytan/gstack (58K+ stars), 25+ skills, full SDLC pipeline
- **claudedocs/research_claude-code-source-analysis_2026-03-31.md** — Claude Code source prompt analysis (10 improvement areas)

---

## [1.13.0] — 2026-03-28

### Added

**15-context-mode/** (new section) — context-mode MCP plugin guide

- Installation via Claude Code plugin (`/plugin marketplace add mksglu/context-mode`) and MCP-only mode
- Tool reference: `ctx_batch_execute`, `ctx_search`, `ctx_execute`, `ctx_execute_file`, `ctx_fetch_and_index`, `ctx_index`
- Mandatory tool selection hierarchy (Tier 1 → Tier 2 → Tier 3) and forbidden patterns
- Session continuity: SQLite FTS5 event capture, `--continue` restoration across compaction
- Integration matrix with Serena, memory system, prompt caching, and Agent Teams
- Savings benchmarks: 94-99.9% context reduction vs raw tool output

### Updated

- `README.md` — added context-mode to Related Tools, bumped to v1.13.0

---

## [1.12.0] — 2026-03-27

### Added

**13-security-hardening/guide.md** — new section "Production Hook Library" (section 8)

- Full file structure: `~/.claude/hooks/` with 3 bash scripts
- `settings.json` registration with matcher-based format (new in Claude Code)
- `dangerous-actions-blocker.sh` — PreToolUse (all tools): blocks `rm -rf /`, `DROP TABLE`, force push to main, protected files
- `pre-commit-secrets.sh` — PreToolUse (Bash): scans staged files for API keys before `git commit`
- `smart-suggest.sh` — UserPromptSubmit: suggests the right tool based on prompt intent (1 suggestion max, silent on no match)
- Explanation of `exit 2` vs `exit 0` semantics and `async: true` for Stop hooks
- PostToolUse hook examples: PHP syntax check, migration safety warning, .env guard

**06-advanced-patterns/agent-teams-guide.md** — new section 7 "/agent-team Skill (Recommended)"

- `/agent-team` skill as the recommended way to launch agent teams (instead of ad-hoc prompts)
- 4 preset modes: `pr-review`, `debug`, `feature`, `custom`
- Feature flag via `settings.json env` block (not just an environment variable)
- Navigation table: `Shift+Down`, `Ctrl+T`, `Escape`
- Skill behavior: confirm → warn cost → brief teammates → wait → synthesize → cleanup

**10-subagents/guide.md** — new section "Production Agents (Real Examples)"

- `plan-challenger` (Opus) — adversarial plan review across 5 dimensions with refutation check. Laravel-specific checks included
- `output-evaluator` (Haiku) — LLM-as-Judge: APPROVE/NEEDS_REVIEW/REJECT verdict before commit
- `loop-monitor` (Haiku) — watchdog for autonomous sessions: stall/runaway/loop detection with bash integration example

### Updated

- `CHANGELOG.md` — bumped to v1.12.0

---

## [1.11.0] — 2026-03-26

### Updated

**10-subagents/guide.md** — new frontmatter fields from v2.0.43–v2.1.83

- `disallowedTools` — explicitly block tools incl. `Task(AgentName)` syntax
- `permissionMode` — `default` / `acceptEdits` / `plan` / `bypassPermissions`
- `background: true` — always run as background task (v2.1.49)
- `isolation: "worktree"` — isolated git worktree per agent run (v2.1.49)
- `effort` — `low` / `medium` / `high` model effort level (v2.1.78)
- `maxTurns` — max turns before stopping (v2.1.78)
- `hooks` — PreToolUse/PostToolUse/Stop hooks scoped to agent lifecycle (v2.0.43)
- `memory` — persistent memory scope: `user` / `project` / `local` (v2.1.33)
- `initialPrompt` — auto-submit first turn on agent start (v2.1.83)
- `skills` — skills to auto-load for this agent (v2.0.43)
- Full model IDs accepted in `model:` field (e.g. `claude-sonnet-4-6`) (v2.1.74)
- Full-featured example with all new fields added

**03-custom-skills/guide.md** — new frontmatter fields and variables

- `context: fork` — run in isolated forked sub-agent (v2.1.0)
- `agent` — delegate execution to specific agent type (v2.1.0)
- `user-invocable: false` — hide from slash command menu (v2.1.0)
- `effort` — override model effort level per skill (v2.1.76)
- `allowed-tools` — YAML list syntax + wildcard `mcp__server__*` (v2.1.0)
- `hooks` — hooks scoped to skill run (v2.0.43)
- Arguments: `$0`, `$1` shorthand (v2.1.19) and `$ARGUMENTS[N]` bracket syntax
- Variables: `${CLAUDE_SESSION_ID}` (v2.1.9), `${CLAUDE_SKILL_DIR}` (v2.1.69)

### Updated

- `CHANGELOG.md` — bumped to v1.11.0

---

## [1.10.0] — 2026-03-21

### Added

**07-custom-commands/content-review.md** — `/content-review` skill for auditing user-facing content

- Comprehensive content audit: documentation, UI copy, error messages, translations
- Scope filtering: `docs`, `ui`, `errors`, `api`, or full audit (default)
- Technical accuracy checks against codebase (models, routes, config)
- Consistency audit: terminology, capitalization, duplicate PHP array keys
- Language-specific checks: Bulgarian sentence case, comma rules, Latin/Cyrillic mixing, formal register
- Structured report output: Critical/High/Medium categories with file:line references
- Quality checklist for all content types (labels, errors, placeholders, buttons, docs)
- Based on production audits of Zonex/Signalio translation files (23+ issues found and fixed)

### Updated

- `README.md` — added content-review to 07-custom-commands listing, bumped to v1.10.0
- `CHANGELOG.md` — documented v1.10.0 changes

---

## [1.9.0] — 2026-03-20

### Added

**WebMCP Integration Guide** (`14-webmcp/guide.md`) — structured browser tools for AI agents

- W3C Draft Community Group Report (February 2026), jointly developed by Google and Microsoft
- `navigator.modelContext` API: `registerTool()`, `unregisterTool()`, `requestUserInteraction()`
- WebMCP vs MCP comparison — frontend/ephemeral (browser tab) vs backend/persistent (server-side)
- Three implementation patterns: read-only data exposure, form actions with user confirmation, declarative HTML
- Integration workflows for Chrome MCP (`claude-in-chrome`) and Playwright MCP
- CLAUDE.md template section for WebMCP-enabled projects
- Browser support matrix: Chrome 146 Canary (behind flag), Edge expected, Firefox/Safari no plans
- Current limitations: tab-bound, no discovery, spec instability, same-origin only
- **89% token savings** vs screenshot-based agent approaches

### Updated

- `README.md` — added 14-webmcp section, bumped version to 1.9.0

---

## [1.8.0] — 2026-03-20

### Fixed

**Critical: ~/.claude/ setup audit** — identified and fixed files Claude Code never reads

- `~/.claude/system-prompts/` is NOT loaded by Claude Code — migrated global optimization rules and symbol-first protocol to `~/.claude/CLAUDE.md` (the only file Claude Code reads as global instructions)
- `~/.claude/settings/*.json` (prompt-caching.json, beta-features.json, model-strategy.json, token-optimization.json) are reference documentation only — they do not configure Claude Code behavior
- Removed 13 duplicate SKILL.md copies from `~/.claude/settings/` (canonical copies already in `~/.claude/skills/`)
- Removed 15 misplaced .md files from `~/.claude/settings/` (agent/command copies that don't belong there)
- Removed dead docs from `~/.claude/` root: README.md, QUICK-REFERENCE.md, INSTALLATION-COMPLETE.md (never loaded by Claude Code)
- Updated all model IDs to current: `claude-opus-4-6`, `claude-sonnet-4-6`, `claude-haiku-4-5-20251001`

**01-global-optimization/guide.md** — added compatibility notice table explaining what Claude Code actually reads from `~/.claude/`

### Updated

- `CLAUDE.md` — corrected architecture description (system prompts → CLAUDE.md), updated model compatibility to Sonnet 4.6
- `README.md` — bumped to v1.8.0, documented audit findings

---

## [1.7.1] — 2026-03-20

### Added

**06-advanced-patterns/parallel-agents-guide.md** — Git isolation with Worktrunk

- New section: "Git Isolation with Worktrunk" for running parallel Claude agents in isolated git worktrees
- [Worktrunk](https://worktrunk.dev/) CLI — manages worktrees so each agent operates on a separate branch/directory
- Installation instructions (Homebrew, Cargo, shell integration)
- Core commands reference (`wt switch`, `wt list`, `wt merge`, `wt remove`)
- Claude Code parallel workflow example with 3 concurrent agents
- Hooks integration (`.worktrunk.toml` — `on-create`, `post-merge`)
- Decision table: when to use worktrees vs in-process parallelism

### Updated

- `README.md` — added Worktrunk to Related Tools, updated parallel-agents-guide description, bumped to v1.7.1

---

## [1.7.0] — 2026-03-18

### Fixed

**01-global-optimization/** — resolved issue #1 (skills with no content, side notes breaking structure)

- Created all 5 missing `SKILL.md` files for global skills:
  - `skills/optimize/SKILL.md` — task complexity analysis, planning strategy selection, model routing, session metrics
  - `skills/context/SKILL.md` — full memory lifecycle (load, save, list, refresh, inspect, clear), token savings documentation
  - `skills/cache-inspector/SKILL.md` — cache hit rate monitoring, cost breakdown, optimization recommendations, full report action
  - `skills/update-docs/SKILL.md` — web research + doc comparison + targeted update workflow with `--scope` flag
  - `skills/init-project/SKILL.md` — stack detection for 8+ frameworks, constitution generation, memory creation, per-framework templates
- Created 2 missing system prompt files (previously referenced as placeholders):
  - `system-prompts/global-optimization.md` — all MANDATORY/AUTOMATIC optimization rules, ready to copy to `~/.claude/`
  - `system-prompts/symbol-first-protocol.md` — complete protocol with 5 usage patterns, token savings table, fallback strategy
- Removed circular reference in `setup-agent.md` — no longer references `*[Copy from your machine]*`; now points to actual files in repo with copy commands
- Updated `guide.md` Steps 4–6 to replace placeholder text with real links and descriptions

**README.md** — fixed section ordering (12-desktop-development now appears before 13-security-hardening)

### Added

**03-custom-skills/guide.md** — added `pwa.md` and global skills as examples in the Examples section

**04-research-integration/guide.md** — added cross-reference to `sources.md`

### Fixed

**01-global-optimization/skills/init-project/SKILL.md** — fixed broken iOS link (`ios/guide.md` → `ios/ios-guide.md`)

---

## [1.6.0] — 2026-03-09

### Added

**13-security-hardening/** — new section

- MCP CVE table (2025-2026): 11 vulnerabilities with affected versions, CVSS scores, and patches
- 5-minute MCP audit checklist + community-vetted safe/unsafe list
- Prompt injection defense hooks (PreToolUse scanner + PostToolUse output monitor)
- 6 production safety rules with concrete `settings.json` deny rules and bash hook implementations:
  - Port Stability, Database Safety, Feature Completeness, Infrastructure Lock, Dependency Safety, Pattern Conformance
- `permissions.deny` hardening templates (global `~/.claude/` and per-project `.claude/`)
- Agent Skills supply chain risk data (36.8% of public skills have security flaws per Snyk 2026 scan)
- Incident response playbook (detect, contain, rotate, patch)

**06-advanced-patterns/agent-teams-guide.md**

- Native Agent Teams experimental feature (Claude Code v2.1.32+, Opus 4.6, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)
- Architecture overview: peer-to-peer messaging, git-based task claiming, isolated 1M-token contexts per agent
- Decision matrix: Agent Teams vs Task tool (Parallel Agents) vs Dual-Instance vs Multi-Instance
- Setup guide with verification steps
- 4 copy-paste prompt patterns: pre-release review, security PR review, multi-file doc update, parallel refactor
- Limitations and anti-patterns

**06-advanced-patterns/observability-guide.md**

- `cs` bash alias for fast session search (keyword + project filter, ~15ms)
- Community tools comparison (session-search.sh vs claude-conversation-extractor vs ran CLI)
- Per-session and weekly cost tracking scripts (Python, no external deps)
- Pricing reference table (Opus 4.6, Sonnet 4.5, Haiku 4.5)
- Most-read files analysis (candidates for Serena memory or prompt caching)
- Tool usage distribution analysis
- Cross-folder session migration guide
- Team aggregate usage reporting

### Updated

- `README.md` — bumped to v1.6.0, documented all new guides, added claude-code-ultimate-guide to community resources
- `CLAUDE.md` — updated architecture section with sections 06 and 13 descriptions

---

## [1.5.0] — 2026-02-15

### Added

**03-custom-skills/examples/module-mcp/** — `/module:mcp` skill
- Full MCP server implementation for any Laravel project
- Domain analysis → tool scaffolding → implementation workflow
- Read/Write/Destructive tool patterns with proper annotations
- Dual transport (HTTP/SSE + stdio), auth bootstrap trait, global scope fix
- `analyze`, `add <domain>`, `sync` subcommands

**03-custom-skills/examples/module-assistant/** — `/module:assistant` skill
- AI assistant chat panel (Livewire, PrismPHP, resizable sidebar)
- Three provider strategies: cloud (native tools), Claude Code (`<tool_call>` loop), Codex (MCP native)
- Role-based tool registry (read/write/destructive tiers)

---

## [1.4.0] — 2026-02-14

### Added

**12-desktop-development/** — desktop development section
- macOS native (SwiftUI/AppKit) with XcodeBuildMCP + xclaude-plugin
- Tauri v2 (Rust + web) with tauri-plugin-mcp
- Electron (Node.js + Chromium) with electron-mcp-server
- Platform-specific subagents and CLAUDE.md templates for all three platforms
- Cross-platform `/desktop-build` and `/desktop-test` skills

---

## [1.3.0] — 2026-02-14

### Added

**11-mobile-development/** — mobile development section
- iOS (Swift/SwiftUI) with XcodeBuildMCP (59 tools) and xclaude-plugin (87% token savings)
- Android (Kotlin/Compose) with JetBrains MCP and android-mcp-server (ADB)
- React Native with Expo MCP (EAS Build/Update)
- Flutter with Dart/Flutter MCP, Flutter MCP, DCM MCP (450+ rules)
- Platform-specific subagents and CLAUDE.md templates for all four platforms
- Cross-platform `/mobile-build` and `/mobile-test` skills

---

## [1.2.0] — 2026-02-09

### Added

**09-laravel-mcp-integration/** — Laravel MCP ecosystem
- Laravel Boost MCP setup guide (official Laravel MCP server)
- LaraPlugins.io MCP configuration for package discovery
- CLAUDE.md template for Laravel projects (Livewire, Inertia, Filament variants)
- Laravel-specialized subagent with Boost MCP integration

**10-subagents/** — custom subagent system
- Complete subagent creation guide with YAML frontmatter format
- Tool access patterns (read-only, research, code writer, full access)
- Model selection guide (haiku/sonnet/opus by task type)
- Four example subagents: code-reviewer, laravel-specialist, debugger, test-generator

**06-advanced-patterns/** — selective deep plan analysis
- Tiered agent selection system (Tier 1/2/3) to prevent context overflow
- Context budget calculator formula
- Agent priority matrix by project type
- Compact-between-agents and background agent patterns

### Updated

- Model compatibility to Claude 4.6 (Opus 4.6, Sonnet 4.5, Haiku 4.5)

---

## [1.1.0] — 2026-01-22

### Added

**08-ui-ux-development/** — UI/UX development section
- UI/UX Pro Max skill: 50+ styles, 21 color palettes, 50 font pairings
- Dashboard workflow guide with real API integration patterns
- Browser testing guide with Chrome DevTools automation (Claude in Chrome MCP)
- Security best practices: XSS prevention, CSRF protection, empty state patterns

---

## [1.0.0] — 2026-01-04

### Added

Initial release:
- **01-global-optimization** — `~/.claude/` setup: PM Orchestrator, settings, skills, system prompts
- **02-project-activation** — Serena MCP activation and memory templates
- **03-custom-skills** — Skill authoring guide, template, and examples
- **04-research-integration** — Research agent for keeping docs current
- **05-token-optimization** — Token reduction techniques and measurement
- **06-advanced-patterns** — Parallel agents, checkpoint system, constitution framework
- **07-custom-commands** — debug, i18n, qa, seo, deploy, refactor, perf skills
