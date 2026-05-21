# AIP v7.54-D1 Datasets Visual QA Checklist

**Date:** 2026-05-21

---

## 1. Requirement

Before any P1 code migration, **before screenshots must be saved**. After P1 migration,
**after screenshots must be saved** and compared. If screenshots cannot be executed,
the checklist must be marked as `VISUAL_QA_DEFERRED` — approval cannot be assumed.

---

## 2. Screenshot Matrix

| Viewport | State | Required Screenshot | Pass Criteria |
|---|---|---|---|
| 1440px desktop | Normal (list loaded, detail loaded) | Before / After | No layout overflow; all 8 workspace cards visible; tabs render correctly |
| 1280px desktop | Normal (list + detail) | Before / After | Cards align correctly; no horizontal scroll |
| 1024px tablet | Normal (list + detail) | Before / After | Responsive layout adjusts; no overflow |
| 768px narrow | Normal (list + detail) | Before / After | Readable stack layout; no cut-off content |
| 1440px desktop | Loading state | After | Skeleton or spinner acceptable; no broken layout |
| 1440px desktop | Empty state (no datasets) | After | `<EmptyState icon="📁" message="无匹配数据集">` renders correctly |
| 1440px desktop | Error state | After | Error banner visible and readable |
| 1440px desktop | Create modal open | Before / After | Modal renders correctly; form fields intact |
| 1440px desktop | Layout edit mode active | Before / After | `toggleEdit` clicked; workspace cards in edit mode; layout persistence testable |
| 1440px desktop | Detail tabs: versions / pipeline / splits / raw | Before / After | Each tab renders correctly; no blank panels |

---

## 3. Responsive Details

| Breakpoint | Layout Mode | Behavior |
|---|---|---|
| >= 1200px | `lg` | Full WorkspaceGrid with 6-column card layout |
| 768-1199px | `md` | WorkspaceGrid with 4-column card layout |
| < 768px | `sm` | WorkspaceGrid with 1-column stacked layout |

---

## 4. Visual QA Process

1. Before migration: capture all screenshots listed above
2. Archive screenshots to `docs/visual/datasets/before/`
3. Execute P1 shell migration
4. After migration: capture all screenshots listed above at identical viewports
5. Archive to `docs/visual/datasets/after/`
6. Compare pairwise — any visual regression blocks the pilot
7. If screenshots cannot be taken (no UI automation available), mark as `VISUAL_QA_DEFERRED`
   and document the limitation — do not assume pass
