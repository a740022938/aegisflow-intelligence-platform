import React from 'react';
import { OPERATOR_ROLES, APPROVAL_SCOPE_ENTRIES } from './governanceDesignSpec';

const ROLES = ['viewer', 'reviewer', 'approver', 'operator', 'emergencyOp', 'auditor', 'admin', 'system'];
const ROLE_COLORS: Record<string, string> = {
  viewer: '#6B7280', reviewer: '#8B5CF6', approver: '#F97316', operator: '#3B82F6',
  emergencyOp: '#EF4444', auditor: '#22C55E', admin: '#7C3AED', system: '#6B7280',
};

export default function OperatorRoleScopeMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Operator Role & Scope Matrix — <strong>{OPERATOR_ROLES.length}</strong> roles. All are <strong>design-only</strong>. No runtime permissions, no write permissions, no control permissions. All scope is design/review only.
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, marginBottom: 12 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Role</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Control</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Scope</th>
          </tr>
        </thead>
        <tbody>
          {OPERATOR_ROLES.map(r => (
            <tr key={r.role} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{r.role}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-secondary)' }}>{r.futurePurpose}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: '#8B5CF6' }}>design-only</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>0</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>0</td>
              <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--success)', fontWeight: 600 }}>0</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{r.scope}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Scope</th>
            {ROLES.map(r => (
              <th key={r} style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600, color: ROLE_COLORS[r], fontSize: 8 }}>{r}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {APPROVAL_SCOPE_ENTRIES.map(s => (
            <tr key={s.scope} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '3px 6px', fontWeight: 500 }}>{s.scope}</td>
              {ROLES.map(r => (
                <td key={r} style={{ padding: '3px 6px', textAlign: 'center', color: (s as any)[r] === '✅' ? 'var(--success)' : '#6B7280' }}>{(s as any)[r]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All roles are design-only. No runtime permissions, write permissions, or control permissions assigned. Scope matrix is planning reference only.
      </div>
    </div>
  );
}
