# AIP v7.59-P3 Rollback and Safety Plan

**Phase:** v7.59-P3
**Status:** DEFINED

---

## 1. Rollback Procedure

### Step 1: Revert commit
```bash
git revert <commit-hash> --no-edit
```

### Step 2: Validate
```bash
pnpm run typecheck
pnpm run build
pnpm run lint
git diff --check
```

### Step 3: Verify desktop mouse resize
- Open browser, navigate to any page with sidebar
- Drag sidebar resizer with mouse
- Confirm width changes and persists across page reload

### Step 4: Verify touch (if available)
- If touch device available: confirm sidebar resize no longer responds to touch (regression to current behavior)
- This is acceptable — rollback restores previous state

### Step 5: No console errors
- Open DevTools console
- Confirm no errors related to layout/resizer

### Step 6: Commit and push
```bash
git commit --amend --no-edit  # if all validations pass
git push origin main
```

---

## 2. Safety Guards

| Guard | Mechanism |
|---|---|
| `event.preventDefault()` | Prevents text selection during drag (already present) |
| `touch-action: none` (CSS) | Prevents browser from intercepting touch for scroll/zoom |
| `layout-resizing` body class | Prevents iframe/pointer event conflicts during resize |
| `dragState.current.active` check | Prevents stale drag state |
| Width clamping `[220, 460]` | Prevents sidebar from becoming too narrow or too wide |
| localStorage persistence | Width survives page reload |

---

## 3. Post-Implementation Validation Checklist

| # | Check | Expected |
|---|---|---|
| 1 | `pnpm run typecheck` | ✅ Pass |
| 2 | `pnpm run build` | ✅ Exit 0 |
| 3 | `pnpm run lint` | ✅ 0 warnings |
| 4 | `git diff --check` | ✅ Clean |
| 5 | Desktop mouse resize | ✅ Functional |
| 6 | Desktop touch resize (if tested) | ✅ Functional (new) |
| 7 | Tablet touch resize (if tested) | ✅ Functional (new, >900px) |
| 8 | Mobile overlay toggle | ✅ Unchanged |
| 9 | sidebarWidth persists after reload | ✅ Same value |
| 10 | Console errors | ✅ None |
| 11 | No hidden preview exposure | ✅ Unchanged |
| 12 | Stage C / feature flag / release / restore | ✅ All unchanged |

---

## 4. Emergency Rollback

If pointer events cause unexpected behavior on desktop (e.g., double-firing, jank):
1. `git revert <commit-hash> --no-edit`
2. Run validation suite
3. Inform team
4. Document the issue before re-attempting

Probability of desktop regression: Low. Pointer events are designed to be backward-compatible with mouse events.
