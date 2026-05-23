# OpenAIP v8 Legacy Connector Wording Cleanup Report

## Final Verdict

`OPENAIP_V8_LEGACY_CONNECTOR_WORDING_CLEANUP_READY_WITH_GATE_CLOSED`

## Baseline

- Baseline HEAD: `eda6278`
- Branch: `main`
- Scope: wording-only legacy labeling for old Connector Center surfaces
- Runtime scope: no runtime action, no service restart, no connector action, no external/local/provider API calls
- Navigation scope: no route rename, no v8 sidebar exposure, no deletion of old Connector Center

## Files Changed

Source/UI wording:

- `apps/web-ui/src/i18n.ts`
- `apps/web-ui/src/registry/menu-registry.ts`
- `apps/web-ui/src/pages/ConnectorCenterReadonly.tsx`
- `apps/web-ui/src/pages/ConnectorCenter.tsx`

Source test:

- `apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs`

Docs:

- `docs/product/OPENAIP_V8_LEGACY_CONNECTOR_WORDING_CLEANUP_REPORT.md`
- `docs/product/OPENAIP_V8_LEGACY_CONNECTOR_WORDING_CLEANUP_RECEIPT.md`

## Labels Changed

| Location | Before | After | Classification |
|---|---|---|---|
| Chinese sidebar i18n | `连接器中心` | `连接器中心（旧）` | Safe to change now |
| English sidebar i18n | `Connector Center` | `Legacy Connector Center` | Safe to change now |
| Menu registry label | `连接器中心` | `连接器中心（旧）` | Safe to change now |
| ConnectorCenterReadonly title | `Connector Center` | `Legacy Connector Center` | Safe to change now |
| ConnectorCenterReadonly version label | `Connector Center Preview` | `Connector Center Preview · Legacy v7 Readonly View` | Safe to change now |
| ConnectorCenter title | `连接器中心` | `连接器中心（旧）` | Safe to change now |
| ConnectorCenter subtitle | `Connector Center Readonly Shell` | `Legacy Connector Center Readonly Shell` | Safe to change now |

## Migration Notice Added / Preserved

The old Connector Center surfaces now explicitly say:

- This legacy Connector Center is a v7 readonly view.
- OpenAIP v8 consolidates external tools under Integration Center, Local Apps Center, and Provider Manager.
- The page remains a compatibility overview.
- It does not execute connector actions, call APIs, or write configuration.

Safe internal links are present to:

- `/openaip-v8-integration-center-preview`
- `/openaip-v8-local-apps-center-preview`
- `/openaip-v8-provider-manager-preview`

## Labels Intentionally Left Unchanged

| Area | Decision | Reason |
|---|---|---|
| Historical governance/advanced references to Connector Center | Leave unchanged | These are not the active old Connector Center visible surface and changing them would broaden the task |
| Route paths such as `/connector-center-readonly` | Leave unchanged | Task explicitly forbids route rename |
| v8 preview route names | Leave unchanged | Task explicitly forbids v8 sidebar exposure or route changes |
| Connector registry behavior fields | Leave unchanged | Task forbids connector logic changes |
| Auth/Gate/DB/Stage C/runtime text outside legacy wording | Leave unchanged | Avoid broad refactor |

## Route / Sidebar Check

Expected state after cleanup:

- `/connector-center-readonly` still exists.
- Legacy wording exists in page and sidebar label.
- v8 Integration / Local Apps / Provider surfaces remain hidden/direct routes.
- No v8 route was added to sidebar.
- Connector Center was not deleted.
- Route paths were not renamed.

## No-Action Safety Check

The cleanup does not add:

- Execution buttons.
- Launch buttons.
- Config-write buttons.
- Connector-action buttons.
- Gate controls.
- Stage C controls.
- External API calls.
- Local app API calls.
- Provider API calls.
- DB, memory DB, vector DB, or indexing writes.

Words such as execution, launch, write, release, restore, API, Gate, and Stage C appear only as readonly/safety/blocked documentation or page text.

## Verification Results

To be finalized by receipt after command execution:

- `git diff --check`
- route/source smoke
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm test --silent` only if API `8787` is already listening

## Recommended Next Step

Run a later browser screenshot pass for the legacy Connector Center page and Command Center bridge before considering any v8 sidebar promotion.
