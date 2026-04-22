# AGI Model Factory - GitHub 灾难恢复方案索引

本目录用于“仅靠 GitHub 即可恢复运行”的灾难恢复准备。

## 文件索引

1. `github_dr_repo_blueprint.md`
- 灾备仓目录结构与边界定义。

2. `github_dr_releases_plan.md`
- GitHub Releases 资产组织方案。

3. `github_dr_restore_runbook_outline.md`
- 恢复流程大纲、上传/排除清单、接力施工包。

## 推荐执行顺序

1. 先按 `github_dr_repo_blueprint.md` 建立私有 DR 仓库结构。
2. 再按 `github_dr_releases_plan.md` 组织首版 Release 资产。
3. 最后按 `github_dr_restore_runbook_outline.md` 做一次完整恢复演练并补齐缺口。

## 新增执行文档

- `dr_release_file_catalog.md`
- `windows_dr_packaging_commands.md`
- `dr_recovery_drill_steps.md`
- `dr_recovery_drill_backfill_20260414.md`

## 发布收口文档（v6.6.6）

- `dr_release_v6.6.6_publish_assets.md`
- `dr_release_v6.6.6_github_release_notes_draft.md`
- `dr_release_v6.6.6_publish_steps_and_validation.md`

