# OpenAIP v8 Route Visibility Strategy

## Baseline

- Baseline HEAD: `d75003c`
- Current route state: 10 v8 routes are direct/hidden preview routes
- Current sidebar exposure: no v8 preview route should be exposed in sidebar
- Legacy visible bridge: `/connector-center-readonly`

## Current Sidebar Exposure Result

Source-level review shows:

- `/connector-center-readonly` is a visible sidebar route.
- `/openaip-v8-command-center-preview` is registered as a route but not exposed in sidebar.
- The 9 v8 center pages are registered as direct routes but not exposed in sidebar.

Recommendation:

- Keep all v8 pages hidden/direct now.
- Do not expose v8 pages to sidebar until visual acceptance, copy cleanup, and legacy-entry migration are approved.

## Promotion Criteria

A v8 route can become a sidebar candidate only after all criteria are met:

- Page title and center purpose are understandable to normal users.
- Readonly state is visible and cannot be confused with active execution.
- Gate CLOSED and Stage C disabled are visible where relevant.
- No execution, launch, dispatch, connector action, config-write, DB-write, memory-write, vector-write, indexing, restore, release, tag, or provider-call controls exist.
- Legacy terminology conflict is resolved or explicitly labeled.
- Browser screenshot pass confirms layout, density, and text quality.
- Route smoke passes.
- Typecheck, lint, build, and git diff check pass.
- Human approval explicitly authorizes sidebar exposure.

## Per-Route Visibility Recommendation

| Route | Current Classification | Later Candidate | Safe For Normal Users Now | Required Polish First | Human Approval Boundary |
|---|---|---|---:|---|---|
| `/openaip-v8-command-center-preview` | hidden_direct now | candidate_sidebar_later | No | Remove preview framing, verify sidebar IA, simplify command-plane copy | Required before any sidebar exposure |
| `/openaip-v8-agent-center-preview` | hidden_direct now | candidate_sidebar_later | No | Confirm no lifecycle-control ambiguity; keep launch/mutation absent | Required |
| `/openaip-v8-task-center-preview` | hidden_direct now | candidate_sidebar_later | No | Clarify task packs are draft/receipt planning, not dispatch | Required |
| `/openaip-v8-provider-manager-preview` | hidden_direct now | candidate_sidebar_later | No | Resolve Model Gateway / CC Switch / Claude Proxy terminology | Required |
| `/openaip-v8-integration-center-preview` | hidden_direct now | candidate_sidebar_later | No | Approve Connector Center legacy migration and canonical owner wording | Required |
| `/openaip-v8-local-apps-center-preview` | hidden_direct now | candidate_sidebar_later | No | Clarify local app vs external connector vs provider model host | Required |
| `/openaip-v8-memory-knowledge-center-preview` | hidden_direct now | candidate_sidebar_later | No | Keep memory write/vector/indexing blocked text prominent | Required |
| `/openaip-v8-policy-capability-center-preview` | hidden_direct now | candidate_sidebar_later | No | Standardize name to Policy + Capability Center | Required |
| `/openaip-v8-audit-center-preview` | hidden_direct now | candidate_sidebar_later | No | Confirm no save/write/audit-log mutation path appears | Required |
| `/openaip-v8-execution-gateway-preview` | hidden_direct now | no_go_for_sidebar | No | Keep internal/reference only until Gate authorization model is separately approved | Required and separate Gate approval needed |
| `/connector-center-readonly` | sidebar_visible legacy bridge | legacy_visible_now | Yes, with legacy risk | Mark as legacy later and link to v8 successors | Required before label/navigation changes |

## Internal Reference Only / No-Go Guidance

Execution Gateway should remain hidden/direct or internal reference only because:

- The page name implies runtime execution.
- Gate must remain CLOSED.
- Stage C must remain disabled.
- Normal users should not see execution gateway concepts until authorization, approval, audit, and rollback models are separately accepted.

Provider Manager, Integration Center, and Local Apps Center are later candidates but should not be promoted together without copy cleanup, because their boundaries overlap for local model hosts, local tools, and external service bindings.

## Required Visual Acceptance Criteria

Before sidebar promotion:

- Page header is product-facing, not implementation-facing.
- Purpose can be understood without reading registry internals.
- Density is acceptable at desktop and narrow widths.
- Safety copy is visible but not overwhelming.
- No misleading controls appear.
- Links provide a clear path back to Command Center.
- Legacy bridge wording is not confusing.

## Required Safety Criteria

Before sidebar promotion:

- No Gate opening.
- No Stage C enablement.
- No Auth/Gate implementation change.
- No connector actions.
- No external/local/provider API calls.
- No DB, memory DB, vector DB, or indexing writes.
- No release/tag/deploy/restore workflows.
- No hidden route becomes visible without explicit human approval.

## Authorization Boundary

This document is a strategy only. It does not authorize:

- Any sidebar exposure.
- Any visible navigation rename.
- Any execution or connector action.
- Any runtime or persistence change.

Final recommendation: keep all v8 pages hidden/direct for now.
