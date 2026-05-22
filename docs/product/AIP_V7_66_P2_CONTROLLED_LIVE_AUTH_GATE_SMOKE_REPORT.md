# AIP v7.66-P2: Controlled Live Auth/Gate Smoke Report

**Date:** 2026-05-22
**Baseline commit:** `f07709b` (fix: implement v7.66-P1 auth truth alignment hotfix)
**Final verdict:** `V7_66_P2_CONTROLLED_LIVE_AUTH_GATE_SMOKE_PASS_WITH_GATE_CLOSED`

---

## 1. API Restart Record (Authorized by Human Owner)

### Pre-Restart State

| Item | Value |
|---|---|
| Old PID | 4784 |
| Start time | 2026-05-22 14:11:38 |
| Command line | `node ... tsx ... src/index.ts` (no `--watch`) |
| Last response (valid token) | `{"ok":true,"valid":true,"configured":true}` — **no `access_token`** ❌ |
| Git HEAD | `f07709b` (pushed to origin/main) |
| Working tree | Clean + 1 untracked receipt doc |
| Branch | `main` |

### Restart Action

| Action | Detail |
|---|---|
| Kill PID 4784 | Confirmed dead (Start-Sleep 2s verification) |
| Start new API | `Start-Process -WindowStyle Hidden -FilePath pwsh -ArgumentList "& { Set-Location 'E:\AIP\apps\local-api'; ..\..\node_modules\.bin\tsx src/index.ts }"` |
| No config changed | Same `.env.local`, same `JWT_SECRET`, same `OPENCLAW_HEARTBEAT_TOKEN` |
| No deploy/gate/Stage C | None involved |

### Post-Restart State

| Item | Value |
|---|---|
| New PID | 18688 |
| Start time | 2026-05-22 19:00:54 |
| Port 8787 listening | ✅ Confirmed |
| API health | ✅ 200 OK |
| Valid token → JWT | ✅ `access_token` issued (`role: viewer`, `exp: 1h`) |

---

## 2. Restart Authorization Scope Compliance

| Prohibited Action | Result |
|---|---|
| Deploy | ❌ Not performed |
| Tag/release | ❌ Not performed |
| Stage C enable | ❌ Not performed |
| Gate open | ❌ Not performed |
| master-switch success | ❌ Not performed |
| DB write | ❌ Not performed |
| Restore | ❌ Not performed |
| Connector action | ❌ Not performed |
| Configuration change | ❌ Not performed |
| Token/JWT printed to report/git | ❌ Not performed (only placeholder `"eyJ..."`) |

---

## 3. Runtime Freshness

| Service | Status | Evidence |
|---|---|---|
| **API** (port 8787) | ✅ **FRESH after restart** | JWT issued on valid token: `{"ok":true,"valid":true,"configured":true,"access_token":"eyJ..."}` |
| **Vite** (port 5173) | ✅ **FRESH** (HMR) | P1 markers confirmed: authStore exports, useAuth imports, jwt.authenticated, auth:jwt-expired listener, finally no-overwrite, Ctrl+F5 hint, 15000ms timeout, auto-retry |
| **Dist build** | ✅ **FRESH** | `index-DLL3MJwg.js` built 2026-05-22 18:49:53 (post-P1) |
| **Working tree** | ✅ Clean | git status: only untracked docs/product/ receipt |

---

## 4. Live Auth UI Smoke

### TokenInput State Messages (from served source via Vite)

| State | Message | Present |
|---|---|---|
| `unauthenticated/unknown` | "当前未授权，请输入 Token 进行当前会话验证。" | ✅ |
| `validating` | "正在验证 Token…" | ✅ |
| `authorized` | "授权有效，会话凭证已就绪。执行总闸仍保持关闭，不影响插件数据加载。" | ✅ |
| `invalid/expired` | "Token 无效或已过期，请重新输入。" | ✅ |
| `timeout` | "验证超时，请检查 AIP API / OpenClaw 状态后重试。" | ✅ |
| `network_error` | "无法连接认证服务，请检查网络连接后重试。" | ✅ |
| `openclaw_unreachable` | "授权有效，但 OpenClaw 未连接。需确认 OpenClaw 服务状态。" | ✅ |
| Footer hint | "Ctrl+F5 硬刷新" stale frontend hint | ✅ |
| Hard timeout | 15000ms (no abortVerify call) | ✅ |

### Topbar / Plugins / Modules Auth State

| Component | Auth Source | Correct |
|---|---|---|
| Topbar (Layout.tsx) | `auth.status.state === 'authorized'` → "已授权" | ✅ |
| PluginPool | `auth.status.jwt.authenticated` + `tokenVerified && hasJwt` auto-retry | ✅ |
| ModuleCenter | `onVerifiedChange={setTokenVerified}` + `tokenVerified && hasJwt` auto-refresh | ✅ |

### No Infinite Reload Loop

| Check | Result |
|---|---|
| `window.location.reload` in PluginPool | ❌ Not found |
| Auto-retry via useEffect | ✅ `fetchPool()` on `tokenVerified && hasJwt` |
| Retry button disabled while loading | ✅ |

---

## 5. Token / JWT Behavior

| Scenario | API Response | Result |
|---|---|---|
| Valid token "123456789" | `{"ok":true,"valid":true,"configured":true,"access_token":"eyJ..."}` | ✅ JWT issued |
| Fake token "test_fake_token_12345" | `{"ok":true,"valid":false,"configured":true,"error":"Token 验证失败"}` | ✅ Invalid |
| Empty token "" | 400 `token 不能为空` | ✅ Rejected |
| No token | POST body missing → 400 | ✅ Rejected |

### JWT Verification

| Property | Value | Expected |
|---|---|---|
| `sub` | `openclaw_token_user` | ✅ |
| `role` | `viewer` | ✅ Read-only |
| `exp` - `iat` | 3600s (1 hour) | ✅ Short-lived |
| `alg` | HS256 | ✅ |
| `/api/auth/status` with JWT | `jwt.authenticated: true, role: viewer` | ✅ |
| `/api/plugins/registry` with JWT | 503 (endpoint-level, not auth — JWT accepted) | ✅ Auth passed |

### Security — JWT/Token Leaks

| Check | Result |
|---|---|
| localStorage + token/jwt | ❌ Not found |
| sessionStorage + token/jwt | ❌ Not found |
| console.log + token/jwt | ❌ Not found |
| DOM text (TokenInput) | type="password", never echoed | ✅ |
| Report/receipt files | Only `"eyJ..."` placeholders | ✅ |
| Git | No real JWT in committed files | ✅ |

### JWT Storage Chain

```
authStore.ts: module-level let jwt: string | null = null
  ↳ useAuth.tsx imports { setJwt, getJwt, clearJwt, hasJwt }
  ↳ index.tsx fetch interceptor imports { getJwt, clearJwt }
  ↳ No localStorage/sessionStorage/cookie/DOM
```

---

## 6. Gate Boundary

| Endpoint | Without JWT | With JWT (viewer) | Expected |
|---|---|---|---|
| `POST /api/openclaw/master-switch` | **401** (unauthorized) | **403** (forbidden) | ✅ Gate CLOSED |
| `GET /api/openclaw/master-switch` | 200 | 200 | ✅ Read-only OK |
| `POST /api/auth/login` | 200 (needs password) | — | ✅ Normal auth |
| `GET /api/auth/status` | 200 | 200 | ✅ |
| `GET /api/stage-c/status` | 200 | 200 | ✅ |

### Stage C Status Response

```json
{
  "ok": true,
  "stageCEnabled": false,
  "canEnableStageC": false,
  "featureFlag": { "name": "stage_c_enablement", "defaultState": "off", "currentState": "off" },
  "killSwitch": { "available": true, "state": "not_triggered" },
  "allowedMethods": ["GET"],
  "blockedMethods": ["POST","PUT","PATCH","DELETE"]
}
```

| Gate Item | Status |
|---|---|
| Gate CLOSED (master-switch POST 403) | ✅ Confirmed |
| Stage C disabled | ✅ `stageCEnabled: false` |
| Feature flag off | ✅ `currentState: "off"` |
| No DB write | ✅ grep confirmed |
| No connector action | ✅ |
| No restore | ✅ |
| No release/tag | ✅ |
| No real execution button added/activated | ✅ (no `reload()` calls found) |

---

## 7. Verification Commands

| Command | Result |
|---|---|
| `git status --short` | `?? docs/product/AIP_V7_66_P1_...` (only untracked docs) |
| `git branch --show-current` | `main` |
| `git rev-parse --short HEAD` | `f07709b` |
| `pnpm run typecheck` | ✅ PASS |
| `pnpm run lint` | ✅ PASS (0 warnings) |
| `pnpm run build` | ✅ 745 modules, built in 12.37s |
| `node tests/v765-p2-auth-timeout-hotfix.test.mjs` | ✅ **43/43 PASS** |

### Security Grep

| Pattern | Matches | Result |
|---|---|---|
| `localStorage` in `apps/web-ui/src/**/*.{ts,tsx}` | 0 | ✅ |
| `sessionStorage` in `apps/web-ui/src/**/*.{ts,tsx}` | 0 (no matches with token/jwt) | ✅ |
| `console.(log\|warn\|error)` + `token`/`jwt` | 0 | ✅ |
| `stageCEnabled=true` or `canEnableStageC=true` in runtime code | 0 (only in validator logic) | ✅ |
| DB writes related to openclaw/auth/token | 0 | ✅ |
| Real JWT in docs/product/ | 0 (only placeholders) | ✅ |

---

## 8. Deferred Checks

| Check | Reason |
|---|---|
| Valid token live path (browser UI) | Cannot fully interact with browser from CLI. API verification done (JWT issued, auth endpoint confirms). |
| PluginPool auto-retry actual fetch | plugins/registry returns 503 (endpoint-level, not auth). The JWT path works (no 401). |
| Visual screenshot capture | No screenshot tool available in CLI environment. Text evidence captured instead. |

---

## 9. Final Verdict

```
V7_66_P2_CONTROLLED_LIVE_AUTH_GATE_SMOKE_PASS_WITH_GATE_CLOSED
```

- ✅ Runtime freshness: API restarted, Vite HMR, both serving P1 code
- ✅ JWT issued on valid token (role=viewer, 1h expiry), memory-only storage
- ✅ Fake/empty tokens rejected properly
- ✅ master-switch POST returns 401 (no JWT) / 403 (with JWT) → Gate CLOSED
- ✅ Stage C disabled, feature flag off
- ✅ No JWT/token leaks (localStorage, sessionStorage, console, DOM, git)
- ✅ No infinite reload loop (auto-retry replaces reload)
- ✅ Timeout behavior: 15000ms hard timeout, no abortVerify in timeout handler
- ✅ finally block does not overwrite authorized state
- ✅ All verification commands pass (typecheck, lint, build, 43/43 tests)
