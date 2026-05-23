# OpenAIP v8 Validation Evidence Summary

## Final Seal Context

- Final seal verdict: `OPENAIP_V8_NINE_CENTER_READONLY_MVP_FINAL_SEAL_PASS_WITH_GATE_CLOSED`.
- Known final seal HEAD: `5b631fa`.
- Current acceptance baseline HEAD before this pack: `5b631fa`.
- HEAD difference from known final seal: none at baseline.
- Gate: CLOSED.
- Stage C: disabled.

## Fresh Verification In This Acceptance Pack

The following commands are expected for this pack and should be recorded in the final report/receipt after execution:

| Check | Command | Result |
|---|---|---|
| Baseline status | `git status -sb` | PASS at baseline: `## main...origin/main` |
| Branch | `git branch --show-current` | PASS at baseline: `main` |
| Baseline HEAD | `git rev-parse --short HEAD` | PASS at baseline: `5b631fa` |
| Recent history | `git log --oneline -15` | PASS, final seal commit present at HEAD |
| Diff whitespace | `git diff --check` | PASS |
| Route smoke | `node apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs` | PASS: 98 tests passed |
| Registry validator | `node scripts/validate-v8-foundation-index.mjs` | PASS |
| Registry examples validator | `node scripts/validate-v8-registry-examples.mjs` | PASS |
| CLI build | `npm --prefix apps/aip-cli run build` | PASS |
| Typecheck | `npm run typecheck` | PASS |
| Lint | `npm run lint` | PASS |
| Build | `npm run build` | PASS with existing chunk-size warning |
| npm test | `npm test --silent` | PASS: 9 passed, 0 failed |

## Lifecycle Contract Fix

The earlier acceptance pack was blocked because `node scripts/validate-v8-registry-examples.mjs` rejected the existing agents example lifecycle value `planned`.

Source-of-truth decision:

- `planned` is a valid v8 agent lifecycle.
- Evidence: `apps/web-ui/src/registry/openAipv8CenterData.ts` includes `planned` in `V8Lifecycle`; Agent Center UI renders `planned`; `apps/aip-cli/src/commands/agents.ts` counts `planned`; route smoke tests expect `planned`.
- Fix: `apps/aip-cli/src/v8Contracts.ts` and `scripts/validate-v8-registry-examples.mjs` now include `planned`; OpenClaw example metadata now explicitly carries `firstClass: true` and `optional: true`; capability validation now uses the current `gateRequired/stageCRequired` field names.

Runtime note:

- API 8787 was unavailable before `npm test --silent`.
- Standard `aip start` was used.
- No restart/taskkill/Stop-Process was used.
- API health returned HTTP 200 before `npm test --silent`.

## Latest Known Final Seal Evidence

Latest known final seal evidence stated in the task package:

- API 8787 was initially unavailable.
- Standard `aip start` was used to recover live smoke.
- No restart/taskkill/Stop-Process was used.
- `npm test` passed after API became available.
- No DB/Auth/Gate/Stage C/release/restore changes.

This acceptance pack does not rely on a new runtime start unless explicitly recorded in the final receipt.

## Route Smoke Coverage

The source-level route smoke test covers:

- all 10 v8 route strings in `App.tsx`
- all 10 v8 page files
- no v8 sidebar exposure in `Layout.tsx`
- Command Center links to the other center pages
- safety strings including Readonly, No runtime mutation, Gate CLOSED, Stage C disabled
- registry-backed data usage
- legacy `/connector-center` and `/connector-center-readonly` still existing
- CLI v8 centers/status content
- center-specific safety assertions

## Working Tree And Push

Working tree and push status are finalized in:

- `docs/product/OPENAIP_V8_READONLY_MVP_PRODUCT_ACCEPTANCE_REPORT.md`
- `docs/product/OPENAIP_V8_READONLY_MVP_PRODUCT_ACCEPTANCE_RECEIPT.md`
