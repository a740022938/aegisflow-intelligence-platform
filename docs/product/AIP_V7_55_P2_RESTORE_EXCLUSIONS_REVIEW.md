# AIP v7.55-P2 Restore Exclusions Review

**Date:** 2026-05-21
**Phase:** P2

---

## 1. Review Scope

| File | Path | Status |
|---|---|---|
| Restore exclusions | `restore-exclusions.txt` | Reviewed |
| Git ignore | `.gitignore` | Cross-referenced |

---

## 2. Manifest Coverage Check

Per the manifest (Must Exclude), current `restore-exclusions.txt` coverage:

| Manifest # | Artifact | In `restore-exclusions.txt`? | Status |
|---|---|---|---|
| E1 | `.env.*` local secrets | ✅ `.env` + `.env.*` | ✅ Covered |
| E2 | `*.key`, `*.token`, `*.pem` | ✅ `*.key` + `*.token` + `*.pem` | ✅ Covered |
| E3 | `node_modules/`, `.pnpm-store/` | ✅ Both present | ✅ Covered |
| E4 | `dist/`, `*.tsbuildinfo`, `.vite/` | ✅ All three present | ✅ Covered |
| E5 | `*.db`, `*.db-shm`, `*.db-wal`, `*.db.bak*` | ✅ All four present | ✅ Covered |
| E6 | `.DS_Store`, `Thumbs.db` | ✅ Both present | ✅ Covered |
| E7 | `*.pt`, `*.pth`, `*.onnx`, `*.safetensors` | ✅ All four present | ✅ Covered |
| E8 | `__pycache__/`, `*.pyc` | ✅ Both present | ✅ Covered |
| E9 | `*.log`, `logs/` | ✅ `*.log` + `logs/` + `_logs/` | ✅ Covered |
| E10 | `coverage/`, `test-results/` | ✅ `coverage/` + `test-results/` | ✅ Covered |
| E11 | `_AIP_REPORTS/` | ❌ Missing | ⚠️ Needs addition |
| E12 | `_AIP_RECEIPTS/` | ❌ Missing | ⚠️ Needs addition |
| E13 | `_AIP_BACKUPS/`, `_AIP_TEMP/` | ✅ `_AIP_BACKUPS/` + `_AIP_TEMP/` + `_TEMP/` + `_DELETE_CANDIDATES/` | ✅ Covered |

---

## 3. Blocking Findings

**None.** No exclusion is missing that would cause secret exposure or data loss.

---

## 4. Warning Findings

| # | Finding | Recommendation |
|---|---|---|
| W1 | `_AIP_REPORTS/` not in `restore-exclusions.txt` | Add `_AIP_REPORTS/` to exclusions (external reports) |
| W2 | `_AIP_RECEIPTS/` not in `restore-exclusions.txt` | Add `_AIP_RECEIPTS/` to exclusions (external receipts) |

---

## 5. Info Findings

| # | Finding | Note |
|---|---|---|
| I1 | `restore-exclusions.txt` has no date/version header | Could add version comment for traceability |
| I2 | `restore-exclusions.txt` and `.gitignore` are not cross-referenced | No sync mechanism; manual review required |
| I3 | `restore.mjs` does not read `restore-exclusions.txt` | The exclusion file is for human/manual restore point creation, not enforced by script |

---

## 6. Proposed Changes to `restore-exclusions.txt`

Add after line 48 (`# AIP internal directories`):

```
# External reports and receipts (outside repo, not part of restore point)
_AIP_REPORTS/
_AIP_RECEIPTS/
```

---

## 7. Security Note

No secret values were read, copied, or printed during this review. Only file
names and exclusion patterns were inspected.
