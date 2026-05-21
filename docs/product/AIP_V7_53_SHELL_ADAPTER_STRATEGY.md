# AIP v7.53-D1 ShellAdapter Strategy

**Date:** 2026-05-21  
**Baseline:** v7.53-D0 Deferred Complexity Inventory (`be67d63`)

---

## 1. Problem

The `useResponsiveLayoutMode` hook attaches a `contentRef` to the page's outer container. Replacing that container with `<PageShell>` would orphan the ref, breaking `ResizeObserver` width measurement and disabling responsive layout switching in `WorkspaceGrid`.

## 2. Solution: OuterShellAdapter

A lightweight wrapper component that separates the outer shell (PageShell) from the inner measured container (adapter-content).

### 2.1 Component Design

```tsx
interface OuterShellAdapterProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  maturity?: 'stable' | 'preview' | 'lab' | 'external' | 'archived';
  safetyBoundary?: SafetyBoundaryMode;
  safetyText?: string;
  statusStripItems?: StatusStripItem[];
  children: React.ReactNode;
  // forwarded from useResponsiveLayoutMode
  contentRef: React.RefObject<HTMLDivElement | null>;
}
```

### 2.2 Implementation Sketch

```tsx
import { PageShell, StatusStrip } from './ui';
import type { StatusStripItem } from './ui/StatusStrip';
import type { SafetyBoundaryMode } from './ui/SafetyBoundaryBar';

export function OuterShellAdapter({
  title, subtitle, actions,
  maturity, safetyBoundary, safetyText,
  statusStripItems,
  contentRef,
  children,
}: OuterShellAdapterProps) {
  return (
    <PageShell
      title={title}
      subtitle={subtitle}
      actions={actions}
      maturity={maturity}
      safetyBoundary={safetyBoundary}
      safetyText={safetyText}
    >
      {statusStripItems && statusStripItems.length > 0 && (
        <StatusStrip items={statusStripItems} />
      )}
      <div ref={contentRef} className="adapter-content" style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
      }}>
        {children}
      </div>
    </PageShell>
  );
}
```

### 2.3 Migration Pattern for Target Pages

**Before:**
```tsx
function Page() {
  const { contentRef, contentWidth, shouldUseLayoutEditor, ... } = useResponsiveLayoutMode();
  return (
    <div className="page-root" ref={contentRef}>
      <PageHeader title="..." subtitle="..." />
      <div className="page-content">
        <WorkspaceGrid ... />
      </div>
    </div>
  );
}
```

**After:**
```tsx
function Page() {
  const { contentRef, contentWidth, shouldUseLayoutEditor, ... } = useResponsiveLayoutMode();
  return (
    <OuterShellAdapter
      title="..."
      subtitle="..."
      contentRef={contentRef}
      statusStripItems={[...]}
    >
      <div className="page-content">
        <WorkspaceGrid ... />
      </div>
    </OuterShellAdapter>
  );
}
```

### 2.4 What Changes and What Stays

| Aspect | Before | After | Behavioral change? |
|---|---|---|---|
| Outer container | `<div className="page-root">` | `<PageShell>` root | Visual: yes (PageShell adds SafetyBoundaryBar, version label, maturity badge) |
| contentRef target | page-root div | adapter-content div (inside PageShell's children slot) | **No** — same ResizeObserver, same width measurement |
| PageHeader | Manual | Via PageShell (title/subtitle props) | **No** — same content |
| StatusStrip | None or custom inline | Via adapter prop | **Yes** — adds consistent summary bar |
| Filter bar / Entity list | Inside page-content | Inside adapter-content | **No** — same DOM position relative to WorkspaceGrid |
| WorkspaceGrid | Inside page-content | Inside adapter-content | **No** — same position, same width measurement |
| Overflow/scroll | page-root (`overflow: auto`) | adapter-content (`overflow: auto` via style or CSS) | **No** — same scroll behavior |

### 2.5 Verification Checklist

After migration:
- [ ] `contentRef.current` points to a real DOM element
- [ ] `ResizeObserver` fires on window resize
- [ ] `contentWidth` matches previous value at equivalent viewport
- [ ] `canUseLayoutEditor` toggles at breakpoint
- [ ] WorkspaceGrid renders in correct layout mode (css-grid vs react-grid vs mobile)
- [ ] Layout editor toggle works (for PluginPool)
- [ ] Layout persists across page reload (localStorage save/load)
- [ ] No visual regression in filter/entity list/detail panels
- [ ] No scroll regression (page should scroll as before)

---

## 3. Why Not Modify PageShell Internally

Adding `ref` forwarding to PageShell was considered but rejected:

| Approach | Problem |
|---|---|
| `React.forwardRef` on PageShell | PageShell wraps content in a nested `<div className="page-shell-content">`. Forwarding ref would point to the outer shell-root, not to the content area where WorkspaceGrid lives. |
| Adding `contentRef` prop to PageShell | Creates a PageShell API surface specifically for this use case — not general-purpose. Better to keep PageShell clean and let the adapter handle the concern. |
| Merging `useResponsiveLayoutMode` into PageShell | Too invasive. The hook is used by 11 pages (many not deferred). Would require retesting all 11. |

---

## 4. Relationship to Existing Pages

| Page | Current shell | After OuterShellAdapter | Priority |
|---|---|---|---|
| Datasets | `page-root` + PageHeader | PageShell + StatusStrip + adapter-content | P4 pilot |
| Tasks | `page-root` + PageHeader | PageShell + StatusStrip + adapter-content | P4 alt |
| PluginPool | `page-root` + PageHeader | PageShell + StatusStrip + adapter-content | P4 alt |
| Models | `page-root` + PageHeader | PageShell + StatusStrip + adapter-content | P5+ (needs summaryStrip removal first) |

Pages that already use PageShell (Dashboard, FactoryStatus, CostRouting, Approvals, Audit, Feedback, WorkflowCanvas) do NOT use `contentRef` and need no adapter.

---

## 5. Safety

- The adapter is a pure presentational wrapper — no data flow changes
- No new API calls, mutations, or event handlers
- All existing state, effects, and callbacks remain untouched
- WorkspaceGrid and its dependencies operate identically to before
