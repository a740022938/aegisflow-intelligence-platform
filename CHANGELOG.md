# Changelog

## v7.2.0 Stable (2026-04-29)

### Fixed
- Unified package versions to 7.2.0 across all sub-packages
- Removed stale hardcoded path comments from feedback/index.ts
- Added missing .gitkeep for empty staging directory
- Fixed CSS @keyframes minify warnings (7 files, 9 blocks)
- Added production preview script (`pnpm run preview`)
- Improved test fallback message

### Verified
- lint PASS (--max-warnings 0)
- build PASS with zero CSS warnings
- db:doctor PASS (124 tables, 311 indexes)
- CLI 7.2.0 / Core 7.2.0
- Sidebar shows AIP v7.2.0 / Build 2026.04.29

### Notes
- This is the current sealed stable baseline.
- Repository hygiene completed (root cleanup, bat scripts de-hardcoded, env.example deduplicated, release process documented).

## v6.8.0 (2026-04-25)

### Added
- 双向 OpenClaw 通信桥接: 命令/意图/工作流触发/结果回写
- 可观测性系统: Prometheus 指标 + 请求延迟分位
- 异步任务队列: 优先级队列 + 自动重试
- Python Worker 持久化进程池
- 统一 Makefile 构建入口
- 增强 SQLite 配置: busy_timeout, cache_size, WAL 优化

### Fixed
- 凭据泄露风险: 移除 start_local_api.bat 硬编码令牌
- 硬编码 E:\AGI_Factory 路径 → 可配置环境变量
- Docker 镜像版本 v6.7.0 → v6.8.0
- 静默 catch {} 吞错误 → 增加错误日志
- 清理 34 个 debug/临时文件

### Changed
- 空壳模块增加最小实现 (logger/shared-types/task-engine/template-engine/storage)
- 前端 Vite 分包优化 (manualChunks)
- .gitignore 增强安全配置
- docker-compose 增加 token/env_file 传递

## v6.7.0 (Previous)
- Workflow Composer 系统
- 插件系统 (8 个内置插件)
- 自学习飞轮 YOLO 训练管道
- 治理仪表盘
