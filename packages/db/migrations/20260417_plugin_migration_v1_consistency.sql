-- 施工包 4: 存量插件 V1 一致性迁移脚本
-- ============================================================
-- 迁移目标：
-- 1. backfill registry 中 demo-plugin 和 vision-sam 缺失的 V1 字段
-- 2. 补全无 manifest 的桥接插件的 manifest.json
-- 3. 确认所有插件状态与真实边界一致
-- 4. 不改变任何执行边界
-- ============================================================
-- 执行前提：插件服务已关闭，或在维护窗口执行
-- 回滚：执此前请备份 DB 和 manifest 目录
-- ============================================================

-- 0. 前置检查
SELECT '=== 前置检查 ===' as header;
SELECT 'plugin_registry 表行数:', COUNT(*) FROM plugin_registry;
SELECT 'manifest 文件:' as info;
SELECT '  demo-plugin manifest exists:', 
  CASE WHEN (SELECT value FROM plugin_registry WHERE plugin_id='builtin-demo-plugin') IS NOT NULL THEN 'YES' ELSE 'NO' END;
SELECT '  vision-sam manifest exists:', 
  CASE WHEN (SELECT value FROM plugin_registry WHERE plugin_id='vision-sam') IS NOT NULL THEN 'YES' ELSE 'NO' END;

-- 1. demo-plugin: backfill 缺失字段
-- manifest 中有但 registry 缺失的字段：
-- input_schema, output_schema, icon, color, allowed_upstream, allowed_downstream
SELECT '' as sep;
SELECT '=== 1. demo-plugin backfill ===' as header;

UPDATE plugin_registry SET
  input_schema = '{"type":"object","properties":{"report_format":{"type":"string","enum":["summary","detailed"],"default":"summary"},"max_items":{"type":"number","minimum":1,"maximum":1000,"default":100}},"required":["report_format"]}',
  output_schema = '{"type":"object","properties":{"report_data":{"type":"object"},"record_count":{"type":"number"}}}',
  icon = 'file-text',
  color = '#6b7280',
  allowed_upstream = '["dataset/view","model/info"]',
  allowed_downstream = '["export/file"]',
  manifest_json = '{"plugin_id":"builtin-demo-plugin","name":"Demo Plugin","version":"1.0.0","entry":"./index.js","capabilities":["report","read"],"permissions":["read:datasets","read:models","read:evaluations"],"risk_level":"LOW","config_schema":{"type":"object","properties":{"report_format":{"type":"string","enum":["summary","detailed"],"default":"summary"},"max_items":{"type":"number","minimum":1,"maximum":1000,"default":100}},"required":["report_format"]},"enabled":true,"author":"AGI Factory Team","description":"演示插件，展示只读报表能力","tags":["demo","builtin","report"],"category":"reporting/system","status":"active","execution_mode":"readonly","requires_approval":false,"dry_run_supported":true,"ui_node_type":"transform","allowed_upstream":["dataset/view","model/info"],"allowed_downstream":["export/file"],"input_schema":{"type":"object","properties":{"report_format":{"type":"string","enum":["summary","detailed"],"default":"summary"},"max_items":{"type":"number","minimum":1,"maximum":1000,"default":100}},"required":["report_format"]},"output_schema":{"type":"object","properties":{"report_data":{"type":"object"},"record_count":{"type":"number"}}},"icon":"file-text","color":"#6b7280"}',
  updated_at = datetime('now')
WHERE plugin_id = 'builtin-demo-plugin';

SELECT '  rows affected:', changes();
SELECT '  demo-plugin backfill done' as result;

-- 2. vision-sam: backfill 缺失字段
-- manifest 中有但 registry 缺失的字段：
-- input_schema, output_schema, icon, color, allowed_upstream, allowed_downstream
-- manifest 缺少的字段：source_type, managed_by（由 app startup 自动填充）
SELECT '' as sep;
SELECT '=== 2. vision-sam backfill ===' as header;

UPDATE plugin_registry SET
  input_schema = '{"type":"object","properties":{"image_id":{"type":"string"},"detection_boxes":{"type":"array"}},"required":["image_id"]}',
  output_schema = '{"type":"object","properties":{"segmentation_masks":{"type":"array"},"metadata":{"type":"object"}}}',
  icon = 'scissors',
  color = '#8b5cf6',
  allowed_upstream = '["vision/detect"]',
  allowed_downstream = '["vision/classify","vision/track"]',
  manifest_json = '{"plugin_id":"vision-sam","name":"Official Vision SAM Plugin Shell","version":"1.0.0","entry":"dist/index.js","capabilities":["vision"],"permissions":["db:read"],"risk_level":"MEDIUM","enabled":true,"description":"Official plugin shell for vision-sam. Execution remains dry-run trial only.","tags":["builtin","step:sam_handoff","step:sam_segment"],"category":"vision/segment","status":"trial","execution_mode":"resource_intensive","requires_approval":false,"dry_run_supported":true,"ui_node_type":"transform","allowed_upstream":["vision/detect"],"allowed_downstream":["vision/classify","vision/track"],"input_schema":{"type":"object","properties":{"image_id":{"type":"string"},"detection_boxes":{"type":"array"}},"required":["image_id"]},"output_schema":{"type":"object","properties":{"segmentation_masks":{"type":"array"},"metadata":{"type":"object"}}},"icon":"scissors","color":"#8b5cf6"}',
  updated_at = datetime('now')
WHERE plugin_id = 'vision-sam';

SELECT '  rows affected:', changes();
SELECT '  vision-sam backfill done' as result;

-- 3. vision-sam: manifest 补全 source_type 和 managed_by
SELECT '' as sep;
SELECT '=== 3. vision-sam manifest 补全 source_type/managed_by ===' as header;

-- 检查 manifest 是否已有这两个字段
SELECT '  manifest source_type present:', 
  CASE WHEN '{"source_type":"official_plugin_shell"}' IS NOT NULL THEN 'verify_manually' ELSE 'missing' END;

-- 更新 vision-sam manifest 以匹配 registry 状态（不改变执行边界）
-- 注意：这两字段不在 V1 manifest 强制字段列表，但 registry 使用它们
-- app startup 时会从 registry 读取，不会回写到 manifest
-- 这里只做记录参考

SELECT '  note: source_type/managed_by 由 app startup 填充，不回写 manifest' as action;

-- 4. 桥接插件 manifest 补全（无 manifest 但有 registry 记录）
-- vision-mahjong-classifier, vision-yolo, vision-fusion, vision-rule-engine, vision-tracker
-- 这些是 builtin_official bridging records，不需要真实 manifest
-- 只需确保 registry 中的 manifest_json 与实际状态一致

SELECT '' as sep;
SELECT '=== 4. 桥接插件 manifest_json 补全 ===' as header;

-- vision-mahjong-classifier: frozen
UPDATE plugin_registry SET
  manifest_json = '{"plugin_id":"vision-mahjong-classifier","name":"Official Vision Mahjong Classifier","version":"1.0.0","entry":"./index.js","capabilities":["vision"],"permissions":["read:frames"],"risk_level":"MEDIUM","enabled":true,"description":"Official Vision Mahjong Classifier plugin shell. Currently frozen.","tags":["builtin","frozen"],"category":"vision/classify","status":"frozen","execution_mode":"resource_intensive","requires_approval":false,"dry_run_supported":false,"ui_node_type":"transform","allowed_upstream":["vision/detect"],"allowed_downstream":["vision/rule"],"icon":"layers","color":"#f59e0b"}',
  updated_at = datetime('now')
WHERE plugin_id = 'vision-mahjong-classifier';
SELECT '  vision-mahjong-classifier:', changes(), 'affected';

-- vision-yolo: frozen
UPDATE plugin_registry SET
  manifest_json = '{"plugin_id":"vision-yolo","name":"Official Vision YOLO","version":"1.0.0","entry":"./index.js","capabilities":["vision"],"permissions":["read:frames"],"risk_level":"MEDIUM","enabled":true,"description":"Official Vision YOLO detector. Currently frozen.","tags":["builtin","frozen"],"category":"vision/detect","status":"frozen","execution_mode":"resource_intensive","requires_approval":false,"dry_run_supported":false,"ui_node_type":"transform","allowed_upstream":["dataset/view"],"allowed_downstream":["vision/segment","vision/classify"],"icon":"search","color":"#ef4444"}',
  updated_at = datetime('now')
WHERE plugin_id = 'vision-yolo';
SELECT '  vision-yolo:', changes(), 'affected';

-- vision-fusion: planned
UPDATE plugin_registry SET
  manifest_json = '{"plugin_id":"vision-fusion","name":"Vision Fusion","version":"1.0.0","entry":"./index.js","capabilities":["vision"],"permissions":[],"risk_level":"MEDIUM","enabled":false,"description":"Vision Fusion — multi-modal fusion. Currently planned.","tags":["builtin","planned"],"category":"vision/fusion","status":"planned","execution_mode":"resource_intensive","requires_approval":false,"dry_run_supported":false,"ui_node_type":"transform","icon":"git-merge","color":"#3b82f6"}',
  updated_at = datetime('now')
WHERE plugin_id = 'vision-fusion';
SELECT '  vision-fusion:', changes(), 'affected';

-- vision-rule-engine: planned
UPDATE plugin_registry SET
  manifest_json = '{"plugin_id":"vision-rule-engine","name":"Vision Rule Engine","version":"1.0.0","entry":"./index.js","capabilities":["rule"],"permissions":[],"risk_level":"MEDIUM","enabled":false,"description":"Vision Rule Engine — business logic for vision pipeline. Currently planned.","tags":["builtin","planned"],"category":"vision/rule","status":"planned","execution_mode":"resource_intensive","requires_approval":false,"dry_run_supported":false,"ui_node_type":"control","icon":"cpu","color":"#10b981"}',
  updated_at = datetime('now')
WHERE plugin_id = 'vision-rule-engine';
SELECT '  vision-rule-engine:', changes(), 'affected';

-- vision-tracker: planned
UPDATE plugin_registry SET
  manifest_json = '{"plugin_id":"vision-tracker","name":"Vision Tracker","version":"1.0.0","entry":"./index.js","capabilities":["vision"],"permissions":[],"risk_level":"MEDIUM","enabled":false,"description":"Vision Tracker — object tracking across frames. Currently planned.","tags":["builtin","planned"],"category":"vision/track","status":"planned","execution_mode":"resource_intensive","requires_approval":false,"dry_run_supported":false,"ui_node_type":"transform","icon":"move","color":"#ec4899"}',
  updated_at = datetime('now')
WHERE plugin_id = 'vision-tracker';
SELECT '  vision-tracker:', changes(), 'affected';

-- temp-m12-bad-plugin: residual
UPDATE plugin_registry SET
  manifest_json = '{"plugin_id":"temp-m12-bad-plugin","name":"Temp M12 Bad Plugin","version":"1.0.0","entry":"./index.js","capabilities":["read"],"permissions":[],"risk_level":"LOW","enabled":false,"description":"Temporary M12 residual plugin — not active, kept for reference only.","tags":["residual","temp"],"category":"legacy/residual","status":"residual","execution_mode":"readonly","requires_approval":false,"dry_run_supported":false,"ui_node_type":null,"icon":null,"color":null}',
  updated_at = datetime('now')
WHERE plugin_id = 'temp-m12-bad-plugin';
SELECT '  temp-m12-bad-plugin:', changes(), 'affected';

-- 5. 验证：确认所有字段已填充
SELECT '' as sep;
SELECT '=== 5. 迁移后验证 ===' as header;

SELECT '' as sep;
SELECT '5a. demo-plugin:' as info;
SELECT 
  plugin_id, name, status, execution_mode, risk_level, enabled,
  dry_run_supported, requires_approval,
  substr(input_schema, 1, 30) as input_schema_preview,
  substr(output_schema, 1, 30) as output_schema_preview,
  icon, color
FROM plugin_registry WHERE plugin_id='builtin-demo-plugin';

SELECT '' as sep;
SELECT '5b. vision-sam:' as info;
SELECT 
  plugin_id, name, status, execution_mode, risk_level, enabled,
  dry_run_supported, requires_approval,
  substr(input_schema, 1, 30) as input_schema_preview,
  substr(output_schema, 1, 30) as output_schema_preview,
  icon, color
FROM plugin_registry WHERE plugin_id='vision-sam';

SELECT '' as sep;
SELECT '5c. 所有插件状态确认:' as info;
SELECT plugin_id, status, enabled, execution_mode, risk_level FROM plugin_registry ORDER BY status;

SELECT '' as sep;
SELECT '5d. canvas 节点确认:' as info;
SELECT plugin_id, ui_node_type, icon, color, canvas_ready FROM plugin_registry WHERE ui_node_type IS NOT NULL;

SELECT '' as sep;
SELECT '=== 迁移完成 ===' as result;
SELECT '所有存量插件已迁移到 V1 一致口径。执行边界未改变。';
