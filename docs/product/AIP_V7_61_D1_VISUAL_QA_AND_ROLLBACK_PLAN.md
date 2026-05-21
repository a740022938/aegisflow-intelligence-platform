# AIP v7.61-D1 Visual QA and Rollback Plan

**Phase:** v7.61-D1
**Status:** DEFINED

---

## Viewports

| # | Viewport | Device |
|---|---|---|
| 1 | 1440×900 | Desktop |
| 2 | 1280×720 | Desktop (small) |
| 3 | 1024×768 | Tablet landscape |
| 4 | 768×1024 | Tablet portrait |
| 5 | 390×844 | Mobile |

## Routes

| # | Route | Purpose |
|---|---|---|
| 1 | `/governance-center` | Primary — verify GovernanceCenter renders |
| 2 | `/dashboard` | Control — verify no side effects |
| 3 | `/datasets` | Control — verify no side effects |
| 4 | `/plugin-pool` | Control — non-adapter page |
| 5 | `/factory-status` | Control — heavy page |

## Checks

| Check | Method |
|---|---|
| GovernanceCenter renders | Page load, no crash |
| Registry/Validator section available | Section renders correctly |
| Loading/empty/error states | No spinners stuck |
| Sidebar unaffected | Sidebar width, toggle, backdrop unchanged |
| No hidden preview exposure | Text scan for preview/hidden terms |
| Stage C disabled | Feature flag unchanged |
| Feature flag off | Flag unchanged |
| Console errors | Browser console / Playwright listener |
| Layout breakage | `scrollWidth <= clientWidth` check |

## Rollback Procedure

```bash
# 1. Revert the implementation commit
git revert <implementation-commit> --no-edit

# 2. Verify revert
pnpm run typecheck
pnpm run build
pnpm run lint
git diff --check

# 3. Confirm chunk size returns to baseline
# Expected: GovernanceCenter 930.88 kB

# 4. Commit revert
git commit --amend --no-edit  # if checks pass

# 5. Document
# Record in implementation receipt
```

## Rollback Verification Checklist

| Check | Method |
|---|---|
| `pnpm run typecheck` | CLI |
| `pnpm run build` | CLI (check chunk size) |
| `pnpm run lint` | CLI |
| `git diff --check` | CLI |
| GovernanceCenter route loads | Page load |
| Console errors | Browser |
| Sidebar unaffected | Visual |
