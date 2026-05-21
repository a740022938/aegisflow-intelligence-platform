# AIP v7.64-D1 ModelGateway Risk Matrix

## Verdict

`V7_64_D1_MODELGATEWAY_FORMALIZATION_BLUEPRINT_READY_NO_SOURCE_CHANGE`

No high-risk execution path was found, but the current ModelGateway implementation is not ready to merge because it exposes local topology/process details and depends on untracked files.

## Risk Categories

| Category | Scope | Current Items | Recommendation |
| --- | --- | --- | --- |
| A | Safe UI display layer | `ModelGateway.css`; most static card/table rendering in `ModelGateway.tsx` | Can be retained after contract naming is clarified. |
| B | API status layer needing tests | `GET /api/model-gateway/status`; provider availability summary; timeout probes | Candidate for P1 only after auth, tests, and clean-checkout repair. |
| C | Process probing layer needing strict review | PowerShell `Get-CimInstance Win32_Process`; returned command lines; local script metadata | Rewrite before merge. Do not expose raw command lines. |
| D | Execution ability forbidden in this round | Start/stop/restart/kill/env mutation/DB write/provider switching | Not present in current implementation; keep prohibited. |
| E | Human confirmation boundary | Sidebar exposure; public endpoint; default DeepSeek/Ollama display; feature flag naming | Must be decided before source merge. |

## Detailed Matrix

| Risk | Evidence | Severity | Current Status | Required Control |
| --- | --- | --- | --- | --- |
| Clean-checkout break | `apps/local-api/src/index.ts` in HEAD imports `./model-gateway/index.js`; implementation file is untracked | High | Open | Commit a complete source set in a formal task or remove tracked references in a separate authorized cleanup. |
| Public topology exposure | `/api/model-gateway/status` is whitelisted in `PUBLIC_PATHS` in current HEAD | High | Open | Move detailed endpoint behind auth or split a minimal public health summary. |
| Process command leakage | API returns process command line after only `sk-*` redaction | High | Open | Return only PID/process count/script match; remove command line from response or use allowlisted redaction. |
| Token/env leakage | `DEEPSEEK_API_KEY` is only converted to boolean, but command-line data may contain other secrets | Medium | Partially controlled | Keep boolean env status, remove raw command-line exposure, add no-secret tests. |
| Misleading operational status | UI displays route policy fallback and provider cards | Medium | Open | Use labels: reachable, configured, listed, smoke-tested; avoid "connected" unless real smoke passed. |
| External sidecar request | `POST /v1/messages/count_tokens` to `127.0.0.1:15722` | Medium | Open | Make optional, timeout-bound, documented, and non-mutating; do not call `/v1/messages` in readonly status. |
| Sidebar exposure | `Layout.tsx` already has `模型网关` nav item in HEAD | Medium | Open | Hide behind `AIP_MODELGATEWAY_NAV_VISIBLE=1` until P2. |
| Provider switching expectation | Route policy preview lists DeepSeek/Ollama targets | Medium | Open | Copy must say preview only; no provider switching in P1/P2. |
| Cost routing confusion | Route policy language overlaps cost-routing mental model | Low/Medium | Open | Keep separate from cost routing until a normalized readiness API exists. |
| OpenClaw boundary | No OpenClaw calls found | Low | Controlled | Keep explicit no OpenClaw master switch boundary. |
| DB write | No DB write found | Low | Controlled | Add tests/grep gate for no DB writes in ModelGateway module. |
| Start/stop/kill | No `taskkill`, `Stop-Process`, or service start/stop in ModelGateway code | Low | Controlled | Keep execution APIs out of scope. |
| Feature flag absence | No dedicated ModelGateway flag observed | Medium | Open | Add readonly status and nav visibility flags before exposing broadly. |

## API Boundary Recommendation

Preferred endpoint split:

| Endpoint | Auth | Contents |
| --- | --- | --- |
| `/api/model-gateway/summary` | Optional public or auth | Aggregated status only: `enabled`, `readonly`, `provider_count`, `overall_status`. |
| `/api/model-gateway/status` | Auth required | Detailed provider readiness, paths, process counts, route preview. |
| `/api/model-gateway/processes` | Do not add in P1 | Avoid unless separately authorized and heavily redacted. |

## Data Redaction Rules

Allowed:

- Boolean key configured state.
- Provider names.
- Local endpoint labels.
- Process counts.
- Script existence booleans.
- Safe last-modified timestamps if needed.

Disallowed in P1:

- Raw command lines.
- Full env values.
- Tokens or token-like strings.
- Full user-home paths unless required.
- Any provider credentials.

## Merge Blockers

1. Untracked implementation files required by tracked imports/routes.
2. Public status endpoint exposes too much local detail.
3. Raw command-line-derived data can leak secrets or private paths.
4. No ModelGateway-specific tests.
5. Sidebar is visible before the feature is formally accepted.

## Non-Blockers

- The UI CSS is low risk.
- The concept of a readonly provider readiness dashboard is aligned with AIP's operator-console direction.
- Current validation passes in the dirty worktree.

## Final Risk Position

ModelGateway is viable as a readonly readiness dashboard, but it should not proceed as a public model routing console or control plane in the next slice.
