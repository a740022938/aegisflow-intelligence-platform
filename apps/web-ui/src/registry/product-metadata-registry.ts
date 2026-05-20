export const AIP_PRODUCT_NAME = 'OpenAIP';
export const AIP_PRODUCT_VERSION = 'v7.46.0';
export const AIP_SEAL_STATUS = 'Final Seal Candidate';
export const AIP_BUILD_DATE = '2026.05.16';
export const AIP_SAFETY_MODE = 'readonly-first';
export const AIP_STAGE_C = 'disabled';
export const AIP_TRACK = 'rc';
export const AIP_FEATURE_FLAG = 'off';

export const AIP_PRODUCT_METADATA = {
  productName: 'OpenAIP',
  productVersion: 'v7.46.0',
  sealStatus: 'Final Seal Candidate',
  buildDate: '2026.05.16',
  safetyMode: 'readonly-first',
  stageC: 'disabled',
  track: 'rc',
  featureFlag: 'off',
} as const;

export function getAipProductVersionLabel(): string {
  return `AIP ${AIP_PRODUCT_VERSION}`;
}

export function getAipSealStatusLabel(): string {
  return AIP_SEAL_STATUS;
}

export function getAipSafetyModeLabel(): string {
  return AIP_SAFETY_MODE === 'readonly-first' ? 'Readonly-first' : 'Safe mode';
}

export function getAipStageCStatusLabel(): string {
  return 'Stage C disabled';
}

export function getAipTrackLabel(): string {
  return AIP_TRACK === 'rc' ? 'RC' : AIP_TRACK === 'stable' ? 'Stable' : 'Dev';
}

export function getAipFeatureFlagLabel(): string {
  return AIP_FEATURE_FLAG === 'off' ? 'Feature flag: off' : 'Feature flag: on';
}
