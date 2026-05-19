import { useState, useEffect } from 'react';
import { validateFeatureFlagControl, FeatureFlagControlValidationResult } from '../registry/stage-c-feature-flag-control-validator';

export default function StageCFeatureFlagControlPreview() {
  const [result, setResult] = useState<FeatureFlagControlValidationResult | null>(null);

  useEffect(() => {
    setResult(validateFeatureFlagControl());
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Stage C Feature Flag Control Console Preview</h1>
      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        padding: '1.5rem',
        margin: '1.5rem 0',
      }}>
        <h2 style={{ margin: 0, color: '#856404' }}>⚠ Disabled Control Preview</h2>
        <p style={{ margin: '0.5rem 0 0', color: '#856404' }}>
          This is a disabled control preview. Feature flag remains off. No toggle action is available. Stage C remains disabled.
        </p>
      </div>

      <div style={{
        background: '#e3f2fd',
        border: '1px solid #90caf9',
        borderRadius: '8px',
        padding: '1.5rem',
        margin: '1.5rem 0',
      }}>
        <h3 style={{ margin: 0 }}>Current Feature Flag Status</h3>
        <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <tbody>
            <tr><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}><strong>Feature Flag</strong></td><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>stage_c_enablement</td></tr>
            <tr><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}><strong>Current State</strong></td><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>off</td></tr>
            <tr><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}><strong>Mutable from UI</strong></td><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>false</td></tr>
            <tr><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}><strong>Stage C</strong></td><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>DISABLED</td></tr>
            <tr><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}><strong>Toggle Available</strong></td><td style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>No — control preview only</td></tr>
          </tbody>
        </table>
      </div>

      <div style={{ margin: '1.5rem 0' }}>
        <h3>Control Requirements</h3>
        <ul>
          <li>Human authorization required before toggle</li>
          <li>Rollback plan must be approved</li>
          <li>Kill switch must be tested</li>
          <li>Smoke must pass before and after</li>
          <li>Operator policy must be defined</li>
          <li>Toggle does NOT enable executor, POST, DB write, external control, or connector action</li>
        </ul>
      </div>

      {result && (
        <div style={{ margin: '1.5rem 0' }}>
          <h3>Validator Summary</h3>
          <p><strong>All Passed:</strong> {result.allPassed ? '✅ Yes' : '❌ No'}</p>
          <p><strong>Readonly:</strong> {result.readonly ? '✅' : '❌'}</p>
          <p><strong>Toggle Enabled:</strong> {result.toggleEnabled ? '❌ Should be false' : '✅ Correctly disabled'}</p>
          <p><strong>Action Allowed:</strong> {result.actionAllowed ? '❌ Should be false' : '✅ Correctly disabled'}</p>
          <p><strong>Mutation Allowed:</strong> {result.mutationAllowed ? '❌ Should be false' : '✅ Correctly disabled'}</p>
          <p><strong>Can Enable Stage C:</strong> {result.canEnableStageC ? '❌ Should be false' : '✅ Correctly disabled'}</p>
          <p><strong>No DB Write:</strong> {result.noDbWrite ? '✅' : '❌'}</p>
          <p><strong>No External Control:</strong> {result.noExternalControl ? '✅' : '❌'}</p>
          <p><strong>No Executor:</strong> {result.noExecutor ? '✅' : '❌'}</p>
          <p><strong>No Connector Action:</strong> {result.noConnectorAction ? '✅' : '❌'}</p>
          <p><strong>No Sidebar Exposure:</strong> {result.noSidebarExposure ? '✅' : '❌'}</p>
          {result.failures.length > 0 && (
            <div style={{ color: 'red', marginTop: '0.5rem' }}>
              <h4>Failures:</h4>
              <ul>
                {result.failures.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
