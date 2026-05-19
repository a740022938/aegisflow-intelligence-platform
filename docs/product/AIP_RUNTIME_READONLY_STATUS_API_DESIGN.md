# AIP Runtime Readonly Status API Design

> **Design Version:** v0.1-draft
> **AIP Baseline:** v7.30.0-D2
> **Date:** 2026-05-19
> **Status:** design-only — no backend implementation

## 1. Design Purpose

This document provides a design sketch for a future P1 Readonly Status API. The purpose is to:

- Define the readonly boundary for runtime status queries
- Establish response shapes for status, readiness, gates, and blockers
- Provide a reference for frontend preview development
- Document what is explicitly disallowed in readonly mode

## 2. Readonly Boundary

The Readonly Status API is strictly limited to:

- Querying runtime status and readiness
- Reading gate and blocker summaries
- Viewing validator and preview route summaries
- All operations are read-only queries — no mutation, no execution, no write

## 3. Allowed Readonly Resources

| Resource | Description | Current Data Source |
|----------|-------------|---------------------|
| Runtime status summary | Overall runtime health and state | Static design model |
| Readiness summary | Gate readiness and capability readiness | Static design model |
| Validator summaries | Validator pass/fail/blocking counts | Static design model |
| Hidden preview route summary | All hidden direct preview routes and their status | Static design model |
| Gate state summary | Current state of all gates | Static design model |
| Blocker summary | Active blockers and their resolution status | Static design model |

## 4. Explicitly Disallowed

The following operations are explicitly disallowed in the Readonly Status API:

| Operation | Reason |
|-----------|--------|
| Approval mutation | Requires human approval queue + DB write |
| Candidate processing | Requires DB write + Stage C |
| DB write | Blocked by project policy |
| External control | Blocked by project policy |
| Dry-run execution | Requires Stage C + runtime evaluator |
| Rollback execution | Requires Stage C + rollback executor |
| Evidence capture | Requires evidence store + secret handling policy |
| Audit write | Requires audit logger implementation |
| Registry mutation | Blocked by readonly policy |
| Git mutation | Blocked by readonly policy |
| Secret/token storage | Blocked by design |

## 5. Future Endpoint Sketches

### 5.1 GET /runtime/status

Request: None

Response:
```json
{
  "runtimeStatus": "design_only | preview_ready | blocked",
  "overallHealth": "green | yellow | red",
  "implementationStatus": "contract_only",
  "currentAllowed": "documentation_only",
  "stageCEnabled": false,
  "dbWriteEnabled": false,
  "externalControlEnabled": false,
  "lastUpdated": "2026-05-19T00:00:00Z"
}
```

### 5.2 GET /runtime/readiness

Request: None

Response:
```json
{
  "overallReadiness": "not_ready",
  "gateReadiness": {
    "totalGates": 12,
    "passed": 0,
    "blocked": 12,
    "notApplicable": 0
  },
  "capabilityReadiness": {
    "totalCapabilities": 21,
    "readonlyReady": 9,
    "blocked": 12
  },
  "stageCRequired": true,
  "stageCEnabled": false
}
```

### 5.3 GET /runtime/gates

Request: None

Response:
```json
{
  "gates": [
    {
      "id": "readonly_gate",
      "status": "passed",
      "currentState": "enabled"
    },
    {
      "id": "stage_c_gate",
      "status": "blocked",
      "currentState": "disabled",
      "blockingReason": "Stage C permanently disabled by policy"
    },
    {
      "id": "db_write_gate",
      "status": "blocked",
      "currentState": "blocked",
      "blockingReason": "DB write not authorized"
    },
    {
      "id": "external_control_gate",
      "status": "blocked",
      "currentState": "blocked",
      "blockingReason": "External control blocked by policy"
    }
  ],
  "summary": {
    "total": 12,
    "passed": 1,
    "blocked": 11,
    "notApplicable": 0
  }
}
```

### 5.4 GET /runtime/blockers

Request: None

Response:
```json
{
  "blockers": [
    {
      "id": "stage_c_disabled",
      "severity": "blocking",
      "status": "active",
      "requiresHumanAction": true,
      "relatedCapabilities": ["write", "execute", "external_control", "db_write"]
    },
    {
      "id": "db_write_blocked",
      "severity": "blocking",
      "status": "active",
      "requiresHumanAction": true
    },
    {
      "id": "external_control_blocked",
      "severity": "blocking",
      "status": "active",
      "requiresHumanAction": true
    }
  ],
  "totalBlockers": 12,
  "activeBlockers": 12,
  "requiresHumanAction": 12
}
```

## 6. Error Model References

All readonly status endpoints use the standard Runtime API error model (see AIP_RUNTIME_API_ERROR_MODEL.md). Key error codes for readonly endpoints:

- CONTRACT_ONLY — endpoint is documented but not implemented
- NOT_IMPLEMENTED — endpoint contract exists but no backend
- STAGE_C_DISABLED — operation requires Stage C which is disabled

## 7. Permission Model References

All readonly status endpoints require only the `readonly_gate` permission. No write/execute/control permissions are required or granted.

See AIP_RUNTIME_API_GATE_AND_PERMISSION_MODEL.md for complete gate definitions.

## 8. Stage C Relationship

- The Readonly Status API does not require Stage C for design or documentation
- Any future backend implementation of readonly endpoints must pass Stage C review if connecting to live runtime data
- The Readonly Status API is not a path to Stage C enablement — Stage C remains independently gated
- All readonly endpoints explicitly report stageCEnabled=false until Stage C is activated

## 9. Design Constraints

- This is a design document only — no backend endpoint is created
- No runtime service is read or modified
- No scheduler or worker is created
- No database connection is established
- No external API is called
- No authentication/authorization implementation is included
