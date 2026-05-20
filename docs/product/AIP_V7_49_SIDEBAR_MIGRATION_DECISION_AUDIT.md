# AIP v7.49 — Sidebar Migration Decision + UI Exposure Audit

**Date:** 2026-05-20
**Phase:** P3
**Baseline HEAD:** `cbf79f7`
**Predecessor:** D1 Blueprint + P1 Test Evidence + P2 Env Rotation

---

## 1. Audit Scope

| Check | Source File(s) |
|-------|---------------|
| `visibleInSidebar` flags | `center-access-registry.ts` |
| Sidebar configuration | `Layout.tsx` (hardcoded rendering) |
| `hidden_direct` routes | `center-access-registry.ts`, `navigation-exposure-registry.ts` |
| `direct_route` entries | `navigation-exposure-registry.ts` |
| Canonical operator entrypoints | `center-access-registry.ts`, `navigation-exposure-registry.ts`, `App.tsx` |
| Historical/deprecated previews | All registry files + `App.tsx` |
| No-go / blocked pages | `center-access-registry.ts`, `governanceDesignSpec.ts` |

## 2. Key Findings

### 2.1 Architecture Pattern

The sidebar system uses an **intentional hardcoded + shadow validation** architecture:

| Layer | File | Role |
|-------|------|------|
| **Render source of truth** | `Layout.tsx` | Hardcoded `NavItem` components define what appears in sidebar |
| **Shadow center registry** | `center-access-registry.ts` (2024 lines) | Validates center/preview page exposure |
| **Shadow menu registry** | `menu-registry.ts` (699 lines) | Mirrors Layout.tsx sidebar for parity checking |
| **Shadow exposure registry** | `navigation-exposure-registry.ts` (1833 lines) | Defines exposure levels and gates for every route |

All shadow registries explicitly state they are NOT consumed by Layout or any page component. They exist for audit, validation, and governance.

### 2.2 visibleInSidebar Summary

| visibleInSidebar | Count | Entries |
|-----------------|-------|---------|
| `true` | 2 | `advanced-mode-readonly`, `connector-center-readonly` |
| `false` | 41 | All other center/preview entries (hidden direct routes) |

### 2.3 Sidebar Match: Layout.tsx vs Registry

| Visible Entry | In Layout.tsx? | visibleInSidebar |
|---------------|---------------|------------------|
| `advanced-mode-readonly` | ✅ Line 355 (`/advanced-mode-readonly`) | `true` |
| `connector-center-readonly` | ✅ Line 296 (`/connector-center-readonly`) | `true` |

**No mismatch.** Both entries marked for sidebar visibility are present in the hardcoded Layout.tsx.

### 2.4 Hidden Direct Routes (visibleInSidebar: false)

All 41 entries with `visibleInSidebar: false` (including operator previews, governance previews, Stage C previews, lab center, etc.) are intentionally NOT in the sidebar. They are URL-accessible only (`direct_route` or `hidden_direct`). This is the correct design.

### 2.5 Deprecated / Historical Previews

No `deprecated` or `legacy` flags found in any sidebar or route configuration. All 42 preview routes in `App.tsx` are active hidden direct-routes.

### 2.6 No-Go / Blocked Pages

- `governance-center` (center-access-registry line 222): `exposureRecommendation: 'do_not_expose'`, `exposureDecision: 'hold'`, `readiness: 'hold_review'`
- 13 placeholder routes in `App.tsx` (digital-employee, training-v2, etc.): All `hidden_internal` with `allowedNow: false`
- Stage C preview routes: All `direct_route` with gates, not exposed to sidebar

## 3. Migration Decision

**Decision: NO MIGRATION REQUIRED.**

The current architecture is intentional:
- **Layout.tsx** is the hardcoded rendering source of truth
- **Shadow registries** provide validation, audit, and governance oversight
- Both visible sidebar entries match between Layout.tsx and center-access-registry
- Migration of Layout.tsx to a registry-driven sidebar is NOT planned for v7.49

## 4. Exposure Audit Summary

| Category | Total | In Sidebar | Hidden Direct | Notes |
|----------|-------|-----------|---------------|-------|
| Center access entries | 43 | 2 | 41 | Correct by design |
| Preview routes (App.tsx) | 42 | 0 | 42 | All direct_route |
| Operator entrypoints | 18 | 0 | 18 | Hidden direct routes |
| Stage C previews | 12 | 0 | 12 | Gated, not exposed |
| Governance previews | 13 | 0 | 13 | Hidden direct routes |
| Placeholder routes | 13 | 0 | 13 | hidden_internal |

## 5. Safety

- No sidebar entries were modified
- No feature flag was toggled
- No Stage C changes made
- No registry files were consumed by layout — audit only
