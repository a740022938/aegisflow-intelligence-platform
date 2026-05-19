# AIP v7.32.0-D2 Smoke Commands

> **Date:** 2026-05-20
> **Purpose:** Manual smoke commands for operator use after human-approved restart
> **Note:** These commands must be run manually. Do not auto-execute.

## Pre-Smoke: Verify Server is Current

```powershell
# Check running commit
git log -1 --oneline

# Check if server is responding
Invoke-RestMethod http://127.0.0.1:8787/api/health
```

## READONLY GET Smoke

```powershell
# Health baseline
Invoke-RestMethod http://127.0.0.1:8787/api/health | ConvertTo-Json
Invoke-RestMethod http://127.0.0.1:8787/api/system/status | ConvertTo-Json

# Runtime readonly endpoints
Invoke-RestMethod http://127.0.0.1:8787/api/runtime/status | ConvertTo-Json
Invoke-RestMethod http://127.0.0.1:8787/api/runtime/readiness | ConvertTo-Json
Invoke-RestMethod http://127.0.0.1:8787/api/runtime/gates | ConvertTo-Json
Invoke-RestMethod http://127.0.0.1:8787/api/runtime/blockers | ConvertTo-Json
```

## POST Blocking Smoke

```powershell
# Each should return 404 or 405 (not 200)
Invoke-WebRequest -Method Post -Uri http://127.0.0.1:8787/api/runtime/execute -UseBasicParsing
Invoke-WebRequest -Method Post -Uri http://127.0.0.1:8787/api/runtime/rollback -UseBasicParsing
Invoke-WebRequest -Method Post -Uri http://127.0.0.1:8787/api/runtime/dry-run/preview -UseBasicParsing
Invoke-WebRequest -Method Post -Uri http://127.0.0.1:8787/api/runtime/approval/request -UseBasicParsing
```

## Header Check

```powershell
# Verify Cache-Control: no-store header
$response = Invoke-WebRequest -Uri http://127.0.0.1:8787/api/runtime/status -UseBasicParsing
$response.Headers['Cache-Control']
```

## Safety Field Verification

After restart, confirm these fields in all runtime responses:

| Field | Expected |
|-------|----------|
| ok | true |
| contractVersion | v7.31.0-P1 |
| readonly | true |
| stageCEnabled | false |
| dbWriteEnabled | false |
| externalControlEnabled | false |
| postEndpointsEnabled | false |
