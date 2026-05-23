# OpenAIP v8 Legacy Entry Cleanup Plan

## Baseline

- Baseline HEAD: `d75003c`
- Scope: plan only
- Source changed: no
- UI changed: no
- Sidebar changed: no
- Runtime changed: no

## Legacy Entry Inventory

| Entry | Current State | Conflict Level | Classification | Rationale |
|---|---|---:|---|---|
| Connector Center / 连接器中心 | Visible sidebar entry at `/connector-center-readonly` | High | Mark as legacy later | It overlaps with v8 Integration Center and still reads like the main connector destination |
| ConnectorCenter legacy route | Source route still exists | High | Migrate into v8 center | Keep route as compatibility bridge until approved migration |
| PluginPool | Existing older operational/plugin surface | Medium | Keep as-is for now | Not enough v8 mapping certainty; do not rename or hide without separate human review |
| ModuleCenter | Existing older module surface | Medium | Keep as-is for now | It may map partly to Local Apps / Capability Center, but direct migration needs separate inventory |
| Old connector / integration naming in registries | Static registries and docs reference Connector Center | Medium | Rename later | Copy cleanup should follow approved IA migration |
| Old preview labels | Many v8 pages include Preview suffix | Low | Rename later | Correct for hidden/direct acceptance; should be cleaned before normal-user sidebar exposure |
| Sidebar labels | Connector Center visible, v8 centers hidden | High | No-go without approval | Changing visible navigation affects user workflows |

## Connector Center Decision

Connector Center should remain visible for now.

Reason:

- Users may already rely on the visible `/connector-center-readonly` sidebar entry.
- The v8 successor surfaces are still hidden/direct.
- Hiding or renaming the entry now would change visible navigation without human approval.

Recommended later change:

- Rename visible Chinese label from `连接器中心` to `连接器中心（旧）`.
- Rename visible English label from `Connector Center` to `Legacy Connector Center`.
- Keep the route as a bridge page during the transition.
- Add clear user-facing links to:
  - v8 Integration Center
  - v8 Local Apps Center
  - v8 Provider Manager
  - v8 Command Center

## Connector Entity Migration Strategy

| Legacy Entity | v8 Owner | Secondary Owner | Migration Status | Notes |
|---|---|---|---|---|
| OpenClaw | Agent Center + Integration Center | Execution Gateway boundary | Plan only | Treat OpenClaw as agent/tool integration plus gated execution boundary; no browser/tool action before separate approval |
| OpenAxiom | Local Apps Center | Integration Center reference | Candidate migration | Local UI/vision app; should not be represented as a generic external connector |
| ComfyUI | Local Apps Center | Workflow Engine reference | Candidate migration | Local workflow engine; do not expose launch/run controls in readonly v8 |
| Ollama | Local Apps Center + Provider Manager | None | Candidate migration | Local model host plus provider profile concept |
| LM Studio | Local Apps Center + Provider Manager | None | Candidate migration | Local model host plus provider profile concept |
| CC Switch | Provider Manager | Config switcher reference | Candidate migration | Provider/profile switch concept; not an execution engine |
| Claude Proxy | Provider Manager | Integration Center | Candidate migration | Provider routing and integration boundary both apply |
| Memory Hub | Memory + Knowledge Center | Integration Center | Candidate migration | Memory source and integration bridge; no memory writes/indexing |
| GitHub | Integration Center | Audit Center reference | Candidate migration | External service binding; action execution requires separate authorization |
| Hugging Face | Integration Center | Provider Manager if model provider | Candidate migration | External service/model platform; no external API call in v8 preview |
| Webhooks | Integration Center | Audit Center reference | Candidate migration | External IO boundary; no send/sync/dispatch in preview |

## What Should Not Migrate Yet

- Any connector action that writes, launches, syncs, dispatches, executes, scans, or calls external/local/provider APIs.
- Any token/API key input or secret display path.
- Any Gate opening or Stage C enablement.
- Any sidebar promotion before visual acceptance and human approval.
- Any Auth/Gate implementation change.
- Any DB, memory DB, vector DB, indexing, restore, release, or tag workflow.

## Visible Sidebar Strategy

Current strategy:

- Keep Connector Center visible as the legacy bridge.
- Keep all v8 routes hidden/direct.
- Do not add v8 pages to sidebar in this task.

Future strategy after approval:

1. Mark current Connector Center as legacy.
2. Make v8 Command Center the conceptual home, but not necessarily the first sidebar entry.
3. Promote v8 Integration Center only after Connector Center legacy wording is accepted.
4. Promote Provider Manager and Local Apps Center only after their boundary copy is approved.
5. Keep Execution Gateway hidden/direct or internal-only until Gate authorization policy is approved.

## Candidate Renames

| Current | Candidate Later Label | Approval Required |
|---|---|---|
| `连接器中心` | `连接器中心（旧）` | Yes |
| `Connector Center` | `Legacy Connector Center` | Yes |
| `Policy Router + Capability Center` | `Policy + Capability Center` | Yes |
| `OpenAIP v8 ... Preview` | `OpenAIP v8 ...` | Yes, only after pages are promoted |

## No-Go Actions

- Do not remove the Connector Center sidebar entry without human approval.
- Do not expose v8 pages in sidebar as part of this cleanup plan.
- Do not add connector controls, launch buttons, write buttons, or config forms.
- Do not run connector actions.
- Do not call external APIs, local app APIs, or provider APIs.
- Do not open Gate or enable Stage C.

## Human Decisions Required

1. Approve whether visible `连接器中心` may be labeled `连接器中心（旧）`.
2. Approve whether v8 Integration Center becomes the canonical connector destination.
3. Approve whether v8 Command Center should ever appear in sidebar or stay as direct/internal command-plane entry.
4. Approve Provider Manager wording for CC Switch / Claude Proxy / model host relationships.
5. Approve Local Apps Center wording for OpenAxiom / ComfyUI / Ollama / LM Studio.
6. Approve the first sidebar promotion candidate, if any.

## Recommended First Cleanup Task

Create a small wording-only UI task after approval:

- Rename visible Connector Center label to legacy wording.
- Add a short legacy banner if not already visible enough.
- Keep all v8 routes hidden/direct.
- Add source-level tests that verify v8 routes remain absent from sidebar.
- Do not add runtime controls or API calls.
