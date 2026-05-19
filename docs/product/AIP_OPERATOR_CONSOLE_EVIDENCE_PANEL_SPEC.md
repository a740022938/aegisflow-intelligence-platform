# AIP Operator Console Evidence Panel Spec

> **Date:** 2026-05-20
> **Phase:** v7.33.0-D1 (blueprint)

## Purpose

The Evidence Panel displays the latest seal evidence to the operator. It is a read-only display that references existing reports and receipts.

## Data Sources

| Field | Source |
|-------|--------|
| Latest commit | git rev-parse --short HEAD |
| Seal verdict | Final seal recheck doc |
| Smoke results | Live smoke report |
| Smoke status | PASS / FAIL / DEFERRED |
| GET endpoint results | Runtime smoke response |
| POST blocked results | Runtime smoke response |
| Validation status | typecheck and test results |
| Safety boundary | Security scan results |
| Human approval evidence | Human approval doc |

## Display Format

```
=== Evidence Panel ===
Commit:        2dbc495
Seal Verdict:  V7_32_PRODUCTIZATION_SEAL_READY
Smoke Status:  PASS
  - GET /api/runtime/status:    200
  - GET /api/runtime/readiness: 200
  - GET /api/runtime/gates:     200
  - GET /api/runtime/blockers:  200
  - POST execute:               401 (blocked)
  - POST rollback:              401 (blocked)
Validation:
  - typecheck: PASS
  - tests: 38/38 PASS
Safety:
  - Stage C: disabled
  - DB write: not executed
  - External control: not executed
  - Secret scan: clean
Reports:  E:\_AIP_REPORTS\...
Receipts: E:\_AIP_RECEIPTS\...
```

## Evidence Collection Rules

- No new evidence is collected by the panel
- Panel references existing evidence only
- No evidence write to any store
- No upload to external services
- No audit log entry for panel view

## Prohibited Capabilities

| Capability | Status |
|------------|--------|
| Collect new evidence | Prohibited |
| Write to evidence store | Prohibited |
| Upload evidence | Prohibited |
| Generate evidence API | Prohibited |
| Evidence mutation | Prohibited |
