# Stage C Required Smoke Matrix

> **Date:** 2026-05-20
> **Phase:** v7.34.0-D2

## Required Smoke Tests

| # | Smoke Test | Endpoint | Expected | Required |
|---|------------|----------|----------|----------|
| 1 | Health check | GET /api/health | 200 | Yes |
| 2 | Login | POST /api/auth/login | 200 | Yes |
| 3 | Tasks | GET /api/tasks | 200 | Yes |
| 4 | Queue recovery | GET /api/queue/recovery | 200 | Yes |
| 5 | Worker timeout | GET /api/worker/timeout | 200 | Yes |
| 6 | OpenClaw circuit | GET /api/openclaw/circuit | 200 | Yes |
| 7 | Workflow minimal | GET /api/workflow/minimal | 200 | Yes |
| 8 | Plugin registry | GET /api/plugin/registry | 200 | Yes |
| 9 | DB diagnostics | GET /api/db/diagnostics | 200 | Yes |

## Smoke Pass Conditions

- All 9 tests must PASS
- Each test must return expected status code
- Smoke must be run within 24h of Stage C enablement request

## Smoke Blockers

- Server not running: cannot proceed
- Server restarted without re-smoke: must re-smoke
- Any test FAIL: cannot proceed until resolved
- Stale smoke (>24h): must re-smoke

## Invariant

```
Stage C remains disabled.
No runtime executor is implemented.
No POST runtime action is implemented.
No DB write is permitted.
No external control is permitted.
```
