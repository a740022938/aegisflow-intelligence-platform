import React from 'react';
import PageShell from '../components/ui/PageShell';
import {
  getStageCPreEnableReviewItems,
  getStageCPreEnableReviewSummary,
  getStageCReviewItemsByArea,
  getStageCReviewItemsByStatus,
  getStageCBlockedReviewItems,
} from '../registry/stage-c-preenable-review-registry';

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

function statusColor(status: string): string {
  switch (status) {
    case 'blocked': return '#ef5350';
    case 'requires_human_owner': return '#ffa726';
    case 'ready_for_review': return '#66bb6a';
    default: return '#8892b0';
  }
}

export default function StageCPreEnableReviewPreview() {
  const items = getStageCPreEnableReviewItems();
  const summary = getStageCPreEnableReviewSummary();
  const blockedItems = getStageCReviewItemsByStatus('blocked');
  const humanOwnerItems = getStageCReviewItemsByStatus('requires_human_owner');
  const readyItems = getStageCReviewItemsByStatus('ready_for_review');

  return (
    <PageShell
      title="Stage C 启用前人工复核包预览"
      subtitle="只读查看 Stage C 启用前必须满足的文档、验证器、证据、回滚和人工批准条件。"
      safetyBoundary="readonly"
      safetyText="只读预览 · 不启用 Stage C · 不执行动作 · 不写数据库 · 不控制外部工具"
    >
      <div style={sectionStyle}>
        <div style={headerStyle}>Stage C Review Overview</div>
        <div style={gridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Total Items</div>
            <div style={statValueStyle}>{summary.total}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Blocked</div>
            <div style={{ ...statValueStyle, color: '#ef5350' }}>{summary.blocked}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Needs Human</div>
            <div style={{ ...statValueStyle, color: '#ffa726' }}>{summary.requiresHumanOwner}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Needs Final Seal</div>
            <div style={statValueStyle}>{summary.requiresFinalSeal}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Can Enable C</div>
            <div style={{ ...statValueStyle, color: '#ef5350' }}>0</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Areas</div>
            <div style={statValueStyle}>{Object.keys(summary.byArea).length}</div>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>Required Docs Board</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Area</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Required Docs</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.id}</td>
                <td style={tdStyle}>{item.area}</td>
                <td style={{ ...tdStyle, color: statusColor(item.status) }}>{item.status}</td>
                <td style={tdStyle}>{item.requiredDocs.join(', ') || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>Required Validators Board</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Area</th>
              <th style={thStyle}>Required Validators</th>
            </tr>
          </thead>
          <tbody>
            {items.filter(i => i.requiredValidators.length > 0).map(item => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.id}</td>
                <td style={tdStyle}>{item.area}</td>
                <td style={tdStyle}>{item.requiredValidators.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>Blockers Board</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Risk</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Blockers</th>
            </tr>
          </thead>
          <tbody>
            {blockedItems.map(item => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.id}</td>
                <td style={{ ...tdStyle, color: riskColor(item.risk) }}>{item.risk}</td>
                <td style={{ ...tdStyle, color: statusColor(item.status) }}>{item.status}</td>
                <td style={{ ...tdStyle, color: '#ef5350' }}>{item.blockers.join('; ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>Human Owner Approval Board</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Risk</th>
              <th style={thStyle}>Req Human Owner</th>
              <th style={thStyle}>Req Final Seal</th>
              <th style={thStyle}>Blocked Actions</th>
            </tr>
          </thead>
          <tbody>
            {humanOwnerItems.map(item => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.id}</td>
                <td style={{ ...tdStyle, color: riskColor(item.risk) }}>{item.risk}</td>
                <td style={tdStyle}>{item.requiresHumanOwnerApproval ? 'YES' : 'NO'}</td>
                <td style={tdStyle}>{item.requiresFinalSeal ? 'YES' : 'NO'}</td>
                <td style={tdStyle}>{item.blockedActions.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>Evidence / Rollback / Audit Requirement Board</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Req Evidence</th>
              <th style={thStyle}>Req Rollback</th>
              <th style={thStyle}>Req Audit</th>
              <th style={thStyle}>Req DB Policy</th>
              <th style={thStyle}>Req Ext Control Policy</th>
            </tr>
          </thead>
          <tbody>
            {items.filter(i => i.requiresEvidence || i.requiresRollback || i.requiresAudit || i.requiresDbPolicy || i.requiresExternalControlPolicy).map(item => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.id}</td>
                <td style={tdStyle}>{item.requiresEvidence ? 'YES' : 'NO'}</td>
                <td style={tdStyle}>{item.requiresRollback ? 'YES' : 'NO'}</td>
                <td style={tdStyle}>{item.requiresAudit ? 'YES' : 'NO'}</td>
                <td style={tdStyle}>{item.requiresDbPolicy ? 'YES' : 'NO'}</td>
                <td style={tdStyle}>{item.requiresExternalControlPolicy ? 'YES' : 'NO'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>All Review Items</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Area</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Risk</th>
              <th style={thStyle}>Allowed</th>
              <th style={thStyle}>Can Enable C</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={tdStyle}>{item.id}</td>
                <td style={tdStyle}>{item.area}</td>
                <td style={{ ...tdStyle, color: statusColor(item.status) }}>{item.status}</td>
                <td style={{ ...tdStyle, color: riskColor(item.risk) }}>{item.risk}</td>
                <td style={{ ...tdStyle, color: item.allowedNow ? '#66bb6a' : '#ef5350' }}>{item.allowedNow ? 'YES' : 'NO'}</td>
                <td style={{ ...tdStyle, color: '#ef5350' }}>{item.canEnableStageC ? 'YES' : 'NO'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>Forbidden Stage C Notice</div>
        <p style={{ color: '#ef5350', fontSize: 14, fontWeight: 700 }}>
          THIS PAGE IS A READONLY REVIEW PACK. STAGE C IS NOT ENABLED. NO ACTIVATION ACTION IS AVAILABLE.
        </p>
        <p style={{ color: 'var(--text-secondary, #8892b0)', fontSize: 13 }}>
          This review pack documents all 18 items required before Stage C can be discussed. Every item has canEnableStageC=false. No assistant or automated process may enable Stage C. Only the human project owner can make the decision after reviewing all blockers, required docs, required validators, evidence requirements, rollback requirements, audit requirements, DB policy, and external control policy.
        </p>
      </div>
    </PageShell>
  );
}
