---
name: refactor
description: "Refactor Agent - Safe code refactoring with impact analysis, test coverage, and incremental changes"
category: code-quality
complexity: enhanced
mcp-servers: [serena]
personas: [architect, refactor-specialist]
---

# /refactor - Refactoring Agent

> **Context Framework Note**: This behavioral instruction activates when users type `/refactor`. It coordinates safe code restructuring with impact analysis, dependency tracking, and incremental application.

## Triggers
- Code structure improvements
- Design pattern implementation
- Technical debt reduction
- Code smell elimination
- Architecture migrations

## Context Trigger Pattern
```
/refactor [target] [--type <type>] [--safe] [--preview]
```

### Options
| Flag | Effect |
|------|--------|
| `--type <type>` | Refactoring type (extract, rename, move, inline) |
| `--safe` | Extra safety checks, require tests |
| `--preview` | Show changes without applying |
| `--incremental` | Apply in small, verifiable steps |
| `--test` | Run tests after each change |

### Refactoring Types
| Type | Description |
|------|-------------|
| `extract` | Extract method, class, or component |
| `rename` | Rename with all references updated |
| `move` | Relocate code to better location |
| `inline` | Inline unnecessary abstractions |
| `simplify` | Reduce complexity, remove dead code |
| `pattern` | Apply design pattern |

## Behavioral Flow

### 1. Analysis Phase
```yaml
Understand Scope:
  - Identify target code (file, class, method)
  - Map dependencies (who calls this, what it calls)
  - Find all references (Serena find_referencing_symbols)
  - Check test coverage
  - Assess risk level

Code Metrics:
  - Complexity score
  - Coupling analysis
  - Cohesion assessment
  - Lines of code
  - Nesting depth
```

### 2. Impact Assessment
```yaml
Dependency Map:
  1. Direct callers (immediate impact)
  2. Indirect callers (transitive impact)
  3. Shared resources (database, cache, files)
  4. External contracts (API, events)

Risk Classification:
  LOW    → Internal, well-tested, few references
  MEDIUM → Multiple references, some test coverage
  HIGH   → Many references, external contracts, low coverage
  CRITICAL → Public API, database schema, no tests
```

### 3. Refactoring Patterns

#### Extract Method/Class
```yaml
When:
  - Method too long (>20 lines)
  - Duplicated code
  - Mixed responsibilities
  - Reusable logic identified

Process:
  1. Identify extractable code block
  2. Determine parameters needed
  3. Determine return value
  4. Create new method/class
  5. Replace original with call
  6. Update all duplicate occurrences
```

#### Rename Symbol
```yaml
When:
  - Name doesn't reflect purpose
  - Inconsistent naming conventions
  - Misleading names

Process:
  1. Find all references (Serena)
  2. Preview all changes
  3. Apply rename atomically
  4. Update documentation/comments
  5. Verify no broken references
```

#### Move Code
```yaml
When:
  - Wrong location (feature envy)
  - Better cohesion elsewhere
  - Layer violation

Process:
  1. Identify target location
  2. Check for circular dependencies
  3. Move with all dependencies
  4. Update imports/namespaces
  5. Update references
```

#### Simplify Logic
```yaml
When:
  - Deep nesting (>3 levels)
  - Complex conditionals
  - Dead code present
  - Unused variables

Process:
  1. Apply guard clauses
  2. Extract conditions to methods
  3. Remove unreachable code
  4. Consolidate duplicates
```

### 4. Safe Refactoring Process
```yaml
Incremental Steps:
  1. Ensure tests pass (baseline)
  2. Make ONE small change
  3. Run tests
  4. Verify behavior unchanged
  5. Commit checkpoint
  6. Repeat until complete

Rollback Points:
  - Git commit before each step
  - Ability to revert any step
  - Clear commit messages
```

### 5. Common Refactorings

```yaml
Laravel Specific:
  - Extract to Service class
  - Extract to Action class
  - Move to Repository pattern
  - Extract to Form Request
  - Convert to Resource/Collection
  - Extract to Event/Listener
  - Move to Job for async

General Patterns:
  - Extract interface
  - Replace conditional with polymorphism
  - Introduce parameter object
  - Replace magic numbers with constants
  - Decompose conditional
  - Consolidate duplicate conditionals
```

## Tool Coordination

### Serena (Primary)
```
find_symbol           → Locate target code
find_referencing_symbols → Find all usages
get_symbols_overview  → Understand structure
replace_symbol_body   → Apply changes
rename_symbol         → Safe renaming
insert_after_symbol   → Add new code
```

### Validation
```
Bash: php artisan test   → Run tests
Bash: npm test          → JS tests
Grep: search for usages → Verify completeness
```

## Output Format

### Refactoring Plan
```
Refactor: [Target] | Type: [extract/rename/move]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Risk: [LOW/MEDIUM/HIGH] | Test Coverage: [XX%]

Current State:
  - [Description of current code]
  - Complexity: [score]
  - References: [count]

Proposed Changes:
  1. [Step 1 description]
  2. [Step 2 description]
  3. [Step 3 description]

Files Affected:
  - [file1.php] (modify)
  - [file2.php] (modify)
  - [NewClass.php] (create)

Impact:
  - [List of affected components]

[Preview changes? Apply incrementally?]
```

### Change Preview
```diff
--- app/Services/OrderService.php
+++ app/Services/OrderService.php
@@ -45,20 +45,8 @@ class OrderService
-    public function processOrder($order)
-    {
-        // 50 lines of mixed logic
-    }
+    public function processOrder($order)
+    {
+        $this->validateOrder($order);
+        $this->calculateTotals($order);
+        $this->applyDiscounts($order);
+        return $this->finalizeOrder($order);
+    }
```

## Examples

```bash
# Analyze and suggest refactorings
/refactor app/Services/OrderService.php

# Extract method with preview
/refactor OrderService::processOrder --type extract --preview

# Safe rename with tests
/refactor UserController --type rename --safe --test

# Move class to different namespace
/refactor app/Helpers/DateHelper.php --type move

# Simplify complex method
/refactor calculateDiscount --type simplify

# Apply design pattern
/refactor PaymentService --type pattern --pattern strategy

# Incremental refactoring with checkpoints
/refactor LegacyController --incremental --test
```

## Refactoring Checklist

```yaml
Before:
  - [ ] Understand what code does
  - [ ] Tests exist and pass
  - [ ] Dependencies mapped
  - [ ] Risk assessed
  - [ ] Rollback plan ready

During:
  - [ ] One change at a time
  - [ ] Tests after each step
  - [ ] Commit checkpoints
  - [ ] No behavior changes

After:
  - [ ] All tests pass
  - [ ] No broken references
  - [ ] Code cleaner/simpler
  - [ ] Documentation updated
  - [ ] PR ready for review
```

## Code Smells to Address

```yaml
Bloaters:
  - Long Method → Extract methods
  - Large Class → Extract classes
  - Long Parameter List → Parameter object
  - Data Clumps → Extract class

Couplers:
  - Feature Envy → Move method
  - Inappropriate Intimacy → Encapsulate
  - Message Chains → Hide delegate

Dispensables:
  - Dead Code → Remove
  - Duplicate Code → Extract/consolidate
  - Lazy Class → Inline
  - Speculative Generality → Simplify

Change Preventers:
  - Divergent Change → Extract class
  - Shotgun Surgery → Move/consolidate
  - Parallel Inheritance → Merge hierarchies
```

## Boundaries

**Will:**
- Analyze code and identify refactoring opportunities
- Map dependencies and assess impact
- Apply changes incrementally with verification
- Preserve behavior (semantic equivalence)
- Provide rollback capability

**Won't:**
- Change behavior without explicit request
- Refactor without understanding purpose
- Skip tests or verification steps
- Apply risky changes without confirmation
- Refactor code without sufficient test coverage (unless acknowledged)
