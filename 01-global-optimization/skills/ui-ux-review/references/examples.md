# Worked examples per audit step

Read this while doing Steps 2-5 of the Review Process in SKILL.md, for what the extracted output and the kind of finding should look like.

### Step 2: Analyze Design System

Extract and document:

**Colors**:
```javascript
// From tailwind.config.js or CSS variables
Primary: #3B82F6 (blue-500)
Secondary: #10B981 (green-500)
Danger: #EF4444 (red-500)
Warning: #F59E0B (yellow-500)
Neutral: Gray scale (50-900)
```

**Typography**:
```javascript
// Font scale
xs: 0.75rem (12px)
sm: 0.875rem (14px)
base: 1rem (16px)
lg: 1.125rem (18px)
xl: 1.25rem (20px)
// etc.
```

**Spacing**:
```javascript
// Spacing scale (if using 4px/8px grid)
1: 0.25rem (4px)
2: 0.5rem (8px)
4: 1rem (16px)
8: 2rem (32px)
// etc.
```

### Step 3: Component Inventory

List all UI components found:

```markdown
## Components Found

### Interactive Elements
- Buttons (app/Livewire/Components/Button.php) - 3 variants
- Links (scattered in views)
- Icon buttons (inline implementations)

### Forms
- Text inputs (standard HTML)
- Textareas (standard HTML)
- Selects (standard HTML)
- Checkboxes (custom styling)
- Radio buttons (standard HTML)
- File uploads (app/Livewire/FileUpload.php)

### Containers
- Cards (repeated pattern, not componentized)
- Modals (app/Livewire/Modal.php)
- Alerts/Toasts (app/Livewire/Toast.php)

### Navigation
- Main nav (resources/views/layouts/nav.blade.php)
- Mobile menu (Alpine.js implementation)
- Breadcrumbs (not found)
- Pagination (Laravel default)

### Data Display
- Tables (standard HTML)
- Lists (standard HTML)
- Badges (inline styling)
- Avatars (not found)
```

### Step 4: Check Consistency

Compare similar elements across the codebase:

**Button Analysis**:
```php
// app/Livewire/AlertCreator.php:45
<button class="px-4 py-2 bg-blue-500 text-white rounded">
  Create Alert
</button>

// app/Livewire/CampaignManager.php:67
<button class="px-3 py-2 bg-blue-600 text-white rounded-md">
  Save Campaign
</button>

// app/Livewire/OrganizationSettings.php:89
<button class="px-4 py-2 bg-primary text-white rounded-lg">
  Update Settings
</button>

Issues found:
- Inconsistent padding (px-4 vs px-3, py-2 consistent)
- Different blue shades (bg-blue-500 vs bg-blue-600 vs bg-primary)
- Different border radius (rounded vs rounded-md vs rounded-lg)
```

### Step 5: Evaluate Accessibility

Check WCAG compliance:

**Color Contrast**:
```markdown
Text on backgrounds:
- #000000 on #FFFFFF: 21:1 ✓ (exceeds WCAG AAA)
- #3B82F6 on #FFFFFF: 4.6:1 ✓ (meets WCAG AA)
- #6B7280 on #FFFFFF: 4.5:1 ✓ (meets WCAG AA)
- #D1D5DB on #FFFFFF: 1.5:1 ✗ (fails WCAG AA)

Link colors:
- Default: #3B82F6 on #FFFFFF: 4.6:1 ✓
- Hover: #2563EB on #FFFFFF: 5.9:1 ✓
```

**Keyboard Navigation**:
```markdown
Focus indicators:
- ✓ Forms: Visible outline on focus
- ✗ Buttons: No visible focus state
- ✗ Links: No visible focus state
- ✓ Modals: Focus trap implemented

Tab order:
- ✓ Follows DOM order
- ✗ Skip links missing
- ✗ Focus not restored after modal close
```

**Semantic HTML**:
```markdown
- ✓ Proper heading hierarchy (h1 → h2 → h3)
- ✗ Missing landmark regions (nav, main, aside)
- ✓ Lists use <ul>/<ol> appropriately
- ✗ Buttons use <div> instead of <button> in some places
```
