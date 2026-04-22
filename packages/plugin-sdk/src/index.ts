// Plugin SDK - 导出入口
// AGI Model Factory v6.5.0 - Phase 0

// Types
export * from './types.js';

// Manifest (V0 - 兼容)
export {
  MANIFEST_SCHEMA,
  validateManifest,
  validatePluginId,
  validateVersion,
  validateRiskLevel,
  validateCapability,
  validatePermission,
  applyRiskDefaults,
  getRiskWeight,
  checkPermission,
} from './manifest.js';

// Validation (V1 - 新增)
export {
  validateManifestV1,
  validateManifestV0,
  detectManifestVersion,
  upgradeManifestV0ToV1,
  validateCategory,
  getDefaultRequiresApproval,
  isStatusExecutable,
  isStatusAllowDryRun,
} from './validation.js';

// Utils
export {
  generatePluginId,
  parsePluginPackage,
  compareVersion,
  hasCapability,
  isBelowRiskThreshold,
  getPluginSummary,
  safeLoadJson,
  delay,
  createUniqueId,
  mergeConfig,
  formatDuration,
  createLogPrefix,
} from './utils.js';
