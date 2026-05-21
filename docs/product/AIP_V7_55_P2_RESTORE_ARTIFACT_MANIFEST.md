# AIP v7.55-P2 Restore Artifact Manifest

**Date:** 2026-05-21
**Phase:** P2

---

## 1. Purpose

Define what a future AIP restore artifact (restore point zip) must include,
must exclude, and may conditionally include. This manifest serves as the
authoritative specification for any restore point creation.

---

## 2. Must Include

| # | Artifact | Rationale |
|---|---|---|
| M1 | Source repo snapshot (commit hash) | Reproducible state |
| M2 | `README.md` | Entry point documentation |
| M3 | `START_HERE.md` | Install/run guide |
| M4 | `pnpm-lock.yaml` | Authoritative dependency lock |
| M5 | `package.json` (root + workspaces) | Package manifests |
| M6 | `docs/product/` — all v7.55 release/install/restore docs | Operational documentation |
| M7 | `.env.example` | Configuration template (no secrets) |
| M8 | `scripts/` — restore, safety, build scripts | Recovery tooling |
| M9 | `restore-exclusions.txt` | Exclusion rules |
| M10 | Safe startup instructions (documented in manifest) | How to use the restore point |

---

## 3. Must Exclude

| # | Artifact | Rationale |
|---|---|---|
| E1 | `.env.local`, `.env.*.local` | Secrets, credentials |
| E2 | `*.key`, `*.token`, `*.pem` | Cryptographic secrets |
| E3 | `node_modules/`, `.pnpm-store/` | Dependencies (reinstalled via `pnpm install`) |
| E4 | `dist/`, `*.tsbuildinfo`, `.vite/` | Build artifacts (rebuilt via `pnpm run build`) |
| E5 | `*.db`, `*.db-shm`, `*.db-wal`, `*.db.bak*` | Database files (restored separately via DB migration) |
| E6 | `.DS_Store`, `Thumbs.db`, `desktop.ini` | OS artifacts |
| E7 | `*.pt`, `*.pth`, `*.onnx`, `*.safetensors` | Model weights (external dependencies) |
| E8 | `__pycache__/`, `*.pyc` | Python cache |
| E9 | `*.log`, `logs/`, `_logs/` | Runtime logs |
| E10 | `coverage/`, `test-results/` | Test output |
| E11 | `E:\_AIP_REPORTS\` | External reports (outside repo) |
| E12 | `E:\_AIP_RECEIPTS\` | External receipts (outside repo) |
| E13 | `_AIP_BACKUPS/`, `_AIP_TEMP/`, `_TEMP/`, `_DELETE_CANDIDATES/` | AIP internal working dirs |

---

## 4. Conditional Include

| # | Artifact | Condition |
|---|---|---|
| C1 | External report/receipt paths as references | Only if copied as reference docs under `docs/product/` |
| C2 | DB snapshot | Only under separate explicit authorization with encryption |
| C3 | Generated build artifacts | Only if release mode later requires deterministic build output |
| C4 | Docker configuration | Only if release mode targets Docker deployment |

---

## 5. Manifest Structure (Proposed)

A restore point zip should contain:

```
restore-point-v7.55-<commit-hash>/
├── source/
│   ├── README.md
│   ├── START_HERE.md
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── restore-exclusions.txt
│   ├── .env.example
│   ├── scripts/
│   └── docs/product/
├── manifest.json          # Machine-readable manifest
│   ├── created_at: ISO timestamp
│   ├── commit_hash: git HEAD
│   ├── version: product version
│   ├── includes: [list of included paths]
│   ├── excludes: [list of excluded patterns]
│   └── integrity: sha256 of manifest
└── README-restore.md      # How to use this restore point
```
