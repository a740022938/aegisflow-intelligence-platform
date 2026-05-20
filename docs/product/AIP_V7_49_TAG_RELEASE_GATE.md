# AIP v7.49 — Tag / Release Gate

**Date:** 2026-05-20
**Phase:** P4
**Baseline HEAD:** `8296250`

---

## 1. Purpose

Define the mandatory gate that must be passed before a git tag or GitHub Release can be created for v7.49. This gate prevents unauthorized or premature releases.

## 2. Gate Conditions

All of the following MUST be true before a tag or release is created:

| # | Condition | Status |
|---|-----------|--------|
| 1 | Human owner authorization received (written or verbal, with receipt) | ❌ NOT YET |
| 2 | Final version number decided (e.g. `v7.49.0`) | ❌ NOT YET |
| 3 | Final tag name confirmed | ❌ NOT YET |
| 4 | Release notes draft reviewed and approved by human | ❌ NOT YET |
| 5 | Final secrets scan passed (no hardcoded secrets in tracked files) | ✅ PASS (P2) |
| 6 | Restore/rollback evidence attached | ❌ NOT YET |
| 7 | Fresh install smoke test passed | ❌ NOT YET |
| 8 | Release authorization receipt generated | ❌ NOT YET |
| 9 | Stage C remains DISABLED (separate authorization required) | ✅ DISABLED |

**Gate status: CLOSED** — 5 of 9 conditions remain unmet.

## 3. Prohibited Actions

| Action | Rule |
|--------|------|
| Create a tag without authorization | ❌ FORBIDDEN |
| Create a GitHub Release without authorization | ❌ FORBIDDEN |
| Treat "continue" as implicit release authorization | ❌ FORBIDDEN |
| Treat Local RC status as permission to release | ❌ FORBIDDEN |
| Enable Stage C during release process | ❌ FORBIDDEN (separate gate) |

## 4. Authorization Process

1. Human owner provides explicit authorization (see `AIP_V7_49_RELEASE_AUTHORIZATION_TEMPLATE.md`)
2. Release receipt is generated and stored
3. Tag is created only after receipt is filed
4. GitHub Release is created only after tag exists and receipt is referenced

## 5. Gate Open Conditions

The gate transitions from CLOSED to OPEN when:
- All 9 conditions above are ✅
- Authorization receipt is filed in `docs/product/`
- Human owner explicitly confirms "gate is open"

## 6. Safety

- Automation will NEVER open this gate
- Only human owner can authorize gate transition
- Stage C has a completely independent gate (remains CLOSED)
