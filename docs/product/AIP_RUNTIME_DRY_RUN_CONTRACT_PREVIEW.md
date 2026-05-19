# AIP Runtime Dry-run Contract Preview

## Overview
**P2 of v7.30.0-P2/P3/P4 Runtime Contract Acceleration Pack.** Read-only contract preview for the Runtime Dry-run subsystem. Defines 18 contract items across 6 contract kinds (request, response, gate, evidence, audit, rollback).

## Status
- **Stage:** Preview-only (hidden direct route, not in sidebar)
- **Risk:** Medium
- **Allows Stage C:** No

## Contract Structure

| Kind | Count | Description |
|------|-------|-------------|
| Request | 3 | Dry-run trigger request spec |
| Response | 3 | Dry-run result response spec |
| Gate | 3 | Gate pre-check contract |
| Evidence | 3 | Evidence capture contract |
| Audit | 3 | Audit trail contract |
| Rollback | 3 | Rollback idempotency contract |

## Routes
- `/runtime-dry-run-contract-preview` — hidden direct route, readonly

## Validation
- 7 validation checks
- All items must have `readonly=true`, `stageCEnabled=false`, `forbiddenFields` clear
- No backend endpoint, no DB write, no external control

## Dependencies
- `runtime-dry-run-contract-registry.ts` — static registry (18 items)
- `runtime-dry-run-contract-validator.ts` — static validator
- `RuntimeDryRunContractPreview.tsx` — preview page
- App.tsx route registration

## Safety
- Does NOT execute dry-run
- Does NOT create backend endpoint
- Does NOT write to database
- Does NOT enable Stage C
- No Send/Call/Execute/Enable buttons
- No token/API key input
