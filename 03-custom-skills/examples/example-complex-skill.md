---
name: deploy
description: Deploy application to staging or production environments
version: 1.0.0
model: claude-sonnet-4-5-20250929
requires: [git, ssh]
tags: [deployment, devops, ci-cd]
---

# Deploy

Complete deployment workflow for staging and production environments. Includes pre-flight checks, build steps, deployment, and post-deployment verification.

---

## Usage

```
/deploy [environment] [options]
```

### Quick Examples

```bash
/deploy                     # Deploy to staging (default)
/deploy staging             # Explicit staging deploy
/deploy production          # Deploy to production
/deploy production --force  # Skip confirmations
/deploy --dry-run           # Preview deployment steps
```

---

## Actions

### 1. Deploy to Staging (Default)

When invoked without arguments or with `staging`, deploys to staging environment.

**Usage**:
```
/deploy
/deploy staging
```

**Process**:

#### Step 1: Pre-Flight Checks
1. Verify on correct branch (main or release/*)
2. Check for uncommitted changes
3. Verify all tests pass
4. Check build succeeds

#### Step 2: Prepare Deployment
1. Create deployment tag: `staging-YYYYMMDD-HHMMSS`
2. Update version in application files
3. Generate changelog since last deployment

#### Step 3: Build
1. Run production build:
   - `npm run build` (frontend)
   - `composer install --no-dev` (backend)
2. Optimize assets
3. Clear and rebuild caches

#### Step 4: Deploy
1. SSH to staging server
2. Pull latest code
3. Run migrations
4. Clear application caches
5. Restart workers/services

#### Step 5: Verify
1. Run smoke tests against staging
2. Check application health endpoint
3. Verify key features work

**Example Output**:
```
🚀 Deploying to STAGING

Pre-flight checks:
  ✅ On branch: main
  ✅ No uncommitted changes
  ✅ Tests pass (42 passed)
  ✅ Build succeeds

Preparing deployment:
  ✅ Created tag: staging-20260104-143022
  ✅ Updated version: 1.5.3

Building:
  ✅ Frontend built (32s)
  ✅ Backend optimized (8s)

Deploying:
  ✅ Connected to staging.example.com
  ✅ Code pulled
  ✅ Migrations run (3 new)
  ✅ Caches cleared
  ✅ Workers restarted

Verification:
  ✅ Health check passed
  ✅ Smoke tests passed (5/5)

🎉 Deployment complete!
   URL: https://staging.example.com
   Version: 1.5.3
   Duration: 2m 34s
```

---

### 2. Deploy to Production

Deploy to production with additional safety checks.

**Usage**:
```
/deploy production
/deploy production --force
```

**Additional Safety Checks**:
1. Require explicit confirmation
2. Verify staging deployment succeeded
3. Check production health before deploy
4. Create full database backup
5. Notify team via Slack/Teams

**Process**:

#### Step 1: Extended Pre-Flight
1. All staging checks
2. Verify staging version matches
3. Check no active incidents
4. Confirm during deployment window

#### Step 2: Backup
1. Create database backup
2. Create asset backup
3. Store backup references

#### Step 3: Deploy
1. Put application in maintenance mode
2. Deploy code
3. Run migrations
4. Clear caches
5. Warm caches
6. Disable maintenance mode

#### Step 4: Verify
1. Run production smoke tests
2. Check metrics dashboards
3. Monitor error rates

#### Step 5: Notify
1. Send Slack notification
2. Update status page
3. Log deployment

**Confirmation Prompt**:
```
⚠️  PRODUCTION DEPLOYMENT

You are about to deploy to PRODUCTION:
  - Current version: 1.5.2
  - New version: 1.5.3
  - Changes: 12 commits, 34 files

This will affect all users.

Type 'yes' to proceed, or 'no' to cancel:
```

---

### 3. Rollback

Rollback to previous version.

**Usage**:
```
/deploy rollback
/deploy rollback --version=1.5.1
```

**Process**:
1. Identify previous stable version
2. Confirm rollback
3. Deploy previous version
4. Verify rollback successful
5. Create incident report

---

### 4. Status

Check deployment status and history.

**Usage**:
```
/deploy status
/deploy status production
```

**Output**:
```
Deployment Status

STAGING:
  Current version: 1.5.3
  Last deployed: 2026-01-04 14:30:22
  Deployed by: john@example.com
  Health: ✅ Healthy

PRODUCTION:
  Current version: 1.5.2
  Last deployed: 2026-01-02 09:15:00
  Deployed by: jane@example.com
  Health: ✅ Healthy

Recent Deployments:
  2026-01-04 14:30 | staging    | 1.5.3 | john@example.com
  2026-01-02 09:15 | production | 1.5.2 | jane@example.com
  2026-01-02 08:45 | staging    | 1.5.2 | jane@example.com
```

---

## Options

### Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--dry-run` | `-n` | Preview steps without executing |
| `--force` | `-f` | Skip confirmations (careful!) |
| `--verbose` | `-v` | Show detailed output |
| `--skip-tests` | | Skip test step (not recommended) |
| `--skip-backup` | | Skip backup step (dangerous!) |
| `--no-notify` | | Skip notifications |

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--branch=NAME` | Deploy specific branch | Current branch |
| `--version=TAG` | Deploy specific version | Latest |
| `--timeout=SECONDS` | Deployment timeout | 300 |

---

## Prerequisites

Before using this skill, ensure:

- [ ] SSH access to deployment servers configured
- [ ] Deployment scripts in `scripts/deploy/` directory
- [ ] Environment variables set:
  - `STAGING_HOST` - Staging server address
  - `PRODUCTION_HOST` - Production server address
  - `SLACK_WEBHOOK` - For notifications
- [ ] Database backup system configured
- [ ] Smoke test suite available

---

## Configuration

### Deployment Config

**File**: `.claude/settings/deploy.json`

```json
{
  "environments": {
    "staging": {
      "host": "staging.example.com",
      "user": "deploy",
      "path": "/var/www/app",
      "branch": "main",
      "auto_confirm": true
    },
    "production": {
      "host": "production.example.com",
      "user": "deploy",
      "path": "/var/www/app",
      "branch": "main",
      "auto_confirm": false,
      "require_staging": true,
      "backup_before": true
    }
  },
  "notifications": {
    "slack": {
      "webhook": "${SLACK_WEBHOOK}",
      "channel": "#deployments"
    }
  },
  "health_check": {
    "endpoint": "/health",
    "timeout": 30,
    "retries": 3
  }
}
```

### Server Setup

Each server should have:
```bash
# /var/www/app/deploy.sh
#!/bin/bash
git fetch --all
git checkout $1
composer install --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart
```

---

## Integration

### With Other Skills

| Skill | Integration |
|-------|-------------|
| `/format` | Run before deployment to ensure code is formatted |
| `/test` | Run tests as part of pre-flight checks |
| `/commit` | Commit any last changes before deploy |
| `/cache-inspector` | Clear caches after deployment |

### With CI/CD

This skill can be called from CI/CD pipelines:

```yaml
# GitHub Actions
deploy:
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to staging
      if: github.ref == 'refs/heads/main'
      run: /deploy staging --force
```

### With Monitoring

Post-deployment, the skill can:
- Check error rates in Sentry
- Verify metrics in Datadog/New Relic
- Monitor logs for errors

---

## Token Optimization

**Estimated token usage**:
- Staging deploy: ~3-5K tokens
- Production deploy: ~5-8K tokens
- Rollback: ~2-3K tokens
- Status check: ~1K tokens

**Optimization features**:
- Loads only necessary context
- Uses shell commands for heavy lifting
- Minimal file reading (symbol-first for configs)

---

## Safety Considerations

### Destructive Operations

This skill performs potentially destructive operations:

| Operation | Risk | Safeguard |
|-----------|------|-----------|
| Database migrations | Data loss | Backup before |
| Cache clearing | Performance dip | Warm caches after |
| Worker restart | Job interruption | Graceful restart |
| Code deployment | Breaking changes | Staging first |

### Production Safety

1. **Staging First**: Production deploys verify staging succeeded
2. **Backup Required**: Database backup before production deploy
3. **Confirmation**: Manual confirmation for production
4. **Rollback Ready**: Previous version tagged for quick rollback
5. **Monitoring**: Health checks during and after deployment

### Emergency Procedures

If deployment fails:

1. **Auto-rollback**: Triggered if health checks fail
2. **Manual rollback**: `/deploy rollback`
3. **Incident creation**: Automatic incident report

---

## Error Handling

### Pre-Flight Failures

**Symptom**: Pre-flight checks fail

**Common causes**:
- Uncommitted changes: `git status` shows changes
- Tests failing: Run `php artisan test` to see failures
- Build errors: Check build output

**Solution**: Fix the underlying issue before deploying.

---

### SSH Connection Failed

**Symptom**: Cannot connect to server

**Check**:
1. SSH key configured: `ssh-add -l`
2. Server accessible: `ssh deploy@server.example.com`
3. Correct host in config

---

### Migration Failed

**Symptom**: Deployment fails during migrations

**Response**:
1. Deployment is automatically rolled back
2. Check migration error in logs
3. Fix migration locally
4. Re-deploy

---

### Health Check Failed

**Symptom**: Post-deployment health checks fail

**Response**:
1. Auto-rollback triggered
2. Check application logs
3. Verify configuration
4. Re-deploy after fix

---

## Troubleshooting

### Deployment Stuck

**Symptom**: Deployment hangs

**Fix**:
1. Check server SSH: `ssh deploy@server`
2. Check running processes: `ps aux | grep deploy`
3. Kill stuck process if needed
4. Re-run deployment

### Wrong Environment

**Symptom**: Deployed to wrong environment

**Fix**:
1. Immediately rollback: `/deploy rollback`
2. Deploy to correct environment
3. Review deployment logs

### Notification Failures

**Symptom**: Slack notifications not sent

**Fix**:
1. Check `SLACK_WEBHOOK` environment variable
2. Test webhook manually
3. Check Slack channel permissions

---

## Examples

### Example 1: Standard Staging Deploy

**Situation**: Deploy latest main branch to staging for QA.

```
/deploy staging
```

**Result**: Full deployment with all checks, notifications sent to team.

---

### Example 2: Production Deploy with Confirmation

**Situation**: QA approved, ready for production.

```
/deploy production
```

**Prompt**: Confirmation required, backup created, team notified.

---

### Example 3: Emergency Hotfix

**Situation**: Critical bug in production, need to deploy fix fast.

```
/deploy production --force --skip-tests
```

**Result**: Deploys without waiting for tests (use sparingly!).

---

### Example 4: Rollback After Issues

**Situation**: Users reporting errors after deployment.

```
/deploy rollback
```

**Result**: Previous version restored, team notified.

---

### Example 5: Preview Deployment

**Situation**: New developer wants to understand deployment process.

```
/deploy --dry-run
```

**Result**: Shows all steps without executing.

---

## Changelog

### v1.0.0 (2026-01-04)
- Initial release
- Staging and production deployment
- Rollback support
- Slack notifications
- Health checks

---

## See Also

- `/test` - Run tests before deploying
- `/format` - Format code before deploying
- `/db backup` - Manual database backup
- `../guide.md` - How to customize this skill
