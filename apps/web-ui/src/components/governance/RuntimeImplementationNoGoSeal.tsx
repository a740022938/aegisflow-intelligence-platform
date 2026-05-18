import React from 'react';
import { RUNTIME_IMPLEMENTATION_NO_GO_CHECKS } from './governanceDesignSpec';

export default function RuntimeImplementationNoGoSeal() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '2px solid #DC2626', color: '#DC2626', fontWeight: 700, fontSize: 9 }}>
        Runtime Implementation No-Go Seal — <strong>{RUNTIME_IMPLEMENTATION_NO_GO_CHECKS.length}</strong> No-Go seals. All sealed No-Go. Runtime implementation is NOT permitted. Evaluator implementation = false. Permission evaluator = false. Dry-run engine = false. Allow/deny controls = 0. API endpoints = 0. Stage C activation = false.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Check</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current State</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Go Decision</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>No-Go Decision</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Sealed</th>
            </tr>
          </thead>
          <tbody>
            {RUNTIME_IMPLEMENTATION_NO_GO_CHECKS.map(r => (
              <tr key={r.check} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.check}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.purpose}</td>
                <td style={{ padding: '3px 6px', color: '#6B7280' }}>{r.currentState}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: 'var(--danger)', fontWeight: 700 }}>{r.goDecision}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: 'var(--success)', fontWeight: 700 }}>{r.noGoDecision}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#DC2626', fontWeight: 700 }}>{r.sealed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All {RUNTIME_IMPLEMENTATION_NO_GO_CHECKS.length} checks are sealed No-Go. Runtime implementation is NOT permitted.
      </div>
    </div>
  );
}
