# AIP Operator Console Information Architecture

> **Date:** 2026-05-20
> **Phase:** v7.33.0-D1 (blueprint)

## Overview

The Operator Console organizes read-only information into logical modules. Each module is either a display-only panel, a hidden preview link, or a documentation reference.

## Module Map

| Module | Type | Description |
|--------|------|-------------|
| System Overview | Display | Health, uptime, version, database status |
| Runtime Status | Display | Readonly skeleton mode, contract version |
| Readonly API Status | Display | 4 runtime GET endpoints state |
| Smoke Evidence | Display | Latest smoke results, report links |
| Governance Readiness | Display | Gates, blockers, approval readiness |
| Human Approval Readiness | Display | Pending approvals, approval workflow |
| Evidence Schema Readiness | Docs link | Evidence schema spec, preview |
| Audit Readiness | Docs link | Audit store contract, rollback plan |
| Rollback / Recovery Readiness | Docs link | Rollback guide, recovery guide |
| Risk / Blocker Matrix | Display | Risk types, blocker severity |
| Operator Checklist | Display | Generated checklist, no execution |
| Docs / Reports / Receipts | Links | All product docs, reports, receipts |

## Module Specifications

### Display-Only Modules (no action)
- System Overview
- Runtime Status
- Readonly API Status
- Smoke Evidence
- Governance Readiness
- Human Approval Readiness
- Risk / Blocker Matrix
- Operator Checklist

### Hidden Preview Links (clickable to preview route)
- Evidence Schema Readiness → `/evidence-schema-preview`
- Audit Readiness → `/audit-store-contract-preview`

### Documentation Links (external or product docs)
- Rollback / Recovery Readiness → rollback and recovery guide docs
- Docs / Reports / Receipts → file system links

## Prohibited Elements

- No action buttons
- No POST forms
- No execute buttons
- No Stage C enable toggle
- No DB write controls
- No approval approve/reject buttons
- No rollback execute buttons
- No connector control buttons
