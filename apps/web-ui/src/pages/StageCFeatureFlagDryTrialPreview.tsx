import { useState, useEffect } from 'react';
import { validateDryTrial, DryTrialValidationResult } from '../registry/stage-c-feature-flag-dry-trial-validator';

export default function StageCFeatureFlagDryTrialPreview() {
  const [result, setResult] = useState<DryTrialValidationResult | null>(null);

  useEffect(() => {
    setResult(validateDryTrial());
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '950px', margin: '0 auto' }}>
      <h1>Stage C Feature Flag Dry Trial Preview</h1>
      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        padding: '1.5rem',
        margin: '1.5rem 0',
      }}>
        <h2 style={{ margin: 0, color: '#856404' }}>⚠ Dry Trial — Stage C Remains Disabled</h2>
        <p style={{ margin: '0.5rem 0 0', color: '#856404' }}>
          Dry trial completed does not mean Stage C enabled. Feature flag official state remains off. Stage C remains disabled.
        </p>
      </div>

      <div style={{
        background: '#e8f5e9',
        border: '1px solid #a5d6a7',
        borderRadius: '8px',
        padding: '1.5rem',
        margin: '1.5rem 0',
      }}>
        <h3 style={{ margin: 0 }}>Human Approval Captured</h3>
        <p style={{ margin: '0.5rem 0 0' }}>
          Human owner explicitly authorized the local dry trial. Authorization text documented in AIP report.
        </p>
      </div>

      <div style={{ margin: '1.5rem 0' }}>
        <h3>Dry Trial Boundary</h3>
        <ul>
          <li>Dry trial is local-only — no production impact</li>
          <li>Dry trial does NOT change feature flag state</li>
          <li>Dry trial does NOT enable Stage C</li>
          <li>Dry trial does NOT allow POST, DB write, executor, external control, or connector action</li>
          <li>Rollback plan, smoke plan, and failure stop policy are in place</li>
        </ul>
      </div>

      <div style={{ margin: '1.5rem 0' }}>
        <h3>Feature Flag State</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}><strong>Flag Name</strong></td><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>stage_c_enablement</td></tr>
            <tr><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}><strong>Official State</strong></td><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>off</td></tr>
            <tr><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}><strong>Trial State</strong></td><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>trial_requested → trial_reviewed → trial_completed</td></tr>
            <tr><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}><strong>Stage C</strong></td><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>DISABLED (unchanged)</td></tr>
          </tbody>
        </table>
      </div>

      <div style={{
        background: '#fce4ec',
        border: '1px solid #ef9a9a',
        borderRadius: '8px',
        padding: '1.5rem',
        margin: '1.5rem 0',
      }}>
        <h3 style={{ margin: 0, color: '#c62828' }}>Forbidden Actions (Even During Dry Trial)</h3>
        <ul style={{ marginBottom: 0 }}>
          <li>Enable Stage C</li>
          <li>Toggle feature flag to on</li>
          <li>POST runtime execution</li>
          <li>DB write</li>
          <li>Executor</li>
          <li>External control</li>
          <li>Connector action</li>
          <li>Rollback execution</li>
          <li>Tag/Release</li>
          <li>Add to sidebar</li>
        </ul>
      </div>

      {result && (
        <div style={{ margin: '1.5rem 0' }}>
          <h3>Validator Summary</h3>
          <p><strong>Pass:</strong> {result.pass ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Blocking:</strong> {result.blocking} | <strong>Warnings:</strong> {result.warning}</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '0.5rem', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Check</th>
                <th style={{ padding: '0.5rem', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '0.5rem', borderBottom: '2px solid #ddd', textAlign: 'left' }}>Detail</th>
              </tr>
            </thead>
            <tbody>
              {result.checks.map((c, i) => (
                <tr key={i}>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{c.name}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{c.status === 'pass' ? '✅' : c.status === 'warning' ? '⚠️' : '❌'}</td>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>{c.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ margin: '1.5rem 0' }}>
        <h3>Next Gate</h3>
        <p>After dry trial completion: <strong>v7.40 Final Seal Recheck</strong>. Any feature flag toggle beyond dry trial requires new human authorization.</p>
      </div>
    </div>
  );
}
