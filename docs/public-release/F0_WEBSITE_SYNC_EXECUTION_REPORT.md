# 官网同步执行报告（Phase F.0 Execution）

## 本轮执行目标
- 官网/对外页面与 GitHub 首发状态对齐（AIP Community Edition）

## 已完成同步项
1. 首页产品口径统一
- 天枢智治平台（AegisFlow Intelligence Platform, AIP）
- 版本显示统一为 `v6.8.0-community.1`
- Community Edition 标识已可见

2. 核心能力摘要与边界说明接入
- 首页新增 Community onboarding 区
- 明确“包含/不包含”边界说明

3. GitHub / Release / 上手入口接入
- 首页新增按钮：GitHub、Release、第一次如何开始、打开编排器
- 帮助面板新增：GitHub、Release、Onboarding 入口

4. 文案去旧口径
- 移除首页副标题中 “formerly AGI Model Factory” 表述

## 链接验证
- GitHub 仓库：HTTP 200
- Release 页面：HTTP 200

## 构建验证
- `pnpm --dir apps/web-ui build` 通过
- `pnpm --dir apps/local-api build` 通过

## 证据
- 首页截图：`docs/public-release/evidence/F0E_01_homepage_sync.png`

## 备注
- 帮助面板截图自动化在当前环境出现超时，未纳入本轮证据；功能入口已由代码与构建验证覆盖。
