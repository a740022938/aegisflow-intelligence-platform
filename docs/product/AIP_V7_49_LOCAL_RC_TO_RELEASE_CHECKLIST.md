# AIP v7.49 — Local RC → Release Transition Checklist

**Date:** 2026-05-20
**Phase:** P4
**Baseline HEAD:** `8296250`

---

## 1. Purpose

This checklist defines every step required to transition from "Local RC Candidate" status to a real GitHub Release. No step may be skipped.

## 2. Transition Checklist

### Phase A: Pre-Authorization

- [ ] All D1 blueprint docs reviewed (`AIP_V7_49_RELEASE_CANDIDATE_EVIDENCE_HARDENING_BLUEPRINT.md`)
- [ ] All deferred items in `AIP_V7_49_DEFERRED_ITEMS_REVIEW_PLAN.md` reviewed
- [ ] P1 test evidence result confirmed: 9/9 smoke tests PASS
- [ ] P2 env/secret rotation readiness confirmed: PASS, no leaks
- [ ] P3 sidebar exposure audit confirmed: NO MIGRATION needed
- [ ] P4 release notes draft finalized
- [ ] Final version number decided (e.g. `v7.49.0`)
- [ ] Final tag name confirmed (e.g. `v7.49.0`)
- [ ] Secrets scan re-run: no hardcoded secrets in tracked files
- [ ] Hardcoded secret patterns scanned: `sk-`, `ghp_`, `xox[baprs]-`, passwords

### Phase B: Authorization

- [ ] Human owner provides explicit written or verbal authorization
- [ ] Authorization receipt generated (use `AIP_V7_49_RELEASE_AUTHORIZATION_TEMPLATE.md`)
- [ ] Authorization receipt stored in `docs/product/`
- [ ] Release notes draft reviewed and approved by human owner

### Phase C: Verification

- [ ] Typecheck passes: `pnpm run typecheck`
- [ ] Build passes: `pnpm run build`
- [ ] Smoke tests pass: `pnpm test` (9/9)
- [ ] Restore/rollback evidence verified (if applicable)
- [ ] Fresh install smoke test passed (if applicable)
- [ ] No real secrets in any output or artifact

### Phase D: Release Execution

- [ ] Tag created: `git tag v7.49.0`
- [ ] Tag pushed: `git push origin v7.49.0`
- [ ] GitHub Release created with final notes
- [ ] Release receipt filed
- [ ] Stage C remains DISABLED (verify after release)

### Phase E: Post-Release

- [ ] Verify release appears on GitHub
- [ ] Verify tag is correct
- [ ] Confirm Stage C still DISABLED
- [ ] Archive release notes in `docs/product/`

## 3. Safety Rules

| Rule | Enforcement |
|------|-------------|
| Never skip Phase A or B | Blocking gate |
| Never create tag without authorization | Blocking gate |
| Never create Release without tag | Blocking gate |
| Never enable Stage C during release | Blocking gate |
| Never treat Local RC as release permission | Explicitly forbidden |

## 4. Current Status

| Phase | Status |
|-------|--------|
| Phase A: Pre-Authorization | ⬜ 4 of 11 complete |
| Phase B: Authorization | ⬜ 0 of 2 complete |
| Phase C: Verification | ⬜ 2 of 6 complete |
| Phase D: Release Execution | ⬜ 0 of 5 complete |
| Phase E: Post-Release | ⬜ 0 of 3 complete |

Overall: **NOT READY** — waiting for human owner authorization.
