# OpenAIP v8 Visual Acceptance Report

## Baseline

- Baseline HEAD: `d75003c`
- Branch: `main`
- Origin sync observed: `origin/main` at `d75003c`
- Scope: product-facing visual acceptance by source-level route/UI evidence
- Screenshot evidence: not captured; no browser automation or dev-server startup was forced for this planning-only task
- Runtime posture: no runtime mutation, no service restart, no connector action, no external/local/provider API calls

## Review Method

Evidence was taken from:

- `apps/web-ui/src/App.tsx`
- `apps/web-ui/src/pages/OpenAIPv8CommandCenterPreview.tsx`
- `apps/web-ui/src/pages/OpenAIPv8ReadonlyCenterPreview.tsx`
- `apps/web-ui/src/pages/OpenAIPv8AgentCenterPreview.tsx`
- `apps/web-ui/src/pages/OpenAIPv8TaskCenterPreview.tsx`
- `apps/web-ui/src/pages/OpenAIPv8ProviderManagerPreview.tsx`
- `apps/web-ui/src/pages/OpenAIPv8IntegrationCenterPreview.tsx`
- `apps/web-ui/src/pages/OpenAIPv8LocalAppsCenterPreview.tsx`
- `apps/web-ui/src/pages/OpenAIPv8MemoryKnowledgeCenterPreview.tsx`
- `apps/web-ui/src/pages/OpenAIPv8PolicyCapabilityCenterPreview.tsx`
- `apps/web-ui/src/pages/OpenAIPv8AuditCenterPreview.tsx`
- `apps/web-ui/src/pages/OpenAIPv8ExecutionGatewayPreview.tsx`
- `apps/web-ui/src/pages/ConnectorCenterReadonly.tsx`
- `apps/web-ui/src/registry/menu-registry.ts`
- `apps/web-ui/src/registry/navigation-exposure-registry.ts`
- `apps/aip-cli/tests/v8-center-readonly-route-smoke.test.mjs`

## Route Inventory

| Route | Exists | Page Title Clear | Purpose Clear | Readonly Visible | Gate Closed / Stage C Visible | No Runtime Mutation Visible | No Execution / Launch / Config Write Buttons | Command Center Linkage | Visual Grade | Terminology Conflict | Recommended Polish |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|---|
| `/openaip-v8-command-center-preview` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Links to 9 centers | Pass with polish | Low | Keep hidden; later tighten name from preview to product name only after approval |
| `/openaip-v8-agent-center-preview` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Back link exists | Pass with polish | Low | Keep "Agent Center" stable; avoid implying launch/lifecycle mutation |
| `/openaip-v8-task-center-preview` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Back link exists | Pass with polish | Low | Keep task-pack language explicitly draft/receipt-oriented |
| `/openaip-v8-provider-manager-preview` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Back link exists | Pass with polish | Medium | Clarify relationship to old Model Gateway / CC Switch before sidebar promotion |
| `/openaip-v8-integration-center-preview` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Back link exists | Pass with polish | Medium | Make it the canonical successor to legacy Connector Center after human approval |
| `/openaip-v8-local-apps-center-preview` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Back link exists | Pass with polish | Medium | Clarify Local Apps vs external integrations for OpenAxiom, ComfyUI, Ollama, LM Studio |
| `/openaip-v8-memory-knowledge-center-preview` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Back link exists | Pass with polish | Low | Keep memory write/indexing blocked language prominent |
| `/openaip-v8-policy-capability-center-preview` | Yes | Mostly | Yes | Yes | Yes | Yes | Yes | Back link exists | Pass with polish | Medium | Standardize name to "Policy + Capability Center" in user-facing docs |
| `/openaip-v8-audit-center-preview` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Back link exists | Pass with polish | Low | Keep audit as evidence/receipt viewer, not a save/write surface |
| `/openaip-v8-execution-gateway-preview` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Back link exists | Pass with polish | Medium | Keep no-go for sidebar until Gate approval model is separately accepted |
| `/connector-center-readonly` | Yes | Yes | Yes | Yes | Stage C disabled visible; Gate copy less central | Yes | Yes | Links to v8 Command and Integration Center | Needs cleanup | High | Later mark visible label as legacy and steer users to v8 centers |

## Command Center Navigation Review

The Command Center route contains direct card links to all 9 center pages:

- Agent Center
- Task Center
- Provider Manager
- Integration Center
- Local Apps Center
- Memory + Knowledge Center
- Policy Router + Capability Center
- Audit Center
- Execution Gateway

Source-level result:

- Navigation is clear enough for hidden/direct preview users.
- Each center has either direct related-center links or a back link to Command Center.
- The experience is coherent as a control-plane map.
- The surface should remain hidden/direct because the naming and legacy-entry relationship are not yet approved for normal users.

## Visual Quality Findings

Strengths:

- v8 pages share a consistent dark control-plane shell.
- Badges make Readonly Preview, Gate CLOSED, Stage C disabled, no runtime mutation, no config writes, and no execution visible.
- Registry counts and static tables make pages feel product-like rather than placeholders.
- Command Center communicates the product principle clearly.

Polish risks:

- Many pages still include `Preview` in titles; acceptable for hidden/direct acceptance, but not for sidebar exposure.
- Some center names vary: `Policy Router + Capability Center` vs `Policy + Capability Center` vs `Policy Capability Center`.
- `Connector Center` remains visible in sidebar while v8 Integration Center is hidden, creating old/new concept overlap.
- Provider Manager, Local Apps Center, and Integration Center have overlapping responsibilities for local model hosts and tool bridges; this needs approved copy before visible navigation changes.
- Visual density is acceptable for technical preview users, but normal-user sidebar exposure should wait for copy simplification and a browser screenshot pass.

## No-Action UI Check

Source-level review found the v8 preview surfaces are presented as readonly/static/registry-backed pages. The shared v8 readonly shell displays:

- Readonly Preview
- No runtime mutation
- Gate CLOSED
- Stage C disabled
- Registry-backed
- No config writes
- No execution

The reviewed v8 pages do not expose execution, launch, provider-call, connector-action, DB-write, memory-write, indexing, or config-write buttons.

## Sidebar Exposure Check

Current source-level result:

- v8 routes are registered in `App.tsx` as direct routes.
- v8 routes are not visible sidebar entries in the current menu/side navigation.
- `/connector-center-readonly` is visible in sidebar as `连接器中心` / `Connector Center`.

Recommendation:

- Keep every v8 page hidden/direct for now.
- Do not expose any v8 page to sidebar until visual acceptance and legacy-entry cleanup are approved.
- Treat Connector Center sidebar visibility as a legacy bridge, not the final information architecture.

## Old / New Terminology Conflicts

| Term | Conflict | Recommendation |
|---|---|---|
| Connector Center / 连接器中心 | Visible old entry overlaps with v8 Integration Center | Later rename visible label to `连接器中心（旧）` / `Legacy Connector Center` after approval |
| Provider Manager vs Model Gateway / CC Switch | Similar provider-routing meaning across old and new surfaces | Make Provider Manager the v8 canonical owner of provider profiles and config-switcher references |
| Local Apps Center vs Integration Center | Local tools can look like integrations | Local runtime/app inventory belongs to Local Apps Center; external service binding belongs to Integration Center |
| Policy Router + Capability Center | Name varies across surfaces | Standardize as `Policy + Capability Center` unless a separate router concept is approved |
| Execution Gateway | Could be mistaken as active execution | Keep Gate CLOSED / Stage C disabled prominent; no sidebar promotion until execution authorization is separately accepted |

## Recommended Fixes

1. Keep all v8 pages hidden/direct.
2. Later mark Connector Center as legacy in visible label and page title after human approval.
3. Add a user-facing bridge from legacy Connector Center to v8 Integration Center, Local Apps Center, and Provider Manager as the migration path. The current page already has partial bridge links.
4. Standardize center names in docs and UI copy before any sidebar promotion.
5. Run a future browser screenshot pass before sidebar exposure.
6. Promote only approved readonly centers to sidebar, never Execution Gateway first.

## Verdict

Visual acceptance status: `Pass with polish`

Blocking issue for sidebar exposure: legacy Connector Center remains the visible connector concept while v8 Integration Center / Local Apps Center / Provider Manager are hidden/direct.
