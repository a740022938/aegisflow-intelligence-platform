# AIP v7.47 — Pre-RC Missing-Risk Closure Blueprint

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Baseline:** AIP v7.46 Final Seal — HEAD `e520326`
**D0 Verdict:** `NEEDS_MORE_POLISH_BEFORE_LOCAL_RC`
**Target Verdict:** `V7_47_FINAL_SEAL_READY_FOR_LOCAL_RC_WITH_STAGE_C_DISABLED`

---

## 1. Objective

v7.47 is **not a release**. No tag. No GitHub Release. No Stage C enablement.

v7.47 closes 15 findings from the v7.47-D0 Missing-Risk Sweep (2 critical, 3 high, 6 medium, 4 low), progressing AIP from `NEEDS_MORE_POLISH_BEFORE_LOCAL_RC` to `READY_FOR_LOCAL_RC`.

## 2. D0 Verdict Summary

| Area | Critical | High | Medium | Low | Key Issues |
|------|----------|------|--------|-----|-----------|
| CLI/Install | 2 | 0 | 0 | 0 | START_HERE uses `npm`; CLI `dist/` missing in fresh clone |
| Version | 0 | 1 | 0 | 0 | Docs say v7.46, code says v7.3.1 |
| Restore | 0 | 1 | 1 | 0 | `restore-exclusions.txt` missing; zip extraction in plan-only |
| Safety/Secrets | 0 | 0 | 2 | 0 | .env.local Telegram creds; hardcoded E:\AIP path |
| UI/Sidebar | 0 | 0 | 1 | 0 | 17 sidebar entries contradict own recommendedExposure |
| Lock/Dep | 0 | 1 | 0 | 1 | Dual lock files; npm vuln (brace-expansion) |
| Scripts | 0 | 0 | 1 | 1 | rollback cmd no confirmation; restore zip extraction in plan-only |
| Type Safety | 0 | 0 | 0 | 1 | tsconfig missing `"types": ["node"]` |
| UX | 0 | 0 | 0 | 1 | PowerShell codepage 936 (low, has --plain workaround) |

## 3. The 15 Findings

### Critical (2)

| # | Finding | File | Detail |
|---|---------|------|--------|
| C1 | START_HERE uses `npm`, project requires `pnpm` | `START_HERE.md:36-47` | `npm install`, `npm run typecheck`, `npm test`, `npm run build`, `npm run dev` — all must be `pnpm` |
| C2 | `apps/aip-cli/dist/index.js` missing in fresh clone | `START_HERE.md:47` | `dist/` is gitignored; `tsc` step required before CLI is available |

### High (3)

| # | Finding | File | Detail |
|---|---------|------|--------|
| H1 | Dual lock files tracked | `package-lock.json`, `pnpm-lock.yaml` | Both in git; project uses pnpm — npm lock is stale/unused |
| H2 | Version mismatch: docs vs code | All `package.json`, `appVersion.ts`, `Layout.tsx:382` | All code files say `7.3.1`; docs say v7.46 |
| H3 | `restore-exclusions.txt` referenced but missing | Referenced in 3 docs | Expected at `E:\AIP\restore-exclusions.txt` or restore point pack dir |

### Medium (6)

| # | Finding | File | Detail |
|---|---------|------|--------|
| M1 | START_HERE missing `db:init` step | `START_HERE.md` | API may not start without initialized database |
| M2 | `npm test` listed before `npm run dev` in START_HERE | `START_HERE.md:39-40` | Smoke tests require API running at localhost:8787 |
| M3 | .env.local contains Telegram bot token + chat ID | `.env.local:44-45` | Apparently real credentials on disk unencrypted |
| M4 | 17 sidebar entries contradict own recommendedExposure | `navigation-exposure-registry.ts:394-627` | `currentExposure: 'primary_nav'` but `recommendedExposure` says move away |
| M5 | `safe-status.ts` hardcodes `E:\AIP` path | `safe-status.ts:6` | `cwd: 'E:\\AIP'` will break if project moved |
| M6 | `restore.mjs` extracts zip before plan-only check | `restore.mjs:64-72` | Temp dir + zip extraction happen even in PLAN_ONLY mode |

### Low (4)

| # | Finding | File | Detail |
|---|---------|------|--------|
| L1 | 1 moderate npm vulnerability (brace-expansion) | transitive dep | DoS risk, not critical |
| L2 | aip-cli tsconfig missing `"types": ["node"]` | `apps/aip-cli/tsconfig.json` | No Node.js type safety during dev |
| L3 | PowerShell codepage 936 (GB2312) | System | Garbled Unicode risk; `--plain` workaround exists |
| L4 | `rollback_pre_seal_repair.cmd` has no confirmation | `scripts/rollback_pre_seal_repair.cmd` | Runs `git restore` on 13 files without warning |

## 4. Safety Invariants (D1→P5)

| Invariant | Enforcement |
|-----------|-------------|
| Stage C disabled | Blocked at API, all registries, all validators |
| Feature flag off | Non-mutable from UI |
| No POST runtime | Blocked at safety boundary |
| No DB write | Blocked (except existing public endpoints already fixed in v7.46) |
| No executor | No executor code in repository |
| No external control | Blocked at safety boundary |
| No connector action | Blocked at safety boundary |
| No sidebar hidden pages | Only 2 correct sidebar entries — P4 will not add new ones |
| No tag/GitHub Release | Manual prohibition |

## 5. Phase Map

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| D1 | Blueprint | This doc + 5 partner plans |
| P1 | Fix Fresh Install Flow | Fix START_HERE.md (pnpm, db:init, CLI build, test ordering); add CLI build to docs/README |
| P2 | Version Consistency | Bump all `package.json` to `7.46.0`; update `appVersion.ts`, `appMeta.ts`; verify CLI + UI footer |
| P3 | Restore Readiness | Create `restore-exclusions.txt`; fix `restore.mjs` plan-only to skip zip extraction; remove `package-lock.json` from git |
| P4 | Safety Cleanup | Handle .env.local credential docs/rotation; fix sidebar entries; remove hardcoded path; add rollback confirmation; fix tsconfig; run npm audit fix |
| P5 | Final Pre-RC Recheck | Full missing-risk sweep recheck + report + receipt |

## 6. Exit Criteria

All of the following must pass:
- [ ] START_HERE.md: all `npm` → `pnpm`, includes `db:init`, reorders test after dev, has CLI build step
- [ ] Fresh clone: `pnpm install && pnpm run db:init && pnpm run build && pnpm run dev` works end-to-end; CLI available without prebuilt `dist/`
- [ ] Version: all `package.json` files at `7.46.0`; `appVersion.ts` at `v7.46.0`; CLI reports `v7.46.0`; UI footer shows `v7.46.0`
- [ ] Lock files: only `pnpm-lock.yaml` tracked; `package-lock.json` removed from git and `.gitignore`d
- [ ] `restore-exclusions.txt` exists at project root with exclusions documented
- [ ] `restore.mjs` does not extract zip or create temp dir in plan-only mode
- [ ] .env.local Telegram credentials documented or rotated; documentation exists for .env.local hygiene
- [ ] 17 sidebar entries either moved to correct exposure or acknowledged with deferred migration plan
- [ ] `safe-status.ts` no longer hardcodes `E:\AIP` — uses `process.cwd()` or config
- [ ] `rollback_pre_seal_repair.cmd` has confirmation prompt before destructive git restore
- [ ] `apps/aip-cli/tsconfig.json` includes `"types": ["node"]`
- [ ] 1 moderate npm vuln addressed (or documented with deferral)
- [ ] Safety: Stage C disabled, feature flag off, all runtime blocked
- [ ] Working tree: clean at P5 end

## 7. Out of Scope

- Stage C enablement
- Feature flag toggle
- Real restore execution
- Repair execution
- New mutation API endpoints
- New sidebar entries or new sidebar pages
- Adding hidden preview pages
- GitHub Release or tag creation
- Service restart
- Full sidebar migration (already documented as deferred)
- Telegram credential rotation — only documentation/hygiene improvements
- PowerShell codepage fix (out of scope for this RC)
