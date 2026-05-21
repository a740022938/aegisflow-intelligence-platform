# AIP v7.54-P4 Adapter Rulebook Final

**Date:** 2026-05-21
**Pre-HEAD:** `d5d3cf7`
**Derived from:** v7.54-D1/P1/P2/P3 Datasets shell pilot

---

## 1. Datasets Pilot Summary

The Datasets shell pilot proved that a **constrained outer-shell adapter pattern**
can safely wrap an existing entity-management page with `PageShell` and
`StatusStrip` while preserving all business logic, data flow, and responsive
layout behavior.

| Phase | Verdict | Key Action |
|---|---|---|
| D1 | `CONDITIONAL_GO` | Inventory + acceptance criteria + rollback plan |
| P1 | `SHELL_PILOT_READY_WITH_VISUAL_QA_DEFERRED` | ~29-line code change: PageShell wrapper, inner page-root, StatusStrip |
| P2 | `VISUAL_QA_ACCEPTED` | 5-viewport screenshots + Playwright DOM analysis |
| P3 | `RETROSPECTIVE_READY_WITH_LIMITED_REUSABLE_RULES` | Retrospective + 5 reusable rules |

---

## 2. What Was Proven

- `PageShell` can wrap an entity-management page safely when:
  - `contentRef` is preserved on the **inner** `<div className="page-root">`
  - The existing `WorkspaceGrid` remains unchanged
  - `StatusStrip` is added without mutating business behavior
- 4 POST mutations coexisted safely with the shell wrapper (no mutation was
  changed, added, or removed)
- Visual QA via 5 viewports and Playwright DOM analysis is sufficient to
  detect layout regression
- A D1-style inventory + acceptance criteria + rollback plan is a viable
  pre-migration workflow

---

## 3. What Was NOT Proven

- ❌ WorkflowComposer migration — ReactFlow canvas, state machine, undo/redo
- ❌ GovernanceHub migration — recover/resolve/confirm actions
- ❌ Pages with heavy POST mutations (5+ endpoints with complex side effects)
- ❌ Pages with complex canvas/state machines (e.g., PluginCanvas)
- ❌ Pages with WorkspaceGrid + layout editor + unverified mutation coupling
- ❌ Pages with auto-sync or background polling that could conflict with shell
- ❌ Broad migration across all entity pages without individual D1-style
  inventories

---

## 4. Required Adapter Pattern

```tsx
<PageShell title="..." subtitle="..." actions={...}>
  <StatusStrip items={[
    { label: '...', value: '...' },
    ...
  ]} />
  <div className="page-root" ref={contentRef}
       style={{ display: 'block', height: 'auto', overflow: 'visible' }}>
    {/* Original content tree — unchanged */}
  </div>
</PageShell>
```

### Requirements
- `contentRef` must remain on the inner `<div className="page-root">`
- Original CSS class `page-root` must be preserved (used by descendant selectors)
- Inline style must not affect width (only height/overflow)
- All `apiService.*` calls must be identical
- `WorkspaceGrid` props must be identical
- All POST mutations must be identical in count, URL, method, and payload

---

## 5. Forbidden Adapter Pattern

- ❌ Wrapping `contentRef` onto `PageShell` or any outer element
- ❌ Removing `page-root` CSS class from the inner div
- ❌ Modifying `WorkspaceGrid` rendering or card definitions
- ❌ Modifying any `apiService.*` call signature
- ❌ Adding new buttons, actions, or destructive controls
- ❌ Changing POST mutation semantics
- ❌ Adding sidebar entries or exposing hidden preview routes

---

## 6. Risk Tags

| Tag | Meaning | Required Evidence Before Migration |
|---|---|---|
| `SAFE_REFERENCE` | Already acceptable; no migration needed | — |
| `CONDITIONAL_PILOT` | May migrate with conditions | D1 inventory + acceptance criteria + rollback + visual QA |
| `PLAN_ONLY` | Too complex for immediate migration | D1 inventory only; no code change |
| `NO_GO` | Cannot be safely migrated | Documented reason; no code change |
| `HIDDEN_STUB` | Hidden/unused stub; no action | — |

---

## 7. Minimum Validation Commands

Every migration commit must pass all of:

```powershell
pnpm run typecheck
pnpm run build
pnpm run lint
git diff --check
```

- typecheck: zero errors
- build: zero errors (non-blocking chunk size warning acceptable)
- lint: zero warnings/errors
- git diff --check: zero whitespace errors

---

## 8. Required Visual Evidence

Every shell pilot commit (P1-equivalent) must produce:

- At least 5 viewport screenshots (1440×900, 1280×720, 1024×768, 768×1024, 390×844)
- DOM analysis confirming PageShell, page-root, StatusStrip, WorkspaceGrid
- Console error count = 0 or explicitly justified
- No debug leaks (stale placeholders, raw refs)
- Screenshots stored externally (not committed to repo)

Visual QA may be deferred from P1 to P2, but **must** be executed before final
acceptance seal.
