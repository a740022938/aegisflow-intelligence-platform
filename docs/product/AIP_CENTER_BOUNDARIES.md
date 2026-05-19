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

## v7.28 Governance Blueprint — Center Boundary Impact

v7.28.0-D1 governance blueprint docs do NOT change any center boundary:
- No new centers
- No sidebar changes
- No center exposure changes
- No Governance Center mutation|
