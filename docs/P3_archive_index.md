# P3 官方归档索引
# P3 Official Archive Index

**Project**: AGI Model Factory  
**Phase**: P3 (Phase 3)  
**Seal Date**: 2026-04-13  
**Seal ID**: P3_sealed_20260413_085402

---

## 1. P3 核心文档列表

### 1.1 版本范围文档
| 文档 | 路径 | 说明 |
|------|------|------|
| v5.0.0 Scope Lock | docs/v5.0.0_scope_lock.md | 基线范围 |
| v5.1.0 Scope Lock | docs/v5.1.0_scope_lock.md | 运维下钻范围 |
| v5.2.0 Scope Lock | docs/v5.2.0_scope_lock.md | 根因定位范围 |
| v5.3.0 Scope Lock | docs/v5.3.0_scope_lock.md | 发布治理范围 |
| v5.4.0 Scope Lock | docs/v5.4.0_scope_lock.md | 健康巡检范围 |
| v5.5.0 Scope Lock | docs/v5.5.0_scope_lock.md | 运维收口范围 |

### 1.2 运维文档
| 文档 | 路径 | 说明 |
|------|------|------|
| 安装手册 | docs/install_guide.md | 环境基线、安装步骤 |
| 运维入口 | docs/ops_index.md | Web/API/脚本入口索引 |
| 版本交接 | docs/handover_guide.md | 交接手册 |
| 运维收口映射 | docs/v5.5.0_ops_closure_map.md | 入口映射 |

---

## 2. P3 验收文档列表

| 文档 | 路径 | 说明 |
|------|------|------|
| 验收清单 | docs/P3_acceptance_checklist.md | 33 项验收条目 |
| 就绪矩阵 | docs/P3_readiness_matrix.md | 45 项就绪状态 |
| 演示路径 | docs/P3_demo_path.md | 6 步演示流程 |
| 风险登记 | docs/P3_risk_register.md | 6 个风险条目 |
| 封板前置 | docs/P3_seal_prerequisites.md | 7 项硬门槛 |

---

## 3. P3 封板文档列表

| 文档 | 路径 | 说明 |
|------|------|------|
| 收口报告 | audit/v5.5.0_closure_report.md | v5.5.0 收口总结 |
| 最终封板证明 | audit/P3_final_seal.md | 封板签署文档 |
| 封板审计日志 | audit/P3_seal_audit.md | 封板动作审计 |
| 归档索引 | docs/P3_archive_index.md | 本文档 |

---

## 4. P3 备份产物列表

| 产物 | 路径 | 大小 |
|------|------|------|
| 数据库快照 | E:\AGI_Factory\backups\P3_db_snapshot_20260413_085402.db | 1588 KB |
| 封板包 | E:\AGI_Factory\backups\P3_sealed_20260413_085402.zip | 263 KB |
| 封板清单 | E:\AGI_Factory\backups\P3_seal_manifest_20260413_085402.json | — |
| v5.0.0 基线快照 | E:\AGI_Factory\backups\v5.0.0_db_snapshot_20260413_072638.db | 1588 KB |

---

## 5. P3 常用脚本列表

| 脚本 | 路径 | 用途 |
|------|------|------|
| regression_v500.py | scripts/regression_v500.py | v5.0.0 回归验证（22 tests） |
| recovery_verify.py | scripts/recovery_verify.py | 恢复验证（30 checks） |
| backup.mjs | scripts/backup.mjs | 执行备份 |
| restore.mjs | scripts/restore.mjs | 执行恢复 |

---

## 6. P3 关键入口列表

### 6.1 Web 入口
| 入口 | URL | 说明 |
|------|-----|------|
| Dashboard | http://localhost:3000/ | 系统总览 |
| Factory Status | http://localhost:3000/factory-status | 工厂状态、健康巡检、发布治理 |
| Audit | http://localhost:3000/audit | 审计追踪 |
| Workflow Jobs | http://localhost:3000/workflow-jobs | 任务列表 |
| Artifacts | http://localhost:3000/artifacts | 产物列表 |
| Models | http://localhost:3000/models | 模型列表 |

### 6.2 API 入口
| 端点 | URL | 说明 |
|------|-----|------|
| Health | GET /api/health | API 健康检查 |
| Factory Status | GET /api/factory/status | 工厂状态聚合 |
| Health Patrol | GET /api/health/patrol | 健康巡检聚合 |
| Release Governance | GET /api/release/governance | 发布治理聚合 |
| Audit | GET /api/audit | 审计记录列表 |

---

## 7. P3 版本能力索引

| 版本 | 核心能力 | 说明 |
|------|----------|------|
| v5.0.0 | Gate 治理 | 5 阶段门禁（Evaluation/Artifact/Promotion/Release/Seal） |
| v5.0.0 | 审计追踪 | 全量操作记录、时间线追踪 |
| v5.0.0 | 备份恢复 | DB 快照 + 封板包 + Manifest |
| v5.1.0 | 运维下钻 | Gate 失败下钻、时间线详情 |
| v5.2.0 | 根因定位 | Incident 聚合、Timeline 追踪、Correlation 映射 |
| v5.3.0 | 发布治理 | Stable/Candidate 对比、Rollback Readiness、Release Validation |
| v5.4.0 | 健康巡检 | Overall Status、Verification Summary、Trends、Risk Signals |
| v5.5.0 | 运维收口 | 文档收口、验收包、交接手册、封板证明 |

---

## 8. P3 归档用途

本索引用于：

1. **回看 P3 成果**：快速定位关键文档和产物
2. **恢复 P3 状态**：使用备份产物恢复到封板态
3. **交接 P3 版本**：作为交接资料的主入口
4. **规划 P4**：作为下一阶段规划的参考基线

---

## 9. 归档签署

| 项目 | 值 |
|------|------|
| 项目名称 | AGI Model Factory |
| 阶段 | P3 |
| 封板时间 | 2026-04-13 08:54:02 GMT+8 |
| 归档索引版本 | v1.0 |
| 状态 | **ARCHIVED** |

---

**AGI Model Factory P3 — ARCHIVED** ✅
