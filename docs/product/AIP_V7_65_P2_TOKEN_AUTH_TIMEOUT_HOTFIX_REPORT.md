# AIP v7.65-P2: Token Auth Timeout Hotfix — Implementation Report

## Summary

Fixed a UI freeze bug where token verification could permanently hang the "验证中..." button when the backend server was unreachable or unresponsive. The root cause was `fetch()` in `verifyToken` lacking any timeout mechanism — if the server never responded, the `finally { setVerifying(false) }` block never executed.

## Changes

### useAuth.tsx
- Added `verifyTokenAbortRef` (AbortController ref) to hold the in-flight controller
- `verifyToken` now creates an `AbortController` with 8-second `setTimeout` abort
- Added `abortVerify()` callback: aborts the controller, resets verifying state, clears ref
- `abortVerify` exposed through `AuthContext` for use by TokenInput and other consumers

### TokenInput.tsx
- Added `mountedRef` (useRef(true)) to guard against `setState` after unmount
- `useEffect` cleanup calls `abortVerify()` + sets `mountedRef.current = false`
- Added two new `AuthState` cases: `timeout` ("验证超时，请检查 AIP API / OpenClaw 状态后重试") and `network_error` ("无法连接认证服务，请检查网络连接后重试")
- Clear button condition changed to `disabled={verifying}` — no longer stuck on the old `state === 'unauthenticated' || state === 'unknown'` guard

### Test coverage (v765-p2-auth-timeout-hotfix.test.mjs, 22 checks)
- AbortController in verifyToken ✅
- 8000ms timeout ✅
- "timeout" / "network_error" in AuthState ✅
- TokenInput displays timeout/network_error messages ✅
- abortVerify exposed from context ✅
- TokenInput calls abortVerify on unmount ✅
- mountedRef prevents setState after unmount ✅
- Clear button not stuck on old condition ✅
- Master-switch still returns 403 ✅

## Security
- Token still never stored in localStorage, DOM text, console, git, or reports
- No new secret scan hits (pre-existing ModelGateway.tsx:59 only)
- No token echo in backend responses
- AbortController timeout is 8000ms — short enough to prevent UX freeze, long enough for normal operation
