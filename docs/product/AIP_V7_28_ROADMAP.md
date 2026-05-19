# v7.28 Roadmap — Runtime Governance Blueprint

**Status:** P1-P2-P3-P4 Completed (Final pending)

## Overview

| Phase | Title | Description | Source Code | DB Write | External Control | Stage C | Human Approval | Risk |
|-------|-------|-------------|-------------|----------|-----------------|---------|----------------|------|
| D1 | Runtime Governance Blueprint | 7 design docs for governance state machine, API contract, approval workflow, evidence schema, rollback spec, Stage C checklist | No | No | No | No | No | Low |
| D2 | Runtime API Contract Polish | Refine API contracts based on blueprint feedback | No | No | No | No | No | Low |
| P1 | Governance State Machine Preview | Frontend preview page for state machine visualization | Yes (new page) | No | No | No | No | Low |
| P2 | Approval Workflow Preview | Frontend preview page for approval workflow | Yes (new page) | No | No | No | No | Low |
| P3 | Evidence Schema Preview | Frontend preview page for evidence schema | Yes (new page) | No | No | No | No | Low |
| P4 | Rollback Preview | Frontend preview page for rollback states and idempotency keys | Yes (new page) | No | No | No | No | Low |
| Final | v7.28 Final Seal Recheck | Audit all v7.28 phases, verify gates, seal | No | No | No | No | No | Low |

## Phase Details

### D1: Runtime Governance Blueprint (Completed)

- 7 design docs created for governance state machine, API contract, approval workflow, evidence schema, rollback spec, Stage C checklist
- No source code changes
- Committed in `e61fd98`

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

### P1: Governance State Machine Preview (Completed)

- New hidden route `/governance-state-machine-preview` in `App.tsx`
- New registry: `governance-state-registry.ts` (7 states, 18 transitions)
- New validator: `governance-state-validator.ts` (11 blocking checks)
- New page: `GovernanceStateMachinePreview.tsx` (9 sections)
- Synced to 6 existing pages (AdvancedMode, Runtime, Dry-run, Audit, Permission Evaluator, Connector Center)
- Synced to 3 registries (permission-evaluator, navigation-exposure, center-access)
- New doc: `AIP_GOVERNANCE_STATE_MACHINE_PREVIEW.md`
- Updated 10 existing docs with P1 status
- Readonly display of state machine design
- No state persistence
- No real transitions
- No sidebar changes

### P2: Approval Workflow Preview (Completed)

- New hidden route `/approval-workflow-preview`
- Readonly display of approval states
- No candidate processing
- No evidence writer, no evidence store, no secret capture, no DB write, no external control, Stage C disabled

**Commit policy:** `feat(runtime): add approval workflow preview`

### P3: Evidence Schema Preview (Completed)

- New hidden route `/evidence-schema-preview`
- Readonly display of evidence types and schema
- No evidence collection
- No evidence writer, no evidence store, no secret capture, no DB write, no external control, Stage C disabled
- Evidence schema is a static readonly model — no persistent storage, no retrieval API

**Commit policy:** `feat(runtime): add evidence schema preview`

### P4: Rollback Preview (Completed)

- New hidden route `/rollback-preview`
- Readonly display of rollback states and idempotency keys
- No rollback executor
- No file restore
- No git mutation
- No evidence writer, no evidence store, no secret capture, no DB write, no external control, Stage C disabled

**Commit policy:** `feat(runtime): add rollback preview`

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
- v7.28.0-P1: commit (pending)
- Registry: `runtime-registry.ts`, `dry-run-plan-registry.ts`, `audit-log-registry.ts`, `governance-state-registry.ts`
- Validators: `runtime-registry-validator.ts`, `dry-run-plan-validator.ts`, `audit-log-validator.ts`, `governance-state-validator.ts`
- Navigation: `navigation-exposure-registry.ts`
- Permissions: `permission-evaluator-registry.ts`

---

## v7.28+ Status

- **v7.28.0 SEAL:** PASS (V7_28_FINAL_SEAL_READY) — Commit `349b20a`, 2026-05-19
- **v7.29.0-D1 Governance Console:** See `AIP_GOVERNANCE_CONSOLE_MASTER_BLUEPRINT.md` — design-only, not implemented
- **Stage C:** Remains disabled. No DB write. No external control. No executor implementation.
- **Sidebar:** Governance Console will not enter sidebar until human decision after v7.29 Final Seal.
