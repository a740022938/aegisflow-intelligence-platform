# AIP Runtime API Gate and Permission Model

> **Gate Model Version:** v0.1-draft
> **AIP Baseline:** v7.30.0-D2
> **Date:** 2026-05-19
> **Status:** draft — no gate implementation

## 1. Gate Model Purpose

This document defines the gate model for the Runtime API. Gates are authorization checkpoints that must pass before an endpoint can be accessed or an operation can be performed.

## 2. Gate Catalog

### 2.1 readonly_gate

| Field | Value |
|-------|-------|
| Purpose | Verify that only read-only operations are permitted |
| Input | Operation type (read/write) |
| Output | Pass if read, block if write |
| Failure behavior | Return CONTRACT_ONLY or NOT_IMPLEMENTED error |
| Related validator | runtime-registry-validator |
| Related preview page | Runtime Registry Preview |
| Current status | enabled |

### 2.2 permission_evaluator_gate

| Field | Value |
|-------|-------|
| Purpose | Evaluate whether the caller has permission for the requested operation |
| Input | Caller identity, operation details, target resource |
| Output | Pass if permitted, block if denied |
| Failure behavior | Return permission denied error |
| Related validator | permission-evaluator-validator |
| Related preview page | Permission Evaluator Preview |
| Current status | preview_only |

### 2.3 human_approval_gate

| Field | Value |
|-------|-------|
| Purpose | Verify that human approval has been obtained for high-risk operations |
| Input | Approval record reference |
| Output | Pass if approved, block if not approved |
| Failure behavior | Return HUMAN_APPROVAL_REQUIRED error |
| Related validator | human-approval-workflow-validator |
| Related preview page | Human Approval Workflow Preview |
| Current status | preview_only |

### 2.4 stage_c_gate

| Field | Value |
|-------|-------|
| Purpose | Verify that Stage C is enabled for operations that require it |
| Input | Current Stage C state |
| Output | Block always (Stage C disabled) |
| Failure behavior | Return STAGE_C_DISABLED error |
| Related validator | All validators (14 gates total) |
| Related preview page | N/A |
| Current status | disabled |

### 2.5 db_write_gate

| Field | Value |
|-------|-------|
| Purpose | Verify that DB write operations are permitted |
| Input | Write type and target |
| Output | Block always (DB write not authorized) |
| Failure behavior | Return DB_WRITE_BLOCKED error |
| Related validator | All validators |
| Related preview page | N/A |
| Current status | blocked |

### 2.6 external_control_gate

| Field | Value |
|-------|-------|
| Purpose | Verify that external tool control operations are permitted |
| Input | Target tool, operation type |
| Output | Block always (external control blocked) |
| Failure behavior | Return EXTERNAL_CONTROL_BLOCKED error |
| Related validator | runtime-registry-validator, permission-evaluator-validator |
| Related preview page | Connector Center |
| Current status | blocked |

### 2.7 audit_gate

| Field | Value |
|-------|-------|
| Purpose | Verify that audit logging is available before operations that require it |
| Input | Audit event details |
| Output | Pass if audit preview exists, block if audit write required |
| Failure behavior | Return NOT_IMPLEMENTED error |
| Related validator | audit-log-validator |
| Related preview page | Audit Log Preview |
| Current status | preview_only |

### 2.8 evidence_gate

| Field | Value |
|-------|-------|
| Purpose | Verify that evidence capture is available before operations that require it |
| Input | Evidence type and details |
| Output | Pass if evidence preview exists, block if evidence capture required |
| Failure behavior | Return EVIDENCE_REQUIRED error |
| Related validator | evidence-schema-validator |
| Related preview page | Evidence Schema Preview |
| Current status | preview_only |

### 2.9 rollback_gate

| Field | Value |
|-------|-------|
| Purpose | Verify that rollback capability is available before operations that require it |
| Input | Rollback plan details |
| Output | Pass if rollback preview exists, block if rollback execution required |
| Failure behavior | Return ROLLBACK_REQUIRED error |
| Related validator | rollback-validator |
| Related preview page | Rollback Preview |
| Current status | preview_only |

### 2.10 secret_redaction_gate

| Field | Value |
|-------|-------|
| Purpose | Verify that no secret material is exposed in requests or responses |
| Input | Request/response payload |
| Output | Pass if no secret fields detected, block if secret fields present |
| Failure behavior | Return SECRET_FIELD_REJECTED error |
| Related validator | evidence-schema-validator |
| Related preview page | N/A |
| Current status | enabled |

### 2.11 final_seal_gate

| Field | Value |
|-------|-------|
| Purpose | Verify that all seal criteria are met before allowing implementation changes |
| Input | Seal audit results |
| Output | Pass if seal criteria met, block if any criteria fail |
| Failure behavior | Return VALIDATION_FAILED error |
| Related validator | All validators |
| Related preview page | N/A |
| Current status | enabled |

## 3. Gate Status Summary

| Gate | Current Status | Implementation Status | Blocking |
|------|---------------|----------------------|----------|
| readonly_gate | enabled | implemented (policy) | No |
| permission_evaluator_gate | preview_only | contract_only | No |
| human_approval_gate | preview_only | contract_only | No |
| stage_c_gate | disabled | not_implemented | Yes |
| db_write_gate | blocked | not_implemented | Yes |
| external_control_gate | blocked | not_implemented | Yes |
| audit_gate | preview_only | contract_only | No |
| evidence_gate | preview_only | contract_only | No |
| rollback_gate | preview_only | contract_only | No |
| secret_redaction_gate | enabled | implemented (policy) | No |
| final_seal_gate | enabled | implemented (policy) | No |

## 4. Gate Evaluation Order

```
Request → readonly_gate → permission_evaluator_gate → (if write) human_approval_gate → stage_c_gate → db_write_gate → external_control_gate → audit_gate → evidence_gate → rollback_gate → secret_redaction_gate → final_seal_gate → Response
```

## 5. Permission Model

The permission model defines what operations are allowed based on gate states:

| Permission Level | Allowed Operations | Required Gates |
|-----------------|-------------------|----------------|
| documentation_only | Read contract docs | readonly_gate |
| preview_only | Read preview pages | readonly_gate, permission_evaluator_gate |
| readonly_implemented | Read live runtime data | readonly_gate, permission_evaluator_gate, stage_c_gate |
| human_approved_execute | Execute with human approval | All gates except stage_c_gate (if Stage C activated) |
| autonomous_execute | Execute without human approval | All gates |
| destructive_or_external_write | External/destructive operations | All gates + explicit authorization |

## 6. Gate Implementation Notes

- No gate is implemented as a runtime service
- Gate logic is currently documented in registries and validators
- Gate implementation requires backend code + Stage C activation
- The stage_c_gate, db_write_gate, and external_control_gate are permanently blocked in v7.x
- Gate status will not change without human approval and dedicated implementation tasks
