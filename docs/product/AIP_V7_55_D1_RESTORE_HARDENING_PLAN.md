# AIP v7.55-D1 Restore Hardening Plan

**Date:** 2026-05-21
**Phase:** D1 Blueprint
**Status:** Plan only — no restore executed

---

## 1. Objective

Define the restore artifact hardening requirements for v7.55-P2.
This document describes restore dry run standards and safety boundaries.
No real restore is executed.

---

## 2. Current Restore State

| Property | Status |
|---|---|
| Restore script | `scripts/restore.mjs` exists |
| Plan-only mode | ✅ Implemented (`--execute` flag required for real restore) |
| `restore-exclusions.txt` | ✅ Created in v7.47 |
| Dry run artifact standard | ❌ Not defined |
| DB snapshot integration | ❌ Not defined |
| Assets / reports / receipts inclusion | ❌ Not defined |
| Real restore executed in v7.55 | ❌ NOT AUTHORIZED |

---

## 3. Restore Danger Boundary

```text
NO REAL RESTORE IS AUTHORIZED IN v7.55-D1.

Real restore requires:
1. Human owner written authorization
2. Successful dry run evidence
3. DB snapshot verification
4. Exclusion list audit
5. Rollback plan documented
```

---

## 4. Proposed Restore Dry Run Standard (P2)

A restore dry run must verify:

| # | Check |
|---|---|
| R1 | `restore.mjs --plan` exits without error |
| R2 | Plan output shows correct restore point path |
| R3 | Plan output shows correct exclusion count |
| R4 | No secrets leaked in plan output |
| R5 | Restore point zip is readable and non-corrupt |
| R6 | DB snapshot (if any) is valid |
| R7 | Exclusion list covers `.env`, `node_modules`, `dist/`, DB files |
| R8 | Dry run does NOT extract any file to working directory |
| R9 | Dry run does NOT overwrite any existing file |

---

## 5. Exclusion List Audit

Current `restore-exclusions.txt` covers:

- `.env`, `.env.*`, `*.key`, `*.token`, `*.pem` — secrets
- `dist/`, `*.tsbuildinfo`, `.vite/` — build artifacts
- `*.db`, `*.db-shm`, `*.db-wal`, `*.db.bak*` — database files
- `.DS_Store`, `Thumbs.db` — OS artifacts
- `*.pt`, `*.pth`, `*.onnx`, `*.safetensors` — model weights
- `node_modules/`, `.pnpm-store/`, `__pycache__/`, `*.pyc` — dependencies
- `*.log` — logs

**Proposed addition (P2)**: `E:\_AIP_REPORTS\` and `E:\_AIP_RECEIPTS\` —
external directories should be excluded from restore points since they
are outside the repo.

---

## 6. No Real Restore in D1

This phase does not execute any restore. All restore work is deferred to
v7.55-P2 (dry run artifact) or later (real restore with authorization).
