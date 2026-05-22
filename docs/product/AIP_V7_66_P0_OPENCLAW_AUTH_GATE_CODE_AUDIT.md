# AIP v7.66-P0: OpenClaw Auth / Gate 真实页面代码摸底审计

**Phase:** v7.66-P0 (read-only audit)
**Verdict:** `V7_66_P0_OPENCLAW_AUTH_GATE_CODE_AUDIT_COMPLETE_NO_SOURCE_CHANGE`
**Date:** 2026-05-22

---

## 0. Verification Results

| Check | Result |
|---|---|
| `git status` before | ✅ Clean — only untracked P5A report |
| `git status` after | ✅ Clean — no source changes |
| `git diff` | ✅ No diff |
| `tsc --noEmit` | ✅ Passed (no errors) |
| `vite build` | ✅ Passed (744 modules, 9.71s) |
| Token leak grep | ✅ No OpenClaw Token in localStorage/DOM/console |
| Stage C / master-switch grep | ✅ No accidental enablement |
| Working tree | ✅ Clean (except P5A report, which is read-only) |

---

## 1. 涉及文件清单（更新版）

| # | 文件 | 角色 | 行数 |
|---|---|---|---|
| 1 | `apps/web-ui/src/pages/PluginPool.tsx` | 插件池页面 | 844 |
| 2 | `apps/web-ui/src/components/ui/TokenInput.tsx` | Token 输入组件 | 177 |
| 3 | `apps/web-ui/src/hooks/useAuth.tsx` | AuthProvider / AuthContext + verifyToken | 152 |
| 4 | `apps/web-ui/src/App.tsx` | 路由入口 + AuthProvider 包裹 | 242 |
| 5 | `apps/web-ui/src/pages/ModuleCenter.tsx` | 模块中心页 | 617 |
| 6 | `apps/web-ui/src/components/ui/AuthRequiredState.tsx` | 通用认证提示组件（**未使用**） | 41 |
| 7 | `apps/web-ui/src/components/Layout.tsx` | Topbar auth 指示器 + 系统面板 | 455 |
| 8 | `apps/web-ui/src/index.tsx` | 全局 fetch 拦截器（401→`_unauthorized`） | 46 |
| 9 | `apps/web-ui/src/services/api.ts` | axios 拦截器（同 _unauthorized） | 1339 |
| 10 | `apps/web-ui/src/constants/appVersion.ts` | APP_VERSION = v7.62.0（硬编码常量） | 2 |
| 11 | `apps/local-api/src/index.ts` | 后端 Fastify 路由 | 4411 |
| 12 | `apps/local-api/src/auth/index.ts` | 后端 auth 路由 + JWT 验证 | 143 |

---

## 2. Auth 状态模型

### 2.1 `AuthState` 类型定义（`useAuth.tsx:3`）

```typescript
type AuthState = 'unknown' | 'unauthenticated' | 'validating' | 'authorized'
  | 'invalid' | 'expired' | 'timeout' | 'network_error' | 'openclaw_unreachable';
```

共 9 种状态。其中 `expired` 被定义但从未在 verifyToken 中被设置（只出现在 TokenInput.stateText 的 case 中）。

### 2.2 `AuthContextValue`（`useAuth.tsx:26-31`）

```typescript
interface AuthContextValue {
  status: AuthStatus;
  verifyToken: (token: string) => Promise<boolean>;
  clearToken: () => void;
  abortVerify: () => void;
  refreshStatus: () => Promise<void>;
}
```

### 2.3 `AuthStatus`（`useAuth.tsx:18-24`）

```typescript
interface AuthStatus {
  state: AuthState;
  jwt: JwtStatus;
  openclaw: OpenClawStatus;
  lastVerified: number | null;
  verifiedToken: boolean;
}
```

---

## 3. 状态流分析

### 3.1 页面加载 → Auth 状态流

```
App mount
  → <AuthProvider> 包裹全局 (App.tsx:130)
    → AuthProvider 内部 useEffect 调用 refreshStatus() (useAuth.tsx:79-83)
      → fetch GET /api/auth/status (PUBLIC)
      → 后端返回: jwt(authenticated=false) + openclaw({tokenConfigured, online, masterSwitchEnabled})
      → setStatus: jwt + openclaw 字段更新, state 不变 (仍是 'unknown')
    → 每 5 分钟重复 refreshStatus

PluginPool 组件挂载 (PluginPool.tsx:194)
  → useEffect fetchPool()
  → fetch GET /api/plugins/registry (需要 JWT, 不在 PUBLIC_PATHS)
  → JWT 中间件 → 401
  → fetch 拦截器 → 200 {_unauthorized: true}
  → d?._unauthorized === true → setItems([]) + setLoadError('API requires authentication...')
  → 渲染: loadError && items.length === 0 → auth screen

ModuleCenter 组件挂载 (ModuleCenter.tsx:218)
  → useEffect refresh()
  → 7 个 Promise.allSettled (master-switch, plugins/pool 等全部需要 JWT)
  → 全部返回 _unauthorized
  → checkAuth 设置 unauthorized = true
  → 显示 TokenInput

TokenInput 渲染 (PluginPool.tsx:453 或 ModuleCenter.tsx:573)
  → 用户输入 token → handleVerify
  → verifyToken
  → POST /api/openclaw/auth/check (PUBLIC)
  → 后端: token === OPENCLAW_HEARTBEAT_TOKEN?
    → 是: { ok: true, valid: true, configured: true }
    → 否: { ok: true, valid: false, configured: true, error: 'Token 验证失败' }
  → setStatus(state='authorized' 或 'invalid')
  → onVerifiedChange(ok)
  → PluginPool: tokenVerified = ok
```

### 3.2 状态转移矩阵

| 操作 | 输入 | 输出 AuthState | 输出 Verdict |
|---|---|---|---|
| 初始加载 | — | `unknown` | 默认 |
| refreshStatus 完成 | — | `unknown` | state 不变！只更新 jwt/openclaw 元数据 |
| verifyToken 发出 | POST 请求发出 | `validating` | 计时器启动 |
| verifyToken 成功 | token 匹配 | `authorized` | ✅ 验证通过 |
| verifyToken 失败 | token 不匹配 | `invalid` | ❌ Token 无效 |
| verifyToken AbortError | 超时 (8s) | `timeout` | ⏰ 超时 |
| verifyToken 网络错误 | 网络不可达 | `network_error` | 🌐 网络错误 |
| verifyToken 异常 | 任意异常 | `timeout` (finally) | ⚠️ 异常兜底 |
| clearToken | — | `unauthenticated` | 重置 |
| refreshStatus 检测到 OpenClaw offline | authorized+offline | `openclaw_unreachable` | 状态降级 |
| verifyToken finally 块 | state 仍为 validating | `timeout` | 安全兜底 |

### 3.3 关键 Bug: verifyToken finally 块状态覆盖

**文件**: `useAuth.tsx:127`

```typescript
} finally {
  ...
  setStatus(prev => prev.state === 'validating'
    ? { ...prev, state: 'timeout', verifiedToken: false }
    : prev);
}
```

**风险**: 当 `verifyToken` 成功路径正确将 state 设为 `'authorized'` 后，此 finally 块使用 functional updater。虽然 React 18 保证功能性 updater 读到最新状态（`prev.state` 应为 `'authorized'`），但如果有多个 React 批处理周期或极端并发情况，理论上 finally 块仍可能在 success setStatus 之前执行。不过由于 React 18 自动批处理和 functional updater 特性，此风险极低。

**更高风险**: 如果成功路径中的 `await refreshStatus()` 抛出异常（虽然当前代码不会，因为它内部有 try/catch），`setStatus` 到 `'authorized'` 不会执行，然后 finally 块将状态设置为 `'timeout'`，导致有效的 token 被报告为超时。

---

## 4. 状态源分析：多个状态源导致 UI 不一致

### 4.1 存在 4 个独立的状态源

| 状态源 | 文件 | 字段 | 作用 | 读取方 |
|---|---|---|---|---|
| **AuthContext** (全局) | `useAuth.tsx` | `status.state` | 全局 auth 状态 | Topbar, TokenInput, ModuleCenter |
| **PluginPool 本地** | `PluginPool.tsx` | `tokenVerified` | 控制"重新加载"按钮显隐 | PluginPool 自身 |
| **PluginPool 本地** | `PluginPool.tsx` | `loadError`, `items` | 控制渲染分支 (auth screen vs data) | PluginPool 自身 |
| **ModuleCenter 本地** | `ModuleCenter.tsx` | `unauthorized` | 控制授权提示显隐 | ModuleCenter 自身 |

### 4.2 不一致的具体表现

```
Topbar: auth.state = 'authorized'  → 显示 "已授权" ✅
PluginPool: loadError='API requires...' + tokenVerified=true + items=[]
  → 仍显示 auth screen（含"重新加载插件池"按钮）
  → 用户困惑: "已授权为什么还要重新加载?"

ModuleCenter: unauthorized=true + auth.state='authorized'
  → 显示 TokenInput + 总闸状态提示
  → 用户困惑: "已授权了还让我输入 token?"
```

### 4.3 状态同步缺失

- PluginPool 从不读取 `auth.state` 做渲染决策 — 它只用 `loadError` 和 `items.length`
- ModuleCenter 的 `unauthorized` 和 `auth.state` 是两个独立信号，未做统一
- `AuthRequiredState` 组件被 `PluginPool.tsx:11` 导入但**从未在任何地方被渲染** — 它被设计为通用 auth 占位符但未被使用
- TokenInput 的 `onVerifiedChange` 只通知父组件验证结果，但不触发 API 重试

---

## 5. 状态出口分析

### 5.1 success 出口

```
verifyToken 成功 → auth.state = 'authorized'
  → Topbar: "已授权" ✅
  → PluginPool: tokenVerified = true, "重新加载"按钮出现
  → 用户点击 → fetchPool() → 仍然 401 (无 JWT) → 再次 auth screen ❌
  → TokenInput: "授权有效。执行总闸仍保持关闭。"
```

### 5.2 invalid 出口

```
verifyToken 失败 → auth.state = 'invalid'
  → Topbar: "无效" 
  → PluginPool: tokenVerified = false, 按钮不出现
  → TokenInput: "Token 无效或已过期，请重新输入。"
  → 用户可重新输入 ❌ (正常退出)
```

### 5.3 timeout 出口

```
verifyToken 超时 (AbortError 8s OR hard timeout 9s) → state = 'timeout'
  → Topbar: "未授权"
  → PluginPool: tokenVerified = false
  → TokenInput: "验证超时，请检查 AIP API / OpenClaw 状态后重试。"
  → 用户可重新输入 ❌ (正常退出)
```

### 5.4 API offline 出口

```
fetch 抛出网络错误 → state = 'network_error'
  → Topbar: "未授权"
  → TokenInput: "无法连接认证服务，请检查网络连接后重试。"
  → 用户可重新输入 ❌ (正常退出)
```

### 5.5 openclaw_unreachable 出口

```
refreshStatus 检测到 openclaw offline + auth.state === 'authorized'
  → state = 'openclaw_unreachable'
  → Topbar: "未连接"
  → TokenInput: "授权有效，但 OpenClaw 未连接。需确认 OpenClaw 服务状态。"
  → PluginPool: tokenVerified 不变, loadError 不变, 仍显示 auth screen
  → 注意: 此状态不会触发 PluginPool 刷新
```

### 5.6 stale frontend 出口（无检测）

```
用户浏览器加载了旧 JS bundles (pre-P3)
  → verifyToken 缺少 9s hard timeout
  → verifyHardTimeoutRef 未定义
  → 或 tokenVerified 逻辑与新版不同
  → hook 引用旧 useAuth→ 行为不一致
  → 无任何版本检测机制告知用户刷新
```

---

## 6. Stale Frontend / Cache 分析

### 6.1 当前检测机制

- **无任何 stale frontend 检测**
- `APP_VERSION` 是编译时常量 `'v7.62.0'`（`appVersion.ts`），不存在运行时版本对比
- Vite 构建产物默认包含 content hash，浏览器可能因缓存加载旧文件
- 没有 Service Worker、版本检查端点、或 bundle hash 对比机制
- 用户必须手动 Ctrl+F5 强制刷新才能确保最新代码

### 6.2 影响

P4（v7.65-P4）已验证: 浏览器加载旧 JS bundles 导致 P3 的 9s hard timeout 未生效，验证 hang 无法退出。用户无法从 UI 识别此情况，只能靠用户猜测。

---

## 7. Verifying/Loading 无法退出路径检查

| 文件 | 代码位置 | 风险 | 分析 |
|---|---|---|---|
| `useAuth.tsx:127` | finally setStatus | 低 | functional updater + React 18 batch 确保正确 |
| `TokenInput.tsx:32-39` | verifyHardTimeoutRef 9s | 低 | 硬超时确保 verifying=false |
| `TokenInput.tsx:18-26` | useEffect cleanup abortVerify | 低 | 组件卸载时清理 |
| `PluginPool.tsx:168-192` | fetchPool 10s AbortController | 低 | 有超时 + finally setLoading(false) |
| `ModuleCenter.tsx:145-216` | refresh Promise.allSettled | 低 | 每个请求有 10s 超时, finally setLoading(false) |

**结论**: 所有 verifying/loading 状态均设有超时保护或 finally 清理，不存在无法退出的路径。但**两种超时系统（8s AbortController + 9s hard timeout）可能竞态**，验证通过后 hard timeout 仍可能触发 abortVerify。

---

## 8. 文案问题清单

| 位置 | 当前文案 | 问题 | 建议 |
|---|---|---|---|
| `PluginPool.tsx:451` | 插件池需要授权后查看。请输入 OpenClaw Token 进行当前会话验证。验证不会自动开启执行总闸。 | 不解释为什么授权后还要"重新加载" | 应说明 Token 验证只改变状态标识，不提供数据访问凭证 |
| `TokenInput.tsx:96` | 授权有效。执行总闸仍保持关闭。 | 用户会问"既然有效，为什么数据不加载?" | 应增加"数据加载需要额外凭证"说明 |
| `PluginPool.tsx:456` | 重新加载插件池 | 按钮永远失败（无 JWT） | 应禁用或在文案中说明需要 JWT |
| `ModuleCenter.tsx:571-572` | 部分数据未返回，请输入 Token 进行当前会话验证。以下可能显示缓存/默认值。 | 暗示 Token 能解决数据加载问题，实际不能 | 应说明 Token 验证只解授权状态锁，不解数据访问锁 |
| `AuthRequiredState.tsx` | 通用占位符组件 | 导入但未使用 | 使用或移除 |
| `Layout.tsx:238` | 未授权 / 验证中 / 已授权 / 无效 / 未连接 | '未连接' 语义不明确 | 改为 'OpenClaw 离线' |
| `PluginPool.tsx:445` | Retry | 按钮文案英文 | 应统一为中文 |

---

## 9. 安全风险判断

| 风险类别 | 等级 | 证据 |
|---|---|---|
| Token 进入 localStorage | ✅ 无风险 | grep 确认: OpenClaw Token 始终在内存中，type="password"，不存储 |
| Token 进入 sessionStorage | ✅ 无风险 | grep 确认: 无 OpenClaw Token 写入 sessionStorage |
| Token 进入 DOM (URL/HTML) | ✅ 无风险 | 不在 URL params、hidden fields、data attributes 中 |
| Token 进入 console | ✅ 无风险 | `console.warn` 只记录 401 路径，不记录 token |
| Token 进入 git | ✅ 无风险 | 不从 local storage / sessionStorage 读取 |
| JWT 签发泄露 | ✅ 无风险 | 后端 verifyToken 不签发 JWT（这是 bug 也是安全特性） |
| Gate 误开 | ✅ 无风险 | master-switch POST 需要 JWT 中间件保护 |
| Stage C enable | ✅ 无风险 | 前端无任何 Stage C enable 按钮逻辑 |
| DB write | ✅ 无风险 | auth check 端点只读比较，不写 DB |
| Connector action | ✅ 无风险 | 前端无 connector 操作代码 |
| localStorage 其他 token | ⚠️ 低风险 | `COST_ROUTING_AUTH_TOKEN_KEY` 和 `MODEL_GATEWAY_AUTH_TOKEN_KEY` 存储 token 在 localStorage |
| 硬编码版本信息 | ✅ 无信息泄露 | `APP_VERSION` 和 `BUILD_DATE` 是公开构建信息 |

---

## 10. 完整 Auth 路径图

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       全局 AuthProvider                                  │
│  ┌────────────────────────────────────────────┐                          │
│  │ refreshStatus() (on mount + every 5min)     │                          │
│  │ → GET /api/auth/status (PUBLIC)             │                          │
│  │ → 返回 jwt + openclaw 元数据               │                          │
│  │ → state 不变 (仍是 'unknown')               │                          │
│  └────────────────────────────────────────────┘                          │
│  ┌────────────────────────────────────────────┐                          │
│  │ verifyToken(token)                          │                          │
│  │ → 8s AbortController + request              │                          │
│  │ → POST /api/openclaw/auth/check (PUBLIC)    │                          │
│  │ → state = 'validating' → 'authorized/invalid'│                         │
│  │ → No JWT issued!                             │                          │
│  │ → finally: 安全兜底检查                     │                          │
│  └────────────────────────────────────────────┘                          │
│  ┌────────────────────────────────────────────┐                          │
│  │ clearToken()                                 │                          │
│  │ → abortVerify + state = 'unauthenticated'   │                          │
│  └────────────────────────────────────────────┘                          │
│  ┌────────────────────────────────────────────┐                          │
│  │ abortVerify()                                │                          │
│  │ → controller.abort() + ref = null           │                          │
│  └────────────────────────────────────────────┘                          │
└──────────────────────────────────────────────────────────────────────────┘
                                                                                 
┌──────────────────────────────────────────────────────────────────────────┐
│                    PluginPool 页面                                        │
│                                                                          │
│ 挂载 → fetchPool()                                                       │
│   → GET /api/plugins/registry (需 JWT)                                   │
│   → 401 → _unauthorized: true                                            │
│   → setLoadError('API requires auth...')                                 │
│   → setItems([])                                                         │
│                                                                          │
│ 渲染分支: loadError && items.length === 0                                │
│   → EmptyState(!) + Retry + TokenInput                                   │
│   → TokenInput 验证成功 → tokenVerified = true                           │
│   → "重新加载插件池"按钮出现                                               │
│   → 点击 → fetchPool() → 仍然 401 → 循环 ❌                               │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                    ModuleCenter 页面                                     │
│                                                                          │
│ 挂载 → refresh()                                                         │
│   → 7 endpoints 全部需 JWT → 全部 401 → _unauthorized                    │
│   → setUnauthorized(true)                                                │
│                                                                          │
│ 渲染分支: unauthorized === true → TokenInput + 总闸提示                  │
│   → TokenInput 验证成功 → auth.state = 'authorized'                     │
│   → 但 refresh() 仍会重试 (每 30s)                                       │
│   → 即使 authorized, 刷新时仍然 _unauthorized（无 JWT）                   │
│   → unauthorized = true 再次出现 → TokenInput 再次显示                   │
│   → 总闸按钮 disabled 条件: authState !== 'authorized'                   │
│     → authorized 后会变为 enabled                                       │
│     → 但 POST master-switch 仍然需要 JWT → 会 401                        │
│     → 用户点了总闸按钮后会看到 401（被 intercept 为 _unauthorized）       │
│     → 按钮不报错也不切换状态 → 用户迷茫                                  │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                    Topbar Layout                                         │
│                                                                          │
│ Topbar 指示器 (Layout.tsx:236-238):                                       │
│   auth.state === 'authorized' → "已授权"                                  │
│   auth.state === 'validating' → "验证中"                                  │
│   auth.state === 'invalid' → "无效"                                      │
│   auth.state === 'openclaw_unreachable' → "未连接"                        │
│   其他 → "未授权"                                                         │
│                                                                          │
│ 状态不一致: 用户看到"已授权"但 PluginPool 仍显示 auth screen              │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                    全局 fetch 拦截器 (index.tsx:14-34)                    │
│                                                                          │
│ 拦截所有 HTTP 401 响应:                                                  │
│   → 替换为 200 { ok: false, error: 'unauthorized', _unauthorized: true } │
│ 拦截所有网络错误:                                                        │
│   → 替换为 200 { ok: false, error: '<message>', _networkError: true }    │
│                                                                          │
│ 影响: 所有需要 JWT 的 API 都返回 _unauthorized 而不是抛异常               │
│ 副作用: 使用代码无法区分 401 和真正的 200                               │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Issue List（按严重性分类）

### 🔴 Critical（阻止正常使用）

| ID | 文件 | 行号 | 描述 |
|---|---|---|---|
| C1 | `useAuth.tsx` | 87-129 | **OpenClaw Token 验证成功不签发 JWT**。所有需要 JWT 的 API（plugins/registry, master-switch 等）始终返回 401。Token 验证只改变了 `auth.state`，但不提供任何后续 API 调用凭证。这是用户体验断裂的根因。 |
| C2 | — | — | **无 stale frontend 检测机制**。浏览器可能加载旧 JS bundles，用户无法从 UI 识别。P4 已验证此场景导致验证 hang。无版本对比、无 Service Worker、无 bundle hash 校验。 |

### 🟠 High（用户体验严重受损）

| ID | 文件 | 行号 | 描述 |
|---|---|---|---|
| H1 | `PluginPool.tsx` | 175-178 | **PluginPool 渲染不受 `auth.state` 控制**。完全由本地 `loadError` + `items` 决定。即使全局 state='authorized'，页面仍显示 auth screen。 |
| H2 | `PluginPool.tsx` | 456-458 | **"重新加载插件池"按钮永远失败**。Token 验证不产生 JWT，reload 只是重发同一个会被 401 的请求，形成无限循环。 |
| H3 | `ModuleCenter.tsx` | 466 | **总闸按钮 enabled 但实际不可用**。`authState !== 'authorized'` 条件解锁后，POST master-switch 仍被 JWT 中间件拦截返回 401，用户看不到错误反馈。 |
| H4 | `useAuth.tsx` | 57-77 | **refreshStatus 从不更新 `state`**。挂载后仍为 `'unknown'`，导致首次 Topbar 显示"未授权"而非"已授权"（即使之前验证通过）。仅在后续 5 分钟间隔的 refreshStatus 中可能因 openclaw offline 触发 `openclaw_unreachable`。 |
| H5 | `useAuth.tsx` | 127 | **finally 块可能覆盖 authorized 状态**。若 `refreshStatus()` 意外抛出，`setStatus` 到 'authorized' 的代码行（105）不执行，finally 块会将 state 设为 'timeout'。当前代码不会抛出（内部 try/catch），但脆弱。 |

### 🟡 Medium（可用性降低）

| ID | 文件 | 行号 | 描述 |
|---|---|---|---|
| M1 | `PluginPool.tsx` | 11, 440-466 | **AuthRequiredState 组件导入但从未使用**。该组件设计为通用 auth 占位符但从未被任何渲染路径覆盖。 |
| M2 | `useAuth.tsx` | 61-75 | **`openclaw_unreachable` 状态覆盖 'authorized'**。refreshStatus 在检测到 OpenClaw 离线时无条件覆写 state，即使刚刚验证成功。造成"授权→未连接"的无提示降级。 |
| M3 | `TokenInput.tsx` | 96 | **文案误导**: "授权有效。执行总闸仍保持关闭。" — 用户理解为"我已经授权了为什么页面还不加载?" |
| M4 | `ModuleCenter.tsx` | 568-590 | **TokenInput 无 onVerifiedChange 回调**。ModuleCenter 的 TokenInput 没有传 `onVerifiedChange`，验证成功后不会触发自动刷新。 |
| M5 | `TokenInput.tsx` | 32-39, `useAuth.tsx` | 90-91 | **两套超时系统可能竞态**: TokenInput 的 9s hard timeout 和 useAuth 的 8s AbortController 可以同时触发。如果 8s 成功返回但 9s 仍在倒计时，后续 hard timeout 调用 abortVerify 是安全的（因为 verifyToken 已返回），但可能导致日志噪音。 |

### 🔵 Low（轻微问题）

| ID | 文件 | 行号 | 描述 |
|---|---|---|---|
| L1 | `useAuth.tsx` | 3 | **`expired` 状态被定义但从不设置**。verifyToken 的各分支都不产生 'expired'，但 TokenInput.stateText 有对应的 case 文案。 |
| L2 | `index.tsx` | 15-34 | **`_origFetch` 变量名不遵循代码风格**。使用下划线前缀与项目其他部分不一致。 |
| L3 | `PluginPool.tsx` | 174 | **`response.json().catch(() => ({}))` 模式**。如果后端返回非 JSON 响应，静默转为空对象，可能隐藏真实错误。在整个代码库中多次出现。 |
| L4 | `Layout.tsx` | 422 | **OpenClaw 状态直接显示**。systemData?.openclaw?.enabled 直接取自 master-switch API（即使 401 被 intercept 可能返回默认值）。 |
| L5 | `apps/web-ui/src/services/api.ts` | 10-11 | **COST_ROUTING_AUTH_TOKEN_KEY 和 MODEL_GATEWAY_AUTH_TOKEN_KEY 存储在 localStorage**。虽然不涉及 OpenClaw Token，但这两个独立 token 存储在非加密的 localStorage 中。 |
| L6 | `PluginPool.tsx` | 445 | **"Retry" 按钮为英文**，其他文案均为中文。 |

---

## 12. 最小修复建议（按优先级）

### 12.1 P0 立即修复

| 建议 | 涉及文件 | 依赖 |
|---|---|---|
| **签发 JWT**: verifyToken 成功时后端签发 viewer 角色 JWT，前端接收后自动附加到后续请求 | `index.ts` (后端), `useAuth.tsx`, `PluginPool.tsx`, `ModuleCenter.tsx` | 无 |

### 12.2 P1 高优先级

| 建议 | 涉及文件 | 依赖 |
|---|---|---|
| **验证成功后自动 retry**: TokenInput 新增 `onAuthorized` 回调，PluginPool/ModuleCenter 验证成功后自动调用 fetchPool/refresh | `TokenInput.tsx`, `PluginPool.tsx`, `ModuleCenter.tsx` | P0 |
| **ModuleCenter TokenInput 传 onVerifiedChange**: 验证成功后自动刷新数据 | `ModuleCenter.tsx` | P0 |

### 12.3 P2 中优先级

| 建议 | 涉及文件 | 依赖 |
|---|---|---|
| **统一状态源**: PluginPool 渲染分支也读取 `auth.state`，而不是仅依赖本地 `loadError` | `PluginPool.tsx` | P0 |
| **修复文案**: TokenInput/PluginPool 文案应说明 JWT 需求 | `TokenInput.tsx`, `PluginPool.tsx` | 无 |
| **refreshStatus 更新 state**: 如果已验证过且 API 状态正常，应设置 `state='authorized'` | `useAuth.tsx` | 无 |
| **移除未使用代码**: AuthRequiredState 组件或使用它 | `AuthRequiredState.tsx`, `PluginPool.tsx` | 无 |

### 12.4 P3 低优先级

| 建议 | 涉及文件 | 依赖 |
|---|---|---|
| **新增 stale frontend 检测**: 前端轮询 `version` 端点，与 `APP_VERSION` 对比 | `constants/appVersion.ts`, `Layout.tsx` | 无 |
| **消除两套超时系统**: 统一为 useAuth 的 AbortController + 安全 finally | `TokenInput.tsx`, `useAuth.tsx` | 无 |
| **API.ts localStorage tokens**: 评估是否有必要改用 sessionStorage 或 httpOnly cookie | `services/api.ts` | 无 |

---

## 13. Token 泄漏风险评估详情

### 13.1 OpenClaw Heartbeat Token

- ✅ **不在 URL**: 仅 POST body 发送
- ✅ **不在 localStorage/sessionStorage**: 内存变量 + React state
- ✅ **不在 DOM**: type="password", 无 value 属性显示
- ✅ **不在 console**: console.warn 只记录 request URL, 不记录 body
- ✅ **不在 git**: 不从文件系统读取
- ✅ **不在 HTML/JS bundle**: 编译时不可用，运行时 fetch 到后端
- ✅ **不在浏览器历史**: POST 请求不记入 URL history

### 13.2 localStorage 中存在的其他 token

```
COST_ROUTING_AUTH_TOKEN_KEY → apps/web-ui/src/pages/CostRouting.tsx
  用于 Cost Routing 页面的 API 认证 token
MODEL_GATEWAY_AUTH_TOKEN_KEY → apps/web-ui/src/pages/ModelGateway.tsx
  用于 Model Gateway 页面的 API 认证 token
```

这两个 token 存储在 `localStorage` 中，可被同源的任何 JS 读取。这是已有的设计决策，不在本次审计范围内。但记录为已知风险。

---

## 14. 安全边界确认

| 边界 | 状态 | 证据 |
|---|---|---|
| 前端无法自行打开 Gate | ✅ 确认 | master-switch POST 被 JWT middleware 保护 |
| 前端无法 enable Stage C | ✅ 确认 | 前端无任何 Stage C enable 逻辑 |
| 前端无法触发 DB write | ✅ 确认 | verifyToken 端点为只读比较 |
| 前端无法控制 OpenClaw | ✅ 确认 | 无 OpenClaw 控制端点调用 |
| 前端无法绕过 JWT | ✅ 确认 | 所有非 PUBLIC API 需要 JWT |
| 前端无法访问私有数据 | ✅ 确认 | 插件数据由 JWT 保护 |
| 前端 Token 无法获取 JWT | ✅ 确认（当前行为） | verifyToken 不签发 JWT |

---

## 15. 推荐的下一步

### 建议: 进入 P5B 修复阶段

P5B 应实施:

1. **后端**: `POST /api/openclaw/auth/check` 成功时调用 `reply.jwtSign()` 签发 viewer 角色 JWT（1h 有效期），返回 `access_token` 字段
2. **useAuth**: 接收 `access_token` 存入内存 ref，所有后续 fetch 自动附加 `Authorization: Bearer <token>` header
3. **PluginPool**: 验证成功后自动调用 `fetchPool()`，token 解密循环
4. **ModuleCenter**: 验证成功后自动调用 `refresh()`
5. **文案修复**: 更新 TokenInput/PluginPool 文案以反映真实状态

**不实施**: Stage C enable、Gate open、DB write、connector control、任何写操作风险

---

## 16. 验证清单

- [x] `git status` before/after → ✅ Clean
- [x] `tsc --noEmit` → ✅ Passed
- [x] `vite build` → ✅ Passed (744 modules)
- [x] grep: token leak → ✅ No leak
- [x] grep: Stage C → ✅ No enablement
- [x] grep: master-switch → ✅ No bypass
- [x] grep: localStorage/sessionStorage → ✅ No OpenClaw Token
- [x] grep: console.log/dir → ✅ No token exposure
- [x] grep: DB write → ✅ No accidental write
- [x] grep: connector action → ✅ No action
- [x] grep: release/restore → ✅ No operation
