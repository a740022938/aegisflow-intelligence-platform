// Stage C First Slice Implementation Validator — pure validation checks
// Does not modify state, call APIs, or write to databases.
// Stage C remains disabled.

import { STAGE_C_FIRST_SLICE_IMPLEMENTATION_REGISTRY } from './stage-c-first-slice-implementation-registry';

export interface SliceImplementationCheck {
  id: string;
  level: 'blocking' | 'warning' | 'info';
  pass: boolean;
  message: string;
}

export interface SliceImplementationValidationResult {
  pass: boolean;
  blocking: number;
  warning: number;
  info: number;
  checks: SliceImplementationCheck[];
}

export function validateFirstSliceImplementation(): SliceImplementationValidationResult {
  const checks: SliceImplementationCheck[] = [];
  const registry = STAGE_C_FIRST_SLICE_IMPLEMENTATION_REGISTRY;

  checks.push({
    id: 'registry-non-empty',
    level: 'blocking',
    pass: registry.length > 0,
    message: registry.length > 0 ? `Registry has ${registry.length} items` : 'Registry is empty',
  });

  const ids = registry.map(i => i.id);
  const dupIds = ids.filter((id, idx) => ids.indexOf(id) !== idx);
  checks.push({
    id: 'id-unique',
    level: 'blocking',
    pass: dupIds.length === 0,
    message: dupIds.length === 0 ? 'All ids are unique' : `Duplicate ids: ${dupIds.join(', ')}`,
  });

  const notAuthorized = registry.filter(i => i.authorized !== true);
  checks.push({
    id: 'all-authorized',
    level: 'blocking',
    pass: notAuthorized.length === 0,
    message: notAuthorized.length === 0 ? 'All items are authorized' : `Not authorized: ${notAuthorized.map(i => i.id).join(', ')}`,
  });

  const notFirstSlice = registry.filter(i => i.withinFirstSlice !== true);
  checks.push({
    id: 'all-within-first-slice',
    level: 'blocking',
    pass: notFirstSlice.length === 0,
    message: notFirstSlice.length === 0 ? 'All items are within first slice' : `Outside first slice: ${notFirstSlice.map(i => i.id).join(', ')}`,
  });

  const canEnable = registry.filter(i => i.canEnableStageC !== false);
  checks.push({
    id: 'no-stage-c-enablement',
    level: 'blocking',
    pass: canEnable.length === 0,
    message: canEnable.length === 0 ? 'No item can enable Stage C' : `Can enable: ${canEnable.map(i => i.id).join(', ')}`,
  });

  const noDesc = registry.filter(i => !i.description);
  checks.push({
    id: 'description-not-empty',
    level: 'blocking',
    pass: noDesc.length === 0,
    message: noDesc.length === 0 ? 'All items have descriptions' : `Missing description: ${noDesc.map(i => i.id).join(', ')}`,
  });

  const categories = [...new Set(registry.map(i => i.category))].sort();
  checks.push({
    id: 'category-coverage',
    level: 'info',
    pass: categories.length >= 5,
    message: `Categories: ${categories.join(', ')}`,
  });

  const blocking = checks.filter(c => c.level === 'blocking' && !c.pass).length;
  const warning = checks.filter(c => c.level === 'warning' && !c.pass).length;
  const info = checks.filter(c => c.level === 'info').length;

  return {
    pass: blocking === 0,
    blocking,
    warning,
    info,
    checks,
  };
}
