# OpenAIP v8 Visual Acceptance + Legacy Cleanup Report

## Final Target

Target verdict:

`OPENAIP_V8_VISUAL_ACCEPTANCE_LEGACY_ENTRY_CLEANUP_PLAN_READY_WITH_GATE_CLOSED`

## Baseline

- Baseline HEAD: `d75003c`
- Current branch: `main`
- `origin/main`: `d75003c` at start
- Working tree at start: clean
- Gate: CLOSED by source/UI copy
- Stage C: disabled by source/UI copy
- Scope: product-facing visual acceptance, legacy-entry cleanup plan, route visibility strategy

## Work Completed

Created:

- `docs/product/OPENAIP_V8_VISUAL_ACCEPTANCE_REPORT.md`
- `docs/product/OPENAIP_V8_LEGACY_ENTRY_CLEANUP_PLAN.md`
- `docs/product/OPENAIP_V8_ROUTE_VISIBILITY_STRATEGY.md`
- `docs/product/OPENAIP_V8_VISUAL_ACCEPTANCE_LEGACY_CLEANUP_REPORT.md`
- `docs/product/OPENAIP_V8_VISUAL_ACCEPTANCE_LEGACY_CLEANUP_RECEIPT.md`

No source, UI, CLI, test, route, sidebar, DB, runtime, Gate, Stage C, Auth, or connector-action implementation was changed.

## Visual Acceptance Summary

The 10 v8 hidden/direct routes are present and product-facing enough for hidden preview acceptance:

- Command Center provides a coherent hub and links to the 9 center pages.
- The 9 center pages present clear titles, purposes, readonly posture, Gate CLOSED / Stage C disabled safety copy, and no runtime mutation posture.
- The shared center shell has consistent visual language and safety badges.
- The pages are visually acceptable as hidden/direct product previews.

Overall grade: `Pass with polish`

The main blocker for normal-user sidebar exposure is information-architecture clarity, not route existence.

## Legacy Entry Summary

Current legacy conflict:

- `Connector Center` / `连接器中心` remains visible in sidebar.
- v8 Integration Center, Local Apps Center, and Provider Manager are the clearer future owners for the same conceptual space.

Recommended plan:

- Keep Connector Center visible now.
- Later mark it as `Legacy Connector Center` / `连接器中心（旧）` after human approval.
- Use it as a bridge into v8 Integration Center, Local Apps Center, Provider Manager, and Command Center.
- Do not hide or rename visible navigation until the user approves the visible navigation change.

## Route Visibility Summary

Initial recommendation:

- Keep all 10 v8 pages hidden/direct.
- Do not expose any v8 route in sidebar in this task.
- Treat Execution Gateway as no-go for sidebar until a separate Gate authorization model is approved.
- Treat Integration Center, Provider Manager, Local Apps Center, Agent Center, Task Center, Memory + Knowledge Center, Policy + Capability Center, Audit Center, and possibly Command Center as later candidates only after copy, screenshot, and human approval.

## Copy and Terminology Summary

Standard names recommended:

- OpenAIP v8 Command Center
- Agent Center
- Task Center
- Provider Manager
- Integration Center
- Local Apps Center
- Memory + Knowledge Center
- Policy + Capability Center
- Audit Center
- Execution Gateway
- Legacy Connector Center

Cleanup needed later:

- Replace user-facing `Policy Router + Capability Center` variants with `Policy + Capability Center` unless router is approved as a separate concept.
- Make old Connector Center visibly legacy.
- Clarify Provider Manager vs Local Apps Center vs Integration Center boundaries.
- Keep `Preview` suffix only while routes remain hidden/direct.

## Safety Summary

This task stayed inside the allowed documentation-only scope:

- No deploy.
- No release/tag.
- No restore.
- No restart.
- No DB write.
- No memory DB write.
- No vector DB write.
- No indexing job.
- No Gate opening.
- No Stage C enablement.
- No Auth/Gate change.
- No connector action.
- No external/local/provider API call.
- No sidebar exposure.

## Human Authorization Needed

Before implementation:

1. Approve marking `连接器中心` as `连接器中心（旧）`.
2. Approve v8 Integration Center as the canonical successor for connector management.
3. Approve whether Command Center belongs in sidebar or remains direct/internal.
4. Approve the first v8 sidebar promotion candidate.
5. Approve separate Gate/Execution Gateway authorization before any Execution Gateway exposure.

## Recommended Next Step

Run a narrow wording-only cleanup task:

- Mark Connector Center as legacy in label/page copy.
- Keep v8 routes hidden/direct.
- Add/retain tests proving v8 routes are absent from sidebar.
- Do not add runtime controls or API calls.
