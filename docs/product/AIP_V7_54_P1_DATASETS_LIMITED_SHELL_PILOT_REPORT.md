# AIP v7.54-P1 Datasets Limited Shell Pilot Report

**Date:** 2026-05-21
**Pre-HEAD:** `69011bd`
**Post-HEAD:** *(to be determined after commit)*

---

## 1. Summary

Implemented the PageShell / Shell Adapter pilot for the Datasets page. The outer
wrapper was migrated from the old `<div className="page-root" ref={contentRef}>`
pattern to the design system's `<PageShell>` component, with a `StatusStrip`
added and `contentRef` preserved on an inner wrapper div.

**Zero business logic was changed.** The modification is purely structural at the
shell level.

---

## 2. Changed Files

| File | Change |
|---|---|
| `apps/web-ui/src/pages/Datasets.tsx` | Shell migration: 4 lines changed in imports, ~12 lines in render |

---

## 3. Implementation Summary

### 3.1 What Changed

1. **Imports:** Added `PageShell` and `StatusStrip` to the `../components/ui` import
2. **Outer wrapper:** Replaced `<div className="page-root" ref={contentRef}>` with `<PageShell title="数据集" subtitle={...} actions={...}>`
3. **Header:** Removed the old `<PageHeader>` (PageShell renders its own internally)
4. **Status strip:** Added `<StatusStrip>` with 3 items: dataset count, layout mode, edit mode
5. **Inner wrapper:** Kept `<div className="page-root" ref={contentRef}>` with inline style override (`display: block; height: auto; overflow: visible`) to prevent double-scroll within PageShell while preserving CSS class for `.page-root` descendant selectors
6. **All content, modals, handlers, API calls** — completely unchanged

### 3.2 What Did NOT Change

- All `apiService.*` calls (4 POST mutations + 5 read calls) — identical
- All business data flow callbacks (`fetchList`, `fetchDetail`, `handleCreate`, `handleSave`, `handleNewVersion`, `handlePipeline`) — untouched
- `WorkspaceGrid` rendering, props (`editable`, `layouts`, `cards`, `onChange`) — identical
- 8 workspace card definitions — identical
- Layout editor toggle — identical
- `contentRef` — preserved on inner `<div className="page-root">`
- `useResponsiveLayoutMode()` — unchanged
- Loading, error, empty states — preserved
- 3 modals (create, version, pipeline) — preserved
- CSS files — unchanged

---

## 4. Validation Results

| Gate | Result |
|---|---|
| `pnpm run typecheck` | PASS |
| `pnpm run build` | PASS (non-blocking chunk size warning) |
| `pnpm run lint` | PASS |
| `git diff --check` | PASS |
| `git diff --name-only` | Only `Datasets.tsx` changed |

---

## 5. Behavior Safety Checklist

| Check | Result |
|---|---|
| Datasets page route unchanged | ✅ (no route files changed) |
| Sidebar not modified | ✅ (no sidebar files changed) |
| Hidden preview not exposed | ✅ |
| POST mutation count unchanged | ✅ 4 (createDataset, updateDataset, createDatasetNewVersion, createPipelineRun) |
| API URLs unchanged | ✅ |
| No new DB write path | ✅ |
| No Stage C enablement | ✅ |
| Feature flag not toggled | ✅ |
| No tag/release created | ✅ |
| No restart/taskkill | ✅ |

---

## 6. Visual QA

Manual screenshot comparison was not executed in this session (no UI automation
available for `apps/web-ui`). See the QA result document for the deferred verdict.

---

## 7. Rollback Command

```powershell
git revert HEAD --no-edit
git push origin main
```

---

## 8. Final Verdict

```text
V7_54_P1_DATASETS_SHELL_PILOT_READY_WITH_VISUAL_QA_DEFERRED
```

The pilot was successfully implemented with zero business logic changes.
Validation gates pass. Safety boundaries are intact. Visual QA is deferred
pending UI automation or manual screenshot comparison.

---

## 9. Next Steps

1. **P2 (Recommended):** Execute visual QA via screenshot comparison before/after
   migration. If no regression, upgrade verdict to full-ready.
2. **P3 (Optional):** Extend PageShell migration to other `contentRef`-based pages
   (Runs, Artifacts, Models, etc.) using the same OuterShellAdapter pattern.
