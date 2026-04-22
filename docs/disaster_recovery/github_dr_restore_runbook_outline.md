# Disaster Restore Runbook Outline (Execution Draft)

## 1. 恢复入口（T0）

前提：仅保留 GitHub 仓库与 Releases 可访问。

步骤：
1. 克隆灾难恢复仓库：`AGI-Model-Factory-DR`
2. 阅读 `docs/00_restore_entry.md`
3. 下载目标版本 Release 资产（源码包、DB 初始化包、manifest、SHA256）
4. 校验 SHA256

## 2. 环境安装（T0 + 15min）

按 `docs/01_environment_install.md`：
- 安装 Git / Node / npm / Python / SQLite
- 验证版本
- 安装项目依赖

## 3. 数据库初始化（T0 + 25min）

按 `docs/02_database_init.md`：
- 创建空库
- 执行 schema
- 执行最小 seed（可选）
- 检查核心表存在

## 4. 服务启动（T0 + 35min）

按 `docs/03_startup_guide.md`：
- 启动 API
- 启动 Web UI
- 访问 health endpoint
- 打开关键页面验证

## 5. 恢复验证（T0 + 45min）

按 `docs/06_verification_checklist.md`：
- 基础接口通
- 核心页面可打开
- 关键链路最小可演示
- 无阻断性报错

## 6. 恢复失败处理（T0 + 60min）

按 `docs/04_disaster_restore_runbook.md` 预案：
- 依赖安装失败
- DB 初始化失败
- 端口冲突
- 配置缺失
- 路由/接口异常

## 7. 恢复完成判定

恢复完成必须满足：
- 服务可启动
- health 通过
- 核心模块可访问
- 校验记录已落盘

## 8. 上传/排除清单（执行版）

应上传：
- 文档（恢复、安装、DB、启动、发布规范）
- `scripts/windows/*` 恢复脚本
- 模板配置（`.env.example`）
- manifest 与 checksum
- 无敏感的初始化 SQL/JSON

不应上传：
- `.env`, `*.key`, `*.pem`, token/pat
- `node_modules/`, `dist/`, 临时缓存
- `outputs/`, `feedback_exports/`, `logs/` 等运行态产物
- 含敏感数据的 DB 快照
- 本地绝对路径写死配置

## 9. GitHub 灾备仓施工任务包（给新助手）

1. 建库
- 新建私有仓库 `AGI-Model-Factory-DR`

2. 首次落盘
- 提交 `docs/disaster_recovery/*` 方案文档
- 提交恢复脚本模板与 manifest 模板

3. 首版 Release
- 生成 clean source / db init bundle / manifest / SHA256
- 创建 tag（如 `dr-v6.6.6`）
- 上传 Release 资产并填写恢复说明

4. 演练与验收
- 在新目录从零恢复一次
- 记录耗时、问题、修正项
- 更新 runbook

