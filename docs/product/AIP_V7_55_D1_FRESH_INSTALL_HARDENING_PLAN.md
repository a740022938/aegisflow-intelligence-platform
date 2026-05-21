# AIP v7.55-D1 Fresh Install Hardening Plan

**Date:** 2026-05-21
**Phase:** D1 Blueprint
**Status:** Plan only — no execution

---

## 1. Objective

Audit and define the fresh install hardening requirements for v7.55-P1.
This document identifies gaps in the current install flow; it does not
modify any files.

---

## 2. Current Install Flow

As of HEAD `03dedef`, the recommended install flow is:

```powershell
git clone <repo>
cd aegisflow-intelligence-platform
pnpm install
pnpm run db:init
pnpm run dev
pnpm run aip:cli:build
node apps/aip-cli/dist/index.js
```

---

## 3. Gap Inventory

| # | Gap | Affected File | Severity | P1 Status | P1 Resolution |
|---|---|---|---|---|---|---|
| F1 | Version reference still says "v7.47 P1" | `START_HERE.md:23` | HIGH | ✅ RESOLVED | Updated to "AIP v7.55 Release/Install/Restore Hardening" |
| F2 | Git HEAD reference still says `3d5c9cf` | `START_HERE.md:24` | HIGH | ✅ RESOLVED | Updated to current HEAD `0faf4d8` |
| F3 | Phase reference says "v7.47 is the current missing-risk closure phase" | `README.md:9` | HIGH | ✅ RESOLVED | Updated to v7.55 hardening phase description |
| F4 | "Current baseline: AIP v7.46 Pre-RC" | `README.md:5` | HIGH | ✅ RESOLVED | Updated to "AIP v7.55 Release/Install/Restore Hardening" |
| F5 | Recommended reading references v7.45–v7.46 docs | `START_HERE.md:102-113` | MEDIUM | ⏳ DEFERRED | Docs are still valid; not critical for install flow |
| F6 | package.json version still `7.46.0` | `package.json` | MEDIUM | ⏳ DEFERRED | Not in P1 scope; defer to release decision (P5) |
| F7 | No mention of Datasets pilot or adapter rulebook | `START_HERE.md`, `README.md` | LOW | ⏳ DEFERRED | Low priority; README now references v7.51–v7.54 in history section |
| F8 | No smoke test verification for clean clone | Plan only | MEDIUM | ✅ RESOLVED | Verify Setup section expanded with typecheck, lint, build, CLI build, test order |
| F9 | `.env.local` secrets guidance minimal | `START_HERE.md` | LOW | ⏳ DEFERRED | Not in P1 scope; P2 candidate |

---

## 4. Verification Checklist (P1)

```text
[ ] pnpm install — 602+ dependencies resolved, 0 errors
[ ] pnpm run db:init — database initialized
[ ] pnpm run dev — API + Web UI start without errors
[ ] pnpm run typecheck — PASS (local-api + web-ui)
[ ] pnpm run build — PASS (vite, 740+ modules)
[ ] pnpm run lint — PASS (zero warnings)
[ ] pnpm run aip:cli:build — PASS
[ ] node apps/aip-cli/dist/index.js --help — CLI works
[ ] aip safe-status — Stage C DISABLED
[ ] aip where — correct branch/HEAD
```

---

## 5. pnpm/npm Lock File Risk

- `pnpm-lock.yaml` is the authoritative lock file
- `package-lock.json` was removed from git in v7.47 but may still appear in
  some working trees if not cleaned
- **Proposed rule**: Only `pnpm-lock.yaml` should be tracked; periodic audit
  to ensure no `package-lock.json` reappears

---

## 6. P1 Resolution Summary

P1 resolved 5 of 9 gaps (F1–F4, F8). The remaining 4 gaps (F5–F7, F9) are
deferred to later v7.55 phases. See `AIP_V7_55_P1_FRESH_INSTALL_DOCS_CONSISTENCY_RESULT.md`
for the full P1 report.
