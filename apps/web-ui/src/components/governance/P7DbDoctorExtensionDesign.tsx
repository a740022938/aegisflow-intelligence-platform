import React from 'react';
import { DB_DOCTOR_EXTENSION_CHECKS } from './governanceDesignSpec';

export default function P7DbDoctorExtensionDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--text-secondary)' }}>
        DB Doctor Extension Design — <strong>{DB_DOCTOR_EXTENSION_CHECKS.length}</strong> future checks. All are 'not implemented'. All checks are read-only probes. No DB write effect.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr style={{ background: 'rgba(99,102,241,0.04)' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Check</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Implementation</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>DB Read/Write Effect</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Future Package</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk If Missing</th>
            </tr>
          </thead>
          <tbody>
            {DB_DOCTOR_EXTENSION_CHECKS.map(r => (
              <tr key={r.futureCheck} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '5px 8px', fontWeight: 500, whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 9 }}>{r.futureCheck}</td>
                <td style={{ padding: '5px 8px', color: 'var(--text-secondary)' }}>{r.purpose}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#EF4444', fontWeight: 600 }}>{r.currentImplementation}</td>
                <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{r.dbReadWriteEffect}</td>
                <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{r.requiredFuturePackage}</td>
                <td style={{ padding: '5px 8px', color: '#F97316' }}>{r.riskIfMissing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(99,102,241,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All checks are 'not implemented'. All are read-only probes — no DB write effect. No schema, migration, or write path in this design review task.
      </div>
    </div>
  );
}
