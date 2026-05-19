# Stage C First Slice Implementation Spec

**Date:** 2026-05-20
**Status:** Draft — not implemented

## 1. Feature Flag Toggle UI

### State
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `enable_stage_c` | boolean | `false` | Master switch for Stage C features |
| `authorization_state` | enum | `PENDING` | `PENDING` / `GRANTED` / `REVOKED` |
| `toggle_locked` | boolean | `true` | Locked when authorization is PENDING |

### UI Behavior
- When `authorization_state === PENDING`: toggle is disabled, shows lock icon
- When `authorization_state === GRANTED`: toggle is enabled, user can flip
- On flip: shows confirmation dialog, requires reason input
- On confirm: logs audit event, updates state

### Data Flow (planned)
```
UI Toggle → Auth Gate → Audit Log → State Store → Status API
```

## 2. Kill Switch UI

### State
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `emergency_stage_c_disable` | boolean | `false` | Emergency disable |
| `kill_switch_active` | boolean | `false` | Computed from above |

### UI Behavior
- Always enabled (kill switch must always be accessible)
- On activate: red confirmation dialog, requires reason
- On confirm: forces `enable_stage_c` to `false`, logs audit event
- Deactivate: requires authorization

### Override Logic
```
if (kill_switch_active) {
  enable_stage_c = false; // forced
}
```

## 3. Readonly Status API

### Endpoint
```
GET /api/v1/stage-c/status
```

### Response
```json
{
  "enabled": false,
  "killSwitchActive": false,
  "authorizationState": "PENDING",
  "lastToggleAt": null,
  "lastToggleBy": null
}
```

### Readonly
- No POST/PUT/DELETE methods
- No mutation parameters
- No side effects

## 4. Audit Events

| Event | Trigger | Payload |
|-------|---------|---------|
| `stage_c.feature_flag.toggled` | Flag state change | `{ from, to, reason, toggledBy }` |
| `stage_c.kill_switch.activated` | Kill switch on | `{ reason, activatedBy }` |
| `stage_c.kill_switch.deactivated` | Kill switch off | `{ reason, deactivatedBy }` |
| `stage_c.status_api.called` | Status API access | `{ ip, timestamp }` |
| `stage_c.unauthorized_access.attempted` | Unauthorized toggle | `{ action, timestamp }` |

## 5. Validation Gates

Per the go/no-go criteria from v7.37 D1:
- typecheck PASS
- tests PASS
- build PASS
- safety search 0 issues
- git diff --check clean
- authorization != PENDING
- kill switch inactive
- feature flag default false
