# OpenAIP v8 Legacy Connector Visual Smoke Report

Date: 2026-05-23

Final verdict: OPENAIP_V8_LEGACY_CONNECTOR_VISUAL_SMOKE_PASS_WITH_GATE_CLOSED

## Scope

This report records a verification-only smoke pass for the Legacy Connector Center wording cleanup and entry clarity. No feature work, runtime behavior change, route rename, connector logic change, sidebar exposure of hidden v8 pages, Gate change, Stage C change, deployment, release, tag, restore, DB write, indexing, or connector action was performed.

## Baseline

- Branch: main
- Baseline HEAD: e426e65
- Baseline commit: fix(ui): label legacy connector center readonly surface
- Working tree before report creation: clean
- Web UI/API listener check: no listener on 5173 or 8787
- Browser visual smoke: not run because the Web UI was not already running and the task prohibited forcing runtime/restart
- Screenshots: none

## Source-Level Visual And Entry Checks

PASS: `/connector-center-readonly` remains registered.

Evidence:
- `apps/web-ui/src/App.tsx` contains the `connector-center-readonly` route.
- `apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs` asserts the readonly route contract.

PASS: sidebar/menu label clearly marks the old entry.

Evidence:
- `apps/web-ui/src/i18n.ts` uses `连接器中心（旧）` for the Chinese nav label.
- `apps/web-ui/src/i18n.ts` uses `Legacy Connector Center` for the English nav label.
- `apps/web-ui/src/components/Layout.tsx` links the sidebar nav item to `/connector-center-readonly`.
- `apps/web-ui/src/registry/menu-registry.ts` records `连接器中心（旧）`.

PASS: the legacy page title and version label identify the surface as legacy and readonly.

Evidence:
- `apps/web-ui/src/pages/ConnectorCenterReadonly.tsx` uses `Legacy Connector Center`.
- `apps/web-ui/src/pages/ConnectorCenterReadonly.tsx` includes `Legacy v7 Readonly View`.
- `apps/web-ui/src/pages/ConnectorCenterReadonly.tsx` includes migration copy explaining that the old Connector Center is retained as a v7 readonly view while new v8 connector flows move to the dedicated v8 centers.

PASS: safe internal migration links are present.

Confirmed links:
- `/openaip-v8-integration-center-preview`
- `/openaip-v8-local-apps-center-preview`
- `/openaip-v8-provider-manager-preview`

PASS: hidden v8 pages were not exposed to the visible sidebar.

Evidence:
- Source search found no `openaip-v8-*-preview` route entries in `apps/web-ui/src/components/Layout.tsx`, `apps/web-ui/src/i18n.ts`, or `apps/web-ui/src/registry/menu-registry.ts`.

PASS: no execution, launch, dispatch, approval, Gate, Stage C, connector action, or config-write controls were added for this smoke task.

## Verification Results

- `git diff --check`: PASS
- `node --test apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs`: PASS, 99/99 assertions
- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run build`: PASS, with the existing Vite chunk-size warning only
- `npm test --silent`: not run because API port 8787 was not already listening and runtime was not forced

## Safety Grep Classification

Safety grep was run against the related source/test files and this report/receipt set. Hits were classified as:

- readonly safety text
- legacy wording
- safe internal links
- source-test assertions
- pre-existing safe implementation text
- report/receipt safety declarations

No risky hit was introduced by this task.

## Recommended Next Step

When a Web UI preview is already running, or when startup is explicitly authorized in a separate task, perform a live browser visual pass for `/connector-center-readonly` and the linked hidden v8 direct routes. Keep the v8 pages hidden/direct unless there is separate human authorization to promote any route into sidebar navigation.
