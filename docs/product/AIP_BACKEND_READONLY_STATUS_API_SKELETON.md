# AIP Backend Readonly Status API Skeleton

> **Phase:** v7.31.0-P1
> **Status:** IMPLEMENTED
> **Date:** 2026-05-20

## Overview

The P1 skeleton implements 4 readonly GET endpoints that return static contract-defined status data. No runtime execution, no DB access, no external control, no Stage C.

## Endpoints

| Method | Path | Contract Path | Response |
|--------|------|---------------|----------|
| GET | `/api/runtime/status` | `/runtime/status` | Static status with readonly skeleton mode |
| GET | `/api/runtime/readiness` | `/runtime/readiness` | Static readiness with blocked capabilities |
| GET | `/api/runtime/gates` | `/runtime/gates` | Static gates (all pass) |
| GET | `/api/runtime/blockers` | `/runtime/blockers` | Static blockers (4 critical/high) |

## Implementation Details

- **Framework:** Fastify v5.3.3 (existing)
- **Route registration:** Module pattern (`registerReadonlyStatusRoutes`)
- **Mounting:** `apps/local-api/src/runtime/readonly-status.ts`
- **Registration:** Called in `apps/local-api/src/index.ts`
- **Auth:** Public (no JWT required)
- **Response source:** Static contract summaries (no DB, no API calls)

## Response Contracts

### `/api/runtime/status`
```json
{
  "ok": true,
  "scope": "runtime_readonly_status",
  "mode": "readonly_skeleton",
  "implementationStatus": "skeleton",
  "runtimeImplemented": false,
  "stageCEnabled": false,
  "dbWriteEnabled": false,
  "externalControlEnabled": false,
  "postEndpointsEnabled": false,
  "allowedMethods": ["GET"],
  "blockedMethods": ["POST", "PUT", "PATCH", "DELETE"],
  "source": "static_contract_summary",
  "version": "v7.31.0-P1"
}
```

### `/api/runtime/readiness`
```json
{
  "ok": true,
  "readiness": "readonly_skeleton_ready",
  "canExecuteRuntime": false,
  "canWriteDb": false,
  "canControlExternalTools": false,
  "canEnableStageC": false,
  "requiresHumanApprovalForNextPhase": true,
  "blockedCapabilities": [
    "post_runtime_execute",
    "post_runtime_rollback",
    "post_runtime_dry_run",
    "approval_queue",
    "audit_store",
    "evidence_store",
    "db_write",
    "external_control",
    "stage_c_enable"
  ]
}
```

### `/api/runtime/gates`
```json
{
  "ok": true,
  "gates": [
    {"id": "readonly_only", "status": "pass"},
    {"id": "post_endpoints_blocked", "status": "pass"},
    {"id": "db_write_disabled", "status": "pass"},
    {"id": "external_control_disabled", "status": "pass"},
    {"id": "stage_c_disabled", "status": "pass"}
  ]
}
```

### `/api/runtime/blockers`
```json
{
  "ok": true,
  "blockers": [
    {"id": "stage_c_disabled", "severity": "critical", "blocked": true},
    {"id": "db_write_blocked", "severity": "critical", "blocked": true},
    {"id": "external_control_blocked", "severity": "critical", "blocked": true},
    {"id": "post_endpoints_blocked", "severity": "high", "blocked": true}
  ]
}
```

## Safety

- No POST routes added
- No DB write
- No external control
- No Stage C enablement
- No runtime execution
- No secret/token handling
- No file system access
