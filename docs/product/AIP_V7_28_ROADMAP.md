# v7.28 Roadmap — Runtime Governance Blueprint

**Status:** Planned (not started)

## Overview

| Phase | Title | Description | Source Code | DB Write | External Control | Stage C | Human Approval | Risk |
|-------|-------|-------------|-------------|----------|-----------------|---------|----------------|------|
| D1 | Runtime Governance Blueprint | 7 design docs for governance state machine, API contract, approval workflow, evidence schema, rollback spec, Stage C checklist | No | No | No | No | No | Low |
| D2 | Runtime API Contract Polish | Refine API contracts based on blueprint feedback | No | No | No | No | No | Low |
| P1 | Governance State Machine Preview | Frontend preview page for state machine visualization | Yes (new page) | No | No | No | No | Low |
| P2 | Approval Workflow Preview | Frontend preview page for approval workflow | Yes (new page) | No | No | No | No | Low |
| P3 | Evidence Schema Preview | Frontend preview page for evidence schema | Yes (new page) | No | No | No | No | Low |
| Final | v7.28 Final Seal Recheck | Audit all v7.28 phases, verify gates, seal | No | No | No | No | No | Low |

## Phase Details

### D1: Runtime Governance Blueprint (Current)

Files:
- `docs/product/AIP_RUNTIME_GOVERNANCE_STATE_MACHINE.md`
- `docs/product/AIP_RUNTIME_API_CONTRACT_SPEC.md`
- `docs/product/AIP_HUMAN_APPROVAL_WORKFLOW_SPEC.md`
- `docs/product/AIP_RUNTIME_EVIDENCE_SCHEMA_SPEC.md`
- `docs/product/AIP_RUNTIME_ROLLBACK_IDEMPOTENCY_SPEC.md`
- `docs/product/AIP_STAGE_C_READINESS_CHECKLIST.md`
- `docs/product/AIP_V7_28_ROADMAP.md`

**Commit policy:** `docs(product): add runtime governance blueprint`
**Tag policy:** No tag
**Source changes:** None

### D2: Runtime API Contract Polish

- Refine contract endpoints based on feedback
- Add error handling details
- Add security model refinements
- No implementation

**Commit policy:** `docs(product): refine runtime API contracts`

### P1: Governance State Machine Preview

- New hidden route `/governance-state-machine-preview`
- Readonly display of state machine design
- No state persistence
- No real transitions

**Commit policy:** `feat(runtime): add governance state machine preview`

### P2: Approval Workflow Preview

- New hidden route `/approval-workflow-preview`
- Readonly display of approval states
- No candidate processing

**Commit policy:** `feat(runtime): add approval workflow preview`

### P3: Evidence Schema Preview

- New hidden route `/evidence-schema-preview`
- Readonly display of evidence types and schema
- No evidence collection

**Commit policy:** `feat(runtime): add evidence schema preview`

## Constraints

- v7.28 does NOT implement real runtime execution
- v7.28 does NOT write to database
- v7.28 does NOT enable Stage C
- v7.28 does NOT control external tools
- v7.28 does NOT process approval candidates
- All new pages are hidden direct routes — NOT in sidebar
- All validators must return blocking=0

## References

- v7.27 baseline: commit `8f8242a`
- Registry: `runtime-registry.ts`, `dry-run-plan-registry.ts`, `audit-log-registry.ts`
- Validators: `runtime-registry-validator.ts`, `dry-run-plan-validator.ts`, `audit-log-validator.ts`
- Navigation: `navigation-exposure-registry.ts`
- Permissions: `permission-evaluator-registry.ts`
