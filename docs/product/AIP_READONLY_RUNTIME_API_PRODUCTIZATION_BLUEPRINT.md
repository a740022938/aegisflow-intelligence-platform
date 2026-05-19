# AIP Readonly Runtime API Productization Blueprint

> **Phase:** v7.32.0-D1
> **Status:** Blueprint only — no implementation, no restart, no deployment
> **Date:** 2026-05-20

## 1. Productization Goal

Establish a controlled, human-approved process to:
- Verify the readonly runtime API endpoints work in the live environment
- Enable operator-driven smoke testing
- Document deployment, restart, rollback, and recovery procedures
- Prepare the frontend viewer for manual refresh capability

## 2. Non-Goals

- No POST endpoint implementation
- No DB write enablement
- No external tool control
- No Stage C enablement
- No runtime execution
- No automatic restart
- No automatic smoke
- No production deployment without human approval

## 3. Allowed Product Surface

| Surface | Allowed in v7.32 |
|---------|-----------------|
| Human-approved live smoke | Yes (controlled, documented) |
| Operator guide | Yes (documentation) |
| Manual frontend refresh viewer | Yes (no auto-fetch) |
| Restart with owner approval | Yes (documented procedure) |
| Rollback documentation | Yes |
| Recovery documentation | Yes |

## 4. Backend Readonly API Surface

Unchanged from v7.31.0-P1:
- GET /api/runtime/status
- GET /api/runtime/readiness
- GET /api/runtime/gates
- GET /api/runtime/blockers

No new endpoints. No POST endpoints.

## 5. Frontend Viewer Strategy

- Future P2: Manual refresh button (no auto-fetch)
- Future P3: Operator guide documentation
- No sidebar entry

## 6. Smoke Strategy

See `AIP_READONLY_RUNTIME_API_LIVE_SMOKE_POLICY.md` for detailed smoke policy.

## 7. Restart/Reload Strategy

See `AIP_READONLY_RUNTIME_API_HUMAN_APPROVED_RESTART_POLICY.md` for detailed restart policy.

## 8. Operator Workflow

See `AIP_READONLY_RUNTIME_API_OPERATOR_GUIDE.md` for operator workflow.

## 9. Rollback Workflow

See `AIP_READONLY_RUNTIME_API_ROLLBACK_AND_RECOVERY_GUIDE.md` for rollback and recovery.

## 10. Final Acceptance Gates

| Gate | Criteria |
|------|----------|
| Smoke pass | All 4 GET endpoints return 200 with correct contract |
| POST blocked | POST /runtime/execute returns 404/405 |
| Tests pass | 38/38 tests PASS |
| Typecheck pass | tsc --noEmit PASS |
| Human approval required | Yes (for restart and smoke) |
