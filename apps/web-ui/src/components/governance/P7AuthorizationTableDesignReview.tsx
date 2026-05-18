import React from 'react';
import { AUTHORIZATION_TABLE_DESIGN_ROWS } from './governanceDesignSpec';

export default function P7AuthorizationTableDesignReview() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--text-secondary)' }}>
        Authorization Table Design Review — <strong>{AUTHORIZATION_TABLE_DESIGN_ROWS.length}</strong> future tables. All schemas are not added. All write/read paths are disabled. Risk classes: critical/high/medium.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Table</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Schema Status</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Migration Status</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Path</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Read Path</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Index Strategy</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Retention Class</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk Class</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Validation</th>
            </tr>
          </thead>
          <tbody>
            {AUTHORIZATION_TABLE_DESIGN_ROWS.map(r => (
              <tr key={r.futureTable} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '5px 8px', fontWeight: 500, whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 9 }}>{r.futureTable}</td>
                <td style={{ padding: '5px 8px', color: 'var(--text-secondary)' }}>{r.purpose}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#EF4444' }}>{r.currentSchemaStatus}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.migrationStatus}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#F97316' }}>{r.writePath}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#F97316' }}>{r.readPath}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--text-muted)' }}>{r.indexStrategy}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--text-muted)' }}>{r.retentionClass}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', fontWeight: 600, color: r.riskClass === 'critical' ? '#EF4444' : r.riskClass === 'high' ? '#F97316' : 'var(--text-muted)' }}>{r.riskClass}</td>
                <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{r.requiredValidation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All schemas are not added. All write/read paths are disabled. Risk classes: critical/high/medium. No DB schema, migration, or write path in this task.
      </div>
    </div>
  );
}
