import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import {
  GOVERNANCE_STATES,
  GOVERNANCE_TRANSITIONS,
  getGovernanceStateSummary,
  getGovernanceTransitionsByTarget,
  getGovernanceTransitionsByRisk,
  getGovernanceBlockedTransitions,
  getGovernanceCriticalTransitions,
  type GovernanceStateItem,
  type GovernanceTransitionItem,
  type GovernanceTarget,
  type GovernanceTransitionRisk,
} from '../registry/governance-state-registry';
import {
  validateGovernanceStateMachine,
  getGovernanceStateValidationSummary,
} from '../registry/governance-state-validator';

const RISK_COLORS: Record<string, string> = {
  low: 'var(--success)',
  medium: 'var(--warning)',
  high: 'var(--danger)',
  critical: '#DC2626',
};

const STATE_LABELS: Record<string, string> = {
  readonly_preview: '只读预览',
  static_plan: '静态计划',
  synthetic_plan: '合成计划',
  dry_run_design: 'Dry-Run 设计',
  human_review_required: '需人工审查',
  blocked: '已阻断',
  future_stage_c: '未来 Stage C',
};

const TARGET_LABELS: Record<string, string> = {
  runtime_registry: '运行时注册表',
  dry_run_plan: 'Dry-run 计划',
  audit_log: '审计日志',
  permission_evaluator: '权限评估器',
  connector_center: '连接器中心',
  governance_center: '治理中心',
  memory_hub_candidate: 'Memory Hub 候选',
  external_tool: '外部工具',
  database: '数据库',
  stage_c: 'Stage C',
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

const ForbiddenNotice: React.FC = () => (
  <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '12px 16px', marginTop: 16 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>Governance 红线</div>
    <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
      本页面为只读治理状态机预览。不执行状态迁移，不处理审批候选，不写入数据库，不控制外部工具，不启用 Stage C。
      所有 Blocked 状态迁移均为设计阻断，非实际阻断执行。
    </div>
  </div>
);

const GovernanceStateMachinePreview: React.FC = () => {
  const summary = useMemo(() => getGovernanceStateSummary(), []);
  const validationSummary = useMemo(() => getGovernanceStateValidationSummary(), []);
  const validationResult = useMemo(() => validateGovernanceStateMachine(), []);
  const blockedTransitions = useMemo(() => getGovernanceBlockedTransitions(), []);
  const criticalTransitions = useMemo(() => getGovernanceCriticalTransitions(), []);

  const targets: GovernanceTarget[] = ['runtime_registry', 'dry_run_plan', 'audit_log', 'permission_evaluator', 'connector_center', 'governance_center', 'memory_hub_candidate', 'external_tool', 'database', 'stage_c'];

  return (
    <PageShell
      title="治理状态机预览"
      subtitle="只读查看 runtime governance 状态、迁移、门禁、证据与阻断条件。"
      safetyBoundary="readonly"
      safetyText="只读预览 · 不迁移状态 · 不处理审批 · 不写数据库 · 不启用 Stage C"
    >
      {/* A. Governance Overview Dashboard */}
      <SectionCard title="A. 治理状态机概览">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
          <KpiCard label="States" value={String(summary.totalStates)} color="var(--primary)" />
          <KpiCard label="Transitions" value={String(summary.totalTransitions)} color="var(--primary)" />
          <KpiCard label="Allowed Now" value={String(summary.allowedTransitions)} color="var(--success)" />
          <KpiCard label="Blocked" value={String(summary.blockedTransitions)} color="var(--danger)" />
          <KpiCard label="Critical" value={String(summary.criticalTransitions)} color="#DC2626" />
          <KpiCard label="Needs Human Approval" value={String(summary.requiresHumanApproval)} color="#8B5CF6" />
          <KpiCard label="Needs Stage C" value={String(summary.requiresStageC)} color="#F97316" />
          <KpiCard label="Needs DB Write" value={String(summary.requiresDbWrite)} color="#EC4899" />
        </div>
      </SectionCard>

      {/* B. State Board */}
      <SectionCard title="B. 状态面板">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
          {GOVERNANCE_STATES.map(s => (
            <div key={s.id} style={{ background: 'var(--bg-surface)', border: `1px solid ${s.allowedNow ? 'var(--border)' : 'rgba(220,38,38,0.3)'}`, borderRadius: 8, padding: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{STATE_LABELS[s.state] || s.state}</span>
                <Badge label={s.risk} color={RISK_COLORS[s.risk]} />
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>{s.id}</div>
              <div style={{ fontSize: 9, color: s.allowedNow ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                {s.allowedNow ? 'Allowed Now' : 'Blocked'}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{s.reason}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* C. Transition Matrix */}
      <SectionCard title="C. 迁移矩阵">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 10, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)' }}>
                <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Transition</th>
                <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>From → To</th>
                <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Target</th>
                <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>Risk</th>
                <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>Allowed</th>
                <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>Gates</th>
              </tr>
            </thead>
            <tbody>
              {GOVERNANCE_TRANSITIONS.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '4px 8px', fontWeight: 500 }}>{t.label}</td>
                  <td style={{ padding: '4px 8px' }}>{STATE_LABELS[t.fromState]} → {STATE_LABELS[t.toState]}</td>
                  <td style={{ padding: '4px 8px' }}>{TARGET_LABELS[t.target]}</td>
                  <td style={{ padding: '4px 8px', textAlign: 'center' }}><Badge label={t.risk} color={RISK_COLORS[t.risk]} /></td>
                  <td style={{ padding: '4px 8px', textAlign: 'center', color: t.allowedNow ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{t.allowedNow ? 'Yes' : 'No'}</td>
                  <td style={{ padding: '4px 8px' }}>{t.gates.join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 8 }}>
          {GOVERNANCE_TRANSITIONS.length} transitions total. {summary.allowedTransitions} allowed now, {summary.blockedTransitions} blocked.
        </div>
      </SectionCard>

      {/* D. Target Board */}
      <SectionCard title="D. 目标面板">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
          {targets.map(target => {
            const transitions = getGovernanceTransitionsByTarget(target);
            const allowed = transitions.filter(t => t.allowedNow).length;
            return (
              <div key={target} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{TARGET_LABELS[target]}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{transitions.length} transitions ({allowed} allowed)</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                  Targets: {transitions.map(t => STATE_LABELS[t.fromState]).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* E. Risk Board */}
      <SectionCard title="E. 风险面板">
        {(['low', 'medium', 'high', 'critical'] as GovernanceTransitionRisk[]).map(risk => {
          const transitions = getGovernanceTransitionsByRisk(risk);
          const allowedNow = transitions.filter(t => t.allowedNow);
          return (
            <div key={risk} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Badge label={risk} color={RISK_COLORS[risk]} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{transitions.length} transitions ({allowedNow.length} allowed now)</span>
              </div>
              {allowedNow.length > 0 && (
                <div style={{ fontSize: 9, color: 'var(--text-muted)', paddingLeft: 4 }}>
                  Allowed: {allowedNow.map(t => t.id).join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </SectionCard>

      {/* F. Blocked Transition Board */}
      <SectionCard title="F. 阻断迁移面板">
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          {blockedTransitions.length} transitions are blocked in the current version.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 8 }}>
          {blockedTransitions.map(t => (
            <div key={t.id} style={{ background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{t.label}</span>
                <Badge label={t.risk} color={RISK_COLORS[t.risk]} />
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>
                {STATE_LABELS[t.fromState]} → {STATE_LABELS[t.toState]}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>
                Target: {TARGET_LABELS[t.target]}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>
                Gates: {t.gates.join(', ')}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {t.reason}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* G. Evidence & Rollback Board */}
      <SectionCard title="G. 证据与回滚面板">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
          {GOVERNANCE_STATES.map(s => (
            <div key={s.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{STATE_LABELS[s.state]}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>
                Evidence: {s.evidence.join(', ') || '—'}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                Rollback: {s.requiresRollbackPlan ? 'Required' : 'Not Required'}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* H. Validator Summary */}
      <SectionCard title="H. 校验摘要">
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          <KpiCard label="Blocking" value={String(validationSummary.blocking)} color={validationSummary.blocking > 0 ? 'var(--danger)' : 'var(--success)'} />
          <KpiCard label="Warning" value={String(validationSummary.warning)} color={validationSummary.warning > 0 ? '#F59E0B' : 'var(--success)'} />
          <KpiCard label="Info" value={String(validationSummary.info)} color="var(--primary)" />
          <KpiCard label="Pass" value={validationSummary.pass ? 'Yes' : 'No'} color={validationSummary.pass ? 'var(--success)' : 'var(--danger)'} />
        </div>
        {validationResult.blocking.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--danger)', marginBottom: 4 }}>Blocking Items:</div>
            {validationResult.blocking.map((msg, i) => (
              <div key={i} style={{ fontSize: 9, color: 'var(--danger)', padding: '2px 0' }}>• {msg}</div>
            ))}
          </div>
        )}
        {validationResult.warning.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#F59E0B', marginBottom: 4 }}>Warnings:</div>
            {validationResult.warning.map((msg, i) => (
              <div key={i} style={{ fontSize: 9, color: '#F59E0B', padding: '2px 0' }}>• {msg}</div>
            ))}
          </div>
        )}
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          <Link to="/runtime-registry-preview" style={{ color: '#8B5CF6', textDecoration: 'none' }}>Runtime Registry →</Link>
          {' | '}
          <Link to="/dry-run-plan-preview" style={{ color: '#3B82F6', textDecoration: 'none' }}>Dry-run Plan →</Link>
          {' | '}
          <Link to="/audit-log-preview" style={{ color: '#DC2626', textDecoration: 'none' }}>Audit Log →</Link>
          {' | '}
          <Link to="/permission-evaluator-preview" style={{ color: '#8B5CF6', textDecoration: 'none' }}>Permission Evaluator →</Link>
          {' | '}
          <Link to="/human-approval-workflow-preview" style={{ color: '#EC4899', textDecoration: 'none' }}>Human Approval →</Link>
          {' | '}
          <Link to="/evidence-schema-preview" style={{ color: '#22C55E', textDecoration: 'none' }}>Evidence Schema →</Link>
        </div>
      </SectionCard>

      {/* I. Forbidden Governance Notice */}
      <ForbiddenNotice />
    </PageShell>
  );
};

export default GovernanceStateMachinePreview;
