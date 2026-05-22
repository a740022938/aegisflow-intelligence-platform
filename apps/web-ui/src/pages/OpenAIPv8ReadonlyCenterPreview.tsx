import React from 'react';
import { Link } from 'react-router-dom';

const shellStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0b1220 0%, #111827 50%, #0f172a 100%)',
  color: '#e5e7eb',
  padding: '24px'
};

const panelStyle: React.CSSProperties = {
  maxWidth: 1000,
  margin: '0 auto',
  border: '1px solid #374151',
  borderRadius: 12,
  background: 'rgba(15, 23, 42, 0.88)',
  padding: 20
};

const badgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
  marginRight: 6,
  marginBottom: 4
};

const cardStyle: React.CSSProperties = {
  border: '1px solid #334155',
  borderRadius: 10,
  background: '#0b1220',
  padding: 14,
  marginTop: 12
};

export interface CenterSection {
  title: string;
  items: string[];
}

export interface CenterConfig {
  title: string;
  subtitle: string;
  purpose: string;
  sections: CenterSection[];
  keyRules: string[];
  notAllowed: string[];
  futurePhases: string[];
  backLink?: string;
  backLabel?: string;
  sampleData?: { label: string; value: string }[];
}

export default function OpenAIPv8ReadonlyCenterPreview({ config }: { config: CenterConfig }): React.JSX.Element {
  return (
    <div style={shellStyle}>
      <div style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26 }}>{config.title}</h1>
            <p style={{ marginTop: 4, color: '#93c5fd', fontSize: 14 }}>{config.subtitle}</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#9ca3af' }}>{config.purpose}</p>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <span style={{ ...badgeStyle, background: '#3b82f6', color: '#fff' }}>Readonly Preview</span>
            <span style={{ ...badgeStyle, background: '#059669', color: '#fff' }}>No runtime mutation</span>
            <span style={{ ...badgeStyle, background: '#dc2626', color: '#fff' }}>Gate CLOSED</span>
            <span style={{ ...badgeStyle, background: '#7c3aed', color: '#fff' }}>Stage C disabled</span>
            <span style={{ ...badgeStyle, background: '#6b7280', color: '#fff' }}>Static / registry example</span>
          </div>
        </div>

        {config.sections.map((section) => (
          <div key={section.title} style={cardStyle}>
            <h2 style={{ margin: 0, fontSize: 15, color: '#fbbf24' }}>{section.title}</h2>
            <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: '#cbd5e1', lineHeight: 1.8 }}>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}

        {config.sampleData && config.sampleData.length > 0 && (
          <div style={cardStyle}>
            <h2 style={{ margin: 0, fontSize: 15, color: '#fbbf24' }}>Sample Registry Data</h2>
            <div style={{ marginTop: 8, fontSize: 13, color: '#cbd5e1' }}>
              {config.sampleData.map((d) => (
                <div key={d.label} style={{ padding: '4px 0', borderBottom: '1px solid #1e293b' }}>
                  <span style={{ color: '#6b7280' }}>{d.label}:</span> {d.value}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ ...cardStyle, borderLeft: '3px solid #ef4444' }}>
          <h2 style={{ margin: 0, fontSize: 14, color: '#ef4444' }}>Safety Rules</h2>
          <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: '#fca5a5', lineHeight: 1.8 }}>
            {config.keyRules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>

        <div style={{ ...cardStyle, borderLeft: '3px solid #f59e0b' }}>
          <h2 style={{ margin: 0, fontSize: 14, color: '#f59e0b' }}>Not Allowed in This Preview</h2>
          <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: '#fde68a', lineHeight: 1.8 }}>
            {config.notAllowed.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div style={{ ...cardStyle, borderLeft: '3px solid #3b82f6' }}>
          <h2 style={{ margin: 0, fontSize: 14, color: '#3b82f6' }}>Future Phases</h2>
          <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: '#bfdbfe', lineHeight: 1.8 }}>
            {config.futurePhases.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>

        {config.backLink && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Link to={config.backLink} style={{ color: '#93c5fd', fontSize: 13, textDecoration: 'underline' }}>
              {config.backLabel || 'Back to Command Center'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
