# Runtime Governance State Machine

**Status:** v7.28.0-P1 Preview Implemented
**Stage C:** Disabled
**Current Phase:** Governance State Machine Preview (readonly display)
**Preview page:** `/governance-state-machine-preview` (hidden direct, not in sidebar)

## 1. Goals

- Define runtime governance states for connector action lifecycle
- Map state transitions and required gates
- Provide blueprint for future governance center integration
- Implement readonly preview page for state machine visualization

## 2. Non-Goals

- Implement state machine logic
- Persist state to database
- Control external tools
- Enable Stage C
- Execute any runtime action

## 3. State Definitions

| State | Description | Allowed Actions | Gate Required |
|-------|-------------|----------------|---------------|
| `readonly_preview` | Default state. All runtime items view-only. | View registry & validation | none |
| `static_plan` | A static plan has been generated but not reviewed. | View plan, request review | readonly_only |
| `synthetic_plan` | A synthetic plan exists with simulated steps. | View synthetic steps, request human review | readonly_only, no_external_control |
| `dry_run_design` | A dry-run plan has been designed but not executed. | View design, inspect gates | readonly_only, stage_c_disabled |
| `human_review_required` | Human review is needed before any action. | Display review UI, collect approval | human_approval_required, no_db_write |
| `blocked` | Action is blocked by gate or risk threshold. | Display blocked reason, view gates | stage_c_disabled, no_external_control |
| `future_stage_c` | State reserved for Stage C enabled operations. | Not accessible in current version | stage_c_disabled (permanently) |

## 4. State Transition Rules

| From | To | Trigger | Validation Required |
|------|----|---------|-------------------|
| readonly_preview | static_plan | User generates static plan | readonly_only |
| static_plan | synthetic_plan | User promotes to synthetic | no_external_control |
| static_plan | human_review_required | High-risk plan flagged | human_approval_required |
| synthetic_plan | dry_run_design | Plan moves to dry-run design | stage_c_disabled |
| dry_run_design | human_review_required | Execution requires approval | human_approval_required |
| any | blocked | Gate violation or risk threshold | N/A |
| blocked | readonly_preview | User resets to preview | readonly_only |

## 5. Forbidden Transitions

| Transition | Reason |
|------------|--------|
| preview → execute | No direct execution without governance |
| dry_run_plan → real dry_run | Dry-run is design-only in v7.28 |
| audit_preview → audit_write | Audit log writes deferred |
| hidden_direct → sidebar | Governance Center not ready for sidebar |
| stage_c_disabled → enabled | Stage C is permanently locked |

## 6. Gate Requirements Per State

Each state must satisfy the following from `permission-evaluator-registry`:

| State | Gates |
|-------|-------|
| readonly_preview | `none` |
| static_plan | `readonly_only` |
| synthetic_plan | `readonly_only`, `no_external_control` |
| dry_run_design | `readonly_only`, `stage_c_disabled` |
| human_review_required | `human_approval_required`, `readonly_only`, `no_db_write` |
| blocked | `stage_c_disabled`, `no_external_control` |
| future_stage_c | `stage_c_disabled` (locked) |

## 7. Relationship to Permission Evaluator

- `PE_RUNTIME_EVALUATE` rule from `permission-evaluator-registry.ts` governs state transitions
- Each state maps to a `permissionEvaluatorAction` that must pass before transition
- Blocked transitions return a `blockedActions` array from the registry
- In v7.28, all transitions are design-only — no real permission evaluation occurs

## 8. Relationship to Governance Center

- Governance Center (`/governance-center`) displays state summaries for all runtime items
- Each center module shows current state and available transitions
- Stage C gate indicator is displayed but permanently set to `deferred`
- In v7.28, Governance Center is readonly — no state mutation

## 9. Relationship to Stage C

- `future_stage_c` is the only state gated by Stage C
- Stage C is **disabled** in v7.27/v7.28
- No automatic or manual transition to `future_stage_c` is permitted
- `stage_c_disabled` gate is hardcoded on `future_stage_c` items

## 10. Current Version Constraints

- v7.28.0-P1: State machine is a readonly frontend preview
- No state persistence
- No state transition execution
- No real gate evaluation
- No Governance Center state mutation
- Stage C permanently disabled
- P1 preview page at `/governance-state-machine-preview` shows 7 states and 18 transitions as static model

## 11. v7.28.0-P3 Evidence Schema Preview

**P3 Evidence Schema Preview** is now available at `/evidence-schema-preview` (hidden direct, readonly). It displays evidence types and schema as a static model only — **no evidence writer, no evidence store, no secret capture, no DB write, no external control, and Stage C remains disabled**.

## 12. v7.28.0-P4 Rollback Preview

**P4 Rollback Preview** is now established at /rollback-preview (hidden direct, readonly). It provides a static display of rollback states and idempotency keys as a readonly model — **no rollback executor, no file restore, no git mutation, no DB write, no external control, and Stage C disabled**. This P4 preview does not change governance state machine behavior; all states and transitions remain static and display-only.
