# AIP — Start Here

**Welcome to AegisFlow Intelligence Platform (AIP).**

This document tells you where to begin. It is the single entry point for new users and AI assistants.

---

## 1. What Is This Project?

AIP is a local-first AI governance and operations platform. It provides:

- A **web UI** for managing datasets, training, evaluations, deployments, workflows, and governance
- A **CLI** (`aip`) for local operations
- A **local API** for backend services
- A **safety system** that keeps destructive operations disabled by default
- A **restore point** system in design phase (plan-only)

## 2. Current Version

| Field | Value |
|-------|-------|
| Current baseline | **AIP v7.47 P1** (based on v7.46 Final Seal) |
| Git HEAD | `3d5c9cf` (main) |
| Stage C | **DISABLED** |
| Feature flag | **OFF** |
| Release status | **Pre-RC — not yet released or tagged** |

## 3. Quick Start

```powershell
# 1. Go to the project
Set-Location E:\AIP

# 2. Install dependencies
pnpm install

# 3. Initialize the database
pnpm run db:init

# 4. Start the project (starts API + Web UI)
pnpm run dev

# 5. Open the CLI (build from source first)
pnpm run aip:cli:build
node apps/aip-cli/dist/index.js

# Dev mode alternative (no build needed):
# pnpm --dir apps/aip-cli dev
```

See [docs/product/AIP_V7_45_INSTALL_AND_RUN_GUIDE.md](docs/product/AIP_V7_45_INSTALL_AND_RUN_GUIDE.md) for detailed setup.

## 4. Verify Setup

After the project is running, verify everything works:

```powershell
# TypeScript type checking
pnpm run typecheck

# Production build (Web UI)
pnpm run build

# Smoke tests (requires API running at http://127.0.0.1:8787)
# Run 'pnpm run dev' first, then in a new terminal:
pnpm test

# Check security posture
aip safe-status
```

## 5. First Commands

After setup, run these in order:

```powershell
# Where am I?
aip where

# Is it safe?
aip safe-status

# What can I do?
aip
```

## 6. What NOT To Do (Safety Rules)

- **Do NOT enable Stage C**
- **Do NOT toggle the feature flag**
- **Do NOT write to the database directly**
- **Do NOT restart services unless explicitly authorized**
- **Do NOT create tags or GitHub Releases**
- **Do NOT execute source restore**
- **Do NOT run `scripts/restore.mjs` without `--execute` and CONFIRM**
- **Do NOT add hidden preview pages to the sidebar**
- **Do NOT treat "continue" as authorization for Stage C**

## 7. Recommended Reading Order

| Step | Document | Time |
|------|----------|------|
| 1 | This file (START_HERE.md) | 5 min |
| 2 | [docs/product/AIP_V7_46_VERSION_BASELINE.md](docs/product/AIP_V7_46_VERSION_BASELINE.md) | 5 min |
| 3 | [docs/product/AIP_V7_46_STAGE_C_PRIMER.md](docs/product/AIP_V7_46_STAGE_C_PRIMER.md) | 10 min |
| 4 | [docs/product/AIP_V7_45_INSTALL_AND_RUN_GUIDE.md](docs/product/AIP_V7_45_INSTALL_AND_RUN_GUIDE.md) | 15 min |
| 5 | [docs/product/AIP_V7_45_OPERATOR_QUICKSTART.md](docs/product/AIP_V7_45_OPERATOR_QUICKSTART.md) | 10 min |
| 6 | [docs/product/AIP_V7_45_SAFE_STATUS_REFERENCE.md](docs/product/AIP_V7_45_SAFE_STATUS_REFERENCE.md) | 10 min |
| 7 | [docs/product/AIP_V7_45_STAGE_C_SAFETY_NOTICE.md](docs/product/AIP_V7_45_STAGE_C_SAFETY_NOTICE.md) | 5 min |
| 8 | [docs/product/AIP_V7_45_OPERATOR_GUIDE.md](docs/product/AIP_V7_45_OPERATOR_GUIDE.md) | 20 min |
| 9 | [docs/product/AIP_V7_45_RECOVERY_AND_RESTORE_GUIDE.md](docs/product/AIP_V7_45_RECOVERY_AND_RESTORE_GUIDE.md) | 10 min |
| 10 | [docs/product/AIP_V7_46_DOCS_INDEX.md](docs/product/AIP_V7_46_DOCS_INDEX.md) | 5 min |

## 8. Key Paths

| Path | Purpose |
|------|---------|
| `E:\AIP` | Project root |
| `E:\AIP\docs\product\` | Product documentation |
| `E:\_AIP_REPORTS\` | Generated reports |
| `E:\_AIP_RECEIPTS\` | Phase completion receipts |
| `E:\_AIP_RESTORE_POINTS\` | Restore points (not yet created) |

## 9. How to Verify Stage C Is Disabled

```powershell
aip safe-status
```

Or:

```powershell
Invoke-RestMethod http://127.0.0.1:8787/api/stage-c/status
```

Expected: `stageCEnabled: false`.

## 10. How to Continue Development

Each version follows a D1→P5 phase plan:

- **D1**: Blueprint
- **P1-P4**: Implementation phases
- **P5**: Final recheck + report + receipt

Before starting a new phase, read the relevant plan docs in `docs/product/`.

## 11. Avoiding Version Confusion

- Pre-v7.25 docs are **legacy** (AGI Model Factory era)
- v7.25-v7.40 docs exist but are **historical**
- v7.41-v7.45 are the current modern series
- v7.46 was the **pre-RC polish** phase
- v7.47 is the current **missing-risk closure** phase
- **No release/tag exists beyond v7.3.0** — do not treat any later version as released
