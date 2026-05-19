# Human Approval Workflow Preview

> **v7.28.0-P2** · Readonly Preview  
> **Route:** `/human-approval-workflow-preview`  
> **Sidebar:** Not in sidebar (hidden direct)  
> **Core Tenet:** Readonly approval workflow visualization. No approval queue, no candidate processing, no approve/reject/archive.

---

## Relationship to SPEC

This PREVIEW document describes the P2 frontend readonly preview implementation. The detailed approval workflow design specification is in `AIP_HUMAN_APPROVAL_WORKFLOW_SPEC.md`.

- **SPEC** (`AIP_HUMAN_APPROVAL_WORKFLOW_SPEC.md`): Design baseline — defines approval states, transitions, request kinds, decision matrix
- **PREVIEW** (this document): P2 frontend readonly preview — shows 20 workflow items, state board, request kinds, decision matrix, evidence/rollback board

## Safety Constraints

| Capability | Status |
|------------|--------|
| Approval queue | Not implemented |
| Candidate processing | Not implemented |
| Approve/Reject/Archive | Not implemented |
| DB write | Disabled |
| Stage C | Disabled |
| External control | Disabled |
| Sidebar | Not in sidebar |

## Registry

The Human Approval Registry (`human-approval-registry.ts`) defines 21 items covering all request kinds. The validator (`human-approval-validator.ts`) enforces that no approval queue, no candidate processing, and no execution actions are allowedNow.

## Related

- [Human Approval Workflow SPEC](AIP_HUMAN_APPROVAL_WORKFLOW_SPEC.md)
- [Governance Console Aggregator Preview](AIP_GOVERNANCE_CONSOLE_AGGREGATOR_PREVIEW.md)
