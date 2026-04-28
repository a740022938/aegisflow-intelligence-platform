import React from 'react';

export interface StepInfo {
  id: string;
  step_name: string;
  status: string;
  started_at?: string;
  finished_at?: string;
  error_message?: string;
}

export interface StepStatusIndicatorProps {
  steps: StepInfo[];
  activeStepId?: string;
  onStepClick?: (stepId: string) => void;
}

const STEP_COLORS: Record<string, string> = {
  pending: '#6B7280',
  running: '#3B82F6',
  succeeded: '#10B981',
  completed: '#10B981',
  success: '#10B981',
  failed: '#EF4444',
  cancelled: '#F59E0B',
  blocked: '#8B5CF6',
  skipped: '#EAB308',
};

const StepStatusIndicator: React.FC<StepStatusIndicatorProps> = ({ steps, activeStepId, onStepClick }) => {
  if (!steps || steps.length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: 0, alignItems: 'center', padding: '16px 0', overflow: 'auto' }}>
      {steps.map((step, idx) => {
        const color = STEP_COLORS[step.status] || '#6B7280';
        const isActive = step.id === activeStepId;
        return (
          <React.Fragment key={step.id}>
            <div
              onClick={() => onStepClick?.(step.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                cursor: onStepClick ? 'pointer' : 'default', minWidth: 80,
                opacity: step.status === 'pending' ? 0.4 : 1,
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: isActive ? color : 'transparent',
                border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600, color: isActive ? '#fff' : color,
                transition: 'all 0.2s',
              }}>
                {step.status === 'succeeded' || step.status === 'completed' || step.status === 'success' ? '✓' :
                 step.status === 'failed' ? '✗' :
                 step.status === 'running' ? '●' :
                 step.status === 'cancelled' ? '—' :
                 step.status === 'blocked' ? '⊘' :
                 step.status === 'skipped' ? '→' : String(idx + 1)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {step.step_name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {step.status}
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, background: color, opacity: 0.3,
                minWidth: 20, margin: '0 4px',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepStatusIndicator;
