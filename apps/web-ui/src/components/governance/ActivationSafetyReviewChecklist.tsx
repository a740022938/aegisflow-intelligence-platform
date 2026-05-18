import React from 'react';
import { ACTIVATION_SAFETY_CHECKLIST_ITEMS } from './governanceDesignSpec';

export default function ActivationSafetyReviewChecklist() {
  return (
    <div style={{ fontSize: 10 }}>
      <div style={{ marginBottom: 8, padding: '6px 10px', borderRadius: 4, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--text-secondary)' }}>
        Activation Safety Review Checklist — <strong>{ACTIVATION_SAFETY_CHECKLIST_ITEMS.length}</strong> items. Baseline items are verified but <strong>not activation ready</strong>. All future items are <strong>not completed</strong>. No activation decision has been made.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
        <thead>
          <tr style={{ background: 'rgba(239,68,68,0.04)' }}>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Check Item</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Current Status</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Required Before Activation</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Evidence</th>
            <th style={{ padding: '5px 7px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Risk If Skipped</th>
          </tr>
        </thead>
        <tbody>
          {ACTIVATION_SAFETY_CHECKLIST_ITEMS.map(c => (
            <tr key={c.checkItem} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '4px 7px', fontWeight: 500 }}>{c.checkItem}</td>
              <td style={{ padding: '4px 7px', color: c.currentStatus.startsWith('baseline') ? '#8B5CF6' : '#F97316' }}>{c.currentStatus}</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-secondary)' }}>{c.requiredBeforeActivation}</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-muted)' }}>{c.evidence}</td>
              <td style={{ padding: '4px 7px', color: 'var(--text-muted)' }}>{c.riskIfSkipped}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
