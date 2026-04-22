# AGI Model Factory 版本交接手册

**Version**: 5.5.0  
**Date**: 2026-04-13  
**Status**: P3 收口版

---

## 1. 当前版本能力总览

### 1.1 核心治理能力
| 能力 | 版本 | 说明 |
|------|------|------|
| Gate 治理 | v5.0.0 | 5 阶段门禁（Evaluation/Artifact/Promotion/Release/Seal） |
| 审计追踪 | v5.0.0 | 全量操作记录、时间线追踪 |
| 备份恢复 | v5.0.0 | DB 快照 + 封板包 + Manifest |
| 运维下钻 | v5.1.0 | Gate 失败下钻、时间线详情 |
| 根因定位 | v5.2.0 | Incident 聚合、Timeline 追踪、Correlation 映射 |
| 发布治理 | v5.3.0 | Stable/Candidate 对比、Rollback Readiness、Release Validation |
| 健康巡检 | v5.4.0 | Overall Status、Verification Summary、Trends、Risk Signals |

### 1.2 数据对象
| 对象 | 数量（示例） | 说明 |
|------|-------------|------|
| Models | ~28 | 注册模型 |
| Experiments | ~10 | 实验记录 |
| Datasets | ~3 | 数据集 |
| Evaluations | ~20 | 评估记录 |
| Artifacts | ~20 | 产物记录 |
| Releases | ~5 | 发布记录 |
| Workflow Jobs | ~50+ | 工作流任务 |

---

## 2. 关键入口索引

### 2.1 Web 入口
| 入口 | URL |
|------|-----|
| Dashboard | http://localhost:3000/ |
| Factory Status | http://localhost:3000/factory-status |
| Audit | http://localhost:3000/audit |
| Workflow Jobs | http://localhost:3000/workflow-jobs |
| Artifacts | http://localhost:3000/artifacts |
| Models | http://localhost:3000/models |

### 2.2 API 入口
| 端点 | URL |
|------|-----|
| Health | GET /api/health |
| Factory Status | GET /api/factory/status |
| Health Patrol | GET /api/health/patrol |
| Release Governance | GET /api/release/governance |
| Audit | GET /api/audit |

---

## 3. 文档索引

### 3.1 运维文档
- `docs/install_guide.md` — 安装手册
- `docs/ops_index.md` — 运维入口索引
- `docs/handover_guide.md` — 本文档

### 3.2 版本文档
- `docs/v5.0.0_*.md` — 基线文档
- `docs/v5.1.0_*.md` — 运维下钻文档
- `docs/v5.2.0_*.md` — 根因定位文档
- `docs/v5.3.0_*.md` — 发布治理文档
- `docs/v5.4.0_*.md` — 健康巡检文档
- `docs/v5.5.0_*.md` — 运维收口文档

### 3.3 验收文档
- `docs/P3_acceptance_checklist.md`
- `docs/P3_readiness_matrix.md`
- `docs/P3_demo_path.md`
- `docs/P3_risk_register.md`
- `docs/P3_seal_prerequisites.md`

---

## 4. 脚本索引

| 脚本 | 用途 |
|------|------|
| `scripts/regression_v500.py` | 回归验证（22 tests） |
| `scripts/recovery_verify.py` | 恢复验证（30 checks） |
| `scripts/backup.mjs` | 执行备份 |
| `scripts/restore.mjs` | 执行恢复 |

---

## 5. 备份位置与恢复方式

### 5.1 备份目录
```
E:\AGI_Factory\backups\
├── v5.0.0_db_snapshot_20260413_072638.db
├── v5.0.0_sealed_20260413_072638.zip
└── v5.0.0_seal_manifest_20260413_072638.json
```

### 5.2 恢复方式
```powershell
# 从 DB 快照恢复
node scripts/restore.mjs --backup v5.0.0_db_snapshot_20260413_072638.db

# 验证恢复
python scripts/recovery_verify.py --drill
```

---

## 6. 回归方式

```powershell
# 运行回归测试
python scripts/regression_v500.py

# 期望输出
# [PASS] 22/22 tests passed
```

---

## 7. 后续 OpenClaw 接入前置条件

1. OpenClaw Gateway 已部署运行
2. 配置 `gatewayUrl` 和 `gatewayToken`
3. 可选：配置 Node 设备配对
4. 可选：配置消息通道（Telegram/Discord/Signal）

---

## 8. 交接清单

| 项目 | 状态 | 说明 |
|------|------|------|
| 代码仓库 | ✅ | 已提交 master |
| 运维文档 | ✅ | docs/ 目录 |
| 验收文档 | ✅ | P3_*.md |
| 备份产物 | ✅ | backups/ 目录 |
| 回归脚本 | ✅ | scripts/ 目录 |
| 封板前置条件 | ✅ | P3_seal_prerequisites.md |

---

**AGI Model Factory v5.5.0 — 交接完成**
