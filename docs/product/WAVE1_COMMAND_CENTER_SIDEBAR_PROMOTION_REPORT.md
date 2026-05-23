# Wave 1 Command Center Sidebar Promotion Report

Date: 2026-05-24
Repo: E:\AIP
Scope: Promote only `/openaip-v8-command-center-preview` into the sidebar.

## Final Verdict

PASS.

The Wave 1 sidebar promotion is complete. The sidebar exposes exactly one OpenAIP v8 route: `/openaip-v8-command-center-preview`.

## Route Visibility

Promoted route:
- `/openaip-v8-command-center-preview`

Routes kept hidden/direct:
- `/openaip-v8-agent-center-preview`
- `/openaip-v8-task-center-preview`
- `/openaip-v8-provider-manager-preview`
- `/openaip-v8-integration-center-preview`
- `/openaip-v8-local-apps-center-preview`
- `/openaip-v8-memory-knowledge-center-preview`
- `/openaip-v8-policy-capability-center-preview`
- `/openaip-v8-audit-center-preview`
- `/openaip-v8-execution-gateway-preview`

Legacy route still visible:
- `/connector-center-readonly`

## Safety Boundaries

No runtime controls were added. The changed v8 pages and tests preserve these boundaries:
- No execute button.
- No launch button.
- No restart button.
- No restore button.
- No release button.
- No config write button.
- No connector action execution.
- No Gate opening.
- No Stage C enablement.
- No Auth/Gate/DB/runtime/release/restore implementation changes.

## Verification

Passed:
- `git diff --check`
- `node --test apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs`
- `node --test apps/aip-cli/tests/project-root-and-stubs.test.mjs`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

Skipped:
- `npm test --silent`: skipped because `http://127.0.0.1:8787/health` refused the connection. No service was started or restarted for this task.

Build note:
- Vite emitted the existing chunk-size warning. Build completed successfully.

## Side Effects

Runtime changed: no.
Services restarted: no.
Taskkill/Stop-Process used: no.
DB written: no.
Gate opened: no.
Stage C enabled: no.
Auth/Gate changed: no.
Connector action executed: no.

