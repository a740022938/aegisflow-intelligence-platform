# AIP Backend Readonly API Endpoint Whitelist

> **Phase:** v7.31.0-P1
> **Status:** P1 endpoints implemented — 4 GET readonly endpoints live at /api/runtime/*
> **Purpose:** Define which future endpoints are allowed and which are permanently blocked

## Allowed Future Endpoints

| Method | Path | Current Status | Future Status | Requires Human Approval | Requires Stage C | Writes DB | External Control | Implementation Allowed Now | Reason |
|--------|------|---------------|---------------|------------------------|-----------------|-----------|-----------------|---------------------------|--------|
| GET | `/runtime/status` | Design-only | Allowed when implemented | Yes | No | No | No | No | Readonly status summary |
| GET | `/runtime/readiness` | Design-only | Allowed when implemented | Yes | No | No | No | No | Readonly readiness indicators |
| GET | `/runtime/gates` | Design-only | Allowed when implemented | Yes | No | No | No | No | Readonly gate overview |
| GET | `/runtime/blockers` | Design-only | Allowed when implemented | Yes | No | No | No | No | Readonly blocker summary |

## Permanently Blocked Endpoints

| Method | Path | Blocked Reason |
|--------|------|----------------|
| POST | `/runtime/dry-run/preview` | Dry-run execution — blocked in v7.x |
| POST | `/runtime/approval/request` | Approval processing — requires Stage C |
| POST | `/runtime/execute` | Execution — requires Stage C |
| POST | `/runtime/rollback` | Rollback — requires Stage C |
| POST | `/runtime/candidate/process` | Candidate processing — requires Stage C |
| POST | `/runtime/audit/write` | Audit store write — requires Stage C |
| POST | `/runtime/evidence/store` | Evidence store — requires Stage C |
| POST | `/runtime/deploy` | Deployment — requires Stage C |
| POST | `/runtime/sync` | External sync — requires Stage C |
| POST | `/runtime/control` | External tool control — requires Stage C |
| POST | `/runtime/secret/store` | Secret/token storage — permanently denied |
| POST | `/runtime/db/write` | DB write — permanently denied in readonly mode |

## Enforcement

- All POST endpoints have `implementationAllowedNow=false`
- All write/execution/external control endpoints are blocked until Stage C is enabled (policy decision)
- Secret/token storage endpoints are permanently denied per project security policy
- Endpoint whitelist must be reviewed and approved by human project owner before any implementation

## v7.31-D2 Human Review Pack

- **Status:** PENDING_HUMAN_OWNER_REVIEW
- **P1 skeleton:** Not yet approved
- **Backend endpoint:** NOT implemented (human review pack only)
- **Stage C:** Permanently disabled
- **DB write:** Not performed
- **External control:** Not enabled
- **Tag/Release:** Not created
