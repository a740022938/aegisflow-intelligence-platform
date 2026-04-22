// Plugin SDK - Manifest Schema & Validator
// AGI Model Factory v6.0.0

import { PluginManifest, ValidationResult, RiskLevel, Capability } from './types.js';

// JSON Schema for PluginManifest
export const MANIFEST_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['plugin_id', 'name', 'version', 'entry', 'capabilities', 'risk_level'],
  properties: {
    plugin_id: {
      type: 'string',
      pattern: '^[a-z0-9-]+$',
      description: '唯一标识符，只能包含小写字母、数字和连字符',
    },
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    version: {
      type: 'string',
      pattern: '^\\d+\\.\\d+\\.\\d+$',
    },
    entry: {
      type: 'string',
    },
    capabilities: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['report', 'read', 'compute', 'notify', 'transform', 'export'],
      },
      minItems: 1,
    },
    permissions: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    risk_level: {
      type: 'string',
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    },
    config_schema: {
      type: 'object',
    },
    enabled: {
      type: 'boolean',
    },
    author: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};

// Valid risk levels
const VALID_RISK_LEVELS: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

// Valid capabilities
const VALID_CAPABILITIES: Capability[] = ['report', 'read', 'compute', 'notify', 'transform', 'export', 'vision'];

/**
 * 验证 plugin_id 格式
 */
export function validatePluginId(pluginId: string): boolean {
  return /^[a-z0-9-]+$/.test(pluginId);
}

/**
 * 验证 version 格式 (semver)
 */
export function validateVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(version);
}

/**
 * 验证 risk_level
 */
export function validateRiskLevel(riskLevel: string): riskLevel is RiskLevel {
  return VALID_RISK_LEVELS.includes(riskLevel as RiskLevel);
}

/**
 * 验证 capability
 */
export function validateCapability(capability: string): capability is Capability {
  return VALID_CAPABILITIES.includes(capability as Capability);
}

/**
 * 验证权限格式
 */
export function validatePermission(permission: string): boolean {
  // 格式: action:resource 或通配符 *
  return /^(\*|[a-z]+):(\*|[a-z_]+)$/.test(permission);
}

/**
 * 验证 Manifest
 */
export function validateManifest(manifest: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 检查必需字段
  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, errors: ['Manifest must be an object'] };
  }

  // plugin_id
  if (!manifest.plugin_id) {
    errors.push('plugin_id is required');
  } else if (!validatePluginId(manifest.plugin_id)) {
    errors.push('plugin_id must match pattern ^[a-z0-9-]+$');
  }

  // name
  if (!manifest.name) {
    errors.push('name is required');
  } else if (typeof manifest.name !== 'string' || manifest.name.length === 0) {
    errors.push('name must be a non-empty string');
  } else if (manifest.name.length > 100) {
    errors.push('name must be at most 100 characters');
  }

  // version
  if (!manifest.version) {
    errors.push('version is required');
  } else if (!validateVersion(manifest.version)) {
    errors.push('version must match semver format (e.g., 1.0.0)');
  }

  // entry
  if (!manifest.entry) {
    errors.push('entry is required');
  }

  // capabilities
  if (!manifest.capabilities) {
    errors.push('capabilities is required');
  } else if (!Array.isArray(manifest.capabilities)) {
    errors.push('capabilities must be an array');
  } else if (manifest.capabilities.length === 0) {
    errors.push('capabilities must have at least one item');
  } else {
    for (const cap of manifest.capabilities) {
      if (!validateCapability(cap)) {
        errors.push(`Invalid capability: ${cap}`);
      }
    }
  }

  // risk_level
  if (!manifest.risk_level) {
    errors.push('risk_level is required');
  } else if (!validateRiskLevel(manifest.risk_level)) {
    errors.push(`risk_level must be one of: ${VALID_RISK_LEVELS.join(', ')}`);
  }

  // permissions (optional but if present, validate format)
  if (manifest.permissions) {
    if (!Array.isArray(manifest.permissions)) {
      errors.push('permissions must be an array');
    } else {
      for (const perm of manifest.permissions) {
        if (!validatePermission(perm)) {
          warnings.push(`Permission "${perm}" has unusual format`);
        }
      }
    }
  }

  // warnings for best practices
  if (!manifest.author) {
    warnings.push('author is recommended');
  }
  if (!manifest.description) {
    warnings.push('description is recommended');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * 应用风险默认值
 */
export function applyRiskDefaults(manifest: PluginManifest): PluginManifest {
  // HIGH/CRITICAL 默认禁用
  if (manifest.risk_level === 'HIGH' || manifest.risk_level === 'CRITICAL') {
    manifest.enabled = false;
  } else {
    // 其他风险级别，默认启用
    manifest.enabled = manifest.enabled !== undefined ? manifest.enabled : true;
  }
  return manifest;
}

/**
 * 获取风险级别权重（用于比较）
 */
export function getRiskWeight(riskLevel: RiskLevel): number {
  switch (riskLevel) {
    case 'LOW':
      return 1;
    case 'MEDIUM':
      return 2;
    case 'HIGH':
      return 3;
    case 'CRITICAL':
      return 4;
  }
}

/**
 * 检查权限是否允许
 */
export function checkPermission(
  requiredPermissions: string[],
  allowedPermissions: string[]
): boolean {
  for (const required of requiredPermissions) {
    // 通配符检查
    if (allowedPermissions.includes('*')) {
      continue;
    }
    // 精确匹配
    if (allowedPermissions.includes(required)) {
      continue;
    }
    // 前缀匹配 (e.g., read:* matches read:datasets)
    const [action, resource] = required.split(':');
    const hasPrefixMatch = allowedPermissions.some(
      (p) => (p === `${action}:*` || p === `*:${resource}`)
    );
    if (!hasPrefixMatch) {
      return false;
    }
  }
  return true;
}
