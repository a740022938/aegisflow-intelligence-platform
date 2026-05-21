# AIP v7.63-P5 Controlled Runtime Freshness Resolution Report

Date: 2026-05-22

## 1. Stale Runtime Verdict

Confirmed: `STALE_RUNTIME_CONFIRMED_NO_RESTART_EXECUTED`.

The committed source and package metadata are aligned to OpenAIP / AIP v7.62.0, but the already-running local API process still returns `version: 7.55.0` from `/api/health`.

## 2. Repo State

Executed:

```text
git status --short --untracked-files=all
git log --oneline -5
git branch -vv
```

Branch state before P5 report creation:

```text
main 38c071f [origin/main] docs(product): record p4 visual smoke hygiene
```

Existing dirty files remain from earlier work and were not changed, staged, restored, or deleted by P5.

## 3. Version Source Check

Executed source search:

```text
rg -n "7\.55\.0|v7\.55\.0" package.json apps/aip-cli/package.json apps/local-api/package.json apps/web-ui/package.json apps/web-ui/src/constants apps/web-ui/src/registry apps/web-ui/src/pages/Dashboard.tsx apps/web-ui/src/pages/GovernanceHub.tsx apps/local-api/src -S
```

Result: no current source hit in the checked app/package/version paths.

Current metadata evidence:

```text
package.json version: 7.62.0
apps/web-ui/src/constants/appVersion.ts: APP_VERSION = 'v7.62.0'
apps/web-ui/src/registry/product-metadata-registry.ts: productVersion = 'v7.62.0'
apps/local-api/src/version.ts: reads nearest root package.json named agi-model-factory
```

Conclusion: health version source is not hardcoded to `7.55.0` in the checked current source path. The live service is stale or started from an older effective runtime context.

## 4. Live API Before Refresh

Executed:

```text
GET http://127.0.0.1:8787/api/health
```

Observed:

```text
ok: true
service: local-api
version: 7.55.0
uptime: 9478.5763191 seconds
database.status: ok
workerPool.totalWorkers: 2
```

## 5. Process / Port Check

Executed read-only port and process inspection only. No process was stopped.

Listening process:

```text
port: 8787
pid: 15072
name: node.exe
executable: C:\nvm4w\nodejs\node.exe
created: 2026-05-22 01:00:19
command: node --require E:\AIP\node_modules\.pnpm\tsx@4.21.0\...\preflight.cjs --import file:///E:/AIP/node_modules/.pnpm/tsx@4.21.0/.../loader.mjs src/index.ts
parent chain: npm --prefix apps/local-api run dev -> tsx src/index.ts -> node src/index.ts
```

This confirms the live API is an AIP-owned dev API process, but P5 did not kill or restart it.

## 6. Restart Decision

Restart was not executed.

Reason:

- The task package says to report suggested commands and wait for human authorization unless the task itself explicitly has restart authorization.
- This P5 task package did not explicitly say “已获得人工授权”.
- The discovered CLI stop/restart implementation can call `taskkill` through `apps/aip-cli/src/process.ts` and `apps/aip-cli/src/commands/stop.ts`, which conflicts with the P5 hard boundary.

Suggested safe human path:

```text
1. In the terminal currently running E:\AIP npm run dev, press Ctrl+C.
2. From E:\AIP, run: npm run dev
3. Recheck: Invoke-RestMethod http://127.0.0.1:8787/api/health
```

Avoid for this specific P5 boundary unless separately authorized:

```text
aip restart
aip stop
taskkill / Stop-Process
```

## 7. Source Touch

No source code was modified by P5.

Only P5 report/receipt docs were created for traceability.

## 8. Validation

Executed:

```text
npm run typecheck
npm run build
npm run lint
node tests/v763-p3-ui-polish-sweep.test.mjs
git diff --check
```

Results:

| Command | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run build` | PASS, existing Vite large chunk warning only |
| `npm run lint` | PASS |
| `node tests/v763-p3-ui-polish-sweep.test.mjs` | PASS |
| `git diff --check` | PASS, line-ending warnings only |

Validation caveat: the working tree was already dirty before P5, so validation applies to the current dirty working tree, not a clean `origin/main` checkout.

## 9. Safety Boundary

- No Stage C enablement.
- No feature flag toggle.
- No DB write.
- No Memory Hub sqlite modification.
- No restore.
- No tag or GitHub Release.
- No prediction task.
- No connector control.
- No `taskkill`.
- No `Stop-Process`.
- No service restart.
- No existing dirty file was staged, restored, deleted, or renamed.

## 10. Working Tree

Existing dirty files still remain, including:

- `apps/aip-cli/src/index.ts`
- `apps/web-ui/src/App.tsx`
- `apps/local-api/src/model-gateway/index.ts`
- `apps/web-ui/src/pages/ModelGateway.tsx`
- `apps/web-ui/src/pages/ModelGateway.css`
- historical receipt/report edits under `docs/product/AIP_V7_59_*`, `AIP_V7_60_*`, `AIP_V7_61_*`
- `docs/superpowers/plans/2026-05-22-aip-local-model-gateway.md`
- root taskpack files

These remain outside P5.

## 11. Final Verdict

`P5_STALE_RUNTIME_CONFIRMED_RESTART_DEFERRED_PENDING_HUMAN_AUTHORIZATION`

The runtime freshness issue is confirmed and likely resolvable by restarting the AIP dev API from the current repo state. P5 did not execute restart because the current task package did not explicitly authorize it and the discovered automated stop/restart path may invoke prohibited process-kill behavior.
