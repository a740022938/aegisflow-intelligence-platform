// Plugin SDK - Manifest V1 验证
// AGI Model Factory v6.5.0 - Phase 0

import {
  PluginManifest,
  PluginManifestV0,
  ManifestValidationResult,
  RiskLevel,
  PluginLifecycleStatus,
  ExecutionMode,
  UINodeType,
} from './types.js';

// 有效的风险级别
const VALID_RISK_LEVELS: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

// 有效的生命周期状态
const VALID_LIFECYCLE_STATUSES: PluginLifecycleStatus[] = ['active', 'gated', 'trial', 'frozen', 'planned', 'residual'];

// 有效的执行模式
const VALID_EXECUTION_MODES: ExecutionMode[] = ['readonly', 'side_effect', 'resource_intensive'];

// 有效的 UI 节点类型
const VALID_UI_NODE_TYPES: UINodeType[] = ['source', 'transform', 'sink', 'control'];

// 有效的分类格式: domain/subdomain
const CATEGORY_PATTERN = /^[a-z][a-z0-9]*\/[a-z][a-z0-9]*$/;

/**
 * 验证 Plugin Manifest V1
 * 
 * 字段分层验证：
 * - Layer 0: 已有字段（基本验证）
 * - Layer 1: 治理必需字段（严格验证）
 * - Layer 2: 画布节点字段（条件验证）
 * - Layer 3: UI 展示字段（可选验证）
 */
export function validateManifestV1(manifest: any): ManifestValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ========== Layer 0: 已有字段验证 ==========
  if (!manifest.plugin_id || typeof manifest.plugin_id !== 'string') {
    errors.push('plugin_id is required and must be a string');
  } else if (!/^[a-z][a-z0-9-_]*$/.test(manifest.plugin_id)) {
    errors.push('plugin_id must start with lowercase letter and contain only lowercase letters, numbers, hyphens, and underscores');
  }

  if (!manifest.name || typeof manifest.name !== 'string') {
    errors.push('name is required and must be a string');
  }

  if (!manifest.version || typeof manifest.version !== 'string') {
    errors.push('version is required and must be a string');
  }

  if (!manifest.entry || typeof manifest.entry !== 'string') {
    errors.push('entry is required and must be a string');
  }

  if (!Array.isArray(manifest.capabilities) || manifest.capabilities.length === 0) {
    errors.push('capabilities is required and must be a non-empty array');
  }

  if (!manifest.risk_level || !VALID_RISK_LEVELS.includes(manifest.risk_level)) {
    errors.push(`risk_level must be one of: ${VALID_RISK_LEVELS.join(', ')}`);
  }

  // ========== Layer 1: 治理必需字段验证 ==========
  if (!manifest.category || typeof manifest.category !== 'string') {
    errors.push('category is required and must be a string (format: domain/subdomain)');
  } else if (!CATEGORY_PATTERN.test(manifest.category)) {
    errors.push('category must match pattern: domain/subdomain (e.g., "vision/segment")');
  }

  if (!manifest.status || !VALID_LIFECYCLE_STATUSES.includes(manifest.status)) {
    errors.push(`status is required and must be one of: ${VALID_LIFECYCLE_STATUSES.join(', ')}`);
  }

  if (!manifest.execution_mode || !VALID_EXECUTION_MODES.includes(manifest.execution_mode)) {
    errors.push(`execution_mode is required and must be one of: ${VALID_EXECUTION_MODES.join(', ')}`);
  }

  if (typeof manifest.requires_approval !== 'boolean') {
    errors.push('requires_approval is required and must be a boolean');
  }

  if (typeof manifest.dry_run_supported !== 'boolean') {
    errors.push('dry_run_supported is required and must be a boolean');
  }

  // ========== Layer 1: 一致性验证 ==========
  // HIGH/CRITICAL 风险插件必须 requires_approval=true
  if ((manifest.risk_level === 'HIGH' || manifest.risk_level === 'CRITICAL') && manifest.requires_approval === false) {
    errors.push('HIGH/CRITICAL risk plugins must have requires_approval=true');
  }

  // CRITICAL 风险插件当前版本不允许 active
  if (manifest.risk_level === 'CRITICAL' && manifest.status === 'active') {
    warnings.push('CRITICAL risk plugins should not be active in V1, consider using gated or frozen');
  }

  // ========== Layer 2: 画布节点字段验证（条件）==========
  // 非 planned 状态需要 ui_node_type
  if (manifest.status && manifest.status !== 'planned') {
    if (!manifest.ui_node_type) {
      errors.push('ui_node_type is required for non-planned plugins');
    } else if (!VALID_UI_NODE_TYPES.includes(manifest.ui_node_type)) {
      errors.push(`ui_node_type must be one of: ${VALID_UI_NODE_TYPES.join(', ')}`);
    }

    // source 节点不需要 input_schema，其他需要
    if (manifest.ui_node_type && manifest.ui_node_type !== 'source') {
      if (!manifest.input_schema) {
        warnings.push('input_schema is recommended for non-source nodes');
      }
    }

    // sink 节点不需要 output_schema，其他需要
    if (manifest.ui_node_type && manifest.ui_node_type !== 'sink') {
      if (!manifest.output_schema) {
        warnings.push('output_schema is recommended for non-sink nodes');
      }
    }
  }

  // allowed_upstream/downstream 如果存在必须是数组
  if (manifest.allowed_upstream !== undefined && !Array.isArray(manifest.allowed_upstream)) {
    errors.push('allowed_upstream must be an array of category strings');
  }

  if (manifest.allowed_downstream !== undefined && !Array.isArray(manifest.allowed_downstream)) {
    errors.push('allowed_downstream must be an array of category strings');
  }

  // ========== Layer 3: UI 展示字段验证（可选）==========
  // icon, color, documentation_url 都是可选的，只做类型检查
  if (manifest.icon !== undefined && typeof manifest.icon !== 'string') {
    errors.push('icon must be a string');
  }

  if (manifest.color !== undefined && typeof manifest.color !== 'string') {
    errors.push('color must be a string');
  }

  if (manifest.documentation_url !== undefined && typeof manifest.documentation_url !== 'string') {
    errors.push('documentation_url must be a string');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 验证旧版 Manifest V0（兼容）
 * @deprecated 请迁移到 validateManifestV1
 */
export function validateManifestV0(manifest: any): ManifestValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!manifest.plugin_id || typeof manifest.plugin_id !== 'string') {
    errors.push('plugin_id is required');
  }

  if (!manifest.name || typeof manifest.name !== 'string') {
    errors.push('name is required');
  }

  if (!manifest.version || typeof manifest.version !== 'string') {
    errors.push('version is required');
  }

  if (!manifest.entry || typeof manifest.entry !== 'string') {
    errors.push('entry is required');
  }

  if (!Array.isArray(manifest.capabilities)) {
    errors.push('capabilities is required');
  }

  if (!manifest.risk_level || !VALID_RISK_LEVELS.includes(manifest.risk_level)) {
    errors.push('risk_level is required');
  }

  // 提示迁移到 V1
  warnings.push('Manifest V0 is deprecated, please migrate to V1 with category, status, execution_mode fields');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 检测 Manifest 版本
 */
export function detectManifestVersion(manifest: any): 'v1' | 'v0' | 'unknown' {
  if (manifest.category && manifest.status && manifest.execution_mode) {
    return 'v1';
  }
  if (manifest.plugin_id && manifest.name && manifest.version && manifest.capabilities) {
    return 'v0';
  }
  return 'unknown';
}

/**
 * 将 V0 Manifest 升级为 V1（自动填充默认值）
 */
export function upgradeManifestV0ToV1(
  manifestV0: PluginManifestV0,
  defaults: {
    category: string;
    status: PluginLifecycleStatus;
    execution_mode: ExecutionMode;
  }
): PluginManifest {
  const requiresApproval = manifestV0.risk_level === 'HIGH' || manifestV0.risk_level === 'CRITICAL';

  return {
    // Layer 0
    plugin_id: manifestV0.plugin_id,
    name: manifestV0.name,
    version: manifestV0.version,
    entry: manifestV0.entry,
    capabilities: manifestV0.capabilities,
    permissions: manifestV0.permissions,
    risk_level: manifestV0.risk_level,
    config_schema: manifestV0.config_schema,
    enabled: manifestV0.enabled,
    author: manifestV0.author,
    description: manifestV0.description,
    tags: manifestV0.tags,

    // Layer 1
    category: defaults.category,
    status: defaults.status,
    execution_mode: defaults.execution_mode,
    requires_approval: requiresApproval,
    dry_run_supported: false,

    // Layer 2 & 3: 暂不填充
  };
}

/**
 * 验证分类格式
 */
export function validateCategory(category: string): { valid: boolean; error?: string } {
  if (!category) {
    return { valid: false, error: 'category is required' };
  }
  if (!CATEGORY_PATTERN.test(category)) {
    return { valid: false, error: 'category must match pattern: domain/subdomain' };
  }
  return { valid: true };
}

/**
 * 获取默认 requires_approval 值
 */
export function getDefaultRequiresApproval(riskLevel: RiskLevel): boolean {
  return riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
}

/**
 * 检查状态是否允许执行
 */
export function isStatusExecutable(status: PluginLifecycleStatus): boolean {
  return status === 'active' || status === 'gated' || status === 'trial';
}

/**
 * 检查状态是否允许 dry_run
 */
export function isStatusAllowDryRun(status: PluginLifecycleStatus): boolean {
  return status === 'trial' || status === 'active' || status === 'gated';
}
