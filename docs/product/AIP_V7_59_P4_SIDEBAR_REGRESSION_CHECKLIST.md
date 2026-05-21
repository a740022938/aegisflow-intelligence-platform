# AIP v7.59-P4 Sidebar Regression Checklist

**Phase:** v7.59-P4
**Status:** DEFINED

---

## Pre-Implementation Checks (baseline)

| # | Check | Method | Pass/Fail |
|---|---|---|---|
| 1 | `git status` clean | CLI | ⏳ |
| 2 | Current HEAD recorded | CLI | ⏳ |
| 3 | `pnpm run typecheck` | CLI | ⏳ |
| 4 | `pnpm run build` | CLI | ⏳ |
| 5 | `pnpm run lint` | CLI | ⏳ |
| 6 | `git diff --check` | CLI | ⏳ |
| 7 | Desktop mouse resize works | Manual | ⏳ |
| 8 | sidebarWidth persists (localStorage) | DevTools | ⏳ |
| 9 | Sidebar toggle works (hamburger) | Manual | ⏳ |
| 10 | Backdrop dismiss works | Manual | ⏳ |
| 11 | No console errors | DevTools | ⏳ |
| 12 | Stage C disabled in footer | Visual | ⏳ |
| 13 | Feature flag off in footer | Visual | ⏳ |

---

## Post-Implementation Checks

| # | Check | Expected | Pass/Fail |
|---|---|---|---|
| 1 | `pnpm run typecheck` | ✅ Pass | ⏳ |
| 2 | `pnpm run build` | ✅ Exit 0 | ⏳ |
| 3 | `pnpm run lint` | ✅ 0 warnings | ⏳ |
| 4 | `git diff --check` | ✅ Clean | ⏳ |
| 5 | Desktop mouse resize at 1440px | ✅ Functional | ⏳ |
| 6 | Desktop mouse resize at 1280px | ✅ Functional | ⏳ |
| 7 | Desktop touch resize at 1440px | ✅ Functional (NEW) | ⏳ |
| 8 | Tablet landscape touch resize at 1024px | ✅ Functional (NEW) | ⏳ |
| 9 | Tablet portrait (768px) — overlay toggle | ✅ Unchanged | ⏳ |
| 10 | Mobile (390px) — overlay toggle | ✅ Unchanged | ⏳ |
| 11 | Width bounds [220, 460] enforced | ✅ Yes | ⏳ |
| 12 | sidebarWidth persists after reload | ✅ Yes | ⏳ |
| 13 | Dashboard renders correctly | ✅ Yes | ⏳ |
| 14 | GovernanceCenter renders correctly | ✅ Yes | ⏳ |
| 15 | Datasets renders correctly | ✅ Yes | ⏳ |
| 16 | PluginPool renders correctly | ✅ Yes | ⏳ |
| 17 | No hidden previews exposed | ✅ Unchanged | ⏳ |
| 18 | Stage C disabled | ✅ Unchanged | ⏳ |
| 19 | Feature flag off | ✅ Unchanged | ⏳ |
| 20 | No console errors | ✅ None | ⏳ |
| 21 | Scroll not blocked on touch devices | ✅ Normal | ⏳ |
| 22 | Backdrop dismiss works | ✅ Functional | ⏳ |
| 23 | Rollback ready (revert command works) | ✅ Documented | ⏳ |

---

## Special Attention Items

| Item | Risk | Mitigation |
|---|---|---|
| Double-firing on desktop (mouse + pointer both fire) | Low | `dragState.current.active` guard prevents double-handling |
| Touch scroll interference | Low | `touch-action: none` CSS on resizer div |
| Passive listener preventDefault rejection | Low | Listeners are not passive; `{ passive: false }` if needed |
| Overlay mode pointer events | Low | Sidebar is translated offscreen; width changes have no visible effect but are saved |
