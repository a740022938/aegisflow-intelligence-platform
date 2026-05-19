# Stage C Denial and Blocker Policy

> **Date:** 2026-05-20
> **Phase:** v7.34.0-D1

## Automatic Denial Triggers

1. **Validator Failure**: Any validator with blocking > 0 automatically denies Stage C readiness
2. **Evidence Gap**: Any required evidence missing triggers automatic denial
3. **Smoke Failure**: Smoke test not passing triggers automatic denial
4. **Safety Boundary Breach**: Any safety boundary reported as not confirmed triggers automatic denial
5. **Out of Date Evidence**: Evidence older than 24h triggers automatic denial (requires re-validation)
6. **Unknown Runtime State**: Server restart without re-smoke triggers automatic denial

## Conditional Approval Rules

Conditional approval is allowed when:

- All validators pass (blocking=0)
- All required evidence present and up to date
- Smoke passed within 24h
- Safety boundaries all confirmed
- Decision record complete and accurate
- Human owner explicitly approves

Conditional approval duration: 24h max. After 24h, re-validation required.

## Blocker Classification

| Level | Meaning | Action |
|-------|---------|--------|
| Blocking | Cannot proceed until resolved | Must fix and re-validate |
| Warning | Should review but not blocking | Operator acknowledges |
| Info | Informational only | No action required |

## Blocker Examples

| Blocker | Level | Resolution |
|---------|-------|------------|
| Stage C disabled not confirmed | Blocking | Verify runtime response |
| POST blocked not confirmed | Blocking | Verify runtime response |
| Validator not run | Blocking | Run validator suite |
| Evidence missing | Blocking | Collect required evidence |
| Smoke not run | Blocking | Execute smoke test |
| Decision record missing | Blocking | Create decision record |
| Server restarted without smoke | Blocking | Re-run smoke |
| Owner unconfirmed | Warning | Confirm owner availability |

## Invariant

```
Stage C remains disabled.
No runtime executor is implemented.
No POST runtime action is implemented.
No DB write is permitted.
No external control is permitted.
```
