# AIP v7.59-P3 Sidebar Event Model Readiness

**Phase:** v7.59-P3
**Status:** READINESS PLAN — no implementation

---

## 1. Current Event Model

### Resizer DOM (Layout.tsx:373-381)
```tsx
<div className="sidebar-resizer" title="拖拽调整侧栏宽度"
  onMouseDown={(event) => {
    dragState.current = { active: true, startX: event.clientX, startWidth: sidebarWidth };
    document.body.classList.add('layout-resizing');
    event.preventDefault();
  }}
/>
```

### Window-level listeners (Layout.tsx:148-165)
```tsx
useEffect(() => {
  const onMove = (event: MouseEvent) => {
    if (!dragState.current.active) return;
    const delta = event.clientX - dragState.current.startX;
    const next = Math.max(220, Math.min(460, dragState.current.startWidth + delta));
    setSidebarWidth(next);
  };
  const onUp = () => {
    dragState.current.active = false;
    document.body.classList.remove('layout-resizing');
  };
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  return () => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  };
}, []);
```

### Drag state (useRef)
```tsx
const dragState = useRef<{ active: boolean; startX: number; startWidth: number }>({
  active: false, startX: 0, startWidth: 288,
});
```

---

## 2. Gaps vs Touch/Pointer Support

| Gap | Detail | Risk |
|---|---|---|
| No `onPointerDown` | Touch devices never trigger `onMouseDown` on first touch | Touch resize non-functional |
| No `pointermove` listener | Touch drag never tracked | No width update |
| No `pointerup` listener | Touch drag never finalized | Width never saved |
| No `touch-action: none` | Browser may intercept touch for scrolling | Scroll vs resize conflict |
| No passive listener consideration | Default listeners are passive-safe already | Low |

---

## 3. Upgrade Path

### Minimal change (add pointer events alongside mouse):
```tsx
// onPointerDown handler (same logic as onMouseDown)
onPointerDown={(event) => {
  dragState.current = { active: true, startX: event.clientX, startWidth: sidebarWidth };
  document.body.classList.add('layout-resizing');
  event.preventDefault();
}}

// In useEffect:
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);
```

### No removal needed:
Mouse events still fire on desktop. Pointer events fire on both touch and mouse. Adding both without removing any is safe — on desktop, both fire, but the second one is a no-op because `dragState.current.active` is already `true`.

---

## 4. Verified Safe Properties

| Property | Status |
|---|---|
| `clientX` available on PointerEvent | ✅ Yes (extends MouseEvent) |
| `event.preventDefault()` works | ✅ Yes |
| `layout-resizing` body class | ✅ Preserved |
| Width bounds [220, 460] | ✅ Unchanged |
| localStorage persistence | ✅ Unchanged |
| Desktop mouse | ✅ Unchanged (backward compatible) |
