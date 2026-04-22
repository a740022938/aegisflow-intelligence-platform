# 清洗与安全说明

## 1. 本轮发现的敏感风险

- `ecosystem.config.cjs` 曾存在硬编码 token（已改为环境变量）
- 仓库中存在大量本地绝对路径引用（主要位于审计/输出/临时脚本）
- 本地日志、运行输出、数据库快照存在泄露风险

## 2. 已实施处理

- 配置去敏：
  - `OPENCLAW_HEARTBEAT_TOKEN` 改为 `process.env` 读取
  - `OPENCLAW_ADMIN_TOKEN` 改为 `process.env` 读取
  - `cwd` 与日志路径改为相对路径/环境变量
- 发布隔离：
  - `.gitignore` 增加 `outputs/`、`audit/`、`runs/`、`reports/`、`data/`、`datasets/`、`models/` 等本地产物目录
  - 忽略 `.env` 与变体，仅保留 `.env.example`
  - 忽略临时补丁脚本与本地日志目录

## 3. 残余风险提示

- 历史提交中若已含敏感内容，需要在发布前做历史重写或新仓库初始化。
- 若后续新增脚本含绝对路径，需继续按公开规则清理。
- 使用者必须自行配置 OpenClaw/模型服务 token，不应提交到仓库。

## 4. 公开发布前最后检查建议

1. 全仓再次执行敏感关键词扫描
2. 检查 Git staged 文件，确保无 `outputs/audit/runs/logs/*.db/.env`
3. 从空环境按 README 启动一次，确认示例配置可运行
