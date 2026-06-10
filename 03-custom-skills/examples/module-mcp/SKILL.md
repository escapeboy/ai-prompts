---
name: module:mcp
description: Add a Laravel MCP server to any project — full domain coverage with dual transport (HTTP + stdio)
version: 1.0.0
model: claude-opus-4-8
requires: [composer, php]
tags: [laravel, mcp, ai, integration, module]
---

# Module: MCP Server

Implement a complete Model Context Protocol (MCP) server on any Laravel project. Gives LLMs and AI agents (Claude Code, Codex, Cursor, etc.) full programmatic access to the application's domain.

**Reference implementation**: Agent Fleet — 61 tools across 14 domains, dual transport, role-based auth.

---

## Usage

```
/module:mcp [action]
```

### Quick Examples

```bash
/module:mcp                    # Full implementation (analyze → scaffold → implement)
/module:mcp analyze            # Only analyze the project and produce a tool plan
/module:mcp add <domain>       # Add MCP tools for a specific domain
/module:mcp sync               # Sync tools with current domain — find missing coverage
```

---

## Actions

### 1. Full Implementation (Default)

Analyzes the project, scaffolds the MCP server, and implements all tools.

**Process**:

#### Phase 1: Analyze the Project

1. **Read CLAUDE.md** (or README.md) to understand the domain, models, and architecture.

2. **Discover domain models** — scan for Eloquent models, their relationships, and fillable fields:

```bash
# Find all models
find app -name "*.php" -path "*/Models/*" | head -50

# Or use Laravel Boost if available
php artisan model:show
```

3. **Discover actions/services** — scan for action classes, service classes, and controllers:

```bash
# Find action classes
find app -name "*Action.php" | head -30

# Find controllers
find app -name "*Controller.php" -path "*/Controllers/*" | head -30
```

4. **Discover existing API routes** — map what's already exposed:

```bash
php artisan route:list --columns=method,uri,name,action --json
```

5. **Identify domain boundaries** — group models/actions into logical domains. Example:

```
User domain:      User, Role, Team
Product domain:   Product, Category, Variant
Order domain:     Order, OrderItem, Payment, Refund
```

6. **Produce a tool plan** — for each domain, list the tools to create:

```
Domain: Order (6 tools)
  - order_list (read) — List orders with status/date filters
  - order_get (read) — Get order details with items
  - order_create (write) — Create a new order
  - order_update (write) — Update order details
  - order_cancel (destructive) — Cancel an order
  - order_refund (write) — Initiate a refund
```

**Tool naming convention**: `{domain}_{action}` — lowercase, underscores.

**Standard CRUD tools per domain**:
- `{domain}_list` — List with filters and pagination
- `{domain}_get` — Get single entity by ID with relations
- `{domain}_create` — Create new entity
- `{domain}_update` — Update existing entity
- `{domain}_delete` — Soft-delete or archive

**Lifecycle tools** (for stateful entities):
- `{domain}_{transition}` — e.g. `order_cancel`, `experiment_pause`

**System tools** (always include):
- `dashboard_kpis` — Key metrics summary
- `system_health` — Database, cache, queue health
- `audit_log` — Recent activity log (if audit exists)

#### Phase 2: Install and Scaffold

1. **Install `laravel/mcp`**:

```bash
composer require laravel/mcp
```

2. **Create the MCP Server class** at `app/Mcp/Servers/{ProjectName}Server.php`:

```php
<?php

namespace App\Mcp\Servers;

use App\Mcp\Concerns\BootstrapsMcpAuth;
use Laravel\Mcp\Server;

class ProjectNameServer extends Server
{
    use BootstrapsMcpAuth;

    protected string $name = 'Project Name';
    protected string $version = '1.0.0';
    protected string $instructions = 'Project Name MCP Server — describe what this project does.';

    protected function boot(): void
    {
        $this->bootstrapMcpAuth();
    }

    protected array $tools = [
        // Tools are registered here — one class per tool
    ];
}
```

3. **Create the auth bootstrap trait** at `app/Mcp/Concerns/BootstrapsMcpAuth.php`:

```php
<?php

namespace App\Mcp\Concerns;

use App\Models\User;
use Illuminate\Support\Facades\Auth;

trait BootstrapsMcpAuth
{
    /**
     * Bootstrap authentication for stdio MCP sessions.
     * HTTP sessions use Sanctum middleware instead.
     */
    protected function bootstrapMcpAuth(): void
    {
        if (auth()->check()) {
            return;
        }

        // Resolve default user for stdio (local CLI) sessions.
        // Adapt this to your auth model — find the first admin or owner.
        $user = User::where('is_admin', true)->first()
             ?? User::first();

        if (! $user) {
            throw new \RuntimeException('No user found. Run your install/seed command first.');
        }

        Auth::login($user);

        // If your app uses team/tenant scoping, set the team context here:
        // app()->instance('mcp.active', true);
    }
}
```

4. **Create routes** at `routes/ai.php`:

```php
<?php

use App\Mcp\Servers\ProjectNameServer;
use Laravel\Mcp\Facades\Mcp;

// HTTP/SSE endpoint — for Cursor, remote MCP clients
Mcp::web('/mcp', ProjectNameServer::class)
    ->middleware(['auth:sanctum']);

// Local stdio server — for Claude Code, Codex
Mcp::local('project-name', ProjectNameServer::class);
```

5. **Register the routes** in `bootstrap/app.php` or `RouteServiceProvider`:

```php
// In bootstrap/app.php (Laravel 12+)
->withRouting(
    // ... existing routes ...
    then: function () {
        require base_path('routes/ai.php');
    },
)
```

6. **Fix global scopes** (if using team/tenant scoping). Console commands bypass global scopes by default, but MCP stdio runs in console context. If your models use a tenant scope:

```php
// In your TeamScope (or similar global scope)
public function apply(Builder $builder, Model $model): void
{
    // Allow MCP stdio sessions to use the scope
    if (app()->runningInConsole() && ! app()->bound('mcp.active')) {
        return; // Skip scope in regular console (migrations, seeders)
    }

    // Apply normal scope
    $builder->where($model->getTable().'.team_id', auth()->user()?->current_team_id);
}
```

#### Phase 3: Implement Tools

For each tool in the plan, create a class in `app/Mcp/Tools/{Domain}/`.

**Read tool pattern** (list):

```php
<?php

namespace App\Mcp\Tools\Order;

use App\Models\Order;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[IsReadOnly]
#[IsIdempotent]
class OrderListTool extends Tool
{
    protected string $name = 'order_list';

    protected string $description = 'List orders with optional status and date filters. Returns id, number, status, total, created_at.';

    public function schema(JsonSchema $schema): array
    {
        return [
            'status' => $schema->string()
                ->description('Filter by status: pending, processing, completed, cancelled')
                ->enum(['pending', 'processing', 'completed', 'cancelled']),
            'limit' => $schema->integer()
                ->description('Max results (default 10, max 100)')
                ->default(10),
        ];
    }

    public function handle(Request $request): Response
    {
        $query = Order::query()->orderByDesc('created_at');

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $limit = min((int) ($request->get('limit', 10)), 100);
        $items = $query->limit($limit)->get(['id', 'order_number', 'status', 'total', 'created_at']);

        return Response::text(json_encode([
            'count' => $items->count(),
            'orders' => $items->toArray(),
        ]));
    }
}
```

**Read tool pattern** (get single):

```php
#[IsReadOnly]
#[IsIdempotent]
class OrderGetTool extends Tool
{
    protected string $name = 'order_get';

    protected string $description = 'Get order details by ID, including items and payment info.';

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->string()->description('Order ID (UUID)')->required(),
        ];
    }

    public function handle(Request $request): Response
    {
        $order = Order::with(['items', 'payment'])->find($request->get('id'));

        if (! $order) {
            return Response::error('Order not found');
        }

        return Response::text(json_encode($order->toArray()));
    }
}
```

**Write tool pattern**:

```php
class OrderCreateTool extends Tool
{
    protected string $name = 'order_create';

    protected string $description = 'Create a new order. Specify customer and items.';

    public function schema(JsonSchema $schema): array
    {
        return [
            'customer_id' => $schema->string()->description('Customer ID')->required(),
            'items' => $schema->string()->description('JSON array of items: [{product_id, quantity}]')->required(),
            'notes' => $schema->string()->description('Order notes'),
        ];
    }

    public function handle(Request $request): Response
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'items' => 'required|json',
            'notes' => 'nullable|string',
        ]);

        try {
            // Prefer using existing action classes
            $order = app(CreateOrderAction::class)->execute(
                customerId: $validated['customer_id'],
                items: json_decode($validated['items'], true),
                notes: $validated['notes'] ?? null,
            );

            return Response::text(json_encode([
                'success' => true,
                'order_id' => $order->id,
                'status' => $order->status,
            ]));
        } catch (\Throwable $e) {
            return Response::error($e->getMessage());
        }
    }
}
```

**Destructive tool pattern**:

```php
use Laravel\Mcp\Server\Tools\Annotations\IsDestructive;

#[IsDestructive]
class OrderCancelTool extends Tool
{
    protected string $name = 'order_cancel';

    protected string $description = 'Cancel an order. Only pending/processing orders can be cancelled.';

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->string()->description('Order ID')->required(),
            'reason' => $schema->string()->description('Cancellation reason')->required(),
        ];
    }

    public function handle(Request $request): Response
    {
        $order = Order::find($request->get('id'));

        if (! $order) {
            return Response::error('Order not found');
        }

        if (! in_array($order->status, ['pending', 'processing'])) {
            return Response::error("Cannot cancel order in '{$order->status}' status");
        }

        try {
            app(CancelOrderAction::class)->execute($order, $request->get('reason'));

            return Response::text(json_encode([
                'success' => true,
                'order_id' => $order->id,
                'status' => 'cancelled',
            ]));
        } catch (\Throwable $e) {
            return Response::error($e->getMessage());
        }
    }
}
```

**Key rules for all tools**:

- One tool per file, one public method (`handle`)
- Use `#[IsReadOnly]` + `#[IsIdempotent]` for read tools
- Use `#[IsDestructive]` for delete/cancel/archive tools
- Write tools have no annotation (default)
- Return `Response::text(json_encode(...))` for success
- Return `Response::error(...)` for failures
- Use existing action classes when available — don't duplicate business logic
- Always validate input with `$request->validate()` for write tools
- Limit list results (default 10, max 100)
- Include only essential fields in list responses, full details in get responses

#### Phase 4: Register and Verify

1. **Register all tools** in the Server class `$tools` array.

2. **Test stdio**:
```bash
php artisan mcp:start project-name
```

3. **Test HTTP** (if Sanctum is set up):
```bash
curl -X POST http://localhost/mcp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

4. **Update CLAUDE.md** — add the MCP section:

```markdown
## MCP Server

The platform exposes a Model Context Protocol (MCP) server via `laravel/mcp`.

### Architecture
- **Server:** `app/Mcp/Servers/ProjectNameServer.php`
- **Auth (stdio):** `BootstrapsMcpAuth` trait auto-resolves default user
- **Auth (HTTP):** Sanctum bearer token via `auth:sanctum` middleware
- **Routes:** `routes/ai.php`

### Usage
\`\`\`bash
# Local stdio (for Codex, Claude Code)
php artisan mcp:start project-name

# HTTP/SSE (for Cursor, remote clients)
# POST /mcp with Sanctum bearer token
\`\`\`

### IMPORTANT: When adding/modifying features
When any domain functionality is added or changed, the corresponding MCP tool(s)
must also be created or updated. The MCP server must maintain 100% coverage
of platform capabilities.
```

---

### 2. Analyze Only (`analyze`)

Scans the project and produces a tool plan without implementing anything.

```
/module:mcp analyze
```

**Output**: A markdown table of proposed tools grouped by domain, with tool name, type (read/write/destructive), and description.

---

### 3. Add Domain (`add <domain>`)

Adds MCP tools for a specific domain to an existing MCP server.

```
/module:mcp add orders
/module:mcp add users
```

**Process**:
1. Read the existing Server class to see what's registered
2. Scan the domain models and actions
3. Create tool classes for the domain
4. Register them in the Server's `$tools` array

---

### 4. Sync (`sync`)

Finds domain functionality that's not covered by MCP tools.

```
/module:mcp sync
```

**Process**:
1. List all registered MCP tools
2. List all domain models and their CRUD actions
3. List all API routes
4. Diff: what's in the API/actions but missing from MCP?
5. Output a list of missing tools with suggested implementations

---

## Tool Annotations Reference

| Annotation | When to Use | Example |
|------------|-------------|---------|
| `#[IsReadOnly]` | Tool only reads data | `order_list`, `order_get` |
| `#[IsIdempotent]` | Same input → same result | `order_list`, `order_get` |
| `#[IsDestructive]` | Irreversible action | `order_cancel`, `user_delete` |
| *(none)* | Write that's not destructive | `order_create`, `order_update` |

---

## Response Format Convention

All tools return JSON via `Response::text(json_encode(...))`.

**List tools**:
```json
{"count": 5, "orders": [{...}, {...}]}
```

**Get tools**:
```json
{"id": "...", "name": "...", "status": "...", "relations": [...]}
```

**Write tools** (success):
```json
{"success": true, "order_id": "...", "status": "created"}
```

**Error**:
```json
Response::error("Human-readable error message")
```

---

## Checklist

After implementation, verify:

- [ ] `composer require laravel/mcp` installed
- [ ] Server class created and registered
- [ ] `BootstrapsMcpAuth` trait handles stdio auth
- [ ] `routes/ai.php` has both `Mcp::web()` and `Mcp::local()` routes
- [ ] Routes loaded in `bootstrap/app.php`
- [ ] Global scopes handle `mcp.active` flag (if applicable)
- [ ] All domain models have at minimum `list` + `get` tools
- [ ] All write actions have corresponding tools
- [ ] All tools follow naming convention: `{domain}_{action}`
- [ ] Tool annotations are correct (ReadOnly, Idempotent, Destructive)
- [ ] CLAUDE.md updated with MCP documentation
- [ ] `php artisan mcp:start project-name` works
- [ ] All existing tests still pass

---

## See Also

- [/module:assistant](../module-assistant/SKILL.md) — Add an AI assistant chat panel
- [Laravel MCP docs](https://laravel.com/ai/mcp)
- [MCP Specification](https://modelcontextprotocol.io)
