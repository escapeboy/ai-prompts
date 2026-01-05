# Checkpoint System Guide

**Save and resume complex workflows**

This guide explains how to implement checkpoints for long-running or complex tasks, allowing you to save progress and resume without losing context or wasting tokens.

---

## Why Checkpoints?

### The Problem

Long tasks face challenges:
- Context window limits
- Session interruptions (timeouts, disconnects)
- Need to pause and resume later
- Re-reading entire context on resume is expensive

### The Solution

Checkpoints capture:
- Current progress state
- Completed steps
- Pending steps
- Key decisions made
- Relevant context

**Token savings**: Resume from 2-3K token checkpoint vs 15-20K full context = **80-90% savings**

---

## Checkpoint Types

### 1. Progress Checkpoints

Track what's been done and what remains.

```json
{
  "checkpoint_type": "progress",
  "created_at": "2026-01-04T14:30:00Z",
  "task": "Implement user authentication module",
  "phase": "implementation",
  "completed": [
    "Create User model",
    "Create AuthController",
    "Add login route"
  ],
  "pending": [
    "Add logout route",
    "Create password reset",
    "Write tests"
  ],
  "current_step": "Add logout route",
  "progress_percentage": 50
}
```

### 2. Decision Checkpoints

Capture decisions that shouldn't be re-evaluated.

```json
{
  "checkpoint_type": "decisions",
  "created_at": "2026-01-04T14:30:00Z",
  "decisions": [
    {
      "topic": "Authentication method",
      "decision": "JWT tokens with refresh tokens",
      "rationale": "Stateless, scalable, matches existing API patterns",
      "alternatives_considered": ["Session-based", "OAuth only"]
    },
    {
      "topic": "Token storage",
      "decision": "HTTP-only cookies",
      "rationale": "XSS protection, automatic sending"
    }
  ]
}
```

### 3. Context Checkpoints

Store essential context for resumption.

```json
{
  "checkpoint_type": "context",
  "created_at": "2026-01-04T14:30:00Z",
  "key_files": [
    "app/Models/User.php",
    "app/Http/Controllers/AuthController.php"
  ],
  "key_decisions": "JWT with refresh tokens, HTTP-only cookies",
  "current_state": "Login working, logout pending",
  "blockers": [],
  "notes": "User requested RBAC support in next phase"
}
```

### 4. Workflow Checkpoints (Comprehensive)

Full checkpoint for complex workflows like spec-driven development.

```json
{
  "checkpoint_type": "workflow",
  "created_at": "2026-01-04T14:30:00Z",
  "workflow": "spec-driven-development",
  "feature": "User Authentication",

  "phases": {
    "requirements": {
      "status": "completed",
      "document": ".claude/specs/auth/requirements.md",
      "approved": true
    },
    "design": {
      "status": "completed",
      "document": ".claude/specs/auth/design.md",
      "approved": true
    },
    "tasks": {
      "status": "completed",
      "document": ".claude/specs/auth/tasks.md",
      "total_tasks": 12,
      "completed_tasks": 7
    },
    "implementation": {
      "status": "in_progress",
      "current_task": "Task 8: Add logout endpoint"
    },
    "testing": {
      "status": "pending"
    }
  },

  "key_decisions": [
    "JWT authentication",
    "HTTP-only cookies for tokens"
  ],

  "blockers": [],

  "next_action": "Implement logout endpoint in AuthController"
}
```

---

## Creating Checkpoints

### Automatic Checkpoints

Create checkpoints at natural break points:

1. **Phase completion** - After requirements, design, each major step
2. **Significant decision** - After architectural decisions
3. **Before complex operation** - Before risky changes
4. **Time-based** - Every 30 minutes of complex work

### Manual Checkpoints

Trigger manually when:
- Need to pause work
- Context getting long
- About to try risky approach
- Handing off to teammate

### Checkpoint Creation Template

```markdown
## Creating Checkpoint

**What to capture**:
1. Current phase and step
2. Completed items with outcomes
3. Pending items
4. Key decisions made
5. Relevant context (minimal)
6. Next action to take

**Save to**: `.claude/specs/{feature}/checkpoints/{timestamp}-{phase}.json`
```

---

## Resuming from Checkpoints

### Resume Workflow

```markdown
## Resuming from Checkpoint

### Step 1: Load Checkpoint
Read: `.claude/specs/{feature}/checkpoints/latest.json`

### Step 2: Verify State
- Check referenced files still exist
- Verify no conflicting changes
- Confirm checkpoint is still valid

### Step 3: Restore Context
Load minimal context needed:
- Key decisions (don't re-evaluate)
- Current step requirements
- Relevant file sections (symbol-first)

### Step 4: Continue Work
Resume from `next_action` in checkpoint
```

### Resume Template

When resuming, start with:

```markdown
## Resuming Work

**Checkpoint**: [checkpoint file]
**Created**: [timestamp]
**Progress**: [X]% complete

### Completed
[List from checkpoint]

### Current Step
[From checkpoint.next_action]

### Context Loaded
[What was loaded from checkpoint]

### Proceeding with
[Next action]
```

---

## Checkpoint Storage

### File Organization

```
.claude/specs/{feature}/
├── requirements.md
├── design.md
├── tasks.md
└── checkpoints/
    ├── latest.json           # Symlink or copy of most recent
    ├── 20260104-143000-requirements.json
    ├── 20260104-150000-design.json
    └── 20260104-160000-implementation.json
```

### Naming Convention

```
{YYYYMMDD}-{HHMMSS}-{phase}.json
```

Examples:
- `20260104-143000-requirements.json`
- `20260104-150000-design.json`
- `20260104-160000-implementation-task8.json`

### Storage Best Practices

1. **Keep checkpoints small** - Only essential information
2. **Reference files, don't duplicate** - Store paths, not content
3. **Version checkpoints** - Don't overwrite, create new
4. **Clean up old checkpoints** - Keep last 5-10 per feature
5. **Use `latest` pointer** - Easy access to most recent

---

## Token Optimization

### Without Checkpoints

Resume requires re-reading:
- Spec documents: 10-15K tokens
- Conversation context: 5-10K tokens
- File exploration: 5-10K tokens
- **Total**: 20-35K tokens

### With Checkpoints

Resume requires:
- Checkpoint file: 1-2K tokens
- Minimal context: 1-3K tokens
- **Total**: 2-5K tokens

**Savings**: 80-90%

### Optimization Tips

1. **Capture decisions, not reasoning** - "JWT auth" not "we discussed JWT vs sessions..."
2. **Reference, don't include** - File paths, not file contents
3. **Progressive disclosure** - Load more context only if needed
4. **Prune completed items** - Full history not needed

---

## Integration with Skills

### Checkpoint Skill Commands

```bash
# Save current progress
/checkpoint save

# List available checkpoints
/checkpoint list

# Resume from latest
/checkpoint resume

# Resume from specific checkpoint
/checkpoint resume 20260104-143000-design
```

### Automatic Checkpoint Integration

Configure PM Orchestrator to:
1. Create checkpoint after each phase
2. Create checkpoint before risky operations
3. Prompt for checkpoint on session end
4. Load checkpoint on session start

---

## Example Workflows

### Example 1: Simple Bug Fix

**Start**:
```json
{
  "checkpoint_type": "progress",
  "task": "Fix login redirect bug",
  "status": "started",
  "identified_issue": "RedirectIfAuthenticated middleware not checking API routes"
}
```

**Resume** (if interrupted):
- Load 500 token checkpoint
- Continue directly to fix

---

### Example 2: Feature Implementation

**Checkpoint after design**:
```json
{
  "checkpoint_type": "workflow",
  "feature": "User Profiles",
  "phases": {
    "requirements": { "status": "completed", "approved": true },
    "design": { "status": "completed", "approved": true },
    "tasks": { "status": "completed", "total": 8 },
    "implementation": { "status": "pending" }
  },
  "key_decisions": [
    "Profile photos stored in S3",
    "Settings in JSON column",
    "Privacy controls per-field"
  ],
  "next_action": "Start Task 1: Create Profile model"
}
```

**Resume**:
- Load 2K token checkpoint
- Know all decisions made
- Start directly on Task 1

---

### Example 3: Complex Refactoring

**Checkpoint mid-refactoring**:
```json
{
  "checkpoint_type": "progress",
  "task": "Refactor payment processing",
  "total_files": 15,
  "completed_files": [
    "PaymentService.php",
    "StripeGateway.php",
    "PaypalGateway.php"
  ],
  "pending_files": [
    "InvoiceService.php",
    "SubscriptionService.php"
  ],
  "pattern_applied": "Extract gateway interface, implement per provider",
  "notes": "Invoice and Subscription need gateway injection"
}
```

**Resume**:
- Know pattern to apply
- Know which files done
- Continue with InvoiceService.php

---

## Error Recovery

### Checkpoint Corrupted

```markdown
If checkpoint is corrupted or invalid:

1. **Find previous checkpoint**
   List checkpoints, use second-most-recent

2. **Reconstruct from artifacts**
   - Check completed files
   - Check git history
   - Check spec documents

3. **Create recovery checkpoint**
   Capture current known state manually
```

### State Mismatch

```markdown
If codebase doesn't match checkpoint:

1. **Identify changes**
   Compare checkpoint references with actual files

2. **Determine if valid**
   - If intentional changes: Update checkpoint
   - If accidental: Revert or integrate

3. **Update and continue**
   Create new checkpoint reflecting reality
```

---

## Best Practices

### When to Checkpoint

✅ After completing a phase
✅ After significant decisions
✅ Before risky operations
✅ When pausing work
✅ Before context gets too long
✅ At natural stopping points

### What to Include

✅ Progress state (done/pending)
✅ Key decisions (with brief rationale)
✅ File references (not contents)
✅ Next action
✅ Any blockers

### What to Exclude

❌ Full conversation history
❌ Complete file contents
❌ Detailed reasoning (just conclusions)
❌ Completed item details (just that they're done)
❌ Unchanged context

---

## Quick Reference

### Create Checkpoint

```json
{
  "checkpoint_type": "progress",
  "created_at": "[timestamp]",
  "task": "[task name]",
  "completed": ["[item 1]", "[item 2]"],
  "pending": ["[item 3]", "[item 4]"],
  "current_step": "[what's next]",
  "decisions": ["[key decision 1]"],
  "next_action": "[specific next step]"
}
```

### Resume Pattern

```markdown
1. Load checkpoint file
2. Verify state is valid
3. Load minimal additional context
4. Continue from next_action
```

### Token Comparison

| Resume Method | Tokens | Cost |
|---------------|--------|------|
| Full re-read | 25K | $0.08 |
| With checkpoint | 3K | $0.01 |
| **Savings** | **88%** | **88%** |

---

**Use checkpoints** for any complex or long-running task to save tokens and enable reliable pause/resume!
