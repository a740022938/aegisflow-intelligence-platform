import React from 'react';
import { Link } from 'react-router-dom';
import { getOpenAipv8Copy, type OpenAipv8CenterKey } from './openAipv8Copy';

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

const gridItemStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderBottom: '1px solid #1e293b',
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 13,
};

export interface CenterSection {
  title: string;
  items: string[];
}

export interface RegistryTableColumn {
  label: string;
  key: string;
  width?: string;
}

export interface RegistryTableRow {
  [key: string]: string | number | boolean | undefined;
}

export interface RegistryTable {
  title: string;
  columns: RegistryTableColumn[];
  rows: RegistryTableRow[];
}

export interface CenterConfig {
  centerKey: OpenAipv8CenterKey;
  title: string;
  subtitle: string;
  purpose: string;
  role?: string;
  sections: CenterSection[];
  registryTables?: RegistryTable[];
  keyRules: string[];
  notAllowed: string[];
  futurePhases: string[];
  backLink?: string;
  backLabel?: string;
  relatedCenters?: { title: string; route: string }[];
  sampleData?: { label: string; value: string }[];
}

function formatCellValue(v: string | number | boolean | undefined): string {
  if (v === undefined || v === null) return '—';
  if (typeof v === 'boolean') return v ? 'YES' : 'NO';
  return String(v);
}

export default function OpenAIPv8ReadonlyCenterPreview({ config }: { config: CenterConfig }): React.JSX.Element {
  const copy = getOpenAipv8Copy(config.centerKey);
  return (
    <div style={shellStyle}>
      <div style={panelStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26 }}>{copy.title}</h1>
            <p style={{ marginTop: 4, color: '#93c5fd', fontSize: 14 }}>{copy.subtitle}</p>
            {config.role && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>{config.role}</p>}
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#9ca3af' }}>{config.purpose}</p>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {copy.globalSafetyBadges.slice(0, 5).map((badge, index) => (
              <span key={badge} style={{ ...badgeStyle, background: ['#3b82f6', '#059669', '#dc2626', '#7c3aed', '#6b7280'][index], color: '#fff' }}>{badge}</span>
            ))}
            {copy.noActionBadges.map((badge) => (
              <span key={badge} style={{ ...badgeStyle, background: '#ef4444', color: '#fff' }}>{badge}</span>
            ))}
          </div>
        </div>

        {/* Global Status Badge Strip */}
        <div style={{ ...cardStyle, display: 'flex', gap: 4, flexWrap: 'wrap', borderLeft: '3px solid #f59e0b' }}>
          {copy.globalSafetyBadges.map((badge) => (
            <span key={badge} style={{ ...badgeStyle, background: '#1e293b', color: badge.includes('CLOSED') || badge.includes('关闭') || badge.includes('禁用') ? '#fbbf24' : '#9ca3af', border: '1px solid #374151' }}>{badge}</span>
          ))}
          {copy.noActionBadges.map((badge) => (
            <span key={badge} style={{ ...badgeStyle, background: '#1e293b', color: '#ef4444', border: '1px solid #ef4444' }}>{badge}</span>
          ))}
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

        {config.registryTables && config.registryTables.map((table) => (
          <div key={table.title} style={{ ...cardStyle, overflowX: 'auto' }}>
            <h2 style={{ margin: 0, fontSize: 14, color: '#60a5fa', marginBottom: 8 }}>{table.title}</h2>
            <div style={{ minWidth: table.columns.length * 120 }}>
              <div style={{ display: 'flex', fontWeight: 600, color: '#93c5fd', fontSize: 11, borderBottom: '1px solid #374151', paddingBottom: 4, marginBottom: 2 }}>
                {table.columns.map((col) => (
                  <div key={col.key} style={{ flex: col.width || 1, padding: '0 4px' }}>{col.label}</div>
                ))}
              </div>
              {table.rows.map((row, idx) => (
                <div key={idx} style={gridItemStyle}>
                  {table.columns.map((col) => (
                    <div key={col.key} style={{ flex: col.width || 1, padding: '0 4px' }}>{formatCellValue(row[col.key])}</div>
                  ))}
                </div>
              ))}
            </div>
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
          <h2 style={{ margin: 0, fontSize: 14, color: '#ef4444' }}>{copy.safetyRules}</h2>
          <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: '#fca5a5', lineHeight: 1.8 }}>
            {config.keyRules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>

        <div style={{ ...cardStyle, borderLeft: '3px solid #f59e0b' }}>
          <h2 style={{ margin: 0, fontSize: 14, color: '#f59e0b' }}>{copy.notAllowed}</h2>
          <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: '#fde68a', lineHeight: 1.8 }}>
            {config.notAllowed.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div style={{ ...cardStyle, borderLeft: '3px solid #3b82f6' }}>
          <h2 style={{ margin: 0, fontSize: 14, color: '#3b82f6' }}>{copy.futurePhases}</h2>
          <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: '#bfdbfe', lineHeight: 1.8 }}>
            {config.futurePhases.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>

        {/* Related Centers */}
        {config.relatedCenters && config.relatedCenters.length > 0 && (
          <div style={{ ...cardStyle, borderLeft: '3px solid #93c5fd' }}>
            <h2 style={{ margin: 0, fontSize: 13, color: '#93c5fd', marginBottom: 6 }}>{copy.relatedCenters}</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {config.relatedCenters.map((rc) => (
                <Link key={rc.route} to={rc.route} style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>{rc.title}</Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 16, padding: 10, border: '1px solid #374151', borderRadius: 8, background: 'rgba(0,0,0,0.3)', fontSize: 11, color: '#6b7280', textAlign: 'center' }}>
          OpenAIP v8 · {copy.title} · {copy.globalSafetyBadges.join(' · ')}
        </div>

        {config.backLink && (
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <Link to={config.backLink} style={{ color: '#93c5fd', fontSize: 13, textDecoration: 'underline' }}>
              {config.backLabel || `← ${copy.backToCommand}`}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
