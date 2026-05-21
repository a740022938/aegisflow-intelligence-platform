# AIP v7.58-D1 Safe Optimization Boundaries

**Phase:** v7.58-D1
**Status:** DEFINED

---

## 1. D1 Does NOT Modify Source Code

This phase is docs-only planning. No source file in `apps/` or `packages/` is modified. No new components, hooks, utilities, or pages are created.

---

## 2. Hard Boundaries (D1)

| Action | Status |
|---|---|
| Build config changes | NOT ALLOWED |
| Dynamic imports (`import()`) | NOT ALLOWED |
| `manualChunks` in Vite config | NOT ALLOWED |
| Route refactors | NOT ALLOWED |
| Hidden preview exposure | NOT ALLOWED |
| Sidebar expansion | NOT ALLOWED |
| `.env.local` modification | NOT ALLOWED |
| Stage C enablement | NOT ALLOWED |
| Feature flag toggle | NOT ALLOWED |
| DB write / DB restore / migrations | NOT ALLOWED |
| Git tag / GitHub Release | NOT ALLOWED |
| Restore execution | NOT ALLOWED |
| `taskkill` / restart | NOT ALLOWED |

---

## 3. Requirements for Future Optimization

Any future source-code optimization must satisfy ALL of the following:

### Pre-Change Baseline
- [ ] Build warning baseline captured
- [ ] Bundle analysis output captured
- [ ] Chunk size recorded
- [ ] Screenshot/behavior evidence captured
- [ ] Console errors (if any) recorded

### Visual QA
- [ ] Screenshots before and after change
- [ ] Render behavior verified (no layout shift, no flash of unstyled content)
- [ ] Loading states verified
- [ ] Error states verified

### Validation Commands
- [ ] `pnpm run typecheck` PASS
- [ ] `pnpm run build` PASS (no new warnings)
- [ ] `pnpm run lint` PASS (0 warnings)
- [ ] `git diff --check` PASS
- [ ] `pnpm test` PASS (if API running)

### Rollback Plan
- [ ] Specific commit(s) to revert identified
- [ ] Rollback validation commands defined
- [ ] Rollback QA steps defined

### Route-Level Risk Review
- [ ] Shared vs local dependencies identified
- [ ] Lazy loading impact assessed
- [ ] Manual chunk impact assessed
- [ ] No circular dependencies introduced

### Side-Effect Check
- [ ] No Stage C enablement in same phase
- [ ] No feature flag toggle in same phase
- [ ] No release/restore in same phase
- [ ] No DB write/restore in same phase
