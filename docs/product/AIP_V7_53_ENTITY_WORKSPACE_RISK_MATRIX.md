# AIP v7.53-D1 Entity Workspace Risk Matrix

**Date:** 2026-05-21  
**Baseline:** v7.53-D0 Deferred Complexity Inventory (`be67d63`)

---

## 1. Overview

Risk matrix for all entity/management pages that use `contentRef` + `WorkspaceGrid`. Rows are pages; columns are risk dimensions.

---

## 2. Risk Matrix

| Page | Lines | contentRef | WkspcGrid | Layout Editor | Mutation | Auth State | Custom Shell Elements | Overall Risk |
|---|---|---|---|---|---|---|---|---|
| **Datasets** | 687 | ✅ | ✅ (8 cards) | NO | Dataset create (POST) | Basic error | Standard PageHeader | **MEDIUM** |
| **Tasks** | 822 | ✅ | ✅ (8 cards) | NO | Task create (POST) | Basic error | Standard PageHeader | **MEDIUM** |
| **PluginPool** | 842 | ✅ | ✅ (9 cards) | **YES** | Plugin toggle (POST) | AuthRequiredState | Layout editor toggle, reset button | **MEDIUM-HIGH** |
| **Models** | 1,273 | ✅ | ✅ (16 cards) | NO | Model create (POST) | Basic error | Custom `summaryStrip`, VisionSurfaceStrip, Release cards | **HIGH** |
| WorkflowJobs | 1,232 | NO | NO | NO | Learned rules (POST) | Basic error | Gate drilldown, detail panel | MEDIUM |
| GovernanceHub | 991 | NO | NO | NO | Incident POST (6) | Basic error | Custom governance layout | HIGH |
| WorkflowComposer | 11,417 | NO | NO (React Flow) | NO | NO | Validation only | Full canvas architecture | NO-GO |

---

## 3. Legend

| Dimension | Values | Meaning |
|---|---|---|
| contentRef | ✅ / NO | Whether the page uses `useResponsiveLayoutMode` with a DOM ref |
| WkspcGrid | ✅ (N cards) / NO | Whether the page imports and renders `WorkspaceGrid`; number of workspace cards |
| Layout Editor | YES / NO | Whether the page has a user-facing layout edit toggle (drag/resize) |
| Mutation | Description (HTTP method) | What kind of data mutation the page performs |
| Auth State | Description | What auth/error state handling exists |
| Custom Shell Elements | Description | Any non-standard shell elements that complicate migration |
| Overall Risk | LOW / MEDIUM / MEDIUM-HIGH / HIGH / NO-GO | Composite risk assessment for shell migration |

---

## 4. Detailed Risk Breakdown

### 4.1 Datasets (MEDIUM — Best Candidate)

- **contentRef risk:** LOW — standard usage, `page-root` with `useResponsiveLayoutMode()` default pattern
- **WorkspaceGrid risk:** LOW — 8 cards, standard layouts (lg/md/sm), no editor
- **Mutation risk:** LOW — dataset create via `apiService.POST`, shell-safe per mutation safety rules
- **Migration effort:** LOW — replace `page-root` with `OuterShellAdapter`, remove `PageHeader`, add `StatusStrip`
- **Blocker:** None — smallest entity page with contentRef, standard PageHeader, no layout editor

### 4.2 Tasks (MEDIUM — Comparable to Datasets)

- **contentRef risk:** LOW — same pattern, but uses custom `tsk-root` class instead of `page-root`
- **WorkspaceGrid risk:** LOW — 8 cards, standard layouts (lg/md/sm), no editor
- **Mutation risk:** LOW — task create via `apiService.POST`, shell-safe
- **Migration effort:** MEDIUM — custom `tsk-root` CSS needs verification; class exists in TaskPage.css
- **Blocker:** None — but slightly more CSS surface than Datasets

### 4.3 PluginPool (MEDIUM-HIGH — Secondary Candidate)

- **contentRef risk:** LOW — standard `page-root` usage
- **WorkspaceGrid risk:** MEDIUM — 9 cards, layout editor toggle, layout persistence via `layoutStorage`
- **Mutation risk:** LOW — plugin toggle, shell-safe, AuthRequiredState already handled
- **Auth state risk:** LOW — already has `AuthRequiredState`, no change needed
- **Migration effort:** MEDIUM — must handle layout editor toggle + inline style on page-root (`flex: 1, overflow: auto`)
- **Blocker:** Layout editor toggle interacts with `shouldUseLayoutEditor` which gates `WorkspaceGrid editable` prop — width measurement must remain correct

### 4.4 Models (HIGH — Deferred)

- **contentRef risk:** LOW — standard `page-root` usage
- **WorkspaceGrid risk:** MEDIUM — 16 cards (largest set), only lg layout defined (no md/sm fallbacks)
- **Custom shell risk:** HIGH — custom `summaryStrip` with 5 inline stat boxes that must be removed and replaced with `StatusStrip`
- **Additional elements:** `VisionSurfaceStrip`, `ReleaseReadinessCard`, `ReleaseManifestCard`, `ReleaseNotesPanel` — specialized cards that must remain
- **Migration effort:** HIGH — summaryStrip removal + 16-card WorkspaceGrid + specialized panel review
- **Blocker:** summaryStrip refactor + largest card set + only lg layout

---

## 5. Recommended Order

```text
1. Datasets (pilot, P4)
2. Tasks (pilot alt, P4)
3. PluginPool (pilot alt, P4 — requires extra attention to layout editor)
4. WorkflowJobs (plan-only, no contentRef but POST mutation)
5. GovernanceHub (P3 safety review first)
6. Models (deferred to v7.54+)
7. WorkflowComposer (no-go, v7.54+)

Already acceptable:
- MemoryHubReadonly
- OpenAxiomReadonly
```

---

## 6. Safety Notes

- No page in the entity workspace category has Stage C operations
- No page has runtime executor operations
- All mutations are entity CRUD (create/toggle status/enable-disable) — not dangerous operations
- The layout editor (PluginPool) only reorders cards — no data mutation
- All auth states are already handled (PluginPool) or not needed (other pages)
