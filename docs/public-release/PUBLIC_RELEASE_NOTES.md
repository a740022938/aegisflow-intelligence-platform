# AIP v7.3.0 公开发布说明

## 封板结论

AIP v7.3.0 已从 rc2 验证线晋级为正式稳定发布，当前仓库发布形态为：**可运行社区版**。

## 已完成范围

- Assistant Center 只读作战中枢：服务状态、全链路体检、任务包、报告、备份和风险边界。
- Memory Hub 前端只读接入：展示 published / archived / candidate 状态，不写入 sqlite、candidate 或 LAN_SHARE。
- OpenAxiom readonly bridge：只读检查数据集与桥接状态，不保存、恢复或批量修改 label。
- Claude DeepSeek Proxy 状态纳入 Assistant Center 体检。
- ComfyUI 微修：补齐错误消息兜底和 seed 有限值兜底，生图链路不作为 v7.3.0 final 阻断项。

## 本次公开发布处理

- 版本号统一到 `7.3.0` / `v7.3.0`。
- GitHub Release 指向 `v7.3.0`。
- 保留 Assistant Center 默认只读边界：不删除、不移动、不 taskkill、不训练、不保存 label、不自动修复。
- 明确 `E:\Mahjong_V1_Project` 为正式保留资产，不纳入清理候选。

## 验证摘要

- lint：通过。
- smoke：8 passed / 0 failed / 3 skipped；3 个 data-chain 项因未设置 `AIP_SMOKE_PASSWORD` 跳过。
- AIP health：HTTP 200。
- Assistant Center：无 high 风险；E 盘空间为 medium warning。
- Memory Hub / OpenAxiom：只读边界保持。

## 对外定位

- 类型：可运行社区版（Community Edition）。
- 用途：演示核心能力、支持二次开发、提供本地只读治理基线。
- 非目标：直接提供私有生产数据、私有运维资产、自动清理、自动训练或自动修复。
