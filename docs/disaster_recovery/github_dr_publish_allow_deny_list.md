# Upload / Exclude List (AGI Model Factory DR)

## A. 建议上传（Git 仓库本体）

- `apps/local-api/**`（源码与必要配置，排除日志/构建产物）
- `apps/web-ui/**`（源码与必要配置，排除构建产物）
- `packages/**`（源码）
- `plugins/**`（插件源码与 manifest）
- `scripts/**`（恢复脚本、校验脚本）
- `docs/**`（恢复文档、安装说明、runbook）
- `templates/**`（模板资产）
- `README.md`
- `.env.example`
- `package.json` / lock 文件

## B. 建议上传（GitHub Releases 资产）

- `*_clean_source.zip`
- `*_db_init_bundle.zip`（仅 schema/minimal seed）
- `*_restore_manifest.json`
- `*_SHA256SUMS.txt`
- `*_recovery_quickstart.md`

## C. 禁止上传（Git 与 Releases）

- `.env`, `.env.local`, `.env.*`（非 example）
- 含 token/PAT/密钥的任意文件
- `node_modules/**`
- `dist/**`, `build/**`, `.vite/**`
- `logs/**`, `_logs/**`
- `outputs/**`
- `feedback_exports/**`
- `*.db`, `*.sqlite`, `*.sqlite3`（如含真实/敏感数据）
- `backups/**`（原始本地备份，默认不上传）
- 本地绝对路径配置（如 `E:\...`）
- 调试临时脚本（例如 `_fix_*.py`, `_patch_*.js`）

## D. 条件上传（需脱敏与审批）

- DB 快照：仅允许“脱敏样本库”或“空库模板”。
- 截图：不得包含后台真实敏感信息或个人信息。
- 审计日志：去除账号、路径、token 等敏感字段后可上传。

## E. 发布前 5 项快速检查

1. `git status` 无误提交范围
2. 全仓搜索关键字：`token`, `PAT`, `password`, `secret`
3. 校验 `.gitignore` 覆盖运行时目录
4. 生成并核对 SHA256
5. 在全新目录进行一次恢复演练
