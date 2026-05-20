// Operator Usability Drill Validator — validates usability drill scenarios
// Readonly validation. Does not execute commands or modify state.

import { getOperatorUsabilityDrillRegistry } from './operator-usability-drill-registry';

export interface UsabilityDrillValidationCheck {
  id: string;
  pass: boolean;
  message: string;
  level: 'blocking' | 'warning' | 'info';
}

export interface UsabilityDrillValidationResult {
  pass: boolean;
  total: number;
  blocking: number;
  warning: number;
  info: number;
  checks: UsabilityDrillValidationCheck[];
}

export function validateUsabilityDrill(): UsabilityDrillValidationResult {
  const checks: UsabilityDrillValidationCheck[] = [];
  const items = getOperatorUsabilityDrillRegistry();

  checks.push({
    id: 'drill-exists',
    pass: items.length > 0,
    message: items.length > 0
      ? `Usability drill registry has ${items.length} scenarios`
      : 'Usability drill registry is empty',
    level: items.length > 0 ? 'info' : 'blocking',
  });

  const nonReadonly = items.filter(i => !i.readonly);
  checks.push({
    id: 'drill-all-readonly',
    pass: nonReadonly.length === 0,
    message: nonReadonly.length === 0
      ? 'All drill items are readonly'
      : `${nonReadonly.length} item(s) are NOT readonly`,
    level: nonReadonly.length > 0 ? 'blocking' : 'info',
  });

  const requiredScenarioIds = [
    'drill-repair-plan',
    'drill-memory-baseline',
    'drill-auth-review',
    'drill-decision-workflow',
    'drill-receipt',
  ];

  for (const requiredId of requiredScenarioIds) {
    const scenario = items.find(i => i.id === requiredId);
    checks.push({
      id: `drill-${requiredId}`,
      pass: !!scenario,
      message: scenario
        ? `Required scenario "${scenario.title}" is present`
        : `Missing required scenario: ${requiredId}`,
      level: scenario ? 'info' : 'blocking',
    });
  }

  const noSafetyNote = items.filter(i => !i.safetyNote);
  checks.push({
    id: 'drill-safety-notes',
    pass: noSafetyNote.length === 0,
    message: noSafetyNote.length === 0
      ? 'All drill items have safety notes'
      : `${noSafetyNote.length} item(s) missing safety notes`,
    level: noSafetyNote.length > 0 ? 'warning' : 'info',
  });

  const result: UsabilityDrillValidationResult = {
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
