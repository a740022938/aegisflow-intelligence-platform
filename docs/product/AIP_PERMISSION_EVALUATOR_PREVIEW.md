# AIP Permission Evaluator Preview

## Purpose

The Permission Evaluator Preview provides a read-only assessment of all permission evaluation rules. It does not execute permissions, modify menus, write to databases, or control external tools.

## Location

- **UI:** Advanced Mode Readonly > Permission Evaluator Preview (inline section)
- **Registry:** `apps/web-ui/src/registry/permission-evaluator-registry.ts`
- **Not in sidebar:** Permission Evaluator is an inline section, not a separate page or center.

## Rule Structure

Each rule contains:

| Field | Description |
|-------|-------------|
| `id` | Unique rule identifier |
| `targetKind` | `page` \| `center` \| `connector` \| `lab` \| `governance` \| `action` \| `route` |
| `targetId` | The target this rule applies to |
| `label` | Human-readable label |
| `currentExposure` | Current exposure level |
| `recommendedDecision` | `allow_primary_nav` \| `allow_sidebar_visible` \| `allow_hidden_direct` \| `allow_advanced_hub` \| `allow_launchpad_card` \| `hold_review` \| `deny` |
| `risk` | `low` \| `medium` \| `high` |
| `allowedNow` | Whether this rule is currently active |
| `gates` | Gates that must pass |
| `blockingConditions` | Current blockers |
| `requiredEvidence` | Evidence required for approval |
| `reason` | Rationale for the decision |
| `nextAction` | Recommended next step |

## Current Summary (v7.25.2)

| Metric | Count |
|--------|-------|
| Total rules | 17 |
| Allowed (menu visible) | 6 |
| Hidden direct | 3 |
| Hold review | 3 |
| Denied | 5 |
| High risk | 5 |

## Groups

### Allow Primary Nav / Sidebar Visible (6 rules)
- Advanced Mode Preview, Connector Center, Cost Routing, Assistant Center, Memory Hub Readonly, OpenAxiom Readonly

### Hidden Direct (3 rules)
- Lab Center, Navigation Preview, (placeholder)

### Hold Review (3 rules)
- Governance Center, Inference Execution, Scheduler Execution

### Denied (5 rules)
- Stage C Enablement, Deploy v2 Execution, Candidate Processing, External Tool Control, Database Write

## Important Notes

- **Stage C is permanently disabled.** No activation package has been created. All v7.24.0+ work is planning/design-only.
- **High-risk actions are blocked.** Inference, scheduler, deploy, candidate processing, external tool control, and DB write are all denied.
- **UI is preview only.** The Permission Evaluator Preview section reads from the static registry and does not execute any real permissions.
