# 天枢智治平台（AegisFlow Intelligence Platform, AIP）

天枢智治平台（AIP）是面向数据-训练-评估-发布全流程的本地化智能治理平台。
当前仓库为**可运行社区版（Community Edition）**，用于公开演示与二次开发。

## 版本与定位

- 当前公开版本：`AIP v6.8.0 Build 2026.04.26`
- 仓库定位：`可运行社区版`
- 目标：在去敏前提下保留核心主干能力（Workflow Composer / Governance Hub / 审计基础链路）

## 主要能力

- Workflow Composer：可视化编排、运行追踪、结果面板
- Governance Hub：治理中枢视图与运行态汇聚
- 训练与评估主干：数据集、训练、评估、归档、发布链路
- incident / playbook / audit 基础能力
- OpenClaw 协作适配层（需自行配置 token 与地址）

## 快速启动

### 1. 环境要求

- Node.js `>=22.0.0`
- pnpm `9.x`
- Git

### 2. 安装

```bash
git clone <your-public-repo-url>
cd aegisflow-intelligence-platform
pnpm install
```

### 3. 配置

```bash
cp .env.example .env.local
```

按需修改 `.env.local`：

- `OPENCLAW_BASE_URL`
- `OPENCLAW_HEARTBEAT_TOKEN`
- `OPENCLAW_ADMIN_TOKEN`
- 端口与日志级别

> 公开仓库不包含真实 `.env` 与任何私有凭据。

### 4. 初始化与运行

```bash
pnpm run db:init
pnpm run dev
```

访问：

- Web UI: `http://127.0.0.1:5173`
- Local API: `http://127.0.0.1:8787`
- Health: `http://127.0.0.1:8787/api/health`

## 数据库运维（新增）

- 数据库采用 `migration-first` 启动策略，迁移目录默认：`packages/db/migrations-core`
- 核心迁移已拆分为分层文件：`schema_tables` / `schema_indexes` / `schema_views`
- 可通过环境变量覆盖迁移目录：`AIP_DB_MIGRATIONS_DIR`
- 迁移执行包含 checksum 校验，防止同名迁移文件被静默篡改
- 查看迁移状态：`pnpm run db:migrate:status`
- 创建新迁移文件：`pnpm run db:migrate:new -- your_change_name`
- 本地诊断：`pnpm run db:doctor`
- 严格诊断（存在缺失索引即失败）：`pnpm run db:doctor:strict`
- 运行时诊断接口：`GET /api/system/database/diagnostics`
- Schema 漂移接口：`GET /api/system/database/schema-drift`
- 迁移状态接口：`GET /api/system/database/migrations`
- 维护接口：`POST /api/system/database/maintenance`（body: `{ "mode": "checkpoint|optimize|full" }`）
- CI 质量门禁：`.github/workflows/quality-gate.yml`（typecheck/lint/db:init/db:doctor:strict）

## 目录结构（公开版）

```text
aegisflow-intelligence-platform/
├─ apps/
│  ├─ web-ui/
│  └─ local-api/
├─ packages/
├─ scripts/
├─ templates/
├─ docs/
│  ├─ architecture/
│  └─ public-release/
├─ .env.example
└─ README.md
```

## 边界说明

- 本仓库移除了私有封板材料、桌面验证产物、本地日志与快照导出。
- 若要启用完整 OpenClaw 协同能力，需自行部署并配置目标服务。
- 部分高级能力依赖本地模型、数据目录与插件环境，默认不随公开仓库提供。
- 模型权重（`.pt`、`.pth`、`.onnx`、`.safetensors`）、数据集、日志、备份文件不提交到仓库。
- `.env.local` 包含本地开发凭据，不提交。使用 `.env.example` 作为配置参考。

## 文档入口

- 架构说明：`docs/architecture/ARCHITECTURE_OVERVIEW.md`
- 公开发布说明：`docs/public-release/PUBLIC_RELEASE_NOTES.md`
- 清洗与安全说明：`docs/public-release/SANITIZATION_AND_SECURITY.md`
- 保留/剥离清单：`docs/public-release/KEEP_EXCLUDE_MANIFEST.md`
- Phase F.0 官网同步清单：`docs/public-release/F0_WEBSITE_SYNC_CHECKLIST.md`
- Phase F.0 新用户上手闭环：`docs/public-release/F0_NEW_USER_ONBOARDING.md`
- Phase F.0 首发后巡检报告：`docs/public-release/F0_POST_LAUNCH_INSPECTION.md`
- Phase F.1 社区反馈归档：`docs/public-release/F1_COMMUNITY_FEEDBACK_ARCHIVE.md`
- 社区协作说明：`CONTRIBUTING.md`
- 问题反馈入口：`https://github.com/a740022938/aegisflow-intelligence-platform/issues/new/choose`

## 架构概览

- 前端：`apps/web-ui`（Workflow Composer / Governance Hub / 运行结果消费）
- 后端：`apps/local-api`（工作流运行、治理接口、审计主干）
- 数据层：SQLite（默认路径 `packages/db/agi_factory.db`）
- 文档层：`docs/architecture` 与 `docs/public-release` 维护公开版边界与治理说明

## 后续路线（Community Edition）

- 持续增强 Workflow Composer 的稳定性与可观测性
- 补齐社区可复用模板与最小数据样例
- 完善插件适配层文档与安全实践示例
- 增加面向社区贡献者的开发/测试规范

## License

MIT
