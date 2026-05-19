# Governance Console Registry Map

> **v7.29.0-D1** · Design Specification · Not Implemented  
> **Core Tenet:** Console aggregates registry data. Console does not modify registries.

---

## 1. Registry Overview

The Governance Console references the following registries. All data is read-only; no registry is modified by the Console.

| # | Registry | File | Items | Validator | Preview Page |
|---|----------|------|-------|-----------|--------------|
| 1 | Permission Evaluator | `permission-evaluator-registry.ts` | ~30 entries | Inline validators | PermissionEvaluatorPreview |
| 2 | Runtime Registry | `runtime-registry.ts` | ~20 entries | `runtime-registry-validator.ts` | RuntimeRegistryPreview |
| 3 | Dry-run Plan | `dry-run-plan-registry.ts` | ~15 entries | `dry-run-plan-validator.ts` | DryRunPlanPreview |
| 4 | Audit Log | `audit-log-registry.ts` | ~15 entries | `audit-log-validator.ts` | AuditLogPreview |
| 5 | Governance State | `governance-state-registry.ts` | 27 items | `governance-state-validator.ts` | GovernanceStateMachinePreview |
| 6 | Human Approval | `human-approval-registry.ts` | 21 items | `human-approval-validator.ts` | HumanApprovalWorkflowPreview |
| 7 | Evidence Schema | `evidence-schema-registry.ts` | 23 items | `evidence-schema-validator.ts` | EvidenceSchemaPreview |
| 8 | Rollback | `rollback-registry.ts` | 22 items | `rollback-validator.ts` | RollbackPreview |
| 9 | Navigation Exposure | `navigation-exposure-registry.ts` | ~15 entries | Inline validators | N/A (route config) |
| 10 | Center Access | `center-access-registry.ts` | ~12 entries | Inline validators | N/A (center config) |

## 2. Registry Details

### 2.1 Permission Evaluator Registry
- **Purpose:** Defines permission evaluation rules for each page/action
- **Current Scope:** All 8 preview pages + sidebar entries
- **Validator:** Inline blocking conditions, gates, severities
- **Route:** N/A (used by PermissionEvaluatorPreview)
- **Sidebar Exposure:** Not in sidebar
- **allowedNow Meaning:** Route is accessible
- **Risk Fields:** risk, severity, gates, blockingConditions

### 2.2 Runtime Registry
- **Purpose:** Defines runtime capabilities and their readiness
- **Current Scope:** ~20 readonly items
- **Validator:** `runtime-registry-validator.ts`
- **Route:** `/runtime-registry-preview`
- **Sidebar Exposure:** Not in sidebar
- **allowedNow Meaning:** Capability is viewable
- **Risk Fields:** risk, requiresStageC, requiresDbWrite

### 2.3 Governance State Registry
- **Purpose:** Defines governance state machine states and transitions
- **Current Scope:** 27 items covering all states
- **Validator:** `governance-state-validator.ts`
- **Route:** `/governance-state-machine-preview`
- **Sidebar Exposure:** Not in sidebar
- **allowedNow Meaning:** State is viewable
- **Risk Fields:** risk, requiresStageC, requiresDbWrite, requiresExternalControl

### 2.4 Human Approval Registry
- **Purpose:** Defines human approval requirements for actions
- **Current Scope:** 21 items across all request kinds
- **Validator:** `human-approval-validator.ts`
- **Route:** `/human-approval-workflow-preview`
- **Sidebar Exposure:** Not in sidebar
- **allowedNow Meaning:** Approval requirement is viewable
- **Risk Fields:** risk, requiresStageC

### 2.5 Evidence Schema Registry
- **Purpose:** Defines evidence schema, types, sources, sensitivity levels
- **Current Scope:** 23 items across 13 types, 10 sources
- **Validator:** `evidence-schema-validator.ts`
- **Route:** `/evidence-schema-preview`
- **Sidebar Exposure:** Not in sidebar
- **allowedNow Meaning:** Evidence type is viewable
- **Risk Fields:** sensitivity, retention, requiresRedaction

### 2.6 Rollback Registry
- **Purpose:** Defines rollback targets, types, preconditions, evidence requirements
- **Current Scope:** 22 items across 13 targets, 7 rollback types
- **Validator:** `rollback-validator.ts`
- **Route:** `/rollback-preview`
- **Sidebar Exposure:** Not in sidebar
- **allowedNow Meaning:** Rollback definition is viewable
- **Risk Fields:** risk, requiresStageC, requiresDbWrite, requiresExternalControl, executesRollback

## 3. Console-Registry Contract

- Console reads registry data via imports (static registry arrays)
- Console does not modify any registry
- Console does not create new registry entries
- Console does not change allowedNow status
- Console does not trigger validators (validators are standalone)
- All Console operations are read-only aggregation

## 4. Future Extension

When new registries are added:
1. Register in Center Access Registry
2. Add route to App.tsx
3. Create preview page
4. Add to navigation-exposure-registry.ts
5. Console automatically picks up new registry via aggregation logic
