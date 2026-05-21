# AIP v7.53-P1 Entity Pages Refactor Plan

**Date:** 2026-05-21
**Baseline:** v7.53-D0 Deferred Complexity Inventory (`be67d63`) + v7.53-D1 Entity Workspace Risk Matrix (`3e0d3c2`)
**Package:** v7.53-D0→P5 Engineering Total Pack

---

## 1. Problem Statement

4 entity/management pages (Tasks, Models, Datasets, PluginPool) depend on `contentRef` from
`useResponsiveLayoutMode()` + `WorkspaceGrid`. These pages cannot migrate to `PageShell` until
the `contentRef` chain is preserved on the inner content area.

P1 establishes the refactor plan and pilot selection without modifying any source code.

---

## 2. Pilot Selection Outcome

| Candidate | Lines | Layout Editor | POST Mutation | Standard PageHeader | Verdict |
|---|---|---|---|---|---|
| **Datasets** | 687 | ✅ — `toggleEdit` at line 472, `WorkspaceGrid editable={layoutEdit}` | ✅ — dataset create via `apiService.POST` | ✅ | **Conditional — not eligible for immediate pilot** |
| Tasks | 822 | ✅ — same pattern as Datasets | ✅ — task create via `apiService.POST` | ✅ | Deferred |
| PluginPool | 842 | ✅ — layout editor toggle + `layoutStorage` | ✅ — plugin toggle via `apiService.POST` | ✅ | Deferred |
| Models | 1,273 | ✅ — same pattern | ✅ — model create via `apiService.POST` | ❌ — custom `summaryStrip` | Deferred to v7.54+ |

**Decision:** No entity page fully satisfies the strict pilot criteria (no layout editor + no POST mutation).
Datasets is the lowest-risk candidate by size and structure but is **not eligible for immediate pilot**.

See [`AIP_V7_53_P1_ENTITY_PAGE_PILOT_SELECTION.md`](./AIP_V7_53_P1_ENTITY_PAGE_PILOT_SELECTION.md) for detailed evaluation.

---

## 3. Pilot Readiness Checklist (Datasets — for Future Use)

These are the file-level preflight gates that must pass before Datasets can be piloted in a future
release (e.g., v7.53-P2 or v7.54):

### 3.1 Preflight Gates

| # | Gate | Description | Verification Method |
|---|---|---|---|
| G1 | No `contentRef` changes | The `ref` on `page-root` must be preserved or forwarded | `git diff` — no changes to `useRef`, `contentRef`, or `ref={}` |
| G2 | No `WorkspaceGrid` rewrites | `WorkspaceGrid` rendering must be untouched | `git diff` — no changes to `<WorkspaceGrid>` or card definitions |
| G3 | No API changes | All `apiService.*` calls remain as-is | `git diff` — no changes to `apiService` invocations |
| G4 | No state management changes | All `useState`/`useCallbacks`/`useEffects` remain as-is | `git diff` — no changes to hooks or state variables |
| G5 | Layout editor unchanged | `toggleEdit`, `layoutEdit`, `setLayoutEdit` behavior untouched | `git diff` — no changes to editor toggle or `WorkspaceGrid editable` |
| G6 | No POST behavior changes | Dataset create mutation flow unchanged | `git diff` — no changes to create-handler or form submission |
| G7 | Visual-only outer shell proof | The only change should be wrapping content in `OuterShellAdapter` | Code review — verify diff contains no logic changes, only structural wrapping |

### 3.2 Rollback Criteria

Any of these during PR review or testing triggers immediate rollback:

1. WorkspaceGrid layout persistence broken after migration
2. Layout edit toggle fails or loses state
3. Dataset create POST fails or behaves differently
4. contentWidth measurement deviates from pre-migration behavior
5. Any test regression in Datasets page

---

## 4. Deferred Rules (P1 Skip per Page)

For each page not selected for pilot, "P1 skip" means:

### 4.1 Tasks (Secondary, Deferred)

- **Do not** modify `Tasks.tsx` in P1
- **Do not** modify `TaskPage.css` or any Tasks-related CSS
- Tasks will inherit the `OuterShellAdapter` pattern after Datasets validates
- Unique risk: custom `tsk-root` CSS class must be verified to not conflict with `PageShell`

### 4.2 PluginPool (Tertiary, Deferred)

- **Do not** modify `PluginPool.tsx` in P1
- Unique risk: layout editor toggle + `layoutStorage` + `AuthRequiredState` + inline styles on `page-root`
- Requires extra attention when piloted because `shouldUseLayoutEditor` gates `editable` prop

### 4.3 Models (Deferred to v7.54+)

- **Do not** modify `Models.tsx` in P1
- Unique risk: custom `summaryStrip` must be removed and replaced with `StatusStrip`; 16 cards in WorkspaceGrid; non-standard shell elements
- Models will not be considered until Datasets and at least one secondary page validate

### 4.4 MemoryHubReadonly & OpenAxiomReadonly

- **Already acceptable** — no `contentRef` or `WorkspaceGrid` usage
- No action needed in P1

---

## 5. Next Steps

1. A future **Datasets Conditional Pilot Plan** should be created with:
   - Safeguards for layout editor path during shell migration
   - No POST behavior changes
   - No API changes
   - No WorkspaceGrid rewrite
   - No contentRef rewrite
   - Visual-only outer shell proof
   - Explicit rollback criteria
2. Revisit in v7.53-P2 or v7.54 once a valid outer-shell-only migration pattern exists for a safer page (e.g., a non-entity page with no layout editor and no POST mutation)

---

## 6. Safety Boundaries

| Concern | Status |
|---|---|
| No Stage C operations in entity workspace category | Confirmed per D1 Risk Matrix |
| No runtime executor operations | Confirmed |
| All mutations are entity CRUD (safe) | Confirmed |
| Layout editor only reorders cards (no data mutation) | Confirmed |
| No source code modified in P1 | Confirmed |
