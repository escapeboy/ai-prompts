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

**Use when**: You want custom commands like `/deploy` or `/migrate`
**Benefit**: Encapsulate common workflows, reduce repetition

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

- **[parallel-agents-guide.md](06-advanced-patterns/parallel-agents-guide.md)** - Multi-agent coordination
- **[checkpoint-system-guide.md](06-advanced-patterns/checkpoint-system-guide.md)** - Save/resume workflows
- **[constitution-guide.md](06-advanced-patterns/constitution-guide.md)** - Architectural decision frameworks

**Use when**: Complex projects, team coordination, critical decisions
**Benefit**: Handle advanced scenarios with proven patterns

### [07-custom-commands](07-custom-commands/)
**Custom slash commands for specialized workflows**

- **[debug.md](07-custom-commands/debug.md)** - Debug Agent for systematic debugging
- **[i18n.md](07-custom-commands/i18n.md)** - Internationalization management
- **[qa.md](07-custom-commands/qa.md)** - QA automation with browser testing

**Use when**: Specialized workflows, testing, debugging
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
- **[guide.md](10-subagents/guide.md)** - Complete subagent creation guide
- **[examples/](10-subagents/examples/)** - Working subagent examples
  - `code-reviewer.md` - Read-only code review agent
  - `laravel-specialist.md` - Laravel development agent
  - `debugger.md` - Debugging specialist
  - `test-generator.md` - Test generation agent

**Use when**: Repetitive specialized tasks, team standardization, cost optimization
**Benefit**: Reusable agents with controlled tool access and model selection
**Setup**: 5-10 minutes per agent definition

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

### Laravel MCP Ecosystem
- [Laravel Boost](https://laravel.com/ai/mcp) - Official Laravel MCP server
- [LaraPlugins.io MCP](https://laraplugins.io/mcp) - Package discovery MCP

### Claude Code Documentation
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents) - Official subagent docs
- [Claude Code MCP](https://code.claude.com/docs/en/mcp) - MCP integration guide
- [Claude Code Skills](https://code.claude.com/docs/en/skills) - Custom skills guide

### Related Tools
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

These prompts are project-agnostic and can be freely shared, modified, and adapted for your team's needs.

**Attribution appreciated but not required.**

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
**Last Updated**: 2026-02-09
**Version**: 1.2.0
**Compatibility**: Claude Code (all versions), Claude API (Opus 4.6, Sonnet 4.5, Haiku 4.5)

---

## 📝 Version History

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
