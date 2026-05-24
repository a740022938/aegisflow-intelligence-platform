import React from 'react';
import { Link } from 'react-router-dom';
import { V8_TASKS, getV8TaskSummary } from '../registry/openAipv8CenterData';
import { getOpenAipv8Copy } from './openAipv8Copy';

const s = getV8TaskSummary();

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

function SummaryStrip() {
  return (
    <div style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', borderLeft: '3px solid #60a5fa' }}>
      <span style={{ ...badgeStyle, background: '#3b82f6', color: '#fff' }}>Total: {s.total}</span>
      <span style={{ ...badgeStyle, background: '#f59e0b', color: '#000' }}>Draft: {s.draft}</span>
      <span style={{ ...badgeStyle, background: '#f97316', color: '#fff' }}>Pending Review: {s.pendingReview}</span>
      <span style={{ ...badgeStyle, background: '#ef4444', color: '#fff' }}>Blocked: {s.blocked}</span>
      <span style={{ ...badgeStyle, background: '#1e293b', color: '#fbbf24', border: '1px solid #fbbf24' }}>Receipt: {s.receiptRequired}</span>
      <span style={{ ...badgeStyle, background: '#1e293b', color: '#60a5fa', border: '1px solid #60a5fa' }}>Audit: {s.auditRequired}</span>
      <span style={{ ...badgeStyle, background: '#1e293b', color: '#ef4444', border: '1px solid #ef4444' }}>Human Auth: {s.humanAuthRequired}</span>
      <span style={{ ...badgeStyle, background: '#dc2626', color: '#fff' }}>Critical: {s.riskCritical}</span>
      <span style={{ ...badgeStyle, background: '#6b7280', color: '#fff' }}>Needs Evidence: {s.reviewNeedsEvidence}</span>
    </div>
  );
}

const lcColor: Record<string, string> = {
  draft: '#f59e0b', ready_for_agent: '#3b82f6', running_external: '#22c55e',
  receipt_pending: '#f97316', pending_review: '#a855f7', accepted: '#22c55e',
  rejected: '#ef4444', blocked: '#6b7280', archived: '#6b7280'
};
const riskColor: Record<string, string> = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', critical: '#ef4444' };
const reviewColor: Record<string, string> = {
  pending_review: '#f59e0b', needs_evidence: '#f97316', accepted: '#22c55e',
  rejected: '#ef4444', blocked: '#6b7280', archived: '#6b7280'
};

function TaskTable() {
  const cols = [
    { label: 'Title', key: 'title', flex: 1.5 },
    { label: 'Intent', key: 'intent', flex: 1.2 },
    { label: 'Phase', key: 'phase', flex: 0.5 },
    { label: 'Status', key: 'lifecycle', flex: 0.9 },
    { label: 'Risk', key: 'risk', flex: 0.5 },
    { label: 'Agent', key: 'recommendedAgent', flex: 1.2 },
    { label: 'Permission', key: 'permissionRequired', flex: 0.7 },
    { label: 'Review', key: 'reviewState', flex: 0.9 },
    { label: 'Evidence', key: 'evidence', flex: 1.5 },
  ];
  return (
    <div style={{ ...cardStyle, overflowX: 'auto' }}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#60a5fa', marginBottom: 8 }}>Task Archetypes ({V8_TASKS.length} entries)</h2>
      <div style={{ minWidth: 1100 }}>
        <div style={{ ...rowStyle, fontWeight: 600, color: '#93c5fd', fontSize: 11, borderBottom: '2px solid #374151' }}>
          {cols.map(c => <div key={c.key} style={cellStyle(c.flex)}>{c.label}</div>)}
        </div>
        {V8_TASKS.map(t => (
          <div key={t.id} style={rowStyle}>
            <div style={cellStyle(1.5)}>{t.title}</div>
            <div style={{ ...cellStyle(1.2), fontSize: 12, color: '#9ca3af' }}>{t.intent}</div>
            <div style={cellStyle(0.5)}>{t.phase}</div>
            <div style={cellStyle(0.9)}>
              <span style={{ ...Label, background: lcColor[t.lifecycle] || '#6b7280', color: '#fff' }}>{t.lifecycle}</span>
            </div>
            <div style={cellStyle(0.5)}>
              <span style={{ ...Label, background: riskColor[t.risk] || '#6b7280', color: '#fff' }}>{t.risk}</span>
            </div>
            <div style={{ ...cellStyle(1.2), fontSize: 11, color: '#9ca3af' }}>{t.recommendedAgent}</div>
            <div style={cellStyle(0.7)}>{t.permissionRequired}</div>
            <div style={cellStyle(0.9)}>
              <span style={{ ...Label, background: reviewColor[t.reviewState] || '#6b7280', color: '#fff' }}>{t.reviewState}</span>
            </div>
            <div style={{ ...cellStyle(1.5), fontSize: 11, color: '#9ca3af' }}>{t.requiredEvidence.slice(0, 3).join(', ')}{t.requiredEvidence.length > 3 ? '...' : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskPackGenPanel() {
  return (
    <div style={{ ...cardStyle, borderLeft: '3px solid #3b82f6' }}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#60a5fa' }}>Task Pack Generator</h2>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#ef4444', fontWeight: 600 }}>This preview does not generate, dispatch, or execute tasks.</p>
      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>The Task Pack Generator will produce structured task packs from center state. Each pack includes objectives, safety boundaries, allowed actions, forbidden actions, verification requirements, receipt format, and stop conditions.</p>
      <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: '#cbd5e1', lineHeight: 1.8 }}>
        <li>Task objective — what the task intends to accomplish</li>
        <li>Safety boundaries — what the task must NOT do</li>
        <li>Allowed actions — readonly operations the task may perform</li>
        <li>Forbidden actions — operations blocked regardless of permission</li>
        <li>Verification requirements — tests, lint, build, safety grep</li>
        <li>Final receipt format — structured evidence acceptance</li>
        <li>Stop conditions — when to abort without receipt</li>
      </ul>
    </div>
  );
}

function ReceiptIntakePanel() {
  return (
    <div style={{ ...cardStyle, borderLeft: '3px solid #22c55e' }}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#22c55e' }}>Receipt Intake</h2>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#ef4444', fontWeight: 600 }}>Receipt intake is readonly in this preview.</p>
      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>Each task requires a structured receipt including evidence of completion. Receipts with incomplete evidence are rejected.</p>
      <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: '#cbd5e1', lineHeight: 1.8 }}>
        <li>Required receipt fields — task id, commit hash, evidence chain, safety summary</li>
        <li>Incomplete receipt rejection — missing evidence triggers review</li>
        <li>Commit/push/working tree checks — receipt must reference a clean working tree</li>
        <li>Safety summary checks — receipt must include safety grep results</li>
        <li>Evidence requirements — screenshots, test results, diff review</li>
      </ul>
    </div>
  );
}

function ReviewQueuePanel() {
  const states = [
    { state: 'pending_review', desc: 'Awaiting human reviewer attention', color: '#f59e0b' },
    { state: 'needs_evidence', desc: 'Evidence incomplete, more information required', color: '#f97316' },
    { state: 'accepted', desc: 'Task verified and accepted', color: '#22c55e' },
    { state: 'rejected', desc: 'Task rejected due to safety or quality concerns', color: '#ef4444' },
    { state: 'blocked', desc: 'Task cannot proceed — Gate/Stage C/human authorization needed', color: '#6b7280' },
    { state: 'archived', desc: 'Task closed and archived for audit', color: '#6b7280' },
  ];
  return (
    <div style={{ ...cardStyle, borderLeft: '3px solid #a855f7' }}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#a855f7' }}>Review Queue</h2>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#ef4444', fontWeight: 600 }}>Human review remains the acceptance gate.</p>
      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>All task acceptance requires human review. No auto-acceptance in preview.</p>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {states.map(s => (
          <div key={s.state} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
            <span style={{ ...Label, background: s.color, color: s.color === '#f59e0b' ? '#000' : '#fff', minWidth: 110, textAlign: 'center' }}>{s.state}</span>
            <span style={{ color: '#cbd5e1' }}>{s.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskLifecyclePanel() {
  const states = [
    { state: 'draft', desc: 'Task defined but not ready for agent assignment', color: '#f59e0b' },
    { state: 'ready_for_agent', desc: 'Task ready for agent assignment and execution', color: '#3b82f6' },
    { state: 'running_external', desc: 'Task executing externally (not in preview)', color: '#22c55e' },
    { state: 'receipt_pending', desc: 'Task completed, waiting for receipt intake', color: '#f97316' },
    { state: 'pending_review', desc: 'Receipt submitted, awaiting human review', color: '#a855f7' },
    { state: 'accepted', desc: 'Task accepted after evidence verification', color: '#22c55e' },
    { state: 'rejected', desc: 'Task rejected due to insufficient evidence or safety', color: '#ef4444' },
    { state: 'blocked', desc: 'Task blocked — Gate/Stage C/human authorization required', color: '#6b7280' },
    { state: 'archived', desc: 'Task closed and archived for audit trail', color: '#6b7280' },
  ];
  return (
    <div style={cardStyle}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#fbbf24' }}>Task Lifecycle</h2>
      <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9ca3af' }}>All tasks in this preview are blocked from execution and agent dispatch. Lifecycle describes task readiness, not execution state.</p>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {states.map(s => (
          <div key={s.state} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
            <span style={{ ...Label, background: s.color, color: s.color === '#f59e0b' ? '#000' : '#fff', minWidth: 110, textAlign: 'center' }}>{s.state}</span>
            <span style={{ color: '#cbd5e1' }}>{s.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SafetyBoundary() {
  return (
    <div style={{ ...cardStyle, borderLeft: '3px solid #ef4444' }}>
      <h2 style={{ margin: 0, fontSize: 14, color: '#ef4444' }}>Safety Boundary</h2>
      <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: '#fca5a5', lineHeight: 1.8 }}>
        <li>No task execution</li>
        <li>No task dispatch</li>
        <li>No agent invocation</li>
        <li>No DB write</li>
        <li>No Gate opening</li>
        <li>No Stage C enablement</li>
        <li>No release/tag/restore</li>
        <li>No connector action</li>
      </ul>
    </div>
  );
}

function LinkageStrip() {
  return (
    <div style={{ ...cardStyle, borderLeft: '3px solid #93c5fd' }}>
      <h2 style={{ margin: 0, fontSize: 14, color: '#93c5fd' }}>Task + Agent + Audit Linkage</h2>
      <p style={{ margin: '4px 0 8px', fontSize: 12, color: '#9ca3af' }}>Task Center connects to the following centers for agent assignment, audit trail, and policy enforcement.</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link to="/openaip-v8-agent-center-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>Agent Center</Link>
        <Link to="/openaip-v8-audit-center-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>Audit Center</Link>
        <Link to="/openaip-v8-policy-capability-center-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>Policy + Capability Center</Link>
        <Link to="/openaip-v8-execution-gateway-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>Execution Gateway</Link>
        <Link to="/openaip-v8-command-center-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>Command Center</Link>
      </div>
    </div>
  );
}

export default function OpenAIPv8TaskCenterPreview(): React.JSX.Element {
  const copy = getOpenAipv8Copy('task');
  return (
    <div style={shellStyle}>
      <div style={panelStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26 }}>{copy.title}</h1>
            <p style={{ marginTop: 4, color: '#93c5fd', fontSize: 14 }}>{copy.subtitle}</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#9ca3af' }}>生成任务包、管理回执接收、减少人工复制粘贴的重复劳动。</p>
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
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#fbbf24', border: '1px solid #fbbf24' }}>Preview only</span>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#22c55e', border: '1px solid #22c55e' }}>No runtime mutation</span>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#fbbf24', border: '1px solid #fbbf24' }}>Gate CLOSED</span>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#fbbf24', border: '1px solid #fbbf24' }}>Stage C disabled</span>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#93c5fd', border: '1px solid #93c5fd' }}>Registry-backed data</span>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#9ca3af', border: '1px solid #374151' }}>No config writes</span>
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#ef4444', border: '1px solid #ef4444' }}>No execution</span>
        </div>

        {/* Task Summary Strip */}
        <SummaryStrip />

        {/* Task Archetype Table */}
        <TaskTable />

        {/* Task Pack Generator Panel */}
        <TaskPackGenPanel />

        {/* Receipt Intake Panel */}
        <ReceiptIntakePanel />

        {/* Review Queue Panel */}
        <ReviewQueuePanel />

        {/* Task Lifecycle Panel */}
        <TaskLifecyclePanel />

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
