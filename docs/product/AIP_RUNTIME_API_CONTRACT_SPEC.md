# Runtime API Contract Spec

**Status:** v7.30.0-D2 Contract Freeze
**Implementation Status:** Not implemented (contract freeze v1.freeze)
**Backend:** Not deployed
**Stage C:** Disabled

> This document is superseded by AIP_RUNTIME_API_CONTRACT_FREEZE.md (v7.30.0-D2). The contract freeze document provides the definitive endpoint catalog, schema definitions, and freeze rules.

## 1. Goals

- Define future API contracts for runtime governance operations
- Provide request/response schema sketches for frontend planning
- Establish gate and audit requirements per endpoint
- Create a blueprint that backend teams can implement later

## 2. Non-Goals

- Implement any backend endpoint
- Modify `apps/local-api/`
- Deploy API routes
- Enable Stage C
- Execute real runtime operations

## 3. Endpoint Drafts

### 3.1 GET /runtime/registry

| Field | Value |
|-------|-------|
| Purpose | Retrieve runtime registry items |
| Required Gates | `readonly_only` |
| Audit | `view` event |
| Rollback | N/A (readonly) |
| Implementation | NOT IMPLEMENTED |

**Request:** None

**Response Sketch:**
```json
{
  "items": [
    {
      "id": "string",
      "targetKind": "connector | external_tool | ...",
      "actionLevel": "L0_VIEW_STATIC | ...",
      "risk": "low | medium | high | critical",
      "allowedNow": false,
      "gates": ["readonly_only", "no_external_control"]
    }
  ],
  "validation": {
    "blocking": 0,
    "warning": 0,
    "pass": true
  }
}
```

### 3.2 GET /runtime/dry-run-plans

| Field | Value |
|-------|-------|
| Purpose | Retrieve dry-run plans |
| Required Gates | `readonly_only` |
| Audit | `view` event |
| Rollback | N/A (readonly) |
| Implementation | NOT IMPLEMENTED |

**Response Sketch:**
```json
{
  "plans": [
    {
      "id": "string",
      "target": "openclaw | comfyui | ...",
      "mode": "static_preview | synthetic_plan | ...",
      "status": "preview_ready | design_only | blocked"
    }
  ]
}
```

### 3.3 GET /runtime/audit-preview

| Field | Value |
|-------|-------|
| Purpose | Retrieve audit event preview models |
| Required Gates | `readonly_only`, `no_audit_write` |
| Audit | `view` event |
| Rollback | N/A (readonly) |
| Implementation | NOT IMPLEMENTED |

**Response Sketch:**
```json
{
  "events": [
    {
      "id": "string",
      "source": "runtime_registry | dry_run_plan | ...",
      "eventType": "view | plan_generated | ...",
      "risk": "low | medium | high | critical",
      "writeNow": false
    }
  ]
}
```

### 3.4 POST /runtime/dry-run-plan/preview

| Field | Value |
|-------|-------|
| Purpose | Generate a dry-run plan preview |
| Required Gates | `readonly_only`, `no_external_control` |
| Audit | `plan_generated` event |
| Rollback | N/A (preview only) |
| Implementation | NOT IMPLEMENTED |

**Request Sketch:**
```json
{
  "targetId": "string",
  "planType": "static | synthetic"
}
```

**Response Sketch:**
```json
{
  "planId": "string",
  "planSteps": [],
  "gates": [],
  "blockedActions": []
}
```

### 3.5 POST /runtime/approval/request

| Field | Value |
|-------|-------|
| Purpose | Request human approval for a runtime action |
| Required Gates | `readonly_only`, `human_approval_required`, `no_db_write` |
| Audit | `human_approval_required` event |
| Rollback | N/A (request only) |
| Implementation | NOT IMPLEMENTED |

**Request Sketch:**
```json
{
  "targetId": "string",
  "actionLevel": "L4_HUMAN_APPROVED_EXECUTE",
  "dryRunPlanId": "string",
  "reason": "string"
}
```

### 3.6 POST /runtime/rollback/preview

| Field | Value |
|-------|-------|
| Purpose | Preview rollback plan for a completed action |
| Required Gates | `readonly_only`, `stage_c_disabled` |
| Audit | `view` event |
| Rollback | N/A (preview only) |
| Implementation | NOT IMPLEMENTED |

**Response Sketch:**
```json
{
  "rollbackSteps": [],
  "reversible": true,
  "estimatedImpact": "string"
}
```

## 4. Error Model

```json
{
  "error": {
    "code": "GATE_BLOCKED | NOT_IMPLEMENTED | READONLY_MODE",
    "message": "string",
    "blockedGates": ["readonly_only", "stage_c_disabled"],
    "implementationStatus": "design_only"
  }
}
```

## 5. Security Model

- All endpoints require `readonly_only` gate
- No endpoints perform writes
- No endpoints control external tools
- No endpoints enable Stage C
- No authentication/authorization in v7.28 (deferred)

## 6. Stage C Before Implementation

- All POST endpoints are explicitly marked as `NOT IMPLEMENTED`
- Stage C must be enabled before any real execution endpoint
- Stage C is disabled in v7.28
- No endpoint shall execute without passing all required gates
- v7.28.0-P1 Governance State Machine Preview uses static registry data — no API calls to any endpoint

## 7. v7.28.0-P3 Evidence Schema Preview

**P3 Evidence Schema Preview** is available as a readonly page at `/evidence-schema-preview` (hidden direct). The preview displays evidence types and schema draft only — **no evidence writer, no evidence store, no secret capture, no DB write, no external control, and Stage C is disabled**. No API endpoint is associated with this preview.
