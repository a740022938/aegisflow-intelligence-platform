import React from 'react';
import PageShell from '../components/ui/PageShell';
import {
  getRuntimeDryRunContractItems,
  getRuntimeDryRunContractSummary,
  getRuntimeDryRunContractItemsByKind,
  getRuntimeDryRunBlockedItems,
} from '../registry/runtime-dry-run-contract-registry';

const sectionStyle: React.CSSProperties = {
  background: 'var(--bg-card, #0d1b2a)',
  padding: 16,
  borderRadius: 8,
  border: '1px solid var(--border-color, #2a2a4a)',
  marginBottom: 16,
};

const headerStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 12,
  color: 'var(--text-primary, #e0e0e0)',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 8,
  marginBottom: 12,
};

const statCardStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: 'var(--bg-item, #16213e)',
  borderRadius: 4,
  border: '1px solid var(--border-color, #2a2a4a)',
};

const statLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-secondary, #8892b0)',
  textTransform: 'uppercase' as const,
};

const statValueStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: 'var(--text-primary, #e0e0e0)',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '6px 8px',
  borderBottom: '1px solid var(--border-color, #2a2a4a)',
  color: 'var(--text-secondary, #8892b0)',
  fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
  padding: '6px 8px',
  borderBottom: '1px solid var(--border-color, #2a2a4a)',
  color: 'var(--text-primary, #e0e0e0)',
};

function riskColor(risk: string): string {
  switch (risk) {
    case 'critical': return '#ef5350';
    case 'high': return '#ffa726';
    case 'medium': return '#ffd54f';
    default: return '#66bb6a';
  }
}

export default function RuntimeDryRunContractPreview() {
  const items = getRuntimeDryRunContractItems();
  const summary = getRuntimeDryRunContractSummary();
  const blockedItems = getRuntimeDryRunBlockedItems();
  const requestSchemas = getRuntimeDryRunContractItemsByKind('request_schema');
  const responseSchemas = getRuntimeDryRunContractItemsByKind('response_schema');
  const gateChecks = getRuntimeDryRunContractItemsByKind('gate_check');
  const evidenceAuditRollback = items.filter(i => i.kind === 'evidence_requirement' || i.kind === 'audit_requirement' || i.kind === 'rollback_requirement');
  const blocked = getRuntimeDryRunContractItemsByKind('blocked_execution');

  return (
    <PageShell
      title="Runtime Dry-run 契约预览"
      subtitle="只读查看未来 dry-run 请求、响应、门禁、证据、审计和回滚要求。"
      safetyBoundary="readonly"
      safetyText="只读预览 · 不执行 dry-run · 不调用外部工具 · 不写数据库 · 不启用 Stage C"
    >
      <div style={sectionStyle}>
        <div style={headerStyle}>Dry-run Contract Overview</div>
        <div style={gridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Total Items</div>
            <div style={statValueStyle}>{summary.total}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Request Schema</div>
            <div style={statValueStyle}>{requestSchemas.length}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Response Schema</div>
            <div style={statValueStyle}>{responseSchemas.length}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Gate Checks</div>
            <div style={statValueStyle}>{gateChecks.length}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Ev/Ad/Rb</div>
            <div style={statValueStyle}>{evidenceAuditRollback.length}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Blocked</div>
            <div style={statValueStyle}>{blocked.length}</div>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>Request / Response Schema Board</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Kind</th>
              <th style={thStyle}>Risk</th>
              <th style={thStyle}>Request Fields</th>
              <th style={thStyle}>Response Fields</th>
            </tr>
          </thead>
          <tbody>
            {[...requestSchemas, ...responseSchemas].map(item => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.id}</td>
                <td style={tdStyle}>{item.kind}</td>
                <td style={{ ...tdStyle, color: riskColor(item.risk) }}>{item.risk}</td>
                <td style={tdStyle}>{item.requestFields.join(', ') || '-'}</td>
                <td style={tdStyle}>{item.responseFields.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>Gate Board</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Risk</th>
              <th style={thStyle}>Allowed Now</th>
              <th style={thStyle}>Requires Stage C</th>
              <th style={thStyle}>Blocked Actions</th>
            </tr>
          </thead>
          <tbody>
            {gateChecks.map(item => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.id}</td>
                <td style={{ ...tdStyle, color: riskColor(item.risk) }}>{item.risk}</td>
                <td style={{ ...tdStyle, color: item.allowedNow ? '#66bb6a' : '#ef5350' }}>{item.allowedNow ? 'YES' : 'NO'}</td>
                <td style={tdStyle}>{item.requiresStageC ? 'YES' : 'NO'}</td>
                <td style={tdStyle}>{item.blockedActions.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>Evidence / Audit / Rollback Requirement Board</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Kind</th>
              <th style={thStyle}>Risk</th>
              <th style={thStyle}>Req Evidence</th>
              <th style={thStyle}>Req Audit</th>
              <th style={thStyle}>Req Rollback</th>
            </tr>
          </thead>
          <tbody>
            {evidenceAuditRollback.map(item => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.id}</td>
                <td style={tdStyle}>{item.kind}</td>
                <td style={{ ...tdStyle, color: riskColor(item.risk) }}>{item.risk}</td>
                <td style={tdStyle}>{item.requiresEvidence ? 'YES' : 'NO'}</td>
                <td style={tdStyle}>{item.requiresAuditLog ? 'YES' : 'NO'}</td>
                <td style={tdStyle}>{item.requiresRollbackPlan ? 'YES' : 'NO'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>Blocked Execution Board</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Risk</th>
              <th style={thStyle}>Exec Dry-run</th>
              <th style={thStyle}>Calls Ext</th>
              <th style={thStyle}>Writes DB</th>
              <th style={thStyle}>Req Stage C</th>
              <th style={thStyle}>Blocked Actions</th>
            </tr>
          </thead>
          <tbody>
            {blocked.map(item => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.id}</td>
                <td style={{ ...tdStyle, color: riskColor(item.risk) }}>{item.risk}</td>
                <td style={tdStyle}>{item.executesDryRun ? 'YES' : 'NO'}</td>
                <td style={tdStyle}>{item.callsExternalTool ? 'YES' : 'NO'}</td>
                <td style={tdStyle}>{item.writesDb ? 'YES' : 'NO'}</td>
                <td style={tdStyle}>{item.requiresStageC ? 'YES' : 'NO'}</td>
                <td style={tdStyle}>{item.blockedActions.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>Forbidden Fields Board</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Forbidden Fields</th>
            </tr>
          </thead>
          <tbody>
            {items.filter(i => i.forbiddenFields.length > 0).map(item => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.id}</td>
                <td style={{ ...tdStyle, color: '#ef5350' }}>{item.forbiddenFields.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>All Items</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Kind</th>
              <th style={thStyle}>Risk</th>
              <th style={thStyle}>Allowed</th>
              <th style={thStyle}>Gates</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.id}</td>
                <td style={tdStyle}>{item.kind}</td>
                <td style={{ ...tdStyle, color: riskColor(item.risk) }}>{item.risk}</td>
                <td style={{ ...tdStyle, color: item.allowedNow ? '#66bb6a' : '#ef5350' }}>{item.allowedNow ? 'YES' : 'NO'}</td>
                <td style={tdStyle}>{item.gates.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>Forbidden Dry-run Notice</div>
        <p style={{ color: '#ef5350', fontSize: 14 }}>
          This page is a READONLY CONTRACT PREVIEW. No dry-run execution, no API call, no external tool control, no DB write, no Stage C enablement.
        </p>
        <p style={{ color: 'var(--text-secondary, #8892b0)', fontSize: 13 }}>
          All dry-run operations are contract-only. Any future dry-run execution requires Stage C activation, human approval, runtime evaluator, audit logger, evidence store, and rollback executor.
        </p>
      </div>
    </PageShell>
  );
}
