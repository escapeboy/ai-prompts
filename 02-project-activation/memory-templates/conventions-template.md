# Codebase Conventions

> **Instructions**: Copy this template to `.serena/memories/codebase-conventions.md` and fill in the sections based on your project's actual conventions. Delete this instruction block when done.

## Code Quality Standards

### Validation

**Rule**: [e.g., ALL validation uses FormRequest classes (never inline validation)]

**Location**: [e.g., `app/Http/Requests/`]

**Naming Pattern**: [e.g., `{Action}{Model}Request.php` → `CreateUserRequest.php`, `UpdateOrganizationRequest.php`]

**Example**:
```php
// ✅ CORRECT: Use FormRequest
class CreateUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users'],
        ];
    }
}

// ❌ WRONG: Inline validation in controller
$request->validate(['name' => 'required']); // Never do this
```

---

### Business Logic

**Rule**: [e.g., Business logic belongs in Service classes, not controllers or models]

**Location**: [e.g., `app/Services/`]

**Naming Pattern**: [e.g., `{Domain}Service.php` → `UserService.php`, `OrganizationService.php`]

**Example**:
```php
// ✅ CORRECT: Service handles business logic
class UserController extends Controller
{
    public function store(CreateUserRequest $request, UserService $userService)
    {
        $user = $userService->create($request->validated());
        return response()->json($user, 201);
    }
}

// ❌ WRONG: Business logic in controller
class UserController extends Controller
{
    public function store(Request $request)
    {
        // Don't put business logic here
        $user = User::create($request->all());
        Mail::send(...); // Business logic leaked into controller
    }
}
```

---

### Authorization

**Rule**: [e.g., Use Policy classes for all authorization, never inline checks]

**Location**: [e.g., `app/Policies/`]

**Naming Pattern**: [e.g., `{Model}Policy.php` → `UserPolicy.php`, `OrganizationPolicy.php`]

**Registration**: [e.g., `app/Providers/AuthServiceProvider.php`]

**Example**:
```php
// ✅ CORRECT: Use Policy
public function update(UpdateUserRequest $request, User $user)
{
    $this->authorize('update', $user);
    // ...
}

// ❌ WRONG: Inline authorization
if ($request->user()->id !== $user->id) {
    abort(403);
}
```

---

### Error Handling

**Rule**: [e.g., Use custom exceptions, never throw generic Exception]

**Location**: [e.g., `app/Exceptions/`]

**Example**:
```php
// ✅ CORRECT: Custom exception
throw new UserNotFoundException($userId);

// ❌ WRONG: Generic exception
throw new \Exception('User not found');
```

---

## Naming Conventions

### Files & Classes

| Type | Convention | Example |
|------|------------|---------|
| Models | PascalCase, singular | `User.php`, `Organization.php` |
| Controllers | PascalCase, plural + Controller | `UsersController.php`, `OrganizationsController.php` |
| Services | PascalCase + Service | `UserService.php`, `PaymentService.php` |
| Policies | PascalCase + Policy | `UserPolicy.php`, `PostPolicy.php` |
| Requests | PascalCase + Request | `CreateUserRequest.php`, `UpdatePostRequest.php` |
| Events | PascalCase (past tense) | `UserCreated.php`, `OrderPlaced.php` |
| Listeners | PascalCase (action) | `SendWelcomeEmail.php`, `NotifyAdmin.php` |
| Jobs | PascalCase (action) | `ProcessPayment.php`, `SendReport.php` |
| Middleware | PascalCase | `EnsureOrganization.php`, `CheckPlan.php` |

### Methods

| Type | Convention | Example |
|------|------------|---------|
| Getters | camelCase, no prefix | `name()`, `fullName()` |
| Boolean getters | camelCase, is/has/can prefix | `isActive()`, `hasPermission()`, `canEdit()` |
| Actions | camelCase, verb | `create()`, `update()`, `sendEmail()` |
| Scopes | camelCase, scope prefix | `scopeActive()`, `scopeForOrganization()` |
| Relationships | camelCase, noun | `organization()`, `users()`, `posts()` |

### Database

| Type | Convention | Example |
|------|------------|---------|
| Tables | snake_case, plural | `users`, `organizations`, `user_roles` |
| Columns | snake_case | `first_name`, `created_at`, `organization_id` |
| Foreign keys | snake_case, {model}_id | `user_id`, `organization_id` |
| Pivot tables | Alphabetical order, singular | `organization_user`, `post_tag` |
| Primary keys | `id` (UUID or auto-increment) | `id` |
| Timestamps | Standard Laravel | `created_at`, `updated_at`, `deleted_at` |

### Routes

| Type | Convention | Example |
|------|------------|---------|
| Web routes | kebab-case | `/user-settings`, `/organization-members` |
| API routes | kebab-case | `/api/v1/users`, `/api/v1/user-profiles` |
| Route names | dot notation | `users.index`, `organizations.members.show` |
| Resource routes | Standard REST | `GET /users`, `POST /users`, `PUT /users/{id}` |

---

## File Organization

### Where to Put New Code

| Creating a... | Put it in... |
|---------------|--------------|
| New Model | `app/Models/` |
| New Controller | `app/Http/Controllers/{Module}/` |
| New Service | `app/Services/{Module}/` |
| New Form Request | `app/Http/Requests/{Module}/` |
| New Policy | `app/Policies/` |
| New Event | `app/Events/` |
| New Listener | `app/Listeners/` |
| New Job | `app/Jobs/` |
| New Middleware | `app/Http/Middleware/` |
| New Command | `app/Console/Commands/` |
| New Migration | `database/migrations/` |
| New Factory | `database/factories/` |
| New Seeder | `database/seeders/` |
| New Feature Test | `tests/Feature/{Module}/` |
| New Unit Test | `tests/Unit/{Module}/` |
| New View | `resources/views/{module}/` |
| New Component | `app/View/Components/` or `resources/views/components/` |

### Module Organization

> **Note**: If your project uses modules, describe the standard module structure here.

```
app/
├── Http/Controllers/
│   ├── Auth/           # Authentication controllers
│   ├── Organizations/  # Organization module
│   ├── Users/          # User module
│   └── Settings/       # Settings module
├── Models/
│   └── [All models in single directory or by module]
├── Services/
│   ├── Auth/           # Auth services
│   ├── Organizations/  # Org services
│   └── Users/          # User services
```

---

## Common Patterns

### Eloquent Relationships

```php
// Always define inverse relationships
// Always use return type declarations

public function organization(): BelongsTo
{
    return $this->belongsTo(Organization::class);
}

public function users(): HasMany
{
    return $this->hasMany(User::class);
}

public function roles(): BelongsToMany
{
    return $this->belongsToMany(Role::class)
        ->withTimestamps()
        ->withPivot('assigned_by');
}
```

### Query Scoping (Multi-Tenancy)

```php
// ALWAYS scope queries by organization
// Use scopes for consistent filtering

// In Model:
public function scopeForOrganization($query, $organizationId = null)
{
    return $query->where('organization_id', $organizationId ?? auth()->user()->organization_id);
}

// Usage:
User::forOrganization()->get();
User::forOrganization($specificOrgId)->get();
```

### Service Layer Pattern

```php
// Services are injected via constructor
// Services contain all business logic
// Services are testable in isolation

class UserService
{
    public function __construct(
        private UserRepository $repository,
        private NotificationService $notifications,
    ) {}

    public function create(array $data): User
    {
        $user = $this->repository->create($data);
        $this->notifications->sendWelcome($user);
        return $user;
    }
}
```

### Controller Pattern

```php
// Controllers are thin
// Controllers delegate to services
// Controllers handle HTTP concerns only

class UsersController extends Controller
{
    public function __construct(
        private UserService $userService,
    ) {}

    public function store(CreateUserRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'User created successfully',
        ], 201);
    }
}
```

### API Response Pattern

```php
// Consistent API responses
// Use API Resources for transformation
// Include meaningful messages

// Success response:
return response()->json([
    'data' => new UserResource($user),
    'message' => 'User created successfully',
], 201);

// Error response:
return response()->json([
    'error' => 'User not found',
    'code' => 'USER_NOT_FOUND',
], 404);

// Collection response:
return response()->json([
    'data' => UserResource::collection($users),
    'meta' => [
        'total' => $users->total(),
        'page' => $users->currentPage(),
    ],
]);
```

---

## Anti-Patterns (DON'T)

### ❌ Never Do These

```php
// ❌ Inline validation in controllers
$request->validate(['name' => 'required']);
// ✅ Use FormRequest classes

// ❌ Business logic in controllers
public function store(Request $request)
{
    $user = User::create($request->all());
    Mail::send(...);
    Event::dispatch(...);
}
// ✅ Delegate to services

// ❌ Inline authorization
if ($user->id !== auth()->id()) abort(403);
// ✅ Use Policies

// ❌ Raw queries without scoping
User::where('email', $email)->first();
// ✅ Always scope by organization (if multi-tenant)
User::forOrganization()->where('email', $email)->first();

// ❌ Sequential IDs in URLs (if using UUIDs)
/users/123
// ✅ Use UUIDs
/users/550e8400-e29b-41d4-a716-446655440000

// ❌ Hardcoded values
$taxRate = 0.21;
// ✅ Use config or constants
$taxRate = config('billing.tax_rate');

// ❌ N+1 queries
@foreach($users as $user)
    {{ $user->organization->name }}
@endforeach
// ✅ Eager load
$users = User::with('organization')->get();

// ❌ Fat models with business logic
class User extends Model
{
    public function processPayment() { ... }
}
// ✅ Move to services
class PaymentService
{
    public function processForUser(User $user) { ... }
}
```

---

## Code Style

### PHP (if applicable)

- **Standard**: PSR-12
- **Formatter**: [Laravel Pint / PHP-CS-Fixer]
- **Command**: `vendor/bin/pint`

### JavaScript/TypeScript (if applicable)

- **Standard**: [ESLint + Prettier]
- **Config**: `.eslintrc.js`, `.prettierrc`
- **Command**: `npm run lint`, `npm run format`

### Pre-commit Hooks

```bash
# Run before committing:
vendor/bin/pint          # PHP formatting
npm run lint:fix         # JS/TS linting
php artisan test         # Tests
```

---

## Import Order

### PHP

```php
<?php

namespace App\Services;

// 1. PHP built-in classes
use Exception;
use DateTime;

// 2. Framework classes
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

// 3. Third-party packages
use Stripe\Stripe;
use Sentry\Sentry;

// 4. Application classes (alphabetical)
use App\Models\User;
use App\Services\NotificationService;
```

### JavaScript/TypeScript

```javascript
// 1. Node built-ins
import path from 'path';

// 2. External packages
import React from 'react';
import axios from 'axios';

// 3. Internal modules (absolute)
import { api } from '@/lib/api';

// 4. Relative imports
import { Button } from './Button';
import styles from './styles.module.css';
```

---

## Documentation Standards

### PHPDoc

```php
/**
 * Create a new user with the given data.
 *
 * @param array<string, mixed> $data User creation data
 * @return User The created user instance
 * @throws UserCreationException If user creation fails
 */
public function create(array $data): User
```

### Inline Comments

```php
// ✅ Good: Explain WHY, not WHAT
// Using raw query for performance - this runs 1000x/minute
DB::statement('...');

// ❌ Bad: Obvious comment
// Create a new user
$user = User::create($data);
```

---

> **Final tip**: Keep this document updated as conventions evolve. Review quarterly and update after team decisions on new patterns.
