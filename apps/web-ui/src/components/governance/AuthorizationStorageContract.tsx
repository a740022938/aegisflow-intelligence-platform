import React from 'react';
import { AUTHORIZATION_STORAGE_CONTRACT_ITEMS } from './governanceDesignSpec';

export default function AuthorizationStorageContract() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Authorization Storage Contract — <strong>{AUTHORIZATION_STORAGE_CONTRACT_ITEMS.length}</strong> items. All items are <strong>enforced by absence</strong>. No storage writes, no DB tables, no migration, no API endpoints.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Contract Item</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current State</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocked</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Package</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Validation</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk If Violated</th>
          </tr>
        </thead>
        <tbody>
          {AUTHORIZATION_STORAGE_CONTRACT_ITEMS.map(c => (
            <tr key={c.contractItem} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{c.contractItem}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{c.currentState}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>{c.blockedAction}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{c.futurePackage}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{c.requiredValidation}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{c.riskIfViolated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
