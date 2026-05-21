# AIP v7.61-P5 Rollback Plan

**Status:** READY

---

## Rollback Procedure

To restore the P5 revert (i.e., re-apply P2 changes):

```bash
git revert <P5-commit-hash>
```

Or to restore from git:

```bash
git checkout <P5-commit-hash>^ -- apps/web-ui/src/pages/GovernanceCenter.tsx
```

## Verification After Rollback

```bash
git diff apps/web-ui/src/pages/GovernanceCenter.tsx
pnpm run build
pnpm run typecheck
```

## Risk Assessment

- **Complexity:** Trivial (single file, single commit)
- **Data loss:** None
- **Deploy impact:** None (not released)
