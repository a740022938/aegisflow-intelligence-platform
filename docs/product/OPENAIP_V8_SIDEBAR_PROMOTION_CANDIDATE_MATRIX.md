# OpenAIP v8 Sidebar Promotion Candidate Matrix

Date: 2026-05-23

This matrix classifies all 10 OpenAIP v8 hidden/direct routes for future sidebar promotion. It is not an implementation plan and does not change navigation.

## Classification Legend

- `promote_candidate_now`: Mature enough to consider in the next explicit sidebar-promotion task.
- `promote_candidate_after_copy_polish`: Plausible sidebar candidate, but needs clearer first-viewport wording and another visual smoke.
- `keep_hidden_direct`: Keep reachable by direct/internal links; not ready for normal sidebar.
- `internal_reference_only`: Useful for internal architecture/reviewer workflows, not normal user navigation.
- `no_go_for_sidebar`: Should not appear in normal sidebar without a major safety model change.

## Matrix

| Route | Classification | Visual maturity | Safety maturity | User clarity | Collision risk | Normal users should see it? | Human approval before sidebar? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/openaip-v8-command-center-preview` | `promote_candidate_now` | High. Live smoke screenshot shows a coherent hub, nine centers, status strip, and readable cards. | High. Gate CLOSED, Stage C disabled, no runtime mutation visible. | High. It explains the control-plane model. | Low. It is a hub, not an action page. | Yes, as first v8 entry candidate. | Yes. |
| `/openaip-v8-agent-center-preview` | `promote_candidate_after_copy_polish` | Medium-high. Route smoke verifies page and registry-backed data. | High. No launch/lifecycle mutation per route smoke. | Medium. Agents may imply operational control. | Medium-high with Assistant Center and agent execution expectations. | Later, for operators. | Yes. |
| `/openaip-v8-task-center-preview` | `promote_candidate_after_copy_polish` | Medium-high. Route smoke verifies task sections and links. | High. No task execution/dispatch in actionable contexts. | Medium. Task Pack/Receipt concepts need first-viewport explanation. | High because "task" implies dispatch/execution. | Later, for operators/reviewers. | Yes. |
| `/openaip-v8-provider-manager-preview` | `keep_hidden_direct` | High for preview. Live smoke screenshot and route smoke passed. | Medium-high. Safety copy says no provider switching, no model calls, no API key output. | Medium. Provider Manager sounds configurable/actionable. | High with model provider switching, API keys, CC Switch-like config expectations. | Not yet. | Yes, plus security review. |
| `/openaip-v8-integration-center-preview` | `promote_candidate_after_copy_polish` | High for preview. Live smoke screenshot and route smoke passed. | High. No connector actions/external calls in tests and live scan. | Medium-high. Best v8 successor for legacy connector migration. | Medium with legacy Connector Center and connector action expectations. | Later, after copy polish. | Yes. |
| `/openaip-v8-local-apps-center-preview` | `keep_hidden_direct` | High for preview. Live smoke screenshot and route smoke passed. | Medium-high. No local app launch/local API calls, but wording contains app names. | Medium. Users may expect launch/control. | High with OpenAxiom, ComfyUI, Ollama, LM Studio launch expectations. | Not yet. | Yes, plus runtime safety review. |
| `/openaip-v8-memory-knowledge-center-preview` | `internal_reference_only` | Medium. Route smoke passed; no live screenshot in the last smoke set. | Medium-high. No memory write/indexing/external knowledge call per route smoke. | Medium-low for normal users. Memory/indexing terminology is specialized. | High with Memory Hub and indexing expectations. | No, internal/reference only for now. | Yes. |
| `/openaip-v8-policy-capability-center-preview` | `keep_hidden_direct` | Medium-high. Route smoke passed. | High. Capability != permission and no mutation are tested. | Medium. Policy/capability language can be misread. | High with permission enablement expectations. | Admin/reviewer only later. | Yes. |
| `/openaip-v8-audit-center-preview` | `promote_candidate_after_copy_polish` | Medium-high. Route smoke passed. | High. Audit/evidence surfaces are naturally readonly. | High after copy polish. | Medium with audit DB write expectations. | Later, likely second wave. | Yes. |
| `/openaip-v8-execution-gateway-preview` | `no_go_for_sidebar` | Medium-high. Route smoke passed. | High as hidden/direct safety page. | Low for normal users because "Execution" implies action. | Very high with Gate opening, Stage C enablement, execution, release, restore, DB write. | No. Hidden/direct or admin-only. | Yes, major safety approval required. |

## Recommended Sidebar Candidate Sets

### First Candidate

- `/openaip-v8-command-center-preview`

Reason:
- It is the safest single entry because it is an index/hub and does not imply a specific execution path.

### Second-Wave Candidates

- `/openaip-v8-agent-center-preview`
- `/openaip-v8-task-center-preview`
- `/openaip-v8-audit-center-preview`

Reason:
- They align with operator mental models but must keep readonly boundaries unambiguous.

### Ecosystem Candidates After Copy Polish

- `/openaip-v8-integration-center-preview`

Reason:
- It is the clearest bridge from Legacy Connector Center to v8 concepts.

### Keep Hidden/Direct For Now

- `/openaip-v8-provider-manager-preview`
- `/openaip-v8-local-apps-center-preview`
- `/openaip-v8-memory-knowledge-center-preview`
- `/openaip-v8-policy-capability-center-preview`

Reason:
- These have stronger action/config/write expectations and need admin/reference positioning.

### No-Go For Normal Sidebar

- `/openaip-v8-execution-gateway-preview`

Reason:
- Execution Gateway should never appear as a normal user navigation item while Gate is closed and Stage C is disabled. If exposed later, it should be admin-only with a dedicated approval, safety, and rollback package.
