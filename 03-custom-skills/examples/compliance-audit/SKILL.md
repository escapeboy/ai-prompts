---
name: compliance-audit
description: "This skill should be used when performing legal and regulatory compliance audits on software projects. It covers GDPR, CCPA/CPRA, ePrivacy Directive, HIPAA, PCI DSS, SOC 2, and WCAG 2.2 accessibility. The skill generates a full compliance package: audit report with severity ratings, automatic code fixes, legal document templates (Privacy Policy, Cookie Policy, DPA, DPIA), and data flow diagrams. This skill should be triggered when the user asks to check compliance, audit privacy, generate legal documents, review data handling, or ensure regulatory readiness for any project type (web, mobile, API, desktop)."
---

# Compliance Audit Skill

> **Note on `references/`, `scripts/`, `assets/`**: this skill demonstrates the progressive-disclosure layout from [guide.md](../../guide.md) — the SKILL.md holds the workflow, while per-regulation checklists, the scan script, and legal templates live in companion files you author for your own jurisdiction set. The workflow below is complete without them; the companion files add depth.

## Purpose

Perform comprehensive legal and regulatory compliance audits on software projects.
Generate actionable reports, apply automatic code fixes, and produce required legal documentation.

## When to Use (and When NOT to)

| Use this skill for | Use a simpler approach for |
|---|---|
| A full audit across GDPR/CCPA/ePrivacy/HIPAA/PCI DSS/SOC 2/WCAG with report + fixes + legal docs | A single regulation's checklist — read `references/<regulation>.md` directly |
| Before launching a product/feature that handles personal data | A one-off question about a specific requirement — just answer it |
| Generating Privacy Policy / Cookie Policy / DPA / DPIA from scratch | Updating one existing legal document — edit it directly |
| Verifying data-handling practices in code before a compliance certification | Spot-checking one file/endpoint — read the code and answer, no full report needed |
| Adding consent management, cookie banners, or data deletion features | A single already-decided compliance fix — make the change directly |

## Supported Regulations

| Regulation | Scope | Reference File |
|-----------|-------|---------------|
| GDPR | EU personal data protection | `references/gdpr.md` |
| CCPA/CPRA | California consumer privacy | `references/ccpa.md` |
| ePrivacy | EU cookies, tracking, electronic communications | `references/eprivacy.md` |
| HIPAA | US health information protection | `references/hipaa.md` |
| PCI DSS | Payment card data security | `references/pci-dss.md` |
| SOC 2 | Service organization controls | `references/soc2.md` |
| WCAG 2.2 | Web accessibility | `references/wcag.md` |

## Audit Workflow

### Phase 1: Project Discovery

1. Identify project type (web, mobile, API, desktop) and tech stack
2. Scan directory structure for relevant files:
   - Configuration files (`.env`, `config/`, `settings/`)
   - Database schemas/migrations
   - Authentication and user management code
   - Forms and data collection points
   - Third-party integrations and SDKs
   - Cookie/tracking implementations
   - Logging and monitoring setup
   - API endpoints handling personal data
3. Determine applicable regulations based on:
   - Geographic scope (EU users → GDPR, California → CCPA)
   - Data types (health data → HIPAA, payment → PCI DSS)
   - Service type (B2B SaaS → SOC 2)
   - Web presence (any web UI → WCAG)

### Phase 2: Code Analysis

Perform automated detection of:
- Hardcoded secrets and credentials
- Unencrypted personal data storage
- Missing input validation/sanitization
- Logging of sensitive data (passwords, tokens, PII)
- Missing HTTPS enforcement
- Cookie usage without consent
- Third-party tracking scripts
- Data retention without expiry
- Missing access controls on personal data endpoints

Then perform manual analysis using the regulation-specific checklists from `references/`.

### Phase 3: Severity Classification

Classify each finding using this scale:

| Severity | Description | Action Required |
|----------|-------------|-----------------|
| **CRITICAL** | Active data breach risk, legal violation | Immediate fix required |
| **HIGH** | Missing required compliance mechanism | Fix before launch/next release |
| **MEDIUM** | Incomplete implementation, partial compliance | Fix within 30 days |
| **LOW** | Best practice recommendation, improvement opportunity | Plan for future sprint |
| **INFO** | Informational, documentation suggestion | Optional |

### Phase 4: Report Generation

Generate a compliance audit report in markdown format at `compliance-report.md` in the project root. The report structure:

```markdown
# Compliance Audit Report
**Project:** [name]
**Date:** [date]
**Auditor:** Claude Code Compliance Audit
**Applicable Regulations:** [list]

## Executive Summary
[2-3 paragraph overview with overall compliance score]

## Findings by Regulation

### [Regulation Name]
#### [Finding Title] — [SEVERITY]
- **Location:** `file:line`
- **Issue:** [description]
- **Requirement:** [specific article/section]
- **Recommendation:** [fix description]
- **Auto-fix available:** Yes/No

## Data Flow Diagram
[Mermaid diagram showing personal data flows]

## Compliance Score
| Regulation | Score | Status |
|-----------|-------|--------|
| GDPR | X/100 | Pass/Partial/Fail |

## Required Legal Documents
[List of documents that need to be generated]

## Action Plan
[Prioritized list of fixes with effort estimates]
```

### Phase 5: Automatic Code Fixes

For findings marked as auto-fixable, apply fixes directly:
- Add CSRF protection middleware
- Add encryption to sensitive database columns
- Remove PII from log statements
- Add HTTPS redirect middleware
- Add secure cookie flags (HttpOnly, Secure, SameSite)
- Add Content-Security-Policy headers
- Add data retention/purge mechanisms
- Add consent checks before tracking

Always create a backup or work on a branch. Present each fix for user approval before applying.

### Phase 6: Legal Document Generation

Based on findings, generate required documents from templates in `assets/`:

| Template | When to Generate |
|----------|-----------------|
| `assets/privacy-policy-template.md` | Always (any personal data handling) |
| `assets/cookie-policy-template.md` | When cookies or tracking detected |
| `assets/dpa-template.md` | When processing data for third parties |
| `assets/dpia-template.md` | When high-risk processing identified |

Customize templates with project-specific:
- Company/organization name
- Types of data collected
- Processing purposes
- Third-party processors
- Data retention periods
- Contact information (request from user)

### Phase 7: Data Flow Diagram

Generate a Mermaid data flow diagram showing:
- Data collection points (forms, APIs, SDKs)
- Storage locations (databases, caches, files, third parties)
- Processing activities (analytics, ML, notifications)
- Data transfers (cross-border, third-party)
- Deletion/retention paths

## Code Pattern Detection

To identify compliance issues, search for these patterns:

### Universal Patterns (any language)
- `grep -ri "password\|secret\|api.key\|token" --include="*.log"` — secrets in logs
- `grep -ri "console\.log\|print\|logger" | grep -i "email\|phone\|ssn\|password"` — PII logging
- `grep -ri "http://" --include="*.{js,ts,py,rb,php}"` — insecure HTTP
- `grep -ri "eval\|exec\|system\|passthru"` — injection risks

### Framework-Specific
Maintain detection patterns per stack in `references/code-patterns.md`:
- Laravel/PHP
- React/Next.js
- Python/Django/Flask
- Ruby on Rails
- Node.js/Express
- iOS/Swift
- Android/Kotlin

## Output Files

After a full audit, the following files should be generated in the project:

```
compliance-report.md          — Full audit report with findings
docs/legal/privacy-policy.md  — Customized Privacy Policy
docs/legal/cookie-policy.md   — Customized Cookie Policy (if applicable)
docs/legal/dpa.md             — Data Processing Agreement (if applicable)
docs/legal/dpia.md            — Data Protection Impact Assessment (if high-risk)
```

## Important Notes

- This skill provides technical compliance analysis, not legal advice
- Always recommend the user consult with a qualified legal professional
- Legal document templates are starting points that require legal review
- Compliance is ongoing — recommend periodic re-audits
- Different jurisdictions may have additional requirements
- When unsure about applicability, flag it and ask the user

## Boundaries

**Always**
- Apply auto-fixes and generate legal document templates as part of the requested audit —
  that's what this skill is for. List every applied fix in the report.
- Recommend qualified legal review for generated documents.

**Ask first**
- Each auto-fix before it is applied (Phase 5) — fixes touch data handling and user-facing legal behaviour; report generation and legal-doc drafting need no extra confirmation.

**Never**
- Present generated legal text (Privacy Policy, DPA, etc.) as legal advice.
- Skip listing an applied fix in the report.
