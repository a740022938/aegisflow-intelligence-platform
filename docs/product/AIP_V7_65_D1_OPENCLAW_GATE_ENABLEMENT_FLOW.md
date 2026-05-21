# AIP v7.65-D1 OpenClaw Gate Enablement Flow

**Phase:** v7.65-D1
**Status:** BLUEPRINT ONLY — no implementation
**Type:** Gate enablement flow specification

---

## 1. Current State

```
POST /api/openclaw/master-switch  →  403 "Stage C is not enabled"
```

The master switch is currently **hard-blocked** at the API level. The frontend (Module Center) attempts to toggle it but receives a 403 that is not surfaced meaningfully to the user.

---

## 2. Proposed Gate Enablement Flow

### 2a. Gate Prerequisites

Before the master switch can be enabled, ALL of these conditions must be met:

| # | Condition | Check Method | Current Status |
|---|---|---|---|
| 1 | OpenClaw heartbeat token configured | `GET /api/openclaw/master-switch` → `tokenConfigured` | Depends on env/DB |
| 2 | OpenClaw instance is online | Heartbeat received within timeout window | Depends on OpenClaw running |
| 3 | User has JWT session (authenticated) | JWT present and valid | Depends on login |
| 4 | User confirms with risk acknowledgment | Secondary confirmation dialog | Not yet implemented |
| 5 | Stage C remains disabled | Hard boundary — NO Stage C dependency | ✅ Disabled |

**Key principle:** Token configured + OpenClaw online + user confirmation = master switch can open, WITHOUT Stage C. The current 403 ("Stage C is not enabled") should be relaxed to allow master-switch POST when token and connectivity are verified.

### 2b. Flow Diagram

```
User sees master-switch in OFF state
        │
        ▼
┌───────────────────────────────┐
│  Check prerequisites:         │
│  • Token configured?          │
│  • OpenClaw online?           │
│  • User authenticated?        │
└───────────────────────────────┘
        │
        ├── Any missing ──► Show specific guidance:
        │                    • "请先配置 Token" → show token input
        │                    • "OpenClaw 未连接" → show start guidance
        │                    • "请先登录" → show login prompt
        │                    Switch remains DISABLED
        │
        └── All met ──► Show switch as ENABLED (clickable)
                             │
                             ▼
              ┌───────────────────────────────┐
              │  Risk Acknowledgment Dialog   │
              │                               │
              │  ⚠️ 开启 OpenClaw 总闸后：     │
              │  • OpenClaw 可以发送命令到 AIP  │
              │  • 插件可以调用外部工具          │
              │  • 建议仅在可信网络中使用        │
              │                               │
              │  [取消]     [确认开启]          │
              └───────────────────────────────┘
                             │
                    Confirm? │
                             ▼
              ┌───────────────────────────────┐
              │  POST /api/openclaw/          │
              │       master-switch {enable}   │
              │                               │
              │  Response:                    │
              │  { ok: true,                  │
              │    masterSwitchEnabled: true } │
              └───────────────────────────────┘
                             │
                             ▼
              Switch shows ON state
              Status: "OpenClaw 总闸已开启"
```

### 2c. UX States for Master-Switch

| State | Switch | Token Status | Connectivity | User Action |
|---|---|---|---|---|
| Token not configured | Disabled (grayed) | ❌ 未配置 | — | "请先配置 Token" prompt |
| OpenClaw offline | Disabled (grayed) | ✅ 已配置 | ❌ 离线 | "OpenClaw 未连接 / 请先启动" |
| Token + online, user not authenticated | Disabled (grayed) | ✅ 已配置 | ✅ 在线 | "请先登录" |
| All prerequisites met | Clickable (blue) | ✅ 已配置 | ✅ 在线 | Click to open |
| Switch ON | ON (green) | ✅ 已配置 | ✅ 在线 | Show "已开启"; offer "关闭" |

---

## 3. Proposed API Changes

### 3a. Relax POST /api/openclaw/master-switch

Current behavior: Returns 403 unconditionally.

Proposed behavior:

```ts
app.post('/api/openclaw/master-switch', async (request, reply) => {
  // Require JWT auth
  try { await request.jwtVerify(); } catch {
    return reply.code(401).send({ ok: false, error: 'unauthorized' });
  }

  const tokenConfigured = !!String(process.env.OPENCLAW_HEARTBEAT_TOKEN || '').trim();
  if (!tokenConfigured) {
    return reply.code(400).send({ ok: false, error: 'OpenClaw token not configured' });
  }

  // Check OpenClaw is reachable (has recent heartbeat)
  const online = checkOpenClawOnline();
  if (!online) {
    return reply.code(400).send({ ok: false, error: 'OpenClaw is not online' });
  }

  // Allow enable/disable
  const { enabled } = request.body as { enabled: boolean };
  // ... update master switch state ...

  return { ok: true, masterSwitchEnabled: enabled };
});
```

### 3b. Risk Acknowledgment

The risk acknowledgment is a **frontend-only UX requirement**. The POST should include a flag:

```ts
const body = request.body as { enabled: boolean; riskAcknowledged: boolean };
if (enabled && !body.riskAcknowledged) {
  return reply.code(400).send({ ok: false, error: 'risk_not_acknowledged' });
}
```

---

## 4. OpenClaw Not Running — UX Treatment

When OpenClaw is not running:

### 4a. Token Input Area

```
┌─────────────────────────────────────────────┐
│  OpenClaw Heartbeat Token                   │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ •••••••••••••••••••••••••••••••    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  [验证连接]                                  │
│                                             │
│  ⏳ OpenClaw 未连接                          │
│  ┌─────────────────────────────────────┐    │
│  │ 请先启动 OpenClaw：                   │    │
│  │                                     │    │
│  │ 1. 确认 OpenClaw 服务已运行           │    │
│  │ 2. 检查 OPENCLAW_BASE_URL 配置       │    │
│  │    (当前: http://127.0.0.1:18789)   │    │
│  │ 3. Token 验证需要 OpenClaw 在线       │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### 4b. Master-Switch Area

```
┌─────────────────────────────────────────────┐
│  OpenClaw 总闸                               │
│                                             │
│  🔴 总闸状态: 关闭                           │
│  ⚠️  OpenClaw 未连接 / 请先启动 OpenClaw     │
│                                             │
│  [开启总闸 (disabled)]                       │
└─────────────────────────────────────────────┘
```

### 4c. Module Center / Plugin Pool

```
┌─────────────────────────────────────────────┐
│  ⚠️  OpenClaw 未连接                         │
│                                             │
│  部分功能需要 OpenClaw 服务运行：              │
│  • 插件激活需要 OpenClaw 在线                 │
│  • OpenClaw 总闸需要在连接后配置              │
│                                             │
│  📋 检查项：                                 │
│  • OpenClaw 服务是否已启动?                   │
│  • OPENCLAWBASE_URL 配置是否正确?             │
│  • 网络连接是否正常?                          │
└─────────────────────────────────────────────┘
```

---

## 5. State Machine

```
                    ┌─────────────┐
                    │ UNKNOWN     │
                    │ (initial)   │
                    └──────┬──────┘
                           │ GET /api/openclaw/master-switch
                           ▼
              ┌─────────────────────────┐
              │   DISCONNECTED          │
              │   OpenClaw not running  │
              │   Token may be set      │
              └─────────────────────────┘
                           │ User starts OpenClaw
                           ▼
              ┌─────────────────────────┐
              │   CONNECTED_NO_TOKEN    │
              │   OpenClaw online       │
              │   Token NOT configured  │
              └─────────────────────────┘
                           │ User sets token
                           ▼
              ┌─────────────────────────┐
              │   CONNECTED_TOKEN_SET   │
              │   OpenClaw online       │
              │   Token configured      │
              │   Switch OFF            │
              └─────────────────────────┘
                           │ User confirms risk + enables
                           ▼
              ┌─────────────────────────┐
              │   MASTER_SWITCH_ON      │
              │   OpenClaw online       │
              │   Token configured      │
              │   Switch ON             │
              └─────────────────────────┘
                           │ User disables
                           ▼
              ┌─────────────────────────┐
              │   CONNECTED_TOKEN_SET   │
              │   (Switch OFF again)    │
              └─────────────────────────┘
```

---

## 6. Dependency Map

```
Token Input UX  ──────────►  AuthContext  ◄──────────  Plugin Pool
       │                          │                      Module Center
       │                          │
       ▼                          ▼
POST /api/openclaw/token    GET /api/auth/status
       │                          │
       ▼                          ▼
process.env.HB_TOKEN     Master Switch Status
       │                          │
       ▼                          ▼
Heartbeat Route Auth     POST /api/openclaw/master-switch
                               │
                               ▼
                          Gate Enablement Flow
                          (risk acknowledgment required)
```

## 7. Recommendation

1. First implement `AuthContext` + topbar status + `/api/auth/status` (P1)
2. Then implement token input in Module Center + Plugin Pool (P2-P3)
3. Then relax master-switch POST to remove Stage C dependency (P5)
4. All changes must pass security boundary verification
