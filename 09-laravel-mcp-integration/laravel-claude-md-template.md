# Laravel CLAUDE.md Template

**Copy this template to your Laravel project root as `CLAUDE.md` and customize for your project.**

---

```markdown
# CLAUDE.md - [Project Name]

## Project Overview

- **Type**: Laravel [11.x/12.x] application
- **PHP**: [8.2/8.3/8.4]
- **Description**: [Brief description of what this project does]

## Architecture

### Stack
- **Framework**: Laravel [version]
- **Database**: [MySQL 8.x / PostgreSQL 16.x / SQLite]
- **Cache**: [Redis / Memcached / File]
- **Queue**: [Redis / SQS / Database / Sync]
- **Search**: [Meilisearch / Algolia / Scout / None]
- **Frontend**: [Livewire / Inertia+Vue / Inertia+React / Blade / API-only]

### Directory Structure
```
app/
  Actions/          # Single-purpose action classes
  Models/           # Eloquent models
  Http/
    Controllers/    # HTTP controllers
    Middleware/      # Custom middleware
    Requests/       # Form request validation
    Resources/      # API resources
  Services/         # Business logic services
  Policies/         # Authorization policies
  Enums/            # PHP enums
  Events/           # Event classes
  Listeners/        # Event listeners
  Jobs/             # Queue jobs
  Mail/             # Mailable classes
  Notifications/    # Notification classes
database/
  migrations/       # Database migrations
  factories/        # Model factories
  seeders/          # Database seeders
resources/
  views/            # Blade templates
  css/              # Stylesheets
  js/               # JavaScript
routes/
  web.php           # Web routes
  api.php           # API routes
  console.php       # Console routes
tests/
  Feature/          # Feature tests
  Unit/             # Unit tests
```

## Conventions

### Coding Standards
- Follow PSR-12 coding standard
- Use strict types: `declare(strict_types=1);` in all PHP files
- Use PHP 8.2+ features: enums, readonly properties, match expressions, named arguments
- Prefer Action classes over fat controllers or service classes for single operations

### Naming
- **Models**: Singular PascalCase (`User`, `OrderItem`)
- **Controllers**: PascalCase with `Controller` suffix (`OrderController`)
- **Migrations**: Snake_case with timestamp prefix (auto-generated)
- **Tests**: PascalCase with `Test` suffix (`OrderCreationTest`)
- **Actions**: Verb + Noun (`CreateOrder`, `SendInvoice`)
- **Enums**: PascalCase (`OrderStatus`, `PaymentMethod`)

### Eloquent Patterns
- Always define `$fillable` or `$guarded` on models
- Use Eloquent relationships, never raw joins for related data
- Use query scopes for reusable query constraints
- Use `$casts` for attribute casting (dates, enums, JSON)
- Prefer `whereRelation()` over `whereHas()` for simple conditions
- Use `Model::query()` to start query chains for clarity

### Controllers
- Keep controllers thin - delegate to Actions or Services
- Use Form Request classes for validation (never validate in controller)
- Use API Resources for response formatting
- Follow RESTful conventions: index, show, store, update, destroy
- Return proper HTTP status codes

### Routing
- Group routes by middleware and prefix
- Use route model binding
- Name all routes (`->name('orders.index')`)
- Use `Route::resource()` for standard CRUD

### Testing
- **Framework**: [Pest / PHPUnit]
- Run tests: `php artisan test` or `./vendor/bin/pest`
- Run specific test: `php artisan test --filter=OrderCreationTest`
- Use factories for test data
- Use `RefreshDatabase` trait for database tests
- Prefer Feature tests for endpoints, Unit tests for isolated logic
- Name tests descriptively: `it('creates an order with valid data')`

### Error Handling
- Use custom exceptions for domain errors
- Return consistent error responses in API
- Log context with errors: `Log::error('msg', ['order_id' => $id])`

## Commands

### Development
```bash
php artisan serve              # Start dev server
php artisan migrate            # Run migrations
php artisan migrate:fresh --seed  # Fresh DB with seeders
php artisan tinker             # REPL
php artisan queue:work         # Process queue jobs
npm run dev                    # Start Vite dev server (if frontend)
```

### Testing
```bash
php artisan test               # Run all tests
php artisan test --parallel    # Run tests in parallel
php artisan test --filter=Name # Run specific test
php artisan test --coverage    # With coverage report
```

### Code Quality
```bash
./vendor/bin/pint              # Laravel Pint (code style)
./vendor/bin/phpstan analyse   # Static analysis (if installed)
php artisan ide-helper:generate  # IDE helper (if installed)
```

## MCP Servers

This project uses the following MCP servers:
- **Laravel Boost** (local): Routes, models, schema access
- **Serena** (user): Code intelligence and symbol navigation

## Important Notes

- [Add project-specific notes, gotchas, or conventions here]
- [Example: "The orders table uses soft deletes"]
- [Example: "All API responses are wrapped in a data key"]
- [Example: "Multi-tenancy is handled via team_id scope"]
```

---

## Customization Guide

### If Using Livewire

Add this section to your CLAUDE.md:

```markdown
### Livewire
- Version: [3.x]
- Components in: `app/Livewire/`
- Use `#[Computed]` attribute for computed properties
- Use `$this->dispatch()` for component communication
- Follow naming: `OrderList`, `CreateOrderForm`
- Use Volt for simple single-file components
```

### If Using Inertia

Add this section:

```markdown
### Inertia
- Version: [2.x]
- Frontend: [Vue 3 / React]
- Pages in: `resources/js/Pages/`
- Components in: `resources/js/Components/`
- Use `Inertia::render()` in controllers
- Shared data via `HandleInertiaRequests` middleware
```

### If Using Filament

Add this section:

```markdown
### Filament
- Version: [3.x]
- Admin panel: `/admin`
- Resources in: `app/Filament/Resources/`
- Pages in: `app/Filament/Pages/`
- Widgets in: `app/Filament/Widgets/`
- Use `TextInput::make()` pattern for form fields
- Follow resource naming: `OrderResource`
```

### If API-Only

Add this section:

```markdown
### API Conventions
- Base URL: `/api/v1/`
- Authentication: [Sanctum / Passport / JWT]
- Response format: `{ "data": {...}, "meta": {...} }`
- Pagination: cursor-based for lists
- Versioning: URI prefix (`/api/v1/`, `/api/v2/`)
- Rate limiting: configured in `RouteServiceProvider`
```
