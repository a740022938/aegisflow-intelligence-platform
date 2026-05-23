# OpenAIP v8 Navigation Promotion Decision Receipt

Final verdict: OPENAIP_V8_NAVIGATION_PROMOTION_DECISION_PACK_READY_WITH_GATE_CLOSED

## Receipt

- Baseline HEAD: 9a8d444
- Commit hash: recorded in final response after commit
- Pushed: recorded in final response after push
- Working tree clean before report creation: yes
- Docs created: yes
- Source changed: no
- UI changed: no
- CLI changed: no
- Sidebar changed: no
- Route paths changed: no
- Legacy Connector Center deleted: no
- Runtime changed: no
- Services restarted: no
- taskkill/Stop-Process used: no
- DB written: no
- Gate opened: no
- Stage C enabled: no
- Release/tag created: no
- Auth/Gate changed: no
- Connector action executed: no
- External/local/provider calls made: no

## Docs Created

- `docs/product/OPENAIP_V8_NAVIGATION_PROMOTION_DECISION_PACK.md`
- `docs/product/OPENAIP_V8_SIDEBAR_PROMOTION_CANDIDATE_MATRIX.md`
- `docs/product/OPENAIP_V8_LEGACY_CONNECTOR_COEXISTENCE_POLICY.md`
- `docs/product/OPENAIP_V8_NAVIGATION_PROMOTION_APPROVAL_CHECKLIST.md`
- `docs/product/OPENAIP_V8_NAVIGATION_PROMOTION_DECISION_RECEIPT.md`

## Decision Summary

- First promotion candidate: Command Center only.
- Second-wave candidates after copy polish: Agent Center, Task Center, Audit Center.
- Ecosystem candidates require careful copy and later review: Integration Center first, then Provider Manager and Local Apps Center.
- Internal/reference only for now: Memory + Knowledge Center.
- Governance/admin hidden/direct: Policy + Capability Center.
- No-go for normal sidebar: Execution Gateway.
- Legacy Connector Center remains visible as `连接器中心（旧）` / `Legacy Connector Center`.

## Verification To Record

- `git diff --check`: PASS.
- `node --test apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs`: PASS, 99/99 assertions.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS, with the existing Vite chunk-size warning only.
- `npm test --silent`: PASS, 9/9 smoke tests because API 8787 was already available.
- Safety grep on new docs: PASS, docs-only safety/sidebar decision text; no risky implementation.

## Human Authorization Needed

Human authorization is required before any sidebar promotion, route rename, runtime restart/stop, taskkill/Stop-Process, Gate change, Stage C change, connector execution, provider/local app/API call, DB write, deletion of old Connector Center, release/tag, restore, or deploy.

## Recommended Next Step

Create a separate, narrow implementation task only if a human owner decides to promote Command Center as the first visible OpenAIP v8 sidebar entry. That future task must include screenshot review, source diff review, and rollback instructions.
