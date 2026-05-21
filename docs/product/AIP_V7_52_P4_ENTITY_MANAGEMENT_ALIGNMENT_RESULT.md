# AIP v7.52-P4 Entity Management Page Alignment Result

**Date:** 2026-05-21  
**Phase:** P4 — Entity Management Page Alignment  
**Baseline:** v7.52-P3 Workflow Tool Page Risk Split (`d0265d2`)

---

## 1. EntityManagementShell Definition

The canonical Entity Management page type consists of:

| Component | Role |
|---|---|
| `PageShell` | Page-level shell with title, subtitle, maturity, safety boundary |
| `StatusStrip` | Summary stats inline bar (total, by-status counts) |
| `FilterBar` | Inline filter controls (search input, status/type/category selects) |
| `EntityList` / `EntityTable` | Scrollable entity list with selection highlighting |
| `DetailPanel` | Expandable/switchable detail workspace with tabs |
| `EmptyState` | Empty/null-state messaging |
| `ErrorState` / `AuthRequiredState` | Error/auth guards |

A well-aligned entity management page:
- Wraps in `<PageShell>` with `title` + `subtitle`
- Uses `<StatusStrip>` for summary counts (not custom `summaryStrip` or inline stat cards)
- Uses `<SectionCard>` for logical sections (list, detail, filter)
- Uses `<EmptyState>` for null/loading states
- Uses `contentRef` + `WorkspaceGrid` only for detail panel workspace (not the outer shell)

## 2. Pages Reviewed

| Page | Route | Lines | Current Shell | Risk | Classification |
|---|---|---|---|---|---|
| Models | `/models` | 1273 | `page-root` + `PageHeader` (custom `summaryStrip`) | HIGH | **DEFERRED** — contentRef + WorkspaceGrid + custom summaryStrip |
| Datasets | `/datasets` | 687 | `page-root` + `PageHeader` | MEDIUM-HIGH | **DEFERRED** — contentRef + WorkspaceGrid + left/right panel layout |
| PluginPool | `/plugin-pool` | 842 | `page-root` + `PageHeader` | MEDIUM-HIGH | **DEFERRED** — contentRef + WorkspaceGrid + layout editor + auth state |
| MemoryHubReadonly | `/memory-hub` | 447 | `PageShell` (external, readonly) | — | **ALREADY ACCEPTABLE** |
| OpenAxiomReadonly | `/openaxiom` | 855 | `PageShell` (external, readonly) | — | **ALREADY ACCEPTABLE** |
| ModelProducts | *(not implemented)* | — | — | — | **NOT YET IMPLEMENTED** |
| EvaluationCenter | *(not implemented)* | — | — | — | **NOT YET IMPLEMENTED** |
| DeploymentCenter | *(not implemented)* | — | — | — | **NOT YET IMPLEMENTED** |

## 3. Risk Assessment Details

### HIGH RISK — Deferred

**Models** (`/models`, 1273 lines)
- Uses `page-root` + `PageHeader` with **custom `summaryStrip`** (hand-rolled summary div, not `StatusStrip`)
- `contentRef` on page-root div for `useResponsiveLayoutMode` — `WorkspaceGrid` width measurement depends on this
- Complex detail panel with 7 tabs (overview, artifacts, packages, deployments, evaluations, raw, etc.)
- Model create/delete/publish mutation buttons
- `VisionSurfaceStrip`, `ReleaseReadinessCard`, `ReleaseManifestCard`, `ReleaseNotesPanel` — specialized cards
- Shell migration would risk breaking `contentRef` width measurement and WorkspaceGrid layout
- **Verdict: DEFERRED (v7.53+)**

### MEDIUM-HIGH RISK — Deferred

**Datasets** (`/datasets`, 687 lines)
- `contentRef` on page-root div for `useResponsiveLayoutMode`
- Custom left/right panel layout (not SectionCard-driven)
- Dataset import/export mutations
- `MainlineChainStrip` usage in detail workspace
- Shell migration would risk breaking `contentRef` width measurement
- **Verdict: DEFERRED (v7.53+)**

**PluginPool** (`/plugin-pool`, 842 lines)
- `contentRef` on page-root div for `useResponsiveLayoutMode`
- Layout editor toggle with `WorkspaceGrid editable` prop
- Auth state handling (shows `AuthRequiredState` when not authenticated)
- Plugin runtime operations (enable/disable, discover, register)
- Shell migration would risk breaking `contentRef` width measurement and layout editor
- **Verdict: DEFERRED (v7.53+)**

### ALREADY ACCEPTABLE

**MemoryHubReadonly** (`/memory-hub`)
- Already uses `<PageShell maturity="external" safetyBoundary="readonly">`
- Uses custom `card()` helper (not `SectionCard`), but that's a stylistic choice, not a shell concern
- Read-only operations, no mutation buttons
- **Verdict: ALREADY ACCEPTABLE — no changes needed**

**OpenAxiomReadonly** (`/openaxiom`)
- Already uses `<PageShell maturity="external" safetyBoundary="readonly">`
- Uses `SectionCard`, `StatusBadge`, `EmptyState` — consistent with DS
- Read-only operations, no mutation buttons
- **Verdict: ALREADY ACCEPTABLE — no changes needed**

### NOT YET IMPLEMENTED

**ModelProducts**, **EvaluationCenter**, **DeploymentCenter**
- No route or page file exists in codebase
- When implemented, should follow EntityManagementShell pattern from the start
- **Verdict: NOT YET IMPLEMENTED — no action needed**

## 4. P4 Alignment Action

**No pages migrated.** All 5 existing entity management pages are either:
- Already using PageShell (2 pages), or
- Too high-risk for shell migration due to `contentRef` + `WorkspaceGrid` dependency (3 pages)

Three planned pages do not exist yet.

**P4 is docs-only:** EntityManagementShell definition + classification + risk assessment.

## 5. Proposed Migration Path (v7.53+)

When migrating Models, Datasets, or PluginPool to PageShell:
1. Remove `contentRef` from page-root and add it to the inner content area instead, OR refactor `useResponsiveLayoutMode` to accept a measure-target other than the shell root
2. Replace custom `summaryStrip` with `<StatusStrip>`
3. Wrap in `<PageShell>` and remove manual `<PageHeader>`
4. Keep `WorkspaceGrid` as-is (it operates on inner content, not the shell)

## 6. No Dangerous Buttons Added
- No Stage C enable buttons
- No feature flag toggle buttons
- No release/tag creation
- No DB writes
- No restarts/taskkills
