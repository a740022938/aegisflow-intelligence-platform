import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import {
  getRestorePointPackRegistry,
  getRestorePointPackSummary,
} from '../registry/restore-point-pack-registry';
import {
  validateRestorePointPack,
} from '../registry/restore-point-pack-validator';

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

const sectionColor = (section: string) => {
  switch (section) {
    case 'design': return '#42a5f5';
    case 'policy': return '#ffa726';
    case 'safety': return '#ef5350';
    default: return '#757575';
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case 'specified': return '#66bb6a';
    case 'pending': return '#ffa726';
    case 'plan-only': return '#42a5f5';
    default: return '#757575';
  }
};

const RestorePointPackPreview: React.FC = () => {
  const items = useMemo(() => getRestorePointPackRegistry(), []);
  const summary = useMemo(() => getRestorePointPackSummary(), []);
  const validation = useMemo(() => validateRestorePointPack(), []);

  return (
    <PageShell
      title="Restore Point Pack"
      subtitle="v7.45-P2 · Plan-only restore point design · Stage C disabled"
      safetyBoundary="readonly"
      safetyText="只读恢复点设计 · 不执行文件操作 · 不捕获秘密 · 不入 sidebar"
    >
      <div style={{ ...sectionStyle, border: '1px solid #ffa726' }}>
        <div style={{ ...headerStyle, color: '#ffa726' }}>Restore Point Pack Overview</div>
        <div style={gridStyle}>
          <div style={cardStyle}><div style={labelStyle}>Total Items</div><div style={valueStyle}>{summary.total}</div></div>
          <div style={cardStyle}><div style={labelStyle}>Design</div><div style={{ ...valueStyle, color: '#42a5f5' }}>{summary.design}</div></div>
          <div style={cardStyle}><div style={labelStyle}>Policy</div><div style={{ ...valueStyle, color: '#ffa726' }}>{summary.policy}</div></div>
          <div style={cardStyle}><div style={labelStyle}>Safety</div><div style={{ ...valueStyle, color: '#ef5350' }}>{summary.safety}</div></div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={headerStyle}>Restore Point Items</div>
        {['design', 'policy', 'safety'].map(section => (
          <div key={section} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: sectionColor(section), textTransform: 'capitalize' }}>
              {section}
            </div>
            {items.filter(i => i.section === section).map(item => (
              <div key={item.id} style={{
                ...cardStyle,
                marginBottom: 6,
                borderLeft: `3px solid ${sectionColor(section)}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <strong style={{ fontSize: 13 }}>{item.title}</strong>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: 3,
                    fontSize: 10,
                    fontWeight: 600,
                    background: statusColor(item.status),
                    color: '#fff',
                  }}>{item.status}</span>
                </div>
                <div style={{ fontSize: 12, color: '#b0bec5' }}>{item.description}</div>
                <div style={{ fontSize: 11, color: item.section === 'safety' ? '#ef5350' : '#ffa726', marginTop: 2 }}>
                  ⚠ {item.safetyNote}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ ...sectionStyle, border: '2px solid #880e4f' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>Restore Point Safety Rules</div>
        <ul style={{ fontSize: 13, lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
          <li>Restore point is <strong>plan-only</strong> — no files are modified</li>
          <li>Source restore is <strong>blocked</strong> unless explicitly authorized</li>
          <li>Full restore is <strong>forbidden</strong> by default</li>
          <li>SHA256 verification <strong>required</strong> before any restore</li>
          <li>Human confirmation text <strong>required</strong> before any restore</li>
          <li>Receipt <strong>required</strong> after any restore</li>
          <li>No secrets captured in restore point</li>
        </ul>
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

export default RestorePointPackPreview;
