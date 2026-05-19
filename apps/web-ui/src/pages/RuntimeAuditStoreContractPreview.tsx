import React from 'react';
import PageShell from '../components/ui/PageShell';
import {
  getRuntimeAuditStoreContractItems,
  getRuntimeAuditStoreContractSummary,
  getRuntimeAuditStoreItemsByKind,
  getRuntimeAuditStoreBlockedItems,
} from '../registry/runtime-audit-store-contract-registry';

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

export default function RuntimeAuditStoreContractPreview() {
  const items = getRuntimeAuditStoreContractItems();
  const summary = getRuntimeAuditStoreContractSummary();
  const eventSchemas = getRuntimeAuditStoreItemsByKind('event_schema');
  const retention = getRuntimeAuditStoreItemsByKind('retention_policy');
  const redaction = getRuntimeAuditStoreItemsByKind('redaction_policy');
  const writePolicies = getRuntimeAuditStoreItemsByKind('write_policy');
  const blockedStores = getRuntimeAuditStoreItemsByKind('blocked_store');
  const futureStageC = getRuntimeAuditStoreItemsByKind('future_stage_c');

  return (
    <PageShell
      title="Runtime Audit Store 契约预览"
      subtitle="只读查看未来审计事件、留存、脱敏、写入策略和阻断边界。"
      safetyBoundary="readonly"
      safetyText="只读预览 · 不创建 audit store · 不写数据库 · 不保存 secret · 不启用 Stage C"
    >
      <div style={sectionStyle}>
        <div style={headerStyle}>Audit Store Contract Overview</div>
        <div style={gridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Total Items</div>
            <div style={statValueStyle}>{summary.total}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Event Schema</div>
            <div style={statValueStyle}>{eventSchemas.length}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Retention</div>
            <div style={statValueStyle}>{retention.length}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Redaction</div>
            <div style={statValueStyle}>{redaction.length}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Write Policy</div>
            <div style={statValueStyle}>{writePolicies.length}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Blocked</div>
            <div style={statValueStyle}>{blockedStores.length}</div>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>Event Schema Board</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Risk</th>
              <th style={thStyle}>Event Fields</th>
            </tr>
          </thead>
          <tbody>
            {eventSchemas.map(item => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.id}</td>
                <td style={{ ...tdStyle, color: riskColor(item.risk) }}>{item.risk}</td>
                <td style={tdStyle}>{item.eventFields.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>Retention / Redaction Board</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Kind</th>
              <th style={thStyle}>Risk</th>
              <th style={thStyle}>Retention Fields</th>
              <th style={thStyle}>Redaction Rules</th>
            </tr>
          </thead>
          <tbody>
            {[...retention, ...redaction].map(item => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.id}</td>
                <td style={tdStyle}>{item.kind}</td>
                <td style={{ ...tdStyle, color: riskColor(item.risk) }}>{item.risk}</td>
                <td style={tdStyle}>{item.retentionFields.join(', ') || '-'}</td>
                <td style={tdStyle}>{item.redactionRules.join(', ') || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>Write Policy Blocked Board</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Risk</th>
              <th style={thStyle}>Writes Store</th>
              <th style={thStyle}>Writes DB</th>
              <th style={thStyle}>Req Stage C</th>
              <th style={thStyle}>Req Human</th>
            </tr>
          </thead>
          <tbody>
            {writePolicies.map(item => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.id}</td>
                <td style={{ ...tdStyle, color: riskColor(item.risk) }}>{item.risk}</td>
                <td style={tdStyle}>{item.writesAuditStore ? 'YES' : 'NO'}</td>
                <td style={tdStyle}>{item.writesDb ? 'YES' : 'NO'}</td>
                <td style={tdStyle}>{item.requiresStageC ? 'YES' : 'NO'}</td>
                <td style={tdStyle}>{item.requiresHumanApproval ? 'YES' : 'NO'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>Secret Material Blocked Board</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Risk</th>
              <th style={thStyle}>Reads Secret</th>
              <th style={thStyle}>Forbidden Fields</th>
              <th style={thStyle}>Redaction Rules</th>
            </tr>
          </thead>
          <tbody>
            {blockedStores.map(item => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.id}</td>
                <td style={{ ...tdStyle, color: riskColor(item.risk) }}>{item.risk}</td>
                <td style={tdStyle}>{item.readsSecretMaterial ? 'YES' : 'NO'}</td>
                <td style={{ ...tdStyle, color: '#ef5350' }}>{item.forbiddenFields.join(', ') || '-'}</td>
                <td style={tdStyle}>{item.redactionRules.join(', ') || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>Future Stage C Board</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Risk</th>
              <th style={thStyle}>Req Stage C</th>
              <th style={thStyle}>Blocked Actions</th>
            </tr>
          </thead>
          <tbody>
            {futureStageC.map(item => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.id}</td>
                <td style={{ ...tdStyle, color: riskColor(item.risk) }}>{item.risk}</td>
                <td style={tdStyle}>{item.requiresStageC ? 'YES' : 'NO'}</td>
                <td style={tdStyle}>{item.blockedActions.join(', ')}</td>
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
        <div style={headerStyle}>Forbidden Audit Store Notice</div>
        <p style={{ color: '#ef5350', fontSize: 14 }}>
          This page is a READONLY CONTRACT PREVIEW. No audit store creation, no audit write, no DB write, no secret material storage, no Stage C enablement.
        </p>
        <p style={{ color: 'var(--text-secondary, #8892b0)', fontSize: 13 }}>
          All audit store operations are contract-only. Any future audit store implementation requires Stage C activation, human approval, redaction policy, retention policy, audit logger, evidence store, and rollback executor.
        </p>
      </div>
    </PageShell>
  );
}
