import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import GovernanceCenterOverview from '../components/governance/GovernanceCenterOverview';
import StageCPreviewPanel from '../components/governance/StageCPreviewPanel';
import GovernanceGateMatrix from '../components/governance/GovernanceGateMatrix';
import GovernanceBoundaryPanel from '../components/governance/GovernanceBoundaryPanel';
import DeferredControlPath from '../components/governance/DeferredControlPath';
import GovernanceDataModelPanel from '../components/governance/GovernanceDataModelPanel';
import StageCDesignSpecPanel from '../components/governance/StageCDesignSpecPanel';
import GovernanceLifecycleMatrix from '../components/governance/GovernanceLifecycleMatrix';
import ControlBoundaryContract from '../components/governance/ControlBoundaryContract';
import StageCReadinessChecklist from '../components/governance/StageCReadinessChecklist';
import RiskAcceptanceMatrix from '../components/governance/RiskAcceptanceMatrix';
import ApprovalGateDesignSpec from '../components/governance/ApprovalGateDesignSpec';
import ApprovalEvidenceModel from '../components/governance/ApprovalEvidenceModel';
import ApprovalRollbackPlan from '../components/governance/ApprovalRollbackPlan';
import ApprovalAuditTrailSpec from '../components/governance/ApprovalAuditTrailSpec';
import ApprovalGateMatrixTable from '../components/governance/ApprovalGateMatrixTable';
import MutationGateDesignSpec from '../components/governance/MutationGateDesignSpec';
import MutationRequestModel from '../components/governance/MutationRequestModel';
import MutationDiffImpactMatrix from '../components/governance/MutationDiffImpactMatrix';
import MutationRollbackContract from '../components/governance/MutationRollbackContract';
import MutationRiskGuardrailMatrix from '../components/governance/MutationRiskGuardrailMatrix';
import ExecutionGateDesignSpec from '../components/governance/ExecutionGateDesignSpec';
import ExecutionRequestModel from '../components/governance/ExecutionRequestModel';
import ExecutionPreflightMatrix from '../components/governance/ExecutionPreflightMatrix';
import ExecutionBoundaryMatrix from '../components/governance/ExecutionBoundaryMatrix';
import ExecutionRiskGuardrailMatrix from '../components/governance/ExecutionRiskGuardrailMatrix';
import ExternalWriteGateDesignSpec from '../components/governance/ExternalWriteGateDesignSpec';
import ConnectorWritePolicyModel from '../components/governance/ConnectorWritePolicyModel';
import ExternalIOBoundaryMatrix from '../components/governance/ExternalIOBoundaryMatrix';
import ExternalWriteEvidenceMatrix from '../components/governance/ExternalWriteEvidenceMatrix';
import ExternalWriteGuardrailMatrix from '../components/governance/ExternalWriteGuardrailMatrix';
import ConnectorWriteLifecycleDesign from '../components/governance/ConnectorWriteLifecycleDesign';
import DeploymentGateDesignSpec from '../components/governance/DeploymentGateDesignSpec';
import DeploymentRequestModel from '../components/governance/DeploymentRequestModel';
import DeploymentBoundaryMatrix from '../components/governance/DeploymentBoundaryMatrix';
import DeploymentEvidenceMatrix from '../components/governance/DeploymentEvidenceMatrix';
import RollbackGateDesignSpec from '../components/governance/RollbackGateDesignSpec';
import RollbackPlanModel from '../components/governance/RollbackPlanModel';
import DeploymentRollbackGuardrailMatrix from '../components/governance/DeploymentRollbackGuardrailMatrix';
import DeploymentRollbackLifecycleDesign from '../components/governance/DeploymentRollbackLifecycleDesign';
import EmergencyStopGateDesignSpec from '../components/governance/EmergencyStopGateDesignSpec';
import EmergencyStopPolicyModel from '../components/governance/EmergencyStopPolicyModel';
import EmergencyStopBoundaryMatrix from '../components/governance/EmergencyStopBoundaryMatrix';
import AuditEvidenceGateDesignSpec from '../components/governance/AuditEvidenceGateDesignSpec';
import AuditEvidenceRetentionMatrix from '../components/governance/AuditEvidenceRetentionMatrix';
import EmergencyStopAuditGuardrailMatrix from '../components/governance/EmergencyStopAuditGuardrailMatrix';
import EmergencyStopAuditLifecycleDesign from '../components/governance/EmergencyStopAuditLifecycleDesign';
import GateCoverageOverview from '../components/governance/GateCoverageOverview';
import GateCoverageAuditMatrix from '../components/governance/GateCoverageAuditMatrix';
import StageCReadinessBlockerMatrix from '../components/governance/StageCReadinessBlockerMatrix';
import CrossGateDependencyMatrix from '../components/governance/CrossGateDependencyMatrix';
import ControlBoundaryFinalMatrix from '../components/governance/ControlBoundaryFinalMatrix';
import StageCNonReadinessStatement from '../components/governance/StageCNonReadinessStatement';
import ClosureMetricsSnapshot from '../components/governance/ClosureMetricsSnapshot';
import StageCActivationPlanningOverview from '../components/governance/StageCActivationPlanningOverview';
import RuntimeAuthorizationDesignSpec from '../components/governance/RuntimeAuthorizationDesignSpec';
import RuntimePermissionModel from '../components/governance/RuntimePermissionModel';
import OperatorRoleScopeMatrix from '../components/governance/OperatorRoleScopeMatrix';
import ActivationPreconditionsMatrix from '../components/governance/ActivationPreconditionsMatrix';
import RuntimeControlPackageBoundary from '../components/governance/RuntimeControlPackageBoundary';
import StageCBlockerResolutionPlan from '../components/governance/StageCBlockerResolutionPlan';
import AuthorizationEvidenceAuditDesign from '../components/governance/AuthorizationEvidenceAuditDesign';
import RuntimeAuthorizationDataContract from '../components/governance/RuntimeAuthorizationDataContract';
import AuthorizationRequestLifecycle from '../components/governance/AuthorizationRequestLifecycle';
import AuthorizationDecisionStateModel from '../components/governance/AuthorizationDecisionStateModel';
import AuthorizationScopeBoundaryMatrix from '../components/governance/AuthorizationScopeBoundaryMatrix';
import RuntimePermissionEvaluationDesign from '../components/governance/RuntimePermissionEvaluationDesign';
import AuthorizationRevocationExpiryDesign from '../components/governance/AuthorizationRevocationExpiryDesign';
import AuthorizationAuditChainDesign from '../components/governance/AuthorizationAuditChainDesign';
import AuthorizationFailureFallbackMatrix from '../components/governance/AuthorizationFailureFallbackMatrix';
import AuthorizationPersistenceDesignSpec from '../components/governance/AuthorizationPersistenceDesignSpec';
import AuthorizationStorageContract from '../components/governance/AuthorizationStorageContract';
import AuthorizationPersistenceEntityModel from '../components/governance/AuthorizationPersistenceEntityModel';
import AuthorizationRecordLifecycleDesign from '../components/governance/AuthorizationRecordLifecycleDesign';
import AuthorizationStorageBoundaryMatrix from '../components/governance/AuthorizationStorageBoundaryMatrix';
import AuthorizationPersistenceRiskGuardrailMatrix from '../components/governance/AuthorizationPersistenceRiskGuardrailMatrix';
import AuthorizationRetentionExpiryStorageDesign from '../components/governance/AuthorizationRetentionExpiryStorageDesign';
import AuthorizationPersistenceAuditIntegrityDesign from '../components/governance/AuthorizationPersistenceAuditIntegrityDesign';
import AuthorizationReviewPolicyDesign from '../components/governance/AuthorizationReviewPolicyDesign';
import AuthorizationDecisionGovernanceModel from '../components/governance/AuthorizationDecisionGovernanceModel';
import ManualReviewScopeMatrix from '../components/governance/ManualReviewScopeMatrix';
import DecisionEvidenceRequirementMatrix from '../components/governance/DecisionEvidenceRequirementMatrix';
import DenyByDefaultPolicyDesign from '../components/governance/DenyByDefaultPolicyDesign';
import DecisionConflictOverrideBoundaryMatrix from '../components/governance/DecisionConflictOverrideBoundaryMatrix';
import ReviewEscalationExpiryRevocationPolicy from '../components/governance/ReviewEscalationExpiryRevocationPolicy';
import AuthorizationDecisionAuditDesign from '../components/governance/AuthorizationDecisionAuditDesign';
import ActivationBlockerResolutionRoadmap from '../components/governance/ActivationBlockerResolutionRoadmap';
import RuntimeReadinessSimulationModel from '../components/governance/RuntimeReadinessSimulationModel';
import GoNoGoDecisionMatrix from '../components/governance/GoNoGoDecisionMatrix';
import BlockerDependencySequencingMatrix from '../components/governance/BlockerDependencySequencingMatrix';
import StageCDryRunSimulationDesign from '../components/governance/StageCDryRunSimulationDesign';
import ActivationSafetyReviewChecklist from '../components/governance/ActivationSafetyReviewChecklist';
import RuntimeReadinessEvidenceMatrix from '../components/governance/RuntimeReadinessEvidenceMatrix';
import ActivationRollbackReadinessPlan from '../components/governance/ActivationRollbackReadinessPlan';
import RuntimeImplementationPackageBoundary from '../components/governance/RuntimeImplementationPackageBoundary';
import AuthorizationStorageSchemaDesignReview from '../components/governance/AuthorizationStorageSchemaDesignReview';
import AuthorizationApiContractDesignReview from '../components/governance/AuthorizationApiContractDesignReview';
import RuntimeEvaluatorImplementationBoundary from '../components/governance/RuntimeEvaluatorImplementationBoundary';
import ReviewWorkflowImplementationBoundary from '../components/governance/ReviewWorkflowImplementationBoundary';
import StorageApiRiskReviewMatrix from '../components/governance/StorageApiRiskReviewMatrix';
import ImplementationSequencingPlan from '../components/governance/ImplementationSequencingPlan';
import ImplementationGoNoGoGate from '../components/governance/ImplementationGoNoGoGate';
import P7SchemaImplementationPlan from '../components/governance/P7SchemaImplementationPlan';
import P7AuthorizationTableDesignReview from '../components/governance/P7AuthorizationTableDesignReview';
import P7MigrationBoundaryDesign from '../components/governance/P7MigrationBoundaryDesign';
import P7SchemaChangeRiskMatrix from '../components/governance/P7SchemaChangeRiskMatrix';
import P7RetentionCleanupDesign from '../components/governance/P7RetentionCleanupDesign';
import P7SchemaRollbackPlanning from '../components/governance/P7SchemaRollbackPlanning';
import P7StorageValidationPlan from '../components/governance/P7StorageValidationPlan';
import P7DbDoctorExtensionDesign from '../components/governance/P7DbDoctorExtensionDesign';
import AuthorizationApiImplementationPlanReview from '../components/governance/AuthorizationApiImplementationPlanReview';
import AuthorizationEndpointBoundaryDesign from '../components/governance/AuthorizationEndpointBoundaryDesign';
import ApiRequestResponseContractReview from '../components/governance/ApiRequestResponseContractReview';
import ApiHandlerRiskMatrix from '../components/governance/ApiHandlerRiskMatrix';
import ApiAuthPermissionBoundaryDesign from '../components/governance/ApiAuthPermissionBoundaryDesign';
import ApiErrorFallbackContractDesign from '../components/governance/ApiErrorFallbackContractDesign';
import ApiAuditEvidenceBoundaryDesign from '../components/governance/ApiAuditEvidenceBoundaryDesign';
import ApiValidationPlan from '../components/governance/ApiValidationPlan';
import RuntimeEvaluatorImplementationPlanReview from '../components/governance/RuntimeEvaluatorImplementationPlanReview';
import PermissionEvaluationBoundaryDesign from '../components/governance/PermissionEvaluationBoundaryDesign';
import EvaluatorInputOutputContractReview from '../components/governance/EvaluatorInputOutputContractReview';
import DenyByDefaultEvaluationChainDesign from '../components/governance/DenyByDefaultEvaluationChainDesign';
import EvaluatorDependencyMatrix from '../components/governance/EvaluatorDependencyMatrix';
import EvaluatorRiskGuardrailMatrix from '../components/governance/EvaluatorRiskGuardrailMatrix';
import EvaluatorFailureFallbackDesign from '../components/governance/EvaluatorFailureFallbackDesign';
import EvaluatorValidationPlan from '../components/governance/EvaluatorValidationPlan';
import EvaluatorImplementationPackageReview from '../components/governance/EvaluatorImplementationPackageReview';
import RuntimeDryRunBoundaryDesign from '../components/governance/RuntimeDryRunBoundaryDesign';
import PermissionEvaluatorPackageBoundary from '../components/governance/PermissionEvaluatorPackageBoundary';
import EvaluatorPackageDependencyReview from '../components/governance/EvaluatorPackageDependencyReview';
import EvaluatorDecisionTraceDesign from '../components/governance/EvaluatorDecisionTraceDesign';
import RuntimeDryRunFixtureModel from '../components/governance/RuntimeDryRunFixtureModel';
import EvaluationResultContractReview from '../components/governance/EvaluationResultContractReview';
import EvaluatorImplementationNoGoGate from '../components/governance/EvaluatorImplementationNoGoGate';
import ImplementationPackageExecutionBoundaryReview from '../components/governance/ImplementationPackageExecutionBoundaryReview';
import ImplementationPackageExecutionNoGoGate from '../components/governance/ImplementationPackageExecutionNoGoGate';
import RuntimeImplementationNoGoSeal from '../components/governance/RuntimeImplementationNoGoSeal';
import ImplementationPackageExecutionSequencingPlan from '../components/governance/ImplementationPackageExecutionSequencingPlan';
import ClosureMetricsDefinitionTable from '../components/governance/ClosureMetricsDefinitionTable';
import ReportGuardrailChecklist from '../components/governance/ReportGuardrailChecklist';
import MetricsHardeningRuleMatrix from '../components/governance/MetricsHardeningRuleMatrix';
import RuntimeFoundationStatusCard from '../components/governance/RuntimeFoundationStatusCard';
import AuthorizationDryRunStatusCard from '../components/governance/AuthorizationDryRunStatusCard';
import { GOVERNANCE_REGISTRY } from '../registry/governance-registry';
import { validateGovernanceRegistry, getGovernanceRegistrySummary } from '../registry/governance-registry-validator';
import type { GovernanceModuleDefinition } from '../registry/governance-registry';

const VALIDATOR_EXPECTED = { modules: 13, gates: 12, blocking: 0, warning: 0 };

const C: Record<string, string> = {
  pass: 'var(--success)', warning: 'var(--warning)', blocked: 'var(--danger)',
  pending_review: 'var(--secondary)', approval_required: '#F97316', dry_run_only: '#8B5CF6',
  disabled: '#6B7280', deferred: '#6B7280', unknown: 'var(--text-muted)',
  low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)', critical: '#7C3AED',
  stable: 'var(--success)', preview: 'var(--warning)', lab: 'var(--secondary)', external: '#8B5CF6',
  readonly: 'var(--secondary)', dry_run: '#8B5CF6',
  external_write_blocked: 'var(--danger)', dangerous_action_blocked: 'var(--danger)',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11,
      fontWeight: 600, color: '#fff', background: color || '#6B7280',
      lineHeight: '16px', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '3px 0', fontSize: 11, borderBottom: '1px solid var(--border)' }}>
      <span style={{ width: 130, flexShrink: 0, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function ModuleCard({ mod }: { mod: GovernanceModuleDefinition }) {
  const [expanded, setExpanded] = React.useState(false);
  const isHighRisk = mod.riskLevel === 'high' || mod.riskLevel === 'critical';
  const needsApproval = mod.approvalRequired;
  const isDangerous = mod.safetyBoundaryTags.includes('dangerous_action_blocked');
  const writesExternally = mod.writesExternalSystem;

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 8, padding: 14,
      borderLeft: `3px solid ${isHighRisk ? 'var(--danger)' : needsApproval ? '#F97316' : 'var(--border)'}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{mod.displayName}</span>
            {isHighRisk && <Badge label="HIGH RISK" color="var(--danger)" />}
            {needsApproval && <Badge label="需要审批" color="#F97316" />}
            {isDangerous && <Badge label="危险操作禁止" color="var(--danger)" />}
            {writesExternally && <Badge label="外部写入禁止" color="var(--danger)" />}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 1 }}>{mod.moduleId}</div>
        </div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Badge label={mod.status} color={C[mod.status] || '#6B7280'} />
          <Badge label={mod.riskLevel} color={C[mod.riskLevel] || '#6B7280'} />
          <Badge label={mod.maturity} color={C[mod.maturity] || '#6B7280'} />
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>{mod.description}</div>

      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 6 }}>
        {mod.safetyBoundaryTags.map(t => <Badge key={t} label={t} color={C[t] || '#6B7280'} />)}
        <Badge label={mod.ownerCenter} color="#6B7280" />
        <Badge label={mod.category} color="var(--secondary)" />
      </div>

      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
        {mod.currentEntry !== '—' ? `入口: ${mod.currentEntry}` : '无独立入口'}
        <span style={{ marginLeft: 8 }}>
          {mod.dryRunSupport && '🔹dry-run '}{mod.approvalRequired && '🔸需审批 '}{mod.writesExternalSystem && '🚫外写'}
        </span>
      </div>

      {isHighRisk && (
        <div style={{ padding: '4px 8px', marginBottom: 6, borderRadius: 4, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 10, color: 'var(--danger)' }}>
          ⚠ 高风险模块 — 所有真实执行操作已被禁止。当前仅 dry-run / preview。
        </div>
      )}
      {needsApproval && !isHighRisk && (
        <div style={{ padding: '4px 8px', marginBottom: 6, borderRadius: 4, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', fontSize: 10, color: '#F97316' }}>
          🔸 此模块中的部分操作需要人工审批，当前均为只读预览。
        </div>
      )}

      <button type="button" onClick={() => setExpanded(!expanded)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--secondary)', padding: 0, fontFamily: 'inherit' }}>
        {expanded ? '收起详情 ▲' : '展开详情 ▼'}
      </button>

      {expanded && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>详情</div>
          <DetailRow label="relatedRoutes" value={mod.relatedRoutes.join(', ') || '—'} />
          <DetailRow label="sourceArtifacts" value={
            mod.sourceArtifacts.length > 0
              ? mod.sourceArtifacts.map(a => a.split('/').pop()).join(', ')
              : <span style={{ color: 'var(--text-muted)' }}>未填写 (info)</span>
          } />
          <DetailRow label="dryRunSupport" value={mod.dryRunSupport ? '✅' : '❌'} />
          <DetailRow label="approvalRequired" value={mod.approvalRequired ? '✅ 需要人工审批' : '❌'} />
          <DetailRow label="writesDatabase" value={mod.writesDatabase ? '⚠️ BLOCKED — 禁止写数据库' : '❌ 未声明'} />
          <DetailRow label="writesExternalSystem" value={mod.writesExternalSystem ? '🚫 BLOCKED — 禁止外部写入' : '❌'} />
          <DetailRow label="migrationStage" value={`Stage ${mod.migrationStage}`} />

          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginTop: 6, marginBottom: 2 }}>允许操作 (allowedActions)</div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 6 }}>
            {mod.actionPolicy.allowedActions.map(a => <Badge key={a} label={a} color="var(--success)" />)}
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>禁止操作 (forbiddenActions)</div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 6 }}>
            {mod.actionPolicy.forbiddenActions.map(a => <Badge key={a} label={a} color="var(--danger)" />)}
          </div>

          {mod.notes && <DetailRow label="备注" value={mod.notes} />}
        </div>
      )}
    </div>
  );
}

function GateCard({ gate }: { gate: any }) {
  const color = gate.status === 'pass' ? 'var(--success)' : gate.status === 'fail' ? 'var(--danger)' : gate.status === 'warn' ? 'var(--warning)' : '#6B7280';
  const isStageC = gate.gateId === 'stage_c_gate';
  return (
    <div style={{
      padding: '8px 12px', borderRadius: 6,
      background: 'var(--bg-surface)', border: `1px solid ${isStageC ? 'var(--warning)' : 'var(--border)'}`,
      fontSize: 11, position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 11 }}>{gate.displayName}</span>
        <Badge label={gate.status} color={color} />
        {gate.blocking && <Badge label="BLOCKING" color="var(--danger)" />}
        {isStageC && <Badge label="DEFERRED" color="var(--warning)" />}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{gate.source}</div>
      {gate.lastKnownResult && <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>结果: {gate.lastKnownResult}</div>}
      {gate.requiredBefore && gate.requiredBefore.length > 0 && (
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>前置: {gate.requiredBefore.join(', ')}</div>
      )}
      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>失败策略: {gate.failurePolicy}</div>
      {isStageC && (
        <div style={{ marginTop: 4, padding: '4px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.08)', fontSize: 10, color: 'var(--warning)' }}>
          Stage C 尚未开始。本页面没有启用按钮。
        </div>
      )}
    </div>
  );
}

function RiskSummarySection({ summary, modules }: { summary: any; modules: GovernanceModuleDefinition[] }) {
  const groups: Record<string, string[]> = { critical: [], high: [], medium: [], low: [] };
  for (const m of modules) { (groups[m.riskLevel] || groups['low']).push(m.displayName); }

  return (
    <SectionCard title="风险与安全边界汇总" style={{ marginBottom: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 12 }}>
        {[
          ['Low', String(summary.byRiskLevel['low'] || 0), C.low],
          ['Medium', String(summary.byRiskLevel['medium'] || 0), C.medium],
          ['High', String(summary.byRiskLevel['high'] || 0), C.high],
          ['Critical', String(summary.byRiskLevel['critical'] || 0), C.critical],
          ['Approval Required', String(summary.approvalRequiredCount), '#F97316'],
          ['External Write Blocked', String(summary.externalWriteBlockedCount), 'var(--danger)'],
          ['Dangerous Action Blocked', String(summary.dangerousActionBlockedCount), 'var(--danger)'],
          ['Dry-Run Only', String(summary.dryRunOnlyCount), '#8B5CF6'],
        ].map(([label, value, color]) => (
          <div key={String(label)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color, minWidth: 28 }}>{value}</span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</span>
          </div>
        ))}
      </div>
      {(groups['high'].length > 0 || groups['critical'].length > 0) && (
        <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 11, color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--danger)' }}>高风险/严重模块：</strong>
          {[...groups['critical'], ...groups['high']].join('、')}
          — 所有真实执行已被禁止，仅 dry-run / preview。
        </div>
      )}
    </SectionCard>
  );
}

function ForbiddenActionsMatrix({ modules }: { modules: GovernanceModuleDefinition[] }) {
  const allActions = Array.from(new Set(modules.flatMap(m => m.actionPolicy.forbiddenActions))).sort();
  const criticalActions = ['write_database', 'modify_layout', 'move_real_menu', 'hide_real_menu', 'delete_menu',
    'approve_candidate', 'reject_candidate', 'archive_candidate', 'sync_lan_share',
    'taskkill', 'restart_service', 'publish_release', 'create_tag', 'force_push', 'enable_stage_c'];
  const normalActions = allActions.filter(a => !criticalActions.includes(a));

  return (
    <SectionCard title="禁止操作矩阵" style={{ marginBottom: 20 }}>
      <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-muted)' }}>
        以下为所有治理模块的 forbiddenActions 汇总。这些动作在 Governance Center 中全部禁止展示为可执行按钮。
        <strong style={{ color: 'var(--danger)' }}> 这不是权限系统 — 仅做治理展示。</strong>
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--danger)', marginBottom: 4 }}>关键禁止操作（15 项）</div>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 10 }}>
        {criticalActions.map(a => <Badge key={a} label={a} color="var(--danger)" />)}
      </div>
      {normalActions.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>其他禁止操作（{normalActions.length} 项）</div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {normalActions.map(a => <Badge key={a} label={a} color="var(--danger)" />)}
          </div>
        </>
      )}
      <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        forbiddenActions 是治理展示，不是权限系统。页面不会执行这些动作。
      </div>
    </SectionCard>
  );
}

export default function GovernanceCenter() {
  const summary = useMemo(() => getGovernanceRegistrySummary(), []);
  const validator = useMemo(() => validateGovernanceRegistry(), []);
  const allGates = useMemo(() => GOVERNANCE_REGISTRY.flatMap(m => m.gates || []), []);

  const selfCheck = useMemo(() => {
    const checks: Array<{ name: string; status: 'pass' | 'fail'; detail: string }> = [];
    checks.push({ name: `Module count === ${VALIDATOR_EXPECTED.modules}`, status: GOVERNANCE_REGISTRY.length === VALIDATOR_EXPECTED.modules ? 'pass' : 'fail', detail: String(GOVERNANCE_REGISTRY.length) });
    checks.push({ name: `Gate count >= ${VALIDATOR_EXPECTED.gates}`, status: allGates.length >= VALIDATOR_EXPECTED.gates ? 'pass' : 'fail', detail: String(allGates.length) });
    checks.push({ name: 'Validator overall === pass', status: validator.pass ? 'pass' : 'fail', detail: validator.pass ? 'pass' : 'fail' });
    checks.push({ name: 'Blocking issues === 0', status: validator.blockingCount === 0 ? 'pass' : 'fail', detail: String(validator.blockingCount) });
    checks.push({ name: 'Warning issues === 0', status: validator.warningCount === 0 ? 'pass' : 'fail', detail: String(validator.warningCount) });
    const statusSum = Object.values(summary.byStatus).reduce((a: number, b: number) => a + b, 0);
    checks.push({ name: 'byStatus subtotal === total', status: statusSum === summary.totalModules ? 'pass' : 'fail', detail: `${statusSum} vs ${summary.totalModules}` });
    const cr = GOVERNANCE_REGISTRY.find(m => m.moduleId === 'cost-routing');
    checks.push({ name: 'cost-routing currentEntry === /cost-routing', status: cr?.currentEntry === '/cost-routing' ? 'pass' : 'fail', detail: cr?.currentEntry || 'MISSING' });
    const stageCGate = allGates.find(g => g.gateId === 'stage_c_gate');
    checks.push({ name: 'stage_c_gate status !== pass', status: stageCGate && stageCGate.status !== 'pass' ? 'pass' : 'fail', detail: stageCGate?.status || 'MISSING' });
    const writesDB = GOVERNANCE_REGISTRY.filter(m => m.writesDatabase);
    checks.push({ name: 'No module writesDatabase === true', status: writesDB.length === 0 ? 'pass' : 'fail', detail: writesDB.map(m => m.moduleId).join(', ') || '0' });
    return { pass: checks.every(c => c.status === 'pass'), checks };
  }, [summary, validator, allGates]);

  return (
    <PageShell
      title="Governance Center"
      subtitle="Readonly Stage C governance preview — policy review only, no real controls"
      versionLabel="AIP v8.0.0 · Governance Preview"
      maturity="preview"
      safetyBoundary="readonly"
      safetyText="Readonly governance preview · Stage C deferred · No approval controls · No mutation paths · No external writes · No executable controls · Design-only gates · Schema implemented · Synthetic dry-run only"
    >
      {/* Governance Summary Hero */}
      <SectionCard title="Governance Center Overview" style={{ marginBottom: 20 }}>
        <GovernanceCenterOverview />
      </SectionCard>

      {/* Self-check */}
      {!selfCheck.pass && (
        <div style={{ padding: '10px 16px', marginBottom: 16, borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', fontSize: 12 }}>
          <strong>自检失败：</strong>
          {selfCheck.checks.filter(c => c.status === 'fail').map((c, i) => <div key={i}>❌ {c.name}: {c.detail}</div>)}
        </div>
      )}
      {selfCheck.pass && (
        <div style={{ padding: '8px 16px', marginBottom: 16, borderRadius: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: 'var(--success)', fontSize: 12 }}>
          ✅ 自检通过 — {selfCheck.checks.length} 项检查全部 pass
        </div>
      )}

      {/* Stage C Preview Panel */}
      <SectionCard title="Stage C Preview Panel" style={{ marginBottom: 20, border: '1px solid var(--warning)' }}>
        <StageCPreviewPanel />
      </SectionCard>

      {/* Governance Gate Matrix */}
      <SectionCard title="Governance Gate Matrix" style={{ marginBottom: 20 }}>
        <GovernanceGateMatrix />
      </SectionCard>

      {/* Risk / Safety Summary */}
      <RiskSummarySection summary={summary} modules={GOVERNANCE_REGISTRY} />

      {/* Governance Modules */}
      <SectionCard title="Governance Modules" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 12 }}>
          {GOVERNANCE_REGISTRY.map(m => <ModuleCard key={m.moduleId} mod={m} />)}
        </div>
      </SectionCard>

      {/* Gates Panel */}
      <SectionCard title="Governance Gates" style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-muted)' }}>
          {allGates.length} gates · blocking gate failure prevents next stage · stage_c_gate is deferred, Stage C not started
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
          {allGates.map(g => <GateCard key={g.gateId} gate={g} />)}
        </div>
      </SectionCard>

      {/* Validator Issues */}
      <SectionCard title="Validator Issues" style={{ marginBottom: 20 }}>
        {validator.issues.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11 }}>
            {validator.issues.map((issue, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                <Badge label={issue.severity} color={issue.severity === 'blocking' ? 'var(--danger)' : issue.severity === 'warning' ? 'var(--warning)' : '#6B7280'} />
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#6B7280' }}>{issue.moduleId || '—'}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{issue.field || ''}</span>
                <span style={{ color: 'var(--text-primary)' }}>{issue.message}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 12, textAlign: 'center', color: 'var(--success)', fontSize: 12 }}>✅ No issues</div>
        )}
      </SectionCard>

      {/* Forbidden Actions Matrix */}
      <ForbiddenActionsMatrix modules={GOVERNANCE_REGISTRY} />

      {/* Governance Safety / Risk Matrix */}
      <SectionCard title="Governance Safety / Risk Matrix" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gap: 2, fontSize: 9 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 60px 2fr', gap: 8, padding: '4px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>
            <span>Risk Item</span><span>Status</span><span>Evidence</span>
          </div>
          {[
            { item: 'Layout mutation', pass: true, ev: 'No Layout change' },
            { item: 'Sidebar expansion', pass: true, ev: 'No new sidebar item' },
            { item: 'Route expansion', pass: true, ev: 'No new route' },
            { item: 'Real approval button', pass: true, ev: 'none' },
            { item: 'Real reject button', pass: true, ev: 'none' },
            { item: 'DB write path', pass: true, ev: 'none' },
            { item: 'Memory candidate mutation', pass: true, ev: 'none' },
            { item: 'External write path', pass: true, ev: 'none' },
            { item: 'Connector write', pass: true, ev: 'none' },
            { item: 'LAN sync', pass: true, ev: 'none' },
            { item: 'Lab execution', pass: true, ev: 'none' },
            { item: 'Training trigger', pass: true, ev: 'none' },
            { item: 'Inference trigger', pass: true, ev: 'none' },
            { item: 'Deployment trigger', pass: true, ev: 'none' },
            { item: 'Service control', pass: true, ev: 'none' },
            { item: 'Stage C activation', pass: true, ev: 'false' },
            { item: 'Tag / Release', pass: true, ev: 'none' },
            { item: 'External Write Gate design', pass: true, ev: 'design-only, no write' },
            { item: 'Connector Write Policy', pass: true, ev: 'all allowedWrite=no' },
            { item: 'External IO', pass: true, ev: 'all Write/Sync/Upload/Deploy=no' },
            { item: 'Write guardrails', pass: true, ev: 'all activeRisk=0' },
            { item: 'Write lifecycle', pass: true, ev: 'design-only, no runtime' },
            { item: 'Deployment Gate design', pass: true, ev: 'design-only, no deploy' },
            { item: 'Rollback Gate design', pass: true, ev: 'design-only, no rollback/restore' },
            { item: 'Deployment evidence', pass: true, ev: 'design-only, no runtime' },
            { item: 'Deploy/Rollback guardrails', pass: true, ev: 'all activeRisk=0' },
            { item: 'Emergency Stop Gate', pass: true, ev: 'design-only, no stop/kill/restart' },
            { item: 'Emergency Stop boundary', pass: true, ev: 'all stop/pause/kill=no' },
            { item: 'Audit Evidence Gate', pass: true, ev: 'design-only, no write/upload/export' },
            { item: 'Emergency/Audit guardrails', pass: true, ev: 'all activeRisk=0' },
          ].map(r => (
            <div key={r.item} style={{ display: 'grid', gridTemplateColumns: '1.5fr 60px 2fr', gap: 8, padding: '5px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-primary)' }}>{r.item}</span>
              <span style={{ fontWeight: 600, color: r.pass ? 'var(--success)' : 'var(--danger)' }}>{r.pass ? 'PASS' : 'FAIL'}</span>
              <span style={{ color: 'var(--text-muted)' }}>{r.ev}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>Smoke test: SKIP (no live server).</div>
      </SectionCard>

      {/* Governance Boundary Panel */}
      <SectionCard title="Governance Boundary Panel" style={{ marginBottom: 20, border: '1px solid var(--warning)' }}>
        <GovernanceBoundaryPanel />
      </SectionCard>

      {/* Deferred Control Path */}
      <SectionCard title="Deferred Control Path" style={{ marginBottom: 20 }}>
        <DeferredControlPath />
      </SectionCard>

      {/* Governance Governance Summary KPIs */}
      <SectionCard title="Governance Summary" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 8 }}>
          {[
            { label: 'Approval controls', value: '0', color: 'var(--success)' },
            { label: 'Reject controls', value: '0', color: 'var(--success)' },
            { label: 'Mutation paths', value: '0', color: 'var(--success)' },
            { label: 'External writes', value: '0', color: 'var(--success)' },
            { label: 'Real control buttons', value: '0', color: 'var(--success)' },
            { label: 'Deployment triggers', value: '0', color: 'var(--success)' },
            { label: 'Service controls', value: '0', color: 'var(--success)' },
            { label: 'Tag / Release triggers', value: '0', color: 'var(--success)' },
            { label: 'External write fields', value: '12', color: '#8B5CF6' },
            { label: 'Connector policy entries', value: '10', color: '#8B5CF6' },
            { label: 'IO matrix rows', value: '10', color: '#8B5CF6' },
            { label: 'Evidence types', value: '12', color: '#8B5CF6' },
            { label: 'Guardrail rows', value: '10', color: 'var(--success)' },
            { label: 'Lifecycle stages', value: '11', color: '#8B5CF6' },
            { label: 'Deploy design fields', value: '11', color: '#F97316' },
            { label: 'Rollback design fields', value: '10', color: '#F97316' },
            { label: 'Deploy boundary rows', value: '7', color: '#F97316' },
            { label: 'Deploy evidence types', value: '10', color: '#F97316' },
            { label: 'Deploy/rollback stages', value: '10', color: '#F97316' },
            { label: 'Emergency stop fields', value: '11', color: '#EF4444' },
            { label: 'Emergency policies', value: '10', color: '#EF4444' },
            { label: 'Emergency boundary rows', value: '7', color: '#EF4444' },
            { label: 'Audit evidence fields', value: '11', color: '#3B82F6' },
            { label: 'Evidence retention rows', value: '8', color: '#3B82F6' },
            { label: 'Emergency/audit guardrails', value: '8', color: '#EF4444' },
            { label: 'Emergency/audit stages', value: '11', color: '#EF4444' },
            { label: 'P9 — Gates covered', value: '9', color: '#8B5CF6' },
            { label: 'P9 — Design packages', value: '7', color: '#8B5CF6' },
            { label: 'P9 — Activation blockers', value: '13', color: 'var(--danger)' },
            { label: 'P9 — Missing gates', value: '0', color: 'var(--success)' },
            { label: 'P9 — Control count total', value: '0', color: 'var(--success)' },
          ].map(k => (
            <div key={k.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 8, color: 'var(--text-muted)', marginBottom: 1 }}>{k.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── v7.25.0 Runtime Authorization Foundation ── */}
      <SectionCard title="v7.25 Runtime Authorization Foundation" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <RuntimeFoundationStatusCard />
        <AuthorizationDryRunStatusCard />
        <div style={{ padding: '8px 12px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.6 }}>
          <strong>Foundation (v7.25.0):</strong> Storage schema implemented · API guarded skeleton · Synthetic dry-run only · Production runtime evaluator not implemented · Real controls: 0 · External writes: 0 · Stage C: Disabled<br/>
          <strong>Dry-run Validation (v7.25.1 Detail-Complete Candidate):</strong> 8 synthetic fixtures hardened · 4 safe DB tables · Deny-by-default evaluator · API rejection gates · 5 guarded endpoints · Controlled synthetic dry-run only · Stage C: Disabled · Production Runtime: Blocked · Real Controls: 0 · External Writes: 0 · Final Seal: Pending
        </div>
      </SectionCard>

      {/* ── v7.23.0-P1 Design Spec Sections ── */}

      <SectionCard title="Governance Data Model" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <GovernanceDataModelPanel />
      </SectionCard>

      <SectionCard title="Stage C Design Spec" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <StageCDesignSpecPanel />
      </SectionCard>

      <SectionCard title="Approval / Mutation / Execution Gate Matrix" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <div style={{ display: 'grid', gap: 2, fontSize: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 70px 60px 60px 80px 1.2fr 80px', gap: 8, padding: '5px 8px', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>
            <span>Gate</span><span>Mode</span><span>Approval</span><span>Write</span><span>Execute</span><span>Ext.IO</span><span>Evidence</span><span>Stage</span>
          </div>
          {[
            { gate: 'Approval Gate', mode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', extIO: 'no', evidence: 'policy + audit', stage: 'deferred' },
            { gate: 'Mutation Gate', mode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', extIO: 'no', evidence: 'diff + rollback', stage: 'deferred' },
            { gate: 'Execution Gate', mode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', extIO: 'no', evidence: 'dry-run + approval', stage: 'deferred' },
            { gate: 'External Write Gate', mode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', extIO: 'gated', evidence: 'endpoint + audit', stage: 'deferred' },
            { gate: 'Deployment Gate', mode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', extIO: 'gated', evidence: 'release plan', stage: 'deferred' },
            { gate: 'Rollback Gate', mode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', extIO: 'no', evidence: 'restore plan', stage: 'deferred' },
            { gate: 'Connector Write Policy', mode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', extIO: 'gated', evidence: 'endpoint + risk', stage: 'deferred' },
            { gate: 'External IO Boundary', mode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', extIO: 'gated/disabled', evidence: 'boundary matrix', stage: 'deferred' },
            { gate: 'Write Guardrail', mode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', extIO: 'none', evidence: 'activeRisk=0', stage: 'deferred' },
            { gate: 'Deployment Request Model', mode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', extIO: 'none', evidence: 'build+release plan', stage: 'deferred' },
            { gate: 'Deployment Boundary', mode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', extIO: 'gated', evidence: 'deploy boundary', stage: 'deferred' },
            { gate: 'Rollback Plan Model', mode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', extIO: 'none', evidence: 'restore+verification', stage: 'deferred' },
            { gate: 'Deploy/Rollback Guardrail', mode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', extIO: 'none', evidence: 'activeRisk=0', stage: 'deferred' },
            { gate: 'Emergency Stop Gate', mode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', extIO: 'none', evidence: 'stop plan', stage: 'deferred' },
            { gate: 'Emergency Stop Policy', mode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', extIO: 'none', evidence: 'policy model', stage: 'deferred' },
            { gate: 'Emergency Stop Boundary', mode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', extIO: 'none', evidence: 'boundary matrix', stage: 'deferred' },
            { gate: 'Audit Evidence Gate', mode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', extIO: 'none', evidence: 'evidence model', stage: 'deferred' },
            { gate: 'Audit Evidence Retention', mode: 'design-only', approval: 'deferred', write: 'no', execute: 'no', extIO: 'none', evidence: 'retention matrix', stage: 'deferred' },
          ].map(r => (
            <div key={r.gate} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 70px 60px 60px 80px 1.2fr 80px', gap: 8, padding: '5px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.gate}</span>
              <span style={{ color: '#8B5CF6' }}>{r.mode}</span>
              <span style={{ color: '#F97316' }}>{r.approval}</span>
              <span style={{ color: 'var(--success)' }}>{r.write}</span>
              <span style={{ color: 'var(--success)' }}>{r.execute}</span>
              <span style={{ color: r.extIO === 'gated' ? 'var(--warning)' : 'var(--success)' }}>{r.extIO}</span>
              <span style={{ color: 'var(--text-muted)' }}>{r.evidence}</span>
              <span style={{ color: '#F97316' }}>{r.stage}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Design-only gate matrix. No buttons or controls exist for any gate. All gates deferred.
        </div>
      </SectionCard>

      <SectionCard title="Governance Lifecycle Matrix" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <GovernanceLifecycleMatrix />
      </SectionCard>

      <SectionCard title="Control Boundary Contract" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <ControlBoundaryContract />
      </SectionCard>

      <SectionCard title="Stage C Readiness Checklist" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <StageCReadinessChecklist />
      </SectionCard>

      <SectionCard title="Risk Acceptance Matrix" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <RiskAcceptanceMatrix />
      </SectionCard>

      {/* ── v7.23.0-P3 Approval Gate Design Spec Sections ── */}

      <SectionCard title="Approval Gate Design Spec" style={{ marginBottom: 20, border: '1px solid #EC4899' }}>
        <ApprovalGateDesignSpec />
      </SectionCard>

      <SectionCard title="Approval Evidence Model" style={{ marginBottom: 20, border: '1px solid #EC4899' }}>
        <ApprovalEvidenceModel />
      </SectionCard>

      <SectionCard title="Approval Rollback Plan Spec" style={{ marginBottom: 20, border: '1px solid #EC4899' }}>
        <ApprovalRollbackPlan />
      </SectionCard>

      <SectionCard title="Approval Audit Trail Spec" style={{ marginBottom: 20, border: '1px solid #EC4899' }}>
        <ApprovalAuditTrailSpec />
      </SectionCard>

      <SectionCard title="Approval Gate Matrix" style={{ marginBottom: 20, border: '1px solid #EC4899' }}>
        <ApprovalGateMatrixTable />
      </SectionCard>

      {/* ── v7.23.0-P4 Mutation Gate Design Spec Sections ── */}

      <SectionCard title="Mutation Gate Design Spec" style={{ marginBottom: 20, border: '1px solid #A855F7' }}>
        <MutationGateDesignSpec />
      </SectionCard>

      <SectionCard title="Mutation Request Model" style={{ marginBottom: 20, border: '1px solid #A855F7' }}>
        <MutationRequestModel />
      </SectionCard>

      <SectionCard title="Mutation Diff / Impact Matrix" style={{ marginBottom: 20, border: '1px solid #A855F7' }}>
        <MutationDiffImpactMatrix />
      </SectionCard>

      <SectionCard title="Mutation Rollback Contract" style={{ marginBottom: 20, border: '1px solid #A855F7' }}>
        <MutationRollbackContract />
      </SectionCard>

      <SectionCard title="Mutation Risk Guardrail Matrix" style={{ marginBottom: 20, border: '1px solid #A855F7' }}>
        <MutationRiskGuardrailMatrix />
      </SectionCard>

      {/* ── v7.23.0-P5 Execution Gate Design Spec Sections ── */}

      <SectionCard title="Execution Gate Design Spec" style={{ marginBottom: 20, border: '1px solid #3B82F6' }}>
        <ExecutionGateDesignSpec />
      </SectionCard>

      <SectionCard title="Execution Request Model" style={{ marginBottom: 20, border: '1px solid #3B82F6' }}>
        <ExecutionRequestModel />
      </SectionCard>

      <SectionCard title="Execution Preflight / Dry-run Matrix" style={{ marginBottom: 20, border: '1px solid #3B82F6' }}>
        <ExecutionPreflightMatrix />
      </SectionCard>

      <SectionCard title="Execution Boundary Matrix" style={{ marginBottom: 20, border: '1px solid #3B82F6' }}>
        <ExecutionBoundaryMatrix />
      </SectionCard>

      <SectionCard title="Execution Risk Guardrail Matrix" style={{ marginBottom: 20, border: '1px solid #3B82F6' }}>
        <ExecutionRiskGuardrailMatrix />
      </SectionCard>

      {/* ── v7.23.0-P6 External Write Gate + Connector Write Policy Design Spec Sections ── */}

      <SectionCard title="External Write Gate Design Spec" style={{ marginBottom: 20, border: '1px solid #DC2626' }}>
        <ExternalWriteGateDesignSpec />
      </SectionCard>

      <SectionCard title="Connector Write Policy Model" style={{ marginBottom: 20, border: '1px solid #DC2626' }}>
        <ConnectorWritePolicyModel />
      </SectionCard>

      <SectionCard title="External IO Boundary Matrix" style={{ marginBottom: 20, border: '1px solid #DC2626' }}>
        <ExternalIOBoundaryMatrix />
      </SectionCard>

      <SectionCard title="External Write Evidence Matrix" style={{ marginBottom: 20, border: '1px solid #DC2626' }}>
        <ExternalWriteEvidenceMatrix />
      </SectionCard>

      <SectionCard title="External Write Guardrail Matrix" style={{ marginBottom: 20, border: '1px solid #DC2626' }}>
        <ExternalWriteGuardrailMatrix />
      </SectionCard>

      <SectionCard title="Connector Write Lifecycle Design" style={{ marginBottom: 20, border: '1px solid #DC2626' }}>
        <ConnectorWriteLifecycleDesign />
      </SectionCard>

      {/* ── v7.23.0-P7 Deployment Gate + Rollback Gate Design Spec Sections ── */}

      <SectionCard title="Deployment Gate Design Spec" style={{ marginBottom: 20, border: '1px solid #F97316' }}>
        <DeploymentGateDesignSpec />
      </SectionCard>

      <SectionCard title="Deployment Request Model" style={{ marginBottom: 20, border: '1px solid #F97316' }}>
        <DeploymentRequestModel />
      </SectionCard>

      <SectionCard title="Deployment Boundary Matrix" style={{ marginBottom: 20, border: '1px solid #F97316' }}>
        <DeploymentBoundaryMatrix />
      </SectionCard>

      <SectionCard title="Deployment Evidence / Release Plan Matrix" style={{ marginBottom: 20, border: '1px solid #F97316' }}>
        <DeploymentEvidenceMatrix />
      </SectionCard>

      <SectionCard title="Rollback Gate Design Spec" style={{ marginBottom: 20, border: '1px solid #F97316' }}>
        <RollbackGateDesignSpec />
      </SectionCard>

      <SectionCard title="Rollback Plan Model" style={{ marginBottom: 20, border: '1px solid #F97316' }}>
        <RollbackPlanModel />
      </SectionCard>

      <SectionCard title="Deployment / Rollback Guardrail Matrix" style={{ marginBottom: 20, border: '1px solid #F97316' }}>
        <DeploymentRollbackGuardrailMatrix />
      </SectionCard>

      <SectionCard title="Deployment / Rollback Lifecycle Design" style={{ marginBottom: 20, border: '1px solid #F97316' }}>
        <DeploymentRollbackLifecycleDesign />
      </SectionCard>

      {/* ── v7.23.0-P8 Emergency Stop Gate + Audit Evidence Gate Design Spec Sections ── */}

      <SectionCard title="Emergency Stop Gate Design Spec" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <EmergencyStopGateDesignSpec />
      </SectionCard>

      <SectionCard title="Emergency Stop Policy Model" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <EmergencyStopPolicyModel />
      </SectionCard>

      <SectionCard title="Emergency Stop Boundary Matrix" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <EmergencyStopBoundaryMatrix />
      </SectionCard>

      <SectionCard title="Audit Evidence Gate Design Spec" style={{ marginBottom: 20, border: '1px solid #3B82F6' }}>
        <AuditEvidenceGateDesignSpec />
      </SectionCard>

      <SectionCard title="Audit Evidence Model / Retention Matrix" style={{ marginBottom: 20, border: '1px solid #3B82F6' }}>
        <AuditEvidenceRetentionMatrix />
      </SectionCard>

      <SectionCard title="Emergency Stop + Audit Guardrail Matrix" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <EmergencyStopAuditGuardrailMatrix />
      </SectionCard>

      <SectionCard title="Emergency Stop + Audit Lifecycle Design" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <EmergencyStopAuditLifecycleDesign />
      </SectionCard>

      {/* ── v7.23.0-P9 Gate Coverage Closure Audit Sections ── */}

      <SectionCard title="Gate Coverage Overview (P9)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <GateCoverageOverview />
      </SectionCard>

      <SectionCard title="P1–P8 Design Spec Coverage Audit (P9)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <GateCoverageAuditMatrix />
      </SectionCard>

      <SectionCard title="Stage C Readiness Blocker Matrix (P9)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <StageCReadinessBlockerMatrix />
      </SectionCard>

      <SectionCard title="Cross-Gate Dependency Matrix (P9)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <CrossGateDependencyMatrix />
      </SectionCard>

      <SectionCard title="Control Boundary Final Matrix (P9)" style={{ marginBottom: 20, border: '1px solid var(--success)' }}>
        <ControlBoundaryFinalMatrix />
      </SectionCard>

      <SectionCard title="Stage C Activation Non-Readiness Statement (P9)" style={{ marginBottom: 20, border: '2px solid #EF4444' }}>
        <StageCNonReadinessStatement />
      </SectionCard>

      {/* ── v7.23.1 Closure Metrics Snapshot ── */}
      <SectionCard title="Closure Metrics Snapshot (v7.23.1)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <ClosureMetricsSnapshot />
      </SectionCard>

      {/* ── v7.24.0-P1 Stage C Activation Planning + Runtime Authorization Design Sections ── */}

      <SectionCard title="Stage C Activation Planning Overview (P1)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <StageCActivationPlanningOverview />
      </SectionCard>

      <SectionCard title="Runtime Authorization Design Fields (P1)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <RuntimeAuthorizationDesignSpec />
      </SectionCard>

      <SectionCard title="Runtime Permission Model (P1)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <RuntimePermissionModel />
      </SectionCard>

      <SectionCard title="Operator Role & Scope Matrix (P1)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <OperatorRoleScopeMatrix />
      </SectionCard>

      <SectionCard title="Activation Preconditions Matrix (P1)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <ActivationPreconditionsMatrix />
      </SectionCard>

      <SectionCard title="Runtime Control Package Boundary (P1)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <RuntimeControlPackageBoundary />
      </SectionCard>

      <SectionCard title="Stage C Blocker Resolution Plan (P1)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <StageCBlockerResolutionPlan />
      </SectionCard>

      <SectionCard title="Authorization Evidence / Audit Design (P1)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <AuthorizationEvidenceAuditDesign />
      </SectionCard>

      {/* ── v7.24.0-P2 Runtime Authorization Data Contract + Request Lifecycle Design Sections ── */}

      <SectionCard title="Runtime Authorization Data Contract (P2)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <RuntimeAuthorizationDataContract />
      </SectionCard>

      <SectionCard title="Authorization Request Lifecycle Design (P2)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <AuthorizationRequestLifecycle />
      </SectionCard>

      <SectionCard title="Authorization Decision State Model (P2)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <AuthorizationDecisionStateModel />
      </SectionCard>

      <SectionCard title="Authorization Scope Boundary Matrix (P2)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <AuthorizationScopeBoundaryMatrix />
      </SectionCard>

      <SectionCard title="Runtime Permission Evaluation Design (P2)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <RuntimePermissionEvaluationDesign />
      </SectionCard>

      <SectionCard title="Authorization Revocation / Expiry Design (P2)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <AuthorizationRevocationExpiryDesign />
      </SectionCard>

      <SectionCard title="Authorization Audit Chain Design (P2)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <AuthorizationAuditChainDesign />
      </SectionCard>

      <SectionCard title="Authorization Failure / Fallback Matrix (P2)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <AuthorizationFailureFallbackMatrix />
      </SectionCard>

      {/* ── v7.24.0-P3 Authorization Persistence Design Spec Sections ── */}

      <SectionCard title="Authorization Persistence Design Spec (P3)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <AuthorizationPersistenceDesignSpec />
      </SectionCard>

      <SectionCard title="Authorization Storage Contract (P3)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <AuthorizationStorageContract />
      </SectionCard>

      <SectionCard title="Authorization Persistence Entity Model (P3)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <AuthorizationPersistenceEntityModel />
      </SectionCard>

      <SectionCard title="Authorization Record Lifecycle Design (P3)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <AuthorizationRecordLifecycleDesign />
      </SectionCard>

      <SectionCard title="Authorization Storage Boundary Matrix (P3)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <AuthorizationStorageBoundaryMatrix />
      </SectionCard>

      <SectionCard title="Authorization Persistence Risk Guardrail Matrix (P3)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <AuthorizationPersistenceRiskGuardrailMatrix />
      </SectionCard>

      <SectionCard title="Authorization Retention / Expiry Storage Design (P3)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <AuthorizationRetentionExpiryStorageDesign />
      </SectionCard>

      <SectionCard title="Authorization Persistence Audit / Integrity Design (P3)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <AuthorizationPersistenceAuditIntegrityDesign />
      </SectionCard>

      {/* ── v7.24.0-P4 Authorization Review Policy + Decision Governance Design Sections ── */}

      <SectionCard title="Authorization Review Policy Design (P4)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <AuthorizationReviewPolicyDesign />
      </SectionCard>

      <SectionCard title="Authorization Decision Governance Model (P4)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <AuthorizationDecisionGovernanceModel />
      </SectionCard>

      <SectionCard title="Manual Review Scope Matrix (P4)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <ManualReviewScopeMatrix />
      </SectionCard>

      <SectionCard title="Decision Evidence Requirement Matrix (P4)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <DecisionEvidenceRequirementMatrix />
      </SectionCard>

      <SectionCard title="Deny-by-Default Policy Design (P4)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <DenyByDefaultPolicyDesign />
      </SectionCard>

      <SectionCard title="Decision Conflict / Override Boundary Matrix (P4)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <DecisionConflictOverrideBoundaryMatrix />
      </SectionCard>

      <SectionCard title="Review Escalation / Expiry / Revocation Policy (P4)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <ReviewEscalationExpiryRevocationPolicy />
      </SectionCard>

      <SectionCard title="Authorization Decision Audit Design (P4)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <AuthorizationDecisionAuditDesign />
      </SectionCard>

      {/* ── v7.24.0-P5 Activation Blocker Resolution Roadmap + Runtime Readiness Simulation Sections ── */}

      <SectionCard title="Activation Blocker Resolution Roadmap (P5)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <ActivationBlockerResolutionRoadmap />
      </SectionCard>

      <SectionCard title="Runtime Readiness Simulation Model (P5)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <RuntimeReadinessSimulationModel />
      </SectionCard>

      <SectionCard title="Go / No-Go Decision Matrix (P5)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <GoNoGoDecisionMatrix />
      </SectionCard>

      <SectionCard title="Blocker Dependency Sequencing Matrix (P5)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <BlockerDependencySequencingMatrix />
      </SectionCard>

      <SectionCard title="Stage C Dry-run Simulation Design (P5)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <StageCDryRunSimulationDesign />
      </SectionCard>

      <SectionCard title="Activation Safety Review Checklist (P5)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <ActivationSafetyReviewChecklist />
      </SectionCard>

      <SectionCard title="Runtime Readiness Evidence Matrix (P5)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <RuntimeReadinessEvidenceMatrix />
      </SectionCard>

      <SectionCard title="Activation Rollback Readiness Plan (P5)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <ActivationRollbackReadinessPlan />
      </SectionCard>

      {/* ── v7.24.0-P6 Runtime Implementation Package Boundary + Storage/API Design Review Sections ── */}

      <SectionCard title="Runtime Implementation Package Boundary (P6)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <RuntimeImplementationPackageBoundary />
      </SectionCard>

      <SectionCard title="Authorization Storage Schema Design Review (P6)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <AuthorizationStorageSchemaDesignReview />
      </SectionCard>

      <SectionCard title="Authorization API Contract Design Review (P6)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <AuthorizationApiContractDesignReview />
      </SectionCard>

      <SectionCard title="Runtime Evaluator Implementation Boundary (P6)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <RuntimeEvaluatorImplementationBoundary />
      </SectionCard>

      <SectionCard title="Review Workflow Implementation Boundary (P6)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <ReviewWorkflowImplementationBoundary />
      </SectionCard>

      <SectionCard title="Storage/API Risk Review Matrix (P6)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <StorageApiRiskReviewMatrix />
      </SectionCard>

      <SectionCard title="Implementation Sequencing Plan (P6)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <ImplementationSequencingPlan />
      </SectionCard>

      <SectionCard title="Implementation Go/No-Go Gate (P6)" style={{ marginBottom: 20, border: '2px solid #EF4444' }}>
        <ImplementationGoNoGoGate />
      </SectionCard>

      {/* ── v7.24.0-P7 Storage Schema Implementation Plan Review + Migration Boundary Design Sections ── */}

      <SectionCard title="Schema Implementation Plan Review (P7)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <P7SchemaImplementationPlan />
      </SectionCard>

      <SectionCard title="Authorization Table Design Review (P7)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <P7AuthorizationTableDesignReview />
      </SectionCard>

      <SectionCard title="Migration Boundary Design (P7)" style={{ marginBottom: 20, border: '1px solid #F59E0B' }}>
        <P7MigrationBoundaryDesign />
      </SectionCard>

      <SectionCard title="Schema Change Risk Matrix (P7)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <P7SchemaChangeRiskMatrix />
      </SectionCard>

      <SectionCard title="Data Retention / Cleanup Design Review (P7)" style={{ marginBottom: 20, border: '1px solid #14B8A6' }}>
        <P7RetentionCleanupDesign />
      </SectionCard>

      <SectionCard title="Schema Rollback Planning Design (P7)" style={{ marginBottom: 20, border: '1px solid #F43F5E' }}>
        <P7SchemaRollbackPlanning />
      </SectionCard>

      <SectionCard title="Storage Validation Plan (P7)" style={{ marginBottom: 20, border: '1px solid #06B6D4' }}>
        <P7StorageValidationPlan />
      </SectionCard>

      <SectionCard title="DB Doctor Extension Design (P7)" style={{ marginBottom: 20, border: '1px solid #6366F1' }}>
        <P7DbDoctorExtensionDesign />
      </SectionCard>

      {/* ── v7.24.0-P8 Authorization API Contract Implementation Plan Review + Endpoint Boundary Design Sections ── */}

      <SectionCard title="Authorization API Implementation Plan Review (P8)" style={{ marginBottom: 20, border: '1px solid #3B82F6' }}>
        <AuthorizationApiImplementationPlanReview />
      </SectionCard>

      <SectionCard title="Authorization Endpoint Boundary Design (P8)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <AuthorizationEndpointBoundaryDesign />
      </SectionCard>

      <SectionCard title="API Request / Response Contract Review (P8)" style={{ marginBottom: 20, border: '1px solid #14B8A6' }}>
        <ApiRequestResponseContractReview />
      </SectionCard>

      <SectionCard title="API Handler Risk Matrix (P8)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <ApiHandlerRiskMatrix />
      </SectionCard>

      <SectionCard title="API Auth / Permission Boundary Design (P8)" style={{ marginBottom: 20, border: '1px solid #F59E0B' }}>
        <ApiAuthPermissionBoundaryDesign />
      </SectionCard>

      <SectionCard title="API Error / Fallback Contract Design (P8)" style={{ marginBottom: 20, border: '1px solid #F43F5E' }}>
        <ApiErrorFallbackContractDesign />
      </SectionCard>

      <SectionCard title="API Audit / Evidence Boundary Design (P8)" style={{ marginBottom: 20, border: '1px solid #06B6D4' }}>
        <ApiAuditEvidenceBoundaryDesign />
      </SectionCard>

      <SectionCard title="API Validation Plan (P8)" style={{ marginBottom: 20, border: '1px solid #6366F1' }}>
        <ApiValidationPlan />
      </SectionCard>

      {/* ── v7.24.0-P9 Runtime Evaluator Implementation Plan Review + Permission Evaluation Boundary Design Sections ── */}

      <SectionCard title="Runtime Evaluator Implementation Plan Review (P9)" style={{ marginBottom: 20, border: '1px solid #10B981' }}>
        <RuntimeEvaluatorImplementationPlanReview />
      </SectionCard>

      <SectionCard title="Permission Evaluation Boundary Design (P9)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <PermissionEvaluationBoundaryDesign />
      </SectionCard>

      <SectionCard title="Evaluator Input / Output Contract Review (P9)" style={{ marginBottom: 20, border: '1px solid #14B8A6' }}>
        <EvaluatorInputOutputContractReview />
      </SectionCard>

      <SectionCard title="Deny-by-default Evaluation Chain Design (P9)" style={{ marginBottom: 20, border: '1px solid #F59E0B' }}>
        <DenyByDefaultEvaluationChainDesign />
      </SectionCard>

      <SectionCard title="Evaluator Dependency Matrix (P9)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <EvaluatorDependencyMatrix />
      </SectionCard>

      <SectionCard title="Evaluator Risk Guardrail Matrix (P9)" style={{ marginBottom: 20, border: '1px solid #F43F5E' }}>
        <EvaluatorRiskGuardrailMatrix />
      </SectionCard>

      <SectionCard title="Evaluator Failure / Fallback Design (P9)" style={{ marginBottom: 20, border: '1px solid #06B6D4' }}>
        <EvaluatorFailureFallbackDesign />
      </SectionCard>

      <SectionCard title="Evaluator Validation Plan (P9)" style={{ marginBottom: 20, border: '1px solid #6366F1' }}>
        <EvaluatorValidationPlan />
      </SectionCard>

      {/* ── v7.24.0-P10 Evaluator Implementation Package Review + Runtime Dry-run Boundary Design Sections ── */}

      <SectionCard title="Evaluator Implementation Package Review (P10)" style={{ marginBottom: 20, border: '1px solid #10B981' }}>
        <EvaluatorImplementationPackageReview />
      </SectionCard>

      <SectionCard title="Runtime Dry-run Boundary Design (P10)" style={{ marginBottom: 20, border: '1px solid #06B6D4' }}>
        <RuntimeDryRunBoundaryDesign />
      </SectionCard>

      <SectionCard title="Permission Evaluator Package Boundary (P10)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <PermissionEvaluatorPackageBoundary />
      </SectionCard>

      <SectionCard title="Evaluator Package Dependency Review (P10)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <EvaluatorPackageDependencyReview />
      </SectionCard>

      <SectionCard title="Evaluator Decision Trace Design (P10)" style={{ marginBottom: 20, border: '1px solid #6366F1' }}>
        <EvaluatorDecisionTraceDesign />
      </SectionCard>

      <SectionCard title="Runtime Dry-run Fixture Model (P10)" style={{ marginBottom: 20, border: '1px solid #F59E0B' }}>
        <RuntimeDryRunFixtureModel />
      </SectionCard>

      <SectionCard title="Evaluation Result Contract Review (P10)" style={{ marginBottom: 20, border: '1px solid #14B8A6' }}>
        <EvaluationResultContractReview />
      </SectionCard>

      <SectionCard title="Evaluator Implementation No-Go Gate (P10)" style={{ marginBottom: 20, border: '2px solid #EF4444' }}>
        <EvaluatorImplementationNoGoGate />
      </SectionCard>

      {/* ── v7.24.0-P11 Implementation Package Execution Boundary Review + No-Go Seal Sections ── */}

      <SectionCard title="Implementation Package Execution Boundary Review (P11)" style={{ marginBottom: 20, border: '1px solid #64748B' }}>
        <ImplementationPackageExecutionBoundaryReview />
      </SectionCard>

      <SectionCard title="Implementation Package Execution No-Go Gate (P11)" style={{ marginBottom: 20, border: '2px solid #EF4444' }}>
        <ImplementationPackageExecutionNoGoGate />
      </SectionCard>

      <SectionCard title="Runtime Implementation No-Go Seal (P11)" style={{ marginBottom: 20, border: '2px solid #DC2626' }}>
        <RuntimeImplementationNoGoSeal />
      </SectionCard>

      <SectionCard title="Implementation Package Execution Sequencing Plan (P11)" style={{ marginBottom: 20, border: '1px solid #F59E0B' }}>
        <ImplementationPackageExecutionSequencingPlan />
      </SectionCard>

      {/* ── v7.24.0-P12 Runtime Authorization Metrics Hardening + Report Guardrail Sections ── */}

      <SectionCard title="Closure Metrics Definition Table (P12)" style={{ marginBottom: 20, border: '1px solid #14B8A6' }}>
        <ClosureMetricsDefinitionTable />
      </SectionCard>

      <SectionCard title="Report Guardrail Checklist (P12)" style={{ marginBottom: 20, border: '1px solid #6366F1' }}>
        <ReportGuardrailChecklist />
      </SectionCard>

      <SectionCard title="Metrics Hardening Rule Matrix (P12)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <MetricsHardeningRuleMatrix />
      </SectionCard>

      {/* Related Routes */}
      <SectionCard title="Related Pages" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
          <div>Governance Center is a readonly aggregation entry. Does not move pages, add sidebar items, or modify original pages.</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {['/cost-routing', '/menu-governance-preview', '/registry-render-preview', '/menu-move-dry-run', '/connector-center', '/lab-center'].map(p => (
              <Badge key={p} label={p} color="var(--secondary)" />
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Readonly Boundary Notice */}
      <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <strong>Readonly boundary notice:</strong><br />
        This is a <u>Governance Center readonly Stage C preview</u>. Governance Registry is readonly metadata. Does not execute approval/rejection, mutate candidates, write to databases/external systems, execute lab/training/inference, deploy, rollback, restore, emergency stop, pause, kill, taskkill, restart, disable, shutdown, sync LAN_SHARE, restart services, write/upload/export audit evidence, or enable Stage C. P7 storage schema implementation plan review is design-review-only — no DB schema, no migration, no API endpoint, no runtime implementation, no DB writes. P8 authorization API contract implementation plan review is review-only — no API endpoint, no route, no handler, no DB write, no runtime implementation. P9 runtime evaluator implementation plan review is review-only — no runtime evaluator, no permission evaluator, no allow/deny control, no DB write, no runtime implementation. P10 evaluator implementation package review is review-only — no evaluator runtime, no dry-run engine, no permission evaluator, no DB write, no Stage C enablement. P11 implementation package execution boundary review is review-only — no runtime execution, no evaluator runtime, no dry-run engine, no permission function, no Stage C activation. P12 runtime authorization metrics hardening + report guardrail is metrics-hardening-only — no runtime implementation, no Stage C enablement. All <code>forbiddenActions</code> are governance display, not a permission system.
      </div>
    </PageShell>
  );
}
