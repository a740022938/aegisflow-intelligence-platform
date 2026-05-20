import React, { useMemo } from 'react';
import PageShell from '../components/ui/PageShell';
import SectionCard from '../components/ui/SectionCard';
import {
  getMemoryKnowledgeRegistry,
  getMemoryKnowledgeSummary,
} from '../registry/aip-memory-knowledge-registry';
import {
  validateMemoryKnowledgeRegistry,
  getMemoryKnowledgeValidationSummary,
} from '../registry/aip-memory-knowledge-validator';

const CONFIDENCE_COLORS: Record<string, string> = {
  verified: '#22C55E',
  historical: '#F59E0B',
  unverified: '#6B7280',
};

const AipMemoryKnowledgePreview: React.FC = () => {
  const entries = useMemo(() => getMemoryKnowledgeRegistry(), []);
  const summary = useMemo(() => getMemoryKnowledgeSummary(), []);
  const validationResult = useMemo(() => validateMemoryKnowledgeRegistry(), []);
  const validationSummary = useMemo(() => getMemoryKnowledgeValidationSummary(), []);

  return (
    <PageShell
      title="AIP Memory Knowledge Baseline"
      subtitle="Readonly project memory registry — v7.41 baseline facts"
      safetyBoundary="readonly"
      safetyText="Readonly preview · No DB write · No runtime mutation · No POST"
    >
      <SectionCard title="Summary">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { label: 'Total Entries', value: String(summary.total), color: '#3B82F6' },
            { label: 'Verified', value: String(summary.verified), color: '#22C55E' },
            { label: 'Historical', value: String(summary.historical), color: '#F59E0B' },
            { label: 'Unverified', value: String(summary.unverified), color: '#6B7280' },
          ].map(kpi => (
            <div key={kpi.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>{kpi.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Memory Registry">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: 'var(--text-muted)' }}>Key</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: 'var(--text-muted)' }}>Value</th>
                <th style={{ textAlign: 'center', padding: '6px 8px', fontWeight: 600, color: 'var(--text-muted)' }}>Confidence</th>
                <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, color: 'var(--text-muted)' }}>Source</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.key} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontWeight: 600 }}>{entry.key}</td>
                  <td style={{ padding: '6px 8px', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.value}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600, color: '#fff', background: CONFIDENCE_COLORS[entry.confidence] || '#6B7280' }}>
                      {entry.confidence}
                    </span>
                  </td>
                  <td style={{ padding: '6px 8px', color: 'var(--text-muted)', fontSize: 11 }}>{entry.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Validation">
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: validationSummary.pass ? '#22C55E' : '#DC2626', fontWeight: 600 }}>
            {validationSummary.pass ? 'PASS' : 'FAIL'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Blocking: {validationSummary.blocking} | Warning: {validationSummary.warning} | Info: {validationSummary.info}
          </div>
        </div>
        {validationResult.blocking.length > 0 && (
          <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 6, padding: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>Blocking Issues</div>
            {validationResult.blocking.map((msg, i) => <div key={i} style={{ fontSize: 10, color: '#DC2626', padding: '2px 0' }}>{msg}</div>)}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Memory Normalization Rule">
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, padding: 8, background: 'rgba(34,197,94,0.06)', borderRadius: 6, border: '1px solid rgba(34,197,94,0.15)' }}>
          Desktop task packs are intent/input evidence only.<br />
          They must be cross-checked against report + receipt + commit before being treated as completed work.
        </div>
      </SectionCard>
    </PageShell>
  );
};

export default AipMemoryKnowledgePreview;
