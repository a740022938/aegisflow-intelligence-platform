# AIP v7.63-P6 Controlled Runtime Restart + Freshness Smoke Receipt

## Decision Matrix

| Item | Result |
| --- | --- |
| Human-authorized restart performed | YES |
| Only confirmed AIP dev API PID stopped | YES, PID `15072` |
| Unrelated `node.exe` processes stopped | NO |
| Restart method | `npm.cmd --prefix apps/local-api run dev` from `E:\AIP` |
| New listener PID | `19452` |
| Pre-restart `/api/health` version | `7.55.0` |
| Post-restart `/api/health` version | `8.0.0` |
| Stale runtime resolved | YES |
| Dashboard stale version warning remained | NO |
| Module Center stale version warning remained | NO |
| Governance Hub stale version warning remained | NO |
| Source code modified | NO |
| Existing dirty files handled | NO |
| DB writes performed | NO |
| Memory Hub sqlite modified | NO |
| Stage C enabled | NO |
| Feature flag toggled | NO |
| Tag or GitHub Release created | NO |
| Restore executed | NO |
| Prediction task executed | NO |
| Connector control called | NO |

## Evidence

Pre-restart:

- `git status --short --untracked-files=all`: pre-existing dirty/untracked files present.
- HEAD: `f3a205f`
- Health: `version: 7.55.0`, uptime `9776.9833829`.
- Listener: port `8787`, PID `15072`, AIP-owned `node.exe ... tsx ... src/index.ts`.

Restart:

- Stopped only PID `15072` using `Stop-Process -Id 15072`.
- Confirmed no remaining `8787` listener after stop.
- Restarted with project dev API command through `npm.cmd`.

Post-restart:

- Launcher PID: `2864`.
- Listener PID: `19452`.
- Health: `version: 8.0.0`, database `ok`, worker pool `2`.
- Later health confirmation remained `version: 8.0.0`.

Validation:

- `npm run typecheck`: PASS.
- `npm run build`: PASS.
- `npm run lint`: PASS.
- `node tests/v763-p3-ui-polish-sweep.test.mjs`: PASS.
- `git diff --check`: PASS with existing line-ending warnings only.
- Browser freshness smoke: Dashboard, Module Center, and Governance Hub no longer exposed `7.55.0`.

## Final Verdict

`P6_RUNTIME_FRESHNESS_RESOLVED_WITH_AUTHORIZED_API_RESTART`
