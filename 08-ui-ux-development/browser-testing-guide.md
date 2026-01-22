# Browser Testing Guide for Claude Code

**Purpose**: Systematic browser testing patterns for UI implementation
**Tool**: Chrome DevTools via Claude in Chrome MCP
**Token Savings**: 30-40% through structured testing approach

---

## Overview

This guide provides systematic patterns for testing UI implementations in real browsers using Claude Code's Chrome automation capabilities.

**Key Benefits**:
1. **Real environment testing** - Not assumptions or simulations
2. **Automated verification** - Claude can inspect DOM, network, console
3. **Screenshot evidence** - Visual proof of implementation
4. **Iterative fixes** - Test → Document → Fix → Verify loop

---

## Prerequisites

**Required MCP Server**: `claude-in-chrome`

**Verification**:
```bash
# Claude Code should have access to these tools:
- tabs_context_mcp
- navigate
- computer (screenshot, click, type)
- read_page
- read_console_messages
- read_network_requests
```

---

## Testing Workflow

### Step 1: Initialize Browser Session

**Pattern**: Always get context first.

```bash
# In Claude Code conversation
"Open Chrome and navigate to http://localhost:3000/dashboard"
```

**What Claude does**:
1. Calls `tabs_context_mcp` to get available tabs
2. Creates new tab if needed
3. Navigates to URL
4. Waits for page load

**Verify tab is ready**:
```bash
"Take a screenshot to show current state"
```

### Step 2: Network Inspection

**Pattern**: Check API requests before visual testing.

**Request**:
```bash
"Show me all network requests to /api/ endpoints"
```

**What Claude checks**:
- HTTP status codes (200 OK, 404, 500, etc.)
- Request headers (Authorization token)
- Response content type (application/json)
- Response body structure

**Example output**:
```markdown
Found 4 API requests:

1. GET /api/v1/alerts/my - 200 OK
   Headers: Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
   Response: {"success":true,"data":[...]}

2. GET /api/v1/subscriptions - 200 OK
   Response: {"success":true,"data":[...]}

3. GET /api/v1/organizations - 200 OK
   Response: {"success":true,"data":[...]}

4. GET /api/v1/campaigns - 200 OK
   Response: {"success":true,"data":[...]}
```

**Red flags**:
- ❌ 404 responses → API proxy misconfigured
- ❌ 401 responses → Authentication failure
- ❌ 500 responses → Server error
- ❌ HTML responses on JSON endpoints → Wrong content type

### Step 3: Console Inspection

**Pattern**: Check for JavaScript errors.

**Request**:
```bash
"Check the browser console for any errors or warnings"
```

**What Claude reports**:
- JavaScript errors with stack traces
- Network errors
- Security warnings (CORS, CSP, mixed content)
- Application-specific log messages

**Example output**:
```markdown
Console Messages:

[ERROR] TypeError: Cannot read property 'length' of undefined
  at updateRecentAlerts (dashboard.blade.php:289)
  at fetchDashboardStats (dashboard.blade.php:220)

[WARNING] CORS policy blocked request to http://app:80/api/v1/alerts
```

**Green flags**:
- ✅ No error messages
- ✅ Only info/debug logs
- ✅ Successful API call logs

### Step 4: Visual Verification

**Pattern**: Screenshot + element inspection.

**Request**:
```bash
"Take a screenshot and verify that:
1. Stats cards show correct numbers
2. Recent alerts section shows empty state (not skeleton loader)
3. Dark mode toggle is visible
4. Language switcher shows both languages"
```

**What Claude does**:
1. Takes full-page screenshot
2. Reads page accessibility tree
3. Finds specific elements by text/role
4. Reports findings with screenshot

**Example response**:
```markdown
Screenshot captured. Verification results:

✅ Stats cards visible:
   - Total Alerts: 0
   - Active Subscriptions: 0
   - Organizations: 0
   - Campaigns: 0

✅ Recent Alerts section shows empty state:
   - Bell icon visible
   - Text: "No recent alerts"

✅ Dark mode toggle visible (sun icon)

✅ Language switcher shows: "English", "Български"

Issues found:
❌ Active Subscriptions section still shows skeleton loader
```

### Step 5: Interaction Testing

**Pattern**: Simulate user actions.

**Request**:
```bash
"Click the dark mode toggle and verify the page switches to dark mode"
```

**What Claude does**:
1. Finds dark mode toggle button
2. Clicks it
3. Waits for transition
4. Takes screenshot
5. Verifies dark mode classes applied

**Example response**:
```markdown
Dark mode toggle clicked.

Before: bg-white, text-slate-900
After: bg-slate-900, text-slate-50

✅ Dark mode activated successfully
Screenshot shows dark theme applied to all elements.
```

**More interaction tests**:

```bash
# Language switching
"Click the English language link and verify text changes"

# Dropdown menus
"Click the user menu and verify dropdown opens"

# Form submission
"Fill the search form with 'earthquake' and submit"

# Responsive testing
"Resize window to 375px width and verify mobile layout"
```

### Step 6: Responsive Testing

**Pattern**: Test at standard breakpoints.

**Request**:
```bash
"Resize browser to 375px width and take screenshot to verify mobile layout"
```

**Standard breakpoints to test**:
- 375px - Mobile (iPhone SE)
- 768px - Tablet (iPad portrait)
- 1024px - Desktop (laptop)
- 1440px - Large desktop

**What Claude verifies**:
- [ ] No horizontal scroll
- [ ] Touch targets ≥ 44x44px
- [ ] Text readable (not too small)
- [ ] Images scale appropriately
- [ ] Navigation adapts (hamburger menu on mobile)

### Step 7: Accessibility Testing

**Pattern**: Keyboard navigation + contrast checks.

**Request**:
```bash
"Test keyboard navigation: press Tab key 5 times and verify focus indicators are visible"
```

**What Claude checks**:
- [ ] Focus ring visible on all interactive elements
- [ ] Logical tab order (top to bottom, left to right)
- [ ] Skip-to-content link accessible
- [ ] Dropdown menus keyboard-accessible

**Contrast testing**:
```bash
"Check if text contrast ratios meet WCAG 2.1 AA standard (4.5:1 for normal text)"
```

**What Claude reports**:
- Background color: #FFFFFF
- Text color: #64748B (slate-500)
- Contrast ratio: 3.7:1 ❌ Fails AA (needs 4.5:1)
- Recommendation: Use slate-600 (#475569) for 5.2:1

---

## Common Testing Patterns

### Pattern 1: Full Dashboard Audit

```bash
"Audit the dashboard at /dashboard:
1. Check all API requests return 200
2. Verify no console errors
3. Test dark mode toggle
4. Test language switcher
5. Verify empty states show when no data
6. Test responsive at 375px, 768px, 1024px
7. Take screenshots of each state"
```

**Token efficiency**: Single comprehensive request vs multiple small requests.

### Pattern 2: API Integration Verification

```bash
"Verify API integration:
1. Clear browser cache and reload
2. Show network requests filtered by /api/
3. Report status codes, response times, and any errors
4. Verify Authorization header present on all requests"
```

### Pattern 3: Empty State Verification

```bash
"Verify empty states are showing correctly:
1. Check Recent Alerts section for empty state message and icon
2. Check Active Subscriptions section for empty state message and icon
3. Confirm no skeleton loaders remain visible
4. Take screenshot showing both empty states"
```

### Pattern 4: Dark Mode Testing

```bash
"Test dark mode thoroughly:
1. Toggle to dark mode
2. Verify all text readable (check contrast)
3. Verify all icons visible
4. Check that preference persists (reload page)
5. Take screenshots of light and dark modes side by side"
```

### Pattern 5: Multi-Language Testing

```bash
"Test language switching:
1. Switch to Bulgarian
2. Verify all UI text translated (nav, buttons, empty states)
3. Take screenshot
4. Switch back to English
5. Verify preference persists after reload"
```

---

## Debugging Workflows

### Workflow 1: API Not Loading

**Symptoms**: Skeleton loaders remain, no data displays.

**Debugging sequence**:
```bash
1. "Show network requests to /api/ endpoints"
   → Check for 404, 401, 500 errors

2. "Show console errors"
   → Look for fetch failures, CORS errors

3. "Show me the API_URL and API_TOKEN values in the page"
   → Verify configuration correct

4. "Test API endpoint directly: curl http://localhost:8005/api/v1/alerts/my"
   → Verify endpoint accessible
```

### Workflow 2: Empty States Not Showing

**Symptoms**: Skeleton loaders remain even when API returns 200 OK.

**Debugging sequence**:
```bash
1. "Show network request for /api/v1/alerts/my and display response body"
   → Verify API returning empty array []

2. "Show console logs when page loads"
   → Check if update functions being called

3. "Read the JavaScript in dashboard.blade.php around line 220"
   → Check conditional logic

4. "Find where updateRecentAlerts is called"
   → Verify it's called with empty array, not skipped
```

### Workflow 3: Dark Mode Not Persisting

**Symptoms**: Dark mode resets to light on page reload.

**Debugging sequence**:
```bash
1. "Toggle dark mode and show localStorage contents"
   → Verify 'dark' key stored

2. "Show console errors after toggling"
   → Check for JavaScript errors

3. "Reload page and check if dark class applied to html element"
   → Verify dark mode initialization script runs

4. "Read the dark mode initialization code in the <head> section"
   → Check inline script for syntax errors
```

---

## Best Practices

### 1. Always Start Fresh

```bash
# Hard refresh to clear cache
"Hard refresh the page (Cmd+Shift+R) and wait 3 seconds"
```

**Why**: Cached JavaScript/CSS may hide issues.

### 2. Document Issues Systematically

```markdown
## Issue 1: Empty States Not Showing

**Expected**: Empty state with icon and message
**Actual**: Skeleton loaders remain
**Location**: Recent Alerts section
**Screenshot**: [attached]
**Console errors**: None
**Network requests**: All 200 OK
**Root cause**: Update function not called when data empty
```

### 3. Test One Change at a Time

```bash
# Bad: Multiple changes without testing
"Fix dark mode, empty states, and responsive layout"

# Good: One fix, then verify
"Fix empty state for Recent Alerts section"
"Verify the fix: hard refresh and check if empty state shows"
```

### 4. Use Specific Selectors

```bash
# Bad: Ambiguous
"Click the button"

# Good: Specific
"Click the dark mode toggle button (sun/moon icon in top right)"
```

### 5. Take Screenshots as Evidence

```bash
"Take screenshots showing:
1. Before fix: skeleton loaders visible
2. After fix: empty states showing
3. Side-by-side comparison"
```

---

## Token Optimization

### Technique 1: Batch Requests

```bash
# ❌ Inefficient (multiple messages)
"Show network requests"
"Show console errors"
"Take screenshot"
"Check empty states"

# ✅ Efficient (single message)
"Verify dashboard functionality:
1. Show network requests (/api/ only)
2. Check console for errors
3. Take screenshot
4. Verify empty states visible"
```

**Savings**: ~40% fewer tokens

### Technique 2: Conditional Testing

```bash
# Only test if previous step passes
"If all API requests return 200 OK, then verify empty states are showing.
Otherwise, report the API errors first."
```

### Technique 3: Targeted Verification

```bash
# ❌ Generic request
"Test everything"

# ✅ Specific scope
"Test only the empty state implementation for Recent Alerts and Active Subscriptions"
```

**Savings**: ~50% fewer tokens

---

## Integration with Workflows

### Workflow: `/workflows:plan` + Browser Testing

```bash
/workflows:plan "Implement dashboard with real API data and verify in browser"
```

**Claude's plan includes**:
1. Design system generation
2. Layout implementation
3. API integration
4. **Browser testing phase**:
   - Network verification
   - Console check
   - Visual verification
   - Interaction testing

### Workflow: UI Implementation → Automated Testing

```markdown
## Implementation Plan

### Phase 1: Implement
- Create layout
- Add API integration
- Implement empty states

### Phase 2: Browser Test
- Open Chrome
- Verify network requests
- Check console
- Test interactions
- Take screenshots

### Phase 3: Fix Issues
- Document findings
- Apply fixes
- Re-test

### Phase 4: Final Verification
- Full audit
- All checks passing
- Screenshots archived
```

---

## Troubleshooting

### Issue: Claude can't find browser tab

**Error**: "No tabs available in MCP tab group"

**Solution**:
```bash
"Create a new browser tab and navigate to the dashboard"
# Claude calls tabs_context_mcp with createIfEmpty: true
```

### Issue: Elements not found

**Error**: "Element not found: dark mode toggle"

**Solution**:
```bash
# Use accessibility tree search
"Find all buttons on the page"
# Then click by ref
"Click button ref_5 (dark mode toggle)"
```

### Issue: Network requests empty

**Error**: "No network requests found"

**Solution**:
```bash
# Console tracking starts when first called
"Refresh page, then show network requests after 3 seconds"
```

---

## Checklist Template

```markdown
## Browser Testing Checklist

### Network Layer
- [ ] All API requests return 200 OK
- [ ] Authorization headers present
- [ ] JSON responses valid
- [ ] Response times < 500ms

### JavaScript Layer
- [ ] No console errors
- [ ] No warnings
- [ ] Application logs normal

### Visual Layer
- [ ] Data displays correctly
- [ ] Empty states show when no data
- [ ] No skeleton loaders remain
- [ ] Icons render properly

### Interaction Layer
- [ ] Dark mode toggle works
- [ ] Language switcher works
- [ ] Links navigate correctly
- [ ] Dropdowns open/close

### Responsive Layer
- [ ] 375px (mobile): single column
- [ ] 768px (tablet): two columns
- [ ] 1024px (desktop): four columns
- [ ] No horizontal scroll at any size

### Accessibility Layer
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Contrast ratios ≥ 4.5:1
- [ ] Screen reader friendly
```

---

**Created**: 2026-01-22
**Tool**: Claude in Chrome MCP
**Token Savings**: 30-40% through systematic testing
