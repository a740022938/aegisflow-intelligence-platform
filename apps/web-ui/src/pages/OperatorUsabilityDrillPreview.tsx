import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import {
  getOperatorUsabilityDrillRegistry,
  getOperatorUsabilityDrillSummary,
} from '../registry/operator-usability-drill-registry';
import {
  validateUsabilityDrill,
} from '../registry/operator-usability-drill-validator';

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
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 8,
  marginBottom: 12,
};

const cardStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: 'var(--bg-item, #16213e)',
  borderRadius: 4,
  border: '1px solid var(--border-color, #2a2a4a)',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-secondary, #8892b0)',
  textTransform: 'uppercase',
};

const valueStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: 'var(--text-primary, #e0e0e0)',
};

const confidenceColor = (level: string) => {
  switch (level) {
    case 'high': return '#66bb6a';
    case 'medium': return '#ffa726';
    case 'low': return '#ef5350';
    default: return '#757575';
  }
};

const OperatorUsabilityDrillPreview: React.FC = () => {
  const items = useMemo(() => getOperatorUsabilityDrillRegistry(), []);
  const summary = useMemo(() => getOperatorUsabilityDrillSummary(), []);
  const validation = useMemo(() => validateUsabilityDrill(), []);

  return (
    <PageShell
      title="Operator Usability Drill"
      subtitle="v7.44-P3 · Readonly usability drill · Repair / Memory / Authorization · Stage C disabled"
      safetyBoundary="readonly"
      safetyText="只读可用性测试 · 不执行动作 · 不写数据库 · 不启用 Stage C · 不入 sidebar"
    >
      {/* Summary */}
      <div style={{ ...sectionStyle, border: '1px solid #42a5f5' }}>
        <div style={{ ...headerStyle, color: '#42a5f5' }}>Drill Summary</div>
        <div style={gridStyle}>
          <div style={cardStyle}><div style={labelStyle}>Total Scenarios</div><div style={valueStyle}>{summary.total}</div></div>
          <div style={cardStyle}><div style={labelStyle}>Verified</div><div style={{ ...valueStyle, color: '#66bb6a' }}>{summary.verified}</div></div>
          <div style={cardStyle}><div style={labelStyle}>High Confidence</div><div style={{ ...valueStyle, color: '#66bb6a' }}>{summary.highConfidence}</div></div>
        </div>
      </div>

      {/* Scenarios */}
      <div style={sectionStyle}>
        <div style={headerStyle}>Drill Scenarios</div>
        {items.map(scenario => (
          <div key={scenario.id} style={{
            ...cardStyle,
            marginBottom: 12,
            border: '1px solid var(--border-color, #2a2a4a)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{
                minWidth: 24,
                height: 24,
                borderRadius: '50%',
                background: '#263238',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 11,
                color: '#e0e0e0',
              }}>{scenario.scenarioNumber}</div>
              <strong style={{ fontSize: 14 }}>{scenario.title}</strong>
              <span style={{
                padding: '2px 6px',
                borderRadius: 3,
                fontSize: 10,
                fontWeight: 600,
                background: scenario.status === 'verified' ? '#388e3c' : '#f57c00',
                color: '#fff',
              }}>{scenario.status}</span>
              <span style={{
                padding: '2px 6px',
                borderRadius: 3,
                fontSize: 10,
                fontWeight: 600,
                background: confidenceColor(scenario.confidence),
                color: '#fff',
              }}>{scenario.confidence}</span>
            </div>
            <div style={{ fontSize: 12, color: '#b0bec5', marginBottom: 2 }}>
              <strong>Trigger:</strong> {scenario.trigger}
            </div>
            <div style={{ fontSize: 12, color: '#b0bec5', marginBottom: 2 }}>
              <strong>Action:</strong> {scenario.action}
            </div>
            <div style={{ fontSize: 12, color: '#b0bec5', marginBottom: 2 }}>
              <strong>Expected:</strong> {scenario.expectedResult}
            </div>
            <div style={{ fontSize: 11, color: '#ffa726', marginTop: 2 }}>
              <strong>Safety:</strong> {scenario.safetyNote}
            </div>
          </div>
        ))}
      </div>

      {/* Safety Summary */}
      <div style={{ ...sectionStyle, border: '2px solid #880e4f' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>Safety Summary</div>
        <ul style={{ fontSize: 13, lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
          <li>All scenarios completed without modifying state</li>
          <li>Repair remains plan-only — no file modification</li>
          <li>Memory remains readonly — no runtime mutation</li>
          <li>Authorization review remains preview-only — no auth accepted</li>
          <li>Stage C remains <strong>DISABLED</strong></li>
          <li>Feature flag remains <strong>OFF</strong></li>
          <li>POST runtime remains <strong>BLOCKED</strong></li>
        </ul>
      </div>

      {/* Validator */}
      <div style={sectionStyle}>
        <div style={headerStyle}>Validator</div>
        <div style={gridStyle}>
          <div style={cardStyle}><div style={labelStyle}>Pass</div><div style={{ ...valueStyle, color: validation.pass ? '#66bb6a' : '#ef5350' }}>{validation.pass ? 'PASS' : 'FAIL'}</div></div>
          <div style={cardStyle}><div style={labelStyle}>Blocking</div><div style={{ ...valueStyle, color: validation.blocking > 0 ? '#ef5350' : '#66bb6a' }}>{validation.blocking}</div></div>
          <div style={cardStyle}><div style={labelStyle}>Warning</div><div style={{ ...valueStyle, color: validation.warning > 0 ? '#ffa726' : '#66bb6a' }}>{validation.warning}</div></div>
          <div style={cardStyle}><div style={labelStyle}>Checks</div><div style={valueStyle}>{validation.total}</div></div>
        </div>
        {validation.checks.filter(c => !c.pass).map((c, i) => (
          <div key={`vc-${i}`} style={{ fontSize: 12, color: c.level === 'blocking' ? '#ef5350' : '#ffa726', marginTop: 4 }}>
            {c.level === 'blocking' ? '⛔ ' : '⚠ '}{c.message}
          </div>
        ))}
      </div>
    </PageShell>
  );
};

export default OperatorUsabilityDrillPreview;
