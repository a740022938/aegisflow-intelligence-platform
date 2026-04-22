# Report Template Spec — 报告模板规范

**版本**: 1.0  
**日期**: 2026-04-13

---

## 各报告模板字段定义

---

### task_closure_report — 任务收口报告

**触发时机**: 任务完成或取消时手动生成

| 字段 | 必填 | 说明 |
|------|------|------|
| task_name | ✅ | 任务名称 |
| task_id | ✅ | 任务唯一标识 |
| executed_at | ✅ | 执行时间（ISO 8601） |
| executed_by | ✅ | 执行者标识 |
| summary | ✅ | 执行摘要（一句话） |
| key_results | ✅ | 关键结果（列表形式） |
| recommendations | ✅ | 后续建议 |
| status | ✅ | final / cancelled / partial |
| duration_ms | — | 执行耗时（毫秒） |
| tags | — | 标签列表 |
| linked_artifacts | — | 关联产出物 |
| linked_models | — | 关联模型 |
| version | — | 系统版本 |

---

### evaluation_report — 评估报告

**触发时机**: 模型评估完成后手动生成

| 字段 | 必填 | 说明 |
|------|------|------|
| model_name | ✅ | 模型名称 |
| model_id | ✅ | 模型唯一标识 |
| dataset_name | ✅ | 评估数据集名称 |
| evaluated_at | ✅ | 评估时间（ISO 8601） |
| evaluator | ✅ | 评估执行者 |
| map_score | ✅ | mAP 分数（数值） |
| precision | ✅ | 精确率 |
| recall | ✅ | 召回率 |
| f1_score | — | F1 分数 |
| key_findings | ✅ | 关键发现 |
| failure_cases | — | 失败案例描述 |
| improvement_suggestions | ✅ | 改进建议 |
| recommendation | ✅ | 综合建议（adopt / revise / reject） |
| notes | — | 备注 |

---

### model_release_note — 模型发布说明

**触发时机**: 模型归档/发布时生成

| 字段 | 必填 | 说明 |
|------|------|------|
| model_name | ✅ | 模型名称 |
| model_id | ✅ | 模型唯一标识 |
| version | ✅ | 发布版本号 |
| release_type | ✅ | major / minor / patch |
| changelog | ✅ | 变更内容 |
| base_model | — | 基础模型 |
| training_dataset | — | 训练数据集 |
| architecture | — | 模型架构 |
| parameters | — | 参数数量 |
| release_date | ✅ | 发布日期 |
| released_by | ✅ | 发布负责人 |
| compatibility | — | 兼容性说明 |
| known_issues | — | 已知问题 |
| deprecation_notice | — | 废弃通知 |

---

### seal_backup_note — 封板/备份说明

**触发时机**: 系统封板或备份完成后生成

| 字段 | 必填 | 说明 |
|------|------|------|
| version | ✅ | 封板版本号 |
| seal_type | ✅ | seal（正式封板）/ backup（例行备份）/ hotfix（热修复） |
| sealed_at | ✅ | 封板时间（ISO 8601） |
| sealed_by | ✅ | 封板执行者 |
| scope | ✅ | 封板范围描述 |
| artifacts_count | — | 产出物数量 |
| db_snapshot | — | 数据库快照文件名 |
| db_sha256 | — | 数据库 SHA256 |
| zip_package | — | ZIP 包文件名 |
| zip_sha256 | — | ZIP SHA256 |
| backup_path | — | 备份路径 |
| scope_lock | — | 范围锁定确认 |
| acceptance_checklist | ✅ | 验收清单结果 |
| risks | — | 遗留风险 |
| next_steps | — | 后续计划 |

---

## 输出格式规范

所有报告输出为 Markdown 格式，包含：

1. **头部元数据块**（YAML front matter）
2. **标题**
3. **基本信息区**（key-value 表格）
4. **正文内容区**（由各字段填充）
5. **页脚**（生成时间 + 系统版本）
