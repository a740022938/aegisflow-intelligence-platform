import React from 'react';
import { FUTURE_SCHEMA_TABLES } from './governanceDesignSpec';

export default function AuthorizationStorageSchemaDesignReview() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontWeight: 600, fontSize: 9 }}>
        No DB schema added in this task. No migration added in this task. No storage write path added in this task.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Table</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Schema Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Migration Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Path</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Read Path</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk Class</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Review</th>
            </tr>
          </thead>
          <tbody>
            {FUTURE_SCHEMA_TABLES.map(t => (
              <tr key={t.futureTable} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{t.futureTable}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{t.purpose}</td>
                <td style={{ padding: '3px 6px', color: '#EF4444' }}>{t.currentSchemaStatus}</td>
                <td style={{ padding: '3px 6px', color: '#EF4444' }}>{t.migrationStatus}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{t.writePath}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{t.readPath}</td>
                <td style={{ padding: '3px 6px', color: t.riskClass === 'critical' ? '#EF4444' : '#F97316', fontWeight: 600 }}>{t.riskClass}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{t.requiredReview}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All schemas are not added. All write paths and read paths are disabled.
      </div>
    </div>
  );
}
