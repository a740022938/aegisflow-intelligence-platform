# AIP v7.45 — Install and Run Guide

**Status:** P3 Final
**Date:** 2026-05-20

---

## 1. Prerequisites

- Node.js v22+ (check with `node --version`)
- npm 10+ (check with `npm --version`)
- Git 2.40+ (check with `git --version`)
- PowerShell 7+ (Windows) or bash (Linux/Mac)
- Windows (primary target), Linux/Mac (experimental)

## 2. Clone and Setup

```powershell
# Clone repository
git clone https://github.com/a740022938/aegisflow-intelligence-platform.git
Set-Location aegisflow-intelligence-platform

# Or set project root
Set-Location E:\AIP
```

## 3. Install Dependencies

```powershell
npm install
```

## 4. Verify Installation

```powershell
npm run typecheck
npm test
npm run build
```

All three must pass.

## 5. Start Local API Server (if needed)

```powershell
npm run dev
```

The API server typically runs at `http://127.0.0.1:8787`.

## 6. Verify Stage C Disabled

```powershell
Invoke-RestMethod http://127.0.0.1:8787/api/stage-c/status
```

Expected: `stageCEnabled: false`, `featureFlag.currentState: off`.

## 7. Verify POST Blocked

```powershell
try {
  Invoke-RestMethod -Method Post http://127.0.0.1:8787/api/stage-c/status
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

Expected: `404`.

## 8. Run CLI Commands

```powershell
aip
aip where
aip safe-status
aip doctor encoding
```

## 9. Open Web UI

Start the dev server and open in browser:

```powershell
npm run dev
```

Navigate to `http://localhost:5173` (or the port shown in output).

## 10. Safety Notes

- Stage C is **DISABLED** by default
- Feature flag is **OFF** by default
- Do NOT toggle feature flag without human authorization
- Do NOT enable Stage C without completing Authorization Review Pack
- All restore points are plan-only — do NOT execute source restore without authorization
