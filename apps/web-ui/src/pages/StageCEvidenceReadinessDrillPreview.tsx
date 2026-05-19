import React from 'react';
import PageShell from '../components/ui/PageShell';
import { STAGE_C_EVIDENCE_READINESS_DRILL_REGISTRY } from '../registry/stage-c-evidence-readiness-drill-registry';
import { validateEvidenceDrill } from '../registry/stage-c-evidence-readiness-drill-validator';

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

const badgeStyle = (color: string): React.CSSProperties => ({
  padding: '2px 10px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
  background: color,
  color: '#fff',
  display: 'inline-block',
});

const statusColor = (status: string) => {
  switch (status) {
    case 'ready': return '#66bb6a';
    case 'deferred': return '#ffa726';
    case 'blocked': return '#ef5350';
    case 'missing': return '#ef5350';
    default: return '#757575';
  }
};

const StageCEvidenceReadinessDrillPreview: React.FC = () => {
  const registry = STAGE_C_EVIDENCE_READINESS_DRILL_REGISTRY;
  const validation = validateEvidenceDrill();

  const requiredItems = registry.filter(i => i.required);
  const readyItems = registry.filter(i => i.status === 'ready');
  const sourceOfTruthItems = registry.filter(i => i.sourceOfTruth);
  const missingItems = registry.filter(i => i.status === 'missing' || i.status === 'blocked');
  const deferredItems = registry.filter(i => i.status === 'deferred');
  const areas = [...new Set(registry.map(i => i.area))].sort();

  return (
    <PageShell
      title="Stage C Evidence Readiness Drill Preview"
      subtitle="v7.34.0-P3 · Readonly · No evidence write/store · No upload capability"
      safetyBoundary="readonly"
      safetyText="只读 evidence readiness drill · 不采集证据 · 不写 evidence store · 不上传 · 不入 sidebar · 不执行动作"
    >
      {/* 1. Evidence Chain */}
      <div style={{ ...sectionStyle, border: '1px solid #42a5f5' }}>
        <div style={{ ...headerStyle, color: '#42a5f5' }}>1. Evidence Chain</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Evidence Items</div>
            <div style={valueStyle}>{registry.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Required</div>
            <div style={valueStyle}>{requiredItems.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Ready</div>
            <div style={{ ...valueStyle, color: '#66bb6a' }}>{readyItems.length}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Missing/Blocked</div>
            <div style={{ ...valueStyle, color: missingItems.length === 0 ? '#66bb6a' : '#ef5350' }}>
              {missingItems.length}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Deferred</div>
            <div style={{ ...valueStyle, color: deferredItems.length === 0 ? '#66bb6a' : '#ffa726' }}>
              {deferredItems.length}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Source of Truth</div>
            <div style={{ ...valueStyle, color: '#66bb6a' }}>{sourceOfTruthItems.length}</div>
          </div>
        </div>
        <div style={{ marginTop: 8, padding: 12, background: '#16213e', borderRadius: 4, border: '1px solid #ef5350' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ef5350' }}>
            Stage C is disabled. No evidence write/store capability exists. This drill is readonly.
          </div>
        </div>
      </div>

      {/* 2. Source-of-Truth Matrix */}
      <div style={{ ...sectionStyle, border: '1px solid #66bb6a' }}>
        <div style={{ ...headerStyle, color: '#66bb6a' }}>2. Source-of-Truth Matrix</div>
        {sourceOfTruthItems.map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.sourceRef}</div>
          </div>
        ))}
      </div>

      {/* 3. Required Evidence */}
      <div style={sectionStyle}>
        <div style={headerStyle}>3. Required Evidence</div>
        {requiredItems.filter(i => i.area !== 'safety' && i.area !== 'forbidden').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.sourceRef}</div>
          </div>
        ))}
      </div>

      {/* 4. Missing / Deferred Evidence */}
      <div style={{ ...sectionStyle, border: '1px solid #ffa726' }}>
        <div style={{ ...headerStyle, color: '#ffa726' }}>4. Missing / Deferred Evidence</div>
        {deferredItems.length === 0 && missingItems.length === 0 ? (
          <div style={{ fontSize: 13, color: '#66bb6a' }}>
            All evidence items are ready. No missing or deferred evidence at this time.
          </div>
        ) : (
          [...deferredItems, ...missingItems].map(item => (
            <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{item.title}</span>
                <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
              </div>
              <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.description}</div>
            </div>
          ))
        )}
      </div>

      {/* 5. Safety Evidence */}
      <div style={{ ...sectionStyle, border: '1px solid #66bb6a' }}>
        <div style={{ ...headerStyle, color: '#66bb6a' }}>5. Safety Evidence</div>
        {registry.filter(i => i.area === 'safety').map(item => (
          <div key={item.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
            </div>
            <div style={{ color: '#8892b0', fontSize: 11, marginTop: 2 }}>{item.sourceRef}</div>
          </div>
        ))}
      </div>

      {/* 6. Route/Sidebar Evidence */}
      <div style={sectionStyle}>
        <div style={headerStyle}>6. Route / Sidebar Evidence</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <div><strong>Route:</strong> /stage-c-evidence-readiness-drill-preview</div>
          <div><strong>Sidebar:</strong> Not in sidebar</div>
          <div><strong>Access:</strong> Hidden direct route only</div>
          <div><strong>Exposure:</strong> direct_route, keep_direct_route</div>
        </div>
      </div>

      {/* 7. Validator Summary */}
      <div style={{ ...sectionStyle, border: `1px solid ${validation.pass ? '#66bb6a' : '#ef5350'}` }}>
        <div style={{ ...headerStyle, color: validation.pass ? '#66bb6a' : '#ef5350' }}>
          7. Validator Summary
        </div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Result</div>
            <div style={{ ...valueStyle, color: validation.pass ? '#66bb6a' : '#ef5350' }}>
              {validation.pass ? 'PASS' : 'FAIL'}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Blocking</div>
            <div style={{ ...valueStyle, color: validation.blocking === 0 ? '#66bb6a' : '#ef5350' }}>
              {validation.blocking}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Warning / Info</div>
            <div style={valueStyle}>{validation.warning} / {validation.info}</div>
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary, #8892b0)' }}>
          {validation.checks.map(c => (
            <div key={c.id} style={{ padding: '2px 0', display: 'flex', gap: 8 }}>
              <span style={{ color: c.pass ? '#66bb6a' : '#ef5350' }}>{c.pass ? '\u2713' : '\u2717'}</span>
              <span>[{c.level}]</span>
              <span>{c.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Forbidden Actions */}
      <div style={{ ...sectionStyle, border: '1px solid #ef5350' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>8. Forbidden Actions</div>
        <ul style={{ fontSize: 13, lineHeight: 2, paddingLeft: 20 }}>
          <li>Do not enable Stage C — no enable capability exists</li>
          <li>Do not collect evidence — no evidence write/store capability</li>
          <li>Do not upload files — no upload capability exists</li>
          <li>Do not write audit records — no audit write capability</li>
          <li>Do not write to DB — no DB write capability exists</li>
          <li>Do not implement POST runtime endpoint</li>
          <li>Do not execute runtime — no executor implemented</li>
          <li>Do not control external tools — no connector action</li>
          <li>Do not expose to sidebar — all routes are hidden direct only</li>
        </ul>
      </div>

      {/* 9. Evidence by Area */}
      <div style={sectionStyle}>
        <div style={headerStyle}>9. Evidence by Area</div>
        {areas.map(area => {
          const areaItems = registry.filter(i => i.area === area);
          return (
            <div key={area} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary, #e0e0e0)', textTransform: 'capitalize' }}>
                {area.replace('_', ' ')} ({areaItems.length})
              </div>
              {areaItems.map(item => (
                <div key={item.id} style={{ padding: '6px 12px', borderBottom: '1px solid var(--border-color, #2a2a4a)', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.title}</span>
                  <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* 10. Next Step: P4 Pre-Enable Seal Candidate */}
      <div style={{ ...sectionStyle, border: '1px solid #ffa726' }}>
        <div style={{ ...headerStyle, color: '#ffa726' }}>10. Next Step</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Review evidence chain — confirm all evidence items are accessible</li>
            <li>Verify source-of-truth coverage — all phases have evidence docs</li>
            <li>Check missing/deferred evidence — plan resolution for deferred items</li>
            <li>Confirm safety evidence — no POST, DB, executor, sidebar exposure</li>
            <li>Verify validator results — all checks must pass</li>
            <li>Do not collect evidence from this page — no evidence write capability</li>
          </ol>
        </div>
        <div style={{ marginTop: 12, padding: 12, background: '#1a1a2e', borderRadius: 4, border: '1px solid #2a2a4a' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ffa726' }}>Next Phase Recommendation</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginTop: 4 }}>
            v7.34.0-P4: Stage C Pre-Enable Seal Candidate
          </div>
          <div style={{ fontSize: 12, color: '#ef5350', marginTop: 4, fontWeight: 600 }}>
            Stage C remains disabled.
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default StageCEvidenceReadinessDrillPreview;
