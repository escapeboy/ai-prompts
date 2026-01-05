---
name: format
description: Format code using project-configured formatters
version: 1.0.0
---

# Format

Automatically format code using the project's configured formatters. Detects project type and runs the appropriate formatting tool.

---

## Usage

```
/format [path] [--check]
```

### Quick Examples

```bash
/format                    # Format entire project
/format app/Services/      # Format specific directory
/format --check            # Check formatting without changes
```

---

## Actions

### 1. Default Action (Format All)

When invoked without arguments, formats the entire project.

**Process**:
1. Detect project type:
   - Check for `composer.json` → PHP project
   - Check for `package.json` → JavaScript/TypeScript project
   - Check for `pyproject.toml` → Python project
   - Check for `Cargo.toml` → Rust project

2. Run appropriate formatter:
   - **PHP**: `vendor/bin/pint`
   - **JavaScript/TypeScript**: `npm run format` (or `npx prettier --write .`)
   - **Python**: `black .`
   - **Rust**: `cargo fmt`

3. Report results:
   - Number of files formatted
   - Any errors encountered

**Example**:
```
/format
```

**Expected Output**:
```
Detected: PHP (Laravel) project
Running: vendor/bin/pint
✅ Formatted 12 files
```

---

### 2. Format Specific Path

Format only a specific file or directory.

**Usage**:
```
/format [path]
```

**Process**:
1. Verify path exists
2. Determine if file or directory
3. Run formatter on specified path only
4. Report results

**Example**:
```
/format app/Services/UserService.php
/format resources/js/
```

---

### 3. Check Mode (--check)

Check if code is formatted without making changes.

**Usage**:
```
/format --check
/format app/Services/ --check
```

**Process**:
1. Run formatter in check/dry-run mode
2. Report files that would be changed
3. Exit with status (useful for CI)

**Example Output**:
```
Checking formatting...
⚠️ 3 files need formatting:
  - app/Services/UserService.php
  - app/Http/Controllers/UsersController.php
  - app/Models/User.php

Run `/format` to fix these files.
```

---

## Options

| Option | Description |
|--------|-------------|
| `--check` | Check formatting without making changes |
| `--verbose` | Show each file being formatted |

---

## Formatter Configuration

### PHP (Laravel Pint)

Config file: `pint.json`

```json
{
    "preset": "laravel",
    "rules": {
        "simplified_null_return": true,
        "braces": {
            "position_after_control_structures": "same"
        }
    }
}
```

### JavaScript/TypeScript (Prettier)

Config file: `.prettierrc`

```json
{
    "semi": true,
    "singleQuote": true,
    "tabWidth": 2,
    "trailingComma": "es5"
}
```

### Python (Black)

Config in `pyproject.toml`:

```toml
[tool.black]
line-length = 88
target-version = ['py311']
```

### Rust

Config in `rustfmt.toml`:

```toml
edition = "2021"
max_width = 100
```

---

## Integration

### Pre-Commit Hook

Use with git pre-commit:

```bash
# In .git/hooks/pre-commit
/format --check || exit 1
```

### With Other Skills

```
/format           # Format first
/test             # Then run tests
/commit "message" # Then commit
```

### CI/CD Pipeline

```yaml
# GitHub Actions example
- name: Check formatting
  run: |
    vendor/bin/pint --test
    # or: npm run format:check
```

---

## Docker Support

If project uses Docker, commands are wrapped:

```bash
# Instead of:
vendor/bin/pint

# Runs:
docker-compose exec app vendor/bin/pint
```

**Detection**: Automatically detects Docker if:
- `docker-compose.yml` exists
- `.serena/memories/docker-workflow.md` indicates Docker usage

---

## Token Optimization

**Estimated token usage**: ~500-1K tokens

**Why efficient**:
- Simple shell command execution
- No code analysis required
- Minimal context loading

---

## Error Handling

### Formatter Not Found

**Symptom**: `Command not found: vendor/bin/pint`

**Solution**:
```bash
# PHP
composer require laravel/pint --dev

# JavaScript
npm install --save-dev prettier

# Python
pip install black
```

### Formatter Errors

**Symptom**: Formatter reports syntax errors

**Solution**:
- Fix syntax errors first
- Formatter can't fix broken code

---

## Troubleshooting

### Wrong Formatter Detected

**Symptom**: Using wrong formatter for project

**Fix**: The detection order is:
1. `composer.json` → PHP
2. `package.json` → JavaScript
3. `pyproject.toml` → Python
4. `Cargo.toml` → Rust

If your project has multiple, the first match is used. Specify path to target specific files:
```
/format resources/js/   # Force JS formatter on this path
```

### Docker Commands Failing

**Symptom**: Commands fail because not using Docker

**Fix**: Ensure docker-compose.yml exists and Docker is running:
```bash
docker-compose ps
```

---

## Examples

### Example 1: Quick Format Before Commit

**Situation**: You've made changes and want to format before committing.

```
/format
```

**Result**: All changed files are formatted according to project standards.

---

### Example 2: Format New Module

**Situation**: You've created a new module and want to format just those files.

```
/format app/Modules/Billing/
```

**Result**: Only files in the Billing module are formatted.

---

### Example 3: CI Check

**Situation**: Verify formatting in CI pipeline.

```
/format --check
```

**Result**: Reports any files needing formatting, fails if any found.

---

## See Also

- `/test` - Run tests after formatting
- `/commit` - Commit formatted code
- `/lint` - Run linting (if you create this skill)
