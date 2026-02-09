# Laravel MCP Integration

**Connect Claude Code with Laravel's MCP ecosystem for intelligent project-aware assistance.**

This section covers the Laravel-specific MCP (Model Context Protocol) servers that give Claude Code deep understanding of your Laravel project structure, routes, models, and available packages.

---

## Overview

Laravel's MCP ecosystem provides two complementary tools:

| Tool | Purpose | Scope | Transport |
|------|---------|-------|-----------|
| **Laravel Boost** | Project-aware assistance (routes, models, config) | Per-project | stdio |
| **LaraPlugins.io MCP** | Package discovery and documentation | Cross-project | HTTP (SSE) |

### Laravel Boost (Official)

Laravel Boost is the official MCP server from Laravel. It gives Claude Code direct access to:

- **Routes** - All registered routes with middleware, controllers, and parameters
- **Models** - Eloquent models with relationships, scopes, and casts
- **Config** - Application configuration values
- **Schema** - Database schema, tables, columns, indexes
- **Artisan** - Available artisan commands and their signatures
- **Logs** - Application log entries for debugging
- **Queues** - Queue jobs and their status

**When to use**: Always. Install in every Laravel project for context-aware code generation.

### LaraPlugins.io MCP

LaraPlugins.io provides a community-maintained MCP server for discovering and researching Laravel packages:

- **Package search** - Find packages by functionality
- **Documentation** - Access package docs without leaving Claude Code
- **Compatibility** - Check Laravel version compatibility
- **Alternatives** - Compare similar packages

**When to use**: When researching which package to use, checking package APIs, or exploring alternatives.

---

## Quick Start

```bash
# 1. Install Laravel Boost in your project
composer require laravel/boost --dev
php artisan boost:install

# 2. Add LaraPlugins MCP (one-time, user scope)
claude mcp add --transport http --scope user laraplugins https://laraplugins.io/mcp

# 3. Verify both servers
claude mcp list
```

See [setup-guide.md](setup-guide.md) for detailed configuration.

---

## Files in This Section

| File | Description |
|------|-------------|
| [setup-guide.md](setup-guide.md) | Step-by-step installation and configuration |
| [laravel-claude-md-template.md](laravel-claude-md-template.md) | CLAUDE.md template for Laravel projects |
| [laravel-subagent.md](laravel-subagent.md) | Custom subagent definition for Laravel development |

---

## How It Fits Together

```
Claude Code Session
    |
    +-- Laravel Boost MCP (per-project)
    |     +-- Routes, Models, Schema, Config
    |     +-- Artisan commands, Logs, Queues
    |
    +-- LaraPlugins.io MCP (user scope)
    |     +-- Package search & docs
    |     +-- Compatibility checks
    |
    +-- Serena MCP (code intelligence)
    |     +-- Symbols, references, navigation
    |
    +-- CLAUDE.md (project conventions)
          +-- Coding standards, patterns
          +-- Architecture decisions
```

**Combined benefit**: Claude Code knows your routes, models, and schema (Boost), can research packages (LaraPlugins), navigate code symbolically (Serena), and follows your project conventions (CLAUDE.md).

---

## Compatibility

- **Laravel**: 11.x, 12.x
- **PHP**: 8.2+
- **Claude Code**: All versions with MCP support
- **Models**: Opus 4.6, Sonnet 4.5, Haiku 4.5
