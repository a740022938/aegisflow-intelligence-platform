# AIP v7.45 — Operator Command Index

**Status:** P3 Final
**Date:** 2026-05-20

---

## Navigation

```powershell
Set-Location E:\AIP
aip
aip where
```

## Safety

```powershell
aip safe-status
aip doctor encoding
aip doctor env
aip doctor ports
aip doctor stage-c
```

## Repair (Plan-Only)

```powershell
aip repair
aip repair check
aip repair plan
aip repair command-pack
aip repair restore-point
```

## Documentation

```powershell
aip receipt template
```

## Validation

```powershell
npm run typecheck
npm test
npm run build
git diff --check
```

## Live Smoke

```powershell
Invoke-RestMethod http://127.0.0.1:8787/api/health
Invoke-RestMethod http://127.0.0.1:8787/api/stage-c/status
Invoke-RestMethod -Method Post http://127.0.0.1:8787/api/stage-c/status  # Expect 404
```

## Forbidden Operations

These are NOT permitted without explicit human authorization:
- Stage C enablement
- Feature flag toggle
- Database write
- Runtime execution
- External tool control
- Connector action
- Source restore
- Full restore
- Service restart
- Tag creation
- Release creation
