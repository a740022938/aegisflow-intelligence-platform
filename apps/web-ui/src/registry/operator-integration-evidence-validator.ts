// Operator Integration Evidence Validator — validates integration evidence
// Readonly validation. Does not execute commands or modify state.

import { getOperatorIntegrationEvidenceRegistry } from './operator-integration-evidence-registry';

export interface IntegrationEvidenceValidationCheck {
  id: string;
  pass: boolean;
  message: string;
  level: 'blocking' | 'warning' | 'info';
}

export interface IntegrationEvidenceValidationResult {
  pass: boolean;
  total: number;
  blocking: number;
  warning: number;
  info: number;
  checks: IntegrationEvidenceValidationCheck[];
}

export function validateIntegrationEvidence(): IntegrationEvidenceValidationResult {
  const checks: IntegrationEvidenceValidationCheck[] = [];
  const items = getOperatorIntegrationEvidenceRegistry();

  checks.push({
    id: 'evidence-exists',
    pass: items.length > 0,
    message: items.length > 0
      ? `Integration evidence registry has ${items.length} items`
      : 'Integration evidence registry is empty',
    level: items.length > 0 ? 'info' : 'blocking',
  });

  const nonReadonly = items.filter(i => !i.readonly);
  checks.push({
    id: 'evidence-all-readonly',
    pass: nonReadonly.length === 0,
    message: nonReadonly.length === 0
      ? 'All evidence items are readonly'
      : `${nonReadonly.length} item(s) are NOT readonly`,
    level: nonReadonly.length > 0 ? 'blocking' : 'info',
  });

  const requiredEvidenceIds = [
    'evidence-cli-command-center',
    'evidence-safe-status',
    'evidence-operator-console',
    'evidence-repair-plan-only',
    'evidence-memory-baseline',
    'evidence-auth-review-pack',
    'evidence-decision-workflow',
    'evidence-safety-boundary',
  ];

  for (const requiredId of requiredEvidenceIds) {
    const item = items.find(i => i.id === requiredId);
    checks.push({
      id: `evidence-${requiredId}`,
      pass: !!item,
      message: item
        ? `Required evidence "${item.title}" is present`
        : `Missing required evidence: ${requiredId}`,
      level: item ? 'info' : 'blocking',
    });
  }

  const notVerified = items.filter(i => !i.verified);
  checks.push({
    id: 'evidence-all-verified',
    pass: notVerified.length === 0,
    message: notVerified.length === 0
      ? 'All evidence items are verified'
      : `${notVerified.length} item(s) are NOT verified`,
    level: notVerified.length > 0 ? 'warning' : 'info',
  });

  const result: IntegrationEvidenceValidationResult = {
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
