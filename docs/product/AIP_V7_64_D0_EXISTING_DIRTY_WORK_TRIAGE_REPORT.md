# AIP v7.64-D0 Existing Dirty Work Triage Report

## Scope

Task package: `C:\Users\74002\Desktop\任务包.txt`

Mode: read-only triage plus this report/receipt only.

Hard boundaries honored:

- No source code edits.
- No cleanup, delete, rename, restore, or `git clean`.
- No staging or committing existing dirty files.
- No Stage C enablement.
- No feature flag toggle.
- No tag or GitHub Release.
- No restore execution.
- No DB writes.
- No Memory Hub sqlite edits.
- No prediction tasks.
- No OpenClaw master switch.
- No connector control.
- No `taskkill`, `Stop-Process`, or AIP restart.

## Current Git State

| Item | Result |
| --- | --- |
| Current branch | `main` |
| Current HEAD | `26a1602` |
| `origin/main` | `26a1602` |
| Branch sync | `main [origin/main]` |
| Working tree clean | NO |
| Final verdict | `V7_64_D0_DIRTY_WORK_TRIAGE_COMPLETE_NO_SOURCE_CHANGE` |

Recent commits:

```text
26a1602 docs(product): record p6 runtime freshness restart
f3a205f docs(product): record p5 runtime freshness diagnosis
38c071f docs(product): record p4 visual smoke hygiene
0c119f9 docs(product): record p3 ui polish receipt
d81fbfc fix(ui): polish residual product copy
c0e6130 fix(web-ui): remove legacy topbar contact label
5e6e1ec fix(ui): remove empty sidebar stub sections (intelligence, automation)
48ddbcc chore(v7.63): refresh version baseline and brand to v8.0.0
451f8d0 docs(product): seal v8.0 release verification
e294c96 docs(product): add reconciliation docs for v8.0.0 github release
e97b469 docs(product): record github release and release notes for v8.0.0
efec78d docs(product): add reconciliation docs for tag v8.0.0
```

## Uncommitted File Inventory

Tracked modified files:

```text
M apps/aip-cli/src/index.ts
M apps/web-ui/src/App.tsx
M docs/product/AIP_V7_59_P5_RECEIPT.md
M docs/product/AIP_V7_60_P1_RECEIPT.md
M docs/product/AIP_V7_60_P2_RECEIPT.md
M docs/product/AIP_V7_60_P4_RECEIPT.md
M docs/product/AIP_V7_60_P5_RECEIPT.md
M docs/product/AIP_V7_61_D1_REPORT.md
```

Untracked files:

```text
?? apps/local-api/src/model-gateway/index.ts
?? apps/web-ui/src/pages/ModelGateway.css
?? apps/web-ui/src/pages/ModelGateway.tsx
?? docs/superpowers/plans/2026-05-22-aip-local-model-gateway.md
?? taskpack_v759_p3_p4.txt
?? taskpack_v759_p5.txt
?? taskpack_v760_d1.txt
?? taskpack_v760_p1.txt
```

Ignored highlights from `git status --ignored --short`:

```text
!! .env.local
!! _dev_server.log
!! apps/*/node_modules/
!! apps/*/dist/
!! apps/local-api/outputs/
!! apps/local-api/src/audit/
!! apps/local-api/src/datasets/
!! apps/local-api/src/db/builtin-sqlite.db
!! apps/local-api/src/models/
!! apps/local-api/src/outputs/
!! apps/local-api/src/runs/
!! docs/releases/
!! docs/reports/
!! logs/
!! node_modules/
!! package-lock.json
!! packages/db/agi_factory.db
!! packages/db/agi_factory.db-shm
!! packages/db/agi_factory.db-wal
!! workers/python-worker/*.pt
```

Ignored state is consistent with local runtime/build/cache/model artifacts. No ignored file was modified by this triage.

## Diff Summary

`git diff --stat` for tracked files:

```text
apps/aip-cli/src/index.ts            | 135 +++++++++++++++++++++++++----------
apps/web-ui/src/App.tsx              |   2 +
docs/product/AIP_V7_59_P5_RECEIPT.md |  16 ++---
docs/product/AIP_V7_60_P1_RECEIPT.md |   8 +--
docs/product/AIP_V7_60_P2_RECEIPT.md |   8 +--
docs/product/AIP_V7_60_P4_RECEIPT.md |   8 +--
docs/product/AIP_V7_60_P5_RECEIPT.md |   8 +--
docs/product/AIP_V7_61_D1_REPORT.md  |   2 +-
8 files changed, 126 insertions(+), 61 deletions(-)
```

## File Classification

| File | Category | Recommendation | Summary |
| --- | --- | --- | --- |
| `apps/aip-cli/src/index.ts` | B |后续任务 | Real CLI UX/help polish for the command center. Adds color constants, badges, status panel, quick start grouping, and revised safety labels. |
| `apps/web-ui/src/App.tsx` | B |后续任务 | Exposes `/model-gateway` by lazy-loading `ModelGateway`. No sidebar entry detected here. |
| `apps/local-api/src/model-gateway/index.ts` | B / D |后续任务 + 人工确认 | New read-only Fastify route module for model gateway status. Probes local endpoints and process command lines. Needs formal review before commit. |
| `apps/web-ui/src/pages/ModelGateway.tsx` | B / D |后续任务 + 人工确认 | New preview console page for Claude proxy, AIP model gateway sidecar, Ollama, DeepSeek readiness, and route policy display. |
| `apps/web-ui/src/pages/ModelGateway.css` | B |后续任务 | Styling for the new Model Gateway page. Low standalone risk but tied to the uncommitted feature. |
| `docs/superpowers/plans/2026-05-22-aip-local-model-gateway.md` | D |人工确认 | Experimental implementation plan under `docs/superpowers`; not a normal product doc location. |
| `docs/product/AIP_V7_59_P5_RECEIPT.md` | A / D |可保留但确认 | Backfills post-commit/push/validation values into an old receipt. Looks archival, not functional. |
| `docs/product/AIP_V7_60_P1_RECEIPT.md` | A / D |可保留但确认 | Backfills post-commit/push/working-tree status into an old receipt. |
| `docs/product/AIP_V7_60_P2_RECEIPT.md` | A / D |可保留但确认 | Backfills post-commit/push/working-tree status into an old receipt, including notes about other unstaged receipts. |
| `docs/product/AIP_V7_60_P4_RECEIPT.md` | A / D |可保留但确认 | Backfills post-commit/push/working-tree status into an old receipt. |
| `docs/product/AIP_V7_60_P5_RECEIPT.md` | A / D |可保留但确认 | Backfills post-commit/push/working-tree status into an old receipt. |
| `docs/product/AIP_V7_61_D1_REPORT.md` | A / D |可保留但确认 | Refines one build validation row with module count/time/exit code. |
| `taskpack_v759_p3_p4.txt` | A / C |不要提交 | Local task handoff text. It explicitly says not to commit the desktop task pack into git. |
| `taskpack_v759_p5.txt` | A / C |不要提交 | Local task handoff text. It explicitly says not to commit the desktop task pack into git. |
| `taskpack_v760_d1.txt` | A / C |不要提交 | Local task handoff text. It explicitly says not to commit the desktop task pack into git. |
| `taskpack_v760_p1.txt` | A / C |不要提交 | Local task handoff text. It explicitly says not to commit the desktop task pack into git. |

Category key:

- A: can be kept locally but should not be committed now.
- B: should enter a later formal maintenance task.
- C: discard/rollback candidate.
- D: needs human confirmation.
- E: high-risk change.

No file was classified as E, but the ModelGateway group is risk-sensitive and must not be merged opportunistically.

## Required Focus Findings

### 1. `apps/aip-cli/src/index.ts`

Findings:

- This is a real CLI presentation/UX change, not just whitespace.
- It adds `BLUE`, `MAGENTA`, `WHITE`, `faint`, `accent`, `badge`, `statusValue`, `statusLine`, `printStatusPanel`, and `printQuickStart`.
- It restructures the command center around Quick Start, Service Control, Diagnostics, Config, Gateway & ML, Repair, and Docs/Receipts.
- It changes color behavior so `asciiMode` also disables color output.
- It labels `aip start` / `aip stop` as process-affecting and `aip restart` / gateway restart as confirm-required.

Risk notes:

- It references restart, stage-c, release-status, repair restore-point, and gateway restart in help text, but does not add new execution paths for those operations.
- No direct `taskkill`, `Stop-Process`, release creation, restore execution, DB write, or connector control was found in this diff.

Recommendation:

- Do not commit in D0.
- Open a separate CLI maintenance task to review help text, `asciiMode` behavior, and command grouping.

### 2. `apps/web-ui/src/App.tsx`

Findings:

- Adds `const ModelGateway = lazy(() => import('./pages/ModelGateway'));`.
- Adds `<Route path="model-gateway" element={<ModelGateway />} />`.
- This is route exposure.
- No sidebar/menu registration was observed in `App.tsx`.
- Stage C routes are present nearby in the existing file, but this diff does not modify Stage C route definitions.

Risk notes:

- The route exposes an untracked new page if committed with the page files.
- Since the route points at untracked files, it should be handled only as part of a complete ModelGateway task.

Recommendation:

- Do not commit in D0.
- Include in a formal ModelGateway preview/API task with route, sidebar, auth/public-path, and safety review.

### 3. ModelGateway files

Files:

- `apps/local-api/src/model-gateway/index.ts`
- `apps/web-ui/src/pages/ModelGateway.tsx`
- `apps/web-ui/src/pages/ModelGateway.css`

Capabilities observed:

- New local API `GET /api/model-gateway/status`.
- Probes:
  - Legacy Claude proxy: `http://127.0.0.1:15721/health`
  - AIP sidecar gateway: `http://127.0.0.1:15722/health`, `/v1/models`, `/v1/messages/count_tokens`
  - Ollama: `http://127.0.0.1:11434/api/tags`
- Uses `execFile('powershell.exe', ...)` to list `node.exe` processes matching sidecar/proxy script names.
- Reads file metadata for:
  - `E:\_AIP_TOOLS\claude-deepseek-proxy\cc-switch-proxy.js`
  - `E:\_AIP_TOOLS\aip-model-gateway\gateway.js`
  - `E:\_AIP_TOOLS\aip-model-gateway\StartAipModelGateway.bat`
- Reports route policy for Ollama E4B and DeepSeek target models.
- Reports whether `DEEPSEEK_API_KEY` is configured but does not return the key.
- UI presents status cards, route table, and safety notes.

Risk notes:

- No start/stop/restart call was found in the implementation.
- No token value return was found; command lines redact `sk-*` style secrets.
- It does introduce process inspection via PowerShell and exposes process command lines through an API response.
- It touches model/provider routing concepts and local external tools, so it needs explicit product/security review before merge.
- It does not directly call OpenClaw, DB writes, restore, prediction, release, taskkill, or connector control.

Recommendation:

- Treat as B / D: formal maintenance task plus human confirmation.
- Before merge, verify route registration, public-path exposure, process command redaction coverage, endpoint timeout behavior, and whether this API should be public or authenticated.

### 4. `docs/superpowers/`

Findings:

- Contains one untracked plan: `docs/superpowers/plans/2026-05-22-aip-local-model-gateway.md`.
- It is an implementation plan for a local model gateway sidecar, AIP read-only API, and console page.
- It references the `superpowers` workflow style and external paths under `E:\_AIP_TOOLS`.

Recommendation:

- Treat as D.
- Confirm whether `docs/superpowers/` is an accepted repo documentation area.
- If not, move future plans to the established product docs/reports location in a separate authorized cleanup task.

### 5. Old receipt docs

Findings:

- Old receipts and one D1 report were updated with post-commit hashes, push status, validation pass details, and working-tree notes.
- These are archival metadata updates, not runtime or source behavior.
- They are not duplicates, but they are retroactive edits to already completed receipts.

Recommendation:

- Treat as A / D.
- Keep locally until the user decides whether to seal historical receipt backfills in one docs-only commit or discard them as stale backfill noise.

### 6. taskpack files

Findings:

- Four untracked root taskpack files are local handoff text:
  - `taskpack_v759_p3_p4.txt`
  - `taskpack_v759_p5.txt`
  - `taskpack_v760_d1.txt`
  - `taskpack_v760_p1.txt`
- Their own instructions say desktop task packs should not be committed into git.

Recommendation:

- Treat as A / C.
- Do not commit.
- Later options: move outside repo, add an ignore pattern for local `taskpack_*.txt`, or delete only with explicit authorization.

## Risk Sweep

| Risk Area | Found in dirty changes? | Notes |
| --- | --- | --- |
| Stage C enablement | NO | CLI help references `stage-c`; existing Stage C routes in `App.tsx` were not changed by the diff. |
| DB writes | NO | No dirty code path writes DB. Ignored DB files exist as local runtime artifacts. |
| Restore execution | NO | CLI help references restore-point only. |
| Release/tag creation | NO | CLI help references release-status only. |
| `taskkill` / `Stop-Process` | NO | CLI help says gateway restart requires confirmation and does not auto taskkill. |
| Connector control | NO | No connector-control call in dirty diff. |
| Prediction execution | NO | No prediction execution path in dirty diff. |
| Memory Hub sqlite mutation | NO | No Memory Hub sqlite edit. |
| External model/provider routing | YES, risk-sensitive | ModelGateway probes local sidecars and reports DeepSeek/Ollama route policy; not high-risk execution, but should be reviewed formally. |
| Process inspection | YES, risk-sensitive | ModelGateway uses PowerShell `Get-CimInstance Win32_Process`; read-only, but API exposure needs review. |

## Validation

Commands run from `E:\AIP`:

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run build` | PASS, Vite large chunk warning only |
| `npm run lint` | PASS |
| `node tests/v763-p3-ui-polish-sweep.test.mjs` | PASS |
| `git diff --check` | PASS with CRLF working-copy warnings only |
| `GET http://127.0.0.1:8787/api/health` | PASS, `version: 8.0.0` |

The existing dirty files did not break the requested validation suite.

## Recommended Next Route

1. Do not commit any existing dirty source or taskpack files as part of D0.
2. Create a dedicated ModelGateway maintenance task if this feature should proceed.
3. In that task, review API public exposure, process command-line redaction, DeepSeek/Ollama route policy display, and sidebar/menu placement.
4. Decide separately whether historical receipt backfills should be sealed in a docs-only commit or discarded.
5. Decide whether local `taskpack_*.txt` files should be moved outside the repo or ignored.

## Final Verdict

`V7_64_D0_DIRTY_WORK_TRIAGE_COMPLETE_NO_SOURCE_CHANGE`

No high-risk execution change was found in the dirty tree. The ModelGateway group is risk-sensitive and should be handled only through a formal follow-up task.
