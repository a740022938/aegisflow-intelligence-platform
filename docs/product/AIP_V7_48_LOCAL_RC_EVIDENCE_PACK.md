# AIP v7.48 — Local RC Evidence Pack

**Date:** 2026-05-20
**Phase:** P4
**Baseline HEAD:** `3d25af5`
**Working Tree:** CLEAN
**Stage C:** DISABLED

---

## 1. v7.46 Blockers Resolved

| Blocker | Status | Evidence |
|---------|--------|----------|
| Fresh install flow uses `pnpm` | ✅ RESOLVED | `START_HERE.md`: all commands use `pnpm`, includes `db:init`, `aip:cli:build` documented, test ordered after dev |
| Version consistency | ✅ RESOLVED | All `package.json` at `7.46.0`, `appVersion.ts` at `v7.46.0`, CLI reports `v7.46.0` |
| Restore readiness | ✅ RESOLVED | `restore-exclusions.txt` exists, `package-lock.json` removed from git, `restore.mjs` plan-only exits before extraction |
| Safety cleanup | ✅ RESOLVED | `.env.example` with safe defaults, `safe-status.ts` uses `process.cwd()`, `tsconfig.json` has `"types": ["node"]`, `rollback_pre_seal_repair.cmd` has confirmation prompt |

---

## 2. v7.47 Missing-Risk Sweep Resolved

| Severity | Total | Resolved | Deferred |
|----------|-------|----------|----------|
| Critical | 2 | 2 | 0 |
| High | 3 | 3 | 0 |
| Medium | 6 | 5 | 1 (`.env.local` doc-only) |
| Low | 4 | 3 | 1 (codepage 936 OOS) |
| **Total** | **15** | **13** | **2** |

Full details: `E:\_AIP_REPORTS\AIP_v7.47_P5_final_missing_risk_recheck_report_20260520.md`

---

## 3. OpenAIP CLI Branding

| Feature | Status |
|---------|--------|
| OPENAIP ASCII banner | ✅ Implemented |
| Per-line gradient (bright cyan → green) | ✅ Implemented |
| `--plain` fallback | ✅ Works |
| `--no-color` fallback | ✅ Works |
| `--ascii` fallback | ✅ Works |
| `--no-banner` fallback | ✅ Works |
| `NO_COLOR=1` env var | ✅ Supported |
| `AIP_NO_BANNER=1` env var | ✅ Supported |
| High-risk labels: restart/repair source | ✅ Strengthened |
| "AGI Production Command Center" removed | ✅ Confirmed |

---

## 4. CLI Command Verification

| Command | Status | Notes |
|---------|--------|-------|
| `aip where` | ✅ Works | Shows branch, HEAD, working tree, reports/receipts dirs |
| `aip safe-status` | ✅ Works | Stage C DISABLED, all blocks active |
| `aip receipt template` | ✅ Works | Generates template with current HEAD |
| `aip next` | ✅ Works | Readonly recommended next step |
| `aip release-status` | ✅ Works | Tag NOT CREATED, GitHub Release NOT CREATED |

---

## 5. Fresh Start Dry Run Evidence

| Check | Result | Evidence |
|-------|--------|----------|
| `pnpm install` | ✅ PASS | 602 dependencies resolved, 0 errors |
| `pnpm run aip:cli:build` | ✅ PASS | `tsc` compiled successfully |
| `aip` | ✅ PASS | OpenAIP banner, 22 commands |
| `pnpm run typecheck` | ✅ PASS | local-api + web-ui, 0 errors |
| `pnpm run build` | ✅ PASS | vite, 735 modules, 0 errors |

Full dry run report: `docs/product/AIP_V7_48_LOCAL_RC_DRY_RUN_RESULT.md`

---

## 6. Restore PLAN-ONLY Evidence

- `scripts/restore.mjs`: PLAN_ONLY exits at line 66 before temp dir creation and zip extraction at line 74+
- Confirmed by code review and `aip safe-status` report

---

## 7. Stage C Disabled Evidence

| Source | Evidence |
|--------|----------|
| `aip safe-status` | `Stage C: DISABLED` |
| `aip release-status` | `Stage C: DISABLED` |
| Banner status line | `Mode: SAFE / Stage C DISABLED / Feature Flag OFF` |
| Code review | No Stage C enablement changes in any v7.48 commit |

---

## 8. No Tag / No Release Evidence

| Check | Result |
|-------|--------|
| `git tag --points-at HEAD` | No output (no tag) |
| `gh release list` | Only v7.3.x releases exist (pre-v7.48) |
| `aip release-status` | `Tag: NOT CREATED`, `GitHub Release: NOT CREATED` |
| Banner status line | `Release: Local RC candidate / No tag / No GitHub Release` |

---

## 9. Safety Invariants Summary

| Invariant | Status |
|-----------|--------|
| Stage C DISABLED | ✅ |
| Feature flag OFF | ✅ |
| POST runtime BLOCKED | ✅ |
| DB write BLOCKED | ✅ |
| Executor ABSENT | ✅ |
| External control BLOCKED | ✅ |
| Connector action BLOCKED | ✅ |
| Restore PLAN-ONLY | ✅ |
| No tag at HEAD | ✅ |
| No GitHub Release | ✅ |
| No service restart | ✅ |
| Working tree CLEAN | ✅ |
