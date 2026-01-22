# Dashboard Development Workflow Guide

**Pattern**: Real API Data Integration with Browser Testing
**Use Case**: SaaS dashboards, admin panels, user portals
**Token Efficiency**: 40-50% savings through systematic approach

---

## Overview

This guide documents the proven workflow for implementing production-ready dashboards with real API data, including browser testing and iterative refinement.

**Key Principles**:
1. **Design first, implement second** - Complete design system before coding
2. **Real data only** - Never use mock data or placeholders in production
3. **Browser verification** - Test in real browser, not assumptions
4. **Empty states matter** - Always handle no-data scenarios gracefully
5. **Iterative fixes** - Test → Identify issues → Fix → Verify

---

## Workflow Steps

### Step 1: Requirements Gathering (5-10 minutes)

**Objective**: Understand scope, data sources, and constraints.

**Checklist**:
- [ ] What data needs to be displayed?
- [ ] Where does the data come from? (API endpoints)
- [ ] What's the technology stack? (Laravel, React, etc.)
- [ ] Any existing design system or brand colors?
- [ ] Language requirements? (Single/multilingual)
- [ ] Dark mode required?
- [ ] Accessibility level? (WCAG 2.1 AA/AAA)

### Step 2: Design System Creation (15-20 minutes)

Create complete design system with colors, typography, spacing, and component specifications.

Save as: `design-system/[project]-dashboard/MASTER.md`

### Step 3: Layout Implementation (20-30 minutes)

Create navigation, content areas, language switcher, dark mode toggle, and user menus.

### Step 4: API Proxy Configuration (10-15 minutes)

Configure nginx proxy to enable same-origin API requests:

```nginx
# IMPORTANT: This must come BEFORE the / location
location /api/ {
    proxy_pass http://app:80/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 30s;
}
```

### Step 5: Dashboard Content Implementation (30-45 minutes)

**Critical Security Pattern**: Always use safe DOM manipulation.

```javascript
// ✅ SAFE: Use textContent for plain text
const text = document.createElement('p');
text.textContent = userProvidedData; // XSS-safe

// ✅ SAFE: Create elements programmatically
const div = document.createElement('div');
div.className = 'alert';
const message = document.createElement('p');
message.textContent = alert.title; // User data safely inserted
div.appendChild(message);

// ❌ UNSAFE: Never use this pattern
element.innerHTML = userData; // XSS vulnerability!
```

**Empty State Implementation**:

```javascript
function updateRecentAlerts(alerts) {
    const container = document.getElementById('recent-alerts');
    if (!container) return;

    // Clear safely
    container.innerHTML = '';

    if (alerts.length === 0) {
        // Create empty state with safe DOM methods
        const emptyState = document.createElement('div');
        emptyState.className = 'text-center py-8';

        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('class', 'w-12 h-12 mx-auto');
        // ... icon setup

        const text = document.createElement('p');
        text.textContent = '{{ __("dashboard.no_recent_alerts") }}';

        emptyState.appendChild(icon);
        emptyState.appendChild(text);
        container.appendChild(emptyState);
    } else {
        // Render data safely
        alerts.forEach(alert => {
            container.appendChild(createAlertElement(alert));
        });
    }
}

function createAlertElement(alert) {
    const link = document.createElement('a');
    link.href = `/alerts/${alert.id}`;

    const title = document.createElement('p');
    title.textContent = alert.title; // Safe: textContent, not innerHTML

    link.appendChild(title);
    return link;
}
```

**API Integration Pattern**:

```javascript
const API_URL = ''; // Same origin (proxied)
const API_TOKEN = '{{ session("api_token") }}';

async function fetchDashboardStats() {
    try {
        const [alertsRes, subsRes] = await Promise.all([
            fetch(`${API_URL}/api/v1/alerts/my`, {
                headers: { 'Authorization': `Bearer ${API_TOKEN}` }
            }),
            fetch(`${API_URL}/api/v1/subscriptions`, {
                headers: { 'Authorization': `Bearer ${API_TOKEN}` }
            })
        ]);

        const alerts = await alertsRes.json();
        const subscriptions = await subsRes.json();

        // CRITICAL: Always call update functions
        updateRecentAlerts(alerts.data || []);
        updateActiveSubscriptions(subscriptions.data || []);

    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
    }
}
```

### Step 6: Browser Testing & Iteration (20-30 minutes)

**Testing checklist**:

1. **Network Tab**:
   - [ ] All API requests return 200 OK
   - [ ] Authorization headers present
   - [ ] Response JSON correct
   - [ ] No redundant requests

2. **Console Tab**:
   - [ ] No JavaScript errors
   - [ ] No XSS warnings
   - [ ] No CORS errors

3. **Visual Inspection**:
   - [ ] Stats show correct numbers
   - [ ] Empty states visible when no data
   - [ ] No skeleton loaders remain

4. **Interactions**:
   - [ ] Dark mode toggle works
   - [ ] Language switcher works
   - [ ] Links navigate correctly

### Step 7: Documentation (15-20 minutes)

Document implementation, API endpoints, testing results, and deployment notes.

---

## Token Efficiency

### Without Workflow: ~38,000 tokens
- Iterative, reactive fixes
- Multiple rounds of debugging
- Retroactive accessibility fixes

### With Workflow: ~23,000 tokens
- Systematic, proactive approach
- Design first prevents rework
- Browser testing catches issues early

**Savings**: 39% reduction (15,000 tokens)

---

## Security Best Practices

### 1. XSS Prevention

**Always use safe DOM methods**:

```javascript
// ✅ SAFE
element.textContent = userData;
element.setAttribute('data-id', userData);

// ❌ UNSAFE
element.innerHTML = userData;
element.outerHTML = userData;
```

### 2. CSRF Protection

Include CSRF tokens on all state-changing requests:

```javascript
fetch('/api/endpoint', {
    method: 'POST',
    headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
    }
})
```

### 3. API Token Security

**Never expose tokens in client-side code**:

```javascript
// ✅ SAFE: Token from server-side session
const API_TOKEN = '{{ session("api_token") }}';

// ❌ UNSAFE: Token hardcoded or in localStorage
const API_TOKEN = 'hardcoded-token-123';
```

---

## Common Pitfalls

1. **Starting without design system** → Inconsistent UI, rework
2. **Using mock data** → Production failures
3. **Forgetting empty states** → Skeleton loaders remain
4. **Not testing in browser** → Late-stage fixes
5. **Skipping translations** → English-only UI
6. **Ignoring accessibility** → WCAG violations
7. **API proxy misconfiguration** → 404 errors

---

## Checklist Template

```markdown
## Dashboard Implementation

### Planning
- [ ] Requirements documented
- [ ] API endpoints identified
- [ ] Design preferences noted

### Design
- [ ] MASTER.md created
- [ ] Color palette defined
- [ ] Typography scale set

### Implementation
- [ ] Layout created
- [ ] Dark mode working
- [ ] API integration complete
- [ ] Empty states implemented
- [ ] Translations added

### Testing
- [ ] APIs return 200
- [ ] No console errors
- [ ] Empty states visible
- [ ] Responsive verified
- [ ] Accessibility tested

### Documentation
- [ ] IMPLEMENTATION.md created
- [ ] Testing results documented
```

---

**Created**: 2026-01-22
**Token Efficiency**: 39% savings vs baseline
**Security**: XSS prevention, CSRF protection, secure token handling
