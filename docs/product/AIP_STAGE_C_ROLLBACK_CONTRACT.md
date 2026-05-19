# Stage C Rollback Contract

> **Phase:** v7.36.0-D2
> **Status:** FROZEN

## Terms
1. Rollback plan must exist before any enablement
2. Recovery plan for failed enablement must exist
3. Rollback must be idempotent (safe to run multiple times)
4. All enablement operations must be idempotent
5. Dry-run mode must execute before any actual state change
6. Canary deployment required for Stage C enablement
7. Rate limiting required on enable/disable/kill endpoints

## Enforcement
- All terms are registered in safety harness contract registry
- Rollback category exists with 7 items
- All terms are status=required

**This is a contract only. No rollback code is implemented.**
