# Human Approval Workflow Spec

**Status:** v7.28.0-P1 Preview Framework Available
**Stage C:** Disabled
**Implementation:** Not implemented (P1 preview shows blocked transitions but no approval execution)

## 1. Goals

- Define the human approval workflow for runtime actions
- Specify approval request content and state machine
- Provide blueprint for future Governance Center integration

## 2. Non-Goals

- Implement approval queue
- Process approval candidates
- Write to database
- Execute actions upon approval
- Enable Stage C

## 3. Approval Request Content

| Field | Type | Description |
|-------|------|-------------|
| actor | string | Who initiated the action |
| target | string | Which runtime target |
| actionLevel | RuntimeActionLevel | L0-L6 level |
| dryRunPlanId | string | Reference to dry-run plan |
| risk | RuntimeRisk | low/medium/high/critical |
| evidence | EvidenceRef[] | Links to evidence |
| rollbackPlanId | string | Reference to rollback plan |
| auditFields | object | Timestamp, source, session |

## 4. Approval States

| State | Description | Allowed Transitions |
|-------|-------------|-------------------|
| `draft` | Request not yet submitted | → pending_human_review |
| `pending_human_review` | Awaiting human decision | → approved_for_dry_run, approved_for_execution, rejected |
| `approved_for_dry_run` | Approved for dry-run only | → approved_for_execution |
| `approved_for_execution` | Approved for real execution | → (requires Stage C) |
| `rejected` | Denied by human | → draft (resubmit) |
| `expired` | Timeout exceeded | → draft (resubmit) |
| `revoked` | Revoked after approval | → draft |

## 5. Current Version Constraints

| Feature | Status |
|---------|--------|
| Approval queue UI | Not implemented |
| Candidate processing | Not implemented |
| DB write for approvals | Not implemented |
| Real approval execution | Not implemented |
| Approval state persistence | Not implemented |

## 6. Stage C Relationship

- `approved_for_execution` state requires Stage C to proceed
- Stage C is disabled in v7.28
- No approval workflow can transition to real execution
- `approved_for_dry_run` is the terminal state in current version

## 7. Governance Center Relationship

- Approval workflow is displayed as a module in Governance Center
- All approval states are readonly (display only)
- No approve/reject buttons are rendered
- Stage C gate status is displayed as `deferred`

## 8. Security Notes

- No auto-approval mechanism
- No token/API key storage in approval requests
- Approval records are for display only
- All approval data is ephemeral (not persisted)

## 9. v7.28.0-P3 Evidence Schema Preview

**P3 Evidence Schema Preview** is established as a readonly preview at `/evidence-schema-preview` (hidden direct). It provides a static display of evidence types and schema draft only — **no evidence writer, no evidence store, no secret capture, no DB write, no external control, and Stage C disabled**.
