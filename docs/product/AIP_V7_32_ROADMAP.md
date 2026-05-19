# AIP v7.32 Roadmap

> **Roadmap Version:** v7.32.0-D1 (blueprint)
> **Date:** 2026-05-20
> **Previous:** v7.31.0 Final Seal (V7_31_FINAL_SEAL_READY_WITH_LIVE_SMOKE_DEFERRED)
> **Scope:** Readonly Runtime API Productization Blueprint

## 1. Roadmap Principles

- No new POST endpoints
- No DB write enablement
- No external control enablement
- No Stage C enablement
- No automatic restart
- No automatic smoke
- Every phase requires human approval

## 2. Proposed Phases

| Phase | Scope | Source Modified | Backend Modified | Restart Service | DB Write | External Control | Stage C | Human Approval | Risk |
|-------|-------|----------------|-----------------|----------------|----------|-----------------|---------|---------------|------|
| D1 | Productization Blueprint | No | No | No | No | No | No | No (this doc) | Low |
| D2 | Human-Approved Live Smoke Pack | No | No | No | No | No | No | Yes | Low |
| P1 | Controlled Live Smoke | No | No | Yes | No | No | No | Yes | Low |
| P2 | Frontend Manual Refresh Viewer | Yes (frontend only) | No | No | No | No | No | Yes | Low |
| P3 | Operator Guide Polish | No | No | No | No | No | No | No | Low |
| P4 | Productization Final Seal | No | No | No | No | No | No | Yes | Low |

## 3. Commit Policy

| Phase | Commit Pattern |
|-------|---------------|
| D1 | `docs(api): add readonly runtime api productization blueprint` |
| D2 | `docs(api): add human-approved smoke pack` |
| P1 | `feat(api): controlled live smoke` |
| P2 | `feat(api): add manual refresh viewer` |
| P3 | `docs(api): polish operator guide` |
| P4 | `docs(api): seal readonly runtime api productization` |

## 4. v7.31 Final Seal Status

**V7_31_FINAL_SEAL_READY_WITH_LIVE_SMOKE_DEFERRED**

The v7.31 readonly backend API is fully implemented and validated. Live smoke was deferred because the server was not restarted (per construction pack policy). The v7.32 phases will address live smoke with human-approved restart.

## 5. Blockers

- Human project owner approval required for live smoke (v7.32.0-P1)
- Human project owner approval required for frontend manual refresh viewer (v7.32.0-P2)
- Stage C remains permanently disabled throughout v7.32
- No DB write throughout v7.32

## 6. Next Step Recommendation

**Recommended:** v7.32.0-D2 Human-Approved Live Smoke Pack — prepare a detailed smoke pack for human owner review and approval before any restart or smoke execution.
