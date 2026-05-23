# OpenAIP v8 Legacy Connector Coexistence Policy

Date: 2026-05-23

## Decision

Keep Legacy Connector Center visible for now as `连接器中心（旧）` / `Legacy Connector Center`.

Do not delete it, hide it, rename its route, or move v8 hidden pages into sidebar in this decision task.

## Current State

- Visible legacy route: `/connector-center-readonly`
- Sidebar label: `连接器中心（旧）`
- English label: `Legacy Connector Center`
- Page wording: `Legacy v7 Readonly View`
- Migration links:
  - `/openaip-v8-integration-center-preview`
  - `/openaip-v8-local-apps-center-preview`
  - `/openaip-v8-provider-manager-preview`
  - `/openaip-v8-command-center-preview`

## Coexistence Model

Legacy Connector Center should act as a safe compatibility and migration bridge:

- It remains visible because existing users know where it is.
- It is marked old/legacy so users do not mistake it for the v8 control plane.
- It points users toward v8 Integration Center, Local Apps Center, Provider Manager, and Command Center.
- It stays readonly and must not gain execution, launch, connector action, provider call, local app call, config write, DB write, memory write, indexing, Gate-opening, or Stage C enablement controls.

## Relationship To v8 Pages

| Area | Legacy role | v8 destination | Coexistence rule |
| --- | --- | --- | --- |
| External services/connectors | Old readonly inventory and compatibility view | Integration Center | Link from legacy to Integration Center; do not imply connector actions are available. |
| Local tools/apps | Old connector-like references | Local Apps Center | Link for positioning only; do not imply launch or local API calls. |
| Model/provider configuration | Old provider-like connector references | Provider Manager | Link for readonly provider profile review; do not expose API key or provider switching flows. |
| Overall control plane | Old center does not explain v8 architecture | Command Center | Link as the v8 map/hub. |

## Should Legacy Connector Center Stay Under Existing Sidebar Group?

Yes, for now.

Reason:
- It avoids a disruptive navigation move.
- The label already marks it as old.
- The v8 replacement surfaces are still hidden/direct and should not be promoted by implication.

Future option:
- Move it into a dedicated Legacy group only when the sidebar is reorganized under a separate approved navigation task.

## Should It Link Users To v8 Integration Center?

Yes.

The primary migration link should be Integration Center because that is the closest conceptual replacement for connector inventory and external service binding.

Secondary links can point to:
- Local Apps Center for local runtime/tool positioning.
- Provider Manager for provider/model routing concepts.
- Command Center for the full v8 map.

## Should It Be Hidden Later?

Not yet.

It can be hidden later only when all of the following are true:
- Command Center has been promoted and validated in sidebar.
- Integration Center has passed copy polish and live visual smoke.
- Users have an obvious v8 path for external services/connectors.
- No active docs or workflows rely on `/connector-center-readonly` as the primary entry.
- A rollback plan exists to restore the visible legacy entry.
- A human owner approves the change.

## Evidence Required Before Hiding Legacy Connector Center

- Fresh live browser visual smoke PASS for Command Center and Integration Center.
- Route/source smoke PASS.
- Screenshot evidence for the future sidebar layout.
- No v8 hidden route exposure beyond the approved set.
- No execution, launch, provider switching, connector action, config write, DB write, memory write, indexing, Gate-opening, or Stage C enablement controls.
- User-facing copy reviewed in Chinese and English.
- Human owner approval and rollback plan.

## User-Facing Copy Recommendation

Recommended sidebar label:
- Chinese: `连接器中心（旧）`
- English: `Legacy Connector Center`

Recommended page wording:
- `Legacy v7 Readonly View`
- `This legacy Connector Center is a v7 readonly view. OpenAIP v8 consolidates external tools under Integration Center, Local Apps Center, and Provider Manager.`
- `Use this page only as a safe compatibility overview. It does not execute connector actions, call APIs, or write configuration.`

## Non-Goals

- Do not delete old Connector Center.
- Do not rename `/connector-center-readonly`.
- Do not migrate connector logic in this policy.
- Do not promote v8 hidden pages to sidebar from this policy.
- Do not add buttons for execution, launch, config write, connector action, provider calls, local app calls, Gate opening, or Stage C enablement.
