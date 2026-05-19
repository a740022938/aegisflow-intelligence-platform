export const AIP_PRODUCT_NAME = 'AegisFlow';
export const AIP_PRODUCT_VERSION = 'v7.25.2';
export const AIP_SEAL_STATUS = 'Final Seal Candidate';
export const AIP_BUILD_DATE = '2026.05.19';
export const AIP_SAFETY_MODE = 'readonly-first';
export const AIP_STAGE_C = 'disabled';

export const AIP_PRODUCT_METADATA = {
  productName: 'AegisFlow',
  productVersion: 'v7.25.2',
  sealStatus: 'Final Seal Candidate',
  buildDate: '2026.05.19',
  safetyMode: 'readonly-first',
  stageC: 'disabled',
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
