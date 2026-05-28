export const AIP_PRODUCT_NAME = 'OpenAIP';
export const AIP_PRODUCT_VERSION = 'v8.0.0';
export const AIP_SEAL_STATUS = 'released';
export const AIP_BUILD_DATE = '2026.05.22';
export const AIP_SAFETY_MODE = 'readonly-first';
export const AIP_STAGE_C = 'disabled';
export const AIP_TRACK = 'stable';
export const AIP_FEATURE_FLAG = 'off';

export const AIP_PRODUCT_METADATA = {
  productName: 'OpenAIP',
  productVersion: 'v8.0.0',
  sealStatus: 'released',
  buildDate: '2026.05.22',
  safetyMode: 'readonly-first',
  stageC: 'disabled',
  track: 'stable',
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
  const labels: Record<string, string> = { rc: 'RC', stable: 'Stable', dev: 'Dev' };
  return labels[AIP_TRACK] || 'Dev';
}

export function getAipFeatureFlagLabel(): string {
  return AIP_FEATURE_FLAG === 'off' ? 'Feature flag: off' : 'Feature flag: on';
}
