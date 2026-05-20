// Stage C Authorization Review Pack Validator — validates review pack completeness
// Readonly validation. Does not accept authorization or modify state.

import { getAuthorizationReviewPackRegistry } from './stage-c-authorization-review-pack-registry';

export interface AuthReviewPackValidationCheck {
  id: string;
  pass: boolean;
  message: string;
  level: 'blocking' | 'warning' | 'info';
}

export interface AuthReviewPackValidationResult {
  pass: boolean;
  total: number;
  blocking: number;
  warning: number;
  info: number;
  checks: AuthReviewPackValidationCheck[];
}

export function validateAuthorizationReviewPack(): AuthReviewPackValidationResult {
  const checks: AuthReviewPackValidationCheck[] = [];
  const items = getAuthorizationReviewPackRegistry();

  // Registry must exist and have items
  checks.push({
    id: 'auth-pack-exists',
    pass: items.length > 0,
    message: items.length > 0
      ? `Authorization review pack has ${items.length} items`
      : 'Authorization review pack is empty',
    level: items.length > 0 ? 'info' : 'blocking',
  });

  // All items must be readonly
  const nonReadonly = items.filter(i => !i.readonly);
  checks.push({
    id: 'auth-pack-all-readonly',
    pass: nonReadonly.length === 0,
    message: nonReadonly.length === 0
      ? 'All authorization review pack items are readonly'
      : `${nonReadonly.length} item(s) are NOT readonly`,
    level: nonReadonly.length > 0 ? 'blocking' : 'info',
  });

  // All required items must be present
  const requiredIds = [
    'auth-human-authorization-text',
    'auth-scope-of-authorization',
    'auth-expiration-timebox',
    'auth-allowed-operations',
    'auth-forbidden-operations',
    'auth-required-prechecks',
    'auth-required-smoke-tests',
    'auth-required-rollback-plan',
    'auth-required-receipt',
    'auth-no-go-conditions',
    'auth-fake-authorization-detection',
    'auth-final-human-confirmation',
  ];

  for (const requiredId of requiredIds) {
    const item = items.find(i => i.id === requiredId);
    checks.push({
      id: `auth-pack-${requiredId}`,
      pass: !!item,
      message: item
        ? `Required item "${item.title}" is present`
        : `Missing required item: ${requiredId}`,
      level: item ? 'info' : 'blocking',
    });
  }

  // No item should be satisfied (this is preview only, no actual authorization)
  const satisfiedItems = items.filter(i => i.satisfied);
  checks.push({
    id: 'auth-pack-no-satisfied',
    pass: satisfiedItems.length === 0,
    message: satisfiedItems.length === 0
      ? 'No items are marked as satisfied (correct — preview has no authorization)'
      : `${satisfiedItems.length} item(s) are marked satisfied — should be 0 in preview`,
    level: satisfiedItems.length === 0 ? 'info' : 'blocking',
  });

  // All items must have forbiddenAction
  const missingForbidden = items.filter(i => !i.forbiddenAction);
  checks.push({
    id: 'auth-pack-forbidden-actions',
    pass: missingForbidden.length === 0,
    message: missingForbidden.length === 0
      ? 'All items have forbidden action rules'
      : `${missingForbidden.length} item(s) missing forbidden action`,
    level: missingForbidden.length > 0 ? 'warning' : 'info',
  });

  const result: AuthReviewPackValidationResult = {
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
