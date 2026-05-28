import { APP_VERSION } from './appVersion';

export const APP_META = {
  appName: 'OpenAIP',
  appNameZh: '天枢智治平台',
  appAbbr: 'AIP',
  edition: 'Community Edition',
  legacyName: 'AGI Model Factory',
  historicalName: 'AegisFlow',
  positioning: '本地优先、可审计、可封板的智能治理与模型工场平台',
  slogan: '智控全链路，稳驱新生产。',
  consoleLabelZh: '控制台',
  consoleLabelEn: 'Console',
  wechatId: 'AGI_FACTORY',
  githubRepoUrl: 'https://github.com/a740022938/aegisflow-intelligence-platform',
  // Points to latest GitHub Release (v8.0.0). Update after each real release.
  releaseUrl: 'https://github.com/a740022938/aegisflow-intelligence-platform/releases/tag/v8.0.0',
  onboardingDocUrl: 'https://github.com/a740022938/aegisflow-intelligence-platform/blob/main/docs/public-release/F0_NEW_USER_ONBOARDING.md',
  version: APP_VERSION,
} as const;
