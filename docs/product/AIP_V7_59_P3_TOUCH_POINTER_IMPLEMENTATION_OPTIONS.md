# AIP v7.59-P3 Touch/Pointer Implementation Options

**Phase:** v7.59-P3
**Status:** COMPLETED — no implementation

---

## Options Evaluated

### Option A: Add Pointer Events (⭐ RECOMMENDED)

| Field | Value |
|---|---|
| Description | Add `pointerdown`/`pointermove`/`pointerup` handlers alongside existing mouse handlers |
| Risk | **Low** — PointerEvent unifies mouse and touch. No branching needed. |
| Complexity | Low — ~8 lines added, 0 removed |
| Lines changed | ~8 (Layout.tsx) |
| CSS changes | Optional: `touch-action: none` on `.sidebar-resizer` |
| QA scope | Desktop mouse + touch device / DevTools touch emulation |
| Backward compat | ✅ Full — mouse events still work, pointer events are additive |
| Mobile overlay impact | Resizer DOM still present but hidden by overlay CSS; pointer events fire but have no visual effect (sidebar is translated offscreen). Acceptable. |

**Verdict:** Implement. Low risk, high user value for tablet users.

---

### Option B: Add Touch Events Alongside Mouse

| Field | Value |
|---|---|
| Description | Add `touchstart`/`touchmove`/`touchend` handlers and window listeners |
| Risk | Low-Medium — touch events fire at high frequency; need throttle on some devices |
| Complexity | Low-Medium — need to extract `event.touches[0].clientX` vs `event.clientX` |
| Lines changed | ~12-15 (more branching between touch and mouse) |
| CSS changes | `touch-action: none` required |
| Backward compat | ✅ Full |

**Verdict:** Acceptable but not preferred. Pointer events are the modern standard.

---

### Option C: Disable Drag-Resize on Mobile, Use Explicit Open/Close

| Field | Value |
|---|---|
| Description | Hide resizer DOM on viewports ≤900px via CSS `display: none` on `.sidebar-resizer` |
| Risk | **Low** |
| Complexity | Very Low — 1 CSS rule |
| User value | None (no new capability) |
| Limitation | Tablet users permanently lose ability to resize sidebar |

**Verdict:** Fallback only. Does not solve the problem.

---

### Option D: Leave Desktop-Only Behavior, Document Limitation

| Field | Value |
|---|---|
| Description | Keep current behavior; document sidebar width adjustment as desktop-only |
| Risk | None |
| Complexity | None |
| User value | None |
| Limitation | No improvement for tablet/mobile users |

**Verdict:** Current state. Not a forward-looking choice.

---

### Option E: Defer Implementation

| Field | Value |
|---|---|
| Description | Defer to a future phase when UI can be interactively tested |
| Risk | None |
| Rationale | Current mouse-only behavior is acceptable: mobile users use hamburger toggle, tablet users can navigate via overlay toggle |
| Recommendation | **Defer for now** — implement when visual QA on a real touch device is feasible |

**Verdict:** Defer is acceptable. The resizer is a convenience feature, not a functional blocker.

---

## Decision

| Field | Value |
|---|---|
| **Recommended option** | **A — Add pointer events** |
| **Implementation timing** | **DEFERRED** to future phase (requires QA gate) |
| Recommended alternative | E — Defer (current state) is acceptable interim |
| Risk for Option A | Low |
| Expected user impact | Medium — tablet users gain sidebar resize capability |
