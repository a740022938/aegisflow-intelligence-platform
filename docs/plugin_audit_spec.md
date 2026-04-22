# Plugin Audit Specification — 插件审计规范

**Project**: AGI Model Factory  
**Version**: 6.0.0  
**Date**: 2026-04-13

---

## 1. 审计概述

Plugin System 审计模块负责记录所有插件相关操作，确保插件行为可追溯、可审计。

---

## 2. 审计事件类型

| 事件类型 | 说明 | 触发时机 |
|----------|------|----------|
| PLUGIN_REGISTERED | 插件注册 | 新插件成功注册 |
| PLUGIN_LOADED | 插件加载 | 内置插件从文件系统加载 |
| PLUGIN_ENABLED | 插件启用 | 插件从禁用转为启用 |
| PLUGIN_DISABLED | 插件禁用 | 插件从启用转为禁用 |
| PLUGIN_EXECUTED | 插件执行 | 插件动作成功执行 |
| PLUGIN_FAILED | 插件失败 | 插件动作执行失败 |
| PLUGIN_UNLOADED | 插件卸载 | 插件从内存卸载 |

---

## 3. 审计字段定义

### 3.1 基础字段
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| category | TEXT | 类别，固定为 'plugin' |
| action | TEXT | 动作类型 |
| target | TEXT | 目标（plugin_id） |
| result | TEXT | 结果：success / error |
| detail_json | TEXT | 详情（JSON 格式） |
| created_at | TEXT | 创建时间（ISO 8601） |

### 3.2 事件详情字段

**PLUGIN_REGISTERED**
```json
{
  "plugin_name": "Demo Plugin",
  "version": "1.0.0",
  "risk_level": "LOW",
  "capabilities": ["report", "read"],
  "permissions": ["read:datasets", "read:models"]
}
```

**PLUGIN_ENABLED / PLUGIN_DISABLED**
```json
{
  "plugin_name": "Demo Plugin",
  "previous_state": true,
  "new_state": false
}
```

**PLUGIN_EXECUTED**
```json
{
  "action": "generate_report",
  "params": { "format": "summary" },
  "duration_ms": 42,
  "result_preview": "..."
}
```

**PLUGIN_FAILED**
```json
{
  "action": "generate_report",
  "error": "Plugin not found",
  "error_code": "PLUGIN_NOT_FOUND"
}
```

---

## 4. 审计表结构

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  result TEXT,
  detail_json TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 插件审计索引
CREATE INDEX IF NOT EXISTS idx_audit_plugin_category ON audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_audit_plugin_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_plugin_target ON audit_logs(target);
CREATE INDEX IF NOT EXISTS idx_audit_plugin_created ON audit_logs(created_at);
```

---

## 5. 风险级别与审计

| 风险级别 | 默认状态 | 审计要求 |
|----------|----------|----------|
| LOW | 启用 | 基础审计 |
| MEDIUM | 启用 | 详细审计 |
| HIGH | 禁用 | 强化审计（每次操作） |
| CRITICAL | 禁用 | 强化审计（每次操作+确认） |

---

## 6. 审计保留策略

| 事件类型 | 保留期限 |
|----------|----------|
| PLUGIN_EXECUTED | 30 天 |
| PLUGIN_FAILED | 90 天 |
| PLUGIN_REGISTERED | 永久 |
| PLUGIN_ENABLED / PLUGIN_DISABLED | 永久 |

---

## 7. 审计查询示例

### 7.1 查看所有插件操作
```sql
SELECT * FROM audit_logs 
WHERE category = 'plugin' 
ORDER BY created_at DESC;
```

### 7.2 查看指定插件的操作历史
```sql
SELECT * FROM audit_logs 
WHERE target = 'builtin-demo-plugin' 
ORDER BY created_at DESC;
```

### 7.3 查看插件执行失败记录
```sql
SELECT * FROM audit_logs 
WHERE category = 'plugin' 
  AND action = 'PLUGIN_FAILED' 
ORDER BY created_at DESC;
```

### 7.4 统计插件执行次数
```sql
SELECT 
  target as plugin_id,
  COUNT(*) as execution_count,
  MAX(created_at) as last_executed
FROM audit_logs 
WHERE action = 'PLUGIN_EXECUTED' 
GROUP BY target;
```

---

## 8. 审计日志格式

```
[2026-04-13T08:54:02.123Z] [Audit] plugin/PLUGIN_REGISTERED builtin-demo-plugin -> success {"plugin_name":"Demo Plugin","version":"1.0.0","risk_level":"LOW"}
[2026-04-13T08:54:03.456Z] [Audit] plugin/PLUGIN_EXECUTED builtin-demo-plugin -> success {"action":"generate_report","duration_ms":42}
[2026-04-13T08:54:04.789Z] [Audit] plugin/PLUGIN_FAILED builtin-demo-plugin -> error {"action":"unknown_action","error":"Unknown action"}
```

---

## 9. 集成说明

### 9.1 Console 审计（开发环境）
```typescript
const auditLogger: AuditLogger = {
  async log(category, action, target, result, detail) {
    console.log(`[Audit] ${category}/${action} ${target} -> ${result}`, detail);
  },
};
```

### 9.2 数据库审计（生产环境）
```typescript
const auditLogger: AuditLogger = {
  async log(category, action, target, result, detail) {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO audit_logs (category, action, target, result, detail_json)
      VALUES (?, ?, ?, ?, ?)
    `).run(category, action, target, result, JSON.stringify(detail));
  },
};
```

---

## 10. 审计合规性

- ✅ 所有插件操作均留痕
- ✅ 审计日志不可篡改
- ✅ 支持事后追溯
- ✅ 支持定期清理过期日志
