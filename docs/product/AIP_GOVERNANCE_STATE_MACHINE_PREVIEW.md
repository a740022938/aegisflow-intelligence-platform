# Governance State Machine Preview

**Status:** v7.28.0-P1 Implemented
**Stage C:** Disabled
**Route:** `/governance-state-machine-preview` (hidden direct, not in sidebar)
**Source:** `apps/web-ui/src/pages/GovernanceStateMachinePreview.tsx`

## Overview

The Governance State Machine Preview is a readonly frontend page that visualizes the runtime governance state machine model. It displays 7 states and 18 transitions with gates, risk levels, blocking conditions, and validator summary — all without executing any state transition or persisting any data.

## What It Shows

| Section | Content |
|---------|---------|
| Overview Dashboard | Total states (7), total transitions (18), allowed/blocked counts, critical count, validator pass/fail |
| State Board | Each state with description, allowedNow, allowed actions, blocked actions, gates, risk, owner |
| Transition Matrix | Full from/to transition table with validation requirements |
| Target Board | Frozen snapshot of all registry targets with state and allowedNow |
| Risk Board | Risk distribution summary (low/medium/high/critical) |
| Blocked Transition Board | All blocked transitions with blocking conditions and required evidence |
| Evidence & Rollback Board | Evidence types and rollback states from go`vernance-registry |
| Validator Summary | 11 validator checks, blocking/warning/info/pass |
| Forbidden Governance Notice | Readonly boundary notice |

## Registry & Validator

- `apps/web-ui/src/registry/governance-state-registry.ts` — 7 states, 18 transitions, summary/query functions
- `apps/web-ui/src/registry/governance-state-validator.ts` — 11 blocking checks
- All data is static readonly model — no API calls, no database access, no runtime state

## Constraints

- **No state transitions** — All transitions are display-only. No real state mutation.
- **No approval processing** — Human approval workflow is not implemented.
- **No DB write** — All data is static registry data.
- **No external control** — No tool control, no API calls.
- **No Stage C** — `future_stage_c` state is permanently `allowedNow=false`.
- **Hidden direct route** — Not in sidebar. URL-accessible only (`/governance-state-machine-preview`).

## Related Pages

- Runtime Registry Preview (`/runtime-registry-preview`) — Shows runtime targets referenced by governance state
- Dry-run Plan Preview (`/dry-run-plan-preview`) — Shows plans used in transition decisions
- Audit Log Preview (`/audit-log-preview`) — Shows audit events attached to state transitions
- Permission Evaluator Preview (`/permission-evaluator-preview`) — Shows permission rules governing transitions
- Advanced Mode Preview (`/advanced-mode-readonly`) — Gateway hub with governance state machine link

## File Changes (v7.28.0-P1)

### New files:
- `apps/web-ui/src/registry/governance-state-registry.ts`
- `apps/web-ui/src/registry/governance-state-validator.ts`
- `apps/web-ui/src/pages/GovernanceStateMachinePreview.tsx`
- `docs/product/AIP_GOVERNANCE_STATE_MACHINE_PREVIEW.md`

### Modified files:
- `apps/web-ui/src/App.tsx` — Added lazy route for `/governance-state-machine-preview`
- `apps/web-ui/src/pages/AdvancedModeReadonly.tsx` — Added governance state machine summary/link card
- `apps/web-ui/src/pages/RuntimeRegistryPreview.tsx` — Added governance state machine snapshot card
- `apps/web-ui/src/pages/DryRunPlanPreview.tsx` — Added governance gate snapshot card
- `apps/web-ui/src/pages/AuditLogPreview.tsx` — Added governance state machine link
- `apps/web-ui/src/pages/PermissionEvaluatorPreview.tsx` — Added governance target reference
- `apps/web-ui/src/pages/ConnectorCenterReadonly.tsx` — Added governance gate summary card
- `apps/web-ui/src/registry/permission-evaluator-registry.ts` — Added PE governance state preview rules
- `apps/web-ui/src/registry/navigation-exposure-registry.ts` — Added governance exposure entry
- `apps/web-ui/src/registry/center-access-registry.ts` — Added governance center access entry

## Commit

`feat(governance): add readonly governance state machine preview`

## v7.28.0-P3 Evidence Schema Preview

**P3 Evidence Schema Preview** is now established at `/evidence-schema-preview` (hidden direct, readonly). It shows evidence types and schema draft as a static model — **no evidence writer, no evidence store, no secret capture, no DB write, no external control, and Stage C disabled**. This P3 preview follows the same hidden-direct-readonly pattern as the P1 governance state machine preview.

## v7.28.0-P4 Rollback Preview

**P4 Rollback Preview** is now established at /rollback-preview (hidden direct, readonly). It provides a static display of rollback states and idempotency keys as a readonly model — **no rollback executor, no file restore, no git mutation, no DB write, no external control, and Stage C disabled**. This P4 preview follows the same hidden-direct-readonly pattern as the P1 governance state machine and P3 evidence schema previews.
