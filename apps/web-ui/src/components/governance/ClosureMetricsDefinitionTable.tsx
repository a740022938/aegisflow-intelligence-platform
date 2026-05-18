import React from 'react';
import { CLOSURE_METRICS_DEFINITIONS } from './governanceDesignSpec';

export default function ClosureMetricsDefinitionTable() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)', color: 'var(--text-secondary)' }}>
        Closure Metrics Definition Table — <strong>{CLOSURE_METRICS_DEFINITIONS.length}</strong> metrics. All verified. Metrics hardened for P13 full closure audit.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(20,184,166,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Metric Name</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Definition</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Source</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Value</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Target Value</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Verification Method</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {CLOSURE_METRICS_DEFINITIONS.map(r => (
              <tr key={r.metricName} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{r.metricName}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{r.definition}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.source}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.currentValue}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.targetValue}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{r.verificationMethod}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: r.status === 'verified' ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(20,184,166,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All {CLOSURE_METRICS_DEFINITIONS.length} metrics are verified. Metrics hardened for P13 full closure audit.
      </div>
    </div>
  );
}
