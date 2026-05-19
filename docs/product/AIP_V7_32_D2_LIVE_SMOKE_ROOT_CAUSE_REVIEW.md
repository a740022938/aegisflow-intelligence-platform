# AIP v7.32.0-D2 Live Smoke Root Cause Review

> **Date:** 2026-05-20
> **Status:** ROOT CAUSE CONFIRMED AND RESOLVED by human-approved restart (P1).
> See `docs/product/AIP_V7_32_P1_CONTROLLED_LIVE_SMOKE_REPORT.md` for smoke results.

## 1. Current State

| Check | Result |
|-------|--------|
| Latest commit | `062a2be` |
| Running server code | Pre-P1 (commit before `52ff808`) |
| GET /api/runtime/status | 401 (unauthorized) |
| GET /api/runtime/readiness | 401 |
| GET /api/runtime/gates | 401 |
| GET /api/runtime/blockers | 401 |
| GET /api/health | 200 (existing endpoint, unchanged) |
| Server PID | Running since before v7.31.0-P1 |

## 2. Root Cause

The 401 response is caused by the Fastify `onRequest` auth hook in `apps/local-api/src/index.ts`. The hook checks JWT authentication for all `/api/*` routes except those in `PUBLIC_PATHS` and `PUBLIC_PREFIXES`. The v7.31.0-P1 code added `/api/runtime/*` paths to `PUBLIC_PATHS`, but the **running server process was started before this change** and still uses the old PUBLIC_PATHS definition (without runtime paths).

Therefore, requests to `/api/runtime/*` hit the auth hook, fail JWT verification, and return 401.

This is NOT a code defect — it is a **stale server** issue. The running process simply has not been reloaded with the new code.

## 3. Human Restart Required

Live smoke cannot proceed until the local-api server is restarted with the current commit (`062a2be`). A human-approved restart is required.

## 4. Endpoints That Should Be Smoked

| Method | Path | Expected After Restart |
|--------|------|----------------------|
| GET | /api/runtime/status | 200, readonly_skeleton mode |
| GET | /api/runtime/readiness | 200, canExecuteRuntime=false |
| GET | /api/runtime/gates | 200, all gates pass |
| GET | /api/runtime/blockers | 200, 4 blockers |
| GET | /api/health | 200 (baseline) |
| GET | /api/system/status | 200 (baseline) |

## 5. Endpoints That Must Remain Blocked

| Method | Path | Expected After Restart |
|--------|------|----------------------|
| POST | /api/runtime/execute | 404 or 405 |
| POST | /api/runtime/rollback | 404 or 405 |
| POST | /api/runtime/dry-run/preview | 404 or 405 |
| POST | /api/runtime/approval/request | 404 or 405 |

## 6. Why POST / Stage C / Executor Must Stay Blocked

- No POST route handler exists in the runtime module (confirmed by code audit)
- Stage C is permanently disabled by project policy
- No runtime executor code exists
- No DB write code exists
- No external control code exists

These are enforced by architecture, not just policy. The code literally does not contain these capabilities.
