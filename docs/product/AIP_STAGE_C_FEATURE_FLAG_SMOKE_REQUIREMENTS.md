# Stage C Feature Flag Smoke Requirements

**Date:** 2026-05-20
**Stage C:** DISABLED

## Pre-Toggle Smoke (must pass before flag change)

1. GET /api/stage-c/status → 200 (all fields correct)
2. POST /api/stage-c/status → blocked
3. Feature flag currentState = off
4. Stage C disabled
5. Kill switch non-executable
6. All safety boundaries intact
7. Typecheck PASS
8. Tests PASS
9. Build PASS
10. Safety search 0 issues

## Post-Toggle Smoke (must pass after flag change)

1. GET /api/stage-c/status → 200 (verify flag changed)
2. POST /api/stage-c/status → blocked (still blocked!)
3. Feature flag currentState = test_only (or equivalent)
4. Stage C remains disabled
5. Kill switch still non-executable
6. All safety boundaries still intact
7. NO new POST/DB/executor/external/connector endpoints

## Negative Tests

- Flag toggle does NOT enable POST runtime
- Flag toggle does NOT enable DB write
- Flag toggle does NOT enable executor
- Flag toggle does NOT enable external control
- Flag toggle does NOT enable connector action
- Flag toggle does NOT expose sidebar
