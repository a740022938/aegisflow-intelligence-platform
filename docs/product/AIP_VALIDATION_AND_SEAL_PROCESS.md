# AIP Validation and Seal Process

## Pre-Commit Validation Gates

Before any commit, all gates must pass:

| Gate | Command | Required |
|------|---------|----------|
| Lint | `npm run lint` | PASS |
| Typecheck | `npm run typecheck` | PASS |
| Build | `npm run build` | PASS |
| DB Doctor | `npm run db:doctor` | PASS |
| Secret Scan | Manual grep for tokens | CLEAN |

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
