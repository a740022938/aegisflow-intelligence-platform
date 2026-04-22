# AIP Community Edition 白名单导出清单（本轮）

## 公开版目录
- E:\AIP_Community_Edition_public_20260422_094438

## 白名单保留（已导出）
- apps/
- packages/
- scripts/
- templates/
- docs/
- docker/
- workers/
- plugins/
- .github/
- api-tests/
- 根配置文件：README.md / .env.example / package.json / pnpm-lock.yaml / pnpm-workspace.yaml / ecosystem.config.cjs / Dockerfile* / docker-compose* / run-*.bat

## 排除（未导出）
- .git/
- node_modules/
- outputs/
- audit/
- backups/
- reports/
- runs/
- logs/、_logs/
- data/、datasets/、models/
- test-results/
- archives/、desktop_migrated/
- 本地 .env / .env.local / DB 快照 / 私有临时补丁脚本产物

## 最小启动验证结果
- 依赖安装：`pnpm install` ✅
- Web UI：`pnpm --dir apps/web-ui build` ✅
- Local API：`pnpm --dir apps/local-api build` ❌（缺少模块引用）
- Local API：`pnpm --dir apps/local-api dev` ❌（`Cannot find module './datasets/index.js'`）

## 结论
- 当前目录满足“公开版白名单导出”要求。
- 当前目录**不满足完整可启动（API+Web）**，仅 Web 可构建通过。
