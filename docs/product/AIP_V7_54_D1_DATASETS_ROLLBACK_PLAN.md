# AIP v7.54-D1 Datasets Rollback Plan

**Date:** 2026-05-21

---

## 1. Rollback Triggers

Any of the following during P1 implementation or review:

1. WorkspaceGrid layout persistence broken
2. Layout edit toggle fails or loses state
3. Dataset create/update POST fails or behaves differently
4. `contentWidth` measurement deviates from pre-migration
5. Any visual regression detected in Visual QA comparison
6. `typecheck`, `build`, `lint`, or `git diff --check` fails
7. Acceptance criteria A1-A10 not fully satisfied

---

## 2. Rollback Procedures

### 2.1 Changes Not Yet Committed

```bash
git status --short
# Verify only Datasets-related files are changed
git checkout -- apps/web-ui/src/pages/Datasets.tsx
# If CSS or other files were changed:
git checkout -- apps/web-ui/src/pages/Datasets.css
```

### 2.2 Changes Committed But Not Pushed

```bash
git log -3 --oneline
# Confirm the most recent commit is the pilot commit
git reset --hard HEAD~1
```

### 2.3 Changes Already Pushed

```bash
git log -3 --oneline
# Confirm the commit to revert
git revert <pilot-commit-hash> --no-edit
git push origin main
```

**Do not force push.** Always use `revert` for pushed commits.

---

## 3. Post-Rollback Verification

```bash
pnpm run typecheck
pnpm run build
pnpm run lint
git diff --check
git status --short
```

All must pass. The working tree must be identical to pre-pilot state.

---

## 4. Rollback Notes

- Rollback is expected to be trivial because the only change in P1 should be shell wrapping
- If the migration touched any `apiService.*`, `WorkspaceGrid`, or `contentRef` code,
  rollback alone may not restore pre-mutation behavior — investigate root cause first
- After rollback, document the failure reason in `AIP_V7_54_P1_DATASETS_PILOT_REPORT.md`
