import React from 'react';
import { COVERAGE_AUDIT_MATRIX } from './governanceDesignSpec';

const C: Record<string, string> = {
  yes: 'var(--success)', partial: '#F97316', no: 'var(--danger)',
  'complete-design': '#8B5CF6',
};

function Badge({ label, color }: { label: string; color?: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 10,
      fontWeight: 600, color: '#fff', background: color || '#6B7280',
      lineHeight: '16px', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

export default function GateCoverageAuditMatrix() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', fontSize: 10, color: 'var(--text-secondary)' }}>
        P1–P8 Design Spec Coverage Audit — all packages have <strong>complete-design</strong> coverage. Runtime control remains <strong>no</strong> for all packages. No package has runtime implementation.
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: 'rgba(139,92,246,0.04)' }}>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Package</th>
            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Scope</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Design Spec</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Data Model</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Boundary</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Evidence</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Rollback</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Runtime Ctrl</th>
            <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {COVERAGE_AUDIT_MATRIX.map(p => (
            <tr key={p.pack} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '5px 8px', fontWeight: 500 }}>{p.pack}</td>
              <td style={{ padding: '5px 8px', color: 'var(--text-muted)' }}>{p.scope}</td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={p.designSpec} color={C[p.designSpec] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={p.dataModel} color={C[p.dataModel] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={p.boundary} color={C[p.boundary] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={p.evidence} color={C[p.evidence] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={p.rollback} color={C[p.rollback] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={p.runtimeControl} color={C[p.runtimeControl] || '#6B7280'} /></td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}><Badge label={p.status} color={C[p.status] || '#6B7280'} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
