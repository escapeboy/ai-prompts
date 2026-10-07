---
name: ui-ux-review
description: Audit UI/UX implementation for design consistency, accessibility, and adherence to established patterns. Use when reviewing existing UI code for consistency/accessibility gaps, not when designing new UI from scratch.
version: 1.0.0
---

# UI/UX Review Skill

Manually audit the user interface for design consistency, component quality, responsive design, and accessibility compliance.

## When to Use (and When NOT to)

| Use this skill for | Use a simpler approach for |
|---|---|
| Auditing existing UI code for design-system drift and a11y gaps | Building new UI from scratch — use `design-taste-frontend` or `frontend-design` for aesthetic direction instead |
| A full multi-area sweep (components/styles/responsive/a11y) | Checking one component's accessibility quickly — read the checklist at the end of this file inline, no full report needed |
| Producing a findings report for the team to act on | Fixing one already-known bug — just fix it, no audit needed |
| A pre-launch or pre-merge design-consistency check | Comparing against a live Figma design — use `compound-engineering:ce-design-implementation-reviewer` or `ce-figma-design-sync` instead |
| Reviewing Livewire/Blade, React, or Vue UI code | Reviewing copy/content quality only — use the `content-review` skill instead |

## Usage

`/ui-ux-review [focus]` where focus is:

- (no args) - Full UI/UX audit (default)
- `components` - Livewire components only
- `styles` - CSS/Tailwind/styling only
- `responsive` - Responsive design and breakpoints
- `a11y` - Accessibility audit (WCAG compliance)
- `interactions` - JavaScript interactions and Alpine.js

## What This Skill Does

This skill performs a comprehensive UI/UX audit including:

1. **Design System Analysis**
   - Color palette identification and usage
   - Typography scale and hierarchy
   - Spacing system consistency
   - Component variant inventory
   - Animation and transition patterns

2. **Component Quality Review**
   - Button styles and states (hover, active, disabled, focus)
   - Form input consistency (text, select, checkbox, radio)
   - Card/container patterns
   - Modal and dialog implementations
   - Navigation patterns and states

3. **Responsive Design Evaluation**
   - Breakpoint definitions and usage
   - Mobile-first vs desktop-first approach
   - Touch target sizes (minimum 44x44px for mobile)
   - Responsive typography scaling
   - Mobile navigation patterns

4. **Accessibility Audit**
   - Semantic HTML structure (headings, landmarks)
   - ARIA attributes (labels, descriptions, roles)
   - Keyboard navigation support (focus states, tab order)
   - Color contrast ratios (WCAG AA: 4.5:1 for text)
   - Screen reader compatibility

5. **Interaction Design**
   - Hover states on interactive elements
   - Focus indicators for keyboard navigation
   - Loading states for async operations
   - Error state handling and display
   - Success feedback patterns

## Review Process

When invoked, follow this process:

### Step 1: Discover UI Files

Based on focus area, find relevant files:

```bash
# Livewire components (business logic, no views)
app/Livewire/**/*.php

# View templates (if they exist)
resources/views/**/*.blade.php

# Styling
resources/css/**/*.css
tailwind.config.js
postcss.config.js

# JavaScript/Alpine.js
resources/js/**/*.js
resources/js/components/**/*.js

# PWA functionality
resources/js/pwa/**/*.js
resources/js/db.js (IndexedDB)
```

### Step 2: Analyze Design System

Extract and document the actual colors, typography scale, and spacing system in use (from `tailwind.config.js` or CSS variables). See `references/examples.md` for the shape of the extracted output.

### Step 3: Component Inventory

List every UI component found (interactive elements, forms, containers, navigation, data display), noting which are componentized vs. inline-repeated. See `references/examples.md` for a worked inventory example.

### Step 4: Check Consistency

Compare similar elements (e.g. every button implementation) across the codebase and note variance in padding, color, and radius. See `references/examples.md` for a worked button-analysis example.

### Step 5: Evaluate Accessibility

Check WCAG compliance: color contrast ratios, keyboard navigation/focus indicators, and semantic HTML structure. See `references/examples.md` for worked examples of each check.

### Step 6: Generate Report

Write the findings as a report following the structure in `references/sample-report.md` — Design System Overview, Critical/High/Medium priority issues (each with file, problem, impact, WCAG reference, and a before/after fix), Responsive Design Review, Summary Statistics, and a phased Action Plan.

## Examples

```bash
# Full UI/UX audit
/ui-ux-review

# Review only components
/ui-ux-review components

# Focus on accessibility
/ui-ux-review a11y

# Check responsive design
/ui-ux-review responsive

# Review styling and design system
/ui-ux-review styles
```

## Review Checklist

### Design System
- [ ] Colors defined and consistently used
- [ ] Typography scale established
- [ ] Spacing system documented
- [ ] Component variants cataloged
- [ ] Animation patterns consistent

### Component Quality
- [ ] Buttons have all states (default, hover, focus, active, disabled)
- [ ] Forms have consistent styling
- [ ] Cards use uniform structure
- [ ] Modals implement proper patterns
- [ ] Navigation shows active states

### Responsive Design
- [ ] Mobile breakpoints defined and used
- [ ] Touch targets meet 44x44px minimum
- [ ] Typography scales for small screens
- [ ] Navigation adapts to mobile
- [ ] Tables/data display work on mobile

### Accessibility
- [ ] Semantic HTML used throughout
- [ ] ARIA labels on icon buttons
- [ ] Keyboard navigation supported
- [ ] Focus states visible
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Screen reader compatibility verified

### Interactions
- [ ] Hover states on all interactive elements
- [ ] Focus indicators present
- [ ] Loading states for async actions
- [ ] Error states clearly indicated
- [ ] Success feedback provided

## Boundaries

**Always**
- Produce a findings report; never modify UI code as part of the audit itself.
- Cite the actual file and line for each issue found — no fabricated examples in place of real audit findings.
- Include a WCAG level (A/AA) for every accessibility finding.

**Ask first**
- Before applying any of the report's recommended fixes to the codebase.
- Before creating new reusable components (Button, Card, etc.) that the report recommends.

**Never**
- Report issues without checking the actual codebase files.
- Skip the accessibility section entirely, even when `focus` is `styles` or `components`.

## Related
- Guide: [`08-ui-ux-development/README.md`](../../../08-ui-ux-development/README.md) — the UI/UX implementation workflow this skill audits against.
- [`sprint-orchestrate`](../sprint-orchestrate/SKILL.md) — use this in the Review phase when a sprint touches UI.
