# Stage C Feature Flag Toggle Rollback Plan

**Date:** 2026-05-20
**Stage C:** DISABLED

## Pre-Toggle State

- Feature flag: off
- Stage C: disabled
- POST: blocked
- DB write: forbidden
- Executor: not implemented
- External control: forbidden
- Connector action: forbidden

## Rollback Procedure

1. **Detect failure**: Monitor smoke results, status API, and safety boundaries
2. **Stop trial**: Set feature flag back to `off`
3. **Verify**: Run post-rollback smoke to confirm flag is off
4. **Audit**: Log rollback event including trigger reason
5. **Report**: Document rollback in AIP report

## Auto Rollback Conditions

- Unexpected POST endpoint detected
- DB write attempt detected
- Executor becomes available
- External control becomes available
- Connector action becomes available
- Stage C becomes enabled without authorization
- Smoke fails after toggle
- Safety search discovers new issue

## Rollback Safety

| Check | Status |
|-------|--------|
| Flag revert possible | Yes (config change) |
| Code revert needed | No |
| DB migration revert | N/A (no DB write) |
| Data loss risk | None |
| User impact | Low (readonly page) |
| Rollback time | < 5 minutes |

## v7.40-P3 Addendum

P3 dry trial did not require rollback. Rollback plan remains available for future use.
