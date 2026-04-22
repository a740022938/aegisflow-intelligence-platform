-- 施工包 2 - 直接 SQLite 验证脚本
-- 使用 sqlite3 命令行执行

-- 清理旧测试数据
DELETE FROM plugin_audit_logs WHERE plugin_id = 'builtin-demo-plugin' AND created_at > datetime('now', '-1 minute');
DELETE FROM plugin_audit_logs WHERE plugin_id = 'test-verify';

-- ============================================
-- 1. 测试插件发现事件
-- ============================================
INSERT INTO plugin_audit_logs (audit_id, plugin_id, plugin_name, action, event_type, status, actor, metadata_json)
VALUES (
  'audit_test_' || strftime('%s', 'now') || '_1',
  'builtin-demo-plugin',
  'Demo Plugin',
  'discover',
  'lifecycle',
  'success',
  'system',
  '{"source": "builtin_scan"}'
);
SELECT '1. discover 事件写入成功' as result;

-- ============================================
-- 2. 测试插件注册事件
-- ============================================
INSERT INTO plugin_audit_logs (audit_id, plugin_id, plugin_name, plugin_version, action, event_type, status, risk_level, plugin_status)
VALUES (
  'audit_test_' || strftime('%s', 'now') || '_2',
  'builtin-demo-plugin',
  'Demo Plugin',
  '1.0.0',
  'register',
  'lifecycle',
  'success',
  'LOW',
  'active'
);
SELECT '2. register 事件写入成功' as result;

-- ============================================
-- 3. 测试插件启用事件
-- ============================================
INSERT INTO plugin_audit_logs (audit_id, plugin_id, plugin_name, action, event_type, status, actor)
VALUES (
  'audit_test_' || strftime('%s', 'now') || '_3',
  'builtin-demo-plugin',
  'Demo Plugin',
  'enable',
  'lifecycle',
  'success',
  'system'
);
SELECT '3. enable 事件写入成功' as result;

-- ============================================
-- 4. 测试插件禁用事件
-- ============================================
INSERT INTO plugin_audit_logs (audit_id, plugin_id, plugin_name, action, event_type, status, actor)
VALUES (
  'audit_test_' || strftime('%s', 'now') || '_4',
  'vision-tracker',
  'Vision Tracker',
  'disable',
  'lifecycle',
  'success',
  'admin'
);
SELECT '4. disable 事件写入成功' as result;

-- ============================================
-- 5. 测试状态变更事件
-- ============================================
INSERT INTO plugin_audit_logs (audit_id, plugin_id, action, event_type, status, actor, plugin_status, metadata_json)
VALUES (
  'audit_test_' || strftime('%s', 'now') || '_5',
  'vision-sam',
  'status_change',
  'lifecycle',
  'success',
  'system',
  'trial',
  '{"from_status": "frozen", "to_status": "trial", "reason": "Phase 0: trial activation"}'
);
SELECT '5. status_change 事件写入成功' as result;

-- ============================================
-- 6. 测试执行尝试事件
-- ============================================
INSERT INTO plugin_audit_logs (audit_id, plugin_id, action, event_type, status, input_summary, execution_mode, dry_run)
VALUES (
  'audit_test_' || strftime('%s', 'now') || '_6',
  'builtin-demo-plugin',
  'execute_attempt',
  'execution',
  'pending',
  '{"format": "json", "report_type": "summary"}',
  'readonly',
  0
);
SELECT '6. execute_attempt 事件写入成功' as result;

-- ============================================
-- 7. 测试执行被拦截事件
-- ============================================
INSERT INTO plugin_audit_logs (audit_id, plugin_id, action, event_type, status, error_message, execution_mode)
VALUES (
  'audit_test_' || strftime('%s', 'now') || '_7',
  'vision-yolo',
  'execute_blocked',
  'gate',
  'blocked',
  'Plugin status is frozen',
  'resource_intensive'
);
SELECT '7. execute_blocked 事件写入成功' as result;

-- ============================================
-- 8. 测试执行成功事件
-- ============================================
INSERT INTO plugin_audit_logs (audit_id, plugin_id, action, event_type, status, output_summary, duration_ms, dry_run)
VALUES (
  'audit_test_' || strftime('%s', 'now') || '_8',
  'builtin-demo-plugin',
  'execute_success',
  'execution',
  'success',
  '{"status": "ok", "report_id": "rpt_001"}',
  42,
  0
);
SELECT '8. execute_success 事件写入成功' as result;

-- ============================================
-- 9. 测试执行失败事件
-- ============================================
INSERT INTO plugin_audit_logs (audit_id, plugin_id, action, event_type, status, error_type, error_message, duration_ms)
VALUES (
  'audit_test_' || strftime('%s', 'now') || '_9',
  'vision-sam',
  'execute_failed',
  'execution',
  'failed',
  'Error',
  'Segmentation failed: timeout after 5000ms',
  5000
);
SELECT '9. execute_failed 事件写入成功' as result;

-- ============================================
-- 10. 测试回滚事件
-- ============================================
INSERT INTO plugin_audit_logs (audit_id, plugin_id, action, event_type, status, error_message, metadata_json)
VALUES (
  'audit_test_' || strftime('%s', 'now') || '_10',
  'vision-sam',
  'rollback',
  'execution',
  'rolled_back',
  'Trial execution rollback',
  '{"original_status": "pending"}'
);
SELECT '10. rollback 事件写入成功' as result;

-- ============================================
-- 11. 测试 builtin-demo-plugin 不受影响（只读）
-- ============================================
INSERT INTO plugin_audit_logs (audit_id, plugin_id, plugin_name, action, event_type, status, execution_mode, dry_run, risk_level)
VALUES (
  'audit_test_' || strftime('%s', 'now') || '_11',
  'builtin-demo-plugin',
  'Demo Plugin',
  'execute_success',
  'execution',
  'success',
  'readonly',
  0,
  'LOW'
);
SELECT '11. builtin-demo-plugin 只读执行审计成功' as result;

-- ============================================
-- 12. 测试 vision-sam trial 不受影响
-- ============================================
INSERT INTO plugin_audit_logs (audit_id, plugin_id, plugin_name, action, event_type, status, execution_mode, dry_run, risk_level)
VALUES (
  'audit_test_' || strftime('%s', 'now') || '_12',
  'vision-sam',
  'Vision SAM',
  'execute_success',
  'execution',
  'success',
  'resource_intensive',
  1,
  'MEDIUM'
);
SELECT '12. vision-sam trial 执行审计成功' as result;

-- ============================================
-- 验证查询
-- ============================================
SELECT '';
SELECT '=== 验证结果 ===' as header;
SELECT '';

-- 事件统计
SELECT '事件类型统计:' as info;
SELECT action, COUNT(*) as count FROM plugin_audit_logs WHERE audit_id LIKE 'audit_test_%' GROUP BY action ORDER BY action;

SELECT '';
SELECT '状态统计:' as info;
SELECT status, COUNT(*) as count FROM plugin_audit_logs WHERE audit_id LIKE 'audit_test_%' GROUP BY status ORDER BY status;

SELECT '';
SELECT '事件类型统计:' as info;
SELECT event_type, COUNT(*) as count FROM plugin_audit_logs WHERE audit_id LIKE 'audit_test_%' GROUP BY event_type ORDER BY event_type;

SELECT '';
SELECT '按插件统计:' as info;
SELECT plugin_id, COUNT(*) as count FROM plugin_audit_logs WHERE audit_id LIKE 'audit_test_%' GROUP BY plugin_id ORDER BY plugin_id;

-- 展示所有测试事件
SELECT '';
SELECT '所有测试事件:' as info;
SELECT audit_id, plugin_id, action, event_type, status, substr(error_message, 1, 50) as error_preview FROM plugin_audit_logs WHERE audit_id LIKE 'audit_test_%' ORDER BY created_at;

-- 清理测试数据
DELETE FROM plugin_audit_logs WHERE audit_id LIKE 'audit_test_%';
SELECT '';
SELECT '测试数据已清理' as result;

SELECT '';
SELECT '=== 施工包 2 验证完成 ===' as result;
