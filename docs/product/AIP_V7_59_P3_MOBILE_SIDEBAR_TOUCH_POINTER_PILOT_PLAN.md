# AIP v7.59-P3 Mobile Sidebar Touch/Pointer Pilot Plan

**Phase:** v7.59-P3
**Type:** No-Code Pilot Plan
**Status:** PLAN COMPLETE — no implementation

---

## 1. Mission

Create a detailed no-code pilot plan for adding touch/pointer event support to the sidebar resizer. This plan documents the current event model, evaluates implementation options, defines pre-change baseline requirements, and establishes visual QA and rollback procedures.

---

## 2. Problem Statement

The sidebar resizer in `Layout.tsx:376-380` only handles `onMouseDown` → `mousemove`/`mouseup` window listeners. On touch devices:

| Device | Sidebar mode | Resizer functional? |
|---|---|---|
| Desktop (>900px) — mouse | Fixed | ✅ Yes |
| Desktop (>900px) — touch | Fixed | ❌ No (no pointer/touch handlers) |
| Tablet (768-900px) | Overlay (translateX + backdrop) | ❌ No (DOM present but not functional on touch) |
| Mobile (<768px) | Overlay (narrower) | ❌ Not applicable (overlay) |

Tablet users with touch input cannot resize the sidebar. This is the core gap.

---

## 3. Current Event Model

| Event | Handler | Location | Line |
|---|---|---|---|
| `onMouseDown` (React) | Inline → sets `dragState` | `Layout.tsx` | 376-380 |
| `mousemove` (window) | Inline `useEffect` | `Layout.tsx` | 149-153 |
| `mouseup` (window) | Inline `useEffect` | `Layout.tsx` | 155-158 |
| `touchstart` | ❌ MISSING | — | — |
| `touchmove` | ❌ MISSING | — | — |
| `touchend` | ❌ MISSING | — | — |
| `pointer` events | ❌ MISSING | — | — |

Resizer DOM element (line 373-381):
```tsx
<div className="sidebar-resizer" title="拖拽调整侧栏宽度"
  onMouseDown={(event) => {
    dragState.current = { active: true, startX: event.clientX, startWidth: sidebarWidth };
    document.body.classList.add('layout-resizing');
    event.preventDefault();
  }}
/>
```

Width bounds: `[220, 460]`, default `288px`. Persistence: localStorage `agi_layout_v2:global:sidebar_width`.

---

## 4. Selected Implementation Option

**Option A — Add Pointer Events** (recommended, see implementation options doc for full comparison)

| Field | Value |
|---|---|
| Approach | Add `onPointerDown` alongside `onMouseDown`; add `pointermove`/`pointerup` alongside `mousemove`/`mouseup` |
| Risk | Low — unified API, no branching for touch vs mouse |
| Lines changed | ~8 lines (add pointer handlers, no removal of mouse handlers) |
| QA required | Desktop mouse + touch device regression |

---

## 5. Scope Boundaries

| In scope | Out of scope |
|---|---|
| Pointer event support on resizer | Breakpoint changes |
| `pointermove`/`pointerup` cleanup | Sidebar toggle behavior change |
| Width persistence preservation | New sidebar entries |
| Desktop mouse regression check | Layout editor changes |
| Tablet touch resize (fixed mode) | Mobile overlay mode resize |
| | Stage C / feature flag / release / restore |
| | Build config or manualChunks |

---

## 6. Source Files Likely Involved (future implementation)

| File | Line(s) | Role |
|---|---|---|
| `Layout.tsx` | 148-165 (event listeners), 376-380 (resizer) | Add pointer handlers |
| `Layout.css` | 164-189 (`.sidebar-resizer`) | May need `touch-action: none` on mobile |
| `layoutStorage.ts` | 175-197 | Persistence (no change expected) |

---

## 7. Pre-Change Baseline Requirements

| # | Requirement | Status |
|---|---|---|
| 1 | `git status` clean before implementation | ⏳ Future |
| 2 | Current HEAD recorded | ⏳ Future |
| 3 | Desktop mouse resize works | ✅ Known good |
| 4 | `pnpm run typecheck` passing | ✅ Currently passing |
| 5 | `pnpm run build` passing | ✅ Exit 0 |
| 6 | `pnpm run lint` passing | ✅ 0 warnings |
| 7 | `git diff --check` | ✅ Clean |
| 8 | sidebarWidth persistence format confirmed | ✅ localStorage key `agi_layout_v2:global:sidebar_width` |
| 9 | No Stage C / feature flag / release / restore coupling | ✅ All preserved |

---

## 8. QA Requirements

| Scenario | Before | After | Method |
|---|---|---|---|
| Desktop mouse resize | Functional | Functional (unchanged) | Manual or Playwright |
| Desktop touch resize | Not possible | Functional (NEW) | Touch device / Chrome DevTools touch emulation |
| Tablet overlay toggle | Functional | Functional (unchanged) | Manual |
| Tablet touch resize (fixed mode >900px) | Not possible | Functional (NEW) | Touch device |
| Resizer visible/hidden per viewport | Correct | Correct (unchanged) | Visual |
| Console errors | None | None | DevTools |

---

## 9. Rollback Plan

```bash
git revert <commit-hash> --no-edit
pnpm run typecheck && pnpm run build && pnpm run lint
# Verify:
# - sidebarWidth persistence still works
# - Desktop mouse resize works
# - No console errors
git commit --amend --no-edit  # if tests pass
git push origin main
```

---

## 10. Decision

| Decision | Value |
|---|---|
| Implementation in P3 | NO |
| Selected option | A — Add pointer events |
| Deferred to | Future implementation phase (requires QA gate) |
