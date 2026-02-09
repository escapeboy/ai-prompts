# Laravel MCP Setup Guide

**Step-by-step configuration for Laravel Boost and LaraPlugins.io MCP servers.**

---

## Prerequisites

- Laravel 11.x or 12.x project
- PHP 8.2+
- Composer installed
- Claude Code installed and working

---

## Step 1: Install Laravel Boost

Laravel Boost is the official MCP server that gives Claude Code access to your project's routes, models, schema, and more.

### Install

```bash
cd /path/to/your-laravel-project

# Install the package
composer require laravel/boost --dev

# Run the installer (creates .mcp.json automatically)
php artisan boost:install
```

### What `boost:install` Creates

The installer generates a `.mcp.json` file in your project root:

```json
{
  "mcpServers": {
    "laravel-boost": {
      "command": "php",
      "args": ["artisan", "boost:mcp"],
      "transport": "stdio"
    }
  }
}
```

This file is automatically detected by Claude Code when you open the project.

### Manual MCP Registration (Alternative)

If you prefer to register manually instead of using `.mcp.json`:

```bash
claude mcp add --transport stdio --scope local laravel-boost -- php artisan boost:mcp
```

### Verify Installation

```bash
# Check MCP servers
claude mcp list

# You should see:
# laravel-boost  local  stdio  php artisan boost:mcp
```

---

## Step 2: Configure LaraPlugins.io MCP

LaraPlugins.io provides package discovery and documentation access.

### Register (One-Time)

```bash
# Add as user-scope server (available in all projects)
claude mcp add --transport http --scope user laraplugins https://laraplugins.io/mcp
```

### Verify

```bash
claude mcp list

# You should see:
# laraplugins    user   http   https://laraplugins.io/mcp
```

---

## Step 3: Create CLAUDE.md

Every Laravel project should have a `CLAUDE.md` file that tells Claude Code about your project conventions.

```bash
# Copy the template
cp /path/to/ai-prompts/09-laravel-mcp-integration/laravel-claude-md-template.md ./CLAUDE.md

# Edit to match your project
# Fill in: project name, PHP version, key patterns, etc.
```

See [laravel-claude-md-template.md](laravel-claude-md-template.md) for the full template.

---

## Step 4: Verify Complete Setup

Run this checklist:

```bash
# 1. MCP servers registered
claude mcp list
# Expected: laravel-boost (local), laraplugins (user)

# 2. CLAUDE.md exists
cat CLAUDE.md | head -5

# 3. Boost can access your project
# Start Claude Code and ask: "List all routes in this project"
# If Boost is working, it will return actual route data

# 4. LaraPlugins can search packages
# Ask: "Search for a Laravel package for PDF generation"
```

---

## Usage Examples

### With Laravel Boost

Once installed, Claude Code can directly query your project:

**Routes**:
```
"Show me all API routes that use authentication middleware"
```

**Models**:
```
"What relationships does the User model have?"
```

**Schema**:
```
"Show me the orders table schema with all indexes"
```

**Debugging**:
```
"Check the last 50 log entries for errors related to payments"
```

### With LaraPlugins.io

**Package Research**:
```
"Find the best Laravel package for handling file uploads to S3"
```

**Compatibility Check**:
```
"Is spatie/laravel-permission compatible with Laravel 12?"
```

**Documentation**:
```
"Show me how to configure spatie/laravel-medialibrary collections"
```

### Combined Workflow

```
1. "What's the current schema for the orders table?" (Boost)
2. "Find a package for generating PDF invoices from orders" (LaraPlugins)
3. "Add the barryvdh/laravel-dompdf package and create an InvoiceService" (Both + Code)
```

---

## Troubleshooting

### "Laravel Boost not found"

```bash
# Ensure package is installed
composer show laravel/boost

# Re-run installer
php artisan boost:install

# Check .mcp.json exists
cat .mcp.json
```

### "MCP connection failed"

```bash
# Test the MCP server manually
php artisan boost:mcp

# Check PHP version
php -v  # Must be 8.2+

# Check Laravel version
php artisan --version  # Must be 11.x or 12.x
```

### "LaraPlugins not responding"

```bash
# Check network connectivity
curl -I https://laraplugins.io/mcp

# Re-register
claude mcp remove laraplugins
claude mcp add --transport http --scope user laraplugins https://laraplugins.io/mcp
```

### ".mcp.json not detected"

```bash
# Ensure file is in project root (same level as artisan)
ls -la .mcp.json

# Restart Claude Code session
# .mcp.json is read at session start
```

---

## Advanced Configuration

### Custom Boost Tools

You can configure which tools Boost exposes in `.mcp.json`:

```json
{
  "mcpServers": {
    "laravel-boost": {
      "command": "php",
      "args": ["artisan", "boost:mcp"],
      "transport": "stdio",
      "env": {
        "BOOST_TOOLS": "routes,models,schema,logs"
      }
    }
  }
}
```

### Multiple Laravel Projects

Each project gets its own Boost instance (local scope). LaraPlugins is shared (user scope):

```
Project A/.mcp.json -> laravel-boost (Project A's routes, models)
Project B/.mcp.json -> laravel-boost (Project B's routes, models)
~/.claude/settings -> laraplugins (shared package search)
```

### CI/CD Integration

Add `.mcp.json` to your repository so all team members get Boost automatically:

```bash
# Add to git
git add .mcp.json
git commit -m "Add Laravel Boost MCP configuration"
```

---

## Performance Tips

1. **Boost caches schema** - First query may be slow, subsequent queries are fast
2. **Use specific queries** - "Show User model relationships" is faster than "Show me everything about models"
3. **LaraPlugins has rate limits** - Don't spam package searches; cache results mentally
4. **Combine with Serena** - Use Boost for project metadata, Serena for code navigation
