# Stage C Kill Switch Contract

> **Phase:** v7.36.0-D2
> **Status:** FROZEN

## Terms
1. Kill switch must be implemented before any enablement
2. Kill switch must not perform database destructive operations
3. Kill switch must require human-provided reason in audit note
4. Kill switch must be tested in dry-run mode before production
5. Kill switch must not trigger rollback automatically
6. Kill switch must not destroy audit evidence
7. Kill switch must notify human owner after execution

## Enforcement
- All terms are registered in safety harness contract registry
- Kill switch category exists with 4 items
- All terms are status=required

**This is a contract only. No kill switch code is implemented.**
