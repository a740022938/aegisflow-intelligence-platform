import React from 'react';
import { RUNTIME_PERMISSION_ENTRIES } from './governanceDesignSpec';

const C: Record<string, string> = {
  'false': 'var(--success)',
};

export default function RuntimePermissionModel() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Runtime Permission Model — <strong>{RUNTIME_PERMISSION_ENTRIES.length}</strong> permissions. All values are <strong>false</strong>. All permissions require Stage C + corresponding Runtime. <strong>No runtime permissions are enabled.</strong>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Permission</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Value</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Gate</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocked Action</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk If Enabled Prematurely</th>
          </tr>
        </thead>
        <tbody>
          {RUNTIME_PERMISSION_ENTRIES.map(p => (
            <tr key={p.permission} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500, fontFamily: 'monospace' }}>{p.permission}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-secondary)' }}>{p.futurePurpose}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>{p.currentValue}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#6B7280' }}>false</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#F97316' }}>{p.requiredGate}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{p.blockedAction}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{p.riskIfEnabledPrematurely}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
