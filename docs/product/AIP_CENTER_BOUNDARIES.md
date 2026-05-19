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
