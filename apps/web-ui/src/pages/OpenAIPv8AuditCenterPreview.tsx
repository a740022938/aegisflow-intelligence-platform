import React from 'react';
import { Link } from 'react-router-dom';
import { V8_AUDITS, getV8AuditSummary } from '../registry/openAipv8CenterData';
import { getOpenAipv8Copy } from './openAipv8Copy';

const s = getV8AuditSummary();

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

const acceptColor: Record<string, string> = {
  accepted: '#22c55e', needs_evidence: '#f97316', rejected: '#ef4444',
  blocked: '#6b7280', archived: '#6b7280'
};
const evidenceColor: Record<string, string> = {
  seal_grade: '#22c55e', sufficient: '#3b82f6', partial: '#f59e0b', none: '#6b7280'
};
const boolColor = (val: boolean): string => val ? '#22c55e' : '#6b7280';

function SummaryStrip() {
  return (
    <div style={{ ...cardStyle, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', borderLeft: '3px solid #60a5fa' }}>
      <span style={{ ...badgeStyle, background: '#3b82f6', color: '#fff' }}>Total: {s.total}</span>
      <span style={{ ...badgeStyle, background: '#22c55e', color: '#fff' }}>Accepted: {s.accepted}</span>
      <span style={{ ...badgeStyle, background: '#f97316', color: '#fff' }}>Needs Evidence: {s.needsEvidence}</span>
      <span style={{ ...badgeStyle, background: '#6b7280', color: '#fff' }}>Blocked: {s.blocked}</span>
      <span style={{ ...badgeStyle, background: '#22c55e', color: '#000' }}>Seal Grade: {s.sealGrade}</span>
      <span style={{ ...badgeStyle, background: '#1e293b', color: '#ef4444', border: '1px solid #ef4444' }}>Human Auth: {s.humanAuthNeeded}</span>
      <span style={{ ...badgeStyle, background: s.runtimeChanged > 0 ? '#ef4444' : '#059669', color: '#fff' }}>Runtime Changed: {s.runtimeChanged}</span>
      <span style={{ ...badgeStyle, background: s.gateOpened > 0 ? '#ef4444' : '#059669', color: '#fff' }}>Gate/Stage C: {s.gateOpened + s.stageCEnabled}</span>
      <span style={{ ...badgeStyle, background: '#3b82f6', color: '#fff' }}>Pushed: {s.pushed}</span>
    </div>
  );
}

function AuditTable() {
  const cols = [
    { label: 'Title', key: 'title', flex: 1.5 },
    { label: 'Type', key: 'taskType', flex: 1.2 },
    { label: 'Center', key: 'relatedCenter', flex: 1 },
    { label: 'Commit', key: 'commitHash', flex: 1 },
    { label: 'Pushed', key: 'pushed', flex: 0.5 },
    { label: 'Tree', key: 'workingTreeClean', flex: 0.5 },
    { label: 'Verification', key: 'verificationStatus', flex: 0.8 },
    { label: 'Safety', key: 'safetyStatus', flex: 0.8 },
    { label: 'Acceptance', key: 'acceptanceState', flex: 0.8 },
    { label: 'Evidence', key: 'evidenceLevel', flex: 0.8 },
    { label: 'Human Auth', key: 'humanAuth', flex: 0.6 },
  ];
  return (
    <div style={{ ...cardStyle, overflowX: 'auto' }}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#60a5fa', marginBottom: 8 }}>Audit Registry ({V8_AUDITS.length} entries)</h2>
      <div style={{ minWidth: 1300 }}>
        <div style={{ ...rowStyle, fontWeight: 600, color: '#93c5fd', fontSize: 11, borderBottom: '2px solid #374151' }}>
          {cols.map(c => <div key={c.key} style={cellStyle(c.flex)}>{c.label}</div>)}
        </div>
        {V8_AUDITS.map(a => (
          <div key={a.id} style={rowStyle}>
            <div style={cellStyle(1.5)}>{a.title}</div>
            <div style={{ ...cellStyle(1.2), fontSize: 12, color: '#9ca3af' }}>{a.taskType}</div>
            <div style={cellStyle(1)}>{a.relatedCenter}</div>
            <div style={{ ...cellStyle(1), fontSize: 11, color: '#9ca3af' }}>{a.commitHash}</div>
            <div style={cellStyle(0.5)}>
              <span style={{ ...Label, background: boolColor(a.pushed), color: '#fff' }}>{a.pushed ? 'Yes' : 'No'}</span>
            </div>
            <div style={cellStyle(0.5)}>
              <span style={{ ...Label, background: boolColor(a.workingTreeClean), color: '#fff' }}>{a.workingTreeClean ? 'Clean' : 'Dirty'}</span>
            </div>
            <div style={cellStyle(0.8)}>
              <span style={{ ...Label, background: a.verificationStatus === 'passed' ? '#22c55e' : '#f59e0b', color: '#fff' }}>{a.verificationStatus}</span>
            </div>
            <div style={cellStyle(0.8)}>
              <span style={{ ...Label, background: a.safetyStatus === 'passed' ? '#22c55e' : '#ef4444', color: '#fff' }}>{a.safetyStatus}</span>
            </div>
            <div style={cellStyle(0.8)}>
              <span style={{ ...Label, background: acceptColor[a.acceptanceState] || '#6b7280', color: '#fff' }}>{a.acceptanceState}</span>
            </div>
            <div style={cellStyle(0.8)}>
              <span style={{ ...Label, background: evidenceColor[a.evidenceLevel] || '#6b7280', color: '#fff' }}>{a.evidenceLevel}</span>
            </div>
            <div style={cellStyle(0.6)}>
              <span style={{ ...Label, background: a.humanAuthorizationNeeded ? '#ef4444' : '#6b7280', color: '#fff' }}>{a.humanAuthorizationNeeded ? 'Yes' : 'No'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RequiredFieldsPanel() {
  const fields = [
    { field: 'Verdict', desc: 'Task outcome — passed, failed, blocked, needs_evidence' },
    { field: 'Commit Hash', desc: 'Git commit hash of the completed work' },
    { field: 'Pushed', desc: 'Whether the commit was pushed to remote (yes/no)' },
    { field: 'Working Tree Clean', desc: 'Whether the working tree was clean at time of receipt (yes/no)' },
    { field: 'Files Changed', desc: 'Summary of files changed, created, or deleted' },
    { field: 'Verification Summary', desc: 'Test results, typecheck, lint, build outcomes' },
    { field: 'Safety Summary', desc: 'Safety grep results, classified hits, no risky patterns' },
    { field: 'Runtime Changed', desc: 'Whether runtime/services were modified (yes/no)' },
    { field: 'Services Restarted', desc: 'Whether any services were restarted (yes/no)' },
    { field: 'DB Written', desc: 'Whether any database writes occurred (yes/no)' },
    { field: 'Gate Opened', desc: 'Whether Gate was opened (yes/no)' },
    { field: 'Stage C Enabled', desc: 'Whether Stage C was enabled (yes/no)' },
    { field: 'Release/Tag Created', desc: 'Whether a release or tag was created (yes/no)' },
    { field: 'Human Authorization Needed', desc: 'Whether human approval is required for this task type' },
    { field: 'Recommended Next Step', desc: 'What should happen next — review, archive, escalate' },
  ];
  return (
    <div style={{ ...cardStyle, borderLeft: '3px solid #3b82f6' }}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#60a5fa' }}>Required Receipt Fields</h2>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#ef4444', fontWeight: 600 }}>Every receipt must include ALL of the following fields to be considered for acceptance.</p>
      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>Missing any required field triggers needs_evidence state. No evidence = no acceptance.</p>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {fields.map(f => (
          <div key={f.field} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13 }}>
            <span style={{ ...Label, background: '#1e293b', color: '#fbbf24', border: '1px solid #fbbf24', minWidth: 150, textAlign: 'center', flexShrink: 0 }}>{f.field}</span>
            <span style={{ color: '#cbd5e1' }}>{f.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RejectionRulesPanel() {
  const rules = [
    { rule: 'Missing commit hash', result: 'needs_evidence — no traceable commit reference' },
    { rule: 'No safety summary', result: 'needs_evidence — safety cannot be verified' },
    { rule: 'No verification commands', result: 'needs_evidence — results not reproducible' },
    { rule: 'Auth/Gate/DB/Stage C touched without authorization', result: 'blocked — unauthorized changes detected' },
    { rule: '"All done" with no evidence', result: 'rejected / needs_evidence — vague statements not accepted' },
    { rule: 'Working tree dirty with no explanation', result: 'needs_evidence — uncommitted changes not allowed' },
    { rule: 'Verification commands failed', result: 'rejected — failed tests or build' },
    { rule: 'Safety findings classified as risky', result: 'blocked — unsafe pattern detected' },
  ];
  return (
    <div style={{ ...cardStyle, borderLeft: '3px solid #ef4444' }}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#ef4444' }}>Rejection Rules</h2>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: '#ef4444', fontWeight: 600 }}>No "all done" receipt without evidence.</p>
      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9ca3af' }}>These rules determine whether a receipt is accepted, needs evidence, rejected, or blocked.</p>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {rules.map(r => (
          <div key={r.rule} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13 }}>
            <span style={{ ...Label, background: '#1e293b', color: '#fca5a5', border: '1px solid #ef4444', minWidth: 280, textAlign: 'center', flexShrink: 0 }}>{r.rule}</span>
            <span style={{ color: '#cbd5e1' }}>{r.result}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SealGradeEvidencePanel() {
  const criteria = [
    'Commit hash linked to a pushed commit on the main branch',
    'Working tree clean at time of receipt',
    'All verification commands pass (tsc, tests, build, lint)',
    'Safety grep passed with no risky hits outside safety sections',
    'All required receipt fields filled with verifiable data',
    'No runtime/services/DB/Gate/Stage C/release/auth/connector changes',
    'Human authorization documented if required by task type',
  ];
  return (
    <div style={{ ...cardStyle, borderLeft: '3px solid #22c55e' }}>
      <h2 style={{ margin: 0, fontSize: 15, color: '#22c55e' }}>Seal-Grade Evidence Criteria</h2>
      <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9ca3af' }}>Seal-grade is the highest evidence level. It certifies that every required field is present and verified.</p>
      <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 13, color: '#cbd5e1', lineHeight: 1.8 }}>
        {criteria.map(c => <li key={c}>{c}</li>)}
      </ul>
    </div>
  );
}

function LinkageStrip() {
  return (
    <div style={{ ...cardStyle, borderLeft: '3px solid #93c5fd' }}>
      <h2 style={{ margin: 0, fontSize: 14, color: '#93c5fd' }}>Task + Agent + Policy Linkage</h2>
      <p style={{ margin: '4px 0 8px', fontSize: 12, color: '#9ca3af' }}>Audit Center connects to the following centers for task execution, agent assignment, and policy enforcement.</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link to="/openaip-v8-task-center-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>Task Center</Link>
        <Link to="/openaip-v8-agent-center-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>Agent Center</Link>
        <Link to="/openaip-v8-policy-capability-center-preview" style={{ fontSize: 12, color: '#93c5fd', textDecoration: 'underline', padding: '2px 6px', border: '1px solid #334155', borderRadius: 4 }}>Policy + Capability Center</Link>
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
        <li>No audit DB write</li>
        <li>No approval mutation</li>
        <li>No task acceptance mutation</li>
        <li>No Gate opening</li>
        <li>No Stage C enablement</li>
        <li>No release/tag/restore</li>
        <li>No connector action</li>
      </ul>
    </div>
  );
}

export default function OpenAIPv8AuditCenterPreview(): React.JSX.Element {
  const copy = getOpenAipv8Copy('audit');
  return (
    <div style={shellStyle}>
      <div style={panelStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26 }}>{copy.title}</h1>
            <p style={{ marginTop: 4, color: '#93c5fd', fontSize: 14 }}>{copy.subtitle}</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#9ca3af' }}>OpenAIP v8 的证据和信任层。每个有意义的任务都应通过回执可追溯。</p>
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
          <span style={{ ...badgeStyle, background: '#1e293b', color: '#ef4444', border: '1px solid #ef4444' }}>No audit DB write</span>
        </div>

        {/* Audit Summary Strip */}
        <SummaryStrip />

        {/* Audit Evidence Table */}
        <AuditTable />

        {/* Required Receipt Fields Panel */}
        <RequiredFieldsPanel />

        {/* Rejection Rules Panel */}
        <RejectionRulesPanel />

        {/* Seal-Grade Evidence Panel */}
        <SealGradeEvidencePanel />

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
