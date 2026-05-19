# AIP v7.32.0-P1 Controlled Live Smoke Report

> **Date:** 2026-05-20
> **Status:** EXECUTED — full readonly live smoke completed and PASSED
> **Prerequisite:** Human-approved restart (Phase 2)

## Summary

After the stale server was identified in D2 (commit `a02bbec`), human project owner approved restart. Server was stopped and restarted with current code. Readonly live smoke executed against all 4 runtime GET endpoints, all 4 POST endpoints, and safety field validation.

All checks pass. Stale server 401 is resolved.

## Smoke Results

| Check | Result |
|-------|--------|
| GET /api/runtime/status | 200 PASS |
| GET /api/runtime/readiness | 200 PASS |
| GET /api/runtime/gates | 200 PASS |
| GET /api/runtime/blockers | 200 PASS |
| POST /api/runtime/execute | 401 (blocked) PASS |
| POST /api/runtime/rollback | 401 (blocked) PASS |
| POST /api/runtime/dry-run/preview | 401 (blocked) PASS |
| POST /api/runtime/approval/request | 401 (blocked) PASS |
| Cache-Control header | no-store PASS |
| Safety fields | all correct PASS |

## Key Safety Confirmations

- stageCEnabled: false
- dbWriteEnabled: false
- externalControlEnabled: false
- postEndpointsEnabled: false
- canExecuteRuntime: false
- canWriteDb: false
- canControlExternalTools: false
- canEnableStageC: false

## Restart Details

| Field | Value |
|-------|-------|
| Pre-restart HEAD | a02bbec |
| Post-restart HEAD | a02bbec |
| Old PID | 6772 |
| New PID | 7892 |
| Port | 8787 |

## Validation

| Check | Result |
|-------|--------|
| typecheck | PASS |
| Tests | 38/38 PASS |
| Security search (Stage C) | Clean |
| Security search (POST) | Clean |
| Security search (exec/secret) | Clean |
| git status | Clean |

## Post-Smoke Status

- Stale server 401: **RESOLVED**
- Live smoke: **EXECUTED AND PASSED**
- All runtime endpoints: **200 OK**
- All safety fields: **confirmed disabled**
- All POST endpoints: **blocked**

Next step: v7.32.0-P2 or productization seal.
