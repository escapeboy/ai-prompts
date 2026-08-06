# Claude Code Optimization Prompts Library

**Project-agnostic guides and executable agents for setting up Claude Code with 70-90% token reduction.**

This library contains reusable prompts for implementing global Claude Code optimization across any project. Share with other developers or use to recreate your setup.

---

## 📁 Contents

### [01-global-optimization](01-global-optimization/)
**Set up global optimization (ONE-TIME, applies to ALL projects)**

- **[guide.md](01-global-optimization/guide.md)** - Step-by-step installation guide
- **[setup-agent.md](01-global-optimization/setup-agent.md)** - Executable agent for automated setup
- **[checklist.md](01-global-optimization/checklist.md)** - Verification checklist
- **[skills/](01-global-optimization/skills/)** - Complete SKILL.md files for all 8 global skills (installed to `~/.claude/skills/`)
  - [`optimize/`](01-global-optimization/skills/optimize/SKILL.md) - `/optimize` — max token efficiency mode (multi-file: thin core + `references/`)
  - [`context/`](01-global-optimization/skills/context/SKILL.md) - `/context` — memory management (multi-file: thin core + `references/`)
  - [`cache-inspector/`](01-global-optimization/skills/cache-inspector/SKILL.md) - `/cache-inspector` — cache monitoring (multi-file: thin core + `references/`)
  - [`update-docs/`](01-global-optimization/skills/update-docs/SKILL.md) - `/update-docs` — documentation refresh (multi-file: thin core + `references/`)
  - [`init-project/`](01-global-optimization/skills/init-project/SKILL.md) - `/init-project` — new project setup (multi-file: thin core + `references/`)
  - [`agent-ready/`](01-global-optimization/skills/agent-ready/SKILL.md) - `/agent-ready` — AI-agent-readiness audit + selective remediation (multi-file: scanner script + ROI/implementation references)
  - [`continuity/`](01-global-optimization/skills/continuity/SKILL.md) - `/continuity` — repo-local resume→work→finalize lifecycle + evidence-weighted `.continuity/STATE.md` (multi-file: lint/scaffold script + format reference)
  - [`self-improve/`](01-global-optimization/skills/self-improve/SKILL.md) - `/self-improve` — closing-the-loop for the skill library: mine recurring feedback → bounded edit → three-tier eval gate (deterministic `skill-lint.py` + trigger accuracy + LLM judge) → converge (multi-file: linter script + rubric/integration references)
- **[system-prompts/](01-global-optimization/system-prompts/)** - Global system prompt files
  - [`global-optimization.md`](01-global-optimization/system-prompts/global-optimization.md) - Core optimization rules
  - [`symbol-first-protocol.md`](01-global-optimization/system-prompts/symbol-first-protocol.md) - Symbol-first exploration protocol

**Time**: 2-3 hours (one-time)
**Benefit**: 70-90% token reduction on ALL future projects
**ROI**: Pays for itself in 2-3 sessions

### [02-project-activation](02-project-activation/)
**Activate optimization for a specific project (10-15 min per project)**

- **[guide.md](02-project-activation/guide.md)** - Project activation walkthrough
- **[activation-agent.md](02-project-activation/activation-agent.md)** - Executable agent for Serena activation
- **[memory-templates/](02-project-activation/memory-templates/)** - Sample memory files
  - `architecture-template.md` - Project structure template
  - `conventions-template.md` - Coding patterns template

**Time**: 10-15 minutes per project
**Benefit**: Project-specific memories for 60-70% session savings
**Required**: After global setup, before starting work

### [03-custom-skills](03-custom-skills/)
**Create custom slash commands (skills)**

- **[guide.md](03-custom-skills/guide.md)** - How to write skills
- **[skill-template.md](03-custom-skills/skill-template.md)** - Blank template to copy
- **[examples/](03-custom-skills/examples/)** - Working examples
  - `example-simple-skill.md` - Simple single-action skill
  - `example-complex-skill.md` - Multi-action skill with integration
  - `pwa.md` - PWA features skill (service worker, manifest, offline, push notifications)
  - **[module-mcp/](03-custom-skills/examples/module-mcp/)** - `/module:mcp` — Add a Laravel MCP server to any project (dual transport, domain tools, auth)
  - **[module-assistant/](03-custom-skills/examples/module-assistant/)** - `/module:assistant` — Add an AI assistant chat panel (Livewire, PrismPHP tools, local agent support)

**Use when**: You want custom commands like `/deploy` or `/migrate`, or full modules like `/module:mcp` and `/module:assistant`
**Benefit**: Encapsulate common workflows, reduce repetition; module skills bootstrap entire features

### [04-research-integration](04-research-integration/)
**Research and integrate new Claude API features**

- **[guide.md](04-research-integration/guide.md)** - How to research and update docs
- **[research-agent.md](04-research-integration/research-agent.md)** - Web research automation
- **[sources.md](04-research-integration/sources.md)** - Curated source list

**Use when**: New Claude API features released, quarterly reviews
**Benefit**: Keep documentation current, adopt new optimizations

### [05-token-optimization](05-token-optimization/)
**Deep dive into token reduction techniques**

- **[guide.md](05-token-optimization/guide.md)** - Complete optimization guide
- **[optimization-agent.md](05-token-optimization/optimization-agent.md)** - Token usage analyzer
- **[metrics.md](05-token-optimization/metrics.md)** - Measurement and tracking

**Use when**: Analyzing token usage, optimizing specific workflows
**Benefit**: Understand and maximize savings, track ROI

### [06-advanced-patterns](06-advanced-patterns/)
**Advanced techniques for complex scenarios**

- **[parallel-agents-guide.md](06-advanced-patterns/parallel-agents-guide.md)** - Multi-agent coordination via Task tool + git isolation with [Worktrunk](https://worktrunk.dev/)
- **[agent-teams-guide.md](06-advanced-patterns/agent-teams-guide.md)** - Native Agent Teams (v2.1.32+, Opus 4.6+) — autonomous peer-to-peer coordination on shared codebases; includes `/agent-team` skill with `pr-review`, `debug`, `feature`, `custom` presets
- **[checkpoint-system-guide.md](06-advanced-patterns/checkpoint-system-guide.md)** - Save/resume workflows
- **[constitution-guide.md](06-advanced-patterns/constitution-guide.md)** - Architectural decision frameworks
- **[observability-guide.md](06-advanced-patterns/observability-guide.md)** - Session monitoring, cost tracking, usage pattern analysis
- **[sprint-orchestration-guide.md](06-advanced-patterns/sprint-orchestration-guide.md)** - Chain skills into a Think → Plan → Build → Review → Test → Ship → Reflect lifecycle with artifact flow between phases
- **[decision-classification-guide.md](06-advanced-patterns/decision-classification-guide.md)** - Mechanical / Taste / User Challenge decision framework, anti-sycophancy rules, dual effort scales

**Use when**: Complex projects, team coordination, critical decisions, cost visibility
**Benefit**: Handle advanced scenarios with proven patterns; understand where tokens go

### [07-custom-commands](07-custom-commands/)
**Custom slash commands for specialized workflows**

- **[debug.md](07-custom-commands/debug.md)** - Debug Agent for systematic debugging
- **[i18n.md](07-custom-commands/i18n.md)** - Internationalization management
- **[qa.md](07-custom-commands/qa.md)** - QA automation with browser testing
- **[content-review.md](07-custom-commands/content-review.md)** - Content audit for accuracy, consistency, grammar, and translations
- **[retro.md](07-custom-commands/retro.md)** - Sprint retrospective with git analytics, shipping metrics, per-author breakdowns, and actionable insights

**Use when**: Specialized workflows, testing, debugging, sprint retrospectives, content quality assurance
**Benefit**: Encapsulate complex workflows into simple commands

### [08-ui-ux-development](08-ui-ux-development/)
**Production-ready UI/UX implementation with Claude Code**

- **[ui-ux-pro-skill.md](08-ui-ux-development/ui-ux-pro-skill.md)** - Complete UI/UX Pro Max skill documentation
  - 50+ UI styles (Glassmorphism, Minimalism, Brutalism, etc.)
  - 21 color palettes with accessibility guidance
  - 50 font pairings
  - shadcn/ui MCP integration
- **[dashboard-workflow-guide.md](08-ui-ux-development/dashboard-workflow-guide.md)** - Step-by-step dashboard implementation
  - Real API data integration
  - Empty states and loading patterns
  - Security best practices (XSS prevention)
  - Dark mode and multilingual support
- **[browser-testing-guide.md](08-ui-ux-development/browser-testing-guide.md)** - Systematic browser testing
  - Chrome DevTools via Claude in Chrome MCP
  - Network, console, visual verification
  - Responsive and accessibility testing

**Use when**: Building dashboards, admin panels, landing pages, SaaS interfaces
**Benefit**: 40-60% token savings, production-ready code with security and accessibility
**Time**: 60-90 minutes per dashboard (vs 3-4 hours manual)

### [09-laravel-mcp-integration](09-laravel-mcp-integration/)
**Connect Claude Code with Laravel's MCP ecosystem**

- **[README.md](09-laravel-mcp-integration/README.md)** - Laravel MCP ecosystem overview
- **[setup-guide.md](09-laravel-mcp-integration/setup-guide.md)** - Installation and configuration
- **[laravel-claude-md-template.md](09-laravel-mcp-integration/laravel-claude-md-template.md)** - CLAUDE.md template for Laravel projects
- **[laravel-subagent.md](09-laravel-mcp-integration/laravel-subagent.md)** - Custom subagent for Laravel development

**Use when**: Working on Laravel 11.x/12.x projects with Claude Code
**Benefit**: Project-aware assistance via Laravel Boost + package discovery via LaraPlugins.io
**Setup**: 5 minutes per project (composer install + MCP registration)

### [10-subagents](10-subagents/)
**Create custom AI agents with specialized knowledge and tools**

- **[README.md](10-subagents/README.md)** - Subagent system overview
- **[guide.md](10-subagents/guide.md)** - Complete subagent creation guide + all v2.1.83 frontmatter fields + production agents
  - `plan-challenger` (Opus) — adversarial plan review across 5 dimensions with refutation check
  - `output-evaluator` (Haiku) — LLM-as-Judge: APPROVE/NEEDS_REVIEW/REJECT before commit
  - `loop-monitor` (Haiku) — watchdog for autonomous sessions: stall/runaway/loop detection
- **[examples/](10-subagents/examples/)** - Working subagent examples
  - `code-reviewer.md` - Read-only code review agent
  - `laravel-specialist.md` - Laravel development agent
  - `debugger.md` - Debugging specialist
  - `test-generator.md` - Test generation agent

**Use when**: Repetitive specialized tasks, team standardization, cost optimization
**Benefit**: Reusable agents with controlled tool access and model selection
**Setup**: 5-10 minutes per agent definition

### [11-mobile-development](11-mobile-development/)
**Mobile development with Claude Code across all major platforms**

- **[README.md](11-mobile-development/README.md)** - Platform comparison and quick start
- **[setup-guide.md](11-mobile-development/setup-guide.md)** - MCP server installation for all platforms
- **iOS**: [guide](11-mobile-development/ios/ios-guide.md) | [subagent](11-mobile-development/ios/ios-subagent.md) | [CLAUDE.md template](11-mobile-development/ios/ios-claude-md-template.md)
- **Android**: [guide](11-mobile-development/android/android-guide.md) | [subagent](11-mobile-development/android/android-subagent.md) | [CLAUDE.md template](11-mobile-development/android/android-claude-md-template.md)
- **React Native**: [guide](11-mobile-development/react-native/react-native-guide.md) | [subagent](11-mobile-development/react-native/react-native-subagent.md) | [CLAUDE.md template](11-mobile-development/react-native/react-native-claude-md-template.md)
- **Flutter**: [guide](11-mobile-development/flutter/flutter-guide.md) | [subagent](11-mobile-development/flutter/flutter-subagent.md) | [CLAUDE.md template](11-mobile-development/flutter/flutter-claude-md-template.md)
- **Skills**: [/mobile-build](11-mobile-development/skills/mobile-build.md) | [/mobile-test](11-mobile-development/skills/mobile-test.md)

**Use when**: Developing iOS (Swift/SwiftUI), Android (Kotlin/Compose), React Native, or Flutter apps
**Benefit**: Platform-specific MCP integration, build/test automation, device control
**Setup**: 5-10 minutes per platform (MCP installation + CLAUDE.md template)

### [12-desktop-development](12-desktop-development/)
**Desktop development with Claude Code for macOS, Tauri, and Electron**

- **[README.md](12-desktop-development/README.md)** - Platform comparison and quick start
- **[setup-guide.md](12-desktop-development/setup-guide.md)** - MCP server installation for all platforms
- **macOS**: [guide](12-desktop-development/macos/macos-guide.md) | [subagent](12-desktop-development/macos/macos-subagent.md) | [CLAUDE.md template](12-desktop-development/macos/macos-claude-md-template.md)
- **Tauri**: [guide](12-desktop-development/tauri/tauri-guide.md) | [subagent](12-desktop-development/tauri/tauri-subagent.md) | [CLAUDE.md template](12-desktop-development/tauri/tauri-claude-md-template.md)
- **Electron**: [guide](12-desktop-development/electron/electron-guide.md) | [subagent](12-desktop-development/electron/electron-subagent.md) | [CLAUDE.md template](12-desktop-development/electron/electron-claude-md-template.md)
- **Skills**: [/desktop-build](12-desktop-development/skills/desktop-build.md) | [/desktop-test](12-desktop-development/skills/desktop-test.md)

**Use when**: Building macOS native (SwiftUI/AppKit), Tauri (Rust + Web), or Electron (Node.js + Chromium) desktop apps
**Benefit**: Platform-specific MCP integration, build/package automation, code signing and notarization workflows
**Setup**: 5-10 minutes per platform (MCP installation + CLAUDE.md template)

### [14-webmcp](14-webmcp/)
**WebMCP — structured browser tools for AI agents (W3C Draft, Chrome 146 Canary)**

- **[guide.md](14-webmcp/guide.md)** - WebMCP integration guide
  - What WebMCP solves (89% token savings vs screenshot-based approaches)
  - WebMCP vs MCP comparison (frontend vs backend)
  - `navigator.modelContext` API reference with code examples
  - Implementation patterns (read-only, form actions, declarative HTML)
  - Integration with Chrome MCP and Playwright MCP
  - CLAUDE.md template for WebMCP-enabled projects
  - Current limitations and browser support matrix

**Use when**: Building web applications that AI agents will interact with
**Benefit**: Structured tool access instead of DOM scraping; 89% token reduction
**Status**: Early Preview — Chrome 146 Canary only, spec actively changing

---

### [13-security-hardening](13-security-hardening/)
**Protect Claude Code workflows from MCP attacks, prompt injection, and accidental data loss**

- **[guide.md](13-security-hardening/guide.md)** - Complete security hardening guide
  - MCP vetting checklist + community-vetted safe list
  - Known CVEs (2025-2026) with versions and mitigations
  - Prompt injection defense hooks (PreToolUse + PostToolUse)
  - 6 production safety rules with `settings.json` + hook implementations
  - `permissions.deny` hardening templates (global + project-level)
  - Agent Skills supply chain risks and scanning
- **[hooks/](13-security-hardening/hooks/)** - Production hook library (actual scripts, copy-paste ready)
  - `dangerous-actions-blocker.sh` — blocks rm -rf /-class commands, force-push to main, DROP TABLE, edits to key files
  - `pre-commit-secrets.sh` — scans staged content for API keys / private keys / DB URLs before every `git commit`
  - README with `settings.json` wiring and the PreToolUse hook contract
  - Productivity hooks (package-version checker, session-start memory loader) live in [01-global-optimization/hooks/](01-global-optimization/hooks/)

**Use when**: Team environments, production codebases, regulated industries, before adding new MCP servers
**Benefit**: Prevent data exfiltration, block destructive operations, audit MCP supply chain
**Time**: 15-30 minutes for initial hardening; 5 minutes per new MCP added

### [16-autonomous-agents](16-autonomous-agents/)
**Run Claude Code unattended — cron agents, heartbeat watchdogs, and session journaling**

- **[guide.md](16-autonomous-agents/guide.md)** - Autonomous & scheduled agents guide
  - The three primitives: headless cron runs, `/loop`, and hooks — and when each applies
  - Daily journaling agent recipe (~120 production runs/month): idempotent in-place note editing, replace-vs-append sections, self-contained cron briefs
  - Heartbeat watchdog protocol: exact `HEARTBEAT_OK` token, 200-token failure budget, probe allowlist — born from sessions killed for drifting into investigations
  - Watchdog patterns: stall / token-runaway / repeated-action-loop detection
  - Anti-pattern table — each entry cost a real incident
- **[heartbeat-template.md](16-autonomous-agents/heartbeat-template.md)** - Copy-paste HEARTBEAT protocol file
- **[session-summary-hook.py](16-autonomous-agents/session-summary-hook.py)** - Stop hook: Haiku-summarized session entries appended to a daily note (~$0.001/session)

**Use when**: Scheduled health checks, automated journaling, any unattended Claude Code run
**Benefit**: Agents that complete within budget instead of drifting; a daily work journal nobody has to write
**Time**: 30-60 minutes for the first cron agent

---

## 🚀 Quick Start

### First Time Setup (2-3 hours)

**Option 1: Automated (Recommended)**
```bash
# Navigate to Claude Code
cd ~/.claude

# Use the setup agent
# Copy contents of 01-global-optimization/setup-agent.md
# Paste into Claude Code conversation
# Agent will create all files automatically
```

**Option 2: Manual**
```bash
# Follow the step-by-step guide
# Read: 01-global-optimization/guide.md
# Create files as instructed
# Verify with: 01-global-optimization/checklist.md
```

### Activate for Your Project (10-15 min)

```bash
# Navigate to your project
cd ~/projects/your-project

# Use the activation agent
# Copy contents of 02-project-activation/activation-agent.md
# Paste into Claude Code conversation
# Agent will activate Serena and create memories
```

### Start Optimized Work

```bash
# In your project directory
/optimize "Your task here"

# Or use /init-project for new projects
/init-project --full
```

---

## 📊 Expected Outcomes

### Token Reduction Targets

| Scenario | Baseline | Optimized | Savings |
|----------|----------|-----------|---------|
| **Simple task** (bug fix) | 22,000 tokens | 1,600 tokens | **93%** |
| **Medium task** (new feature) | 31,000 tokens | 8,500 tokens | **73%** |
| **Complex task** (module creation) | 85,000 tokens | 18,000 tokens | **79%** |

**Conservative target**: 30-50% overall reduction
**Aggressive target**: 50-70% with full optimization
**Maximum achieved**: 80-90% with prompt caching on large contexts

### Cost Savings

**Per session** (average medium task):
- Baseline: $0.93 (31,000 tokens @ $3/M)
- Optimized: $0.26 (8,500 tokens @ $3/M)
- **Savings**: $0.67 per session (72%)

**Monthly** (30 sessions):
- Baseline: $27.90
- Optimized: $7.80
- **Savings**: $20.10 per month

**Annual** (360 sessions):
- Baseline: $334.80
- Optimized: $93.60
- **Savings**: $241.20 per year

**Multiple projects** (3 projects, 60 sessions/month):
- Annual savings: **$723.60**

---

## 🛠️ What Gets Created

### Global Files (in `~/.claude/`)

**Agents** (orchestration):
- `agents/pm-orchestrator.md` - Central coordinator
- `agents/plan-challenger.md` - Adversarial plan review (Opus)
- `agents/output-evaluator.md` - Code quality judge before commit (Haiku)
- `agents/loop-monitor.md` - Autonomous session watchdog (Haiku)

**Hooks** (automation):
- `hooks/dangerous-actions-blocker.sh` - Blocks destructive commands and protected files
- `hooks/pre-commit-secrets.sh` - Scans staged files for API keys before commit
- `hooks/smart-suggest.sh` - Suggests the right tool/agent per prompt intent

**Settings** (configuration):
- `settings/prompt-caching.json` - 90% savings on cached content
- `settings/beta-features.json` - Token-efficient tools (14-70% savings)
- `settings/model-strategy.json` - Haiku/Sonnet/Opus selection
- `settings/token-optimization.json` - All optimization strategies

**Skills** (slash commands):
- `skills/optimize/SKILL.md` - `/optimize` command
- `skills/context/SKILL.md` - `/context` command
- `skills/cache-inspector/SKILL.md` - `/cache-inspector` command
- `skills/update-docs/SKILL.md` - `/update-docs` command
- `skills/init-project/SKILL.md` - `/init-project` command
- `skills/agent-ready/SKILL.md` - `/agent-ready` command (+ `scripts/` + `references/`)
- `skills/continuity/SKILL.md` - `/continuity` command (+ `scripts/` + `references/`)
- `skills/self-improve/SKILL.md` - `/self-improve` command (+ `scripts/` + `references/`)
- `skills/agent-team/SKILL.md` - `/agent-team` command (pr-review, debug, feature, custom)

**System Prompts** (behavior):
- `system-prompts/global-optimization.md` - Applies to all projects/agents
- `system-prompts/symbol-first-protocol.md` - 65-75% savings via Serena

**Documentation**:
- `README.md` - Complete guide
- `INSTALLATION-COMPLETE.md` - Setup summary
- `QUICK-REFERENCE.md` - Command cheat sheet

### Project-Specific Files (in `.claude/`)

**Per project** (10-15 min setup):
- `settings/constitution.json` - Architectural rules (optional)
- `.serena/memories/architecture.md` - Project structure
- `.serena/memories/codebase-conventions.md` - Coding patterns
- `.serena/memories/module-structure.md` - Navigation (if applicable)
- `.serena/memories/testing-strategy.md` - Test patterns
- `.serena/memories/docker-workflow.md` - Docker commands (if applicable)

---

## 📖 How to Use This Library

### Sharing with Others

**Send the entire directory**:
```bash
# Zip the library
tar -czf claude-optimization.tar.gz ~/ai-prompts

# Share with team
# Recipients extract and follow guides
```

**Or share specific guides**:
- New to Claude Code? Start with `01-global-optimization/guide.md`
- Need project setup? Use `02-project-activation/guide.md`
- Want custom commands? Read `03-custom-skills/guide.md`

### Rebuilding After Data Loss

If you lose your `~/.claude/` directory:

1. **Follow global setup** (2-3 hours):
   - Read `01-global-optimization/guide.md`
   - Or run `01-global-optimization/setup-agent.md`
   - Verify with `01-global-optimization/checklist.md`

2. **Reactivate each project** (10-15 min per project):
   - Navigate to project
   - Run `02-project-activation/activation-agent.md`
   - Or manually create memories using templates

3. **Resume work** with full optimization:
   - All token savings restored
   - Slash commands available
   - PM Orchestrator coordinating

### Adapting for Your Team

**Customize guides**:
- Add team-specific conventions
- Include company coding standards
- Reference your internal documentation

**Create team templates**:
- Shared constitution for all projects
- Standard memory templates
- Custom skills for team workflows

**Version control**:
```bash
cd ~/ai-prompts
git init
git add .
git commit -m "Initial Claude Code optimization library"
git remote add origin <your-repo>
git push -u origin main
```

---

## 🔧 Maintenance

### Weekly
- Review optimization performance: `/cache-inspector analyze`
- Check token usage trends
- Update memories if code patterns change

### Monthly
- Run `/update-docs validate` to check doc accuracy
- Review and update constitution if needed
- Check for new Claude API features

### Quarterly
- Full documentation review: `/update-docs research all`
- Update memory templates with learned patterns
- Analyze cumulative ROI

---

## 🆘 Troubleshooting

### "Serena not working"
**Solution**: See `02-project-activation/guide.md` → Troubleshooting section

### "Low token savings"
**Solution**: See `05-token-optimization/guide.md` → Measurement section

### "Skill not found"
**Solution**: Verify skill installed in `~/.claude/skills/[skill-name]/SKILL.md`

### "Cache not working"
**Solution**: Run `/cache-inspector status` to diagnose

### "Constitution not enforced"
**Solution**: Verify PM Orchestrator loaded, check settings

---

## 📚 Additional Resources

### Official Documentation
- [Anthropic Prompt Caching](https://www.anthropic.com/news/prompt-caching)
- [Token-Saving Updates](https://www.anthropic.com/news/token-saving-updates)
- [Extended Thinking](https://www.anthropic.com/news/visible-extended-thinking)
- [Claude Pricing](https://platform.claude.com/docs/en/about-claude/pricing)

### Community Resources
- [FastMCP Skills](https://fastmcp.me/Skills/Explore)
- [SuperClaude Framework](https://github.com/SuperClaude)
- [Serena MCP](https://github.com/Serena-MCP)
- [Awesome Claude Code Subagents](https://github.com/VoltAgent/awesome-claude-code-subagents)
- [Claude Code Cheat Sheet](https://github.com/Njengah/claude-code-cheat-sheet)
- [Awesome LLM Apps](https://github.com/Shubhamsaboo/awesome-llm-apps) - 95K+ star collection of LLM agent implementations; see [`awesome_agent_skills/`](https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/awesome_agent_skills) for 18 SKILL.md-format skills and multi-agent team patterns
- [Claude Code Ultimate Guide](https://github.com/FlorianBruniaux/claude-code-ultimate-guide) - Comprehensive reference covering methodologies, security CVEs, observability, and production patterns

### Laravel MCP Ecosystem
- [Laravel Boost](https://laravel.com/ai/mcp) - Official Laravel MCP server
- [LaraPlugins.io MCP](https://laraplugins.io/mcp) - Package discovery MCP

### Claude Code Documentation
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents) - Official subagent docs
- [Claude Code MCP](https://code.claude.com/docs/en/mcp) - MCP integration guide
- [Claude Code Skills](https://code.claude.com/docs/en/skills) - Custom skills guide

### Related Tools
- [context-mode](https://github.com/mksglu/context-mode) - MCP plugin that sandboxes tool output to protect context window (98% savings on bulk commands)
- [Worktrunk](https://worktrunk.dev/) - Git worktree management for parallel AI agents (Apache 2.0)
- [Codex-CLI](https://github.com/codex-cli) - Code refactoring
- [Chrome-DevTools MCP](https://github.com/chrome-devtools-mcp) - Browser automation
- [Sequential-Thinking](https://github.com/sequential-thinking) - Reasoning support

---

## 🎯 Success Stories

**Project 1: Laravel Multi-Tenant SaaS**
- Baseline: 85,000 tokens/session
- Optimized: 18,000 tokens/session
- **Savings**: 79% reduction, $2.01/session
- **Annual**: $723.60 saved (360 sessions)

**Project 2: React Dashboard**
- Baseline: 45,000 tokens/session
- Optimized: 12,000 tokens/session
- **Savings**: 73% reduction, $0.99/session

**Project 3: Python/Django API**
- Baseline: 67,000 tokens/session
- Optimized: 14,000 tokens/session
- **Savings**: 79% reduction, $1.59/session

**Combined across 3 projects** (60 sessions/month):
- **Total savings**: $2,170.80/year
- **Setup time**: 5 hours total (global + 3 projects)
- **ROI**: Pays for setup in first week

---

## 🤝 Contributing

If you create custom skills, guides, or improvements:

1. Test thoroughly with your projects
2. Document clearly with examples
3. Share back with the community
4. Consider adding to this library

**Format**:
- Markdown guides: Clear, step-by-step, with examples
- Agent files: YAML frontmatter + detailed instructions
- Include token savings estimates
- Add troubleshooting sections

---

## 📄 License

Released under the [MIT License](LICENSE) — free to use, copy, modify, and share, including commercially. The only condition is keeping the copyright notice.

These prompts are project-agnostic and can be freely adapted for your team's needs.

---

## 🚀 Next Steps

1. **If this is your first time**:
   - Read `01-global-optimization/guide.md`
   - Allocate 2-3 hours for global setup
   - Use `setup-agent.md` for automation

2. **If global setup is complete**:
   - Navigate to your project
   - Read `02-project-activation/guide.md`
   - Allocate 10-15 minutes for activation

3. **If everything is set up**:
   - Start using `/optimize` for all tasks
   - Monitor savings with `/cache-inspector`
   - Share this library with your team

---

**Questions or issues?** Check the troubleshooting sections in each guide or review the official Claude documentation.

**Remember**: This is a ONE-TIME global setup (2-3 hours) + 10-15 min per project. All future projects benefit automatically with minimal activation effort.

**Time investment**: 3-5 hours total (global + 3 projects)
**Time savings**: Hundreds of hours in reduced token usage and faster execution
**Cost savings**: $700-$2,000+ per year (depending on usage)
**ROI**: Immediate (pays for itself in 2-3 sessions)

---

**Created**: 2026-01-04
**Last Updated**: 2026-07-18
**Version**: 1.24.2
**Compatibility**: Claude Code v2.1.32+, Claude API (Fable 5: `claude-fable-5`, Opus 4.8: `claude-opus-4-8`, Opus 4.7: `claude-opus-4-7`, Sonnet 5: `claude-sonnet-5`, Haiku 4.5: `claude-haiku-4-5`)

---

## 📝 Version History

### v1.24.2 (2026-08-06)
**Docs**: model-lineup refresh for the Claude Opus 5 release (`claude-opus-5`, $5/$25, current Opus). Added Opus 5 to the live lineup surfaces — `04-research-integration/sources.md` (Models Overview line + pricing table), `CLAUDE.md` compatibility line. Corrected the Fast mode facts in `01-global-optimization/system-prompts/global-optimization.md` and `05-token-optimization/guide.md`: `speed:"fast"` is **Opus 5 / Opus 4.8 only** at **$10/$50** (was wrongly "Opus 4.6 only, $30/$150"; 4.7 fast mode removed; first-party Claude API only). Historical version-history/CHANGELOG entries left frozen.

### v1.24.1 (2026-07-18)
**Docs**: doc-sync after the v1.22–v1.24 skill additions/restructures — updated stale skill counts (6/5 → 8) and multi-file structure notes across README, `01-global-optimization/{guide,setup-agent,checklist}.md`, and `03-custom-skills/guide.md`; added the 3 missing skills to the Bundled-Files list. Historical entries untouched; no behavior change.

### v1.24.0 (2026-07-18)
**Changed**: 5 global skills (`optimize`, `context`, `cache-inspector`, `update-docs`, `init-project`) restructured to the v1.21 authoring conventions — leading *When to Use (and When NOT to)* table, closing *Boundaries*, and progressive-disclosure split into `references/` — **without changing functionality** (250–333-line monoliths → thin 87–180-line cores + linked references; content moved, not deleted). Surfaced by dogfooding the `self-improve` Tier-3 subagent judge over the whole library (these scored 0.2–0.4) and confirmed fixed by re-judging (0.8–1.0, all pass). Tier-2 `skill-lint` clean.

### v1.23.1 (2026-07-18)
**Added**: `.githooks/pre-commit` — wires `skill-lint.py` (Tier-2) as a version-controlled pre-commit gate over `01-global-optimization/skills/`. Runs only when a staged change touches the skills tree (docs-only commits pass through); errors block, warnings are advisory, `--no-verify` bypasses. Enable per clone: `git config core.hooksPath .githooks` (see `.githooks/README.md`).

### v1.23.0 (2026-07-18)
**Added**: `/self-improve` global skill (8th global skill, `01-global-optimization/skills/self-improve/`) — a **converging** self-improvement loop for the skill library: mine recurring review feedback (frequency threshold → "an undocumented requirement") → apply a bounded edit (≤5 changes / ≤100 lines, regression-aborts) → gate through **three-tier evaluation** → promote the rule → measure convergence. The three tiers: **Tier 2** deterministic `scripts/skill-lint.py` (stdlib linter — frontmatter, kebab-name, description bounds, unreferenced files, duplicate names, trigger-collision; `--json` emits a sealable evidence record; ready as a pre-commit hook), **Tier 1** trigger-accuracy subagent (10 should-trigger / 10 should-not in the real crowded skill env), **Tier 3** rubric LLM-as-judge. Multi-file: linter + `references/rubric.md` (signal-mining + eval protocol) + `references/integration-seams.md` (optional deterministic-execution / decision-memory / governance / code-intelligence seams). Idea from Salesforce Engineering, *"Closing the Loop: How to Build Self-Improving AI Systems with Automated Feedback Loops"* (2026-07-17, `forcedotcom/sf-skills`).
**Updated**: `01-global-optimization/system-prompts/global-optimization.md` (the global `~/.claude/CLAUDE.md` rules) — new *Convention Promotion (recurring feedback → rule)* section: a correction seen ~3+ times is promoted into the generator surface + durable policy instead of accumulating another near-duplicate memory; disputed signal calibrates the rule down.

### v1.22.0 (2026-07-18)
**Added**: `/continuity` global skill (7th global skill, `01-global-optimization/skills/continuity/`) — a repo-local **resume → work → finalize** lifecycle that preserves the *operational thread* across coding sessions (what's mid-flight, what already failed, what's next), the gap that bigger context/vector/chat memory doesn't close. State lives in an inspectable, git-diffable `.continuity/STATE.md` where every fact carries an **evidence tag** (`[observed]`/`[validated]`/`[user]` = trust; `[claimed]`/`[contradicted]`/`[unknown]` = low-trust) so uncertainty stays visible. Multi-file: `scripts/continuity.py` (stdlib-only scaffold + lint of structure/tags/provenance) and `references/format.md` (section spec + worked example + local-vs-portable split). Explicitly a **thin layer over** the existing memory stack (Serena/Svod/codebase-memory/auto-memory), not a new store — the skill forbids creating `.continuity/` for single-shot work to avoid a sixth-memory-store. Idea adapted from Santi Santamaria Medel, *"Maybe Coding Agents Don't Need a Bigger Memory. Maybe They Need Continuity."* (Level Up Coding, 2026-06-18).
**Updated**: `01-global-optimization/system-prompts/global-optimization.md` (the global `~/.claude/CLAUDE.md` rules) — new *Session Continuity (resume → work → finalize)* section wiring the lifecycle into the mandatory session-start/session-end rituals.

### v1.21.0 (2026-07-14)
**Added**: Five skill-authoring patterns adapted from [garrettw/php-arch-skills](https://github.com/garrettw/php-arch-skills), folded into `03-custom-skills/` and the root `CLAUDE.md`: (1) a **"When to Use (and When NOT to)" decision table** as a standard leading section — the operational form of the don't-gold-plate rule; (2) a **"Boundaries" rubric** (Always Do / Ask First / Never Do), with `Ask First` aligned to Action Safety; (3) **`references/` progressive disclosure as the default** — the template now ships a thin-core + `scripts/` + `references/` multi-file structure; (4) **explicit bidirectional cross-linking** between skills (new guide section + strengthened *When Editing* rule); (5) a **reference-split (matrix) pattern** (guide Pattern 5) for one concern across many variants, with `11-mobile-development` / `12-desktop-development` as worked examples.
**Updated**: `03-custom-skills/skill-template.md`, `03-custom-skills/guide.md`, and root `CLAUDE.md`.

### v1.20.0 (2026-07-14)
**Added**: `/agent-ready` global skill (6th global skill) — audits a project's public site for AI-agent readiness via Cloudflare's [isitagentready.com](https://isitagentready.com) scanner (robots.txt, sitemap, llms.txt, Link headers, Content Signals, Markdown-for-Agents, MCP / OAuth / A2A / Agent-Skills discovery, agentic commerce), then triages each failing check by ROI for the site type (content vs. API vs. agentic-commerce) and implements **only** what pays back — treating "implement every check" as the failure mode. First multi-file skill in the repo: a stdlib-only scanner script (`scripts/scan.py`, API-first with a direct-probe fallback) plus `references/applicability.md` (ROI decision table + AI-crawler policy) and `references/implementations.md` (per-stack recipes for Laravel / Next.js / Node / static).
**Cross-referenced**: linked from `14-webmcp/guide.md` (the `webMcp` discovery check) and `07-custom-commands/seo.md` (shared robots/sitemap/AI-crawler/GEO surface).

### v1.19.0 (2026-07-02)
**Added**: Default Tooling Stack in the global template — Lattice (browser + web search), Svod (persistent memory), Svod Foundry (reusable tools), Harbormaster (cross-project agent comms), each with a fallback
**Updated**: `/update-docs` skill hardened (→ v1.1.0) from two real runs — prefer Lattice / `ctx_fetch_and_index` over the context-mode-blocked `WebFetch`, lead with authoritative `platform.claude.com` + `claude-api` sources, `analyze` as the default action, an immutable-historical-records rule + Releasing-convention pointer, de-staled examples, and clearer scope vs `/content-review`

### v1.18.0 (2026-07-02)
**Updated**: Sonnet 5 model refresh (from a `/update-docs` research pass against the live Claude docs)
- **Claude Sonnet 5** (`claude-sonnet-5`) is now the current Sonnet — a drop-in upgrade for Sonnet 4.6 with adaptive thinking on by default and manual extended thinking / non-default sampling params returning 400
- Bumped live `claude-sonnet-4-6` example/frontmatter/config references to `claude-sonnet-5` across 01–05 and 10; updated compatibility lines (README footer, `CLAUDE.md`, 09/11/12) and pricing tables (04/05/06) with Sonnet 5's intro $2/$10 (through 2026-08-31) → $3/$15 standard
- Fable 5 / Opus 4.8 / Haiku 4.5 lineup and pricing re-verified against the live docs — unchanged
- **Content hygiene**: translated untranslated Bulgarian prose/comments to English (03, 06, 10); kept deliberate Bulgarian example content (07 content-review language rules, 08 native-script language-switcher sample)

### v1.17.1 (2026-06-15)
**Added**: `LICENSE` file — the repository is now released under the **MIT License**
- Previously the README declared a "freely shared" intent but had no `LICENSE` file, so GitHub reported "No license" (all-rights-reserved by default)
- MIT covers both the prose guides and the executable hook/skill files; README License section updated to match

### v1.17.0 (2026-06-10)
**Added**: Production patterns distilled from 3 months / ~450 sessions of real Claude Code work (all content sanitized — no personal projects, hosts, or infrastructure)
- **16-autonomous-agents/** — new section: cron journaling agent recipe, heartbeat watchdog protocol (`HEARTBEAT_OK` token + budget design), watchdog detection patterns, `/loop` usage, copy-paste heartbeat template + session-summary Stop hook
- **Hooks as actual files** — `13-security-hardening/hooks/` (dangerous-actions-blocker, pre-commit-secrets) and `01-global-optimization/hooks/` (check-package-latest, session-start-memory-load), each with settings.json wiring and design notes
- **06-advanced-patterns/headless-review-fanout-guide.md** — diff-scoped parallel reviewers in worktrees with structured output + adversarial verify pass (caught a real cross-tenant IDOR in production use)
- **06-advanced-patterns/cross-project-delegation-guide.md** — concept guide: MCP message bus between project-scoped agents (delegation, fan-out Q&A, clarification loop)
- **03-custom-skills/skill-taxonomy-guide.md** — designing families of 40+ skills: methodology → dispatcher → leaf skills → validation gates, dated-backup versioning, token economics
- **5 new skill examples** in 03: `fix-bug` (three-phase), `git-sync-branches` (submodule-aware), `image-optimize`, `compliance-audit`, `onepassword-integrate`
- **4 new subagent examples** in 10: `loop-monitor` (watchdog), `output-evaluator` (LLM-as-Judge gate), `plan-challenger` (adversarial + refutation), `self-review`

**Updated**:
- **01 global template** — ported 11 battle-tested sections: Code Discipline, Faithful Reporting, rename/removal discipline, bug-fix completeness, background delegation, communication protocol, action safety, worktree isolation, auto-memory, recurring tasks, effort levels
- **02-project-activation** — new Memory Hygiene & GC section (append-don't-create, durable-facts-only, periodic GC, feature-inventory sync)
- **04-research-integration** — new section: license-compatibility gate (AGPL/SSPL blockers) + evaluating unsolicited vendor audit PRs

### v1.16.0 (2026-06-10)
**Updated**: Model lineup refresh for the Fable 5 / Opus 4.8 era
- New model tier documented: Fable 5 (`claude-fable-5`, $10/$50 per MTok); Opus 4.8/4.7 (`claude-opus-4-8`/`-4-7`, $5/$25, 1M context) replace Opus 4.6 as the recommended Opus
- Fixed wrong pricing in observability guide (Opus listed at $15/$75 → actual $5/$25; Haiku $0.80/$4 → $1/$5)
- Opus 4.7+ breaking changes documented: `budget_tokens` and `temperature`/`top_p`/`top_k` removed (400), thinking text omitted by default (`display: "summarized"` to opt in), `effort: xhigh` added
- New token levers in 05: Task Budgets beta (`task-budgets-2026-03-13`), server-side compaction header (`compact-2026-01-12`), mid-conversation system messages (`mid-conversation-system-2026-04-07`)
- Fast mode caveat: `speed: "fast"` API param is Opus 4.6-only; no fast variant on 4.7/4.8
- All `claude-opus-4-6` example/frontmatter references bumped to `claude-opus-4-8`; stray `claude-sonnet-4-5` default bumped to `claude-sonnet-4-6`

### v1.15.0 (2026-03-31)
**Added**: Source-informed improvements from analysis of Claude Code's actual system prompt architecture
- 4 new MANDATORY sections for the global CLAUDE.md template: Code Discipline, Faithful Reporting, Communication Protocol, Action Safety
- Memory type system (user/feedback/project/reference) with "what NOT to save" exclusion list in 02-project-activation
- Cache-friendly prompt ordering (static/dynamic boundary pattern) in 05-token-optimization
- Subagent advanced patterns: fork context protection, read-only agent template, anti-delegation rule
- Output style skill examples (explanatory, audit, teaching) in 03-custom-skills

**Added**: Sprint lifecycle patterns inspired by [gstack](https://github.com/garrytan/gstack) analysis
- `/retro` skill — sprint retrospective with git analytics, per-author breakdowns, shipping streaks
- Sprint orchestration guide — Think → Plan → Build → Review → Test → Ship → Reflect pipeline
- Decision classification guide — Mechanical / Taste / User Challenge framework with anti-sycophancy rules
- AI slop detection in UI/UX Pro skill — 0-10 scoring rubric, 10 common patterns, fix checklist
- Anti-sycophancy and decision authority sections in skill template

### v1.13.0 (2026-03-28)
**Added**: context-mode Guide (15-context-mode/)
- Installation via Claude Code plugin (`/plugin marketplace add mksglu/context-mode`) and MCP-only mode
- Tool reference: `ctx_batch_execute`, `ctx_search`, `ctx_execute`, `ctx_execute_file`, `ctx_fetch_and_index`, `ctx_index`
- Mandatory tool selection hierarchy (Tier 1 → Tier 2 → Tier 3) and forbidden patterns
- Session continuity: SQLite FTS5 event capture, `--continue` restoration across compaction
- Integration matrix with Serena, memory system, prompt caching, and Agent Teams
- Savings benchmarks: 94-99.9% context reduction vs raw tool output

**Updated**: README.md — added context-mode to Related Tools, bumped to v1.13.0

### v1.12.0 (2026-03-27)
**Added**: Hooks library, production agents & agent-team skill
- "Production Hook Library" section in 13-security-hardening — `dangerous-actions-blocker.sh`, `pre-commit-secrets.sh`, `smart-suggest.sh` with matcher-based `settings.json` registration and `exit 2` vs `exit 0` semantics
- "/agent-team Skill" section in agent-teams guide — 4 preset modes (`pr-review`, `debug`, `feature`, `custom`), feature flag via `settings.json` env block, navigation shortcuts
- "Production Agents (Real Examples)" section in 10-subagents — `plan-challenger` (adversarial plan review), `output-evaluator` (LLM-as-Judge verdict gate), `loop-monitor` (autonomous session watchdog)

### v1.11.0 (2026-03-26)
**Updated**: New subagent and skill frontmatter fields from Claude Code v2.0.43–v2.1.83
- Subagents: `disallowedTools`, `permissionMode`, `background`, `isolation: "worktree"`, `effort`, `maxTurns`, `hooks`, `memory`, `initialPrompt`, `skills`, full model IDs in `model:`
- Skills: `context: fork`, `agent`, `user-invocable: false`, `effort`, `allowed-tools` wildcard syntax, `$0`/`$1` argument shorthand, `${CLAUDE_SESSION_ID}` and `${CLAUDE_SKILL_DIR}` variables

### v1.10.0 (2026-03-21)
**Added**: `/content-review` skill (07-custom-commands/content-review.md)
- Content audit for documentation, UI copy, error messages, and translation files
- Scope filtering (docs/ui/errors/api), multilingual checks (Bulgarian/English), structured report output
- Based on production audits of Zonex/Signalio (23+ issues found and fixed)

### v1.9.0 (2026-03-20)
**Added**: WebMCP Integration Guide (14-webmcp/)
- W3C Draft Community Group Report (Google + Microsoft) — `navigator.modelContext` API
- WebMCP vs MCP comparison (frontend/ephemeral vs backend/persistent)
- API reference: `registerTool()`, `unregisterTool()`, `requestUserInteraction()`
- Implementation patterns: read-only data, form actions with confirmation, declarative HTML
- Integration guide for Chrome MCP and Playwright MCP workflows
- CLAUDE.md template for WebMCP-enabled projects
- Browser support matrix and current limitations
- 89% token savings vs screenshot-based approaches

**Updated**: README.md — added 14-webmcp section, bumped to v1.9.0

### v1.8.0 (2026-03-20)
**Fixed**: Critical audit of `~/.claude/` setup — identified files Claude Code never reads
- `~/.claude/system-prompts/` is NOT loaded by Claude Code — migrated content to `~/.claude/CLAUDE.md` (which IS loaded globally)
- `~/.claude/settings/*.json` files (prompt-caching, beta-features, model-strategy, token-optimization) are reference docs only, not active config
- Removed 13 duplicate skill copies from `~/.claude/settings/` (already in `~/.claude/skills/`)
- Removed 15 misplaced .md files from `~/.claude/settings/` (agent/command copies)
- Removed dead docs from `~/.claude/` root (README.md, QUICK-REFERENCE.md, INSTALLATION-COMPLETE.md)
- Updated all model IDs: `claude-opus-4-6`, `claude-sonnet-4-6`, `claude-haiku-4-5-20251001`

**Added**: Important compatibility notice in `01-global-optimization/guide.md` explaining what Claude Code actually reads from `~/.claude/`

**Updated**: `CLAUDE.md` — corrected architecture description and model compatibility

### v1.7.1 (2026-03-20)
**Added**: Git isolation with Worktrunk section in `06-advanced-patterns/parallel-agents-guide.md`
- [Worktrunk](https://worktrunk.dev/) CLI integration for running parallel Claude agents in isolated git worktrees
- Installation guide, core commands, Claude Code parallel workflow example
- Hooks integration and decision table (when to use worktrees vs in-process parallelism)
- Added Worktrunk to Related Tools in README

### v1.7.0 (2026-03-18)
**Fixed**: Critical content gaps in `01-global-optimization/` (reported in issue #1)

**Added**: Complete SKILL.md files for all 5 global skills (previously placeholder text):
- `/optimize` — task complexity analysis, planning strategy selection, model routing, metrics reporting
- `/context` — full memory management (load, save, refresh, list, inspect, clear) with token savings docs
- `/cache-inspector` — cache hit rate analysis, cost breakdown, optimization recommendations
- `/update-docs` — web research + doc comparison + targeted update workflow
- `/init-project` — full stack detection, constitution generation, memory creation, per-framework support

**Added**: Complete system prompt files (previously placeholder text):
- `global-optimization.md` — all mandatory/automatic optimization rules ready to copy to `~/.claude/`
- `symbol-first-protocol.md` — complete symbol-first protocol with patterns, examples, token savings table

**Fixed**: `setup-agent.md` no longer has circular references — now points to actual files in repo
**Fixed**: `03-custom-skills/guide.md` now references `pwa.md` example
**Fixed**: `04-research-integration/guide.md` now links to `sources.md`

### v1.6.0 (2026-03-09)
**Added**: Security Hardening Section (13-security-hardening/)
- MCP vetting workflow with 5-minute audit checklist
- Known CVEs (2025-2026) table with affected versions and patches
- Prompt injection defense hooks (PreToolUse + PostToolUse)
- 6 production safety rules with `settings.json` deny rules and hook implementations
- `permissions.deny` hardening templates (global `~/.claude/` + per-project)
- Agent Skills supply chain risk data (36.8% of public skills have security flaws)
- Incident response playbook

**Added**: Agent Teams Guide (06-advanced-patterns/agent-teams-guide.md)
- Native experimental feature (v2.1.32+, Opus 4.6+, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)
- Architecture: peer-to-peer messaging, git-based locking, isolated 1M-token contexts per agent
- Decision matrix: Agent Teams vs Parallel Agents vs Dual-Instance vs Multi-Instance
- 4 copy-paste patterns: pre-release review, security PR review, multi-file doc update, parallel refactor
- Limitations, red flags, and anti-patterns

**Added**: Observability Guide (06-advanced-patterns/observability-guide.md)
- Session search script (`cs`) — zero-dependency bash, ~15ms for recent sessions
- Community tools comparison (session-search.sh vs claude-conversation-extractor vs ran CLI)
- Cost tracking scripts: per-session and weekly reports
- Usage pattern analysis: most-read files, tool distribution
- Team visibility: aggregate usage across developers
- Cross-folder session migration guide

**Updated**: README.md community resources, compatibility to Claude Code v2.1.32+

### v1.5.0 (2026-02-15)
**Added**: Module Skills — reusable skills that bootstrap entire features on any Laravel project
- `/module:mcp` (`03-custom-skills/examples/module-mcp/`) — Full MCP server implementation
  - Domain analysis → tool scaffolding → implementation workflow
  - Read/Write/Destructive tool patterns with proper annotations
  - Dual transport (HTTP/SSE + stdio), auth bootstrap trait, global scope fix
  - `analyze`, `add <domain>`, `sync` subcommands
  - Based on Agent Fleet reference implementation (61 tools, 14 domains)
- `/module:assistant` (`03-custom-skills/examples/module-assistant/`) — AI assistant chat panel
  - Livewire panel with conversation history, context awareness, resizable sidebar
  - PrismPHP tool registry with role-based access (read/write/destructive tiers)
  - Three provider strategies: cloud (native tools), Claude Code (`<tool_call>` loop), Codex (MCP native)
  - System prompt architecture with domain description, user context, and tool schemas
  - Based on Agent Fleet reference implementation (streaming, optimistic UI, local agents)

### v1.4.0 (2026-02-14)
**Added**: Desktop Development Section (12-desktop-development/)
- macOS native development guide with XcodeBuildMCP (59 tools) and xclaude-plugin (87% token savings)
- Tauri v2 development guide with tauri-plugin-mcp and Rust + web frontend workflows
- Electron development guide with electron-mcp-server and main/renderer process patterns
- Platform-specific subagent definitions for macOS, Tauri, and Electron
- CLAUDE.md templates for all three platforms with customization variants
- Cross-platform `/desktop-build` and `/desktop-test` skills with auto-detection
- macOS-specific coverage: sandboxing, entitlements, notarization, AppKit bridging, window management
- Tauri-specific coverage: IPC commands, capability-based security, plugin system, CSP
- Electron-specific coverage: process isolation, contextBridge, Forge vs Builder, Playwright testing

### v1.3.0 (2026-02-14)
**Added**: Mobile Development Section (11-mobile-development/)
- iOS development guide with XcodeBuildMCP (59 tools) and xclaude-plugin (87% token savings)
- Android development guide with JetBrains MCP and android-mcp-server (ADB)
- React Native development guide with Expo MCP (EAS Build/Update)
- Flutter development guide with Dart/Flutter MCP, Flutter MCP (50k+ packages), DCM MCP (450+ rules)
- Platform-specific subagent definitions for iOS, Android, React Native, and Flutter
- CLAUDE.md templates for all four platforms with customization variants
- Cross-platform `/mobile-build` and `/mobile-test` skills with auto-detection
- Shared mobile-mcp integration for simulator/emulator/device control

### v1.2.0 (2026-02-09)
**Added**: Laravel MCP Integration (09-laravel-mcp-integration/)
- Laravel Boost MCP setup guide (official Laravel MCP server)
- LaraPlugins.io MCP configuration for package discovery
- CLAUDE.md template for Laravel projects (Livewire, Inertia, Filament variants)
- Laravel-specialized subagent definition with Boost MCP integration

**Added**: Subagents Section (10-subagents/)
- Complete subagent creation guide with YAML frontmatter format
- Tool access patterns (read-only, research, code writer, full access)
- Model selection guide (haiku/sonnet/opus by task type)
- Four example subagents: code-reviewer, laravel-specialist, debugger, test-generator

**Added**: Selective Deep Plan Analysis (06-advanced-patterns/)
- Tiered agent selection system (Tier 1/2/3) to prevent context overflow
- Context budget calculator formula for safe agent count
- Agent priority matrix by project type (Laravel, React, API, Data)
- Compact-between-agents and background agent patterns
- Deep plan anti-patterns section

**Updated**: Model compatibility to Claude 4.6 (Opus 4.6, Sonnet 4.5, Haiku 4.5)
**Updated**: Resources with Laravel MCP, subagent docs, and community links

### v1.1.0 (2026-01-22)
**Added**: UI/UX Development Section (08-ui-ux-development/)
- Complete UI/UX Pro Max skill documentation with 50+ styles, 21 palettes, 50 font pairings
- Dashboard workflow guide with real API integration patterns
- Browser testing guide with Chrome DevTools automation
- Security best practices (XSS prevention, CSRF protection)
- Empty state patterns and dark mode implementation
- Based on production Zonex dashboard implementation
- **Token savings**: 40-60% for UI/UX tasks

### v1.0.0 (2026-01-04)
**Initial release**:
- Global optimization setup (01-06)
- Project activation workflows
- Custom skills and commands
- Research and token optimization guides
- Advanced patterns for complex scenarios
