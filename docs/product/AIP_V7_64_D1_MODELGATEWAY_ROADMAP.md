# AIP v7.64-D1 ModelGateway Roadmap

## Direction

ModelGateway should be formalized in small, gated slices:

1. Normalize the contract.
2. Harden the readonly API.
3. Add tests.
4. Gate navigation.
5. Only later consider sidecar smoke or control actions.

No source code should be merged from the current dirty tree until the clean-checkout and exposure issues are resolved.

## D2: Contract And Boundary Design

Goal:

- Freeze product intent and API contract without changing source.

Deliverables:

- API response schema.
- Auth/public split decision.
- Feature flag names.
- Redaction rules.
- UI state vocabulary.
- Acceptance tests list.

Decisions:

- Product category: readonly model readiness dashboard.
- Not a routing control plane.
- Not cost-routing mutation.
- Not OpenClaw control.

Exit criteria:

- Human approval for API auth boundary.
- Human approval for sidebar visibility behavior.
- Human approval for whether process probing is allowed at all.

## P1: Safe Readonly API

Goal:

- Make `/api/model-gateway/status` safe, tested, and mergeable.

Source scope:

- `apps/local-api/src/model-gateway/index.ts`
- `apps/local-api/src/index.ts`
- tests for API contract and redaction.

Required implementation constraints:

- No start/stop/restart/kill.
- No DB writes.
- No provider switching.
- No model inference.
- No raw command lines.
- Auth-gate detailed status or split public/private endpoint.
- Timeout-bound probes.
- Sidecar `count_tokens` probe optional and clearly marked.

Tests:

- Offline providers return structured status.
- Timeouts return `timeout`.
- `DEEPSEEK_API_KEY` value is never returned.
- Command lines are not returned.
- Endpoint does not expose write/control actions.
- Clean checkout typecheck passes.

Exit criteria:

- `npm --prefix apps/local-api run typecheck`
- root `npm run typecheck`
- `npm run lint`
- targeted API tests.

## P2: UI Preview Behind Flag

Goal:

- Add ModelGateway UI as a preview page without broad default exposure.

Source scope:

- `apps/web-ui/src/pages/ModelGateway.tsx`
- `apps/web-ui/src/pages/ModelGateway.css`
- `apps/web-ui/src/App.tsx`
- `apps/web-ui/src/components/Layout.tsx`

Required implementation constraints:

- Page route may exist, but sidebar/nav visibility must be gated.
- Copy must say readiness preview, not connected/routing active.
- UI must distinguish:
  - reachable
  - configured
  - model list available
  - smoke tested
  - unavailable
- No controls for start/stop/switch.
- No token/path overexposure.

Tests:

- Page renders offline state.
- Page renders configured/online states with mock data.
- No raw token-like values in rendered output.
- Nav item hidden unless feature flag is enabled.

Exit criteria:

- `npm --prefix apps/web-ui run typecheck`
- `npm run build`
- `npm run lint`
- Browser smoke if dev server is authorized in that task.

## P3: Sidecar Readiness Smoke

Goal:

- Validate the sidecar path with explicit human authorization.

Allowed only if task package explicitly authorizes:

- Starting the sidecar process.
- Calling sidecar `/health` and `/v1/models`.
- Running a non-mutating token count or minimal local smoke.

Still forbidden by default:

- Replacing legacy Claude proxy.
- Changing provider routing.
- Writing env or DB.
- Killing processes.

Exit criteria:

- Sidecar health evidence.
- No key leakage.
- No legacy proxy disruption.

## P4+: Control Plane, Only If Separately Authorized

Potential future features:

- Start/stop sidecar.
- Provider switch preview.
- Route policy editor.
- Cost-routing integration.

These are explicitly out of scope for D1-D2-P1-P3 and require a new human authorization package.

## Suggested Next Task Pack

`v7.64-D2 ModelGateway Contract And Boundary Freeze`

Scope:

- No source changes.
- Define API schema and auth split.
- Decide feature flags.
- Decide whether process probing is permitted.
- Decide sidebar default.

Expected verdict:

`V7_64_D2_MODELGATEWAY_CONTRACT_READY_NO_SOURCE_CHANGE`

## Recommended Handling Of Current Dirty Files

| Current file | Next route |
| --- | --- |
| `apps/local-api/src/model-gateway/index.ts` | Rewrite/harden in P1. |
| `apps/web-ui/src/pages/ModelGateway.tsx` | Keep as reference, implement behind flag in P2. |
| `apps/web-ui/src/pages/ModelGateway.css` | Reuse in P2 after UI copy/state review. |
| `apps/web-ui/src/App.tsx` | Fold into P2 route exposure with flag decision. |
| `apps/local-api/src/index.ts` tracked references | Fix clean-checkout inconsistency in P1 or an explicit cleanup slice. |
| `apps/web-ui/src/components/Layout.tsx` tracked nav item | Gate or remove in P2/cleanup; do not leave always visible before acceptance. |
| `docs/superpowers/plans/2026-05-22-aip-local-model-gateway.md` | Treat as historical scratch plan; do not use as product spec without D2 review. |

## Final Recommendation

Run D2 before implementation. The current source direction is close enough to reuse conceptually, but not safe enough to merge directly.
