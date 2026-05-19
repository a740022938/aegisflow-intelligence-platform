# AIP Operator Console Risk and Blocker Model

> **Date:** 2026-05-20
> **Phase:** v7.33.0-D1 (blueprint)

## Risk Types

### Stage C Risk
- **Severity:** Critical
- **Description:** Stage C must remain disabled. Any enablement is a critical violation.
- **Evidence:** stageCEnabled field in runtime status
- **Mitigation:** Permanent policy enforcement, code audit

### POST Implementation Risk
- **Severity:** Critical
- **Description:** POST runtime endpoints must remain blocked. Any new POST handler is a critical violation.
- **Evidence:** POST endpoint returns 401
- **Mitigation:** No POST route handlers in runtime module

### DB Write Risk
- **Severity:** Critical
- **Description:** No database write operations from runtime module.
- **Evidence:** dbWriteEnabled field in runtime status
- **Mitigation:** No DB write code path in runtime

### External Control Risk
- **Severity:** Critical
- **Description:** No external tool control from runtime module.
- **Evidence:** externalControlEnabled field in runtime status
- **Mitigation:** No external control code path

### Executor Risk
- **Severity:** Critical
- **Description:** No runtime executor exists.
- **Evidence:** executor search result
- **Mitigation:** Code audit, no executor files

### Stale Server Risk
- **Severity:** High
- **Description:** Server running old code returns 401 for runtime endpoints.
- **Evidence:** Runtime endpoints return 401
- **Mitigation:** Human-approved restart, stale server detection

### Smoke Failure Risk
- **Severity:** High
- **Description:** Live smoke fails to validate endpoints.
- **Evidence:** Smoke report, endpoint response
- **Mitigation:** Investigate, fix, re-run smoke

### Missing Evidence Risk
- **Severity:** Medium
- **Description:** Reports or receipts missing for audit trail.
- **Evidence:** Missing file paths
- **Mitigation:** Generate reports before seal

### Dirty Tree Risk
- **Severity:** Medium
- **Description:** Uncommitted changes in working tree.
- **Evidence:** git status
- **Mitigation:** Commit or stash before proceeding

### Version Drift Risk
- **Severity:** Medium
- **Description:** Local branch diverged from origin/main.
- **Evidence:** git status ahead/behind
- **Mitigation:** Pull or push before proceeding

### Sidebar Exposure Risk
- **Severity:** High
- **Description:** Hidden preview routes exposed in sidebar or navigation.
- **Evidence:** Sidebar config audit
- **Mitigation:** Keep sidebar unchanged, only docs references

### Secret Leakage Risk
- **Severity:** Critical
- **Description:** Secrets, tokens, keys or credentials in code or docs.
- **Evidence:** Security scan
- **Mitigation:** Code review, secret scanning

## Blocker Matrix

| Blocker ID | Risk Type | Severity | Blocked |
|------------|-----------|----------|---------|
| stage_c_disabled | Stage C Risk | Critical | true |
| db_write_blocked | DB Write Risk | Critical | true |
| external_control_blocked | External Control Risk | Critical | true |
| post_endpoints_blocked | POST Implementation Risk | High | true |
