# AIP v7.66-P2: Controlled Live Auth/Gate Smoke Receipt

**Verdict:** `V7_66_P2_CONTROLLED_LIVE_AUTH_GATE_SMOKE_PASS_WITH_GATE_CLOSED`
**Date:** 2026-05-22

---

## Summary

Live smoke verification of v7.66-P1 Auth Truth Alignment Hotfix on real running AIP API and Vite dev server. API was stale (started at 14:11 before P1 changes), human-authorized restart performed. After restart, all smoke tests pass.

## Restart Record

| Item | Before | After |
|---|---|---|
| API PID | 4784 | 18688 |
| API start time | 14:11:38 | 19:00:54 |
| Command | `tsx src/index.ts` (no watch) | same |
| HEAD | `f07709b` | same |
| Valid token response | `{"valid":true}` no JWT ❌ | `+ "access_token":"eyJ..."` ✅ |

## Smoke Results

| Area | Result |
|---|---|
| Runtime freshness (API + Vite) | ✅ Both serving P1 code |
| JWT issuance (valid token) | ✅ `role: viewer`, `1h expiry` |
| JWT memory-only storage | ✅ authStore.ts module-level `let jwt` |
| JWT no localStorage/sessionStorage/DOM/console/git | ✅ All clear |
| Fake/empty token rejection | ✅ Invalid / 400 |
| Auth state messages (7 states) | ✅ All present |
| Ctrl+F5 stale hint | ✅ Present in TokenInput footer |
| Topbar "已授权" display | ✅ Correct |
| PluginPool auto-retry | ✅ Present (jwt.authenticated + useEffect) |
| ModuleCenter auto-refresh | ✅ Present (onVerifiedChange + useEffect) |
| No infinite reload loop | ✅ No `location.reload()`, auto-retry instead |
| Timeout 15000ms, no abortVerify | ✅ |
| finally block no overwrite | ✅ |
| master-switch POST | 401 (no JWT) / 403 (with JWT) |
| Stage C disabled | ✅ `stageCEnabled: false` |
| Feature flag off | ✅ `currentState: "off"` |
| No DB write | ✅ |
| No connector action | ✅ |
| No restore/release/tag | ✅ |

## Verification Commands

| Command | Result |
|---|---|
| `git status --short` | Clean (1 untracked doc) |
| `git branch --show-current` | `main` |
| `git rev-parse --short HEAD` | `f07709b` |
| `pnpm run typecheck` | ✅ |
| `pnpm run lint` | ✅ 0 warnings |
| `pnpm run build` | ✅ 745 modules, 12.37s |
| `node tests/v765-p2-auth-timeout-hotfix.test.mjs` | ✅ 43/43 PASS |
| Security grep (localStorage/sessionStorage/console.log/jwt/Stage C/DB write) | ✅ All clean |

## Required Deliverables

| Document | Path | Committed |
|---|---|---|
| Smoke Report | `docs/product/AIP_V7_66_P2_CONTROLLED_LIVE_AUTH_GATE_SMOKE_REPORT.md` | To be committed |
| Smoke Receipt | `docs/product/AIP_V7_66_P2_CONTROLLED_LIVE_AUTH_GATE_SMOKE_RECEIPT.md` | To be committed |
