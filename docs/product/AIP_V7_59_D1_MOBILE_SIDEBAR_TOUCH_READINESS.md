# AIP v7.59-D1 Mobile Sidebar Touch Readiness

**Phase:** v7.59-D1
**Status:** READINESS PLAN — no implementation

---

## 1. Current State

| Aspect | Status |
|---|---|
| Resizer location | `apps/web-ui/src/components/Layout.tsx` (~lines 374-381) |
| Event handlers | `mousedown` / `mousemove` / `mouseup` only |
| Touch/pointer support | ❌ MISSING — `touchstart`, `touchmove`, `touchend`, `pointer` events all absent |
| Width bounds | [220, 460] pixels, default 288px |
| Persistence | localStorage key `agi_layout_v2:global:sidebar_width` |

---

## 2. Breakpoints

| Breakpoint | Sidebar mode | Resizer functional? |
|---|---|---|
| Desktop (> 900px) | Fixed sidebar | ✅ Yes (mouse) |
| Tablet (768-900px) | Overlay (translateX, backdrop) | ❌ No touch support |
| Mobile (< 768px) | Overlay (narrower: 240-260px) | ❌ Not applicable |

CSS breakpoints: 1024px, 900px, 768px, 700px, 480px  
TypeScript breakpoints: lg=1024, md=768, sm=0

---

## 3. Future Implementation Options

### Option A: Add Pointer Events
| Field | Value |
|---|---|
| Description | Replace/add `pointerdown`/`pointermove`/`pointerup` handlers alongside mouse events |
| Risk | Low — pointer events unify mouse and touch |
| Complexity | Low — similar API to mouse events |
| QA requirement | Desktop mouse + touch device regression check |

### Option B: Add Touch Events
| Field | Value |
|---|---|
| Description | Add `touchstart`/`touchmove`/`touchend` handlers |
| Risk | Low-Medium — touch events fire at 60fps on some devices, may need throttle |
| Complexity | Low |
| QA requirement | Touch device testing, scroll interference check |

### Option C: Disable Resizer on Mobile, Use Explicit Open/Close
| Field | Value |
|---|---|
| Description | Hide resizer DOM on viewports <= 900px via CSS `display: none` |
| Risk | Low |
| Complexity | Very Low |
| QA requirement | Verify resizer hidden on mobile, visible on desktop |
| Limitation | Tablet users lose ability to resize sidebar entirely |

### Option D: Defer, Document Desktop-Only Behavior
| Field | Value |
|---|---|
| Description | Keep current behavior; document that sidebar width adjustment is desktop-only |
| Risk | None |
| Complexity | None |
| QA requirement | None |
| Limitation | No improvement for tablet/mobile users |

---

## 4. Risk Comparison

| Option | Risk | Complexity | User Impact | Recommendation |
|---|---|---|---|---|
| A (Pointer events) | Low | Low | High (tablet/mobile gain resize) | ⭐ Preferred |
| B (Touch events) | Low-Medium | Low | High | Acceptable alternative |
| C (Disable on mobile) | Low | Very Low | Low-Medium (no change) | Fallback |
| D (Defer) | None | None | None (no change) | Current state |

---

## 5. Viewport QA Matrix

| Viewport | Before | After |
|---|---|---|
| Desktop (> 900px) — mouse | Resize functional | Resize functional (unchanged) |
| Desktop (> 900px) — touch | Not applicable | Resize functional (NEW) |
| Tablet (768-900px) | No resize | Resize functional (NEW for A/B) |
| Mobile (< 768px) | Overlay, no resize | Overlay, no resize (unchanged) |

---

## 6. Rollback Plan

```
git revert <commit-hash>
pnpm run typecheck && pnpm run build && pnpm run lint
# Verify sidebarWidth persistence still works
# Verify resizer works on desktop (mouse)
# Verify resizer remains functional on touch devices (if applicable)
```

---

## 7. No-Go Conditions

| Condition | Severity |
|---|---|
| No viewport QA before change | HARD NO-GO |
| SidebarWidth persistence broken | HARD NO-GO |
| Sidebar toggle behavior changed | HARD NO-GO |
| New console errors | HARD NO-GO |
| Tests fail | HARD NO-GO |
| Mouse resizer broken on desktop | HARD NO-GO |
| Hidden preview or sidebar exposed | HARD NO-GO |
| Stage C or feature flag changed same phase | HARD NO-GO |
