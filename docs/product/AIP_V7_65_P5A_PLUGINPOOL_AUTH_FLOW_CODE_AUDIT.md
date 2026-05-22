# AIP v7.65-P5A: PluginPool Auth Flow Code Audit

**Phase:** v7.65-P5A (read-only audit)
**Verdict:** `V7_65_P5A_PLUGINPOOL_AUTH_FLOW_CODE_AUDIT_COMPLETE_NO_CODE_CHANGE`
**Date:** 2026-05-22

---

## 1. 涉及文件清单

| # | 文件 | 角色 |
|---|---|---|
| 1 | `apps/web-ui/src/pages/PluginPool.tsx` | 插件池页面入口, 包含 fetchPool / TokenInput / AuthRequiredState 调用 |
| 2 | `apps/web-ui/src/components/ui/TokenInput.tsx` | Token 输入组件, 调用 useAuth.verifyToken |
| 3 | `apps/web-ui/src/hooks/useAuth.tsx` | AuthProvider / AuthContext, 提供 verifyToken/clearToken/abortVerify |
| 4 | `apps/web-ui/src/App.tsx` | 路由入口, <AuthProvider> 包裹全局 |
| 5 | `apps/web-ui/src/pages/ModuleCenter.tsx` | 模块中心页, 参考的 auth 处理逻辑 |
| 6 | `apps/web-ui/src/components/ui/AuthRequiredState.tsx` | 通用认证提示组件 (当前未实际使用?) |
| 7 | `apps/web-ui/src/components/Layout.tsx` | Topbar auth 状态指示器 |
| 8 | `apps/web-ui/src/index.tsx` | 全局 fetch 拦截器 — 将 401 转为 `{_unauthorized:true}` |
| 9 | `apps/web-ui/src/services/api.ts` | axios 拦截器 — 同样将 401 转为 `{_unauthorized:true}` |
| 10 | `apps/local-api/src/index.ts` | 后端 Fastify 路由, 包括 JWT 中间件 / auth check / master-switch |
| 11 | `apps/local-api/src/auth/index.ts` | 后端 /api/auth/status 端点 |

---

## 2. 关键代码片段与行号

### 2.1 PluginPool.tsx — 页面入口 + 授权判断

```typescript
// 文件: PluginPool.tsx
// L148:  入口组件
export default function PluginPool() {

// L152:   auth context (来自全局 AuthProvider)
  const auth = useAuth();

// L153:   local state: token 验证是否通过 (仅由 TokenInput onVerifiedChange 设置)
  const [tokenVerified, setTokenVerified] = useState(false);

// L167-192: fetchPool — 插件数据加载
  const fetchPool = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const r = await fetch('/api/plugins/registry', { signal: controller.signal });
      const d = await r.json().catch(() => ({}));
      if (d?._unauthorized) {                    // L175: 检查 _unauthorized
        setItems([]);
        setLoadError('API requires authentication token. Configure OPENCLAW tokens or JWT.');
        return;
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      ... 正常解析插件数据
    } catch ...
  }, []);

// L194: 组件挂载时自动 fetch
  useEffect(() => { fetchPool(); }, [fetchPool]);
```

### 2.2 PluginPool.tsx — 授权画面渲染

```typescript
// L440-466: 错误 + 空数据 → 显示授权画面
  if (loadError && items.length === 0) {
    return (
      <div>
        <EmptyState icon="!" title="Plugin Pool" description={loadError} />
        <button onClick={fetchPool}>Retry</button>           // "重试"按钮
        {loadError.includes('authentication') && (           // 仅当错误包含 authentication 时显示 TokenInput
          <SectionCard title="授权验证">
            <TokenInput onVerifiedChange={setTokenVerified} />
            {tokenVerified && (
              <button onClick={fetchPool}>                   // "重新加载插件池"按钮
                重新加载插件池
              </button>
            )}
          </SectionCard>
        )}
      </div>
    );
  }
```

### 2.3 index.tsx — 全局 fetch 拦截器

```typescript
// 文件: index.tsx L14-34
// 将后端 401 响应转换成 200 {_unauthorized:true}
const _origFetch = window.fetch;
window.fetch = async function (input, init) {
  try {
    const res = await _origFetch(input, init);
    if (res.status === 401) {
      console.warn('[fetch] 401 on', input, '- returning dev fallback');
      return new Response(                                   // <-- 返回 200 假响应
        JSON.stringify({ ok: false, error: 'unauthorized', _unauthorized: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return res;
  } catch (e) {
    // 网络错误也转换为 200 {_networkError:true}
    ...
  }
};
```

### 2.4 useAuth.tsx — verifyToken 核心逻辑

```typescript
// 文件: useAuth.tsx L87-129
  const verifyToken = useCallback(async (token: string): Promise<boolean> => {
    verifyTokenAbortRef.current?.abort();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    setStatus(prev => ({ ...prev, state: 'validating' }));
    try {
      const r = await fetch('/api/openclaw/auth/check', {     // POST 到 PUBLIC 端点
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heartbeat_token: token }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const d = await r.json().catch(() => null);
      if (d?.ok && d?.valid) {                                // 验证通过条件
        await refreshStatus();
        setStatus(prev => ({ ...prev, state: 'authorized', verifiedToken: true }));
        return true;
      }
      ...
    } catch ...
  }, [refreshStatus]);
```

### 2.5 后端 JWT 中间件

```typescript
// 文件: index.ts L303-323
const PUBLIC_PATHS = new Set([
  '/api/health', '/api/auth/status', '/api/openclaw/auth/check', '/api/openclaw/heartbeat',
  '/api/system/status', '/api/dashboard/summary', ...
]);
// /api/plugins/registry 不在 PUBLIC_PATHS 中

app.addHook('onRequest', async (request, reply) => {
  const path = request.url?.split('?')[0] || '';
  if (!path.startsWith('/api/')) return;
  if (PUBLIC_PATHS.has(path)) return;
  ... // /api/plugins/registry 需要 JWT
  try { await request.jwtVerify(); } catch { 
    return reply.code(401).send({ ok: false, error: 'unauthorized' }); 
  }
});
```

### 2.6 Layout.tsx — Topbar auth indicator

```typescript
// 文件: Layout.tsx L139-140
  const auth = useAuth();
  const authState = auth.status.state;
// L236-238
  <span className={`topbar-status-dot ${authState === 'authorized' ? 'ok' : ...}`} />
  {authState === 'authorized' ? '已授权' : authState === 'validating' ? '验证中' 
    : authState === 'invalid' ? '无效' : authState === 'openclaw_unreachable' ? '未连接' : '未授权'}
```

### 2.7 ModuleCenter.tsx — auth 处理

```typescript
// L140-141
  const auth = useAuth();
  const authState = auth.status.state;

// L162:   各个 API 返回的 _unauthorized 标志
  const checkAuth = (v: any) => { if (v?._unauthorized) setUnauthorized(true); };

// L466:   总闸按钮 disabled 条件
  disabled={busyKey === 'openclaw' || authState !== 'authorized'}
```

---

## 3. 当前状态流

```
未授权进入 /plugin-pool
  → useEffect 触发 fetchPool()
  → fetch GET /api/plugins/registry
  → 后端 JWT 中间件拦截 → 401
  → 全局 fetch 拦截器转为 200 {_unauthorized: true}
  → PluginPool 检查 d?._unauthorized → true
  → setLoadError('API requires authentication token...')
  → setItems([])
  → 进入渲染分支: loadError && items.length === 0
  → 显示 EmptyState("!") + Retry 按钮 + (loadError.includes('authentication') → TokenInput)

用户输入 token → 点击验证
  → TokenInput.handleVerify
  → setVerifying(true)
  → 启动 9000ms hard timeout
  → verifyToken(token.trim())
  → fetch POST /api/openclaw/auth/check (PUBLIC, no JWT needed)
  → 后端: token === OPENCLAW_HEARTBEAT_TOKEN?
    → 匹配: { ok: true, valid: true, configured: true }
    → 不匹配: { ok: true, valid: false, configured: true, error: 'Token 验证失败' }
  → useAuth 状态:
    → d?.ok && d?.valid === true → setStatus(authorized)
    → d?.ok && d?.valid !== true → setStatus(invalid)
  → TokenInput:
    → ok = true → setToken('') + onVerifiedChange(true)
    → ok = false → onVerifiedChange(false)
  → PluginPool:
    → tokenVerified = true (或 false)

用户看到 tokenVerified = true → "重新加载插件池" 按钮
  → 用户点击
  → fetchPool()
  → fetch GET /api/plugins/registry
  → 仍然无 JWT → 后端 401 → 拦截器 _unauthorized:true
  → setLoadError(...) + setItems([])
  → 又回到授权画面!
  → tokenVerified 仍然为 true
  → "重新加载插件池"按钮仍然显示
  → 用户再次点击 → 无限循环
```

---

## 4. API 调用链

| 步骤 | 端点 | JWT 需求 | OpenClaw Token 需求 | 是否 PUBLIC |
|---|---|---|---|---|
| useAuth.refreshStatus | `GET /api/auth/status` | 否 | 否 | ✅ 是 |
| useAuth.verifyToken | `POST /api/openclaw/auth/check` | 否 | 否（但要验证） | ✅ 是 |
| PluginPool.fetchPool | `GET /api/plugins/registry` | **是** | 否 | ❌ 否 |
| ModuleCenter.refresh | `GET /api/plugins/pool` | **是** | 否 | ❌ 否 |
| master-switch POST | `POST /api/openclaw/master-switch` | **是** | 否 | ❌ 否 |
| plugin enable/disable | `POST /api/plugins/:id/enable` | **是** | 否 | ❌ 否 |

关键发现: **OpenClaw Token 验证通过的页面不获取任何 JWT**, 因此所有需要 JWT 的 API 仍然返回 401/_unauthorized。

---

## 5. Auth State 变化

| 操作 | useAuth.state | tokenVerified (local) | Topbar | PluginPool 显示 |
|---|---|---|---|---|
| 初始加载 | `unknown` | `false` | 未授权 | auth screen |
| refreshStatus 完成 | `unauthenticated` (或 unknown) | `false` | 未授权 | auth screen |
| 输入 token 点击验证 | `validating` | `false` | 验证中 | auth screen |
| 验证成功 (token 匹配) | `authorized` | `true` | **已授权** | auth screen (验证通过提示) |
| 点击"重新加载" | `authorized` | `true` | **已授权** | auth screen (再次) |
| 输入假 token | `invalid` | `false` | 无效 | auth screen |

**关键矛盾**: Topbar 显示"已授权"但 PluginPool 仍然显示授权画面等待"重新加载"。

---

## 6. Reload 行为

"重新加载插件池"按钮调用 `fetchPool()`:
1. 再次发 `GET /api/plugins/registry`
2. 再次被 JWT 中间件拦截 → 401
3. 拦截器转成 `_unauthorized: true`
4. `setLoadError` 再次设置
5. `setItems([])` 清空
6. 渲染再次进入 auth screen 分支

**reload 并不解决根因**: 它只是重复了初始加载的逻辑。除非后端在 reload 时能返回有效数据（没有 JWT 不可能），否则 reload 永远失败。

---

## 7. 假 Token 风险判断

| 场景 | 能否通过? | 影响 |
|---|---|---|
| 任意字符串 | ❌ 否 | 后端比对 `OPENCLAW_HEARTBEAT_TOKEN`，不匹配返回 `valid: false` |
| 空 token | ❌ 否 | 后端 L724 检查 `!token` → 400 "token 不能为空" |
| 匹配 env token | ✅ 是 | 通过验证, `useAuth.state = 'authorized'`, 但 **无 JWT 签发** |
| env 为空时任何 token | ❌ 否 | 后端 L728 返回 `configured: false` |

**结论**: 假 token 不会被接受。但真 token 通过后也不会获得 JWT，插件 API 仍然不可访问。

---

## 8. 根因判断

**核心根因: 两个独立的认证体系未打通**

1. **OpenClaw Token 认证** (v7.65-P1/P2/P3 实现)
   - `POST /api/openclaw/auth/check` 验证 token 是否匹配 `OPENCLAW_HEARTBEAT_TOKEN`
   - 成功后仅设置 `useAuth.state = 'authorized'`
   - **不签发 JWT**
   - **不修改后续 API 请求头**

2. **JWT 认证** (原有 AIP 体系)
   - 后端 `onRequest` 中间件要求所有非 PUBLIC 路径有 JWT
   - `/api/plugins/registry` 不在 PUBLIC_PATHS
   - 前端全局 fetch 拦截器将 401 转为 `_unauthorized: true`
   - PluginPool 根据 `_unauthorized` 显示授权画面

**用户看到的现象链**:
```
Token 验证成功 → auth.state = 'authorized' → Topbar 显示"已授权"
  → 但 /api/plugins/registry 仍返回 _unauthorized
  → PluginPool 仍显示 auth screen
  → 用户困惑: "我已经授权了为什么还要授权?"
```

**为什么 reload 无用**:
reload 只是重新请求同一个需要 JWT 的 API，而 OpenClaw Token 验证成功并不产生 JWT。无限循环。

---

## 9. 针对 15 个问题的逐条回答

### Q1: 假 Token 是否会被接受?
**不会**。后端精确比对 `token === process.env.OPENCLAW_HEARTBEAT_TOKEN`（`index.ts:730`）。假 token 返回 `valid: false, error: 'Token 验证失败'`。

### Q2: 空 Token 是否会被接受?
**不会**。后端检查 `!token`（`index.ts:723`），返回 400 `"token 不能为空"`。前端 TokenInput 的 `handleVerify` 也在 `!token.trim()` 时提前 return。

### Q3: auth check 成功的真实条件是什么?
提交的 `heartbeat_token` 必须**完全匹配** `process.env.OPENCLAW_HEARTBEAT_TOKEN`（`index.ts:730`）。如果 env 未配置，返回 `configured: false`，前端显示 `unauthenticated`。

### Q4: Token 验证成功后, PluginPool 有没有真正进入 authorized branch?
**进入了 auth context 的 authorized branch**（`useAuth.state = 'authorized'`），但 **PluginPool 的渲染分支不受 auth.state 控制**。PluginPool 的渲染完全由 `loadError` 和 `items.length` 决定，与 `auth.state` 无关。唯一受影响的是 Topbar 显示"已授权"。

### Q5: 点击"重新加载插件池"到底触发了什么函数?
触发 `fetchPool()`（`PluginPool.tsx:167-192`）。向 `GET /api/plugins/registry` 发送请求。

### Q6: Reload 是否重新请求插件数据?
**是**, 调用 `fetchPool()` 重新发请求。但由于仍无 JWT, 后端返回 401, 拦截器转成 `_unauthorized: true`, `loadError` 再次设置, `items` 再次清空。

### Q7: 插件数据请求是否携带任何授权信息?
**没有**。原始 `fetch('/api/plugins/registry')` 不带任何 Authorization header 或 cookie。全局 fetch 拦截器只在收到 401 后转换响应, 不修改请求。OpenClaw Token 验证通过后也没有在任何地方存储或附加授权凭证到后续请求。

### Q8: 插件数据 API 是否仍要求 JWT?
**是**。`/api/plugins/registry` 不在 `PUBLIC_PATHS`（`index.ts:303-311`），JWT 中间件要求其有有效 JWT。

### Q9: OpenClaw Token 与 AIP JWT 是否是两套认证?
**是, 完全独立的两套体系**:
- OpenClaw Token: 环境变量 `OPENCLAW_HEARTBEAT_TOKEN`, 用于验证身份, 验证后不产生 JWT
- AIP JWT: 通过 `POST /api/auth/login` 获取, 存储在内存/本地存储, 附加在请求的 Authorization header。由后端 fastify-jwt 验证

### Q10: Topbar 显示"已授权"和 PluginPool 仍显示授权画面是否可能同时出现?
**是的, 这正是当前 bug 的表现**: Topbar 读取 `auth.status.state`（`Layout.tsx:237-238`）, 当 Token 验证通过时显示"已授权"。PluginPool 不受 `auth.state` 控制, 由 `loadError` / `items` / `tokenVerified` 三个本地状态控制。验证通过后 `loadError` 未清除 + `items` 为空, 因此仍显示授权画面。

### Q11: 当前页面为什么会出现"授权有效, 但 reload 后还是授权画面"?
验证成功后:
1. `auth.state = 'authorized'` (全局)
2. `tokenVerified = true` (PluginPool 本地)
3. '重新加载插件池'按钮出现
4. 用户点击 → `fetchPool()` → `GET /api/plugins/registry` → 401 → `_unauthorized` → `setLoadError(...)` → `setItems([])` → 回到授权画面
5. 但 `tokenVerified` 仍然是 true, 所以按钮始终显示
6. 用户再点 → 循环

**核心原因**: Token 验证成功不产生 JWT, 插件 API 需要 JWT, 两者完全脱钩。

### Q12: 最小修复点在哪里?
**推荐方式 A**: 让 OpenClaw Token 验证成功时签发一个临时 JWT, 后续请求携带此 JWT。

**推荐方式 B**: 将 `/api/plugins/registry` 加入 `PUBLIC_PATHS`（如果这些数据不需要鉴权）。

**推荐方式 C**: `verifyToken` 成功后不再仅设置 auth state, 而是同时获取或签发一个 session token/cookie。

详见下节修复建议。

### Q13: 是否需要后端改动?
**是。** 无论选择哪种修复方式, 都涉及后端改动:
- 方式 A: `/api/openclaw/auth/check` 成功时签发 JWT
- 方式 B: 修改 `PUBLIC_PATHS`
- 方式 C: 新增 session API

### Q14: 是否需要前端改动?
**是。** 需要:
- 携带 JWT 到后续请求
- 或修改 PluginPool 对 tokenVerified 成功后的处理逻辑
- 或修改 useAuth 在验证成功后自动 retry fetchPool

### Q15: 是否有安全风险: token 泄漏、gate 误开、master-switch 误触发、DB write、OpenClaw control?
| 风险 | 判断 | 理由 |
|---|---|---|
| Token 泄漏 | ✅ 无风险 | token 只在内存中, type="password", 不记 localStorage/DOM/console/git |
| Gate 误开 | ✅ 无风险 | master-switch POST 需要 JWT + 路由处理, 无 JWT 无法触发 |
| Master-switch 误触发 | ✅ 无风险 | 同上 |
| DB write | ✅ 无风险 | auth check 端点只读, 不写 DB |
| OpenClaw control | ✅ 无风险 | auth check 端点不调用 OpenClaw / 外部服务 |

---

## 10. 文字状态流图

```
┌─────────────────────────────────────────────────────────────────┐
│ 未授权进入 /plugin-pool                                          │
│                                                                  │
│ 1. useEffect fetchPool()                                         │
│ 2. GET /api/plugins/registry                                     │
│ 3. 后端 JWT 中间件 → 401                                         │
│ 4. 前端 fetch 拦截器 → 200 {_unauthorized: true}                │
│ 5. d?._unauthorized → setLoadError(auth_error) + setItems([])   │
│ 6. 渲染: loadError && items.length === 0                         │
│ 7. → EmptyState + Retry + (loadError.includes('authentication') │
│      → TokenInput)                                                │
│                                                                  │
│ 用户输入 token → 点击验证                                        │
│                                                                  │
│ 8. TokenInput.handleVerify()                                     │
│ 9. setVerifying(true) + 启动 9000ms hard timeout                 │
│ 10. verifyToken(token) → POST /api/openclaw/auth/check           │
│ 11. 后端: token === OPENCLAW_HEARTBEAT_TOKEN?                    │
│     ├─ 是: { ok: true, valid: true, configured: true }           │
│     └─ 否: { ok: true, valid: false, error: 'Token 验证失败' }   │
│ 12. useAuth:                                                     │
│     ├─ valid=true → state='authorized'                          │
│     └─ valid=false → state='invalid'                             │
│ 13. TokenInput: onVerifiedChange(ok)                             │
│ 14. PluginPool: tokenVerified = ok                               │
│                                                                  │
│ 验证成功路径 (valid=true):                                        │
│                                                                  │
│ 15. auth.state = 'authorized'                                    │
│ 16. Topbar 显示 "已授权" ✅                                       │
│ 17. PluginPool: tokenVerified = true                             │
│ 18. "重新加载插件池"按钮显式                                      │
│ 19. 用户点击 → fetchPool()                                       │
│ 20. GET /api/plugins/registry → 401 → _unauthorized              │
│ 21. setLoadError + setItems([])                                  │
│ 22. 回到授权画面!                                                 │
│ 23. tokenVerified 仍然为 true                                    │
│ 24. 按钮可再次点击 → 无限循环                                     │
│                                                                  │
│ 验证失败路径 (valid=false):                                       │
│                                                                  │
│ 15. auth.state = 'invalid'                                       │
│ 16. Topbar 显示 "无效"                                            │
│ 17. PluginPool: tokenVerified = false                            │
│ 18. "重新加载插件池"按钮不显示                                     │
│ 19. TokenInput 显示 "Token 无效或已过期"                          │
│ 20. 用户可重新输入                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. 最小修复建议 (只给建议，不修改代码)

### A. 必须修

#### A1. 后端签发 OpenClaw Token JWT

| 字段 | 值 |
|---|---|
| **文件** | `apps/local-api/src/index.ts` — `POST /api/openclaw/auth/check` handler (L720-735) |
| **原因** | 当前验证成功只返回 `valid: true`, 不产生任何后续请求可用的凭证。插件 API 需要 JWT。 |
| **推荐改法** | 验证成功后调用 `reply.jwtSign()` 签发一个短生命周期（如 1 小时）JWT, 返回字段中加入 `access_token`。前端接收后存入内存, 后续请求附加 `Authorization: Bearer <token>`。 |
| **具体设计** | 新增响应字段 `access_token: string` (JWT, sub=`openclaw_token_user`, role=`viewer`)。TokenInput 验证成功后前端接收此 token, 存入一个内存变量（可在 useAuth 中新增 `sessionJwt`），后续 fetch 请求（如 PluginPool.fetchPool）自动携带 `Authorization` header。或者直接利用前端已有的 `window.fetch` 拦截器在收到有效 access_token 后设置请求头。 |
| **风险** | 低。JWT 只读权限（viewer），有效期短，不影响现有 login JWT 体系。需注意签名密钥与 login JWT 一致。 |

#### A2. PluginPool 验证成功后自动 retry fetchPool

| 字段 | 值 |
|---|---|
| **文件** | `apps/web-ui/src/pages/PluginPool.tsx` — `tokenVerified` useEffect 或 `onVerifiedChange` 回调 |
| **原因** | 当前验证成功后仅显示"重新加载"按钮, 不会自动触发数据加载。用户体验差。 |
| **推荐改法** | 在 `setTokenVerified(true)` 之后自动调用 `fetchPool()`。可在 `onVerifiedChange` 回调中直接调用。但前提是 A1 已实施（fetchPool 需要 JWT）。 |
| **风险** | 若无 A1, 自动 retry 只会立即回到授权画面。A1 是前置条件。 |

### B. 可选修

#### B1. 后端 `/api/plugins/registry` 加入 PUBLIC_PATHS

| 字段 | 值 |
|---|---|
| **文件** | `apps/local-api/src/index.ts` L303 (PUBLIC_PATHS) |
| **原因** | 如果插件注册表数据不需要鉴权, 可以开放。 |
| **推荐改法** | 将 `/api/plugins/registry` 加入 PUBLIC_PATHS set。 |
| **风险** | 中等。开放插件数据可能泄露插件名称、版本等元信息。需要评估安全影响。此方案不解决 ModuleCenter 和 plugin enable/disable 等其他需要 JWT 的 API。 |

#### B2. ModuleCenter 与 PluginPool 共享授权信号

| 字段 | 值 |
|---|---|
| **文件** | `apps/web-ui/src/pages/PluginPool.tsx` + `ModuleCenter.tsx` |
| **原因** | 两页对 auth 的处理逻辑不同: PluginPool 用 `loadError.includes('authentication')` + `tokenVerified`; ModuleCenter 用 `unauthorized` 本地状态 + `authState`。导致行为不一致。 |
| **推荐改法** | 统一为: auth 验证成功后自动重试 API 调用。ModuleCenter 的 `TokenInput` 也应有 `onVerifiedChange` 回调, 验证成功后自动 `refresh()`. |

#### B3. 添加 `onRetry` 回调到 TokenInput

| 字段 | 值 |
|---|---|
| **文件** | `apps/web-ui/src/components/ui/TokenInput.tsx` |
| **原因** | 当前只有 `onVerifiedChange` 通知父组件验证结果。没有 `onAuthorized` 或 `onRetry` 等回调供父组件自动重试。 |
| **推荐改法** | 新增 `onAuthorized?: () => void` prop, 在验证通过后被调用。PluginPool 可传入 `onAuthorized={() => fetchPool()}`。 |

### C. 不应修

| 建议 | 不应修原因 |
|---|---|
| 移除 JWT 中间件 | 破坏整体安全架构。所有非 PUBLIC API 需要鉴权是合理设计。 |
| PluginPool 直接使用 OpenClaw Token 作为 API 凭证 | Token 不应该被用于非 OpenClaw 场景。应使用标准 JWT。 |
| 在 frontend 强行伪造 auth 绕过授权画面 | 不安全, 绕过 API 鉴权后无法加载数据。 |
| 修改 `_unauthorized` 检测逻辑 | `_unauthorized` 检测是正确的降级处理。问题是凭证缺失, 不是检测逻辑。 |

---

## 12. 安全风险判断

| 风险类别 | 等级 | 说明 |
|---|---|---|
| Token 泄漏 | ✅ 无风险 | type="password", 不存储, 不记录 |
| Gate 误开 | ✅ 无风险 | master-switch POST 被 JWT 中间件和路由双重保护 |
| Master-switch 误触发 | ✅ 无风险 | 同上 |
| DB 写操作 | ✅ 无风险 | auth check 端点为只读比较 |
| OpenClaw 控制 | ✅ 无风险 | auth check 端点不调用外部服务 |
| 绕过鉴权 | ✅ 无风险 | OpenClaw Token 验证通过也不能访问需要 JWT 的 API |
| JWT 泄漏 | ⚠️ 低风险 (建议修复后关注) | 如果实施 A1 方案签发临时 JWT，需确保有效期短、权限低 |

---

## 13. 是否建议进入 P5B 修复

**是。** 建议进入 P5B 实施修复方案 A1（后端签发 OpenClaw Token JWT）+ A2（自动 retry fetchPool）。

P5B 预期效果:
1. Token 验证成功 → 后端返回 `access_token` (JWT)
2. useAuth 存储此 JWT 到内存
3. 后续 API 请求自动携带 `Authorization: Bearer <token>`
4. `/api/plugins/registry` 成功返回数据
5. PluginPool 显示插件列表, 不再无限授权画面
6. Topbar 仍显示"已授权", 与页面状态一致
7. Master-switch 仍返回 403 (JWT 权限为 viewer)
8. Gate 仍 CLOSED
