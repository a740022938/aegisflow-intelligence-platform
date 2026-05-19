# AIP Runtime API Mock Examples

> **Mock Version:** v0.1-draft
> **AIP Baseline:** v7.30.0-D2
> **Date:** 2026-05-19
> **Status:** documentation-only mock examples — no mock server

## 1. Purpose

This document contains mock request/response examples for the Runtime API. All examples are documentation-only. No mock server is implemented. No endpoint is real.

## 2. GET /runtime/status Response Example

```json
{
  "runtimeStatus": "design_only",
  "overallHealth": "yellow",
  "implementationStatus": "contract_only",
  "currentAllowed": "documentation_only",
  "stageCEnabled": false,
  "dbWriteEnabled": false,
  "externalControlEnabled": false,
  "lastUpdated": "2026-05-19T00:00:00Z",
  "meta": {
    "contractVersion": "v1.freeze",
    "aipBaseline": "v7.30.0-D2",
    "implementationStatus": "contract_only",
    "stageCEnabled": false,
    "dbWriteEnabled": false,
    "externalControlEnabled": false
  }
}
```

## 3. GET /runtime/readiness Response Example

```json
{
  "overallReadiness": "not_ready",
  "gateReadiness": {
    "totalGates": 12,
    "passed": 1,
    "blocked": 11,
    "notApplicable": 0
  },
  "capabilityReadiness": {
    "totalCapabilities": 21,
    "readonlyReady": 9,
    "blocked": 12
  },
  "stageCRequired": true,
  "stageCEnabled": false,
  "implementationStatus": "contract_only"
}
```

## 4. GET /runtime/gates Response Example

```json
{
  "gates": [
    {
      "gateId": "readonly_gate",
      "status": "passed",
      "currentState": "enabled",
      "blockingReason": null,
      "requiresHumanAction": false,
      "stageCRelated": false
    },
    {
      "gateId": "stage_c_gate",
      "status": "blocked",
      "currentState": "disabled",
      "blockingReason": "Stage C permanently disabled by policy",
      "requiresHumanAction": true,
      "stageCRelated": true
    },
    {
      "gateId": "db_write_gate",
      "status": "blocked",
      "currentState": "blocked",
      "blockingReason": "DB write not authorized",
      "requiresHumanAction": true,
      "stageCRelated": true
    },
    {
      "gateId": "external_control_gate",
      "status": "blocked",
      "currentState": "blocked",
      "blockingReason": "External control blocked by policy",
      "requiresHumanAction": true,
      "stageCRelated": true
    }
  ],
  "summary": {
    "total": 12,
    "passed": 1,
    "blocked": 11,
    "notApplicable": 0
  },
  "implementationStatus": "contract_only"
}
```

## 5. GET /runtime/blockers Response Example

```json
{
  "blockers": [
    {
      "blockerId": "stage_c_disabled",
      "severity": "blocking",
      "status": "active",
      "requiresHumanAction": true,
      "relatedCapabilities": ["write", "execute", "external_control", "db_write"]
    },
    {
      "blockerId": "db_write_blocked",
      "severity": "blocking",
      "status": "active",
      "requiresHumanAction": true,
      "relatedCapabilities": ["approval_queue", "evidence_store", "audit_write"]
    },
    {
      "blockerId": "external_control_blocked",
      "severity": "blocking",
      "status": "active",
      "requiresHumanAction": true,
      "relatedCapabilities": ["runtime_execution", "tool_control"]
    },
    {
      "blockerId": "approval_queue_not_implemented",
      "severity": "blocking",
      "status": "active",
      "requiresHumanAction": true,
      "relatedCapabilities": ["approval_request"]
    },
    {
      "blockerId": "evidence_store_not_implemented",
      "severity": "blocking",
      "status": "active",
      "requiresHumanAction": true,
      "relatedCapabilities": ["evidence_capture"]
    },
    {
      "blockerId": "rollback_executor_not_implemented",
      "severity": "blocking",
      "status": "active",
      "requiresHumanAction": true,
      "relatedCapabilities": ["rollback_execution"]
    }
  ],
  "totalBlockers": 12,
  "activeBlockers": 12,
  "requiresHumanAction": 12,
  "implementationStatus": "contract_only"
}
```

## 6. POST /runtime/dry-run/preview — Blocked Response Example

```json
{
  "error": {
    "code": "STAGE_C_DISABLED",
    "message": "This operation requires Stage C which is currently disabled",
    "httpStatus": 403,
    "safeToShow": true,
    "retryable": false,
    "requiresHumanAction": true,
    "stageCRelated": true,
    "details": {
      "endpoint": "/runtime/dry-run/preview",
      "method": "POST",
      "implementationStatus": "not_implemented",
      "stageCRequired": true,
      "humanApprovalRequired": true
    }
  }
}
```

## 7. POST /runtime/execute — Blocked Response Example

```json
{
  "error": {
    "code": "RUNTIME_EXECUTION_BLOCKED",
    "message": "Runtime execution is blocked — requires Stage C, runtime evaluator, and permission function",
    "httpStatus": 403,
    "safeToShow": true,
    "retryable": false,
    "requiresHumanAction": true,
    "stageCRelated": true,
    "details": {
      "endpoint": "/runtime/execute",
      "method": "POST",
      "implementationStatus": "not_implemented",
      "stageCRequired": true,
      "humanApprovalRequired": true,
      "dbWriteRequired": true,
      "externalControlRequired": true,
      "auditRequired": true,
      "evidenceRequired": true,
      "rollbackRequired": true
    }
  }
}
```

## 8. POST /runtime/rollback — Blocked Response Example

```json
{
  "error": {
    "code": "ROLLBACK_REQUIRED",
    "message": "This operation requires rollback capability which is not implemented",
    "httpStatus": 403,
    "safeToShow": true,
    "retryable": false,
    "requiresHumanAction": true,
    "stageCRelated": true,
    "details": {
      "endpoint": "/runtime/rollback",
      "method": "POST",
      "implementationStatus": "not_implemented",
      "stageCRequired": true,
      "humanApprovalRequired": true,
      "dbWriteRequired": true,
      "externalControlRequired": true
    }
  }
}
```

## 9. Mock Example Rules

1. All examples include `"implementationStatus": "contract_only"` or `"not_implemented"` to clarify no real implementation
2. No example contains real tokens, API keys, passwords, private keys, or credentials
3. No example contains real local filesystem paths beyond the project root
4. No example implies the endpoint is implemented or functional
5. All blocked responses clearly indicate why the operation is blocked
6. Mock examples are for documentation and preview planning only
