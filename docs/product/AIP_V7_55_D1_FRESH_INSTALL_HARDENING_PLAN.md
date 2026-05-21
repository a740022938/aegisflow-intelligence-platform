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

| # | Gap | Affected File | Severity | Proposed Fix (P1) |
|---|---|---|---|---|
| F1 | Version reference still says "v7.47 P1" | `START_HERE.md:23` | HIGH | Update to "v7.55 D1" |
| F2 | Git HEAD reference still says `3d5c9cf` | `START_HERE.md:24` | HIGH | Update to current HEAD |
| F3 | Phase reference says "v7.47 is the current missing-risk closure phase" | `README.md:9` | HIGH | Update to v7.55 hardening phase |
| F4 | "Current baseline: AIP v7.46 Pre-RC" | `README.md:5` | HIGH | Update to current version |
| F5 | Recommended reading references v7.45–v7.46 docs | `START_HERE.md:102-113` | MEDIUM | Add v7.54/v7.55 references |
| F6 | package.json version still `7.46.0` | `package.json` | MEDIUM | Bump after release decision |
| F7 | No mention of Datasets pilot or adapter rulebook | `START_HERE.md`, `README.md` | LOW | Add reference to completed v7.54 work |
| F8 | No smoke test verification for clean clone | Plan only | MEDIUM | Add to P1 scope |
| F9 | `.env.local` secrets guidance minimal | `START_HERE.md` | LOW | Add brief guidance or link to env docs |

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

## 6. No Auto-Fix in D1

No files are modified in this D1 phase. All fixes listed in section 3 are
deferred to v7.55-P1.
