# AIP Readonly Runtime API Operator Guide

> **Phase:** v7.32.0-D1 (design)
> **Status:** Guide only — no operations conducted
> **Date:** 2026-05-20

## 1. How to Check Current API Status

```powershell
# Check health endpoint
Invoke-RestMethod http://127.0.0.1:8787/api/health

# Check runtime endpoints
Invoke-RestMethod http://127.0.0.1:8787/api/runtime/status
Invoke-RestMethod http://127.0.0.1:8787/api/runtime/readiness
Invoke-RestMethod http://127.0.0.1:8787/api/runtime/gates
Invoke-RestMethod http://127.0.0.1:8787/api/runtime/blockers
```

## 2. How to Identify Stale Server Code

- If runtime endpoints return 401 (unauthorized), the server is running pre-P1 code
- Check `git log -1` to confirm latest commit
- Runtime endpoints with new contract fields = server is running current code

## 3. How to Run Code Validation

```powershell
# Root typecheck (both local-api + web-ui)
npm run typecheck

# Local-api tests
cd apps/local-api
npm run test

# Security check
rg -n "app\.post|token|password|secret" apps/local-api/src/runtime/
```

## 4. How to Run Endpoint Smoke (after approved restart)

```powershell
# GET smoke
Invoke-RestMethod http://127.0.0.1:8787/api/runtime/status
Invoke-RestMethod http://127.0.0.1:8787/api/runtime/readiness
Invoke-RestMethod http://127.0.0.1:8787/api/runtime/gates
Invoke-RestMethod http://127.0.0.1:8787/api/runtime/blockers

# POST blocking smoke
Invoke-WebRequest -Method Post http://127.0.0.1:8787/api/runtime/execute
Invoke-WebRequest -Method Post http://127.0.0.1:8787/api/runtime/rollback
Invoke-WebRequest -Method Post http://127.0.0.1:8787/api/runtime/dry-run/preview
Invoke-WebRequest -Method Post http://127.0.0.1:8787/api/runtime/approval/request
```

## 5. How to Confirm POST Blocked

- All POST requests to runtime endpoints should return 404 or 405
- Code review: grep for `app.post` in runtime module = must be 0

## 6. What Not to Do

- Do not taskkill without approval
- Do not write DB
- Do not enable Stage C
- Do not call external APIs
- Do not modify package.json or lock files
- Do not add sidebar entries
- Do not run git reset / revert without owner approval

## 7. Completion Receipt Template

```
Operator: [name]
Date: [YYYY-MM-DD]
Commit: [hash]
Smoke: PASS/FAIL/DEFERRED
POST blocked: YES/NO
Tests: [x]/38 PASS
Notes: [any issues]
```
