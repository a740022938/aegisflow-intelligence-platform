# AIP v7.31 Roadmap

> **Roadmap Version:** v7.31.0-P1 (updated)
> **Date:** 2026-05-20
> **Previous:** v7.30.0 Final Seal (V7_30_FINAL_SEAL_READY)
> **Scope:** Backend Readonly API Implementation Blueprint

## 1. Roadmap Principles

1. **v7.31 does NOT automatically implement real backend** — all phases are design/blueprint/audit only
2. **v7.31 does NOT automatically write to DB** — all DB writes remain blocked
3. **v7.31 does NOT automatically enable Stage C** — Stage C remains permanently disabled
4. **v7.31 does NOT automatically control external tools** — all external control remains blocked
5. **All implementation requires human approval** — no assistant-initiated implementation
6. **v7.31 only considers readonly GET endpoints** — no POST mutation endpoints

## 2. Proposed Phases

### D1: Backend Readonly API Implementation Blueprint (COMPLETED)

| Field | Value |
|-------|-------|
| Source changes | NO |
| Backend changes | NO |
| DB writes | NO |
| External control | NO |
| Stage C enable | NO |
| Human review | Recommended |
| Risk | Low |
| Commit policy | docs-only, push only |

**Scope:** Define the implementation blueprint for a readonly status-only backend API. Create endpoint whitelist, security boundary, test strategy, rollback plan.

**New docs created:**
- `AIP_BACKEND_READONLY_API_IMPLEMENTATION_BLUEPRINT.md`
- `AIP_BACKEND_READONLY_API_ENDPOINT_WHITELIST.md`
- `AIP_BACKEND_READONLY_API_SECURITY_BOUNDARY.md`
- `AIP_BACKEND_READONLY_API_TEST_STRATEGY.md`
- `AIP_BACKEND_READONLY_API_ROLLBACK_PLAN.md`

### D2: Backend Readonly API Human Review Pack (RECOMMENDED NEXT)

| Field | Value |
|-------|-------|
| Source changes | NO (docs only) |
| Backend changes | NO |
| DB writes | NO |
| External control | NO |
| Stage C enable | NO |
| Human review | REQUIRED |
| Risk | Low |
| Commit policy | docs-only, push only |

**Scope:** Prepare a human review pack presenting the D1 blueprints for project owner review. Include endpoint whitelist, security assessment, implementation prerequisites.

### P1: Backend Readonly Status API Skeleton (HUMAN DECISION REQUIRED)

| Field | Value |
|-------|-------|
| Source changes | YES (new backend skeleton) |
| Backend changes | YES (new readonly endpoints) |
| DB writes | NO |
| External control | NO |
| Stage C enable | NO |
| Human review | REQUIRED |
| Risk | Medium |

**Scope:** Implement the backend skeleton for `GET /runtime/status`, `GET /runtime/readiness`, `GET /runtime/gates`, `GET /runtime/blockers`. Readonly only. No DB write. No external control.

### P2: Backend Readonly API Contract Tests

| Field | Value |
|-------|-------|
| Source changes | YES (test files only) |
| Backend changes | NO (tests for existing skeleton) |
| DB writes | NO |
| External control | NO |
| Stage C enable | NO |
| Human review | Recommended |

**Scope:** Write contract tests for all readonly endpoints. Verify response shapes, forbidden input rejection, no-mutation guarantees.

### P3: Frontend Contract Viewer Linkage

| Field | Value |
|-------|-------|
| Source changes | YES (frontend API calls) |
| Backend changes | NO |
| DB writes | NO |
| External control | NO |
| Stage C enable | NO |
| Human review | Recommended |

**Scope:** Link existing frontend preview pages to the new readonly backend API. Replace static registry data with live API responses.

### P4: Readonly API Final Seal Recheck

| Field | Value |
|-------|-------|
| Source changes | NO |
| Backend changes | NO |
| DB writes | NO |
| External control | NO |
| Stage C enable | NO |
| Human review | N/A (audit only) |

**Scope:** Recheck all v7.31 phases, confirm all docs complete, confirm no Stage C / DB write / external control.

## 3. Non-Goals for v7.31

- POST mutation endpoints
- Real DB write
- Real external control
- Stage C activation
- Dry-run execution
- Audit store implementation
- Approval queue implementation
- Evidence store implementation
- Rollback executor implementation
- Secret/token storage
- File system mutation (beyond standard logging)
- Git tag/release
- GitHub Release

## 4. Dependency Chain

```
D1 (blueprint — COMPLETED) → D2 (human review pack — APPROVED) → P1 (backend skeleton — IMPLEMENTED) → P2 (contract tests) → P3 (frontend linkage) → P4 (final seal)
```

Each phase requires human project owner approval before proceeding. Phases can be reordered or skipped.

## 5. Blockers

- v7.30 Final Seal must be confirmed before any v7.31 implementation
- Human project owner approval required for P1 (backend skeleton)
- No backend implementation without dedicated implementation task
- Stage C remains permanently disabled throughout v7.31

## 6. Next Step Recommendation

**Recommended:** v7.31.0-D2 Backend Readonly API Human Review Pack — prepare a human review pack presenting the D1 blueprints for project owner review before any implementation work begins.

## v7.31-D2 Human Review Pack

- **Status:** APPROVED_AND_IMPLEMENTED
- **P1 skeleton:** Implemented (v7.31.0-P1)
- **Backend endpoint:** 4 GET readonly endpoints live at /api/runtime/*
- **Stage C:** Permanently disabled
- **DB write:** Not performed
- **External control:** Not enabled
- **Tag/Release:** Not created
