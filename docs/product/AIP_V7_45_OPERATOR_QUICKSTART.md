# AIP v7.45 — Operator Quickstart

**Status:** P1 Final
**Date:** 2026-05-20

---

## From PowerShell

```powershell
# 1. Go to project
Set-Location E:\AIP

# 2. See available commands
aip

# 3. Check your phase context
aip where

# 4. Check safety state
aip safe-status

# 5. Check encoding health (Windows)
aip doctor encoding

# 6. Generate a repair plan (readonly)
aip repair plan

# 7. Generate a receipt template
aip receipt template

# 8. Open web console
aip open
```

## Project Validation

```powershell
npm run typecheck
npm test
npm run build
git diff --check
```

## Safety Checks

```powershell
Invoke-RestMethod http://127.0.0.1:8787/api/health
Invoke-RestMethod http://127.0.0.1:8787/api/stage-c/status
```

## Key Safety Facts

- Stage C is **DISABLED**
- Feature flag is **OFF**
- All runtime operations are **BLOCKED**
- All repairs are **PLAN-ONLY**
- All preview pages are **HIDDEN DIRECT** (not in sidebar)

## Further Reading

- `docs/product/AIP_V7_45_OPERATOR_GUIDE.md`
- `docs/product/AIP_V7_45_COMMAND_CENTER_REFERENCE.md`
- `docs/product/AIP_V7_45_SAFE_STATUS_REFERENCE.md`
