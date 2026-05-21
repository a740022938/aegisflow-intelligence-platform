# AIP v7.54-P3 Reusable Shell Adapter Rules

**Date:** 2026-05-21

---

## Rule A — Outer Shell Only

> The shell migration must touch only the outermost wrapper of the page
> component. All inner content, business logic, data flow, and component
> props must remain identical.

### Allowed Changes
- Add `<PageShell>` wrapper around the entire render tree
- Add `<StatusStrip>` for status summary display
- Preserve the inner layout root element (e.g., `<div className="page-root">`)
  with original ref and CSS classes
- Remove duplicate `<PageHeader>` if PageShell provides its own

### Forbidden Changes
- Rename or remove inner root CSS classes
- Move `contentRef` to a different element
- Modify WorkspaceGrid props, cards, or layout config
- Modify any `apiService.*` call
- Change any POST mutation semantics
- Add new buttons, actions, or destructive controls

### Verification
```text
git diff --name-only   # Must show only the page file
git diff --stat        # Changes must be shell-level only
```

---

## Rule B — contentRef Preservation

> If the page uses `useResponsiveLayoutMode()` with a `contentRef`, the ref
> must remain attached to the same logical DOM element at the same structural
> depth. The element's width measurement context must not change.

### Required Actions
1. Keep `ref={contentRef}` on the inner wrapper div
2. Keep the same CSS class name (e.g., `page-root`) for width measurement
3. Inline style overrides must not affect width (only height/overflow)
4. Verify `layoutMode` string is identical before vs. after migration

### Verification
```text
# Check that contentRef is on the correct element in render tree
git show HEAD -- <page-file> | grep "ref={contentRef}"

# At runtime, inspect layout mode in StatusStrip or debug overlay
Layout mode reported as: lg / md / sm (must match pre-migration)
```

### Forbidden Changes
- Moving `contentRef` to PageShell or any outer wrapper
- Removing CSS classes that the ref element depends on for width measurement
- Changing the ref element's display or box-sizing property

---

## Rule C — Mutation Neutrality

> Shell migration must not introduce, remove, or modify any mutation
> (POST/PUT/DELETE) call. The migration must be mutation-neutral.

### Required Actions
1. Count all mutation calls in pre-migration page inventory
2. Verify identical count in post-migration source
3. Verify mutation call signatures (URL, method, payload) are identical

### Verification
```text
# Count mutations before migration
rg -c "apiService\.(create|update|delete)" apps/web-ui/src/pages/<Page>.tsx

# Verify no change after migration
git diff HEAD -- apps/web-ui/src/pages/<Page>.tsx | grep "apiService\." | wc -l
# Expected: 0 changed lines for apiService calls
```

### Forbidden Changes
- Adding new `apiService.*` calls
- Changing mutation URL, method, or payload structure
- Adding new buttons that trigger destructive actions
- Introducing new state that triggers side-effect mutations

---

## Rule D — Visual QA Required

> Any shell migration affecting contentRef, WorkspaceGrid, or responsive
> layout must complete a multi-viewport visual QA before final acceptance.

### Minimum Viewport Matrix

| ID | Viewport | Rationale |
|---|---|---|
| V1 | 1440 × 900 | Desktop (lg layout) |
| V2 | 1280 × 720 | Laptop (lg layout) |
| V3 | 1024 × 768 | Tablet landscape (md layout) |
| V4 | 768 × 1024 | Tablet portrait (md/sm layout) |
| V5 | 390 × 844 | Mobile (sm layout) |

### Required Evidence Per Viewport
- Screenshot of the page in normal state
- DOM analysis confirming key structural elements:
  - `page-shell-root` / `page-shell-content` present
  - Inner `page-root` preserved with `ref`
  - `WorkspaceGrid` renders
  - StatusStrip items display correctly
  - No console errors
  - No debug leaks (stale placeholders, `contentRef_raw`)

### Deferred QA Policy
- If visual QA cannot be executed, the verdict must be `VISUAL_QA_DEFERRED`
- A deferred verdict prevents final acceptance (cannot seal)
- P2 must be planned to execute visual QA before any broader migration

### Forbidden
- Sealing a shell pilot without visual evidence
- Assuming visual pass based on static analysis alone

---

## Rule E — Candidate Classification

> Before any shell pilot, the candidate page must be classified into one of
> five categories. The classification determines whether a shell pilot is
> allowed, conditional, or forbidden.

### Classification Table

| Class | Description | Can Shell Pilot? | Required Evidence | Examples |
|---|---|---|---|---|
| **Reference readonly** | Modern, low mutation risk, no canvas/editor | Usually yes | typecheck/build/lint + visual QA | MemoryHubReadonly, OpenAxiomReadonly |
| **WorkspaceGrid page** | Uses contentRef + WorkspaceGrid + layout editor | Conditional | D1 inventory + adapter criteria + visual QA | Models, PluginPool, Tasks, WorkflowJobs |
| **Operational mutation** | POST/actions present, CRUD operations | Conditional/no-go | D1 mutation audit + confirmation audit | Datasets (passed), any page with 4+ mutations |
| **Canvas/state-machine** | ReactFlow, heavy editor, complex state | No-go | Docs-only split plan | WorkflowComposer |
| **Governance/high-risk** | Recover/resolve/confirm actions | No-go until auth model fixed | Safety boundary review | GovernanceHub |

### Classification Flow
```text
1. Is it a canvas/state-machine page?                  → Class E (No-go)
2. Does it have governance/recover/confirm actions?     → Class E (No-go)
3. Does it have 3+ POST mutations?                      → Class C (Conditional)
4. Does it use contentRef + WorkspaceGrid?             → Class B (Conditional)
5. Is it modern, readonly, low risk?                    → Class A (Usually yes)
```

### For Each Conditional/Yes Page, Required Documents
- Page inventory (D1-style)
- Shell adapter acceptance criteria
- Visual QA checklist with viewport matrix
- Rollback plan
- Go/No-Go decision document
