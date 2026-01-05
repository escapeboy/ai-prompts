# Constitution Guide

**Define architectural decision frameworks for consistent quality**

This guide explains how to create and use constitutions - formalized architectural principles that guide all development decisions in your project.

---

## What is a Constitution?

A constitution is a structured document that defines:
- **Principles**: Core architectural rules that must be followed
- **Priorities**: What matters most (security, performance, maintainability)
- **Patterns**: Standard approaches for common scenarios
- **Constraints**: What is NOT allowed
- **Decision frameworks**: How to make choices when patterns don't fit

### Benefits

1. **Consistency** - All code follows same patterns
2. **Quality** - Prevent common mistakes automatically
3. **Speed** - Don't re-debate solved decisions
4. **Onboarding** - New developers (and AI) know the rules
5. **Compliance** - Document regulatory/security requirements

---

## When to Create a Constitution

### Recommended Scenarios

- **Multi-tenant applications** - Critical data isolation rules
- **Security-sensitive projects** - Authentication, authorization patterns
- **Team projects** - Ensure consistency across developers
- **Complex architectures** - Multiple interacting patterns
- **Compliance requirements** - Document enforced rules

### Not Needed For

- Simple scripts or utilities
- Prototypes/proof-of-concepts
- Solo learning projects
- Projects with no architectural constraints

---

## Constitution Structure

### Standard Format

**File**: `.claude/settings/constitution.json`

```json
{
  "version": "1.0.0",
  "project": "Project Name",
  "description": "Architectural decision framework for [project]",
  "created_at": "2026-01-04",
  "updated_at": "2026-01-04",

  "principles": {
    // Core architectural rules
  },

  "decision_framework": {
    // How to make decisions for common scenarios
  },

  "constraints": {
    // What is NOT allowed
  },

  "enforcement": {
    // How principles are enforced
  }
}
```

---

## Principles Section

### Principle Structure

```json
"principles": {
  "principle_name": {
    "priority": "critical|high|medium|low",
    "description": "What this principle means",
    "rationale": "Why this principle exists",
    "rules": [
      "Specific rule 1",
      "Specific rule 2"
    ],
    "examples": {
      "correct": "Example of correct usage",
      "incorrect": "Example of what NOT to do"
    },
    "enforcement": "automatic|manual|advisory",
    "violations": "reject_change|warn_and_suggest_fix|log_only"
  }
}
```

### Common Principles

#### Multi-Tenancy

```json
"multi_tenancy": {
  "priority": "critical",
  "description": "All data must be isolated by tenant/organization",
  "rationale": "Prevent data leakage between tenants",
  "rules": [
    "ALWAYS scope database queries by organization_id",
    "Use UUID primary keys for all tenant-visible entities",
    "Never expose sequential IDs in URLs or APIs",
    "Validate organization access in all policy classes",
    "Include organization_id in all foreign key constraints"
  ],
  "examples": {
    "correct": "User::where('organization_id', $org->id)->get()",
    "incorrect": "User::all()"
  },
  "enforcement": "automatic",
  "violations": "reject_change"
}
```

#### Code Quality

```json
"code_quality": {
  "priority": "high",
  "description": "Maintain consistent code quality standards",
  "rationale": "Reduce bugs, improve maintainability",
  "rules": [
    "FormRequest for ALL validation (never inline)",
    "Service Layer for business logic (not controllers)",
    "Policy classes for authorization (not inline checks)",
    "Repository pattern for complex queries (optional)",
    "Events for side effects (email, notifications)"
  ],
  "examples": {
    "correct": "public function store(CreateUserRequest $request) { ... }",
    "incorrect": "public function store(Request $request) { $request->validate([...]); }"
  },
  "enforcement": "automatic",
  "violations": "warn_and_suggest_fix"
}
```

#### Security

```json
"security": {
  "priority": "critical",
  "description": "Security requirements for all code",
  "rationale": "Protect user data and system integrity",
  "rules": [
    "Never store plain-text passwords",
    "Always use parameterized queries (no string interpolation)",
    "Validate and sanitize all user input",
    "Use HTTPS for all external communications",
    "Never log sensitive data (passwords, tokens, PII)"
  ],
  "enforcement": "automatic",
  "violations": "reject_change"
}
```

#### Performance

```json
"performance": {
  "priority": "medium",
  "description": "Performance standards for acceptable response times",
  "rationale": "Ensure good user experience",
  "rules": [
    "N+1 queries must be resolved with eager loading",
    "Use caching for expensive operations",
    "Paginate large result sets",
    "Index foreign keys and frequently-queried columns",
    "Queue long-running operations"
  ],
  "enforcement": "advisory",
  "violations": "warn_and_suggest_fix"
}
```

#### Docker Workflow

```json
"docker_workflow": {
  "priority": "critical",
  "description": "All development commands must use Docker",
  "rationale": "Ensure consistent environment",
  "rules": [
    "ALL artisan commands via 'docker-compose exec app'",
    "ALL composer commands via 'docker-compose exec app'",
    "ALL npm commands via 'docker-compose exec app'",
    "NEVER run development commands directly on host",
    "Use container names in .env (DB_HOST=db, not localhost)"
  ],
  "enforcement": "automatic",
  "violations": "reject_change"
}
```

---

## Decision Framework Section

### Structure

```json
"decision_framework": {
  "scenario_name": [
    "Step 1: First consideration",
    "Step 2: Second consideration",
    "Step 3: What to do"
  ]
}
```

### Common Decision Frameworks

```json
"decision_framework": {
  "new_feature": [
    "1. Check if similar feature exists in codebase",
    "2. Verify multi-tenancy requirements (scope by organization?)",
    "3. Identify affected models and relationships",
    "4. Plan tests before implementation",
    "5. Create FormRequest for any user input",
    "6. Create Service class for business logic",
    "7. Create Policy class if authorization needed",
    "8. Create events for side effects"
  ],

  "new_model": [
    "1. Use UUIDs if tenant-visible",
    "2. Add organization_id if multi-tenant",
    "3. Define fillable/guarded properties",
    "4. Create factory immediately",
    "5. Add to appropriate relationships",
    "6. Create policy if authorization needed"
  ],

  "new_controller": [
    "1. Create FormRequest for each action with input",
    "2. Use route model binding",
    "3. Authorize via policy (not inline)",
    "4. Delegate business logic to services",
    "5. Return appropriate responses (Resources for APIs)"
  ],

  "bug_fix": [
    "1. Reproduce the bug locally",
    "2. Write failing test first",
    "3. Identify root cause (don't just fix symptoms)",
    "4. Fix the bug",
    "5. Verify test passes",
    "6. Check for similar bugs elsewhere"
  ],

  "refactoring": [
    "1. Ensure tests exist for affected code",
    "2. Run tests to confirm passing",
    "3. Make incremental changes",
    "4. Run tests after each change",
    "5. Verify no behavior changes (unless intended)"
  ],

  "database_change": [
    "1. Create migration (never modify existing migration)",
    "2. Consider data migration needs",
    "3. Add indexes for foreign keys and search columns",
    "4. Test migration rollback",
    "5. Update model fillable/casts if needed",
    "6. Update factories"
  ]
}
```

---

## Constraints Section

### Structure

```json
"constraints": {
  "never": [
    "Things that must NEVER be done"
  ],
  "always": [
    "Things that must ALWAYS be done"
  ],
  "deprecated": [
    "Patterns being phased out"
  ]
}
```

### Example

```json
"constraints": {
  "never": [
    "Inline validation in controllers",
    "Business logic in controllers or models",
    "Direct authorization checks (use policies)",
    "Queries without organization scoping (if multi-tenant)",
    "Plain-text password storage",
    "String interpolation in SQL queries",
    "Committing .env files",
    "Force pushing to main/master branch"
  ],

  "always": [
    "Use FormRequest for validation",
    "Use Services for business logic",
    "Use Policies for authorization",
    "Include organization_id in queries",
    "Create tests for new features",
    "Run tests before committing",
    "Use meaningful commit messages"
  ],

  "deprecated": [
    "Repository pattern for simple CRUD (use models directly)",
    "Blade components (migrating to Livewire)",
    "jQuery (use Alpine.js instead)"
  ]
}
```

---

## Enforcement Section

### Structure

```json
"enforcement": {
  "levels": {
    "automatic": "Claude/tools automatically enforce",
    "manual": "Require explicit check",
    "advisory": "Suggest but don't enforce"
  },
  "actions": {
    "reject_change": "Block the change",
    "warn_and_suggest_fix": "Allow but suggest correction",
    "log_only": "Record for review"
  },
  "tools": [
    "PM Orchestrator checks before implementation",
    "spec-impl verifies patterns",
    "spec-judge evaluates compliance"
  ]
}
```

---

## Complete Example

```json
{
  "version": "1.0.0",
  "project": "Acme SaaS Platform",
  "description": "Architectural decision framework for multi-tenant Laravel SaaS",
  "created_at": "2026-01-04",
  "updated_at": "2026-01-04",

  "principles": {
    "multi_tenancy": {
      "priority": "critical",
      "description": "All data must be isolated by organization",
      "rules": [
        "ALWAYS scope queries by organization_id",
        "Use UUID primary keys for tenant-visible entities",
        "Never expose sequential IDs in URLs",
        "Validate organization access in policies"
      ],
      "enforcement": "automatic",
      "violations": "reject_change"
    },

    "code_quality": {
      "priority": "high",
      "description": "Maintain consistent code quality",
      "rules": [
        "FormRequest for ALL validation",
        "Service Layer for business logic",
        "Policy classes for authorization",
        "Factory classes for all models"
      ],
      "enforcement": "automatic",
      "violations": "warn_and_suggest_fix"
    },

    "testing": {
      "priority": "high",
      "description": "All features require tests",
      "rules": [
        "Feature tests for HTTP endpoints",
        "Unit tests for services",
        "80% minimum coverage target"
      ],
      "enforcement": "advisory",
      "violations": "warn_and_suggest_fix"
    },

    "docker_workflow": {
      "priority": "critical",
      "description": "All commands via Docker",
      "rules": [
        "ALL artisan/composer/npm via docker-compose exec app"
      ],
      "enforcement": "automatic",
      "violations": "reject_change"
    }
  },

  "decision_framework": {
    "new_feature": [
      "Check for existing similar features",
      "Verify multi-tenancy scoping",
      "Plan tests before implementation",
      "Create FormRequest, Service, Policy as needed"
    ],
    "bug_fix": [
      "Write failing test first",
      "Fix root cause, not symptoms",
      "Verify test passes"
    ]
  },

  "constraints": {
    "never": [
      "Inline validation",
      "Business logic in controllers",
      "Unscoped queries in multi-tenant context"
    ],
    "always": [
      "Use FormRequest",
      "Use Services",
      "Use Policies",
      "Include tests"
    ]
  },

  "enforcement": {
    "tool": "PM Orchestrator",
    "check_frequency": "before_implementation",
    "override": "requires_explicit_justification"
  }
}
```

---

## Using the Constitution

### Loading Constitution

At session start:
```markdown
## Context Load

1. Load Serena memories
2. **Load constitution**: `.claude/settings/constitution.json`
3. Verify principles before any changes
```

### During Implementation

Before making changes:
```markdown
## Constitution Check

**Change**: Add new UserProfile model

**Principles to verify**:
- [ ] multi_tenancy: Include organization_id? **Yes**
- [ ] multi_tenancy: Use UUID? **Yes**
- [ ] code_quality: Create factory? **Yes**
- [ ] code_quality: Create policy? **Yes**

**Decision framework**: Following "new_model" steps
```

### Handling Violations

When constitution would be violated:
```markdown
## Constitution Violation Detected

**Principle**: code_quality
**Rule violated**: "FormRequest for ALL validation"
**Current code**: Inline validation in controller

**Resolution options**:
1. **Fix (recommended)**: Create FormRequest class
2. **Override (requires justification)**: Document why exception needed

**Action taken**: Created CreateProfileRequest.php
```

---

## Evolving the Constitution

### When to Update

- New patterns established
- Old patterns deprecated
- Security requirements change
- Team decisions made
- Lessons learned from incidents

### Update Process

1. **Propose change** - Document what and why
2. **Team review** - Get buy-in
3. **Update version** - Increment version number
4. **Update date** - Update `updated_at`
5. **Communicate** - Notify team of changes

### Version History

Maintain changelog:
```markdown
## Constitution Changelog

### v1.1.0 (2026-02-01)
- Added: Rate limiting principle
- Updated: Performance rules for API endpoints
- Deprecated: Repository pattern for simple CRUD

### v1.0.0 (2026-01-04)
- Initial constitution
```

---

## Integration with Tools

### PM Orchestrator

PM Orchestrator checks constitution:
1. Before planning (validate approach)
2. Before implementation (verify patterns)
3. After changes (confirm compliance)

### spec-impl Agent

Implementation agent:
- Loads constitution at start
- Verifies each change against principles
- Reports violations before committing

### spec-judge Agent

Evaluation agent:
- Includes constitution compliance in assessment
- Flags violations in review
- Suggests fixes for non-compliance

---

## Quick Reference

### Priority Levels

| Priority | Meaning | Violation Response |
|----------|---------|-------------------|
| Critical | Must follow, no exceptions | Block change |
| High | Must follow, rare exceptions | Warn, require justification |
| Medium | Should follow, exceptions OK | Warn, suggest fix |
| Low | Preferred, flexible | Log for review |

### Common Principles

| Principle | Focus | Typical Priority |
|-----------|-------|------------------|
| Multi-tenancy | Data isolation | Critical |
| Security | Data protection | Critical |
| Code quality | Maintainability | High |
| Testing | Reliability | High |
| Performance | Speed | Medium |
| Documentation | Clarity | Low |

### Enforcement Actions

| Action | When to Use |
|--------|-------------|
| reject_change | Security, data isolation |
| warn_and_suggest_fix | Quality, patterns |
| log_only | Preferences, guidelines |

---

**Create a constitution** for any project with architectural patterns that must be consistently followed. It's an investment that pays off in quality, consistency, and reduced debugging time.
