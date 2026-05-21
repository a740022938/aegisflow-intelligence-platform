# AIP v7.54-D1 Datasets Shell Adapter Acceptance Criteria

**Date:** 2026-05-21

---

## 1. Recommended Migration Morph

For future P1, the only acceptable migration pattern is a low-risk wrapper:

```tsx
<PageShell>
  <PageHeader title="数据集" subtitle={...} actions={...} />
  <StatusStrip items={...} />
  <div ref={contentRef} className="datasets-content">
    {/* Existing content tree unchanged */}
  </div>
</PageShell>
```

This is **conceptual only** — no code is implemented in D1.

---

## 2. Acceptance Criteria (All 10 Must Pass)

| # | Criterion | Verification Method |
|---|---|---|
| A1 | Datasets business data flow unchanged | All `fetchList`, `fetchDetail`, `handleCreate`, `handleSave`, `handleNewVersion`, `handlePipeline` callbacks untouched |
| A2 | All API calls unchanged | `apiService.*` invocations identical to pre-migration state — verified by `git diff` |
| A3 | All mutation behavior unchanged | Dataset create, update, version, pipeline start — all POST semantics identical |
| A4 | WorkspaceGrid parameters unchanged | `editable`, `layouts`, `cards`, `onChange` props identical |
| A5 | contentRef behavior preserved | `contentWidth` measurement produces same values as pre-migration — verified by debug overlay from `layoutMode: {layoutMode} · contentWidth: {Math.round(contentWidth)}px` (line 502) |
| A6 | Filters/search/pagination behavior unchanged | `typeFilter`, `statusFilter`, `labelFilter`, `search` — all state and UX identical |
| A7 | All loading/error/empty states preserved | `loading`, `detailLoading`, `error`, `successMsg`, `EmptyState` — all visible states render correctly |
| A8 | Layout editor toggle functional | `toggleEdit` button (line 472), `WorkspaceGrid editable` (line 504), layout save/load (line 138) — all work identically |
| A9 | Visual comparison passes | All viewport/state combinations in Visual QA Checklist match before/after screenshots |
| A10 | All validation gates pass | `typecheck`, `build`, `lint`, `git diff --check` — all pass with zero errors |

---

## 3. Only Acceptable Changes

Future P1 may only change:

1. Outer shell wrapper (add `PageShell` or `OuterShellAdapter`)
2. Title area standardization (if any)
3. Status summary migration to `StatusStrip`
4. Shared component migration (`EmptyState` → shared, `ErrorState` → shared) — optional

---

## 4. Forbidden Changes

- Any modification to `apiService.*` calls
- Any modification to WorkspaceGrid rendering or card definitions
- Any modification to contentRef or layout measurement
- Any modification to POST mutation semantics
- Any new API endpoints
- Any new side-effect or DB write
