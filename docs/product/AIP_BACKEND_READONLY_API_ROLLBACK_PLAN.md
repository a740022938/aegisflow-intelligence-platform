# AIP Backend Readonly API Rollback Plan

> **Phase:** v7.31.0-D1
> **Status:** Design-only — no rollback performed
> **Purpose:** Define the rollback strategy for future readonly backend API implementation

## 1. Rollback Triggers

Rollback should be performed if any of the following occur after implementation:

- Endpoint returns incorrect data (schema violation)
- Endpoint allows forbidden input (token/secret leakage)
- Endpoint performs mutation (unexpected side effect)
- Endpoint makes external API call (unexpected dependency)
- Endpoint enables Stage C (policy violation)
- Security vulnerability discovered
- Performance degradation affecting other services

## 2. Rollback Steps

### Step 1: Disable Endpoint Route
Remove or comment the endpoint route registration so the service no longer serves the endpoint. The service continues running for other endpoints.

### Step 2: Remove Route Registration
Remove the lazy import and Route entry from the server routing configuration. This is a zero-downtime change for unrelated endpoints.

### Step 3: Restore Previous Commit
```bash
git revert <implementation-commit>
# or
git checkout <previous-stable-commit> -- path/to/changed/files
```

### Step 4: Preserve Documentation
All blueprint docs remain in the repository even after rollback. They document what was attempted and why it was rolled back.

### Step 5: Verify After Rollback
- Verify all existing frontend preview routes still return 200
- Verify no sidebar changes
- Verify all validators still pass
- Verify lint/typecheck/build pass
- Verify Stage C remains disabled
- Verify no DB write
- Verify no external control

## 3. No Migration Rollback Expected

Because the readonly API must not write to the database, **no database migration rollback is expected**. If a read-only implementation somehow introduced DB writes, both the code and any accidental DB state must be separately reverted.

## 4. No External State Rollback Expected

Because the implementation must not control external tools, **no external state rollback is expected**. If external control was somehow introduced, the external service state must be separately verified and reverted.

## 5. Verification Gate

After rollback, the following must be confirmed:

| Check | Expected |
|-------|----------|
| All preview routes | 200 OK |
| Sidebar unchanged | Same layout |
| Validators | All pass |
| Stage C | Disabled |
| DB write | Not performed |
| External control | Not performed |
| Backend code | Removed |

## Note

This document **defines the rollback plan only**. No rollback is performed in this phase. No git mutation is executed. This plan is for future implementation use.
