import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import {
  DRY_RUN_PLANS,
  getDryRunPlansByTarget,
  getDryRunPlansByMode,
  getDryRunPlansByRisk,
  getDryRunPlanAllowedNowItems,
  getDryRunPlanBlockedItems,
  getDryRunPlanSummary,
  getDryRunPlanModeSummary,
  type DryRunPlanItem,
} from '../registry/dry-run-plan-registry';
import {
  validateDryRunPlans,
  getDryRunPlanValidationSummary,
} from '../registry/dry-run-plan-validator';
import { getRuntimeRegistrySummary } from '../registry/runtime-registry';
import { getAuditLogPreviewSummary } from '../registry/audit-log-registry';

const RISK_COLORS: Record<string, string> = {
  low: 'var(--success)',
  medium: 'var(--warning)',
  high: 'var(--danger)',
  critical: '#DC2626',
};

const MODE_LABELS: Record<string, string> = {
  static_preview: '静态预览',
  synthetic_plan: '合成计划',
  external_dry_run_required: '需外部 Dry-Run',
  human_approval_required: '需人工批准',
  forbidden: '禁止',
};

const MODE_COLORS: Record<string, string> = {
  static_preview: 'var(--success)',
  synthetic_plan: '#3B82F6',
  external_dry_run_required: 'var(--warning)',
  human_approval_required: '#F97316',
  forbidden: 'var(--danger)',
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

function PlanCard({ plan }: { plan: DryRunPlanItem }) {
  const isBlocked = plan.status === 'blocked';
  const isHigh = plan.risk === 'high' || plan.risk === 'critical';
  return <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-surface)', border: `1px solid ${isHigh ? 'var(--danger)' : isBlocked ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`, borderLeft: `3px solid ${RISK_COLORS[plan.risk]}`, fontSize: 11, marginBottom: 8 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{plan.label}</span>
      <Badge label={MODE_LABELS[plan.mode] || plan.mode} color={MODE_COLORS[plan.mode] || '#6B7280'} />
      <Badge label={plan.target} color="#6B7280" />
      <Badge label={plan.risk} color={RISK_COLORS[plan.risk]} />
      <Badge label={plan.status} color={plan.status === 'preview_ready' ? 'var(--success)' : plan.status === 'blocked' ? 'var(--danger)' : 'var(--warning)'} />
      {plan.allowedNow ? <Badge label="allowedNow" color="var(--success)" /> : <Badge label="blocked" color="var(--danger)" />}
      {plan.requiresHumanApproval && <Badge label="需人工批准" color="var(--warning)" />}
      {plan.requiresStageC && <Badge label="需 Stage C" color="var(--danger)" />}
      {plan.requiresAuditLog && <Badge label="需审计日志" color="#3B82F6" />}
      {plan.requiresRollbackPlan && <Badge label="需回滚计划" color="#F97316" />}
    </div>
    {plan.planSteps.length > 0 && <div style={{ marginBottom: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--text-muted)' }}>计划步骤: </span>
      {plan.planSteps.map((s, i) => <Badge key={i} label={s} color="#6B7280" />)}
    </div>}
    {plan.previewInputs.length > 0 && <div style={{ marginBottom: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--text-muted)' }}>预览输入: </span>
      {plan.previewInputs.map((s, i) => <Badge key={i} label={s} color="#3B82F6" />)}
    </div>}
    {plan.expectedOutputs.length > 0 && <div style={{ marginBottom: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--text-muted)' }}>期望输出: </span>
      {plan.expectedOutputs.map((s, i) => <Badge key={i} label={s} color="var(--success)" />)}
    </div>}
    {plan.blockedActions.length > 0 && <div style={{ marginBottom: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--text-muted)' }}>禁止操作: </span>
      {plan.blockedActions.map(a => <Badge key={a} label={a} color="var(--danger)" />)}
    </div>}
    {plan.gates.length > 0 && <div style={{ marginBottom: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--text-muted)' }}>门禁: </span>
      {plan.gates.map(g => <Badge key={g} label={g} color="#6B7280" />)}
    </div>}
    <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>{plan.reason}</div>
    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>下一步: {plan.nextAction}</div>
  </div>;
}

export default function DryRunPlanPreview() {
  const summary = useMemo(() => getDryRunPlanSummary(), []);
  const modeSummary = useMemo(() => getDryRunPlanModeSummary(), []);
  const validationSummary = useMemo(() => getDryRunPlanValidationSummary(), []);
  const validationResult = useMemo(() => validateDryRunPlans(), []);
  const runtimeSummary = useMemo(() => getRuntimeRegistrySummary(), []);

  return (
    <PageShell
      title="Dry-run 计划预览"
      subtitle="只读查看未来连接器 dry-run 计划、门禁、输入输出与风险状态。"
      safetyBoundary="readonly"
      safetyText="只读预览 · 不运行 dry-run · 不控制外部工具 · 不写数据库 · 不启用 Stage C"
    >
      {/* A. Dry-run Overview Dashboard */}
      <SectionCard title="Dry-run 概述面板" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 10 }}>
          <KpiCard label="总计划" value={String(summary.total)} color="#8B5CF6" />
          <KpiCard label="当前允许" value={String(summary.allowedNow)} color="var(--success)" />
          <KpiCard label="已拦截" value={String(summary.blocked)} color="var(--danger)" />
          <KpiCard label="高/严重风险" value={String(summary.highOrCritical)} color="#DC2626" />
          <KpiCard label="需 Runtime" value={String(summary.requiresRuntime)} color="var(--warning)" />
          <KpiCard label="需外部系统" value={String(summary.requiresExternalSystem)} color="#F97316" />
          <KpiCard label="需人工批准" value={String(summary.requiresHumanApproval)} color="var(--warning)" />
          <KpiCard label="需 Stage C" value={String(summary.requiresStageC)} color="#DC2626" />
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.entries(modeSummary).map(([mode, count]) =>
            count > 0 && <Badge key={mode} label={`${MODE_LABELS[mode] || mode}: ${count}`} color={MODE_COLORS[mode] || '#6B7280'} />
          )}
        </div>
      </SectionCard>

      {/* B. Plan Mode Matrix */}
      <SectionCard title="计划模式矩阵" style={{ marginBottom: 16 }}>
        {(['static_preview', 'synthetic_plan', 'external_dry_run_required', 'human_approval_required', 'forbidden'] as const).map(mode => {
          const plans = getDryRunPlansByMode(mode);
          if (plans.length === 0) return null;
          return <div key={mode} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: MODE_COLORS[mode] || 'var(--text-secondary)', marginBottom: 4, borderBottom: `1px solid ${MODE_COLORS[mode] || 'var(--border)'}`, paddingBottom: 2 }}>
              {MODE_LABELS[mode] || mode} ({plans.length})
            </div>
            {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
          </div>;
        })}
      </SectionCard>

      {/* C. Target Board */}
      <SectionCard title="目标面板" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 8 }}>
          {(['openclaw', 'comfyui', 'openaxiom', 'huggingface', 'memory_hub', 'cc_switch', 'claude_proxy', 'git', 'database', 'stage_c'] as const).map(target => {
            const plans = getDryRunPlansByTarget(target);
            if (plans.length === 0) return null;
            return <div key={target} style={{ marginBottom: 8, width: '100%' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, paddingBottom: 2 }}>
                {target} ({plans.length})
              </div>
              {plans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
            </div>;
          })}
        </div>
      </SectionCard>

      {/* D. Gate Board */}
      <SectionCard title="门禁面板" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, fontSize: 10 }}>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--warning)' }}>需人工批准 ({DRY_RUN_PLANS.filter(p => p.requiresHumanApproval).length})</div>
            <div style={{ color: 'var(--text-muted)' }}>这些计划需要人工批准才能执行下一步。</div>
          </div>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: '#3B82F6' }}>需审计日志 ({DRY_RUN_PLANS.filter(p => p.requiresAuditLog).length})</div>
            <div style={{ color: 'var(--text-muted)' }}>高风险计划及需要干预的操作需要审计日志追踪。</div>
          </div>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: '#F97316' }}>需回滚计划 ({DRY_RUN_PLANS.filter(p => p.requiresRollbackPlan).length})</div>
            <div style={{ color: 'var(--text-muted)' }}>破坏性操作需要有回滚计划。</div>
          </div>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--danger)' }}>需 Stage C ({DRY_RUN_PLANS.filter(p => p.requiresStageC).length})</div>
            <div style={{ color: 'var(--text-muted)' }}>需要 Stage C 激活。Stage C 已永久禁用。</div>
          </div>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(107,114,128,0.08)', border: '1px solid rgba(107,114,128,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: '#6B7280' }}>需外部系统 ({DRY_RUN_PLANS.filter(p => p.requiresExternalSystem).length})</div>
            <div style={{ color: 'var(--text-muted)' }}>需要外部系统才能完成 dry-run。</div>
          </div>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(107,114,128,0.08)', border: '1px solid rgba(107,114,128,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: '#6B7280' }}>需 Runtime ({DRY_RUN_PLANS.filter(p => p.requiresRuntime).length})</div>
            <div style={{ color: 'var(--text-muted)' }}>需要运行时引擎才能执行 dry-run。</div>
          </div>
        </div>
      </SectionCard>

      {/* E. Runtime Registry Snapshot */}
      <SectionCard title="Runtime Registry 关联" style={{ marginBottom: 16, border: '1px solid #8B5CF6' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, marginBottom: 12 }}>
          <KpiCard label="Runtime 总目标" value={String(runtimeSummary.total)} color="#8B5CF6" />
          <KpiCard label="当前允许" value={String(runtimeSummary.allowedNow)} color="var(--success)" />
          <KpiCard label="高/严重风险" value={String(runtimeSummary.highOrCritical)} color="#DC2626" />
          <KpiCard label="需 Stage C" value={String(runtimeSummary.requiresStageC)} color="#DC2626" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/runtime-registry-preview" style={{ fontSize: 11, color: '#8B5CF6', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.3)' }}>
            打开 Runtime Registry 预览
          </Link>
        </div>
      </SectionCard>

      {/* F. Audit Log Preview Snapshot */}
      <SectionCard title="审计日志预览快照" style={{ marginBottom: 16, border: '1px solid #DC2626' }}>
        {(() => {
          const as = getAuditLogPreviewSummary();
          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, marginBottom: 12 }}>
              <KpiCard label="总事件" value={String(as.total)} color="#8B5CF6" />
              <KpiCard label="当前允许" value={String(as.allowedNow)} color="var(--success)" />
              <KpiCard label="高/严重风险" value={String(as.highOrCritical)} color="#DC2626" />
              <KpiCard label="需 DB 写" value={String(as.requiresDbWrite)} color="#8B5CF6" />
              <KpiCard label="需 Stage C" value={String(as.requiresStageC)} color="#DC2626" />
            </div>
          );
        })()}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/audit-log-preview" style={{ fontSize: 11, color: '#DC2626', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(220,38,38,0.3)' }}>
            打开审计日志预览
          </Link>
        </div>
      </SectionCard>

      {/* G. Governance Gate Snapshot */}
      <SectionCard title="治理门禁快照" style={{ marginBottom: 16, border: '1px solid #8B5CF6' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          7 governance states · 18 transitions · All transitions requiring external control, DB write, or Stage C are blocked.
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/governance-state-machine-preview" style={{ fontSize: 11, color: '#8B5CF6', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.3)' }}>
            打开治理状态机预览
          </Link>
        </div>
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', fontSize: 10, color: '#8B5CF6', textAlign: 'center' }}>
          Governance Gate — 只读门禁预览 · 不迁移状态 · 不处理审批 · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* H. Human Approval Requirement Snapshot */}
      <SectionCard title="人工审批需求快照" style={{ marginBottom: 16, border: '1px solid #EC4899' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          20 approval workflow items · Critical transitions (execution, candidate processing, Stage C) are permanently blocked.
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/human-approval-workflow-preview" style={{ fontSize: 11, color: '#EC4899', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(236,72,153,0.3)' }}>
            打开人工审批流程预览
          </Link>
        </div>
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(236,72,153,0.06)', fontSize: 10, color: '#EC4899', textAlign: 'center' }}>
          Human Approval — 只读门禁预览 · 不创建审批队列 · 不处理 candidate · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* F. Validator Summary */}
      <SectionCard title="校验摘要" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          <div style={{ padding: '4px 10px', borderRadius: 6, background: validationSummary.blocking > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${validationSummary.blocking > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}` }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: validationSummary.blocking > 0 ? 'var(--danger)' : 'var(--success)' }}>{validationSummary.blocking}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Blocking</div>
          </div>
          <div style={{ padding: '4px 10px', borderRadius: 6, background: validationSummary.warning > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${validationSummary.warning > 0 ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}` }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: validationSummary.warning > 0 ? 'var(--warning)' : 'var(--success)' }}>{validationSummary.warning}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Warning</div>
          </div>
          <div style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#8B5CF6' }}>{validationSummary.info}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Info</div>
          </div>
          <div style={{ padding: '4px 10px', borderRadius: 6, background: validationSummary.pass ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${validationSummary.pass ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: validationSummary.pass ? 'var(--success)' : 'var(--danger)' }}>{validationSummary.pass ? 'PASS' : 'FAIL'}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Status</div>
          </div>
        </div>
        {validationResult.blocking.map((msg, i) => (
          <div key={`b-${i}`} style={{ fontSize: 10, color: 'var(--danger)', padding: '2px 6px' }}>blocking: {msg}</div>
        ))}
        {validationResult.warning.map((msg, i) => (
          <div key={`w-${i}`} style={{ fontSize: 10, color: 'var(--warning)', padding: '2px 6px' }}>warning: {msg}</div>
        ))}
        {validationResult.info.map((msg, i) => (
          <div key={`i-${i}`} style={{ fontSize: 10, color: 'var(--text-muted)', padding: '2px 6px' }}>info: {msg}</div>
        ))}
      </SectionCard>

      {/* I. Rollback Plan Requirements */}
      <SectionCard title="回滚计划需求" style={{ marginBottom: 16, border: '1px solid #F97316' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          Rollback registry 定义了 dry-run plan preview 的回滚需求：idempotency check、rollback evidence、rollback audit trace。
          相关 rollback 项: dry-run-plan-preview-rollback, idempotency-key-check-preview, rollback-evidence-requirement-preview
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/rollback-preview" style={{ fontSize: 11, color: '#F97316', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(249,115,22,0.3)' }}>
            打开回滚预览
          </Link>
        </div>
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(249,115,22,0.06)', fontSize: 10, color: '#F97316', textAlign: 'center' }}>
          Rollback — 只读回滚风险评估 · 不执行 rollback · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* H. Evidence Input/Output Traceability */}
      <SectionCard title="证据输入/输出可追溯性" style={{ marginBottom: 16, border: '1px solid #22C55E' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          证据 schema 定义了 dry-run plan preview 的输入和输出可追溯性模型。
          相关证据项: dry-run-plan-preview-evidence, dry-run-validator-summary
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/evidence-schema-preview" style={{ fontSize: 11, color: '#22C55E', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.3)' }}>
            打开证据模型预览
          </Link>
        </div>
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(34,197,94,0.06)', fontSize: 10, color: '#22C55E', textAlign: 'center' }}>
          Evidence Schema — 只读证据模型预览 · 不执行 dry-run · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* G. Forbidden Dry-run Notice */}
      <SectionCard title="当前阶段禁止事项" style={{ marginBottom: 16, border: '1px solid var(--danger)' }}>
        <div style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <p><strong>Dry-run 未实现：</strong>当前不运行任何 dry-run。Dry-run Plan Registry 仅为只读计划模型。</p>
          <p><strong>不控制外部工具：</strong>无权控制 OpenClaw / ComfyUI / OpenAxiom / HuggingFace / Hermes / CC Switch / Claude Proxy。</p>
          <p><strong>不写入数据库：</strong>所有数据为静态注册表数据，不进行任何数据库写入。</p>
          <p><strong>不调用外部 API：</strong>不调用任何外部系统 API。</p>
          <p><strong>不启用 Stage C：</strong>Stage C 永久禁用。</p>
          <p><strong>不创建标签/发布：</strong>不创建 Git 标签或 GitHub Release。</p>
        </div>
      </SectionCard>

      {/* Governance Console Traceability */}
      <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 6, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', fontSize: 11, color: 'var(--text-secondary)' }}>
        - Governance Console: Dry-run plan is in Governance Console risk aggregation at <a href="/governance-console-preview" style={{ color: '#22C55E' }}>/governance-console-preview</a> (hidden direct, readonly, not in sidebar)
      </div>
    </PageShell>
  );
}
