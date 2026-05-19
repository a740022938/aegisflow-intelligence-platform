# AIP Product Overview

## Identity

- **Product Name:** AegisFlow (AIP)
- **Current Version:** v7.25.2
- **Build Date:** 2026.05.19
- **Seal Status:** Final Seal Candidate
- **Safety Mode:** Readonly-first
- **Stage C:** Disabled (permanently)

## Architecture

AIP is organized around centers, pages, and actions — all operating under readonly-first semantics:

| Layer | Description | Exposure |
|-------|-------------|----------|
| **Centers** | Capability domains (Advanced Mode, Connector, Lab, Governance, Navigation Preview) | Sidebar visible or hidden direct |
| **Pages** | Functional pages within centers | Primary nav or sidebar visible |
| **Actions** | Executable operations (inference, scheduler, deploy, etc.) | All blocked/denied in v7.x |

## Key Principles

1. **Readonly-first:** No real execution, DB write, external tool control, or Stage C operations in v7.x.
2. **Explicit gating:** Every exposure decision is recorded in registries with risk level and blocking conditions.
3. **No sidebar mutation:** Sidebar boundaries are invariant. Centers cannot add or remove themselves.
4. **No tag/release:** v7.x remains a preview seal candidate. No formal release tag is created.

## Registry Architecture

| Registry | Purpose |
|----------|---------|
| `navigation-exposure-registry.ts` | Exposure rules for all nav items |
| `center-access-registry.ts` | Center access definitions (5 centers, 2 visible, 3 hidden) |
| `permission-evaluator-registry.ts` | Static permission evaluation rules (18 rules, 7 decisions) |
| `permission-evaluator-validator.ts` | Pure validation functions (10 checks) |
| `product-metadata-registry.ts` | Unified product version metadata |

## Governance State Machine Preview (v7.28.0-P1)

v7.28.0-P1 adds a readonly Governance State Machine Preview with:

- **Governance State Registry** — 7 states, 18 transitions, pure utility functions
- **Governance State Validator** — 11 blocking checks
- **GovernanceStateMachinePreview page** — `/governance-state-machine-preview` (hidden direct)
- **6 page syncs** — Advanced Mode, Runtime, Dry-run, Audit, Permission Evaluator, Connector Center
- **3 registry syncs** — permission-evaluator-registry, navigation-exposure-registry, center-access-registry

All P1 work is **readonly preview**. No state transitions, no approval processing, no DB write, no external control, no Stage C.

## Connector Runtime Design (v7.27.0-D1)

v7.27 introduces connector runtime boundary design — runtime not implemented. See:

- `AIP_CONNECTOR_RUNTIME_DESIGN_SPEC.md` — Runtime architecture blueprint
- `AIP_TOOL_CONTROL_BOUNDARY_PLAN.md` — External tool control boundaries
- `AIP_CONNECTOR_ACTION_TAXONOMY.md` — Action level classification (L0-L6)
- `AIP_CONNECTOR_PERMISSION_GATE_MODEL.md` — Gate model for runtime
- `AIP_RUNTIME_AUDIT_AND_ROLLBACK_PLAN.md` — Audit log and rollback design
- `AIP_V7_27_ROADMAP.md` — Roadmap from design to implementation

All v7.27 work is **design-only**. No runtime implementation, no external tool control, no DB write, no Stage C.

## v7.27 Final Seal

v7.27.0 is sealed at commit `8f8242a` with Runtime Preview Trilogy complete:
- Runtime Registry Preview: 25 targets, hidden direct ✓
- Dry-run Plan Preview: 16 plans, hidden direct ✓
- Audit Log Preview: 18 events, hidden direct ✓
- All validators: blocking=0 ✓
- All routes: hidden direct, not in sidebar ✓

## v7.28 Runtime Governance Blueprint

v7.28.0-D1 adds 7 design-only governance docs:
- `AIP_RUNTIME_GOVERNANCE_STATE_MACHINE.md` — State machine design
- `AIP_RUNTIME_API_CONTRACT_SPEC.md` — API contract (no implementation)
- `AIP_HUMAN_APPROVAL_WORKFLOW_SPEC.md` — Approval workflow design
- `AIP_RUNTIME_EVIDENCE_SCHEMA_SPEC.md` — Evidence schema design
- `AIP_RUNTIME_ROLLBACK_IDEMPOTENCY_SPEC.md` — Rollback/idempotency design
- `AIP_STAGE_C_READINESS_CHECKLIST.md` — Stage C preconditions
- `AIP_V7_28_ROADMAP.md` — v7.28 roadmap

All v7.28 work remains **design-only**. No implementation, no external tool control, no DB write, no Stage C.

## Target Consumers

- Internal audits and seal reviews
- PL decision-making for exposure changes
- UI preview at Advanced Mode > Permission Evaluator Preview

---

## v7.28+ Status

- **v7.28.0 SEAL:** PASS (V7_28_FINAL_SEAL_READY) — Commit `349b20a`, 2026-05-19
- **v7.29.0-D1 Governance Console:** See `AIP_GOVERNANCE_CONSOLE_MASTER_BLUEPRINT.md` — design-only, not implemented
- **Stage C:** Remains disabled. No DB write. No external control. No executor implementation.
- **Sidebar:** Governance Console will not enter sidebar until human decision after v7.29 Final Seal.
- Connector runtime design review (v7.27)

---

## v7.29.0-P1 Governance Console Aggregator Preview

- **Status:** Established — v7.29.0-P1 complete, commit `pending`
- **Route:** `/governance-console-preview` (hidden direct, not in sidebar)
- **Registry:** `governance-console-registry.ts` — 18 items across 10 domains
- **Validator:** `governance-console-validator.ts` — blocking checks enforced
- **Console does not:** mutate registries, execute actions, write DB, control external tools, enable Stage C
- **Stage C:** Remains disabled
- **Sidebar:** Governance Console Preview not in sidebar

## v7.29.0 Governance Console

- **Status:** V7_29_FINAL_SEAL_READY (commit 600a029)
- P1 Aggregator Preview — `/governance-console-preview`
- P2 Risk Dashboard Preview — `/governance-console-risk-dashboard-preview`
- P3 Decision Panel Preview — `/governance-console-decision-panel-preview`
- P4 Report Pack Preview — `/governance-console-report-pack-preview`
- All 4: readonly, hidden direct, not in sidebar, validators pass (0 blocking)
- Stage C permanently disabled
