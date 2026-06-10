---
name: fix-bug
description: Three-phase autonomous bug fix — investigate all occurrences, fix with full coverage, validate with regression test. Prevents partial fixes (the #1 friction source: fixing one broken route but missing the second, renaming a property but not the view variable, etc).
---

# fix-bug

Three-phase bug fix that finds ALL occurrences, fixes atomically, and validates with a regression test.

## Phase 1 — Comprehensive Investigation

Before touching any code:

1. Reproduce the issue and capture the **exact** error message / stack trace
2. Identify the primary symbol involved (function name, route, variable, class, column)
3. **Grep the entire codebase** for every reference to that symbol:
   - Controllers, services, models
   - View templates (Blade / JSX / ERB / Twig — server-rendered views are the most-missed spot)
   - Tests (feature + unit)
   - Route definitions (all route files, not just the obvious one)
   - Config files
   - JS/CSS files if relevant
4. Document: **full list of files that reference the broken symbol**
5. Check for the **same bug pattern** in similar locations (e.g. if one route is broken, check all routes of the same type)

Do not proceed until you have the complete reference map.

## Phase 2 — Fix with Full Coverage

Apply changes **atomically** across every file found in Phase 1:

- For renamed variables/properties: update the definition + every view, controller, test, and config
- For broken routes: check all route files, all route-helper calls, all redirects and links
- For removed/changed model attributes: update mass-assignment lists (`$fillable` or equivalent), factories, seeders, and all tests that reference those attributes
- For middleware changes: check route groups, kernel/middleware registration, and all test middleware overrides

After applying all changes, grep again to confirm **zero remaining old references**.

## Phase 3 — Validate

1. Run the **full test suite** (`php artisan test --parallel`, `npm test`, `pytest` — project equivalent)
2. If tests fail:
   - Determine: is the test wrong, or is the fix incomplete?
   - Never change test assertions to make them pass trivially
   - Fix the underlying issue
3. Write a **regression test** that:
   - Reproduces the original bug (assert it was broken)
   - Confirms the fix works
   - Lives in the appropriate test directory
4. Final grep: confirm zero references to the old broken pattern

## Output

Report back:
- Root cause (1-2 sentences)
- Files changed (list)
- Regression test location
- Test suite result (pass/fail count)

---

**The bug to fix:** $ARGUMENTS
