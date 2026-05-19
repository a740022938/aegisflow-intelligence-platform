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
