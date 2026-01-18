# Custom Claude Commands

Custom slash commands for Claude Code to enhance development workflows.

## Installation

Copy these files to `~/.claude/commands/` to make them available globally:

```bash
cp *.md ~/.claude/commands/
```

## Available Commands

| Command | Description | Key Features |
|---------|-------------|--------------|
| `/qa` | QA Testing Agent | Frontend/backend testing, browser automation, auto-fix |
| `/seo` | SEO Optimization | Technical/content/performance SEO audits |
| `/deploy` | Deployment Agent | Pre-deploy checks, environment validation, rollback |
| `/debug` | Debug Agent | Systematic debugging, log analysis, stack traces |
| `/refactor` | Refactoring Agent | Safe refactoring, impact analysis, incremental changes |
| `/perf` | Performance Agent | Profiling, bottleneck analysis, optimization |
| `/i18n` | Internationalization | String extraction, translation validation, locale sync |

## Usage Examples

```bash
# QA Testing
/qa frontend --browser          # Browser testing with Chrome DevTools
/qa backend --api --fix         # API testing with auto-fix

# SEO
/seo technical --fix            # Technical SEO with fixes
/seo full --report              # Complete audit with report

# Deployment
/deploy check --env production  # Pre-deploy validation
/deploy verify                  # Post-deployment health checks

# Debugging
/debug "Error message" --trace  # Deep stack trace analysis
/debug "Issue" --logs --fix     # Debug with logs and fix

# Refactoring
/refactor OrderService --type extract --preview
/refactor --safe --incremental --test

# Performance
/perf backend --profile         # Backend profiling
/perf database --fix            # Query optimization

# Internationalization
/i18n scan                      # Find hardcoded strings
/i18n validate --missing        # Check translation coverage
```

## Command Structure

Each command follows a consistent pattern:

```yaml
---
name: command-name
description: "Brief description"
category: category
complexity: basic|enhanced|meta
mcp-servers: [list, of, servers]
personas: [specialist-personas]
---

# /command - Title

## Triggers
## Context Trigger Pattern
## Behavioral Flow
## Output Format
## Examples
## Boundaries
```

## MCP Server Integration

Commands leverage these MCP servers when available:

- **chrome-devtools** - Browser automation, screenshots, console monitoring
- **serena** - Symbolic code analysis, refactoring
- **playwright** - Cross-browser E2E testing

## Customization

Feel free to modify these commands for your specific workflows:

1. Add project-specific patterns
2. Adjust default options
3. Add new scopes or actions
4. Customize output formats

## Contributing

To add a new command:

1. Create `command-name.md` following the structure above
2. Add to this README
3. Test with `/command-name --help` pattern
