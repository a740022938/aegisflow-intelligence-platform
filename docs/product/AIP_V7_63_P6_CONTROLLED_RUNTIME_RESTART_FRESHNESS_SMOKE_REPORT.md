# AIP v7.63-P6 Controlled Runtime Restart + Freshness Smoke Report

## Scope

Task package: `C:\Users\74002\Desktop\任务包.txt`

Purpose: perform the human-authorized controlled restart of the AIP dev API to clear the stale runtime confirmed in P5.

Hard boundaries honored:

- Stopped only the confirmed AIP-owned dev API process on port `8787`.
- Did not stop unrelated `node.exe` processes.
- Did not modify source code.
- Did not handle pre-existing dirty files.
- Did not write DB state.
- Did not modify Memory Hub sqlite.
- Did not enable Stage C.
- Did not toggle feature flags.
- Did not create tag or GitHub Release.
- Did not execute restore.
- Did not run prediction tasks.
- Did not call connector control.

## Pre-Restart Baseline

Git baseline:

- Branch: `main`
- HEAD before P6 docs: `f3a205f`
- `git status --short --untracked-files=all`: pre-existing dirty/untracked files were present before this P6 documentation step.

Pre-restart health:

```json
{
  "ok": true,
  "service": "local-api",
  "version": "7.55.0",
  "uptime": 9776.9833829,
  "database": {
    "status": "ok"
  },
  "workerPool": {
    "totalWorkers": 2,
    "busyWorkers": 0,
    "idleWorkers": 2
  }
}
```

Pre-restart listener:

- Port: `8787`
- PID: `15072`
- Name: `node.exe`
- Created: `2026-05-22 01:00:19 +08:00`
- Command line: `C:\nvm4w\nodejs\node.exe --require E:\AIP\node_modules\.pnpm\tsx@4.21.0\...\preflight.cjs --import file:///E:/AIP/node_modules/.pnpm/tsx@4.21.0/.../loader.mjs src/index.ts`

Conclusion: the live API was stale because `/api/health` still returned `7.55.0` while the source/package baseline had already moved to `7.62.0`.

## Restart Method

Stop command used, limited to the human-authorized PID:

```powershell
Stop-Process -Id 15072
```

Post-stop check:

- No remaining `8787` listener.
- PID `15072` no longer existed.

Restart command used:

```powershell
Start-Process -FilePath 'npm.cmd' -ArgumentList @('--prefix','apps/local-api','run','dev') -WorkingDirectory 'E:\AIP' -WindowStyle Hidden -PassThru
```

Observed launcher PID:

- `2864`

Observed live listener after restart:

- Port: `8787`
- PID: `19452`
- Parent PID: `22492`
- Name: `node.exe`
- Created: `2026-05-22 03:43:41 +08:00`
- Command line: `C:\nvm4w\nodejs\node.exe --require E:\AIP\node_modules\.pnpm\tsx@4.21.0\node_modules\tsx\dist\preflight.cjs --import file:///E:/AIP/node_modules/.pnpm/tsx@4.21.0/node_modules/tsx/dist/loader.mjs src/index.ts`

## Post-Restart Health

Immediate post-restart health:

```json
{
  "ok": true,
  "service": "local-api",
  "version": "7.62.0",
  "uptime": 6,
  "database": {
    "status": "ok"
  },
  "workerPool": {
    "totalWorkers": 2,
    "busyWorkers": 0,
    "idleWorkers": 2
  }
}
```

Later confirmation health:

```json
{
  "ok": true,
  "service": "local-api",
  "version": "7.62.0",
  "uptime": 173.1974657,
  "database": {
    "status": "ok"
  },
  "workerPool": {
    "totalWorkers": 2,
    "busyWorkers": 0,
    "idleWorkers": 2
  }
}
```

Result: stale runtime resolved. `/api/health` no longer returns `7.55.0`; it now reports `7.62.0`.

## Visual Freshness Smoke

Checked via browser smoke against the live dev UI:

- Dashboard `/`: no `7.55.0`; page shows `v7.62.0`; no fatal overlay.
- Module Center `/module-center`: no `7.55.0`; page shows `AIP v7.62.0`; no fatal overlay.
- Governance Hub `/governance-hub`: no `7.55.0`; API status shows `Version: 7.62.0`; no fatal overlay.

Observed dev-console caveat:

- Existing authenticated endpoint `401` warnings appeared during UI smoke.
- They were auth-gated endpoint warnings, not runtime freshness failures.

## Validation

Commands run from `E:\AIP`:

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run lint` | PASS |
| `node tests/v763-p3-ui-polish-sweep.test.mjs` | PASS |
| `git diff --check` | PASS with existing line-ending warnings only |
| `GET http://127.0.0.1:8787/api/health` | PASS, returns `version: 7.62.0` |

Build caveat:

- Vite emitted the existing large chunk warning only.

Working tree caveat:

- Pre-existing dirty/untracked files remained present and were not cleaned, reverted, staged, or otherwise handled by the runtime restart.

## Final Verdict

`P6_RUNTIME_FRESHNESS_RESOLVED_WITH_AUTHORIZED_API_RESTART`

The P5 stale runtime condition is resolved. The live AIP dev API is running from the refreshed baseline and reports `version: 7.62.0`.
