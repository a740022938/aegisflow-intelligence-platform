# AIP Center Roadmap

## Current Centers

| Center | Exposure | Decision | Risk | Stage | Next Step |
|--------|----------|----------|------|-------|-----------|
| Advanced Mode Preview | Sidebar | allow_primary_nav | low | preview_only | Maintain current exposure |
| Connector Center | Sidebar | allow_primary_nav | low | preview_only | Maintain current exposure |
| Lab Center | Hidden direct | allow_hidden_direct | medium | preview_only | Evaluate launchpad_card readiness after UI polish |
| Governance Center | Hidden direct | hold_review | medium | manual_review | Re-evaluate when governance_center_enabled flag is active |
| Navigation Preview | Hidden direct | allow_hidden_direct | low | preview_only | Keep hidden direct, no sidebar exposure planned |
| Permission Evaluator Preview | Hidden direct | allow_hidden_direct | low | preview_only | Keep hidden direct, no sidebar exposure planned |

---

## Roadmap

### Current Phase (v7.26.0-M2)

**Goal:** Harden permission evaluator with standalone preview, validator, expanded docs, and decision console.

- [x] Permission evaluator registry hardened (severity, enforcementStage, targetCenter, evidenceSource, uiSurface)
- [x] Permission evaluator validator created (8+ validation rules)
- [x] Standalone `/permission-evaluator-preview` page (hidden direct route)
- [x] AdvancedModeReadonly linked to hidden route with validator summary
- [x] Navigation exposure registry updated for permission evaluator
- [x] Product documentation expanded (permission matrix, construction protocol, version seal handbook, center roadmap)

### v7.26.0 Final Seal Recheck (当前)

v7.26.0-M2 final seal recheck complete. Verdict: **FINAL_SEAL_RECHECK_READY** (blocking=0).

### v7.27.0-D1 Connector Runtime Design

**Goal:** Design connector runtime boundaries, action taxonomy, gate model, audit/rollback plan, and roadmap. No runtime implementation.

- [x] Runtime design spec (`AIP_CONNECTOR_RUNTIME_DESIGN_SPEC.md`)
- [x] Tool control boundary plan (`AIP_TOOL_CONTROL_BOUNDARY_PLAN.md`)
- [x] Action taxonomy (L0-L6) (`AIP_CONNECTOR_ACTION_TAXONOMY.md`)
- [x] Permission gate model (`AIP_CONNECTOR_PERMISSION_GATE_MODEL.md`)
- [x] Audit and rollback plan (`AIP_RUNTIME_AUDIT_AND_ROLLBACK_PLAN.md`)
- [x] v7.27 roadmap (`AIP_V7_27_ROADMAP.md`)

### Next Phase (v7.27.0-P1 Runtime Registry Preview)

**Candidate tasks (human decision required):**

- Runtime Registry frontend preview (readonly, no backend)
- Dry-run plan UI preview extension
- Audit log UI preview

### Deferred / Blocked

| Feature | Reason | Condition for Unblock |
|---------|--------|----------------------|
| Governance Center sidebar exposure | hold_review readiness | governance_center_enabled flag, human approval |
| Lab Center launchpad card | UI polish needed | UI polish verified |
| Stage C enablement | Permanently disabled | Project lead decision, runtime evaluator ready |
| Database write | Permanently denied | Stage C activated, DB write authorized |
| External tool control | Permanently denied | Stage C activated, runtime authorization |
| Inference execution | Stage C blocked | Stage C activated, runtime evaluator ready |
| Scheduler execution | Stage C blocked | Stage C activated, runtime evaluator ready |
| Deploy v2 execution | Stage C blocked | Stage C activated, deployment gate implemented |

---

## Forbidden Transitions

The following transitions are **permanently forbidden** in the current phase:

| From | To | Reason |
|------|----|--------|
| Hidden direct | Sidebar | Any center not already in sidebar must NOT be added |
| deny | allow_primary_nav | Denied actions must remain denied |
| hold_review | allow_primary_nav | Must go through manual review first |
| Stage C disabled | Stage C enabled | Permanently disabled |

---

## Decision Authority

| Decision | Required Authority |
|----------|-------------------|
| Add center to sidebar | Human (PL) |
| Change deny → hold_review | Human (PL) |
| Change hold_review → allow | Human (PL) |
| Stage C enablement | Human (PL) + Runtime evaluator ready |
| Create git tag | Human (explicit request) |
| Create GitHub Release | Human (explicit request) |
| Update registry with new rules | AI assistant (with validation) |
| Update docs | AI assistant |
| Non-sidebar hidden route | AI assistant (with validation) |
