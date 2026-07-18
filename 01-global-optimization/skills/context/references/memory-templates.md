# Memory templates

The recommended structure `/context save` and `/context create` write, plus the catalog of
per-topic memory templates. Read this when creating or refreshing a memory so the output
follows the house shape. The action process steps live in [actions.md](actions.md).

---

## Recommended memory structure

Claude writes this shape automatically for a new memory:

```markdown
# [Topic]

## Overview
[High-level summary]

## Key Patterns
[Most important conventions or structures]

## File Locations
[Where to find relevant code]

## Constraints
[Rules, limitations, things to avoid]

## Last Updated
[Date]
```

---

## Template catalog

When creating new memories, Claude uses these templates:

### `architecture.md`
Documents overall project structure, layers, key components, and data flow.

### `codebase-conventions.md`
Documents naming conventions, file structure rules, preferred patterns, and anti-patterns.

### `module-structure.md`
Documents a specific module: its purpose, public API, internal structure, and dependencies.

### `testing-strategy.md`
Documents test frameworks, fixtures, factory patterns, and what/where to test.

### `api-design.md`
Documents API endpoint conventions, authentication patterns, response formats, and versioning.

### `deployment-config.md`
Documents deployment environments, commands, CI/CD pipeline, and rollback procedures.
