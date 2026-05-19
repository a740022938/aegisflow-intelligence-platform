# AIP Runtime API Implementation Freeze Checklist

> **Checklist Version:** v1.0
> **AIP Baseline:** v7.30.0-D2
> **Date:** 2026-05-19
> **Status:** freeze checklist — implementation not authorized

## 1. Before Any Implementation

The following must all be completed before any Runtime API endpoint can be implemented:

### 1.1 Human Owner Approval

- [ ] Human project owner has explicitly approved the implementation task
- [ ] Approval is documented in writing (commit message, issue, or task description)
- [ ] Approval includes scope of endpoints to implement

### 1.2 Final Seal Recheck

- [ ] Current final seal status is verified (V7_xx_FINAL_SEAL_READY)
- [ ] Working tree is clean
- [ ] No uncommitted changes
- [ ] origin/main is consistent

### 1.3 Contract Freeze Review

- [ ] Contract freeze document (AIP_RUNTIME_API_CONTRACT_FREEZE.md) has been reviewed
- [ ] Contract version is confirmed
- [ ] Endpoint catalog is complete and accurate
- [ ] No endpoint is implemented without contract freeze sign-off

### 1.4 Blocker Matrix Review

- [ ] AIP_RUNTIME_IMPLEMENTATION_BLOCKER_MATRIX.md has been reviewed
- [ ] All relevant blockers for the target endpoint are resolved
- [ ] Blocker resolution is documented

### 1.5 Stage C Gate Review

- [ ] Stage C status is confirmed (enabled/disabled)
- [ ] If endpoint requires Stage C: Stage C activation has been approved by human project owner
- [ ] Stage C activation task has been completed
- [ ] Stage C readiness checklist has been verified

### 1.6 DB Write Policy Review

- [ ] If endpoint requires DB write: DB write authorization has been granted by human project owner
- [ ] DB write policy is documented
- [ ] DB schema is designed and reviewed

### 1.7 External Control Policy Review

- [ ] If endpoint requires external control: external control authorization has been granted
- [ ] External control policy is documented
- [ ] External tool connection design is reviewed

### 1.8 Secret Handling Policy Review

- [ ] If endpoint processes secrets: secret handling policy is documented and approved
- [ ] Secret redaction gate is confirmed operational
- [ ] No secret material is exposed in contract definitions

## 2. Must Not Implement Automatically

The following components must NOT be implemented automatically by any assistant or automated process:

| Component | Reason |
|-----------|--------|
| POST /runtime/execute | Requires Stage C, human approval, runtime evaluator, permission function, external control authorization |
| POST /runtime/rollback | Requires Stage C, human approval, rollback executor, git protection policy |
| POST /runtime/approval/request | Requires Stage C, human approval queue, DB write |
| Approval queue | Requires DB write, Stage C, candidate processing approval |
| Evidence store | Requires DB write, Stage C, secret handling policy |
| Audit writer | Requires DB write, Stage C, audit logger implementation |
| DB write | Requires Stage C, DB write authorization |
| External control | Requires Stage C, external control authorization |
| Rollback executor | Requires Stage C, git protection policy |
| Secret capture | Requires Stage C, secret handling policy |
| Candidate processing | Requires DB write, Stage C |
| Git tag/release | Requires project lead decision, Stage C |
| Stage C activation | Requires human project owner decision only |

## 3. Dedicated Future Tasks Required

The following items each require a dedicated future task (cannot be combined into a single implementation pack):

| Task | Description | Prerequisites |
|------|-------------|---------------|
| Readonly status backend | Implement GET /runtime/status, /readiness, /gates, /blockers | Contract freeze review, blocker matrix review |
| Dry-run contract backend | Implement POST /runtime/dry-run/preview | Stage C activation, runtime evaluator |
| Audit store design | Design and implement audit event storage | DB write authorization, audit logger implementation |
| Stage C pre-enable human review pack | Prepare review pack for human project owner | All 14 gates verified |
| Human approval queue | Design and implement approval queue | DB write authorization, Stage C activation |
| Evidence store | Design and implement evidence capture | Secret handling policy, DB write authorization |
| Rollback executor | Design and implement rollback execution | Git protection policy, Stage C activation |
| External control integration | Design and implement external tool control | Stage C activation, runtime evaluator, permission function |

## 4. Implementation Order

When implementation is authorized, the recommended order is:

1. Readonly status backend (no Stage C needed)
2. Dry-run contract backend (requires Stage C)
3. Audit store design (requires DB write authorization)
4. Stage C pre-enable human review pack
5. Human approval queue (requires Stage C + DB write)
6. Evidence store (requires Stage C + DB write + secret policy)
7. Rollback executor (requires Stage C + git policy)
8. External control integration (requires Stage C + all above)

## 5. Freeze Checklist Enforcement

- This checklist is part of the contract freeze — no implementation shall proceed without passing all applicable checks
- Any implementation attempt without checklist sign-off is a policy violation
- The freeze checklist is enforced by documentation policy, not by runtime code
- Violations should be reported to the human project owner

## 6. Current Status

| Item | Status |
|------|--------|
| Human owner approval | NOT GRANTED |
| Final seal recheck | V7_29_FINAL_SEAL_READY |
| Contract freeze review | IN PROGRESS (this document set) |
| Blocker matrix review | PENDING |
| Stage C gate review | STAGE C DISABLED |
| DB write policy review | PENDING |
| External control policy review | PENDING |
| Secret handling policy review | PENDING |

## v7.30 Final Seal + v7.31 Blueprint

- **v7.30 Final Seal Status:** V7_30_FINAL_SEAL_READY (commit f55f952)
- **v7.31 Backend Readonly API Blueprint:** See `AIP_BACKEND_READONLY_API_IMPLEMENTATION_BLUEPRINT.md` — design-only, not implemented
- **Backend endpoint:** NOT implemented (blueprint only)
- **Runtime implementation:** NOT implemented (blueprint only)
- **Stage C:** Permanently disabled
- **DB write:** Not performed
- **External control:** Not enabled
- **Tag/Release:** Not created
