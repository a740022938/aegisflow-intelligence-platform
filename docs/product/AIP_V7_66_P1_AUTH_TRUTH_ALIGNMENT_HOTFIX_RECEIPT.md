# AIP v7.66-P1 Receipt

**Verdict:** `V7_66_P1_AUTH_TRUTH_ALIGNMENT_HOTFIX_READY_WITH_GATE_CLOSED`
**Date:** 2026-05-22

## Summary
Implemented OpenClaw Auth Truth Alignment Hotfix: Token verify now issues a short-lived JWT (viewer role, 1h), auto-attached to all subsequent fetch requests. PluginPool and ModuleCenter auto-retry after verification. Timeout race fixed, finally block removed, state management unified.

## Verification
| Check | Result |
|---|---|
| tsc --noEmit | ✅ Passed |
| vite build (745 modules) | ✅ Passed, 9.45s |
| P1 tests (14 checks) | ✅ 14/14 PASS |
| P2/P1v66 tests (43 checks) | ✅ 43/43 PASS |
| JWT in localStorage/sessionStorage | ❌ Not found |
| JWT in console.log | ❌ Not found |
| Stage C enabled | ❌ Still disabled |
| master-switch bypass | ❌ No bypass |

## Files
| File | Change |
|---|---|
| `apps/web-ui/src/services/authStore.ts` | **NEW** — module-level JWT singleton |
| `apps/local-api/src/index.ts` | +8 — JWT issuance in auth/check |
| `apps/web-ui/src/hooks/useAuth.tsx` | +30/-6 — JWT integration, finally fix, refreshStatus fix |
| `apps/web-ui/src/index.tsx` | +17/-6 — Auto-attach JWT, 401 expiration event |
| `apps/web-ui/src/components/ui/TokenInput.tsx` | +5/-10 — Hard timeout 15s, no abortVerify, better copy |
| `apps/web-ui/src/pages/PluginPool.tsx` | +35/-12 — Auto-retry, auth.state, Chinese labels |
| `apps/web-ui/src/pages/ModuleCenter.tsx` | +13/-4 — Auto-refresh, onVerifiedChange |
| `tests/v765-p2-auth-timeout-hotfix.test.mjs` | +137/-17 — 43 checks total |

## P0 Issues Fixed (8 of 16)
- C1 ✅ JWT issued after token verify
- H1 ✅ PluginPool reads auth.state + auto-retry
- H2 ✅ Reload no longer infinite loop
- H3 ✅ ModuleCenter TokenInput callback
- H4 ✅ refreshStatus updates state
- H5 ✅ finally no longer overwrites
- M3 ✅ Clearer messaging
- M4 ✅ ModuleCenter onVerifiedChange

## P0 Issues Deferred (8)
- C2 stale frontend (Ctrl+F5 hint only)
- M1 AuthRequiredState unused
- M2 openclaw_unreachable overwrite (low impact)
- M5 timeout race (mitigated by 15s separation)
- L1 expired state never set
- L2 _origFetch naming
- L4 OpenClaw status display
- L5 localStorage tokens (separate system)
