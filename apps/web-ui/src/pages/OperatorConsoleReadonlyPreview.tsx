import React from 'react';
import PageShell from '../components/ui/PageShell';
import {
  getOperatorConsoleRegistry,
  getOperatorConsoleSummary,
  getOperatorConsoleByDomain,
} from '../registry/operator-console-registry';
import {
  validateOperatorConsoleRegistry,
} from '../registry/operator-console-validator';

const sectionStyle: React.CSSProperties = {
  marginBottom: 24,
  padding: 20,
  background: 'var(--bg-card, #1a1a2e)',
  borderRadius: 8,
  border: '1px solid var(--border-color, #2a2a4a)',
};

const headerStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 16,
  color: 'var(--text-primary, #e0e0e0)',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 10,
  marginBottom: 12,
};

const cardStyle: React.CSSProperties = {
  padding: '12px 16px',
  background: 'var(--bg-item, #16213e)',
  borderRadius: 6,
  border: '1px solid var(--border-color, #2a2a4a)',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-secondary, #8892b0)',
  textTransform: 'uppercase',
  marginBottom: 4,
};

const valueStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: 'var(--text-primary, #e0e0e0)',
};

const rowStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--border-color, #2a2a4a)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: 13,
};

const badgeStyle = (color: string): React.CSSProperties => ({
  padding: '2px 10px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
  background: color,
  color: '#fff',
  display: 'inline-block',
});

const OperatorConsoleReadonlyPreview: React.FC = () => {
  const items = getOperatorConsoleRegistry();
  const summary = getOperatorConsoleSummary();
  const validation = validateOperatorConsoleRegistry();

  const domains = [...new Set(items.map(i => i.domain))].sort();

  const riskColor = (level: string) => {
    switch (level) {
      case 'low': return '#388e3c';
      case 'medium': return '#f57c00';
      case 'high': return '#d32f2f';
      case 'critical': return '#880e4f';
      default: return '#757575';
    }
  };

  const systemReadinessItems = [
    { title: 'Runtime Readonly API', status: 'sealed', color: '#66bb6a' },
    { title: 'Governance Console', status: 'ready', color: '#42a5f5' },
    { title: 'Human Approval', status: 'ready', color: '#42a5f5' },
    { title: 'Permission Evaluator', status: 'ready', color: '#42a5f5' },
    { title: 'Evidence Schema', status: 'ready', color: '#42a5f5' },
    { title: 'Audit Readiness', status: 'ready', color: '#42a5f5' },
    { title: 'Rollback / Recovery', status: 'ready', color: '#42a5f5' },
    { title: 'Operator Checklist', status: 'ready', color: '#42a5f5' },
  ];

  const safetyBoundaries = [
    { label: 'Stage C', status: 'disabled', color: '#ef5350' },
    { label: 'POST Runtime', status: 'blocked', color: '#ef5350' },
    { label: 'DB Write', status: 'not occurred', color: '#ef5350' },
    { label: 'External Control', status: 'not occurred', color: '#ef5350' },
    { label: 'Executor', status: 'absent', color: '#ef5350' },
    { label: 'Connector Action', status: 'absent', color: '#ef5350' },
  ];

  const smokeEvidence = [
    { label: 'Latest Live Smoke', value: 'v7.32-P1', color: '#66bb6a' },
    { label: 'GET Smoke', value: 'PASS (4/4)', color: '#66bb6a' },
    { label: 'POST Blocked', value: 'PASS (4/4)', color: '#66bb6a' },
    { label: 'Stale Server 401', value: 'RESOLVED', color: '#66bb6a' },
    { label: 'Report', value: 'E:\\_AIP_REPORTS\\AIP_v7.32.0_P2_productization_seal_recheck_report_20260519.md' },
    { label: 'Receipt', value: 'E:\\_AIP_RECEIPTS\\AIP_v7.32.0_P2_productization_seal_recheck_receipt_20260519.md' },
  ];

  const highCriticalRisks = items.filter(
    i => i.riskLevel === 'high' || i.riskLevel === 'critical'
  );

  return (
    <PageShell
      title="Operator Console Readonly UI Preview"
      subtitle="v7.33.0-P2 · Readonly UI preview for operator decision support · Stage C disabled · POST blocked"
      safetyBoundary="readonly"
      safetyText="只读 UI 预览 · 不执行动作 · 不写数据库 · 不启用 Stage C · 不入 sidebar"
    >
      {/* 1. Hero / Seal Baseline */}
      <div style={{ ...sectionStyle, border: '1px solid #66bb6a' }}>
        <div style={{ ...headerStyle, color: '#66bb6a' }}>1. Seal Baseline</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.32 Verdict</div>
            <div style={{ ...valueStyle, fontSize: 13 }}>V7_32_PRODUCTIZATION_SEAL_READY</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.33 D1 Verdict</div>
            <div style={{ ...valueStyle, fontSize: 13 }}>V7_33_D1_OPERATOR_CONSOLE_BLUEPRINT_READY</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.33 P1 Verdict</div>
            <div style={{ ...valueStyle, fontSize: 13 }}>V7_33_P1_OPERATOR_CONSOLE_REGISTRY_PREVIEW_READY</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Current Phase</div>
            <div style={{ ...valueStyle, fontSize: 13, color: '#42a5f5' }}>v7.33.0-P2 Readonly UI Preview</div>
          </div>
        </div>
      </div>

      {/* 2. System Readiness Cards */}
      <div style={sectionStyle}>
        <div style={headerStyle}>2. System Readiness</div>
        <div style={gridStyle}>
          {systemReadinessItems.map((r, i) => (
            <div key={`sr-${i}`} style={cardStyle}>
              <div style={labelStyle}>{r.title}</div>
              <div style={{ ...badgeStyle(r.color), marginTop: 4 }}>{r.status}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)' }}>
          Status sourced from P1 Operator Console Registry. All modules are readonly.
        </div>
      </div>

      {/* 3. Safety Boundary Strip */}
      <div style={{ ...sectionStyle, border: '2px solid #880e4f' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>3. Safety Boundary Strip</div>
        <div style={gridStyle}>
          {safetyBoundaries.map((b, i) => (
            <div key={`sb-${i}`} style={cardStyle}>
              <div style={labelStyle}>{b.label}</div>
              <div style={{ ...badgeStyle(b.color), marginTop: 4 }}>{b.status}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#ef9a9a', lineHeight: 1.6 }}>
          These safety boundaries are enforced at architecture level. No runtime implementation exists.
          No bypass is possible from any Operator Console page or route.
        </div>
      </div>

      {/* 4. Smoke Evidence Panel */}
      <div style={{ ...sectionStyle, border: '1px solid #66bb6a' }}>
        <div style={{ ...headerStyle, color: '#66bb6a' }}>4. Smoke Evidence Panel</div>
        <div style={gridStyle}>
          {smokeEvidence.map((s, i) => (
            <div key={`se-${i}`} style={cardStyle}>
              <div style={labelStyle}>{s.label}</div>
              <div style={{ ...valueStyle, fontSize: 13, color: s.color || 'var(--text-secondary)' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)' }}>
          Smoke evidence is historical and readonly. No new evidence is captured from this panel.
        </div>
        <div style={{ fontSize: 12, color: '#42a5f5', marginTop: 4 }}>
          <a href="/operator-console-registry-preview" style={{ color: '#42a5f5' }}>
            View Registry Preview →
          </a>
          <span style={{ marginLeft: 16 }}>
            <a href="/runtime-readonly-status-api-preview" style={{ color: '#42a5f5' }}>
              View Runtime Status API Preview →
            </a>
          </span>
        </div>
      </div>

      {/* 5. Risk / Blocker Matrix */}
      <div style={{ ...sectionStyle, border: '1px solid #ffa726' }}>
        <div style={{ ...headerStyle, color: '#ffa726' }}>5. Risk / Blocker Matrix</div>
        <div style={{ fontSize: 13, marginBottom: 12, color: 'var(--text-secondary, #8892b0)' }}>
          {highCriticalRisks.length} high/critical risk items identified. All are intentional and permanent.
          No action is available to modify or bypass any risk item.
        </div>
        {highCriticalRisks.map(item => (
          <div key={item.id} style={rowStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</span>
              <span style={badgeStyle(riskColor(item.riskLevel))}>{item.riskLevel}</span>
              <span style={{ ...badgeStyle('#37474f') }}>{item.status}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary, #8892b0)', maxWidth: 400 }}>
              {item.summary.substring(0, 80)}
            </div>
          </div>
        ))}
      </div>

      {/* 6. Registry Coverage Panel */}
      <div style={sectionStyle}>
        <div style={headerStyle}>6. Registry Coverage</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Registry Items</div>
            <div style={valueStyle}>{summary.total}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Domains</div>
            <div style={valueStyle}>{domains.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Validator</div>
            <div style={{ ...valueStyle, color: validation.pass ? '#66bb6a' : '#ef5350' }}>
              {validation.pass ? 'PASS' : 'FAIL'}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Allowed (view only)</div>
            <div style={valueStyle}>{summary.allowedNow}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>High/Critical Risk</div>
            <div style={{ ...valueStyle, color: '#ef5350' }}>{summary.highOrCritical}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Blocking / Warning / Info</div>
            <div style={{ ...valueStyle, fontSize: 13 }}>
              {validation.blocking} / {validation.warning} / {validation.info}
            </div>
          </div>
        </div>
        <div style={gridStyle}>
          {domains.map(domain => (
            <div key={domain} style={{ ...cardStyle, padding: '6px 12px' }}>
              <div style={labelStyle}>{domain}</div>
              <div style={valueStyle}>{getOperatorConsoleByDomain(domain).length}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Operator Next Step Panel */}
      <div style={{ ...sectionStyle, border: '1px solid #42a5f5' }}>
        <div style={{ ...headerStyle, color: '#42a5f5' }}>7. Operator Next Step</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Review system readiness cards to confirm all modules are sealed or ready</li>
            <li>Verify safety boundary strip — Stage C disabled, POST blocked, all boundaries intact</li>
            <li>Check smoke evidence panel for latest historical smoke results</li>
            <li>Review risk / blocker matrix — acknowledge all high/critical risks are permanent</li>
            <li>Browse P1 Registry Preview for detailed registry item breakdown</li>
            <li>Do not enter Stage C — no enablement button exists on any Operator Console page</li>
          </ol>
        </div>
        <div style={{ marginTop: 12, padding: 12, background: '#1a1a2e', borderRadius: 4, border: '1px solid #2a2a4a' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ffa726' }}>Next Phase Recommendation</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginTop: 4 }}>
            v7.33.0-P3: Operator Checklist + Evidence Linkage Preview (readonly)
          </div>
          <div style={{ fontSize: 12, color: '#ef5350', marginTop: 4, fontWeight: 600 }}>
            Do not enter Stage C.
          </div>
        </div>
      </div>

      {/* Forbidden Actions Notice */}
      <div style={{ ...sectionStyle, border: '2px solid #ef5350' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>8. Forbidden Actions Notice</div>
        <ul style={{ fontSize: 12, lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
          <li>Operator Console UI Preview is read-only — no action buttons, no POST forms, no execute buttons</li>
          <li>Stage C is permanently disabled — no enablement button or API exists</li>
          <li>POST runtime endpoints are permanently blocked — no implementation in any phase</li>
          <li>DB write is permanently blocked — no write path in runtime module</li>
          <li>External control is permanently blocked — no external API calls from runtime</li>
          <li>Runtime executor is absent — no spawn, exec, or action trigger capability</li>
          <li>Connector action is absent — no connector control from Operator Console</li>
          <li>The Operator Console is NOT in any sidebar — hidden direct route only</li>
          <li>No evidence capture, no audit write, no approval mutation, no rollback execution</li>
          <li>No file modification, no git mutation, no tag, no release</li>
        </ul>
      </div>
    </PageShell>
  );
};

export default OperatorConsoleReadonlyPreview;
