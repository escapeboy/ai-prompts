---
name: module-mcp
description: "Scaffold a Laravel MCP server with domain-grouped tools, dual transport (HTTP + stdio), and role-based auth. Use when adding MCP to a Laravel project, exposing domain models to AI agents, or setting up Claude Code or Codex access to a Laravel app."
metadata:
  version: "1.0.0"
  model: claude-opus-4-6
  requires: [composer, php]
  tags: [laravel, mcp, ai, integration, module]
---

# Module: MCP Server

Implement a complete Model Context Protocol (MCP) server on any Laravel project. Gives LLMs and AI agents (Claude Code, Codex, Cursor, etc.) full programmatic access to the application's domain.

**Reference implementation**: Agent Fleet — 61 tools across 14 domains, dual transport, role-based auth.

## Usage

```
/module-mcp [action]
```

### Quick Examples

```bash
/module-mcp                    # Full implementation (analyze -> scaffold -> implement)
/module-mcp analyze            # Only analyze the project and produce a tool plan
/module-mcp add <domain>       # Add MCP tools for a specific domain
/module-mcp sync               # Sync tools with current domain — find missing coverage
```

## Actions

### 1. Full Implementation (Default)

#### Phase 1: Analyze the Project

1. **Read CLAUDE.md** (or README.md) to understand the domain, models, and architecture.

2. **Discover domain models** — scan for Eloquent models, relationships, and fillable fields:

```bash
find app -name "*.php" -path "*/Models/*" | head -50
```

3. **Discover actions/services** — scan for action classes, service classes, and controllers:

```bash
find app -name "*Action.php" | head -30
find app -name "*Controller.php" -path "*/Controllers/*" | head -30
```

4. **Discover existing API routes**:

```bash
php artisan route:list --columns=method,uri,name,action --json
```

5. **Identify domain boundaries** — group models/actions into logical domains (e.g., User domain: User, Role, Team).

6. **Produce a tool plan** — for each domain, list tools to create with naming convention `{domain}_{action}`:

**Standard CRUD tools per domain**: `{domain}_list`, `{domain}_get`, `{domain}_create`, `{domain}_update`, `{domain}_delete`.

**Lifecycle tools** (stateful entities): `{domain}_{transition}` (e.g., `order_cancel`).

**System tools** (always include): `dashboard_kpis`, `system_health`, `audit_log`.

7. **Verify**: confirm the tool plan covers all domain models before proceeding.

#### Phase 2: Install and Scaffold

1. **Install `laravel/mcp`**: `composer require laravel/mcp`

2. **Create the MCP Server class** at `app/Mcp/Servers/{ProjectName}Server.php` — extend `Laravel\Mcp\Server`, set name/version/instructions, register tools in `$tools` array.

3. **Create auth bootstrap trait** at `app/Mcp/Concerns/BootstrapsMcpAuth.php` — auto-resolve default user for stdio sessions (CLI agents). HTTP sessions use Sanctum middleware instead.

4. **Create routes** at `routes/ai.php`:

```php
use Laravel\Mcp\Facades\Mcp;

// HTTP/SSE endpoint — for Cursor, remote MCP clients
Mcp::web('/mcp', ProjectNameServer::class)->middleware(['auth:sanctum']);

// Local stdio server — for Claude Code, Codex
Mcp::local('project-name', ProjectNameServer::class);
```

5. **Register routes** in `bootstrap/app.php` (Laravel 12+) via `->withRouting(then: fn () => require base_path('routes/ai.php'))`.

6. **Fix global scopes** if using team/tenant scoping — MCP stdio runs in console context, so check `app()->bound('mcp.active')` before skipping scopes.

#### Phase 3: Implement Tools

Create one class per tool in `app/Mcp/Tools/{Domain}/`. Each tool extends `Laravel\Mcp\Server\Tool`.

**Read tool pattern** (list):

```php
#[IsReadOnly]
#[IsIdempotent]
class OrderListTool extends Tool
{
    protected string $name = 'order_list';
    protected string $description = 'List orders with optional status and date filters.';

    public function schema(JsonSchema $schema): array
    {
        return [
            'status' => $schema->string()->description('Filter: pending, processing, completed, cancelled')
                ->enum(['pending', 'processing', 'completed', 'cancelled']),
            'limit' => $schema->integer()->description('Max results (default 10, max 100)')->default(10),
        ];
    }

    public function handle(Request $request): Response
    {
        $query = Order::query()->orderByDesc('created_at');
        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }
        $items = $query->limit(min((int) ($request->get('limit', 10)), 100))
            ->get(['id', 'order_number', 'status', 'total', 'created_at']);
        return Response::text(json_encode(['count' => $items->count(), 'orders' => $items->toArray()]));
    }
}
```

**Write tool pattern** — same structure but use `$request->validate()` for input validation. Prefer existing action classes over duplicating business logic.

**Destructive tool pattern** — annotate with `#[IsDestructive]`, validate state transitions before executing (e.g., only cancel pending/processing orders).

**Key rules**:
- One tool per file, one public method (`handle`)
- `#[IsReadOnly]` + `#[IsIdempotent]` for read tools
- `#[IsDestructive]` for delete/cancel/archive tools
- Return `Response::text(json_encode(...))` for success, `Response::error(...)` for failures
- Use existing action classes — don't duplicate business logic
- Limit list results (default 10, max 100)

#### Phase 4: Register and Verify

1. Register all tools in the Server class `$tools` array.
2. Test stdio: `php artisan mcp:start project-name`
3. Test HTTP (if Sanctum is set up): `curl -X POST http://localhost/mcp -H "Authorization: Bearer TOKEN"`
4. **Verify**: confirm each tool responds correctly before updating docs.
5. Update CLAUDE.md with MCP server architecture, usage commands, and the rule that new domain features must include corresponding MCP tools.

### 2. Analyze Only (`analyze`)

Scans the project and produces a tool plan without implementing anything. Output: markdown table of proposed tools grouped by domain with tool name, type (read/write/destructive), and description.

### 3. Add Domain (`add <domain>`)

Adds MCP tools for a specific domain to an existing MCP server. Reads the existing Server class, scans domain models/actions, creates tool classes, and registers them.

### 4. Sync (`sync`)

Finds domain functionality not covered by MCP tools. Lists all registered tools, all domain models/actions, and all API routes, then diffs to show missing tool coverage.

## Tool Annotations Reference

| Annotation | When to Use | Example |
|------------|-------------|---------|
| `#[IsReadOnly]` | Tool only reads data | `order_list`, `order_get` |
| `#[IsIdempotent]` | Same input = same result | `order_list`, `order_get` |
| `#[IsDestructive]` | Irreversible action | `order_cancel`, `user_delete` |
| *(none)* | Write that's not destructive | `order_create`, `order_update` |

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
- [ ] Tool annotations are correct
- [ ] CLAUDE.md updated with MCP documentation
- [ ] `php artisan mcp:start project-name` works
- [ ] All existing tests still pass

## See Also

- [/module-assistant](../module-assistant/SKILL.md) — Add an AI assistant chat panel
- [Laravel MCP docs](https://laravel.com/ai/mcp)
- [MCP Specification](https://modelcontextprotocol.io)
