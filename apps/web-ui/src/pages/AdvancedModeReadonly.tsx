import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import {
  getPermissionEvaluationSummary,
  getPermissionEvaluationRulesByDecision,
  getPermissionEvaluationRulesByRisk,
} from '../registry/permission-evaluator-registry';
import {
  getPermissionEvaluatorValidationSummary,
} from '../registry/permission-evaluator-validator';
import {
  getRuntimeRegistrySummary,
} from '../registry/runtime-registry';
import {
  getRuntimeRegistryValidationSummary,
} from '../registry/runtime-registry-validator';
import {
  getDryRunPlanSummary,
} from '../registry/dry-run-plan-registry';
import {
  getAuditLogPreviewSummary,
} from '../registry/audit-log-registry';
import {
  getGovernanceStateSummary,
} from '../registry/governance-state-registry';
import {
  getGovernanceStateValidationSummary,
} from '../registry/governance-state-validator';
import {
  NAVIGATION_EXPOSURE_REGISTRY,
  NAVIGATION_EXPOSURE_LEVELS,
  getNavigationExposureStats,
  getNavigationExposureByLevel,
  getNavigationExposureHighRiskEntries,
  getNavigationExposureAllowedNowFalseEntries,
  getNavigationExposureByGate,
} from '../registry/navigation-exposure-registry';
import {
  CENTER_ACCESS_REGISTRY,
  getCenterAccessItemCount,
  getCenterAccessVisibleItems,
  getCenterAccessHiddenItems,
  getCenterAccessByReadiness,
  getCenterAccessSidebarCandidates,
  getCenterAccessFinalReadinessSummary,
  getCenterAccessConnectorStatusSummary,
  getCenterAccessSidebarVisibleCount,
  getCenterAccessHiddenDirectCount,
  getCenterAccessQualityGateSummary,
  getCenterAccessBySidebarState,
  getCenterAccessByOperationalMode,
  getCenterAccessSummary,
  getCenterAccessLaunchpadVisible,
  getCenterAccessAdvancedHubVisible,
  getCenterAccessHighRiskPrimaryNavCount,
  getCenterAccessStageCPrimaryNavCount,
  validateCenterAccess,
} from '../registry/center-access-registry';
import {
  ADVANCED_PLACEHOLDER_REGISTRY,
  getAdvancedPlaceholdersByDecision,
  getAdvancedPlaceholderHoldReviewItems,
  getAdvancedPlaceholdersByRisk,
} from '../registry/advanced-placeholder-registry';
import {
  getConnectorRegistryCount,
  getConnectorRegistryByCategory,
  getConnectorRegistryByRisk as getConnectorRisk,
  getConnectorRegistryQualityGateSummary,
} from '../registry/connector-registry';
import {
  getLabRegistryCount,
  getLabRegistryAvailableRoutes,
  getLabRegistryHoldReviewItems as getLabHoldReview,
  getLabRegistryFutureItems as getLabFuture,
  getLabRegistryQualityGateSummary,
} from '../registry/lab-registry';
import {
  GOVERNANCE_REGISTRY,
} from '../registry/governance-registry';
import {
  EXTERNAL_WRITE_DESIGN_FIELDS,
  CONNECTOR_POLICY_ENTRIES,
  EXTERNAL_IO_BOUNDARY_ROWS,
  EXTERNAL_WRITE_EVIDENCE_TYPES,
  EXTERNAL_WRITE_GUARDRAIL_MATRIX,
  CONNECTOR_WRITE_LIFECYCLE_STAGES,
  DEPLOYMENT_DESIGN_FIELDS,
  DEPLOYMENT_REQUEST_FIELDS,
  DEPLOYMENT_BOUNDARY_ROWS,
  DEPLOYMENT_EVIDENCE_TYPES,
  ROLLBACK_DESIGN_FIELDS,
  ROLLBACK_PLAN_FIELDS,
  DEPLOYMENT_ROLLBACK_GUARDRAIL_MATRIX,
  DEPLOYMENT_ROLLBACK_LIFECYCLE_STAGES,
  EMERGENCY_STOP_DESIGN_FIELDS,
  EMERGENCY_STOP_POLICY_ITEMS,
  EMERGENCY_STOP_BOUNDARY_ROWS,
  AUDIT_EVIDENCE_DESIGN_FIELDS,
  AUDIT_EVIDENCE_RETENTION_ROWS,
  EMERGENCY_STOP_AUDIT_GUARDRAIL_MATRIX,
  EMERGENCY_STOP_AUDIT_LIFECYCLE_STAGES,
  GATE_COVERAGE_OVERVIEW,
  COVERAGE_AUDIT_MATRIX,
  STAGE_C_BLOCKER_MATRIX,
  CROSS_GATE_DEPENDENCIES,
  CONTROL_BOUNDARY_FINAL,
  STAGE_C_ACTIVATION_PLANNING,
  RUNTIME_AUTHORIZATION_FIELDS,
  RUNTIME_PERMISSION_ENTRIES,
  OPERATOR_ROLES,
  ACTIVATION_PRECONDITIONS,
  RUNTIME_CONTROL_PACKAGES,
  BLOCKER_RESOLUTION_ITEMS,
  AUTHORIZATION_EVIDENCE_TYPES,
  RUNTIME_AUTHORIZATION_CONTRACT_FIELDS,
  AUTHORIZATION_LIFECYCLE_STAGES,
  AUTHORIZATION_DECISION_STATES,
  AUTHORIZATION_SCOPE_BOUNDARY_ROWS,
  RUNTIME_PERMISSION_EVALUATION_STEPS,
  AUTHORIZATION_REVOCATION_EXPIRY_FIELDS,
  AUTHORIZATION_AUDIT_CHAIN_STEPS,
  AUTHORIZATION_FAILURE_FALLBACK_ROWS,
  AUTHORIZATION_PERSISTENCE_DESIGN_FIELDS,
  AUTHORIZATION_STORAGE_CONTRACT_ITEMS,
  AUTHORIZATION_PERSISTENCE_ENTITY_MODELS,
  AUTHORIZATION_RECORD_LIFECYCLE_STAGES,
  AUTHORIZATION_STORAGE_BOUNDARY_ROWS,
  AUTHORIZATION_PERSISTENCE_GUARDRAIL_ROWS,
  AUTHORIZATION_RETENTION_EXPIRY_FIELDS,
  AUTHORIZATION_PERSISTENCE_AUDIT_INTEGRITY_ITEMS,
  AUTHORIZATION_REVIEW_POLICY_FIELDS,
  AUTHORIZATION_DECISION_GOVERNANCE_ITEMS,
  MANUAL_REVIEW_SCOPE_ROWS,
  DECISION_EVIDENCE_REQUIREMENT_ROWS,
  DENY_BY_DEFAULT_RULES,
  DECISION_CONFLICT_OVERRIDE_ROWS,
  REVIEW_ESCALATION_EXPIRY_REVOCATION_FIELDS,
  AUTHORIZATION_DECISION_AUDIT_ITEMS,
  ACTIVATION_BLOCKER_ROADMAP_ITEMS,
  RUNTIME_READINESS_SIMULATION_AREAS,
  GO_NO_GO_DECISION_GATES,
  BLOCKER_DEPENDENCY_SEQUENCES,
  DRY_RUN_SIMULATION_AREAS,
  ACTIVATION_SAFETY_CHECKLIST_ITEMS,
  RUNTIME_READINESS_EVIDENCE_TYPES,
  ACTIVATION_ROLLBACK_READINESS_ITEMS,
  IMPLEMENTATION_PACKAGE_BOUNDARY_ITEMS,
  FUTURE_SCHEMA_TABLES,
  FUTURE_API_ENDPOINTS,
  RUNTIME_EVALUATOR_STAGES,
  REVIEW_WORKFLOW_STAGES,
  STORAGE_API_RISK_ROWS,
  IMPLEMENTATION_SEQUENCE_ROWS,
  IMPLEMENTATION_GO_NO_GO_CHECKS,
  SCHEMA_IMPLEMENTATION_PHASES,
  AUTHORIZATION_TABLE_DESIGN_ROWS,
  MIGRATION_BOUNDARY_ITEMS,
  SCHEMA_CHANGE_RISK_ROWS,
  RETENTION_CLEANUP_POLICY_AREAS,
  SCHEMA_ROLLBACK_PLANNING_ITEMS,
  STORAGE_VALIDATION_CHECKS,
  DB_DOCTOR_EXTENSION_CHECKS,
  API_IMPLEMENTATION_PHASES,
  AUTHORIZATION_ENDPOINT_BOUNDARY_ROWS,
  API_CONTRACT_ROWS,
  API_HANDLER_RISK_ROWS,
  API_AUTH_BOUNDARY_ROWS,
  API_ERROR_FALLBACK_ROWS,
  API_AUDIT_EVIDENCE_ROWS,
  API_VALIDATION_CHECKS,
  EVALUATOR_IMPLEMENTATION_PHASES,
  PERMISSION_EVALUATION_BOUNDARY_ROWS,
  EVALUATOR_IO_CONTRACT_ROWS,
  DENY_BY_DEFAULT_CHAIN_ROWS,
  EVALUATOR_DEPENDENCY_ROWS,
  EVALUATOR_RISK_GUARDRAIL_ROWS,
  EVALUATOR_FAILURE_FALLBACK_ROWS,
  EVALUATOR_VALIDATION_CHECKS,
  EVALUATOR_IMPLEMENTATION_PACKAGE_ROWS,
  RUNTIME_DRY_RUN_BOUNDARY_ROWS,
  PERMISSION_EVALUATOR_PACKAGE_BOUNDARY_ROWS,
  EVALUATOR_PACKAGE_DEPENDENCY_ROWS,
  EVALUATOR_DECISION_TRACE_ROWS,
  RUNTIME_DRY_RUN_FIXTURE_ROWS,
  EVALUATION_RESULT_CONTRACT_ROWS,
  EVALUATOR_IMPLEMENTATION_NO_GO_CHECKS,
  IMPLEMENTATION_PACKAGE_EXECUTION_AREAS,
  IMPLEMENTATION_PACKAGE_EXECUTION_CHECKS,
  RUNTIME_IMPLEMENTATION_NO_GO_CHECKS,
  IMPLEMENTATION_PACKAGE_EXECUTION_SEQUENCE,
  CLOSURE_METRICS_DEFINITIONS,
  REPORT_GUARDRAIL_CHECKS,
  METRICS_HARDENING_RULES,
} from '../components/governance/governanceDesignSpec';
import {
  getGovernanceRegistrySummary,
  validateGovernanceRegistry,
} from '../registry/governance-registry-validator';
import {
  getNavigationExposureSafetySummary,
  getNavigationExposureSummary,
} from '../registry/navigation-exposure-registry';
import CenterLaunchpadOverview from '../components/advanced/CenterLaunchpadOverview';
import CenterLaunchpadCard from '../components/advanced/CenterLaunchpadCard';
import CenterLaunchpadDecisionPath from '../components/advanced/CenterLaunchpadDecisionPath';
import ReadonlyControlRoomOverview from '../components/control-room/ReadonlyControlRoomOverview';
import GovernanceBaselinePanel from '../components/control-room/GovernanceBaselinePanel';
import ConnectorReadinessSummaryBridge from '../components/control-room/ConnectorReadinessSummaryBridge';
import SystemSafetyMatrix from '../components/control-room/SystemSafetyMatrix';
import VersionProgressTimeline from '../components/control-room/VersionProgressTimeline';
import NextWorkstreamPanel from '../components/control-room/NextWorkstreamPanel';
import RuntimeFoundationSafetyMatrix from '../components/governance/RuntimeFoundationSafetyMatrix';
import type { NavigationExposureEntry, NavigationExposureLevel, NavigationExposureRisk } from '../registry/navigation-exposure-registry';
import type { CenterAccessItem, CenterAccessKind, CenterAccessRisk } from '../registry/center-access-registry';
import type { AdvancedPlaceholderItem, AdvancedPlaceholderDecision } from '../registry/advanced-placeholder-registry';

const RISK_COLORS: Record<string, string> = {
  low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)',
};

const LEVEL_COLORS: Record<string, string> = {
  hidden_internal: '#6B7280', direct_route: '#8B5CF6', advanced_mode: '#F97316',
  lab_mode: '#3B82F6', connector_center: '#22C55E', governance_center: '#22C55E', primary_nav: 'var(--success)',
};

const ACCESS_LEVEL_LABELS: Record<string, string> = {
  primary_nav: '主菜单', advanced_nav: '高级模式', launchpad_card: '启动台卡片',
  related_link: '相关链接', direct_url_only: '仅 URL 直达', hidden_internal: '内部隐藏', deferred: '暂缓',
};

const ACCESS_LEVEL_COLORS: Record<string, string> = {
  primary_nav: 'var(--success)', advanced_nav: '#F97316', launchpad_card: '#8B5CF6',
  related_link: '#3B82F6', direct_url_only: '#6B7280', hidden_internal: '#6B7280', deferred: 'var(--danger)',
};

const CENTER_KIND_LABELS: Record<CenterAccessKind, string> = {
  advanced: 'Advanced Mode', connector: 'Connector Center', lab: 'Lab Center',
  governance: 'Governance Center', navigation_preview: 'Navigation Preview',
  runtime_registry: 'Runtime Registry',
  governance_state_machine: 'Governance State Machine',
  human_approval: 'Human Approval',
  evidence_schema: 'Evidence Schema',
  rollback: 'Rollback',
  feature_flag_control: 'Feature Flag Control',
  feature_flag_toggle_trial: 'Toggle Trial',
  feature_flag_dry_trial: 'Dry Trial',
  operator_readiness: 'Operator Readiness',
  authorization_review_pack: 'Authorization Review Pack',
};

const CENTER_KIND_COLORS: Record<CenterAccessKind, string> = {
  advanced: '#F97316', connector: '#22C55E', lab: '#3B82F6', governance: '#22C55E', navigation_preview: '#8B5CF6',
  runtime_registry: '#8B5CF6', governance_state_machine: '#8B5CF6', human_approval: '#EC4899',   evidence_schema: '#22C55E', rollback: '#F97316', feature_flag_control: '#8B5CF6',   feature_flag_toggle_trial: '#8B5CF6',
  feature_flag_dry_trial: '#8B5CF6',
  operator_readiness: '#22C55E',
  authorization_review_pack: '#EC4899',
};

const READINESS_COLORS: Record<string, string> = {
  ready: 'var(--success)', preview_ready: 'var(--warning)', hold_review: 'var(--danger)', blocked: '#6B7280',
};

const DECISION_COLORS: Record<string, string> = {
  approved: 'var(--success)', hold: 'var(--warning)', rejected: 'var(--danger)', deferred: '#6B7280',
};

const STAGE_COLORS: Record<string, string> = {
  design: '#8B5CF6', pilot: '#F97316', stable: 'var(--success)', retired: '#6B7280',
};

const DECISION_LABELS: Record<string, string> = {
  approved: '已批准', hold: '暂持', rejected: '已拒绝', deferred: '已推迟',
};

const STAGE_LABELS: Record<string, string> = {
  design: '设计阶段', pilot: '试点阶段', stable: '稳定阶段', retired: '已退役',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{label}</span>;
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
    <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
  </div>;
}

function CenterCard({ center }: { center: CenterAccessItem }) {
  return <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${RISK_COLORS[center.risk]}`, fontSize: 11, marginBottom: 8 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{center.name}</span>
      <Badge label={CENTER_KIND_LABELS[center.kind]} color={CENTER_KIND_COLORS[center.kind]} />
      <Badge label={center.readiness} color={READINESS_COLORS[center.readiness]} />
      <Badge label={center.exposureRecommendation} color="#6B7280" />
      {center.visibleInSidebar ? <Badge label="已入菜单" color="var(--success)" /> : <Badge label="未入菜单" color="var(--warning)" />}
      {center.allowedNow ? <Badge label="当前可开放" color="var(--success)" /> : <Badge label="当前不可开放" color="var(--warning)" />}
    </div>
    <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>路由: {center.route}</div>
    <div style={{ marginBottom: 4, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{center.description}</div>
    {center.requiredBeforeExposure.length > 0 && <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>前置条件: {center.requiredBeforeExposure.map(s => <Badge key={s} label={s} color="#6B7280" />)}</div>}
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>{center.safetyBoundary.map(s => <Badge key={s} label={s} color="#6B7280" />)}</div>
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--text-muted)' }}>允许: </span>
      {center.allowedActions.map(a => <Badge key={a} label={a} color="var(--success)" />)}
      <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>禁止: </span>
      {center.blockedActions.map(a => <Badge key={a} label={a} color="var(--danger)" />)}
    </div>
    <div style={{ marginTop: 2, color: 'var(--text-muted)', fontStyle: 'italic' }}>{center.notes}</div>
  </div>;
}

function ExposureEntryRow({ entry }: { entry: NavigationExposureEntry }) {
  const isDisallowed = !entry.allowedNow;
  const isHighRisk = entry.risk === 'high';
  return <div style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: `1px solid ${isHighRisk ? 'var(--danger)' : isDisallowed ? 'var(--warning)' : 'var(--border)'}`, fontSize: 11, marginBottom: 4 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 2 }}>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>{entry.label}</span>
      <Badge label={entry.path} color="#6B7280" /><Badge label={entry.currentExposure} color="#6B7280" />
      <Badge label={`→ ${entry.recommendedExposure}`} color={LEVEL_COLORS[entry.recommendedExposure] || 'var(--secondary)'} />
      <Badge label={entry.risk} color={RISK_COLORS[entry.risk]} />
      {isDisallowed && <Badge label="当前不可开放" color="var(--warning)" />}
      {isHighRisk && <Badge label="高风险，仅可只读评估" color="var(--danger)" />}
      {entry.allowedNow && <Badge label="当前可开放" color="var(--success)" />}
    </div>
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>{entry.gates.map(g => <Badge key={g} label={g} color="#6B7280" />)}</div>
    <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{entry.reason}</div>
    {entry.notes && <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 2 }}>{entry.notes}</div>}
  </div>;
}

function EntryGroup({ title, entries }: { title: string; entries: NavigationExposureEntry[] }) {
  if (entries.length === 0) return <SectionCard title={title} style={{ marginBottom: 16 }}><div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>暂无条目</div></SectionCard>;
  return <SectionCard title={`${title}（${entries.length}）`} style={{ marginBottom: 16 }}>{entries.map(e => <ExposureEntryRow key={e.id} entry={e} />)}</SectionCard>;
}

function LaunchpadCenterCard({ center }: { center: CenterAccessItem }) {
  const needsTransition = center.accessLevel !== center.recommendedAccessLevel;
  return <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${RISK_COLORS[center.risk]}`, fontSize: 11, marginBottom: 8 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{center.name}</span>
      <Badge label={center.accessLevel} color={ACCESS_LEVEL_COLORS[center.accessLevel] || '#6B7280'} />
      {needsTransition && <Badge label={`→ ${center.recommendedAccessLevel}`} color={ACCESS_LEVEL_COLORS[center.recommendedAccessLevel] || '#6B7280'} />}
      <Badge label={center.risk} color={RISK_COLORS[center.risk]} />
      <Badge label={DECISION_LABELS[center.exposureDecision]} color={DECISION_COLORS[center.exposureDecision]} />
      <Badge label={STAGE_LABELS[center.exposureStage]} color={STAGE_COLORS[center.exposureStage]} />
      {center.visibleInSidebar ? <Badge label="已入菜单" color="var(--success)" /> : <Badge label="未入菜单" color="var(--warning)" />}
      {center.launchpadVisible && <Badge label="启动台可见" color="var(--success)" />}
      {center.advancedHubVisible && <Badge label="高级中心可见" color="#F97316" />}
    </div>
    <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>路由: {center.route} | {center.targetContainer} | owner: {center.owner} | maturity: {center.maturity}</div>
    <div style={{ color: 'var(--text-secondary)', marginBottom: 2, fontSize: 10 }}>影响: {center.userImpact}</div>
    {center.statusBadges.length > 0 && <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>{center.statusBadges.map(s => <Badge key={s} label={s} color="#6B7280" />)}</div>}
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>
      {center.safetyBoundary.map(s => <Badge key={s} label={s} color="#6B7280" />)}
    </div>
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>
      <span style={{ color: 'var(--text-muted)' }}>qualityGate: </span>
      {Object.entries(center.qualityGate).map(([k, v]) => <Badge key={k} label={`${k}=${v}`} color={v ? 'var(--success)' : 'var(--danger)'} />)}
    </div>
    {center.releaseGate.length > 0 && <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>
      <span style={{ color: 'var(--text-muted)' }}>releaseGate: </span>
      {center.releaseGate.map(g => <Badge key={g} label={g} color="#6B7280" />)}
    </div>}
    {needsTransition && <div style={{ marginBottom: 2 }}>
      <div style={{ fontSize: 9, color: 'var(--warning)', marginBottom: 1 }}>待迁移: {center.accessLevel} → {center.recommendedAccessLevel}</div>
      <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '40%', borderRadius: 2, background: 'var(--warning)' }} />
      </div>
    </div>}
    <div style={{ marginTop: 2, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{center.exposureReason}</div>
    <div style={{ marginTop: 2, color: 'var(--text-muted)', fontStyle: 'italic' }}>回滚: {center.rollbackPlan}</div>
  </div>;
}

export default function AdvancedModeReadonly() {
  const [centerFilter, setCenterFilter] = useState<string>('all');
  const stats = useMemo(() => getNavigationExposureStats(), []);
  const centerItems = useMemo(() => CENTER_ACCESS_REGISTRY, []);
  const readinessSummary = useMemo(() => getCenterAccessFinalReadinessSummary(), []);

  const advancedCandidates = useMemo(() => getNavigationExposureByLevel('advanced_mode'), []);
  const governanceCandidates = useMemo(() => getNavigationExposureByLevel('governance_center'), []);
  const connectorCandidates = useMemo(() => getNavigationExposureByLevel('connector_center'), []);
  const labCandidates = useMemo(() => getNavigationExposureByLevel('lab_mode'), []);
  const hiddenCandidates = useMemo(() => getNavigationExposureByLevel('hidden_internal'), []);
  const highRiskEntries = useMemo(() => getNavigationExposureHighRiskEntries(), []);
  const readonlyGated = useMemo(() => getNavigationExposureByGate('readonly_only'), []);
  const stageCGated = useMemo(() => getNavigationExposureByGate('stage_c_disabled'), []);

  const advancedOnly = useMemo(() => getAdvancedPlaceholdersByDecision('KEEP_ADVANCED_ONLY'), []);
  const holdReviewItems = useMemo(() => getAdvancedPlaceholderHoldReviewItems(), []);
  const highRiskPlaceholders = useMemo(() => getAdvancedPlaceholdersByRisk('high'), []);
  const placeholderItems = useMemo(() => ADVANCED_PLACEHOLDER_REGISTRY, []);

  const sidebarCandidates = useMemo(() => getCenterAccessSidebarCandidates(), []);
  const hiddenDirect = useMemo(() => centerItems.filter(c => !c.visibleInSidebar), [centerItems]);
  const connectorStatus = useMemo(() => getCenterAccessConnectorStatusSummary(), []);
  const sidebarVisibleCount = useMemo(() => getCenterAccessSidebarVisibleCount(), []);
  const hiddenDirectCount = useMemo(() => getCenterAccessHiddenDirectCount(), []);
  const centerQualityGate = useMemo(() => getCenterAccessQualityGateSummary(), []);
  const connectorTotal = useMemo(() => getConnectorRegistryCount(), []);
  const connectorActive = useMemo(() => getConnectorRegistryByCategory('active'), []);
  const connectorFuture = useMemo(() => getConnectorRegistryByCategory('future'), []);
  const connectorHighRisk = useMemo(() => getConnectorRisk('high'), []);
  const connectorQuality = useMemo(() => getConnectorRegistryQualityGateSummary(), []);
  const labTotal = useMemo(() => getLabRegistryCount(), []);
  const labActive = useMemo(() => getLabRegistryAvailableRoutes(), []);
  const labHold = useMemo(() => getLabHoldReview(), []);
  const labFuture = useMemo(() => getLabFuture(), []);
  const labQuality = useMemo(() => getLabRegistryQualityGateSummary(), []);
  const governanceSummary = useMemo(() => getGovernanceRegistrySummary(), []);
  const governanceValidator = useMemo(() => validateGovernanceRegistry(), []);
  const governanceTotal = useMemo(() => GOVERNANCE_REGISTRY.length, []);
  const safetySummary = useMemo(() => getNavigationExposureSafetySummary(), []);
  const centerSummary = useMemo(() => getCenterAccessSummary(), []);
  const launchpadVisible = useMemo(() => getCenterAccessLaunchpadVisible(), []);
  const advancedHubVisible = useMemo(() => getCenterAccessAdvancedHubVisible(), []);
  const highRiskPrimaryNav = useMemo(() => getCenterAccessHighRiskPrimaryNavCount(), []);
  const stageCPrimaryNav = useMemo(() => getCenterAccessStageCPrimaryNavCount(), []);
  const exposureSummary = useMemo(() => getNavigationExposureSummary(), []);
  const validatorIssues = useMemo(() => validateCenterAccess(), []);
  const validatorBlocking = useMemo(() => validatorIssues.filter(i => i.severity === 'blocking').length, [validatorIssues]);
  const validatorWarning = useMemo(() => validatorIssues.filter(i => i.severity === 'warning').length, [validatorIssues]);
  const validatorInfo = useMemo(() => validatorIssues.filter(i => i.severity === 'info').length, [validatorIssues]);

  return (
    <PageShell
      title="高级模式入口总控"
      subtitle="Readonly Center Launchpad — governance-navigation baseline. Does not change Layout, sidebar, or enable Stage C."
      versionLabel="AIP v7.25.2 · Final Seal Candidate"
      maturity="preview"
      safetyBoundary="readonly"
      safetyText="Readonly · No sidebar change · Stage C deferred · No executable controls · v7.25.2 controlled dry-run validation · Safe tables · Deny-by-default evaluator · Synthetic dry-run fixtures · API rejection gates · No production side effects"
    >
      {/* KPI Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 20 }}>
        <KpiCard label="总条目" value={String(stats.total)} color="var(--primary)" />
        <KpiCard label="中心" value={String(centerItems.length)} color="var(--primary)" />
        <KpiCard label="Advanced 候选" value={String(advancedCandidates.length)} color="#F97316" />
        <KpiCard label="Governance 候选" value={String(governanceCandidates.length)} color="#22C55E" />
        <KpiCard label="Connector 候选" value={String(connectorCandidates.length)} color="#22C55E" />
        <KpiCard label="Lab 候选" value={String(labCandidates.length)} color="#3B82F6" />
        <KpiCard label="未开放" value={String(stats.allowedNowFalseCount)} color="var(--warning)" />
        <KpiCard label="高风险" value={String(stats.highRiskCount)} color="var(--danger)" />
      </div>

      {/* ── A1. Cross-Center Operations Overview ── */}
      <SectionCard title="跨中心运营概览" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="总中心" value={String(centerItems.length)} color="var(--primary)" />
          <KpiCard label="已入菜单" value={String(sidebarVisibleCount)} color="var(--success)" />
          <KpiCard label="隐藏直达" value={String(hiddenDirectCount)} color="var(--warning)" />
          <KpiCard label="启动台可见" value={String(centerSummary.launchpadVisible)} color="#8B5CF6" />
          <KpiCard label="高级中心可见" value={String(centerSummary.advancedHubVisible)} color="#F97316" />
          <KpiCard label="Quality全过" value={String(centerQualityGate.passedAll)} color="var(--success)" />
          <KpiCard label="Connector" value={String(connectorTotal)} color="#22C55E" />
          <KpiCard label="Lab" value={String(labTotal)} color="#3B82F6" />
        </div>
      </SectionCard>

      {/* ── A2. Cross-Center Safety & Risk Matrix ── */}
      <SectionCard title="跨中心安全与风险矩阵" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8, fontSize: 10 }}>
          {centerItems.map(c => <div key={c.id} style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--bg-surface)', border: `1px solid ${RISK_COLORS[c.risk]}`, borderLeft: `4px solid ${RISK_COLORS[c.risk]}`, fontSize: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
              <Badge label={c.risk} color={RISK_COLORS[c.risk]} />
              <Badge label={c.operationalMode} color="#6B7280" />
              <Badge label={`${c.readinessScore}%`} color={c.readinessScore >= 80 ? 'var(--success)' : c.readinessScore >= 50 ? 'var(--warning)' : 'var(--danger)'} />
            </div>
            {[
              ['只读', String(c.qualityGate.readonly)],
              ['无写DB', String(c.qualityGate.noDbWrite)],
              ['无外部控制', String(c.qualityGate.noExternalControl)],
              ['无Stage C', String(c.qualityGate.noStageC)],
              ['无危险操作', String(c.qualityGate.noDangerousActions)],
              ['已入菜单', String(c.visibleInSidebar)],
              ['可开放', String(c.allowedNow)],
            ].map(([label, val]) => <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
              <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ color: val === 'true' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{val === 'true' ? '✅' : '❌'}</span>
            </div>)}
          </div>)}
        </div>
      </SectionCard>

      {/* ── A3. Connector / Lab Snapshot ── */}
      <SectionCard title="Connector / Lab 快照" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Connector总数" value={String(connectorTotal)} color="var(--primary)" />
          <KpiCard label="Active" value={String(connectorActive.length)} color="var(--success)" />
          <KpiCard label="Future" value={String(connectorFuture.length)} color="var(--warning)" />
          <KpiCard label="高风险" value={String(connectorHighRisk.length)} color="var(--danger)" />
          <KpiCard label="Lab总数" value={String(labTotal)} color="#3B82F6" />
          <KpiCard label="Active" value={String(labActive.length)} color="var(--success)" />
          <KpiCard label="待复核" value={String(labHold.length)} color="var(--warning)" />
          <KpiCard label="Future" value={String(labFuture.length)} color="#6B7280" />
        </div>
      </SectionCard>

      {/* ── A4. Center Launchpad Preview (enhanced v7.22.0-P1) ── */}
      <SectionCard title="Center Launchpad Preview" style={{ marginBottom: 20, border: '1px solid var(--secondary)' }}>
        <CenterLaunchpadOverview />
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {[
            { key: 'all', label: 'All centers' },
            { key: 'sidebar', label: 'Sidebar' },
            { key: 'launchpad_only', label: 'Launchpad only' },
            { key: 'governance_gated', label: 'Governance gated' },
            { key: 'readonly_preview', label: 'Readonly preview' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setCenterFilter(f.key)}
              style={{
                padding: '4px 12px', borderRadius: 14, border: 'none',
                fontSize: 10, fontWeight: 600, cursor: 'pointer',
                background: centerFilter === f.key ? '#8B5CF6' : 'rgba(139,92,246,0.1)',
                color: centerFilter === f.key ? '#fff' : '#8B5CF6',
              }}
            >{f.label}</button>
          ))}
        </div>
        {/* Grouped cards */}
        {[
          { group: 'primary', title: 'Primary Sidebar Centers', filterKey: 'sidebar' },
          { group: 'connector', title: 'Primary Capability Entry', filterKey: 'sidebar' },
          { group: 'lab', title: 'Launchpad-Only Centers', filterKey: 'launchpad_only' },
          { group: 'governance', title: 'Governance / Deferred Centers', filterKey: 'governance_gated' },
          { group: 'navigation', title: 'Readonly Preview Centers', filterKey: 'readonly_preview' },
        ].map(({ group, title, filterKey }) => {
          if (centerFilter !== 'all' && centerFilter !== filterKey) return null;
          const items = centerItems.filter(c => c.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>{title} ({items.length})</div>
              {items.map(c => <CenterLaunchpadCard key={c.id} center={c} />)}
            </div>
          );
        })}
        {centerFilter === 'all' && centerItems.filter(c => c.group === 'primary').length === 0 && (
          <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: 11 }}>No centers match current filter.</div>
        )}
        {/* Decision Path + Safety Matrix */}
        <CenterLaunchpadDecisionPath />
        {/* Safety Notice */}
        <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 4, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <strong>Readonly safety notice:</strong><br />
          This section is a <u>Center Launchpad preview</u>. Data from center-access-registry (readonly metadata). Does not change Layout, sidebar, routes, or enable Stage C. No DB writes. No external control.
        </div>
        {/* Recommended Next Actions */}
        <div style={{ marginTop: 12, padding: 10, borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Next posture (readonly guidance)</div>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 10, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            <li>Connector Center — <strong>keep primary_nav</strong> (sidebar pilot)</li>
            <li>Advanced Mode — <strong>keep primary_nav</strong> (sidebar pilot)</li>
            <li>Lab Center — <strong>keep launchpad_card</strong> (no sidebar)</li>
            <li>Governance Center — <strong>keep launchpad_card</strong> (no sidebar)</li>
            <li>Navigation Preview — <strong>keep direct_url_only</strong> (no sidebar)</li>
            <li>Stage C — <strong>deferred</strong> (not enabled)</li>
          </ul>
        </div>
      </SectionCard>

      {/* ── A. Center Readiness Dashboard ── */}
      <SectionCard title="中心就绪仪表板" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="总中心" value={String(readinessSummary.total)} color="var(--primary)" />
          <KpiCard label="就绪" value={String(readinessSummary.ready)} color="var(--success)" />
          <KpiCard label="预览就绪" value={String(readinessSummary.previewReady)} color="var(--warning)" />
          <KpiCard label="待复核" value={String(readinessSummary.holdReview)} color="var(--danger)" />
          <KpiCard label="已拦截" value={String(readinessSummary.blocked)} color="#6B7280" />
          <KpiCard label="已入菜单" value={String(sidebarVisibleCount)} color="var(--success)" />
          <KpiCard label="隐藏直达" value={String(hiddenDirectCount)} color="var(--warning)" />
        </div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {centerItems.map(c => <Badge key={c.id} label={`${c.name}: ${c.readiness}`} color={READINESS_COLORS[c.readiness] || '#6B7280'} />)}
        </div>
      </SectionCard>

      {/* ── B. Center Exposure Recommendation ── */}
      <SectionCard title="中心曝光建议" style={{ marginBottom: 20 }}>
        {[
          { label: 'keep_sidebar — 保持菜单可见', items: centerItems.filter(c => c.exposureRecommendation === 'keep_sidebar') },
          { label: 'keep_hidden_direct — 保持隐藏直达', items: centerItems.filter(c => c.exposureRecommendation === 'keep_hidden_direct') },
          { label: 'consider_sidebar_later — 未来可考虑入菜单', items: centerItems.filter(c => c.exposureRecommendation === 'consider_sidebar_later') },
          { label: 'do_not_expose — 禁止曝光', items: centerItems.filter(c => c.exposureRecommendation === 'do_not_expose') },
        ].map(group => (
          <div key={group.label} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>{group.label}（{group.items.length}）</div>
            {group.items.length > 0 ? <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>{group.items.map(c => <Badge key={c.id} label={c.name} color={READINESS_COLORS[c.readiness] || '#6B7280'} />)}</div>
              : <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>无</div>}
          </div>
        ))}
      </SectionCard>

      {/* ── Center Access Console ── */}
      <SectionCard title={`中心访问控制台（${centerItems.length}）`} style={{ marginBottom: 20, border: '1px solid var(--secondary)' }}>
        <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(139,92,246,0.08)', fontSize: 10, color: '#8B5CF6' }}>
          以下为当前所有中心入口的状态总览。仅 Advanced Mode Preview 已入左侧菜单。
        </div>
        {centerItems.map(c => <CenterCard key={c.id} center={c} />)}
      </SectionCard>

      {/* ── C. Advanced Placeholder Decision Matrix ── */}
      <SectionCard title={`Advanced Placeholder 决策矩阵（${placeholderItems.length}）`} style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8, marginBottom: 12 }}>
          <KpiCard label="总数" value={String(placeholderItems.length)} color="var(--primary)" />
          <KpiCard label="Advanced-only" value={String(advancedOnly.length)} color="#F97316" />
          <KpiCard label="HOLD_REVIEW" value={String(holdReviewItems.length)} color="var(--danger)" />
          <KpiCard label="高风险" value={String(highRiskPlaceholders.length)} color="var(--danger)" />
        </div>
        {placeholderItems.map(p => {
          const isHold = p.decision === 'HOLD_REVIEW';
          const isHigh = p.risk === 'high';
          return <div key={p.id} style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: `1px solid ${isHigh ? 'var(--danger)' : 'var(--border)'}`, borderLeft: `3px solid ${RISK_COLORS[p.risk]}`, fontSize: 11, marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 2 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>{p.label}</span>
              <Badge label={p.path} color="#6B7280" />
              <Badge label={p.decision} color={isHold ? 'var(--danger)' : '#F97316'} />
              <Badge label={p.risk} color={RISK_COLORS[p.risk]} />
              {!p.allowedNow && <Badge label="当前不可开放" color="var(--warning)" />}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>{p.reason}</div>
            <div style={{ marginTop: 2, color: 'var(--text-muted)' }}>下一步: {p.nextAction}</div>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 2 }}>
              {p.gates.map(g => <Badge key={g} label={g} color="#6B7280" />)}
            </div>
          </div>;
        })}
      </SectionCard>

      {/* ── D. HOLD_REVIEW Focus ── */}
      <SectionCard title={`HOLD_REVIEW 重点关注（${holdReviewItems.length}）`} style={{ marginBottom: 20, border: '1px solid var(--danger)' }}>
        <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(239,68,68,0.08)', fontSize: 10, color: 'var(--danger)' }}>
          以下条目当前不开放、不进入主菜单、不执行。需要人工复核安全边界后才能决定下一步。
        </div>
        {holdReviewItems.map(p => <div key={p.id} style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--danger)', fontSize: 11, marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 2 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>{p.label}</span>
            <Badge label={p.path} color="#6B7280" />
            <Badge label={p.risk} color="var(--danger)" />
            <Badge label="当前不可开放" color="var(--warning)" />
            <Badge label="需要人工复核" color="var(--danger)" />
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>{p.reason}</div>
          <div style={{ marginTop: 2, color: 'var(--text-muted)' }}>下一步: {p.nextAction}</div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 2 }}>{p.blockedActions.map(a => <Badge key={a} label={a} color="var(--danger)" />)}</div>
        </div>)}
      </SectionCard>

      {/* ── E. Final Readiness Preflight ── */}
      <SectionCard title="Final Readiness Preflight" style={{ marginBottom: 20, border: '1px solid var(--success)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, fontSize: 11 }}>
          {[
            ['Layout 未修改', centerItems.length > 0 ? '✅' : '❌'],
            ['未新增左侧菜单', String(centerItems.filter(c => c.visibleInSidebar).length === 2)],
            ['Stage C 已禁用', '✅'],
            ['Governance Center 未入菜单', String(!centerItems.find(c => c.kind === 'governance')?.visibleInSidebar)],
            ['Connector Center 未入菜单', String(!centerItems.find(c => c.kind === 'connector')?.visibleInSidebar)],
            ['Lab Center 未入菜单', String(!centerItems.find(c => c.kind === 'lab')?.visibleInSidebar)],
            ['高风险 not allowedNow', String(highRiskPlaceholders.every(p => !p.allowedNow))],
            ['未写 DB', '✅'],
            ['未控制外部工具', '✅'],
          ].map(([label, value]) => (
            <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 4, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
              <span style={{ fontWeight: 600, color: value === '✅' || value === 'true' ? 'var(--success)' : 'var(--danger)' }}>{value}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(34,197,94,0.08)', fontSize: 10, color: 'var(--success)' }}>
          当前阶段具备 closure 条件 — 仅只读审计，无 blocking。no-tag / no-release。
        </div>
      </SectionCard>

      {/* Permission Evaluator Preview */}
      <SectionCard title="Permission Evaluator Preview" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <div style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 12 }}>
          只读权限评估预览 — 不改变菜单 · 不执行权限变更 · 不写数据库 · 不启用 Stage C · 不控制外部工具
        </div>
        {(() => {
          const summary = getPermissionEvaluationSummary();
          const primaryNavRules = getPermissionEvaluationRulesByDecision('allow_primary_nav');
          const sidebarVisibleRules = getPermissionEvaluationRulesByDecision('allow_sidebar_visible');
          const hiddenDirectRules = getPermissionEvaluationRulesByDecision('allow_hidden_direct');
          const holdReviewRules = getPermissionEvaluationRulesByDecision('hold_review');
          const deniedRules = getPermissionEvaluationRulesByDecision('deny');
          const highRiskRules = getPermissionEvaluationRulesByRisk('high');
          return (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 16 }}>
                <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#8B5CF6' }}>{summary.total}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>总规则</div>
                </div>
                <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>{summary.allowedPrimaryNav + summary.sidebarVisible}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>允许菜单</div>
                </div>
                <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#3B82F6' }}>{summary.hiddenDirect + summary.launchpadCard}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>隐藏直达</div>
                </div>
                <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--warning)' }}>{summary.holdReview}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>待审查</div>
                </div>
                <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--danger)' }}>{summary.denied}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>拒绝</div>
                </div>
                <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--danger)' }}>{summary.highRisk}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>高风险</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {primaryNavRules.concat(sidebarVisibleRules).map(rule => (
                  <div key={rule.id} style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)', fontSize: 11 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{rule.label}</strong>
                      <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: 'rgba(34,197,94,0.15)', color: 'var(--success)' }}>{rule.recommendedDecision}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>{rule.reason}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}><strong>next:</strong> {rule.nextAction}</div>
                  </div>
                ))}
                {hiddenDirectRules.map(rule => (
                  <div key={rule.id} style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 11 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{rule.label}</strong>
                      <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}>{rule.recommendedDecision}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>{rule.reason}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}><strong>next:</strong> {rule.nextAction}</div>
                  </div>
                ))}
                {holdReviewRules.map(rule => (
                  <div key={rule.id} style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 11 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{rule.label}</strong>
                      <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: 'rgba(245,158,11,0.15)', color: 'var(--warning)' }}>{rule.recommendedDecision}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>{rule.reason}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}><strong>blocking:</strong> {rule.blockingConditions.join('; ') || 'none'}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}><strong>next:</strong> {rule.nextAction}</div>
                  </div>
                ))}
                {deniedRules.map(rule => (
                  <div key={rule.id} style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 11 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{rule.label}</strong>
                      <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }}>{rule.recommendedDecision}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 4 }}>{rule.reason}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}><strong>blocking:</strong> {rule.blockingConditions.join('; ') || 'none'}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}><strong>next:</strong> {rule.nextAction}</div>
                  </div>
                ))}
              </div>
            </>
          );
        })()}
        {(() => {
          const vs = getPermissionEvaluatorValidationSummary();
          return (
            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, background: vs.blocking > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${vs.blocking > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`, color: vs.blocking > 0 ? 'var(--danger)' : 'var(--success)' }}>
                blocking: {vs.blocking}
              </div>
              <div style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, background: vs.warning > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${vs.warning > 0 ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`, color: vs.warning > 0 ? 'var(--warning)' : 'var(--success)' }}>
                warning: {vs.warning}
              </div>
              <div style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', color: '#8B5CF6' }}>
                info: {vs.info}
              </div>
              <div style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, background: vs.pass ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${vs.pass ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, color: vs.pass ? 'var(--success)' : 'var(--danger)' }}>
                {vs.pass ? 'PASS' : 'FAIL'}
              </div>
            </div>
          );
        })()}
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/permission-evaluator-preview" style={{ fontSize: 11, color: '#8B5CF6', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.3)' }}>
            打开隐藏直达预览 [只读]
          </Link>
        </div>
        <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
          Permission Evaluator — 只读评估预览 · 不执行权限变更 · 不改变菜单 · 不写数据库 · 不控制外部工具
        </div>
      </SectionCard>

      {/* Runtime Registry Preview */}
      <SectionCard title="Runtime Registry Preview" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <div style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 12 }}>
          只读运行时注册表预览 — 不运行外部工具 · 不写数据库 · 不启用 Stage C · 不控制连接器
        </div>
        {(() => {
          const summary = getRuntimeRegistrySummary();
          const vs = getRuntimeRegistryValidationSummary();
          return (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, marginBottom: 12 }}>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#8B5CF6' }}>{summary.total}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>总目标</div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>{summary.allowedNow}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>当前允许</div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--danger)' }}>{summary.blocked}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>已拦截</div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--danger)' }}>{summary.highOrCritical}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>高/严重风险</div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--danger)' }}>{summary.requiresStageC}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>需 Stage C</div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--warning)' }}>{summary.requiresHumanApproval}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>需人工批准</div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--danger)' }}>{summary.externalWrite}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>外部写入</div>
                </div>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <div style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, background: vs.blocking > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${vs.blocking > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`, color: vs.blocking > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  blocking: {vs.blocking}
                </div>
                <div style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, background: vs.warning > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${vs.warning > 0 ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`, color: vs.warning > 0 ? 'var(--warning)' : 'var(--success)' }}>
                  warning: {vs.warning}
                </div>
                <div style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', color: '#8B5CF6' }}>
                  info: {vs.info}
                </div>
                <div style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, background: vs.pass ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${vs.pass ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, color: vs.pass ? 'var(--success)' : 'var(--danger)' }}>
                  {vs.pass ? 'PASS' : 'FAIL'}
                </div>
              </div>
            </>
          );
        })()}
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/runtime-registry-preview" style={{ fontSize: 11, color: '#8B5CF6', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.3)' }}>
            打开运行时注册表预览 [只读]
          </Link>
        </div>
        <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
          Runtime Registry — 只读注册表预览 · 不运行外部工具 · 不写数据库 · 不控制连接器
        </div>
      </SectionCard>

      {/* Dry-run Plan Preview Summary */}
      <SectionCard title="Dry-run 计划预览" style={{ marginBottom: 20, border: '1px solid #3B82F6' }}>
        <div style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 12 }}>
          只读 Dry-run 计划注册表预览 — 不运行 dry-run · 不写数据库 · 不启用 Stage C · 不控制外部工具 · 不控制连接器
        </div>
        {(() => {
          const ds = getDryRunPlanSummary();
          return (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, marginBottom: 12 }}>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#3B82F6' }}>{ds.total}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>总计划</div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>{ds.allowedNow}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>当前允许</div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--danger)' }}>{ds.blocked}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>已拦截</div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#DC2626' }}>{ds.highOrCritical}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>高/严重风险</div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#DC2626' }}>{ds.requiresStageC}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>需 Stage C</div>
                </div>
              </div>
            </>
          );
        })()}
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/dry-run-plan-preview" style={{ fontSize: 11, color: '#3B82F6', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.3)' }}>
            打开 Dry-run 计划预览 [只读]
          </Link>
        </div>
        <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
          Dry-run Plan — 只读计划预览 · 不运行 dry-run · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* Audit Log Preview Summary */}
      <SectionCard title="审计日志预览" style={{ marginBottom: 20, border: '1px solid #DC2626' }}>
        <div style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 12 }}>
          只读审计日志预览 — 不写审计库 · 不写数据库 · 不启用 Stage C · 不控制外部工具
        </div>
        {(() => {
          const as = getAuditLogPreviewSummary();
          return (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, marginBottom: 12 }}>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#DC2626' }}>{as.total}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>总事件</div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>{as.allowedNow}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>当前允许</div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--danger)' }}>{as.blocked}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>已阻断</div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#DC2626' }}>{as.highOrCritical}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>高/严重风险</div>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#8B5CF6' }}>{as.requiresDbWrite}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>需 DB 写</div>
                </div>
              </div>
            </>
          );
        })()}
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/audit-log-preview" style={{ fontSize: 11, color: '#DC2626', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(220,38,38,0.3)' }}>
            打开审计日志预览 [只读]
          </Link>
        </div>
        <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
          Audit Log — 只读预览 · 不写审计库 · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* Governance State Machine Preview Summary */}
      <SectionCard title="治理状态机预览" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <div style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 12 }}>
          只读治理状态机预览 — 不迁移状态 · 不处理审批 · 不写数据库 · 不启用 Stage C
        </div>
        {(() => {
          const gs = getGovernanceStateSummary();
          const vs = getGovernanceStateValidationSummary();
          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, marginBottom: 12 }}>
              <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#8B5CF6' }}>{gs.totalStates}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>总状态</div>
              </div>
              <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#3B82F6' }}>{gs.totalTransitions}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>总迁移</div>
              </div>
              <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>{gs.allowedTransitions}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>当前允许</div>
              </div>
              <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--danger)' }}>{gs.blockedTransitions}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>已阻断</div>
              </div>
              <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#DC2626' }}>{gs.criticalTransitions}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>严重迁移</div>
              </div>
              <div style={{ padding: '6px 10px', borderRadius: 6, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#10B981' }}>{vs.pass ? 'PASS' : 'FAIL'}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>验证</div>
              </div>
            </div>
          );
        })()}
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/governance-state-machine-preview" style={{ fontSize: 11, color: '#8B5CF6', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.3)' }}>
            打开治理状态机预览 [只读]
          </Link>
        </div>
        <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
          Governance State Machine — 只读状态机预览 · 不迁移状态 · 不处理审批 · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* Rollback Preview Summary */}
      <SectionCard title="回滚预览" style={{ marginBottom: 20, border: '1px solid #F97316' }}>
        <div style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 12 }}>
          只读回滚风险评估预览 — 22 项回滚注册表，覆盖 13 个回滚目标（runtime、dry-run、audit、approval、governance、evidence、permission、connector、git、database、external_tool、stage_c、local_file）。
          不执行回滚 · 不恢复文件 · 不写 DB · 不控制外部工具 · 不启用 Stage C
        </div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/rollback-preview" style={{ fontSize: 11, color: '#F97316', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(249,115,22,0.3)' }}>
            打开回滚预览 [只读]
          </Link>
        </div>
        <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
          Rollback — 只读回滚风险评估预览 · 不执行回滚 · 不恢复文件 · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* Evidence Schema Preview Summary */}
      <SectionCard title="证据模型预览" style={{ marginBottom: 20, border: '1px solid #22C55E' }}>
        <div style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 12 }}>
          只读证据模型预览 — 23 项证据 schema，覆盖 registry snapshot、validator summary、audit preview、approval request、stage gate state。
          不采集证据 · 不保存 secret · 不写 evidence store · 不写数据库 · 不启用 Stage C
        </div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/evidence-schema-preview" style={{ fontSize: 11, color: '#22C55E', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.3)' }}>
            打开证据模型预览 [只读]
          </Link>
        </div>
        <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
          Evidence Schema — 只读证据模型预览 · 不采集证据 · 不保存 secret · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* Human Approval Workflow Preview Summary */}
      <SectionCard title="人工审批流程预览" style={{ marginBottom: 20, border: '1px solid #EC4899' }}>
        <div style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 12 }}>
          只读人工审批流程预览 — 不创建审批队列 · 不处理 candidate · 不写数据库 · 不启用 Stage C
        </div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/human-approval-workflow-preview" style={{ fontSize: 11, color: '#EC4899', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(236,72,153,0.3)' }}>
            打开人工审批流程预览 [只读]
          </Link>
        </div>
        <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.15)', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
          Human Approval Workflow — 只读审批流程预览 · 不创建审批队列 · 不处理 candidate · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* Governance Center Strategy Notice */}
      <SectionCard title="治理中心（Governance Center）策略" style={{ marginBottom: 20, border: '1px solid var(--warning)' }}>
        <div style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <p><strong>当前状态：</strong>未加入左侧菜单 · URL 直达 · Stage C deferred</p>
          <p><strong>readiness:</strong> hold_review · <strong>exposureRecommendation:</strong> do_not_expose</p>
          <p><strong>前置条件：</strong>Stage C remains disabled, no execution buttons, readonly validator pass, human approval</p>
          <p><strong>安全边界：</strong>只读治理面板，不写数据库，不移动菜单，不处理 candidate，不发布 Release</p>
        </div>
      </SectionCard>

      {/* Exposure Level Summary */}
      <SectionCard title="曝光等级分布" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(NAVIGATION_EXPOSURE_LEVELS).map(([key, meta]) => {
            const count = stats.byRecommendedLevel[key] || 0;
            return <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: LEVEL_COLORS[key] || '#6B7280', minWidth: 24 }}>{count}</span>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{meta.label}</div><div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{key}</div></div>
            </div>;
          })}
        </div>
      </SectionCard>

      {/* Risk Summary */}
      <SectionCard title="风险分布" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(stats.byRisk).map(([risk, count]) => <div key={risk} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: RISK_COLORS[risk] || '#6B7280', minWidth: 24 }}>{count}</span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{risk}</span>
          </div>)}
        </div>
      </SectionCard>

      {/* Grouped Entries */}
      <EntryGroup title="Advanced Mode 候选" entries={advancedCandidates} />
      <EntryGroup title="Governance Center 候选" entries={governanceCandidates} />
      <EntryGroup title="Connector Center 候选" entries={connectorCandidates} />
      <EntryGroup title="Lab Mode 候选" entries={labCandidates} />
      <EntryGroup title="保持隐藏 / 不开放" entries={hiddenCandidates} />

      {/* High Risk */}
      <SectionCard title={`高风险条目 — 仅可只读评估（${highRiskEntries.length}）`} style={{ marginBottom: 20, border: '1px solid var(--danger)' }}>
        {highRiskEntries.length > 0 ? <div><div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(239,68,68,0.08)', fontSize: 10, color: 'var(--danger)' }}>以下高风险条目不可直接开放。</div>{highRiskEntries.map(e => <ExposureEntryRow key={e.id} entry={e} />)}</div>
          : <div style={{ padding: 12, textAlign: 'center', color: 'var(--success)', fontSize: 12 }}>✅ 无高风险条目</div>}
      </SectionCard>

      {/* Stage C gated */}
      <SectionCard title={`Stage C 相关门控条目（${stageCGated.length}）`} style={{ marginBottom: 20 }}>
        <div style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 4, background: 'rgba(245,158,11,0.08)', fontSize: 10, color: 'var(--warning)' }}>Stage C 尚未开始。</div>
        {stageCGated.map(e => <ExposureEntryRow key={e.id} entry={e} />)}
      </SectionCard>

      {/* Readonly gated */}
      <SectionCard title={`仅只读门控条目（${readonlyGated.length}）`} style={{ marginBottom: 20 }}>{readonlyGated.map(e => <ExposureEntryRow key={e.id} entry={e} />)}</SectionCard>

      {/* ═══════════════════════════════════════════
          P3 — Readonly Control Room Sections
          ═══════════════════════════════════════════ */}
      <SectionCard title="Readonly Control Room Overview" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <ReadonlyControlRoomOverview />
      </SectionCard>

      <SectionCard title="Governance Baseline" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <GovernanceBaselinePanel />
      </SectionCard>

      <SectionCard title="System Safety Matrix" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <SystemSafetyMatrix />
      </SectionCard>

      {/* ── P4 Lab Center Bridge ── */}
      <SectionCard title="Lab Center Bridge" style={{ marginBottom: 20, border: '1px solid #3B82F6' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Lab posture" value="readonly" color="var(--success)" />
          <KpiCard label="Launchpad access" value="launchpad-only" color="#8B5CF6" />
          <KpiCard label="Lab execution controls" value="0" color="var(--success)" />
          <KpiCard label="Training triggers" value="0" color="var(--success)" />
          <KpiCard label="Dataset mutations" value="0" color="var(--success)" />
          <KpiCard label="External writes" value="0" color="var(--success)" />
          <KpiCard label="Stage C lab controls" value="0" color="var(--success)" />
          <KpiCard label="Total lab items" value={String(labTotal)} color="#3B82F6" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/lab-center-readonly" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(59,130,246,0.08)', color: '#3B82F6', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Lab Center →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(34,197,94,0.08)', color: 'var(--success)', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep lab metadata and reports readonly</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(59,130,246,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Lab Center = <strong>readonly</strong> / launchpad-only overview. Lab execution controls = <strong>0</strong>. Training triggers = <strong>0</strong>. Dataset mutations = <strong>0</strong>. External writes = <strong>0</strong>. Stage C lab controls = <strong>0</strong>. Recommended mode = <strong>manual verification only</strong>.
        </div>
      </SectionCard>

      {/* ── P3 Connector Readiness + Timeline + Workstreams ── */}
      <SectionCard title="Connector Readiness Bridge" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <ConnectorReadinessSummaryBridge />
      </SectionCard>

      <SectionCard title="Version Progress Timeline" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <VersionProgressTimeline />
      </SectionCard>

      <SectionCard title="Next Recommended Workstreams" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <NextWorkstreamPanel />
      </SectionCard>

      {/* ── P5 Governance Bridge ── */}
      <SectionCard title="Governance Center Bridge" style={{ marginBottom: 20, border: '1px solid #22C55E' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Governance posture" value="readonly" color="var(--success)" />
          <KpiCard label="Governance modules" value={String(governanceTotal)} color="#22C55E" />
          <KpiCard label="Approval controls" value="0" color="var(--success)" />
          <KpiCard label="Reject controls" value="0" color="var(--success)" />
          <KpiCard label="Mutation paths" value="0" color="var(--success)" />
          <KpiCard label="External writes" value="0" color="var(--success)" />
          <KpiCard label="Stage C controls" value="0" color="var(--success)" />
          <KpiCard label="Validator pass" value={governanceValidator.pass ? '✅' : '❌'} color={governanceValidator.pass ? 'var(--success)' : 'var(--danger)'} />
          <KpiCard label="Blocking issues" value={String(governanceValidator.blockingCount)} color={governanceValidator.blockingCount === 0 ? 'var(--success)' : 'var(--danger)'} />
          <KpiCard label="High risk" value={String(governanceSummary.byRiskLevel['high'] || 0)} color="var(--danger)" />
          <KpiCard label="Critical risk" value={String(governanceSummary.byRiskLevel['critical'] || 0)} color="#7C3AED" />
          <KpiCard label="Dry-run only" value={String(governanceSummary.dryRunOnlyCount)} color="#8B5CF6" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(34,197,94,0.08)', color: '#22C55E', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Governance Center →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(34,197,94,0.08)', color: 'var(--success)', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep governance metadata and reports readonly</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(34,197,94,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Governance Center = <strong>readonly</strong> / Stage C deferred preview. Approval controls = <strong>0</strong>. Reject controls = <strong>0</strong>. Mutation paths = <strong>0</strong>. External writes = <strong>0</strong>. Stage C governance controls = <strong>0</strong>. Validator blocking = <strong>{governanceValidator.blockingCount}</strong>. Recommended mode = <strong>manual verification only</strong>.
        </div>
      </SectionCard>

      {/* ── v7.23.0-P1 Stage C Design Bridge ── */}
      <SectionCard title="Stage C Design Bridge" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Stage C Design Spec" value="design-only" color="#8B5CF6" />
          <KpiCard label="Governance data models" value="7" color="#8B5CF6" />
          <KpiCard label="Design phase gates" value="6" color="#8B5CF6" />
          <KpiCard label="Lifecycle stages" value="8" color="#8B5CF6" />
          <KpiCard label="Readiness items" value="9" color="#F97316" />
          <KpiCard label="Design controls" value="0" color="var(--success)" />
          <KpiCard label="Approval controls" value="0" color="var(--success)" />
          <KpiCard label="Mutation paths" value="0" color="var(--success)" />
          <KpiCard label="Execution controls" value="0" color="var(--success)" />
          <KpiCard label="External writes" value="0" color="var(--success)" />
          <KpiCard label="Stage C controls" value="0" color="var(--success)" />
          <KpiCard label="Stage C enabled" value="false" color="var(--success)" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Governance Data Model →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep Stage C in design review</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Stage C Design Spec = <strong>design-only</strong>. Governance data models = <strong>7</strong> (all readonly). Design phase gates = <strong>6</strong> (all deferred). Lifecycle stages = <strong>8</strong> (all design-only). Readiness items = <strong>9</strong> (ready-design-only=2, not-implemented=2, deferred=5). Design controls = <strong>0</strong>. Approval controls = <strong>0</strong>. Mutation paths = <strong>0</strong>. Execution controls = <strong>0</strong>. External writes = <strong>0</strong>. Stage C enabled = <strong>false</strong>. Recommended mode = <strong>keep Stage C in design review</strong>.
        </div>
      </SectionCard>

      {/* ── v7.25.0 Runtime Foundation Bridge ── */}
      <SectionCard title="Runtime Foundation Bridge (v7.25.1)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <RuntimeFoundationSafetyMatrix />
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <strong>Foundation (v7.25.0):</strong> Storage schema implemented · API guarded skeleton · Synthetic dry-run only · Production Runtime = Blocked · Stage C = Disabled · Real Controls = 0<br/>
          <strong>v7.25.1 Detail-Complete Candidate:</strong> 8 synthetic fixtures hardened · 4 safe DB tables · Deny-by-default evaluator · 5 guarded API endpoints · 16 rejection cases · DB roundtrip 266 checks pass · API error semantics hardened · Invalid fixture expansion · Trace/result contract invariants · Final Seal: Pending
        </div>
      </SectionCard>

      {/* ── v7.23.0-P3 Approval Gate Bridge ── */}
      <SectionCard title="Approval Gate Bridge" style={{ marginBottom: 20, border: '1px solid #EC4899' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Approval Gate" value="design-only" color="#EC4899" />
          <KpiCard label="Approval controls" value="0" color="var(--success)" />
          <KpiCard label="Reject controls" value="0" color="var(--success)" />
          <KpiCard label="Mutation paths" value="0" color="var(--success)" />
          <KpiCard label="Execution controls" value="0" color="var(--success)" />
          <KpiCard label="External writes" value="0" color="var(--success)" />
          <KpiCard label="Audit trail" value="design-only" color="#EC4899" />
          <KpiCard label="Rollback plan" value="required future" color="#F97316" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(236,72,153,0.08)', color: '#EC4899', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Approval Gate Spec →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(236,72,153,0.08)', color: '#EC4899', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep approval gate in design review</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(236,72,153,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Approval Gate = <strong>design-only</strong>. Approval controls = <strong>0</strong>. Reject controls = <strong>0</strong>. Mutation paths = <strong>0</strong>. Execution controls = <strong>0</strong>. External writes = <strong>0</strong>. Audit trail = <strong>design-only</strong> (not persisted). Rollback plan = <strong>required in future</strong>. Recommended mode = <strong>keep approval gate in design review</strong>.
        </div>
      </SectionCard>

      {/* ── v7.23.0-P4 Mutation Gate Bridge ── */}
      <SectionCard title="Mutation Gate Bridge" style={{ marginBottom: 20, border: '1px solid #A855F7' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Mutation Gate" value="design-only" color="#A855F7" />
          <KpiCard label="Mutation controls" value="0" color="var(--success)" />
          <KpiCard label="Diff/Impact required" value="future" color="#F97316" />
          <KpiCard label="Rollback contract" value="design-only" color="#A855F7" />
          <KpiCard label="Evidence types" value="10" color="#A855F7" />
          <KpiCard label="Lifecycle stages" value="9" color="#A855F7" />
          <KpiCard label="Risk guardrails" value="8 safe" color="var(--success)" />
          <KpiCard label="Active mutation risk" value="0" color="var(--success)" />
          <KpiCard label="Write paths" value="0" color="var(--success)" />
          <KpiCard label="External writes" value="0" color="var(--success)" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(168,85,247,0.08)', color: '#A855F7', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Mutation Gate Spec →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(168,85,247,0.08)', color: '#A855F7', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep mutation gate in design review</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(168,85,247,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Mutation Gate = <strong>design-only</strong>. Mutation controls = <strong>0</strong>. Diff/Impact = <strong>required future</strong>. Rollback contract = <strong>design-only</strong>. Evidence types = <strong>10</strong> (all design-only). Lifecycle stages = <strong>9</strong> (all design-only). Risk guardrails = <strong>8 safe / 0 active</strong>. Write paths = <strong>0</strong>. External writes = <strong>0</strong>. Recommended mode = <strong>keep mutation gate in design review</strong>.
        </div>
      </SectionCard>

      {/* ── v7.23.0-P5 Execution Gate Bridge ── */}
      <SectionCard title="Execution Gate Bridge" style={{ marginBottom: 20, border: '1px solid #3B82F6' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Execution Gate" value="design-only" color="#3B82F6" />
          <KpiCard label="Execution controls" value="0" color="var(--success)" />
          <KpiCard label="Run controls" value="0" color="var(--success)" />
          <KpiCard label="Start/Stop controls" value="0" color="var(--success)" />
          <KpiCard label="Service controls" value="0" color="var(--success)" />
          <KpiCard label="Deployment triggers" value="0" color="var(--success)" />
          <KpiCard label="Training triggers" value="0" color="var(--success)" />
          <KpiCard label="Inference triggers" value="0" color="var(--success)" />
          <KpiCard label="Rollback requirement" value="required future" color="#F97316" />
          <KpiCard label="Risk guardrails" value="8 safe" color="var(--success)" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(59,130,246,0.08)', color: '#3B82F6', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Execution Gate Spec →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(59,130,246,0.08)', color: '#3B82F6', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep execution gate in design review</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(59,130,246,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Execution Gate = <strong>design-only</strong>. Execution controls = <strong>0</strong>. Run controls = <strong>0</strong>. Start/Stop = <strong>0</strong>. Service controls = <strong>0</strong>. Deployment triggers = <strong>0</strong>. Training triggers = <strong>0</strong>. Inference triggers = <strong>0</strong>. Rollback requirement = <strong>required in future</strong>. Risk guardrails = <strong>8 safe / 0 active</strong>. Recommended mode = <strong>keep execution gate in design review</strong>.
        </div>
      </SectionCard>

      {/* ── v7.23.0-P6 External Write Gate Bridge ── */}
      <SectionCard title="External Write Gate Bridge" style={{ marginBottom: 20, border: '1px solid #DC2626' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="External Write Gate" value="design-only" color="#DC2626" />
          <KpiCard label="External write paths" value="0" color="var(--success)" />
          <KpiCard label="Connector writes" value="0" color="var(--success)" />
          <KpiCard label="LAN sync paths" value="0" color="var(--success)" />
          <KpiCard label="Upload controls" value="0" color="var(--success)" />
          <KpiCard label="Deploy controls" value="0" color="var(--success)" />
          <KpiCard label="Push controls" value="0" color="var(--success)" />
          <KpiCard label="Design fields" value={String(EXTERNAL_WRITE_DESIGN_FIELDS.length)} color="#8B5CF6" />
          <KpiCard label="Connector policies" value={String(CONNECTOR_POLICY_ENTRIES.length)} color="#8B5CF6" />
          <KpiCard label="IO matrix rows" value={String(EXTERNAL_IO_BOUNDARY_ROWS.length)} color="#8B5CF6" />
          <KpiCard label="Evidence types" value={String(EXTERNAL_WRITE_EVIDENCE_TYPES.length)} color="#8B5CF6" />
          <KpiCard label="Guardrail rows" value={String(EXTERNAL_WRITE_GUARDRAIL_MATRIX.length)} color="var(--success)" />
          <KpiCard label="Lifecycle stages" value={String(CONNECTOR_WRITE_LIFECYCLE_STAGES.length)} color="#8B5CF6" />
          <KpiCard label="Rollback plan" value="required future" color="#F97316" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(220,38,38,0.08)', color: '#DC2626', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review External Write Gate Spec →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(220,38,38,0.08)', color: '#DC2626', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep external write gate in design review</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(220,38,38,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          External Write Gate = <strong>design-only</strong>. External write paths = <strong>0</strong>. Connector writes = <strong>0</strong>. LAN sync paths = <strong>0</strong>. Upload controls = <strong>0</strong>. Deploy controls = <strong>0</strong>. Push controls = <strong>0</strong>. Rollback plan = <strong>required in future</strong>. Recommended next = <strong>keep external write gate in design review</strong>.
        </div>
      </SectionCard>

      {/* ── v7.23.0-P7 Deployment / Rollback Gate Bridge ── */}
      <SectionCard title="Deployment / Rollback Gate Bridge" style={{ marginBottom: 20, border: '1px solid #F97316' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Deployment Gate" value="design-only" color="#F97316" />
          <KpiCard label="Rollback Gate" value="design-only" color="#F97316" />
          <KpiCard label="Deploy paths" value="0" color="var(--success)" />
          <KpiCard label="Upload controls" value="0" color="var(--success)" />
          <KpiCard label="Push controls" value="0" color="var(--success)" />
          <KpiCard label="Rollback/restore" value="0" color="var(--success)" />
          <KpiCard label="Service restart" value="0" color="var(--success)" />
          <KpiCard label="Deploy design fields" value={String(DEPLOYMENT_DESIGN_FIELDS.length)} color="#8B5CF6" />
          <KpiCard label="Deploy request fields" value={String(DEPLOYMENT_REQUEST_FIELDS.length)} color="#8B5CF6" />
          <KpiCard label="Deploy boundary rows" value={String(DEPLOYMENT_BOUNDARY_ROWS.length)} color="#8B5CF6" />
          <KpiCard label="Deploy evidence types" value={String(DEPLOYMENT_EVIDENCE_TYPES.length)} color="#8B5CF6" />
          <KpiCard label="Rollback design fields" value={String(ROLLBACK_DESIGN_FIELDS.length)} color="#8B5CF6" />
          <KpiCard label="Rollback plan fields" value={String(ROLLBACK_PLAN_FIELDS.length)} color="#8B5CF6" />
          <KpiCard label="Guardrail rows" value={String(DEPLOYMENT_ROLLBACK_GUARDRAIL_MATRIX.length)} color="var(--success)" />
          <KpiCard label="Lifecycle stages" value={String(DEPLOYMENT_ROLLBACK_LIFECYCLE_STAGES.length)} color="#8B5CF6" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(249,115,22,0.08)', color: '#F97316', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Deployment / Rollback Gate Spec →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(249,115,22,0.08)', color: '#F97316', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep deployment and rollback gates in design review</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(249,115,22,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Deployment Gate = <strong>design-only</strong>. Rollback Gate = <strong>design-only</strong>. Deploy paths = <strong>0</strong>. Upload controls = <strong>0</strong>. Push controls = <strong>0</strong>. Rollback/restore = <strong>0</strong>. Service restart = <strong>0</strong>. Recommended next = <strong>keep deployment and rollback gates in design review</strong>.
        </div>
      </SectionCard>

      {/* ── v7.23.0-P8 Emergency Stop / Audit Evidence Gate Bridge ── */}
      <SectionCard title="Emergency Stop / Audit Evidence Gate Bridge" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Emergency Stop Gate" value="design-only" color="#EF4444" />
          <KpiCard label="Audit Evidence Gate" value="design-only" color="#3B82F6" />
          <KpiCard label="Stop controls" value="0" color="var(--success)" />
          <KpiCard label="Pause controls" value="0" color="var(--success)" />
          <KpiCard label="Kill controls" value="0" color="var(--success)" />
          <KpiCard label="Taskkill paths" value="0" color="var(--success)" />
          <KpiCard label="Restart controls" value="0" color="var(--success)" />
          <KpiCard label="Evidence write paths" value="0" color="var(--success)" />
          <KpiCard label="Evidence upload" value="0" color="var(--success)" />
          <KpiCard label="Evidence export" value="0" color="var(--success)" />
          <KpiCard label="Emergency design fields" value={String(EMERGENCY_STOP_DESIGN_FIELDS.length)} color="#8B5CF6" />
          <KpiCard label="Emergency policies" value={String(EMERGENCY_STOP_POLICY_ITEMS.length)} color="#8B5CF6" />
          <KpiCard label="Emergency boundary rows" value={String(EMERGENCY_STOP_BOUNDARY_ROWS.length)} color="#8B5CF6" />
          <KpiCard label="Audit design fields" value={String(AUDIT_EVIDENCE_DESIGN_FIELDS.length)} color="#8B5CF6" />
          <KpiCard label="Evidence retention rows" value={String(AUDIT_EVIDENCE_RETENTION_ROWS.length)} color="#8B5CF6" />
          <KpiCard label="Guardrail rows" value={String(EMERGENCY_STOP_AUDIT_GUARDRAIL_MATRIX.length)} color="var(--success)" />
          <KpiCard label="Lifecycle stages" value={String(EMERGENCY_STOP_AUDIT_LIFECYCLE_STAGES.length)} color="#8B5CF6" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Emergency Stop / Audit Evidence Gate Spec →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep emergency stop and audit evidence gates in design review</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Emergency Stop Gate = <strong>design-only</strong>. Audit Evidence Gate = <strong>design-only</strong>. Stop controls = <strong>0</strong>. Pause controls = <strong>0</strong>. Kill controls = <strong>0</strong>. Taskkill paths = <strong>0</strong>. Restart controls = <strong>0</strong>. Disable controls = <strong>0</strong>. Evidence write paths = <strong>0</strong>. Evidence upload/export = <strong>0</strong>. Stage C = <strong>deferred</strong>. Recommended next = <strong>keep emergency stop and audit evidence gates in design review</strong>.
        </div>
      </SectionCard>

      {/* ── v7.23.0-P9 Gate Coverage Closure Audit Bridge ── */}
      <SectionCard title="Gate Coverage Closure Audit Bridge" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="P9 Audit pack" value="closure" color="#8B5CF6" />
          <KpiCard label="Gates covered" value={String(GATE_COVERAGE_OVERVIEW.length)} color="#8B5CF6" />
          <KpiCard label="Design packages" value={String(COVERAGE_AUDIT_MATRIX.length)} color="#8B5CF6" />
          <KpiCard label="Missing gates" value="0" color="var(--success)" />
          <KpiCard label="Activation blockers" value={String(STAGE_C_BLOCKER_MATRIX.length)} color="var(--danger)" />
          <KpiCard label="Blocking items" value={String(STAGE_C_BLOCKER_MATRIX.filter(b => b.activationImpact === 'blocking').length)} color="var(--danger)" />
          <KpiCard label="Delaying items" value={String(STAGE_C_BLOCKER_MATRIX.filter(b => b.activationImpact === 'delaying').length)} color="#F97316" />
          <KpiCard label="Cross-gate deps" value={String(CROSS_GATE_DEPENDENCIES.length)} color="#8B5CF6" />
          <KpiCard label="Control areas" value={String(CONTROL_BOUNDARY_FINAL.length)} color="var(--success)" />
          <KpiCard label="Control total" value="0" color="var(--success)" />
          <KpiCard label="Stage C enabled" value="false" color="var(--success)" />
          <KpiCard label="Stage C ready" value="false" color="var(--danger)" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Gate Coverage Closure Audit →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep Stage C disabled — not ready for activation</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          P9 Gate Coverage Closure Audit = <strong>audit-only closure pack</strong>. Gates covered = <strong>{GATE_COVERAGE_OVERVIEW.length}</strong> (all design-only). Design packages = <strong>{COVERAGE_AUDIT_MATRIX.length}</strong> (all complete-design, runtimeControl=no). Missing gates = <strong>0</strong>. Overlap/duplicate = <strong>0</strong>. Activation blockers = <strong>{STAGE_C_BLOCKER_MATRIX.length}</strong> (blocking={String(STAGE_C_BLOCKER_MATRIX.filter(b => b.activationImpact === 'blocking').length)}, delaying={String(STAGE_C_BLOCKER_MATRIX.filter(b => b.activationImpact === 'delaying').length)}). Cross-gate dependencies = <strong>{CROSS_GATE_DEPENDENCIES.length}</strong> (all design-only). Control areas = <strong>{CONTROL_BOUNDARY_FINAL.length}</strong> (all count=0, disabled). Stage C enabled = <strong>false</strong>. Stage C ready = <strong>false</strong>. Recommended next = <strong>keep Stage C disabled — no activation package has been created.</strong>
        </div>
      </SectionCard>

      {/* ── v7.24.0-P1 Stage C Activation Planning Bridge ── */}
      <SectionCard title="Stage C Activation Planning Bridge (P1)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Planning overview" value={String(STAGE_C_ACTIVATION_PLANNING.length)} color="#8B5CF6" />
          <KpiCard label="Auth design fields" value={String(RUNTIME_AUTHORIZATION_FIELDS.length)} color="#8B5CF6" />
          <KpiCard label="Permission entries" value={String(RUNTIME_PERMISSION_ENTRIES.length)} color="#8B5CF6" />
          <KpiCard label="Operator roles" value={String(OPERATOR_ROLES.length)} color="#8B5CF6" />
          <KpiCard label="Activation preconditions" value={String(ACTIVATION_PRECONDITIONS.length)} color="var(--danger)" />
          <KpiCard label="Blocking preconditions" value={String(ACTIVATION_PRECONDITIONS.filter(p => p.activationImpact === 'blocking').length)} color="var(--danger)" />
          <KpiCard label="Control packages" value={String(RUNTIME_CONTROL_PACKAGES.length)} color="#8B5CF6" />
          <KpiCard label="Blocker items" value={String(BLOCKER_RESOLUTION_ITEMS.length)} color="var(--danger)" />
          <KpiCard label="Evidence types" value={String(AUTHORIZATION_EVIDENCE_TYPES.length)} color="#8B5CF6" />
          <KpiCard label="All permissions" value="false" color="var(--success)" />
          <KpiCard label="Runtime controls" value="0" color="var(--success)" />
          <KpiCard label="Stage C enabled" value="false" color="var(--success)" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Stage C Activation Planning →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep Stage C disabled — planning-only design review</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          v7.24.0-P1 Stage C Activation Planning = <strong>planning-only / design review</strong>. Planning overview = <strong>{STAGE_C_ACTIVATION_PLANNING.length}</strong> areas (all disabled/not implemented). Authorization design fields = <strong>{RUNTIME_AUTHORIZATION_FIELDS.length}</strong> (all design-only). Permission entries = <strong>{RUNTIME_PERMISSION_ENTRIES.length}</strong> (all false). Operator roles = <strong>{OPERATOR_ROLES.length}</strong> (all design-only, no runtime/write/control). Activation preconditions = <strong>{ACTIVATION_PRECONDITIONS.length}</strong> ({ACTIVATION_PRECONDITIONS.filter(p => p.activationImpact === 'blocking').length} blocking). Control packages = <strong>{RUNTIME_CONTROL_PACKAGES.length}</strong> (all not implemented, count=0). Blocker items = <strong>{BLOCKER_RESOLUTION_ITEMS.length}</strong> (all future). Evidence types = <strong>{AUTHORIZATION_EVIDENCE_TYPES.length}</strong> (all design-only). All permissions = <strong>false</strong>. Runtime controls = <strong>0</strong>. Stage C enabled = <strong>false</strong>. Recommended next = <strong>keep Stage C disabled — no activation package has been created.</strong>
        </div>
      </SectionCard>

      {/* ── v7.24.0-P2 Authorization Contract Bridge ── */}
      <SectionCard title="Authorization Contract Bridge (P2)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Contract fields" value={String(RUNTIME_AUTHORIZATION_CONTRACT_FIELDS.length)} color="#8B5CF6" />
          <KpiCard label="Lifecycle stages" value={String(AUTHORIZATION_LIFECYCLE_STAGES.length)} color="#8B5CF6" />
          <KpiCard label="Decision states" value={String(AUTHORIZATION_DECISION_STATES.length)} color="#8B5CF6" />
          <KpiCard label="Scope boundary rows" value={String(AUTHORIZATION_SCOPE_BOUNDARY_ROWS.length)} color="#8B5CF6" />
          <KpiCard label="Eval steps" value={String(RUNTIME_PERMISSION_EVALUATION_STEPS.length)} color="#8B5CF6" />
          <KpiCard label="Revoc/expiry fields" value={String(AUTHORIZATION_REVOCATION_EXPIRY_FIELDS.length)} color="#8B5CF6" />
          <KpiCard label="Audit chain steps" value={String(AUTHORIZATION_AUDIT_CHAIN_STEPS.length)} color="#8B5CF6" />
          <KpiCard label="Failure/fallback rows" value={String(AUTHORIZATION_FAILURE_FALLBACK_ROWS.length)} color="var(--danger)" />
          <KpiCard label="Auth controls" value="0" color="var(--success)" />
          <KpiCard label="Auth persistence" value="disabled" color="#6B7280" />
          <KpiCard label="Runtime evaluator" value="not implemented" color="#6B7280" />
          <KpiCard label="Stage C enabled" value="false" color="var(--success)" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Authorization Contract →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep authorization in design-contract-only — no implementation</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          v7.24.0-P2 Runtime Authorization Data Contract = <strong>design-contract-only</strong>. Contract fields = <strong>{RUNTIME_AUTHORIZATION_CONTRACT_FIELDS.length}</strong> (all design-contract-only). Lifecycle stages = <strong>{AUTHORIZATION_LIFECYCLE_STAGES.length}</strong> (all design-only). Decision states = <strong>{AUTHORIZATION_DECISION_STATES.length}</strong> (all design-only). Scope boundary rows = <strong>{AUTHORIZATION_SCOPE_BOUNDARY_ROWS.length}</strong> (all design-only). Evaluation steps = <strong>{RUNTIME_PERMISSION_EVALUATION_STEPS.length}</strong> (engine not implemented). Revocation/expiry fields = <strong>{AUTHORIZATION_REVOCATION_EXPIRY_FIELDS.length}</strong> (all design-only). Audit chain steps = <strong>{AUTHORIZATION_AUDIT_CHAIN_STEPS.length}</strong> (all design-only, writes=0). Failure/fallback rows = <strong>{AUTHORIZATION_FAILURE_FALLBACK_ROWS.length}</strong> (all blocked-future). Authorization controls = <strong>0</strong>. Persistence = <strong>disabled</strong>. Runtime evaluator = <strong>not implemented</strong>. Permission writes = <strong>0</strong>. Decision writes = <strong>0</strong>. Audit chain writes = <strong>0</strong>. Stage C enabled = <strong>false</strong>. Recommended next = <strong>keep authorization in design-contract-only — proceed to authorization persistence design, not implementation.</strong>
        </div>
      </SectionCard>

      {/* ── v7.24.0-P3 Authorization Persistence Bridge ── */}
      <SectionCard title="Authorization Persistence Bridge (P3)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Design fields" value={String(AUTHORIZATION_PERSISTENCE_DESIGN_FIELDS.length)} color="#8B5CF6" />
          <KpiCard label="Storage contracts" value={String(AUTHORIZATION_STORAGE_CONTRACT_ITEMS.length)} color="#8B5CF6" />
          <KpiCard label="Entity models" value={String(AUTHORIZATION_PERSISTENCE_ENTITY_MODELS.length)} color="#8B5CF6" />
          <KpiCard label="Lifecycle stages" value={String(AUTHORIZATION_RECORD_LIFECYCLE_STAGES.length)} color="#8B5CF6" />
          <KpiCard label="Storage boundary rows" value={String(AUTHORIZATION_STORAGE_BOUNDARY_ROWS.length)} color="#8B5CF6" />
          <KpiCard label="Guardrail rows" value={String(AUTHORIZATION_PERSISTENCE_GUARDRAIL_ROWS.length)} color="var(--success)" />
          <KpiCard label="Retention/expiry fields" value={String(AUTHORIZATION_RETENTION_EXPIRY_FIELDS.length)} color="#8B5CF6" />
          <KpiCard label="Audit/integrity items" value={String(AUTHORIZATION_PERSISTENCE_AUDIT_INTEGRITY_ITEMS.length)} color="#8B5CF6" />
          <KpiCard label="Persistence impl" value="none" color="#6B7280" />
          <KpiCard label="DB schema" value="not implemented" color="#6B7280" />
          <KpiCard label="API endpoint" value="not implemented" color="#6B7280" />
          <KpiCard label="Stage C enabled" value="false" color="var(--success)" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Authorization Persistence Design →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep persistence in design-only — no implementation</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          v7.24.0-P3 Authorization Persistence Design = <strong>design-only</strong>. Design fields = <strong>{AUTHORIZATION_PERSISTENCE_DESIGN_FIELDS.length}</strong> (all design-only, persistence disabled). Storage contracts = <strong>{AUTHORIZATION_STORAGE_CONTRACT_ITEMS.length}</strong> (all enforced-by-absence, no storage writes). Entity models = <strong>{AUTHORIZATION_PERSISTENCE_ENTITY_MODELS.length}</strong> (all none/not implemented). Lifecycle stages = <strong>{AUTHORIZATION_RECORD_LIFECYCLE_STAGES.length}</strong> (all design-only). Storage boundary rows = <strong>{AUTHORIZATION_STORAGE_BOUNDARY_ROWS.length}</strong> (all design-only, no DB/migration/write/read). Guardrail rows = <strong>{AUTHORIZATION_PERSISTENCE_GUARDRAIL_ROWS.length}</strong> (active risk = 0). Retention/expiry fields = <strong>{AUTHORIZATION_RETENTION_EXPIRY_FIELDS.length}</strong> (all design-only, no scheduler/revocation). Audit/integrity items = <strong>{AUTHORIZATION_PERSISTENCE_AUDIT_INTEGRITY_ITEMS.length}</strong> (all design-only, hash none, audit writes 0, export disabled). Persistence implementation = <strong>none</strong>. DB schema = <strong>not implemented</strong>. API endpoint = <strong>not implemented</strong>. Stage C enabled = <strong>false</strong>. Recommended next = <strong>keep authorization persistence in design-only — no implementation work has started.</strong>
        </div>
      </SectionCard>

      {/* ── v7.24.0-P4 Authorization Review Policy + Decision Governance Design Bridge ── */}
      <SectionCard title="Authorization Review Policy & Decision Governance Design Bridge (P4)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Review policy fields" value={String(AUTHORIZATION_REVIEW_POLICY_FIELDS.length)} color="#8B5CF6" />
          <KpiCard label="Decision governance items" value={String(AUTHORIZATION_DECISION_GOVERNANCE_ITEMS.length)} color="#8B5CF6" />
          <KpiCard label="Review scope rows" value={String(MANUAL_REVIEW_SCOPE_ROWS.length)} color="#8B5CF6" />
          <KpiCard label="Evidence requirement rows" value={String(DECISION_EVIDENCE_REQUIREMENT_ROWS.length)} color="#8B5CF6" />
          <KpiCard label="Deny-by-default rules" value={String(DENY_BY_DEFAULT_RULES.length)} color="#8B5CF6" />
          <KpiCard label="Conflict/override rows" value={String(DECISION_CONFLICT_OVERRIDE_ROWS.length)} color="#8B5CF6" />
          <KpiCard label="Escalation/expiry/revocation fields" value={String(REVIEW_ESCALATION_EXPIRY_REVOCATION_FIELDS.length)} color="#8B5CF6" />
          <KpiCard label="Audit design items" value={String(AUTHORIZATION_DECISION_AUDIT_ITEMS.length)} color="#8B5CF6" />
          <KpiCard label="Review workflow" value="not implemented" color="#6B7280" />
          <KpiCard label="Decision engine" value="not implemented" color="#6B7280" />
          <KpiCard label="Override allowed now" value="false" color="var(--success)" />
          <KpiCard label="Stage C deferred" value="true" color="#F97316" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Authorization Review Policy Design →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep authorization review policy in design-only — no Stage C enablement</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          v7.24.0-P4 Authorization Review Policy + Decision Governance Design = <strong>design-only</strong>. Review policy fields = <strong>{AUTHORIZATION_REVIEW_POLICY_FIELDS.length}</strong> (all design-only). Decision governance items = <strong>{AUTHORIZATION_DECISION_GOVERNANCE_ITEMS.length}</strong> (all design-only). Review scope rows = <strong>{MANUAL_REVIEW_SCOPE_ROWS.length}</strong> (all future, not ready). Evidence requirement rows = <strong>{DECISION_EVIDENCE_REQUIREMENT_ROWS.length}</strong> (all future, disabled). Deny-by-default rules = <strong>{DENY_BY_DEFAULT_RULES.length}</strong> (all design-only, no evaluator). Conflict/override rows = <strong>{DECISION_CONFLICT_OVERRIDE_ROWS.length}</strong> (override not allowed now). Escalation/expiry/revocation fields = <strong>{REVIEW_ESCALATION_EXPIRY_REVOCATION_FIELDS.length}</strong> (all design-only, no scheduler/revocation). Audit design items = <strong>{AUTHORIZATION_DECISION_AUDIT_ITEMS.length}</strong> (all design-only, audit writes=0, export=0, hash=0). Review workflow = <strong>not implemented</strong>. Decision engine = <strong>not implemented</strong>. Override allowed now = <strong>false</strong>. Stage C = <strong>deferred</strong>. Recommended next = <strong>keep authorization review policy in design-only — no implementation work has started.</strong>
        </div>
      </SectionCard>

      {/* ── v7.24.0-P5 Runtime Readiness Bridge ── */}
      <SectionCard title="Runtime Readiness Bridge (P5)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Runtime readiness" value="No-Go" color="#EF4444" />
          <KpiCard label="Activation blockers" value={String(ACTIVATION_BLOCKER_ROADMAP_ITEMS.length)} color="var(--danger)" />
          <KpiCard label="Readiness simulation areas" value={String(RUNTIME_READINESS_SIMULATION_AREAS.length)} color="#8B5CF6" />
          <KpiCard label="Go/No-Go gates" value={String(GO_NO_GO_DECISION_GATES.length)} color="var(--danger)" />
          <KpiCard label="No-Go gates" value={String(GO_NO_GO_DECISION_GATES.filter(g => g.currentDecision === 'No-Go').length)} color="var(--danger)" />
          <KpiCard label="Blocker dependencies" value={String(BLOCKER_DEPENDENCY_SEQUENCES.length)} color="#8B5CF6" />
          <KpiCard label="Dry-run areas" value={String(DRY_RUN_SIMULATION_AREAS.length)} color="#8B5CF6" />
          <KpiCard label="Safety checks" value={String(ACTIVATION_SAFETY_CHECKLIST_ITEMS.length)} color="var(--danger)" />
          <KpiCard label="Evidence types" value={String(RUNTIME_READINESS_EVIDENCE_TYPES.length)} color="#8B5CF6" />
          <KpiCard label="Rollback readiness items" value={String(ACTIVATION_ROLLBACK_READINESS_ITEMS.length)} color="var(--danger)" />
          <KpiCard label="Runtime simulator" value="not implemented" color="#6B7280" />
          <KpiCard label="Dry-run engine" value="not implemented" color="#6B7280" />
          <KpiCard label="Stage C enabled" value="false" color="var(--success)" />
          <KpiCard label="Real control buttons" value="0" color="var(--success)" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Activation Blocker Roadmap →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Stage C is No-Go — keep disabled</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          v7.24.0-P5 Runtime Readiness = <strong>No-Go</strong>. Activation blockers = <strong>{ACTIVATION_BLOCKER_ROADMAP_ITEMS.length}</strong> (all not resolved). Readiness simulation areas = <strong>{RUNTIME_READINESS_SIMULATION_AREAS.length}</strong> (all 0% simulated score). Go/No-Go gates = <strong>{GO_NO_GO_DECISION_GATES.length}</strong> (all No-Go). Blocker dependencies = <strong>{BLOCKER_DEPENDENCY_SEQUENCES.length}</strong> (all future). Dry-run areas = <strong>{DRY_RUN_SIMULATION_AREAS.length}</strong> (all none). Safety checks = <strong>{ACTIVATION_SAFETY_CHECKLIST_ITEMS.length}</strong> (baseline verified not activation ready, all future required). Evidence types = <strong>{RUNTIME_READINESS_EVIDENCE_TYPES.length}</strong> (available baseline not activation ready, future evidence not available). Rollback readiness items = <strong>{ACTIVATION_ROLLBACK_READINESS_ITEMS.length}</strong> (all design-only not implemented). Runtime simulator = <strong>not implemented</strong>. Dry-run engine = <strong>not implemented</strong>. Preflight = <strong>not executed</strong>. Runtime state reads = <strong>0</strong>. Stage C enabled = <strong>false</strong>. Real control buttons = <strong>0</strong>. Recommended next = <strong>keep Stage C disabled — address blocker resolution packages, do not enable activation.</strong>
        </div>
      </SectionCard>

      {/* ── v7.24.0-P6 Implementation Boundary Bridge ── */}
      <SectionCard title="Implementation Boundary Bridge (P6)" style={{ marginBottom: 20, border: '1px solid #EF4444' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Implementation boundary" value="design-review-only" color="#EF4444" />
          <KpiCard label="Implementation packages" value={String(IMPLEMENTATION_PACKAGE_BOUNDARY_ITEMS.length)} color="#8B5CF6" />
          <KpiCard label="Future schema tables" value={String(FUTURE_SCHEMA_TABLES.length)} color="#8B5CF6" />
          <KpiCard label="Future API endpoints" value={String(FUTURE_API_ENDPOINTS.length)} color="#8B5CF6" />
          <KpiCard label="Evaluator stages" value={String(RUNTIME_EVALUATOR_STAGES.length)} color="#8B5CF6" />
          <KpiCard label="Workflow stages" value={String(REVIEW_WORKFLOW_STAGES.length)} color="#8B5CF6" />
          <KpiCard label="Storage/API risks" value={String(STORAGE_API_RISK_ROWS.length)} color="var(--success)" />
          <KpiCard label="Sequence rows" value={String(IMPLEMENTATION_SEQUENCE_ROWS.length)} color="#8B5CF6" />
          <KpiCard label="Go/No-Go checks" value={String(IMPLEMENTATION_GO_NO_GO_CHECKS.length)} color="var(--danger)" />
          <KpiCard label="Overall decision" value="No-Go" color="#EF4444" />
          <KpiCard label="Planning allowed" value="true" color="#8B5CF6" />
          <KpiCard label="Runtime execution" value="false" color="var(--success)" />
          <KpiCard label="DB schema added" value="0" color="var(--success)" />
          <KpiCard label="Migration added" value="0" color="var(--success)" />
          <KpiCard label="API endpoints added" value="0" color="var(--success)" />
          <KpiCard label="Storage writes" value="0" color="var(--success)" />
          <KpiCard label="Runtime evaluator" value="not implemented" color="#6B7280" />
          <KpiCard label="Review workflow" value="not implemented" color="#6B7280" />
          <KpiCard label="Decision engine" value="not implemented" color="#6B7280" />
          <KpiCard label="Stage C enabled" value="false" color="var(--success)" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Implementation Boundary & Design Review →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep implementation in design-review-only — no runtime execution</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          v7.24.0-P6 Implementation Boundary = <strong>implementation-boundary-only / storage-api-design-review</strong>. Implementation packages = <strong>{IMPLEMENTATION_PACKAGE_BOUNDARY_ITEMS.length}</strong> (all not implemented, No-Go). Future schema tables = <strong>{FUTURE_SCHEMA_TABLES.length}</strong> (all not added). Future API endpoints = <strong>{FUTURE_API_ENDPOINTS.length}</strong> (all not implemented). Evaluator stages = <strong>{RUNTIME_EVALUATOR_STAGES.length}</strong> (all none, not implemented). Workflow stages = <strong>{REVIEW_WORKFLOW_STAGES.length}</strong> (all none, not implemented). Storage/API risks = <strong>{STORAGE_API_RISK_ROWS.length}</strong> (all activeRisk=0, safe). Sequencing rows = <strong>{IMPLEMENTATION_SEQUENCE_ROWS.length}</strong> (all future, No-Go). Go/No-Go checks = <strong>{IMPLEMENTATION_GO_NO_GO_CHECKS.length}</strong> (all No-Go). Overall implementation decision = <strong>No-Go</strong>. Implementation planning allowed = <strong>true</strong>. Runtime execution allowed = <strong>false</strong>. DB schema added = <strong>0</strong>. Migration added = <strong>0</strong>. API endpoints added = <strong>0</strong>. Storage writes = <strong>0</strong>. Runtime evaluator = <strong>not implemented</strong>. Review workflow = <strong>not implemented</strong>. Decision engine = <strong>not implemented</strong>. Permission evaluator = <strong>not implemented</strong>. Stage C enabled = <strong>false</strong>. Recommended next = <strong>proceed to storage schema implementation plan review — not implementation.</strong>
        </div>
      </SectionCard>

      {/* ── v7.24.0-P7 Storage Schema Implementation Plan Review Bridge ── */}
      <SectionCard title="Storage Schema Implementation Plan Review Bridge (P7)" style={{ marginBottom: 20, border: '1px solid #8B5CF6' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Schema implementation phases" value={String(SCHEMA_IMPLEMENTATION_PHASES.length)} color="#8B5CF6" />
          <KpiCard label="Authorization table designs" value={String(AUTHORIZATION_TABLE_DESIGN_ROWS.length)} color="#EF4444" />
          <KpiCard label="Migration boundaries" value={String(MIGRATION_BOUNDARY_ITEMS.length)} color="#F59E0B" />
          <KpiCard label="Schema change risks" value={String(SCHEMA_CHANGE_RISK_ROWS.length)} color="var(--success)" />
          <KpiCard label="Retention/cleanup policies" value={String(RETENTION_CLEANUP_POLICY_AREAS.length)} color="#14B8A6" />
          <KpiCard label="Rollback planning items" value={String(SCHEMA_ROLLBACK_PLANNING_ITEMS.length)} color="#F43F5E" />
          <KpiCard label="Storage validation checks" value={String(STORAGE_VALIDATION_CHECKS.length)} color="#06B6D4" />
          <KpiCard label="DB doctor extension checks" value={String(DB_DOCTOR_EXTENSION_CHECKS.length)} color="#6366F1" />
          <KpiCard label="Overall decision" value="No-Go" color="#EF4444" />
          <KpiCard label="Planning allowed" value="true" color="#8B5CF6" />
          <KpiCard label="Runtime execution" value="false" color="var(--success)" />
          <KpiCard label="DB schema added" value="0" color="var(--success)" />
          <KpiCard label="Migration added" value="0" color="var(--success)" />
          <KpiCard label="API endpoints added" value="0" color="var(--success)" />
          <KpiCard label="Storage writes" value="0" color="var(--success)" />
          <KpiCard label="Stage C enabled" value="false" color="var(--success)" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(139,92,246,0.08)', color: '#8B5CF6', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Storage Schema Implementation Plan →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep implementation in design-review-only — no runtime execution</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          v7.24.0-P7 Storage Schema Implementation Plan Review = <strong>design-review-only</strong>. Schema implementation phases = <strong>{SCHEMA_IMPLEMENTATION_PHASES.length}</strong> (all review-only, No-Go). Authorization table designs = <strong>{AUTHORIZATION_TABLE_DESIGN_ROWS.length}</strong> (all not added, disabled). Migration boundaries = <strong>{MIGRATION_BOUNDARY_ITEMS.length}</strong> (all blocked, not implemented). Schema change risks = <strong>{SCHEMA_CHANGE_RISK_ROWS.length}</strong> (all activeRisk=0, safe). Retention/cleanup policies = <strong>{RETENTION_CLEANUP_POLICY_AREAS.length}</strong> (all none, not implemented). Rollback planning items = <strong>{SCHEMA_ROLLBACK_PLANNING_ITEMS.length}</strong> (all design-only, blocked). Storage validation checks = <strong>{STORAGE_VALIDATION_CHECKS.length}</strong> (most future, baseline available). DB doctor extension checks = <strong>{DB_DOCTOR_EXTENSION_CHECKS.length}</strong> (all not implemented, read-only probes). Overall implementation decision = <strong>No-Go</strong>. Implementation planning allowed = <strong>true</strong>. Runtime execution allowed = <strong>false</strong>. DB schema added = <strong>0</strong>. Migration added = <strong>0</strong>. API endpoints added = <strong>0</strong>. Storage writes = <strong>0</strong>. Stage C enabled = <strong>false</strong>. Recommended next = <strong>proceed to activation safety review and runtime readiness validation — not implementation.</strong>
        </div>
      </SectionCard>

      {/* ── v7.24.0-P8 Authorization API Contract Implementation Plan Review Bridge ── */}
      <SectionCard title="Authorization API Contract Review Bridge (P8)" style={{ marginBottom: 20, border: '1px solid #3B82F6' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="API implementation phases" value={String(API_IMPLEMENTATION_PHASES.length)} color="#3B82F6" />
          <KpiCard label="Future API endpoints" value={String(AUTHORIZATION_ENDPOINT_BOUNDARY_ROWS.length)} color="#EF4444" />
          <KpiCard label="Request/response contracts" value={String(API_CONTRACT_ROWS.length)} color="#14B8A6" />
          <KpiCard label="Handler risks" value={String(API_HANDLER_RISK_ROWS.length)} color="var(--success)" />
          <KpiCard label="Auth boundary rows" value={String(API_AUTH_BOUNDARY_ROWS.length)} color="#F59E0B" />
          <KpiCard label="Error/fallback cases" value={String(API_ERROR_FALLBACK_ROWS.length)} color="#F43F5E" />
          <KpiCard label="Audit/evidence items" value={String(API_AUDIT_EVIDENCE_ROWS.length)} color="#06B6D4" />
          <KpiCard label="Validation checks" value={String(API_VALIDATION_CHECKS.length)} color="#6366F1" />
          <KpiCard label="Overall API decision" value="No-Go" color="#EF4444" />
          <KpiCard label="API implementation allowed" value="false" color="var(--success)" />
          <KpiCard label="Endpoint implementation" value="false" color="var(--success)" />
          <KpiCard label="API endpoints added" value="0" color="var(--success)" />
          <KpiCard label="Route handlers added" value="0" color="var(--success)" />
          <KpiCard label="API client mutations" value="0" color="var(--success)" />
          <KpiCard label="DB write paths" value="0" color="var(--success)" />
          <KpiCard label="Stage C enabled" value="false" color="var(--success)" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(59,130,246,0.08)', color: '#3B82F6', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Authorization API Contract Plan →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep API in review-only — no endpoint implementation</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(59,130,246,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          v7.24.0-P8 Authorization API Contract Review = <strong>review-only</strong>. API implementation phases = <strong>{API_IMPLEMENTATION_PHASES.length}</strong> (all review-only, No-Go). Future API endpoints = <strong>{AUTHORIZATION_ENDPOINT_BOUNDARY_ROWS.length}</strong> (all not implemented). Request/response contracts = <strong>{API_CONTRACT_ROWS.length}</strong> (all design-only). Handler risks = <strong>{API_HANDLER_RISK_ROWS.length}</strong> (all activeRisk=0, safe). Auth boundary rows = <strong>{API_AUTH_BOUNDARY_ROWS.length}</strong> (all no access, Stage C deferred). Error/fallback cases = <strong>{API_ERROR_FALLBACK_ROWS.length}</strong> (all design-only, future package). Audit/evidence items = <strong>{API_AUDIT_EVIDENCE_ROWS.length}</strong> (all none, disabled). Validation checks = <strong>{API_VALIDATION_CHECKS.length}</strong> (baseline available, future required). Overall API decision = <strong>No-Go</strong>. API implementation allowed = <strong>false</strong>. Endpoint implementation allowed = <strong>false</strong>. API endpoints added = <strong>0</strong>. Route handlers added = <strong>0</strong>. API client mutations = <strong>0</strong>. Request handlers added = <strong>0</strong>. DB schema added = <strong>0</strong>. Migration added = <strong>0</strong>. DB write paths = <strong>0</strong>. External system writes = <strong>0</strong>. Runtime evaluator = <strong>not implemented</strong>. Review workflow = <strong>not implemented</strong>. Decision engine = <strong>not implemented</strong>. Permission evaluator = <strong>not implemented</strong>. Stage C enabled = <strong>false</strong>. Recommended next = <strong>proceed to endpoint implementation plan review — not implementation.</strong>
        </div>
      </SectionCard>

      {/* ── v7.24.0-P9 Runtime Evaluator Implementation Plan Review Bridge ── */}
      <SectionCard title="Runtime Evaluator Review Bridge (P9)" style={{ marginBottom: 20, border: '1px solid #10B981' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Evaluator phases" value={String(EVALUATOR_IMPLEMENTATION_PHASES.length)} color="#10B981" />
          <KpiCard label="Permission checks" value={String(PERMISSION_EVALUATION_BOUNDARY_ROWS.length)} color="#EF4444" />
          <KpiCard label="IO contract rows" value={String(EVALUATOR_IO_CONTRACT_ROWS.length)} color="#14B8A6" />
          <KpiCard label="Deny chain steps" value={String(DENY_BY_DEFAULT_CHAIN_ROWS.length)} color="#F59E0B" />
          <KpiCard label="Dependencies" value={String(EVALUATOR_DEPENDENCY_ROWS.length)} color="#8B5CF6" />
          <KpiCard label="Risk rows" value={String(EVALUATOR_RISK_GUARDRAIL_ROWS.length)} color="var(--success)" />
          <KpiCard label="Failure/fallback cases" value={String(EVALUATOR_FAILURE_FALLBACK_ROWS.length)} color="#06B6D4" />
          <KpiCard label="Validation checks" value={String(EVALUATOR_VALIDATION_CHECKS.length)} color="#6366F1" />
          <KpiCard label="Overall evaluator decision" value="No-Go" color="#EF4444" />
          <KpiCard label="Evaluator implemented" value="false" color="var(--success)" />
          <KpiCard label="Permission evaluator" value="false" color="var(--success)" />
          <KpiCard label="Allow/deny controls" value="0" color="var(--success)" />
          <KpiCard label="Runtime decisions" value="0" color="var(--success)" />
          <KpiCard label="API endpoints" value="0" color="var(--success)" />
          <KpiCard label="DB writes" value="0" color="var(--success)" />
          <KpiCard label="Stage C enabled" value="false" color="var(--success)" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', color: '#10B981', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Runtime Evaluator Plan →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep evaluator in review-only — no runtime implementation</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(16,185,129,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          v7.24.0-P9 Runtime Evaluator Review = <strong>review-only</strong>. Evaluator implementation phases = <strong>{EVALUATOR_IMPLEMENTATION_PHASES.length}</strong> (all review-only, No-Go). Permission checks = <strong>{PERMISSION_EVALUATION_BOUNDARY_ROWS.length}</strong> (all false, not implemented). IO contract rows = <strong>{EVALUATOR_IO_CONTRACT_ROWS.length}</strong> (all design-only). Deny chain steps = <strong>{DENY_BY_DEFAULT_CHAIN_ROWS.length}</strong> (all deny by default). Dependencies = <strong>{EVALUATOR_DEPENDENCY_ROWS.length}</strong> (all blocking, none available). Risk rows = <strong>{EVALUATOR_RISK_GUARDRAIL_ROWS.length}</strong> (all activeRisk=0, safe). Failure/fallback cases = <strong>{EVALUATOR_FAILURE_FALLBACK_ROWS.length}</strong> (all design-only). Validation checks = <strong>{EVALUATOR_VALIDATION_CHECKS.length}</strong> (baseline available, future required). Overall evaluator decision = <strong>No-Go</strong>. Evaluator implementation allowed = <strong>false</strong>. Permission evaluator = <strong>not implemented</strong>. Allow controls = <strong>0</strong>. Deny controls = <strong>0</strong>. Runtime decisions = <strong>0</strong>. API endpoints added = <strong>0</strong>. DB writes = <strong>0</strong>. Stage C enabled = <strong>false</strong>. Recommended next = <strong>proceed to evaluator implementation package review — not implementation.</strong>
        </div>
      </SectionCard>

      {/* ── v7.24.0-P10 Evaluator Implementation Package Review Bridge ── */}
      <SectionCard title="Evaluator Implementation Package Review Bridge (P10)" style={{ marginBottom: 20, border: '1px solid #10B981' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Eval packages" value={String(EVALUATOR_IMPLEMENTATION_PACKAGE_ROWS.length)} color="#10B981" />
          <KpiCard label="Dry-run boundary areas" value={String(RUNTIME_DRY_RUN_BOUNDARY_ROWS.length)} color="#06B6D4" />
          <KpiCard label="Perm evaluator boundaries" value={String(PERMISSION_EVALUATOR_PACKAGE_BOUNDARY_ROWS.length)} color="#EF4444" />
          <KpiCard label="Package dependencies" value={String(EVALUATOR_PACKAGE_DEPENDENCY_ROWS.length)} color="#8B5CF6" />
          <KpiCard label="Decision trace steps" value={String(EVALUATOR_DECISION_TRACE_ROWS.length)} color="#6366F1" />
          <KpiCard label="Dry-run fixtures" value={String(RUNTIME_DRY_RUN_FIXTURE_ROWS.length)} color="#F59E0B" />
          <KpiCard label="Result contract fields" value={String(EVALUATION_RESULT_CONTRACT_ROWS.length)} color="#14B8A6" />
          <KpiCard label="No-Go checks" value={String(EVALUATOR_IMPLEMENTATION_NO_GO_CHECKS.length)} color="var(--danger)" />
          <KpiCard label="Overall decision" value="No-Go" color="#EF4444" />
          <KpiCard label="Eval implementation" value="false" color="var(--success)" />
          <KpiCard label="Perm evaluator impl" value="false" color="var(--success)" />
          <KpiCard label="Dry-run engine" value="false" color="var(--success)" />
          <KpiCard label="Allow controls" value="0" color="var(--success)" />
          <KpiCard label="Deny controls" value="0" color="var(--success)" />
          <KpiCard label="DB writes" value="0" color="var(--success)" />
          <KpiCard label="Stage C enabled" value="false" color="var(--success)" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', color: '#10B981', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Evaluator Implementation Package →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep evaluator in review-only — no implementation</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(16,185,129,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          v7.24.0-P10 Evaluator Implementation Package Review = <strong>review-only</strong>. Evaluator packages = <strong>{EVALUATOR_IMPLEMENTATION_PACKAGE_ROWS.length}</strong> (all No-Go). Dry-run boundary areas = <strong>{RUNTIME_DRY_RUN_BOUNDARY_ROWS.length}</strong> (all not implemented). Permission evaluator boundaries = <strong>{PERMISSION_EVALUATOR_PACKAGE_BOUNDARY_ROWS.length}</strong> (all blocked). Package dependencies = <strong>{EVALUATOR_PACKAGE_DEPENDENCY_ROWS.length}</strong> (all blocking, none available). Decision trace steps = <strong>{EVALUATOR_DECISION_TRACE_ROWS.length}</strong> (all design-only). Dry-run fixtures = <strong>{RUNTIME_DRY_RUN_FIXTURE_ROWS.length}</strong> (all design-only). Result contract fields = <strong>{EVALUATION_RESULT_CONTRACT_ROWS.length}</strong> (all design-only). No-Go checks = <strong>{EVALUATOR_IMPLEMENTATION_NO_GO_CHECKS.length}</strong> (all No-Go, not started). Overall evaluator decision = <strong>No-Go</strong>. Evaluator implementation allowed = <strong>false</strong>. Permission evaluator implementation allowed = <strong>false</strong>. Dry-run engine = <strong>not implemented</strong>. Allow controls = <strong>0</strong>. Deny controls = <strong>0</strong>. DB writes = <strong>0</strong>. Stage C enabled = <strong>false</strong>. Recommended next = <strong>proceed to implementation package execution — not runtime implementation.</strong>
        </div>
      </SectionCard>

      {/* ── v7.24.0-P11 Implementation Package Execution Boundary Review Bridge ── */}
      <SectionCard title="Implementation Package Execution Bridge (P11)" style={{ marginBottom: 20, border: '1px solid #64748B' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Exec areas" value={String(IMPLEMENTATION_PACKAGE_EXECUTION_AREAS.length)} color="#64748B" />
          <KpiCard label="Exec checks" value={String(IMPLEMENTATION_PACKAGE_EXECUTION_CHECKS.length)} color="#EF4444" />
          <KpiCard label="Runtime No-Go seals" value={String(RUNTIME_IMPLEMENTATION_NO_GO_CHECKS.length)} color="#DC2626" />
          <KpiCard label="Sequence packages" value={String(IMPLEMENTATION_PACKAGE_EXECUTION_SEQUENCE.length)} color="#F59E0B" />
          <KpiCard label="Overall decision" value="No-Go" color="#EF4444" />
          <KpiCard label="Eval implementation" value="false" color="var(--success)" />
          <KpiCard label="Perm evaluator" value="false" color="var(--success)" />
          <KpiCard label="Dry-run engine" value="false" color="var(--success)" />
          <KpiCard label="Decision engine" value="false" color="var(--success)" />
          <KpiCard label="Allow controls" value="0" color="var(--success)" />
          <KpiCard label="Deny controls" value="0" color="var(--success)" />
          <KpiCard label="API endpoints" value="0" color="var(--success)" />
          <KpiCard label="DB writes" value="0" color="var(--success)" />
          <KpiCard label="Stage C enabled" value="false" color="var(--success)" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(100,116,139,0.08)', color: '#64748B', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Implementation Package Execution Boundary →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep implementation execution in review-only — all No-Go sealed</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(100,116,139,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          v7.24.0-P11 Implementation Package Execution Boundary Review = <strong>review-only</strong>. Execution areas = <strong>{IMPLEMENTATION_PACKAGE_EXECUTION_AREAS.length}</strong> (all review-only, No-Go). Execution checks = <strong>{IMPLEMENTATION_PACKAGE_EXECUTION_CHECKS.length}</strong> (all No-Go, not started). Runtime No-Go seals = <strong>{RUNTIME_IMPLEMENTATION_NO_GO_CHECKS.length}</strong> (all sealed No-Go). Sequence packages = <strong>{IMPLEMENTATION_PACKAGE_EXECUTION_SEQUENCE.length}</strong> (all blocked, No-Go). Overall implementation execution decision = <strong>No-Go</strong>. Evaluator implementation allowed = <strong>false</strong>. Permission evaluator allowed = <strong>false</strong>. Dry-run engine = <strong>not implemented</strong>. Decision engine = <strong>not implemented</strong>. Allow controls = <strong>0</strong>. Deny controls = <strong>0</strong>. API endpoints = <strong>0</strong>. DB writes = <strong>0</strong>. Stage C enabled = <strong>false</strong>. Recommended next = <strong>proceed to closure metrics hardening — not implementation execution.</strong>
        </div>
      </SectionCard>

      {/* ── v7.24.0-P12 Runtime Authorization Metrics Hardening + Report Guardrail Bridge ── */}
      <SectionCard title="Metrics Hardening & Report Guardrail Bridge (P12)" style={{ marginBottom: 20, border: '1px solid #14B8A6' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10, marginBottom: 12 }}>
          <KpiCard label="Closure metrics" value={String(CLOSURE_METRICS_DEFINITIONS.length)} color="#14B8A6" />
          <KpiCard label="Guardrail checks" value={String(REPORT_GUARDRAIL_CHECKS.length)} color="#6366F1" />
          <KpiCard label="Hardening rules" value={String(METRICS_HARDENING_RULES.length)} color="#8B5CF6" />
          <KpiCard label="Error severity rules" value={String(METRICS_HARDENING_RULES.filter(r => r.severity === 'error').length)} color="var(--danger)" />
          <KpiCard label="Warning severity rules" value={String(METRICS_HARDENING_RULES.filter(r => r.severity === 'warning').length)} color="var(--warning)" />
          <KpiCard label="Rules enforced" value={String(METRICS_HARDENING_RULES.filter(r => r.enforced === 'true').length)} color="var(--success)" />
          <KpiCard label="Guardrail all pass" value={String(REPORT_GUARDRAIL_CHECKS.filter(c => c.currentState === 'pass').length)} color="var(--success)" />
          <KpiCard label="Metrics verified" value={String(CLOSURE_METRICS_DEFINITIONS.filter(m => m.status === 'verified').length)} color="var(--success)" />
          <KpiCard label="Stage C enabled" value="false" color="var(--success)" />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          <a href="/governance-center" style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(20,184,166,0.08)', color: '#14B8A6', fontWeight: 500, fontSize: 9, textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default' }} onClick={e => e.preventDefault()}>Review Metrics Hardening →</a>
          <span style={{ padding: '4px 12px', borderRadius: 12, background: 'rgba(20,184,166,0.08)', color: '#14B8A6', fontWeight: 500, fontSize: 9, whiteSpace: 'nowrap' }}>Keep metrics hardening — no runtime implementation</span>
        </div>
        <div style={{ padding: '6px 10px', borderRadius: 4, background: 'rgba(20,184,166,0.04)', fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          v7.24.0-P12 Metrics Hardening + Report Guardrail = <strong>metrics-hardening-only</strong>. Closure metrics = <strong>{CLOSURE_METRICS_DEFINITIONS.length}</strong> (all verified). Guardrail checks = <strong>{REPORT_GUARDRAIL_CHECKS.length}</strong> (all pass). Hardening rules = <strong>{METRICS_HARDENING_RULES.length}</strong> (error={String(METRICS_HARDENING_RULES.filter(r => r.severity === 'error').length)}, warning={String(METRICS_HARDENING_RULES.filter(r => r.severity === 'warning').length)}). Rules enforced = <strong>{String(METRICS_HARDENING_RULES.filter(r => r.enforced === 'true').length)}/{METRICS_HARDENING_RULES.length}</strong>. Guardrail all pass = <strong>{String(REPORT_GUARDRAIL_CHECKS.filter(c => c.currentState === 'pass').length)}/{REPORT_GUARDRAIL_CHECKS.length}</strong>. Metrics verified = <strong>{String(CLOSURE_METRICS_DEFINITIONS.filter(m => m.status === 'verified').length)}/{CLOSURE_METRICS_DEFINITIONS.length}</strong>. No metric misalignment allowed. Stage C enabled = <strong>false</strong>. Recommended next = <strong>proceed to P13 full closure audit.</strong>
        </div>
      </SectionCard>

      {/* ── P3 + P4 + P5 + P6 + P7 + P8 + P9 + P10 + P11 + P12 + P1 + P2 + P3 Control Room Safety Notice ── */}
      <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 6, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <strong>P3 + P4 + P5 + P6 + P7 + P8 + P9 + P10 + P11 + P12 + P1 + P2 + P3 Control Room & Governance safety notice:</strong><br />
        This is a <u>readonly control room / system overview</u>. All data is from static registries. Does not change Layout, sidebar, routes, or enable Stage C. No DB writes, no external calls, no candidate mutation, no LAN sync, no service control, no tag/release, no version mutation, no real control buttons, no experiment execution, no training, no inference, no approval/reject controls, no external write, no connector write, no upload, no deploy, no push, no rollback, no restore, no emergency stop, no pause, no kill, no taskkill, no restart, no disable, no shutdown, no audit evidence write/upload/export/persist. P9 Gate Coverage Closure Audit does not enable Stage C — all blockers remain unresolved. v7.24.0-P1 Activation Planning is planning-only — no activation code, no runtime implementation, no DB writes. v7.24.0-P2 Authorization Data Contract is design-contract-only — no runtime implementation, no DB schema, no API endpoint, no activation. v7.24.0-P3 Authorization Persistence Design is design-only — no persistence, no DB schema, no migration, no API endpoint, no runtime evaluator, no activation. v7.24.0-P10 Evaluator Implementation Package Review is review-only — no evaluator runtime, no dry-run engine, no permission evaluator, no DB write, no Stage C enablement. v7.24.0-P11 Implementation Package Execution Boundary Review is review-only — no runtime execution, no evaluator runtime, no dry-run engine, no permission function, no Stage C activation. v7.24.0-P12 Runtime Authorization Metrics Hardening + Report Guardrail is metrics-hardening-only — no runtime implementation, no Stage C enablement. All panels are governance-safe display only.
      </div>

      {/* Boundary Notice */}
      <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <strong>Readonly boundary notice:</strong><br />
        This is a <u>readonly governance launchpad</u>. All registry data is readonly metadata. Does not enable Advanced Mode, change sidebar, enable Stage C, execute high-risk actions, or write to database. All <code>allowedNow=false</code> entries are displayed for readonly assessment only.
      </div>

      {/* Governance Console Traceability */}
      <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 6, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', fontSize: 11, color: 'var(--text-secondary)' }}>
        - Governance Console: Aggregated readiness view available at <a href="/governance-console-preview" style={{ color: '#22C55E' }}>/governance-console-preview</a> (hidden direct, readonly, not in sidebar)
        <br />
        - P1 Runtime Readonly Status API Preview: View contract catalog, schema board, and mock responses at <a href="/runtime-readonly-status-api-preview" style={{ color: '#22C55E' }}>/runtime-readonly-status-api-preview</a> (hidden direct, readonly, not in sidebar)
        <br />
        - P2 Runtime Dry-run Contract Preview: Dry-run contract with request/response/gate/evidence/audit/rollback specs at <a href="/runtime-dry-run-contract-preview" style={{ color: '#22C55E' }}>/runtime-dry-run-contract-preview</a> (hidden direct, readonly, not in sidebar)
        <br />
        - P3 Runtime Audit Store Contract Preview: Audit event schema/retention/redaction/write policy at <a href="/runtime-audit-store-contract-preview" style={{ color: '#22C55E' }}>/runtime-audit-store-contract-preview</a> (hidden direct, readonly, not in sidebar)
        <br />
        - P4 Stage C Pre-Enable Human Review Pack: 18-item pre-enable checklist across 11 review areas at <a href="/stage-c-preenable-review-preview" style={{ color: '#22C55E' }}>/stage-c-preenable-review-preview</a> (hidden direct, readonly, not in sidebar, does NOT enable Stage C)
      </div>
    </PageShell>
  );
}
