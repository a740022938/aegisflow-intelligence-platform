import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import {
  AUDIT_LOG_PREVIEW_ITEMS,
  getAuditLogPreviewBySource,
  getAuditLogPreviewByRisk,
  getAuditLogPreviewSummary,
  type AuditLogPreviewItem,
  type AuditEventSource,
  type AuditEventRisk,
} from '../registry/audit-log-registry';
import {
  validateAuditLogPreview,
  getAuditLogValidationSummary,
} from '../registry/audit-log-validator';

const RISK_COLORS: Record<string, string> = {
  low: 'var(--success)',
  medium: 'var(--warning)',
  high: 'var(--danger)',
  critical: '#DC2626',
};

const RETENTION_LABELS: Record<string, string> = {
  ephemeral_preview: '临时预览',
  report_only: '仅报告',
  future_db_audit: '未来 DB 审计',
  blocked_no_write: '阻断不写',
};

const RETENTION_COLORS: Record<string, string> = {
  ephemeral_preview: 'var(--success)',
  report_only: '#3B82F6',
  future_db_audit: '#8B5CF6',
  blocked_no_write: 'var(--danger)',
};

const SOURCE_LABELS: Record<string, string> = {
  runtime_registry: '运行时注册表',
  dry_run_plan: 'Dry-run 计划',
  permission_evaluator: '权限评估器',
  connector_center: '连接器中心',
  advanced_hub: '高级枢纽',
  governance_center: '治理中心',
  git: 'Git',
  database: '数据库',
  external_tool: '外部工具',
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

function AuditCard({ item }: { item: AuditLogPreviewItem }) {
  const isBlocked = !item.allowedNow;
  const isHigh = item.risk === 'high' || item.risk === 'critical';
  return <div style={{ padding: 12, borderRadius: 8, background: 'var(--bg-surface)', border: `1px solid ${isHigh ? 'var(--danger)' : isBlocked ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`, borderLeft: `3px solid ${RISK_COLORS[item.risk]}`, fontSize: 11, marginBottom: 8 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{item.label}</span>
      <Badge label={item.risk} color={RISK_COLORS[item.risk]} />
      <Badge label={RETENTION_LABELS[item.retentionClass] || item.retentionClass} color={RETENTION_COLORS[item.retentionClass] || '#6B7280'} />
      <Badge label={item.eventType} color="#6B7280" />
      {item.allowedNow ? <Badge label="allowedNow" color="var(--success)" /> : <Badge label="blocked" color="var(--danger)" />}
      {item.requiresHumanApproval && <Badge label="需人工批准" color="var(--warning)" />}
      {item.requiresDbWrite && <Badge label="需 DB 写" color="#8B5CF6" />}
      {item.requiresExternalControl && <Badge label="需外部控制" color="var(--danger)" />}
      {item.requiresStageC && <Badge label="需 Stage C" color="var(--danger)" />}
    </div>
    {item.previewPayloadFields.length > 0 && <div style={{ marginBottom: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--text-muted)' }}>载荷字段: </span>
      {item.previewPayloadFields.map((s, i) => <Badge key={i} label={s} color="#3B82F6" />)}
    </div>}
    {item.redactedFields.length > 0 && <div style={{ marginBottom: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--text-muted)' }}>已编辑字段: </span>
      {item.redactedFields.map((s, i) => <Badge key={i} label={s} color="var(--warning)" />)}
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

export default function AuditLogPreview() {
  const summary = useMemo(() => getAuditLogPreviewSummary(), []);
  const validationSummary = useMemo(() => getAuditLogValidationSummary(), []);
  const validationResult = useMemo(() => validateAuditLogPreview(), []);
  const highCriticalItems = useMemo(() => getAuditLogPreviewByRisk('high').concat(getAuditLogPreviewByRisk('critical')), []);
  const blockedItems = useMemo(() => AUDIT_LOG_PREVIEW_ITEMS.filter(p => !p.allowedNow), []);
  const allowedItems = useMemo(() => AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.allowedNow), []);

  const retentionSummary = useMemo(() => {
    const ret = { ephemeral_preview: 0, report_only: 0, future_db_audit: 0, blocked_no_write: 0 } as Record<string, number>;
    for (const item of AUDIT_LOG_PREVIEW_ITEMS) {
      ret[item.retentionClass] = (ret[item.retentionClass] || 0) + 1;
    }
    return ret;
  }, []);

  return (
    <PageShell
      title="审计日志预览"
      subtitle="只读查看未来运行时、dry-run、权限评估和阻断动作的审计事件模型。"
      safetyBoundary="readonly"
      safetyText="只读预览 · 不写审计库 · 不写数据库 · 不控制外部工具 · 不启用 Stage C"
    >
      {/* A. Audit Overview Dashboard */}
      <SectionCard title="审计概述面板" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 10 }}>
          <KpiCard label="总事件" value={String(summary.total)} color="#8B5CF6" />
          <KpiCard label="当前允许" value={String(summary.allowedNow)} color="var(--success)" />
          <KpiCard label="writeNow" value={String(summary.writeNow)} color="var(--danger)" />
          <KpiCard label="已阻断" value={String(summary.blocked)} color="var(--danger)" />
          <KpiCard label="高/严重风险" value={String(summary.highOrCritical)} color="#DC2626" />
          <KpiCard label="需 DB 写" value={String(summary.requiresDbWrite)} color="#8B5CF6" />
          <KpiCard label="需外部控制" value={String(summary.requiresExternalControl)} color="var(--danger)" />
          <KpiCard label="需 Stage C" value={String(summary.requiresStageC)} color="var(--danger)" />
          <KpiCard label="需人工批准" value={String(summary.requiresHumanApproval)} color="var(--warning)" />
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.entries(retentionSummary).map(([ret, count]) =>
            count > 0 && <Badge key={ret} label={`${RETENTION_LABELS[ret] || ret}: ${count}`} color={RETENTION_COLORS[ret] || '#6B7280'} />
          )}
        </div>
      </SectionCard>

      {/* B. Event Source Matrix */}
      <SectionCard title="事件来源矩阵" style={{ marginBottom: 16 }}>
        {(['runtime_registry', 'dry_run_plan', 'permission_evaluator', 'connector_center', 'advanced_hub', 'governance_center', 'git', 'database', 'external_tool', 'stage_c'] as const).map(source => {
          const items = getAuditLogPreviewBySource(source);
          if (items.length === 0) return null;
          return <div key={source} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, borderBottom: '1px solid var(--border)', paddingBottom: 2 }}>
              {SOURCE_LABELS[source] || source} ({items.length})
            </div>
            {items.map(item => <AuditCard key={item.id} item={item} />)}
          </div>;
        })}
      </SectionCard>

      {/* C. Event Type Board */}
      <SectionCard title="事件类型面板" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, fontSize: 10 }}>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--success)' }}>查看 ({AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.eventType === 'view').length})</div>
            <div style={{ color: 'var(--text-muted)' }}>低风险只读操作，无需审计日志。</div>
          </div>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: '#3B82F6' }}>计划生成 ({AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.eventType === 'plan_generated').length})</div>
            <div style={{ color: 'var(--text-muted)' }}>未来需要 DB 写入的审计事件。</div>
          </div>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--warning)' }}>需批准 ({AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.eventType === 'human_approval_required').length})</div>
            <div style={{ color: 'var(--text-muted)' }}>高风险操作需要人工批准。</div>
          </div>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--danger)' }}>阻断 ({AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.eventType === 'blocked_action').length})</div>
            <div style={{ color: 'var(--text-muted)' }}>被安全边界拦截的危险操作。</div>
          </div>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: '#DC2626' }}>Stage C 转态 ({AUDIT_LOG_PREVIEW_ITEMS.filter(p => p.eventType === 'stage_c_transition_attempt').length})</div>
            <div style={{ color: 'var(--text-muted)' }}>Stage C 已永久禁用。</div>
          </div>
        </div>
      </SectionCard>

      {/* D. Risk / Retention Board */}
      <SectionCard title="风险与保留面板" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, fontSize: 10 }}>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--success)' }}>低风险 ({getAuditLogPreviewByRisk('low').length})</div>
            <div style={{ color: 'var(--text-muted)' }}>低风险事件，临时预览即可。</div>
          </div>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--warning)' }}>中风险 ({getAuditLogPreviewByRisk('medium').length})</div>
            <div style={{ color: 'var(--text-muted)' }}>中风险事件，未来需要审计追踪。</div>
          </div>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--danger)' }}>高风险 ({getAuditLogPreviewByRisk('high').length})</div>
            <div style={{ color: 'var(--text-muted)' }}>高风险事件，已阻断且必须有门禁和禁止操作。</div>
          </div>
          <div style={{ padding: 8, borderRadius: 6, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: '#DC2626' }}>严重 ({getAuditLogPreviewByRisk('critical').length})</div>
            <div style={{ color: 'var(--text-muted)' }}>严重风险事件，永远禁止。不写审计日志。</div>
          </div>
        </div>
      </SectionCard>

      {/* E. Traceability Board */}
      <SectionCard title="可追溯性面板" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <p><strong>当前可追溯能力：</strong>只读预览。无审计日志写入，无数据库存储，无外部系统对接。</p>
          <p><strong>关联事件：</strong>所有事件均为静态注册表模型。关联关系通过 <code>relatedRuntimeTarget</code>、<code>relatedDryRunPlan</code>、<code>relatedPermissionRule</code> 字段表达。</p>
          <p><strong>未来审计需求：</strong>{summary.requiresDbWrite} 个事件需要数据库写入才能实现完整审计。</p>
          <p><strong>已阻断事件：</strong>{blockedItems.length} 个事件被安全边界拦截，{highCriticalItems.length} 个高/严重风险事件已正确标记。</p>
          <p><strong>writeNow 数量：</strong>{summary.writeNow} — 当前没有事件标记为 writeNow（应为 0）。</p>
        </div>
      </SectionCard>

      {/* F. Audit Preview Cards */}
      <SectionCard title="审计事件卡片" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8, fontSize: 11, color: 'var(--text-muted)' }}>
          当前允许事件 ({allowedItems.length}):
        </div>
        {allowedItems.map(item => <AuditCard key={item.id} item={item} />)}
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
          已阻断事件 ({blockedItems.length}):
        </div>
        {blockedItems.slice(0, 5).map(item => <AuditCard key={item.id} item={item} />)}
        {blockedItems.length > 5 && <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', padding: 4 }}>
          ... 及其他 {blockedItems.length - 5} 个阻断事件（共 {blockedItems.length} 个）
        </div>}
      </SectionCard>

      {/* G. Validator Summary */}
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

      {/* H. Forbidden Audit Notice */}
      <SectionCard title="当前阶段禁止事项" style={{ marginBottom: 16, border: '1px solid var(--danger)' }}>
        <div style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <p><strong>无审计日志写入：</strong>当前不写入任何审计日志。Audit Log Preview 仅为静态模型预览。</p>
          <p><strong>不写入数据库：</strong>所有数据为静态注册表数据，不进行任何数据库写入。</p>
          <p><strong>不控制外部工具：</strong>无权控制 OpenClaw / ComfyUI / OpenAxiom / HuggingFace / Hermes / CC Switch / Claude Proxy。</p>
          <p><strong>不调用外部 API：</strong>不调用任何外部系统 API。</p>
          <p><strong>不启用 Stage C：</strong>Stage C 永久禁用。</p>
          <p><strong>不创建标签/发布：</strong>不创建 Git 标签或 GitHub Release。</p>
        </div>
      </SectionCard>

      {/* I. Related Links */}
      <SectionCard title="关联页面" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/dry-run-plan-preview" style={{ fontSize: 11, color: '#3B82F6', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.3)' }}>
            打开 Dry-run 计划预览
          </Link>
          <Link to="/runtime-registry-preview" style={{ fontSize: 11, color: '#8B5CF6', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.3)' }}>
            打开 Runtime Registry 预览
          </Link>
          <Link to="/permission-evaluator-preview" style={{ fontSize: 11, color: '#8B5CF6', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.3)' }}>
            打开 Permission Evaluator 预览
          </Link>
          <Link to="/governance-state-machine-preview" style={{ fontSize: 11, color: '#8B5CF6', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.3)' }}>
            打开治理状态机预览
          </Link>
          <Link to="/human-approval-workflow-preview" style={{ fontSize: 11, color: '#EC4899', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(236,72,153,0.3)' }}>
            打开人工审批流程预览
          </Link>
          <Link to="/evidence-schema-preview" style={{ fontSize: 11, color: '#22C55E', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.3)' }}>
            打开证据模型预览
          </Link>
        </div>
      </SectionCard>
    </PageShell>
  );
}
