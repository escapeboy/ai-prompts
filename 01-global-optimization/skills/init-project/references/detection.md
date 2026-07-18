# `detect` — Stack detection detail

Full reference for the `detect` action. Read this when running detection or when you need the exact list of files the scan inspects.

## What it checks

- `package.json` → Node.js, framework (Next.js, Express, etc.), test runner
- `composer.json` → PHP/Laravel version and dependencies
- `Gemfile` → Ruby/Rails version
- `requirements.txt` / `pyproject.toml` → Python framework
- `Cargo.toml` → Rust
- `go.mod` → Go
- `*.xcodeproj` / `pubspec.yaml` → iOS/Flutter
- `Dockerfile` / `docker-compose.yml` → containerization
- `.github/workflows/` → CI/CD setup
- `README.md` → project description

## Output

```
## Project Detection Results

Stack detected:
- Language: Ruby 3.3
- Framework: Rails 8.0
- Database: PostgreSQL (ActiveRecord)
- Frontend: Hotwire (Turbo + Stimulus)
- Testing: RSpec + FactoryBot
- CI: GitHub Actions
- Docker: Yes (docker-compose.yml)
- Auth: Devise

Recommended memories to create:
- architecture.md ✓
- codebase-conventions.md ✓
- testing-strategy.md ✓
- docker-workflow.md ✓

Recommended constitution rules:
- Rails conventions (service objects, concerns, concerns)
- RSpec best practices
- Hotwire patterns

Run /init-project --full to complete setup.
```
