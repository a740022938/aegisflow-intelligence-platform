# AIP v7.58-P1 GovernanceCenter Dependency and Route Inventory

**Phase:** v7.58-P1
**Type:** Read-Only Dependency Inventory
**Status:** COMPLETED

---

## 1. Route Definition

| Field | Value |
|---|---|
| Route path | `governance-center` (nested under parent router) |
| Registration file | `apps/web-ui/src/App.tsx` |
| Lazy loading | `const GovernanceCenter = lazy(() => import('./pages/GovernanceCenter'));` (line 39) |
| Route element | `<Route path="governance-center" element={<GovernanceCenter />} />` (line 184) |
| Wrapper | PageShell with `safetyBoundary="readonly"` and `maturity="preview"` |

---

## 2. Module Import Tree

```
pages/GovernanceCenter.tsx
│
├── React, { useMemo }
│
├── UI Components (shared)
│   ├── PageShell from ../components/ui/PageShell
│   └── SectionCard from ../components/ui/SectionCard
│
├── Governance Sub-Components (~142 total, all from ../components/governance/)
│   │
│   ├── Gate/Model Design Panels (~40)
│   │   ├── StageCPreviewPanel, GovernanceGateMatrix, GovernanceBoundaryPanel
│   │   ├── DeferredControlPath, GovernanceDataModelPanel
│   │   ├── StageCDesignSpecPanel, GovernanceLifecycleMatrix
│   │   ├── ControlBoundaryContract, StageCReadinessChecklist
│   │   ├── RiskAcceptanceMatrix, ApprovalGateDesignSpec
│   │   ├── ApprovalEvidenceModel, ApprovalRollbackPlan
│   │   ├── ApprovalAuditTrailSpec, ApprovalGateMatrixTable
│   │   ├── MutationGateDesignSpec, MutationRequestModel
│   │   ├── MutationDiffImpactMatrix, MutationRollbackContract
│   │   ├── MutationRiskGuardrailMatrix, ExecutionGateDesignSpec
│   │   ├── ExecutionRequestModel, ExecutionPreflightMatrix
│   │   ├── ExecutionBoundaryMatrix, ExecutionRiskGuardrailMatrix
│   │   ├── ExternalWriteGateDesignSpec, ConnectorWritePolicyModel
│   │   ├── ExternalIOBoundaryMatrix, ExternalWriteEvidenceMatrix
│   │   ├── ExternalWriteGuardrailMatrix, ConnectorWriteLifecycleDesign
│   │   ├── DeploymentGateDesignSpec, DeploymentRequestModel
│   │   ├── DeploymentBoundaryMatrix, DeploymentEvidenceMatrix
│   │   ├── RollbackGateDesignSpec, RollbackPlanModel
│   │   ├── DeploymentRollbackGuardrailMatrix, DeploymentRollbackLifecycleDesign
│   │   ├── EmergencyStopGateDesignSpec, EmergencyStopPolicyModel
│   │   ├── EmergencyStopBoundaryMatrix, AuditEvidenceGateDesignSpec
│   │   ├── AuditEvidenceRetentionMatrix, EmergencyStopAuditGuardrailMatrix
│   │   └── EmergencyStopAuditLifecycleDesign
│   │
│   ├── Stage Coverage Components (~70)
│   │   ├── GateCoverageOverview, GateCoverageAuditMatrix
│   │   ├── StageCReadinessBlockerMatrix, CrossGateDependencyMatrix
│   │   ├── ControlBoundaryFinalMatrix, StageCNonReadinessStatement
│   │   ├── ClosureMetricsSnapshot, StageCActivationPlanningOverview
│   │   ├── RuntimeAuthorizationDesignSpec, RuntimePermissionModel
│   │   ├── OperatorRoleScopeMatrix, ActivationPreconditionsMatrix
│   │   ├── RuntimeControlPackageBoundary, StageCBlockerResolutionPlan
│   │   ├── AuthorizationEvidenceAuditDesign, RuntimeAuthorizationDataContract
│   │   ├── AuthorizationRequestLifecycle, AuthorizationDecisionStateModel
│   │   ├── AuthorizationScopeBoundaryMatrix, RuntimePermissionEvaluationDesign
│   │   ├── AuthorizationRevocationExpiryDesign, AuthorizationAuditChainDesign
│   │   ├── AuthorizationFailureFallbackMatrix, AuthorizationPersistenceDesignSpec
│   │   ├── AuthorizationStorageContract, AuthorizationPersistenceEntityModel
│   │   ├── AuthorizationRecordLifecycleDesign, AuthorizationStorageBoundaryMatrix
│   │   ├── AuthorizationPersistenceRiskGuardrailMatrix
│   │   ├── AuthorizationRetentionExpiryStorageDesign
│   │   ├── AuthorizationPersistenceAuditIntegrityDesign
│   │   ├── AuthorizationReviewPolicyDesign, AuthorizationDecisionGovernanceModel
│   │   ├── ManualReviewScopeMatrix, DecisionEvidenceRequirementMatrix
│   │   ├── DenyByDefaultPolicyDesign, DecisionConflictOverrideBoundaryMatrix
│   │   ├── ReviewEscalationExpiryRevocationPolicy, AuthorizationDecisionAuditDesign
│   │   ├── ActivationBlockerResolutionRoadmap, RuntimeReadinessSimulationModel
│   │   ├── GoNoGoDecisionMatrix, BlockerDependencySequencingMatrix
│   │   ├── StageCDryRunSimulationDesign, ActivationSafetyReviewChecklist
│   │   ├── RuntimeReadinessEvidenceMatrix, ActivationRollbackReadinessPlan
│   │   └── RuntimeImplementationPackageBoundary
│   │
│   └── Implementation Review Components (~32)
│       ├── AuthorizationStorageSchemaDesignReview
│       ├── AuthorizationApiContractDesignReview
│       ├── RuntimeEvaluatorImplementationBoundary
│       ├── ReviewWorkflowImplementationBoundary
│       ├── StorageApiRiskReviewMatrix, ImplementationSequencingPlan
│       ├── ImplementationGoNoGoGate, P7SchemaImplementationPlan
│       ├── P7AuthorizationTableDesignReview, P7MigrationBoundaryDesign
│       ├── P7SchemaChangeRiskMatrix, P7RetentionCleanupDesign
│       ├── P7SchemaRollbackPlanning, P7StorageValidationPlan
│       ├── P7DbDoctorExtensionDesign, AuthorizationApiImplementationPlanReview
│       ├── AuthorizationEndpointBoundaryDesign, ApiRequestResponseContractReview
│       ├── ApiHandlerRiskMatrix, ApiAuthPermissionBoundaryDesign
│       ├── ApiErrorFallbackContractDesign, ApiAuditEvidenceBoundaryDesign
│       ├── ApiValidationPlan, RuntimeEvaluatorImplementationPlanReview
│       ├── PermissionEvaluationBoundaryDesign, EvaluatorInputOutputContractReview
│       ├── DenyByDefaultEvaluationChainDesign, EvaluatorDependencyMatrix
│       ├── EvaluatorRiskGuardrailMatrix, EvaluatorFailureFallbackDesign
│       ├── EvaluatorValidationPlan, EvaluatorImplementationPackageReview
│       ├── RuntimeDryRunBoundaryDesign, PermissionEvaluatorPackageBoundary
│       ├── EvaluatorPackageDependencyReview, EvaluatorDecisionTraceDesign
│       ├── RuntimeDryRunFixtureModel, EvaluationResultContractReview
│       ├── EvaluatorImplementationNoGoGate, ImplementationPackageExecutionBoundaryReview
│       ├── ImplementationPackageExecutionNoGoGate, RuntimeImplementationNoGoSeal
│       ├── ImplementationPackageExecutionSequencingPlan
│       ├── ClosureMetricsDefinitionTable, ReportGuardrailChecklist
│       ├── MetricsHardeningRuleMatrix, RuntimeFoundationStatusCard
│       └── AuthorizationDryRunStatusCard
│
└── Registry Imports
    ├── { GOVERNANCE_REGISTRY } from ../registry/governance-registry
    ├── { validateGovernanceRegistry, getGovernanceRegistrySummary }
    │   from ../registry/governance-registry-validator
    └── type { GovernanceModuleDefinition } from ../registry/governance-registry
```

---

## 3. Dependency Analysis

| Dependency type | Count | Impact |
|---|---|---|
| UI primitives (shared) | 2 | Low — already in shared chunks |
| Governance sub-components | ~142 | **High** — primary contributor to 930.88 kB |
| Registry/validator (static) | 2 files | Medium-High — static data contributes non-trivially |
| Third-party (charts, icons) | 0 | None — no external heavy deps |
| React + ReactDOM | 1 | Shared via react-vendor chunk |

---

## 4. Key Observations

1. **Route-level lazy loading is already in place** — `React.lazy()` at App.tsx:39 loads GovernanceCenter on-demand. No further route-level splitting possible.

2. **All 142 sub-components are eagerly imported** — they are bundled into the same chunk as the page component because they are statically imported.

3. **Sub-components are all readonly design-spec panels** — they contain no interactive controls, no mutation logic, no write/execute capabilities. This makes them **safe to split** without behavioral risk.

4. **No shared usage** — the 142 governance sub-components are only used by GovernanceCenter. They are not shared with GovernanceHub, GovernanceConsolePreview, or any other route.

5. **GOVERNANCE_REGISTRY is a static JavaScript object** — it's likely a large array/object defining all governance modules, gates, and policies. It could potentially be lazy-loaded or extracted.
