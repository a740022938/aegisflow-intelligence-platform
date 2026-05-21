# AIP v7.60-P1 Rollback Plan

**Phase:** v7.60-P1
**Status:** DEFINED

---

## Pre-Commit Rollback

```bash
git checkout -- apps/web-ui/src/components/Layout.tsx
pnpm run typecheck && pnpm run build && pnpm run lint
```

## Post-Commit Rollback

```bash
git revert <commit-hash> --no-edit
pnpm run typecheck && pnpm run build && pnpm run lint
# Verify:
# - Desktop mouse resize still works
# - Sidebar toggle still works
# - localStorage width persistence works
# - No console errors
git commit --amend --no-edit  # if all checks pass
git push origin main
```

## Emergency Rollback

If pointer events cause unexpected behavior on desktop (low probability):
1. `git revert <commit-hash> --no-edit`
2. Run full validation
3. Inform that desktop mouse behavior is restored
4. Debug and re-attempt in a future phase

## Rollback Verification Checklist

| Check | Method |
|---|---|
| Desktop mouse resize | Manual drag test |
| Touch no longer responds | If device available |
| Sidebar toggle | Click hamburger |
| localStorage read | Check key exists |
| `pnpm run typecheck` | CLI |
| `pnpm run build` | CLI |
| `pnpm run lint` | CLI |
| `git diff --check` | CLI |
