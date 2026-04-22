# 首次恢复演练步骤（DR Drill）

## 1. 演练目标

验证“仅使用 DR Release 资产”可完成以下最小恢复链路：
- 资产完整性可校验
- 源码包可解压并具备关键入口文件
- DB 初始化包可建库并生成核心表

## 2. 演练前准备

- 选择一版 DR Release（建议最新）。
- 在独立目录执行，不污染主开发目录。

## 3. 演练步骤

1. 新建演练目录（如 `E:\AGI_Factory\drill\dr_restore_<VER>_<TS>`）
2. 校验 `SHA256SUMS`
3. 解压 `clean_source.zip`
4. 解压 `db_init_bundle.zip`
5. 基于 `schema.sql` 创建 SQLite 新库
6. 核对核心表存在：`tasks`, `task_steps`, `task_logs`, `datasets`, `models`, `experiments`, `audit_logs`
7. 核对源码关键文件存在：根 `package.json`、`apps/local-api/package.json`、`apps/web-ui/package.json`
8. 记录结果并回填演练报告

## 4. 恢复成功判定标准

必须全部满足：
- checksum 全部通过
- 关键文件检查全部通过
- schema 建库成功
- 核心表集合存在
- 演练记录可复核（时间、路径、结果）

## 5. 建议进阶演练（每季度）

- 在全新机器执行 `npm install`
- 启动 API/UI
- 跑一次最小健康检查与关键页面访问
