# Stage C First Implementation Slice Scope

**Date:** 2026-05-20
**Status:** Planning only — not implemented

## Overview

The first implementation slice defines the minimal set of capabilities that can be safely enabled when human owner authorization is granted. This scope is deliberately narrow to ensure reversibility and auditability.

---

## In Scope

### 1. Feature Flag Toggle (Readonly + Authorized Mutation)

- View current `enable_stage_c` state
- Toggle state (requires human authorization + audit log)
- Feature flag default: `false`
- Toggle blocked when: `authorization === PENDING` or kill switch active

### 2. Kill Switch UI

- View current `emergency_stage_c_disable` state
- Toggle kill switch (requires human authorization + audit log)
- Kill switch overrides feature flag when active

### 3. Readonly Status API

- `GET /api/v1/stage-c/status`
- Returns: `{ enabled: boolean, killSwitchActive: boolean, authorizationState: string }`
- No mutation endpoint

### 4. Audit Event Logging

- Track all Stage C state transitions
- Readonly view of recent events
- Events: flag toggle, kill switch, unauthorized access, status API access

### 5. Evidence Store (Readonly)

- View current evidence records for Stage C
- No write capability in first slice

---

## Out of Scope (even after authorization)

| Capability | Reason |
|------------|--------|
| POST /enable | Requires multi-step human approval workflow |
| POST /rollback | Requires rollback engine |
| POST /restart | Requires restart infrastructure |
| DB migration | Requires full production migration plan |
| Executor runtime | Requires runtime evaluator |
| External control | Requires connector policy engine |
| Connector action | Requires connector runtime |
| Sidebar exposure | Stage C remains hidden |
| Tag/release | No automation |
| Authorization auto-approval | Always requires human |

---

## Safety Constraints

| Constraint | Value |
|------------|-------|
| `enable_stage_c` default | `false` |
| Kill switch default | `false` |
| Authorization required for toggle | Yes |
| Audit log required | Yes |
| Rollback plan required | Yes |
| Validation required before merge | Yes |
| Safety search required | Yes |
