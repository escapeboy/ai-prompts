# gstack Deep Analysis Report
## By Garry Tan — https://github.com/garrytan/gstack

---

## 1. ARCHITECTURE OVERVIEW

### Core Idea
gstack gives Claude Code a **persistent browser daemon** and a set of **opinionated workflow skills**. The browser is the hard technical problem; everything else is Markdown.

### Browser Architecture (the novel part)
- **Long-lived Chromium daemon** running via Bun.serve() on localhost
- CLI talks to daemon over HTTP (not MCP, not WebSocket)
- First call: ~3s startup. Every subsequent call: ~100-200ms
- **State file** (`.gstack/browse.json`): PID, port, bearer token, binary version
- Random port 10000-60000 (supports 10+ concurrent workspaces)
- **Version auto-restart**: build writes `git rev-parse HEAD` to dist/.version; CLI auto-kills stale servers on version mismatch
- **30-minute idle timeout** with automatic shutdown

### Why Bun (not Node)
1. `bun build --compile` = single ~58MB binary (no node_modules at runtime)
2. Native SQLite for cookie decryption (no better-sqlite3/gyp)
3. Native TypeScript (no compilation step)
4. Built-in HTTP server (no Express/Fastify needed)

### The Ref System (@e1, @e2, @c1)
- Agent addresses page elements via refs, not CSS selectors/XPath
- Uses Playwright's `page.accessibility.snapshot()` + `getByRole()` Locators
- **No DOM mutation** — works through CSP, React hydration, Shadow DOM
- Refs cleared on navigation (stale refs fail loudly)
- **Staleness detection**: `resolveRef()` does async `count()` check (~5ms) before use
- **Cursor-interactive refs (@c)**: elements clickable but not in ARIA tree (div with onclick, etc.)

### Security Model
- Localhost-only binding
- Bearer token auth per session (UUID, written mode 0o600)
- Cookie decryption in-memory only (PBKDF2 + AES-128-CBC), never written to disk
- Read-only copy of Chromium cookie DB
- Key caching per-session only (gone on shutdown)
- Shell injection prevention: hardcoded browser registry, explicit argument arrays

### SKILL.md Template System
- Templates (`SKILL.md.tmpl`) contain human prose + placeholders
- `gen-skill-docs.ts` reads source code metadata and fills placeholders at build time
- Committed to git (not generated at runtime) — CI validates freshness
- Placeholders: `{{COMMAND_REFERENCE}}`, `{{SNAPSHOT_FLAGS}}`, `{{PREAMBLE}}`, `{{BROWSE_SETUP}}`, `{{QA_METHODOLOGY}}`, `{{DESIGN_METHODOLOGY}}`, `{{REVIEW_DASHBOARD}}`, `{{TEST_BOOTSTRAP}}`, etc.

### Test Tiers
| Tier | What | Cost | Speed |
|------|------|------|-------|
| 1 — Static | Parse $B commands, validate against registry | Free | <5s |
| 2 — E2E | Spawn real Claude session via `claude -p` | ~$3.85 | ~20min |
| 3 — LLM-as-judge | Sonnet scores docs on clarity/completeness | ~$0.15 | ~30s |

### Error Philosophy
Errors are written for AI agents, not humans. Every error includes actionable guidance. Playwright errors rewritten through `wrapError()`. No self-healing on crash — server exits, CLI auto-restarts.

### Intentional Omissions
- No WebSocket streaming (HTTP simpler, fast enough)
- No MCP protocol (plain HTTP + text lighter on tokens)
- No multi-user support
- No Windows/Linux cookie decryption
- No iframe auto-discovery in snapshots

---

## 2. ETHOS / PHILOSOPHY

### "The Golden Age"
Core thesis: one person with AI can build what took a team of 20. Compression ratios:

| Task | Human team | AI-assisted | Compression |
|------|-----------|-------------|-------------|
| Boilerplate | 2 days | 15 min | ~100x |
| Tests | 1 day | 15 min | ~50x |
| Features | 1 week | 30 min | ~30x |
| Bug fix | 4 hours | 15 min | ~20x |
| Architecture | 2 days | 4 hours | ~5x |
| Research | 1 day | 3 hours | ~3x |

### Three Core Principles

#### 1. Boil the Lake
"AI makes the marginal cost of completeness near-zero." Always do the complete thing.
- **Lake** = boilable (100% test coverage, all edge cases) — DO IT
- **Ocean** = not boilable (full system rewrite) — flag as out of scope
- Anti-pattern: "Choose B, it covers 90% with less code" — if A is 70 lines more, choose A

#### 2. Search Before Building
Three layers of knowledge:
- **Layer 1 (Tried and true)**: Standard patterns. Risk = assuming obvious answer is always right.
- **Layer 2 (New and popular)**: Blog posts, trends. Scrutinize — Mr. Market is manic.
- **Layer 3 (First principles)**: Original observations. Prize above everything.

**The Eureka Moment**: When first-principles reasoning contradicts conventional wisdom — name it, celebrate it, build on it. These are logged to `~/.gstack/analytics/eureka.jsonl`.

#### 3. User Sovereignty
"AI models recommend. Users decide. This overrides all other rules."
- Two models agreeing = strong signal, NOT mandate
- User always has context models lack: domain knowledge, business relationships, strategic timing, taste
- Never skip the verification step because you're confident
- Cites Karpathy ("Iron Man suit"), Willison ("agents are merchants of complexity"), Anthropic research (experienced users interrupt more, not less)

### Build for Yourself
"The best tools solve your own problem. gstack exists because its creator wanted it."

---

## 3. COMPLETE SKILL CATALOG

### Product & Strategy
| Skill | Persona | What it does |
|-------|---------|-------------|
| `/office-hours` | YC Office Hours Partner | Six forcing questions that reframe the product before code. Two modes: Startup (hard questions) and Builder (enthusiastic collaborator). Outputs design doc. |
| `/plan-ceo-review` | CEO/Founder | "What is the 10-star product hiding inside this request?" Four modes: Expansion, Selective Expansion, Hold Scope, Reduction. |
| `/plan-eng-review` | Eng Manager | Architecture, data flow, diagrams, edge cases, tests. Forces diagrams to surface hidden assumptions. |
| `/plan-design-review` | Senior Designer | Interactive plan-mode design review. Rates each dimension 0-10 across 7 passes. |
| `/autoplan` | Review Pipeline | One command: CEO -> Design -> Eng review automatically with 6 decision principles. |

### Design
| Skill | Persona | What it does |
|-------|---------|-------------|
| `/design-consultation` | Design Partner | Builds complete design system from scratch. Proposes safe choices AND creative risks. Generates interactive HTML preview. Writes DESIGN.md. |
| `/design-review` | Designer Who Codes | 80-item live-site visual audit + fix loop. Atomic commits per fix. AI Slop score. |
| `/design-shotgun` | Design Explorer | Generates 3 AI design variants via GPT Image API, opens comparison board. Taste memory biases toward preferences. |
| `/design-html` | Design Engineer | Converts approved mockup to production HTML using Pretext (15KB lib). Smart API routing per design type. Framework detection. |

### Code Quality
| Skill | Persona | What it does |
|-------|---------|-------------|
| `/review` | Staff Engineer | Structural audit: N+1 queries, race conditions, trust boundaries, missing indexes. Auto-fixes obvious ones. |
| `/investigate` | Debugger | Iron Law: no fixes without investigation. Traces data flow, tests hypotheses. Stops after 3 failed fixes. |
| `/cso` | Chief Security Officer | OWASP Top 10 + STRIDE. 14 phases. Two modes: daily (8/10 confidence gate) and comprehensive (2/10 bar). |

### Testing & QA
| Skill | Persona | What it does |
|-------|---------|-------------|
| `/qa` | QA Lead | Four modes: diff-aware, full, quick, regression. Auto-generates regression tests for fixed bugs. |
| `/qa-only` | QA Reporter | Same methodology, report only (no code changes). |
| `/benchmark` | Performance Engineer | Core Web Vitals baselines. Multiple runs averaged. Trend tracking across PRs. |
| `/canary` | SRE | Post-deploy monitoring loop. Console errors, performance, page failures via browse daemon. |

### Shipping
| Skill | Persona | What it does |
|-------|---------|-------------|
| `/ship` | Release Engineer | Fully automated: sync main, test, audit coverage, push, open PR. Bootstraps test frameworks. Non-interactive. |
| `/land-and-deploy` | Release Engineer | Merge PR, wait for CI+deploy, verify production health. One command. |
| `/document-release` | Technical Writer | Cross-references docs against diff. Auto-updates paths, commands, structure trees. |

### Retrospective & Learning
| Skill | Persona | What it does |
|-------|---------|-------------|
| `/retro` | Eng Manager | Team-aware weekly retro. Per-person breakdowns, shipping streaks, test health, eureka moments, skill usage analytics. |
| `/learn` | Memory Manager | Manage cross-session learnings. Search, prune stale entries, export to CLAUDE.md. |

### Browser & Infrastructure
| Skill | Persona | What it does |
|-------|---------|-------------|
| `/browse` | QA Engineer | Persistent Chromium daemon, ~100ms per command. Ref-based element addressing. |
| `/setup-browser-cookies` | Session Manager | Import cookies from real browser (Chrome, Arc, Brave, Edge) into headless session. |
| `/connect-chrome` | Chrome Controller | Launch real Chrome controlled by gstack with Side Panel extension. |
| `/setup-deploy` | Deploy Configurator | One-time deploy config. Detects platform (Fly, Render, Vercel, etc.). |
| `/gstack-upgrade` | Self-Updater | Upgrade gstack, detect global vs vendored install, sync both, show changes. |

### Multi-AI
| Skill | Persona | What it does |
|-------|---------|-------------|
| `/codex` | Second Opinion | Independent review from OpenAI Codex CLI. Three modes: code review (pass/fail), adversarial challenge, consultation. Cross-model analysis. |

### Safety & Guardrails
| Skill | Persona | What it does |
|-------|---------|-------------|
| `/careful` | Safety | Warns before destructive commands (rm -rf, DROP TABLE, force-push). |
| `/freeze` | Edit Lock | Restrict edits to a single directory. |
| `/guard` | Full Safety | Combines /careful + /freeze. |
| `/unfreeze` | Unlock | Remove /freeze boundary. |

---

## 4. KEY SKILL DEEP DIVES

### /office-hours — The Most Novel Skill

**Two modes:**
- **Startup mode**: Six forcing questions distilled from YC partner evaluation methodology:
  1. Demand reality (who needs this?)
  2. Status quo (what are they doing today?)
  3. Desperate specificity (can you name one person?)
  4. Narrowest wedge (what's the MVP someone pays for?)
  5. Observation & surprise (what did you learn watching users?)
  6. Future-fit (how does this compound?)

- **Builder mode**: For hackathons, side projects, open source. Generative, not interrogative. "What would make someone say 'whoa'?"

**Anti-Sycophancy Rules** (during diagnostic):
- Never say "That's an interesting approach" — take a position instead
- Never say "You might want to consider..." — say "This is wrong because..."
- Challenge the strongest version of the claim, not a strawman
- Push once, then push again — the first answer is usually polished

**Output**: Design doc saved to `~/.gstack/projects/` that feeds into all downstream skills.

### /retro — Team-Aware Retrospective

**Data collection** (12+ parallel git commands):
- Commits, authors, timestamps, file hotspots, PR numbers
- Per-author file hotspots and commit counts
- Test file counts and regression test commits
- gstack skill usage telemetry
- TODOS.md backlog health
- Eureka moments from `eureka.jsonl`

**Metrics computed**:
- Commits, contributors, PRs merged, LOC, test LOC ratio
- Coding sessions detected from timestamp clustering
- Per-author leaderboard with top areas
- Greptile signal (if integrated)
- Backlog health from TODOS.md
- Shipping streaks

**Modes**: 24h, 7d (default), 14d, 30d, compare (vs prior period), global (cross-project)

### /cso — Chief Security Officer

**14 phases, infrastructure-first approach**:
0. Architecture Mental Model + Stack Detection
1. Attack Surface Census (code + infrastructure)
2. Secrets Archaeology (git history, .env files, CI configs)
3. Dependency Supply Chain (beyond npm audit)
4. CI/CD Pipeline Security (unpinned actions, script injection, pull_request_target)
5. Infrastructure Shadow Surface
6. LLM/AI Security
7. OWASP Top 10
8. Skill Supply Chain Scanning
9-14. Additional phases...

**Two modes**:
- Daily: 8/10 confidence gate (low noise)
- Comprehensive: 2/10 confidence gate (surfaces more)

**Scope flags** (mutually exclusive): `--infra`, `--code`, `--skills`, `--supply-chain`, `--owasp`, `--scope auth`
**Combinable**: `--diff` (branch changes only) + `--comprehensive`

**FP rules**: Detailed false positive exclusions per phase (e.g., devDependency CVEs capped at MEDIUM, node-gyp install scripts expected, etc.)

### /autoplan — Automated Review Pipeline

**The 6 Decision Principles** (auto-answer intermediate questions):
1. Choose completeness
2. Boil lakes (auto-approve in blast radius AND < 1 day CC effort)
3. Pragmatic (cleaner option wins)
4. DRY (reject if duplicates existing)
5. Explicit over clever (10-line obvious > 200-line abstraction)
6. Bias toward action (merge > review cycles > stale deliberation)

**Decision Classification**:
- **Mechanical**: One clearly right answer. Auto-decide silently.
- **Taste**: Reasonable people could disagree. Auto-decide but surface at final gate.
- **User Challenge**: Both models agree user's stated direction should change. NEVER auto-decided. Goes to final gate with explicit context about what the user said, what models recommend, why, and what context might be missing.

**Execution**: CEO -> Design -> Eng, strictly sequential. Never parallel.

### /ship — Fully Automated Release

**Non-interactive by design** — user said `/ship`, so DO IT. Only stops for:
- On base branch (abort)
- Merge conflicts
- Test failures
- ASK items from pre-landing review
- Coverage below threshold
- Plan items NOT DONE

**Steps**:
1. Pre-flight (branch check, uncommitted changes, diff analysis)
1.5. Distribution Pipeline Check (new binary without release workflow?)
2. Sync with base branch
3. Test + coverage audit (bootstraps test framework if none exists)
3.5. Pre-landing review (runs /review inline)
4. Version bump (auto-pick MICRO/PATCH)
5. Changelog + TODOS.md updates
6. Push + PR creation

**Review Readiness Dashboard**: Shows status of Eng Review (required), CEO Review, Design Review, Adversarial Review, Outside Voice. Staleness detection compares stored commit vs HEAD.

### /learn — Cross-Session Memory

**Commands**: show recent, search, prune, export, stats, manual add

**Learning types**: pattern, pitfall, preference, architecture, tool

**Storage**: JSONL at `~/.gstack/projects/$SLUG/learnings.jsonl`

**Prune**: Checks file existence (stale learnings referencing deleted files), contradiction detection (same key, different insights)

**Export**: Formats as markdown suitable for CLAUDE.md

**Cross-project learnings**: Optional, local-only, configurable per machine.

---

## 5. SHARED INFRASTRUCTURE (Preamble)

Every skill shares a common preamble that handles:

1. **Update check** — auto-upgrade notification
2. **Session tracking** — counts active gstack sessions; 3+ sessions = "ELI16 mode" (re-ground context in every question)
3. **Contributor mode** — field reports for gstack bugs to `~/.gstack/contributor-logs/`
4. **Telemetry** — three tiers: community (device ID), anonymous (counter only), off
5. **Learnings** — loads project-specific learnings count
6. **Routing rules** — offers to add skill routing to CLAUDE.md (one-time)
7. **Proactive behavior** — opt-in/out for auto-invoking skills based on conversation context
8. **Repo mode** — solo vs collaborative (affects proactive fixing)
9. **Completeness intro** — one-time "Boil the Lake" principle introduction

### AskUserQuestion Format (universal across all skills)
1. **Re-ground**: State project, current branch, current task
2. **Simplify**: Explain in plain English a 16-year-old could follow
3. **Recommend**: `RECOMMENDATION: Choose [X] because [reason]` with `Completeness: X/10`
4. **Options**: Lettered, with dual effort scales: `(human: ~X / CC: ~Y)`

### Voice (universal)
- Direct, concrete, sharp, encouraging, serious about craft
- "YC partner energy for strategy, senior eng energy for code, best-technical-blog energy for debugging"
- No em dashes, no AI vocabulary (delve, crucial, robust...), no banned phrases
- Name specifics: real file names, function names, line numbers, real numbers
- End with what to do

### Completion Status Protocol
- DONE, DONE_WITH_CONCERNS, BLOCKED, NEEDS_CONTEXT
- "Bad work is worse than no work. You will not be penalized for escalating."

---

## 6. NOVEL PATTERNS WORTH BORROWING

### 1. Template-Generated Skills
SKILL.md files are generated from `.tmpl` templates at build time. Placeholders filled from source code metadata. CI validates freshness. This prevents docs from drifting from actual command implementations.

### 2. Persistent Browser Daemon
Long-lived Chromium over localhost HTTP with bearer token auth. Sub-second commands after first call. Version auto-restart. Refs-based element addressing via accessibility tree.

### 3. Review Readiness Dashboard
Tracks which reviews have run, when, and whether they're stale. Logged to JSONL, displayed as ASCII table. Eng Review is only required gate; others informational.

### 4. Decision Classification System (autoplan)
Mechanical vs Taste vs User Challenge. Mechanical = auto-decide. Taste = auto-decide but surface. User Challenge = never auto-decide, present both sides with "what context we might be missing."

### 5. Three-Layer Knowledge Framework
Layer 1 (tried-and-true), Layer 2 (new-and-popular), Layer 3 (first principles). Prize Layer 3. Log eureka moments.

### 6. Dual Effort Scales
Every option shows `(human: ~X / CC: ~Y)` to reframe effort in AI-assisted terms. Changes build-vs-skip decisions.

### 7. Anti-Sycophancy Rules
Explicit banned phrases during diagnostic phases. "Take a position on every answer. State your position AND what evidence would change it."

### 8. ELI16 Mode
When 3+ sessions active, assume user is context-switching. Re-ground every question with project/branch/task.

### 9. Proactive Skill Routing
Skills can be auto-invoked based on conversation context ("does this work?" -> /qa, bug report -> /investigate). Configurable opt-in/out.

### 10. Cross-Session Learnings with Compounding Visibility
Learnings stored as JSONL per project. When a review finding matches a past learning: "Prior learning applied: [key] (confidence N/10, from [date])". Makes the compounding visible.

### 11. AI Slop Detection
Design review explicitly scores "AI Slop" (gradient heroes, 3-column icon grids, uniform border-radius). Rates and remediates.

### 12. Taste Memory (design-shotgun)
Remembers design preferences across sessions. Biases future generations toward your approvals. Emerges from usage, not configuration.

### 13. Contributor Mode Field Reports
Self-dogfooding mechanism. Agent rates its own experience 0-10. If not 10, files bug reports to `~/.gstack/contributor-logs/`.

### 14. Plan-to-QA Flow
Engineering review writes test plan artifact. /qa automatically picks it up. No manual copy-paste between planning and testing.

---

## 7. HOW GSTACK DIFFERS FROM TYPICAL CLAUDE CODE SKILLS

| Aspect | Typical Skills | gstack |
|--------|---------------|--------|
| **Scope** | Single task (commit, review) | Full SDLC lifecycle with interconnected skills |
| **State** | Stateless per session | Persistent state: learnings, reviews, design docs, telemetry |
| **Browser** | None or Playwright MCP | Custom daemon with sub-second latency, persistent sessions |
| **Reviews** | Ad-hoc | Tracked dashboard with staleness detection |
| **Decisions** | Ask user everything | Classified: mechanical (auto), taste (surface), user-challenge (ask) |
| **Voice** | Default Claude | Opinionated persona with anti-sycophancy rules |
| **Design** | None | Full design pipeline: consultation -> shotgun -> HTML -> review |
| **Multi-model** | Single model | Codex integration for adversarial review, second opinions |
| **Onboarding** | None | Progressive: Boil the Lake intro, telemetry, proactive config, routing rules |
| **Self-improvement** | None | Contributor mode, eureka logging, learning compounding |
| **Docs** | Hand-maintained | Template-generated from source, CI-validated |

---

## 8. THE FULL WORKFLOW LIFECYCLE

```
/office-hours (Think/Define)
    |
    v
/plan-ceo-review (Product Vision)
    |
    v
/plan-design-review (Design Gaps)
    |
    v
/plan-eng-review (Architecture)
    |
    v
  [implement]
    |
    v
/review + /codex (Code Audit)
    |
    v
/qa (Test)
    |
    v
/ship (Release)
    |
    v
/land-and-deploy (Deploy)
    |
    v
/canary (Monitor)
    |
    v
/retro (Reflect)
    |
    v
/learn (Compound)
```

Or use `/autoplan` to run CEO -> Design -> Eng review in one automated pipeline.

---

*Report generated 2026-03-31 from gstack repository at commit depth 1.*
