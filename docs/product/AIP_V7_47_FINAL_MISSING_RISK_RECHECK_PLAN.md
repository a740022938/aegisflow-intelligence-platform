# AIP v7.47 — Final Pre-RC Missing-Risk Recheck Plan

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Phase:** P5

---

## 1. Objective

After all P1-P4 fixes are complete, re-run the full missing-risk sweep across all 10 areas to verify v7.47 is ready for local RC entry. Generate report and receipt.

## 2. Exit Criteria Checklist

### CLI Resolution
- [ ] Global `aip` resolves to repo source (pnpm shim), not stale dist
- [ ] All 22 real commands work, no ghost commands in help

### Fresh Install Flow (P1)
- [ ] `START_HERE.md` uses `pnpm` everywhere, NOT `npm`
- [ ] Fresh clone: `pnpm install && pnpm run db:init && pnpm run dev` works
- [ ] `aip:cli:build` documented; CLI available after build step
- [ ] `pnpm test` listed after `pnpm run dev` (not before)

### Version Consistency (P2)
- [ ] Root `package.json`: `7.46.0`
- [ ] `apps/aip-cli/package.json`: `7.46.0`
- [ ] `apps/local-api/package.json`: `7.46.0`
- [ ] `apps/web-ui/package.json`: `7.46.0`
- [ ] `appVersion.ts`: `'v7.46.0'`
- [ ] CLI reports `v7.46.0` via `aip version`
- [ ] UI footer shows `AIP v7.46.0`

### Restore Readiness (P3)
- [ ] Only `pnpm-lock.yaml` tracked; `package-lock.json` removed from git
- [ ] `restore-exclusions.txt` exists at project root
- [ ] `restore.mjs` plan-only mode: no temp dir, no zip extraction, only zip listing

### Safety Cleanup (P4)
- [ ] `.env.example` exists with safe defaults
- [ ] Navigation registry: 17 entries acknowledged with deferral comment
- [ ] `safe-status.ts`: no hardcoded `E:\AIP` path
- [ ] `apps/aip-cli/tsconfig.json`: includes `"types": ["node"]`
- [ ] `rollback_pre_seal_repair.cmd`: has confirmation prompt

### Security Posture
- [ ] Stage C: DISABLED (API + static evidence)
- [ ] Feature flag: OFF
- [ ] POST runtime: BLOCKED
- [ ] DB write: BLOCKED
- [ ] Executor: ABSENT
- [ ] External control: BLOCKED
- [ ] Connector action: BLOCKED
- [ ] Master-switch POST: returns 403 (no DB write)
- [ ] Token bootstrap: requires admin token
- [ ] JWT_SECRET: fail-closed unless `AIP_ALLOW_DEV_JWT=1`

### Git & Working Tree
- [ ] Working tree: CLEAN
- [ ] No unpushed commits (ahead of origin/main)
- [ ] No accidental tags
- [ ] No `.env` or secret files tracked

### Dep & Build Health
- [ ] `pnpm install` succeeds
- [ ] `pnpm run typecheck` passes
- [ ] `pnpm run build` succeeds
- [ ] `npm audit` reviewed (or deferred findings documented)

## 3. Recheck Method

Run these commands and verify output:

```powershell
# CLI
aip where
aip safe-status
aip version
aip --plain

# Version consistency
node -e "console.log(require('./package.json').version)"
node -e "console.log(require('./apps/aip-cli/package.json').version)"

# Install
pnpm install

# Type safety
pnpm run typecheck

# Git
git status
git log --oneline -3
git tag --list

# Secrets
pnpm run secret:scan

# Audit
npm audit --omit=dev
```

## 4. Deliverables

| Deliverable | Path |
|-------------|------|
| Recheck Report | `E:\_AIP_REPORTS\AIP_v7.47_P5_final_missing_risk_recheck_report_YYYYMMDD.md` |
| Recheck Receipt | `E:\_AIP_RECEIPTS\AIP_v7.47_P5_final_missing_risk_recheck_receipt_YYYYMMDD.md` |

## 5. Safety

- No stage-c enablement
- No feature flag toggle
- No DB write
- No service restart
- No tag/release creation
- Readonly verification only
