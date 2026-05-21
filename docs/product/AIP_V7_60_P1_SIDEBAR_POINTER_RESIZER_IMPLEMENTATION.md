# AIP v7.60-P1 Sidebar Pointer Resizer Implementation

**Phase:** v7.60-P1
**Type:** Source-Code Implementation (Low-Risk)
**Status:** IMPLEMENTATION COMPLETE

---

## 1. Mission

Implement the first low-risk source-code slice: add pointer event support to the sidebar resizer while preserving existing mouse behavior and sidebar width persistence.

---

## 2. Implementation Summary

| Field | Value |
|---|---|
| Approved file | `apps/web-ui/src/components/Layout.tsx` |
| Changed file | `apps/web-ui/src/components/Layout.tsx` (+15 lines) |
| Other files modified | NONE |
| Build config modified | NONE |
| Approach | Add pointer handlers alongside existing mouse handlers |

---

## 3. Changes Made

### Change 1: Window-level pointer event listeners (Layout.tsx:148-178)
Added `onPointerMove` handler (typed for PointerEvent) and `pointermove`/`pointerup` window listeners alongside existing `mousemove`/`mouseup` listeners. The `onPointerMove` function has identical logic to `onMove` (width clamp `[220, 460]`, `setSidebarWidth(next)`). The `onUp` handler is reused for both `mouseup` and `pointerup` since it takes no parameters. Cleanup is added for both new listeners.

### Change 2: Resizer pointer down handler (Layout.tsx:388-393)
Added `onPointerDown` handler on the sidebar resizer `<div>` alongside existing `onMouseDown`. Both handlers have identical inline logic: set `dragState.current`, add `layout-resizing` class, `event.preventDefault()`.

### Safety design
- On desktop: PointerEvent fires before MouseEvent. The `dragState.current.active` guard catches the second event, preventing double-handling.
- On touch: Only PointerEvent fires. MouseEvent does not fire from touch input, so touch devices gain resize capability.
- Width range [220, 460] and localStorage key `agi_layout_v2:global:sidebar_width` are unchanged.
