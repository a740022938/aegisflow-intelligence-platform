# 保留/剥离清单（公开仓库）

## 保留（公开）

- `apps/`
- `packages/`
- `scripts/`（通用可复用脚本）
- `templates/`（示例模板）
- `docs/`
- `.env.example`
- `README.md`
- `package.json` / workspace 配置

## 剥离（不公开）

- `outputs/`（运行输出、审计导出）
- `audit/`（私有验收与封板报告）
- `runs/`、`reports/`、`logs/`、`_logs/`
- `data/`、`datasets/`、`models/`（含私有数据）
- `backups/`、`archives/`、`desktop_migrated/`
- 本地数据库文件与快照
- 临时修补脚本（`_*.py`、`temp_*.py`、`tmp_*.spec.ts`）
- 任何真实 `.env` 及凭据文件

## 替换为示例

- `ecosystem.config.cjs`：凭据与路径已改为环境变量/相对路径
- 运行凭据：统一通过 `.env.example` 提示

## 发布包建议

- 采用“白名单导出”优先（仅导出保留目录）
- 公开仓库首发只包含可运行最小集合，私有产物留在内部归档仓
