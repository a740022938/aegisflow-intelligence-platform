# AIP v7.44 — Full PowerShell E2E Command Pack

**Status:** P2 Documentation
**Date:** 2026-05-20
**Baseline:** AIP v7.43 Final Seal

---

## 1. Purpose

Complete set of PowerShell commands for operator use. All commands are readonly or plan-only unless explicitly noted.

## 2. Navigation Commands

```powershell
# Navigate to project root
Set-Location E:\AIP

# Check nav tool
Get-Command aip
aip
aip where
```

## 3. Safety Commands

```powershell
# Safety state
aip safe-status

# Doctor diagnostics
aip doctor encoding
aip doctor env
aip doctor ports
```

## 4. Repair Commands (Plan-Only)

```powershell
aip repair
aip repair check
aip repair plan
aip repair command-pack
aip repair restore-point
```

All repair commands are plan-only by default. No file modification.

## 5. Receipt Commands

```powershell
aip receipt template
```

## 6. Project Validation Commands

```powershell
# Git state
git branch --show-current
git status --short
git rev-parse --short HEAD
git log -3 --oneline
git diff --check

# Project validation
npm run typecheck
npm test
npm run build
```

## 7. Readonly Smoke Commands

```powershell
# API health
Invoke-RestMethod http://127.0.0.1:8787/api/health

# Stage C status
Invoke-RestMethod http://127.0.0.1:8787/api/stage-c/status

# POST blocked check
try {
  Invoke-RestMethod -Method Post http://127.0.0.1:8787/api/stage-c/status
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

## 8. Web Console Commands (Open in Browser)

```
/operator-runtime-readiness-console-preview
/stage-c-authorization-review-pack-preview
/operator-end-to-end-flow-preview
/aip-memory-knowledge-preview
```

## 9. Forbidden Commands

The following are NOT permitted without explicit human authorization:

```powershell
# Stage C enablement — FORBIDDEN
# Feature flag toggle — FORBIDDEN
# Database write — FORBIDDEN
# Runtime execution — FORBIDDEN
# External control — FORBIDDEN
# Connector action — FORBIDDEN
# Service restart — FORBIDDEN unless authorized
# Tag creation — FORBIDDEN unless requested
# Release creation — FORBIDDEN unless requested
```

## 10. Safety

This command pack is documentation only. Commands should be executed manually by the operator. Automatic execution of dangerous operations is forbidden.
