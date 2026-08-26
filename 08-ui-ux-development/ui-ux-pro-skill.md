# UI/UX Pro Max Skill Documentation

**Skill Name**: `ui-ux-pro-max`
**Command**: `/ui-ux-pro-max`
**Category**: UI/UX Design & Implementation
**Token Savings**: 40-60% for UI tasks through specialized context
**Upstream**: [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) · **synced to v2.0 catalog `verifiedAt` 2026-08-13**
**Sync marker**: catalog counts below are from `data/catalog-summary.json`. If upstream `verifiedAt` is newer than 2026-08-13, this guide has drifted — re-sync counts + the query contract.

---

## Overview

UI/UX Pro Max is a **data-backed design-intelligence skill**. As of v2.0 it is no longer a static prose catalog — it ships a local searchable dataset queried by a Python tool (`search.py`), plus a reasoning engine that assembles a full design system on demand.

**Catalog counts (v2.0, `verifiedAt` 2026-08-13):**

- **88 UI styles** (79 searchable, 50 active, 29 supplemental, 9 deprecated) — Glassmorphism, Claymorphism, Minimalism, Brutalism, Neumorphism, Bento Grid, etc.
- **192 product palettes + 192 reasoning profiles** (one exact reasoning profile per product archetype)
- **74 font pairings** drawn from **1,934 licensed Google Fonts** (unlicensed families excluded by policy)
- **119 UX guidelines** organised into 10 priority categories (accessibility → charts)
- **105 curated icons** (+ 1,512 upstream Phosphor icons)
- **25 chart types**, **17 GSAP motion presets**
- **22 technology stacks** with **1,260 stack-specific guidelines** (React, Next.js, Vue, Svelte, Angular, SwiftUI, React Native, Flutter, Laravel/Blade, html-tailwind, shadcn/ui, …)

> **Why the numbers jumped from the old guide** (50 styles / 21 palettes / 20 charts / 9 stacks): the previous version of this doc was derived from an older release. v2.0 replaced the hand-written catalog with a validated dataset (`data-provenance.json`, sha256-snapshotted sources, a promotion policy requiring explicit approval for family-set changes) and a `search.py` query layer. The conceptual sections lower in this doc (design-system format, component patterns, examples) remain valid; the **counts and the query contract are the parts that go stale**.

---

## v2.0 Architecture: The Search Tool & Query Contract

v2.0's core is `search.py` — a zero-dependency Python 3 tool that queries the local dataset. **This is the part that changed most from the old guide.** Invoke it by full path (it lives in the skill dir, not the project):

```bash
python "${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/scripts/search.py" "<query>" --domain <domain>
```

**Query contract — pick the smallest mode that fits:**

1. **New project / page / system-wide direction** → `--design-system` (aggregates product+style+color+typography, applies reasoning rules, returns pattern/style/colors/typography/effects + anti-patterns).
2. **Targeted concern or component bug** → one explicit `--domain` (`ux`, `style`, `product`, `typography`, `color`, `icons`, `gsap`, `chart`).
3. **Known stack** → `--stack <name>` for implementation detail; add a domain search only for a distinct design concern.

Rules that matter for good results:
- Build each query around **one dominant intent**, 2–5 meaningful terms + one constraint (product/platform/interaction).
- **Verify the returned domain, top result, and product/platform fit before applying.** Retry once with a narrower rewrite; if still empty/off-topic, state "no verified match" and label any general advice as fallback. **Never persist unverified output.**
- **Never assume a stack.** Detect it (`package.json`, `pubspec.yaml`, `*.xcodeproj`/`Package.swift`, `composer.json`, RN markers); ask if undetectable. A hardcoded default silently misroutes every recommendation.
- Accessibility: search one observable outcome at a time with explicit WCAG-outcome terms (e.g. `"error summary validation" --domain ux`, then `"decorative icon aria hidden" --domain icons`), then the stack. Don't accept a generic a11y result for a specific criterion.

**Rule categories by priority** (search `--domain ux` unless noted; full text in the skill's `references/quick-reference.md`, app-polish + pre-delivery checklist in `references/pro-rules.md`):

| Pri | Category | Impact | Must-have | Avoid |
|-----|----------|--------|-----------|-------|
| 1 | Accessibility | CRIT | Contrast 4.5:1, alt text, keyboard nav, aria-labels | Removing focus rings, icon-only buttons w/o labels |
| 2 | Touch & Interaction | CRIT | 44×44px min, 8px+ spacing, loading feedback | Hover-only reliance, 0ms state changes |
| 3 | Performance | HIGH | WebP/AVIF, lazy load, reserve space (CLS <0.1) | Layout thrash, CLS |
| 4 | Style Selection | HIGH | Match product type, consistency, SVG icons | Mixing flat+skeuomorphic, emoji as icons |
| 5 | Layout & Responsive | HIGH | Mobile-first, viewport meta, no h-scroll | Fixed px widths, disable zoom |
| 6 | Typography & Color | MED | Base 16px, line-height 1.5, semantic tokens | Body <12px, gray-on-gray, raw hex |
| 7 | Animation | MED | Context-aware timing, motion=meaning, reduced-motion | One duration for all, animating width/height |
| 8 | Forms & Feedback | MED | Visible labels, inline errors, progressive disclosure | Placeholder-only labels, top-only errors |
| 9 | Navigation | HIGH | Predictable back, bottom nav ≤5, deep linking | Overloaded nav, broken back |
| 10 | Charts & Data | LOW | Legends, tooltips, accessible colors | Color-alone encoding |

**Persisting a design system** across sessions: add `--persist` **and always** `--output-dir <project-root>` (master + per-page overrides pattern). Without `--output-dir` files land wherever the tool ran.

**Companion CLI (optional, no Claude needed):** `npx ui-ux-pro-max-cli` — same dataset, standalone. Useful for a quick style/palette lookup outside an agent session.

**Adoption note for our fleet:** upstream ships Python `scripts/` and (in `cli/`) an npm package. Per our supply-chain posture, if we install it, install it **as a plugin we've read**, not blindly — the `search.py` is read-only data querying (safe), but audit before trusting any `scripts/` on a shared host. For most of our Laravel + Blade work, the **`--stack laravel` / `--stack html-tailwind`** guidelines + the priority table above are the highest-value slice; the reasoning engine matters mainly for greenfield pages.

---

## When to Use

Use this skill when you need to:

### Design Phase
- Create design systems from scratch
- Generate color palettes with accessibility compliance
- Select appropriate font pairings
- Plan UI architecture and component structure

### Implementation Phase
- Build dashboards, landing pages, admin panels
- Create e-commerce interfaces
- Implement SaaS applications
- Design mobile app UIs

### Enhancement Phase
- Review existing UI for consistency
- Fix accessibility issues
- Improve responsive behavior
- Optimize color contrast and spacing

### Specific Elements
- Design buttons, modals, navbars, sidebars
- Create cards, tables, forms, charts
- Implement animations and transitions
- Add hover states, shadows, gradients

---

## Capabilities

### 1. Design System Generation

Creates complete design systems including:

```markdown
## Design System: [Project Name]

### Style Philosophy
- Primary style: [e.g., Flat Design, Glassmorphism]
- Visual approach: [minimalist, bold, professional]
- Animation strategy: [subtle, pronounced, none]

### Color Palette
- Primary: #3B82F6 (blue-600)
- Secondary: #60A5FA (blue-400)
- CTA: #F97316 (orange-600)
- Background: #F8FAFC (slate-50)
- Text: #1E293B (slate-900)
- Success: #10B981 (green-500)
- Warning: #F59E0B (amber-500)
- Error: #EF4444 (red-500)

### Typography
- Headings: Inter (font-weight: 700)
- Body: Inter (font-weight: 400)
- Code: 'Fira Code' (monospace)

### Spacing Scale
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)

### Components
- Buttons: Rounded-lg, shadow-sm, transition-all 200ms
- Cards: White background, shadow-md, border radius 12px
- Inputs: Border slate-300, focus:ring-2 ring-primary
```

### 2. Component Implementation

Generates production-ready code with:

- **Accessibility**: ARIA labels, keyboard navigation, focus states
- **Responsiveness**: Mobile-first with Tailwind breakpoints
- **Dark Mode**: Full dark mode support with proper contrast
- **Performance**: Optimized DOM operations, lazy loading
- **Security**: XSS prevention, safe DOM manipulation

### 3. Integration Support

Works seamlessly with:

- **shadcn/ui MCP**: Searches and retrieves shadcn/ui components
- **Tailwind CSS**: Full utility class library
- **Alpine.js**: Reactive JavaScript for interactivity
- **Livewire**: Server-side rendering with reactive components

---

## Usage Examples

### Example 1: Create Dashboard from Scratch

```bash
/ui-ux-pro-max design a professional SaaS dashboard for a geospatial alert system.
Use flat design style with blue as primary color. Include stats cards, recent activity,
and quick actions. Support dark mode and Bulgarian/English languages.
```

**What the agent does**:
1. Generates complete design system document
2. Creates responsive layout with top navigation
3. Implements stats cards with icons and data
4. Adds empty states for no-data scenarios
5. Includes dark mode toggle with localStorage persistence
6. Sets up language switcher
7. Ensures WCAG 2.1 AA accessibility compliance

**Deliverables**:
- Design system documentation (MASTER.md)
- Layout template (layouts/dashboard.blade.php)
- Dashboard view (dashboard.blade.php)
- Translation files (en/dashboard.php, bg/dashboard.php)
- Tailwind configuration
- Alpine.js components

### Example 2: Fix Existing UI Issues

```bash
/ui-ux-pro-max review the dashboard at /resources/views/dashboard.blade.php
and fix any accessibility, responsiveness, or design consistency issues
```

**What the agent does**:
1. Audits existing code for issues
2. Checks color contrast ratios
3. Validates responsive breakpoints
4. Reviews keyboard navigation
5. Ensures consistent spacing
6. Fixes any violations

### Example 3: Implement Specific Component

```bash
/ui-ux-pro-max create a modal component for user profile editing with form validation,
dark mode support, and smooth animations
```

**What the agent does**:
1. Generates modal HTML structure
2. Adds Alpine.js for open/close logic
3. Implements form validation
4. Styles with Tailwind (light + dark mode)
5. Adds transition animations
6. Ensures accessibility (focus trap, Escape key)

---

## Key Features

### Built-in Design Knowledge

**Styles Library** (88 total / 79 searchable / 50 active — the list below is an illustrative subset; query the full catalog via `--domain style`):
- Glassmorphism - Frosted glass effects
- Claymorphism - 3D clay-like surfaces
- Minimalism - Clean, simple, whitespace
- Brutalism - Raw, bold, unconventional
- Neumorphism - Soft UI with subtle shadows
- Bento Grid - Card-based layouts
- Flat Design - 2D, bold colors, simple shapes
- Material Design - Google's design language
- Skeuomorphism - Real-world metaphors

**Color Palettes** (192 product palettes + reasoning profiles — subset below; query via `--domain color` or `--design-system`):
- Professional Blues - Trust, corporate
- Vibrant Gradients - Modern, energetic
- Earth Tones - Natural, calming
- Monochrome - Elegant, timeless
- Neon Accents - Bold, attention-grabbing
- Pastel Soft - Gentle, friendly
- High Contrast - Accessible, clear

**Font Pairings** (74 curated pairings from 1,934 licensed Google Fonts — subset below; query via `--domain typography`):
- Playfair Display + Source Sans Pro (Editorial)
- Montserrat + Merriweather (Modern Professional)
- Inter + Fira Code (Tech SaaS)
- Raleway + Lato (Clean Minimal)
- Roboto Slab + Open Sans (Corporate)

### Technology Stack Support

**Frontend Frameworks**:
- React (Hooks, Context, Portals)
- Next.js (SSR, SSG, API routes)
- Vue (Composition API, Pinia)
- Svelte (Reactive declarations)
- Alpine.js (Reactive HTML)

**Mobile**:
- React Native (Cross-platform)
- SwiftUI (iOS native)
- Flutter (Cross-platform)

**Styling**:
- Tailwind CSS (Utility-first)
- shadcn/ui (Component library)
- Custom CSS (When needed)

### shadcn/ui Integration

The agent can search and use shadcn/ui components via MCP:

```bash
# Agent automatically searches for components
"I need a data table with sorting"
→ Agent searches shadcn/ui for table components
→ Retrieves implementation examples
→ Adapts to your project structure
```

**Available Components**:
- Alert, Badge, Button, Card, Checkbox
- Dialog, Dropdown, Form, Input, Label
- Select, Table, Tabs, Textarea, Toast
- And 40+ more...

---

## Best Practices

### 1. Always Provide Context

**Good**:
```bash
/ui-ux-pro-max create a dashboard for a Laravel + Livewire project.
Use Tailwind CSS and Alpine.js. Project already has blue (#3B82F6) as primary color.
Support dark mode and needs to work on mobile.
```

**Bad**:
```bash
/ui-ux-pro-max make a dashboard
```

### 2. Specify Style Preferences

**Good**:
```bash
/ui-ux-pro-max use flat design style with bold colors and clean lines.
Avoid gradients and shadows. Minimalist approach.
```

**Bad**:
```bash
/ui-ux-pro-max make it look nice
```

### 3. Mention Existing Constraints

**Good**:
```bash
/ui-ux-pro-max the project already uses Inter font and slate color scale.
Dark mode is implemented with Tailwind's dark: prefix. Keep consistency.
```

**Bad**:
```bash
/ui-ux-pro-max add new UI
```

### 4. Request Accessibility Features

**Good**:
```bash
/ui-ux-pro-max ensure WCAG 2.1 AA compliance, keyboard navigation,
screen reader support, and 4.5:1 contrast ratio for all text.
```

**Bad**:
```bash
/ui-ux-pro-max make it accessible
```

---

## Workflow Integration

### Step 1: Design System Generation

```bash
/ui-ux-pro-max create a design system for [project name].
Style: [flat/glassmorphism/minimal]
Colors: [primary preference]
Tech stack: [React/Laravel/etc]
```

**Output**: Complete MASTER.md with all design tokens

### Step 2: Implementation

```bash
/ui-ux-pro-max implement the dashboard layout based on the design system.
Include [list specific sections/components].
```

**Output**: Production-ready code files

### Step 3: Testing & Iteration

```bash
/ui-ux-pro-max test the dashboard in Chrome and fix any issues:
- Empty states not showing
- Dark mode contrast issues
- Mobile responsiveness at 375px
```

**Output**: Fixes applied with verification

### Step 4: Documentation

```bash
/ui-ux-pro-max document the implementation in IMPLEMENTATION.md
```

**Output**: Comprehensive implementation guide

---

## Common Patterns

### Pattern 1: Dashboard with Real Data

```javascript
// API Integration Pattern
const API_URL = ''; // Same origin via proxy
const API_TOKEN = '{{ session("api_token") }}';

async function fetchDashboardStats() {
    const [alerts, subscriptions, orgs, campaigns] = await Promise.all([
        fetch(`${API_URL}/api/v1/alerts/my`, {
            headers: { 'Authorization': `Bearer ${API_TOKEN}` }
        }),
        fetch(`${API_URL}/api/v1/subscriptions`, {
            headers: { 'Authorization': `Bearer ${API_TOKEN}` }
        }),
        // ... more endpoints
    ]);

    // Update UI with real data or show empty states
    updateRecentAlerts(alerts.data || []);
    updateSubscriptions(subscriptions.data || []);
}
```

### Pattern 2: Empty States

```html
<!-- Empty State Pattern -->
<div class="text-center py-8 text-slate-500 dark:text-slate-400">
    <!-- Icon -->
    <svg class="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600">
        <!-- SVG path -->
    </svg>

    <!-- Message -->
    <p class="text-sm">{{ __('dashboard.no_recent_alerts') }}</p>
</div>
```

### Pattern 3: Dark Mode

```html
<!-- Dark Mode Pattern -->
<div class="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50">
    <h1 class="text-2xl font-bold">Dashboard</h1>
    <p class="text-slate-600 dark:text-slate-400">Subtitle</p>
</div>

<!-- Toggle Script -->
<script>
Alpine.data('darkMode', () => ({
    dark: localStorage.getItem('dark') === 'true',
    toggle() {
        this.dark = !this.dark;
        localStorage.setItem('dark', this.dark);
        document.documentElement.classList.toggle('dark', this.dark);
    }
}));
</script>
```

### Pattern 4: Responsive Layout

```html
<!-- Mobile-first responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- Cards adapt from 1 column → 2 columns → 4 columns -->
    <div class="bg-white rounded-lg shadow p-6">Stats Card</div>
    <div class="bg-white rounded-lg shadow p-6">Stats Card</div>
    <div class="bg-white rounded-lg shadow p-6">Stats Card</div>
    <div class="bg-white rounded-lg shadow p-6">Stats Card</div>
</div>
```

---

## Token Savings

### Why This Skill Saves Tokens

1. **Pre-loaded Knowledge**: 50 styles, 21 palettes, 50 font pairings already in context
2. **Design Patterns**: Common UI patterns cached and reusable
3. **Technology Awareness**: Knows framework-specific implementations
4. **Component Library**: shadcn/ui integration reduces repetitive searches
5. **Best Practices**: Built-in accessibility, security, and performance patterns

### Typical Savings

**Without skill** (baseline):
- Research design styles: 5,000 tokens
- Search color palettes: 3,000 tokens
- Find font pairings: 2,000 tokens
- Look up component patterns: 8,000 tokens
- Accessibility guidelines: 4,000 tokens
- **Total**: ~22,000 tokens

**With skill** (optimized):
- Design system generation: 6,000 tokens
- Implementation: 3,000 tokens
- Testing and fixes: 1,500 tokens
- **Total**: ~10,500 tokens

**Savings**: 52% reduction (11,500 tokens saved)

---

## AI Slop Detection

AI-generated UI has recognizable patterns that look "generated" rather than designed. This section helps identify and eliminate AI slop to produce distinctive, human-quality interfaces.

### AI Slop Score

Rate any UI implementation 0-10 on the AI Slop scale:

| Score | Level | Description |
|-------|-------|-------------|
| 0-2 | **Distinctive** | Looks hand-crafted, has personality and intentional design choices |
| 3-4 | **Acceptable** | Minor generic patterns but overall feels designed |
| 5-6 | **Suspicious** | Trained eye recognizes AI patterns |
| 7-8 | **Obvious** | Clearly AI-generated, no design personality |
| 9-10 | **Template** | Indistinguishable from a ChatGPT demo output |

### Common AI Slop Patterns

Detect and fix these patterns during review:

| Pattern | What It Looks Like | Fix |
|---------|-------------------|-----|
| **Gradient Hero** | Purple-to-blue gradient background with white text overlay | Use solid colors or subtle textures. If gradient, use brand-specific colors at non-standard angles. |
| **3-Column Icon Grid** | Three feature cards with centered icons, identical structure | Vary card sizes, use asymmetric layouts, or replace with actual screenshots/illustrations. |
| **Uniform Border Radius** | Every element has `rounded-xl` or `rounded-2xl` | Mix sharp corners (buttons, nav) with rounded (cards, avatars). Use `rounded-none` intentionally. |
| **Generic Illustrations** | Undraw-style SVG people illustrations | Use actual product screenshots, custom iconography, or photography. |
| **Shadow Everything** | `shadow-lg` on every card, button, and container | Shadows imply elevation. Use sparingly and intentionally. Most elements should be flat. |
| **Centered Everything** | All text center-aligned, symmetric padding everywhere | Left-align body text. Use asymmetric layouts. Let some elements breathe differently. |
| **Testimonial Carousel** | Three rounded avatars with star ratings and quotes | Use real photos, specific names, company logos, and non-standard layouts. |
| **CTA Button Pair** | "Get Started" primary + "Learn More" ghost button | Use specific action verbs ("Start free trial", "See pricing"). One CTA is usually enough. |
| **Stock Metric Cards** | Four equal-width cards showing "+23%" in green | Vary card sizes by importance. Use sparklines or context instead of raw percentages. |
| **Emoji Headers** | Section titles prefixed with emoji (rocket, lightning, chart) | Remove emoji from headings. If icons needed, use a consistent icon set at appropriate size. |

### The Fix Checklist

After generating any UI, run this checklist:

1. **Color**: Are you using more than 2 gradients? Replace with solid brand colors.
2. **Layout**: Is everything symmetrical? Break the grid intentionally somewhere.
3. **Typography**: Is there only one font weight in use? Add hierarchy with weight and size variation.
4. **Spacing**: Is padding identical on all elements? Vary spacing to create visual rhythm.
5. **Icons**: Are all icons the same size/style from a generic set? Reduce icon count, increase meaning.
6. **Copy**: Does the text say "Transform your workflow" or similar? Replace with specific, concrete language.
7. **Imagery**: Using placeholder illustrations? Use real content or remove entirely.
8. **Animation**: Does everything fade-in on scroll? Remove most animations. Keep only functional ones (loading, transitions).

### Integration with Design Review

When running `/qa` or design review on UI code, include AI slop score in the output:

```
## AI Slop Assessment: [score]/10

Patterns detected:
- [pattern 1]: [where found] → [suggested fix]
- [pattern 2]: [where found] → [suggested fix]

Distinctive elements (keep these):
- [element that shows design intentionality]
```

---

## Troubleshooting

### Issue: Generic designs without personality

**Solution**: Provide more context about brand, target audience, and style preferences.

```bash
# Better prompt
/ui-ux-pro-max create a dashboard for a B2B SaaS targeting enterprise users.
Professional, trustworthy feel. Use blue as primary color. Minimize animations.
Conservative, corporate aesthetic.
```

### Issue: Designs don't match existing code

**Solution**: Mention existing design tokens, frameworks, and conventions.

```bash
# Better prompt
/ui-ux-pro-max the project uses Inter font, slate-50 background, and blue-600 primary.
Dark mode via Tailwind dark: prefix. Alpine.js for interactivity. Keep consistency.
```

### Issue: Not accessible enough

**Solution**: Explicitly request WCAG compliance.

```bash
# Better prompt
/ui-ux-pro-max ensure WCAG 2.1 AA compliance: 4.5:1 contrast, keyboard navigation,
focus indicators, ARIA labels, screen reader support.
```

### Issue: Mobile layout breaks

**Solution**: Test at specific breakpoints and request fixes.

```bash
# Better prompt
/ui-ux-pro-max test responsive layout at 375px, 768px, and 1024px.
Fix any horizontal scroll or broken layouts.
```

---

## Integration with Other Skills

### Combine with `/workflows:plan`

```bash
/workflows:plan I want to implement a user dashboard with UI/UX Pro Max.
Include design system generation, layout implementation, and browser testing.
```

### Combine with `/qa`

```bash
# After implementation
/qa test the dashboard UI for:
- Accessibility violations
- Color contrast issues
- Responsive breakpoints
- Dark mode consistency
```

### Combine with `/review`

```bash
# After implementation
/review check dashboard.blade.php for:
- Code quality
- Security (XSS prevention)
- Performance optimizations
```

---

## Real-World Example: Zonex Dashboard

**Task**: Create a dashboard for a geospatial alert notification system.

**Prompt**:
```bash
/ui-ux-pro-max design and implement a SaaS dashboard for Zonex (geospatial alerts).
Use flat design style with blue primary (#3B82F6). Include:
- Stats cards (total alerts, subscriptions, organizations, campaigns)
- Recent alerts list
- Active subscriptions list
- Quick action buttons
- Dark mode support
- Multilingual (EN/BG)
- Responsive mobile-first
- Real API data via Laravel backend
```

**What was created**:
1. **Design System** (design-system/zonex-dashboard/MASTER.md)
   - Flat design style definition
   - Complete color palette
   - Typography scale
   - Spacing system
   - Component specifications

2. **Layout** (resources/views/layouts/dashboard.blade.php)
   - Top navigation with logo
   - Desktop menu (hidden on mobile)
   - Mobile hamburger menu
   - Language switcher (EN/BG)
   - Dark mode toggle
   - User dropdown menu

3. **Dashboard View** (resources/views/dashboard.blade.php)
   - 4 stats cards with icons
   - Recent alerts section with empty states
   - Active subscriptions section with empty states
   - Quick actions grid
   - API integration with parallel requests
   - Loading skeletons
   - Error handling

4. **Translations**
   - lang/en/dashboard.php (English)
   - lang/bg/dashboard.php (Bulgarian)

5. **API Integration**
   - Nginx proxy for same-origin requests
   - JWT authentication
   - Parallel Promise.all() requests
   - Empty state rendering
   - XSS prevention (textContent, not innerHTML)

6. **Documentation**
   - DASHBOARD_IMPLEMENTATION.md
   - Testing checklist
   - Browser verification steps

**Token Usage**:
- Total: ~18,000 tokens (design + implementation + testing)
- Saved vs baseline: ~45% reduction

**Time Saved**:
- No manual design system research
- No component pattern searching
- No accessibility guideline lookups
- Immediate implementation with best practices

---

## Skill File Location

To install this skill manually:

```bash
mkdir -p ~/.claude/skills/ui-ux-pro-max
# Create SKILL.md with agent definition
```

Or use Claude Code's built-in skill:

```bash
/ui-ux-pro-max <your task>
```

---

## Related Skills

- `/debug` - Debug UI issues
- `/qa` - Test UI quality and accessibility
- `/review` - Code review for UI components
- `/workflows:plan` - Plan UI implementation workflows

---

## Version History

**v1.0.0** (2026-01-22)
- Initial documentation
- Based on Zonex dashboard implementation
- Includes 50 styles, 21 palettes, 50 font pairings
- shadcn/ui MCP integration
- Comprehensive technology stack support

---

**Created**: 2026-01-22
**Last Updated**: 2026-01-22
**Compatibility**: Claude Code (all versions), Claude Sonnet 4.5+
