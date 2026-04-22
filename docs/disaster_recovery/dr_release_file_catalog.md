# DR Release 文件清单与命名规范

## 1. 标准命名

版本变量：`<VER>`（示例：`v6.6.6`，后续可替换为 `v6.6.6`）

必须资产：
1. `AGI_Model_Factory_<VER>_clean_source.zip`
2. `AGI_Model_Factory_<VER>_db_init_bundle.zip`
3. `AGI_Model_Factory_<VER>_restore_manifest.json`
4. `AGI_Model_Factory_<VER>_SHA256SUMS.txt`
5. `AGI_Model_Factory_<VER>_recovery_quickstart.md`

## 2. 首版样例（本地已生成）

- `AGI_Model_Factory_v6.6.6_clean_source.zip`
- `AGI_Model_Factory_v6.6.6_db_init_bundle.zip`
- `AGI_Model_Factory_v6.6.6_restore_manifest.json`
- `AGI_Model_Factory_v6.6.6_SHA256SUMS.txt`
- `AGI_Model_Factory_v6.6.6_recovery_quickstart.md`

## 3. Tag 建议

- 主仓版本 tag：`v6.6.6`（或后续 `v6.6.6`）
- DR 发布 tag：`dr-v6.6.6`（或后续 `dr-v6.6.6`）

## 4. 包内容边界

`clean_source.zip`：仅提交态源码（推荐 `git archive HEAD` 生成）。

`db_init_bundle.zip`：
- `schema.sql`
- `seed_minimal.sql`（空或最小样本）
- `db_init_readme.md`

禁止：
- 生产密钥、token、PAT
- 真实敏感 DB 快照
- 运行时导出和日志

