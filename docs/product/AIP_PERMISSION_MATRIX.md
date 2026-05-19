# AIP Permission Matrix

## Permission Decisions

| Decision | Meaning | Example Targets |
|----------|---------|----------------|
| `allow_primary_nav` | Visible in left sidebar, accessible to all authenticated users | Advanced Mode, Connector Center, Cost Routing, Assistant Center |
| `allow_sidebar_visible` | Visible in sidebar but within a section group | Memory Hub, OpenAxiom |
| `allow_hidden_direct` | URL-accessible only, not in any menu | Lab Center, Navigation Preview, Permission Evaluator Preview |
| `allow_advanced_hub` | Visible only in Advanced Hub (future) | (reserved) |
| `allow_launchpad_card` | Visible as a card in Center Launchpad (future) | (reserved) |
| `hold_review` | Currently blocked pending review | Governance Center, Inference, Scheduler, Deploy v2 |
| `deny` | Permanently denied in current stage | Stage C, DB Write, External Tool Control, Candidate Processing |

## Allow Primary Nav / Sidebar Visible (6 targets)

| Target | Decision | Risk | Severity | Stage | Allowed Now |
|--------|----------|------|----------|-------|-------------|
| Advanced Mode Preview | allow_primary_nav | low | info | preview_only | Yes |
| Connector Center | allow_primary_nav | low | info | preview_only | Yes |
| Cost Routing | allow_primary_nav | low | info | preview_only | Yes |
| Assistant Center | allow_primary_nav | low | info | preview_only | Yes |
| Memory Hub Readonly | allow_sidebar_visible | low | info | preview_only | Yes |
| OpenAxiom Readonly | allow_sidebar_visible | low | info | preview_only | Yes |

## Hidden Direct / Internal Preview (3 targets)

| Target | Decision | Risk | Severity | Stage | Allowed Now |
|--------|----------|------|----------|-------|-------------|
| Lab Center | allow_hidden_direct | medium | notice | preview_only | No |
| Navigation Preview | allow_hidden_direct | low | info | preview_only | No |
| Permission Evaluator Preview | allow_hidden_direct | low | info | preview_only | No |

## Hold Review (3 targets)

| Target | Decision | Risk | Severity | Stage | Blocking Conditions |
|--------|----------|------|----------|-------|---------------------|
| Governance Center | hold_review | medium | warning | manual_review | governance_center_enabled not cleared, Stage C deferred |
| Inference Execution | hold_review | high | blocking | blocked | Stage C not enabled, No runtime evaluator |
| Scheduler Execution | hold_review | high | blocking | blocked | Stage C not enabled, No runtime evaluator |
| Deploy v2 Execution | hold_review | high | blocking | blocked | Stage C not enabled, Deployment Gate design-only |

## Denied (5 targets)

| Target | Decision | Risk | Severity | Stage | Blocking Conditions |
|--------|----------|------|----------|-------|---------------------|
| Stage C Enablement | deny | high | blocking | blocked | Stage C permanently disabled by policy |
| Memory Hub Candidate Processing | deny | high | blocking | blocked | Requires DB write, Stage C not enabled |
| External Tool Control | deny | high | blocking | blocked | Requires Stage C, No runtime authorization |
| Database Write | deny | high | blocking | blocked | Requires Stage C, No DB write authorization |

## Enforcement Stages

| Stage | Meaning | Targets |
|-------|---------|---------|
| `preview_only` | Readonly preview, safe to expose with bounds | 8 targets |
| `manual_review` | Needs human review before exposure change | Governance Center |
| `blocked` | Permanently blocked in v7.x | 6 targets |
| `future` | Reserved for future enablement | 0 targets |

## Severity Classification

| Severity | Meaning | Count |
|----------|---------|-------|
| `info` | No action needed, passive monitoring | 10 |
| `notice` | Awareness recommended | 1 |
| `warning` | Review recommended before changes | 1 |
| `blocking` | Must not be allowed | 6 |

## Key Rules

1. **Stage C is permanently disabled.** No activation package exists. All v7.24.0+ work is planning/design-only.
2. **High risk allowedNow must be 0.** Currently 0 high-risk targets are allowed.
3. **Lab/Governance/Navigation Preview must not be primary_nav.** They are hidden direct routes only.
4. **Permission Evaluator is hidden direct only.** Not in sidebar, not primary_nav.
5. **All denied and hold_review rules have documented blocking conditions.**
6. **All rules have a reason and nextAction.**
