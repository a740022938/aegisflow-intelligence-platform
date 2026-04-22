# AGI Model Factory 运维入口索引

**Version**: 5.5.0  
**Date**: 2026-04-13

---

## 1. 快速入口

### 1.1 Web 界面入口
| 名称 | URL | 用途 |
|------|-----|------|
| **Dashboard** | http://localhost:3000/ | 系统总览、关键指标 |
| **Factory Status** | http://localhost:3000/factory-status | 工厂运行态、健康巡检、发布治理 |
| **Audit** | http://localhost:3000/audit | 审计追踪、操作历史 |
| **Workflow Jobs** | http://localhost:3000/workflow-jobs | 任务列表、执行状态 |
| **Artifacts** | http://localhost:3000/artifacts | 产物列表、发布候选 |
| **Models** | http://localhost:3000/models | 模型列表、版本管理 |
| **Datasets** | http://localhost:3000/datasets | 数据集列表 |

### 1.2 API 健康检查
```powershell
curl http://localhost:8787/api/health
# 期望返回: {"ok":true,"status":"healthy"}
```

---

## 2. 核心运维功能

### 2.1 工厂状态监控
- **入口**: Factory Status 页面
- **功能**:
  - 查看当前系统整体状态
  - 查看健康巡检结果
  - 查看发布治理状态
  - 查看备份恢复状态
  - 查看活跃问题

### 2.2 健康巡检
- **入口**: Factory Status → 健康巡检区块
- **功能**:
  - 查看整体健康状态（healthy/caution/warning/blocked）
  - 查看验证摘要
  - 查看趋势统计
  - 查看风险信号

### 2.3 发布治理
- **入口**: Factory Status → 发布治理区块
- **功能**:
  - 查看当前稳定版
  - 查看当前候选版
  - 查看回滚就绪状态
  - 查看最近发布记录
  - 查看恢复演练记录

### 2.4 审计追踪
- **入口**: Audit 页面
- **功能**:
  - 查看所有操作记录
  - 按类别/时间过滤
  - 追踪问题根因

### 2.5 任务管理
- **入口**: Workflow Jobs 页面
- **功能**:
  - 查看任务执行状态
  - 重试失败任务
  - 查看任务详情

---

## 3. 备份恢复操作

### 3.1 执行备份
```powershell
cd E:\AGI_Factory\repo
node scripts/backup.mjs
```

**产物位置**: `E:\AGI_Factory\backups\`

### 3.2 执行恢复
```powershell
cd E:\AGI_Factory\repo
node scripts/restore.mjs --backup <backup_file.db>
```

### 3.3 恢复验证
```powershell
python scripts/recovery_verify.py --drill
```

---

## 4. 验证与回归

### 4.1 回归测试
```powershell
python scripts/regression_v500.py
# 期望: 22/22 tests passed
```

### 4.2 恢复演练
```powershell
python scripts/recovery_verify.py --drill
# 期望: 30/30 checks passed
```

---

## 5. 文档索引

### 5.1 安装运维文档
| 文档 | 路径 |
|------|------|
| 安装手册 | `docs/install_guide.md` |
| 运维入口 | `docs/ops_index.md`（本文档） |
| 版本交接 | `docs/handover_guide.md` |

### 5.2 版本文档
| 版本 | 文档前缀 |
|------|----------|
| v5.0.0 | `docs/v5.0.0_*.md` |
| v5.1.0 | `docs/v5.1.0_*.md` |
| v5.2.0 | `docs/v5.2.0_*.md` |
| v5.3.0 | `docs/v5.3.0_*.md` |
| v5.4.0 | `docs/v5.4.0_*.md` |
| v5.5.0 | `docs/v5.5.0_*.md` |

### 5.3 验收文档
| 文档 | 路径 |
|------|------|
| 验收清单 | `docs/P3_acceptance_checklist.md` |
| 就绪矩阵 | `docs/P3_readiness_matrix.md` |
| 演示路径 | `docs/P3_demo_path.md` |
| 风险登记 | `docs/P3_risk_register.md` |
| 封板前置 | `docs/P3_seal_prerequisites.md` |

---

## 6. 故障排查入口

| 问题类型 | 查看入口 |
|----------|----------|
| 任务失败 | Workflow Jobs 页面 |
| 健康异常 | Factory Status → 健康巡检 |
| 发布阻塞 | Factory Status → 发布治理 |
| 数据问题 | Audit 页面 → 按时间过滤 |
| 备份恢复 | `E:\AGI_Factory\backups\` 目录 |

---

## 7. 快速命令参考

```powershell
# 启动 API
cd E:\AGI_Factory\repo\apps\local-api && npx tsx src/index.ts

# 启动 UI
cd E:\AGI_Factory\repo\apps\web-ui && npx vite --port 3000

# 健康检查
curl http://localhost:8787/api/health

# 回归测试
python scripts/regression_v500.py

# 备份
node scripts/backup.mjs

# 恢复演练
python scripts/recovery_verify.py --drill
```
