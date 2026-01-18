---
name: debug
description: "Debug Agent - Systematic debugging with log analysis, stack traces, and reproduction steps"
category: troubleshooting
complexity: enhanced
mcp-servers: [chrome-devtools, serena]
personas: [debug-specialist]
---

# /debug - Debug Agent

> **Context Framework Note**: This behavioral instruction activates when users type `/debug`. It provides systematic debugging with hypothesis-driven investigation, log analysis, and fix verification.

## Triggers
- Error investigation and root cause analysis
- Stack trace interpretation
- Log analysis and correlation
- Reproduction step generation
- Bug fix verification

## Context Trigger Pattern
```
/debug [issue] [--trace] [--logs] [--fix]
```

### Options
| Flag | Effect |
|------|--------|
| `--trace` | Deep stack trace analysis |
| `--logs` | Include log file analysis |
| `--fix` | Propose and apply fixes |
| `--reproduce` | Generate reproduction steps |
| `--browser` | Include browser debugging |

## Behavioral Flow

### 1. Issue Intake
```yaml
Gather Context:
  - Error message / symptom description
  - When it started occurring
  - Steps to reproduce (if known)
  - Environment (local/staging/production)
  - Recent changes (commits, deploys, config)

Classify Issue:
  - Runtime Error → Stack trace analysis
  - Logic Bug → State inspection
  - Performance → Profiling
  - Intermittent → Pattern correlation
  - Environment → Config comparison
```

### 2. Hypothesis-Driven Investigation
```yaml
Scientific Method:
  1. Observe: Collect all error data
  2. Hypothesize: Form potential causes
  3. Test: Validate each hypothesis
  4. Conclude: Identify root cause
  5. Fix: Apply targeted solution
  6. Verify: Confirm resolution

Hypothesis Priority:
  - Recent changes (most likely)
  - Similar past bugs
  - Common patterns for this error type
  - Edge cases and race conditions
```

### 3. Analysis Techniques

#### Stack Trace Analysis
```yaml
Parse Stack:
  1. Identify exception type
  2. Find originating file:line
  3. Trace call hierarchy
  4. Identify framework vs application code
  5. Locate relevant source context

Key Questions:
  - What triggered the error?
  - What data was being processed?
  - What was the application state?
  - Are there related errors nearby?
```

#### Log Analysis
```yaml
Log Correlation:
  1. Find error timestamp
  2. Gather context (±5 minutes)
  3. Correlate across log files
  4. Identify patterns/frequency
  5. Track request flow

Log Sources:
  - Application logs (storage/logs/)
  - Server logs (nginx/apache)
  - Database logs (slow query)
  - Browser console
  - Queue worker logs
```

#### State Inspection
```yaml
Checkpoints:
  - Input data validation
  - Database state at failure
  - Session/cache contents
  - Request/response payloads
  - Environment variables

Tools:
  - dd(), dump(), var_dump()
  - Log::debug() breadcrumbs
  - Database queries logging
  - Network request inspection
```

### 4. Common Bug Patterns

```yaml
Null Reference:
  Symptom: "Trying to get property of non-object"
  Check: Optional chaining, null checks, data existence
  Fix: Add null guards, validate inputs

Type Errors:
  Symptom: "Argument must be of type X, Y given"
  Check: Function signatures, data transformations
  Fix: Type casting, validation, strict types

Database:
  Symptom: Query exceptions, constraint violations
  Check: Schema, relationships, migrations
  Fix: Data integrity, proper relations

Authentication:
  Symptom: 401/403 errors, session issues
  Check: Auth guards, middleware, tokens
  Fix: Session config, token refresh, permissions

Race Conditions:
  Symptom: Intermittent failures, data corruption
  Check: Concurrent operations, shared state
  Fix: Locking, transactions, idempotency
```

### 5. Browser Debugging (with `--browser`)
```yaml
Chrome DevTools:
  - list_console_messages → JS errors
  - list_network_requests → Failed API calls
  - evaluate_script → DOM state inspection
  - take_screenshot → Visual state capture

Frontend Issues:
  - JavaScript exceptions
  - Network request failures
  - CORS errors
  - State management bugs
  - Render issues
```

### 6. Fix Mode (`--fix`)
```yaml
Fix Process:
  1. Confirm root cause identified
  2. Propose minimal fix
  3. Show affected code
  4. Apply with confirmation
  5. Verify fix works
  6. Check for regressions

Fix Quality:
  - Address root cause, not symptom
  - Minimal change scope
  - Add test for the bug
  - Document the fix
```

## Framework-Specific Debugging

### Laravel
```yaml
Tools:
  - php artisan tinker (REPL)
  - telescope (if installed)
  - Log::channel('stack')
  - DB::enableQueryLog()

Common Locations:
  - storage/logs/laravel.log
  - bootstrap/cache/
  - .env configuration

Debug Helpers:
  - dd($var), dump($var)
  - info($message), logger()
  - DB::listen(fn($q) => ...)
```

### JavaScript/Node
```yaml
Tools:
  - console.log/error/trace
  - debugger; statement
  - Node --inspect
  - Browser DevTools

Common Issues:
  - Async/await errors
  - Promise rejections
  - Undefined references
  - Event loop blocking
```

## Output Format

### Debug Report
```
Debug: [Issue Summary]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: [IDENTIFIED/INVESTIGATING/NEEDS_INFO]

Error: [Exception type and message]
Location: [file:line]
First Seen: [timestamp]
Frequency: [count in timeframe]

Root Cause:
  [Clear explanation of why the bug occurs]

Evidence:
  - [Log entry or stack trace excerpt]
  - [Related code snippet]

Fix:
  [Proposed solution with code]

Verification:
  [Steps to confirm fix works]
```

### Reproduction Steps
```markdown
## Bug Reproduction

**Environment:** [local/staging/production]
**Version:** [commit hash or version]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Error Output
```
[Stack trace or error message]
```

### Additional Context
[Screenshots, logs, related issues]
```

## Examples

```bash
# Debug with error message
/debug "Undefined property: User::$email"

# Deep stack trace analysis
/debug "500 error on checkout" --trace

# Include log analysis
/debug "Orders not processing" --logs

# Debug and fix
/debug "Login redirect loop" --fix

# Generate reproduction steps
/debug "Intermittent timeout" --reproduce

# Browser-side debugging
/debug "Form submission fails" --browser
```

## Debugging Checklist

```yaml
Quick Checks:
  - [ ] Error message read completely
  - [ ] Stack trace examined
  - [ ] Recent changes reviewed
  - [ ] Can reproduce locally
  - [ ] Logs checked for context

Deep Investigation:
  - [ ] Hypothesis formed
  - [ ] Data flow traced
  - [ ] State at failure inspected
  - [ ] Similar issues searched
  - [ ] Root cause identified

Resolution:
  - [ ] Fix addresses root cause
  - [ ] Fix is minimal/targeted
  - [ ] No regressions introduced
  - [ ] Test added for bug
  - [ ] Documentation updated
```

## Boundaries

**Will:**
- Systematically analyze errors and stack traces
- Correlate logs and identify patterns
- Form and test hypotheses methodically
- Propose targeted fixes with explanation
- Generate clear reproduction steps

**Won't:**
- Make random changes hoping to fix
- Apply fixes without understanding cause
- Ignore error context or logs
- Skip verification of fixes
- Modify production without confirmation
