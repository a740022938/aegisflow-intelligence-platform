# AIP Runtime Readonly Status API Design

> **Design Version:** v0.2-preview
> **AIP Baseline:** v7.30.0-P1
> **Date:** 2026-05-19
> **Status:** frontend preview implemented — no backend implementation

## 1. Design Purpose

This document provides a design sketch for the P1 Runtime Readonly Status API Preview. The purpose is to:

- Define the readonly boundary for runtime status queries
- Establish response shapes for status, readiness, gates, and blockers
- Provide a reference for frontend preview development
- Document what is explicitly disallowed in readonly mode
- P1 frontend preview implemented at `/runtime-readonly-status-api-preview`

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

## 10. P1 Frontend Preview Implementation

The v7.30.0-P1 frontend preview implements:

| Aspect | Value |
|--------|-------|
| Route | `/runtime-readonly-status-api-preview` |
| Component | `RuntimeReadonlyStatusApiPreview` (9-section UI) |
| Registry | `runtime-readonly-status-api-registry.ts` (12 endpoints) |
| Validator | `runtime-readonly-status-api-validator.ts` (7 validation groups) |
| Permission evaluator entry | `pe-runtime-readonly-status-api-preview` |
| Center access entry | `runtime-readonly-status-api-preview` |
| Navigation exposure entry | `runtime-readonly-status-api-preview` |
| Governance console sync | 4 pages updated with links/snapshots |
| Traceability sync | 4 pages updated with readonly links |

All P1 work is **readonly static frontend**. No backend endpoint, no API call, no DB write, no external control, no Stage C.

## 11. Acceleration Pack (P2/P3/P4)

The v7.30.0-P2/P3/P4 Runtime Contract Acceleration Pack extends P1 with three more readonly preview pages:

| Phase | Route | Content |
|-------|-------|---------|
| P2 | `/runtime-dry-run-contract-preview` | 18 dry-run contract items (6 kinds) |
| P3 | `/runtime-audit-store-contract-preview` | 16 audit store contract items (7 kinds) |
| P4 | `/stage-c-preenable-review-preview` | 18 Stage C pre-enable review items (11 areas) |

All follow the same pattern as P1: hidden direct route, static registry + validator, cross-page and metadata sync.
