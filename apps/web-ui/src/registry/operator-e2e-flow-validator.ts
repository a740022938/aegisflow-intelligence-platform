// Operator E2E Flow Validator — validates end-to-end flow registry
// Readonly validation. Does not execute commands or modify state.

import { getOperatorE2EFlowRegistry } from './operator-e2e-flow-registry';

export interface E2EFlowValidationCheck {
  id: string;
  pass: boolean;
  message: string;
  level: 'blocking' | 'warning' | 'info';
}

export interface E2EFlowValidationResult {
  pass: boolean;
  total: number;
  blocking: number;
  warning: number;
  info: number;
  checks: E2EFlowValidationCheck[];
}

export function validateE2EFlow(): E2EFlowValidationResult {
  const checks: E2EFlowValidationCheck[] = [];
  const items = getOperatorE2EFlowRegistry();

  // Registry must have items
  checks.push({
    id: 'e2e-flow-exists',
    pass: items.length > 0,
    message: items.length > 0
      ? `E2E flow registry has ${items.length} steps`
      : 'E2E flow registry is empty',
    level: items.length > 0 ? 'info' : 'blocking',
  });

  // All items must be readonly
  const nonReadonly = items.filter(i => !i.readonly);
  checks.push({
    id: 'e2e-flow-all-readonly',
    pass: nonReadonly.length === 0,
    message: nonReadonly.length === 0
      ? 'All E2E flow items are readonly'
      : `${nonReadonly.length} item(s) are NOT readonly`,
    level: nonReadonly.length > 0 ? 'blocking' : 'info',
  });

  // Steps must be sequential (1–10)
  const sequential = items.every((item, index) => item.stepNumber === index + 1);
  checks.push({
    id: 'e2e-flow-sequential',
    pass: sequential,
    message: sequential
      ? 'Flow steps are sequential (1–10)'
      : 'Flow steps are NOT sequential',
    level: sequential ? 'info' : 'warning',
  });

  // Must include key steps
  const requiredStepIds = [
    'e2e-cli-entry',
    'e2e-safe-status',
    'e2e-operator-console',
    'e2e-auth-review',
    'e2e-decision-workflow',
    'e2e-receipt',
  ];

  for (const requiredId of requiredStepIds) {
    const step = items.find(i => i.id === requiredId);
    checks.push({
      id: `e2e-flow-${requiredId}`,
      pass: !!step,
      message: step
        ? `Required step "${step.title}" is present`
        : `Missing required step: ${requiredId}`,
      level: step ? 'info' : 'blocking',
    });
  }

  // All items must have safetyNote
  const missingSafety = items.filter(i => !i.safetyNote);
  checks.push({
    id: 'e2e-flow-safety-notes',
    pass: missingSafety.length === 0,
    message: missingSafety.length === 0
      ? 'All items have safety notes'
      : `${missingSafety.length} item(s) missing safety notes`,
    level: missingSafety.length > 0 ? 'warning' : 'info',
  });

  const result: E2EFlowValidationResult = {
    pass: true,
    total: checks.length,
    blocking: 0,
    warning: 0,
    info: 0,
    checks,
  };

  for (const c of checks) {
    if (!c.pass) {
      result.pass = false;
      if (c.level === 'blocking') result.blocking++;
      else if (c.level === 'warning') result.warning++;
    }
    if (c.level === 'info') result.info++;
  }

  return result;
}
