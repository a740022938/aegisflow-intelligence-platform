# AIP Backend Readonly API Implementation Approval Matrix

> **Phase:** v7.31.0-P1
> **Status:** APPROVED_AND_IMPLEMENTED
> **Purpose:** Define which capabilities can enter P1 backend skeleton and which remain blocked

| # | Capability | Endpoint | Method | Current Status | Can Enter P1 Skeleton? | Requires Human Approval? | Requires Stage C? | Writes DB? | External Control? | Mutation? | Risk | Decision | Reason |
|---|------------|----------|--------|----------------|------------------------|-------------------------|-------------------|------------|-------------------|------------|------|----------|--------|
| 1 | Runtime status summary | /runtime/status | GET | v7.31-P1 implemented | Candidate | Yes | No | No | No | No | Low | APPROVED | Readonly status summary from static registry |
| 2 | Runtime readiness | /runtime/readiness | GET | v7.31-P1 implemented | Candidate | Yes | No | No | No | No | Low | APPROVED | Readonly readiness indicators |
| 3 | Gate overview | /runtime/gates | GET | v7.31-P1 implemented | Candidate | Yes | No | No | No | No | Low | APPROVED | Readonly gate status from gate model |
| 4 | Blocker summary | /runtime/blockers | GET | v7.31-P1 implemented | Candidate | Yes | No | No | No | No | Low | APPROVED | Readonly blocker list from blocker matrix |
| 5 | Registry list | /runtime/registries | GET | Not designed | Defer | Yes | No | No | No | No | Medium | DEFERRED | Needs scope expansion |
| 6 | Risk summary | /runtime/risks | GET | Not designed | Defer | Yes | No | No | No | No | Medium | DEFERRED | Needs scope expansion |
| 7 | Audit preview | /runtime/audit-preview | GET | Not designed | Defer | Yes | No | No | No | No | Medium | DEFERRED | Needs scope expansion |
| 8 | Evidence schema | /runtime/evidence-schema | GET | Not designed | Defer | Yes | No | No | No | No | Medium | DEFERRED | Needs scope expansion |
| 9 | Rollback readiness | /runtime/rollback-readiness | GET | Not designed | Defer | Yes | No | No | No | No | Medium | DEFERRED | Needs scope expansion |
| 10 | Dry-run preview | /runtime/dry-run/preview | POST | Not implemented | No | N/A | Yes | No | No | Yes | High | BLOCKED | Execution requires Stage C |
| 11 | Approval request | /runtime/approval/request | POST | Not implemented | No | N/A | Yes | No | No | Yes | High | BLOCKED | Approval requires Stage C |
| 12 | Execute | /runtime/execute | POST | Not implemented | No | N/A | Yes | No | Yes | Yes | High | BLOCKED | Execution requires Stage C |
| 13 | Rollback | /runtime/rollback | POST | Not implemented | No | N/A | Yes | No | No | Yes | High | BLOCKED | Rollback requires Stage C |
| 14 | DB write | /runtime/db/write | POST | Not implemented | No | N/A | Yes | Yes | No | Yes | Critical | BLOCKED | DB write permanently denied |
| 15 | External control | /runtime/control | POST | Not implemented | No | N/A | Yes | No | Yes | Yes | Critical | BLOCKED | External control requires Stage C |
| 16 | Secret store | /runtime/secret/store | POST | Not implemented | No | N/A | Yes | Yes | No | Yes | Critical | BLOCKED | Secret storage permanently denied |
| 17 | Stage C enablement | /runtime/stage-c/enable | POST | Not implemented | No | N/A | Yes | No | No | Yes | Critical | BLOCKED | Stage C permanently disabled |

## Summary

| Decision | Count | Endpoints |
|----------|-------|-----------|
| Candidate for P1 skeleton | 4 | /runtime/status, /runtime/readiness, /runtime/gates, /runtime/blockers |
| Deferred | 5 | /runtime/registries, /runtime/risks, /runtime/audit-preview, /runtime/evidence-schema, /runtime/rollback-readiness |
| Blocked | 8 | All POST endpoints (dry-run, approval, execute, rollback, DB write, external control, secret store, Stage C) |

## Enforcement Rules

1. All P1 skeleton endpoints must be GET only, readonly, no DB, no external control, no Stage C
2. All deferred endpoints require separate human approval before implementation
3. All blocked endpoints must NEVER be implemented without Stage C enablement and human approval
4. Stage C enablement endpoint is permanently blocked per project policy
