# AIP v7.45 — Recovery and Restore Guide

**Status:** P3 Final
**Date:** 2026-05-20

---

## 1. Do Not Panic

Most issues can be resolved with simple steps. Do NOT execute destructive operations without understanding the consequences.

## 2. Check Git Status

```powershell
Set-Location E:\AIP
git status --short
```

If working tree is clean, the baseline is intact.

## 3. Save Current Diff (if dirty)

```powershell
git diff > E:\_AIP_REPORTS\current-diff-$(Get-Date -Format yyyyMMdd-HHmmss).patch
```

## 4. Run Repair Plan

```powershell
aip repair plan
```

This generates a JSON+MD plan without modifying files.

## 5. Check Restore Point Registry

Open in browser: `/restore-point-pack-preview`

Available restore points are listed with their manifest details.

## 6. Do NOT Run Source Restore Unless Authorized

- Source restore is **BLOCKED** by default
- Full restore is **FORBIDDEN** by default
- SHA256 verification is **REQUIRED** before any restore
- Human confirmation text is **REQUIRED** before any restore

## 7. Use Git Before Zip Restore

Prefer git operations over zip restore:
```powershell
git checkout -- <file>         # Restore single file
git reset --hard <commit>      # Reset to specific commit
git stash pop                  # Restore stashed changes
```

## 8. Never Restore Secrets from Package

Secrets, tokens, and `.env` files are excluded from restore points. If you need to restore secrets, re-create them from secure storage.

## 9. Generate Repair Receipt

After any recovery operation:
```powershell
aip receipt template
```

Copy the template to `E:\_AIP_RECEIPTS\` and fill in the details.

## 10. Full Recovery Flow

```text
1. Check git status
2. Save current diff
3. Run aip repair plan
4. Check restore point registry
5. If authorized: verify SHA256 → confirm → restore
6. Run post-restore validation (typecheck, test, build)
7. Generate receipt
8. Run aip safe-status to confirm safety
```
