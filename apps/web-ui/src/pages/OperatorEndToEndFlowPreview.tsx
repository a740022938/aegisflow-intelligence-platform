import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import {
  getOperatorE2EFlowRegistry,
  getOperatorE2EFlowSummary,
} from '../registry/operator-e2e-flow-registry';
import {
  validateE2EFlow,
} from '../registry/operator-e2e-flow-validator';

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

const toolColor = (tool: string) => {
  switch (tool) {
    case 'cli': return '#42a5f5';
    case 'web': return '#66bb6a';
    case 'both': return '#ab47bc';
    default: return '#757575';
  }
};

const OperatorEndToEndFlowPreview: React.FC = () => {
  const items = useMemo(() => getOperatorE2EFlowRegistry(), []);
  const summary = useMemo(() => getOperatorE2EFlowSummary(), []);
  const validation = useMemo(() => validateE2EFlow(), []);

  return (
    <PageShell
      title="Operator End-to-End Flow"
      subtitle="v7.44-P1 · Complete operator flow from CLI to Web Console · Stage C disabled"
      safetyBoundary="readonly"
      safetyText="只读流程图 · 不执行动作 · 不写数据库 · 不启用 Stage C · 不入 sidebar"
    >
      {/* 1. Current Baseline */}
      <div style={{ ...sectionStyle, border: '1px solid #66bb6a' }}>
        <div style={{ ...headerStyle, color: '#66bb6a' }}>1. Current Baseline</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Head</div>
            <div style={{ ...valueStyle, fontSize: 14 }}>32e8d53 (v7.44 D1)</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Branch</div>
            <div style={{ ...valueStyle, fontSize: 14 }}>main</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Working Tree</div>
            <div style={{ ...valueStyle, fontSize: 14, color: '#66bb6a' }}>Clean</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Stage C</div>
            <div style={{ ...valueStyle, fontSize: 14, color: '#ef5350' }}>Disabled</div>
          </div>
        </div>
      </div>

      {/* 2. Command Entry */}
      <div style={sectionStyle}>
        <div style={headerStyle}>2. Command Entry</div>
        <div style={{ fontSize: 13, lineHeight: 2, padding: '0 4px' }}>
          <code style={{ background: '#263238', padding: '2px 6px', borderRadius: 3 }}>aip</code>
          {' '}— Main CLI entry point with color-coded command center
        </div>
        <div style={{ fontSize: 13, lineHeight: 2, padding: '0 4px', marginTop: 4 }}>
          <code style={{ background: '#263238', padding: '2px 6px', borderRadius: 3 }}>aip where</code>
          {' '}— Phase context: branch, HEAD, working tree
        </div>
      </div>

      {/* 3. Safe Status Snapshot */}
      <div style={{ ...sectionStyle, border: '1px solid #42a5f5' }}>
        <div style={{ ...headerStyle, color: '#42a5f5' }}>3. Safe Status Snapshot</div>
        <div style={gridStyle}>
          <div style={cardStyle}><div style={labelStyle}>Stage C</div><div style={{ ...valueStyle, color: '#ef5350' }}>Disabled</div></div>
          <div style={cardStyle}><div style={labelStyle}>Feature Flag</div><div style={{ ...valueStyle, color: '#ef5350' }}>OFF</div></div>
          <div style={cardStyle}><div style={labelStyle}>POST Runtime</div><div style={{ ...valueStyle, color: '#66bb6a' }}>Blocked</div></div>
          <div style={cardStyle}><div style={labelStyle}>DB Write</div><div style={{ ...valueStyle, color: '#66bb6a' }}>Blocked</div></div>
          <div style={cardStyle}><div style={labelStyle}>Executor</div><div style={{ ...valueStyle, color: '#66bb6a' }}>Absent</div></div>
          <div style={cardStyle}><div style={labelStyle}>External Control</div><div style={{ ...valueStyle, color: '#66bb6a' }}>Blocked</div></div>
          <div style={cardStyle}><div style={labelStyle}>Connector Action</div><div style={{ ...valueStyle, color: '#66bb6a' }}>Blocked</div></div>
          <div style={cardStyle}><div style={labelStyle}>Sidebar Exposure</div><div style={{ ...valueStyle, color: '#66bb6a' }}>None</div></div>
        </div>
      </div>

      {/* 4. Runtime Readiness Summary */}
      <div style={sectionStyle}>
        <div style={headerStyle}>4. Runtime Readiness Summary</div>
        <div style={{ fontSize: 13, lineHeight: 2, padding: '0 4px' }}>
          <strong>Operator Runtime Readiness Console</strong> — 30 registry items across 8 categories
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, padding: '0 4px' }}>
          Route: <code style={{ background: '#263238', padding: '2px 4px', borderRadius: 3 }}>/operator-runtime-readiness-console-preview</code>
          {' '}· Hidden direct · Not in sidebar
        </div>
      </div>

      {/* 5. Repair Plan-only Summary */}
      <div style={sectionStyle}>
        <div style={headerStyle}>5. Repair Plan-only Summary</div>
        <div style={{ fontSize: 12, color: '#f57c00', marginBottom: 8 }}>
          All repair commands are plan-only. Source restore blocked. Full restore forbidden.
        </div>
        <div style={{ fontSize: 13, lineHeight: 2, padding: '0 4px' }}>
          <code style={{ background: '#263238', padding: '2px 6px', borderRadius: 3 }}>aip repair plan</code>
          {' '}— Generates JSON+MD repair plan
        </div>
        <div style={{ fontSize: 13, lineHeight: 2, padding: '0 4px' }}>
          <code style={{ background: '#263238', padding: '2px 6px', borderRadius: 3 }}>aip repair restore-point</code>
          {' '}— View-only restore point listing
        </div>
      </div>

      {/* 6. Memory Baseline Summary */}
      <div style={sectionStyle}>
        <div style={headerStyle}>6. Memory Baseline Summary</div>
        <div style={gridStyle}>
          <div style={cardStyle}><div style={labelStyle}>Current Baseline</div><div style={{ ...valueStyle, fontSize: 13, color: '#66bb6a' }}>Verified</div></div>
          <div style={cardStyle}><div style={labelStyle}>v7.25–v7.40</div><div style={{ ...valueStyle, fontSize: 13, color: '#66bb6a' }}>Verified</div></div>
          <div style={cardStyle}><div style={labelStyle}>Pre-v7.25</div><div style={{ ...valueStyle, fontSize: 13, color: '#ffa726' }}>Historical</div></div>
          <div style={cardStyle}><div style={labelStyle}>Desktop Packs</div><div style={{ ...valueStyle, fontSize: 13, color: '#78909c' }}>Reference</div></div>
        </div>
      </div>

      {/* 7. Authorization Review Summary */}
      <div style={{ ...sectionStyle, border: '1px solid #880e4f' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>7. Authorization Review Summary</div>
        <div style={{ fontSize: 13, lineHeight: 2, padding: '0 4px' }}>
          <strong>Stage C Authorization Review Pack</strong> — 12 requirements, all Not Satisfied
        </div>
        <div style={{ fontSize: 12, color: '#ef5350', marginTop: 4, padding: '0 4px' }}>
          ⛔ Stage C remains DISABLED. No authorization has been granted.
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, padding: '0 4px' }}>
          Route: <code style={{ background: '#263238', padding: '2px 4px', borderRadius: 3 }}>/stage-c-authorization-review-pack-preview</code>
          {' '}· Hidden direct · Not in sidebar
        </div>
      </div>

      {/* 8. Operator Decision Recommendation */}
      <div style={{ ...sectionStyle, border: '1px solid #ffa726' }}>
        <div style={{ ...headerStyle, color: '#ffa726' }}>8. Operator Decision Recommendation</div>
        <div style={{ fontSize: 13, lineHeight: 2, padding: '0 4px' }}>
          Decision state: <strong style={{ color: '#ef5350' }}>BLOCKED_NEEDS_AUTHORIZATION</strong>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, padding: '0 4px' }}>
          Recommendation: Stage C operations require explicit human authorization via the Authorization Review Pack process. No enablement without authorization.
        </div>
      </div>

      {/* 9. Receipt Output Preview */}
      <div style={sectionStyle}>
        <div style={headerStyle}>9. Receipt Output Preview</div>
        <pre style={{
          background: '#1a1a2e',
          border: '1px solid #2a2a4a',
          borderRadius: 4,
          padding: 12,
          fontSize: 12,
          lineHeight: 1.6,
          overflow: 'auto',
          color: '#e0e0e0',
        }}>
{`# AIP v7.44 — <PHASE> Receipt

**Head Commit:** <HEAD>
**Branch:** main
**Working Tree:** clean

## Verdict
<V7_44_VERDICT>
`}
        </pre>
      </div>

      {/* Flow Overview */}
      <div style={sectionStyle}>
        <div style={headerStyle}>Complete Flow Overview</div>
        <div style={gridStyle}>
          <div style={cardStyle}><div style={labelStyle}>Total Steps</div><div style={valueStyle}>{summary.total}</div></div>
          <div style={cardStyle}><div style={labelStyle}>CLI Steps</div><div style={{ ...valueStyle, color: '#42a5f5' }}>{summary.cli}</div></div>
          <div style={cardStyle}><div style={labelStyle}>Web Steps</div><div style={{ ...valueStyle, color: '#66bb6a' }}>{summary.web}</div></div>
          <div style={cardStyle}><div style={labelStyle}>Both</div><div style={{ ...valueStyle, color: '#ab47bc' }}>{summary.both}</div></div>
        </div>
        {items.map(item => (
          <div key={item.id} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '10px 12px',
            borderBottom: '1px solid var(--border-color, #2a2a4a)',
            fontSize: 13,
          }}>
            <div style={{
              minWidth: 28,
              height: 28,
              borderRadius: '50%',
              background: '#263238',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12,
              color: '#e0e0e0',
            }}>{item.stepNumber}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <strong>{item.title}</strong>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: 3,
                  fontSize: 10,
                  fontWeight: 600,
                  background: toolColor(item.tool),
                  color: '#fff',
                }}>{item.tool}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                <code style={{ background: '#263238', padding: '1px 4px', borderRadius: 2, fontSize: 11 }}>{item.action}</code>
                {' — '}{item.description}
              </div>
            </div>
          </div>
        ))}
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

export default OperatorEndToEndFlowPreview;
