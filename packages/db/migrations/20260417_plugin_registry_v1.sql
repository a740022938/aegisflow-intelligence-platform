-- Migration: Plugin Registry V1
-- Phase 0: Manifest / Registry 基础
-- Created: 2026-04-17

-- ============================================
-- 1. 创建 plugin_registry 表
-- ============================================

CREATE TABLE IF NOT EXISTS plugin_registry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- 基础标识
  plugin_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  
  -- Layer 1: 治理必需字段
  category TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'gated', 'trial', 'frozen', 'planned', 'residual')),
  execution_mode TEXT NOT NULL CHECK (execution_mode IN ('readonly', 'side_effect', 'resource_intensive')),
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
  entry TEXT NOT NULL,
  capabilities TEXT NOT NULL,  -- JSON array
  permissions TEXT,  -- JSON array
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  config_schema TEXT,  -- JSON
  enabled INTEGER NOT NULL DEFAULT 1,
  author TEXT,
  description TEXT,
  tags TEXT,  -- JSON array
  
  -- 完整 manifest 备份
  manifest_json TEXT NOT NULL,
  
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
-- 2. 创建 plugin_status_history 表 (状态变更历史)
-- ============================================

CREATE TABLE IF NOT EXISTS plugin_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plugin_id TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  reason TEXT,
  operator TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  
  FOREIGN KEY (plugin_id) REFERENCES plugin_registry(plugin_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_status_history_plugin_id ON plugin_status_history(plugin_id);
CREATE INDEX IF NOT EXISTS idx_status_history_created_at ON plugin_status_history(created_at);

-- ============================================
-- 3. 扩展 audit_logs 表 (plugin 相关字段)
-- ============================================

-- 检查并添加新列（SQLite 不支持 ALTER COLUMN，使用条件添加）

-- plugin_status 字段
ALTER TABLE audit_logs ADD COLUMN plugin_status TEXT;

-- execution_mode 字段
ALTER TABLE audit_logs ADD COLUMN execution_mode TEXT;

-- dry_run 字段
ALTER TABLE audit_logs ADD COLUMN dry_run INTEGER DEFAULT 0;

-- duration_ms 字段
ALTER TABLE audit_logs ADD COLUMN duration_ms INTEGER;

-- approval_id 字段
ALTER TABLE audit_logs ADD COLUMN approval_id TEXT;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_audit_logs_plugin_status ON audit_logs(plugin_status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_dry_run ON audit_logs(dry_run);

-- ============================================
-- 4. 初始化数据：迁移现有插件
-- ============================================

-- 注意：实际数据迁移在后续施工包中执行
-- 这里仅创建占位记录，status=frozen，等待后续填充完整 manifest

-- 标记 temp-* 类残留记录
-- UPDATE plugin_registry SET status = 'residual' WHERE plugin_id LIKE 'temp-%' OR plugin_id LIKE '%-bad-%';

-- ============================================
-- 5. 创建视图：活跃插件列表
-- ============================================

CREATE VIEW IF NOT EXISTS v_active_plugins AS
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

-- ============================================
-- 6. 创建视图：画布节点列表
-- ============================================

CREATE VIEW IF NOT EXISTS v_canvas_nodes AS
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
