import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import {
  HUMAN_APPROVAL_WORKFLOW_ITEMS,
  getHumanApprovalWorkflowSummary,
  getHumanApprovalItemsByRisk,
  getHumanApprovalItemsByState,
  getHumanApprovalItemsByRequestKind,
  getHumanApprovalBlockedItems,
} from '../registry/human-approval-registry';
import { validateHumanApprovalWorkflow, getHumanApprovalValidationSummary } from '../registry/human-approval-validator';

function Badge({ label, color }: { label: string; color?: string }) {
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{label}</span>;
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
    <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
  </div>;
}

const STATE_LABELS: Record<string, string> = {
  draft: 'Draft',
  preview_only: 'Preview Only',
  pending_human_review: 'Pending Review',
  approved_for_preview: 'Approved (Preview)',
  approved_for_dry_run: 'Approved (Dry-Run)',
  approved_for_execution: 'Approved (Execution)',
  rejected: 'Rejected',
  expired: 'Expired',
  revoked: 'Revoked',
  blocked: 'Blocked',
};

const KIND_LABELS: Record<string, string> = {
  runtime_preview: 'Runtime Preview',
  dry_run_preview: 'Dry-Run Preview',
  audit_preview: 'Audit Preview',
  permission_review: 'Permission Review',
  governance_transition: 'Governance Transition',
  candidate_review: 'Candidate Review',
  external_control: 'External Control',
  db_write: 'DB Write',
  stage_c_transition: 'Stage C Transition',
  tag_release: 'Tag/Release',
};

const DECISION_LABELS: Record<string, string> = {
  view_only: 'View Only',
  request_review: 'Request Review',
  approve_preview: 'Approve Preview',
  approve_dry_run: 'Approve Dry-Run',
  approve_execution: 'Approve Execution',
  reject: 'Reject',
  expire: 'Expire',
  revoke: 'Revoke',
  block: 'Block',
};

const DECISION_COLORS: Record<string, string> = {
  view_only: '#6B7280',
  request_review: '#3B82F6',
  approve_preview: '#22C55E',
  approve_dry_run: '#F97316',
  approve_execution: '#DC2626',
  reject: '#DC2626',
  expire: '#EC4899',
  revoke: '#EC4899',
  block: '#DC2626',
};

const RISK_COLORS: Record<string, string> = {
  low: '#22C55E',
  medium: '#F97316',
  high: '#DC2626',
  critical: '#7C3AED',
};

const HumanApprovalWorkflowPreview: React.FC = () => {
  const summary = useMemo(() => getHumanApprovalWorkflowSummary(), []);
  const validationResult = useMemo(() => validateHumanApprovalWorkflow(), []);
  const validationSummary = useMemo(() => getHumanApprovalValidationSummary(), []);
  const blockedItems = useMemo(() => getHumanApprovalBlockedItems(), []);
  const criticalItems = useMemo(() => getHumanApprovalItemsByRisk('critical'), []);

  return (
    <PageShell
      title="人工审批流程预览"
      subtitle="只读查看未来审批请求、审批状态、证据、回滚和阻断条件。"
      safetyBoundary="readonly"
      safetyText="只读预览 · 不创建审批队列 · 不处理 candidate · 不写数据库 · 不启用 Stage C"
    >
      {/* A. Human Approval Overview Dashboard */}
      <SectionCard title="A. 审批流程概览" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8, marginBottom: 12 }}>
          <KpiCard label="总项目" value={String(summary.total)} color="var(--primary)" />
          <KpiCard label="当前允许" value={String(summary.allowedNow)} color="var(--success)" />
          <KpiCard label="已阻断" value={String(summary.blocked)} color="var(--danger)" />
          <KpiCard label="严重风险" value={String(summary.critical)} color="#7C3AED" />
          <KpiCard label="需 Stage C" value={String(summary.requiresStageC)} color="#F97316" />
          <KpiCard label="写 DB" value={String(summary.writesDb)} color="#EC4899" />
          <KpiCard label="控制外部工具" value={String(summary.controlsExternalTool)} color="#DC2626" />
          <KpiCard label="处理 Candidate" value={String(summary.processesCandidate)} color="#DC2626" />
          <KpiCard label="创建队列" value={String(summary.createsQueueItem)} color="#F97316" />
          <KpiCard label="执行动作" value={String(summary.executesAction)} color="#DC2626" />
        </div>
      </SectionCard>

      {/* B. Approval State Board */}
      <SectionCard title="B. 审批状态面板" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
          {(['draft', 'preview_only', 'pending_human_review', 'approved_for_preview', 'approved_for_dry_run', 'approved_for_execution', 'rejected', 'expired', 'revoked', 'blocked'] as const).map(state => {
            const items = getHumanApprovalItemsByState(state);
            return (
              <div key={state} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{STATE_LABELS[state]}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{items.length} items</div>
                <div style={{ fontSize: 9, color: items.length > 0 && items.some(i => i.allowedNow) ? 'var(--success)' : 'var(--danger)' }}>
                  {items.filter(i => i.allowedNow).length} allowed now
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* C. Request Kind Matrix */}
      <SectionCard title="C. 请求类型矩阵" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
          {(['runtime_preview', 'dry_run_preview', 'audit_preview', 'permission_review', 'governance_transition', 'candidate_review', 'external_control', 'db_write', 'stage_c_transition', 'tag_release'] as const).map(kind => {
            const items = getHumanApprovalItemsByRequestKind(kind);
            return (
              <div key={kind} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{KIND_LABELS[kind]}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{items.length} items</div>
                <div style={{ fontSize: 9, color: items.filter(i => i.allowedNow).length > 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {items.filter(i => i.allowedNow).length} allowed now
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* D. Decision Board */}
      <SectionCard title="D. 决策面板" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {(['view_only', 'request_review', 'approve_preview', 'approve_dry_run', 'approve_execution', 'reject', 'expire', 'revoke', 'block'] as const).map(decision => {
            const items = HUMAN_APPROVAL_WORKFLOW_ITEMS.filter(i => i.decision === decision);
            const color = DECISION_COLORS[decision];
            return (
              <div key={decision} style={{ background: 'var(--bg-surface)', border: `1px solid ${color}33`, borderRadius: 8, padding: 10 }}>
                <Badge label={DECISION_LABELS[decision]} color={color} />
                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>{items.length} items</div>
                <div style={{ fontSize: 9, color: items.filter(i => i.allowedNow).length > 0 ? 'var(--success)' : 'var(--danger)' }}>
                  {items.filter(i => i.allowedNow).length} allowed now
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* E. Evidence & Rollback Board */}
      <SectionCard title="E. 证据与回滚面板" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          {HUMAN_APPROVAL_WORKFLOW_ITEMS.filter(i => i.requiresEvidence).length} items require evidence, {HUMAN_APPROVAL_WORKFLOW_ITEMS.filter(i => i.requiresRollbackPlan).length} require rollback plan, {HUMAN_APPROVAL_WORKFLOW_ITEMS.filter(i => i.requiresAuditLog).length} require audit log.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
          {HUMAN_APPROVAL_WORKFLOW_ITEMS.filter(i => i.requiresEvidence).slice(0, 10).map(item => (
            <div key={item.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>
                Evidence: {item.requiredEvidence.join(', ') || '—'}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>
                Rollback: {item.requiresRollbackPlan ? 'Required' : 'Not Required'}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                Audit: {item.requiresAuditLog ? 'Required' : 'Not Required'}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* F. Blocked Approval Board */}
      <SectionCard title="F. 阻断审批面板" style={{ marginBottom: 16, border: '1px solid rgba(220,38,38,0.3)' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          {blockedItems.length} items are blocked in the current version. All execution, DB write, external control, candidate processing, queue creation, and Stage C transitions are blocked.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 8 }}>
          {criticalItems.map(item => (
            <div key={item.id} style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 8, padding: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600 }}>{item.label}</span>
                <Badge label={item.risk} color={RISK_COLORS[item.risk]} />
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>
                Kind: {KIND_LABELS[item.requestKind]} | State: {STATE_LABELS[item.currentState]}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>
                Gates: {item.gates.join(', ')}
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {item.reason}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* G. Validator Summary */}
      <SectionCard title="G. 校验摘要" style={{ marginBottom: 16 }}>
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
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#F59E0B', marginBottom: 4 }}>Warning Items:</div>
            {validationResult.warning.map((msg, i) => (
              <div key={i} style={{ fontSize: 9, color: '#F59E0B', padding: '2px 0' }}>• {msg}</div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* H. Forbidden Approval Notice */}
      <SectionCard title="H. 当前阶段禁止事项" style={{ marginBottom: 16, border: '1px solid var(--danger)' }}>
        <div style={{ fontSize: 11, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <p><strong>不创建审批队列：</strong>当前不创建任何审批队列。Human Approval Workflow Preview 仅为只读模型预览。</p>
          <p><strong>不处理 Candidate：</strong>无权 approve / reject / archive 任何 candidate。</p>
          <p><strong>不写数据库：</strong>所有数据为静态注册表数据，不进行任何数据库写入。</p>
          <p><strong>不控制外部工具：</strong>无权控制 OpenClaw / ComfyUI / OpenAxiom / HuggingFace / Hermes / CC Switch / Claude Proxy。</p>
          <p><strong>不调用外部 API：</strong>不调用任何外部系统 API。</p>
          <p><strong>不启用 Stage C：</strong>Stage C 永久禁用。</p>
          <p><strong>不创建标签/发布：</strong>不创建 Git 标签或 GitHub Release。</p>
        </div>
      </SectionCard>

      {/* I. Related Links */}
      <SectionCard title="关联页面" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/governance-state-machine-preview" style={{ fontSize: 11, color: '#8B5CF6', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.3)' }}>
            打开治理状态机预览
          </Link>
          <Link to="/runtime-registry-preview" style={{ fontSize: 11, color: '#8B5CF6', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.3)' }}>
            打开 Runtime Registry 预览
          </Link>
          <Link to="/dry-run-plan-preview" style={{ fontSize: 11, color: '#8B5CF6', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.3)' }}>
            打开 Dry-run 计划预览
          </Link>
          <Link to="/audit-log-preview" style={{ fontSize: 11, color: '#8B5CF6', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(139,92,246,0.3)' }}>
            打开审计日志预览
          </Link>
          <Link to="/evidence-schema-preview" style={{ fontSize: 11, color: '#22C55E', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.3)' }}>
            打开证据模型预览
          </Link>
          <Link to="/rollback-preview" style={{ fontSize: 11, color: '#F97316', textDecoration: 'none', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(249,115,22,0.3)' }}>
            打开回滚预览
          </Link>
        </div>
      </SectionCard>
    </PageShell>
  );
};

export default HumanApprovalWorkflowPreview;
