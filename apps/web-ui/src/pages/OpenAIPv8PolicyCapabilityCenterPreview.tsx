import React from 'react';
import { Link } from 'react-router-dom';
import { V8_POLICIES, V8_CAPABILITIES, getV8PolicySummary, getV8CapabilitySummary } from '../registry/openAipv8CenterData';

const ps = getV8PolicySummary();
const cs = getV8CapabilitySummary();

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

const riskColor: Record<string, string> = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };
const boolColor = (val: boolean): string => val ? '#22c55e' : '#6b7280';

function SummaryStrip() {
  return (
    <div style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', borderLeft: '3px solid #60a5fa' }}>
      <span style={{ ...badgeStyle, background: '#3b82f6', color: '#fff' }}>Capabilities: {cs.total}</span>
      <span style={{ ...badgeStyle, background: '#22c55e', color: '#fff' }}>Low: {cs.low}</span>
      <span style={{ ...badgeStyle, background: '#f59e0b', color: '#000' }}>Medium: {cs.medium}</span>
      <span style={{ ...badgeStyle, background: '#f97316', color: '#fff' }}>High: {cs.high}</span>
      <span style={{ ...badgeStyle, background: '#ef4444', color: '#fff' }}>Critical: {cs.critical}</span>
      <span style={{ ...badgeStyle, background: '#1e293b', color: '#fbbf24', border: '1px solid #fbbf24' }}>Blocked: {cs.blockedInPreview}</span>
      <span style={{ ...badgeStyle, background: '#1e293b', color: '#ef4444', border: '1px solid #ef4444' }}>Approval: {cs.approvalRequired}</span>
      <span style={{ ...badgeStyle, background: '#1e293b', color: '#f97316', border: '1px solid #f97316' }}>Gate: {cs.gateRequired}</span>
      <span style={{ ...badgeStyle, background: '#1e293b', color: '#60a5fa', border: '1px solid #60a5fa' }}>Audit: {cs.auditRequired}</span>
      <span style={{ ...badgeStyle, background: '#6b7280', color: '#fff' }}>Policies: {ps.total}</span>
    </div>
  );
}

function CapabilityTable() {
  const cols = [
    { label: 'Name', key: 'name', flex: 1.3 },
    { label: 'Category', key: 'category', flex: 0.8 },
    { label: 'Risk', key: 'risk', flex: 0.5 },
    { label: 'Default', key: 'defaultPolicy', flex: 1.2 },
    { label: 'Perm', key: 'permissionLevel', flex: 0.5 },
    { label: 'Approval', key: 'approval', flex: 0.5 },
    { label: 'Gate', key: 'gate', flex: 0.4 },
    { label: 'Stage C', key: 'stageC', flex: 0.5 },
    { label: 'Audit', key: 'audit', flex: 0.4 },
    { label: 'Preview', key: 'preview', flex: 0.5 },
    { label: 'Blocked Reason', key: 'blocked', flex: 1.5 },
  ];
  return (
    <div style={{ ...cardStyle, overflowX: 'auto' }}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#60a5fa', marginBottom: 8 }}>Capability Matrix ({V8_CAPABILITIES.length} entries)</h2>
      <p style={{ margin: '0 0 8px', fontSize: 12, color: '#ef4444', fontWeight: 600 }}>capability != permission — a capability can be visible and still blocked.</p>
      <div style={{ minWidth: 1400 }}>
        <div style={{ ...rowStyle, fontWeight: 600, color: '#93c5fd', fontSize: 11, borderBottom: '2px solid #374151' }}>
          {cols.map(c => <div key={c.key} style={cellStyle(c.flex)}>{c.label}</div>)}
        </div>
        {V8_CAPABILITIES.map(c => (
          <div key={c.id} style={rowStyle}>
            <div style={cellStyle(1.3)}>{c.name}</div>
            <div style={{ ...cellStyle(0.8), fontSize: 12, color: '#9ca3af' }}>{c.category}</div>
            <div style={cellStyle(0.5)}>
              <span style={{ ...Label, background: riskColor[c.risk] || '#6b7280', color: '#fff' }}>{c.risk}</span>
            </div>
            <div style={{ ...cellStyle(1.2), fontSize: 11, color: '#9ca3af' }}>{c.defaultPolicy}</div>
            <div style={cellStyle(0.5)}>{c.permissionLevel}</div>
            <div style={cellStyle(0.5)}>
              <span style={{ ...Label, background: boolColor(c.approvalRequired), color: '#fff' }}>{c.approvalRequired ? 'Yes' : 'No'}</span>
            </div>
            <div style={cellStyle(0.4)}>
              <span style={{ ...Label, background: boolColor(c.gateRequired), color: '#fff' }}>{c.gateRequired ? 'Yes' : 'No'}</span>
            </div>
            <div style={cellStyle(0.5)}>
              <span style={{ ...Label, background: boolColor(c.stageCRequired), color: '#fff' }}>{c.stageCRequired ? 'Yes' : 'No'}</span>
            </div>
            <div style={cellStyle(0.4)}>
              <span style={{ ...Label, background: boolColor(c.auditRequired), color: '#fff' }}>{c.auditRequired ? 'Yes' : 'No'}</span>
            </div>
            <div style={cellStyle(0.5)}>
              <span style={{ ...Label, background: c.allowedInPreview ? '#22c55e' : '#ef4444', color: '#fff' }}>{c.allowedInPreview ? 'Allowed' : 'Blocked'}</span>
            </div>
            <div style={{ ...cellStyle(1.5), fontSize: 11, color: '#fca5a5' }}>{c.blockedReason || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PolicyTable() {
  const cols = [
    { label: 'Name', key: 'name', flex: 1.5 },
    { label: 'Lvl', key: 'permissionLevel', flex: 0.4 },
    { label: 'Scope', key: 'scope', flex: 1.2 },
    { label: 'Default', key: 'defaultState', flex: 1 },
    { label: 'Approval', key: 'approval', flex: 0.5 },
    { label: 'Gate', key: 'gate', flex: 0.4 },
    { label: 'Audit', key: 'audit', flex: 0.4 },
    { label: 'Enforcement', key: 'enforcementPhase', flex: 0.7 },
    { label: 'Allowed Caps', key: 'allowed', flex: 1.5 },
    { label: 'Blocked Caps', key: 'blocked', flex: 1.5 },
  ];
  return (
    <div style={{ ...cardStyle, overflowX: 'auto' }}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#60a5fa', marginBottom: 8 }}>Policy Matrix ({V8_POLICIES.length} entries)</h2>
      <p style={{ margin: '0 0 8px', fontSize: 12, color: '#ef4444', fontWeight: 600 }}>policy before buttons — check policy before showing action UI.</p>
      <div style={{ minWidth: 1600 }}>
        <div style={{ ...rowStyle, fontWeight: 600, color: '#93c5fd', fontSize: 11, borderBottom: '2px solid #374151' }}>
          {cols.map(c => <div key={c.key} style={cellStyle(c.flex)}>{c.label}</div>)}
        </div>
        {V8_POLICIES.map(p => (
          <div key={p.id} style={rowStyle}>
            <div style={cellStyle(1.5)}>{p.name}</div>
            <div style={cellStyle(0.4)}>{p.permissionLevel}</div>
            <div style={{ ...cellStyle(1.2), fontSize: 11, color: '#9ca3af' }}>{p.scope}</div>
            <div style={{ ...cellStyle(1), fontSize: 11, color: '#9ca3af' }}>{p.defaultState}</div>
            <div style={cellStyle(0.5)}>
              <span style={{ ...Label, background: boolColor(p.approvalRequired), color: '#fff' }}>{p.approvalRequired ? 'Yes' : 'No'}</span>
            </div>
            <div style={cellStyle(0.4)}>
              <span style={{ ...Label, background: boolColor(p.gateRequired), color: '#fff' }}>{p.gateRequired ? 'Yes' : 'No'}</span>
            </div>
            <div style={cellStyle(0.4)}>
              <span style={{ ...Label, background: boolColor(p.auditRequired), color: '#fff' }}>{p.auditRequired ? 'Yes' : 'No'}</span>
            </div>
            <div style={{ ...cellStyle(0.7), fontSize: 11, color: '#9ca3af' }}>{p.enforcementPhase}</div>
            <div style={{ ...cellStyle(1.5), fontSize: 10, color: '#22c55e' }}>{p.allowedCapabilities.slice(0, 4).join(', ')}{p.allowedCapabilities.length > 4 ? '...' : ''}</div>
            <div style={{ ...cellStyle(1.5), fontSize: 10, color: '#fca5a5' }}>{p.blockedCapabilities.slice(0, 4).join(', ')}{p.blockedCapabilities.length > 4 ? '...' : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PermissionLadderPanel() {
  const levels = [
    { level: 'L0', name: 'Registered', desc: 'No permissions — registry only', color: '#6b7280' },
    { level: 'L1', name: 'Read-only', desc: 'Observe status, registry, audit trail', color: '#22c55e' },
    { level: 'L2', name: 'Suggest', desc: 'Draft suggestions, review-only actions, read repo', color: '#60a5fa' },
    { level: 'L3', name: 'Draft', desc: 'Create patches, draft task packs, call models', color: '#f97316' },
    { level: 'L4', name: 'Apply with approval', desc: 'Apply changes with human approval — not available in preview', color: '#ef4444' },
    { level: 'L5', name: 'Gated execution', desc: 'Full execution with Gate + Stage C — not available in preview', color: '#dc2626' },
  ];
  return (
    <div style={cardStyle}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#fbbf24' }}>Permission Ladder L0–L5</h2>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#ef4444', fontWeight: 600 }}>This preview does not grant L4/L5 actions.</p>
      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>Permission level is a maximum ceiling, not an automatic grant. All execution requires Gate open + Stage C enabled.</p>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {levels.map(l => (
          <div key={l.level} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
            <span style={{ ...Label, background: l.color, color: l.color === '#f59e0b' ? '#000' : '#fff', minWidth: 24, textAlign: 'center', fontWeight: 700 }}>{l.level}</span>
            <span style={{ fontWeight: 600, color: '#e5e7eb', minWidth: 140 }}>{l.name}</span>
            <span style={{ color: '#cbd5e1' }}>{l.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RulesPanel() {
  const rules = [
    'capability != permission — a capability can be visible and still blocked',
    'config != permission — configured does not mean authorized to use',
    'enabled != execution — enabled agents are not automatically executing',
    'authorized != gateOpen — authorized access is not gate access',
    'gateOpen != stageCEnabled — Gate open does not automatically enable Stage C',
    'UI switch != backend truth — toggling UI does not change backend state',
    'policy before buttons — check policy before showing action UI',
    'dry-run before execution — simulate before actual execution',
  ];
  return (
    <div style={{ ...cardStyle, borderLeft: '3px solid #fbbf24' }}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#fbbf24' }}>Core Rules</h2>
      <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: '#cbd5e1', lineHeight: 1.8 }}>
        {rules.map(r => <li key={r}>{r}</li>)}
      </ul>
    </div>
  );
}

function LinkageStrip() {
  return (
    <div style={{ ...cardStyle, borderLeft: '3px solid #93c5fd' }}>
      <h2 style={{ margin: 0, fontSize: 14, color: '#93c5fd' }}>Center Linkage</h2>
      <p style={{ margin: '4px 0 8px', fontSize: 12, color: '#9ca3af' }}>Policy + Capability Center governs permissions across all centers.</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link to="/openaip-v8-agent-center-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>Agent Center</Link>
        <Link to="/openaip-v8-task-center-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>Task Center</Link>
        <Link to="/openaip-v8-audit-center-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>Audit Center</Link>
        <Link to="/openaip-v8-execution-gateway-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>Execution Gateway</Link>
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
        <li>No policy mutation</li>
        <li>No capability enablement</li>
        <li>No Gate opening</li>
        <li>No Stage C enablement</li>
        <li>No execution</li>
        <li>No config write</li>
        <li>No release/tag/restore</li>
        <li>No connector action</li>
      </ul>
    </div>
  );
}

export default function OpenAIPv8PolicyCapabilityCenterPreview(): React.JSX.Element {
  return (
    <div style={shellStyle}>
      <div style={panelStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26 }}>OpenAIP v8 Policy + Capability Center Preview</h1>
            <p style={{ marginTop: 4, color: '#93c5fd', fontSize: 14 }}>权限脑 — 能力与策略管理</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#9ca3af' }}>能力不等于权限，政策先于按钮。管理风险等级、权限映射和 Gate/Stage C 要求。</p>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <span style={{ ...badgeStyle, background: '#3b82f6', color: '#fff' }}>Readonly Preview</span>
            <span style={{ ...badgeStyle, background: '#059669', color: '#fff' }}>No runtime mutation</span>
            <span style={{ ...badgeStyle, background: '#dc2626', color: '#fff' }}>Gate CLOSED</span>
            <span style={{ ...badgeStyle, background: '#7c3aed', color: '#fff' }}>Stage C disabled</span>
            <span style={{ ...badgeStyle, background: '#6b7280', color: '#fff' }}>Registry-backed</span>
            <span style={{ ...badgeStyle, background: '#ef4444', color: '#fff' }}>No policy mutation</span>
          </div>
        </div>

        {/* Global Status Strip */}
        <div style={{ ...cardStyle, display: 'flex', gap: 4, flexWrap: 'wrap', borderLeft: '3px solid #f59e0b' }}>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#fbbf24', border: '1px solid #fbbf24' }}>Preview only</span>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#22c55e', border: '1px solid #22c55e' }}>No runtime mutation</span>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#fbbf24', border: '1px solid #fbbf24' }}>Gate CLOSED</span>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#fbbf24', border: '1px solid #fbbf24' }}>Stage C disabled</span>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#93c5fd', border: '1px solid #93c5fd' }}>Registry-backed data</span>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#9ca3af', border: '1px solid #374151' }}>No config writes</span>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#ef4444', border: '1px solid #ef4444' }}>No policy mutation</span>
        </div>

        {/* Summary Strip */}
        <SummaryStrip />

        {/* Capability Matrix */}
        <CapabilityTable />

        {/* Policy Matrix */}
        <PolicyTable />

        {/* Permission Ladder Panel */}
        <PermissionLadderPanel />

        {/* Rules Panel */}
        <RulesPanel />

        {/* Center Linkage */}
        <LinkageStrip />

        {/* Safety Boundary */}
        <SafetyBoundary />

        {/* Footer */}
        <div style={{ marginTop: 16, padding: 10, border: '1px solid #374151', borderRadius: 8, background: 'rgba(0,0,0,0.3)', fontSize: 11, color: '#6b7280', textAlign: 'center' }}>
          OpenAIP v8 · Policy + Capability Center · Readonly preview · No policy mutation · No capability enablement · Gate remains CLOSED · Stage C disabled
        </div>

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <Link to="/openaip-v8-command-center-preview" style={{ color: '#93c5fd', fontSize: 13, textDecoration: 'underline' }}>
            ← Back to OpenAIP v8 Command Center
          </Link>
        </div>
      </div>
    </div>
  );
}
