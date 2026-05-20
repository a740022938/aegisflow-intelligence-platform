# AIP v7.46 — Web UI Preview Inventory

**Status:** P4 Final
**Date:** 2026-05-20

---

## 1. Total Count

| Category | Count |
|----------|-------|
| Total `.tsx` page files | 81 |
| Real/production pages | 28 |
| Preview pages (hidden direct-route) | 44 |
| Placeholder pages (ModulePage) | 14 |
| Sidebar-readonly pages | 4 |
| Preview-to-real ratio | 44 : 28 |

## 2. Preview Page Breakdown

### Stage C Previews (17 pages)

| Page | Lines | Purpose |
|------|-------|---------|
| StageCAuthorizationReviewConsolePreview | 362 | Authorization Review dashboard |
| StageCAuthorizationArtifactReviewPreview | 234 | Artifact review validation |
| StageCAuthorizationGateSealPreview | 205 | Gate seal authorization state |
| StageCAuthorizationReviewPackPreview | 205 | Authorization review pack |
| StageCReadinessDashboardPreview | — | Readiness dashboard |
| StageCHumanApprovalReviewPreview | — | Human approval workflow |
| StageCEvidenceReadinessDrillPreview | — | Evidence readiness drill |
| StageCPreenableSealCandidatePreview | — | Pre-enable seal candidate |
| StageCEnablementPlanningPreview | — | Enablement planning |
| StageCEnablementSimulationConsolePreview | — | Enablement simulation |
| StageCFirstSliceImplementationPreview | — | First slice implementation |
| StageCPreEnableReviewPreview | — | Pre-enable review |
| StageCFeatureFlagControlPreview | 84 | Feature flag control (disabled) |
| StageCFeatureFlagDryTrialPreview | 117 | Feature flag dry trial |
| StageCFeatureFlagToggleTrialPreview | 127 | Feature flag toggle trial |

### Operator Console Previews (7 pages)

| Page | Lines | Purpose |
|------|-------|---------|
| OperatorConsoleRegistryPreview | 281 | Console registry overview |
| OperatorConsoleReadonlyPreview | 324 | Console readonly dashboard |
| OperatorChecklistEvidencePreview | 387 | Checklist evidence |
| OperatorConsoleSealCandidatePreview | 397 | Seal candidate |
| OperatorRuntimeReadinessConsolePreview | 438 | Runtime readiness |
| OperatorEndToEndFlowPreview | 284 | End-to-end operator flow |
| OperatorUsabilityDrillPreview | 172 | Usability drill |

### Governance Console Previews (6 pages)

| Page | Lines | Purpose |
|------|-------|---------|
| GovernanceConsolePreview | — | Governance console |
| GovernanceConsoleRiskDashboardPreview | — | Risk dashboard |
| GovernanceConsoleDecisionPanelPreview | — | Decision panel |
| GovernanceConsoleReportPackPreview | — | Report pack |
| MenuGovernancePreview | — | Menu governance |
| MenuMoveDryRun | — | Menu move dry run |

### Standalone Previews (14 pages)

- AipMemoryKnowledgePreview
- AuditLogPreview
- DryRunPlanPreview
- EvidenceSchemaPreview
- GovernanceStateMachinePreview
- HandoffPackPreview
- HumanApprovalWorkflowPreview
- NavigationPreviewReadonly
- PermissionEvaluatorPreview
- RegistryRenderPreview
- RestorePointPackPreview
- RollbackPreview
- RuntimeRegistryPreview
- RuntimeReadonlyStatusApiPreview
- RuntimeDryRunContractPreview
- RuntimeAuditStoreContractPreview

## 3. Key Findings

- **44 previews vs 28 real pages** — preview outnumber production
- **4 Auth Review pages** with near-identical names (Console, Artifact Review, Gate Seal, Review Pack)
- **3 Feature Flag pages** with very similar content (Control, Dry Trial, Toggle Trial)
- **7 Operator Console pages** using internal P1-P4 naming
- All previews are hidden direct-route — none are in sidebar
- All previews are readonly — no mutation buttons

## 4. Recommendations

1. Keep all historical pages for traceability
2. Add canonical badges to Auth Review and Feature Flag groups
3. Create a single "Operator Dashboard" page that aggregates the 7 console pages
4. Replace internal phase naming (P1-P4) with operator-facing labels
