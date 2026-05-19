# AIP Runtime Readonly Status API Preview

> **Preview Version:** v1.0-preview
> **AIP Baseline:** v7.31.0-P1
> **Date:** 2026-05-20
> **Status:** frontend preview + P1 backend skeleton live (4 GET endpoints at /api/runtime/*)

## 1. Preview Purpose

This document describes the frontend-only readonly preview page for the Runtime Status API contract. The preview provides:

- A visual endpoint catalog with status badges for 12 frozen endpoints
- Schema definitions board for request/response types
- Mock response examples for GET endpoints
- Gate model summary with 11 gates and current states
- Error model reference with 12 error codes
- Permissions model summary
- Implementation freeze checklist status
- Validator summary

## 2. Preview Details

| Aspect | Value |
|--------|-------|
| Route | `/runtime-readonly-status-api-preview` |
| Component | `RuntimeReadonlyStatusApiPreview` |
| Page type | Hidden direct route (not in sidebar) |
| Registry | `runtime-readonly-status-api-registry.ts` (12 endpoints) |
| Validator | `runtime-readonly-status-api-validator.ts` |
| Permission evaluator | `pe-runtime-readonly-status-api-preview` |
| Center access | `runtime-readonly-status-api-preview` |
| Navigation exposure | `runtime-readonly-status-api-preview` |

## 3. Readonly Safety Boundary

| Constraint | Status |
|------------|--------|
| Backend endpoint | NOT implemented |
| API call | NOT made |
| DB write | NOT performed |
| External control | NOT enabled |
| Stage C | NOT enabled |
| Sidebar entry | NOT added |
| i18n / layout / menu-registry | NOT modified |

## 4. Endpoint Catalog (12 Endpoints)

### GET Endpoints (contract_only)

| # | Endpoint | implementationStatus | currentAllowed | stageCRequired |
|---|----------|---------------------|----------------|----------------|
| 1 | GET /runtime/status | contract_only | documentation_only | false |
| 2 | GET /runtime/readiness | contract_only | documentation_only | false |
| 3 | GET /runtime/registries | contract_only | documentation_only | false |
| 4 | GET /runtime/risks | contract_only | documentation_only | false |
| 5 | GET /runtime/gates | contract_only | documentation_only | false |
| 6 | GET /runtime/audit-preview | contract_only | documentation_only | false |
| 7 | GET /runtime/evidence-schema | contract_only | documentation_only | false |
| 8 | GET /runtime/rollback-readiness | contract_only | documentation_only | false |

### POST Endpoints (not_implemented)

| # | Endpoint | implementationStatus | currentAllowed | stageCRequired |
|---|----------|---------------------|----------------|----------------|
| 9 | POST /runtime/dry-run/preview | not_implemented | false | true |
| 10 | POST /runtime/approval/request | not_implemented | false | true |
| 11 | POST /runtime/execute | not_implemented | false | true |
| 12 | POST /runtime/rollback | not_implemented | false | true |

## 5. Governance Console Integration

Links to this preview page have been added to:

- GovernanceConsolePreview (L section)
- GovernanceConsoleRiskDashboardPreview (API Contract Risk Reference)
- GovernanceConsoleDecisionPanelPreview (P1 next-step block)
- GovernanceConsoleReportPackPreview (API Contract section block)
- RuntimeRegistryPreview (traceability link)
- PermissionEvaluatorPreview (traceability link)
- AdvancedModeReadonly (traceability link)
- ConnectorCenterReadonly (readiness snapshot link)

## 6. Registry Integration

| Registry | Entry ID | Status |
|----------|----------|--------|
| Permission Evaluator | `pe-runtime-readonly-status-api-preview` | allow_hidden_direct |
| Navigation Exposure | `runtime-readonly-status-api-preview` | keep_direct_route |
| Center Access | `runtime-readonly-status-api-preview` | keep_hidden_direct |

## 8. Related Acceleration Pack (P2/P3/P4)

The v7.30.0-P2/P3/P4 Runtime Contract Acceleration Pack adds three more readonly preview pages:

| Phase | Route | Description |
|-------|-------|-------------|
| P2 | `/runtime-dry-run-contract-preview` | 18-item dry-run contract (request/response/gate/evidence/audit/rollback) |
| P3 | `/runtime-audit-store-contract-preview` | 16-item audit store contract (schema/retention/redaction/write policy) |
| P4 | `/stage-c-preenable-review-preview` | 18-item Stage C pre-enable human review pack (does NOT enable Stage C) |

All P2/P3/P4 pages follow the same pattern: hidden direct route, static registry+validator, readonly only.

## 7. Validation

The validator (`runtime-readonly-status-api-validator.ts`) checks:

- GET endpoints: mutatesState=false, writesDb=false, controlsExternalTool=false
- not_implemented endpoints: currentAllowed=false
- requiresStageC/writesDb/controlsExternalTool/critical endpoints: currentAllowed=false
- Forbidden fields required on mutatesState/writesDb endpoints
- Schema, gates, reason, nextAction required on all endpoints

## 8. Change Log

| Version | Date | Changes |
|---------|------|---------|
| v1.0-preview | 2026-05-19 | Initial frontend preview page with 12-endpoint catalog, 9-section UI, static registry + validator |

## v7.30 Final Seal + v7.31 Blueprint

- **v7.30 Final Seal Status:** V7_30_FINAL_SEAL_READY (commit f55f952)
- **v7.31 Backend Readonly API Blueprint:** See `AIP_BACKEND_READONLY_API_IMPLEMENTATION_BLUEPRINT.md` — design-only, not implemented
- **Backend endpoint:** NOT implemented (blueprint only)
- **Runtime implementation:** NOT implemented (blueprint only)
- **Stage C:** Permanently disabled
- **DB write:** Not performed
- **External control:** Not enabled
- **Tag/Release:** Not created

## v7.31-D2 Human Review Pack

- **Status:** PENDING_HUMAN_OWNER_REVIEW
- **P1 skeleton:** Not yet approved
- **Backend endpoint:** NOT implemented (human review pack only)
- **Stage C:** Permanently disabled
- **DB write:** Not performed
- **External control:** Not enabled
- **Tag/Release:** Not created
