---
name: skill-name
description: Brief description of what this skill does (shown in skill listings)
version: 1.0.0
---

# Skill Title

> **Instructions**: Copy this template to create a new skill. Place in `~/.claude/skills/skill-name/SKILL.md` (global) or `.claude/skills/skill-name/SKILL.md` (project). Delete this instruction block when done.

[Detailed description of what this skill does, why it's useful, and when to use it.]

---

## Usage

```
/skill-name [action] [options]
```

### Quick Examples

```bash
/skill-name                    # Default action
/skill-name action-name        # Specific action
/skill-name --option value     # With options
```

---

## Actions

### 1. Default Action (when no action specified)

[Description of what happens when skill is invoked without arguments]

**Process**:
1. [Step 1: What to check/prepare]
2. [Step 2: Main operation]
3. [Step 3: Verification/output]

**Example**:
```
/skill-name
```

**Expected Output**:
```
[What the user should see]
```

---

### 2. Action Name

[Description of this action]

**Usage**:
```
/skill-name action-name [parameters]
```

**Parameters**:
- `[param1]` - Description (required/optional)
- `[param2]` - Description (default: value)

**Process**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Example**:
```
/skill-name action-name param-value
```

---

### 3. Another Action

[Repeat the action structure as needed]

---

## Options

### Flags (Boolean)

| Flag | Short | Description |
|------|-------|-------------|
| `--verbose` | `-v` | Show detailed output |
| `--dry-run` | `-n` | Preview without executing |
| `--force` | `-f` | Skip confirmations |
| `--quiet` | `-q` | Minimal output |

### Options (With Values)

| Option | Description | Default |
|--------|-------------|---------|
| `--env=VALUE` | Target environment | `development` |
| `--path=PATH` | Target directory | Current directory |
| `--limit=N` | Limit results | `10` |

---

## Prerequisites

Before using this skill, ensure:

- [ ] [Prerequisite 1: e.g., "Serena MCP is available"]
- [ ] [Prerequisite 2: e.g., "Docker is running"]
- [ ] [Prerequisite 3: e.g., "You're in project root"]

---

## Context Preparation

> **Note**: Include this section if the skill needs specific context loaded.

This skill automatically loads:

1. **Memories** (via Serena):
   - `architecture.md` - Project structure
   - `codebase-conventions.md` - Coding standards

2. **Configuration**:
   - `.claude/settings/constitution.json` - Architectural rules

3. **Project Files**:
   - `composer.json` / `package.json` - Dependencies
   - `.env` - Environment configuration

---

## Tool Usage

> **Note**: Specify which tools this skill uses.

### MCP Tools

```
mcp__serena__find_symbol - Find code symbols
mcp__serena__read_memory - Load project context
mcp__serena__write_memory - Save learned information
```

### Shell Commands

```bash
# [Commands this skill may execute]
docker-compose exec app [command]
git [command]
npm [command]
```

### Other Skills

```
/format      # Format code before committing
/test        # Run tests to verify changes
/commit      # Create commit with message
```

---

## Integration

### With Other Skills

| Skill | Integration |
|-------|-------------|
| `/format` | [How it integrates] |
| `/test` | [How it integrates] |
| `/context` | [How it integrates] |

### With External Tools

| Tool | Usage |
|------|-------|
| Git | [How Git is used] |
| Docker | [How Docker is used] |
| [Other] | [How it's used] |

---

## Token Optimization

> **Note**: Document token usage to help users understand cost.

**Estimated token usage**:
- Default action: ~[X]K tokens
- [Action 2]: ~[X]K tokens
- [Action 3]: ~[X]K tokens

**Optimization features**:
- [e.g., "Uses symbol-first exploration (65-75% savings)"]
- [e.g., "Loads cached memories (90% savings on re-reads)"]
- [e.g., "Uses Haiku model for simple operations"]

---

## Examples

### Example 1: [Scenario Name]

**Situation**: [When you would use this]

```
/skill-name action --option value
```

**Result**: [What happens]

---

### Example 2: [Scenario Name]

**Situation**: [When you would use this]

```
/skill-name another-action
```

**Result**: [What happens]

---

### Example 3: [Complex Usage]

**Situation**: [Complex multi-step scenario]

```
/skill-name first-action
# ... some work ...
/skill-name second-action --flag
```

**Result**: [What happens]

---

## Error Handling

### Error: [Error Name]

**Symptom**: [What the user sees]

**Cause**: [Why this happens]

**Solution**: [How to fix it]

---

### Error: [Another Error]

**Symptom**: [What the user sees]

**Cause**: [Why this happens]

**Solution**: [How to fix it]

---

## Safety Considerations

> **Note**: Include if skill performs potentially dangerous operations.

### Destructive Operations

This skill may perform destructive operations:

- [e.g., "Database migrations can drop tables"]
- [e.g., "File deletion is permanent"]

**Safeguards**:
- [e.g., "Always asks for confirmation"]
- [e.g., "Creates backup before destructive operations"]
- [e.g., "Use --dry-run to preview"]

### Production Safety

- [e.g., "Never runs destructive commands against production"]
- [e.g., "Requires --force flag for production operations"]

---

## Troubleshooting

### Skill Not Found

```
Error: /skill-name not recognized
```

**Fix**:
1. Check file location: `ls ~/.claude/skills/skill-name/SKILL.md`
2. Verify file name is exactly `SKILL.md`
3. Check YAML frontmatter syntax
4. Restart Claude Code

### [Other Common Issue]

**Symptom**: [Description]

**Fix**: [Solution]

---

## Changelog

### v1.0.0 (YYYY-MM-DD)
- Initial release
- Added [feature 1]
- Added [feature 2]

---

## See Also

- [Related Skill 1](/skill-1) - [Brief description]
- [Related Skill 2](/skill-2) - [Brief description]
- [Documentation](../guide.md) - How to create skills
