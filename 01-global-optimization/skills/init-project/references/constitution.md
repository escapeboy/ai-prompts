# `constitution` — Anatomy and per-framework rules

Read this when generating `.claude/settings/constitution.json`. The `fetch` / CLAUDE.md-template detail is in [frameworks.md](frameworks.md).

## What a constitution contains

```json
{
  "version": "1.0.0",
  "project": "my-rails-app",
  "framework": "Rails 8.0",
  "principles": [
    {
      "id": "fat-models-skinny-controllers",
      "rule": "Business logic belongs in models or service objects, not controllers",
      "enforcement": "mandatory",
      "examples": {
        "correct": "UserRegistrationService.call(params)",
        "incorrect": "def create; @user = User.new; if @user.save_with_team...; end"
      }
    },
    {
      "id": "no-raw-sql",
      "rule": "Use ActiveRecord query interface, not raw SQL strings",
      "enforcement": "mandatory",
      "exceptions": ["complex reports with CTEs are acceptable"]
    }
  ],
  "code_quality": {
    "max_method_lines": 15,
    "max_class_lines": 200,
    "test_coverage_minimum": "80%"
  },
  "security": {
    "no_user_input_in_sql": true,
    "validate_at_model_layer": true,
    "use_strong_parameters": true
  }
}
```

## Constitution rules by framework

- **Rails**: fat models, service objects, FormRequest for validation, no N+1 queries, Hotwire over JavaScript
- **Laravel**: repositories optional but consistent, FormRequest validation, eager loading, feature flags in config
- **Next.js**: Server Components by default, Client Components only for interactivity, no prop drilling past 2 levels
- **FastAPI**: Pydantic for all I/O, dependency injection for DB/auth, async everywhere
