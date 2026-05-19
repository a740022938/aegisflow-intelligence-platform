import React from 'react';
import PageShell from '../components/ui/PageShell';
import {
  getGovernanceConsoleDecisionItems,
  getGovernanceConsoleDecisionSummary,
  getRecommendedGovernanceConsoleDecisions,
  getBlockedGovernanceConsoleDecisions,
} from '../registry/governance-console-decision-registry';
import { getGovernanceConsoleDecisionValidationSummary } from '../registry/governance-console-decision-validator';

const items = getGovernanceConsoleDecisionItems();
const summary = getGovernanceConsoleDecisionSummary();
const recommended = getRecommendedGovernanceConsoleDecisions();
const blocked = getBlockedGovernanceConsoleDecisions();
const validation = getGovernanceConsoleDecisionValidationSummary();

const riskColors: Record<string, string> = {
  low: '#22C55E', medium: '#F97316', high: '#EF4444', critical: '#DC2626',
};

const typeLabels: Record<string, string> = {
  continue_preview: 'Continue Preview', run_final_seal_recheck: 'Run Final Seal Recheck',
  hold_for_human_review: 'Hold for Human Review', generate_report_preview: 'Generate Report Preview',
  blocked: 'Blocked', future_stage_c_only: 'Future Stage C Only',
  documentation_polish: 'Documentation Polish', readiness_audit: 'Readiness Audit',
};

const typeColors: Record<string, string> = {
  continue_preview: '#22C55E', run_final_seal_recheck: '#3B82F6',
  hold_for_human_review: '#F97316', generate_report_preview: '#8B5CF6',
  blocked: '#EF4444', future_stage_c_only: '#6B7280',
  documentation_polish: '#22C55E', readiness_audit: '#3B82F6',
};

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 16px', border: '1px solid var(--border-color)' }}>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

const GovernanceConsoleDecisionPanelPreview: React.FC = () => {
  return (
    <PageShell
      title="治理总控台决策面板预览"
      subtitle="只读展示下一步建议、阻断原因、人工复核要求、证据与回滚门禁。"
    >
      <div style={{ marginBottom: 16, padding: '8px 16px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: 8, border: '1px solid rgba(251, 191, 36, 0.3)', fontSize: 13, color: 'var(--text-secondary)' }}>
        只读预览 · 不审批 · 不执行 · 不改变 registry · 不写数据库 · 不启用 Stage C
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Decision Overview Dashboard</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
          <StatCard label="Total Decisions" value={summary.total} color="var(--text-primary)" />
          <StatCard label="Recommended Now" value={summary.recommendedNow} color="#22C55E" />
          <StatCard label="Blocked" value={summary.blocked} color="#EF4444" />
          <StatCard label="High/Critical" value={summary.highOrCritical} color="#EF4444" />
          <StatCard label="Executes Action" value={summary.executesAction} color="#DC2626" />
          <StatCard label="Mutates Registry" value={summary.mutatesRegistry} color="#DC2626" />
          <StatCard label="Writes DB" value={summary.writesDb} color="#DC2626" />
          <StatCard label="Controls External" value={summary.controlsExternalTool} color="#DC2626" />
          <StatCard label="Requires Human Approval" value={summary.requiresHumanApproval} color="#F97316" />
          <StatCard label="Requires Stage C" value={summary.requiresStageC} color="#EF4444" />
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Recommended Decisions Board</h3>
        {recommended.length === 0 ? (
          <div style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, fontSize: 13, color: '#EF4444' }}>No recommended decisions</div>
        ) : (
          recommended.map(item => (
            <div key={item.id} style={{ marginBottom: 8, padding: '12px 16px', background: item.risk === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', borderRadius: 8, border: item.risk === 'critical' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: item.risk === 'critical' ? '#EF4444' : '#22C55E' }}>{item.label}</span>
                <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#fff', background: typeColors[item.decisionType] || '#6B7280' }}>{typeLabels[item.decisionType] || item.decisionType}</span>
                <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#fff', background: riskColors[item.risk] || '#6B7280' }}>{item.risk}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{item.decisionRationale}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Next: {item.nextAction}</div>
              {item.linkedRoutes.length > 0 && (
                <div style={{ marginTop: 4, fontSize: 12 }}>
                  {item.linkedRoutes.map(r => <a key={r} href={r} style={{ color: 'var(--accent)', textDecoration: 'none', marginRight: 8 }} target="_blank" rel="noreferrer">{r}</a>)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Blocked Decisions Board</h3>
        {blocked.length === 0 ? (
          <div style={{ padding: '8px 16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: 8, fontSize: 13, color: '#22C55E' }}>No blocked decisions</div>
        ) : (
          blocked.map(item => (
            <div key={item.id} style={{ marginBottom: 8, padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: '#EF4444' }}>{item.label}</span>
                <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#fff', background: '#EF4444' }}>Blocked</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{item.decisionRationale}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Next: {item.nextAction}</div>
              {item.gates.length > 0 && <div style={{ fontSize: 12, color: '#EF4444', marginTop: 2 }}>Gates: {item.gates.join(', ')}</div>}
            </div>
          ))
        )}
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Decision Type Board</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
          {Object.entries(typeLabels).map(([key, label]) => {
            const count = items.filter(i => i.decisionType === key).length;
            return (
              <div key={key} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 16px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: typeColors[key] || 'var(--text-primary)' }}>{count}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Validator Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
          <StatCard label="Blocking" value={validation.blocking} color={validation.blocking > 0 ? '#EF4444' : '#22C55E'} />
          <StatCard label="Warning" value={validation.warning} color={validation.warning > 0 ? '#F97316' : '#22C55E'} />
          <StatCard label="Info" value={validation.info} color="#3B82F6" />
        </div>
        <div style={{ marginTop: 8, padding: '8px 16px', borderRadius: 8, fontSize: 13, background: validation.pass ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: validation.pass ? '#22C55E' : '#EF4444' }}>
          {validation.pass ? '✓ All decision registry items pass validation' : `✗ ${validation.blocking} blocking issues found`}
        </div>
      </div>

      <div style={{ marginBottom: 24, padding: 16, background: 'rgba(239, 68, 68, 0.05)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: '#EF4444' }}>Forbidden Decision Notice</h3>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <div>✗ This decision panel does not approve, reject, or execute any decision</div>
          <div>✗ This decision panel does not change any registry</div>
          <div>✗ This decision panel does not write to any database</div>
          <div>✗ This decision panel does not control external tools</div>
          <div>✗ Stage C is permanently disabled</div>
        </div>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <a href="/governance-console-preview" style={{ padding: '8px 16px', background: 'var(--bg-secondary)', borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--accent)', textDecoration: 'none', fontSize: 13 }}>← Governance Console</a>
        <a href="/governance-console-risk-dashboard-preview" style={{ padding: '8px 16px', background: 'var(--bg-secondary)', borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--accent)', textDecoration: 'none', fontSize: 13 }}>← Risk Dashboard</a>
        <a href="/governance-console-report-pack-preview" style={{ padding: '8px 16px', background: 'var(--bg-secondary)', borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--accent)', textDecoration: 'none', fontSize: 13 }}>Report Pack →</a>
      </div>
    </PageShell>
  );
};

export default GovernanceConsoleDecisionPanelPreview;
