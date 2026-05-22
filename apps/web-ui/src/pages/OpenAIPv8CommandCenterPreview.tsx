import React from 'react';

const shellStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0b1220 0%, #111827 50%, #0f172a 100%)',
  color: '#e5e7eb',
  padding: '24px'
};

const panelStyle: React.CSSProperties = {
  maxWidth: 1200,
  margin: '0 auto',
  border: '1px solid #374151',
  borderRadius: 12,
  background: 'rgba(15, 23, 42, 0.88)',
  padding: 20
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
  marginTop: 16
};

const cardStyle: React.CSSProperties = {
  border: '1px solid #334155',
  borderRadius: 10,
  background: '#0b1220',
  padding: 12
};

const safetyItems = [
  'Preview only',
  'Read-only',
  'No runtime mutation',
  'Gate CLOSED',
  'Stage C disabled',
  'Config != permission',
  'Enabled != execution',
  'Authorized != gateOpen',
  'Capability != permission',
  'UI switch != backend truth'
];

const centerItems = [
  'Agent Center',
  'Task Center',
  'Provider Manager',
  'Integration Center',
  'Local Apps Center',
  'Memory + Knowledge Center',
  'Policy Router + Capability Center',
  'Audit Center',
  'Execution Gateway'
];

export default function OpenAIPv8CommandCenterPreview(): React.JSX.Element {
  return (
    <div style={shellStyle}>
      <div style={panelStyle}>
        <h1 style={{ margin: 0, fontSize: 28 }}>OpenAIP v8 Command Center Preview</h1>
        <p style={{ marginTop: 8, color: '#93c5fd' }}>各路 AI 工具都是英雄，OpenAIP 是指挥中心。</p>

        <div style={{ ...cardStyle, marginTop: 12 }}>
          <strong>Safety Boundary</strong>
          <ul style={{ marginTop: 8, marginBottom: 0 }}>
            {safetyItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div style={gridStyle}>
          {centerItems.map((item, idx) => (
            <section key={item} style={cardStyle}>
              <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: 16 }}>{idx + 1}. {item}</h2>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: 13 }}>
                Readonly preview panel only. No launch, no write, no execution.
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}