// Restore Point Pack Validator — validates restore point pack registry
// Readonly validation. Does not execute file operations or modify state.

import { getRestorePointPackRegistry } from './restore-point-pack-registry';

export interface RestorePointPackValidationCheck {
  id: string;
  pass: boolean;
  message: string;
  level: 'blocking' | 'warning' | 'info';
}

export interface RestorePointPackValidationResult {
  pass: boolean;
  total: number;
  blocking: number;
  warning: number;
  info: number;
  checks: RestorePointPackValidationCheck[];
}

export function validateRestorePointPack(): RestorePointPackValidationResult {
  const checks: RestorePointPackValidationCheck[] = [];
  const items = getRestorePointPackRegistry();

  checks.push({
    id: 'rp-registry-exists',
    pass: items.length > 0,
    message: items.length > 0
      ? `Restore point pack registry has ${items.length} items`
      : 'Restore point pack registry is empty',
    level: items.length > 0 ? 'info' : 'blocking',
  });

  const nonReadonly = items.filter(i => !i.readonly);
  checks.push({
    id: 'rp-all-readonly',
    pass: nonReadonly.length === 0,
    message: nonReadonly.length === 0
      ? 'All restore point pack items are readonly'
      : `${nonReadonly.length} item(s) are NOT readonly`,
    level: nonReadonly.length > 0 ? 'blocking' : 'info',
  });

  const requiredIds = [
    'rp-manifest-format',
    'rp-exclusion-list',
    'rp-validation-requirements',
    'rp-source-restore-blocked',
    'rp-full-restore-forbidden',
    'rp-receipt-required',
  ];

  for (const requiredId of requiredIds) {
    const item = items.find(i => i.id === requiredId);
    checks.push({
      id: `rp-${requiredId}`,
      pass: !!item,
      message: item
        ? `Required item "${item.title}" is present`
        : `Missing required item: ${requiredId}`,
      level: item ? 'info' : 'blocking',
    });
  }

  const noSafetyNote = items.filter(i => !i.safetyNote);
  checks.push({
    id: 'rp-safety-notes',
    pass: noSafetyNote.length === 0,
    message: noSafetyNote.length === 0
      ? 'All items have safety notes'
      : `${noSafetyNote.length} item(s) missing safety notes`,
    level: noSafetyNote.length > 0 ? 'warning' : 'info',
  });

  const result: RestorePointPackValidationResult = {
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
