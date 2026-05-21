# AIP v7.55-P2 Restore Surface Inventory

**Date:** 2026-05-21
**Phase:** P2

---

## 1. Artifact Sources

| Source | Path | Type |
|---|---|---|
| Restore script | `scripts/restore.mjs` | Legacy restore, v2.6.0 |
| Restore exclusions | `restore-exclusions.txt` | Exclusion rules for restore points |
| Git ignore | `.gitignore` | Git tracking exclusions (117 lines) |
| Restore docs | `docs/product/*RESTORE*` | 12 documents (v7.45–v7.55) |
| Install docs | `docs/product/*INSTALL*` | 6 documents |
| Release docs | `docs/product/*RELEASE*` | 15 documents |

---

## 2. Restore Script Analysis (`scripts/restore.mjs`)

| Property | Value |
|---|---|
| Total lines | 164 |
| Default mode | PLAN-ONLY (line 12) |
| Live mode trigger | `--execute` flag + CONFIRM prompt |
| Dry-run support | `--dry-run` (treated as plan-only) |
| Extraction method | Python zipfile |
| Target directories | `packages/db/` (DB files), `apps/local-api/src/` (source), `../audit/` (docs/zips) |
| Pre-restore backup | `.pre-restore-` suffix before overwrite |
| DB write in live mode | ✅ Writes to `audit_logs` table (line 153) |
| Legacy warning | Yes — warns to use "new restore point system" (lines 26-32) |

---

## 3. Dry-Run / Plan-Only Capability

| Check | Status |
|---|---|
| Plan-only exits without extraction | ✅ Yes (line 66: `process.exit(0)`) |
| Plan-only lists archive contents | ✅ Yes (via Python zipfile) |
| Plan-only requires a restore point zip path | ✅ Yes (line 48-49) |
| No restore point zip available for testing | ❌ No zip found in repo or external dirs |
| Safe to run if zip existed | ✅ Yes — plan-only mode is read-only |

---

## 4. Exclusions Found

| Source | Entries | Coverage |
|---|---|---|
| `restore-exclusions.txt` | 52 lines | Secrets, build, DB, OS, model weights, deps, logs, test output |
| `.gitignore` | 117 lines | Dependencies, build, DB, env, IDE, OS, logs, temp, archives, weights, AIP internal dirs |

Missing from `restore-exclusions.txt`:
- `_AIP_REPORTS/` — external reports (proposed in D1)
- `_AIP_RECEIPTS/` — external receipts (proposed in D1)
- `_AIP_ASSETS/` — external assets

---

## 5. Dangerous Operations Found

| Operation | Script | Risk Level | Notes |
|---|---|---|---|
| DB write (audit_logs) | `restore.mjs:140-161` | HIGH | In live mode only; writes to production DB |
| File overwrite | `restore.mjs:94-98` | HIGH | Creates `.pre-restore-` backup, but still overwrites |
| Temp extraction | `restore.mjs:74-82` | MEDIUM | Extracts to system temp dir; cleaned up |
| Source file copy | `restore.mjs:117-125` | HIGH | Copies `.ts`/`.js` to `apps/local-api/src/` |

---

## 6. Missing Restore Docs

| Gap | Detail |
|---|---|
| No restore point zip available | No backup has been created; dry-run cannot execute |
| No DB snapshot standard | D1 plan proposes but not yet defined |
| No restore artifact manifest | Being created in P2 |
| No restore dry pack checklist | Being created in P2 |

---

## 7. Current Known Gaps

| # | Gap | P2 Action |
|---|---|---|
| G1 | No restore point zip exists for dry-run | Document only; cannot execute dry-run |
| G2 | `restore-exclusions.txt` missing _AIP_REPORTS/ and _AIP_RECEIPTS/ | Add to exclusions |
| G3 | Live mode writes to production DB | Document as restore danger boundary |
| G4 | No restore artifact manifest | Create in P2 |
| G5 | No restore dry pack checklist | Create in P2 |
