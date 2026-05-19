# AIP Runtime API Contract Freeze

> **Contract Version:** v1.freeze
> **AIP Baseline:** v7.30.0-D2
> **Date:** 2026-05-19
> **Status:** docs-only contract freeze — no backend implementation

## 1. Contract Freeze Purpose

This document freezes the Runtime API v1 contract for the AegisFlow Intelligence Platform. The freeze establishes:

- A definitive endpoint catalog with schemas, gates, and status
- Clear boundaries between contract design and backend implementation
- Explicit documentation of what is frozen vs what requires future implementation
- A reference for frontend preview planning without backend dependency

## 2. Non-Goals

The following are explicitly out of scope for this contract freeze:

- Backend endpoint implementation
- Runtime service creation
- Database write enablement
- Stage C enablement
- External tool control
- Mock server deployment
- API gateway deployment
- Authentication/authorization implementation
- Audit logger implementation
- Evidence store implementation
- Approval queue implementation
- Rollback executor implementation

## 3. Current Status

| Aspect | Status |
|--------|--------|
| Documentation | frozen (v1.freeze) |
| Backend endpoint | not implemented |
| Runtime service | not implemented |
| DB write | not enabled |
| Stage C | disabled |
| External control | blocked |
| Mock server | not implemented |
| Frontend preview | P1 readonly preview page created (hidden direct, no backend) |

## 4. Contract Version

| Field | Value |
|-------|-------|
| runtime_api_contract_version | v1.freeze |
| aip_baseline | v7.30.0-D2 |
| freeze_date | 2026-05-19 |
| status | contract_only |
| implementation_status | not_implemented |

## 5. Endpoint Catalog

### 5.1 GET /runtime/status

| Field | Value |
|-------|-------|
| Purpose | Retrieve runtime overall status summary |
| Method | GET |
| Request Schema | None |
| Response Schema | RuntimeStatus |
| implementationStatus | contract_only |
| stageCRequired | false (read-only design) |
| humanApprovalRequired | false |
| dbWrite | false |
| externalControl | false |
| auditRequired | false |
| evidenceRequired | false |
| rollbackRequired | false |
| currentAllowed | documentation_only |

### 5.2 GET /runtime/readiness

| Field | Value |
|-------|-------|
| Purpose | Retrieve runtime readiness summary |
| Method | GET |
| Request Schema | None |
| Response Schema | RuntimeReadiness |
| implementationStatus | contract_only |
| stageCRequired | false (read-only design) |
| humanApprovalRequired | false |
| dbWrite | false |
| externalControl | false |
| auditRequired | false |
| evidenceRequired | false |
| rollbackRequired | false |
| currentAllowed | documentation_only |

### 5.3 GET /runtime/registries

| Field | Value |
|-------|-------|
| Purpose | Retrieve runtime registry items |
| Method | GET |
| Request Schema | None |
| Response Schema | RuntimeRegistryList |
| implementationStatus | contract_only |
| stageCRequired | false (read-only design) |
| humanApprovalRequired | false |
| dbWrite | false |
| externalControl | false |
| auditRequired | false |
| evidenceRequired | false |
| rollbackRequired | false |
| currentAllowed | documentation_only |

### 5.4 GET /runtime/risks

| Field | Value |
|-------|-------|
| Purpose | Retrieve runtime risk summary |
| Method | GET |
| Request Schema | None |
| Response Schema | RiskSummary |
| implementationStatus | contract_only |
| stageCRequired | false (read-only design) |
| humanApprovalRequired | false |
| dbWrite | false |
| externalControl | false |
| auditRequired | false |
| evidenceRequired | false |
| rollbackRequired | false |
| currentAllowed | documentation_only |

### 5.5 GET /runtime/gates

| Field | Value |
|-------|-------|
| Purpose | Retrieve runtime gate status summary |
| Method | GET |
| Request Schema | None |
| Response Schema | GateSummary |
| implementationStatus | contract_only |
| stageCRequired | false (read-only design) |
| humanApprovalRequired | false |
| dbWrite | false |
| externalControl | false |
| auditRequired | false |
| evidenceRequired | false |
| rollbackRequired | false |
| currentAllowed | documentation_only |

### 5.6 GET /runtime/audit-preview

| Field | Value |
|-------|-------|
| Purpose | Retrieve audit event preview models |
| Method | GET |
| Request Schema | None |
| Response Schema | AuditPreviewSummary |
| implementationStatus | contract_only |
| stageCRequired | false (read-only design) |
| humanApprovalRequired | false |
| dbWrite | false |
| externalControl | false |
| auditRequired | false |
| evidenceRequired | false |
| rollbackRequired | false |
| currentAllowed | documentation_only |

### 5.7 GET /runtime/evidence-schema

| Field | Value |
|-------|-------|
| Purpose | Retrieve evidence schema summary |
| Method | GET |
| Request Schema | None |
| Response Schema | EvidenceSchemaSummary |
| implementationStatus | contract_only |
| stageCRequired | false (read-only design) |
| humanApprovalRequired | false |
| dbWrite | false |
| externalControl | false |
| auditRequired | false |
| evidenceRequired | false |
| rollbackRequired | false |
| currentAllowed | documentation_only |

### 5.8 GET /runtime/rollback-readiness

| Field | Value |
|-------|-------|
| Purpose | Retrieve rollback readiness summary |
| Method | GET |
| Request Schema | None |
| Response Schema | RollbackReadinessSummary |
| implementationStatus | contract_only |
| stageCRequired | false (read-only design) |
| humanApprovalRequired | false |
| dbWrite | false |
| externalControl | false |
| auditRequired | false |
| evidenceRequired | false |
| rollbackRequired | false |
| currentAllowed | documentation_only |

### 5.9 POST /runtime/dry-run/preview

| Field | Value |
|-------|-------|
| Purpose | Generate a dry-run plan preview |
| Method | POST |
| Request Schema | DryRunPreviewRequest |
| Response Schema | DryRunPreviewResponse |
| implementationStatus | not_implemented |
| stageCRequired | true |
| humanApprovalRequired | true |
| dbWrite | false |
| externalControl | false |
| auditRequired | true |
| evidenceRequired | false |
| rollbackRequired | false |
| currentAllowed | false |

### 5.10 POST /runtime/approval/request

| Field | Value |
|-------|-------|
| Purpose | Request human approval for a runtime action |
| Method | POST |
| Request Schema | ApprovalRequest |
| Response Schema | ApprovalRequestResponse |
| implementationStatus | not_implemented |
| stageCRequired | true |
| humanApprovalRequired | true |
| dbWrite | true |
| externalControl | false |
| auditRequired | true |
| evidenceRequired | true |
| rollbackRequired | true |
| currentAllowed | false |

### 5.11 POST /runtime/execute

| Field | Value |
|-------|-------|
| Purpose | Execute a runtime action |
| Method | POST |
| Request Schema | ExecuteRequest |
| Response Schema | ExecuteResponse |
| implementationStatus | not_implemented |
| stageCRequired | true |
| humanApprovalRequired | true |
| dbWrite | true |
| externalControl | true |
| auditRequired | true |
| evidenceRequired | true |
| rollbackRequired | true |
| currentAllowed | false |

### 5.12 POST /runtime/rollback

| Field | Value |
|-------|-------|
| Purpose | Execute a rollback for a completed action |
| Method | POST |
| Request Schema | RollbackRequest |
| Response Schema | RollbackResponse |
| implementationStatus | not_implemented |
| stageCRequired | true |
| humanApprovalRequired | true |
| dbWrite | true |
| externalControl | true |
| auditRequired | true |
| evidenceRequired | true |
| rollbackRequired | true |
| currentAllowed | false |

## 6. Endpoint Status Summary

| Endpoint | Method | implementationStatus | currentAllowed | stageCRequired | humanApprovalRequired |
|----------|--------|---------------------|----------------|----------------|----------------------|
| /runtime/status | GET | contract_only | documentation_only | false | false |
| /runtime/readiness | GET | contract_only | documentation_only | false | false |
| /runtime/registries | GET | contract_only | documentation_only | false | false |
| /runtime/risks | GET | contract_only | documentation_only | false | false |
| /runtime/gates | GET | contract_only | documentation_only | false | false |
| /runtime/audit-preview | GET | contract_only | documentation_only | false | false |
| /runtime/evidence-schema | GET | contract_only | documentation_only | false | false |
| /runtime/rollback-readiness | GET | contract_only | documentation_only | false | false |
| /runtime/dry-run/preview | POST | not_implemented | false | true | true |
| /runtime/approval/request | POST | not_implemented | false | true | true |
| /runtime/execute | POST | not_implemented | false | true | true |
| /runtime/rollback | POST | not_implemented | false | true | true |

## 7. Freeze Rules

1. No endpoint in this catalog shall be implemented without a dedicated implementation task.
2. Readonly GET endpoints (contract_only) may be reclassified to implemented only after human approval, Stage C review, and backend implementation task.
3. POST endpoints (not_implemented) require Stage C activation, human approval, and full implementation pack before any implementation.
4. The contract version (v1.freeze) shall not change without a new contract freeze document.
5. Any change to this contract requires a new AIP phase with documented rationale.

## 8. Change Control

| Change Type | Required Action |
|-------------|----------------|
| Add new endpoint | New AIP phase + contract freeze update |
| Modify existing endpoint schema | New AIP phase + schema change review |
| Change implementationStatus | Dedicated implementation task + human approval |
| Change currentAllowed | Human approval + Stage C review (if write/execute) |
| Deprecate endpoint | New AIP phase + deprecation notice |
| Bump contract version | New AIP phase + new freeze document |

## 9. Future Implementation Gates

Before any endpoint in this contract can be implemented:

1. Contract freeze review completed and signed off by human project owner
2. Blocker matrix reviewed — all relevant blockers must be resolved
3. Stage C gate reviewed — Stage C must be enabled for any POST endpoint
4. DB write policy reviewed — required for any endpoint with dbWrite=true
5. External control policy reviewed — required for any endpoint with externalControl=true
6. Secret handling policy reviewed — required for any endpoint with evidence capture
7. Audit logger implementation — required for any endpoint with auditRequired=true
8. Evidence store implementation — required for any endpoint with evidenceRequired=true
9. Rollback executor implementation — required for any endpoint with rollbackRequired=true
10. Human approval queue implementation — required for any endpoint with humanApprovalRequired=true

## 10. Frontend Preview (v7.30.0-P1)

A frontend-only readonly preview page has been implemented:

| Aspect | Value |
|--------|-------|
| Route | `/runtime-readonly-status-api-preview` |
| Component | `RuntimeReadonlyStatusApiPreview` |
| Registry | `runtime-readonly-status-api-registry.ts` (12 endpoints) |
| Validator | `runtime-readonly-status-api-validator.ts` |
| Type | Hidden direct route (not in sidebar) |
| Safety | No backend endpoint, no API call, no DB write, no external control, no Stage C |

The preview page displays:

## 11. Acceleration Pack Extensions (P2/P3/P4)

Following P1, the v7.30.0-P2/P3/P4 acceleration pack adds three related readonly preview pages:

| Phase | Route | Items | Safety |
|-------|-------|-------|--------|
| P2 | `/runtime-dry-run-contract-preview` | 18 (6 kinds) | Contract only, no dry-run execution |
| P3 | `/runtime-audit-store-contract-preview` | 16 (7 kinds) | Contract only, no store creation |
| P4 | `/stage-c-preenable-review-preview` | 18 (11 areas) | Review only, does NOT enable Stage C |

All pages are hidden direct routes, not in sidebar, readonly only.

The preview page displays:
- Endpoint catalog with status badges (GET contract_only / POST not_implemented)
- Schema board, mock responses, gate model, error model
- Permissions model, implementation freeze checklist, validator summary

## 12. Contract Boundary Enforcement

- This document is a contract freeze — it does not implement any endpoint
- No backend code shall be written against this contract without a dedicated implementation task
- No mock server shall be deployed based on this contract without human approval
- This contract freeze does not modify apps/local-api, package.json, or any lock files
- This contract freeze does not enable Stage C, DB write, or external control
- The v7.30.0-P1 frontend preview is a readonly static page, not a backend endpoint
