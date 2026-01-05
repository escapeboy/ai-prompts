# Project Architecture

> **Instructions**: Copy this template to `.serena/memories/architecture.md` and fill in the sections based on your project. Delete this instruction block when done.

## Project Type

[Describe your project type, e.g.:]
- Multi-tenant SaaS application
- Single-tenant enterprise application
- API-only backend service
- Full-stack web application
- Microservices architecture
- CLI tool / Library

## Tech Stack

- **Language**: [e.g., PHP 8.3, JavaScript ES2022, Python 3.12, Rust 1.75, Go 1.22]
- **Framework**: [e.g., Laravel 11, React 18, Django 5.0, Actix-web 4, Gin 1.9]
- **Database**: [e.g., PostgreSQL 16, MySQL 8, MongoDB 7, SQLite]
- **Cache**: [e.g., Redis 7, Memcached, None]
- **Queue**: [e.g., Redis, RabbitMQ, Amazon SQS, None]
- **Search**: [e.g., Elasticsearch, Meilisearch, Algolia, None]
- **Storage**: [e.g., S3, Local, Cloudflare R2]

## Directory Structure

```
project-root/
├── app/                    # [Description: e.g., Application code]
│   ├── Http/              # [Controllers, Middleware, Requests]
│   ├── Models/            # [Eloquent models]
│   └── Services/          # [Business logic services]
├── config/                 # [Configuration files]
├── database/              # [Migrations, seeders, factories]
├── resources/             # [Views, assets, lang files]
├── routes/                # [Route definitions]
├── tests/                 # [Test files]
├── storage/               # [Logs, cache, uploads]
└── docker/                # [Docker configuration]
```

> **Tip**: Adjust this tree to match your actual project structure. Include only the most important directories.

## Key Architectural Patterns

### Pattern 1: [Name, e.g., Multi-Tenancy]

**Description**: [Brief description of what this pattern does]

**Implementation**:
- [How it's implemented in this project]
- [Key classes/files involved]

**Critical Rules**:
- [Rule 1: e.g., ALWAYS scope queries by organization_id]
- [Rule 2: e.g., Use UUID primary keys for tenant-visible IDs]
- [Rule 3: e.g., Never expose tenant data across boundaries]

**Key Files**:
- `app/Models/Organization.php` - [Organization model]
- `app/Http/Middleware/EnsureOrganization.php` - [Tenant scoping middleware]
- `app/Traits/BelongsToOrganization.php` - [Shared trait for scoping]

---

### Pattern 2: [Name, e.g., Service Layer]

**Description**: [Brief description]

**Implementation**:
- [How services are structured]
- [How they're injected/used]

**Critical Rules**:
- [Rule 1: e.g., All business logic in services, not controllers]
- [Rule 2: e.g., Controllers only handle HTTP, delegate to services]

**Key Files**:
- `app/Services/` - [Service directory]
- `app/Providers/AppServiceProvider.php` - [Service registration]

---

### Pattern 3: [Name, e.g., Event-Driven Architecture]

**Description**: [Brief description]

**Implementation**:
- [How events are dispatched]
- [How listeners are registered]

**Critical Rules**:
- [Rule 1]
- [Rule 2]

**Key Files**:
- `app/Events/` - [Event classes]
- `app/Listeners/` - [Listener classes]
- `app/Providers/EventServiceProvider.php` - [Event registration]

---

> **Tip**: Add or remove pattern sections based on your project. Common patterns include:
> - Repository Pattern
> - CQRS (Command Query Responsibility Segregation)
> - Domain-Driven Design
> - Microservices Communication
> - API Versioning
> - Authentication/Authorization

## Module Structure

> **Note**: Include this section if your project has distinct modules/features. Remove if not applicable.

### Core Modules

| Module | Description | Key Files |
|--------|-------------|-----------|
| Authentication | User login, registration, password reset | `app/Http/Controllers/Auth/` |
| Authorization | Roles, permissions, policies | `app/Policies/`, `app/Models/Role.php` |
| Organizations | Multi-tenant organization management | `app/Models/Organization.php` |

### Feature Modules

| Module | Description | Key Files |
|--------|-------------|-----------|
| Dashboard | Analytics, charts, summaries | `app/Http/Controllers/DashboardController.php` |
| Users | User management, profiles | `app/Http/Controllers/UsersController.php` |
| Settings | Application configuration | `app/Http/Controllers/SettingsController.php` |
| [Add more...] | | |

### Module Dependencies

```
Authentication → Organizations → Users → [Feature Modules]
```

> **Tip**: Show which modules depend on others. This helps understand the architecture.

## External Integrations

### APIs

| Service | Purpose | Configuration |
|---------|---------|---------------|
| [Stripe] | [Payment processing] | `config/services.php`, `STRIPE_KEY` env |
| [SendGrid] | [Email delivery] | `config/mail.php`, `MAIL_*` env |
| [AWS S3] | [File storage] | `config/filesystems.php`, `AWS_*` env |

### Webhooks

| Endpoint | Source | Handler |
|----------|--------|---------|
| `/webhooks/stripe` | Stripe | `app/Http/Controllers/Webhooks/StripeController.php` |
| `/webhooks/github` | GitHub | `app/Http/Controllers/Webhooks/GitHubController.php` |

### Third-Party Services

- **Monitoring**: [Sentry, New Relic, etc.]
- **Analytics**: [Google Analytics, Mixpanel, etc.]
- **Feature Flags**: [LaunchDarkly, Flagsmith, etc.]

## Environment Configuration

### Key Environment Variables

```bash
# Application
APP_ENV=local|staging|production
APP_DEBUG=true|false
APP_URL=https://example.com

# Database
DB_CONNECTION=pgsql|mysql|sqlite
DB_HOST=localhost
DB_DATABASE=your_database

# Cache/Queue
CACHE_DRIVER=redis|file|array
QUEUE_CONNECTION=redis|sync|database

# [Add project-specific variables]
```

### Environment Files

- `.env` - Local development
- `.env.testing` - Test environment
- `.env.example` - Template for new developers

## Performance Considerations

### Caching Strategy

- **Config cache**: `php artisan config:cache` in production
- **Route cache**: `php artisan route:cache` in production
- **Query cache**: [Describe any query caching]
- **Application cache**: [Describe cache usage patterns]

### Database Optimization

- **Indexes**: [Key indexes to maintain]
- **Eager loading**: [Standard eager loading patterns]
- **Query optimization**: [Any query optimization rules]

### Scaling Considerations

- **Horizontal scaling**: [How the app scales]
- **Queue workers**: [Number and configuration]
- **Database replication**: [If applicable]

---

## Quick Reference

### Common Locations

| Need to find... | Look in... |
|-----------------|------------|
| Controllers | `app/Http/Controllers/` |
| Models | `app/Models/` |
| Services | `app/Services/` |
| Validation | `app/Http/Requests/` |
| Authorization | `app/Policies/` |
| Events | `app/Events/` |
| Jobs | `app/Jobs/` |
| Views | `resources/views/` |
| Routes | `routes/web.php`, `routes/api.php` |
| Tests | `tests/Feature/`, `tests/Unit/` |
| Migrations | `database/migrations/` |
| Config | `config/` |

### Critical Commands

```bash
# [Add your project's most-used commands]
docker-compose exec app php artisan migrate
docker-compose exec app php artisan test
docker-compose exec app composer install
```

---

> **Final tip**: Keep this document updated as your architecture evolves. Review monthly and update after major changes.
