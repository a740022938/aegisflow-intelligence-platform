import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import {
  getHandoffPackRegistry,
  getHandoffPackSummary,
} from '../registry/handoff-pack-registry';
import {
  validateHandoffPack,
} from '../registry/handoff-pack-validator';
import {
  runHandoffCheck,
} from '../registry/handoff-pack-checker';
import {
  getReleaseEvidenceMatrix,
  getReleaseEvidenceSummary,
} from '../registry/release-evidence-matrix';

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

const statusColor = (status: string) => {
  switch (status) {
    case 'pass': case 'ready': case 'complete': return '#66bb6a';
    case 'fail': case 'blocked': case 'missing': return '#ef5350';
    case 'pending': case 'partial': return '#ffa726';
    default: return '#757575';
  }
};

const categoryColor = (cat: string) => {
  switch (cat) {
    case 'version': return '#42a5f5';
    case 'validation': return '#66bb6a';
    case 'safety': return '#ef5350';
    case 'restore_point': return '#ffa726';
    case 'gate_review': return '#ab47bc';
    case 'artifact': return '#26c6da';
    case 'seal': return '#880e4f';
    default: return '#757575';
  }
};

const HandoffPackPreview: React.FC = () => {
  const handoffItems = useMemo(() => getHandoffPackRegistry(), []);
  const handoffSummary = useMemo(() => getHandoffPackSummary(), []);
  const validation = useMemo(() => validateHandoffPack(), []);
  const checkResult = useMemo(() => runHandoffCheck(), []);
  const evidence = useMemo(() => getReleaseEvidenceMatrix(), []);
  const evidenceSummary = useMemo(() => getReleaseEvidenceSummary(), []);

  return (
    <PageShell
      title="Handoff Pack"
      subtitle="v7.45-P4 · Release evidence matrix + handoff readiness · Stage C disabled"
      safetyBoundary="readonly"
      safetyText="只读 handoff 预览 · 不执行文件操作 · 不入 sidebar"
    >
      <div style={{ ...sectionStyle, border: '1px solid #ab47bc' }}>
        <div style={{ ...headerStyle, color: '#ab47bc' }}>Handoff Pack Overview</div>
        <div style={gridStyle}>
          <div style={cardStyle}><div style={labelStyle}>Total Entries</div><div style={valueStyle}>{handoffSummary.total}</div></div>
          <div style={cardStyle}><div style={labelStyle}>Ready</div><div style={{ ...valueStyle, color: '#66bb6a' }}>{handoffSummary.ready}</div></div>
          <div style={cardStyle}><div style={labelStyle}>Complete</div><div style={{ ...valueStyle, color: '#66bb6a' }}>{handoffSummary.complete}</div></div>
          <div style={cardStyle}><div style={labelStyle}>Gate Pass</div><div style={{ ...valueStyle, color: handoffSummary.gatePass === handoffSummary.total ? '#66bb6a' : '#ef5350' }}>{handoffSummary.gatePass}/{handoffSummary.total}</div></div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>Handoff Registry</div>
        {handoffItems.map(item => (
          <div key={item.id} style={{ ...cardStyle, marginBottom: 6, borderLeft: `3px solid ${statusColor(item.readiness)}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <strong style={{ fontSize: 13 }}>{item.title}</strong>
              <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 10, fontWeight: 600, background: statusColor(item.readiness), color: '#fff' }}>{item.readiness}</span>
              <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 10, fontWeight: 600, background: statusColor(item.completeness), color: '#fff' }}>{item.completeness}</span>
              <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 10, fontWeight: 600, background: statusColor(item.gateStatus), color: '#fff' }}>{item.gateStatus}</span>
            </div>
            <div style={{ fontSize: 11, color: '#b0bec5' }}>{item.source}</div>
            <div style={{ fontSize: 12, color: '#8892b0', marginTop: 2 }}>{item.note}</div>
          </div>
        ))}
      </div>

      <div style={{ ...sectionStyle, border: '1px solid #26c6da' }}>
        <div style={{ ...headerStyle, color: '#26c6da' }}>Release Evidence Matrix</div>
        <div style={gridStyle}>
          <div style={cardStyle}><div style={labelStyle}>Total</div><div style={valueStyle}>{evidenceSummary.total}</div></div>
          <div style={cardStyle}><div style={labelStyle}>Pass</div><div style={{ ...valueStyle, color: '#66bb6a' }}>{evidenceSummary.pass}</div></div>
          <div style={cardStyle}><div style={labelStyle}>Fail</div><div style={{ ...valueStyle, color: evidenceSummary.fail > 0 ? '#ef5350' : '#66bb6a' }}>{evidenceSummary.fail}</div></div>
          <div style={cardStyle}><div style={labelStyle}>Pending</div><div style={{ ...valueStyle, color: evidenceSummary.pending > 0 ? '#ffa726' : '#66bb6a' }}>{evidenceSummary.pending}</div></div>
        </div>
        {evidence.map(entry => (
          <div key={entry.id} style={{ ...cardStyle, marginBottom: 4, borderLeft: `3px solid ${categoryColor(entry.category)}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: categoryColor(entry.category), textTransform: 'uppercase' }}>{entry.category}</span>
              <strong style={{ fontSize: 13 }}>{entry.label}</strong>
              <span style={{ padding: '2px 6px', borderRadius: 3, fontSize: 10, fontWeight: 600, background: statusColor(entry.status), color: '#fff' }}>{entry.status}</span>
            </div>
            <div style={{ fontSize: 12, color: '#b0bec5' }}>{entry.detail}</div>
            <div style={{ fontSize: 11, color: '#757575' }}>Evidence: {entry.evidence}</div>
          </div>
        ))}
      </div>

      <div style={{ ...sectionStyle, border: '1px solid #880e4f' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>Handoff Checker</div>
        <div style={gridStyle}>
          <div style={cardStyle}><div style={labelStyle}>Pass</div><div style={{ ...valueStyle, color: checkResult.pass ? '#66bb6a' : '#ef5350' }}>{checkResult.pass ? 'PASS' : 'FAIL'}</div></div>
          <div style={cardStyle}><div style={labelStyle}>Fail</div><div style={{ ...valueStyle, color: checkResult.fail > 0 ? '#ef5350' : '#66bb6a' }}>{checkResult.fail}</div></div>
          <div style={cardStyle}><div style={labelStyle}>Total</div><div style={valueStyle}>{checkResult.total}</div></div>
        </div>
        {(['readiness', 'completeness', 'safety', 'gate'] as const).map(area => (
          <div key={area} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: checkResult.summary[area].pass === checkResult.summary[area].total ? '#66bb6a' : '#ffa726', textTransform: 'capitalize', marginBottom: 4 }}>
              {area}: {checkResult.summary[area].pass}/{checkResult.summary[area].total} pass
            </div>
            {checkResult.checks.filter(c => c.area === area).map(c => (
              <div key={c.id} style={{ fontSize: 12, color: c.pass ? '#66bb6a' : '#ef5350', marginLeft: 12 }}>
                {c.pass ? '✓' : '✗'} {c.label} — {c.detail}
              </div>
            ))}
          </div>
        ))}
      </div>

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

export default HandoffPackPreview;
