# AIP Backend Readonly API Implementation Blueprint

> **Phase:** v7.31.0-D1
> **Status:** Design-only — no backend code written
> **Goal:** Define the implementation plan for a readonly status-only backend API service

## 1. Goal

Implement a **readonly backend status API** that serves contract-only GET endpoints. This backend will:

- Serve static registry summary data from the existing frontend registries
- Expose validator results as lightweight status endpoints
- Provide readiness, gate, and blocker summaries
- Remain strictly readonly — no mutation, no DB write, no external control, no Stage C

## 2. Non-Goals

- No POST mutation endpoints
- No dry-run execution
- No audit store creation
- No DB write of any kind
- No approval/candidate processing
- No external tool control
- No Stage C enablement
- No secret/token storage
- No file system mutation
- No git repository mutation

## 3. First Candidate Endpoints

| Method | Path | Description | Source |
|--------|------|-------------|--------|
| GET | `/runtime/status` | Overall runtime status summary | Registry summaries |
| GET | `/runtime/readiness` | Component readiness indicators | Validator summaries |
| GET | `/runtime/gates` | Gate status overview | Gate model data |
| GET | `/runtime/blockers` | Current blocking issues | Blocker matrix |

All endpoints are `contract_only` — they serve only the data already defined in existing registries and docs.

## 4. Data Sources

- `runtime-readonly-status-api-registry.ts` — endpoint catalog
- `runtime-dry-run-contract-registry.ts` — dry-run contract items
- `runtime-audit-store-contract-registry.ts` — audit store contract items
- `stage-c-preenable-review-registry.ts` — Stage C review items
- All corresponding validators — blocking/warning/info counts
- Docs-defined contract data (gate model, error model, schema catalog)

No live external data sources. No real-time monitoring. No webhook integration.

## 5. Implementation Boundaries

| Boundary | Rule |
|----------|------|
| Mutation | No mutation operations of any kind |
| Worker | No background workers or schedulers |
| External control | No external API calls |
| Secret input | No token/API key/password/secret input |
| DB write | No database write of any kind |
| Stage C | No Stage C enablement code |
| Service | Standalone readonly service only |

## 6. Future Implementation Prerequisites

- Human project owner approval
- Final seal recheck passing
- Dedicated implementation task with clear scope
- Security boundary review
- Test strategy execution
- Rollback plan prepared

## 7. Blueprint Only

This document is an **implementation blueprint only**. It defines what *could* be implemented but:

- Does NOT write any backend code
- Does NOT modify `apps/local-api/`
- Does NOT create API server instances
- Does NOT start any service
- Does NOT modify package.json or lock files

## v7.31-D2 Human Review Pack

- **Status:** PENDING_HUMAN_OWNER_REVIEW
- **P1 skeleton:** Not yet approved
- **Backend endpoint:** NOT implemented (human review pack only)
- **Stage C:** Permanently disabled
- **DB write:** Not performed
- **External control:** Not enabled
- **Tag/Release:** Not created
