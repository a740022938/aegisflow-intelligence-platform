# GitHub Releases Organization Plan (Disaster Recovery)

## 1. Releases 与仓库本体分工

仓库本体：
- 文档、脚本、模板、索引、checksum。
- 轻量可审阅文本资产。

GitHub Releases：
- 干净可运行程序包（source snapshot / build-ready package）。
- DB 初始化包（空库 schema + seed，不含敏感真实数据）。
- 恢复验证包（最小回归脚本与示例输入）。
- 离线依赖缓存包（可选，按体积决策）。

## 2. 单次 Release 资产建议

命名建议（示例版本 v6.6.6）：

1. `AGI_Model_Factory_v6.6.6_clean_source.zip`
- 干净源码包（已排除敏感与运行时垃圾）。

2. `AGI_Model_Factory_v6.6.6_db_init_bundle.zip`
- `schema.sql`
- `seed_minimal.sql` 或 `seed_minimal.json`
- `db_init_readme.md`

3. `AGI_Model_Factory_v6.6.6_restore_manifest.json`
- 文件清单、大小、sha256、生成时间、兼容环境。

4. `AGI_Model_Factory_v6.6.6_SHA256SUMS.txt`
- 所有发布资产校验和。

5. `AGI_Model_Factory_v6.6.6_recovery_quickstart.md`
- 10 分钟内恢复最短路径。

## 3. Release 描述模板

建议包含：
- 版本与发布日期
- 恢复目标环境（Win11 / Node / Python / SQLite）
- 资产列表（名称 + 用途 + checksum）
- 从零恢复步骤入口
- 已知限制
- 安全说明（不含生产密钥，不含敏感数据）

## 4. 发布前检查门

发布前必须通过：
- 包体清洁检查（无 `.env`、无 token、无敏感绝对路径）。
- 恢复演练检查（在新目录按文档可启动成功）。
- checksum 完整性检查。
- manifest 与实际文件一致性检查。

## 5. 维护节奏建议

- 每个正式里程碑都发一版 DR Release。
- 至少保留最近 5 个可恢复版本。
- 每季度做一次“离线恢复演练”并更新 runbook。

