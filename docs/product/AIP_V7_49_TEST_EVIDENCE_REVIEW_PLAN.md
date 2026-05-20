# AIP v7.49 — Test Evidence Review Plan

**Status:** D1 Blueprint
**Date:** 2026-05-20
**Phase:** P1

---

## 1. Objective

Review the deferred `pnpm test` evidence from v7.48-P5. Determine whether the test suite can be executed or must remain deferred, and document the decision with clear reasoning.

## 2. Prerequisites

- `pnpm install` succeeds
- `pnpm run typecheck` passes
- `pnpm run build` succeeds

## 3. Test Execution Decision Tree

```
Check if API is running at http://127.0.0.1:8787
  ├── YES → Run pnpm test
  │         ├── PASS → Record evidence
  │         └── FAIL → Diagnose and document
  └── NO  → Do NOT start/restart automatically
            ├── Human owner authorizes start/restart → Start, run tests, stop, document
            └── No authorization → Defer pnpm test with documented reason
```

## 4. Documentation Outputs

### If API is running and tests pass:

- `docs/product/AIP_V7_49_TEST_EVIDENCE_RESULT.md` — test output summary
- Test results recorded as RC evidence

### If API is not running (no restart auth):

- `docs/product/AIP_V7_49_PNPM_TEST_DEFERRED_DECISION.md` — deferral documented
- `docs/product/AIP_V7_49_API_RUNTIME_SMOKE_AUTHORIZATION_POLICY.md` — policy for future

## 5. Policy

- No agent may start or restart the AIP API service without explicit human owner authorization
- If authorization is granted, the action must be documented in a receipt
- Unauthorized service start is a safety boundary violation

## 6. Safety

- No service restart without authorization
- No DB writes
- No Stage C changes
- Readonly verification only
