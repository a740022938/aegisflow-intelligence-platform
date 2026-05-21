# AIP v7.60-D1 Sidebar Pointer Implementation Blueprint

**Phase:** v7.60-D1
**Status:** BLUEPRINT DEFINED — no implementation

---

## 1. Target

| Field | Value |
|---|---|
| Target | Add pointer event support to sidebar resizer |
| Recommended approach | Option A — Add pointer events alongside existing mouse handlers |
| Source file | `apps/web-ui/src/components/Layout.tsx` |
| Candidate lines | 148-165 (window `mousemove`/`mouseup` listeners), 376-380 (resizer `onMouseDown`) |
| Line estimate | ~8 lines additive (no removal) |
| CSS optional | `touch-action: none` on `.sidebar-resizer` |
| Current storage key | `agi_layout_v2:global:sidebar_width` |
| Width range | [220, 460] pixels |
| Default width | 288px |

---

## 2. Implementation Authorization Required

| Requirement | Detail |
|---|---|
| Authorization form | Must be filled, signed, filed before implementation |
| Approved scope | Add pointer events to sidebar resizer only |
| Forbidden | Sidebar entry changes, hidden previews, Stage C, feature flags, release/restore, build config |
| Future receipt | Must list exact changed files and line ranges |

---

## 3. Pre-Change Baseline

| Item | Current value |
|---|---|
| Mouse resize | ✅ Functional at all desktop viewports |
| Touch resize | ❌ Not functional |
| Sidebar toggle | ✅ Functional |
| localStorage persistence | ✅ Key `agi_layout_v2:global:sidebar_width` |
| `pnpm run typecheck` | ✅ Passing |
| `pnpm run build` | ✅ Exit 0 |
| `pnpm run lint` | ✅ 0 warnings |

---

## 4. Visual QA Requirements

### Viewport Matrix

| Viewport | Pre-change | Post-change |
|---|---|---|
| 1440×900 (desktop mouse) | Resize works | Resize works (unchanged) |
| 1440×900 (desktop touch) | No resize | Resize works (NEW) |
| 1280×720 (desktop mouse) | Resize works | Resize works (unchanged) |
| 1024×768 (tablet landscape, touch) | No resize | Resize works (NEW) |
| 768×1024 (tablet portrait) | Overlay, no resize | Overlay, no resize (unchanged) |
| 390×844 (mobile) | Overlay, no resize | Overlay, no resize (unchanged) |

### Required Checks

| Check | Method |
|---|---|
| Desktop mouse drag | Manual — drag resizer, verify width changes and clamps |
| Touch drag (tablet landscape) | Chrome DevTools touch emulation or real device |
| Width persists on reload | Check localStorage key after resize + reload |
| Sidebar toggle (hamburger) | Click hamburger, verify open/close |
| Backdrop dismiss | Click backdrop, verify overlay closes |
| No console errors | DevTools console |
| Scroll not blocked | Scroll content area on touch device |

---

## 5. Rollback Plan

```bash
git revert <commit-hash> --no-edit
pnpm run typecheck && pnpm run build && pnpm run lint
# Verify mouse resize still works (regression check)
# Verify touch resize no longer works (restored to pre-change behavior)
```

---

## 6. No-Go Conditions

| Condition | Severity |
|---|---|
| Authorization form unfiled | HARD NO-GO |
| Pre-change baseline not captured | HARD NO-GO |
| Desktop mouse resize broken | HARD NO-GO |
| Sidebar toggle behavior changed | HARD NO-GO |
| localStorage key format changed | HARD NO-GO |
| New console errors | HARD NO-GO |
| Build fails | HARD NO-GO |
| Typecheck fails | HARD NO-GO |
| Stage C / feature flag / release / restore coupling | HARD NO-GO |
| Sidebar entries changed | HARD NO-GO |
| Hidden previews exposed | HARD NO-GO |
