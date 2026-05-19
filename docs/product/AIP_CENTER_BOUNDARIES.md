# AIP Center Boundaries

## Sidebar-Invariant Rule

> **No center may add or remove itself from the sidebar.** Sidebar visibility is set at build time and must not change at runtime. This invariant is enforced by the `center-access-registry.ts` sidebarState field.

## Current Centers

| Center | Sidebar State | Decision | Risk | Allowed Now |
|--------|---------------|----------|------|-------------|
| Advanced Mode Preview | sidebar_visible | allow_primary_nav | low | Yes |
| Connector Center | sidebar_visible | allow_primary_nav | low | Yes |
| Lab Center | hidden_direct | allow_hidden_direct | medium | No |
| Governance Center | hidden_direct | hold_review | medium | No |
| Navigation Preview | hidden_direct | allow_hidden_direct | low | No |
| Governance State Machine Preview | hidden_direct | keep_direct_route | low | Yes |
| Runtime Readonly Status API Preview | hidden_direct | keep_hidden_direct | medium | Yes |
| Runtime Dry-run Contract Preview | hidden_direct | keep_hidden_direct | medium | Yes |
| Runtime Audit Store Contract Preview | hidden_direct | keep_hidden_direct | medium | Yes |
| Stage C Pre-Enable Human Review Pack | hidden_direct | keep_hidden_direct | medium | Yes |

## Boundary Rules

1. **Sidebar-visible centers** (Advanced Mode, Connector) must be readonly-only with no execution buttons.
2. **Hidden-direct centers** (Lab, Governance, Navigation Preview) must not be added to sidebar. URL-accessible only.
3. **Permission Evaluator** is an inline preview section within Advanced Mode Readonly, not a separate center/page. It does not appear in sidebar or routes.
4. **Stage C centers** (any center requiring Stage C enablement) are permanently disabled in v7.x.

## Center Capabilities

| Center | Modules | Gates | Stage C |
|--------|---------|-------|---------|
| Advanced Mode Preview | 13 modules | 12 quality gates | Deferred |
| Connector Center | Connector capability overview | No execution gates | Disabled |
| Lab Center | Lab experiment overview | No training/inference/label-save | Disabled |
| Governance Center | 13 governance modules | 12 gates | Deferred |
| Navigation Preview | Audit-only readout | No menu change | Disabled |
| Governance State Machine Preview | 7 states, 18 transitions | 11 validator checks | Disabled |
| Runtime Readonly Status API Preview | 12 endpoints, 9-section UI | 7 validator groups | Disabled |
| Runtime Dry-run Contract Preview | 18 items, 6 contract kinds | 7 validator checks | Disabled |
| Runtime Audit Store Contract Preview | 16 items, 7 contract kinds | 5 validator checks | Disabled |
| Stage C Pre-Enable Human Review Pack | 18 items, 11 review areas | 8 validator checks | Disabled |

## Connector Runtime Design Boundaries (v7.27.0-D1)

Connector runtime is in design-only phase. Current boundaries:

| Runtime Component | Current State | Future State | Stage C Needed |
|------------------|---------------|--------------|----------------|
| Connector runtime registry | Not implemented | Design spec complete | No |
| Dry-run executor | Not implemented | Design spec complete | No (preview) |
| Human approval queue | Not implemented | Design spec complete | No (preview) |
| Audit log | CostRouting mock only | Full audit framework | Yes |
| Rollback engine | Not implemented | Design spec complete | Yes |
| External tool control | Denied | Requires Stage C + runtime | Yes |

**Key rule:** Connector runtime design does not enable real execution, external tool control, or DB write in v7.27.

## v7.27 Final Seal Status

**v7.27.0 Final Seal: READY** (commit `8f8242a`)
- Runtime/Dry-run/Audit Preview all hidden direct ✓
- All preview routes confirmed not in sidebar ✓
- No new sidebar entries added ✓

## v7.28 Governance Preview — Center Boundary Impact

v7.28.0-P1 governance state machine preview adds one new center entry:
- Governance State Machine Preview: hidden direct, not in sidebar, allowed now
- No sidebar changes
- No existing center boundary modified
- No center exposure changes
- No Governance Center mutation

---

## v7.28+ Status

- **v7.28.0 SEAL:** PASS (V7_28_FINAL_SEAL_READY) — Commit `349b20a`, 2026-05-19
- **v7.29.0-D1 Governance Console:** See `AIP_GOVERNANCE_CONSOLE_MASTER_BLUEPRINT.md` — design-only, not implemented
- **Stage C:** Remains disabled. No DB write. No external control. No executor implementation.
- **Sidebar:** Governance Console will not enter sidebar until human decision after v7.29 Final Seal.

---

## v7.29.0-P1 Governance Console Aggregator Preview

- **Status:** Established — v7.29.0-P1 complete, commit `pending`
- **Route:** `/governance-console-preview` (hidden direct, not in sidebar)
- **Registry:** `governance-console-registry.ts` — 18 items across 10 domains
- **Validator:** `governance-console-validator.ts` — blocking checks enforced
- **Console does not:** mutate registries, execute actions, write DB, control external tools, enable Stage C
- **Stage C:** Remains disabled
- **Sidebar:** Governance Console Preview not in sidebar

## v7.30.0-P2/P3/P4 Runtime Contract Acceleration Pack — Center Boundaries Impact

v7.30.0-P2/P3/P4 adds 3 new hidden direct centers:
- Runtime Dry-run Contract Preview: hidden direct, not in sidebar
- Runtime Audit Store Contract Preview: hidden direct, not in sidebar
- Stage C Pre-Enable Human Review Pack: hidden direct, not in sidebar
- No sidebar changes
- No existing center boundary modified
- Stage C remains permanently disabled
- All new preview routes are hidden direct, not in sidebar

## v7.29.0 Final Seal — Center Boundaries

- Governance Console Aggregator: hidden direct, not in sidebar
- Risk Dashboard: hidden direct, not in sidebar
- Decision Panel: hidden direct, not in sidebar
- Report Pack: hidden direct, not in sidebar
- Rollback / Evidence / Human Approval / State Machine: hidden direct, not in sidebar
- Audit / Dry-run / Runtime / Permission: hidden direct, not in sidebar
- Lab / Governance / Navigation Preview: hidden direct, not in sidebar
- **Only sidebar entries:** Advanced Mode Preview, Connector Center
- Stage C: Permanently disabled
- No centers have write/execute/control capabilities enabled
