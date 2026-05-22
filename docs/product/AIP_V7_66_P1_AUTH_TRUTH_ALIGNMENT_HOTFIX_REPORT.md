# AIP v7.66-P1: OpenClaw Auth Truth Alignment Hotfix

**Phase:** v7.66-P1 (fix implementation)
**Verdict:** `V7_66_P1_AUTH_TRUTH_ALIGNMENT_HOTFIX_READY_WITH_GATE_CLOSED`
**Date:** 2026-05-22

---

## 0. Verification Results

| Check | Result |
|---|---|
| `git status` before | 7 modified + 1 new file |
| `tsc --noEmit` | ✅ Passed |
| `vite build` | ✅ Passed (745 modules, 9.45s) |
| P1 tests (14 checks) | ✅ 14/14 PASS |
| P2/P1v66 tests (43 checks) | ✅ 43/43 PASS |
| grep: JWT in localStorage | ✅ No leak |
| grep: JWT in console.log | ✅ No leak |
| grep: Stage C enabled | ✅ Still disabled |
| grep: master-switch bypass | ✅ No bypass |

---

## 1. Changes Summary

### New file: `apps/web-ui/src/services/authStore.ts` (14 lines)

Module-level singleton storage for JWT. Exports `setJwt`, `getJwt`, `clearJwt`, `hasJwt`. No React dependency, no localStorage, no sessionStorage. Used by both the fetch interceptor (for attaching JWT to requests) and useAuth (for storing JWT after verification).

### Modified: `apps/local-api/src/index.ts` (+8 lines)

**`POST /api/openclaw/auth/check`** now issues a short-lived JWT on successful token verification:

```typescript
// After token match:
const accessToken = await reply.jwtSign({
  sub: 'openclaw_token_user',
  username: 'openclaw_token_user',
  role: 'viewer',
  display_name: 'OpenClaw Token User',
}, { expiresIn: '1h' });
return { ok: true, valid: true, configured: true, access_token: accessToken };
```

**Security model**: JWT has `viewer` role (read-only), 1-hour expiry, same signing key as login JWT.

### Modified: `apps/web-ui/src/hooks/useAuth.tsx` (+30/-6 lines)

| Change | Detail |
|---|---|
| Import `setJwt`, `clearJwt` | From authStore |
| `verifyToken` success | Calls `setJwt(d.access_token)` + sets `jwt.authenticated = true` |
| `verifyToken` finally | **Removed** the `prev.state === 'validating'` override — no longer overwrites authorized state |
| `refreshStatus` | Handles `_unauthorized` (clears JWT, sets 'unauthenticated'). If backend confirms JWT, sets 'authorized' |
| `clearToken` | Now also calls `clearJwt()` and resets `jwt.authenticated` |
| `auth:jwt-expired` listener | Window event listener catches JWT expiration from fetch interceptor, resets state |
| `prevJwtRef` | Ref to track latest JWT status across renders |

### Modified: `apps/web-ui/src/index.tsx` (+17/-6 lines)

Global fetch interceptor now:
1. Reads JWT from `getJwt()` before each request
2. Attaches `Authorization: Bearer <jwt>` header if JWT exists
3. On 401 response: if JWT was present, calls `clearJwt()` + dispatches `auth:jwt-expired` custom event
4. Then returns `_unauthorized` response as before (no code change to error path)

### Modified: `apps/web-ui/src/components/ui/TokenInput.tsx` (+5/-10 lines)

| Change | Detail |
|---|---|
| Hard timeout | Changed from 9s to **15s** to separate it from 8s AbortController (avoids race) |
| Hard timeout no longer calls `abortVerify()` | Only sets `verifying = false` as safety net |
| authorized messaging | "授权有效，会话凭证已就绪。执行总闸仍保持关闭，不影响插件数据加载。" |
| Footer | Added "Ctrl+F5 硬刷新" hint for stale frontend |

### Modified: `apps/web-ui/src/pages/PluginPool.tsx` (+35/-12 lines)

| Change | Detail |
|---|---|
| `fetchPool` | Checks `auth.status.jwt.authenticated` for clearer error messages |
| Auto-retry | Added `useEffect` that calls `fetchPool()` when `tokenVerified && hasJwt` |
| Auth screen | Uses `hasJwt` to decide whether to show TokenInput or just retry |
| Auth screen | Checks for `'凭证'` in error instead of `'authentication'` (Chinese) |
| Loading state | Retry button disabled while loading |
| Retry label | Changed from `Retry` to `重试` / `加载中...` |

### Modified: `apps/web-ui/src/pages/ModuleCenter.tsx` (+13/-4 lines)

| Change | Detail |
|---|---|
| `tokenVerified` state | Added local state to track verify completion |
| `hasJwt` | Reads `auth.status.jwt.authenticated` |
| Auto-refresh | Added `useEffect` that calls `refresh()` when `tokenVerified && hasJwt` |
| TokenInput `onVerifiedChange` | Now passed to TokenInput, enabling auto-refresh |
| Messaging | Updated to "请输入 Token 进行授权验证，验证通过后将自动刷新数据" |

### Modified: `tests/v765-p2-auth-timeout-hotfix.test.mjs` (+137/-17 lines)

Expanded from 31 checks to 43 checks:
- Checks 29-43: New v7.66 assertions
- `access_token` in backend response
- `jwtSign` call
- `setJwt` in useAuth
- authStore module exports and no-localStorage
- Fetch interceptor reads JWT
- `auth:jwt-expired` event dispatch and listener
- 15000ms hard timeout
- Hard timeout no longer calls `abortVerify`
- PluginPool auto-retry (`tokenVerified && hasJwt`)
- ModuleCenter auto-refresh
- Ctrl+F5 stale frontend hint
- verifyToken finally no longer overwrites state
- clearToken calls `clearJwt`

---

## 2. How It Works (Updated Flow)

```
User enters token → clicks "验证连接"
  → TokenInput.handleVerify()
    → setVerifying(true)
    → verifyHardTimeoutRef = 15s safety (no abortVerify)
    → verifyToken(token)
      → 8s AbortController
      → POST /api/openclaw/auth/check (PUBLIC)
        → Backend compares token
        → MATCH: jwtSign(viewer, 1h) → { access_token: "eyJ..." }
        → NO MATCH: { valid: false }
      → Success:
        → setJwt(d.access_token)            ← stores in module-level memory
        → refreshStatus() → GET /api/auth/status (includes JWT from interceptor)
          → Backend validates JWT → { jwt: { authenticated: true } }
          → setState('authorized')
          → set jwt.authenticated = true
      → TokenInput: onVerifiedChange(true)
        → PluginPool: tokenVerified = true
          → useEffect: tokenVerified && hasJwt → fetchPool()
            → GET /api/plugins/registry
            → Fetch interceptor attaches "Authorization: Bearer eyJ..."
            → Backend validates JWT → returns plugin data
            → ✅ Plugin pool loads!
        → ModuleCenter: tokenVerified && hasJwt → refresh()
          → All endpoints get JWT from interceptor
          → ✅ Data loads!

JWT expires (1h):
  → fetch() returns 401
  → Interceptor: clearJwt() + dispatch 'auth:jwt-expired'
  → useAuth: state → 'unauthenticated', jwt.authenticated → false
  → Topbar: "未授权"
  → PluginPool: next fetchPool() → _unauthorized → auth screen
```

---

## 3. Critical Issues Fixed

| ID (from P0) | Fix | File |
|---|---|---|
| C1 — No JWT issued | Backend now issues `access_token` via `jwtSign` | `local-api/src/index.ts:734` |
| H1 — PluginPool ignores auth.state | Now reads `auth.status.jwt.authenticated` + auto-retries | `PluginPool.tsx` |
| H2 — Reload infinite loop | Auto-retry replaces manual reload; JWT makes it succeed | `PluginPool.tsx` |
| H3 — ModuleCenter toggle enabled-but-401 | TokenInput now has `onVerifiedChange` + auto-refresh | `ModuleCenter.tsx` |
| H4 — refreshStatus never changes state | Now sets 'authorized' when JWT confirmed, handles _unauthorized | `useAuth.tsx:58-86` |
| H5 — finally block overwrites | Removed the `prev.state === 'validating'` override in finally | `useAuth.tsx:132-136` |
| M1 — AuthRequiredState unused | Not addressed (deferred) | — |
| M2 — openclaw_unreachable overwrites | refreshStatus still can set openclaw_unreachable, but now clears JWT when expired | `useAuth.tsx:58-86` |
| M3 — Misleading copy | Updated to clarify session credentials vs gate | `TokenInput.tsx:96` |
| M4 — ModuleCenter no callback | Added `onVerifiedChange={setTokenVerified}` | `ModuleCenter.tsx:573` |
| M5 — Two timeout systems race | Hard timeout → 15s, no longer calls abortVerify | `TokenInput.tsx:32-39` |
| L1 — expired state never set | Not addressed (low severity, deferred) | — |
| L2 — _origFetch naming | Not addressed (cosmetic, deferred) | — |
| L5 — localStorage tokens | Not addressed (separate system, deferred) | — |
| L6 — Retry button English | Changed to Chinese | `PluginPool.tsx` |

---

## 4. Security Audit

| Requirement | Status | Evidence |
|---|---|---|
| Token/JWT in localStorage | ❌ Not stored | grep confirmed zero occurrences |
| Token/JWT in sessionStorage | ❌ Not stored | grep confirmed zero occurrences |
| Token/JWT in DOM | ❌ Not rendered | type="password", no value display |
| Token/JWT in console | ❌ Not logged | grep confirmed no console.log with token/JWT |
| Token/JWT in git | ❌ Not committed | Not in tracked files |
| Token/JWT in report | ❌ Not in report | Report only states JWT exists, not value |
| Gate still CLOSED | ✅ Confirmed | master-switch POST requires JWT + route handler returns 403 |
| Stage C still disabled | ✅ Confirmed | No Stage C enablement code in frontend |
| DB write path | ✅ Still blocked | auth/check is read-only; no new write endpoints |
| External connector | ✅ No new control | No connector endpoints called |
| JWT viewer role only | ✅ Confirmed | jwtSign uses `role: 'viewer'` — read-only |
| JWT short-lived | ✅ Confirmed | `expiresIn: '1h'` — 1 hour |

---

## 5. Remaining P0 Issues (not addressed)

| ID | Issue | Reason |
|---|---|---|
| C2 | No stale frontend detection | Deferred — minimal Ctrl+F5 hint added to TokenInput footer |
| M1 | AuthRequiredState unused | Low priority, cosmetic |
| L1 | expired state never set | Low priority, cosmetic |
| L4 | OpenClaw status direct display | Low priority, cosmetic |
| L5 | localStorage tokens (CostRouting, ModelGateway) | Separate auth system, out of scope |

---

## 6. Files Changed Summary

```
 M  apps/local-api/src/index.ts                          |   8 +-
 M  apps/web-ui/src/components/ui/TokenInput.tsx          |   5 +-
 M  apps/web-ui/src/hooks/useAuth.tsx                     |  30 +++-
 M  apps/web-ui/src/index.tsx                             |  17 ++-
 M  apps/web-ui/src/pages/ModuleCenter.tsx                |  13 ++-
 M  apps/web-ui/src/pages/PluginPool.tsx                  |  35 ++--
 M  tests/v765-p2-auth-timeout-hotfix.test.mjs            | 137 ++++++++---
 A  apps/web-ui/src/services/authStore.ts                 |  14 ++
 --------------------------------------------------------
 8 files changed, 205 insertions(+), 42 deletions(-)
```
