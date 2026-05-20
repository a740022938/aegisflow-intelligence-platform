// Operator CLI-Console Experience Validator — validates CLI-to-console mappings
// Readonly validation. Does not execute commands or modify state.

import { getOperatorCLIConsoleExperienceRegistry } from './operator-cli-console-experience-registry';

export interface CLIConsoleValidationCheck {
  id: string;
  pass: boolean;
  message: string;
  level: 'blocking' | 'warning' | 'info';
}

export interface CLIConsoleValidationResult {
  pass: boolean;
  total: number;
  blocking: number;
  warning: number;
  info: number;
  checks: CLIConsoleValidationCheck[];
}

export function validateCLIConsoleExperience(): CLIConsoleValidationResult {
  const checks: CLIConsoleValidationCheck[] = [];
  const items = getOperatorCLIConsoleExperienceRegistry();

  checks.push({
    id: 'cli-console-exists',
    pass: items.length > 0,
    message: items.length > 0
      ? `CLI-Console experience registry has ${items.length} items`
      : 'CLI-Console experience registry is empty',
    level: items.length > 0 ? 'info' : 'blocking',
  });

  const nonReadonly = items.filter(i => !i.readonly);
  checks.push({
    id: 'cli-console-all-readonly',
    pass: nonReadonly.length === 0,
    message: nonReadonly.length === 0
      ? 'All CLI-Console items are readonly'
      : `${nonReadonly.length} item(s) are NOT readonly`,
    level: nonReadonly.length > 0 ? 'blocking' : 'info',
  });

  const requiredFields = ['cliCommand', 'consoleSection', 'consoleRoute', 'cliOutputSummary', 'consoleLabel'];
  for (const field of requiredFields) {
    const missing = items.filter(i => !(i as any)[field]);
    checks.push({
      id: `cli-console-field-${field}`,
      pass: missing.length === 0,
      message: missing.length === 0
        ? `All items have field: ${field}`
        : `${missing.length} item(s) missing field: ${field}`,
      level: missing.length > 0 ? 'warning' : 'info',
    });
  }

  const result: CLIConsoleValidationResult = {
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
