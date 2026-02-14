# Custom Skills Guide

**Create your own slash commands (skills) for Claude Code**

This guide explains how to create custom skills that work as slash commands in Claude Code. Skills let you encapsulate common workflows, project-specific commands, and team conventions into reusable, shareable commands.

---

## Table of Contents

1. [What Are Skills?](#what-are-skills)
2. [Skill Structure](#skill-structure)
3. [Creating Your First Skill](#creating-your-first-skill)
4. [Skill Design Patterns](#skill-design-patterns)
5. [Advanced Features](#advanced-features)
6. [Testing Skills](#testing-skills)
7. [Publishing & Sharing](#publishing--sharing)
8. [Examples](#examples)
9. [Troubleshooting](#troubleshooting)

---

## What Are Skills?

### Definition

A **skill** is a Markdown file that defines a slash command in Claude Code. When you type `/skill-name` in a conversation, Claude executes the instructions defined in the skill file.

### Benefits

- **Consistency**: Same workflow every time
- **Speed**: Complex workflows in one command
- **Shareability**: Team members get same commands
- **Documentation**: Skills document their own usage
- **Composability**: Skills can call other skills

### Where Skills Live

| Location | Scope | Example |
|----------|-------|---------|
| `~/.claude/skills/` | Global (all projects) | `/optimize`, `/context` |
| `.claude/skills/` | Project-specific | `/deploy`, `/migrate` |

**Priority**: Project skills override global skills with the same name.

---

## Skill Structure

### Directory Structure

```
~/.claude/skills/
└── skill-name/
    └── SKILL.md        # Required: Main skill definition
```

**Important**:
- Skill must be in its own subdirectory
- File must be named exactly `SKILL.md` (case-sensitive)
- Skill name comes from the directory name

### SKILL.md Anatomy

```markdown
---
name: skill-name
description: Brief description shown in help
version: 1.0.0
---

# Skill Title

[Detailed description of what the skill does]

## Usage

/skill-name [action] [options]

## Actions

### 1. Action Name

[What this action does]

**Process**:
1. Step 1
2. Step 2
3. Step 3

**Example**:
/skill-name action-name --option value

---

## Integration

[How this skill integrates with other tools]

## Token Optimization

[Token usage and savings information]
```

### YAML Frontmatter

Required fields:
```yaml
---
name: skill-name          # Must match directory name
description: Brief text   # Shown in skill listings
version: 1.0.0           # Semantic versioning
---
```

Optional fields:
```yaml
---
name: skill-name
description: Brief description
version: 1.0.0
model: claude-sonnet-4-5-20250929    # Preferred model
author: Your Name                     # Attribution
tags: [deployment, docker, ci]        # Categorization
requires: [serena, docker]            # Dependencies
---
```

---

## Creating Your First Skill

### Step 1: Plan Your Skill

Before coding, answer these questions:

1. **What problem does this solve?**
   - What repetitive task do you want to automate?
   - What workflow do you want to standardize?

2. **Who will use it?**
   - Just you? → Simple, personalized
   - Your team? → Documented, configurable
   - Public? → Robust, well-tested

3. **What inputs does it need?**
   - Actions/subcommands?
   - Parameters/options?
   - Files/paths?

4. **What outputs should it produce?**
   - Files created?
   - Messages shown?
   - Actions taken?

### Step 2: Create the Directory

```bash
# For global skill
mkdir -p ~/.claude/skills/my-skill

# For project skill
mkdir -p .claude/skills/my-skill
```

### Step 3: Write the SKILL.md

Create `SKILL.md` in the skill directory:

```markdown
---
name: my-skill
description: Does something useful
version: 1.0.0
---

# My Skill

This skill helps you [accomplish goal].

## Usage

/my-skill [action]

## Actions

### 1. Default Action

When no action specified, do this:

**Process**:
1. Check prerequisites
2. Perform main task
3. Report results

### 2. Specific Action

/my-skill specific-action

**Process**:
1. Step 1
2. Step 2

## Examples

```
/my-skill
/my-skill specific-action
/my-skill --option value
```

## Notes

- Important consideration 1
- Important consideration 2
```

### Step 4: Test the Skill

In Claude Code conversation:
```
/my-skill
```

Claude should recognize and execute your skill.

---

## Skill Design Patterns

### Pattern 1: Single-Action Skill

For simple, focused tasks:

```markdown
---
name: format
description: Format code using project standards
version: 1.0.0
---

# Format

Formats all code using project's configured formatters.

## Usage

/format [path]

## Process

1. Detect project type (PHP, JS, Python, etc.)
2. Run appropriate formatter:
   - PHP: `vendor/bin/pint`
   - JS/TS: `npm run format`
   - Python: `black .`
3. Report files changed

## Examples

```
/format                  # Format entire project
/format app/Services/    # Format specific directory
/format app/Models/User.php  # Format specific file
```
```

### Pattern 2: Multi-Action Skill

For skills with multiple related operations:

```markdown
---
name: db
description: Database management commands
version: 1.0.0
---

# Database Management

Manage database operations safely.

## Usage

/db [action] [options]

## Actions

### 1. migrate

Run pending migrations.

```
/db migrate
/db migrate --fresh      # Fresh migration (drops all tables!)
/db migrate --seed       # Run seeders after migration
```

**Process**:
1. Check for pending migrations
2. Show migration list
3. Ask for confirmation (if destructive)
4. Run migrations
5. Report results

---

### 2. seed

Run database seeders.

```
/db seed
/db seed --class=UserSeeder
```

---

### 3. backup

Create database backup.

```
/db backup
/db backup --name=before-release
```

---

### 4. restore

Restore from backup.

```
/db restore
/db restore --file=backup-2024-01-01.sql
```

## Safety Rules

- Always confirm before destructive operations
- Create backup before fresh migrations
- Never run `--fresh` in production
```

### Pattern 3: Workflow Skill

For multi-step workflows:

```markdown
---
name: release
description: Prepare and deploy a new release
version: 1.0.0
---

# Release Workflow

Complete release workflow from preparation to deployment.

## Usage

/release [version] [options]

## Workflow Steps

### Step 1: Pre-flight Checks

- All tests pass
- No uncommitted changes
- On correct branch (main/master)
- All dependencies up to date

### Step 2: Version Bump

- Update version in package.json/composer.json
- Update CHANGELOG.md
- Create git tag

### Step 3: Build

- Run production build
- Optimize assets
- Generate documentation

### Step 4: Deploy

- Push to remote
- Deploy to staging
- Run smoke tests
- Deploy to production (with confirmation)

### Step 5: Post-Deploy

- Verify deployment
- Send notifications
- Update status page

## Options

- `--dry-run`: Show what would happen without executing
- `--skip-tests`: Skip test step (not recommended)
- `--staging-only`: Deploy to staging only

## Examples

```
/release 1.2.0
/release 1.2.0 --dry-run
/release patch            # Auto-bump patch version
/release minor            # Auto-bump minor version
```
```

### Pattern 4: Integration Skill

For skills that integrate multiple tools:

```markdown
---
name: pr
description: Create pull request with full workflow
version: 1.0.0
requires: [git, gh]
---

# Pull Request Workflow

Create a pull request with all necessary steps.

## Usage

/pr [title] [options]

## Process

### 1. Pre-PR Checks

- Run linter: `vendor/bin/pint`
- Run tests: `php artisan test`
- Check for console.log/dd statements

### 2. Commit Changes

- Stage all changes
- Generate commit message from changes
- Create commit

### 3. Push Branch

- Ensure branch is pushed
- Set upstream if needed

### 4. Create PR

Using GitHub CLI:
```bash
gh pr create --title "[title]" --body "[generated body]"
```

### 5. Post-PR

- Output PR URL
- Suggest reviewers based on files changed
- Link to related issues

## Integration

- **Git**: Branch management, commits
- **GitHub CLI**: PR creation
- **Linters**: Code quality checks
- **Test Runner**: Verify tests pass

## Examples

```
/pr "Add user authentication"
/pr "Fix: resolve null pointer exception" --draft
/pr --no-tests   # Skip tests (emergency only)
```
```

---

## Advanced Features

### Parameters and Options

Skills can accept various input types:

```markdown
## Usage

/skill [required-param] [--optional-flag] [--option=value]

## Parameters

### Positional Parameters

- `[required-param]` - Description (required)
- `[optional-param]` - Description (optional, default: X)

### Flags

- `--verbose` / `-v` - Show detailed output
- `--dry-run` - Show what would happen without executing
- `--force` / `-f` - Skip confirmations

### Options with Values

- `--env=VALUE` - Target environment (staging, production)
- `--branch=NAME` - Target branch
- `--limit=N` - Limit results
```

### Conditional Logic

Skills can include conditional behavior:

```markdown
## Process

1. **Detect environment**:
   - If `docker-compose.yml` exists → Use Docker commands
   - If not → Use local commands

2. **Choose formatter based on language**:
   - PHP projects → `vendor/bin/pint`
   - Node projects → `npm run format`
   - Python projects → `black .`
   - Rust projects → `cargo fmt`

3. **Handle errors**:
   - If formatter fails → Show error, suggest fixes
   - If tests fail → Show failures, don't proceed
```

### Calling Other Tools

Skills can specify which tools to use:

```markdown
## Tool Usage

### Serena MCP Tools

Use symbolic exploration for code analysis:
```
mcp__serena__find_symbol - Find classes/methods
mcp__serena__get_symbols_overview - Get file structure
mcp__serena__read_memory - Load project context
```

### Bash Commands

Execute system commands:
```bash
docker-compose exec app php artisan migrate
npm run build
git push origin main
```

### Other Skills

Compose with other skills:
```
/format           # Run format skill first
/test             # Then run tests
/commit "message" # Finally commit
```
```

### Context Preparation

Skills can specify what context to load:

```markdown
## Context Preparation

Before executing, load:

1. **Memories** (if Serena available):
   - architecture.md - Project structure
   - codebase-conventions.md - Coding standards

2. **Constitution** (if exists):
   - .claude/settings/constitution.json

3. **Related Files**:
   - composer.json / package.json - Dependencies
   - .env.example - Environment variables
```

---

## Testing Skills

### Manual Testing

1. **Basic invocation**:
   ```
   /skill-name
   ```

2. **With parameters**:
   ```
   /skill-name action --option value
   ```

3. **Edge cases**:
   ```
   /skill-name          # No params
   /skill-name invalid  # Invalid action
   /skill-name --help   # Help request
   ```

### Testing Checklist

- [ ] Skill is recognized (not "command not found")
- [ ] Default action works
- [ ] All documented actions work
- [ ] Invalid input shows helpful error
- [ ] Help text is accurate
- [ ] Examples in documentation work
- [ ] Integrations function correctly

### Debugging

If skill doesn't work:

1. **Check file location**:
   ```bash
   ls ~/.claude/skills/skill-name/SKILL.md
   # or
   ls .claude/skills/skill-name/SKILL.md
   ```

2. **Check file name**:
   - Must be exactly `SKILL.md` (uppercase SKILL, lowercase md)

3. **Check YAML frontmatter**:
   - Valid YAML syntax
   - `name` matches directory name

4. **Check Markdown syntax**:
   - Headers are proper Markdown
   - Code blocks are fenced correctly

---

## Publishing & Sharing

### Sharing with Team

**Option 1: Include in project repo**

```bash
# Add to version control
git add .claude/skills/
git commit -m "Add custom skills"
```

**Option 2: Share as separate package**

```bash
# Create skills package
tar -czf custom-skills.tar.gz ~/.claude/skills/

# Share with team
# Team extracts to their ~/.claude/skills/
```

### Documentation for Users

Include a README with your skills:

```markdown
# Custom Skills

## Installation

1. Copy skill directories to `~/.claude/skills/`
2. Restart Claude Code

## Available Skills

| Skill | Description |
|-------|-------------|
| /deploy | Deploy to staging/production |
| /db | Database management |
| /release | Release workflow |

## Usage

See individual SKILL.md files for detailed usage.
```

### Best Practices for Shared Skills

1. **Document everything**: Assume users don't know your project
2. **Provide examples**: Real-world usage examples
3. **Handle errors gracefully**: Helpful error messages
4. **Version your skills**: Use semantic versioning
5. **Test across environments**: Different OS, setups

---

## Examples

### Example 1: Simple Deployment Skill

See `examples/example-simple-skill.md` for a complete simple skill.

### Example 2: Complex Multi-Action Skill

See `examples/example-complex-skill.md` for a complete complex skill.

---

## Troubleshooting

### "Command not found"

**Symptom**: `/skill-name` shows "command not found"

**Fixes**:
1. Check directory exists:
   ```bash
   ls ~/.claude/skills/skill-name/
   ```
2. Check file is named correctly:
   ```bash
   ls ~/.claude/skills/skill-name/SKILL.md
   ```
3. Check YAML frontmatter is valid
4. Restart Claude Code

### Skill Not Executing Correctly

**Symptom**: Skill runs but doesn't do expected actions

**Fixes**:
1. Review skill instructions for clarity
2. Add more specific steps
3. Include example output
4. Specify exact tools/commands to use

### Parameters Not Working

**Symptom**: Parameters/options not recognized

**Fixes**:
1. Document parameters clearly in Usage section
2. Show examples with parameters
3. Specify default values
4. Handle missing parameters gracefully

### Integration Failures

**Symptom**: Skill fails when calling other tools

**Fixes**:
1. Check tool availability (MCP servers running?)
2. Verify tool names are correct
3. Add fallback behavior if tool unavailable
4. Document dependencies in frontmatter

---

## Quick Reference

### Skill File Checklist

- [ ] Located in `~/.claude/skills/skill-name/SKILL.md` or `.claude/skills/skill-name/SKILL.md`
- [ ] YAML frontmatter with `name`, `description`, `version`
- [ ] Clear `## Usage` section
- [ ] Documented actions/parameters
- [ ] Examples with real commands
- [ ] Error handling instructions

### Common Patterns

| Pattern | Use For |
|---------|---------|
| Single-action | Simple, focused tasks |
| Multi-action | Related operations (CRUD) |
| Workflow | Multi-step processes |
| Integration | Combining multiple tools |

### Useful Frontmatter

```yaml
---
name: skill-name
description: Brief description
version: 1.0.0
model: claude-sonnet-4-5-20250929
author: Your Name
tags: [category1, category2]
requires: [serena, docker, gh]
---
```

---

## Next Steps

1. **Start simple**: Create a single-action skill for something you do often
2. **Iterate**: Add actions as needed
3. **Share**: Help your team with shared skills
4. **Contribute**: Share useful skills with the community

**Resources**:
- See `examples/` directory for complete working examples
- Check `~/.claude/skills/` for built-in skills as reference
- Review `../01-global-optimization/` for global skill patterns
- [Awesome Agent Skills](https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/awesome_agent_skills) — 18 open-source skills in `SKILL.md` format (code-reviewer, deep-research, sprint-planner, etc.) for structure inspiration
- [Agent Skills Specification](https://agentskills.io) — open format for packaging agent capabilities
