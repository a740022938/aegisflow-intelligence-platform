# AIP v7.47 — Fix Fresh Install Flow Plan

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Phase:** P1

---

## 1. Objective

Fix the 2 critical blockers (C1, C2) and 2 medium issues (M1, M2) that prevent a new user from successfully installing and running the project from documentation alone.

## 2. Current State

From D0 sweep:

| Issue | File | Detail |
|-------|------|--------|
| C1 | `START_HERE.md:36-47` | 5 `npm` commands should be `pnpm` — `npm install`, `npm run typecheck`, `npm test`, `npm run build`, `npm run dev` |
| C2 | `START_HERE.md:47` | `node apps/aip-cli/dist/index.js` — `dist/` is gitignored, does not exist in fresh clone |
| M1 | `START_HERE.md` | No `db:init` step — API may not start without initialized database |
| M2 | `START_HERE.md:39-40` | `npm test` listed before `npm run dev` — smoke tests require API running at localhost:8787 |

Root `package.json` correctly uses `pnpm` scripts (`aip:cli:build` is `pnpm --dir apps/aip-cli build`), but START_HERE.md and npm scripts use `npm` instead of `pnpm`.

## 3. Deliverables

### 3.1 Fix START_HERE.md Quick Start (lines 31-48)

Replace all `npm` commands with `pnpm`:

```powershell
# 2. Install dependencies
pnpm install

# 3. Initialize the database
pnpm run db:init

# 4. Start the project (starts API + Web UI)
pnpm run dev

# 5. In a new terminal, verify CLI
node apps/aip-cli/dist/index.js --help
```

Note: `pnpm run typecheck` and `pnpm test` removed from quick start — new users should get running first. A "Verify Setup" section below covers verification steps.

### 3.2 Add CLI Build Step to Quick Start

Since `dist/index.js` is gitignored, add build step before CLI verification:

```powershell
# (optional) Build CLI for standalone use
pnpm run aip:cli:build

# Use the built CLI
node apps/aip-cli/dist/index.js --help
```

Alternatively, if `tsx` is available (it's a devDependency), show the dev-mode alternative:

```powershell
# Dev mode (no build needed)
pnpm --dir apps/aip-cli dev --help
```

### 3.3 Add "Verify Setup" Section

After the Quick Start, add a section with verification commands:

- `pnpm run typecheck` — verify TypeScript
- `pnpm run build` — verify build
- `pnpm test` — smoke tests (requires API running)
- `aip safe-status` — verify safety posture

### 3.4 Remove or Fix Quick Start test Command

The `npm test` / `pnpm test` command depends on API being running. Options:
- Move it after `pnpm run dev` as a separate "Verify" step
- Add a note: "Requires API running on http://127.0.0.1:8787 — run pnpm run dev first"

## 4. Specific Changes to START_HERE.md

### Line 36: `npm install` → `pnpm install`
### Line 37-41: Remove `typecheck`/`test`/`build` from Quick Start, add separate verify section
### Line 42-44: Keep `npm run dev` → change to `pnpm run dev`
### Line 45-48: CLI access — add `aip:cli:build` step or use `tsx` dev approach
### Add: `db:init` step after install (line ~37)

## 5. Verification

```powershell
# Fresh clone simulation
Set-Location E:\AIP
pnpm install
pnpm run db:init
pnpm run dev
# In new terminal:
pnpm run aip:cli:build
node apps/aip-cli/dist/index.js --help
# Verify output includes all 22 commands, no ghost commands
```

## 6. Review README.md Consistency

- `README.md` already correctly uses `pnpm` commands
- Verify README references `db:init`
- Verify README matches START_HERE.md structure

## 7. Safety

- No stage-c enablement
- No feature flag toggle
- No DB write
- No POST runtime
- No executor
- No service restart
