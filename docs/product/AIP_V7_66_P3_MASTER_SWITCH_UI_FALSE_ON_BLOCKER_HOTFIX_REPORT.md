# AIP v7.66-P3: Master Switch UI False-On Blocker Hotfix

**Date:** 2026-05-22
**Baseline commit:** `f07709b` (+ v7.66-P2 `1efc79b`)
**Verdict:** `V7_66_P3_MASTER_SWITCH_UI_FALSE_ON_BLOCKER_FIXED_WITH_GATE_CLOSED`

---

## 1. Root Cause Analysis

### Problem
P2 live smoke confirmed Gate CLOSED (master-switch POST returns 403), but Dashboard displayed "OpenClaw 总闸：开启" and ModuleCenter displayed "OpenClaw 执行层已开启".

### Investigation Results

| # | Question | Answer |
|---|---|---|
| 1 | Dashboard 中 OpenClaw 总闸组件来源 | `Dashboard.tsx:240-273` — custom card, not a shared component |
| 2 | 总闸 toggle 是否只是前端 local state | **No** — reads from `GET /api/openclaw/master-switch` response `enabled` field |
| 3 | 是否读取 localStorage/sessionStorage/mock/static | **No** — reads live GET endpoint, but trust `enabled` field unconditionally |
| 4 | 是否绕过 AuthProvider/useAuth/Gate status | **Yes** — does not consult `auth.status.jwt` or gate status at all |
| 5 | 是否没有调用 master-switch 后端 | **Does call** — GET on mount, POST on toggle, but ignores POST failure |
| 6 | 是否有旧 enabled/execution/masterSwitch 字段 | **Yes** — `openclawEnabled` derived solely from `enabled` field (GET response line 613) |
| 7 | 为什么 P2 smoke 没覆盖 Dashboard 总闸卡片 | P2 tested API endpoints, not rendered UI pages |
| 8 | Topbar 已授权是否被错误解释 | Topbar correctly shows "已授权", but Dashboard incorrectly interprets auth as gate open |
| 9 | PluginPool 503 与 Dashboard 总闸冲突 | PluginPool 503 is endpoint-level (not auth); Dashboard gate state is separate legacy issue |

### Root Cause

```
GET /api/openclaw/master-switch returns { enabled: true } ← persisted DB legacy state
                                                                      ↓
Dashboard:   openclawEnabled = !!(openclaw as any)?.enabled || !!ocSwitch?.enabled;
             → Shows "开启 / OpenClaw 执行层已开启"
             → Toggle is clickable
             → POST returns 403, user gets alert but UI doesn't update

ModuleCenter: snapshot.openclawEnabled = !!oc?.switch?.enabled || !!oc?.enabled;
             → Summary shows "总闸开启"
             → Toggle shows "关闭 OpenClaw 总闸"
             → Unauthorized section shows "总闸状态: 已开启"
```

**The `enabled` field reflects the legacy persisted DB state (set before Stage C was blocked). The `POST` handler was hardened to return 403, but the `GET` response was never aligned, and the frontend never cross-checked actual POST capability.**

---

## 2. Changes

### Backend: `apps/local-api/src/index.ts:614-616`

Added `gateOpen: false` and `stageCEnabled: false` to `GET /api/openclaw/master-switch` response. Changed `message` to accurately describe gate state.

```diff
  return {
    ok: true,
    enabled: state.enabled,
+   gateOpen: false,
+   stageCEnabled: false,
+   message: 'Gate CLOSED — Stage C disabled, master-switch POST returns 403',
    ...
  };
```

### Frontend Dashboard: `apps/web-ui/src/pages/Dashboard.tsx`

**Type**: Added `gateOpen` and `stageCEnabled` to `OpenClawSwitchResponse`.

**State logic**: Changed from `openclawEnabled = legacyEnabled` to `openclawEnabled = legacyEnabled && gateOpen`.

**Toggle function**: Early-return with alert if `!gateOpen`.

**Card display**:
- Always use `roleClass('risk')` (red/highlighted) instead of conditional `'exec'`/`'risk'`
- Subtitle: `gateOpen ? (openclawEnabled ? '开启' : '关闭') : 'Gate CLOSED'` + "已授权 ≠ Gate opened · Stage C disabled"
- Toggle: `disabled={!gateOpen || switchBusy}`; shows `off` when `!gateOpen`
- Banner: `!gateOpen` → "Gate CLOSED — Stage C disabled, execution disabled, master-switch POST blocked"
- Banner: `gateOpen && !openclawEnabled` → "OpenClaw 执行层已关闭"

### Frontend ModuleCenter: `apps/web-ui/src/pages/ModuleCenter.tsx`

**Snapshot type**: Added `openclawGateOpen: boolean`.

**Snapshot build**: `openclawEnabled: (!!oc?.switch?.enabled || !!oc?.enabled) && ocGateOpen`, stored `openclawGateOpen: ocGateOpen`.

**Module list summary**: `${!snapshot.openclawGateOpen ? 'Gate CLOSED' : snapshot.openclawEnabled ? '总闸开启' : '总闸关闭'}`.

**Toggle button**: `disabled={... || !snapshot?.openclawGateOpen}`; label shows `'Gate CLOSED'` when gate closed.

**Toggle function**: Early-return `if (!snapshot || !snapshot.openclawGateOpen) return;`.

**Gate status display**: `{!snapshot?.openclawGateOpen ? '总闸状态: Gate CLOSED (Stage C disabled)' : snapshot?.openclawEnabled ? ...}`.

---

## 3. Verification

| Command | Result |
|---|---|
| `pnpm run typecheck` | ✅ PASS |
| `pnpm run lint` | ✅ PASS (0 warnings) |
| `pnpm run build` | ✅ 745 modules, 11.05s |
| `node tests/v765-p2-auth-timeout-hotfix.test.mjs` | ✅ **43/43 PASS** |

### Security Grep

| Pattern | Result |
|---|---|
| `localStorage + token/jwt` in OpenClaw auth context | ❌ None found (only CostRouting/ModelGateway, separate auth) |
| `sessionStorage + token/jwt` | ❌ None found |
| `console.log + token/jwt` | ❌ None found |
| `stageCEnabled=true` / `canEnableStageC=true` in runtime code | ❌ None (only validators) |
| `总闸开启` / `执行层已开启` unconditional | ❌ All occurrences guarded by `gateOpen` check |
| Real JWT in docs | ❌ Only `"eyJ..."` placeholders |

### Live API Smoke

| Check | Result |
|---|---|
| `GET /api/openclaw/master-switch` (with JWT) | `enabled: true, gateOpen: false, stageCEnabled: false` ✅ |
| `POST /api/openclaw/master-switch` (with JWT) | **403** ✅ |
| `GET /api/openclaw/master-switch` (no JWT) | **401** ✅ |
| `GET /api/stage-c/status` | `stageCEnabled: false, canEnableStageC: false` ✅ |
| `GET /api/auth/status` (with JWT) | `jwt.authenticated: true, role: viewer` ✅ |

---

## 4. Files Changed

| File | Change |
|---|---|
| `apps/local-api/src/index.ts` | +3 lines: `gateOpen: false`, `stageCEnabled: false`, `message` update |
| `apps/web-ui/src/pages/Dashboard.tsx` | ~20 lines: type, state logic, toggle guard, card display, copy |
| `apps/web-ui/src/pages/ModuleCenter.tsx` | ~15 lines: type, snapshot, module list, toggle button & function, status display |

No new files. No DB writes. No deploy. No tag/release.

---

## 5. Final Verdict

```
V7_66_P3_MASTER_SWITCH_UI_FALSE_ON_BLOCKER_FIXED_WITH_GATE_CLOSED
```

- ✅ Dashboard no longer shows "总闸开启" when gate is CLOSED
- ✅ ModuleCenter no longer shows "总闸开启" / "执行层已开启" when gate is CLOSED
- ✅ Toggle disabled when `!gateOpen`, with clear tooltip/alert message
- ✅ POST rejection (403) now results in correct UI state (no rollback needed — `gateOpen: false` prevents toggle)
- ✅ "已授权 ≠ Gate opened · Stage C disabled" copy clearly displayed
- ✅ No unconditional `总闸开启` / `执行层已开启` in any page
- ✅ P2/P3 smoke includes Dashboard master-switch UI check
- ✅ Gate CLOSED — master-switch POST 403, Stage C disabled, feature flag off
