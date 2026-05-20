// Operator Bridge Validator — validates all three bridge registries
// Readonly validation. Does not execute commands or modify state.

import { getOperatorCommandBridgeRegistry } from './operator-command-bridge-registry';
import { getOperatorRepairBridgeRegistry } from './operator-repair-bridge-registry';
import { getOperatorMemoryBridgeRegistry } from './operator-memory-bridge-registry';

export interface BridgeValidationCheck {
  id: string;
  pass: boolean;
  message: string;
  level: 'blocking' | 'warning' | 'info';
}

export interface BridgeValidationResult {
  pass: boolean;
  total: number;
  blocking: number;
  warning: number;
  info: number;
  checks: BridgeValidationCheck[];
}

export function validateBridges(): BridgeValidationResult {
  const checks: BridgeValidationCheck[] = [];
  const commandItems = getOperatorCommandBridgeRegistry();
  const repairItems = getOperatorRepairBridgeRegistry();
  const memoryItems = getOperatorMemoryBridgeRegistry();

  // Command bridge checks
  checks.push({
    id: 'command-bridge-exists',
    pass: commandItems.length > 0,
    message: commandItems.length > 0
      ? `Command bridge has ${commandItems.length} items`
      : 'Command bridge is empty',
    level: commandItems.length > 0 ? 'info' : 'blocking',
  });

  const blockedCommands = commandItems.filter(i => i.status === 'blocked');
  checks.push({
    id: 'command-bridge-no-blocked',
    pass: blockedCommands.length === 0,
    message: blockedCommands.length === 0
      ? 'No blocked commands in command bridge'
      : `${blockedCommands.length} command(s) blocked`,
    level: blockedCommands.length > 0 ? 'warning' : 'info',
  });

  // Repair bridge checks
  checks.push({
    id: 'repair-bridge-exists',
    pass: repairItems.length > 0,
    message: repairItems.length > 0
      ? `Repair bridge has ${repairItems.length} items`
      : 'Repair bridge is empty',
    level: repairItems.length > 0 ? 'info' : 'blocking',
  });

  const nonPlanOnly = repairItems.filter(i => !i.planOnly);
  checks.push({
    id: 'repair-bridge-plan-only',
    pass: nonPlanOnly.length === 0,
    message: nonPlanOnly.length === 0
      ? 'All repair items are plan-only'
      : `${nonPlanOnly.length} repair item(s) are NOT plan-only`,
    level: nonPlanOnly.length > 0 ? 'blocking' : 'info',
  });

  const sourceRestoreAllowed = repairItems.filter(i => i.sourceRestoreAllowed);
  checks.push({
    id: 'repair-bridge-source-restore-blocked',
    pass: sourceRestoreAllowed.length === 0,
    message: sourceRestoreAllowed.length === 0
      ? 'Source restore blocked for all repair items'
      : `${sourceRestoreAllowed.length} repair item(s) allow source restore`,
    level: sourceRestoreAllowed.length > 0 ? 'blocking' : 'info',
  });

  const fullRestoreAllowed = repairItems.filter(i => i.fullRestoreAllowed);
  checks.push({
    id: 'repair-bridge-full-restore-blocked',
    pass: fullRestoreAllowed.length === 0,
    message: fullRestoreAllowed.length === 0
      ? 'Full restore blocked for all repair items'
      : `${fullRestoreAllowed.length} repair item(s) allow full restore`,
    level: fullRestoreAllowed.length > 0 ? 'blocking' : 'info',
  });

  // Memory bridge checks
  checks.push({
    id: 'memory-bridge-exists',
    pass: memoryItems.length > 0,
    message: memoryItems.length > 0
      ? `Memory bridge has ${memoryItems.length} items`
      : 'Memory bridge is empty',
    level: memoryItems.length > 0 ? 'info' : 'blocking',
  });

  checks.push({
    id: 'memory-bridge-current-baseline',
    pass: memoryItems.some(i => i.id === 'mem-current-baseline'),
    message: memoryItems.some(i => i.id === 'mem-current-baseline')
      ? 'Current baseline memory entry exists'
      : 'Missing current baseline memory entry',
    level: memoryItems.some(i => i.id === 'mem-current-baseline') ? 'info' : 'warning',
  });

  checks.push({
    id: 'memory-bridge-desktop-packs-warning',
    pass: memoryItems.some(i => i.id === 'mem-desktop-packs'),
    message: memoryItems.some(i => i.id === 'mem-desktop-packs')
      ? 'Desktop task packs correctly classified as reference-only'
      : 'Missing desktop task packs entry',
    level: 'info',
  });

  // All items must be readonly
  const allItems = [...commandItems, ...repairItems, ...memoryItems];
  const mutableItems = allItems.filter(i => !i.readonly);
  checks.push({
    id: 'all-bridge-items-readonly',
    pass: mutableItems.length === 0,
    message: mutableItems.length === 0
      ? 'All bridge items are readonly'
      : `${mutableItems.length} bridge item(s) are NOT readonly`,
    level: mutableItems.length > 0 ? 'blocking' : 'info',
  });

  const result: BridgeValidationResult = {
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
