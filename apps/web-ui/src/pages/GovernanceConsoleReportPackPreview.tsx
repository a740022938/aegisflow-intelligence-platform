import React from 'react';
import PageShell from '../components/ui/PageShell';
import {
  getGovernanceConsoleReportPackItems,
  getGovernanceConsoleReportPackSummary,
  getBlockedGovernanceConsoleReportItems,
} from '../registry/governance-console-report-pack-registry';
import { getGovernanceConsoleReportPackValidationSummary } from '../registry/governance-console-report-pack-validator';

const items = getGovernanceConsoleReportPackItems();
const summary = getGovernanceConsoleReportPackSummary();
const blockedReportItems = getBlockedGovernanceConsoleReportItems();
const validation = getGovernanceConsoleReportPackValidationSummary();

const sectionLabels: Record<string, string> = {
  executive_summary: 'Executive Summary', registry_chain: 'Registry Chain',
  risk_dashboard: 'Risk Dashboard', decision_panel: 'Decision Panel',
  evidence_trace: 'Evidence Trace', audit_trace: 'Audit Trace',
  rollback_readiness: 'Rollback Readiness', validation_results: 'Validation Results',
  sidebar_boundary: 'Sidebar Boundary', stage_c_readiness: 'Stage C Readiness',
  next_steps: 'Next Steps',
};

const statusColors: Record<string, string> = {
  preview_ready: '#22C55E', requires_review: '#F97316', blocked: '#EF4444', future_stage_c: '#6B7280',
};

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 16px', border: '1px solid var(--border-color)' }}>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

const GovernanceConsoleReportPackPreview: React.FC = () => {
  return (
    <PageShell
      title="治理总控台报告包预览"
      subtitle="只读查看未来 Governance Console 报告包的章节、字段、证据引用、风险摘要和验收边界。"
    >
      <div style={{ marginBottom: 16, padding: '8px 16px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: 8, border: '1px solid rgba(251, 191, 36, 0.3)', fontSize: 13, color: 'var(--text-secondary)' }}>
        只读预览 · 不生成真实报告文件 · 不写数据库 · 不包含 secret · 不启用 Stage C
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Report Pack Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
          <StatCard label="Total Sections" value={summary.total} color="var(--text-primary)" />
          <StatCard label="Preview Ready" value={summary.previewReady} color="#22C55E" />
          <StatCard label="Blocked" value={summary.blocked} color="#EF4444" />
          <StatCard label="Generates File" value={summary.generatesFile} color="#DC2626" />
          <StatCard label="Writes DB" value={summary.writesDb} color="#DC2626" />
          <StatCard label="Includes Secrets" value={summary.includesSecrets} color="#DC2626" />
          <StatCard label="Requires Redaction" value={summary.requiresRedaction} color="#F97316" />
          <StatCard label="Requires Human Review" value={summary.requiresHumanReview} color="#F97316" />
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Section Board</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Label</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Section</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '8px 12px' }}>Allowed</th>
                <th style={{ textAlign: 'center', padding: '8px 12px' }}>Secrets</th>
                <th style={{ textAlign: 'center', padding: '8px 12px' }}>Redaction</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>{item.id}</td>
                  <td style={{ padding: '8px 12px', fontWeight: 500 }}>{item.label}</td>
                  <td style={{ padding: '8px 12px', fontSize: 12 }}>{sectionLabels[item.section] || item.section}</td>
                  <td style={{ padding: '8px 12px' }}><span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#fff', background: statusColors[item.status] || '#6B7280' }}>{item.status}</span></td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{item.allowedNow ? <span style={{ color: '#22C55E' }}>✓</span> : <span style={{ color: '#EF4444' }}>✗</span>}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{item.includesSecrets ? <span style={{ color: '#EF4444' }}>✗</span> : <span style={{ color: '#22C55E' }}>—</span>}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{item.requiresRedaction ? <span style={{ color: '#F97316' }}>⚠</span> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Source Registry / Route / Docs Trace</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Source Registries</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Source Routes</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>{item.id}</td>
                  <td style={{ padding: '8px 12px', fontSize: 12 }}>{item.sourceRegistries.join(', ') || '—'}</td>
                  <td style={{ padding: '8px 12px' }}>
                    {item.sourceRoutes.map(r => <a key={r} href={r} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 12, marginRight: 4 }} target="_blank" rel="noreferrer">{r}</a>)}
                    {item.sourceRoutes.length === 0 && '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Forbidden Fields / Redaction Board</h3>
        {items.filter(i => i.forbiddenFields.length > 0 || i.requiresRedaction).map(item => (
          <div key={item.id} style={{ marginBottom: 8, padding: '8px 12px', background: 'rgba(249, 115, 22, 0.1)', borderRadius: 8, border: '1px solid rgba(249, 115, 22, 0.3)', fontSize: 13 }}>
            <div style={{ fontWeight: 600, color: '#F97316' }}>{item.label}</div>
            {item.forbiddenFields.length > 0 && <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>Forbidden Fields: {item.forbiddenFields.join(', ')}</div>}
            {item.requiresRedaction && <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>Redaction required before any export</div>}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Blocked Report Items</h3>
        {blockedReportItems.length === 0 ? (
          <div style={{ padding: '8px 16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: 8, fontSize: 13, color: '#22C55E' }}>No blocked report items</div>
        ) : (
          blockedReportItems.map(item => (
            <div key={item.id} style={{ marginBottom: 8, padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: 13 }}>
              <div style={{ fontWeight: 600, color: '#EF4444' }}>{item.label}</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{item.reason}</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>Next: {item.nextAction}</div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Validator Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
          <StatCard label="Blocking" value={validation.blocking} color={validation.blocking > 0 ? '#EF4444' : '#22C55E'} />
          <StatCard label="Warning" value={validation.warning} color={validation.warning > 0 ? '#F97316' : '#22C55E'} />
          <StatCard label="Info" value={validation.info} color="#3B82F6" />
        </div>
        <div style={{ marginTop: 8, padding: '8px 16px', borderRadius: 8, fontSize: 13, background: validation.pass ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: validation.pass ? '#22C55E' : '#EF4444' }}>
          {validation.pass ? '✓ All report pack registry items pass validation' : `✗ ${validation.blocking} blocking issues found`}
        </div>
      </div>

      <div style={{ marginBottom: 24, padding: 16, background: 'rgba(239, 68, 68, 0.05)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: '#EF4444' }}>Forbidden Report Notice</h3>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <div>✗ This report pack does not generate real report files</div>
          <div>✗ This report pack does not write to any database</div>
          <div>✗ This report pack does not contain secrets (token, API key, password, private key)</div>
          <div>✗ This report pack does not control external tools</div>
          <div>✗ Stage C is permanently disabled</div>
        </div>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <a href="/governance-console-preview" style={{ padding: '8px 16px', background: 'var(--bg-secondary)', borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--accent)', textDecoration: 'none', fontSize: 13 }}>← Governance Console</a>
        <a href="/governance-console-risk-dashboard-preview" style={{ padding: '8px 16px', background: 'var(--bg-secondary)', borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--accent)', textDecoration: 'none', fontSize: 13 }}>← Risk Dashboard</a>
        <a href="/governance-console-decision-panel-preview" style={{ padding: '8px 16px', background: 'var(--bg-secondary)', borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--accent)', textDecoration: 'none', fontSize: 13 }}>← Decision Panel</a>
      </div>
      <div style={{ marginTop: 16, padding: 12, background: 'rgba(59, 130, 246, 0.05)', borderRadius: 8, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>API Contract Section — Report Preview</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Runtime API Contract v1.freeze: 12 endpoints (8 GET contract_only, 4 POST not_implemented).
          <a href="/runtime-readonly-status-api-preview" style={{ color: 'var(--accent)', textDecoration: 'none', marginLeft: 4 }} target="_blank" rel="noreferrer">
            View Full Contract →
          </a>
        </div>
      </div>
    </PageShell>
  );
};

export default GovernanceConsoleReportPackPreview;
