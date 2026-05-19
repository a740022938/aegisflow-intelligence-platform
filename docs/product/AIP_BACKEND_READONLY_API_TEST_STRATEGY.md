# AIP Backend Readonly API Test Strategy

> **Phase:** v7.31.0-P1
> **Status:** P2/P3/P4 acceleration — 16 contract tests implemented (Vitest)
> **Purpose:** Define the testing strategy for future readonly backend API implementation

## 1. Unit Tests

- Test each endpoint handler in isolation
- Mock registry data sources
- Verify response shape matches contract
- Verify error handling for invalid inputs
- Verify all forbidden input fields are rejected
- Verify all forbidden output fields are redacted

## 2. Contract Tests

- Test that endpoint responses match the declared contract
- Test that GET `/runtime/status` returns the correct schema
- Test that GET `/runtime/readiness` returns correct readiness enum
- Test that all allowed endpoints return 200 for valid requests
- Test that all blocked endpoints return 403 or 404

## 3. No-Mutation Tests

- Verify no endpoint performs any mutation
- Verify no endpoint calls `db.write()`, `fs.writeFile()`, etc.
- Verify no endpoint makes external HTTP requests
- Verify no endpoint starts background workers or schedulers

## 4. Forbidden Endpoint Tests

- Verify POST `/runtime/dry-run/preview` returns 403
- Verify POST `/runtime/approval/request` returns 403
- Verify POST `/runtime/execute` returns 403
- Verify any unknown path returns 404

## 5. Secret Rejection Tests

- Verify endpoints reject requests containing `token` parameter
- Verify endpoints reject requests containing `apiKey` parameter
- Verify endpoints reject requests containing `password` parameter
- Verify endpoints reject requests containing `secret` parameter
- Verify endpoints reject requests containing `privateKey` parameter
- Verify endpoints reject requests containing `credential` parameter

## 6. DB Write Absence Tests

- Verify no database connection is established
- Verify no SQL/NoSQL queries are executed
- Verify no ORM models are instantiated with write intent

## 7. External Control Absence Tests

- Verify no external HTTP requests are made
- Verify no WebSocket connections are opened
- Verify no third-party SDKs are called
- Verify no filesystem mutations occur

## 8. Stage C Disabled Tests

- Verify no Stage C enablement code path exists
- Verify `stage_c_enabled` flag is always false
- Verify no Stage C gate code is imported

## 9. Route Smoke Tests

- Verify all allowed routes return 200
- Verify all blocked routes return 403
- Verify unknown routes return 404
- Verify health check endpoint returns 200

## 10. Regression Tests for Hidden Previews

- Verify all existing frontend preview pages still load
- Verify all existing preview pages remain hidden direct
- Verify no new sidebar entries appear
- Verify all validators still pass

## Note

This document **defines the test strategy only**. No test code is created in this phase. Tests will be implemented as part of the future backend implementation task.

## v7.31-D2 Human Review Pack

- **Status:** PENDING_HUMAN_OWNER_REVIEW
- **P1 skeleton:** Not yet approved
- **Backend endpoint:** NOT implemented (human review pack only)
- **Stage C:** Permanently disabled
- **DB write:** Not performed
- **External control:** Not enabled
- **Tag/Release:** Not created
