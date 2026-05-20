# AIP v7.46 — Documentation Overhaul Plan

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Phase:** P3

---

## 1. Objective

Solve D0 documentation findings: no START_HERE, README version mismatch, 284 flat files, no Stage C primer, missing docs index.

## 2. Current State (from D0)

| Issue | Severity | Detail |
|-------|----------|--------|
| No START_HERE | HIGH | New user must guess reading order |
| README says v7.3.0 | HIGH | Confuses version perception vs v7.45/v7.46 reality |
| 284 flat files in docs/product | MEDIUM | v7.45 docs buried among older versions |
| No Stage C primer | HIGH | Central concept never explained |
| Docs index missing 5 files | MEDIUM | Blueprints omitted from table |
| Handoff pack is blueprint only | MEDIUM | Actual deliverables not created |
| Stale legacy docs at root | LOW | AGI Model Factory v5.5.0 branding |

## 3. Deliverables

### 3.1 New Files

| File | Purpose |
|------|---------|
| `START_HERE.md` | Project root entry point with 10-step reading order |
| `docs/product/AIP_V7_46_DOCS_INDEX.md` | Complete organized index of all current docs |
| `docs/product/AIP_V7_46_STAGE_C_PRIMER.md` | "What is Stage C?" from first principles |
| `docs/product/AIP_V7_46_PRE_RC_CHECKLIST.md` | Final checklist before RC consideration |
| `docs/product/AIP_V7_46_VERSION_BASELINE.md` | Current version history and baseline |
| `docs/product/AIP_V7_46_OPERATOR_START_HERE.md` | Operator-specific quickstart path |
| `docs/product/AIP_V7_46_DOCS_ORGANIZATION_PLAN.md` | Plan for future docs/product subfolder organization |

### 3.2 Updated Files

| File | Change |
|------|--------|
| `README.md` | Update current version from v7.3.0 to v7.46 pre-RC; add START_HERE pointer; fix docs index |
| `docs/product/AIP_V7_45_GITHUB_DOCS_INDEX.md` | Add 5 missing blueprint files; group by category |

## 4. START_HERE Reading Order

1. README.md (5 min — project overview)
2. START_HERE.md (this file — 10 min)
3. AIP_V7_46_VERSION_BASELINE.md (5 min — what version are we on)
4. AIP_V7_46_STAGE_C_PRIMER.md (10 min — core concept)
5. AIP_V7_45_INSTALL_AND_RUN_GUIDE.md (15 min — setup)
6. AIP_V7_45_OPERATOR_QUICKSTART.md (10 min — first commands)
7. AIP_V7_45_SAFE_STATUS_REFERENCE.md (10 min — safety model)
8. AIP_V7_45_STAGE_C_SAFETY_NOTICE.md (5 min — critical safety)
9. AIP_V7_45_OPERATOR_GUIDE.md (20 min — daily ops)
10. AIP_V7_45_RECOVERY_AND_RESTORE_GUIDE.md (10 min — what to do if broken)

## 5. Safety

- No code changes
- No registry changes
- No API changes
- No Stage C mentions as ready
