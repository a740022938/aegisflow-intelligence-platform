import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import {
  getRollbackRegistryItems,
  getRollbackRegistrySummary,
  getRollbackItemsByTarget,
  getRollbackItemsByType,
  getRollbackItemsByRisk,
  getRollbackBlockedItems,
  getIrreversibleRollbackItems,
  getRollbackExecutableItems,
} from '../registry/rollback-registry';
import {
  validateRollbackRegistry,
  getRollbackValidationSummary,
} from '../registry/rollback-validator';
import type { RollbackTarget, RollbackType, RollbackRisk } from '../registry/rollback-registry';

function Badge({ label, color }: { label: string; color?: string }) {
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{label}</span>;
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
    <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
  </div>;
}

const TARGET_LABELS: Record<RollbackTarget, string> = {
  runtime_registry: 'Runtime Registry',
  dry_run_plan: 'Dry-Run Plan',
  audit_log: 'Audit Log',
  human_approval: 'Human Approval',
  governance_state: 'Governance State',
  evidence_schema: 'Evidence Schema',
  permission_evaluator: 'Permission Evaluator',
  connector_center: 'Connector Center',
  git: 'Git',
  database: 'Database',
  external_tool: 'External Tool',
  stage_c: 'Stage C',
  local_file: 'Local File',
};

const TYPE_LABELS: Record<RollbackType, string> = {
  preview_only: 'Preview Only',
  idempotency_check: 'Idempotency Check',
  risk_assessment: 'Risk Assessment',
  manual_recovery_plan: 'Manual Recovery Plan',
  human_approved_rollback: 'Human Approved',
  blocked_irreversible: 'Blocked/Irreversible',
  future_stage_c: 'Future Stage C',
};

const RISK_COLORS: Record<RollbackRisk, string> = {
  low: '#22C55E',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#DC2626',
};

const READINESS_COLORS: Record<string, string> = {
  readonly_preview: '#3B82F6',
  design_only: '#8B5CF6',
  manual_review_required: '#F59E0B',
  blocked: '#DC2626',
  future: '#6B7280',
};

const ForbiddenRollbackNotice: React.FC = () => (
  <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '12px 16px', marginTop: 16 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>回滚红线</div>
    <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
      本页面为只读回滚风险评估预览。当前不执行 rollback，不恢复文件，不写 DB，不执行 Git reset/revert/tag/release，
      不控制外部工具，不启用 Stage C。所有 blocked_irreversible 和 future_stage_c 项 hard-blocked 且 allowedNow=false。
    </div>
  </div>
);

const RollbackPreview: React.FC = () => {
  const items = useMemo(() => getRollbackRegistryItems(), []);
  const summary = useMemo(() => getRollbackRegistrySummary(), []);
  const validationResult = useMemo(() => validateRollbackRegistry(), []);
  const validationSummary = useMemo(() => getRollbackValidationSummary(), []);
  const blockedItems = useMemo(() => getRollbackBlockedItems(), []);
  const irreversibleItems = useMemo(() => getIrreversibleRollbackItems(), []);
  const executableItems = useMemo(() => getRollbackExecutableItems(), []);

  return (
    <PageShell
      title="回滚预览"
      subtitle="只读查看未来运行时、审批、证据和审计链路的回滚风险、前置条件与阻断边界。"
      safetyBoundary="readonly"
      safetyText="只读预览 · 不执行回滚 · 不恢复文件 · 不写数据库 · 不控制外部工具 · 不启用 Stage C"
    >
      {/* A. Rollback Overview Dashboard */}
      <SectionCard title="概览面板">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <KpiCard label="总项" value={String(summary.total)} color="var(--primary)" />
          <KpiCard label="可查看" value={String(summary.allowedNow)} color="var(--success)" />
          <KpiCard label="已阻断" value={String(summary.blocked)} color={summary.blocked > 0 ? '#DC2626' : 'var(--success)'} />
          <KpiCard label="高/严重" value={String(summary.highOrCritical)} color="#F97316" />
          <KpiCard label="不可逆" value={String(summary.irreversible)} color="#DC2626" />
          <KpiCard label="可执行回滚" value={String(summary.executesRollback)} color={summary.executesRollback > 0 ? '#DC2626' : 'var(--success)'} />
          <KpiCard label="需人工审批" value={String(summary.requiresHumanApproval)} color="#8B5CF6" />
          <KpiCard label="需证据" value={String(summary.requiresEvidence)} color="#F59E0B" />
          <KpiCard label="需审计" value={String(summary.requiresAuditLog)} color="#3B82F6" />
          <KpiCard label="需 DB 写" value={String(summary.requiresDbWrite)} color={summary.requiresDbWrite > 0 ? '#DC2626' : 'var(--success)'} />
          <KpiCard label="需外部控制" value={String(summary.requiresExternalControl)} color={summary.requiresExternalControl > 0 ? '#DC2626' : 'var(--success)'} />
          <KpiCard label="需 Stage C" value={String(summary.requiresStageC)} color={summary.requiresStageC > 0 ? '#DC2626' : 'var(--success)'} />
          <KpiCard label="改文件" value={String(summary.modifiesFiles)} color={summary.modifiesFiles > 0 ? '#DC2626' : 'var(--success)'} />
          <KpiCard label="改 Git" value={String(summary.modifiesGit)} color={summary.modifiesGit > 0 ? '#DC2626' : 'var(--success)'} />
        </div>
      </SectionCard>

      {/* B. Rollback Target Board */}
      <SectionCard title="回滚目标面板">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>目标</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>数量</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>可查看</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>不可逆</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>已阻断</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(TARGET_LABELS) as RollbackTarget[]).map(target => {
              const targetItems = getRollbackItemsByTarget(target);
              if (targetItems.length === 0) return null;
              return (
                <tr key={target} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '6px 8px' }}><Badge label={TARGET_LABELS[target]} color="var(--primary)" /></td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{targetItems.length}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{targetItems.filter(i => i.allowedNow).length}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{targetItems.filter(i => i.irreversible).length}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{targetItems.filter(i => !i.allowedNow).length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionCard>

      {/* C. Rollback Type Matrix */}
      <SectionCard title="回滚类型矩阵">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>类型</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>数量</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>可查看</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>不可逆</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(TYPE_LABELS) as RollbackType[]).map(type => {
              const typeItems = getRollbackItemsByType(type);
              if (typeItems.length === 0) return null;
              return (
                <tr key={type} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '6px 8px' }}><Badge label={TYPE_LABELS[type]} color="var(--primary)" /></td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{typeItems.length}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{typeItems.filter(i => i.allowedNow).length}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{typeItems.filter(i => i.irreversible).length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionCard>

      {/* D. Idempotency Board */}
      <SectionCard title="幂等性检查面板">
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          列出需要幂等性 key 的项及其前置条件和故障模式。
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>需幂等 Key</th>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>前置条件</th>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>故障模式</th>
            </tr>
          </thead>
          <tbody>
            {items.filter(i => i.idempotencyKeyRequired).map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '6px 8px', fontWeight: 600 }}>{item.id}</td>
                <td style={{ padding: '6px 8px', textAlign: 'center' }}>{item.idempotencyKeyRequired ? 'Yes' : 'No'}</td>
                <td style={{ padding: '6px 8px' }}>{item.preconditions.join('; ')}</td>
                <td style={{ padding: '6px 8px' }}>{item.failureModes.join('; ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* E. Evidence & Audit Board */}
      <SectionCard title="证据与审计面板">
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          列出需要证据和审计的回滚项，及其回滚步骤预览。
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>需审计</th>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>所需证据</th>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>回滚步骤预览</th>
            </tr>
          </thead>
          <tbody>
            {items.filter(i => i.requiresEvidence || i.requiresAuditLog).map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '6px 8px', fontWeight: 600 }}>{item.id}</td>
                <td style={{ padding: '6px 8px', textAlign: 'center' }}>{item.requiresAuditLog ? 'Yes' : 'No'}</td>
                <td style={{ padding: '6px 8px' }}>{item.evidenceRequired.join(', ') || '—'}</td>
                <td style={{ padding: '6px 8px' }}>{item.rollbackStepsPreview.map((s, i) => <div key={i}>{s}</div>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* F. Blocked Rollback Board */}
      <SectionCard title="阻断回滚面板">
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          以下回滚项因不可逆/高危/需 Stage C/需 DB 写/控制外部工具/改 Git 而被阻断。共 {blockedItems.length} 项。
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>风险</th>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>准备度</th>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>门禁</th>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>阻断动作</th>
            </tr>
          </thead>
          <tbody>
            {blockedItems.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '6px 8px', fontWeight: 600 }}>{item.id}</td>
                <td style={{ padding: '6px 8px' }}><Badge label={item.risk} color={RISK_COLORS[item.risk]} /></td>
                <td style={{ padding: '6px 8px' }}><Badge label={item.readiness} color={READINESS_COLORS[item.readiness]} /></td>
                <td style={{ padding: '6px 8px' }}>{item.gates.join(', ')}</td>
                <td style={{ padding: '6px 8px' }}>{item.blockedActions.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* G. Validator Summary */}
      <SectionCard title="验证摘要">
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <KpiCard label="Blocking" value={String(validationSummary.blocking)} color={validationSummary.blocking > 0 ? '#DC2626' : 'var(--success)'} />
          <KpiCard label="Warning" value={String(validationSummary.warning)} color={validationSummary.warning > 0 ? '#F59E0B' : 'var(--success)'} />
          <KpiCard label="Info" value={String(validationSummary.info)} color="var(--primary)" />
          <KpiCard label="Pass" value={validationSummary.pass ? 'Yes' : 'No'} color={validationSummary.pass ? 'var(--success)' : '#DC2626'} />
        </div>
        {validationResult.blocking.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#DC2626', marginBottom: 4 }}>Blocking 项:</div>
            {validationResult.blocking.map((b, i) => <div key={i} style={{ fontSize: 10, color: '#DC2626', padding: '2px 0' }}>• {b}</div>)}
          </div>
        )}
        {validationResult.warning.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#F59E0B', marginBottom: 4 }}>Warning 项:</div>
            {validationResult.warning.map((w, i) => <div key={i} style={{ fontSize: 10, color: '#F59E0B', padding: '2px 0' }}>• {w}</div>)}
          </div>
        )}
        {validationResult.info.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Info 项:</div>
            {validationResult.info.map((inf, i) => <div key={i} style={{ fontSize: 10, color: 'var(--text-muted)', padding: '2px 0' }}>• {inf}</div>)}
          </div>
        )}
      </SectionCard>

      {/* H. Forbidden Rollback Notice */}
      <SectionCard title="禁止回滚红线">
        <ForbiddenRollbackNotice />
        <div style={{ marginTop: 12, fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          以下回滚类别在任何情况下均不得执行：
          <ul style={{ margin: '4px 0', paddingLeft: 16 }}>
            <li>Git Tag/Release 回滚（git-tag-release-rollback-blocked）</li>
            <li>DB 写回滚（db-write-rollback-blocked）</li>
            <li>外部工具控制回滚（external-tool-control-rollback-blocked）</li>
            <li>Stage C 转换回滚（stage-c-transition-rollback-blocked）</li>
            <li>本地文件覆盖回滚（local-file-overwrite-rollback-blocked）</li>
            <li>Secret 采集回滚（secret-capture-rollback-blocked）</li>
            <li>运行时执行回滚（runtime-execution-rollback-blocked）</li>
            <li>不可逆动作（irreversible-action-blocked）</li>
          </ul>
          以上均为 blocked_irreversible 类型，allowedNow=false。Stage C 继续锁定。不写 DB。不控制外部工具。
        </div>
      </SectionCard>

      {/* Related Links */}
      <SectionCard title="相关页面">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 11 }}>
          <Link to="/evidence-schema-preview" style={{ color: '#22C55E', textDecoration: 'none' }}>Evidence Schema Preview →</Link>
          <Link to="/human-approval-workflow-preview" style={{ color: '#EC4899', textDecoration: 'none' }}>Human Approval Workflow Preview →</Link>
          <Link to="/governance-state-machine-preview" style={{ color: '#8B5CF6', textDecoration: 'none' }}>Governance State Machine Preview →</Link>
          <Link to="/runtime-registry-preview" style={{ color: '#8B5CF6', textDecoration: 'none' }}>Runtime Registry Preview →</Link>
          <Link to="/dry-run-plan-preview" style={{ color: '#3B82F6', textDecoration: 'none' }}>Dry-Run Plan Preview →</Link>
          <Link to="/audit-log-preview" style={{ color: '#DC2626', textDecoration: 'none' }}>Audit Log Preview →</Link>
          <Link to="/permission-evaluator-preview" style={{ color: '#8B5CF6', textDecoration: 'none' }}>Permission Evaluator Preview →</Link>
          <Link to="/advanced-mode-readonly" style={{ color: '#F97316', textDecoration: 'none' }}>Advanced Mode Readonly →</Link>
          <Link to="/connector-center-readonly" style={{ color: '#22C55E', textDecoration: 'none' }}>Connector Center Readonly →</Link>
        </div>
      </SectionCard>

      {/* J. Governance Console Rollback Readiness */}
      <SectionCard title="治理控制台回滚准备度" style={{ marginBottom: 16, border: '1px solid rgba(139,92,246,0.3)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          - Governance Console: Rollback readiness is aggregated in Governance Console at{' '}
          <Link to="/governance-console-preview" style={{ color: '#8B5CF6', textDecoration: 'none' }}>/governance-console-preview</Link>
          {' '}(hidden direct, readonly, not in sidebar)
        </div>
      </SectionCard>
    </PageShell>
  );
};

export default RollbackPreview;
