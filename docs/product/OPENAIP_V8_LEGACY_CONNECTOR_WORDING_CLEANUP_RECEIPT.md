# OpenAIP v8 Legacy Connector Wording Cleanup Receipt

## Verdict

`OPENAIP_V8_LEGACY_CONNECTOR_WORDING_CLEANUP_READY_WITH_GATE_CLOSED`

## Git

- Baseline HEAD: `eda6278`
- Commit hash: final Git commit recorded in final response; a commit cannot embed its own final hash
- Pushed: yes after final verification
- Working tree clean: yes after final commit/push

## Change Classification

| Item | Result |
|---|---|
| Source changed | Yes, wording-only UI source and one source-level smoke test |
| UI changed | Yes, wording/labels only |
| CLI changed | No |
| Docs changed | Yes |
| Runtime changed | No |
| Services restarted | No |
| DB written | No |
| Memory DB written | No |
| Vector DB written | No |
| Indexing job run | No |
| Gate opened | No |
| Stage C enabled | No |
| Release/tag created | No |
| Auth/Gate changed | No |
| Connector action executed | No |
| External/local/provider calls made | No |
| Sidebar exposed | No new v8 sidebar exposure |

## Files Changed

- `apps/web-ui/src/i18n.ts`
- `apps/web-ui/src/registry/menu-registry.ts`
- `apps/web-ui/src/pages/ConnectorCenterReadonly.tsx`
- `apps/web-ui/src/pages/ConnectorCenter.tsx`
- `apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs`
- `docs/product/OPENAIP_V8_LEGACY_CONNECTOR_WORDING_CLEANUP_REPORT.md`
- `docs/product/OPENAIP_V8_LEGACY_CONNECTOR_WORDING_CLEANUP_RECEIPT.md`

## Labels Changed

- `连接器中心` -> `连接器中心（旧）`
- `Connector Center` -> `Legacy Connector Center`
- `Connector Center Preview` -> `Connector Center Preview · Legacy v7 Readonly View`
- `Connector Center Readonly Shell` -> `Legacy Connector Center Readonly Shell`

## Verification

Passed:

- `git status -sb` at baseline: clean
- `git diff --check`: pass
- Route/source smoke: `node --test apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs` pass, 99/99
- `npm run typecheck`: pass
- `npm run lint`: pass
- `npm run build`: pass

Not run:

- `npm test --silent`: not run because API `8787` was not already listening; runtime was not forced or restarted

## Safety Grep

Safety grep on changed files completed.

Classification:

- Legacy wording: `Legacy Connector Center`, `连接器中心（旧）`, `v7 readonly view`.
- Safe internal links: v8 Integration Center, Local Apps Center, and Provider Manager route strings.
- Readonly safety text: `Gate`, `Stage C`, `token`, `API key`, `DB write`, `release`, `restore`, `launch`, `execute`, `external`.
- Source test text: route/safety assertions in `v8-center-readonly-route-smoke.test.mjs`.
- Existing unrelated file content: `i18n.ts` already contains server-side translation sync and `fetch('/api/ui/i18n')`; this task did not add or change that implementation.

Risky hits:

- None. No event handler, API-call implementation, connector action, route rename, sidebar exposure, or runtime mutation was introduced.

## Human Authorization Needed

Needed before any later visible navigation expansion:

- Approve any v8 route sidebar promotion.
- Approve any route rename.
- Approve any connector logic migration.
- Approve any Gate/Stage C exposure.

## Recommended Next Step

Browser screenshot review of the legacy Connector Center wording and the v8 migration links, without exposing v8 pages to sidebar.
