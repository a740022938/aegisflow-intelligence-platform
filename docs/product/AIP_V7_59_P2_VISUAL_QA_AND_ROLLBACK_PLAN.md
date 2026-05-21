# AIP v7.59-P2 Visual QA and Rollback Plan

**Phase:** v7.59-P2
**Status:** DEFINED

---

## 1. Viewport QA Matrix

| Viewport | Before | After | Method |
|---|---|---|---|
| 1440×900 | ✅ Capture | ✅ Compare | Screenshot |
| 1280×720 | ✅ Capture | ✅ Compare | Screenshot |
| 1024×768 | ✅ Capture | ✅ Compare | Screenshot |
| 768×1024 | ✅ Capture | ✅ Compare | Screenshot |
| 390×844 | ✅ Capture | ✅ Compare | Screenshot |

---

## 2. Required Visual Checks

| Check | Requirement |
|---|---|
| GovernanceCenter renders | Full page renders without error |
| Selected section renders (Registry/Validator) | Registry data loads correctly, all panels render |
| Loading state | Suspense fallback shows correctly during section load |
| Empty state | Not applicable (registry always has data) |
| Error state | Error boundary catches failures, displays fallback |
| Sidebar unaffected | Sidebar navigation, width, and behavior unchanged |
| No hidden preview exposure | No new sidebar entries or route exposures |
| Stage C remains disabled | Confirmed via navigation-exposure-registry |
| Feature flag remains off | Confirmed via feature flag check |
| Console errors | NONE — verify with browser dev tools if UI is running |

---

## 3. Rollback Plan

### Step 1: Revert
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

### Step 3: Verify
- Confirm chunk returns to pre-split size (930.88 kB)
- Confirm GovernanceCenter renders correctly
- Confirm no console errors
- Compare screenshot with pre-split baseline

### Step 4: Commit and push
```bash
git commit --amend --no-edit  # if tests pass
git push origin main
```

---

## 4. UI Evidence Tooling

| Tool | Status |
|---|---|
| Browser dev tools (manual) | ⏳ Available (if UI running) |
| Screenshot capture | ⏳ Available (OS-level) |
| Automated visual diff | ❌ Not installed (Playwright or similar) |

If UI is not running at implementation time, QA is limited to validation commands and code review.
