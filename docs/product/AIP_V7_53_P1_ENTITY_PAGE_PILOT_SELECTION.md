# AIP v7.53-P1 Entity Page Pilot Selection

**Date:** 2026-05-21
**Baseline:** v7.53-D1 Entity Workspace Risk Matrix

---

## 1. Purpose

Evaluate all entity/management pages that use `contentRef` + `WorkspaceGrid` against the strict
pilot criteria to determine the optimal first candidate for `PageShell` / `OuterShellAdapter`
migration.

---

## 2. Strict Pilot Criteria

| # | Criterion | Rationale |
|---|---|---|
| C1 | Smallest `contentRef` + `WorkspaceGrid` page | Minimize blast radius for first migration |
| C2 | No layout editor | Avoid complexity of edit-mode state during migration |
| C3 | No POST mutation | Reduce risk of data-loss bugs from structural changes |
| C4 | Standard `PageHeader` | Minimize custom shell element removal |
| C5 | Shell-only migration via `OuterShellAdapter` | Scope limited to outer wrapping, no logic changes |
| C6 | No `WorkspaceGrid` rewrite | Grid internals untouched |
| C7 | No `contentRef` rewrite | Measurement chain preserved |
| C8 | No behavior change | Validated by visual regression only |

---

## 3. Candidate Evaluation

### 3.1 Datasets (687 lines)

| Criterion | Result | Evidence |
|---|---|---|
| C1: Smallest | ✅ | 687 lines (smallest of all candidates) |
| C2: No layout editor | ❌ | `toggleEdit` at line 472, `WorkspaceGrid editable={layoutEdit}` at line 504 |
| C3: No POST mutation | ❌ | Dataset create via `apiService.POST` |
| C4: Standard PageHeader | ✅ | Uses `<PageHeader>` component |
| C5: OuterShellAdapter | ✅ | No blockers for outer shell wrapping |
| C6: No WorkspaceGrid rewrite | ✅ | No grid rewrite needed |
| C7: No contentRef rewrite | ✅ | No ref rewrite needed |
| C8: No behavior change | ✅ | Shell is purely presentational |

**Verdict: CONDITIONAL — fails C2 and C3. Best candidate by structure and size, but not eligible
for immediate pilot.**

### 3.2 Tasks (822 lines)

| Criterion | Result | Evidence |
|---|---|---|
| C1: Smallest | ❌ | 822 lines (larger than Datasets) |
| C2: No layout editor | ❌ | Same `toggleEdit` pattern as Datasets |
| C3: No POST mutation | ❌ | Task create via `apiService.POST` |
| C4: Standard PageHeader | ✅ | Uses `<PageHeader>` component |
| C5: OuterShellAdapter | ✅ | No blockers |
| C6: No WorkspaceGrid rewrite | ✅ | No grid rewrite needed |
| C7: No contentRef rewrite | ✅ | No ref rewrite needed |
| C8: No behavior change | ✅ | Shell is purely presentational |

**Verdict: DEFERRED. Larger than Datasets + same tradeoffs. Not selected.**

### 3.3 PluginPool (842 lines)

| Criterion | Result | Evidence |
|---|---|---|
| C1: Smallest | ❌ | 842 lines |
| C2: No layout editor | ❌ | Has full layout editor toggle + `layoutStorage` |
| C3: No POST mutation | ❌ | Plugin toggle via `apiService.POST` |
| C4: Standard PageHeader | ✅ | Uses `<PageHeader>` component |
| C5: OuterShellAdapter | ❌ | Inline styles on `page-root` (`flex: 1, overflow: auto`) need extraction |
| C6: No WorkspaceGrid rewrite | ✅ | No grid rewrite needed |
| C7: No contentRef rewrite | ✅ | No ref rewrite needed |
| C8: No behavior change | ✅ | Shell is purely presentational |

**Verdict: DEFERRED. Fails C2, C3, and C5. Inline styles on `page-root` add extraction work.**

### 3.4 Models (1,273 lines)

| Criterion | Result | Evidence |
|---|---|---|
| C1: Smallest | ❌ | 1,273 lines (largest candidate) |
| C2: No layout editor | ❌ | Same pattern |
| C3: No POST mutation | ❌ | Model create via `apiService.POST` |
| C4: Standard PageHeader | ❌ | Custom `summaryStrip` must be removed/replaced with `StatusStrip` |
| C5: OuterShellAdapter | ❌ | Requires `summaryStrip` removal + 16-card grid + specialized panels |
| C6: No WorkspaceGrid rewrite | ✅ | No grid rewrite needed |
| C7: No contentRef rewrite | ✅ | No ref rewrite needed |
| C8: No behavior change | ❌ | `summaryStrip` removal changes page layout |

**Verdict: DEFERRED to v7.54+. Too large, too custom, too risky for any P1/P2 pilot.**

---

## 4. Summary Matrix

| Page | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| Datasets | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | **Conditional** |
| Tasks | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | Deferred |
| PluginPool | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | Deferred |
| Models | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | Deferred v7.54+ |

---

## 5. Already Acceptable Pages

- **MemoryHubReadonly** — no `contentRef` or `WorkspaceGrid` usage
- **OpenAxiomReadonly** — no `contentRef` or `WorkspaceGrid` usage

These have no dependency on the `contentRef` → `WorkspaceGrid` → `PageShell` chain and
are already compatible with any shell migration approach.

---

## 6. Decision

1. **No strict pilot candidate exists** under the current criteria.
2. Datasets is the lowest-risk potential candidate but fails criteria C2 and C3.
3. **No entity page will be migrated in P1.**
4. A future **Datasets Conditional Pilot Plan** should define:
   - Safeguards to avoid/disable layout editor path during shell migration
   - No POST behavior changes
   - No API changes
   - No WorkspaceGrid rewrite
   - No contentRef rewrite
   - Visual-only outer shell proof
   - Rollback criteria
5. **No source code will be modified in P1.**
