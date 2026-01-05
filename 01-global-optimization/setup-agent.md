---
name: global-optimization-setup
description: Automated global Claude Code optimization setup agent
model: claude-sonnet-4-5-20250929
version: 1.0.0
---

# Global Optimization Setup Agent

**Purpose**: Automate the creation of global Claude Code optimization configuration (~/.claude/) for 70-90% token reduction across all projects.

**Time**: 15-30 minutes (automated)
**Manual alternative**: See guide.md (2-3 hours)

---

## GOAL

Create complete `~/.claude/` global configuration including:
- 1 PM Orchestrator agent
- 4 settings files (JSON)
- 5 skills (slash commands)
- 2 system prompts
- 3 documentation files

**Total**: 15 files providing 70-90% token reduction on all future projects

---

## PREREQUISITES

Before running this agent, verify:
- [ ] Claude Code installed and working
- [ ] MCP servers available (check with `/help`)
- [ ] Command-line access
- [ ] No existing `~/.claude/` directory (or willing to overwrite)

---

## EXECUTION PLAN

### Phase 1: Create Directory Structure

```bash
mkdir -p ~/.claude/{agents,settings,skills/{optimize,context,cache-inspector,update-docs,init-project},system-prompts}
```

### Phase 2: Create PM Orchestrator

Write `~/.claude/agents/pm-orchestrator.md` with complete agent definition including:
- Adaptive planning strategies (Unified, Intent-Planning, Planning-Only)
- Context preparation (load memories, symbolic discovery, constitution check)
- Agent selection with model strategy
- Continuous learning system
- Session summary template

*[Copy complete content from your existing ~/.claude/agents/pm-orchestrator.md or reference the plan file]*

### Phase 3: Create Global Settings (4 JSON files)

#### File 1: prompt-caching.json
90% cost savings on cached content reads

*[Copy ~/.claude/settings/prompt-caching.json]*

#### File 2: beta-features.json
14-70% savings with token-efficient tools

*[Copy ~/.claude/settings/beta-features.json]*

#### File 3: model-strategy.json
60% cost savings via Haiku/Sonnet/Opus selection

*[Copy ~/.claude/settings/model-strategy.json]*

#### File 4: token-optimization.json
Orchestrates all optimization strategies

*[Copy ~/.claude/settings/token-optimization.json]*

### Phase 4: Create Global Skills (5 SKILL.md files)

#### Skill 1: /optimize
Maximum token efficiency mode

*[Copy ~/.claude/skills/optimize/SKILL.md]*

#### Skill 2: /context
Memory management (load, save, list, refresh, inspect, clear)

*[Copy ~/.claude/skills/context/SKILL.md]*

#### Skill 3: /cache-inspector
Cache performance monitoring and optimization

*[Copy ~/.claude/skills/cache-inspector/SKILL.md]*

#### Skill 4: /update-docs
Update documentation from web research

*[Copy ~/.claude/skills/update-docs/SKILL.md]*

#### Skill 5: /init-project
Initialize best practices for current directory

*[Copy ~/.claude/skills/init-project/SKILL.md]*

### Phase 5: Create System Prompts (2 files)

#### Prompt 1: global-optimization.md
Core optimization principles applied to all projects/agents

*[Copy ~/.claude/system-prompts/global-optimization.md]*

#### Prompt 2: symbol-first-protocol.md
65-75% savings via Serena symbolic tools

*[Copy ~/.claude/system-prompts/symbol-first-protocol.md]*

### Phase 6: Create Documentation (3 files)

#### Doc 1: README.md
Complete guide to global optimization system

*[Copy ~/.claude/README.md]*

#### Doc 2: INSTALLATION-COMPLETE.md
Installation summary and next steps

*[Copy ~/.claude/INSTALLATION-COMPLETE.md]*

#### Doc 3: QUICK-REFERENCE.md
Quick reference card for commands and workflows

*[Create as specified in guide.md]*

---

## VERIFICATION

After creating all files, run verification:

### Check File Count
```bash
find ~/.claude -type f | wc -l
# Should be 15+
```

### Test Commands
In Claude Code conversation:
```
/optimize "test"
/context list
/cache-inspector status
/update-docs validate
/init-project detect
```

All commands should be recognized.

### Validation Checklist

- [ ] Directory structure complete
- [ ] PM Orchestrator file created and valid YAML
- [ ] All 4 JSON settings files created and valid JSON
- [ ] All 5 skills created in subdirectories
- [ ] Both system prompts created
- [ ] All 3 documentation files created
- [ ] Total file count ≥ 15
- [ ] All slash commands recognized
- [ ] No JSON syntax errors

---

## OUTPUT FORMAT

Provide a completion report:

```markdown
## Global Optimization Setup Complete ✅

### Files Created: [X]/15

**Agents** (1):
- ✅ pm-orchestrator.md

**Settings** (4):
- ✅ prompt-caching.json
- ✅ beta-features.json
- ✅ model-strategy.json
- ✅ token-optimization.json

**Skills** (5):
- ✅ optimize/SKILL.md
- ✅ context/SKILL.md
- ✅ cache-inspector/SKILL.md
- ✅ update-docs/SKILL.md
- ✅ init-project/SKILL.md

**System Prompts** (2):
- ✅ global-optimization.md
- ✅ symbol-first-protocol.md

**Documentation** (3):
- ✅ README.md
- ✅ INSTALLATION-COMPLETE.md
- ✅ QUICK-REFERENCE.md

### Verification Results:

File count: [X] files ✅
JSON validation: All valid ✅
YAML validation: All valid ✅
Commands available: All 5 skills recognized ✅

### Expected Outcomes:

**Token Reduction Targets**:
- Conservative: 30-50%
- Aggressive: 50-70%
- Maximum (with caching): 70-90%

**Cost Savings** (per session avg):
- Baseline: $2.55 (85K tokens)
- Optimized: $0.54 (18K tokens)
- Savings: $2.01 (79%)

**Annual Savings** (360 sessions):
- $723.60 for single project
- $2,170.80 for 3 projects

### Next Steps:

1. **Activate for current project** (10-15 min):
   ```
   cd ~/projects/your-project
   /init-project --full
   ```
   Or follow: ~/ai-prompts/02-project-activation/guide.md

2. **Start optimized work**:
   ```
   /optimize "Your first task"
   ```

3. **Monitor performance**:
   ```
   /cache-inspector status
   ```

### Success Criteria:

- ✅ All files created
- ✅ All commands working
- ✅ Ready for project activation
- ✅ Expected 70-90% token reduction on future projects

**Installation Date**: [YYYY-MM-DD]
**Installation Time**: [X] minutes
**Status**: ✅ Complete and Ready

---

**Congratulations!** Global optimization setup is complete.

This is a ONE-TIME setup. All future projects benefit automatically with just 10-15 minutes of activation.

**ROI**: Setup pays for itself in 2-3 sessions.
```

---

## ERROR HANDLING

If errors occur during setup:

### JSON Syntax Errors

**Symptom**: Invalid JSON in settings files

**Fix**:
```bash
# Validate JSON
python -m json.tool ~/.claude/settings/[file].json

# Fix syntax errors
# Common issues: trailing commas, unquoted strings, missing brackets
```

### YAML Syntax Errors

**Symptom**: PM Orchestrator YAML frontmatter invalid

**Fix**:
- Check `---` delimiters (exactly 3 dashes)
- Verify key: value format
- No tabs (use spaces)
- Quote strings with special characters

### File Permissions

**Symptom**: Cannot write to ~/.claude/

**Fix**:
```bash
# Check permissions
ls -la ~/.claude

# Fix if needed
chmod 755 ~/.claude
```

### Directory Already Exists

**Symptom**: ~/.claude/ already exists

**Options**:
1. **Backup and recreate**:
   ```bash
   mv ~/.claude ~/.claude.backup.$(date +%Y%m%d)
   # Then run setup again
   ```

2. **Merge with existing**:
   - Review existing files
   - Add missing files only
   - Update existing files carefully

---

## POST-SETUP RECOMMENDATIONS

After successful setup:

### 1. Read Documentation
- `~/.claude/README.md` - Full guide
- `~/.claude/QUICK-REFERENCE.md` - Command reference

### 2. Activate First Project
- Navigate to project directory
- Run `/init-project --full`
- Or follow `~/ai-prompts/02-project-activation/guide.md`

### 3. Monitor Performance
- Check cache hit rate: `/cache-inspector status`
- Review token usage: Check session summaries
- Validate savings: Compare to baseline

### 4. Share with Team
- Zip `~/ai-prompts/` directory
- Share setup guide
- Help teammates set up their own global config

---

## MAINTENANCE

Weekly:
- Review optimization log: `~/.claude/learnings/optimization-log.md`
- Check cache performance: `/cache-inspector analyze`

Monthly:
- Update documentation: `/update-docs research all`
- Review model usage: Check if 40% Haiku, 55% Sonnet, 5% Opus
- Update constitution if needed

Quarterly:
- Full documentation refresh
- Analyze cumulative ROI
- Share learnings with team

---

**This agent automates 2-3 hours of manual setup into 15-30 minutes of guided execution.**

**After completion**: All global optimizations ready. Just activate per project (10-15 min each) and enjoy 70-90% token savings!
