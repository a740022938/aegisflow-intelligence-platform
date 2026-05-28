import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import {
  RUNTIME_REGISTRY,
  getRuntimeRegistryByActionLevel,
  getRuntimeRegistryByRisk,
  getRuntimeRegistryAllowedNowItems,
  getRuntimeRegistryBlockedItems,
  getRuntimeRegistryStageCItems,
  getRuntimeRegistrySummary,
  getRuntimeRegistryTargetKindSummary,
  getRuntimeRegistryActionLevelSummary,
  type RuntimeRegistryItem,
} from '../registry/runtime-registry';
import {
  validateRuntimeRegistry,
  getRuntimeRegistryValidationSummary,
} from '../registry/runtime-registry-validator';
import {
  getDryRunPlanSummary,
} from '../registry/dry-run-plan-registry';
import {
  getAuditLogPreviewSummary,
} from '../registry/audit-log-registry';

const RISK_COLORS: Record<string, string> = {
  low: 'var(--success)',
  medium: 'var(--warning)',
  high: 'var(--danger)',
  critical: '#DC2626',
};

const LEVEL_LABELS: Record<string, string> = {
  L0_VIEW_STATIC: 'L0 — 静态查看',
  L1_VIEW_RUNTIME_STATUS: 'L1 — 查看运行时状态',
  L2_GENERATE_TASK_PACKAGE: 'L2 — 生成任务包',
  L3_DRY_RUN_PLAN: 'L3 — Dry-Run 计划',
  L4_HUMAN_APPROVED_EXECUTE: 'L4 — 人工批准执行',
  L5_AUTONOMOUS_EXECUTE: 'L5 — 自主执行',
  L6_DESTRUCTIVE_OR_EXTERNAL_WRITE: 'L6 — 破坏性或外部写入',
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

function TargetCard({ item }: { item: RuntimeRegistryItem }) {
  const isBlocked = item.readiness === 'blocked';
  const isHigh = item.risk === 'high' || item.risk === 'critical';
  return <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-surface)', border: `1px solid ${isHigh ? 'var(--danger)' : isBlocked ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`, borderLeft: `3px solid ${RISK_COLORS[item.risk]}`, fontSize: 11, marginBottom: 8 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{item.label}</span>
      <Badge label={item.actionLevel} color="#8B5CF6" />
      <Badge label={item.targetKind} color="#6B7280" />
      <Badge label={item.risk} color={RISK_COLORS[item.risk]} />
      <Badge label={item.readiness} color={item.readiness === 'available_preview' ? 'var(--success)' : item.readiness === 'blocked' ? 'var(--danger)' : 'var(--warning)'} />
      <Badge label={item.exposure} color="#6B7280" />
      {item.allowedNow ? <Badge label="allowedNow" color="var(--success)" /> : <Badge label="blocked" color="var(--danger)" />}
      {item.requiresHumanApproval && <Badge label="人工批准" color="var(--warning)" />}
      {item.requiresStageC && <Badge label="需 Stage C" color="var(--danger)" />}
      {item.requiresAuditLog && <Badge label="需审计日志" color="#3B82F6" />}
      {item.requiresRollbackPlan && <Badge label="需回滚计划" color="#F97316" />}
    </div>
    {item.currentCapability.length > 0 && <div style={{ marginBottom: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--text-muted)' }}>当前能力: </span>
      {item.currentCapability.map(c => <Badge key={c} label={c} color="var(--success)" />)}
    </div>}
    {item.futureCapability.length > 0 && <div style={{ marginBottom: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--text-muted)' }}>未来能力: </span>
      {item.futureCapability.map(c => <Badge key={c} label={c} color="var(--warning)" />)}
    </div>}
    {item.blockedActions.length > 0 && <div style={{ marginBottom: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--text-muted)' }}>禁止操作: </span>
      {item.blockedActions.map(a => <Badge key={a} label={a} color="var(--danger)" />)}
    </div>}
    {item.gates.length > 0 && <div style={{ marginBottom: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--text-muted)' }}>门禁: </span>
      {item.gates.map(g => <Badge key={g} label={g} color="#6B7280" />)}
    </div>}
    <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>{item.reason}</div>
    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>下一步: {item.nextAction}</div>
  </div>;
}

export default function RuntimeRegistryPreview() {
  const summary = useMemo(() => getRuntimeRegistrySummary(), []);
  const validationSummary = useMemo(() => getRuntimeRegistryValidationSummary(), []);
  const validationResult = useMemo(() => validateRuntimeRegistry(), []);
  const targetKindSummary = useMemo(() => getRuntimeRegistryTargetKindSummary(), []);
  const actionLevelSummary = useMemo(() => getRuntimeRegistryActionLevelSummary(), []);
  const dryRunSummary = useMemo(() => getDryRunPlanSummary(), []);

  return (
    <PageShell
      title="运行时注册表预览"
      subtitle="只读查看未来连接器运行时目标、动作等级、门禁和风险状态。"
      safetyBoundary="readonly"
      safetyText="只读预览 · 不运行外部工具 · 不写数据库 · 不启用 Stage C"
    >
      {/* A. Runtime Overview Dashboard */}
      <SectionCard title="运行时概述面板" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 }}>
          <KpiCard label="总目标" value={String(summary.total)} color="#8B5CF6" />
          <KpiCard label="当前允许" value={String(summary.allowedNow)} color="var(--success)" />
          <KpiCard label="已拦截" value={String(summary.blocked)} color="var(--danger)" />
          <KpiCard label="高/严重风险" value={String(summary.highOrCritical)} color="#DC2626" />
          <KpiCard label="需 Stage C" value={String(summary.requiresStageC)} color="#DC2626" />
          <KpiCard label="需人工批准" value={String(summary.requiresHumanApproval)} color="var(--warning)" />
          <KpiCard label="外部写入" value={String(summary.externalWrite)} color="#DC2626" />
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.entries(actionLevelSummary).map(([level, count]) =>
            count > 0 && <Badge key={level} label={`${LEVEL_LABELS[level] || level}: ${count}`} color="#6B7280" />
          )}
        </div>
      </SectionCard>

      {/* B. Action Level Matrix */}
      <SectionCard title="动作等级矩阵" style={{ marginBottom: 16 }}>
        {(['L0_VIEW_STATIC', 'L1_VIEW_RUNTIME_STATUS', 'L2_GENERATE_TASK_PACKAGE', 'L3_DRY_RUN_PLAN', 'L4_HUMAN_APPROVED_EXECUTE', 'L5_AUTONOMOUS_EXECUTE', 'L6_DESTRUCTIVE_OR_EXTERNAL_WRITE'] as const).map(level => {
          const items = getRuntimeRegistryByActionLevel(level);
          if (items.length === 0) return null;
          const isDangerous = level === 'L4_HUMAN_APPROVED_EXECUTE' || level === 'L5_AUTONOMOUS_EXECUTE' || level === 'L6_DESTRUCTIVE_OR_EXTERNAL_WRITE';
          return <div key={level} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: isDangerous ? 'var(--danger)' : 'var(--text-secondary)', marginBottom: 4, borderBottom: `1px solid ${isDangerous ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`, paddingBottom: 2 }}>
              {LEVEL_LABELS[level] || level} ({items.length})
            </div>
            {items.map(item => <TargetCard key={item.id} item={item} />)}
          </div>;
        })}
      </SectionCard>

      {/* C. Risk Board */}
      <SectionCard title="风险面板" style={{ marginBottom: 16 }}>
        {(['low', 'medium', 'high', 'critical'] as const).map(risk => {
          const items = getRuntimeRegistryByRisk(risk);
          if (items.length === 0) return null;
          return <div key={risk} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: RISK_COLORS[risk], marginBottom: 4, paddingBottom: 2 }}>
              {risk.toUpperCase()} ({items.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {items.map(item => <TargetCard key={item.id} item={item} />)}
            </div>
          </div>;
        })}
      </SectionCard>

      {/* D. Gate Board */}
      <SectionCard title="门禁面板" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, fontSize: 10 }}>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--warning)' }}>需人工批准 ({getRuntimeRegistryByActionLevel('L4_HUMAN_APPROVED_EXECUTE').length + getRuntimeRegistryByActionLevel('L5_AUTONOMOUS_EXECUTE').length})</div>
            <div style={{ color: 'var(--text-muted)' }}>L4+ 级别操作需要人工批准才能执行。当前所有 L4+ 项目已拦截。</div>
          </div>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: '#3B82F6' }}>需审计日志 ({RUNTIME_REGISTRY.filter(i => i.requiresAuditLog).length})</div>
            <div style={{ color: 'var(--text-muted)' }}>高/严重风险及需要干预防操作需要审计日志追踪。</div>
          </div>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: '#F97316' }}>需回滚计划 ({RUNTIME_REGISTRY.filter(i => i.requiresRollbackPlan).length})</div>
            <div style={{ color: 'var(--text-muted)' }}>破坏性操作需要有回滚计划。</div>
          </div>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--danger)' }}>需 Stage C ({getRuntimeRegistryStageCItems().length})</div>
            <div style={{ color: 'var(--text-muted)' }}>需要 Stage C 激活。Stage C 已永久禁用。</div>
          </div>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(107,114,128,0.08)', border: '1px solid rgba(107,114,128,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: '#6B7280' }}>已拦截 ({getRuntimeRegistryBlockedItems().length})</div>
            <div style={{ color: 'var(--text-muted)' }}>这些目标因安全策略被永久拦截。</div>
          </div>
        </div>
      </SectionCard>

      {/* E. Target Kind Summary */}
      <SectionCard title="目标类型分布" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {Object.entries(targetKindSummary).map(([kind, count]) =>
            count > 0 && <Badge key={kind} label={`${kind}: ${count}`} color="#6B7280" />
          )}
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

      {/* H. Dry-run Plan Preview Snapshot */}
      <SectionCard title="Dry-run 计划预览快照" style={{ marginBottom: 16, border: '1px solid #3B82F6' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, marginBottom: 12 }}>
          <KpiCard label="总计划" value={String(dryRunSummary.total)} color="#8B5CF6" />
          <KpiCard label="当前允许" value={String(dryRunSummary.allowedNow)} color="var(--success)" />
          <KpiCard label="已拦截" value={String(dryRunSummary.blocked)} color="var(--danger)" />
          <KpiCard label="高/严重风险" value={String(dryRunSummary.highOrCritical)} color="#DC2626" />
          <KpiCard label="需 Stage C" value={String(dryRunSummary.requiresStageC)} color="#DC2626" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/dry-run-plan-preview" style={{ fontSize: 11, color: '#3B82F6', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.3)' }}>
            打开 Dry-run 计划预览
          </Link>
        </div>
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(59,130,246,0.06)', fontSize: 10, color: '#3B82F6', textAlign: 'center' }}>
          Dry-run Plan — 只读预览 · 不运行 dry-run · 不控制外部工具
        </div>
      </SectionCard>

      {/* I. Audit Log Preview Snapshot */}
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
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(220,38,38,0.06)', fontSize: 10, color: '#DC2626', textAlign: 'center' }}>
          Audit Log — 只读预览 · 不写审计库 · 不写数据库 · 不控制外部工具 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* J. Governance State Machine Snapshot */}
      <SectionCard title="治理状态机快照" style={{ marginBottom: 16, border: '1px solid #8B5CF6' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          7 states · 18 transitions · Readonly preview — no state mutation, no approval processing, no DB write, no Stage C.
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/governance-state-machine-preview" style={{ fontSize: 11, color: '#8B5CF6', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.3)' }}>
            打开治理状态机预览
          </Link>
        </div>
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', fontSize: 10, color: '#8B5CF6', textAlign: 'center' }}>
          Governance State — 只读预览 · 不迁移状态 · 不处理审批 · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* J. Rollback Gate Summary */}
      <SectionCard title="回滚门禁摘要" style={{ marginBottom: 16, border: '1px solid #F97316' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          22 rollback items · 9 blocked irreversible · Targets: runtime_registry, dry_run_plan, audit_log, human_approval, governance_state, evidence_schema, permission_evaluator, connector_center, git, database, external_tool, stage_c, local_file
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/rollback-preview" style={{ fontSize: 11, color: '#F97316', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(249,115,22,0.3)' }}>
            打开回滚预览
          </Link>
        </div>
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(249,115,22,0.06)', fontSize: 10, color: '#F97316', textAlign: 'center' }}>
          Rollback — 只读回滚风险评估预览 · 不执行回滚 · 不恢复文件 · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* I. Evidence Schema Source Snapshot */}
      <SectionCard title="证据模型来源快照" style={{ marginBottom: 16, border: '1px solid #22C55E' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          23 evidence schema items · Evidence type: registry_snapshot, validator_summary, rollback_plan · Source: runtime_registry
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/evidence-schema-preview" style={{ fontSize: 11, color: '#22C55E', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.3)' }}>
            打开证据模型预览
          </Link>
        </div>
        <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(34,197,94,0.06)', fontSize: 10, color: '#22C55E', textAlign: 'center' }}>
          Evidence Schema — 只读证据模型预览 · 不采集证据 · 不保存 secret · 不写数据库 · 不启用 Stage C
        </div>
      </SectionCard>

      {/* H. Human Approval Gate Snapshot */}
      <SectionCard title="人工审批门禁快照" style={{ marginBottom: 16, border: '1px solid #EC4899' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          20 approval workflow items · All execution/approval/candidate/Stage C transitions blocked.
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

      {/* G. Forbidden Runtime Notice */}
      <SectionCard title="当前阶段禁止事项" style={{ marginBottom: 16, border: '1px solid var(--danger)' }}>
        <div style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <p><strong>Runtime: preview mode.</strong></p>
          <p><strong>不控制外部工具：</strong>无权控制 OpenClaw / ComfyUI / OpenAxiom / HuggingFace / Hermes / CC Switch / Claude Proxy。</p>
          <p><strong>不写入数据库：</strong>所有数据显示为静态注册表数据，不进行任何数据库写入。</p>
          <p><strong>不调用外部 API：</strong>不调用任何外部系统 API。</p>
          <p><strong>不启用 Stage C：</strong>Stage C 永久禁用。</p>
          <p><strong>不创建标签/发布：</strong>不创建 Git 标签或 GitHub Release。</p>
        </div>
      </SectionCard>

      {/* Governance Console Traceability */}
      <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 6, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', fontSize: 11, color: 'var(--text-secondary)' }}>
        - Governance Console: Runtime registry is included in Governance Console registry chain at <a href="/governance-console-preview" style={{ color: '#22C55E' }}>/governance-console-preview</a> (hidden direct, readonly, not in sidebar)
        <br />
        - P1 Runtime Readonly Status API Preview: Contract catalog and schema board at <a href="/runtime-readonly-status-api-preview" style={{ color: '#22C55E' }}>/runtime-readonly-status-api-preview</a> (hidden direct, readonly, not in sidebar)
        <br />
        - P2 Runtime Dry-run Contract Preview: 18-item dry-run contract at <a href="/runtime-dry-run-contract-preview" style={{ color: '#22C55E' }}>/runtime-dry-run-contract-preview</a> (hidden direct, readonly, not in sidebar, contract only)
        <br />
        - P3 Runtime Audit Store Contract Preview: 16-item audit store contract at <a href="/runtime-audit-store-contract-preview" style={{ color: '#22C55E' }}>/runtime-audit-store-contract-preview</a> (hidden direct, readonly, not in sidebar, contract only)
        <br />
        - P4 Stage C Pre-Enable Human Review Pack: 18-area review pack at <a href="/stage-c-preenable-review-preview" style={{ color: '#22C55E' }}>/stage-c-preenable-review-preview</a> (hidden direct, readonly, not in sidebar, does NOT enable Stage C)
      </div>
    </PageShell>
  );
}
