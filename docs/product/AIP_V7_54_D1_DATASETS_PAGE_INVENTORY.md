# AIP v7.54-D1 Datasets Page Inventory

**Date:** 2026-05-21
**Source:** `apps/web-ui/src/pages/Datasets.tsx` (687 lines)

---

## Inventory Table

| Area | Current State | Risk | Migration Impact | Notes |
|---|---|---|---|---|
| **Page shell** | `<div className="page-root" ref={contentRef}>` (line 376) | MEDIUM | Must replace with `OuterShellAdapter` or `PageShell` while preserving `ref` | No `PageShell` wrapper currently |
| **contentRef** | `useResponsiveLayoutMode()` at line 124; `ref={contentRef}` on `page-root` at line 376 | MEDIUM | Ref must be forwarded to inner content div — must not break `contentWidth` | Drives `WorkspaceGrid` layout mode selection |
| **WorkspaceGrid** | `<WorkspaceGrid editable={layoutEdit} layouts={layouts} cards={workspaceCards} onChange={handleLayoutChange} />` at line 504 | MEDIUM | Must remain unchanged; 8 cards with lg/md/sm layouts | No grid rewrite needed |
| **Layout editor** | `toggleEdit` button at line 472; `WorkspaceGrid editable={layoutEdit}`; layout save/load via `layoutStorage.ts` | MEDIUM | Must remain functional; layout persistence must not change | Disabling editor path is an option for migration safety |
| **API calls (read)** | `apiService.getDatasets()` (line 150), `apiService.getDataset()` (line 172), `apiService.getTask()` (line 179), `apiService.listPipelineRuns()` (line 183), `apiService.listSplits()` (line 183) | LOW | No changes needed | All via `apiService.*` abstraction |
| **Mutations (POST)** | `apiService.createDataset()` (line 206), `apiService.updateDataset()` (line 222), `apiService.createDatasetNewVersion()` (line 233), `apiService.createPipelineRun()` (line 244) | MEDIUM | Must remain unchanged; any change to mutation behavior is not allowed | All shell-safe per D1 mutation safety rules |
| **Create modal** | `showCreate` state + conditional form rendering (lines 108, 202-216) | LOW | Must remain functional | Part of existing page flow |
| **Version modal** | `showVersion` state + `newVerInput` (lines 110, 229-238) | LOW | Must remain functional | Part of existing page flow |
| **Pipeline modal** | `showPipeline` state + `pipelineType` (lines 112-113, 240-249) | LOW | Must remain functional | Part of existing page flow |
| **Edit/save form** | `editForm` state + `handleSave` (lines 105, 218-227) | LOW | Must remain functional | Inline editing within workspace cards |
| **Empty state** | `<EmptyState message="加载中..." />` (line 408), `<EmptyState icon="📁" message="无匹配数据集" />` (line 409) | LOW | Can be migrated to shared `EmptyState` but not required | Already uses shared component |
| **Error state** | `error` state + `<div className="ui-flash ui-flash-err">` (line 419) | LOW | Can be migrated but not required | Current inline error display works |
| **Loading state** | `loading` (line 87), `detailLoading` (line 103), `saving` (line 106), `creating` (line 109), `pipelineLoading` (line 112) | LOW | Must remain functional | Multiple loading states for different operations |
| **Responsive behavior** | `useResponsiveLayoutMode()` provides `contentWidth`, `layoutMode`, `canUseLayoutEditor`, `shouldUseLayoutEditor` | MEDIUM | Must be preserved; shell migration must not break width measurement | Depends on `contentRef` being on a DOM element within the shell |
| **CSS** | `Datasets.css` (import line 12), `shared.css` (import line 11), inline styles throughout | LOW | CSS class names must remain unchanged; only wrapper-level styling may change | No CSS rewrite needed |
| **Sub-components** | `DsListItem` (line 70), `StatusChip` (line 65) | LOW | Internal components, no migration impact | Can remain as-is |
