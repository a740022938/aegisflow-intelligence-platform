import React from 'react';
import PageShell from '../components/ui/PageShell';
import {
  getGovernanceConsoleRiskItems,
  getGovernanceConsoleRiskSummary,
  getGovernanceConsoleCriticalRisks,
  getGovernanceConsoleBlockedRisks,
} from '../registry/governance-console-risk-registry';
import { getGovernanceConsoleRiskValidationSummary } from '../registry/governance-console-risk-validator';

const items = getGovernanceConsoleRiskItems();
const summary = getGovernanceConsoleRiskSummary();
const criticalRisks = getGovernanceConsoleCriticalRisks();
const blockedRisks = getGovernanceConsoleBlockedRisks();
const validation = getGovernanceConsoleRiskValidationSummary();

const severityColors: Record<string, string> = {
  low: '#22C55E', medium: '#F97316', high: '#EF4444', critical: '#DC2626',
};

const categoryLabels: Record<string, string> = {
  blocked_action: 'Blocked Action', stage_c_gate: 'Stage C Gate', db_write_gate: 'DB Write Gate',
  external_control_gate: 'External Control Gate', human_approval_gate: 'Human Approval Gate',
  evidence_required: 'Evidence Required', rollback_required: 'Rollback Required',
  sidebar_exposure: 'Sidebar Exposure', secret_handling: 'Secret Handling', execution_capability: 'Execution Capability',
};

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 16px', border: '1px solid var(--border-color)' }}>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#fff', background: severityColors[severity] || '#6B7280' }}>{severity}</span>;
}

const GovernanceConsoleRiskDashboardPreview: React.FC = () => {
  return (
    <PageShell
      title="治理总控台风险仪表盘预览"
      subtitle="只读聚合 Stage C、数据库写入、外部控制、审批、证据、回滚与执行能力风险。"
    >
      <div style={{ marginBottom: 16, padding: '8px 16px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: 8, border: '1px solid rgba(251, 191, 36, 0.3)', fontSize: 13, color: 'var(--text-secondary)' }}>
        只读预览 · 不执行 gate · 不改变 registry · 不写数据库 · 不启用 Stage C
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Risk Overview Dashboard</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
          <StatCard label="Total Risks" value={summary.total} color="var(--text-primary)" />
          <StatCard label="Blocked" value={summary.blocked} color="#EF4444" />
          <StatCard label="High/Critical" value={summary.highOrCritical} color="#EF4444" />
          <StatCard label="Requires Stage C" value={summary.requiresStageC} color="#EF4444" />
          <StatCard label="Requires DB Write" value={summary.requiresDbWrite} color="#EF4444" />
          <StatCard label="Requires Ext Control" value={summary.requiresExternalControl} color="#EF4444" />
          <StatCard label="Requires Human Approval" value={summary.requiresHumanApproval} color="#F97316" />
          <StatCard label="Requires Evidence" value={summary.requiresEvidence} color="#F97316" />
          <StatCard label="Requires Rollback" value={summary.requiresRollback} color="#F97316" />
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Risk Source Matrix</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Label</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Source</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Severity</th>
                <th style={{ textAlign: 'center', padding: '8px 12px' }}>Blocked</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>{item.id}</td>
                  <td style={{ padding: '8px 12px', fontWeight: 500 }}>{item.label}</td>
                  <td style={{ padding: '8px 12px', fontSize: 12 }}>{item.source}</td>
                  <td style={{ padding: '8px 12px', fontSize: 12 }}>{categoryLabels[item.category] || item.category}</td>
                  <td style={{ padding: '8px 12px' }}><SeverityBadge severity={item.severity} /></td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{item.blocked ? <span style={{ color: '#EF4444' }}>✗</span> : <span style={{ color: '#22C55E' }}>✓</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Risk Category Board</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
          {Object.entries(categoryLabels).map(([key, label]) => {
            const count = items.filter(i => i.category === key).length;
            return (
              <div key={key} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 16px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{count}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Severity Board</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
          {(['low', 'medium', 'high', 'critical'] as const).map(level => {
            const count = items.filter(i => i.severity === level).length;
            return (
              <div key={level} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 16px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: severityColors[level] }}>{count}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, textTransform: 'capitalize' }}>{level}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Blocked Risk Board</h3>
        {blockedRisks.length === 0 ? (
          <div style={{ padding: '8px 16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: 8, fontSize: 13, color: '#22C55E' }}>No blocked risks</div>
        ) : (
          blockedRisks.map(item => (
            <div key={item.id} style={{ marginBottom: 8, padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: 13 }}>
              <div style={{ fontWeight: 600, color: '#EF4444' }}>{item.label} <SeverityBadge severity={item.severity} /></div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{item.reason}</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>Next: {item.nextAction}</div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginBottom: 24, padding: 16, background: 'rgba(239, 68, 68, 0.05)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: '#EF4444' }}>Forbidden Risk Dashboard Notice</h3>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <div>✗ This risk dashboard does not execute any gate</div>
          <div>✗ This risk dashboard does not change any registry</div>
          <div>✗ This risk dashboard does not write to any database</div>
          <div>✗ This risk dashboard does not control external tools</div>
          <div>✗ Stage C is permanently disabled</div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Validator Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
          <StatCard label="Blocking" value={validation.blocking} color={validation.blocking > 0 ? '#EF4444' : '#22C55E'} />
          <StatCard label="Warning" value={validation.warning} color={validation.warning > 0 ? '#F97316' : '#22C55E'} />
          <StatCard label="Info" value={validation.info} color="#3B82F6" />
        </div>
        <div style={{ marginTop: 8, padding: '8px 16px', borderRadius: 8, fontSize: 13, background: validation.pass ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: validation.pass ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)', color: validation.pass ? '#22C55E' : '#EF4444' }}>
          {validation.pass ? '✓ All risk registry items pass validation' : `✗ ${validation.blocking} blocking issues found`}
        </div>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <a href="/governance-console-preview" style={{ padding: '8px 16px', background: 'var(--bg-secondary)', borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--accent)', textDecoration: 'none', fontSize: 13 }}>← Governance Console Aggregator</a>
        <a href="/governance-console-decision-panel-preview" style={{ padding: '8px 16px', background: 'var(--bg-secondary)', borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--accent)', textDecoration: 'none', fontSize: 13 }}>Decision Panel →</a>
        <a href="/governance-console-report-pack-preview" style={{ padding: '8px 16px', background: 'var(--bg-secondary)', borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--accent)', textDecoration: 'none', fontSize: 13 }}>Report Pack →</a>
      </div>
    </PageShell>
  );
};

export default GovernanceConsoleRiskDashboardPreview;
