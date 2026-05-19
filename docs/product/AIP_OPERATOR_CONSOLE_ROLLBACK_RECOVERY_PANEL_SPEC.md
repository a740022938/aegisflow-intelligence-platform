# AIP Operator Console Rollback / Recovery Panel Spec

> **Date:** 2026-05-20
> **Phase:** v7.33.0-D1 (blueprint)

## Purpose

The Rollback / Recovery Panel provides operators with the information needed to execute a safe rollback or recovery. The panel does NOT execute any action; it references existing documentation and state.

## Panel Contents

### Rollback Documentation Link
- Reference: `docs/product/AIP_READONLY_RUNTIME_API_ROLLBACK_AND_RECOVERY_GUIDE.md`
- Also: `docs/product/AIP_RUNTIME_AUDIT_AND_ROLLBACK_PLAN.md`
- Also: `docs/product/AIP_RUNTIME_ROLLBACK_IDEMPOTENCY_SPEC.md`

### Recovery Documentation Link
- Reference: `docs/product/AIP_READONLY_RUNTIME_API_ROLLBACK_AND_RECOVERY_GUIDE.md`
- Also: `docs/product/AIP_READONLY_RUNTIME_API_OPERATOR_GUIDE.md`

### Known Safe Commit
- Latest sealed commit hash from the seal chain
- Example: `2dbc495` (v7.32 productization baseline)

### Latest Sealed Commit
- Displayed from the seal chain record
- Shows which phases have been formally sealed

### Restart Policy Link
- Reference: `docs/product/AIP_READONLY_RUNTIME_API_HUMAN_APPROVED_RESTART_POLICY.md`
- Also: `docs/product/AIP_HUMAN_APPROVED_RESTART_CHECKLIST.md`

### Stale Server Recovery Note
- If runtime endpoints return 401, server is stale
- Follow restart policy
- Do NOT restart without human approval
- Reference: `docs/product/AIP_V7_32_D2_LIVE_SMOKE_ROOT_CAUSE_REVIEW.md`

## Prohibited Capabilities

| Capability | Status |
|------------|--------|
| Automatic rollback | Prohibited |
| Automatic restart | Prohibited |
| Rollback execution button | Prohibited |
| Recovery execution button | Prohibited |
| DB rollback | Prohibited |
| Runtime state rollback | Prohibited |
| Approval queue rollback | Prohibited |
| Evidence store rollback | Prohibited |
