import React from 'react';
import { AUTHORIZATION_REVIEW_POLICY_FIELDS } from './governanceDesignSpec';

export default function AuthorizationReviewPolicyDesign() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', color: 'var(--text-secondary)' }}>
        Authorization Review Policy Design — <strong>{AUTHORIZATION_REVIEW_POLICY_FIELDS.length}</strong> fields. All fields are <strong>design-only</strong>. No runtime review workflow, no approve/reject/allow/deny/override actions. Stage C deferred.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Field</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Workflow</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Persistence</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>DB</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>API</th>
              <th style={{ padding: '4px 6px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Gate</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Blocked</th>
            </tr>
          </thead>
          <tbody>
            {AUTHORIZATION_REVIEW_POLICY_FIELDS.map(f => (
              <tr key={f.fieldName} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 8 }}>{f.fieldName}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{f.purpose}</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#8B5CF6' }}>design-only</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#6B7280' }}>none</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#6B7280' }}>not implemented</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#6B7280' }}>disabled</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#6B7280' }}>not implemented</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#6B7280' }}>not implemented</td>
                <td style={{ padding: '3px 6px', textAlign: 'center', color: '#F97316' }}>Stage C deferred</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{f.blockedActions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(139,92,246,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Authorization Review Policy is design-only. No runtime review workflow exists. No approve, reject, allow, deny, override, execute, write, or persistence action is available. Stage C remains disabled.
      </div>
    </div>
  );
}
