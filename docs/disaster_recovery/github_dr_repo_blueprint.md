# GitHub Disaster Recovery Repository Blueprint (AGI Model Factory)

## 1. 目标与边界

目标：在“仅 GitHub 可用”的极端情况下，仍可恢复 AGI Model Factory 到可运行状态。

边界：
- 本方案只做灾难恢复仓库组织与发布规范，不新增产品功能。
- 不把运行期大文件、临时导出、敏感凭据放入 Git 历史。
- 通过「仓库本体 + GitHub Releases」双层交付实现恢复。

## 2. 建议仓库形态

建议采用双仓方案：

1. 主开发仓库（现有）
- 负责日常开发与版本推进。

2. 灾难恢复仓库（新建私有，建议名）
- `AGI-Model-Factory-DR`
- 负责“可恢复资产”和“恢复文档”长期保留。

## 3. 灾难恢复仓库目录建议

```text
AGI-Model-Factory-DR/
  README.md
  docs/
    00_restore_entry.md
    01_environment_install.md
    02_database_init.md
    03_startup_guide.md
    04_disaster_restore_runbook.md
    05_release_package_spec.md
    06_verification_checklist.md
    07_security_and_secrets_policy.md
  manifests/
    dr_inventory.latest.json
    release_index.json
  scripts/
    windows/
      install_prerequisites.ps1
      init_db.ps1
      start_stack.ps1
      verify_recovery.ps1
  templates/
    .env.example
    app.config.example.json
  checksums/
    SHA256SUMS.txt
```

## 4. 仓库本体应放什么

必须放入：
- 恢复入口 README（一步步恢复顺序）。
- 环境安装说明（Windows 优先，明确版本号）。
- 数据库初始化说明（建库/补表/初始化数据）。
- 启动说明（API/UI/健康检查）。
- 恢复 Runbook（故障场景 -> 恢复步骤 -> 验证标准）。
- Release 包规范（每次发布包包含哪些文件）。
- 校验文件（checksum 列表、资产索引 manifest）。
- 脱敏配置模板（`.env.example`、`*.example.json`）。

不应放入：
- 真实 `.env`、token、PAT、密钥。
- 数据库真实生产快照（若含敏感数据）。
- 运行时导出目录（`outputs/`、`feedback_exports/` 等）。
- 本地日志、缓存、临时脚本、截图中包含敏感信息内容。
- 大体积二进制长期驻留在 Git 历史（改用 Releases）。

## 5. 版本组织建议

建议 tag 约定：
- `dr-vYYYY.MM.DD`（灾备包发布）
- 或与主版本对齐：`dr-v6.6.6`

建议分支：
- `main`：当前有效恢复基线
- `archive/*`：历史冻结快照

