# AIP Backend Readonly API P1 Skeleton Scope Freeze

> **Phase:** v7.31.0-D2
> **Status:** PENDING_HUMAN_OWNER_REVIEW
> **Purpose:** Freeze the minimum scope for v7.31.0-P1 backend skeleton implementation

## 1. Allowed in P1 (if human owner approves)

| Item | Constraint |
|------|------------|
| Create readonly backend route skeletons | For selected GET endpoints only |
| Return static contract-defined summaries | From existing registry/validator data |
| Basic HTTP status responses | 200 for success, 404 for unknown, 500 for errors |

## 2. Prohibited in P1 (always)

| Item | Reason |
|------|--------|
| POST endpoints of any kind | POST = mutation, not allowed in readonly phase |
| Database read or write | No DB connection in readonly service |
| External API calls | No external dependencies |
| External tool control | No OpenClaw/ComfyUI/etc. control |
| Runtime action execution | No runtime operations |
| Scheduler or worker | No background processes |
| Secret/token input or storage | Permanently forbidden |
| File system mutation | Standard logging excepted |
| Git operations | No repository mutation |

## 3. Candidate Endpoints for P1

Only these endpoints may be implemented in P1, and only if human owner approves:

| Method | Path | Data Source |
|--------|------|-------------|
| GET | /runtime/status | Registry summaries, endpoint counts |
| GET | /runtime/readiness | Validator summaries (blocking/warning/info) |
| GET | /runtime/gates | Gate model from contract freeze |
| GET | /runtime/blockers | Implementation blocker matrix |

All four endpoints are **readonly GET only, no DB, no external control, no Stage C**.

## 4. Scope Freeze Enforcement

- No endpoint outside this list may be added to P1
- No POST method may be used in any P1 endpoint
- No DB operation may be included in P1
- No external dependency may be introduced in P1
- No Stage C enablement code may exist in P1

## 5. Post-P1 Expansion

Any endpoint added after P1 requires:
1. New design document
2. Human owner approval
3. Updated endpoint whitelist
4. Updated security boundary
5. Updated test strategy
