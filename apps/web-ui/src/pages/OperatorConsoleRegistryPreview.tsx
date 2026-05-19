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
  padding: 16,
  background: 'var(--bg-card, #1a1a2e)',
  borderRadius: 8,
  border: '1px solid var(--border-color, #2a2a4a)',
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
  fontSize: 20,
  fontWeight: 700,
  color: 'var(--text-primary, #e0e0e0)',
};

const itemRowStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--border-color, #2a2a4a)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: 13,
};

const badgeStyle = (color: string): React.CSSProperties => ({
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
  background: color,
  color: '#fff',
});

const OperatorConsoleRegistryPreview: React.FC = () => {
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

  return (
    <PageShell
      title="Operator Console Registry Preview"
      subtitle="v7.33.0-P1 · Readonly registry preview for Operator Console modules · P2 Readonly UI Preview available"
      safetyBoundary="readonly"
      safetyText="只读预览 · 不执行动作 · 不写数据库 · 不启用 Stage C · 不入 sidebar"
    >
      {/* A. Seal Baseline */}
      <div style={{ ...sectionStyle, border: '1px solid #66bb6a' }}>
        <div style={{ ...headerStyle, color: '#66bb6a' }}>A. Seal Baseline</div>
        <div style={gridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>v7.32 Verdict</div>
            <div style={{ ...statValueStyle, fontSize: 14 }}>V7_32_PRODUCTIZATION_SEAL_READY</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>v7.33 D1 Verdict</div>
            <div style={{ ...statValueStyle, fontSize: 14 }}>V7_33_D1_OPERATOR_CONSOLE_BLUEPRINT_READY</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Stage C</div>
            <div style={{ ...statValueStyle, fontSize: 14, color: '#ef5350' }}>Disabled</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>POST Runtime</div>
            <div style={{ ...statValueStyle, fontSize: 14, color: '#ef5350' }}>Blocked</div>
          </div>
        </div>
      </div>

      {/* B. Validator Summary */}
      <div style={sectionStyle}>
        <div style={headerStyle}>B. Validator Summary</div>
        <div style={gridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Pass</div>
            <div style={{ ...statValueStyle, color: validation.pass ? '#66bb6a' : '#ef5350' }}>
              {validation.pass ? 'YES' : 'NO'}
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Blocking</div>
            <div style={{ ...statValueStyle, color: validation.blocking > 0 ? '#ef5350' : '#66bb6a' }}>
              {validation.blocking}
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Warning</div>
            <div style={{ ...statValueStyle, color: validation.warning > 0 ? '#ffa726' : '#66bb6a' }}>
              {validation.warning}
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Info</div>
            <div style={statValueStyle}>{validation.info}</div>
          </div>
        </div>
        {validation.checks.filter(c => !c.pass).map((c, i) => (
          <div key={`c-${i}`} style={{ fontSize: 12, color: c.level === 'blocking' ? '#ef5350' : '#ffa726', marginTop: 4 }}>
            {c.level === 'blocking' ? '⛔ ' : '⚠ '}{c.message}
          </div>
        ))}
      </div>

      {/* C. Domain Coverage */}
      <div style={sectionStyle}>
        <div style={headerStyle}>C. Domain Coverage</div>
        <div style={gridStyle}>
          {domains.map(domain => (
            <div key={domain} style={statCardStyle}>
              <div style={statLabelStyle}>{domain}</div>
              <div style={statValueStyle}>{getOperatorConsoleByDomain(domain).length}</div>
            </div>
          ))}
        </div>
      </div>

      {/* D. Registry Overview */}
      <div style={sectionStyle}>
        <div style={headerStyle}>D. Registry Overview</div>
        <div style={gridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Total Items</div>
            <div style={statValueStyle}>{summary.total}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>High/Critical Risk</div>
            <div style={{ ...statValueStyle, color: '#ef5350' }}>{summary.highOrCritical}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Sealed</div>
            <div style={{ ...statValueStyle, color: '#66bb6a' }}>{summary.sealed}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Allowed (view only)</div>
            <div style={{ ...statValueStyle, color: '#66bb6a' }}>{summary.allowedNow}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Stage C Required</div>
            <div style={{ ...statValueStyle, color: '#ffa726' }}>{summary.stageCRequired}</div>
          </div>
        </div>
      </div>

      {/* E. Boundary Cards */}
      <div style={{ ...sectionStyle, border: '2px solid #880e4f' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>E. Critical Boundaries</div>
        {items.filter(i => i.domain === 'boundary').map(item => (
          <div key={item.id} style={itemRowStyle}>
            <div>
              <strong>{item.title}</strong>
              <span style={{ marginLeft: 8, ...badgeStyle(riskColor(item.riskLevel)) }}>{item.riskLevel}</span>
              <span style={{ marginLeft: 8, ...badgeStyle('#b71c1c') }}>{item.status}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary, #8892b0)', maxWidth: 400 }}>
              {item.summary}
            </div>
          </div>
        ))}
      </div>

      {/* F. Full Registry Table */}
      <div style={sectionStyle}>
        <div style={headerStyle}>F. Full Registry Table</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginBottom: 8 }}>
          {items.length} items — sorted by domain
        </div>
        {domains.map(domain => (
          <div key={domain} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#4fc3f7' }}>
              {domain} ({getOperatorConsoleByDomain(domain).length})
            </div>
            {items.filter(i => i.domain === domain).map(item => (
              <div key={item.id} style={itemRowStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600 }}>{item.title}</span>
                  <span style={badgeStyle(riskColor(item.riskLevel))}>{item.riskLevel}</span>
                  <span style={{ ...badgeStyle(
                    item.status === 'sealed' ? '#388e3c' :
                    item.status === 'ready' ? '#1976d2' :
                    item.status === 'blocked' ? '#b71c1c' :
                    item.status === 'deferred' ? '#f57c00' : '#757575'
                  )}}>
                    {item.status}
                  </span>
                  {item.linkedPreviewRoute && (
                    <a href={item.linkedPreviewRoute} style={{ color: '#42a5f5', fontSize: 11, textDecoration: 'underline' }}>
                      preview
                    </a>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary, #8892b0)', maxWidth: 350 }}>
                  {item.summary.substring(0, 60)}...
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* G. Operator Next Step */}
      <div style={{ ...sectionStyle, border: '1px solid #42a5f5' }}>
        <div style={{ ...headerStyle, color: '#42a5f5' }}>G. Operator Next Step</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Open Operator Console Registry Preview to review current module status</li>
            <li>Open <a href="/operator-console-readonly-preview" style={{ color: '#42a5f5' }}>Operator Console Readonly UI Preview (P2)</a> for operator decision support UI</li>
            <li>Review seal baseline and blocker matrix before phase transitions</li>
            <li>Reference boundary cards to confirm disabled capabilities</li>
            <li>Navigate to linked preview routes for detailed contract/design views</li>
            <li>Use operator checklist (manual, not auto-executed) for decision support</li>
          </ol>
        </div>
      </div>

      {/* H. Forbidden Actions Notice */}
      <div style={{ ...sectionStyle, border: '2px solid #ef5350' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>H. Forbidden Actions Notice</div>
        <ul style={{ fontSize: 13, lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
          <li>Operator Console is read-only — no action buttons, no POST forms, no execute buttons</li>
          <li>Stage C is permanently disabled — no enablement button or API</li>
          <li>POST runtime endpoints are permanently blocked — no implementation in any phase</li>
          <li>DB write is permanently blocked — no write path in runtime module</li>
          <li>External control is permanently blocked — no external API calls from runtime</li>
          <li>Runtime executor is absent — no spawn, exec, or action trigger capability</li>
          <li>Connector action is absent — no connector control from Operator Console</li>
          <li>The Operator Console is NOT in any sidebar — hidden direct route only</li>
        </ul>
      </div>
    </PageShell>
  );
};

export default OperatorConsoleRegistryPreview;
