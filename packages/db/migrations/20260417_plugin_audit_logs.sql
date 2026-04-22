-- Migration: Plugin Audit Logs Table
-- 施工包 2: 审计入库
-- Created: 2026-04-17

-- ============================================
-- 说明: 为什么单独建 plugin_audit_logs 而不是混用 audit_logs
-- ============================================
-- 1. 职责分离: audit_logs 是通用审计表，plugin_audit_logs 专注插件生命周期
-- 2. 字段差异: 插件审计需要 plugin_id, action, event_type 等专用字段
-- 3. 查询效率: 插件审计查询频繁，独立表避免全表扫描
-- 4. 扩展性: 插件审计字段可独立演进，不影响通用审计表
-- 5. 汇总预留: 通过 trace_id/request_id 可与 audit_logs 关联

-- ============================================
-- plugin_audit_logs 表结构
-- ============================================

CREATE TABLE IF NOT EXISTS plugin_audit_logs (
  -- 主键
  audit_id TEXT PRIMARY KEY,
  
  -- 核心关联
  plugin_id TEXT NOT NULL,
  plugin_name TEXT,
  plugin_version TEXT,
  
  -- 事件分类
  action TEXT NOT NULL,           -- 动作: discover, register, enable, disable, execute, rollback, status_change
  event_type TEXT NOT NULL,       -- 事件类型: lifecycle, execution, gate, system
  
  -- 状态/结果
  status TEXT NOT NULL,           -- 状态: success, failed, blocked, pending, rolled_back
  result_code TEXT,               -- 结果码: 成功/失败的具体代码
  
  -- 执行上下文
  actor TEXT,                     -- 执行者: user_id, system, cron, etc.
  request_id TEXT,                -- 请求追踪 ID，可与 audit_logs 关联
  trace_id TEXT,                  -- 分布式追踪 ID
  session_id TEXT,                -- 会话 ID
  
  -- 输入输出摘要
  input_summary TEXT,             -- 输入参数摘要（脱敏）
  output_summary TEXT,            -- 输出结果摘要（脱敏）
  
  -- 错误信息
  error_type TEXT,                -- 错误类型
  error_message TEXT,             -- 错误消息
  error_stack TEXT,               -- 错误堆栈（可选）
  
  -- 执行环境
  execution_mode TEXT,            -- readonly, side_effect, resource_intensive
  dry_run INTEGER DEFAULT 0,      -- 是否试运行
  plugin_status TEXT,             -- 插件当前状态
  risk_level TEXT,                -- 风险级别
  
  -- 性能指标
  duration_ms INTEGER,            -- 执行耗时
  memory_usage_kb INTEGER,        -- 内存使用
  
  -- 审计元数据
  client_ip TEXT,                 -- 客户端 IP
  user_agent TEXT,                -- 用户代理
  metadata_json TEXT,             -- 扩展元数据（JSON）
  
  -- 时间戳
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================
-- 索引
-- ============================================

CREATE INDEX IF NOT EXISTS idx_plugin_audit_plugin_id ON plugin_audit_logs(plugin_id);
CREATE INDEX IF NOT EXISTS idx_plugin_audit_action ON plugin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_plugin_audit_event_type ON plugin_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_plugin_audit_status ON plugin_audit_logs(status);
CREATE INDEX IF NOT EXISTS idx_plugin_audit_created_at ON plugin_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_plugin_audit_request_id ON plugin_audit_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_plugin_audit_trace_id ON plugin_audit_logs(trace_id);

-- 复合索引：常用查询场景
CREATE INDEX IF NOT EXISTS idx_plugin_audit_plugin_time ON plugin_audit_logs(plugin_id, created_at);
CREATE INDEX IF NOT EXISTS idx_plugin_audit_action_time ON plugin_audit_logs(action, created_at);

-- ============================================
-- 与 audit_logs 汇总预留字段说明
-- ============================================
-- 1. request_id: 与 audit_logs.request_id 关联，实现跨表追踪
-- 2. trace_id: 分布式追踪，可关联到整个请求链路
-- 3. 汇总查询示例:
--    SELECT * FROM audit_logs WHERE request_id = 'xxx'
--    UNION ALL
--    SELECT * FROM plugin_audit_logs WHERE request_id = 'xxx'
--    ORDER BY created_at;

-- ============================================
-- 视图: 插件审计汇总
-- ============================================

CREATE VIEW IF NOT EXISTS v_plugin_audit_summary AS
SELECT 
  plugin_id,
  action,
  event_type,
  status,
  COUNT(*) as count,
  MAX(created_at) as last_occurred,
  AVG(duration_ms) as avg_duration_ms
FROM plugin_audit_logs
GROUP BY plugin_id, action, event_type, status;

-- ============================================
-- 视图: 插件执行统计
-- ============================================

CREATE VIEW IF NOT EXISTS v_plugin_execution_stats AS
SELECT 
  plugin_id,
  COUNT(*) as total_executions,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count,
  SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked_count,
  AVG(CASE WHEN status = 'success' THEN duration_ms END) as avg_success_duration_ms,
  MAX(created_at) as last_execution_at
FROM plugin_audit_logs
WHERE action = 'execute'
GROUP BY plugin_id;

-- ============================================
-- Migration Complete
-- ============================================
