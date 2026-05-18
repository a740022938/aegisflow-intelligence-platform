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
      versionLabel="AIP v7.24.0-P2"
      maturity="preview"
      safetyBoundary="readonly"
      safetyText="Readonly governance preview · Stage C deferred · No approval controls · No mutation paths · No external writes · No executable controls · External Write Gate design-only · Deployment Gate design-only · Rollback Gate design-only · Emergency Stop Gate design-only · Audit Evidence Gate design-only · P9 Gate Coverage Closure Audit · Stage C not ready · No runtime enablement · v7.24.0-P1 Activation Planning — planning-only, no activation · v7.24.0-P2 Authorization Data Contract — design-contract-only, no runtime · v7.24.0-P3 Authorization Persistence Design — design-only, no persistence · v7.24.0-P4 Authorization Review Policy + Decision Governance Design — design-only, no runtime"
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
        This is a <u>Governance Center readonly Stage C preview</u>. Governance Registry is readonly metadata. Does not execute approval/rejection, mutate candidates, write to databases/external systems, execute lab/training/inference, deploy, rollback, restore, emergency stop, pause, kill, taskkill, restart, disable, shutdown, sync LAN_SHARE, restart services, write/upload/export audit evidence, or enable Stage C. All <code>forbiddenActions</code> are governance display, not a permission system.
      </div>
    </PageShell>
  );
}
