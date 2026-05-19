# AIP Validation and Seal Process

## Pre-Commit Validation Gates

Before any commit, all gates must pass:

| Gate | Command | Required |
|------|---------|----------|
| Lint | `npm run lint` (defined) | PASS |
| Typecheck | `npm run typecheck` (defined) | PASS |
| Build | `npm run build` (defined) | PASS |
| DB Doctor | `npm run db:doctor` (NOT defined in package.json) | SKIP |
| Secret Scan | `npm run secret:scan` (NOT defined in package.json) | SKIP |
| Smoke | `npm run test:smoke` (NOT defined in package.json) | SKIP |

注：`db:doctor`、`secret:scan`、`smoke` 脚本在 `apps/web-ui/package.json` 中未定义。早期报告可能因 `--if-present` 掩码而误标为 PASS，实际状态为 SKIP（script not defined）。详见 `AIP_VALIDATION_SCRIPT_PARITY_AUDIT.md`。

## Seal Audit Criteria (15 checks)

| # | Check | Description |
|---|-------|-------------|
| 1 | Registry completeness | All targets documented |
| 2 | No sidebar mutation | Sidebar boundaries invariant |
| 3 | No tag/release | No release tag created |
| 4 | Stage C gated | All Stage C items blocked |
| 5 | Readonly-first | No real execution |
| 6 | No DB write | No database mutation |
| 7 | No external control | No external tool control |
| 8 | Risk classification | Every rule has risk level |
| 9 | Blocking conditions | Every blocked rule documents reason |
| 10 | Next action | Every rule has next action |
| 11 | Pure functions only | No API calls, localStorage, DB writes |
| 12 | TypeScript strict | No implicit any |
| 13 | Lint pass | No eslint errors |
| 14 | Build pass | No compilation errors |
| 15 | Working tree clean | Before commit, no uncommitted changes |

## Commit Convention

```
feat(product): <description>
```

## Reports

Each seal generates two outputs:

1. **Seal Report** (`E:\_AIP_REPORTS\seal_vX.Y.Z_YYYY.MM.DD.md`) — Detailed criteria checklist
2. **Seal Receipt** (`E:\_AIP_RECEIPTS\vX.Y.Z_YYYY.MM.DD.txt`) — Compact receipt digest

Reports include: blocking count, warning count, info count, verdict, and HEAD hash.

## Final Seal Decision

When all 15 criteria pass with blocking=0, the seal is **READY_FOR_SEAL**. The final commit message follows:

```
feat(product): <feature description>

Seal: vX.Y.Z build YYYY.MM.DD
Blocking: 0  Warning: 0  Info: 0
```

## v7.30.0-P1 Runtime Readonly Status API Preview

P1 validated with:

| Check | Result |
|-------|--------|
| Registry completeness | 12 endpoints (8 GET + 4 POST) |
| No sidebar mutation | hidden direct route, not in sidebar |
| No backend endpoint | no apps/local-api modified |
| No API call | static registry only |
| No DB write | no database mutation |
| No external control | all external control blocked |
| Stage C gated | all endpoints report stageCRequired accurately |
| Readonly-first | pure static registry + validator |
| Hidden direct route | confirmed not in sidebar |

## v7.30.0-P2/P3/P4 Runtime Contract Acceleration Pack

P2 validated with:

| Check | Result |
|-------|--------|
| Registry completeness | 18 items (6 kinds) |
| No sidebar mutation | hidden direct route, not in sidebar |
| No backend endpoint | no apps/local-api modified |
| No API call | static registry only |
| No DB write | no database mutation |
| No external control | all external control blocked |
| Stage C gated | all items have stageCEnabled=false |
| Readonly-first | pure static registry + validator |
| Hidden direct route | confirmed not in sidebar |

P3 validated with:

| Check | Result |
|-------|--------|
| Registry completeness | 16 items (7 kinds) |
| No sidebar mutation | hidden direct route, not in sidebar |
| No backend endpoint | no apps/local-api modified |
| No API call | static registry only |
| No DB write | no database mutation |
| No external control | all external control blocked |
| Stage C gated | all items have stageCEnabled=false |
| Readonly-first | pure static registry + validator |
| Hidden direct route | confirmed not in sidebar |

P4 validated with:

| Check | Result |
|-------|--------|
| Registry completeness | 18 items (11 areas) |
| No sidebar mutation | hidden direct route, not in sidebar |
| No backend endpoint | no apps/local-api modified |
| No API call | static registry only |
| No DB write | no database mutation |
| No external control | all external control blocked |
| Stage C gated | all items have canEnableStageC=false |
| Readonly-first | pure static registry + validator |
| Hidden direct route | confirmed not in sidebar |
| Stage C NOT enabled | all 18 items have canEnableStageC=false |

## v7.27.0 Final Seal Decision

**Verdict: READY** (commit `8f8242a`, 2026-05-19)

| Check | Result |
|-------|--------|
| Registry completeness | Runtime (25), Dry-run (16), Audit (18) |
| No sidebar mutation | Confirmed — only advanced-mode + connector in sidebar |
| No tag/release | No tag created |
| Stage C gated | All Stage C items blocked |
| Readonly-first | No real execution in any preview |
| No DB write | No database mutation |
| No external control | No external tool control |
| Risk classification | All items classified |
| Blocking conditions | All blocked items have reasons |
| Validators pass | Runtime=0/0/3, Dry-run=0/0/3, Audit=0/0/3 |
| Hidden direct routes | All 3 preview routes confirmed hidden |
| Stage C disabled | Confirmed disabled across all registries |
| Route audit PASS | No sidebar leakage |
| Working tree clean | Confirmed |
| origin/main up to date | Confirmed |

## v7.28 Governance Blueprint — Validation Process

v7.28.0-D1 docs-only phase follows the same validation process. All gates must pass before commit. The `db:doctor`, `secret:scan`, `smoke` scripts remain undefined in `apps/web-ui/package.json` and will be recorded as SKIP in all v7.28 reports.

## v7.28.0-P3 Evidence Schema Preview

P3 Evidence Schema Preview is now established at `/evidence-schema-preview` (hidden direct, readonly). The preview shows evidence types and schema as a static model — **no evidence writer, no evidence store, no secret capture, no DB write, no external control, Stage C disabled**. The same validation gates (lint, typecheck, build) apply before any P3 commit. No new seal checks are required for this preview; all 15 seal audit criteria remain unchanged.|

## v7.28.0-P4 Rollback Preview

P4 Rollback Preview is now established at /rollback-preview (hidden direct, readonly). It provides a static display of rollback states and idempotency keys as a readonly model — **no rollback executor, no file restore, no git mutation, no DB write, no external control, Stage C disabled**. The same validation gates (lint, typecheck, build) apply before any P4 commit. No new seal checks are required for this preview; all 15 seal audit criteria remain unchanged.

---

## v7.28+ Status

- **v7.28.0 SEAL:** PASS (V7_28_FINAL_SEAL_READY) — Commit `349b20a`, 2026-05-19
- **v7.29.0-D1 Governance Console:** See `AIP_GOVERNANCE_CONSOLE_MASTER_BLUEPRINT.md` — design-only, not implemented
- **Stage C:** Remains disabled. No DB write. No external control. No executor implementation.
- **Sidebar:** Governance Console will not enter sidebar until human decision after v7.29 Final Seal.

---

## v7.29.0-P1 Governance Console Aggregator Preview

- **Status:** Established — v7.29.0-P1 complete
- **Route:** `/governance-console-preview` (hidden direct, not in sidebar)
- **Registry:** `governance-console-registry.ts` — 18 items
- **Validator:** `governance-console-validator.ts` — blocking=0, passes
- **TypeScript:** 0 errors
- **ESLint:** 0 errors
- **Build:** Success
- **Console does not:** mutate registries, execute actions, write DB, control external tools, enable Stage C

## v7.30.0-D2 Runtime API Contract Freeze — Validation

v7.30.0-D2 is docs-only. The following validation gates apply:

| Gate | Command | Status |
|------|---------|--------|
| Lint | `npm run lint` | PENDING |
| Typecheck | `npm run typecheck` | PENDING |
| Build | `npm run build` | PENDING |
| DB Doctor | `npm run db:doctor` | SKIP (script not defined) |
| Secret Scan | `npm run secret:scan` | SKIP (script not defined) |
| Smoke | `npm run test:smoke` | SKIP (script not defined) |

No source code changes were made. No backend implementation was performed.

## v7.29.0 Final Seal

- **Status:** V7_29_FINAL_SEAL_READY (commit 600a029)
- **Validators:** All 4 pass with 0 blocking
- **Rules applied:**
  - No Stage C, no DB write, no external control
  - All previews hidden direct, not in sidebar
  - All registries consistent
  - No console executor
  - No report export/store
- **Next:** v7.30.0-D1 Runtime Implementation Readiness Final Audit

## v7.30 Final Seal + v7.31 Blueprint

- **v7.30 Final Seal Status:** V7_30_FINAL_SEAL_READY (commit f55f952)
- **v7.31 Backend Readonly API Blueprint:** See `AIP_BACKEND_READONLY_API_IMPLEMENTATION_BLUEPRINT.md` — design-only, not implemented
- **Backend endpoint:** NOT implemented (blueprint only)
- **Runtime implementation:** NOT implemented (blueprint only)
- **Stage C:** Permanently disabled
- **DB write:** Not performed
- **External control:** Not enabled
- **Tag/Release:** Not created

## v7.31-D2 Human Review Pack

- **Status:** PENDING_HUMAN_OWNER_REVIEW
- **P1 skeleton:** Not yet approved
- **Backend endpoint:** NOT implemented (human review pack only)
- **Stage C:** Permanently disabled
- **DB write:** Not performed
- **External control:** Not enabled
- **Tag/Release:** Not created
