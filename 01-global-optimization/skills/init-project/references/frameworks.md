# Per-framework detail — `fetch` and CLAUDE.md templates

Read this when running `fetch [framework]`, or when you need the per-stack CLAUDE.md template pointers. This is the per-variant matrix for `init-project`; the constitution rules that vary by framework live in [constitution.md](constitution.md).

## `fetch [framework]` — Fetch best practices for your stack

Fetches current best practices, conventions, and patterns for the detected or specified framework.

```
/init-project fetch rails
/init-project fetch nextjs
/init-project fetch laravel
/init-project fetch fastapi
/init-project fetch flutter
```

### Supported stacks

| Framework | What's fetched |
|-----------|---------------|
| `rails` | Rails 8 conventions, Hotwire patterns, service objects |
| `laravel` | Laravel 11 patterns, Livewire, Eloquent conventions |
| `nextjs` | App Router patterns, Server Components, data fetching |
| `fastapi` | Pydantic models, async patterns, dependency injection |
| `django` | Models, views, serializers, Django REST Framework |
| `express` | Middleware patterns, route organization, error handling |
| `flutter` | Widget patterns, state management, platform conventions |
| `ios` | SwiftUI, UIKit, async/await, MVVM patterns |

### Process

1. Search official documentation for current version
2. Find community-accepted conventions
3. Identify anti-patterns to avoid
4. Extract testing conventions
5. Summarize into memory-ready format

## Per-Framework CLAUDE.md Templates

See framework-specific guides for project-type CLAUDE.md templates:
- [Laravel](../../../../09-laravel-mcp-integration/guide.md)
- [iOS](../../../../11-mobile-development/ios/ios-guide.md)
- [macOS / Tauri / Electron](../../../../12-desktop-development/)
