# AIP v7.32.0-D2 Readonly Live Smoke Plan

> **Date:** 2026-05-20
> **Status:** SMOKE EXECUTED AND PASSED (P1).
> See `docs/product/AIP_V7_32_P1_CONTROLLED_LIVE_SMOKE_REPORT.md` for full results.

## 1. Smoke Scope (Allowed)

### Health / Baseline
| Method | Path | Expected |
|--------|------|----------|
| GET | /api/health | 200 |
| GET | /api/system/status | 200 |
| GET | /api/db/ping | 200 |

### Readonly Runtime Status
| Method | Path | Expected |
|--------|------|----------|
| GET | /api/runtime/status | 200, mode=readonly_skeleton |
| GET | /api/runtime/readiness | 200, canExecuteRuntime=false |
| GET | /api/runtime/gates | 200, all gates pass |
| GET | /api/runtime/blockers | 200, 4 blockers |

### Contract / Registry
| Method | Path | Expected |
|--------|------|----------|
| GET | /runtime-readonly-status-api-preview | 200 (web UI) |
| GET | /runtime-dry-run-contract-preview | 200 (web UI) |
| GET | /runtime-audit-store-contract-preview | 200 (web UI) |
| GET | /stage-c-preenable-review-preview | 200 (web UI) |

### Header Check
| Endpoint | Header | Expected |
|----------|--------|----------|
| All runtime endpoints | Cache-Control | no-store |

## 2. Smoke Scope (Blocked — verify non-200)

| Method | Path | Expected |
|--------|------|----------|
| POST | /api/runtime/execute | 404 or 405 |
| POST | /api/runtime/rollback | 404 or 405 |
| POST | /api/runtime/dry-run/preview | 404 or 405 |
| POST | /api/runtime/approval/request | 404 or 405 |

## 3. Response Validation

Each runtime GET response must contain:
```
ok: true
contractVersion: "v7.31.0-P1"
readonly: true
stageCEnabled: false
dbWriteEnabled: false
externalControlEnabled: false
postEndpointsEnabled: false
```

## 4. Forbidden During Smoke

| Action | Reason |
|--------|--------|
| Dry-run execution | No executor exists |
| Approval mutation | No approval queue |
| Evidence write | No evidence store |
| Audit store write | No audit store |
| Rollback execution | No rollback executor |
| Stage C enablement | Permanently prohibited |
| Connector control | No connector control code |
| External tool control | No external control code |

## 5. Success Criteria

- [ ] All allowed GET endpoints return 200
- [ ] All blocked POST endpoints return non-200
- [ ] Response schemas match contracts
- [ ] Cache-Control: no-store present on runtime endpoints
- [ ] Safety fields confirm disabled state

## 6. Failure Handling

| Failure | Action |
|---------|--------|
| GET endpoint returns non-200 | Investigate server state. Report. |
| POST endpoint returns 200 | Critical. Stop. Report immediately. |
| Schema mismatch | Report. Check code version. |
| Safety field incorrect | Report. Investigate code. |
