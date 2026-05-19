import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Templates = lazy(() => import('./pages/Templates'));
const Datasets = lazy(() => import('./pages/Datasets'));
const Training = lazy(() => import('./pages/Training'));
const Evaluations = lazy(() => import('./pages/Evaluations'));
const Artifacts = lazy(() => import('./pages/Artifacts'));
const Deployments = lazy(() => import('./pages/Deployments'));
const Runs = lazy(() => import('./pages/Runs'));
const Models = lazy(() => import('./pages/Models'));
const WorkflowJobs = lazy(() => import('./pages/WorkflowJobs'));
const WorkflowCanvas = lazy(() => import('./pages/WorkflowCanvas'));
const Approvals = lazy(() => import('./pages/Approvals'));
const Audit = lazy(() => import('./pages/Audit'));
const FactoryStatus = lazy(() => import('./pages/FactoryStatus'));
const Knowledge = lazy(() => import('./pages/Knowledge'));
const Outputs = lazy(() => import('./pages/Outputs'));
const Feedback = lazy(() => import('./pages/Feedback'));
const CostRouting = lazy(() => import('./pages/CostRouting'));
const GovernanceHub = lazy(() => import('./pages/GovernanceHub'));
const PluginPool = lazy(() => import('./pages/PluginPool'));
const PluginCanvas = lazy(() => import('./pages/PluginCanvas'));
const ModuleCenter = lazy(() => import('./pages/ModuleCenter'));
const WorkflowComposer = lazy(() => import('./pages/workflow-composer/WorkflowComposer'));
const ModulePage = lazy(() => import('./pages/ModulePage'));
const MahjongDebug = lazy(() => import('./pages/MahjongDebug'));
const OpenAxiomReadonly = lazy(() => import('./pages/OpenAxiomReadonly'));
const AssistantCenter = lazy(() => import('./pages/AssistantCenter'));
const MemoryHubReadonly = lazy(() => import('./pages/MemoryHubReadonly'));
const MenuGovernancePreview = lazy(() => import('./pages/MenuGovernancePreview'));
const ConnectorCenter = lazy(() => import('./pages/ConnectorCenter'));
const LabCenter = lazy(() => import('./pages/LabCenter'));
const RegistryRenderPreview = lazy(() => import('./pages/RegistryRenderPreview'));
const MenuMoveDryRun = lazy(() => import('./pages/MenuMoveDryRun'));
const GovernanceCenter = lazy(() => import('./pages/GovernanceCenter'));
const AdvancedModeReadonly = lazy(() => import('./pages/AdvancedModeReadonly'));
const NavigationPreviewReadonly = lazy(() => import('./pages/NavigationPreviewReadonly'));
const ConnectorCenterReadonly = lazy(() => import('./pages/ConnectorCenterReadonly'));
const LabCenterReadonly = lazy(() => import('./pages/LabCenterReadonly'));
const PermissionEvaluatorPreview = lazy(() => import('./pages/PermissionEvaluatorPreview'));
const RuntimeRegistryPreview = lazy(() => import('./pages/RuntimeRegistryPreview'));
const DryRunPlanPreview = lazy(() => import('./pages/DryRunPlanPreview'));
const AuditLogPreview = lazy(() => import('./pages/AuditLogPreview'));
const GovernanceStateMachinePreview = lazy(() => import('./pages/GovernanceStateMachinePreview'));
const HumanApprovalWorkflowPreview = lazy(() => import('./pages/HumanApprovalWorkflowPreview'));
const EvidenceSchemaPreview = lazy(() => import('./pages/EvidenceSchemaPreview'));
const RollbackPreview = lazy(() => import('./pages/RollbackPreview'));
const GovernanceConsolePreview = lazy(() => import('./pages/GovernanceConsolePreview'));
const GovernanceConsoleRiskDashboardPreview = lazy(() => import('./pages/GovernanceConsoleRiskDashboardPreview'));
const GovernanceConsoleDecisionPanelPreview = lazy(() => import('./pages/GovernanceConsoleDecisionPanelPreview'));
const GovernanceConsoleReportPackPreview = lazy(() => import('./pages/GovernanceConsoleReportPackPreview'));
const RuntimeReadonlyStatusApiPreview = lazy(() => import('./pages/RuntimeReadonlyStatusApiPreview'));
const RuntimeDryRunContractPreview = lazy(() => import('./pages/RuntimeDryRunContractPreview'));
const RuntimeAuditStoreContractPreview = lazy(() => import('./pages/RuntimeAuditStoreContractPreview'));
const StageCPreEnableReviewPreview = lazy(() => import('./pages/StageCPreEnableReviewPreview'));
const OperatorConsoleRegistryPreview = lazy(() => import('./pages/OperatorConsoleRegistryPreview'));
const OperatorConsoleReadonlyPreview = lazy(() => import('./pages/OperatorConsoleReadonlyPreview'));
const StageCReadinessDashboardPreview = lazy(() => import('./pages/StageCReadinessDashboardPreview'));
const OperatorConsoleSealCandidatePreview = lazy(() => import('./pages/OperatorConsoleSealCandidatePreview'));
const OperatorChecklistEvidencePreview = lazy(() => import('./pages/OperatorChecklistEvidencePreview'));
const StageCHumanApprovalReviewPreview = lazy(() => import('./pages/StageCHumanApprovalReviewPreview'));
const StageCEvidenceReadinessDrillPreview = lazy(() => import('./pages/StageCEvidenceReadinessDrillPreview'));
const StageCPreenableSealCandidatePreview = lazy(() => import('./pages/StageCPreenableSealCandidatePreview'));
const StageCAuthorizationReviewConsolePreview = lazy(() => import('./pages/StageCAuthorizationReviewConsolePreview'));
const StageCAuthorizationArtifactReviewPreview = lazy(() => import('./pages/StageCAuthorizationArtifactReviewPreview'));
const StageCEnablementPlanningPreview = lazy(() => import('./pages/StageCEnablementPlanningPreview'));
const StageCAuthorizationGateSealPreview = lazy(() => import('./pages/StageCAuthorizationGateSealPreview'));
const StageCEnablementSimulationConsolePreview = lazy(() => import('./pages/StageCEnablementSimulationConsolePreview'));
const StageCFirstSliceImplementationPreview = lazy(() => import('./pages/StageCFirstSliceImplementationPreview'));
const StageCFeatureFlagControlPreview = lazy(() => import('./pages/StageCFeatureFlagControlPreview'));

function RouteFallback() {
  return (
    <div style={{ padding: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
      正在加载页面...
    </div>
  );
}

const App: React.FC = () => {
  // 更新API状态指示器
  useEffect(() => {
    const updateApiStatus = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        const statusElement = document.getElementById('api-status');
        if (statusElement) {
          if (data.ok) {
            statusElement.textContent = '正常';
            statusElement.className = 'status-indicator healthy';
          } else {
            statusElement.textContent = '异常';
            statusElement.className = 'status-indicator unhealthy';
          }
        }
      } catch (error) {
        const statusElement = document.getElementById('api-status');
        if (statusElement) {
          statusElement.textContent = '不可达';
          statusElement.className = 'status-indicator unhealthy';
        }
      }
    };

    updateApiStatus();
    const interval = setInterval(updateApiStatus, 30000); // 每30秒更新一次

    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="factory-status" element={<FactoryStatus />} />
            <Route path="dashboard" element={<Navigate to="/" replace />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="templates" element={<Templates />} />
            <Route path="datasets" element={<Datasets />} />
            <Route path="training" element={<Training />} />
            <Route path="artifacts" element={<Artifacts />} />
            <Route path="evaluations" element={<Evaluations />} />
            <Route path="deployments" element={<Deployments />} />
            <Route path="runs" element={<Runs />} />
            <Route path="models" element={<Models />} />
            <Route path="workflow-jobs" element={<WorkflowJobs />} />
            <Route path="workflow-canvas" element={<WorkflowCanvas />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="knowledge" element={<Knowledge />} />
            <Route path="outputs" element={<Outputs />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="governance-hub" element={<GovernanceHub />} />
            <Route path="cost-routing" element={<CostRouting />} />
            <Route path="module-center" element={<ModuleCenter />} />
            <Route path="plugin-pool" element={<PluginPool />} />
            <Route path="plugin-canvas" element={<PluginCanvas />} />
            <Route path="workflow-composer" element={<WorkflowComposer />} />
            <Route path="audit" element={<Audit />} />
            {/* ── 新模块占位页 ── */}
            <Route path="digital-employee" element={<ModulePage />} />
            <Route path="training-v2" element={<ModulePage />} />
            <Route path="hpo" element={<ModulePage />} />
            <Route path="distill" element={<ModulePage />} />
            <Route path="model-merge" element={<ModulePage />} />
            <Route path="inference" element={<ModulePage />} />
            <Route path="annotation" element={<ModulePage />} />
            <Route path="huggingface" element={<ModulePage />} />
            <Route path="backflow-v2" element={<ModulePage />} />
            <Route path="scheduler" element={<ModulePage />} />
            <Route path="alerting" element={<ModulePage />} />
            <Route path="model-monitor" element={<ModulePage />} />
            <Route path="deploy-v2" element={<ModulePage />} />
            <Route path="workspace" element={<ModulePage />} />
            <Route path="cost-tracker" element={<ModulePage />} />
            <Route path="storage-v2" element={<ModulePage />} />
            <Route path="system-status" element={<ModulePage />} />
            <Route path="api-docs" element={<ModulePage />} />
            <Route path="vision-lab/mahjong-debug" element={<MahjongDebug />} />
            <Route path="openaxiom-readonly" element={<OpenAxiomReadonly />} />
            <Route path="memory-hub" element={<MemoryHubReadonly />} />
            <Route path="assistant-center" element={<AssistantCenter />} />
            <Route path="menu-governance-preview" element={<MenuGovernancePreview />} />
            <Route path="connector-center" element={<ConnectorCenter />} />
            <Route path="lab-center" element={<LabCenter />} />
            <Route path="registry-render-preview" element={<RegistryRenderPreview />} />
            <Route path="menu-move-dry-run" element={<MenuMoveDryRun />} />
            <Route path="governance-center" element={<GovernanceCenter />} />
            <Route path="advanced-mode-readonly" element={<AdvancedModeReadonly />} />
            <Route path="navigation-preview-readonly" element={<NavigationPreviewReadonly />} />
            <Route path="connector-center-readonly" element={<ConnectorCenterReadonly />} />
            <Route path="lab-center-readonly" element={<LabCenterReadonly />} />
            <Route path="permission-evaluator-preview" element={<PermissionEvaluatorPreview />} />
            <Route path="runtime-registry-preview" element={<RuntimeRegistryPreview />} />
            <Route path="dry-run-plan-preview" element={<DryRunPlanPreview />} />
            <Route path="audit-log-preview" element={<AuditLogPreview />} />
            <Route path="governance-state-machine-preview" element={<GovernanceStateMachinePreview />} />
            <Route path="human-approval-workflow-preview" element={<HumanApprovalWorkflowPreview />} />
            <Route path="evidence-schema-preview" element={<EvidenceSchemaPreview />} />
            <Route path="rollback-preview" element={<RollbackPreview />} />
            <Route path="governance-console-preview" element={<GovernanceConsolePreview />} />
            <Route path="governance-console-risk-dashboard-preview" element={<GovernanceConsoleRiskDashboardPreview />} />
            <Route path="governance-console-decision-panel-preview" element={<GovernanceConsoleDecisionPanelPreview />} />
            <Route path="governance-console-report-pack-preview" element={<GovernanceConsoleReportPackPreview />} />
            <Route path="runtime-readonly-status-api-preview" element={<RuntimeReadonlyStatusApiPreview />} />
            <Route path="runtime-dry-run-contract-preview" element={<RuntimeDryRunContractPreview />} />
            <Route path="runtime-audit-store-contract-preview" element={<RuntimeAuditStoreContractPreview />} />
            <Route path="stage-c-preenable-review-preview" element={<StageCPreEnableReviewPreview />} />
            <Route path="operator-console-registry-preview" element={<OperatorConsoleRegistryPreview />} />
            <Route path="operator-console-readonly-preview" element={<OperatorConsoleReadonlyPreview />} />
            <Route path="operator-checklist-evidence-preview" element={<OperatorChecklistEvidencePreview />} />
            <Route path="operator-console-seal-candidate-preview" element={<OperatorConsoleSealCandidatePreview />} />
            <Route path="stage-c-readiness-dashboard-preview" element={<StageCReadinessDashboardPreview />} />
            <Route path="stage-c-human-approval-review-preview" element={<StageCHumanApprovalReviewPreview />} />
            <Route path="stage-c-evidence-readiness-drill-preview" element={<StageCEvidenceReadinessDrillPreview />} />
            <Route path="stage-c-preenable-seal-candidate-preview" element={<StageCPreenableSealCandidatePreview />} />
            <Route path="stage-c-authorization-review-console-preview" element={<StageCAuthorizationReviewConsolePreview />} />
            <Route path="stage-c-authorization-artifact-review-preview" element={<StageCAuthorizationArtifactReviewPreview />} />
            <Route path="stage-c-enablement-planning-preview" element={<StageCEnablementPlanningPreview />} />
            <Route path="stage-c-authorization-gate-seal-preview" element={<StageCAuthorizationGateSealPreview />} />
            <Route path="stage-c-enablement-simulation-console-preview" element={<StageCEnablementSimulationConsolePreview />} />
            <Route path="stage-c-minimal-first-slice-v7-39-preview" element={<StageCFirstSliceImplementationPreview />} />
            <Route path="stage-c-feature-flag-control-preview" element={<StageCFeatureFlagControlPreview />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
