# AIP v7.65-D1 OpenClaw Token Auth UX Blueprint

**Phase:** v7.65-D1
**Status:** BLUEPRINT ONLY — no implementation
**Type:** Design contract / product specification

---

## 1. Problem Statement

Users currently see these auth failures in the UI with no actionable path:

> "当前身份信息已过期或不可用" (Module Center)
> "Plugin Pool 当前无法读取插件状态" (Plugin Pool)
> "OpenClaw 总闸无法开启" (System Panel / Dashboard)
> "需要 API token / OPENCLAW_HEARTBEAT_TOKEN" (Plugin Pool)

There is **no interactive token input UI**. The only guidance is static text:
- "Login at POST /api/auth/login"
- "Or configure OPENCLAW_HEARTBEAT_TOKEN in .env.local"

This requires users to know about CLI tools or manually edit env files — neither is acceptable for a production UX.

---

## 2. Current Auth Infrastructure (As-Is)

AIP has two parallel auth mechanisms:

### 2a. JWT Auth (Web UI User Sessions)

| Component | Detail |
|---|---|
| Login endpoint | `POST /api/auth/login` — accepts `{ username, password }`, returns JWT |
| Token type | JWT, signed with `JWT_SECRET` env var |
| Expiry | 24h (`expiresIn: '24h'`) |
| Enforcement | Global `onRequest` hook on all `/api/*` paths |
| Public bypass | Whitelisted paths: `/api/health`, `/api/auth/login`, `/api/openclaw/heartbeat`, etc. |
| Middleware | `authMiddleware` provides `authenticate` + `requireRole` decorators |
| Role hierarchy | `admin > operator > editor > viewer` (defined in `auth/index.ts`) |
| Default seed | Admin account `admin` / `aip-admin` |

### 2b. OpenClaw Token Auth (Machine-to-Machine)

| Component | Detail |
|---|---|
| Env vars | `OPENCLAW_HEARTBEAT_TOKEN`, `OPENCLAW_ADMIN_TOKEN` |
| Persistence | Stored in `openclaw_config` DB table, restored at startup |
| Runtime set | `POST /api/openclaw/token` — sets `process.env.OPENCLAW_HEARTBEAT_TOKEN` |
| Validation | `matchesAdminToken()` checks `x-openclaw-admin-token` / `x-openclaw-token` headers |
| Heartbeat routes | Public (no JWT), but validate `x-openclaw-token` |
| Bridge routes | Use `matchesAdminToken()` for all calls from OpenClaw → AIP |

### 2c. Master-Switch

| Component | Detail |
|---|---|
| GET | Returns full status: enabled, token_configured, heartbeat status, circuit state, online status |
| POST | **BLOCKED** — returns 403 "Stage C is not enabled" |
| Frontend | Module Center tries to toggle but always fails silently |

### 2d. Frontend Auth Detection

| Mechanism | Location |
|---|---|
| Global `fetch` override | `index.tsx` — returns `{ _unauthorized: true }` on 401 |
| Axios interceptor | `services/api.ts` — same pattern |
| Per-page check | ModuleCenter: `checkAuth()` marks `unauthorized` state |
| AuthRequiredState | Reusable component showing static instructions only |

---

## 3. Proposed UX (To-Be)

### 3a. Token Input Entry Points

**Primary entry: Unified connection status in topbar**
Add an auth status indicator in the topbar (right side, next to API health dot):
- 🔴 "未认证" → links to auth dialog/panel
- 🟢 "已认证" → shows identity info (username/role)
- 🟡 "Token 未配置" → links to token setup

**Secondary entries (inline context):**
- Module Center: Replace the static warning card with an inline "配置 Token" button
- Plugin Pool: Replace `AuthRequiredState` static instructions with an inline token input
- System Details modal: Add "配置 OpenClaw Token" action

**Dedicated page: Authorization Center**
Single page `/authorization-center` with:
- JWT login form (username + password, masked password)
- OpenClaw token input (masked, session-only)
- Connection test button
- Status display (auth state, expiry, OpenClaw connectivity)

### 3b. Token Input Component Design

```
┌─────────────────────────────────────────────┐
│  OpenClaw Heartbeat Token                   │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ •••••••••••••••••••••••••••••••    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [验证连接]      [清除 Token]               │
│                                             │
│  Status: ✅ 已授权 (已验证通过)               │
│  or: ❌ Token 无效或已过期                   │
│  or: ⏳ OpenClaw 未连接 / 请先启动 OpenClaw │
└─────────────────────────────────────────────┘
```

- Input is `<input type="password">` — always masked
- No plaintext display anywhere in UI
- Value stored in React state (component memory) only
- On "验证连接" click → call `POST /api/openclaw/token` then `GET /api/openclaw/master-switch` to verify
- On "清除 Token" → call API to clear, clear local state
- Token is sent to server via API — never logged, never stored in localStorage

### 3c. Auth Status Store (Shared State)

Create a lightweight React context `AuthContext`:

```ts
interface AuthState {
  jwtToken: string | null;          // JWT from /api/auth/login
  openclawToken: boolean;           // whether heartbeat token is configured
  openclawOnline: boolean | null;   // null = unknown
  masterSwitchEnabled: boolean;
  user: { username: string; role: string; displayName: string } | null;
  lastVerified: number | null;      // timestamp
}
```

- Context wraps the entire app (in `App.tsx` or `Layout.tsx`)
- Provides `useAuth()` hook for any component
- On mount: check `GET /api/openclaw/master-switch` to hydrate status
- On JWT login: store JWT in `sessionStorage` (NOT localStorage)
- On OpenClaw token set: update `openclawToken` flag only (actual token is server-side)
- `AuthProvider` handles periodic re-verification (every 5 min)

### 3d. Sharing Between Plugin Pool and Module Center

Both components consume `useAuth()` from `AuthContext`:
- If `openclawToken === false` → show token input prompt
- If `jwtToken === null` → show login prompt
- If both configured → show normal content
- No duplicated auth state — single source of truth

---

## 4. Proposed API Contract

### 4a. New or Modified Routes

| Method | Path | Purpose | Auth |
|---|---|---|---|
| GET | `/api/auth/status` | Return current auth state (token configured, jwt user info, OpenClaw status) | Public (no JWT) |
| POST | `/api/openclaw/token` | Already exists — set heartbeat token at runtime | JWT required |
| DELETE | `/api/openclaw/token` | Clear heartbeat token from runtime | JWT required |
| POST | `/api/auth/login` | Already exists — JWT login | Public |
| POST | `/api/auth/logout` | Clear server-side session (if any) | JWT required (optional) |

### 4b. GET /api/auth/status Response (New)

```json
{
  "ok": true,
  "jwt": {
    "authenticated": false,
    "username": null,
    "role": null
  },
  "openclaw": {
    "tokenConfigured": true,
    "online": true,
    "masterSwitchEnabled": false,
    "lastHeartbeatAt": "2026-05-22T10:00:00Z"
  }
}
```

---

## 5. Implementation Order (Future Phases)

| Phase | Scope | Depends On |
|---|---|---|
| P1 | `AuthContext` + topbar status indicator + `/api/auth/status` route | None |
| P2 | Replace Module Center static warning with inline token prompt | P1 |
| P3 | Replace Plugin Pool `AuthRequiredState` with interactive input | P1 |
| P4 | `/authorization-center` dedicated page | P1 |
| P5 | Master-switch UX unlock flow (separate gate design) | OpenClaw gate enablement blueprint |

---

## 6. Open Questions (Deferred)

1. Should JWT auto-refresh before expiry? — Defer, use manual re-login for now.
2. Should OpenClaw token persist across restarts via DB? — Already does (existing behavior).
3. Should there be a "remember me" option for JWT? — No, session-only by default.
4. Should we support multiple OpenClaw endpoints? — No, single endpoint only.
