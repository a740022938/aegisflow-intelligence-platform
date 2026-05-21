# AIP v7.53-D1 contentRef + WorkspaceGrid Migration Blueprint

**Date:** 2026-05-21  
**Baseline:** v7.53-D0 Deferred Complexity Inventory (`be67d63`)  
**Package:** v7.53-D0→P5 Engineering Total Pack  

---

## 1. Problem Statement

4 of 8 deferred pages (Tasks, Models, Datasets, PluginPool) share a common architectural dependency that blocks PageShell migration:

- `contentRef` from `useResponsiveLayoutMode()` measures container width via `ResizeObserver`
- `WorkspaceGrid` depends on that measured width to select layout mode (lg/md/sm)
- The hook's `contentRef` is attached to the current `page-root` container

Replacing `page-root` with `PageShell` breaks this chain unless the ref is preserved on the inner content area.

---

## 2. How contentRef Works

### 2.1 Hook Mechanism

`useResponsiveLayoutMode(breakpoint = 1200)` in `src/hooks/useResponsiveLayoutMode.ts`:

```typescript
const contentRef = useRef<HTMLDivElement | null>(null);

// ResizeObserver watches the ref's contentRect.width
useEffect(() => {
  const el = contentRef.current;
  if (!el) return;
  const observer = new ResizeObserver((entries) => {
    const w = entries[0]?.contentRect?.width;
    if (w && w > 0) setContentWidth(w);
  });
  observer.observe(el);
  setContentWidth(el.getBoundingClientRect().width);
  return () => observer.disconnect();
}, []);
```

### 2.2 Where contentRef Is Attached

| Page | Element with ref | Classes on element |
|---|---|---|
| Tasks | `<div className="tsk-root" ref={contentRef}>` | `tsk-root` (custom, TaskPage.css) |
| Models | `<div className="page-root" ref={contentRef}>` | `page-root` (shared.css) |
| Datasets | `<div className="page-root" ref={contentRef}>` | `page-root` (shared.css) |
| PluginPool | `<div className="page-root" style={{ flex: 1, overflow: 'auto' }} ref={contentRef}>` | `page-root` + inline styles |

### 2.3 What contentWidth Drives

- `canUseLayoutEditor = contentWidth >= breakpoint` (1200px default)
- `shouldUseLayoutEditor = layoutEdit && canUseLayoutEditor`
- Choose between `react-grid-edit`, `css-grid`, or mobile layout
- Auto-exit edit mode when content shrinks below breakpoint

---

## 3. How WorkspaceGrid Is Coupled

### 3.1 WorkspaceGrid Dependencies

`WorkspaceGrid` (in `src/layout/WorkspaceGrid.tsx`) depends on:

1. **Layout configuration**: `layouts` prop (lg/md/sm breakpoint presets with grid item positions/sizes)
2. **Card content**: `cards` prop (array of `{ id, content }`)
3. **Editable toggle**: optional `editable` prop enabling drag/resize via `react-grid-layout`
4. **Content width**: indirectly via `shouldUseLayoutEditor` from the hook, which gates whether react-grid-layout replaces CSS grid

### 3.2 Coupling Points

| Coupling | Details |
|---|---|
| Layout persistence | Layouts saved to `localStorage` via `layoutStorage.saveLayout()` |
| Layout restore | Layouts loaded from `localStorage` via `layoutStorage.loadLayout()`, fallback to `DEFAULT_LAYOUTS` |
| Resize coupling | `useResponsiveLayoutMode` auto-exits edit mode when width < breakpoint |
| DOM coupling | WorkspaceGrid renders inside the element with `contentRef` — width measured on the outer container |
| CSS coupling | CSS grid fallback (non-edit) uses the container's computed width for column sizing |

### 3.3 Per-Page WorkspaceGrid Usage

| Page | Cards | Layouts defined (lg/md/sm) | Layout editor |
|---|---|---|---|
| Tasks | 8 (task_summary, current_execution, pipeline_links, vision_surface, errors_recovery, related_outputs, mainline_chain, logs_raw) | lg, md, sm | NO |
| Models | 16 (identity, source_lineage, package_export, release_candidate, artifact_report, release_governance, etc.) | lg only | NO |
| Datasets | 8 (identity, type_status, sample_stats, path_info, time_info, description, mainline_chain, related_objects) | lg, md, sm | NO |
| PluginPool | 9 (stats_overview, trial_warning, quick_actions, active_plugins, trial_plugins, frozen_plugins, execution_stats, capability_breakdown, risk_distribution) | lg, md, sm | **YES** (editable toggle) |

---

## 4. Why Direct PageShell Migration Is Risky

### 4.1 Risk Analysis

| Concern | Impact | Pages affected |
|---|---|---|
| `contentRef` disappears | `contentWidth = 1200` (default) → layout mode becomes static | Tasks, Models, Datasets, PluginPool |
| ResizeObserver breaks | No responsive layout switching on window resize | Tasks, Models, Datasets, PluginPool |
| Layout editor gate fails | `canUseLayoutEditor` stays `true` or `false` irrespective of real width | PluginPool (has editor) |
| CSS grid fallback breaks | Grid column count detects wrong container width | Tasks, Models, Datasets, PluginPool |
| `overflow: auto` lost | `page-root` provides `overflow: auto` for scrollable content — PageShell provides this through its own CSS but may not match exactly | All 4 |
| `min-width: 0 / max-width: 100%` lost | PageShell uses its own box model — content width constraints may differ | All 4 |

### 4.2 Manifestation in PluginPool (worst case)

PluginPool has a `layoutEdit` toggle that disables itself when `canUseLayoutEditor` is false. If `contentRef` breaks, the user might see:
- Layout edit button always active (if width defaults to 1200+) → unexpected behavior
- Layout edit button always inactive (if width defaults to 0) → feature loss
- Resize during edit mode not updating contentWidth → sticky stuck states

---

## 5. OuterShellAdapter Strategy

### 5.1 Design

```text
┌──────────────────────────────────┐
│  PageShell                       │  ← Outer shell: title, subtitle, safety boundary
│  ┌────────────────────────────┐  │
│  │  StatusStrip               │  │  ← Summary metrics
│  ├────────────────────────────┤  │
│  │  <div ref={contentRef}>    │  │  ← Inner adapter: preserves existing contentRef
│  │  ┌──────────────────────┐  │  │
│  │  │  FilterBar (if any)  │  │  │
│  │  ├──────────────────────┤  │  │
│  │  │  EntityList / Table  │  │  │
│  │  ├──────────────────────┤  │  │
│  │  │  WorkspaceGrid       │  │  │
│  │  │  (existing, unmodified)│  │  │
│  │  └──────────────────────┘  │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

### 5.2 Implementation Approach

**Step 1 (safe, docs-only):** Define an `OuterShellAdapter` component that:
- Wraps children in `<PageShell>`
- Provides a `contentRef` that can be passed through or assigned to inner content
- Keeps all existing page logic unchanged

**Step 2 (pilot):** For a target page (e.g., Datasets as smallest):
- Import `OuterShellAdapter`
- Replace `<div className="page-root" ref={contentRef}>` opener with `<OuterShellAdapter>`
- Move `ref` from the adapter root to the adapter's inner content div
- Keep all filter/list/WorkspaceGrid code unchanged

**Step 3 (behavior check):** Verify:
- `contentRef.current.offsetWidth` matches previous page-root width
- `contentWidth` drives layout mode correctly
- `ResizeObserver` fires on window resize
- No layout shift or scroll issues

### 5.3 OuterShellAdapter Component Shape

```tsx
// Proposed — NOT yet implemented
function OuterShellAdapter({
  title, subtitle, actions,
  statusStripItems,
  children,
  contentRef,  // forwarded from useResponsiveLayoutMode
}: OuterShellAdapterProps) {
  return (
    <PageShell title={title} subtitle={subtitle} actions={actions}>
      {statusStripItems && <StatusStrip items={statusStripItems} />}
      <div ref={contentRef} className="adapter-content">
        {children}
      </div>
    </PageShell>
  );
}
```

### 5.4 No-Go Alternatives

| Alternative | Why rejected |
|---|---|
| Delete WorkspaceGrid and replace with static layout | Breaks existing UX behavior |
| Replace `useResponsiveLayoutMode` with pure CSS queries | Requires rewriting all 4 pages' layout logic |
| Add `contentRef` to PageShell internals via prop forwarding | PageShell does not accept a forwarded ref — would need modification |
| Move all 4 pages in one commit | Too risky — individual validation needed per page |

---

## 6. Pages Eligible for Future Pilot

After D1 analysis, re-ranking with the OuterShellAdapter approach:

| Rank | Page | Lines | contentRef | WkspcGrid | Mutation | Pilot viability |
|---|---|---|---|---|---|---|
| 1 | **Datasets** | 687 | YES | YES | Dataset create | **Best candidate** — smallest entity page, standard PageHeader, 8 WorkspaceGrid cards, no layout editor |
| 2 | PluginPool | 842 | YES | YES | Plugin toggle | **Conditional** — auth state and layout editor add risk, but adapter strategy mitigates |
| 3 | Tasks | 822 | YES | YES | Task create | **Conditional** — similar risk to Datasets |
| 4 | WorkflowJobs | 1,232 | NO | NO | Learned rules | **Moved to plan-only** — no contentRef concern, but POST mutation risk needs safety boundary per v7.53-D0 finding |

---

## 7. Pages That Must Remain Deferred

| Page | Reason |
|---|---|
| **Models** (1,273 lines) | Largest entity page, custom `summaryStrip` (needs removal), 16 WorkspaceGrid cards, only lg layout defined. Migration requires summaryStrip refactor + contentRef adapter. |
| **WorkflowComposer** (11,417 lines) | Canvas state machine. No contentRef/WorkspaceGrid dependency, but completely custom architecture. No-go until v7.54+. |
| **GovernanceHub** (991 lines) | 6 POST operations, no contentRef. Blocked by operational safety boundary, not by technical layout dependency. Needs P3 review first. |

---

## 8. POST Mutation Safety Rules

Pages with POST mutations can still receive shell-only migrations **if** the mutation code is untouched and the shell is purely presentational.

### 8.1 Safety Contract

```
Rule 1: Shell MUST NOT wrap mutation buttons inside safety boundaries
        (e.g., SafetyBoundaryBar="readonly" must not be used on mutation pages)

Rule 2: Shell MUST NOT change event propagation of mutation handlers
        (mouse/keyboard events must reach the same handlers as before)

Rule 3: Shell MUST NOT add/remove confirm dialogs for existing mutations

Rule 4: Shell MAY add StatusStrip to display read-only metrics
        (counts, status summaries — no mutation triggers in StatusStrip)

Rule 5: Shell MUST keep all API call URLs, methods, and headers unchanged

Rule 6: Shell MUST NOT introduce AuthRequiredState where it didn't exist
        (PluginPool already has it — that's fine. Don't add it to pages that don't.)
```

### 8.2 Per-Page Mutation Audit Summary

| Page | Endpoints | Method | Mutation | Shell-safe? |
|---|---|---|---|---|
| GovernanceHub | `/incidents/:id/run-playbook`, `/incidents/:id/approve-assistant`, `/incidents/:id/status`, `/incidents/:id/actions`, `/incidents/:id/assign` | POST | Incident state | **NO** — too many operational actions |
| WorkflowJobs | `/learned-rules/:id/enable`, `/learned-rules/:id/disable` | POST | Rule state | **YES** — shell-safe if no safety boundary added and buttons unchanged |
| PluginPool | plugin enable/disable (via fetch with POST) | POST | Plugin state | **YES** — shell-safe if existing auth/error state unchanged |
| Tasks | Task create (via apiService) | POST | Task creation | **YES** — shell-safe |
| Datasets | Dataset create (via apiService) | POST | Dataset creation | **YES** — shell-safe |
| Models | Model create | POST | Model creation | **YES** — shell-safe (not modifying create behavior) |

### 8.3 GovernanceHub Specific Safety Boundary

GovernanceHub MUST NOT receive shell migration until:
1. Its 6 POST operations are reviewed by P3 GovernanceHub Safety Boundary Review
2. A clear readonly/operational split is documented
3. All existing incident/playbook mutating buttons remain unchanged

---

## 9. D1 → P5 Route Update

| Phase | Focus | Key Output |
|---|---|---|
| **D1** | contentRef + WorkspaceGrid blueprint | ✅ This doc |
| **P1** | Entity Pages Refactor Plan | `AIP_V7_53_P1_ENTITY_PAGES_REFACTOR_PLAN.md` |
| **P2** | Workflow Complexity Split Plan | `AIP_V7_53_P2_WORKFLOW_COMPLEXITY_SPLIT_PLAN.md` |
| **P3** | GovernanceHub Safety Boundary Review | `AIP_V7_53_P3_GOVERNANCE_HUB_SAFETY_BOUNDARY_REVIEW.md` |
| **P4** | Low-Risk Deferred Page Pilot (candidate: Datasets) | `AIP_V7_53_P4_LOW_RISK_DEFERRED_PAGE_PILOT_RESULT.md` |
| **P5** | Final Deferred Complexity Recheck | Full validation |

**Updated:** WorkflowJobs moved from pilot candidate to plan-only (POST mutation risk).  
**Updated:** Datasets promoted to primary pilot candidate (smallest entity page with contentRef, no layout editor).  
**Updated:** PluginPool remains secondary pilot candidate (layout editor + auth state adds complexity).
