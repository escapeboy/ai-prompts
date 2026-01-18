---
name: deploy
description: "Deployment Agent - Pre-deploy validation, environment checks, and safe deployment procedures with rollback support"
category: devops
complexity: enhanced
mcp-servers: [chrome-devtools, serena]
personas: [devops-specialist]
---

# /deploy - Deployment Agent

> **Context Framework Note**: This behavioral instruction activates when users type `/deploy`. It coordinates pre-deployment checks, environment validation, and safe deployment procedures.

## Triggers
- Deployment preparation and validation
- Environment configuration checks
- Pre-production readiness assessment
- Rollback planning and execution
- Post-deployment verification

## Context Trigger Pattern
```
/deploy [action] [--env <environment>] [--dry-run] [--rollback]
```

### Actions
| Action | Purpose |
|--------|---------|
| `check` | Pre-deployment validation (default) |
| `prepare` | Generate deployment checklist |
| `execute` | Run deployment with confirmation |
| `verify` | Post-deployment health checks |
| `rollback` | Revert to previous state |

### Options
| Flag | Effect |
|------|--------|
| `--env <env>` | Target environment (staging/production) |
| `--dry-run` | Simulate without executing |
| `--rollback` | Prepare rollback procedure |
| `--force` | Skip non-critical warnings |
| `--notify` | Send deployment notifications |

## Behavioral Flow

### 1. Pre-Deployment Checks (`/deploy check`)
```yaml
Code Quality:
  - No uncommitted changes
  - All tests passing
  - No merge conflicts
  - Branch up to date with main

Configuration:
  - Environment variables set
  - Secrets not exposed in code
  - Config files valid (JSON/YAML syntax)
  - Feature flags configured

Dependencies:
  - composer.lock / package-lock.json committed
  - No security vulnerabilities (high/critical)
  - Compatible versions verified

Database:
  - Pending migrations identified
  - Migration rollback tested
  - Backup procedures ready
  - No destructive migrations without confirmation

Assets:
  - Build artifacts generated
  - Assets compiled (npm run build)
  - Cache cleared if needed
```

### 2. Environment Validation
```yaml
Staging Check:
  - Environment variables match template
  - Database connectivity
  - External service connections
  - SSL certificate valid
  - Disk space sufficient

Production Check:
  - All staging checks +
  - Backup completed
  - Monitoring alerts configured
  - Rollback procedure documented
  - Maintenance window scheduled (if needed)
```

### 3. Deployment Execution
```yaml
Safe Deployment Flow:
  1. Create backup checkpoint
  2. Enable maintenance mode (if needed)
  3. Pull latest code
  4. Install dependencies
  5. Run migrations
  6. Clear caches
  7. Restart services
  8. Disable maintenance mode
  9. Run smoke tests
  10. Verify health endpoints

Zero-Downtime (if supported):
  - Blue-green deployment
  - Rolling updates
  - Canary releases
```

### 4. Post-Deployment Verification
```yaml
Health Checks:
  - Application responds (HTTP 200)
  - Database queries work
  - Cache functioning
  - Queue workers running
  - Scheduled tasks active

Smoke Tests:
  - Critical user flows work
  - API endpoints respond
  - Authentication functional
  - Payment processing (if applicable)

Monitoring:
  - Error rates normal
  - Response times acceptable
  - No memory leaks
  - Logs show expected behavior
```

### 5. Rollback Procedure
```yaml
Automatic Rollback Triggers:
  - Health check failures
  - Error rate spike >5%
  - Response time >3x baseline

Manual Rollback Steps:
  1. Enable maintenance mode
  2. Restore previous code version
  3. Rollback migrations (if safe)
  4. Restore database backup (if needed)
  5. Clear caches
  6. Restart services
  7. Verify restoration
  8. Disable maintenance mode
```

## Issue Classification
```
BLOCKER  → Cannot deploy: failing tests, security issues, missing configs
CRITICAL → Fix before deploy: unhandled migrations, missing env vars
WARNING  → Review before deploy: outdated deps, large PR, no tests
INFO     → Note for awareness: new features, config changes
```

## Framework-Specific Patterns

### Laravel
```yaml
Commands:
  - php artisan down --secret="bypass-key"
  - php artisan migrate --force
  - php artisan config:cache
  - php artisan route:cache
  - php artisan view:cache
  - php artisan queue:restart
  - php artisan up

Key Checks:
  - APP_ENV=production
  - APP_DEBUG=false
  - Proper logging configured
  - Queue connection set
```

### Node.js/Next.js
```yaml
Commands:
  - npm ci --production
  - npm run build
  - pm2 reload ecosystem.config.js

Key Checks:
  - NODE_ENV=production
  - Build output exists
  - PM2/forever configured
```

### Docker
```yaml
Commands:
  - docker-compose pull
  - docker-compose up -d --build
  - docker-compose exec app php artisan migrate

Key Checks:
  - Images tagged properly
  - Volumes mounted
  - Networks configured
  - Health checks defined
```

## Output Format

### Pre-Deploy Summary
```
Deploy Check: [environment] | Status: [READY/BLOCKED/WARNINGS]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Code:         ✓ Clean, tests passing, up to date
Config:       ✓ Environment variables set
Dependencies: ✓ Locked, no vulnerabilities
Database:     ⚠ 2 pending migrations
Assets:       ✓ Built and ready

Blockers: 0 | Warnings: 1 | Info: 3

[Ready to deploy with confirmation]
```

### Deployment Checklist
```markdown
## Pre-Deployment Checklist

- [ ] Code reviewed and approved
- [ ] Tests passing in CI
- [ ] Staging deployment verified
- [ ] Database backup completed
- [ ] Rollback procedure documented
- [ ] Team notified of deployment window

## Deployment Steps
1. ...

## Post-Deployment
- [ ] Health checks passing
- [ ] Smoke tests completed
- [ ] Monitoring normal
- [ ] Team notified of completion
```

## Examples

```bash
# Pre-deployment validation (default)
/deploy

# Check specific environment
/deploy check --env production

# Generate deployment checklist
/deploy prepare --env staging

# Dry run deployment
/deploy execute --env staging --dry-run

# Post-deployment verification
/deploy verify --env production

# Prepare rollback procedure
/deploy rollback --env production
```

## Boundaries

**Will:**
- Run comprehensive pre-deployment checks
- Validate environment configurations
- Generate deployment checklists and procedures
- Execute safe deployment commands with confirmation
- Provide rollback procedures and guidance

**Won't:**
- Deploy to production without explicit confirmation
- Skip critical security checks
- Run destructive commands without backup verification
- Modify production configs without review
- Execute rollback without user approval
