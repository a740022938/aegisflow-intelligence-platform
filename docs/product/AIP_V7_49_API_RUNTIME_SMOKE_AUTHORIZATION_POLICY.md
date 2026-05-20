# AIP v7.49 — API Runtime Smoke Authorization Policy

**Date:** 2026-05-20
**Phase:** P1
**Baseline HEAD:** `7b2935c`

---

## 1. Policy

No agent may start or restart the AIP API service without explicit human owner authorization.

## 2. Current Status

At the time of v7.49-P1 review:

| Property | Value |
|----------|-------|
| API running at 8787 | ✅ YES |
| Service started by | Pre-existing (uptime ~13.6h) |
| Agent-authorized start | N/A — service was already running |
| `pnpm test` result | ✅ 9/9 PASS |

## 3. Decision Tree

```
Check API at http://127.0.0.1:8787
  ├── API running → Run pnpm test (authorized, no start needed)
  ├── API not running → Do NOT start
  │     ├── Human owner authorizes start → Start, test, stop, document
  │     └── No authorization → Defer test, document reason
```

## 4. Authorization Requirements

If API start/restart is needed in the future:

- Must be explicitly authorized by human owner (written or verbal)
- Authorization must be documented in a receipt
- Start action must be logged
- Test must be executed, results recorded
- Service must be stopped after test unless otherwise specified
- Authorization is a one-time grant, not a standing permission

## 5. Safety

- Unauthorized service start is a safety boundary violation
- All starts/restarts must be documented with receipts
- Stage C remains disabled regardless of API status
- Feature flag remains off regardless of API status
