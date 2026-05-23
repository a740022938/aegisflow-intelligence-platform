# OpenAIP v8 Wave 2 All Centers Sidebar Promotion Report

## Verdict

OPENAIP_V8_WAVE2_ALL_CENTERS_SIDEBAR_PROMOTION_READY_WITH_GATE_CLOSED

## Baseline

- Baseline HEAD: `c31e4a5`
- Branch: `main`
- Wave 1 Command Center sidebar entry was present before this task.
- Working tree before edits: clean.

## Scope Completed

Promoted the remaining nine readonly OpenAIP v8 center routes to the sidebar while keeping the Wave 1 Command Center entry and the legacy Connector Center entry visible.

Promoted routes:

- `/openaip-v8-agent-center-preview`
- `/openaip-v8-task-center-preview`
- `/openaip-v8-provider-manager-preview`
- `/openaip-v8-integration-center-preview`
- `/openaip-v8-local-apps-center-preview`
- `/openaip-v8-memory-knowledge-center-preview`
- `/openaip-v8-policy-capability-center-preview`
- `/openaip-v8-audit-center-preview`
- `/openaip-v8-execution-gateway-preview`

Kept visible:

- `/openaip-v8-command-center-preview`
- `/connector-center-readonly`

## Files Changed

- `apps/web-ui/src/components/Layout.tsx`
- `apps/web-ui/src/i18n.ts`
- `apps/web-ui/src/registry/layout-menu-snapshot.ts`
- `apps/web-ui/src/registry/menu-registry.ts`
- `apps/web-ui/src/pages/OpenAIPv8CommandCenterPreview.tsx`
- `apps/aip-cli/src/commands/v8.ts`
- `apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs`
- `apps/aip-cli/tests/project-root-and-stubs.test.mjs`
- `docs/product/screenshots/openAip-v8-wave2-sidebar-promotion/*.png`
- `docs/product/OPENAIP_V8_WAVE2_ALL_CENTERS_SIDEBAR_PROMOTION_REPORT.md`
- `docs/product/OPENAIP_V8_WAVE2_ALL_CENTERS_SIDEBAR_PROMOTION_RECEIPT.md`

## Navigation Result

- New sidebar group label:
  - Chinese: `OpenAIP v8 指挥中心`
  - English: `OpenAIP v8 Control Plane`
- Sidebar order:
  1. Command Center
  2. Agent Center
  3. Task Center
  4. Audit Center
  5. Policy + Capability Center
  6. Execution Gateway
  7. Provider Manager
  8. Integration Center
  9. Local Apps Center
  10. Memory + Knowledge Center

## Legacy Connector Coexistence

PASS.

- Legacy Connector Center remains visible as `连接器中心（旧）` / `Legacy Connector Center`.
- Legacy page retains `Legacy Connector Center` and `v7 readonly view` wording.
- Migration links still point to v8 Integration Center, Local Apps Center, and Provider Manager.
- No legacy Connector Center route was deleted or renamed.

## Safety Result

PASS.

- No execution enablement.
- No launch controls.
- No provider switching controls.
- No connector action controls.
- No config write controls.
- Gate remains CLOSED.
- Stage C remains disabled.
- Auth/Gate implementation unchanged.
- No DB, memory DB, vector DB, or indexing job was touched.

## Visual Smoke

PASS with Chrome via Playwright.

- Standard `aip start` was used because ports `5173` and `8787` were not already listening.
- Browser plugin path was unavailable because the current session did not expose `node_repl js`; repo Playwright was used with installed Chrome.
- Playwright bundled Chromium was not downloaded.
- All 10 v8 routes opened successfully.
- Sidebar showed all 10 v8 center entries.
- Legacy Connector Center remained visible.
- No blank page or framework overlay was observed.
- Risk action button labels were absent.
- Console showed repeated existing `/api/ui/i18n` 401 fallback warnings; the app rendered with the local dictionary fallback.

Screenshots:

- `docs/product/screenshots/openAip-v8-wave2-sidebar-promotion/sidebar-full-v8-group.png`
- `docs/product/screenshots/openAip-v8-wave2-sidebar-promotion/command-center.png`
- `docs/product/screenshots/openAip-v8-wave2-sidebar-promotion/execution-gateway.png`
- `docs/product/screenshots/openAip-v8-wave2-sidebar-promotion/provider-manager.png`
- `docs/product/screenshots/openAip-v8-wave2-sidebar-promotion/integration-center.png`
- `docs/product/screenshots/openAip-v8-wave2-sidebar-promotion/local-apps-center.png`

## Verification

PASS:

- `git diff --check`
- `node --test apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs` - 100/100
- `node --test apps/aip-cli/tests/project-root-and-stubs.test.mjs` - 15/15
- `node scripts/validate-v8-registry-examples.mjs`
- `node scripts/validate-v8-foundation-index.mjs`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm test --silent` - 9/9 smoke tests

Build note:

- Vite reported existing chunk-size warnings only; build completed successfully.

## Rollback Plan

Rollback is source-only and does not require DB/runtime/Auth/Gate changes.

To rollback Wave 2 only:

1. Remove the nine newly added v8 `NavItem` entries from `apps/web-ui/src/components/Layout.tsx`.
2. Keep `/openaip-v8-command-center-preview` in the OpenAIP v8 sidebar group unless the owner requests full Wave 1 rollback.
3. Remove the nine corresponding entries from `apps/web-ui/src/registry/layout-menu-snapshot.ts`.
4. Remove the nine corresponding items from `apps/web-ui/src/registry/menu-registry.ts`.
5. Remove the nine new i18n label keys from `apps/web-ui/src/i18n.ts`.
6. Restore CLI/status wording from visible-sidebar wording to direct-route wording only if the owner wants route exposure reverted.
7. Keep all route definitions in `apps/web-ui/src/App.tsx` intact.
8. Re-run route smoke, project-root tests, typecheck, lint, build, and visual smoke.

No DB rollback, memory rollback, vector DB rollback, indexing rollback, Gate rollback, Stage C rollback, Auth rollback, or service restart is needed.

