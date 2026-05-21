# AIP v7.56-D3 Final Restore Verification Plan

**Date:** 2026-05-21
**Phase:** D3
**Status:** Plan only — restore execution NOT authorized

---

## 1. Purpose

Define the complete plan for a future-authorized restore verification.
This document does NOT authorize restore execution. It prepares the
procedure, prechecks, evidence capture, abort conditions, and rollback
rules so that when human authorization is filed, restore verification
can be executed safely.

---

## 2. Required Human Authorization

Restore verification MUST NOT begin until:

- The restore execution authorization form is filled, signed, and filed
  by the human owner (see `AIP_V7_56_D3_RESTORE_EXECUTION_AUTHORIZATION_FORM.md`)
- The approved backup artifact path is confirmed in writing
- The approved target restore path is confirmed in writing
- Explicit permission is granted for:
  - Live workspace overwrite (YES/NO)
  - DB write/DB restore (YES/NO)
  - Service restart (YES/NO)
  - `.env.local` modification (YES/NO)

These conditions are also captured in the no-go matrix
(`AIP_V7_56_D3_RESTORE_NO_GO_MATRIX.md`).

---

## 3. Required Backup Artifact Type

The restore artifact must be an AIP restore point zip conforming to the
v7.55-P2 Restore Artifact Manifest (`AIP_V7_55_P2_RESTORE_ARTIFACT_MANIFEST.md`):

| Property | Requirement |
|---|---|
| Format | `.zip` archive |
| Manifest | Must include `manifest.json` |
| Must Include | Source repo snapshot, README, START_HERE, pnpm-lock.yaml, package.json, docs/product, .env.example, scripts, restore-exclusions.txt |
| Must Exclude | Secrets, build artifacts, node_modules, DB files, model weights, logs, test output, external reports/receipts |
| Checksum | SHA-256 of the zip file must be recorded |

---

## 4. Required Target Workspace

| Property | Requirement |
|---|---|
| Primary path | `E:\AIP` (or as authorized in writing) |
| Alternative path | Must be explicitly authorized; never default to live workspace if ambiguous |
| Clean directory | Should be an empty or non-conflicting directory unless live overwrite is explicitly authorized |

---

## 5. Live Workspace Protection Rules

| # | Rule | Enforcement |
|---|---|---|
| 1 | Never overwrite `E:\AIP` unless explicitly authorized | Precheck checklist must confirm |
| 2 | Always back up pre-restore state with `.pre-restore-` suffix | Built into `restore.mjs` |
| 3 | Never write to production DB unless explicitly authorized | No-go condition |
| 4 | Never modify `.env.local` unless explicitly authorized | No-go condition |
| 5 | Never restart services unless separately authorized | No-go condition |
| 6 | Stage C must remain disabled at all times | Verify after any restore action |
| 7 | Feature flag must remain off at all times | Verify after any restore action |

---

## 6. Precheck Commands

These commands are run **before** any restore operation (see also
`AIP_V7_56_D3_RESTORE_PRECHECK_CHECKLIST.md`):

```powershell
# 1. Verify git state
git status --short
git branch --show-current
git rev-parse HEAD
git tag --points-at HEAD

# 2. Verify workspace paths exist
Test-Path E:\AIP
Test-Path E:\_AIP_BACKUPS
Test-Path E:\_AIP_REPORTS
Test-Path E:\_AIP_RECEIPTS

# 3. Verify exclusions file
Get-Content .\restore-exclusions.txt

# 4. Verify safety invariants (Stage C disabled, feature flag off)
# Manual check via UI or safe-status CLI

# 5. Verify backup artifact exists at the authorized path
Test-Path <authorized-backup-path>
```

---

## 7. Dry-Run Commands

If a restore point zip exists at the authorized path, dry-run is:

```
FUTURE AUTHORIZED ONLY — do not execute now.
```

```powershell
# FUTURE AUTHORIZED ONLY
node scripts/restore.mjs --plan <authorized-backup-path>
```

Expected behavior:
- Plan-only mode: lists archive contents, then exits without extraction
- No files are written to disk
- No DB write occurs
- Exit code 0 on success

---

## 8. Future Authorized Execution Placeholders

The following commands are **placeholders only**. They must NOT be
executed during D3. They are documented here so that a future authorized
operator knows the procedure.

```
FUTURE AUTHORIZED ONLY — do not execute now.
```

### 8.1 Extraction (if using restore.mjs live mode)

```powershell
# FUTURE AUTHORIZED ONLY — requires --execute flag + CONFIRM prompt
node scripts/restore.mjs --execute <authorized-backup-path>
```

### 8.2 Manual extraction (alternative)

```powershell
# FUTURE AUTHORIZED ONLY
Expand-Archive -Path <authorized-backup-path> -DestinationPath <target-path>
```

### 8.3 Post-extraction steps

```powershell
# FUTURE AUTHORIZED ONLY
pnpm install
pnpm run typecheck
pnpm run build
pnpm run lint
pnpm run db:init   # if DB restore is authorized separately
pnpm run dev       # if service restart is authorized separately
```

---

## 9. Evidence Capture Requirements

All evidence must be captured into a restore evidence record
(see `AIP_V7_56_D3_RESTORE_EVIDENCE_TEMPLATE.md`):

| Evidence | Required |
|---|---|
| Authorization form reference | ✅ |
| Backup artifact path and checksum | ✅ |
| Target restore path | ✅ |
| Commands executed | ✅ |
| Pre-restore git state | ✅ |
| Post-restore git state | ✅ |
| Validation results (typecheck, build, lint, tests) | ✅ |
| UI/API smoke test results | ✅ |
| Stage C and feature flag state | ✅ |
| Abort/rollback triggered (if any) | ✅ |
| Final restore verdict | ✅ |

---

## 10. Abort Conditions

Restore must be aborted immediately if:

| # | Condition | Action |
|---|---|---|
| A1 | Authorization form is incomplete or missing | Do not proceed |
| A2 | Backup artifact path is not confirmed | Do not proceed |
| A3 | Target path is `E:\AIP` and overwrite is not explicitly authorized | Abort |
| A4 | Backup checksum validation fails | Abort |
| A5 | `restore-exclusions.txt` does not include `_AIP_REPORTS/` and `_AIP_RECEIPTS/` | Abort |
| A6 | Stage C is or would become enabled | Abort immediately |
| A7 | Feature flag is or would be toggled on | Abort immediately |
| A8 | `.env.local` would be overwritten without explicit authorization | Abort |
| A9 | DB write/restore would occur without explicit authorization | Abort |
| A10 | Service restart would occur without explicit authorization | Abort |

---

## 11. Rollback Rules

| # | Scenario | Rollback Action |
|---|---|---|
| R1 | Partial extraction (files written but incomplete) | Restore from `.pre-restore-` backup if available; else re-clone from git |
| R2 | DB write occurred without authorization (violation) | Restore DB from last known-good snapshot; file incident report |
| R3 | `.env.local` overwritten (authorized or not) | Re-apply original `.env.local` from backup; verify secrets intact |
| R4 | Stage C enabled (violation) | Immediately disable; verify in safe-status; file incident report |
| R5 | Feature flag toggled on (violation) | Immediately toggle off; verify in safe-status; file incident report |
| R6 | Service restart caused instability | Use `pnpm run dev` to restart; if persistent, restore from git clean clone |

---

## 12. Final Acceptance Criteria

Restore verification is considered PASS if:

| # | Criteria | Method |
|---|---|---|
| C1 | Precheck: all checks pass | Precheck checklist |
| C2 | Dry-run: plan-only exits with contents listing | Dry-run output |
| C3 | Authorization: form is complete and filed | Authorization form |
| C4 | Safety: Stage C remains disabled | Verify after restore |
| C5 | Safety: Feature flag remains off | Verify after restore |
| C6 | Validation: typecheck passes | pnpm run typecheck |
| C7 | Validation: build passes | pnpm run build |
| C8 | Validation: lint passes (0 warnings) | pnpm run lint |
| C9 | Validation: tests pass (or deferred) | pnpm test |
| C10 | Evidence: all fields recorded | Evidence template |
| C11 | No abort condition triggered | Abort log |
| C12 | Rollback not needed or successfully executed | Rollback log |

---

## 13. Safety Invariants

These must never be violated:

- Stage C DISABLED
- Feature flag OFF
- No real restore executed without authorization
- No DB write without authorization
- No tag/release created
- No service restart without authorization
- `.env.local` not modified without authorization
