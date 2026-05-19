import React from 'react';
import PageShell from '../components/ui/PageShell';
import {
  getOperatorChecklist,
  getOperatorChecklistByCategory,
  getOperatorChecklistSummary,
  type OperatorChecklistCategory,
} from '../registry/operator-checklist-registry';
import {
  getOperatorEvidenceLinkage,
  getOperatorEvidenceByType,
  getOperatorEvidenceSourceOfTruth,
  getOperatorEvidenceLinkageSummary,
} from '../registry/operator-evidence-linkage-registry';
import {
  validateOperatorChecklistEvidence,
} from '../registry/operator-checklist-evidence-validator';

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

const rowStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--border-color, #2a2a4a)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: 13,
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

const OperatorChecklistEvidencePreview: React.FC = () => {
  const checklist = getOperatorChecklist();
  const evidence = getOperatorEvidenceLinkage();
  const checkSummary = getOperatorChecklistSummary();
  const evSummary = getOperatorEvidenceLinkageSummary();
  const validation = validateOperatorChecklistEvidence();

  const categories = [...new Set(checklist.map(i => i.category))].sort() as OperatorChecklistCategory[];
  const sourceOfTruth = getOperatorEvidenceSourceOfTruth();

  const statusColor = (status: string) => {
    switch (status) {
      case 'pass': return '#66bb6a';
      case 'ready': return '#42a5f5';
      case 'deferred': return '#ffa726';
      case 'blocked': return '#ef5350';
      default: return '#757575';
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'report': return '#42a5f5';
      case 'receipt': return '#66bb6a';
      case 'json': return '#ffa726';
      case 'doc': return '#ab47bc';
      case 'roadmap': return '#26c6da';
      case 'rollback': return '#ef5350';
      case 'smoke': return '#ff7043';
      case 'validation': return '#78909c';
      default: return '#757575';
    }
  };

  return (
    <PageShell
      title="Operator Checklist + Evidence Linkage Preview"
      subtitle="v7.33.0-P3 · Readonly checklist and evidence linkage preview · No actions, no execution, no Stage C"
      safetyBoundary="readonly"
      safetyText="只读 checklist + evidence 预览 · 不执行动作 · 不写 evidence store · 不启用 Stage C · 不入 sidebar"
    >
      {/* 1. Seal Chain */}
      <div style={{ ...sectionStyle, border: '1px solid #66bb6a' }}>
        <div style={{ ...headerStyle, color: '#66bb6a' }}>1. Seal Chain</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.32 P2</div>
            <div style={{ ...valueStyle, fontSize: 12 }}>V7_32_PRODUCTIZATION_SEAL_READY</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.33 D1</div>
            <div style={{ ...valueStyle, fontSize: 12 }}>V7_33_D1_OPERATOR_CONSOLE_BLUEPRINT_READY</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.33 P1</div>
            <div style={{ ...valueStyle, fontSize: 12 }}>V7_33_P1_OPERATOR_CONSOLE_REGISTRY_PREVIEW_READY</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>v7.33 P2</div>
            <div style={{ ...valueStyle, fontSize: 12 }}>V7_33_P2_OPERATOR_CONSOLE_READONLY_UI_PREVIEW_READY</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Current Phase</div>
            <div style={{ ...valueStyle, fontSize: 12, color: '#42a5f5' }}>v7.33.0-P3 Checklist + Evidence Preview</div>
          </div>
        </div>
      </div>

      {/* 2. Checklist Summary */}
      <div style={sectionStyle}>
        <div style={headerStyle}>2. Checklist Summary</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Total Items</div>
            <div style={valueStyle}>{checkSummary.total}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Required Items</div>
            <div style={valueStyle}>{checkSummary.requiredCount}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Required Pass</div>
            <div style={{ ...valueStyle, color: '#66bb6a' }}>{checkSummary.requiredPass}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Required Ready</div>
            <div style={{ ...valueStyle, color: '#42a5f5' }}>{checkSummary.requiredReady}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Required Deferred</div>
            <div style={{ ...valueStyle, color: '#ffa726' }}>{checkSummary.requiredDeferred}</div>
          </div>
        </div>
        <div style={gridStyle}>
          {categories.map(cat => (
            <div key={cat} style={{ ...cardStyle, padding: '6px 12px' }}>
              <div style={labelStyle}>{cat}</div>
              <div style={valueStyle}>{getOperatorChecklistByCategory(cat).length}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Required Checklist Matrix */}
      <div style={{ ...sectionStyle, border: '1px solid #42a5f5' }}>
        <div style={{ ...headerStyle, color: '#42a5f5' }}>3. Required Checklist Matrix</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginBottom: 12 }}>
          {checklist.filter(i => i.required).length} required items — all must pass before phase seal
        </div>
        {checklist.filter(i => i.required).map(item => (
          <div key={item.id} style={rowStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</span>
              <span style={badgeStyle(statusColor(item.status))}>{item.status}</span>
              <span style={{ ...badgeStyle('#546e7a'), fontSize: 10 }}>{item.category}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary, #8892b0)', maxWidth: 350 }}>
              {item.evidenceRef.substring(0, 60)}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Evidence Linkage Panel */}
      <div style={sectionStyle}>
        <div style={headerStyle}>4. Evidence Linkage Panel</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Total Evidence Links</div>
            <div style={valueStyle}>{evSummary.total}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Reports</div>
            <div style={valueStyle}>{evSummary.reportsCount}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Receipts</div>
            <div style={valueStyle}>{evSummary.receiptsCount}</div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Source of Truth</div>
            <div style={valueStyle}>{evSummary.sourceOfTruthCount}</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginBottom: 8 }}>
          Evidence paths are displayed for reference. No evidence is read or written from this panel.
        </div>
        {evidence.slice(0, 10).map(item => (
          <div key={item.id} style={rowStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 12 }}>{item.title}</span>
              <span style={badgeStyle(typeColor(item.evidenceType))}>{item.evidenceType}</span>
              {item.sourceOfTruth && <span style={{ ...badgeStyle('#2e7d32'), fontSize: 10 }}>source of truth</span>}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary, #8892b0)', maxWidth: 300 }}>
              {item.path.substring(0, 50)}...
            </div>
          </div>
        ))}
        {evidence.length > 10 && (
          <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginTop: 8 }}>
            ... and {evidence.length - 10} more items
          </div>
        )}
      </div>

      {/* 5. Source-of-Truth Evidence */}
      <div style={{ ...sectionStyle, border: '1px solid #2e7d32' }}>
        <div style={{ ...headerStyle, color: '#66bb6a' }}>5. Source-of-Truth Evidence</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginBottom: 12 }}>
          {sourceOfTruth.length} source-of-truth evidence items — authoritative records for phase seals
        </div>
        {sourceOfTruth.map(item => (
          <div key={item.id} style={rowStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</span>
              <span style={badgeStyle(typeColor(item.evidenceType))}>{item.evidenceType}</span>
              <span style={{ ...badgeStyle('#37474f'), fontSize: 10 }}>{item.version}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary, #8892b0)', maxWidth: 350 }}>
              {item.summary.substring(0, 60)}
            </div>
          </div>
        ))}
      </div>

      {/* 6. Safety Boundary Confirmation */}
      <div style={{ ...sectionStyle, border: '2px solid #880e4f' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>6. Safety Boundary Confirmation</div>
        <div style={gridStyle}>
          {[
            { label: 'Stage C', status: 'disabled', color: '#ef5350' },
            { label: 'POST Runtime', status: 'blocked', color: '#ef5350' },
            { label: 'DB Write', status: 'not occurred', color: '#ef5350' },
            { label: 'External Control', status: 'not occurred', color: '#ef5350' },
            { label: 'Executor', status: 'absent', color: '#ef5350' },
          ].map((b, i) => (
            <div key={`p3-sb-${i}`} style={cardStyle}>
              <div style={labelStyle}>{b.label}</div>
              <div style={{ ...badgeStyle(b.color), marginTop: 4 }}>{b.status}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#ef9a9a', lineHeight: 1.6 }}>
          All safety boundaries confirmed in checklist. No bypass mechanism exists.
          No evidence write, no audit write, no rollback execution, no restart action.
        </div>
      </div>

      {/* 7. Forbidden Actions */}
      <div style={{ ...sectionStyle, border: '2px solid #ef5350' }}>
        <div style={{ ...headerStyle, color: '#ef5350' }}>7. Forbidden Actions</div>
        <ul style={{ fontSize: 12, lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
          <li>Checklist is read-only — no action buttons, no auto-execution, no fix buttons</li>
          <li>Evidence linkage is read-only — no evidence capture, upload, or write</li>
          <li>Stage C is permanently disabled — confirmed in checklist item</li>
          <li>POST runtime endpoints are permanently blocked — confirmed in checklist item</li>
          <li>DB write is permanently blocked — confirmed in checklist item</li>
          <li>External control is permanently blocked — confirmed in checklist item</li>
          <li>Runtime executor is absent — confirmed in checklist item</li>
          <li>No evidence store write, no audit store write, no approval mutation</li>
          <li>No rollback execution, no file modification, no git mutation</li>
          <li>The P3 preview is NOT in any sidebar — hidden direct route only</li>
        </ul>
      </div>

      {/* 8. Validator Summary */}
      <div style={sectionStyle}>
        <div style={headerStyle}>8. Validator Summary</div>
        <div style={gridStyle}>
          <div style={cardStyle}>
            <div style={labelStyle}>Pass</div>
            <div style={{ ...valueStyle, color: validation.pass ? '#66bb6a' : '#ef5350' }}>
              {validation.pass ? 'YES' : 'NO'}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Blocking</div>
            <div style={{ ...valueStyle, color: validation.blocking > 0 ? '#ef5350' : '#66bb6a' }}>
              {validation.blocking}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Warning</div>
            <div style={{ ...valueStyle, color: validation.warning > 0 ? '#ffa726' : '#66bb6a' }}>
              {validation.warning}
            </div>
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Info</div>
            <div style={valueStyle}>{validation.info}</div>
          </div>
        </div>
        {validation.checks.filter(c => !c.pass).map((c, i) => (
          <div key={`vc-${i}`} style={{ fontSize: 12, color: c.level === 'blocking' ? '#ef5350' : '#ffa726', marginTop: 4 }}>
            {c.level === 'blocking' ? '⛔ ' : '⚠ '}{c.message}
          </div>
        ))}
        {validation.pass && (
          <div style={{ fontSize: 12, color: '#66bb6a', marginTop: 8 }}>
            All validations pass. Registry is sealed.
          </div>
        )}
      </div>

      {/* 9. Evidence Type Distribution */}
      <div style={sectionStyle}>
        <div style={headerStyle}>9. Evidence Type Distribution</div>
        <div style={gridStyle}>
          {(Object.entries(evSummary.byType) as [string, number][]).map(([type, count]) => (
            <div key={type} style={cardStyle}>
              <div style={labelStyle}>{type}</div>
              <div style={{ ...valueStyle, color: typeColor(type) }}>{count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 10. Operator Next Step */}
      <div style={{ ...sectionStyle, border: '1px solid #42a5f5' }}>
        <div style={{ ...headerStyle, color: '#42a5f5' }}>10. Operator Next Step</div>
        <div style={{ fontSize: 13, lineHeight: 2 }}>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Review checklist summary — confirm all required items pass</li>
            <li>Review required checklist matrix — acknowledge each required item status</li>
            <li>Browse evidence linkage panel — confirm all evidence paths are accessible</li>
            <li>Verify source-of-truth evidence covers all sealed phases</li>
            <li>Confirm safety boundaries are all disabled/blocked/absent</li>
            <li>Review validator summary — confirm blocking=0, pass=true</li>
            <li>Do not enter Stage C — no enablement button exists on any Operator Console page</li>
          </ol>
        </div>
        <div style={{ marginTop: 12, padding: 12, background: '#1a1a2e', borderRadius: 4, border: '1px solid #2a2a4a' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#ffa726' }}>Next Phase Recommendation</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary, #8892b0)', marginTop: 4 }}>
            v7.33.0-P4: Operator Console Seal Candidate
          </div>
          <div style={{ fontSize: 12, color: '#ef5350', marginTop: 4, fontWeight: 600 }}>
            Do not enter Stage C.
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default OperatorChecklistEvidencePreview;
