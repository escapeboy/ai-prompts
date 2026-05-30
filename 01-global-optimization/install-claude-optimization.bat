@echo off
chcp 65001 >nul
title Claude Code optimization setup
powershell -NoProfile -ExecutionPolicy Bypass -Command "$t=[IO.File]::ReadAllText('%~f0',[Text.Encoding]::UTF8); $m='#'+'==PSSTART=='; $i=$t.IndexOf($m); if($i -lt 0){Write-Host 'Marker not found' -ForegroundColor DarkYellow; exit 1}; Invoke-Expression $t.Substring($i+$m.Length)"
echo.
pause
exit /b
#==PSSTART==
<#
    Claude Code optimization setup automator
    Repo: https://github.com/escapeboy/ai-prompts

    Automatically sets up the global optimization configuration for Claude Code.

    What it does:
      1. Creates the ~/.claude/{agents,settings,skills,system-prompts} structure
      2. Downloads the repo and lays out agents / skills / system-prompts
      3. Writes the 4 JSON configs and docs
      4. Optionally installs Serena MCP + its .NET prerequisites (via winget)
         and registers it so Claude Code auto-starts it every session
      5. Verifies the result

    Run:
      Download this .bat from https://github.com/escapeboy/ai-prompts and double-click it.
      No separate .ps1 file is needed - this single file contains everything.
#>

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$RepoZip   = 'https://github.com/escapeboy/ai-prompts/archive/refs/heads/master.zip'
$SubDir    = '01-global-optimization'
$ClaudeDir = Join-Path $HOME '.claude'

function Write-Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor DarkYellow }
function Write-Ok($msg)   { Write-Host "  [OK] $msg" -ForegroundColor DarkYellow }
function Write-Warn2($msg){ Write-Host "  [!]  $msg" -ForegroundColor DarkYellow }

Write-Host "==========================================" -ForegroundColor DarkYellow
Write-Host "  Claude Code: optimization setup"          -ForegroundColor DarkYellow
Write-Host "  Repo: github.com/escapeboy/ai-prompts"     -ForegroundColor White
Write-Host "  Target: $ClaudeDir"                        -ForegroundColor White
Write-Host "==========================================" -ForegroundColor DarkYellow

if (Test-Path $ClaudeDir) {
    Write-Warn2 "~/.claude already exists. Files will be added/overwritten; existing settings are not deleted."
}

# --- Step 1: directory structure ---
Write-Step "Step 1: creating directory structure"
foreach ($d in @('agents','settings','skills','system-prompts',
                 'skills\optimize','skills\context','skills\cache-inspector',
                 'skills\update-docs','skills\init-project')) {
    $path = Join-Path $ClaudeDir $d
    New-Item -ItemType Directory -Force -Path $path | Out-Null
}
Write-Ok "Directories created"

# --- Step 2: download repo and copy files ---
Write-Step "Step 2: downloading files from the repository"
$tmp = Join-Path $env:TEMP ("claude-opt-" + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$zip = Join-Path $tmp 'repo.zip'

$downloaded = $false
try {
    Invoke-WebRequest -Uri $RepoZip -OutFile $zip -UseBasicParsing
    Expand-Archive -Path $zip -DestinationPath $tmp -Force
    $src = Get-ChildItem -Path $tmp -Directory |
           Where-Object { Test-Path (Join-Path $_.FullName $SubDir) } |
           Select-Object -First 1
    if ($src) {
        $srcRoot = Join-Path $src.FullName $SubDir
        foreach ($folder in @('agents','skills','system-prompts','settings')) {
            $from = Join-Path $srcRoot $folder
            if (Test-Path $from) {
                Copy-Item -Path (Join-Path $from '*') -Destination (Join-Path $ClaudeDir $folder) -Recurse -Force
                Write-Ok "Copied: $folder"
            }
        }
        $downloaded = $true
    } else {
        Write-Warn2 "Could not find the $SubDir folder in the archive."
    }
}
catch {
    Write-Warn2 "Failed to download the repository: $($_.Exception.Message)"
    Write-Warn2 "The configs and docs below will still be created locally. Download skills and system-prompts manually from the repo."
}
finally {
    Remove-Item -Path $tmp -Recurse -Force -ErrorAction SilentlyContinue
}

# --- Step 3: JSON configs (always written) ---
Write-Step "Step 3: writing settings (settings/*.json)"
$settingsDir = Join-Path $ClaudeDir 'settings'

$promptCaching = @'
{
  "version": "1.0.0",
  "description": "Prompt caching configuration for 90% cost savings on repeated content reads",
  "cache_control": {
    "type": "ephemeral",
    "auto_enable": true
  },
  "caching_rules": {
    "system_prompts": {
      "enabled": true,
      "min_tokens": 1024,
      "ttl_minutes": 60,
      "description": "Cache all agent system prompts (pm-orchestrator, KFC agents, etc.)"
    },
    "tool_definitions": {
      "enabled": true,
      "min_tokens": 1024,
      "ttl_minutes": 60,
      "description": "Cache MCP tool definitions (Serena, Codex-CLI, etc.)"
    },
    "memories": {
      "enabled": true,
      "min_tokens": 1024,
      "ttl_minutes": 60,
      "auto_cache": ["architecture.md", "codebase-conventions.md", "module-structure.md"],
      "description": "Cache Serena memories for 60-70% session savings"
    },
    "specs": {
      "enabled": true,
      "min_tokens": 2048,
      "ttl_minutes": 60,
      "conditional": true,
      "description": "Cache large spec documents during implementation"
    },
    "constitution": {
      "enabled": true,
      "min_tokens": 1024,
      "ttl_minutes": 60,
      "description": "Cache constitution for fast decision checks"
    }
  },
  "cache_warming": {
    "enabled": false,
    "description": "Pre-cache frequently used content on session start (experimental)"
  },
  "metrics": {
    "track_hit_rate": true,
    "track_cost_savings": true,
    "log_file": ".claude/learnings/cache-performance.log"
  }
}
'@

$betaFeatures = @'
{
  "version": "1.0.0",
  "description": "Claude API beta features configuration",
  "features": {
    "token_efficient_tools": {
      "enabled": true,
      "beta_header": "token-efficient-tools-2025-02-19",
      "description": "14-70% reduction in tool output tokens",
      "apply_to": ["all_agents"],
      "metrics": {
        "track_savings": true,
        "log_file": ".claude/learnings/tool-efficiency.log"
      }
    },
    "extended_thinking": {
      "enabled": false,
      "beta_header": "interleaved-thinking-2025-05-14",
      "description": "Deeper reasoning for complex decisions (uses extra tokens)",
      "apply_to": ["spec-design", "spec-judge"],
      "thinking_budget_tokens": 10000,
      "use_only_when": [
        "Architectural decisions with long-term impact",
        "Security reviews",
        "Judge evaluation with 3+ competing designs"
      ],
      "default": false,
      "reason_disabled": "Uses additional tokens. Enable only for critical decisions."
    }
  },
  "rollout_strategy": {
    "gradual": true,
    "test_before_global": true,
    "rollback_on_issues": true
  }
}
'@

$modelStrategy = @'
{
  "version": "1.0.0",
  "description": "Model selection strategy for cost optimization",
  "default_model": "claude-sonnet-4-6",
  "models": {
    "haiku": {
      "id": "claude-haiku-4-5",
      "cost_per_million": { "input": 1, "output": 5 },
      "use_for": [
        "Requirements generation (template-driven)",
        "Task decomposition (structured)",
        "Simple refactoring (clear patterns)",
        "Code formatting (deterministic)"
      ],
      "agents": ["spec-requirements", "spec-tasks"],
      "cost_savings_vs_sonnet": "60%"
    },
    "sonnet": {
      "id": "claude-sonnet-4-6",
      "cost_per_million": { "input": 3, "output": 15 },
      "use_for": [
        "Implementation (balanced)",
        "Design (architectural thinking)",
        "Testing (comprehensive)",
        "Debugging (analysis)",
        "PM orchestration (coordination)"
      ],
      "agents": ["spec-design", "spec-impl", "spec-test", "pm-orchestrator"],
      "default": true
    },
    "opus": {
      "id": "claude-opus-4-8",
      "cost_per_million": { "input": 5, "output": 25 },
      "use_for": [
        "Architectural decisions (critical, long-term impact)",
        "Security reviews (safety-critical)",
        "Judge evaluation (3+ options to evaluate)"
      ],
      "agents": ["spec-judge"],
      "require_justification": true,
      "cost_premium_vs_sonnet": "67%",
      "usage_target": "<5% of total operations"
    }
  },
  "target_distribution": {
    "haiku": "40%",
    "sonnet": "55%",
    "opus": "5%",
    "description": "Ideal usage across all operations for cost optimization"
  },
  "metrics": {
    "track_usage": true,
    "track_cost": true,
    "log_file": ".claude/learnings/model-usage.log"
  }
}
'@

$tokenOpt = @'
{
  "version": "1.0.0",
  "description": "Comprehensive token optimization strategies",
  "optimizations": {
    "symbol_first_exploration": {
      "enabled": true,
      "priority": "critical",
      "enforcement": "mandatory",
      "description": "Use Serena symbolic tools before reading full files",
      "savings": "65-75%",
      "required_tools": ["mcp__serena__find_symbol", "mcp__serena__get_symbols_overview"],
      "fallback": "Read tool if Serena unavailable",
      "protocol_file": "~/.claude/system-prompts/symbol-first-protocol.md"
    },
    "memory_system": {
      "enabled": true,
      "priority": "critical",
      "enforcement": "mandatory",
      "description": "Load Serena memories before exploring code",
      "savings": "60-70%",
      "auto_load": ["architecture.md", "codebase-conventions.md"],
      "conditional_load": ["module-structure.md", "testing-strategy.md", "docker-workflow.md"],
      "required_tools": ["mcp__serena__list_memories", "mcp__serena__read_memory"]
    },
    "adaptive_planning": {
      "enabled": true,
      "priority": "high",
      "enforcement": "automatic",
      "description": "Skip unnecessary phases for simple tasks",
      "savings": "40-50%",
      "orchestrator": "pm-orchestrator.md"
    },
    "pattern_reuse": {
      "enabled": true,
      "priority": "medium",
      "enforcement": "automatic",
      "description": "Search existing specs/code for similar patterns",
      "savings": "50%",
      "search_locations": [".claude/specs/", ".claude/learnings/common-patterns.md"],
      "tools": ["Grep", "mcp__serena__search_for_pattern"]
    }
  },
  "logging": {
    "enabled": true,
    "log_file": ".claude/learnings/optimization-log.md",
    "include_metrics": true,
    "include_violations": true,
    "include_fallbacks": true
  }
}
'@

Set-Content -Path (Join-Path $settingsDir 'prompt-caching.json')     -Value $promptCaching -Encoding UTF8
Set-Content -Path (Join-Path $settingsDir 'beta-features.json')      -Value $betaFeatures  -Encoding UTF8
Set-Content -Path (Join-Path $settingsDir 'model-strategy.json')     -Value $modelStrategy -Encoding UTF8
Set-Content -Path (Join-Path $settingsDir 'token-optimization.json') -Value $tokenOpt      -Encoding UTF8
Write-Ok "4 JSON configs written"

# --- Step 4: documentation ---
Write-Step "Step 4: creating documentation"
$quickRef = @'
# Claude Code Optimization - Quick Reference

## Global Skills (Slash Commands)
- /optimize [task]      Maximum token efficiency mode
- /context [action]     Memory management (load|save|list|refresh|inspect|clear)
- /cache-inspector ...  Cache performance (status|analyze|optimize|report)
- /update-docs ...      Update docs (research|collect|analyze|update|validate)
- /init-project ...     Init new project (detect|fetch|constitution|memories|optimize|--full)

## Token Savings Targets
Prompt Caching        90%
Memories              60-70%
Symbol-First          65-75%
Adaptive Planning     40-50%
Token-Efficient Tools 14-70%
Model Selection       60%
Pattern Reuse         50%
Combined: 70-90% total reduction

## Common Workflows
New project:      /init-project --full -> /context load -> /optimize "first task"
Existing project: /context load -> /optimize "your task"

## Files Reference
Settings:       ~/.claude/settings/*.json
Agents:         ~/.claude/agents/pm-orchestrator.md
Skills:         ~/.claude/skills/*/SKILL.md
System Prompts: ~/.claude/system-prompts/*.md
'@
Set-Content -Path (Join-Path $ClaudeDir 'QUICK-REFERENCE.md') -Value $quickRef -Encoding UTF8

$readme = @'
# ~/.claude global optimization setup

Installed by the Claude Code optimization setup automator.
Repo: https://github.com/escapeboy/ai-prompts

Structure:
  agents/          orchestrator (pm-orchestrator.md)
  settings/        4 JSON configs
  skills/          slash commands (optimize, context, cache-inspector, update-docs, init-project)
  system-prompts/  global behavior

Quick start: see QUICK-REFERENCE.md

Serena MCP (optional, for maximum savings).
Prerequisites (install via winget):
  winget install --id Microsoft.DotNet.SDK.10 -e --accept-source-agreements --accept-package-agreements
  winget install --id Microsoft.DotNet.DesktopRuntime.10 -e --accept-source-agreements --accept-package-agreements
Install Serena as a uv tool (uv required first), then init:
  uv tool install -p 3.13 serena-agent
  uv tool update-shell
  serena init
Register Serena with Claude Code:
  claude mcp add serena -s user -- serena start-mcp-server --context ide-assistant
The -s user scope makes Claude Code launch Serena automatically on every start.
At the start of a session inside a project: "Activate the current dir as project using serena".
'@
Set-Content -Path (Join-Path $ClaudeDir 'README.md') -Value $readme -Encoding UTF8
Write-Ok "README.md and QUICK-REFERENCE.md created"

# --- Step 5: Serena MCP (optional) ---
Write-Step "Step 5: Serena MCP (optional, for maximum savings)"
Write-Host "  Serena is NOT required. Without it the base set still works (~40-50% savings)."
Write-Host "  With it, symbol-first / memory-first give the maximum savings."
Write-Host "  Choosing yes will ALSO install Serena prerequisites via winget:"
Write-Host "    - .NET SDK 10             (Microsoft.DotNet.SDK.10)"
Write-Host "    - .NET Desktop Runtime 10 (Microsoft.DotNet.DesktopRuntime.10)"
$ans = Read-Host "  Install Serena MCP (and prerequisites) now? (y/N)"

if ($ans -match '^(y|yes)$') {

    # Native tools (winget/uv/serena/claude) print progress to stderr.
    # With EAP='Stop' PowerShell would treat that as a fatal error and abort the step,
    # which is why manual cmd works but the script did not. Relax it for this block.
    $prevEAP = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    if (Test-Path variable:PSNativeCommandUseErrorActionPreference) { $PSNativeCommandUseErrorActionPreference = $false }

    # 5a. Prerequisites via winget: .NET 10 SDK + .NET Desktop Runtime 10
    if ($null -ne (Get-Command winget -ErrorAction SilentlyContinue)) {
        foreach ($pkg in @('Microsoft.DotNet.SDK.10','Microsoft.DotNet.DesktopRuntime.10')) {
            Write-Host "  Installing prerequisite: $pkg ..."
            winget install --id $pkg -e --accept-source-agreements --accept-package-agreements
        }
        Write-Ok ".NET prerequisites processed"
    }
    else {
        Write-Warn2 "winget not found - cannot install .NET prerequisites automatically."
        Write-Host "      Install App Installer from the Microsoft Store, or install .NET SDK 10"
        Write-Host "      and .NET Desktop Runtime 10 manually, then re-run this step."
    }

    # 5b. Claude Code CLI present?
    $hasClaude = $null -ne (Get-Command claude -ErrorAction SilentlyContinue)
    if (-not $hasClaude) {
        Write-Warn2 "Claude Code CLI ('claude') not found in PATH."
        Write-Host "      Install Claude Code, then run manually:"
        Write-Host "      claude mcp add serena -s user -- serena start-mcp-server --context ide-assistant"
    }
    else {
        # 5c. uv present? (needed to install Serena as a tool) - install if missing
        $hasUv = $null -ne (Get-Command uv -ErrorAction SilentlyContinue)
        if (-not $hasUv) {
            Write-Warn2 "'uv' (required to install Serena) not found."
            $instUv = Read-Host "  Install uv via the official Astral script? (y/N)"
            if ($instUv -match '^(y|yes)$') {
                try {
                    Invoke-RestMethod https://astral.sh/uv/install.ps1 | Invoke-Expression
                    Write-Ok "uv installed."
                    $env:Path = [Environment]::GetEnvironmentVariable('Path','User') + ';' + [Environment]::GetEnvironmentVariable('Path','Machine')
                    $hasUv = $null -ne (Get-Command uv -ErrorAction SilentlyContinue)
                }
                catch {
                    Write-Warn2 "Automatic uv install failed: $($_.Exception.Message)"
                    Write-Host "      Install manually: https://docs.astral.sh/uv/getting-started/installation/"
                }
            }
        }

        # 5d. Install Serena as a uv tool, init it, register with Claude Code
        if ($hasUv) {
            Write-Host "  Installing Serena as a uv tool (Python 3.13)..."
            uv tool install -p 3.13 serena-agent
            uv tool update-shell
            # refresh PATH for this session so 'serena' becomes resolvable
            $env:Path = [Environment]::GetEnvironmentVariable('Path','User') + ';' + [Environment]::GetEnvironmentVariable('Path','Machine')

            if ($null -ne (Get-Command serena -ErrorAction SilentlyContinue)) {
                Write-Host "  Initialising Serena..."
                serena init
                Write-Ok "Serena installed and initialised."
            }
            else {
                Write-Warn2 "'serena' is not on PATH yet in this session. After restarting the terminal, run: serena init"
            }

            Write-Host "  Registering Serena in Claude Code (scope: user, auto-starts every session)..."
            try {
                & claude mcp add serena -s user -- serena start-mcp-server --context ide-assistant
                Write-Ok "Serena registered. Claude Code launches it automatically on every start."
                Write-Host "  Current MCP servers:"
                & claude mcp list
                Write-Host "  Inside a project, at session start tell Claude:"
                Write-Host "      'Activate the current dir as project using serena'"
            }
            catch {
                Write-Warn2 "claude mcp add failed: $($_.Exception.Message)"
            }
        }
        else {
            Write-Warn2 "uv unavailable - skipping Serena. Install uv and run the commands from the README manually."
        }
    }
}
else {
    Write-Host "  Skipped. The base optimization set is already installed."
}

# --- Step 6: verification ---
Write-Step "Step 6: verifying installation"
$count = (Get-ChildItem -Path $ClaudeDir -Recurse -File).Count
Write-Host "  Total files in ~/.claude: $count"

$skills = Get-ChildItem -Path (Join-Path $ClaudeDir 'skills') -Filter 'SKILL.md' -Recurse -ErrorAction SilentlyContinue
Write-Host "  Skills found (SKILL.md): $($skills.Count) / 5"
if (-not $downloaded) {
    Write-Warn2 "Repo did not download - skills, system-prompts and pm-orchestrator must be added manually."
}

Write-Host "`n==========================================" -ForegroundColor White
Write-Host "  Done." -ForegroundColor DarkYellow
Write-Host "  Next: open Claude Code and run  /optimize ""test""" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor White
