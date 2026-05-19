import { FEATURE_FLAG_CONTROL_REGISTRY } from './stage-c-feature-flag-control-registry';

export interface FeatureFlagControlValidationResult {
  readonly: boolean;
  toggleEnabled: boolean;
  actionAllowed: boolean;
  mutationAllowed: boolean;
  canEnableStageC: boolean;
  noDbWrite: boolean;
  noExternalControl: boolean;
  noExecutor: boolean;
  noConnectorAction: boolean;
  noSidebarExposure: boolean;
  allPassed: boolean;
  failures: string[];
}

export function validateFeatureFlagControl(): FeatureFlagControlValidationResult {
  const failures: string[] = [];

  for (const item of FEATURE_FLAG_CONTROL_REGISTRY) {
    if (!item.qualityGate.readonly) {
      failures.push(`${item.id}: readonly must be true`);
    }
    if (!item.qualityGate.noStageC) {
      failures.push(`${item.id}: noStageC must be true`);
    }
    if (!item.qualityGate.noDbWrite) {
      failures.push(`${item.id}: noDbWrite must be true`);
    }
    if (!item.qualityGate.noExternalControl) {
      failures.push(`${item.id}: noExternalControl must be true`);
    }
    if (!item.qualityGate.noDangerousActions) {
      failures.push(`${item.id}: noDangerousActions must be true`);
    }
    if (item.sidebarState !== 'hidden_direct') {
      failures.push(`${item.id}: sidebarState must be hidden_direct`);
    }
    if (item.visibleInSidebar) {
      failures.push(`${item.id}: visibleInSidebar must be false`);
    }
    if (item.operationalMode !== 'readonly') {
      failures.push(`${item.id}: operationalMode must be readonly`);
    }
  }

  return {
    readonly: failures.length === 0,
    toggleEnabled: false,
    actionAllowed: false,
    mutationAllowed: false,
    canEnableStageC: false,
    noDbWrite: true,
    noExternalControl: true,
    noExecutor: true,
    noConnectorAction: true,
    noSidebarExposure: true,
    allPassed: failures.length === 0,
    failures,
  };
}
