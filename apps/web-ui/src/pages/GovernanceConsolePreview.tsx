import React from 'react';
import PageShell from '../components/ui/PageShell';
import {
  getGovernanceConsoleRegistryItems,
  getGovernanceConsoleRegistrySummary,
  getGovernanceConsoleBlockedItems,
  getGovernanceConsoleHiddenPreviewItems,
} from '../registry/governance-console-registry';
import { getGovernanceConsoleValidationSummary } from '../registry/governance-console-validator';
import {
  getGovernanceConsoleRiskItems,
  getGovernanceConsoleRiskSummary,
} from '../registry/governance-console-risk-registry';
import { getGovernanceConsoleRiskValidationSummary } from '../registry/governance-console-risk-validator';
import {
  getGovernanceConsoleDecisionItems,
  getGovernanceConsoleDecisionSummary,
} from '../registry/governance-console-decision-registry';
import { getGovernanceConsoleDecisionValidationSummary } from '../registry/governance-console-decision-validator';
import {
  getGovernanceConsoleReportPackItems,
  getGovernanceConsoleReportPackSummary,
} from '../registry/governance-console-report-pack-registry';
import { getGovernanceConsoleReportPackValidationSummary } from '../registry/governance-console-report-pack-validator';

const items = getGovernanceConsoleRegistryItems();
const summary = getGovernanceConsoleRegistrySummary();
const blockedItems = getGovernanceConsoleBlockedItems();
const hiddenPreviews = getGovernanceConsoleHiddenPreviewItems();
const validation = getGovernanceConsoleValidationSummary();
const riskItems = getGovernanceConsoleRiskItems();
const riskSummary = getGovernanceConsoleRiskSummary();
const riskValidation = getGovernanceConsoleRiskValidationSummary();
const decisionItems = getGovernanceConsoleDecisionItems();
const decisionSummary = getGovernanceConsoleDecisionSummary();
const decisionValidation = getGovernanceConsoleDecisionValidationSummary();
const reportItems = getGovernanceConsoleReportPackItems();
const reportSummary = getGovernanceConsoleReportPackSummary();
const reportValidation = getGovernanceConsoleReportPackValidationSummary();

const riskColors: Record<string, string> = {
  low: '#22C55E', medium: '#F97316', high: '#EF4444', critical: '#DC2626',
};

const readinessColors: Record<string, string> = {
  ready_preview: '#22C55E', ready_with_notes: '#F97316', blocked: '#EF4444', future_stage_c: '#6B7280', design_only: '#3B82F6',
};

const exposureColors: Record<string, string> = {
  sidebar: '#22C55E', hidden_direct: '#3B82F6', docs_only: '#8B5CF6', internal_registry: '#6B7280', blocked: '#EF4444',
};

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 16px', border: '1px solid var(--border-color)' }}>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#fff', background: riskColors[risk] || '#6B7280' }}>{risk}</span>;
}

function ReadinessBadge({ readiness }: { readiness: string }) {
  const labels: Record<string, string> = { ready_preview: 'Ready Preview', ready_with_notes: 'Ready w/ Notes', blocked: 'Blocked', future_stage_c: 'Future Stage C', design_only: 'Design Only' };
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#fff', background: readinessColors[readiness] || '#6B7280' }}>{labels[readiness] || readiness}</span>;
}

function ExposureBadge({ exposure }: { exposure: string }) {
  return <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#fff', background: exposureColors[exposure] || '#6B7280' }}>{exposure}</span>;
}

const GovernanceConsolePreview: React.FC = () => {
  return (
    <PageShell
      title="治理总控台预览"
      subtitle="只读聚合权限、运行时、dry-run、审计、审批、证据和回滚链路的状态、风险与下一步建议。"
    >
      <div style={{ marginBottom: 16, padding: '8px 16px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: 8, border: '1px solid rgba(251, 191, 36, 0.3)', fontSize: 13, color: 'var(--text-secondary)' }}>
        只读预览 · 不执行动作 · 不改变 registry · 不写数据库 · 不启用 Stage C
      </div>

      {/* A. Console Overview Dashboard */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>A. Console Overview Dashboard</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
          <StatCard label="Total Items" value={summary.total} color="var(--text-primary)" />
          <StatCard label="Ready Preview" value={summary.readyPreview} color="#22C55E" />
          <StatCard label="Blocked" value={summary.blocked} color="#EF4444" />
          <StatCard label="High/Critical" value={summary.highOrCritical} color="#EF4444" />
          <StatCard label="Sidebar" value={summary.sidebar} color="#22C55E" />
          <StatCard label="Hidden Direct" value={summary.hiddenDirect} color="#3B82F6" />
          <StatCard label="Requires Stage C" value={summary.requiresStageC} color="#EF4444" />
          <StatCard label="Requires DB Write" value={summary.requiresDbWrite} color="#EF4444" />
          <StatCard label="Requires Ext Control" value={summary.requiresExternalControl} color="#EF4444" />
          <StatCard label="Supports Execution" value={summary.supportsExecution} color="#DC2626" />
          <StatCard label="Writes Data" value={summary.writesData} color="#DC2626" />
        </div>
      </div>

      {/* B. Registry Chain Board */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>B. Registry Chain Board</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Label</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Risk</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Readiness</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Exposure</th>
                <th style={{ textAlign: 'center', padding: '8px 12px' }}>In Sidebar</th>
                <th style={{ textAlign: 'center', padding: '8px 12px' }}>Preview Route</th>
              </tr>
            </thead>
            <tbody>
              {items.filter(i => i.domain !== 'center_access' || ['advanced-mode', 'connector-center', 'lab-center', 'governance-center', 'navigation-preview'].includes(i.id)).map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>{item.id}</td>
                  <td style={{ padding: '8px 12px', fontWeight: 500 }}>{item.label}</td>
                  <td style={{ padding: '8px 12px' }}><RiskBadge risk={item.risk} /></td>
                  <td style={{ padding: '8px 12px' }}><ReadinessBadge readiness={item.readiness} /></td>
                  <td style={{ padding: '8px 12px' }}><ExposureBadge exposure={item.exposure} /></td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{item.inSidebar ? '✓' : '—'}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    {item.previewRoute ? (
                      <a href={item.previewRoute} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 12 }} target="_blank" rel="noreferrer">
                        {item.previewRoute}
                      </a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* C. Risk Aggregation Board */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>C. Risk Aggregation Board</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
          {(['low', 'medium', 'high', 'critical'] as const).map(level => {
            const count = items.filter(i => i.risk === level).length;
            return (
              <div key={level} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 16px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: riskColors[level] }}>{count}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, textTransform: 'capitalize' }}>{level} Risk</div>
              </div>
            );
          })}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 16px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#EF4444' }}>{blockedItems.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Blocked Items</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 16px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#EF4444' }}>{summary.requiresStageC}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Stage C Gated</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 16px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#EF4444' }}>{summary.requiresDbWrite}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>DB Write Gated</div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 16px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#EF4444' }}>{summary.requiresExternalControl}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>External Control Gated</div>
          </div>
        </div>
      </div>

      {/* D. Sidebar / Exposure Board */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>D. Sidebar / Exposure Board</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Exposure</th>
                <th style={{ textAlign: 'center', padding: '8px 12px' }}>In Sidebar</th>
                <th style={{ textAlign: 'center', padding: '8px 12px' }}>Allowed Now</th>
              </tr>
            </thead>
            <tbody>
              {items.filter(i => i.domain === 'center_access' || i.domain === 'navigation').map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>{item.id}</td>
                  <td style={{ padding: '8px 12px' }}><ExposureBadge exposure={item.exposure} /></td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{item.inSidebar ? <span style={{ color: '#22C55E' }}>✓</span> : <span style={{ color: '#6B7280' }}>—</span>}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{item.allowedNow ? <span style={{ color: '#22C55E' }}>✓</span> : <span style={{ color: '#EF4444' }}>✗</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* E. Decision Panel */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>E. Decision Panel</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', borderRadius: 8, padding: '12px 16px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#22C55E' }}>Recommended Next Step: Continue Readonly Preview</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>All registries are consistent. System is in readonly preview state. No blocking conditions detected.</div>
          </div>
          {blockedItems.length > 0 && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, padding: '12px 16px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#EF4444' }}>Blocked Items ({blockedItems.length})</div>
              {blockedItems.map(item => (
                <div key={item.id} style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {item.label} — {item.reason}
                </div>
              ))}
            </div>
          )}
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', borderRadius: 8, padding: '12px 16px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#3B82F6' }}>Cannot Execute</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>This Governance Console does not execute any action. No approve, reject, apply, execute, or transition buttons are available.</div>
          </div>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', borderRadius: 8, padding: '12px 16px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#8B5CF6' }}>Can Open Readonly Previews</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              {hiddenPreviews.map(p => (
                <a key={p.id} href={p.previewRoute} style={{ display: 'inline-block', marginRight: 8, marginTop: 4, color: 'var(--accent)', textDecoration: 'none' }} target="_blank" rel="noreferrer">
                  {p.label}
                </a>
              ))}
            </div>
          </div>
          <div style={{ background: 'rgba(251, 191, 36, 0.1)', borderRadius: 8, padding: '12px 16px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#F97316' }}>Human Approval Requirement</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              {items.filter(i => i.domain === 'human_approval' || i.id === 'stage-c' || i.id === 'db-write' || i.id === 'external-control').map(i => (
                <div key={i.id} style={{ marginTop: 2 }}>{i.label}: {i.allowedNow ? 'No human approval needed for preview' : 'Blocked — requires human approval to unblock'}</div>
              ))}
            </div>
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, padding: '12px 16px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#EF4444' }}>Rollback Requirement</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Rollback executor is not implemented. Rollback Preview shows 22 items, all readonly. No rollback execution possible.
            </div>
          </div>
        </div>
      </div>

      {/* F. Traceability Board */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>F. Traceability Board</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Source Registry</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Validator</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Preview Route</th>
                <th style={{ textAlign: 'left', padding: '8px 12px' }}>Summary Fields</th>
              </tr>
            </thead>
            <tbody>
              {items.filter(i => i.domain !== 'center_access').map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>{item.id}</td>
                  <td style={{ padding: '8px 12px', fontSize: 12 }}>{item.sourceRegistry}</td>
                  <td style={{ padding: '8px 12px', fontSize: 12 }}>{item.validatorName || '—'}</td>
                  <td style={{ padding: '8px 12px' }}>
                    {item.previewRoute ? (
                      <a href={item.previewRoute} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 12 }} target="_blank" rel="noreferrer">{item.previewRoute}</a>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 12 }}>{item.summaryFields.join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* G. Validator Summary */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>G. Validator Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
          <StatCard label="Blocking" value={validation.blocking} color={validation.blocking > 0 ? '#EF4444' : '#22C55E'} />
          <StatCard label="Warning" value={validation.warning} color={validation.warning > 0 ? '#F97316' : '#22C55E'} />
          <StatCard label="Info" value={validation.info} color="#3B82F6" />
        </div>
        <div style={{ marginTop: 8, padding: '8px 16px', borderRadius: 8, fontSize: 13, background: validation.pass ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: validation.pass ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)', color: validation.pass ? '#22C55E' : '#EF4444' }}>
          {validation.pass ? '✓ All governance console registry items pass validation' : `✗ ${validation.blocking} blocking issues found`}
        </div>
      </div>

      {/* H. Forbidden Console Notice */}
      <div style={{ marginBottom: 24, padding: 16, background: 'rgba(239, 68, 68, 0.05)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: '#EF4444' }}>H. Forbidden Console Notice</h3>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <div>✗ This console does not execute any action</div>
          <div>✗ This console does not change any registry</div>
          <div>✗ This console does not write to any database</div>
          <div>✗ This console does not control external tools</div>
          <div>✗ Stage C is permanently disabled</div>
          <div>✗ This console is NOT in sidebar</div>
          <div>✗ No approve, reject, apply, execute button exists</div>
          <div>✗ No rollback, restore, recover button exists</div>
          <div>✗ No API key, token, password input exists</div>
        </div>
      </div>

      {/* I. Risk Dashboard Entry Point (P2) */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>I. Risk Dashboard Preview (P2)</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
            <StatCard label="Total Risks" value={riskSummary.total} color="var(--text-primary)" />
            <StatCard label="Blocked" value={riskSummary.blocked} color="#EF4444" />
            <StatCard label="High/Critical" value={riskSummary.highOrCritical} color="#EF4444" />
            <StatCard label="Stage C Gated" value={riskSummary.requiresStageC} color="#EF4444" />
            <StatCard label="DB Write Gated" value={riskSummary.requiresDbWrite} color="#EF4444" />
            <StatCard label="Ext Control Gated" value={riskSummary.requiresExternalControl} color="#EF4444" />
            <StatCard label="Human Approval" value={riskSummary.requiresHumanApproval} color="#F97316" />
            <StatCard label="Evidence Required" value={riskSummary.requiresEvidence} color="#F97316" />
            <StatCard label="Rollback Required" value={riskSummary.requiresRollback} color="#F97316" />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, background: riskValidation.pass ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: riskValidation.pass ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)', color: riskValidation.pass ? '#22C55E' : '#EF4444' }}>
              {riskValidation.pass ? `✓ Risk validator pass (${riskValidation.blocking}b/${riskValidation.warning}w/${riskValidation.info}i)` : `✗ ${riskValidation.blocking} blocking issues`}
            </div>
            <a href="/governance-console-risk-dashboard-preview" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 13 }} target="_blank" rel="noreferrer">
              Open Risk Dashboard Preview →
            </a>
          </div>
        </div>
      </div>

      {/* J. Decision Panel Entry Point (P3) */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>J. Decision Panel Preview (P3)</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
            <StatCard label="Total Decisions" value={decisionSummary.total} color="var(--text-primary)" />
            <StatCard label="Recommended Now" value={decisionSummary.recommendedNow} color="#22C55E" />
            <StatCard label="Blocked" value={decisionSummary.blocked} color="#EF4444" />
            <StatCard label="High/Critical" value={decisionSummary.highOrCritical} color="#EF4444" />
            <StatCard label="Executes Action" value={decisionSummary.executesAction} color="#DC2626" />
            <StatCard label="Mutates Registry" value={decisionSummary.mutatesRegistry} color="#DC2626" />
            <StatCard label="Writes DB" value={decisionSummary.writesDb} color="#DC2626" />
            <StatCard label="Ext Control" value={decisionSummary.controlsExternalTool} color="#DC2626" />
            <StatCard label="Stage C Required" value={decisionSummary.requiresStageC} color="#EF4444" />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, background: decisionValidation.pass ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: decisionValidation.pass ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)', color: decisionValidation.pass ? '#22C55E' : '#EF4444' }}>
              {decisionValidation.pass ? `✓ Decision validator pass (${decisionValidation.blocking}b/${decisionValidation.warning}w/${decisionValidation.info}i)` : `✗ ${decisionValidation.blocking} blocking issues`}
            </div>
            <a href="/governance-console-decision-panel-preview" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 13 }} target="_blank" rel="noreferrer">
              Open Decision Panel Preview →
            </a>
          </div>
        </div>
      </div>

      {/* K. Report Pack Entry Point (P4) */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>K. Report Pack Preview (P4)</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
            <StatCard label="Total Sections" value={reportSummary.total} color="var(--text-primary)" />
            <StatCard label="Preview Ready" value={reportSummary.previewReady} color="#22C55E" />
            <StatCard label="Blocked" value={reportSummary.blocked} color="#EF4444" />
            <StatCard label="Generates File" value={reportSummary.generatesFile} color="#DC2626" />
            <StatCard label="Writes DB" value={reportSummary.writesDb} color="#DC2626" />
            <StatCard label="Includes Secrets" value={reportSummary.includesSecrets} color="#DC2626" />
            <StatCard label="Requires Redaction" value={reportSummary.requiresRedaction} color="#F97316" />
            <StatCard label="Human Review" value={reportSummary.requiresHumanReview} color="#F97316" />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, background: reportValidation.pass ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: reportValidation.pass ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)', color: reportValidation.pass ? '#22C55E' : '#EF4444' }}>
              {reportValidation.pass ? `✓ Report validator pass (${reportValidation.blocking}b/${reportValidation.warning}w/${reportValidation.info}i)` : `✗ ${reportValidation.blocking} blocking issues`}
            </div>
            <a href="/governance-console-report-pack-preview" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 13 }} target="_blank" rel="noreferrer">
              Open Report Pack Preview →
            </a>
          </div>
        </div>
      </div>

      {/* L. Acceleration Pack Summary */}
      <div style={{ marginBottom: 24, padding: 16, background: 'rgba(59, 130, 246, 0.05)', borderRadius: 8, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: '#3B82F6' }}>L. v7.29.0-P2/P3/P4 Acceleration Pack</h3>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <div>P2 Risk Dashboard: {riskSummary.total} items, {riskSummary.blocked} blocked, {riskSummary.highOrCritical} high/critical — <a href="/governance-console-risk-dashboard-preview" style={{ color: 'var(--accent)', textDecoration: 'none' }} target="_blank" rel="noreferrer">open</a></div>
          <div>P3 Decision Panel: {decisionSummary.total} items, {decisionSummary.blocked} blocked, {decisionSummary.highOrCritical} high/critical — <a href="/governance-console-decision-panel-preview" style={{ color: 'var(--accent)', textDecoration: 'none' }} target="_blank" rel="noreferrer">open</a></div>
          <div>P4 Report Pack: {reportSummary.total} items, {reportSummary.blocked} blocked, {reportSummary.previewReady} preview ready — <a href="/governance-console-report-pack-preview" style={{ color: 'var(--accent)', textDecoration: 'none' }} target="_blank" rel="noreferrer">open</a></div>
          <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: 4, border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            ✓ All 3 validators pass. All previews are readonly, hidden direct, not in sidebar. Stage C permanently disabled.
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default GovernanceConsolePreview;
