// System Info Plugin - 系统信息查询
// Phase 1A: P0 新插件接入
// AGI Model Factory v6.5.0

module.exports.manifest = {
  plugin_id: 'system-info',
  name: 'System Info',
  version: '1.0.0',
  category: 'system/info',
  status: 'active',
  execution_mode: 'readonly',
  risk_level: 'LOW',
  enabled: true,
  requires_approval: false,
  dry_run_supported: true,
  ui_node_type: 'source',
  capabilities: ['read', 'report'],
  permissions: ['read:system', 'read:config'],
  description: '系统信息查询插件，返回运行时环境、版本、配置摘要',
  author: 'AGI Factory Team',
  tags: ['system', 'info', 'builtin'],
  icon: 'info',
  color: '#3b82f6',
  input_schema: {
    type: 'object',
    properties: {
      include_env: { type: 'boolean', default: false },
      include_config: { type: 'boolean', default: true },
    },
  },
  output_schema: {
    type: 'object',
    properties: {
      version: { type: 'string' },
      node_version: { type: 'string' },
      platform: { type: 'string' },
      uptime_seconds: { type: 'number' },
      config_summary: { type: 'object' },
    },
  },
};

module.exports.execute = async function execute(action, params, context) {
  const includeEnv = params?.include_env ?? false;
  const includeConfig = params?.include_config ?? true;

  const result = {
    version: process.env.npm_package_version || '6.5.0',
    node_version: process.version,
    platform: process.platform,
    uptime_seconds: Math.floor(process.uptime()),
  };

  if (includeConfig) {
    result.config_summary = {
      plugin_system_enabled: true,
      db_path: 'packages/db/agi_factory.db',
      port: 8787,
    };
  }

  if (includeEnv) {
    result.env = {
      NODE_ENV: process.env.NODE_ENV || 'development',
      TZ: process.env.TZ || 'UTC',
    };
  }

  return result;
};

module.exports.default = module.exports;
