# AIP v7.65-D1 OpenClaw Auth Security Boundary

**Phase:** v7.65-D1
**Status:** BLUEPRINT ONLY — security contract
**Type:** Security boundary specification

---

## 1. Threat Model

| Threat | Severity | Mitigation |
|---|---|---|
| Token leaked via UI logging | High | Never log token to console, report, or git |
| Token stored in localStorage | High | Use session-only storage (component state / sessionStorage) |
| Token visible in URL params | High | Use POST body, never GET query params |
| Token visible in plaintext input | Medium | Use `<input type="password">` with masking |
| Token submitted to git | High | No token written to source files; `.env.local` is in `.gitignore` |
| Token exfiltrated via XSS | Medium | Session-only JWT; OpenClaw token is server-side after API call |
| CSRF on token endpoints | Medium | JWT-protected endpoints (except intended public paths) |
| Brute-force JWT login | Low | Rate limiting (future); existing SHA-256 hashing |

---

## 2. Token Storage Strategy

### 2a. JWT Token (Web UI Session)

| Storage | Decision | Rationale |
|---|---|---|
| `sessionStorage` | ✅ Preferred for JWT | Cleared on tab close; survives F5 refresh |
| `localStorage` | ❌ Never | Persists after browser close — unnecessary exposure |
| In-memory React state | ✅ Combined approach | AuthContext holds the JWT; optionally backed by sessionStorage |
| `document.cookie` | ❌ Not used | AIP does not use cookie-based auth; would require backend changes |
| `httpOnly cookie` | ❌ Out of scope | Requires server-set cookie on login; architectural shift |

### 2b. OpenClaw Heartbeat Token

| Storage | Decision | Rationale |
|---|---|---|
| Browser memory (React state) | ✅ During input | Held in `useState` until POST to server |
| Server `process.env` | ✅ After POST | Existing behavior — `POST /api/openclaw/token` sets `process.env` |
| DB `openclaw_config` | ✅ Existing persistence | Restored at startup |
| `localStorage` / `sessionStorage` | ❌ Never | Token lives server-side after submission |
| Source code / `.env.local` | ❌ Never | `.env.local` is developer-managed, not UI-writable |

### 2c. What Gets Stored Where

| Data | Storage Location | Duration |
|---|---|---|
| JWT token | Frontend: `sessionStorage` + React context | Until tab close or logout |
| JWT user info | React context | Until refresh |
| OpenClaw token (input) | React `useState` | Until POST completes, then cleared |
| OpenClaw token (configured flag) | React context | Until refresh |
| OpenClaw token (actual value) | Server `process.env` (+ DB) | Runtime + across restarts |

---

## 3. Token Handling Rules

### 3a. Input Rules

| Rule | Implementation |
|---|---|
| Always masked | `<input type="password">` with `autoComplete="off"` |
| No plaintext echo | Never display token in UI after submission |
| No copy-to-clipboard | Never offer copy button for token |
| Clear on blur (optional) | Clear input value after successful verification |
| Max length | Limit to 4096 characters (prevent DOS) |

### 3b. API Rules

| Rule | Implementation |
|---|---|
| POST only for token | Never GET query params |
| No token in response body | `POST /api/openclaw/token` response: `{ ok: true }` — no echo |
| No token in error messages | Return generic errors: "验证失败", not "invalid token: abc123" |
| No token in server logs | Server must sanitize token before logging |
| No token in report | External report/receipt must explicitly exclude token values |
| Token endpoint is JWT-protected | Only authenticated users can set token (except public paths) |

### 3c. Frontend Rules

| Rule | Implementation |
|---|---|
| No `console.log(token)` | Never log token in browser console |
| No `localStorage.setItem('token', ...)` | Use `sessionStorage` for JWT only; never for OpenClaw token |
| No URL params | Never pass token via `?token=...` |
| No analytics/external calls | Never send token to external services |
| Clear on logout | Clear `sessionStorage` and React state on logout |

### 3d. Git Rules

| Rule | Implementation |
|---|---|
| `.env.local` is in `.gitignore` | ✅ Already configured |
| No token in source code | Enforced by code review |
| No token in doc examples | Use placeholder `replace-with-strong-token` |
| `secret:scan` script | Already exists — run before commit |

---

## 4. Security Boundary Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Frontend)                   │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │ AuthContext   │    │ Token Input  │                   │
│  │ (React state) │    │ (masked pwd) │                   │
│  │              │    │              │                   │
│  │ JWT: session │    │ Token: state │                   │
│  │ Storage      │    │ only, cleared│                   │
│  │              │    │ after POST   │                   │
│  └──────┬───────┘    └──────┬───────┘                   │
│         │                   │                           │
│         │ fetch()          │ fetch()                    │
│         │ POST /auth/login │ POST /openclaw/token       │
│         ▼                   ▼                           │
├─────────────────────────────────────────────────────────┤
│                  HTTP (localhost:8787)                   │
├─────────────────────────────────────────────────────────┤
│                    Server (Backend)                      │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │ JWT Verify   │    │ process.env  │                   │
│  │ (24h expiry) │    │ HB_TOKEN     │                   │
│  │              │    │              │                   │
│  └──────┬───────┘    └──────┬───────┘                   │
│         │                   │                           │
│         ▼                   ▼                           │
│  ┌─────────────────────────────────────┐                │
│  │     DB (openclaw_config)           │                │
│  │  Token persisted across restarts   │                │
│  └─────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Verification Checklist (for implementation phase)

| # | Check | Method |
|---|---|---|
| 1 | Token never appears in `localStorage` | DevTools → Application → Local Storage |
| 2 | Token never appears in sessionStorage | DevTools → Application → Session Storage (JWT is expected here) |
| 3 | Token input is masked | Visual inspection |
| 4 | Token not visible in network response | Network tab → check `/api/openclaw/token` response body |
| 5 | Token not visible in console | `console.log` audit |
| 6 | Token not visible in server logs | Server log audit |
| 7 | Token not visible in git diff | `git diff --check` |
| 8 | Token cleared on "清除" action | Functional test |
| 9 | 401 returns `_unauthorized` | Functional test |
| 10 | Secret scan passes | `pnpm run secret:scan` |
