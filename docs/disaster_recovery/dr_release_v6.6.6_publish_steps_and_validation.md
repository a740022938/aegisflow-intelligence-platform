# DR v6.6.6 发布步骤与校验步骤

## A. 发布步骤

1. 在私有 GitHub DR 仓创建 Release
- Tag: `dr-v6.6.6`
- Title: `AGI Model Factory DR Release v6.6.6 (Pre-Seal Baseline)`

2. 上传 5 个资产文件
- `AGI_Model_Factory_v6.6.6_clean_source.zip`
- `AGI_Model_Factory_v6.6.6_db_init_bundle.zip`
- `AGI_Model_Factory_v6.6.6_restore_manifest.json`
- `AGI_Model_Factory_v6.6.6_SHA256SUMS.txt`
- `AGI_Model_Factory_v6.6.6_recovery_quickstart.md`

3. 粘贴发布说明草稿
- 使用 `dr_release_v6.6.6_github_release_notes_draft.md` 内容

4. 发布并记录 Release URL

## B. 发布后校验步骤

1. 重新下载 Release 资产到临时目录
2. 执行 SHA256 校验，必须全部 PASS
3. 解压 `clean_source.zip`，检查关键入口文件
4. 解压 `db_init_bundle.zip`，执行 `schema.sql` 建库
5. 核对核心表存在

## C. 成功判定

满足以下全部条件即视为“可正式发布与长期封存”：
- 5 类资产完整上传
- checksums 全部通过
- 恢复步骤文档可执行
- manifest 与资产一致
- 未包含敏感文件

## D. 风险控制

若发现以下任一情况，立即撤回并重发：
- checksum 不匹配
- 文件命名不一致
- 上传了敏感信息或无关大文件
- manifest 与实际资产不一致

