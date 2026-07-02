---
name: module:assistant
description: Add an AI assistant chat panel to any Laravel project — with tool calling, streaming, and MCP support
version: 1.0.0
model: claude-opus-4-8
requires: [composer, php, npm]
tags: [laravel, assistant, ai, livewire, module]
---

# Module: AI Assistant

Implement an AI-powered assistant chat panel embedded in your Laravel application. The assistant understands your domain, can execute tools to read/write data, and supports multiple LLM providers including local agents.

**Reference implementation**: Agent Fleet — Livewire panel with streaming, PrismPHP tool calling, local agent support (Claude Code text-based `<tool_call>` loop, Codex via MCP), conversation history, context awareness.

---

## Usage

```
/module:assistant [action]
```

### Quick Examples

```bash
/module:assistant                # Full implementation
/module:assistant analyze        # Only analyze and produce a component plan
/module:assistant tools          # Only generate the tool registry (add to existing assistant)
```

---

## Actions

### 1. Full Implementation (Default)

Implements the complete assistant: database, backend, tools, frontend.

**Process**:

#### Phase 1: Analyze the Project

1. **Read CLAUDE.md** to understand the domain, models, and architecture.

2. **Check prerequisites**:
   - Livewire 3+ installed? (`composer show livewire/livewire`)
   - PrismPHP installed? (`composer show prism-php/prism`)
   - Alpine.js available? (comes with Livewire)
   - Tailwind CSS configured?

3. **If MCP is already set up** (from `/module:mcp`): the assistant can reference MCP tools for local agents that support MCP natively (e.g. Codex).

4. **Identify domain tools** — the assistant needs tools to interact with your data. Scan models and actions to plan what tools to create (same analysis as `/module:mcp analyze`).

5. **Decide the tool strategy**:
   - **Cloud LLMs** (Anthropic, OpenAI): Use PrismPHP Tool objects — native function calling.
   - **Claude Code** (local): Use text-based `<tool_call>` format — system prompt describes tool schemas, responses parsed for `<tool_call>` tags.
   - **Codex** (local): Use MCP natively — connect to your MCP server (requires `/module:mcp` first).

#### Phase 2: Database

Create the migration for assistant conversations and messages.

```bash
php artisan make:migration create_assistant_tables
```

**Migration**:

```php
Schema::create('assistant_conversations', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
    $table->string('title')->nullable();
    $table->string('context_type')->nullable(); // e.g. 'order', 'product'
    $table->uuid('context_id')->nullable();     // ID of the entity being discussed
    $table->timestamps();
});

Schema::create('assistant_messages', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('conversation_id')->constrained('assistant_conversations')->cascadeOnDelete();
    $table->string('role'); // 'user', 'assistant', 'system'
    $table->text('content');
    $table->jsonb('tool_calls')->nullable();   // Tool execution results
    $table->jsonb('token_usage')->nullable();  // {prompt_tokens, completion_tokens, cost}
    $table->timestamps();

    $table->index(['conversation_id', 'created_at']);
});
```

**Models**:

```php
// app/Domain/Assistant/Models/AssistantConversation.php
class AssistantConversation extends Model
{
    use HasUuids;

    protected $fillable = ['user_id', 'title', 'context_type', 'context_id'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function messages(): HasMany { return $this->hasMany(AssistantMessage::class, 'conversation_id'); }
}

// app/Domain/Assistant/Models/AssistantMessage.php
class AssistantMessage extends Model
{
    use HasUuids;

    protected $fillable = ['conversation_id', 'role', 'content', 'tool_calls', 'token_usage'];
    protected function casts(): array {
        return ['tool_calls' => 'array', 'token_usage' => 'array'];
    }

    public function conversation(): BelongsTo { return $this->belongsTo(AssistantConversation::class, 'conversation_id'); }
}
```

#### Phase 3: Assistant Tools (PrismPHP)

Create tool classes that the assistant can call. These are PrismPHP Tool objects, NOT MCP tools (MCP tools are for external agents; PrismPHP tools are for in-process tool calling).

**Tool registry** at `app/Domain/Assistant/Services/AssistantToolRegistry.php`:

```php
<?php

namespace App\Domain\Assistant\Services;

use App\Domain\Assistant\Tools\ListTools;
use App\Domain\Assistant\Tools\GetTools;
use App\Domain\Assistant\Tools\MutationTools;
use App\Models\User;

class AssistantToolRegistry
{
    /**
     * Get all available tools for the given user.
     *
     * @return array<\Prism\Prism\Tool>
     */
    public function getTools(User $user): array
    {
        $tools = [];

        // Read tools — always available
        $tools = array_merge($tools, ListTools::tools());
        $tools = array_merge($tools, GetTools::tools());

        // Write tools — check user permissions
        if ($this->canWrite($user)) {
            $tools = array_merge($tools, MutationTools::writeTools());
        }

        // Destructive tools — admin only
        if ($this->canDestroy($user)) {
            $tools = array_merge($tools, MutationTools::destructiveTools());
        }

        return $tools;
    }

    private function canWrite(User $user): bool
    {
        // Adapt to your auth model
        return true; // or $user->hasRole('admin', 'editor')
    }

    private function canDestroy(User $user): bool
    {
        return $user->is_admin ?? false;
    }
}
```

**Tool implementation pattern** (PrismPHP tools):

```php
<?php

namespace App\Domain\Assistant\Tools;

use App\Models\Order;
use Prism\Prism\Tool;

class ListTools
{
    /**
     * @return array<Tool>
     */
    public static function tools(): array
    {
        return [
            self::listOrders(),
            self::listProducts(),
            // ... add more list tools
        ];
    }

    private static function listOrders(): Tool
    {
        return Tool::as('list_orders')
            ->for('List orders with optional status filter. Returns id, number, status, total, date.')
            ->withStringParameter('status', 'Filter: pending, processing, completed, cancelled')
            ->withNumberParameter('limit', 'Max results (default 10)')
            ->using(function (?string $status = null, ?int $limit = 10): string {
                $query = Order::query()->orderByDesc('created_at');

                if ($status) {
                    $query->where('status', $status);
                }

                $items = $query->limit(min($limit ?? 10, 100))
                    ->get(['id', 'order_number', 'status', 'total', 'created_at']);

                return json_encode(['count' => $items->count(), 'orders' => $items->toArray()]);
            });
    }
}
```

**Group tools by concern**: `ListTools`, `GetTools`, `MutationTools`, `StatusTools`. Each returns an array of `Prism\Prism\Tool` objects.

#### Phase 4: Core Services

**ConversationManager** — handles conversation CRUD and message history:

```php
<?php

namespace App\Domain\Assistant\Services;

use App\Domain\Assistant\Models\AssistantConversation;

class ConversationManager
{
    public function addMessage(AssistantConversation $conversation, string $role, string $content, ?array $toolCalls = null, ?array $tokenUsage = null): void
    {
        $conversation->messages()->create([
            'role' => $role,
            'content' => $content,
            'tool_calls' => $toolCalls,
            'token_usage' => $tokenUsage,
        ]);
    }

    public function buildMessageHistory(AssistantConversation $conversation, int $limit = 20): array
    {
        return $conversation->messages()
            ->orderBy('created_at')
            ->limit($limit)
            ->get(['role', 'content'])
            ->map(fn ($m) => ['role' => $m->role, 'content' => $m->content])
            ->toArray();
    }

    public function generateTitle(AssistantConversation $conversation): void
    {
        if ($conversation->title) return;

        $firstMessage = $conversation->messages()->where('role', 'user')->first();
        if ($firstMessage) {
            $conversation->update(['title' => Str::limit($firstMessage->content, 80)]);
        }
    }
}
```

**ContextResolver** — injects page-level context into the system prompt:

```php
<?php

namespace App\Domain\Assistant\Services;

class ContextResolver
{
    /**
     * Resolve context for the current page the user is viewing.
     */
    public function resolve(?string $contextType, ?string $contextId): string
    {
        if (! $contextType || ! $contextId) {
            return 'The user is on the dashboard.';
        }

        return match ($contextType) {
            'order' => $this->resolveOrder($contextId),
            'product' => $this->resolveProduct($contextId),
            // Add more entity types as needed
            default => "Viewing {$contextType} #{$contextId}",
        };
    }

    private function resolveOrder(string $id): string
    {
        $order = \App\Models\Order::with('items')->find($id);
        if (! $order) return 'Order not found.';

        return "Viewing Order #{$order->order_number} — Status: {$order->status}, Total: {$order->total}, Items: {$order->items->count()}";
    }
}
```

**SendAssistantMessageAction** — the core action that orchestrates everything:

```php
<?php

namespace App\Domain\Assistant\Actions;

use App\Domain\Assistant\Models\AssistantConversation;
use App\Domain\Assistant\Services\AssistantToolRegistry;
use App\Domain\Assistant\Services\ContextResolver;
use App\Domain\Assistant\Services\ConversationManager;
use App\Models\User;

class SendAssistantMessageAction
{
    public function __construct(
        private readonly ConversationManager $conversationManager,
        private readonly ContextResolver $contextResolver,
        private readonly AssistantToolRegistry $toolRegistry,
    ) {}

    public function execute(
        AssistantConversation $conversation,
        string $userMessage,
        User $user,
        ?string $contextType = null,
        ?string $contextId = null,
        ?string $provider = null,
        ?string $model = null,
    ): mixed {
        // 1. Save user message
        $this->conversationManager->addMessage($conversation, 'user', $userMessage);

        // 2. Resolve provider (from settings or defaults)
        $provider = $provider ?? config('assistant.default_provider', 'anthropic');
        $model = $model ?? config('assistant.default_model', 'claude-sonnet-5');

        // 3. Detect local vs cloud provider
        $isLocal = in_array($provider, ['codex', 'claude-code']);

        // 4. Get tools based on user permissions
        $tools = $this->toolRegistry->getTools($user);

        // 5. Build system prompt
        $context = $this->contextResolver->resolve($contextType, $contextId);
        $systemPrompt = $this->buildSystemPrompt($context, $user, $tools, $isLocal, $provider);

        // 6. Build conversation history
        $history = $this->conversationManager->buildMessageHistory($conversation);
        $userPrompt = $this->buildUserPrompt($history, $userMessage);

        // 7. Execute based on provider type
        if ($isLocal && $provider === 'claude-code') {
            // Claude Code: text-based <tool_call> loop
            $response = $this->executeWithLocalToolLoop($provider, $model, $systemPrompt, $userPrompt, $tools, $user);
        } elseif ($isLocal && $provider === 'codex') {
            // Codex: MCP native — tools come from MCP server, no PrismPHP tools needed
            $response = $this->executeLocal($provider, $model, $systemPrompt, $userPrompt, $user);
        } else {
            // Cloud: PrismPHP handles tool calling natively
            $response = $this->executeCloud($provider, $model, $systemPrompt, $userPrompt, $tools, $user);
        }

        // 8. Save assistant response
        $this->conversationManager->addMessage($conversation, 'assistant', $response->content);
        $this->conversationManager->generateTitle($conversation);

        return $response;
    }

    private function buildSystemPrompt(string $context, User $user, array $tools, bool $isLocal, string $provider): string
    {
        // See the full system prompt structure in Phase 5
        return "...";
    }
}
```

#### Phase 5: System Prompt Architecture

The system prompt is the most critical piece. It defines the assistant's identity, capabilities, and behavior.

**Structure** (adapt to your domain):

```
You are the **{Project Name} Assistant** — an AI helper embedded in {Project Name}.
{intro — can/cannot execute tools}

## About {Project Name}
{2-3 paragraph description of what the platform does, its key entities, and how they relate}

## Current User
- Name: {user name}
- Role: {user role}

## Current Context
{What page/entity the user is viewing — from ContextResolver}

## Available Tools
### Read Tools (always available)
- `list_orders` — List orders with status/date filters
- `get_order` — Get order details with items
- ...

### Write Tools (if user role permits)
- `create_order` — Create a new order
- ...

### Destructive Tools (admin only)
- `cancel_order` — Cancel an order permanently
- ...

## Guidelines
- Be concise and direct. Use markdown formatting.
- Always use tools when the user asks you to do something.
- Present results in clean tables or bullet lists.
- For write operations, state what you will do before calling the tool.
- If something fails, explain clearly and suggest alternatives.
- Respond in the same language the user writes in.
```

**For local agents (Claude Code)** — append the tool calling format:

```
## How to Call Tools

<tool_call>
{"name": "tool_name", "arguments": {"param1": "value1"}}
</tool_call>

### Tool Schemas
```json
[{"name": "list_orders", "description": "...", "parameters": {...}}]
```
```

**For MCP-native agents (Codex)** — describe tool domains instead:

```
## MCP Tools
You have MCP tools connected to {Project Name}. Tool names follow `{domain}_{action}`.

### Available Domains
- **order_** — List, get, create, update, cancel orders
- **product_** — List, get, create, update products
- ...
```

#### Phase 6: Livewire Component

**Backend** at `app/Livewire/Assistant/AssistantPanel.php`:

```php
<?php

namespace App\Livewire\Assistant;

use App\Domain\Assistant\Actions\SendAssistantMessageAction;
use App\Domain\Assistant\Models\AssistantConversation;
use Livewire\Component;

class AssistantPanel extends Component
{
    public bool $open = false;
    public string $message = '';
    public ?string $conversationId = null;
    public array $messages = [];
    public bool $loading = false;
    public string $contextType = '';
    public string $contextId = '';

    protected $listeners = ['assistant:open' => 'openPanel', 'assistant:context' => 'setContext'];

    public function openPanel(): void
    {
        $this->open = true;
    }

    public function setContext(string $type, string $id): void
    {
        $this->contextType = $type;
        $this->contextId = $id;
    }

    public function send(SendAssistantMessageAction $action): void
    {
        if (trim($this->message) === '') return;

        $user = auth()->user();
        $messageText = $this->message;
        $this->message = '';

        // Optimistic UI — show user message immediately
        $this->messages[] = ['role' => 'user', 'content' => $messageText];
        $this->loading = true;

        // Get or create conversation
        $conversation = $this->conversationId
            ? AssistantConversation::find($this->conversationId)
            : AssistantConversation::create(['user_id' => $user->id]);

        $this->conversationId = $conversation->id;

        try {
            $response = $action->execute(
                conversation: $conversation,
                userMessage: $messageText,
                user: $user,
                contextType: $this->contextType ?: null,
                contextId: $this->contextId ?: null,
            );

            $this->messages[] = ['role' => 'assistant', 'content' => $response->content];
        } catch (\Throwable $e) {
            $this->messages[] = ['role' => 'assistant', 'content' => "Error: {$e->getMessage()}"];
        } finally {
            $this->loading = false;
        }
    }

    public function newConversation(): void
    {
        $this->conversationId = null;
        $this->messages = [];
    }

    public function loadConversation(string $id): void
    {
        $conversation = AssistantConversation::where('user_id', auth()->id())->find($id);
        if (! $conversation) return;

        $this->conversationId = $id;
        $this->messages = $conversation->messages()
            ->orderBy('created_at')
            ->get(['role', 'content'])
            ->map(fn ($m) => ['role' => $m->role, 'content' => $m->content])
            ->toArray();
    }

    public function render()
    {
        $conversations = auth()->check()
            ? AssistantConversation::where('user_id', auth()->id())
                ->orderByDesc('updated_at')
                ->limit(20)
                ->get(['id', 'title', 'updated_at'])
            : collect();

        return view('livewire.assistant.assistant-panel', [
            'conversations' => $conversations,
        ]);
    }
}
```

**Frontend** at `resources/views/livewire/assistant/assistant-panel.blade.php`:

Key features to implement:
- **Slide-over panel** from the right side, toggled by a floating button
- **Resizable width** via drag handle (persist to localStorage)
- **Message list** with user/assistant bubbles, markdown rendering
- **Input area** with textarea + send button
- **Conversation sidebar** (list of past conversations, new conversation button)
- **Loading state** with typing indicator
- **Context awareness** — pass `contextType` and `contextId` from the current page

```html
<div x-data="{
    open: @entangle('open'),
    panelWidth: parseInt(localStorage.getItem('assistant-panel-width')) || 420,
    resizing: false,
    startResize(e) {
        this.resizing = true;
        const startX = e.clientX;
        const startWidth = this.panelWidth;
        const onMove = (ev) => {
            this.panelWidth = Math.max(320, Math.min(startWidth + (startX - ev.clientX), window.innerWidth * 0.8));
        };
        const onUp = () => {
            this.resizing = false;
            localStorage.setItem('assistant-panel-width', this.panelWidth);
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }
}">
    <!-- Toggle button (floating) -->
    <button @click="open = !open" class="fixed bottom-6 right-6 z-40 ...">
        AI Assistant
    </button>

    <!-- Panel -->
    <div x-show="open" x-cloak
         :style="'width: ' + panelWidth + 'px'"
         class="fixed inset-y-0 right-0 z-50 flex flex-col bg-white shadow-xl border-l">

        <!-- Resize handle -->
        <div @mousedown.prevent="startResize($event)"
             class="absolute inset-y-0 left-0 w-1.5 cursor-col-resize hover:bg-primary-300"></div>

        <!-- Header -->
        <div class="flex items-center justify-between border-b px-4 py-3">
            <h2 class="font-semibold">Assistant</h2>
            <button @click="open = false">Close</button>
        </div>

        <!-- Messages -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3"
             x-ref="messages"
             x-effect="$nextTick(() => $refs.messages.scrollTop = $refs.messages.scrollHeight)">
            @foreach($messages as $msg)
                <div class="{{ $msg['role'] === 'user' ? 'ml-8 bg-primary-50' : 'mr-8 bg-gray-50' }} rounded-lg p-3 text-sm">
                    {!! \Illuminate\Support\Str::markdown($msg['content']) !!}
                </div>
            @endforeach

            @if($loading)
                <div class="mr-8 bg-gray-50 rounded-lg p-3 text-sm text-gray-400 animate-pulse">
                    Thinking...
                </div>
            @endif
        </div>

        <!-- Input -->
        <form wire:submit="send" class="border-t p-3">
            <div class="flex gap-2">
                <textarea wire:model="message"
                    @keydown.enter.prevent="if (!$event.shiftKey) $wire.send()"
                    rows="1" placeholder="Ask anything..."
                    class="flex-1 resize-none rounded-lg border px-3 py-2 text-sm"></textarea>
                <button type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white">
                    Send
                </button>
            </div>
        </form>
    </div>
</div>
```

**Include the panel in your layout** (`resources/views/layouts/app.blade.php`):

```html
<!-- Before closing </body> -->
@auth
    <livewire:assistant.assistant-panel />
@endauth
```

**Pass context from detail pages** (optional):

```html
<!-- On an order detail page -->
<div x-init="$dispatch('assistant:context', { type: 'order', id: '{{ $order->id }}' })">
```

#### Phase 7: Local Agent Support (Optional)

If you want the assistant to work with locally installed CLI agents (Claude Code, Codex):

**Claude Code** — text-based `<tool_call>` loop:
- System prompt includes tool schemas as JSON
- Response is parsed for `<tool_call>{"name": "...", "arguments": {...}}</tool_call>` tags
- Tools are executed in-process, results appended, re-sent for final answer
- Max 3 loop iterations to prevent runaway

**Codex** — MCP native (requires `/module:mcp`):
- Connect Codex to the MCP server via config: `codex exec --full-auto -c 'mcp_servers={"project-name": {"command": "php", "args": ["artisan", "mcp:start", "project-name"]}}'`
- System prompt describes tool domains (not individual schemas)
- No in-process tool loop needed — Codex handles it via MCP

---

### 2. Analyze Only (`analyze`)

```
/module:assistant analyze
```

Scans the project and outputs a plan: which tools to create, what context types to support, and the system prompt structure.

---

### 3. Tools Only (`tools`)

```
/module:assistant tools
```

Only generates the PrismPHP tool registry and tool classes. Useful when adding tools to an existing assistant.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│  Livewire AssistantPanel                     │
│  ┌────────────────────────────────────────┐  │
│  │ Messages list + Input + Conversation   │  │
│  │ sidebar + Resizable panel              │  │
│  └────────────────┬───────────────────────┘  │
│                   │ wire:submit="send"        │
├───────────────────┼─────────────────────────┤
│                   ▼                          │
│  SendAssistantMessageAction                  │
│  ┌────────────────────────────────────────┐  │
│  │ 1. Save user message                   │  │
│  │ 2. Resolve provider (cloud/local)      │  │
│  │ 3. Get tools (filtered by role)        │  │
│  │ 4. Build system prompt + context       │  │
│  │ 5. Execute (cloud/claude-code/codex)   │  │
│  │ 6. Save assistant response             │  │
│  └────────────────┬───────────────────────┘  │
│         ┌─────────┼──────────┐               │
│         ▼         ▼          ▼               │
│    ┌─────────┐ ┌────────┐ ┌──────────┐      │
│    │ Cloud   │ │ Claude │ │ Codex    │      │
│    │ PrismPHP│ │ Code   │ │ MCP      │      │
│    │ native  │ │ <tool_ │ │ native   │      │
│    │ tools   │ │ call>  │ │ tools    │      │
│    └─────────┘ └────────┘ └──────────┘      │
└─────────────────────────────────────────────┘
```

---

## Checklist

After implementation, verify:

- [ ] Migration created and run (`assistant_conversations`, `assistant_messages`)
- [ ] Models created with proper relationships
- [ ] AssistantToolRegistry returns tools filtered by user role
- [ ] Tool classes cover all major domain read/write operations
- [ ] ConversationManager handles history and title generation
- [ ] ContextResolver supports all detail page types
- [ ] SendAssistantMessageAction orchestrates the full flow
- [ ] System prompt includes domain description, user role, context, tool list, guidelines
- [ ] Livewire component handles send, new conversation, load conversation
- [ ] Panel is resizable with localStorage persistence
- [ ] Panel included in layout behind `@auth`
- [ ] Markdown rendering works in assistant responses
- [ ] Loading/typing indicator works
- [ ] All existing tests pass

---

## See Also

- [/module:mcp](../module-mcp/SKILL.md) — Add MCP server (prerequisite for Codex support)
- [PrismPHP docs](https://prismphp.com)
- [Livewire docs](https://livewire.laravel.com)
