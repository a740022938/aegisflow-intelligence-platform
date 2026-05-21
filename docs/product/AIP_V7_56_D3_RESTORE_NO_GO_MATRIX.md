# AIP v7.56-D3 Restore No-Go Matrix

**Date:** 2026-05-21
**Phase:** D3
**Status:** Reference — no restore in progress

---

## 1. No-Go Conditions

If ANY condition in this matrix is triggered, restore execution must STOP
immediately. The condition must be resolved and re-checked before proceeding.

| # | Condition | Severity | Action | Triggers Abort |
|---|---|---|---|---|
| NG1 | No restore authorization form filled | **Critical** | Do not execute restore; file authorization first | ✅ |
| NG2 | Authorization form is incomplete or ambiguous | **Critical** | Clarify with authorizer; do not proceed | ✅ |
| NG3 | Target restore path is unclear | **Critical** | Stop; require explicit path in writing | ✅ |
| NG4 | Live `E:\AIP` overwrite not explicitly authorized | **Critical** | Stop; use alternative path or get authorization | ✅ |
| NG5 | DB restore/write not explicitly authorized | **Critical** | Stop; do not execute any DB operation | ✅ |
| NG6 | Backup artifact path does not exist | **Critical** | Stop; verify path or obtain correct artifact | ✅ |
| NG7 | Backup checksum missing | **High** | Stop; compute and verify checksum before proceeding | ✅ |
| NG8 | Backup checksum mismatch | **Critical** | Stop; artifact may be corrupted or wrong | ✅ |
| NG9 | `restore-exclusions.txt` missing `_AIP_REPORTS/` | **High** | Stop; update exclusions before restore | ✅ |
| NG10 | `restore-exclusions.txt` missing `_AIP_RECEIPTS/` | **High** | Stop; update exclusions before restore | ✅ |
| NG11 | `.env.local` would be overwritten without explicit authorization | **High** | Stop; confirm `.env.local` handling | ✅ |
| NG12 | Stage C is enabled or would become enabled | **Critical** | Stop and immediately disable; file incident | ✅ |
| NG13 | Feature flag is on or would be toggled on | **Critical** | Stop and immediately toggle off; file incident | ✅ |
| NG14 | Service restart would occur without authorization | **High** | Stop; get separate authorization | ✅ |
| NG15 | Unrelated v7.52 docs staged for commit | **Medium** | Stop; unstage; do not commit them | ✅ |
| NG16 | Git working tree is dirty (unexpected) | **Medium** | Stop; review and clean working tree | ✅ |
| NG17 | Branch is not `main` | **Medium** | Stop; confirm restore target branch | ✅ |

---

## 2. Severity Definitions

| Severity | Meaning |
|---|---|
| **Critical** | Must not proceed under any circumstances. Violation may cause data loss, security breach, or permanent damage. |
| **High** | Must not proceed unless condition is explicitly resolved in writing. May cause significant issues. |
| **Medium** | Should not proceed. Condition must be resolved. Typically can be corrected without re-authorization. |

---

## 3. No-Go Decision Record

| Field | Value |
|---|---|
| All no-go conditions clear | YES / NO |
| Triggered conditions (list NG#) | |
| Resolved before proceed | YES / NO |
| Incident report needed | YES / NO |
| Recorded by | ____________ |
| Timestamp | ____________ |
