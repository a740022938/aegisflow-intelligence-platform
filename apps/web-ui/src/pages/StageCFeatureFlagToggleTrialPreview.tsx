import { useState, useEffect } from 'react';
import { validateToggleTrial, ToggleTrialValidationResult } from '../registry/stage-c-feature-flag-toggle-trial-validator';

export default function StageCFeatureFlagToggleTrialPreview() {
  const [result, setResult] = useState<ToggleTrialValidationResult | null>(null);

  useEffect(() => {
    setResult(validateToggleTrial());
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '950px', margin: '0 auto' }}>
      <h1>Stage C Feature Flag Toggle Trial Preview</h1>
      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        padding: '1.5rem',
        margin: '1.5rem 0',
      }}>
        <h2 style={{ margin: 0, color: '#856404' }}>⚠ Toggle Trial Not Executed</h2>
        <p style={{ margin: '0.5rem 0 0', color: '#856404' }}>
          Toggle trial is not executed in this task. Feature flag remains off. Stage C remains disabled.
          Human approval is required before any future toggle trial.
        </p>
      </div>

      <div style={{
        background: '#e3f2fd',
        border: '1px solid #90caf9',
        borderRadius: '8px',
        padding: '1.5rem',
        margin: '1.5rem 0',
      }}>
        <h3 style={{ margin: 0 }}>Current State</h3>
        <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <tbody>
            <tr><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}><strong>Feature Flag</strong></td><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>stage_c_enablement</td></tr>
            <tr><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}><strong>Current State</strong></td><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>off</td></tr>
            <tr><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}><strong>Stage C</strong></td><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>DISABLED</td></tr>
            <tr><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}><strong>Toggle Executed</strong></td><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>No — trial plan only</td></tr>
            <tr><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}><strong>Human Approval</strong></td><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>Required before toggle</td></tr>
          </tbody>
        </table>
      </div>

      <div style={{ margin: '1.5rem 0' }}>
        <h3>Trial Boundary</h3>
        <ul>
          <li>Canary / local-only trial</li>
          <li>Auto rollback on failure condition</li>
          <li>Failure stop condition defined</li>
          <li>Reporting required after trial</li>
        </ul>
      </div>

      <div style={{ margin: '1.5rem 0' }}>
        <h3>Rollback Requirements</h3>
        <ul>
          <li>Rollback plan approved before toggle</li>
          <li>Kill switch tested and ready</li>
          <li>Auto rollback on unexpected behavior</li>
        </ul>
      </div>

      <div style={{ margin: '1.5rem 0' }}>
        <h3>Smoke Requirements</h3>
        <ul>
          <li>GET /api/stage-c/status must pass (200)</li>
          <li>POST /api/stage-c/status must be blocked</li>
          <li>Feature flag state verified</li>
          <li>Stage C remains disabled</li>
        </ul>
      </div>

      <div style={{
        background: '#fce4ec',
        border: '1px solid #ef9a9a',
        borderRadius: '8px',
        padding: '1.5rem',
        margin: '1.5rem 0',
      }}>
        <h3 style={{ margin: 0, color: '#c62828' }}>Forbidden Actions</h3>
        <ul style={{ marginBottom: 0 }}>
          <li>POST runtime execution</li>
          <li>DB write</li>
          <li>Executor</li>
          <li>External control</li>
          <li>Connector action</li>
          <li>Sidebar exposure</li>
          <li>Tag/Release</li>
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
        <p>After trial plan is approved, next step is <strong>v7.40-P3 Human-Approved Local Feature Flag Toggle Dry Trial</strong> (requires new human authorization).</p>
      </div>
    </div>
  );
}
