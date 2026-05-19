# Stage C Audit Event Contract

> **Phase:** v7.36.0-D2
> **Status:** FROZEN

## Terms
1. Every enablement/disable/kill must create an audit event
2. Audit events must be append-only (no deletion)
3. Audit events must reference the authorization artifact commit
4. Evidence snapshots must reference audit events
5. Secrets/tokens must be redacted from evidence
6. Audit schema must be designed before any enablement implementation

## Enforcement
- All terms are registered in safety harness contract registry
- Audit category exists with 3 items
- All terms are status=required

**This is a contract only. No audit event store is implemented.**
