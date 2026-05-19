# Stage C Feature Flag Toggle Smoke Plan

**Date:** 2026-05-20
**Stage C:** DISABLED

## Pre-Toggle Smoke

Must pass before toggle:

1. [ ] GET /api/health → 200
2. [ ] GET /api/stage-c/status → 200
3. [ ] featureFlag.currentState = off
4. [ ] featureFlag.mutableFromUi = false
5. [ ] stageCEnabled = false
6. [ ] canEnableStageC = false
7. [ ] killSwitch.executableFromUi = false
8. [ ] safetyBoundary.postRuntimeAllowed = false
9. [ ] safetyBoundary.dbWriteAllowed = false
10. [ ] POST /api/stage-c/status → blocked
11. [ ] Typecheck PASS
12. [ ] Tests PASS
13. [ ] Build PASS
14. [ ] Safety search 0 issues

## Post-Toggle Smoke

Must pass after toggle (if executed in future task):

1. [ ] GET /api/health → 200
2. [ ] GET /api/stage-c/status → 200
3. [ ] featureFlag.currentState = changed (verify expected state)
4. [ ] featureFlag.mutableFromUi = false (unchanged)
5. [ ] stageCEnabled = false (unchanged!)
6. [ ] canEnableStageC = false (unchanged!)
7. [ ] killSwitch.executableFromUi = false (unchanged)
8. [ ] safetyBoundary.postRuntimeAllowed = false (unchanged)
9. [ ] safetyBoundary.dbWriteAllowed = false (unchanged)
10. [ ] safetyBoundary.executorAllowed = false (unchanged)
11. [ ] safetyBoundary.externalControlAllowed = false (unchanged)
12. [ ] safetyBoundary.connectorActionAllowed = false (unchanged)
13. [ ] POST /api/stage-c/status → blocked (unchanged!)
14. [ ] No new POST endpoints registered
15. [ ] No DB write endpoints registered
16. [ ] Typecheck PASS
17. [ ] Tests PASS
18. [ ] Build PASS
19. [ ] Safety search 0 issues
