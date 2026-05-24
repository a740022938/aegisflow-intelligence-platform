import React from 'react';
import { Link } from 'react-router-dom';
import { V8_EXECUTION_BOUNDARIES, getV8ExecutionBoundarySummary } from '../registry/openAipv8CenterData';
import { getOpenAipv8Copy } from './openAipv8Copy';

const s = getV8ExecutionBoundarySummary();

const shellStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0b1220 0%, #111827 50%, #0f172a 100%)',
  color: '#e5e7eb',
  padding: '24px'
};
const panelStyle: React.CSSProperties = {
  maxWidth: 1200, margin: '0 auto', border: '1px solid #374151',
  borderRadius: 12, background: 'rgba(15, 23, 42, 0.88)', padding: 20
};
const badgeStyle: React.CSSProperties = {
  display: 'inline-block', padding: '2px 8px', borderRadius: 4,
  fontSize: 11, fontWeight: 600, marginRight: 6, marginBottom: 4
};
const cardStyle: React.CSSProperties = {
  border: '1px solid #334155', borderRadius: 10, background: '#0b1220',
  padding: 14, marginTop: 12
};
const rowStyle: React.CSSProperties = {
  padding: '6px 10px', borderBottom: '1px solid #1e293b',
  display: 'flex', gap: 8, alignItems: 'center', fontSize: 13,
};
const cellStyle = (flex: number = 1): React.CSSProperties => ({ flex, padding: '0 4px' });
const Label: React.CSSProperties = {
  display: 'inline-block', padding: '1px 6px', borderRadius: 3,
  fontSize: 10, fontWeight: 600, marginRight: 4
};

const riskColor: Record<string, string> = {
  low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444'
};
const boolColor = (val: boolean): string => val ? '#22c55e' : '#6b7280';

function SummaryStrip() {
  return (
    <div style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', borderLeft: '3px solid #60a5fa' }}>
      <span style={{ ...badgeStyle, background: '#3b82f6', color: '#fff' }}>Total: {s.total}</span>
      <span style={{ ...badgeStyle, background: '#ef4444', color: '#fff' }}>Blocked: {s.blocked}</span>
      <span style={{ ...badgeStyle, background: '#ef4444', color: '#000' }}>Critical: {s.critical}</span>
      <span style={{ ...badgeStyle, background: '#f97316', color: '#fff' }}>High: {s.high}</span>
      <span style={{ ...badgeStyle, background: '#f59e0b', color: '#000' }}>Gate Req: {s.gateRequired}</span>
      <span style={{ ...badgeStyle, background: '#7c3aed', color: '#fff' }}>Stage C Req: {s.stageCRequired}</span>
      <span style={{ ...badgeStyle, background: '#ef4444', color: '#fff' }}>Human Auth: {s.humanAuthRequired}</span>
      <span style={{ ...badgeStyle, background: '#3b82f6', color: '#fff' }}>Audit Req: {s.auditRequired}</span>
      <span style={{ ...badgeStyle, background: '#f59e0b', color: '#000' }}>Dry-run Req: {s.dryRunRequired}</span>
      <span style={{ ...badgeStyle, background: '#059669', color: '#fff' }}>Allowed: {s.allowedInPreview}</span>
    </div>
  );
}

function ExecutionBoundaryMatrix() {
  const cols = [
    { label: 'Name', key: 'name', flex: 1.2 },
    { label: 'Category', key: 'category', flex: 0.7 },
    { label: 'Current State', key: 'currentState', flex: 1.2 },
    { label: 'Risk', key: 'risk', flex: 0.5 },
    { label: 'Permission', key: 'requiredPermissionLevel', flex: 0.6 },
    { label: 'Gate', key: 'gateRequired', flex: 0.4 },
    { label: 'Stage C', key: 'stageCRequired', flex: 0.5 },
    { label: 'Human Auth', key: 'humanAuthorizationRequired', flex: 0.6 },
    { label: 'Audit', key: 'auditRequired', flex: 0.4 },
    { label: 'Dry-run', key: 'dryRunRequired', flex: 0.4 },
    { label: 'Preview', key: 'allowedInPreview', flex: 0.4 },
    { label: 'Blocked Reason', key: 'blockedReason', flex: 2 },
  ];
  return (
    <div style={{ ...cardStyle, overflowX: 'auto' }}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#60a5fa', marginBottom: 8 }}>Execution Boundary Matrix ({V8_EXECUTION_BOUNDARIES.length} entries)</h2>
      <div style={{ minWidth: 1400 }}>
        <div style={{ ...rowStyle, fontWeight: 600, color: '#93c5fd', fontSize: 11, borderBottom: '2px solid #374151' }}>
          {cols.map(c => <div key={c.key} style={cellStyle(c.flex)}>{c.label}</div>)}
        </div>
        {V8_EXECUTION_BOUNDARIES.map(b => (
          <div key={b.id} style={{ ...rowStyle, background: b.risk === 'critical' ? 'rgba(239,68,68,0.06)' : 'transparent' }}>
            <div style={{ ...cellStyle(1.2), fontWeight: 500 }}>{b.name}</div>
            <div style={{ ...cellStyle(0.7), fontSize: 12, color: '#9ca3af' }}>{b.category}</div>
            <div style={{ ...cellStyle(1.2), fontSize: 12, color: b.currentState.includes('blocked') ? '#ef4444' : '#f59e0b' }}>{b.currentState}</div>
            <div style={cellStyle(0.5)}>
              <span style={{ ...Label, background: riskColor[b.risk] || '#6b7280', color: '#fff' }}>{b.risk}</span>
            </div>
            <div style={{ ...cellStyle(0.6), fontSize: 12, color: '#93c5fd' }}>{b.requiredPermissionLevel}</div>
            <div style={cellStyle(0.4)}>
              <span style={{ ...Label, background: boolColor(b.gateRequired), color: '#fff' }}>{b.gateRequired ? 'Yes' : 'No'}</span>
            </div>
            <div style={cellStyle(0.5)}>
              <span style={{ ...Label, background: boolColor(b.stageCRequired), color: '#fff' }}>{b.stageCRequired ? 'Yes' : 'No'}</span>
            </div>
            <div style={cellStyle(0.6)}>
              <span style={{ ...Label, background: b.humanAuthorizationRequired ? '#ef4444' : '#6b7280', color: '#fff' }}>{b.humanAuthorizationRequired ? 'Yes' : 'No'}</span>
            </div>
            <div style={cellStyle(0.4)}>
              <span style={{ ...Label, background: boolColor(b.auditRequired), color: '#fff' }}>{b.auditRequired ? 'Yes' : 'No'}</span>
            </div>
            <div style={cellStyle(0.4)}>
              <span style={{ ...Label, background: boolColor(b.dryRunRequired), color: '#fff' }}>{b.dryRunRequired ? 'Yes' : 'No'}</span>
            </div>
            <div style={cellStyle(0.4)}>
              <span style={{ ...Label, background: b.allowedInPreview ? '#22c55e' : '#ef4444', color: '#fff' }}>{b.allowedInPreview ? 'Yes' : 'No'}</span>
            </div>
            <div style={{ ...cellStyle(2), fontSize: 11, color: '#fca5a5' }}>{b.blockedReason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApprovalChainPanel() {
  const steps = [
    '1. Task created',
    '2. Agent selected',
    '3. Capability requested',
    '4. Policy check',
    '5. Human approval',
    '6. Gate check',
    '7. Dry-run',
    '8. Audit receipt',
    '9. Review acceptance',
  ];
  return (
    <div style={{ ...cardStyle, borderLeft: '3px solid #93c5fd' }}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#93c5fd' }}>Approval Chain</h2>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#ef4444', fontWeight: 600 }}>
        This preview does not execute this chain.
      </p>
      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>
        The following chain represents the future execution approval pipeline. Every step must pass before any high-risk action.
      </p>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {steps.map(s => (
          <div key={s} style={{ padding: '4px 10px', background: '#1e293b', borderRadius: 4, fontSize: 13, color: '#cbd5e1', borderLeft: '2px solid #3b82f6' }}>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

function GateStageCTruthPanel() {
  return (
    <div style={{ ...cardStyle, borderLeft: '3px solid #f59e0b' }}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#f59e0b' }}>Gate + Stage C Truth</h2>
      <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: '#fbbf24', lineHeight: 1.8 }}>
        <li>Gate CLOSED is a backend/runtime truth, not a UI decoration.</li>
        <li>Stage C disabled blocks runtime execution.</li>
        <li>UI links and badges do not grant permission.</li>
        <li>No Gate/Stage C mutation exists in this preview.</li>
      </ul>
    </div>
  );
}

function BlockedActionsPanel() {
  const blocked = [
    'Command execution (shell commands, process execution)',
    'Connector actions (external API calls, webhook execution)',
    'Local app launches (OpenAxiom, ComfyUI, Ollama, LM Studio)',
    'File writes (patch apply, source file modification)',
    'Memory writes (agent memory, knowledge source mutation)',
    'Release / Tag / Restore (git tag, npm version, release creation)',
    'Gate opening (master switch, Gate toggle)',
    'Stage C enablement (advanced execution capability)',
  ];
  return (
    <div style={{ ...cardStyle, borderLeft: '3px solid #ef4444' }}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#ef4444' }}>Blocked Actions</h2>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#ef4444', fontWeight: 600 }}>All high-risk actions are blocked in this preview.</p>
      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>The following actions cannot be performed:</p>
      <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: '#fca5a5', lineHeight: 1.8 }}>
        {blocked.map(a => <li key={a}>{a}</li>)}
      </ul>
    </div>
  );
}

function LinkageStrip() {
  return (
    <div style={{ ...cardStyle, borderLeft: '3px solid #93c5fd' }}>
      <h2 style={{ margin: 0, fontSize: 14, color: '#93c5fd' }}>Center Linkage</h2>
      <p style={{ margin: '4px 0 8px', fontSize: 12, color: '#9ca3af' }}>Execution Gateway connects to the following centers for boundary enforcement.</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link to="/openaip-v8-agent-center-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>Agent Center</Link>
        <Link to="/openaip-v8-task-center-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>Task Center</Link>
        <Link to="/openaip-v8-audit-center-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>Audit Center</Link>
        <Link to="/openaip-v8-policy-capability-center-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>Policy + Capability Center</Link>
        <Link to="/openaip-v8-command-center-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>Command Center</Link>
      </div>
    </div>
  );
}

function SafetyBoundary() {
  return (
    <div style={{ ...cardStyle, borderLeft: '3px solid #ef4444' }}>
      <h2 style={{ margin: 0, fontSize: 14, color: '#ef4444' }}>Safety Boundary</h2>
      <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: '#fca5a5', lineHeight: 1.8 }}>
        <li>No execution</li>
        <li>No dry-run runner</li>
        <li>No connector action</li>
        <li>No DB write</li>
        <li>No Gate opening</li>
        <li>No Stage C enablement</li>
        <li>No release/tag/restore</li>
        <li>No external call</li>
      </ul>
    </div>
  );
}

export default function OpenAIPv8ExecutionGatewayPreview(): React.JSX.Element {
  const copy = getOpenAipv8Copy('execution');
  return (
    <div style={shellStyle}>
      <div style={panelStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26 }}>{copy.title}</h1>
            <p style={{ marginTop: 4, color: '#93c5fd', fontSize: 14 }}>{copy.subtitle}</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#9ca3af' }}>Execution Gateway defines how future high-risk actions remain dry-run, gated, human-approved, audited, and disabled by default.</p>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {copy.globalSafetyBadges.slice(0, 5).map((badge, index) => (
              <span key={badge} style={{ ...badgeStyle, background: ['#3b82f6', '#059669', '#dc2626', '#7c3aed', '#6b7280'][index], color: '#fff' }}>{badge}</span>
            ))}
            <span style={{ ...badgeStyle, background: '#ef4444', color: '#fff' }}>{copy.noActionBadges[0]}</span>
          </div>
        </div>

        {/* Global Status Strip */}
        <div style={{ ...cardStyle, display: 'flex', gap: 4, flexWrap: 'wrap', borderLeft: '3px solid #f59e0b' }}>
          {copy.globalSafetyBadges.map((badge) => (
            <span key={badge} style={{ ...badgeStyle, background: '#1e293b', color: '#9ca3af', border: '1px solid #374151' }}>{badge}</span>
          ))}
          {copy.noActionBadges.map((badge) => (
            <span key={badge} style={{ ...badgeStyle, background: '#1e293b', color: '#ef4444', border: '1px solid #ef4444' }}>{badge}</span>
          ))}
        </div>

        {/* Execution Boundary Summary Strip */}
        <SummaryStrip />

        {/* Execution Boundary Matrix */}
        <ExecutionBoundaryMatrix />

        {/* Approval Chain Panel */}
        <ApprovalChainPanel />

        {/* Gate + Stage C Truth Panel */}
        <GateStageCTruthPanel />

        {/* Blocked Action Panel */}
        <BlockedActionsPanel />

        {/* Linkage Strip */}
        <LinkageStrip />

        {/* Safety Boundary */}
        <SafetyBoundary />

        {/* Footer */}
        <div style={{ marginTop: 16, padding: 10, border: '1px solid #374151', borderRadius: 8, background: 'rgba(0,0,0,0.3)', fontSize: 11, color: '#6b7280', textAlign: 'center' }}>
          OpenAIP v8 · {copy.title} · {copy.globalSafetyBadges.join(' · ')} · {copy.noActionBadges.join(' · ')}
        </div>

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <Link to="/openaip-v8-command-center-preview" style={{ color: '#93c5fd', fontSize: 13, textDecoration: 'underline' }}>
            ← {copy.backToCommand}
          </Link>
        </div>
      </div>
    </div>
  );
}
