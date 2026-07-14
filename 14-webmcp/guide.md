# WebMCP Integration Guide

**Enable AI agents to interact with web applications through structured tools instead of DOM scraping.**

WebMCP is a W3C Draft Community Group Report (February 2026), jointly developed by Google and Microsoft. It adds a `navigator.modelContext` API that lets web pages register structured tools for AI agents — replacing unreliable screenshot/DOM-based approaches with semantic, typed function calls.

**Status**: Early Preview (Chrome 146 Canary behind flag). Not yet a finalized standard.
**Token savings**: 89% vs screenshot-based agent methods.
**Spec**: [webmachinelearning.github.io/webmcp](https://webmachinelearning.github.io/webmcp/)

---

## Table of Contents

1. [What WebMCP Solves](#1-what-webmcp-solves)
2. [WebMCP vs MCP](#2-webmcp-vs-mcp)
3. [Browser Support](#3-browser-support)
4. [API Reference](#4-api-reference)
5. [Implementation Patterns](#5-implementation-patterns)
6. [Integration with Claude Code](#6-integration-with-claude-code)
7. [CLAUDE.md Template](#7-claudemd-template)
8. [Limitations](#8-limitations)
9. [Resources](#9-resources)

---

## 1. What WebMCP Solves

Traditional AI agent interaction with websites:

```
Agent → screenshot page → parse with vision → guess button coordinates → click → hope it works
```

WebMCP interaction:

```
Agent → request available tools → get typed schemas → call function → get structured result
```

| Approach | Tokens per action | Reliability | Maintainability |
|----------|------------------|-------------|-----------------|
| Screenshot + vision | ~5,000 | Low (layout-dependent) | Breaks on CSS changes |
| DOM scraping | ~2,000 | Medium (selector-dependent) | Breaks on refactor |
| **WebMCP** | ~500 | High (schema-defined) | Stable API contract |

---

## 2. WebMCP vs MCP

WebMCP **complements** MCP — they solve different problems:

| | MCP | WebMCP |
|---|---|---|
| **Where** | Server-side, persistent | Browser tab, ephemeral |
| **Lifetime** | Always available | Only while page is open |
| **Access** | Backend APIs, databases, files | Live DOM, session, cookies |
| **Transport** | stdio / HTTP+SSE | In-browser (no network round trip) |
| **Use case** | Backend operations | Frontend interactions |

**Together**: MCP handles your server-side tools (database queries, file operations, API calls). WebMCP handles the browser-side (form submissions, UI state, live data).

---

## 3. Browser Support

| Browser | Status | Version | Notes |
|---------|--------|---------|-------|
| **Chrome** | Early Preview | 146 Canary | Behind `chrome://flags → WebMCP for testing` |
| **Edge** | Expected | TBD | Microsoft is co-author of the spec |
| **Firefox** | No plans announced | — | — |
| **Safari** | No plans announced | — | — |

**Timeline**: Formal announcements expected mid-to-late 2026 (Google Cloud Next / Google I/O).

> **Warning**: The spec is actively changing. In March 2026, `provideContext` and `clearContext` methods were removed. Pin to spec versions and watch the [GitHub repo](https://github.com/webmachinelearning/webmcp) for breaking changes.

---

## 4. API Reference

### Core API: `navigator.modelContext`

Available in **secure contexts only** (HTTPS).

#### `registerTool(tool)`

Register a JavaScript function as a tool for AI agents:

```javascript
navigator.modelContext.registerTool({
  name: "addToCart",
  description: "Add a product to the shopping cart by ID",
  inputSchema: {
    type: "object",
    properties: {
      productId: { type: "string", description: "Product SKU" },
      quantity: { type: "integer", default: 1 }
    },
    required: ["productId"]
  },
  execute: async (input, client) => {
    const result = await cart.add(input.productId, input.quantity);
    return { success: true, cartTotal: result.total };
  },
  annotations: { readOnlyHint: false }
});
```

**Parameters**:
- `name` (required) — unique identifier, throws `InvalidStateError` if duplicate
- `description` (required) — natural language description for agent understanding
- `inputSchema` (optional) — JSON Schema for parameters
- `execute` (required) — async callback receiving `(input, client)`
- `annotations` (optional) — metadata like `readOnlyHint: true` for safe operations

#### `unregisterTool(name)`

Remove a registered tool:

```javascript
navigator.modelContext.unregisterTool("addToCart");
```

#### `requestUserInteraction(callback)`

Available on the `client` parameter inside `execute`. Enables user confirmation flows:

```javascript
execute: async (input, client) => {
  const confirmed = await client.requestUserInteraction(async () => {
    return window.confirm(`Delete ${input.itemName}?`);
  });
  if (confirmed) { /* proceed */ }
}
```

### Security Model

- **Secure Context**: HTTPS only (no HTTP)
- **Same Origin**: tools are scoped to the registering origin
- **Tab-bound**: tools exist only while the page is open
- **User Control**: `requestUserInteraction()` for explicit consent

---

## 5. Implementation Patterns

### Pattern 1: Read-only data exposure

```javascript
// Safe: expose data without side effects
navigator.modelContext.registerTool({
  name: "getProductDetails",
  description: "Get product name, price, availability, and reviews",
  inputSchema: {
    type: "object",
    properties: { productId: { type: "string" } },
    required: ["productId"]
  },
  execute: async (input) => {
    const product = await fetch(`/api/products/${input.productId}`).then(r => r.json());
    return { name: product.name, price: product.price, inStock: product.available };
  },
  annotations: { readOnlyHint: true }
});
```

### Pattern 2: Form actions with confirmation

```javascript
navigator.modelContext.registerTool({
  name: "submitContactForm",
  description: "Submit the contact form with name, email, and message",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string", format: "email" },
      message: { type: "string" }
    },
    required: ["name", "email", "message"]
  },
  execute: async (input, client) => {
    const confirmed = await client.requestUserInteraction(async () => {
      return window.confirm(`Send message from ${input.name}?`);
    });
    if (!confirmed) return { cancelled: true };

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    return { success: response.ok };
  }
});
```

### Pattern 3: Declarative (HTML-based)

For standard form actions, WebMCP supports a declarative API without JavaScript:

```html
<form modelcontext-tool="searchProducts"
      modelcontext-description="Search products by keyword"
      action="/search" method="GET">
  <input name="q" type="text" modelcontext-description="Search keyword" />
  <button type="submit">Search</button>
</form>
```

> **Note**: The declarative API is less documented and may change. Prefer the imperative API for production use.

---

## 6. Integration with Claude Code

### With Chrome MCP (claude-in-chrome)

If your project already uses Chrome MCP for browser automation, WebMCP-enabled pages give your agents **structured tool access** instead of relying on `computer`, `find`, or `form_input` tools.

**Workflow**:
1. Navigate to your WebMCP-enabled page via `mcp__claude-in-chrome__navigate`
2. Agent discovers registered tools automatically
3. Agent calls tools with typed parameters instead of clicking/typing

### With Playwright MCP

Same benefit applies — WebMCP tools are faster and more reliable than DOM interaction via Playwright.

### Testing WebMCP locally

1. Enable the flag: `chrome://flags → WebMCP for testing → Enabled`
2. Open your dev server in Chrome Canary
3. Register tools via the console or your app code
4. Test with Claude Code's Chrome MCP connection

---

## 7. CLAUDE.md Template

Add this section to your project's `CLAUDE.md` when implementing WebMCP:

```markdown
## WebMCP

This project exposes WebMCP tools for AI agent interaction.

### Registered Tools
- `[toolName]` — [description] (read-only / write)
- `[toolName]` — [description] (read-only / write)

### Tool Registration
Tools are registered in `[path/to/webmcp-tools.js]`.
Follow existing patterns: readOnlyHint for safe operations, requestUserInteraction for mutations.

### Testing
1. Chrome Canary with `chrome://flags → WebMCP for testing` enabled
2. Open `[local dev URL]`
3. Verify tools via DevTools console: `navigator.modelContext`
```

---

## 8. Limitations

| Limitation | Impact | Workaround |
|-----------|--------|------------|
| **Chrome Canary only** | No production browser support yet | Use alongside traditional MCP for fallback |
| **Tab-bound** | Tools vanish on navigation | Re-register on page load |
| **No discovery** | Can't find WebMCP sites without visiting them | Maintain a tool registry / sitemap |
| **Spec instability** | API methods may change | Pin to spec versions, watch GitHub |
| **Frontend only** | No access to server-side data | Combine with MCP for backend |
| **Same-origin** | Can't register cross-origin tools | Use server-side MCP for external APIs |

---

## 9. Resources

### Official
- [WebMCP W3C Specification](https://webmachinelearning.github.io/webmcp/) — Draft Community Group Report
- [WebMCP GitHub](https://github.com/webmachinelearning/webmcp) — Spec source + issues
- [WebMCP Early Preview — Chrome](https://developer.chrome.com/blog/webmcp-epp) — Early preview announcement
- [When to use WebMCP and MCP](https://developer.chrome.com/blog/webmcp-mcp-usage) — Decision guide

### Community
- [WebMCP — The New Stack](https://thenewstack.io/webmcp-chrome-ai-agents/) — Technical overview
- [WebMCP Tutorial — DataCamp](https://www.datacamp.com/tutorial/webmcp-tutorial) — Building agent-ready websites
- [WebMCP updates — Patrick Brosset](https://patrickbrosset.com/articles/2026-02-23-webmcp-updates-clarifications-and-next-steps/) — Clarifications and next steps
- [webmcp.link](https://webmcp.link/) — Community resource hub

### Related in this library
- [`/agent-ready`](../01-global-optimization/skills/agent-ready/SKILL.md) — the global skill that audits a site's AI-agent readiness. Its scanner reports a `webMcp` discovery check; when it flags WebMCP as a worthwhile fix for a site that genuinely offers agent-usable tools, implement it using the patterns in this guide.

---

**Added**: v1.9.0 (2026-03-20)
**Status**: Monitor — spec is in early preview, not production-ready
**Action**: Implement WebMCP tools in web projects now for future-proofing; keep MCP as primary agent integration
