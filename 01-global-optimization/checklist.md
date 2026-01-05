# Global Optimization Installation Checklist

Use this checklist to verify your global Claude Code optimization setup is complete and working correctly.

---

## File Creation Checklist

### Directory Structure

- [ ] `~/.claude/` directory exists
- [ ] `~/.claude/agents/` directory exists
- [ ] `~/.claude/settings/` directory exists
- [ ] `~/.claude/skills/` directory exists
- [ ] `~/.claude/system-prompts/` directory exists
- [ ] All 5 skill subdirectories exist (optimize, context, cache-inspector, update-docs, init-project)

**Verify**:
```bash
ls -la ~/.claude/
ls -la ~/.claude/skills/
```

---

### Agents (1 file)

- [ ] `~/.claude/agents/pm-orchestrator.md` exists
- [ ] File size > 10KB (contains complete agent definition)
- [ ] YAML frontmatter valid (name, description, model, version)
- [ ] Contains adaptive planning strategies
- [ ] Contains context preparation section
- [ ] Contains agent selection logic
- [ ] Contains continuous learning system
- [ ] Contains session summary template

**Verify**:
```bash
ls -la ~/.claude/agents/pm-orchestrator.md
head -20 ~/.claude/agents/pm-orchestrator.md  # Check YAML frontmatter
```

---

### Settings (4 JSON files)

#### prompt-caching.json

- [ ] `~/.claude/settings/prompt-caching.json` exists
- [ ] Valid JSON syntax (no errors when parsing)
- [ ] Contains `cache_control` section
- [ ] Contains `caching_rules` for: system_prompts, tool_definitions, memories, specs, constitution
- [ ] All rules have `enabled`, `min_tokens`, `ttl_minutes`
- [ ] Contains `metrics` section

**Verify**:
```bash
cat ~/.claude/settings/prompt-caching.json | python -m json.tool
# Should output formatted JSON with no errors
```

#### beta-features.json

- [ ] `~/.claude/settings/beta-features.json` exists
- [ ] Valid JSON syntax
- [ ] Contains `token_efficient_tools` with beta_header
- [ ] Contains `extended_thinking` (disabled by default)
- [ ] Contains `rollout_strategy` section

**Verify**:
```bash
cat ~/.claude/settings/beta-features.json | python -m json.tool
```

#### model-strategy.json

- [ ] `~/.claude/settings/model-strategy.json` exists
- [ ] Valid JSON syntax
- [ ] Contains `default_model` = "claude-sonnet-4-5-20250929"
- [ ] Contains all 3 models: haiku, sonnet, opus
- [ ] Each model has: id, cost_per_million, use_for, agents
- [ ] Contains `complexity_overrides` section
- [ ] Contains `target_distribution` (40% Haiku, 55% Sonnet, 5% Opus)
- [ ] Contains `metrics` section

**Verify**:
```bash
cat ~/.claude/settings/model-strategy.json | python -m json.tool
```

#### token-optimization.json

- [ ] `~/.claude/settings/token-optimization.json` exists
- [ ] Valid JSON syntax
- [ ] Contains `optimizations` section with all strategies
- [ ] symbol_first_exploration enabled (critical)
- [ ] memory_system enabled (critical)
- [ ] adaptive_planning enabled (high)
- [ ] checkpoint_system enabled (medium)
- [ ] pattern_reuse enabled (medium)
- [ ] Contains `enforcement_rules` section
- [ ] Contains `success_metrics` section
- [ ] Contains `logging` section

**Verify**:
```bash
cat ~/.claude/settings/token-optimization.json | python -m json.tool
```

---

### Skills (5 SKILL.md files)

#### /optimize

- [ ] `~/.claude/skills/optimize/SKILL.md` exists
- [ ] File size > 8KB
- [ ] YAML frontmatter: name="optimize"
- [ ] Contains usage examples for simple, medium, complex tasks
- [ ] Contains optimization enforcement rules
- [ ] Contains token savings metrics
- [ ] Contains integration with other tools

**Verify**:
```bash
ls -la ~/.claude/skills/optimize/SKILL.md
head -10 ~/.claude/skills/optimize/SKILL.md  # Check frontmatter
```

#### /context

- [ ] `~/.claude/skills/context/SKILL.md` exists
- [ ] File size > 8KB
- [ ] YAML frontmatter: name="context"
- [ ] Contains all 6 actions: load, save, list, refresh, inspect, clear
- [ ] Contains Serena activation automation
- [ ] Contains memory creation wizard
- [ ] Contains context inspection with cache status

**Verify**:
```bash
ls -la ~/.claude/skills/context/SKILL.md
```

#### /cache-inspector

- [ ] `~/.claude/skills/cache-inspector/SKILL.md` exists
- [ ] File size > 8KB
- [ ] YAML frontmatter: name="cache-inspector"
- [ ] Contains all 5 actions: status, analyze, optimize, report, clear
- [ ] Contains cache performance monitoring
- [ ] Contains token savings analysis
- [ ] Contains optimization recommendations

**Verify**:
```bash
ls -la ~/.claude/skills/cache-inspector/SKILL.md
```

#### /update-docs

- [ ] `~/.claude/skills/update-docs/SKILL.md` exists
- [ ] File size > 8KB
- [ ] YAML frontmatter: name="update-docs"
- [ ] Contains all 5 actions: research, collect, analyze, update, validate
- [ ] Supports --scope flag (global or project)
- [ ] Contains default sources (Anthropic, fastmcp.me, etc.)
- [ ] Contains backup system documentation

**Verify**:
```bash
ls -la ~/.claude/skills/update-docs/SKILL.md
```

#### /init-project

- [ ] `~/.claude/skills/init-project/SKILL.md` exists
- [ ] File size > 10KB
- [ ] YAML frontmatter: name="init-project"
- [ ] Contains all 6 workflows: detect, fetch, constitution, memories, optimize, --full
- [ ] Contains auto-detection logic for multiple languages
- [ ] Contains fastmcp.me integration
- [ ] Contains caching strategy (7-day TTL)
- [ ] Contains language-specific constitution templates

**Verify**:
```bash
ls -la ~/.claude/skills/init-project/SKILL.md
```

---

### System Prompts (2 files)

#### global-optimization.md

- [ ] `~/.claude/system-prompts/global-optimization.md` exists
- [ ] File size > 10KB
- [ ] Contains core optimization principles
- [ ] Symbol-first exploration marked MANDATORY
- [ ] Memory-first context loading marked MANDATORY
- [ ] Prompt caching marked AUTOMATIC
- [ ] Token-efficient tool use marked AUTOMATIC
- [ ] Contains enforcement rules
- [ ] Contains success metrics
- [ ] Contains integration with project workflows
- [ ] Contains continuous learning system
- [ ] Contains session summary template

**Verify**:
```bash
ls -la ~/.claude/system-prompts/global-optimization.md
wc -l ~/.claude/system-prompts/global-optimization.md  # Should be 200+ lines
```

#### symbol-first-protocol.md

- [ ] `~/.claude/system-prompts/symbol-first-protocol.md` exists
- [ ] File size > 10KB
- [ ] Contains core principle (NEVER read full file first)
- [ ] Contains protocol steps (verify, discover, targeted read)
- [ ] Contains common patterns (4+: update method, add method, dependencies, refactor)
- [ ] Contains advanced techniques (substring matching, filtering, pattern search)
- [ ] Contains fallback strategy (when to use Read tool)
- [ ] Contains token savings examples (90%+ documented)
- [ ] Contains troubleshooting guide

**Verify**:
```bash
ls -la ~/.claude/system-prompts/symbol-first-protocol.md
wc -l ~/.claude/system-prompts/symbol-first-protocol.md  # Should be 200+ lines
```

---

### Documentation (3 files)

#### README.md

- [ ] `~/.claude/README.md` exists
- [ ] File size > 15KB
- [ ] Contains quick start section
- [ ] Contains directory structure diagram
- [ ] Contains available skills documentation
- [ ] Contains "how it works" explanation
- [ ] Contains token savings breakdown table
- [ ] Contains integration with project workflows
- [ ] Contains best practices (DO/DON'T)
- [ ] Contains troubleshooting section
- [ ] Contains success stories with real numbers
- [ ] Contains maintenance schedule
- [ ] Contains next steps

**Verify**:
```bash
ls -la ~/.claude/README.md
grep "Quick Start" ~/.claude/README.md  # Should find section
```

#### INSTALLATION-COMPLETE.md

- [ ] `~/.claude/INSTALLATION-COMPLETE.md` exists
- [ ] File size > 10KB
- [ ] Contains what was installed summary
- [ ] Contains expected outcomes section
- [ ] Contains next steps for each project
- [ ] Contains verification checklist (this may reference this file)
- [ ] Contains complete file list (15+ files)
- [ ] Contains key features enabled section
- [ ] Contains monitoring and improvement section

**Verify**:
```bash
ls -la ~/.claude/INSTALLATION-COMPLETE.md
```

#### QUICK-REFERENCE.md

- [ ] `~/.claude/QUICK-REFERENCE.md` exists
- [ ] Contains all 5 global skills with examples
- [ ] Contains token savings table
- [ ] Contains quick check commands
- [ ] Contains common workflows
- [ ] Contains troubleshooting quick fixes
- [ ] Contains files reference section

**Verify**:
```bash
ls -la ~/.claude/QUICK-REFERENCE.md
grep "/optimize" ~/.claude/QUICK-REFERENCE.md  # Should find skill
```

---

## Functionality Checklist

### Skills Available

Test each skill in Claude Code conversation:

- [ ] `/optimize` command recognized
- [ ] `/context` command recognized
- [ ] `/cache-inspector` command recognized
- [ ] `/update-docs` command recognized
- [ ] `/init-project` command recognized

**Test**:
```
/optimize "test"
/context list
/cache-inspector status
/update-docs validate
/init-project detect
```

Each command should either execute or show helpful error (not "command not found").

---

### Configuration Valid

- [ ] PM Orchestrator can analyze task complexity (test with a task description)
- [ ] Prompt caching configuration is valid JSON
- [ ] Beta features configuration is valid JSON
- [ ] Model strategy configuration is valid JSON
- [ ] Token optimization configuration is valid JSON
- [ ] All JSON files pass syntax validation

**Test**:
```bash
# Validate all JSON files
for f in ~/.claude/settings/*.json; do
    echo "Validating $f..."
    python -m json.tool "$f" > /dev/null && echo "✅ Valid" || echo "❌ Invalid"
done
```

---

### PM Orchestrator Integration

- [ ] PM Orchestrator file has valid YAML frontmatter
- [ ] Contains all 3 planning strategies
- [ ] Contains context preparation steps
- [ ] Contains agent-to-model mapping
- [ ] Contains continuous learning system
- [ ] Can be loaded without errors

**Test**: Try a task with `/optimize` and check if PM Orchestrator is mentioned in the response.

---

### Token Optimization Features

- [ ] Symbol-first protocol documented and enforced
- [ ] Memory system described (load before explore)
- [ ] Prompt caching configured (90% savings)
- [ ] Token-efficient tools enabled (beta header)
- [ ] Adaptive planning configured (3 strategies)
- [ ] Model selection strategy documented
- [ ] Pattern reuse strategy documented

---

## File Count Verification

```bash
# Count all files (should be 15+)
find ~/.claude -type f | wc -l

# Expected:
# - 1 agent file (pm-orchestrator.md)
# - 4 settings files (*.json)
# - 5 skill files (*/SKILL.md)
# - 2 system prompts (*.md)
# - 3 documentation files (*.md)
# = 15 total minimum
```

- [ ] Total file count ≥ 15

---

## Documentation Quality

- [ ] README.md is comprehensive and clear
- [ ] All configuration files have inline comments/descriptions
- [ ] Skills have usage examples
- [ ] System prompts explain enforcement rules
- [ ] QUICK-REFERENCE.md is concise and helpful
- [ ] INSTALLATION-COMPLETE.md provides next steps

---

## Expected Outcomes Checklist

### Token Reduction Targets

- [ ] Conservative target documented: 30-50%
- [ ] Aggressive target documented: 50-70%
- [ ] Maximum target documented: 70-90% with caching
- [ ] Token savings table present in README.md

### Cost Savings

- [ ] Per-session savings calculated
- [ ] Monthly savings projected (30 sessions)
- [ ] Annual savings projected (360 sessions)
- [ ] Multiple projects savings calculated (3 projects)
- [ ] ROI timeline documented (2-3 sessions)

### Performance Metrics

- [ ] Cache hit rate target: 80%+
- [ ] Symbol-first adoption target: 95%+
- [ ] Model distribution target: 40% Haiku, 55% Sonnet, 5% Opus
- [ ] Token reduction minimum: 30-50%

---

## Maintenance Checklist

- [ ] Weekly maintenance tasks documented
- [ ] Monthly maintenance tasks documented
- [ ] Quarterly maintenance tasks documented
- [ ] Learning capture system in place (.claude/learnings/)
- [ ] Optimization log template exists

---

## Next Steps Checklist

- [ ] Project activation guide available (../02-project-activation/)
- [ ] Custom skills guide available (../03-custom-skills/)
- [ ] Research integration guide available (../04-research-integration/)
- [ ] Token optimization guide available (../05-token-optimization/)
- [ ] Advanced patterns guide available (../06-advanced-patterns/)

---

## Final Verification

### Quick Test

Run this complete test:

```bash
# 1. Check directory structure
echo "Checking directories..."
for dir in agents settings skills system-prompts; do
    [ -d ~/.claude/$dir ] && echo "✅ $dir exists" || echo "❌ $dir missing"
done

# 2. Count files
echo -e "\nCounting files..."
file_count=$(find ~/.claude -type f | wc -l)
echo "Total files: $file_count (minimum 15)"
[ $file_count -ge 15 ] && echo "✅ File count OK" || echo "❌ Too few files"

# 3. Validate JSON
echo -e "\nValidating JSON..."
for f in ~/.claude/settings/*.json; do
    python -m json.tool "$f" > /dev/null 2>&1 && echo "✅ $(basename $f)" || echo "❌ $(basename $f)"
done

# 4. Check skills
echo -e "\nChecking skills..."
for skill in optimize context cache-inspector update-docs init-project; do
    [ -f ~/.claude/skills/$skill/SKILL.md ] && echo "✅ $skill" || echo "❌ $skill missing"
done

# 5. Check system prompts
echo -e "\nChecking system prompts..."
for prompt in global-optimization.md symbol-first-protocol.md; do
    [ -f ~/.claude/system-prompts/$prompt ] && echo "✅ $prompt" || echo "❌ $prompt missing"
done

# 6. Check documentation
echo -e "\nChecking documentation..."
for doc in README.md INSTALLATION-COMPLETE.md QUICK-REFERENCE.md; do
    [ -f ~/.claude/$doc ] && echo "✅ $doc" || echo "❌ $doc missing"
done

echo -e "\n✅ Verification complete!"
```

### Success Criteria

- [ ] All directories exist
- [ ] File count ≥ 15
- [ ] All JSON files valid
- [ ] All skills exist
- [ ] All system prompts exist
- [ ] All documentation exists
- [ ] All slash commands work
- [ ] No errors in verification script

---

## If Verification Fails

### Missing Files

**Solution**: Re-run setup
- Use `setup-agent.md` for automated creation
- Or follow `guide.md` step-by-step

### Invalid JSON

**Solution**: Fix syntax
```bash
# Find which JSON is invalid
for f in ~/.claude/settings/*.json; do
    python -m json.tool "$f" > /dev/null 2>&1 || echo "Invalid: $f"
done

# Edit the invalid file
# Common issues: trailing commas, unquoted strings, missing brackets
```

### Skills Not Working

**Solution**: Check filenames
- Must be exactly `SKILL.md` (case-sensitive)
- Must be in subdirectory (e.g., `skills/optimize/SKILL.md`)
- Check YAML frontmatter syntax

---

## Post-Verification

Once all checks pass:

1. **✅ Mark installation complete**
2. **📖 Read** `~/.claude/README.md` for full documentation
3. **🚀 Proceed** to project activation (`../02-project-activation/guide.md`)
4. **📊 Monitor** token savings after first few sessions
5. **🤝 Share** `~/ai-prompts/` with your team

---

**Checklist Complete**: Your global Claude Code optimization is fully installed and verified!

**Next**: Activate for your current project (10-15 minutes)

**Expected**: 70-90% token reduction on all future sessions

**ROI**: Setup pays for itself in 2-3 sessions
