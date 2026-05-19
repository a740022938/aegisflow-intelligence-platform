# AIP Backend Readonly API Contract Test Acceptance Plan

> **Phase:** v7.31.0-P1
> **Status:** P2/P3/P4 acceleration — 16 contract tests written (v7.31.0-P2)
> **Purpose:** Define the acceptance criteria for future P1/P2 backend readonly API contract tests

## 1. Route Existence Tests

- GET /runtime/status returns 200
- GET /runtime/readiness returns 200
- GET /runtime/gates returns 200
- GET /runtime/blockers returns 200
- Unknown route returns 404
- POST to any readonly route returns 405 or 404

## 2. Schema Shape Tests

- GET /runtime/status response matches contract schema
- GET /runtime/readiness response contains expected fields (status, blocking, warning, info)
- GET /runtime/gates response contains gate array with status per gate
- GET /runtime/blockers response contains blocker array with severity per blocker
- All responses are valid JSON
- All responses have Content-Type: application/json

## 3. No-Mutation Tests

- No endpoint triggers DB write (verify by checking logs/process state)
- No endpoint triggers external HTTP request
- No endpoint creates files (beyond standard logging)
- No endpoint starts background worker or scheduler
- No endpoint modifies application state

## 4. Forbidden POST Tests

- POST /runtime/status returns 405
- POST /runtime/readiness returns 405
- POST /runtime/gates returns 405
- POST /runtime/blockers returns 405
- POST /runtime/dry-run/preview returns 404
- POST /runtime/execute returns 404
- POST /runtime/rollback returns 404
- POST /runtime/approval/request returns 404

## 5. DB Write Absence Tests

- Verify no SQLite/PostgreSQL/MySQL connection is established
- Verify no ORM is initialized
- Verify no database migration is executed
- Verify no query is sent to any database

## 6. External Control Absence Tests

- Verify no HTTP client is called (no axios, no fetch to external URLs)
- Verify no WebSocket connection is opened
- Verify no external SDK is invoked
- Verify no file system write occurs (except logs)

## 7. Stage C Disabled Tests

- Verify no Stage C enablement endpoint exists
- Verify application does not import or reference Stage C activation code
- Verify stage_c_enabled flag is always false in responses

## 8. Secret Field Rejection Tests

- Verify endpoint rejects requests with `token` query parameter
- Verify endpoint rejects requests with `apiKey` query parameter
- Verify endpoint rejects requests with `password` query parameter
- Verify endpoint rejects requests with `secret` query parameter
- Verify endpoint rejects requests with `privateKey` query parameter
- Verify endpoint rejects requests with `credential` query parameter

## 9. Frontend Compatibility Tests

- Verify existing frontend preview pages load correctly with backend data
- Verify no frontend regression when backend is reachable
- Verify frontend degrades gracefully when backend is unavailable

## 10. Rollback of Skeleton Tests

- Verify route can be removed without affecting other routes
- Verify frontend pages still load after skeleton rollback
- Verify no database rollback needed (no DB writes in skeleton)

## P1 Test Implementation

| Category | Tests | File |
|----------|-------|------|
| Route existence (module export) | 1 | `src/__tests__/runtime-readonly-status.test.ts` |
| Schema shape (contract fields) | 4 | `src/__tests__/runtime-readonly-status.test.ts` |
| Path registration | 1 | `src/__tests__/runtime-readonly-status.test.ts` |

16 contract tests implemented in P2/P3/P4 acceleration pack (38 total across all test files). Coverage includes schema validation, POST blocking, secret absence, and Cache-Control headers.
