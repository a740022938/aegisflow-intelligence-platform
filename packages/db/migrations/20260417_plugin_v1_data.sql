-- Migration: Plugin Registry V1 - Phase 0 (数据初始化)
-- 插入插件数据到新的 V1 表结构
-- Created: 2026-04-17

-- ============================================
-- 插入插件数据
-- ============================================

-- builtin-demo-plugin: active 状态
INSERT INTO plugin_registry (
  plugin_id, name, version, category, status, execution_mode,
  requires_approval, dry_run_supported, ui_node_type,
  allowed_upstream, allowed_downstream,
  entry, capabilities, permissions, risk_level,
  enabled, author, description, tags,
  manifest_json, created_at, updated_at
) VALUES (
  'builtin-demo-plugin',
  'Demo Plugin',
  '1.0.0',
  'reporting/system',
  'active',
  'readonly',
  0,
  1,
  'transform',
  json_array('dataset/view', 'model/info'),
  json_array('export/file'),
  './index.js',
  json_array('report', 'read'),
  json_array('read:datasets', 'read:models', 'read:evaluations'),
  'LOW',
  1,
  'AGI Factory Team',
  '演示插件，展示只读报表能力',
  json_array('demo', 'builtin', 'report'),
  json_object(
    'plugin_id', 'builtin-demo-plugin',
    'name', 'Demo Plugin',
    'version', '1.0.0',
    'entry', './index.js',
    'capabilities', json_array('report', 'read'),
    'permissions', json_array('read:datasets', 'read:models', 'read:evaluations'),
    'risk_level', 'LOW',
    'enabled', 1,
    'author', 'AGI Factory Team',
    'description', '演示插件，展示只读报表能力',
    'tags', json_array('demo', 'builtin', 'report'),
    'category', 'reporting/system',
    'status', 'active',
    'execution_mode', 'readonly',
    'requires_approval', 0,
    'dry_run_supported', 1,
    'ui_node_type', 'transform',
    'icon', 'file-text',
    'color', '#6b7280'
  ),
  datetime('now'),
  datetime('now')
);

-- vision-sam: trial 状态
INSERT INTO plugin_registry (
  plugin_id, name, version, category, status, execution_mode,
  requires_approval, dry_run_supported, ui_node_type,
  allowed_upstream, allowed_downstream,
  entry, capabilities, permissions, risk_level,
  enabled, description, tags,
  manifest_json, created_at, updated_at
) VALUES (
  'vision-sam',
  'Official Vision SAM Plugin Shell',
  '1.0.0',
  'vision/segment',
  'trial',
  'resource_intensive',
  0,
  1,
  'transform',
  json_array('vision/detect'),
  json_array('vision/classify', 'vision/track'),
  'dist/index.js',
  json_array('vision'),
  json_array('db:read'),
  'MEDIUM',
  1,
  'Official plugin shell for vision-sam. Execution remains dry-run trial only.',
  json_array('builtin', 'step:sam_handoff', 'step:sam_segment'),
  json_object(
    'plugin_id', 'vision-sam',
    'name', 'Official Vision SAM Plugin Shell',
    'version', '1.0.0',
    'entry', 'dist/index.js',
    'capabilities', json_array('vision'),
    'permissions', json_array('db:read'),
    'risk_level', 'MEDIUM',
    'enabled', 1,
    'description', 'Official plugin shell for vision-sam. Execution remains dry-run trial only.',
    'tags', json_array('builtin', 'step:sam_handoff', 'step:sam_segment'),
    'category', 'vision/segment',
    'status', 'trial',
    'execution_mode', 'resource_intensive',
    'requires_approval', 0,
    'dry_run_supported', 1,
    'ui_node_type', 'transform',
    'icon', 'scissors',
    'color', '#8b5cf6'
  ),
  datetime('now'),
  datetime('now')
);

-- vision-yolo: frozen 状态
INSERT INTO plugin_registry (
  plugin_id, name, version, category, status, execution_mode,
  requires_approval, dry_run_supported, ui_node_type,
  entry, capabilities, risk_level,
  enabled, tags,
  manifest_json, created_at, updated_at
) VALUES (
  'vision-yolo',
  'Official Vision YOLO',
  '1.0.0',
  'vision/detect',
  'frozen',
  'resource_intensive',
  0,
  0,
  'transform',
  './index.js',
  json_array('vision'),
  'MEDIUM',
  1,
  json_array('builtin', 'frozen'),
  json_object(
    'plugin_id', 'vision-yolo',
    'status', 'frozen',
    'category', 'vision/detect'
  ),
  datetime('now'),
  datetime('now')
);

-- vision-mahjong-classifier: frozen 状态
INSERT INTO plugin_registry (
  plugin_id, name, version, category, status, execution_mode,
  requires_approval, dry_run_supported, ui_node_type,
  entry, capabilities, risk_level,
  enabled, tags,
  manifest_json, created_at, updated_at
) VALUES (
  'vision-mahjong-classifier',
  'Official Vision Mahjong Classifier',
  '1.0.0',
  'vision/classify',
  'frozen',
  'resource_intensive',
  0,
  0,
  'transform',
  './index.js',
  json_array('vision'),
  'MEDIUM',
  1,
  json_array('builtin', 'frozen'),
  json_object(
    'plugin_id', 'vision-mahjong-classifier',
    'status', 'frozen',
    'category', 'vision/classify'
  ),
  datetime('now'),
  datetime('now')
);

-- vision-tracker: planned 状态
INSERT INTO plugin_registry (
  plugin_id, name, version, category, status, execution_mode,
  requires_approval, dry_run_supported, ui_node_type,
  entry, capabilities, risk_level,
  enabled, tags,
  manifest_json, created_at, updated_at
) VALUES (
  'vision-tracker',
  'Vision Tracker',
  '1.0.0',
  'vision/track',
  'planned',
  'resource_intensive',
  0,
  0,
  'transform',
  './index.js',
  json_array('vision'),
  'MEDIUM',
  0,
  json_array('builtin', 'planned'),
  json_object(
    'plugin_id', 'vision-tracker',
    'status', 'planned',
    'category', 'vision/track'
  ),
  datetime('now'),
  datetime('now')
);

-- vision-rule-engine: planned 状态
INSERT INTO plugin_registry (
  plugin_id, name, version, category, status, execution_mode,
  requires_approval, dry_run_supported, ui_node_type,
  entry, capabilities, risk_level,
  enabled, tags,
  manifest_json, created_at, updated_at
) VALUES (
  'vision-rule-engine',
  'Vision Rule Engine',
  '1.0.0',
  'vision/rule',
  'planned',
  'resource_intensive',
  0,
  0,
  'transform',
  './index.js',
  json_array('vision'),
  'MEDIUM',
  0,
  json_array('builtin', 'planned'),
  json_object(
    'plugin_id', 'vision-rule-engine',
    'status', 'planned',
    'category', 'vision/rule'
  ),
  datetime('now'),
  datetime('now')
);

-- vision-fusion: planned 状态
INSERT INTO plugin_registry (
  plugin_id, name, version, category, status, execution_mode,
  requires_approval, dry_run_supported, ui_node_type,
  entry, capabilities, risk_level,
  enabled, tags,
  manifest_json, created_at, updated_at
) VALUES (
  'vision-fusion',
  'Vision Fusion',
  '1.0.0',
  'vision/fusion',
  'planned',
  'resource_intensive',
  0,
  0,
  'transform',
  './index.js',
  json_array('vision'),
  'MEDIUM',
  0,
  json_array('builtin', 'planned'),
  json_object(
    'plugin_id', 'vision-fusion',
    'status', 'planned',
    'category', 'vision/fusion'
  ),
  datetime('now'),
  datetime('now')
);

-- temp-m12-bad-plugin: residual 状态
INSERT INTO plugin_registry (
  plugin_id, name, version, category, status, execution_mode,
  requires_approval, dry_run_supported, risk_level,
  enabled, tags,
  manifest_json, created_at, updated_at
) VALUES (
  'temp-m12-bad-plugin',
  'Temp M12 Bad Plugin',
  '1.0.0',
  'legacy/residual',
  'residual',
  'readonly',
  0,
  0,
  'LOW',
  0,
  json_array('residual', 'temp'),
  json_object(
    'plugin_id', 'temp-m12-bad-plugin',
    'status', 'residual',
    'category', 'legacy/residual'
  ),
  datetime('now'),
  datetime('now')
);

-- ============================================
-- 重新创建视图
-- ============================================

DROP VIEW IF EXISTS v_active_plugins;
DROP VIEW IF EXISTS v_canvas_nodes;

CREATE VIEW v_active_plugins AS
SELECT 
  plugin_id,
  name,
  version,
  category,
  status,
  execution_mode,
  risk_level,
  ui_node_type,
  enabled,
  created_at,
  updated_at
FROM plugin_registry
WHERE status IN ('active', 'gated', 'trial')
  AND enabled = 1;

CREATE VIEW v_canvas_nodes AS
SELECT 
  plugin_id,
  name,
  description,
  category,
  status,
  ui_node_type,
  icon,
  color,
  input_schema,
  output_schema,
  allowed_upstream,
  allowed_downstream,
  documentation_url
FROM plugin_registry
WHERE status IN ('active', 'gated', 'trial', 'frozen', 'planned')
  AND ui_node_type IS NOT NULL;

-- ============================================
-- Data Initialization Complete
-- ============================================
