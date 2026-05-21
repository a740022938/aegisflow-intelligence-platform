# AIP v7.60-P3 Touch Pointer Limitation Classification

**Phase:** v7.60-P3
**Status:** CLASSIFIED

---

## Classification

**`NON_BLOCKING_LIMITED_EVIDENCE`** + **`REQUIRES_PHYSICAL_DEVICE_FOLLOWUP`**

---

## Reasoning

### 1. Desktop Mouse Resize — PASS (verified)
- P2 evidence: 220→320→220 px
- P3 recheck: 220→300→220 px (confirmed still working)
- Width range [220, 460] enforced
- No console errors during resize

### 2. Pointer Implementation Code Review — PASS (verified)
- `onPointerDown` added to resizer div alongside `onMouseDown`
- `pointermove`/`pointerup` window listeners added alongside `mousemove`/`mouseup`
- `dragState.current.active` flag prevents double-handling when both PointerEvent and MouseEvent fire (PointerEvent fires first on desktop)
- `layout-resizing` class cleaned up after pointer up

### 3. Headless Chromium Limitation — EXPLAINED
- Headless Chromium cannot dispatch true PointerEvents from touch
- Mouse events in Playwright trigger both pointer and mouse events, which exercises the same code path
- True touch-and-drag testing requires either a physical touchscreen device or Chrome DevTools Protocol touch emulation with pointer event dispatch

### 4. No Observable Defects
- No console errors from P1 code
- No stuck dragging state
- No layout breakage
- No hidden preview exposure

### 5. Evidence Gap — DOCUMENTED
- Touch-initiated resize via pointer events not exercised on physical touch hardware
- Code path is functionally identical to mouse resize (same `onPointerMove` logic, same width clamp, same cleanup)
- Risk of regression on touch devices is LOW

---

## Decision

| Field | Value |
|---|---|
| Blocks implementation seal | ❌ NO |
| Physical touch follow-up required | ✅ RECOMMENDED but not blocking |
| P4 seal status | SEAL READY WITH LIMITATION NOTED |
