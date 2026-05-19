# AIP Readonly Runtime API Rollback and Recovery Guide

> **Phase:** v7.32.0-D1 (design)
> **Status:** Guide only — no rollback executed
> **Date:** 2026-05-20

## 1. Rollback Trigger

Rollback should be triggered when:
- Live smoke reveals unexpected behavior
- POST endpoint is accidentally created
- DB write is accidentally enabled
- Stage C is accidentally enabled
- Typecheck or tests fail in P1/P2/P3/P4 code

## 2. Rollback Scope

| Component | Rollback Action |
|-----------|----------------|
| Backend code (`apps/local-api/src/runtime/readonly-status.ts`) | Git revert or fix-forward |
| Tests (`apps/local-api/src/__tests__/runtime-readonly-status.test.ts`) | Git revert or fix-forward |
| Frontend page (`RuntimeReadonlyStatusApiPreview.tsx`) | Git revert or fix-forward |
| Registries | Git revert or fix-forward |
| Product docs | Git revert or fix-forward |

## 3. Git Revert Policy

- Use `git revert <commit>` (not `git reset`) to maintain history
- Revert commits in chronological order
- After revert, verify: typecheck PASS, tests PASS, no dangerous patterns
- Do not modify git history (no rebase, no reset --hard)

## 4. No DB Rollback Required

Because v7.31.0-P1/P2/P3/P4 does not write to the database, no DB rollback is required. This simplifies recovery significantly.

## 5. No External State Rollback Required

Because v7.31.0-P1/P2/P3/P4 does not control external tools, no external state rollback is required.

## 6. How to Verify Rollback

```powershell
git log -1                          # Confirm revert commit
npm run typecheck                   # PASS expected
cd apps/local-api && npm run test   # 38/38 PASS expected
rg "app\.post" apps/local-api/src/runtime/  # 0 expected
rg "stage_c" apps/local-api/src/runtime/     # Only in static responses
```

## 7. How to Re-run Tests After Rollback

```powershell
cd apps/local-api
npm run test
```

All 38 tests should pass. If they do not, investigate and fix before proceeding.

## 8. Recovery Duration

Estimated recovery time for a full rollback:
- Code revert: 5 minutes
- Verification: 5 minutes
- Total: ~10 minutes

This is feasible because there is no DB migration, no external state, and no configuration change to unwind.
