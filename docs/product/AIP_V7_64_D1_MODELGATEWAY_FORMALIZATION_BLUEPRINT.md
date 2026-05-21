# AIP v7.64-D1 ModelGateway Formalization Blueprint

## Scope

Task package: `C:\Users\74002\Desktop\任务包.txt`

This D1 pass is docs-first only. It does not merge, fix, stage, or commit the existing ModelGateway source changes.

Final verdict:

`V7_64_D1_MODELGATEWAY_FORMALIZATION_BLUEPRINT_READY_NO_SOURCE_CHANGE`

## Current Baseline

| Item | Result |
| --- | --- |
| Branch | `main` |
| HEAD before D1 docs | `57e9722` |
| `origin/main` before D1 docs | `57e9722` |
| Branch sync | `main [origin/main]` |
| Working tree clean | NO |
| Live API health | `version: 7.62.0` |

Recent history:

```text
57e9722 docs(product): record v7.64 dirty work triage
26a1602 docs(product): record p6 runtime freshness restart
f3a205f docs(product): record p5 runtime freshness diagnosis
38c071f docs(product): record p4 visual smoke hygiene
0c119f9 docs(product): record p3 ui polish receipt
d81fbfc fix(ui): polish residual product copy
c0e6130 fix(web-ui): remove legacy topbar contact label
5e6e1ec fix(ui): remove empty sidebar stub sections (intelligence, automation)
48ddbcc chore(v7.63): refresh version baseline and brand to v7.62.0
451f8d0 docs(product): seal v7.62 release verification
e294c96 docs(product): add reconciliation docs for v7.62.0 github release
e97b469 docs(product): record github release and release notes for v7.62.0
```

## Relevant Files

Dirty or untracked files directly relevant to ModelGateway:

| File | State | Purpose |
| --- | --- | --- |
| `apps/web-ui/src/App.tsx` | modified | Adds lazy import and route for `/model-gateway`. |
| `apps/local-api/src/model-gateway/index.ts` | untracked | Implements `GET /api/model-gateway/status` and local probes. |
| `apps/web-ui/src/pages/ModelGateway.tsx` | untracked | Adds read-only console page for model gateway status. |
| `apps/web-ui/src/pages/ModelGateway.css` | untracked | Adds styles for the ModelGateway page. |
| `docs/superpowers/plans/2026-05-22-aip-local-model-gateway.md` | untracked | Experimental implementation plan for sidecar/API/UI work. |

Already present in current HEAD, but still relevant:

| File | Current HEAD observation |
| --- | --- |
| `apps/local-api/src/index.ts` | Imports `registerModelGatewayRoutes`, whitelists `/api/model-gateway/status`, and calls `registerModelGatewayRoutes(app)`. |
| `apps/web-ui/src/components/Layout.tsx` | Sidebar already contains `NavItem to="/model-gateway" label="模型网关"` under the model/release section. |

Clean-checkout concern:

- The route registration and sidebar entry are already in tracked HEAD.
- The implementation files are still untracked.
- Therefore a clean checkout of `57e9722` may reference files that are absent unless those files were committed elsewhere. This should be treated as a formalization blocker before any release or clean-environment validation.

## Product Target

Recommended product definition:

**ModelGateway should start as a read-only local model readiness dashboard, not as a model routing control console.**

It should answer:

- Is the legacy Claude DeepSeek proxy reachable?
- Is the proposed AIP model gateway sidecar reachable?
- Is Ollama reachable, and does the expected local model appear installed?
- Is DeepSeek configured for the sidecar without exposing the key?
- What route policy would be used if the sidecar is active?
- What safety boundary prevents automatic start/stop/replacement?

It should not initially:

- Switch providers.
- Start or stop services.
- Modify env/config.
- Write DB state.
- Replace the existing Claude proxy.
- Trigger model inference or prediction jobs.

## Required Answers

### 1. Product goal

The current work aims to make local model gateway readiness visible inside AIP: legacy Claude proxy, sidecar gateway, Ollama E4B, DeepSeek readiness, and route policy preview.

### 2. What should it be?

Recommended classification:

- Primary: read-only status page.
- Secondary: local model health check.
- Secondary: DeepSeek/Ollama provider dashboard.
- Not yet: model routing control console.
- Not part of cost routing in D1. Cost routing can consume a future normalized provider-readiness API, but this page should not mutate or select cost policies.

### 3. Current over-permission risk

No direct execution path was found for start, stop, restart, kill, DB writes, restore, prediction, release, or connector control.

Risk remains in the process-probe layer:

- It executes PowerShell through `execFile`.
- It enumerates local `node.exe` process command lines.
- It exposes process command-line-derived data through an API response.

### 4. Token/env leak risk

The code does not return `DEEPSEEK_API_KEY`; it returns only a boolean.

Residual risk:

- Command-line redaction only masks `sk-*` style tokens.
- Other token formats, env fragments, local paths, or arguments in process command lines could leak through the `processes` array.
- Recommendation: do not expose raw command lines; return PID, script match, and redacted/hashed command identity only.

### 5. Misleading "connected model" risk

Yes. The current UI can show provider/model statuses and a route policy table, which may make users think model execution is already operational.

Required copy/state changes for implementation:

- Label the page as "readiness preview" until a real request smoke is completed.
- Separate `reachable`, `configured`, `model_list_available`, and `message_smoke_passed`.
- Do not call a route "available" only because a static fallback policy exists.

### 6. Sidebar exposure

Not by default until D2 readiness gates pass.

Current tracked `Layout.tsx` already exposes `模型网关`. Formal implementation should either:

- keep it hidden behind an explicit preview/readonly flag, or
- expose it only after the API contract, auth boundary, and process redaction are fixed.

### 7. Default readonly

Yes. D2/P1 should remain readonly. Any control plane actions must be a later separately authorized stage.

### 8. API token / auth gate

Recommended: yes, require auth for `/api/model-gateway/status` unless a very small public summary is split out.

Reason:

- The endpoint reveals local service topology, paths, process counts, and model/provider readiness.
- Current HEAD whitelists `/api/model-gateway/status` in `PUBLIC_PATHS`. That should be reconsidered before merge.

### 9. Feature flag

Recommended: yes.

Suggested flags:

- `AIP_MODELGATEWAY_READONLY_STATUS=1`
- `AIP_MODELGATEWAY_NAV_VISIBLE=1`

Default:

- status API disabled or auth-gated in production-like profiles.
- nav hidden unless explicitly enabled.

### 10. D2/P1/P2 split

Recommended:

- D2: clean implementation design and contract freeze.
- P1: safe read-only API and tests, no sidebar exposure by default.
- P2: UI preview behind flag with auth-gated data.
- P3: optional sidecar smoke and docs, still no provider switching.
- P4+: control plane only if separately authorized.

## Current Diff Summary

### `apps/web-ui/src/App.tsx`

Purpose:

- Adds lazy import for `ModelGateway`.
- Adds route: `/model-gateway`.

Impact:

- Route exposure exists in dirty tree.
- It depends on untracked page files.
- It does not itself add sidebar exposure; the sidebar entry is already present in tracked `Layout.tsx`.

### `apps/local-api/src/model-gateway/index.ts`

Purpose:

- Adds `buildModelGatewayStatus()`.
- Adds `registerModelGatewayRoutes(app)`.
- Provides `GET /api/model-gateway/status`.

External requests:

- `GET http://127.0.0.1:15721/health`
- `GET http://127.0.0.1:15722/health`
- `GET http://127.0.0.1:15722/v1/models`
- `POST http://127.0.0.1:15722/v1/messages/count_tokens`
- `GET http://127.0.0.1:11434/api/tags`

Token/env handling:

- Reads `process.env.DEEPSEEK_API_KEY` only as a boolean.
- Does not return the key.

Process probing:

- Uses `powershell.exe` and `Get-CimInstance Win32_Process`.
- Filters `node.exe` command lines by script name.
- Returns PID, process name, and redacted command line.

Execution behavior:

- No start, stop, restart, `taskkill`, `Stop-Process`, restore, DB write, release, connector control, or prediction execution was found.

### `apps/web-ui/src/pages/ModelGateway.tsx`

Purpose:

- Fetches `/api/model-gateway/status`.
- Displays endpoint cards, route policy table, and safety notes.
- Polls every 30 seconds.

Risk:

- Can imply operational readiness unless status labels are made more precise.
- Displays script paths and readiness values.

### `apps/web-ui/src/pages/ModelGateway.css`

Purpose:

- Page-local layout and table/card styles.

Risk:

- Low by itself.

### `docs/superpowers/plans/2026-05-22-aip-local-model-gateway.md`

Purpose:

- Experimental implementation plan.
- Proposes sidecar on `127.0.0.1:15722`, read-only AIP API, and console page.

Risk:

- Contains future commands that would start a sidecar during validation.
- Not executable by itself, but should not be treated as product documentation without review.

## Relationship To Existing Systems

| System | Impact |
| --- | --- |
| Existing model routing | No direct mutation found. Static route policy preview may create expectation but does not alter routing. |
| Cost routing | No direct cost-routing changes found. Future integration should consume readiness summary only. |
| Plugin pool | No direct plugin-pool changes found. |
| OpenClaw | No direct OpenClaw calls found. The page references Claude proxy and sidecar, not OpenClaw master switch. |
| DB | No write path found. |
| Stage C | No Stage C enablement found. |
| Release/restore | No execution found. |

## Acceptance Gates For Future Implementation

Before ModelGateway source can be merged:

1. Clean-checkout build must pass without relying on untracked files.
2. API must be auth-gated or split into public-safe and private detail endpoints.
3. Process command-line exposure must be removed or strictly redacted beyond `sk-*`.
4. `count_tokens` probe must be classified as an external sidecar request and made optional.
5. UI labels must distinguish reachable/configured/listed/smoke-tested.
6. Sidebar exposure must be behind flag until the endpoint contract is stable.
7. Tests must cover no secret leakage, timeout behavior, offline providers, and no start/stop behavior.
8. Docs must state that the page is readonly and does not route or switch providers.

## Validation

Commands run from `E:\AIP`:

| Check | Result |
| --- | --- |
| `git status --short` | Dirty, expected |
| `git diff --stat` | Collected |
| `git diff --name-only` | Collected |
| `git log --oneline -12` | Collected |
| `git branch -vv` | Collected |
| `npm run typecheck` | PASS |
| `npm run build` | PASS, Vite large chunk warning only |
| `npm run lint` | PASS |
| `node tests/v763-p3-ui-polish-sweep.test.mjs` | PASS |
| `git diff --check` | PASS with CRLF working-copy warnings only |

No ModelGateway-specific tests were found under `tests`.

## Final Recommendation

Proceed with a formal D2 design/contract pass before any source merge.

Do not merge the existing ModelGateway dirty source as-is. The overall direction is useful, but the current shape needs auth, feature flags, process-probe hardening, copy clarification, and clean-checkout repair.
