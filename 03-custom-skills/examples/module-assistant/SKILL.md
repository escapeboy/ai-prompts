---
name: module-assistant
description: "Scaffold a Livewire AI assistant chat panel with PrismPHP tool calling, streaming responses, conversation history, and multi-provider support (Anthropic, OpenAI, local agents). Use when adding an AI chat panel to a Laravel app, integrating PrismPHP tools, or building in-app AI assistant features."
metadata:
  version: "1.0.0"
  model: claude-opus-4-6
  requires: [composer, php, npm]
  tags: [laravel, assistant, ai, livewire, module]
---

# Module: AI Assistant

Implement an AI-powered assistant chat panel embedded in any Laravel application. The assistant understands the domain, executes tools to read/write data, and supports multiple LLM providers including local agents.

**Reference implementation**: Agent Fleet — Livewire panel with streaming, PrismPHP tool calling, local agent support, conversation history, context awareness.

## Usage

```
/module-assistant [action]
```

### Quick Examples

```bash
/module-assistant                # Full implementation
/module-assistant analyze        # Only analyze and produce a component plan
/module-assistant tools          # Only generate the tool registry
```

## Actions

### 1. Full Implementation (Default)

#### Phase 1: Analyze the Project

1. **Read CLAUDE.md** to understand the domain, models, and architecture.

2. **Check prerequisites**: Livewire 3+ (`composer show livewire/livewire`), PrismPHP (`composer show prism-php/prism`), Alpine.js (comes with Livewire), Tailwind CSS.

3. **If MCP is already set up** (from `/module-mcp`): the assistant can reference MCP tools for local agents that support MCP natively.

4. **Identify domain tools** — scan models and actions to plan what tools the assistant needs (same analysis as `/module-mcp analyze`).

5. **Decide tool strategy**:
   - **Cloud LLMs** (Anthropic, OpenAI): PrismPHP Tool objects — native function calling.
   - **Claude Code** (local): text-based `<tool_call>` format — system prompt describes schemas, responses parsed for `<tool_call>` tags.
   - **Codex** (local): MCP native — connect to your MCP server (requires `/module-mcp` first).

6. **Verify**: confirm prerequisites are installed and tool plan is complete before proceeding.

#### Phase 2: Database

Create migration for `assistant_conversations` and `assistant_messages` tables:

- `assistant_conversations`: uuid primary key, user_id (foreign), title, context_type, context_id, timestamps.
- `assistant_messages`: uuid primary key, conversation_id (foreign), role (user/assistant/system), content (text), tool_calls (jsonb, nullable), token_usage (jsonb, nullable), timestamps. Index on `[conversation_id, created_at]`.

Create corresponding Eloquent models with `HasUuids`, proper fillable fields, and relationships.

#### Phase 3: Assistant Tools (PrismPHP)

Create PrismPHP Tool objects (not MCP tools — PrismPHP tools are for in-process tool calling).

**Tool registry** at `app/Domain/Assistant/Services/AssistantToolRegistry.php`:
- `getTools(User $user)` returns filtered tools based on user permissions.
- Read tools always available; write tools require write permission; destructive tools require admin.

**Tool implementation pattern**:

```php
class ListTools
{
    public static function tools(): array
    {
        return [self::listOrders(), self::listProducts()];
    }

    private static function listOrders(): Tool
    {
        return Tool::as('list_orders')
            ->for('List orders with optional status filter.')
            ->withStringParameter('status', 'Filter: pending, processing, completed, cancelled')
            ->withNumberParameter('limit', 'Max results (default 10)')
            ->using(function (?string $status = null, ?int $limit = 10): string {
                $query = Order::query()->orderByDesc('created_at');
                if ($status) { $query->where('status', $status); }
                return json_encode($query->limit(min($limit ?? 10, 100))->get(['id', 'order_number', 'status', 'total', 'created_at'])->toArray());
            });
    }
}
```

Group tools by concern: `ListTools`, `GetTools`, `MutationTools`, `StatusTools`.

#### Phase 4: Core Services

**ConversationManager** — handles conversation CRUD:
- `addMessage()`: save message with role, content, optional tool_calls and token_usage.
- `buildMessageHistory()`: return recent messages as role/content pairs (limit 20).
- `generateTitle()`: auto-title from first user message if no title set.

**ContextResolver** — injects page-level context:
- `resolve(?string $contextType, ?string $contextId)`: returns a description of what the user is currently viewing (e.g., "Viewing Order #1234 — Status: processing").
- Match on context_type to load the relevant entity with key relations.

**SendAssistantMessageAction** — orchestrates the full flow:
1. Save user message.
2. Resolve provider (cloud vs local from config).
3. Get tools filtered by user permissions.
4. Build system prompt with domain description, user role, current context, available tools, and guidelines.
5. Build conversation history.
6. Execute via cloud (PrismPHP native tools), Claude Code (text-based `<tool_call>` loop, max 3 iterations), or Codex (MCP native).
7. Save assistant response and auto-generate conversation title.

#### Phase 5: System Prompt Architecture

Structure the system prompt with these sections:
- Identity: "You are the **{Project Name} Assistant**"
- About the project: 2-3 paragraph domain description
- Current user: name, role
- Current context: what entity/page the user is viewing
- Available tools: grouped by read/write/destructive with permission notes
- Guidelines: be concise, use tools for actions, present results in tables/lists, explain failures clearly, respond in the user's language

For Claude Code local agents, append tool schemas as JSON and the `<tool_call>` format. For Codex, describe tool domains instead of individual schemas.

#### Phase 6: Livewire Component

**Backend** (`app/Livewire/Assistant/AssistantPanel.php`):
- Properties: `open`, `message`, `conversationId`, `messages`, `loading`, `contextType`, `contextId`.
- Listeners: `assistant:open` to toggle panel, `assistant:context` to set page context.
- `send()`: optimistic UI (show user message immediately), get or create conversation, call `SendAssistantMessageAction`, append response.
- `newConversation()`: reset state. `loadConversation()`: load history from DB.

**Frontend** (`resources/views/livewire/assistant/assistant-panel.blade.php`):
- Slide-over panel from the right, toggled by floating button.
- Resizable width via drag handle (persist to localStorage).
- Message list with user/assistant bubbles and markdown rendering.
- Textarea input with Enter to send (Shift+Enter for newline).
- Conversation sidebar with history and new conversation button.
- Loading state with typing indicator.

**Include in layout** behind `@auth`:

```html
@auth
    <livewire:assistant.assistant-panel />
@endauth
```

**Pass context from detail pages**: `$dispatch('assistant:context', { type: 'order', id: '{{ $order->id }}' })`.

#### Phase 7: Local Agent Support (Optional)

- **Claude Code**: text-based `<tool_call>` loop — system prompt includes tool schemas, response parsed for tags, tools executed in-process, max 3 iterations.
- **Codex**: MCP native via `codex exec --full-auto -c 'mcp_servers={"project-name": {"command": "php", "args": ["artisan", "mcp:start", "project-name"]}}'`. Requires `/module-mcp` setup.

## Architecture

```
Livewire AssistantPanel
  -> SendAssistantMessageAction
       -> ConversationManager (history)
       -> ContextResolver (page context)
       -> AssistantToolRegistry (permission-filtered tools)
       -> Provider: Cloud (PrismPHP) | Claude Code (<tool_call>) | Codex (MCP)
```

## Checklist

After implementation, verify:

- [ ] Migration created and run
- [ ] Models with proper relationships
- [ ] AssistantToolRegistry returns tools filtered by user role
- [ ] Tool classes cover major domain read/write operations
- [ ] ConversationManager handles history and title generation
- [ ] ContextResolver supports all detail page types
- [ ] SendAssistantMessageAction orchestrates the full flow
- [ ] System prompt includes domain description, user role, context, tools, guidelines
- [ ] Livewire component handles send, new conversation, load conversation
- [ ] Panel is resizable with localStorage persistence
- [ ] Panel included in layout behind `@auth`
- [ ] Markdown rendering works in responses
- [ ] Loading indicator works
- [ ] All existing tests pass

## See Also

- [/module-mcp](../module-mcp/SKILL.md) — Add MCP server (prerequisite for Codex support)
- [PrismPHP docs](https://prismphp.com)
- [Livewire docs](https://livewire.laravel.com)
