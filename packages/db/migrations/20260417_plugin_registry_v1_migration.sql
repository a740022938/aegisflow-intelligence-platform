-- Migration: Plugin Registry V1 - Phase 0 (收口验证版)
-- 处理已存在的旧表结构，迁移到新 V1 结构
-- Created: 2026-04-17

-- ============================================
-- 1. 备份旧表
-- ============================================

ALTER TABLE plugin_registry RENAME TO plugin_registry_old;

-- ============================================
-- 2. 创建新的 plugin_registry 表 (V1 结构)
-- ============================================

CREATE TABLE plugin_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- 基础标识
  plugin_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  
  -- Layer 1: 治理必需字段
  category TEXT NOT NULL DEFAULT 'legacy/unknown',
  status TEXT NOT NULL DEFAULT 'frozen' CHECK (status IN ('active', 'gated', 'trial', 'frozen', 'planned', 'residual')),
  execution_mode TEXT NOT NULL DEFAULT 'readonly' CHECK (execution_mode IN ('readonly', 'side_effect', 'resource_intensive')),
  requires_approval INTEGER NOT NULL DEFAULT 0,
  dry_run_supported INTEGER NOT NULL DEFAULT 0,
  
  -- Layer 2: 画布节点字段 (JSON 存储)
  ui_node_type TEXT CHECK (ui_node_type IN ('source', 'transform', 'sink', 'control')),
  allowed_upstream TEXT,  -- JSON array
  allowed_downstream TEXT,  -- JSON array
  input_schema TEXT,  -- JSON Schema
  output_schema TEXT,  -- JSON Schema
  
  -- Layer 3: UI 展示字段
  icon TEXT,
  color TEXT,
  documentation_url TEXT,
  
  -- Layer 0: 基础字段
  entry TEXT NOT NULL DEFAULT './index.js',
  capabilities TEXT NOT NULL DEFAULT '[]',  -- JSON array
  permissions TEXT,  -- JSON array
  risk_level TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  config_schema TEXT,  -- JSON
  enabled INTEGER NOT NULL DEFAULT 1,
  author TEXT,
  description TEXT,
  tags TEXT,  -- JSON array
  
  -- 完整 manifest 备份
  manifest_json TEXT NOT NULL DEFAULT '{}',
  
  -- 元数据
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT,
  
  -- 状态追踪
  status_changed_at TEXT,
  status_changed_reason TEXT
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_plugin_registry_status ON plugin_registry(status);
CREATE INDEX IF NOT EXISTS idx_plugin_registry_category ON plugin_registry(category);
CREATE INDEX IF NOT EXISTS idx_plugin_registry_enabled ON plugin_registry(enabled);
CREATE INDEX IF NOT EXISTS idx_plugin_registry_risk_level ON plugin_registry(risk_level);
CREATE INDEX IF NOT EXISTS idx_plugin_registry_ui_node_type ON plugin_registry(ui_node_type);

-- ============================================
-- 3. 迁移旧数据
-- ============================================

INSERT INTO plugin_registry (
  plugin_id,
  name,
  version,
  category,
  status,
  execution_mode,
  requires_approval,
  dry_run_supported,
  ui_node_type,
  entry,
  capabilities,
  risk_level,
  enabled,
  description,
  tags,
  manifest_json,
  created_at,
  updated_at
)
SELECT 
  o.plugin_id,
  o.plugin_name as name,
  COALESCE(o.version, '1.0.0') as version,
  -- 根据插件类型设置分类
  CASE 
    WHEN o.plugin_id LIKE 'vision-%' THEN 'vision/' || substr(o.plugin_id, 8)
    WHEN o.plugin_id LIKE 'builtin-%' THEN 'reporting/system'
    ELSE 'legacy/unknown'
  END as category,
  -- 根据 source 和 active 设置状态
  CASE 
    WHEN o.plugin_id LIKE 'temp-%' OR o.plugin_id LIKE '%-bad-%' THEN 'residual'
    WHEN o.source LIKE '%planned%' THEN 'planned'
    WHEN o.plugin_id = 'vision-sam' THEN 'trial'
    WHEN o.active = 1 AND o.enabled = 1 THEN 'active'
    ELSE 'frozen'
  END as status,
  -- 根据插件类型设置执行模式
  CASE 
    WHEN o.plugin_id LIKE 'vision-%' THEN 'resource_intensive'
    ELSE 'readonly'
  END as execution_mode,
  -- 根据风险级别设置 requires_approval (默认 MEDIUM = false)
  0 as requires_approval,
  -- vision-sam 支持 dry_run
  CASE WHEN o.plugin_id = 'vision-sam' THEN 1 ELSE 0 END as dry_run_supported,
  -- 设置 ui_node_type
  CASE 
    WHEN o.plugin_id LIKE 'vision-%' THEN 'transform'
    ELSE 'transform'
  END as ui_node_type,
  './index.js' as entry,
  -- 转换 capability 为 capabilities 数组
  json_array(COALESCE(NULLIF(o.capability, ''), 'read')) as capabilities,
  'MEDIUM' as risk_level,
  o.enabled,
  o.plugin_name as description,
  json_array(o.source) as tags,
  json_object(
    'plugin_id', o.plugin_id,
    'name', o.plugin_name,
    'version', COALESCE(o.version, '1.0.0'),
    'source', o.source,
    'old_enabled', o.enabled,
    'old_active', o.active,
    'old_init_status', o.init_status
  ) as manifest_json,
  COALESCE(o.discovered_at, datetime('now')) as created_at,
  datetime('now') as updated_at
FROM plugin_registry_old o;

-- ============================================
-- 4. 更新特定插件的详细配置
-- ============================================

-- builtin-demo-plugin: 更新为完整 V1 配置
UPDATE plugin_registry SET
  category = 'reporting/system',
  status = 'active',
  execution_mode = 'readonly',
  requires_approval = 0,
  dry_run_supported = 1,
  ui_node_type = 'transform',
  allowed_upstream = json_array('dataset/view', 'model/info'),
  allowed_downstream = json_array('export/file'),
  risk_level = 'LOW',
  capabilities = json_array('report', 'read'),
  permissions = json_array('read:datasets', 'read:models', 'read:evaluations'),
  tags = json_array('demo', 'builtin', 'report'),
  manifest_json = (
    SELECT json_object(
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
    )
  )
WHERE plugin_id = 'builtin-demo-plugin';

-- vision-sam: 更新为 trial 状态
UPDATE plugin_registry SET
  category = 'vision/segment',
  status = 'trial',
  execution_mode = 'resource_intensive',
  requires_approval = 0,
  dry_run_supported = 1,
  ui_node_type = 'transform',
  allowed_upstream = json_array('vision/detect'),
  allowed_downstream = json_array('vision/classify', 'vision/track'),
  risk_level = 'MEDIUM',
  capabilities = json_array('vision'),
  permissions = json_array('db:read'),
  tags = json_array('builtin', 'step:sam_handoff', 'step:sam_segment'),
  manifest_json = (
    SELECT json_object(
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
    )
  )
WHERE plugin_id = 'vision-sam';

-- vision-yolo: frozen 状态
UPDATE plugin_registry SET
  category = 'vision/detect',
  status = 'frozen',
  execution_mode = 'resource_intensive',
  requires_approval = 0,
  dry_run_supported = 0,
  ui_node_type = 'transform',
  risk_level = 'MEDIUM',
  capabilities = json_array('vision'),
  tags = json_array('builtin', 'frozen')
WHERE plugin_id = 'vision-yolo';

-- vision-tracker, vision-rule-engine, vision-fusion: planned 状态
UPDATE plugin_registry SET
  category = CASE plugin_id
    WHEN 'vision-tracker' THEN 'vision/track'
    WHEN 'vision-rule-engine' THEN 'vision/rule'
    WHEN 'vision-fusion' THEN 'vision/fusion'
    ELSE 'vision/unknown'
  END,
  status = 'planned',
  execution_mode = 'resource_intensive',
  requires_approval = 0,
  dry_run_supported = 0,
  ui_node_type = 'transform',
  risk_level = 'MEDIUM',
  capabilities = json_array('vision'),
  tags = json_array('builtin', 'planned')
WHERE plugin_id IN ('vision-tracker', 'vision-rule-engine', 'vision-fusion');

-- temp-m12-bad-plugin: residual 状态
UPDATE plugin_registry SET
  category = 'legacy/residual',
  status = 'residual',
  execution_mode = 'readonly',
  requires_approval = 0,
  dry_run_supported = 0,
  risk_level = 'LOW',
  tags = json_array('residual', 'temp')
WHERE plugin_id LIKE 'temp-%' OR plugin_id LIKE '%-bad-%';

-- ============================================
-- 5. 删除旧表
-- ============================================

DROP TABLE plugin_registry_old;

-- ============================================
-- 6. 重新创建视图
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
-- Migration Complete
-- ============================================
