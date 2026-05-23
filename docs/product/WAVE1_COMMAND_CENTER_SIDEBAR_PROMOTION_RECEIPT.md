# Wave 1 Command Center Sidebar Promotion Receipt

Date: 2026-05-24
Verdict: PASS

## Receipt

Sidebar changed: yes.

Routes promoted:
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

Legacy Connector Center visible: yes, `/connector-center-readonly`.

## Verification Summary

PASS:
- `git diff --check`
- `node --test apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs`
- `node --test apps/aip-cli/tests/project-root-and-stubs.test.mjs`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

SKIPPED:
- `npm test --silent`, because API 8787 was unavailable and no service start/restart was authorized or performed.

## Safety Summary

Runtime changed: no.
Services restarted: no.
Taskkill/Stop-Process used: no.
DB written: no.
Gate opened: no.
Stage C enabled: no.
Auth/Gate changed: no.
Connector action executed: no.

