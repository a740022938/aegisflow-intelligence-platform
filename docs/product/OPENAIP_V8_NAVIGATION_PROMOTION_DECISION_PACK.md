# OpenAIP v8 Navigation Promotion Decision Pack

Date: 2026-05-23

Final verdict: OPENAIP_V8_NAVIGATION_PROMOTION_DECISION_PACK_READY_WITH_GATE_CLOSED

## Scope

This is a decision-only package for future OpenAIP v8 sidebar/navigation promotion. It does not promote routes, rename routes, change sidebar behavior, delete Legacy Connector Center, modify Auth/Gate/DB/Stage C/runtime behavior, add execution controls, add launch controls, or add config-write controls.

Baseline:
- HEAD: 9a8d444
- Prior live browser visual smoke: PASS
- Prior screenshot evidence: `docs/product/screenshots/`
- Route/source smoke: PASS, 99/99 assertions
- Gate: CLOSED
- Stage C: disabled

## Product Principle

各路 AI 工具都是英雄，OpenAIP 是指挥中心。

OpenAIP v8 should not expose every hidden preview page at once. Sidebar promotion should expose only entry points that are visually mature, conceptually clear, and unlikely to imply runtime execution. The sidebar should guide users toward the control-plane model, not suggest that preview pages can launch tools, call providers, write config, or open Gate/Stage C.

## Decision Summary

| Route | Decision | Sidebar timing | Rationale |
| --- | --- | --- | --- |
| `/openaip-v8-command-center-preview` | `promote_candidate_now` | First candidate | Best hub page; live visual smoke passed; clearly shows nine centers, readonly status, Gate CLOSED, Stage C disabled. |
| `/openaip-v8-agent-center-preview` | `promote_candidate_after_copy_polish` | Second wave | User-facing concept is useful, but copy must avoid implying agent launch/lifecycle mutation. |
| `/openaip-v8-task-center-preview` | `promote_candidate_after_copy_polish` | Second wave | Useful workflow entry, but users may expect task dispatch/execution. Needs stronger readonly labeling before sidebar. |
| `/openaip-v8-provider-manager-preview` | `keep_hidden_direct` | Later, ecosystem review | Strong product direction, but high risk that users expect provider switching, model calls, API key entry, or config writes. |
| `/openaip-v8-integration-center-preview` | `promote_candidate_after_copy_polish` | Later, ecosystem review | Natural replacement path for legacy connector concepts, but must clearly state no connector actions/external calls. |
| `/openaip-v8-local-apps-center-preview` | `keep_hidden_direct` | Later, ecosystem review | Users may infer local app launch/control. Needs explicit no-launch copy and admin/operator positioning. |
| `/openaip-v8-memory-knowledge-center-preview` | `internal_reference_only` | Not normal sidebar yet | Useful architecture page, but memory/indexing wording has high write/action expectation risk. |
| `/openaip-v8-policy-capability-center-preview` | `keep_hidden_direct` | Governance/admin only | Important for reviewers, but permission/capability concepts are easy to confuse with enabled powers. |
| `/openaip-v8-audit-center-preview` | `promote_candidate_after_copy_polish` | Second wave | Good readonly evidence/receipt page; suitable for sidebar once audit copy is clear and no write controls remain absent. |
| `/openaip-v8-execution-gateway-preview` | `no_go_for_sidebar` | Hidden/admin direct only | Name implies execution. Should remain hidden/direct or admin-only until there is a hardened permission model and explicit human approval. |

## Recommended Promotion Order

1. First candidate: Command Center only.
2. Second wave: Agent Center, Task Center, Audit Center after copy polish and a fresh live visual smoke.
3. Ecosystem wave: Integration Center, Provider Manager, Local Apps Center after legacy connector coexistence copy is stable and users cannot confuse readonly matrices with actions.
4. Governance/admin references: Policy + Capability Center and Memory + Knowledge Center stay hidden/direct until there is a dedicated admin/reference navigation model.
5. Do not promote Execution Gateway to normal sidebar. Treat it as hidden/direct or admin-only.

## Sidebar Grouping Proposal

This is a proposal only. No source navigation changed in this task.

### OpenAIP v8

Proposed entries:
- Command Center
- Agent Center
- Task Center
- Audit Center

Why:
- These form the operator-facing control-plane loop: command, agents, tasks, receipts.
- They are easiest to explain as readonly planning and evidence views.

Safe:
- Command Center already shows Readonly Foundation, Gate CLOSED, Stage C disabled, and no runtime mutation.
- Audit Center is naturally readonly and evidence-oriented.

Confusing:
- Agent Center can imply agent launch or lifecycle mutation.
- Task Center can imply dispatch or execution.

Visibility:
- Command Center can be considered first.
- Agent/Task/Audit need copy review and a fresh approval checklist pass.

### Ecosystem

Proposed entries:
- Integration Center
- Provider Manager
- Local Apps Center
- Memory + Knowledge Center

Why:
- These describe external tools, model providers, local apps, and knowledge sources.
- They are the conceptual destination for legacy Connector Center migration.

Safe:
- Current pages are readonly and route smoke confirms no action labels in actionable contexts.

Confusing:
- Provider Manager may imply provider switching or API key/config entry.
- Local Apps Center may imply launching OpenAxiom, ComfyUI, Ollama, LM Studio, or other apps.
- Memory + Knowledge may imply memory writes or indexing.
- Integration Center may imply connector actions or external API calls.

Visibility:
- Integration Center can become a candidate after copy polish because it is the clearest successor to legacy connector concepts.
- Provider Manager and Local Apps Center should stay hidden/direct until action expectations are neutralized.
- Memory + Knowledge should remain internal/reference until memory/indexing boundaries are stronger for normal users.

### Governance

Proposed entries:
- Policy + Capability Center
- Execution Gateway

Why:
- These are governance and execution-boundary views.

Safe:
- Existing pages state Gate CLOSED, Stage C disabled, and no runtime mutation.

Confusing:
- Capability can be mistaken for permission.
- Execution Gateway can be mistaken for an execution surface.

Visibility:
- Policy + Capability Center should remain hidden/direct or admin-only.
- Execution Gateway is no-go for normal sidebar.

### Legacy

Proposed entry:
- Connector Center (旧)

Why:
- Keeps existing users oriented while v8 surfaces mature.
- The old entry is now explicitly marked legacy and links to v8 Integration, Local Apps, Provider, and Command Center routes.

Safe:
- It is a v7 readonly view with migration text.

Confusing:
- Users may still treat it as the main connector management surface.

Visibility:
- Keep visible for now.
- Hide later only after migration evidence shows users can reach the v8 ecosystem pages without confusion.

## Promotion Decision Rules

A page can enter sidebar only when:
- It has a live visual smoke PASS.
- It has route/source smoke PASS.
- Its title and first viewport clearly say readonly/preview.
- It contains no execution, launch, connector action, provider switching, config write, DB write, memory write, indexing, Gate-opening, or Stage C enablement control.
- Risky words appear only as blocked/safety copy.
- Old/new naming is clear.
- Screenshot evidence has been reviewed by a human owner.
- A rollback plan exists.
- The promotion itself is a separate approved source change.

## Decision

Do not change sidebar in this task. Treat the current hidden/direct v8 model as correct until a separate promotion task selects a narrow first slice, likely Command Center only.
