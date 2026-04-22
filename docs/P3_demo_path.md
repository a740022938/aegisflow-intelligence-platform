# P3 演示路径

**Project**: AGI Model Factory  
**Version**: 5.5.0  
**Date**: 2026-04-13

---

## 演示路径说明

本演示路径用于验证 AGI Model Factory v5.5.0 的核心能力，涵盖治理、审计、备份恢复、健康巡检等关键功能。

---

## 演示步骤

### 步骤 1：系统健康检查
**目的**: 验证系统整体运行状态

**操作**:
1. 打开浏览器，访问 http://localhost:3000/factory-status
2. 查看顶部"健康巡检"区块
3. 确认整体状态显示（healthy/caution/warning/blocked）

**预期结果**:
- 页面正常加载
- 健康状态徽章可见
- 验证摘要显示正确

---

### 步骤 2：发布治理查看
**目的**: 验证发布治理能力

**操作**:
1. 在 Factory Status 页面，滚动到"发布治理"区块
2. 查看当前稳定版信息
3. 查看回滚就绪状态

**预期结果**:
- 稳定版版本号显示
- 备份验证状态显示
- 回滚就绪状态徽章显示

---

### 步骤 3：审计追踪验证
**目的**: 验证审计记录能力

**操作**:
1. 访问 http://localhost:3000/audit
2. 查看操作记录列表
3. 使用类别过滤器（选择 release）
4. 点击一条记录查看详情

**预期结果**:
- 记录列表显示
- 过滤功能正常
- 详情可查看

---

### 步骤 4：回归验证
**目的**: 验证系统基线能力

**操作**:
```powershell
cd E:\AGI_Factory\repo
python scripts/regression_v500.py
```

**预期结果**:
```
[PASS] 22/22 tests passed
```

---

### 步骤 5：备份恢复演练
**目的**: 验证备份恢复能力

**操作**:
```powershell
# 执行备份
node scripts/backup.mjs

# 验证恢复
python scripts/recovery_verify.py --drill
```

**预期结果**:
- 备份产物生成
- 恢复验证通过

---

### 步骤 6：健康 API 验证
**目的**: 验证健康巡检 API

**操作**:
```powershell
curl http://localhost:8787/api/health/patrol
```

**预期结果**:
```json
{
  "ok": true,
  "overall_status": "healthy|caution|warning|blocked",
  "risks": [...]
}
```

---

## 演示验收标准

| 步骤 | 验收标准 | 通过 |
|------|----------|------|
| 1 | 健康状态显示正确 | ✅ |
| 2 | 发布治理信息正确 | ✅ |
| 3 | 审计记录可追踪 | ✅ |
| 4 | 回归测试通过 | ✅ |
| 5 | 备份恢复成功 | ✅ |
| 6 | API 返回正确 | ✅ |

---

**演示结论**: ✅ PASS — 全部演示步骤通过
