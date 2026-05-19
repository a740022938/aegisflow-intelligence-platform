# AIP Operator Console Status Model

> **Date:** 2026-05-20
> **Phase:** v7.33.0-D1 (blueprint)

## Status Definitions

### sealed
- **Display label:** Sealed
- **Meaning:** Phase has been formally sealed. All acceptance criteria met.
- **Allowed next step:** Proceed to next phase
- **Forbidden action:** Reopen phase without recheck
- **Evidence source:** Final seal recheck doc, commit hash

### ready
- **Display label:** Ready
- **Meaning:** Phase deliverables complete, waiting for human approval to seal.
- **Allowed next step:** Request seal recheck
- **Forbidden action:** Skip recheck and proceed
- **Evidence source:** Phase completion report, validation results

### degraded
- **Display label:** Degraded
- **Meaning:** System is running but some capabilities are unavailable.
- **Allowed next step:** Investigate and restore
- **Forbidden action:** Proceed to next phase
- **Evidence source:** Runtime status, health endpoint

### deferred
- **Display label:** Deferred
- **Meaning:** Action or check postponed pending prerequisite.
- **Allowed next step:** Complete prerequisite
- **Forbidden action:** Skip prerequisite
- **Evidence source:** Root cause doc, policy doc

### blocked
- **Display label:** Blocked
- **Meaning:** A gate or blocker prevents progression.
- **Allowed next step:** Review blockers, resolve blocking condition
- **Forbidden action:** Bypass blocker
- **Evidence source:** Blocker API, blocker matrix

### unknown
- **Display label:** Unknown
- **Meaning:** Status cannot be determined (server not running, no data).
- **Allowed next step:** Check server state, restart if approved
- **Forbidden action:** Assume pass
- **Evidence source:** Error response, timeout

### not_applicable
- **Display label:** N/A
- **Meaning:** This capability is not in scope for the current phase.
- **Allowed next step:** None (not applicable)
- **Forbidden action:** Enable or implement
- **Evidence source:** Phase scope doc

## P3 Usage Notes
- P3 adds checklist-only status tracking: pass, ready, deferred, blocked, not_applicable, unknown
- Checklist item statuses are static — no status transition mechanism exists
- P3 evidence linkage uses a separate static type system (OperatorEvidenceType)
- P3 verdict: V7_33_P3_OPERATOR_CHECKLIST_EVIDENCE_LINKAGE_PREVIEW_READY
- Next phase: P4 Operator Console Seal Candidate

## P2 Usage Notes
- P2 Operator Console Readonly UI Preview uses static status data from P1 registry
- No runtime status API calls from the P2 preview page
- All displayed statuses are readonly — no status transitions possible from this page
- P2 verdict: V7_33_P2_OPERATOR_CONSOLE_READONLY_UI_PREVIEW_READY
- Next phase: P3 Operator Checklist + Evidence Linkage Preview

## Status Transition Rules

- sealed → ready: Not allowed (sealed is terminal per phase)
- ready → sealed: Allowed after human-approved seal recheck
- deferred → ready: Allowed after prerequisite resolved
- blocked → ready: Allowed after blocker resolved
- unknown → any: Allowed after server restored
- not_applicable → ready: Allowed when phase adds scope
