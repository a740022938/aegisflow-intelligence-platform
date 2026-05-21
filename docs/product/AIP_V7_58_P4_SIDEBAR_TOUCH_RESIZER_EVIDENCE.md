# AIP v7.58-P4 Sidebar Touch Resizer Evidence

**Phase:** v7.58-P4
**Type:** Read-Only Evidence
**Status:** COMPLETED

---

## 1. Resizer Location

**File:** `apps/web-ui/src/components/Layout.tsx` (lines ~374-381)

```tsx
// Layout.tsx sidebar resizer
<div className="sidebar-resizer" onMouseDown={handleResizerMouseDown} />
```

---

## 2. Event Handler Details

| Event | Handler | Line (approx) | Behavior |
|---|---|---|---|
| `mousedown` | `handleResizerMouseDown` | 376 | Captures `event.clientX`, sets drag state, adds `layout-resizing` class |
| `mousemove` | Inline `useEffect` | 149-153 | Calculates width delta, clamps to [220, 460], applies `sidebarWidth` state |
| `mouseup` | Inline `useEffect` | 155-158 | Ends drag, removes `layout-resizing` class, saves width to localStorage |
| `touchstart` | **MISSING** | — | Not implemented |
| `touchmove` | **MISSING** | — | Not implemented |
| `touchend` | **MISSING** | — | Not implemented |
| `pointer` events | **MISSING** | — | Not implemented |

---

## 3. Width Bounds

| Bound | Value |
|---|---|
| Minimum | 220px |
| Maximum | 460px |
| Default | 288px |

These are hardcoded in the drag handler and the `loadSidebarWidth()` default.

---

## 4. Persistence

| Mechanism | Key | Location |
|---|---|---|
| `localStorage` | `agi_layout_v2:global:sidebar_width` | `layoutStorage.ts` (lines 175-197) |

---

## 5. CSS Sidebar States by Viewport

| Viewport | Sidebar mode | Resizer visible? | Resizer functional? |
|---|---|---|---|
| Desktop (> 900px) | Fixed sidebar | ✅ Yes | ✅ Yes (mouse) |
| Tablet (768-900px) | Overlay (translateX, backdrop) | ✅ DOM present, hidden by overlay | ❌ Not on touch |
| Mobile (< 768px) | Overlay (narrower: 260px/240px) | ✅ DOM present, hidden by overlay | ❌ Not applicable |

---

## 6. No-Go Conditions for Touch Resizer Implementation

- Must not break existing mouse-based resizer behavior
- Must not change sidebarWidth persistence format
- Must be tested on both touch and non-touch devices
- Must not introduce pointer event conflicts with other UI elements
- Must work correctly when sidebar is in overlay mode (tablet)
- Visual QA required: before/after screenshots at desktop, tablet, mobile viewports

---

## 7. Recommendation

Adding touch/pointer event handlers to the sidebar resizer is low-complexity but requires visual QA on actual touch devices. Defer to a future phase when UI can be interactively tested. The current mouse-only behavior is acceptable because:
- Mobile users interact via hamburger toggle (overlay sidebar)
- Tablet users can still access all navigation items via overlay toggle
- The resizer is a convenience feature, not a functional blocker
