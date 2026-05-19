# AIP Readonly Runtime API Live Smoke Policy

> **Phase:** v7.32.0-D1 (design)
> **Status:** Policy only — no smoke executed
> **Date:** 2026-05-20

## 1. Why Live Smoke Was Deferred

During v7.31.0-P1/P2/P3/P4 implementation, the local-api server was not restarted because:
- Construction pack prohibited `taskkill` / forced restart
- Server was running pre-P1 code
- Code validation (typecheck + tests) confirmed correctness without live smoke

## 2. When Live Smoke May Run

- Only after human project owner approval
- Only using the documented restart procedure (see human restart policy)
- Only in the local/development environment

## 3. Human-Approved Restart Requirement

No automatic restart. No taskkill without explicit owner approval. The live smoke must be explicitly requested by the human project owner.

## 4. Smoke Endpoint List

| Method | Path | Expected Status |
|--------|------|----------------|
| GET | /api/runtime/status | 200 |
| GET | /api/runtime/readiness | 200 |
| GET | /api/runtime/gates | 200 |
| GET | /api/runtime/blockers | 200 |

## 5. POST Blocking Smoke List

| Method | Path | Expected Status |
|--------|------|----------------|
| POST | /api/runtime/execute | 404 or 405 |
| POST | /api/runtime/rollback | 404 or 405 |
| POST | /api/runtime/dry-run/preview | 404 or 405 |
| POST | /api/runtime/approval/request | 404 or 405 |

## 6. Success Criteria

- All 4 GET endpoints return 200
- Each response body matches the contract schema
- All POST endpoints return non-200 (404/405)
- Response includes Cache-Control: no-store header
- All safety fields are correct (stageCEnabled=false, dbWriteEnabled=false, etc.)

## 7. Failure Handling

| Failure | Action |
|---------|--------|
| GET returns non-200 | Report to human owner. Check server state. |
| POST returns 200 | Critical failure. Report immediately. Stop. |
| Schema mismatch | Report to human owner. Check code version. |
| Header missing | Warning. Report to human owner. |

## 8. Rollback Condition

If the smoke reveals unexpected behavior:
1. Report to human owner
2. Do not proceed to next phase
3. Use git revert or fix-forward as directed
