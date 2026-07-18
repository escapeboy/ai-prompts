# `memories` — Serena memory file specs

Read this when running the `memories` action. It creates the initial set of Serena memories by analyzing the codebase, writing these files into `.serena/memories/`.

**Time**: ~5 minutes per memory (reads relevant files symbolically).

## `architecture.md`

Analyzes the project structure and documents:
- Top-level directory layout and purpose
- Key classes/modules and their responsibilities
- Data flow between layers
- External dependencies and integrations
- Deployment topology

## `codebase-conventions.md`

Documents coding standards by scanning the codebase:
- Naming conventions (files, classes, methods, variables)
- File organization patterns
- Preferred libraries and why
- Anti-patterns found in existing code (to be consistent with or avoid)
- Comment and documentation style

## `testing-strategy.md`

Documents the testing approach:
- Test frameworks in use
- Directory structure for tests
- Factory/fixture patterns
- What's tested and how (unit vs integration vs e2e)
- How to run tests locally
