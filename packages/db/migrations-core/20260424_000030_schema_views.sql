-- Core schema views (split from baseline)
-- Generated at: 2026-04-24T00:00:06.266Z

-- view: v_active_plugins
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

-- view: v_canvas_nodes
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

-- view: v_plugin_audit_summary
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

-- view: v_plugin_execution_stats
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
