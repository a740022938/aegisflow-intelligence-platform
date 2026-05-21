# AIP v7.52 Dashboard + Operations Standardization Plan

**Date:** 2026-05-21  
**Status:** D1 — Blueprint  
**Target Phase:** P1  
**Baseline Finding:** `HIGH — Dashboard lacks shell`

---

## 1. Scope

| Page | Current | Target |
|---|---|---|
| `/` (Dashboard) | Legacy layout, PageHeader only | DashboardShell |
| `/factory-status` | Partial layout, SectionCard + StatusBadge | OperationsShell |

## 2. Dashboard Target

### Before
```
PageHeader (standalone)
  └─ Status grid (custom)
  └─ Recent activity (custom)
  └─ Empty right side on wide screens
```

### After
```
PageShell
  PageHeader (title + subtitle)
  GlobalStatusStrip (API health, Stage C disabled, feature flag off, track label)
  PrimaryStatusGrid (running tasks, experiments, active services)
  OperatorNextStep (prominent next-actions area)
  RecentEvidence (last 3-5 evidence entries, with EmptyState if none)
  QuickActions (navigation links — no mutation)
```

### Key Requirements
- PageShell wrapper
- StatusStrip with API/Stage C/feature flag status
- No new mutation buttons
- Right-side blank space reduction
- EmptyState for zero-evidence

## 3. FactoryStatus Target

### Before
```
PageHeader (standalone)
Custom status cards with role classes (role-card exec/train/gov/risk)
SectionCard with className role-card
```

### After
```
PageShell
  PageHeader (title + subtitle)
  StatusStrip (main health status, track, version)
  HealthCards (with SectionCard + StatusBadge)
  IncidentDetail (if failures)
  Release/Backup cards (with SectionCard)
  Failure state cards (with SectionCard)
  EmptyState for zero-state sections
```

### Key Requirements
- PageShell wrapper
- StatusStrip at top
- Keep SectionCard-based card layout (already uses SectionCard)
- Remove role-card CSS class dependency where safe
- No behavior change
- EmptyState for empty gate/failure sections

## 4. Not In Scope

```
- WorkflowComposer migration
- CostRouting changes
- ConnectorCenterReadonly changes
- AssistantCenter changes
- PluginPool changes
- Sidebar changes
- Hidden page exposure
- Runtime mutation
```

## 5. Risk Assessment

| Risk | Level | Mitigation |
|---|---|---|
| Dashboard behavior change | LOW | PageShell is visual-only; no logic change |
| FactoryStatus layout regression | LOW | SectionCard already used; PageShell wraps existing |
| Accidental mutation entry | LOW | No new buttons, no runtime code touched |
| CSS removal breaks layout | LOW | Keep existing CSS, only add PageShell wrapper |

## 6. Acceptance Criteria

```
Dashboard:
- PageShell: YES
- GlobalStatusStrip: YES
- OperatorNextStep: YES
- RecentEvidence with EmptyState: YES
- No dangerous buttons: YES

FactoryStatus:
- PageShell: YES
- StatusStrip: YES
- SectionCard-based cards preserved: YES
- EmptyState for zero sections: YES
- No behavior change: YES
```
