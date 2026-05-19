import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import {
  getEvidenceSchemaItems,
  getEvidenceSchemaSummary,
  getEvidenceItemsByType,
  getEvidenceItemsBySource,
  getEvidenceItemsBySensitivity,
  getEvidenceItemsByRetention,
  getBlockedEvidenceItems,
  getRedactionRequiredEvidenceItems,
} from '../registry/evidence-schema-registry';
import {
  validateEvidenceSchema,
  getEvidenceSchemaValidationSummary,
} from '../registry/evidence-schema-validator';
import type { EvidenceType, EvidenceSource, EvidenceSensitivity, EvidenceRetention } from '../registry/evidence-schema-registry';

function Badge({ label, color }: { label: string; color?: string }) {
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, color: '#fff', background: color || '#6B7280', lineHeight: '16px', whiteSpace: 'nowrap' }}>{label}</span>;
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
    <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
  </div>;
}

const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  registry_snapshot: 'Registry Snapshot',
  validator_summary: 'Validator Summary',
  dry_run_plan: 'Dry-Run Plan',
  audit_preview: 'Audit Preview',
  approval_request: 'Approval Request',
  human_note: 'Human Note',
  report_path: 'Report Path',
  git_commit: 'Git Commit',
  screenshot: 'Screenshot',
  validation_output: 'Validation Output',
  rollback_plan: 'Rollback Plan',
  stage_gate_state: 'Stage Gate State',
};

const EVIDENCE_SOURCE_LABELS: Record<EvidenceSource, string> = {
  runtime_registry: 'Runtime Registry',
  dry_run_plan: 'Dry-Run Plan',
  audit_log: 'Audit Log',
  human_approval: 'Human Approval',
  governance_state: 'Governance State',
  permission_evaluator: 'Permission Evaluator',
  connector_center: 'Connector Center',
  validation_gate: 'Validation Gate',
  git: 'Git',
  human_operator: 'Human Operator',
};

const SENSITIVITY_COLORS: Record<EvidenceSensitivity, string> = {
  public_metadata: '#22C55E',
  internal_status: '#3B82F6',
  redacted_sensitive: '#F59E0B',
  forbidden_secret: '#DC2626',
};

const RETENTION_COLORS: Record<EvidenceRetention, string> = {
  preview_only: '#3B82F6',
  report_reference: '#22C55E',
  future_audit_store: '#8B5CF6',
  forbidden_no_store: '#DC2626',
};

const RISK_COLORS: Record<string, string> = {
  low: '#22C55E',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#DC2626',
};

const ForbiddenEvidenceNotice: React.FC = () => (
  <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '12px 16px', marginTop: 16 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>证据红线</div>
    <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
      本页面为只读证据模型预览。当前不采集证据，不写 evidence store，不保存 token/API key/password/private key，
      不写数据库，不调用后端，不启用 Stage C。所有 forbidden_secret 项 hard-blocked 且 writeNow=false。
    </div>
  </div>
);

const EvidenceSchemaPreview: React.FC = () => {
  const items = useMemo(() => getEvidenceSchemaItems(), []);
  const summary = useMemo(() => getEvidenceSchemaSummary(), []);
  const validationResult = useMemo(() => validateEvidenceSchema(), []);
  const validationSummary = useMemo(() => getEvidenceSchemaValidationSummary(), []);
  const blockedItems = useMemo(() => getBlockedEvidenceItems(), []);
  const redactionItems = useMemo(() => getRedactionRequiredEvidenceItems(), []);

  return (
    <PageShell
      title="证据模型预览"
      subtitle="只读查看未来审批、运行时、dry-run、审计和治理流程的证据结构、脱敏策略与门禁条件。"
      safetyBoundary="readonly"
      safetyText="只读预览 · 不采集证据 · 不保存 secret · 不写数据库 · 不启用 Stage C"
    >
      {/* A. Evidence Overview Dashboard */}
      <SectionCard title="概览面板">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <KpiCard label="总项" value={String(summary.total)} color="var(--primary)" />
          <KpiCard label="可查看" value={String(summary.allowedNow)} color="var(--success)" />
          <KpiCard label="可采集" value={String(summary.captureNow)} color={summary.captureNow > 0 ? '#F59E0B' : 'var(--success)'} />
          <KpiCard label="可写入" value={String(summary.writeNow)} color={summary.writeNow > 0 ? '#DC2626' : 'var(--success)'} />
          <KpiCard label="需脱敏" value={String(summary.requiresRedaction)} color="#F59E0B" />
          <KpiCard label="需人工审核" value={String(summary.requiresHumanReview)} color="#8B5CF6" />
          <KpiCard label="需 Stage C" value={String(summary.requiresStageC)} color={summary.requiresStageC > 0 ? '#DC2626' : 'var(--success)'} />
          <KpiCard label="需 DB 写" value={String(summary.requiresDbWrite)} color={summary.requiresDbWrite > 0 ? '#DC2626' : 'var(--success)'} />
          <KpiCard label="禁止 Secret" value={String(summary.forbiddenSecrets)} color="#DC2626" />
          <KpiCard label="高/严重风险" value={String(summary.highOrCritical)} color="#F97316" />
        </div>
      </SectionCard>

      {/* B. Evidence Type Board */}
      <SectionCard title="证据类型面板">
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          按证据类型分类展示各项证据模型。
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>证据类型</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>数量</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>可查看</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>需脱敏</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(EVIDENCE_TYPE_LABELS) as EvidenceType[]).map(type => {
              const typeItems = getEvidenceItemsByType(type);
              if (typeItems.length === 0) return null;
              return (
                <tr key={type} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '6px 8px' }}><Badge label={EVIDENCE_TYPE_LABELS[type]} color="var(--primary)" /></td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{typeItems.length}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{typeItems.filter(i => i.allowedNow).length}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{typeItems.filter(i => i.requiresRedaction).length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionCard>

      {/* C. Evidence Source Matrix */}
      <SectionCard title="来源矩阵">
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          按来源域展示各项证据模型。
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>来源</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>数量</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>可查看</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>需脱敏</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>关联</th>
            </tr>
          </thead>
          <tbody>
            {(Object.keys(EVIDENCE_SOURCE_LABELS) as EvidenceSource[]).map(source => {
              const sourceItems = getEvidenceItemsBySource(source);
              if (sourceItems.length === 0) return null;
              return (
                <tr key={source} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '6px 8px' }}><Badge label={EVIDENCE_SOURCE_LABELS[source]} color="var(--primary)" /></td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{sourceItems.length}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{sourceItems.filter(i => i.allowedNow).length}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{sourceItems.filter(i => i.requiresRedaction).length}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    {sourceItems.filter(i => i.relatedApprovalItem || i.relatedGovernanceTransition || i.relatedAuditItem || i.relatedRollbackItem).length}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionCard>

      {/* D. Sensitivity & Retention Board */}
      <SectionCard title="敏感度与保留策略面板">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 45%', minWidth: 200 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>敏感度分布</div>
            {(Object.keys(SENSITIVITY_COLORS) as EvidenceSensitivity[]).map(s => {
              const count = getEvidenceItemsBySensitivity(s).length;
              return (
                <div key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 11, borderBottom: '1px solid var(--border)' }}>
                  <span><Badge label={s} color={SENSITIVITY_COLORS[s]} /></span>
                  <span style={{ fontWeight: 600 }}>{count} 项</span>
                </div>
              );
            })}
          </div>
          <div style={{ flex: '1 1 45%', minWidth: 200 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>保留策略分布</div>
            {(Object.keys(RETENTION_COLORS) as EvidenceRetention[]).map(r => {
              const count = getEvidenceItemsByRetention(r).length;
              return (
                <div key={r} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 11, borderBottom: '1px solid var(--border)' }}>
                  <span><Badge label={r} color={RETENTION_COLORS[r]} /></span>
                  <span style={{ fontWeight: 600 }}>{count} 项</span>
                </div>
              );
            })}
          </div>
        </div>
      </SectionCard>

      {/* E. Redaction Policy Board */}
      <SectionCard title="脱敏策略面板">
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          列出所有需要脱敏的证据项及其脱敏规则。共有 {redactionItems.length} 项需要脱敏。
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>允许字段</th>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>禁止字段</th>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>脱敏规则</th>
            </tr>
          </thead>
          <tbody>
            {redactionItems.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '6px 8px', fontWeight: 600 }}>{item.id}</td>
                <td style={{ padding: '6px 8px' }}>{item.allowedFields.join(', ') || '—'}</td>
                <td style={{ padding: '6px 8px' }}>{item.forbiddenFields.join(', ') || '—'}</td>
                <td style={{ padding: '6px 8px' }}>
                  {item.redactionRules.map((r, i) => <div key={i}>• {r}</div>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* F. Attestation Board */}
      <SectionCard title="证明与关联面板">
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          展示 attestation field 及跨系统关联（审批/治理/审计/回滚）。
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>证明字段</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>关联审批</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>关联治理</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>关联审计</th>
              <th style={{ padding: '6px 8px', textAlign: 'center' }}>关联回滚</th>
            </tr>
          </thead>
          <tbody>
            {items.filter(i => i.attestationFields.length > 0).map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '6px 8px', fontWeight: 600 }}>{item.id}</td>
                <td style={{ padding: '6px 8px' }}>{item.attestationFields.join(', ')}</td>
                <td style={{ padding: '6px 8px', textAlign: 'center' }}>{item.relatedApprovalItem ? <Badge label={item.relatedApprovalItem} color="#8B5CF6" /> : '—'}</td>
                <td style={{ padding: '6px 8px', textAlign: 'center' }}>{item.relatedGovernanceTransition ? <Badge label={item.relatedGovernanceTransition} color="#F97316" /> : '—'}</td>
                <td style={{ padding: '6px 8px', textAlign: 'center' }}>{item.relatedAuditItem ? <Badge label={item.relatedAuditItem} color="#3B82F6" /> : '—'}</td>
                <td style={{ padding: '6px 8px', textAlign: 'center' }}>{item.relatedRollbackItem ? <Badge label={item.relatedRollbackItem} color="#22C55E" /> : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* G. Blocked Evidence Board */}
      <SectionCard title="阻断证据面板">
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          以下证据项因含有 Secret/API Key/Password 等禁止内容而被 hard-blocked，allowedNow=false。
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>风险</th>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>敏感度</th>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>门禁</th>
              <th style={{ padding: '6px 8px', textAlign: 'left' }}>阻断动作</th>
            </tr>
          </thead>
          <tbody>
            {blockedItems.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '6px 8px', fontWeight: 600 }}>{item.id}</td>
                <td style={{ padding: '6px 8px' }}><Badge label={item.risk} color={RISK_COLORS[item.risk]} /></td>
                <td style={{ padding: '6px 8px' }}><Badge label={item.sensitivity} color={SENSITIVITY_COLORS[item.sensitivity]} /></td>
                <td style={{ padding: '6px 8px' }}>{item.gates.join(', ')}</td>
                <td style={{ padding: '6px 8px' }}>{item.blockedActions.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* H. Validator Summary */}
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

      {/* I. Forbidden Evidence Notice */}
      <SectionCard title="禁止证据红线">
        <ForbiddenEvidenceNotice />
        <div style={{ marginTop: 12, fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          以下证据类别在任何情况下均不得采集、存储或写入：
          <ul style={{ margin: '4px 0', paddingLeft: 16 }}>
            <li>Token/Secret 材料（token-secret-material-forbidden）</li>
            <li>API Key 材料（api-key-material-forbidden）</li>
            <li>Raw Password 材料（raw-password-material-forbidden）</li>
          </ul>
          这些项均为 sensitivity=forbidden_secret，retention=forbidden_no_store，allowedNow=false。
          Stage C 继续锁定。不写 DB。不写 evidence store。不调用后端。
        </div>
      </SectionCard>

      {/* Related Links */}
      <SectionCard title="相关页面">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 11 }}>
          <Link to="/human-approval-workflow-preview" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Human Approval Workflow Preview →</Link>
          <Link to="/governance-state-machine-preview" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Governance State Machine Preview →</Link>
          <Link to="/audit-log-preview" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Audit Log Preview →</Link>
          <Link to="/dry-run-plan-preview" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Dry-Run Plan Preview →</Link>
          <Link to="/runtime-registry-preview" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Runtime Registry Preview →</Link>
          <Link to="/permission-evaluator-preview" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Permission Evaluator Preview →</Link>
          <Link to="/advanced-mode-readonly" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Advanced Mode Readonly →</Link>
          <Link to="/connector-center-readonly" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Connector Center Readonly →</Link>
        </div>
      </SectionCard>
    </PageShell>
  );
};

export default EvidenceSchemaPreview;
