# AIP v7.46 — Security Gap Closure Plan

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Phase:** P2

---

## 1. Objective

Close the 2 critical API security gaps and 2 medium gaps identified in D0 review. Make `scripts/restore.mjs` safe by default.

## 2. Gap Inventory

| Gap | Severity | Location | Current Behavior |
|-----|----------|----------|------------------|
| master-switch public POST writes DB | CRITICAL | `apps/local-api/src/index.ts:621` | Public POST, no auth, directly writes openclaw_control table |
| token bootstrap bypass | CRITICAL | `apps/local-api/src/index.ts:707-708` | Unauthenticated admin token init when no admin token exists |
| Hardcoded JWT secret fallback | MEDIUM | `apps/local-api/src/index.ts:286` | `'aip-dev-jwt-secret-change-in-production'` in source |
| Default admin password hardcoded | MEDIUM | `apps/local-api/src/auth/index.ts:42` | `hashPassword('aip-admin')` |
| Legacy restore script live | HIGH | `scripts/restore.mjs` | Performs real file operations outside plan-only system |

## 3. Fix Rules

### 3.1 master-switch POST

- Under Stage C disabled, POST must return 403 or 501
- Must not write to DB
- GET status must remain functional (readonly)
- Add test verifying POST does not write DB

### 3.2 token bootstrap bypass

- Remove unauthenticated bootstrap mode
- Token initialization must require explicit config or env var
- API must not auto-create tokens

### 3.3 JWT fallback

- Remove hardcoded default secret
- Crash if JWT_SECRET not configured in production
- Dev fallback only with explicit env var opt-in

### 3.4 Default admin password

- Document as known dev default
- Force password change on first login (if login exists)
- At minimum, add warning in startup logs

### 3.5 restore.mjs

- Default mode: plan-only (print what would be done, do nothing)
- Real restore requires explicit `--execute` AND additional human confirmation
- Add clear warning banner at script start
- Consider renaming to `restore.plan.mjs`

## 4. Test Requirements

- POST master-switch under Stage C disabled returns 403/501
- POST master-switch does not mutate DB state
- Token bootstrap cannot create token without env config
- Missing JWT_SECRET causes startup failure
- restore.mjs default run is plan-only

## 5. Safety

- Stage C remains disabled throughout
- Feature flag remains off
- No new mutation endpoints added
- Only existing endpoints made safer (fail-closed)
