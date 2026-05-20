// Handoff Pack Validator — validates handoff pack registry
// Readonly validation. Does not execute file operations or modify state.

import { getHandoffPackRegistry } from './handoff-pack-registry';

export interface HandoffPackValidationCheck {
  id: string;
  pass: boolean;
  message: string;
  level: 'blocking' | 'warning' | 'info';
}

export interface HandoffPackValidationResult {
  pass: boolean;
  total: number;
  blocking: number;
  warning: number;
  info: number;
  checks: HandoffPackValidationCheck[];
}

export function validateHandoffPack(): HandoffPackValidationResult {
  const checks: HandoffPackValidationCheck[] = [];
  const items = getHandoffPackRegistry();

  checks.push({
    id: 'ho-registry-exists',
    pass: items.length > 0,
    message: items.length > 0
      ? `Handoff pack registry has ${items.length} entries`
      : 'Handoff pack registry is empty',
    level: items.length > 0 ? 'info' : 'blocking',
  });

  const requiredIds = [
    'ho-release-readiness',
    'ho-operator-guide',
    'ho-operator-quickstart',
    'ho-restore-point-pack',
    'ho-install-guide',
    'ho-recovery-guide',
    'ho-stage-c-safety',
    'ho-evidence-matrix',
    'ho-handoff-checker',
  ];

  for (const requiredId of requiredIds) {
    const item = items.find(i => i.id === requiredId);
    checks.push({
      id: `ho-${requiredId}`,
      pass: !!item,
      message: item
        ? `Required handoff "${item.title}" is present [${item.readiness}]`
        : `Missing required handoff: ${requiredId}`,
      level: item ? 'info' : 'blocking',
    });
  }

  const notReady = items.filter(i => i.readiness !== 'ready');
  checks.push({
    id: 'ho-all-ready',
    pass: notReady.length === 0,
    message: notReady.length === 0
      ? 'All handoff entries are ready'
      : `${notReady.length} entry(s) are NOT ready`,
    level: notReady.length > 0 ? 'blocking' : 'info',
  });

  const notComplete = items.filter(i => i.completeness !== 'complete');
  checks.push({
    id: 'ho-all-complete',
    pass: notComplete.length === 0,
    message: notComplete.length === 0
      ? 'All handoff entries are complete'
      : `${notComplete.length} entry(s) are NOT complete`,
    level: notComplete.length > 0 ? 'blocking' : 'info',
  });

  const gateFail = items.filter(i => i.gateStatus === 'fail');
  checks.push({
    id: 'ho-gate-pass',
    pass: gateFail.length === 0,
    message: gateFail.length === 0
      ? 'All gate checks pass'
      : `${gateFail.length} gate check(s) FAIL`,
    level: gateFail.length > 0 ? 'blocking' : 'info',
  });

  const result: HandoffPackValidationResult = {
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
