# OpenAIP v8 Visual Acceptance Checklist

Manual UI review should use direct hidden routes. Do not expose v8 pages to the sidebar during this checklist.

For every route below, verify:

- [ ] Route opens.
- [ ] Title is visible.
- [ ] Purpose is clear.
- [ ] Gate CLOSED is visible.
- [ ] Stage C disabled is visible.
- [ ] Readonly is visible.
- [ ] No runtime mutation is visible.
- [ ] No execution, launch, or config write buttons are visible.
- [ ] Back to Command Center link exists.
- [ ] Page looks coherent.
- [ ] Old/new concept conflicts are absent or clearly labeled.

## Route Checklist

| Route | Center | Visual status |
|---|---|---|
| `/openaip-v8-command-center-preview` | Command Center | [ ] Reviewed |
| `/openaip-v8-agent-center-preview` | Agent Center | [ ] Reviewed |
| `/openaip-v8-task-center-preview` | Task Center | [ ] Reviewed |
| `/openaip-v8-provider-manager-preview` | Provider Manager | [ ] Reviewed |
| `/openaip-v8-integration-center-preview` | Integration Center | [ ] Reviewed |
| `/openaip-v8-local-apps-center-preview` | Local Apps Center | [ ] Reviewed |
| `/openaip-v8-memory-knowledge-center-preview` | Memory + Knowledge Center | [ ] Reviewed |
| `/openaip-v8-policy-capability-center-preview` | Policy + Capability Center | [ ] Reviewed |
| `/openaip-v8-audit-center-preview` | Audit Center | [ ] Reviewed |
| `/openaip-v8-execution-gateway-preview` | Execution Gateway | [ ] Reviewed |

## Legacy Connector Center Review

- [ ] `/connector-center-readonly` opens.
- [ ] Legacy "连接器中心" wording does not imply it is the v8 primary Integration Center.
- [ ] Legacy Connector Center does not expose v8 pages in sidebar.
- [ ] Legacy page should later be renamed or marked legacy if it remains visible to operators.

Recommended legacy decision: keep `/connector-center-readonly` as a legacy bridge for now, then create a separate Visual Acceptance + Legacy Entry Cleanup Plan to decide label, redirect, and sidebar strategy.
