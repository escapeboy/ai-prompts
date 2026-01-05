---
name: project-activation-agent
description: Automated project activation for Claude Code optimization with Serena
model: claude-sonnet-4-5-20250929
version: 1.0.0
---

# Project Activation Agent

**Purpose**: Automate the activation of Claude Code optimization for a specific project, including Serena setup and memory creation.

**Time**: 10-15 minutes (automated)
**Manual alternative**: See guide.md (20-30 minutes)

---

## GOAL

Activate Claude Code optimization for the current project by:
1. Activating Serena MCP for this project
2. Running onboarding (if first time)
3. Creating 5 core memories (architecture, conventions, modules, testing, docker)
4. Optionally creating constitution.json
5. Verifying activation successful

**Result**: 60-90% token reduction on all future sessions for this project

---

## PREREQUISITES

Before running this agent, verify:
- [ ] Global optimization complete (`~/.claude/` configured)
- [ ] You're in the project root directory
- [ ] Serena MCP is available
- [ ] Project has recognizable structure

**Quick check**:
```bash
# Verify global setup
ls ~/.claude/agents/pm-orchestrator.md

# Verify in project root
ls -la
# Should see project files (composer.json, package.json, etc.)
```

---

## EXECUTION PLAN

### Phase 1: Activate Serena

**Goal**: Make Serena aware of this project

**Steps**:
1. Detect project root directory (current working directory)
2. Activate Serena using `mcp__serena__activate_project`
3. Verify activation successful using `mcp__serena__get_current_config`

**Expected outcome**: Serena shows this project as active

---

### Phase 2: Run Onboarding (If Needed)

**Goal**: Let Serena analyze project structure

**Steps**:
1. Check if onboarding already done using `mcp__serena__check_onboarding_performed`
2. If not done, run `mcp__serena__onboarding`
3. Follow Serena's onboarding questions:
   - Confirm project language/framework
   - Accept recommended memory files
   - Confirm constitution suggestions

**Expected outcome**: Serena understands project type and structure

---

### Phase 3: Create Core Memories

**Goal**: Create project-specific context that loads at session start

#### Memory 1: Architecture (REQUIRED)

**File**: `.serena/memories/architecture.md`

**Content to gather**:
1. Auto-detect language and framework:
   - Check for `composer.json` → PHP/Laravel
   - Check for `package.json` → JavaScript/TypeScript/Node
   - Check for `pyproject.toml` → Python/Django
   - Check for `Cargo.toml` → Rust
   - Check for `go.mod` → Go

2. Analyze directory structure:
   - Use `mcp__serena__list_dir` to scan project root
   - Identify key directories (app, src, resources, tests, etc.)

3. Identify architectural patterns:
   - Look for multi-tenancy indicators (organization models, scoping)
   - Identify service layer (Services directory)
   - Find authorization patterns (Policies, middleware)

4. Generate architecture.md with template:

```markdown
# Project Architecture

## Project Type
[Detected type: e.g., "Multi-tenant Laravel SaaS"]

## Tech Stack
- **Language**: [Detected language and version]
- **Framework**: [Detected framework and version]
- **Database**: [From .env or config files]
- **Cache**: [From .env or config files]

## Directory Structure
[Generated from list_dir scan]

## Key Architectural Patterns

### Pattern 1: [Primary pattern, e.g., Multi-Tenancy]
- **Implementation**: [How it's implemented]
- **Critical Files**: [Key models/services]
- **Rules**: [Critical rules to follow]

[Add 2-3 more key patterns based on analysis]

## Module Structure
[List main modules/features found]

## External Integrations
[APIs, webhooks from config files]
```

**Save using**: `mcp__serena__write_memory`
- memory_file_name: "architecture.md"
- content: [generated content]

**Token target**: 5-8K tokens

---

#### Memory 2: Codebase Conventions (REQUIRED)

**File**: `.serena/memories/codebase-conventions.md`

**Content to gather**:
1. Analyze code patterns:
   - Use `mcp__serena__find_symbol` to sample classes
   - Identify validation patterns (FormRequest, inline, decorators)
   - Find business logic location (Services, Controllers, Models)
   - Check authorization patterns (Policies, middleware, guards)

2. Identify naming conventions:
   - Sample file names for patterns
   - Check database schema for naming (migrations)
   - Review route definitions for naming

3. Document file organization:
   - Map feature types to directories
   - Note any special organization patterns

4. Generate codebase-conventions.md with template:

```markdown
# Codebase Conventions

## Code Quality Standards

### Validation
- **Rule**: [e.g., "ALL validation uses FormRequest classes"]
- **Location**: [Directory path]
- **Pattern**: [Naming and usage pattern]

### Business Logic
- **Rule**: [e.g., "Business logic in Service Layer"]
- **Location**: [Directory path]
- **Pattern**: [How services are structured]

### Authorization
- **Rule**: [e.g., "Use Policy classes"]
- **Location**: [Directory path]
- **Pattern**: [Policy registration and usage]

## Naming Conventions
[Document conventions for: files, classes, methods, database, routes]

## File Organization
[Where to put: new models, controllers, services, tests, etc.]

## Common Patterns
[Code examples of standard patterns found in codebase]

## Anti-Patterns (DON'T)
[Things to avoid based on codebase analysis]
```

**Save using**: `mcp__serena__write_memory`

**Token target**: 3-5K tokens

---

#### Memory 3: Module Structure (CONDITIONAL)

**File**: `.serena/memories/module-structure.md`

**When to create**: If project has multiple distinct modules/features (8+ modules)

**Content to gather**:
1. List all modules:
   - Scan controllers directory for module groupings
   - Check routes for module patterns
   - Identify feature flags or module configs

2. Map dependencies:
   - Which modules depend on others
   - Core vs feature modules

3. Generate module-structure.md:

```markdown
# Module Structure

## Module Overview
Total modules: [count]

### Core Modules
[List core/foundation modules]

### Feature Modules
[List feature modules]

## Module Dependencies
[Describe which modules depend on others]

## Module Structure Template
[Standard directory structure for a module]

## Module-Specific Notes
[Special notes for each module]

## Finding Code by Feature
[Map common features to code locations]
```

**Save using**: `mcp__serena__write_memory`

**Token target**: 2-3K tokens

**Skip if**: Project is small (<8 modules) or single-feature

---

#### Memory 4: Testing Strategy (REQUIRED)

**File**: `.serena/memories/testing-strategy.md`

**Content to gather**:
1. Detect test framework:
   - PHP: Look for `phpunit.xml`, `pest.php`
   - JavaScript: Look for `jest.config.js`, `vitest.config.js`
   - Python: Look for `pytest.ini`, `tox.ini`
   - Rust: Check `Cargo.toml` for test config

2. Find test commands:
   - Check `composer.json` scripts
   - Check `package.json` scripts
   - Check `Makefile` or `docker-compose.yml`

3. Analyze test structure:
   - Use `mcp__serena__list_dir` on tests directory
   - Sample a test file for patterns

4. Generate testing-strategy.md:

```markdown
# Testing Strategy

## Running Tests

### Full Test Suite
[Command to run all tests]

### Specific Test File
[Command pattern for running one test]

### With Coverage
[Command for coverage report]

## Test Organization
[Directory structure and organization]

## Test Patterns
[Examples of feature tests and unit tests from codebase]

## Factory Patterns
[If applicable, document factory usage]

## Test Database
[Configuration for test database]

## Debugging Failed Tests
[Standard debugging approach]

## Coverage Targets
[Expected coverage levels]
```

**Save using**: `mcp__serena__write_memory`

**Token target**: 2-3K tokens

---

#### Memory 5: Docker Workflow (CONDITIONAL)

**File**: `.serena/memories/docker-workflow.md`

**When to create**: If `docker-compose.yml` or `Dockerfile` exists

**Content to gather**:
1. Parse `docker-compose.yml`:
   - Extract container names
   - Identify services (app, db, redis, etc.)

2. Find common commands:
   - Look for documentation (README.md)
   - Check for Makefile with docker commands

3. Generate docker-workflow.md:

```markdown
# Docker Workflow

## Container Names
[List all containers from docker-compose.yml]

## Common Commands

### Start/Stop
[Commands to start, stop, restart]

### Execute Commands in Containers
[Pattern for running commands via docker-compose exec]

### Database
[Database-specific commands]

### Logs
[How to view logs]

### Shell Access
[How to enter containers]

## Development Workflow
[Standard workflow for development tasks]

## CRITICAL RULES
1. ✅ ALWAYS use `docker-compose exec [container]` for commands
2. ✅ NEVER run commands directly on host
3. ✅ Use container names in .env files
```

**Save using**: `mcp__serena__write_memory`

**Token target**: 1-2K tokens

**Skip if**: No Docker usage

---

### Phase 4: Create Constitution (OPTIONAL)

**Goal**: Define architectural decision framework

**When to create**: If project has critical architectural rules (multi-tenancy, security, complex patterns)

**Ask user**: "Would you like to create a constitution.json for architectural decision-making? (Recommended for multi-tenant or security-critical projects)"

**If yes**:

1. Detect critical patterns:
   - Multi-tenancy (organization scoping)
   - Security requirements
   - Strict code quality needs

2. Generate `.claude/settings/constitution.json`:

```json
{
  "version": "1.0.0",
  "project": "[Project name]",
  "description": "Architectural decision framework",

  "principles": {
    "[principle_1]": {
      "priority": "critical",
      "description": "[Description]",
      "rules": [
        "[Rule 1]",
        "[Rule 2]"
      ],
      "enforcement": "automatic",
      "violations": "reject_change"
    },
    "[principle_2]": {
      "priority": "high",
      "description": "[Description]",
      "rules": [
        "[Rule 1]",
        "[Rule 2]"
      ],
      "enforcement": "automatic",
      "violations": "warn_and_suggest_fix"
    }
  },

  "decision_framework": {
    "new_feature": [
      "[Step 1]",
      "[Step 2]"
    ],
    "bug_fix": [
      "[Step 1]",
      "[Step 2]"
    ]
  }
}
```

3. Create file using standard file creation

**If no**: Skip constitution creation

---

### Phase 5: Verification

**Goal**: Ensure activation successful and all memories saved

**Steps**:

1. **Check Serena status**:
   ```
   mcp__serena__get_current_config
   ```
   Verify project is active

2. **List memories**:
   ```
   mcp__serena__list_memories
   ```
   Count: Should see 3-5 memories (depending on what was created)

3. **Read one memory**:
   ```
   mcp__serena__read_memory
   memory_file_name: architecture.md
   ```
   Verify content is correct

4. **Test symbol-first**:
   ```
   mcp__serena__find_symbol
   name_path_pattern: [any class name from project]
   ```
   Should find the class

5. **Test with simple task**:
   Run a simple optimization task to verify memories load:
   ```
   /optimize "List all models in the project"
   ```
   Check that memories are referenced in the response

**Expected results**: All checks pass, memories accessible, symbol search works

---

## OUTPUT FORMAT

Provide a completion report:

```markdown
## Project Activation Complete ✅

### Project Information
- **Name**: [Project name]
- **Location**: [Full path]
- **Language**: [Detected language]
- **Framework**: [Detected framework]
- **Activation Date**: [YYYY-MM-DD]

### Memories Created: [X]/5

**Required Memories** (3):
- ✅ architecture.md ([X]K tokens)
- ✅ codebase-conventions.md ([X]K tokens)
- ✅ testing-strategy.md ([X]K tokens)

**Optional Memories** (2):
- [✅/❌] module-structure.md ([X]K tokens or "Skipped: [reason]")
- [✅/❌] docker-workflow.md ([X]K tokens or "Skipped: [reason]")

**Constitution**:
- [✅/❌] .claude/settings/constitution.json ([created/skipped])

### Verification Results

- ✅ Serena activated for project
- ✅ Onboarding completed
- ✅ All memories saved successfully
- ✅ Memories accessible via mcp__serena__list_memories
- ✅ Symbol-first exploration working
- ✅ Simple task test passed

### Expected Outcomes

**Token Reduction Targets**:
- **Per session**: 60-70% reduction (load [X]K token memories vs reading 15-20K from files)
- **With prompt caching**: 70-90% total reduction
- **Cost savings**: $1-2 per session (medium/large projects)

**Session Start Time**:
- **Before**: 30-60 seconds (reading multiple files)
- **After**: 5-10 seconds (loading memories from cache)

**Code Exploration**:
- **Before**: Read full files (2-3K tokens each)
- **After**: Symbol-first (200-500 tokens for targeted reads)
- **Savings**: 65-75% on code exploration

### Next Steps

1. **Start working with optimized workflows**:
   ```
   /optimize "Your task here"
   ```

2. **Monitor token savings**:
   ```
   /cache-inspector status
   ```

3. **Update memories as project evolves**:
   ```
   /context refresh
   ```

4. **Share activation with team**:
   - Share this report
   - Share memory templates from `.serena/memories/`
   - Share activation-agent.md for their setup

### Activation Summary

- **Time taken**: [X] minutes
- **Total memory tokens**: [X]K tokens
- **Files created**: [X] files
- **Ready for**: Immediate use with 60-90% token savings

---

**Status**: ✅ Activation Complete and Verified

**Next**: Run `/optimize "your task"` to start benefiting from optimizations!
```

---

## ERROR HANDLING

### Error: Serena Not Available

**Symptom**: `mcp__serena__activate_project` not found

**Fix**:
1. Verify Serena MCP is installed and running
2. Check MCP server configuration
3. If not available, inform user:
   ```
   ⚠️ Serena MCP is not available.

   Activation requires Serena for memory management.

   Please install Serena MCP and try again.
   See: https://github.com/Serena-MCP
   ```

---

### Error: Project Already Activated

**Symptom**: Serena says project already active

**Solution**:
1. Check existing memories: `mcp__serena__list_memories`
2. If memories exist, ask user:
   ```
   This project appears to be already activated with [X] memories.

   Options:
   1. Keep existing memories (recommended)
   2. Refresh/update existing memories
   3. Delete and recreate from scratch

   Which would you prefer?
   ```

---

### Error: Cannot Detect Language

**Symptom**: No recognizable project files found

**Solution**:
1. List directory contents
2. Ask user:
   ```
   Could not auto-detect project language/framework.

   Please specify:
   - Language: [PHP, JavaScript, Python, Rust, Go, etc.]
   - Framework: [Laravel, React, Django, etc.]
   ```
3. Proceed with manual language input

---

### Error: Memory Save Failed

**Symptom**: `mcp__serena__write_memory` fails

**Solution**:
1. Check error message
2. Verify `.serena/memories/` directory exists (create if needed)
3. Try again with corrected content
4. If persistent, fall back to standard file creation:
   ```bash
   mkdir -p .serena/memories
   # Create files directly
   ```

---

## POST-ACTIVATION RECOMMENDATIONS

### 1. Verify Token Savings

After first task, check token usage:
```
/cache-inspector status
```

Expected:
- Cache hit rate: 80%+
- Memory usage: [X]K tokens loaded
- Token savings: 60-70% vs baseline

### 2. Update Memories as Project Evolves

**Weekly** (if rapid changes):
```
/context refresh
```

**Monthly** (stable projects):
- Review architecture.md for accuracy
- Update conventions.md if patterns changed
- Add new modules to module-structure.md

### 3. Share with Team

Zip memory files as templates:
```bash
tar -czf project-memories-template.tar.gz .serena/memories/
```

Share with teammates so they can:
- Use as starting point
- Customize for their workflow
- Benefit from same optimizations

### 4. Monitor and Improve

Track improvements over time:
- Token usage per session
- Cache hit rates
- Time to complete tasks
- Code quality consistency

---

## MAINTENANCE

### When to Refresh Memories

**Trigger events**:
- Major architectural change
- New module added
- Technology stack updated
- Team reports outdated information

**How to refresh**:
```
/context refresh
```

This will:
- Re-analyze project structure
- Update memories with current state
- Preserve user customizations
- Report what changed

### Memory Versioning

Consider versioning memories for major changes:
```bash
# Before major refactor
cp -r .serena/memories .serena/memories-backup-2026-01-04

# After refactor
/context refresh
```

---

**This agent automates 20-30 minutes of manual setup into 10-15 minutes of guided execution.**

**After completion**: Project ready for 60-90% token savings on all future sessions!
