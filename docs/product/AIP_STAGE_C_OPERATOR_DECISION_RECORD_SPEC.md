# Stage C Operator Decision Record Spec

> **Date:** 2026-05-20
> **Phase:** v7.34.0-D1

## Purpose

Define the structure and content requirements for operator decision records created during Stage C readiness evaluation.

## Record Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique record identifier |
| operatorName | string | Yes | Name of creating operator |
| timestamp | ISO8601 | Yes | Record creation timestamp |
| phase | string | Yes | Phase identifier (e.g., v7.34.0-P1) |
| verdict | string | Yes | One of: ready, not_ready, deferred, denied |
| validatorResult | object | Yes | Full validator result |
| evidenceRefs | string[] | Yes | List of evidence references used |
| safetyConfirmation | object | Yes | Safety boundary check results |
| riskNotes | string | No | Operator notes on risks |
| humanOwnerReview | object | No | Human owner review (if completed) |
| escalationStatus | string | No | One of: none, pending, escalated, resolved |

## Required Validator Results

The decision record must include:

- Total checks
- Blocking count
- Warning count
- Info count
- Pass/fail status
- List of failed checks with messages

## Required Evidence References

Must reference:

- Validator output
- Smoke test results
- Safety boundary confirmation
- Evidence completeness check
- Each required evidence item by path

## Record Lifecycle

```
Created (operator) → Submitted (operator) → Under Review (human owner)
→ Approved / Denied (human owner) → Archived (immutable)
```

## Invariant

```
Stage C remains disabled.
No runtime executor is implemented.
No POST runtime action is implemented.
No DB write is permitted.
No external control is permitted.
```
