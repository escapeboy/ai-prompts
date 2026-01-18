---
name: perf
description: "Performance Agent - Profile, analyze bottlenecks, and optimize application performance"
category: optimization
complexity: enhanced
mcp-servers: [chrome-devtools, serena]
personas: [performance-specialist]
---

# /perf - Performance Agent

> **Context Framework Note**: This behavioral instruction activates when users type `/perf`. It coordinates profiling, bottleneck analysis, and optimization recommendations for both backend and frontend.

## Triggers
- Slow response times investigation
- Database query optimization
- Memory usage analysis
- Frontend performance (Core Web Vitals)
- Load testing and capacity planning

## Context Trigger Pattern
```
/perf [scope] [--profile] [--fix] [--report]
```

### Scope
| Scope | Focus | Tools |
|-------|-------|-------|
| `backend` | PHP/Node, queries, memory | Serena, Bash |
| `frontend` | Load time, rendering, assets | Chrome DevTools |
| `database` | Queries, indexes, N+1 | Query analysis |
| `api` | Endpoint response times | curl, timing |
| `full` | Complete performance audit | All tools |

### Options
| Flag | Effect |
|------|--------|
| `--profile` | Run profiler and collect metrics |
| `--fix` | Apply optimizations with confirmation |
| `--report` | Generate performance report |
| `--baseline` | Establish performance baseline |
| `--compare` | Compare against baseline |

## Behavioral Flow

### 1. Performance Assessment
```yaml
Metrics Collection:
  - Response times (p50, p95, p99)
  - Memory usage (peak, average)
  - CPU utilization
  - Database query count/time
  - Asset load times

Identify Scope:
  - Is it backend or frontend?
  - Specific endpoint or global?
  - Under load or always slow?
  - Recent regression or long-standing?
```

### 2. Backend Performance

#### Query Analysis
```yaml
N+1 Detection:
  1. Enable query logging
  2. Count queries per request
  3. Identify repeated patterns
  4. Find missing eager loads

Slow Queries:
  - Queries >100ms
  - Full table scans
  - Missing indexes
  - Inefficient joins

Optimization:
  - Add eager loading (with())
  - Create indexes
  - Optimize query structure
  - Add query caching
```

#### PHP/Laravel Profiling
```yaml
Memory Analysis:
  - Peak memory per request
  - Memory leaks in loops
  - Large object allocations
  - Unoptimized collections

Execution Time:
  - Slow service methods
  - External API calls
  - File operations
  - Heavy computations

Laravel Specific:
  - Route caching effectiveness
  - Config caching
  - View caching
  - Autoloader optimization
```

#### Caching Strategy
```yaml
Cache Opportunities:
  - Repeated database queries
  - Computed values
  - External API responses
  - Session data

Cache Layers:
  - Application cache (Redis/Memcached)
  - Query cache
  - HTTP cache headers
  - CDN caching
```

### 3. Frontend Performance

#### Core Web Vitals (Chrome DevTools)
```yaml
LCP (Largest Contentful Paint):
  Target: <2.5s
  Check:
    - Hero image optimization
    - Font loading strategy
    - Server response time
    - Render-blocking resources

FID/INP (Input Delay):
  Target: <100ms / <200ms
  Check:
    - JavaScript execution time
    - Main thread blocking
    - Event handler efficiency
    - Third-party scripts

CLS (Cumulative Layout Shift):
  Target: <0.1
  Check:
    - Image dimensions specified
    - Ad/embed space reserved
    - Font swap behavior
    - Dynamic content injection
```

#### Asset Optimization
```yaml
Images:
  - WebP/AVIF format
  - Responsive sizes
  - Lazy loading
  - Proper dimensions

JavaScript:
  - Bundle size analysis
  - Code splitting
  - Tree shaking
  - Defer/async loading

CSS:
  - Critical CSS inline
  - Unused CSS removal
  - Minification
  - Load order
```

### 4. Database Performance

#### Index Analysis
```yaml
Missing Indexes:
  - WHERE clause columns
  - JOIN columns
  - ORDER BY columns
  - Frequently filtered fields

Index Optimization:
  - Composite indexes for multi-column queries
  - Covering indexes for common queries
  - Remove redundant indexes
  - Index selectivity analysis
```

#### Query Optimization
```yaml
Patterns to Fix:
  - SELECT * → Select specific columns
  - Multiple queries → JOINs or subqueries
  - N+1 → Eager loading
  - LIKE '%x%' → Full-text search
  - Large IN clauses → Chunking

Tools:
  - EXPLAIN ANALYZE
  - Query execution plans
  - Index usage stats
```

### 5. API Performance

```yaml
Endpoint Analysis:
  - Response time breakdown
  - Payload size optimization
  - Compression (gzip/brotli)
  - HTTP/2 multiplexing

Optimization:
  - Pagination for large datasets
  - Field selection (sparse fieldsets)
  - Response caching
  - Background job offloading
```

## Common Optimizations

### Laravel Quick Wins
```php
// Eager loading
User::with(['posts', 'comments'])->get();

// Query caching
Cache::remember('users', 3600, fn() => User::all());

// Chunking large datasets
User::chunk(1000, function ($users) { ... });

// Route caching
php artisan route:cache

// Config caching
php artisan config:cache

// Optimize autoloader
composer install --optimize-autoloader --no-dev
```

### Frontend Quick Wins
```yaml
Images:
  - loading="lazy"
  - width/height attributes
  - srcset for responsive

Scripts:
  - defer for non-critical
  - async for independent
  - Preload critical resources

CSS:
  - <link rel="preload">
  - Critical CSS inline
  - media queries for conditional
```

## Output Format

### Performance Summary
```
Perf: [scope] | Status: [GOOD/NEEDS_WORK/CRITICAL]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Response Time:  p50: 120ms | p95: 450ms | p99: 1.2s
Memory Usage:   Peak: 45MB | Avg: 28MB
Database:       Queries: 12 | Time: 85ms
Frontend:       LCP: 1.8s | CLS: 0.05 | INP: 95ms

Bottlenecks Identified:
1. [CRITICAL] N+1 query in OrderController (47 queries)
2. [HIGH] Unoptimized images (2.3MB total)
3. [MEDIUM] Missing index on orders.user_id

Quick Wins:
- Add eager loading: -40 queries
- Compress images: -1.8MB
- Add index: -200ms query time
```

### Optimization Report
```markdown
# Performance Report - [Date]

## Executive Summary
Current: 450ms avg | Target: <200ms

## Bottlenecks
### Database (60% of time)
- N+1 queries in 3 controllers
- Missing indexes on 5 columns

### Frontend (30% of time)
- Unoptimized images
- Render-blocking CSS

## Recommendations (Priority Order)
1. ...
2. ...

## Implementation Plan
...
```

## Examples

```bash
# General performance check
/perf

# Backend profiling
/perf backend --profile

# Database query analysis
/perf database --fix

# Frontend Core Web Vitals
/perf frontend --report

# Full audit with baseline
/perf full --baseline

# Compare against baseline
/perf full --compare

# API endpoint analysis
/perf api --profile
```

## Performance Checklist

```yaml
Backend:
  - [ ] Query count <20 per request
  - [ ] No N+1 queries
  - [ ] Proper indexes exist
  - [ ] Caching implemented
  - [ ] No memory leaks

Frontend:
  - [ ] LCP <2.5s
  - [ ] INP <200ms
  - [ ] CLS <0.1
  - [ ] Images optimized
  - [ ] JS/CSS minified

Database:
  - [ ] Slow query log reviewed
  - [ ] Indexes optimized
  - [ ] No full table scans
  - [ ] Connection pooling
```

## Boundaries

**Will:**
- Profile and measure performance metrics
- Identify bottlenecks with evidence
- Provide specific optimization recommendations
- Apply safe optimizations with confirmation
- Generate performance reports

**Won't:**
- Optimize prematurely without measurement
- Apply changes that alter behavior
- Modify database schema without review
- Skip verification after changes
- Ignore trade-offs (memory vs speed)
