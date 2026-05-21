# AIP v7.56-D3 Restore Rollback and Abort Plan

**Date:** 2026-05-21
**Phase:** D3
**Status:** Plan only — restore not authorized

---

## 1. Purpose

Define the abort and rollback procedures for any future-authorized restore
verification. This ensures that if restore execution must be stopped or
reversed, the operator has clear, pre-defined actions.

---

## 2. Abort Conditions

See also `AIP_V7_56_D3_RESTORE_NO_GO_MATRIX.md` for no-go conditions and
`AIP_V7_56_D3_FINAL_RESTORE_VERIFICATION_PLAN.md` Section 10 for abort
conditions.

General abort rule:

> If at any point a safety invariant is violated or an unauthorized
> operation is detected, **stop immediately**. Do not proceed. Do not
> "fix forward" without authorization.

---

## 3. Abort Procedure

### 3.1 Before any restore action (precheck abort)

```powershell
# 1. Stop — do not execute any restore command
# 2. Record the failing condition
# 3. Resolve the condition (e.g., get authorization, correct path)
# 4. Re-run precheck checklist
# 5. Only proceed if all checks pass
```

### 3.2 During dry-run abort

Dry-run (plan-only mode) is read-only. Abort means simply exiting:

```powershell
# Abort is implicit — plan-only exits without writing
# No cleanup needed
```

### 3.3 During live extraction abort

```
FUTURE AUTHORIZED ONLY — do not execute now.
```

```powershell
# FUTURE AUTHORIZED ONLY — if extraction is in progress:
# 1. Press Ctrl+C to cancel the running command
# 2. Check if any files were written (check target path)
# 3. If files were written, initiate rollback (see Section 4)
# 4. Record abort condition in evidence template
```

---

## 4. Rollback Procedure

### 4.1 Rollback: Partial file extraction

If files were written to the target path but extraction was interrupted:

| Step | Action | Command |
|---|---|---|
| 1 | Check for `.pre-restore-` backup files | `Get-ChildItem <target-path> -Filter *.pre-restore-*` |
| 2 | If backup files exist, restore from backup | Copy `.pre-restore-` files back to original names |
| 3 | If no backup files exist, re-clone from git | `git clone https://github.com/a740022938/aegisflow-intelligence-platform.git <target-path>` |
| 4 | Verify working tree | `git status --short` inside restored directory |

### 4.2 Rollback: DB write occurred without authorization

This is a violation. Do not attempt to "undo" the DB write silently.

| Step | Action |
|---|---|
| 1 | Immediately stop all operations |
| 2 | Record the violation |
| 3 | File an incident report |
| 4 | File an incident report |
| 5 | Restore DB from last known-good snapshot (requires separate authorization) |
| 6 | Do not proceed with restore until incident is resolved |

### 4.3 Rollback: `.env.local` overwritten

| Step | Action |
|---|---|
| 1 | If backup `.env.local` exists, restore it |
| 2 | If no backup exists, reconstruct from `.env.example` + known secrets |
| 3 | Verify secrets are intact (tokens, keys, etc.) |
| 4 | Do not commit `.env.local` to git |

### 4.4 Rollback: Stage C enabled or Feature flag toggled

This is a critical violation.

```
FUTURE AUTHORIZED ONLY — do not execute now.
```

| Step | Action |
|---|---|
| 1 | Immediately disable Stage C | `Set FEATURE_FLAG_STAGE_C=OFF` or equivalent |
| 2 | Immediately toggle feature flag off | `Set AIP_ENABLE_UI_FEATURE_FLAG=false` or equivalent |
| 3 | Verify using safe-status CLI | `node apps/aip-cli/dist/index.js safe-status` |
| 4 | File incident report | Document what enabled it and how |

### 4.5 Rollback: Service restart caused instability

```
FUTURE AUTHORIZED ONLY — do not execute now.
```

| Step | Action |
|---|---|
| 1 | Try restarting service | `pnpm run dev` |
| 2 | If still unstable, roll back to previous git state | `git checkout <pre-restore-commit>` |
| 3 | If persistent, use clean clone | Fresh clone + `pnpm install` + `pnpm run db:init` |

---

## 5. Incident Report Template

If any violation occurs, file a report in `E:\_AIP_RECEIPTS\`:

```
Incident Report — Restore Verification
========================================
Date:
Incident ID:
Violation type:
Description:
Root cause:
Actions taken:
Resolution:
Prevention:
Filed by:
```

---

## 6. Safety Reminders

- Stage C must remain DISABLED
- Feature flag must remain OFF
- `.env.local` must not be committed or exposed
- No tag/release without separate authorization
- No restore execution without separate authorization
- When in doubt, stop and ask
