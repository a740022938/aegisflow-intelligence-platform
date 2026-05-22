# AIP v7.66-P3: Master Switch UI False-On Blocker Hotfix Receipt

**Verdict:** `V7_66_P3_MASTER_SWITCH_UI_FALSE_ON_BLOCKER_FIXED_WITH_GATE_CLOSED`
**Date:** 2026-05-22

---

## Summary

Hotfix for Dashboard/ModuleCenter displaying "OpenClaw 总闸：开启" / "OpenClaw 执行层已开启" when backend gate is CLOSED (POST returns 403).

Root cause: Frontend derived `openclawEnabled` from legacy persisted `enabled` field in GET response without cross-checking actual POST capability. Backend GET never told frontend that POST is blocked.

Fix: Backend adds `gateOpen: false` to GET response. Frontend uses `gateOpen` (not `enabled`) for gate display and toggle enablement.

## Changes

| File | Lines | Description |
|---|---|---|
| `apps/local-api/src/index.ts` | +3 | `gateOpen: false`, `stageCEnabled: false` in GET master-switch |
| `Dashboard.tsx` | ~20 | Type, state logic, toggle guard, card display, copy |
| `ModuleCenter.tsx` | ~15 | Type, snapshot, module list, toggle, status display |

## Verification

| Check | Result |
|---|---|
| `pnpm run typecheck` | ✅ |
| `pnpm run lint` | ✅ |
| `pnpm run build` | ✅ 745 modules, 11.05s |
| `node tests/v765-p2-auth-timeout-hotfix.test.mjs` | ✅ **43/43 PASS** |
| Security grep (localStorage/sessionStorage/console/jwt/Stage C) | ✅ All clean |
| No unconditional "总闸开启" / "执行层已开启" | ✅ All guarded by `gateOpen` |

### Live API

| Endpoint | Result |
|---|---|
| `GET /api/openclaw/master-switch` (with JWT) | `gateOpen: false` ✅ |
| `POST /api/openclaw/master-switch` (with JWT) | 403 ✅ |
| `GET /api/openclaw/master-switch` (no JWT) | 401 ✅ |
| `GET /api/stage-c/status` | `stageCEnabled: false` ✅ |

## Gate Boundary

| Item | Status |
|---|---|
| Gate CLOSED (POST 403) | ✅ |
| Stage C disabled | ✅ |
| No DB write | ✅ |
| No deploy/tag/release/restore | ✅ |
| No JWT/token leaks | ✅ |

## Report

`docs/product/AIP_V7_66_P3_MASTER_SWITCH_UI_FALSE_ON_BLOCKER_HOTFIX_REPORT.md`
