# AIP v7.58-P4 Safe Implementation Boundaries

**Phase:** v7.58-P4
**Status:** DEFINED

---

## 1. P4 Does NOT Implement Changes

This phase is evidence review only. No source code, CSS, or build config changes are made.

---

## 2. Hard Boundaries (P4)

| Boundary | Status |
|---|---|
| Broad CSS rewrite without page inventory | NOT ALLOWED |
| Resizer behavior change without desktop/tablet/mobile QA | NOT ALLOWED |
| Touch handling change without pointer/mouse regression checks | NOT ALLOWED |
| Hidden preview or sidebar exposure | NOT ALLOWED |
| Stage C enablement | NOT ALLOWED |
| Feature flag toggle | NOT ALLOWED |
| Release side effects | NOT ALLOWED |
| WorkflowComposer / GovernanceHub changes without no-go review | NOT ALLOWED |

---

## 3. Requirements for Future Implementation

Any future mobile/sidebar implementation must satisfy ALL of the following:

### Pre-Change Baseline
- [ ] Current sidebar behavior documented (fixed vs overlay, width range, breakpoints)
- [ ] Current resizer behavior documented (mouse only)
- [ ] Viewport screenshots (desktop, tablet, mobile)
- [ ] Current localStorage keys and formats documented

### Visual QA
- [ ] Screenshots before and after at all 3 breakpoints (lg/md/sm)
- [ ] Sidebar open/closed states verified
- [ ] Resizer drag behavior verified on mouse
- [ ] Resizer drag behavior verified on touch if implementing touch support
- [ ] Content overflow verified (no horizontal scroll)
- [ ] Fixed/sticky headers verified (no overlap)

### Validation
- [ ] `pnpm run typecheck` PASS
- [ ] `pnpm run build` PASS
- [ ] `pnpm run lint` PASS
- [ ] `git diff --check` PASS

### Rollback Plan
- [ ] Specific commit(s) to revert identified
- [ ] Rollback validation commands defined
- [ ] Rollback QA steps defined

### Safety Checks
- [ ] No hidden preview routes exposed
- [ ] No sidebar entries added
- [ ] No Stage C or feature flag changes in same phase
- [ ] No release or restore authorization in same phase
- [ ] No WorkflowComposer / GovernanceHub changes without separate no-go review
