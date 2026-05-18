import React from 'react';
import { IMPLEMENTATION_PACKAGE_BOUNDARY_ITEMS } from './governanceDesignSpec';

export default function RuntimeImplementationPackageBoundary() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--text-secondary)' }}>
        Implementation Package Boundary — <strong>design-review-only</strong>. No runtime implementation.
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 8 }}>
          <thead>
            <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Package Name</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Future Purpose</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Status</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Mode</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>DB Schema Impact</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>API Endpoint Impact</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Impact</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Write Impact</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Dependency</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Go/No-Go</th>
              <th style={{ padding: '4px 6px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Validation</th>
            </tr>
          </thead>
          <tbody>
            {IMPLEMENTATION_PACKAGE_BOUNDARY_ITEMS.map(p => (
              <tr key={p.packageName} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '3px 6px', fontWeight: 500, whiteSpace: 'nowrap' }}>{p.packageName}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{p.futurePurpose}</td>
                <td style={{ padding: '3px 6px', color: '#EF4444' }}>{p.currentStatus}</td>
                <td style={{ padding: '3px 6px', color: '#F97316' }}>{p.currentMode}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{p.dbSchemaImpact}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{p.apiEndpointImpact}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{p.runtimeImpact}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{p.writeImpact}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-muted)' }}>{p.dependency}</td>
                <td style={{ padding: '3px 6px', color: '#EF4444', fontWeight: 600 }}>{p.goNoGoStatus}</td>
                <td style={{ padding: '3px 6px', color: 'var(--text-secondary)' }}>{p.requiredValidation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 6, padding: '4px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.03)', fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        All packages are No-Go. No implementation action has been executed.
      </div>
    </div>
  );
}
