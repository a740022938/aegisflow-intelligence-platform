# AIP Runtime Audit Store Contract Preview

## Overview
**P3 of v7.30.0-P2/P3/P4 Runtime Contract Acceleration Pack.** Read-only contract preview for the Runtime Audit Store subsystem. Defines 16 contract items across 7 contract kinds (schema, retention, redaction, write policy, event, partition, lifecycle).

## Status
- **Stage:** Preview-only (hidden direct route, not in sidebar)
- **Risk:** Medium
- **Allows Stage C:** No

## Contract Structure

| Kind | Count | Description |
|------|-------|-------------|
| schema | 3 | Audit event schema definition |
| retention | 3 | Retention policy contract |
| redaction | 2 | Redaction policy contract |
| write_policy | 2 | Write policy contract |
| event | 2 | Event shape contract |
| partition | 2 | Partition strategy contract |
| lifecycle | 2 | Lifecycle management contract |

## Routes
- `/runtime-audit-store-contract-preview` — hidden direct route, readonly

## Validation
- 5 validation checks
- All items must have `readonly=true`, `stageCEnabled=false`, `forbiddenFields` clear
- No backend endpoint, no DB write, no external control

## Dependencies
- `runtime-audit-store-contract-registry.ts` — static registry (16 items)
- `runtime-audit-store-contract-validator.ts` — static validator
- `RuntimeAuditStoreContractPreview.tsx` — preview page
- App.tsx route registration

## Safety
- Does NOT create audit store
- Does NOT write/export/persist audit evidence
- Does NOT create backend endpoint
- Does NOT write to database
- Does NOT enable Stage C
- No Send/Call/Execute/Enable buttons
- No token/API key input
