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
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  marginTop: 16
};

const cardStyle: React.CSSProperties = {
  border: '1px solid #334155',
  borderRadius: 10,
  background: '#0b1220',
  padding: 14
};

const badgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
  marginRight: 6
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

const centers = [
  {
    title: 'Agent Center',
    tag: 'readonly',
    items: ['AI agents lifecycle: enabled / paused / disabled / quarantined', 'Permission levels L0-L5', 'Task/audit linkage'],
    safetyNote: 'No agent launch, no lifecycle mutation'
  },
  {
    title: 'Task Center',
    tag: 'draft',
    items: ['Task pack generation', 'Receipt intake pipeline', 'Review queue', 'Human-fatigue reduction'],
    safetyNote: 'No task execution, no write'
  },
  {
    title: 'Provider Manager',
    tag: 'readonly',
    items: ['CC Switch-like provider/config/router', 'Provider registry', 'Readonly/dry-run first'],
    safetyNote: 'No provider action, dry-run only'
  },
  {
    title: 'Integration Center',
    tag: 'readonly',
    items: ['OpenClaw', 'GitHub', 'Webhooks/external services'],
    safetyNote: 'No connector action in preview'
  },
  {
    title: 'Local Apps Center',
    tag: 'readonly',
    items: ['OpenAxiom as Local App / UI Lab / Vision Tool', 'ComfyUI', 'Ollama / LM Studio', 'YOLO / SAM tools'],
    safetyNote: 'No app launch in preview'
  },
  {
    title: 'Memory + Knowledge Center',
    tag: 'readonly',
    items: ['Memory access policy', 'Knowledge source registry', 'Receipt/report indexing'],
    safetyNote: 'No memory write in preview'
  },
  {
    title: 'Policy Router + Capability Center',
    tag: 'readonly',
    items: ['Capability != permission', 'Permission levels', 'Policy-before-buttons'],
    safetyNote: 'No policy mutation'
  },
  {
    title: 'Audit Center',
    tag: 'readonly',
    items: ['Receipts', 'Reports', 'Evidence', 'Commit/push/verification trail'],
    safetyNote: 'Readonly audit trail'
  },
  {
    title: 'Execution Gateway',
    tag: 'closed',
    items: ['Default closed', 'Gate CLOSED', 'Stage C disabled', 'Dry-run/approval required before future execution'],
    safetyNote: 'Gate remains closed'
  }
];

function SafetyBadge({ text }: { text: string }) {
  const color = text === 'closed' ? '#ef4444' : text === 'draft' ? '#f59e0b' : '#3b82f6';
  return <span style={{ ...badgeStyle, background: color, color: '#fff' }}>{text.toUpperCase()}</span>;
}

export default function OpenAIPv8CommandCenterPreview(): React.JSX.Element {
  return (
    <div style={shellStyle}>
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>OpenAIP v8 Command Center Preview</h1>
            <p style={{ marginTop: 8, color: '#93c5fd' }}>各路 AI 工具都是英雄，OpenAIP 是指挥中心。</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ ...badgeStyle, background: '#dc2626', color: '#fff' }}>GATE CLOSED</span>
            <span style={{ ...badgeStyle, background: '#7c3aed', color: '#fff' }}>STAGE C DISABLED</span>
          </div>
        </div>

        <div style={{ ...cardStyle, marginTop: 12, borderLeft: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {safetyItems.map((item) => (
              <span key={item} style={{ ...badgeStyle, background: '#1e293b', color: '#fbbf24', border: '1px solid #fbbf24' }}>{item}</span>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>
            All safety boundaries are enforced. This preview does not mutate runtime, write to DB, open Gate, or enable Stage C.
          </p>
        </div>

        <div style={gridStyle}>
          {centers.map((center) => (
            <section key={center.title} style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <SafetyBadge text={center.tag} />
                <h2 style={{ margin: 0, fontSize: 15 }}>{center.title}</h2>
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: '#cbd5e1', lineHeight: 1.8 }}>
                {center.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p style={{ margin: '10px 0 0', fontSize: 11, color: '#6b7280', fontStyle: 'italic' }}>
                {center.safetyNote}
              </p>
            </section>
          ))}
        </div>

        <div style={{ marginTop: 20, padding: 12, border: '1px solid #374151', borderRadius: 8, background: 'rgba(0,0,0,0.3)' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
            OpenAIP v8 Command Center Preview · Read-only · No execution · Gate remains CLOSED · Stage C disabled
          </p>
        </div>
      </div>
    </div>
  );
}
