# Runtime Rollback / Idempotency Spec

**Status:** v7.28.0-P1 Preview Framework Available
**Stage C:** Disabled
**Implementation:** Not implemented (P1 preview shows rollback states as static model)

## 1. Goals

- Define rollback strategy for runtime actions
- Design idempotency key mechanism
- Provide blueprint for future rollback executor

## 2. Non-Goals

- Implement rollback executor
- Recover system from failed actions
- Write to database
- Control external tools
- Enable Stage C

## 3. Idempotency Key Design

| Field | Type | Description |
|-------|------|-------------|
| key | string | UUID v4 generated per action attempt |
| targetId | string | Which runtime target |
| actionLevel | string | L0-L6 level |
| timestamp | string | ISO8601 when key was generated |
| status | string | pending | completed | rolled_back | failed |

Idempotency keys are design-only in v7.28. No key generation, storage, or verification occurs.

## 4. Preview Rollback

- Registry preview: no rollback needed (readonly)
- Dry-run plan preview: no rollback needed (readonly)
- Audit log preview: no rollback needed (readonly)

## 5. Dry-Run Rollback

- Dry-run plans are design-only
- No real execution, no rollback needed
- Plan steps can be regenerated if needed
- Blocked actions remain blocked until gate changes

## 6. Human-Approved Rollback

- Approval workflow has no execution path in v7.28
- No rollback mechanism needed for approval state
- Future: approval rollback would require new approval

## 7. Irreversible Action Prohibition

| Action | Irreversible | Prohibited |
|--------|-------------|------------|
| External tool execution | Yes | Yes (Stage C gated) |
| Database write | Yes | Yes (Stage C gated) |
| File deletion | Yes | Yes (Stage C gated) |
| Git push | Partial | Yes (git-tag-release blocked) |
| Tag/release creation | Yes | Yes (git-tag-release blocked) |

No irreversible action is permitted in v7.28. All such actions are blocked by gates.

## 8. External System Write Preconditions

Before any external system write:
1. Permission Evaluator must pass
2. Dry-run plan must be generated
3. Human approval must be obtained
4. Rollback plan must be defined
5. Stage C must be enabled
6. All gates must pass

## 9. Git Rollback

- Git rollback is not implemented
- Current state: readonly git status and log access
- Future: git revert / reset would require Stage C

## 10. DB Rollback

- No database writes in current version
- No DB rollback mechanism needed
- Future: DB changes would require transaction + rollback support

## 11. Current Version Behavior

- No rollback executor
- No idempotency key storage
- No recovery mechanism
- All operations are readonly
- Stage C permanently disabled
