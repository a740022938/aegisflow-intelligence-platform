# AIP v7.56-D3 Restore Precheck Checklist

**Date:** 2026-05-21
**Phase:** D3
**Status:** Precheck not executed — restore not authorized

---

## 1. Instructions

This checklist must be completed **before** any restore operation begins.
All items must pass. If any item fails, the restore must not proceed
until the condition is resolved and re-checked.

The no-go conditions are documented in `AIP_V7_56_D3_RESTORE_NO_GO_MATRIX.md`.
The abort conditions are documented in `AIP_V7_56_D3_FINAL_RESTORE_VERIFICATION_PLAN.md`.

---

## 2. Precheck Checklist

| # | Check | Command / Method | Result | Notes |
|---|---|---|---|---|
| P1 | Git working tree is clean | `git status --short` | ⬜ | No modified or untracked files expected |
| P2 | Current branch is main | `git branch --show-current` | ⬜ | Restore targets main |
| P3 | HEAD commit is recorded | `git rev-parse HEAD` | ⬜ | Record for pre-/post- comparison |
| P4 | No tag at HEAD | `git tag --points-at HEAD` | ⬜ | No tag should exist before restore |
| P5 | Live workspace exists | `Test-Path E:\AIP` | ⬜ | Must return True |
| P6 | Backups directory exists | `Test-Path E:\_AIP_BACKUPS` | ⬜ | May be absent; record status |
| P7 | Reports directory exists | `Test-Path E:\_AIP_REPORTS` | ⬜ | May be absent; record status |
| P8 | Receipts directory exists | `Test-Path E:\_AIP_RECEIPTS` | ⬜ | May be absent; record status |
| P9 | Restore exclusions file is present | `Test-Path .\restore-exclusions.txt` | ⬜ | Must return True |
| P10 | Restore exclusions include `_AIP_REPORTS/` | `Get-Content .\restore-exclusions.txt \| Select-String "_AIP_REPORTS"` | ⬜ | Must be present |
| P11 | Restore exclusions include `_AIP_RECEIPTS/` | `Get-Content .\restore-exclusions.txt \| Select-String "_AIP_RECEIPTS"` | ⬜ | Must be present |
| P12 | Restore authorization form is complete | Manual review of authorization form | ⬜ | All fields filled, YES/NO answers clear |
| P13 | Approved backup artifact path is confirmed | Manual review | ⬜ | Path must be explicit |
| P14 | Approved target restore path is confirmed | Manual review | ⬜ | Path must be explicit |
| P15 | Target path is not `E:\AIP` unless overwrite explicitly authorized | Manual review | ⬜ | Check authorization form |
| P16 | Backup artifact exists at the authorized path | `Test-Path <authorized-backup-path>` | ⬜ | Must return True |
| P17 | Backup checksum is recorded and matches | Manual verification | ⬜ | SHA-256 comparison |
| P18 | `.env.local` handling is confirmed | Manual review | ⬜ | Must not be overwritten unless authorized |
| P19 | DB snapshot handling is confirmed | Manual review | ⬜ | Must not be written unless authorized |
| P20 | Stage C is currently disabled | `node apps/aip-cli/dist/index.js safe-status` (if available) or UI check | ⬜ | Must confirm DISABLED |
| P21 | Feature flag is currently off | UI or code check | ⬜ | Must confirm OFF |
| P22 | No service restart authorized unless separately stated | Manual review | ⬜ | Check authorization form |
| P23 | Unrelated v7.52 docs are not staged for commit | `git status --short` | ⬜ | Should show only expected files |

---

## 3. Precheck Result

| Field | Value |
|---|---|
| All checks PASS | YES / NO |
| Failed checks (list) | |
| Blocked by no-go condition | YES / NO |
| Restore may proceed | YES / NO |
| Precheck executed by | ____________ |
| Precheck timestamp | ____________ |

---

## 4. Post-Precheck Action

- If ALL PASS: proceed to dry-run (plan-only mode)
- If ANY FAIL: stop, resolve, re-check before proceeding
- If no-go condition triggered: document in no-go matrix, do not proceed
