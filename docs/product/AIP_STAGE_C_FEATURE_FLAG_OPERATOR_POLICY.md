# Stage C Feature Flag Operator Policy

**Date:** 2026-05-20
**Stage C:** DISABLED

## Policy

1. Feature flag must remain `off` by default
2. Only human owner can authorize flag change
3. Flag change must be documented in AIP report
4. Flag change must be committed separately
5. Flag change must have rollback plan ready
6. Flag change must have kill switch tested
7. Flag change must have smoke PASS before and after

## Prohibited

- Changing flag without human authorization
- Changing flag without rollback plan
- Changing flag without smoke
- Changing flag via UI (mutableFromUi must stay false)
- Enabling executor/POST/DB/external/connector alongside flag

## Audit Trail

Every flag change must record:
- Who authorized it
- When it occurred
- What the previous state was
- What the new state is
- Whether rollback was needed

## v7.40-P2 Addendum

P2 adds the following trial-specific policies:

1. Toggle trial requires human approval (template must be used)
2. Toggle trial must have rollback plan, smoke plan, and failure stop policy
3. Toggle trial does NOT enable Stage C
4. Toggle trial does NOT allow POST, DB write, executor, external control, or connector action
5. Toggle trial must produce a report with results and next steps
