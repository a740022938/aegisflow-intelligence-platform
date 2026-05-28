import React from 'react';
import { Link } from 'react-router-dom';
import { V8_AGENTS, getV8AgentCenterSummary } from '../registry/openAipv8CenterData';
import { getOpenAipv8Copy } from './openAipv8Copy';

const s = getV8AgentCenterSummary();

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

const rowStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderBottom: '1px solid #1e293b',
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  fontSize: 13,
};

const cellStyle = (flex: number = 1): React.CSSProperties => ({ flex, padding: '0 4px' });

const Label: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 6px',
  borderRadius: 3,
  fontSize: 10,
  fontWeight: 600,
  marginRight: 4,
};

function AgentTable() {
  const cols = [
    { label: 'Name', key: 'name', flex: 1.2 },
    { label: 'Kind', key: 'integrationKind', flex: 1.2 },
    { label: 'Lifecycle', key: 'lifecycle', flex: 1 },
    { label: 'Permission', key: 'permissionLevel', flex: 0.8 },
    { label: 'Risk', key: 'risk', flex: 0.6 },
    { label: 'Capabilities', key: 'caps', flex: 1.5 },
    { label: 'Task', key: 'taskReadiness', flex: 0.7 },
    { label: 'Audit', key: 'auditReadiness', flex: 0.7 },
    { label: 'Memory', key: 'memoryAccess', flex: 0.7 },
    { label: 'Knowledge', key: 'knowledgeAccess', flex: 0.7 },
  ];
  const lcColor: Record<string, string> = { enabled: '#22c55e', registered: '#3b82f6', planned: '#f59e0b', disabled: '#6b7280', paused: '#f97316', quarantined: '#ef4444' };
  const riskColor: Record<string, string> = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };
  const readinessColor: Record<string, string> = { ready: '#22c55e', partial: '#f59e0b', not_ready: '#6b7280' };
  return (
    <div style={{ ...cardStyle, overflowX: 'auto' }}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#60a5fa', marginBottom: 8 }}>Agent Registry ({V8_AGENTS.length} entries)</h2>
      <div style={{ minWidth: 1000 }}>
        <div style={{ ...rowStyle, fontWeight: 600, color: '#93c5fd', fontSize: 11, borderBottom: '2px solid #374151' }}>
          {cols.map(c => <div key={c.key} style={cellStyle(c.flex)}>{c.label}</div>)}
        </div>
        {V8_AGENTS.map(a => (
          <div key={a.id} style={rowStyle}>
            <div style={cellStyle(1.2)}>{a.name}</div>
            <div style={cellStyle(1.2)}>{a.integrationKind}</div>
            <div style={cellStyle(1)}>
              <span style={{ ...Label, background: lcColor[a.lifecycle] || '#6b7280', color: '#fff' }}>{a.lifecycle}</span>
            </div>
            <div style={cellStyle(0.8)}>{a.permissionLevel}</div>
            <div style={cellStyle(0.6)}>
              {a.risk && <span style={{ ...Label, background: riskColor[a.risk] || '#6b7280', color: '#fff' }}>{a.risk}</span>}
            </div>
            <div style={{ ...cellStyle(1.5), fontSize: 11, color: '#9ca3af' }}>
              {a.capabilities && a.capabilities.length > 0 ? a.capabilities.slice(0, 3).join(', ') + (a.capabilities.length > 3 ? '...' : '') : '—'}
            </div>
            <div style={cellStyle(0.7)}>
              <span style={{ ...Label, background: readinessColor[a.taskReadiness || 'not_ready'] || '#6b7280', color: '#fff' }}>{a.taskReadiness || '—'}</span>
            </div>
            <div style={cellStyle(0.7)}>
              <span style={{ ...Label, background: readinessColor[a.auditReadiness || 'not_ready'] || '#6b7280', color: '#fff' }}>{a.auditReadiness || '—'}</span>
            </div>
            <div style={cellStyle(0.7)}>{a.memoryAccess || '—'}</div>
            <div style={cellStyle(0.7)}>{a.knowledgeAccess || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryStrip() {
  return (
    <div style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', borderLeft: '3px solid #60a5fa' }}>
      <span style={{ ...badgeStyle, background: '#3b82f6', color: '#fff' }}>Total: {s.total}</span>
      <span style={{ ...badgeStyle, background: '#22c55e', color: '#fff' }}>Enabled: {s.enabled}</span>
      <span style={{ ...badgeStyle, background: '#3b82f6', color: '#fff' }}>Registered: {s.registered}</span>
      <span style={{ ...badgeStyle, background: '#f59e0b', color: '#000' }}>Planned: {s.planned}</span>
      <span style={{ ...badgeStyle, background: '#6b7280', color: '#fff' }}>Disabled: {s.disabled}</span>
      <span style={{ ...badgeStyle, background: '#1e293b', color: '#fbbf24', border: '1px solid #fbbf24' }}>L0: {s.l0}</span>
      <span style={{ ...badgeStyle, background: '#1e293b', color: '#22c55e', border: '1px solid #22c55e' }}>L1: {s.l1}</span>
      <span style={{ ...badgeStyle, background: '#1e293b', color: '#60a5fa', border: '1px solid #60a5fa' }}>L2: {s.l2}</span>
      <span style={{ ...badgeStyle, background: '#1e293b', color: '#f97316', border: '1px solid #f97316' }}>L3: {s.l3}</span>
      <span style={{ ...badgeStyle, background: '#ef4444', color: '#fff' }}>High Risk: {s.riskHigh}</span>
      <span style={{ ...badgeStyle, background: '#6b7280', color: '#fff' }}>Blocked: {s.executionBlocked}</span>
    </div>
  );
}

function LifecyclePanel() {
  const items = [
    { label: 'planned', desc: 'Agent concept defined, not yet registered in the system', color: '#f59e0b' },
    { label: 'registered', desc: 'Agent registered in the registry, no execution allowed', color: '#3b82f6' },
    { label: 'enabled', desc: 'Agent enabled for potential execution, but Gate must be open', color: '#22c55e' },
    { label: 'paused', desc: 'Agent paused, state preserved, no operations', color: '#f97316' },
    { label: 'disabled', desc: 'Agent disabled, no operations possible', color: '#6b7280' },
    { label: 'quarantined', desc: 'Agent isolated for review, requires investigation', color: '#ef4444' },
  ];
  return (
    <div style={cardStyle}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#fbbf24' }}>Agent Lifecycle</h2>
      <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9ca3af' }}>All agents in this preview are blocked from execution. Lifecycle describes registration state, not execution capability.</p>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(item => (
          <div key={item.label} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
            <span style={{ ...Label, background: item.color, color: item.color === '#f59e0b' ? '#000' : '#fff', minWidth: 80, textAlign: 'center' }}>{item.label}</span>
            <span style={{ color: '#cbd5e1' }}>{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PermissionLadder() {
  const levels = [
    { level: 'L0', name: 'Registered', desc: 'No permissions — agent exists in registry only', color: '#6b7280' },
    { level: 'L1', name: 'Read-only', desc: 'Observe agent status, registry data, and audit trail', color: '#22c55e' },
    { level: 'L2', name: 'Suggest', desc: 'Draft suggestions, review-only actions', color: '#60a5fa' },
    { level: 'L3', name: 'Draft', desc: 'Create patches, run local tests, draft task packs', color: '#f97316' },
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

function TaskAuditLinkage() {
  return (
    <div style={cardStyle}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#60a5fa' }}>Task + Audit Linkage</h2>
      <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9ca3af' }}>Agent Center connects to the following centers for task dispatch, audit trail, and policy enforcement.</p>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Link to="/openaip-v8-task-center-preview" style={{ color: '#93c5fd', fontSize: 13 }}>Task Pack Generator — Create task packs for agent assignment</Link>
        <Link to="/openaip-v8-audit-center-preview" style={{ color: '#93c5fd', fontSize: 13 }}>Audit Trail — View agent audit receipts and evidence</Link>
        <Link to="/openaip-v8-policy-capability-center-preview" style={{ color: '#93c5fd', fontSize: 13 }}>Policy + Capability Center — Agent capabilities and Gate policy</Link>
        <Link to="/openaip-v8-execution-gateway-preview" style={{ color: '#93c5fd', fontSize: 13 }}>Execution Gateway — Gate state and opening requirements</Link>
      </div>
    </div>
  );
}

function SafetyBoundary() {
  return (
    <div style={{ ...cardStyle, borderLeft: '3px solid #ef4444' }}>
      <h2 style={{ margin: 0, fontSize: 14, color: '#ef4444' }}>Safety Boundary</h2>
      <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: '#fca5a5', lineHeight: 1.8 }}>
        <li>No agent execution in this preview</li>
        <li>No OpenClaw launch</li>
        <li>No browser control</li>
        <li>No file edits</li>
        <li>No connector action</li>
        <li>No Gate opening</li>
        <li>No Stage C enablement</li>
        <li>No release/tag/restore</li>
      </ul>
    </div>
  );
}

export default function OpenAIPv8AgentCenterPreview(): React.JSX.Element {
  const copy = getOpenAipv8Copy('agent');
  return (
    <div style={shellStyle}>
      <div style={panelStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26 }}>{copy.title}</h1>
            <p style={{ marginTop: 4, color: '#93c5fd', fontSize: 14 }}>{copy.subtitle}</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#9ca3af' }}>管理 AI Agent 的注册、生命周期和权限等级，是 OpenAIP v8 的主线中心。</p>
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
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#93c5fd', border: '1px solid #93c5fd' }}>Readonly Preview</span>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#fbbf24', border: '1px solid #fbbf24' }}>Preview only</span>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#22c55e', border: '1px solid #22c55e' }}>No runtime mutation</span>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#fbbf24', border: '1px solid #fbbf24' }}>Gate CLOSED</span>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#fbbf24', border: '1px solid #fbbf24' }}>Stage C disabled</span>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#93c5fd', border: '1px solid #93c5fd' }}>Registry-backed data</span>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#9ca3af', border: '1px solid #374151' }}>No config writes</span>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#9ca3af', border: '1px solid #374151' }}>No execution</span>
        </div>

        {/* Agent Summary Strip */}
        <SummaryStrip />

        {/* Agent Registry Table */}
        <AgentTable />

        {/* Agent Lifecycle Panel */}
        <LifecyclePanel />

        {/* Permission Ladder Panel */}
        <PermissionLadder />

        {/* Task + Audit Linkage */}
        <TaskAuditLinkage />

        {/* Safety Boundary */}
        <SafetyBoundary />

        {/* Related Centers */}
        <div style={{ ...cardStyle, borderLeft: '3px solid #93c5fd' }}>
          <h2 style={{ margin: 0, fontSize: 13, color: '#93c5fd', marginBottom: 6 }}>Related Centers</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to="/openaip-v8-task-center-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>Task Center</Link>
            <Link to="/openaip-v8-policy-capability-center-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>Policy Router + Capability Center</Link>
          </div>
        </div>

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
