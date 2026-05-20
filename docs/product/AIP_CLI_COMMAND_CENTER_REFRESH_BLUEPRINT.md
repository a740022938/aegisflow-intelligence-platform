# AIP CLI Command Center Refresh Blueprint

**生成日期**: 2026-05-20

---

## 目标

将 `aip` 默认输出从普通 help 升级为 AIP Command Center。

## 输出格式

```
AIP CLI v7.41.x
AGI Production Command Center
Project: E:\AIP
Mode: SAFE / Stage C DISABLED / Feature Flag OFF

================================================================
[01] 常用控制 / Daily Control
================================================================
  aip start                  启动 AIP 服务
  aip stop                   停止 AIP 服务
  aip restart                重启 AIP 服务，需要人工确认
  aip status                 查看运行状态
  aip health                 检查 API 健康
  aip open                   打开 Web UI
  aip logs api               查看 API 日志
  aip logs web               查看 Web UI 日志
  aip logs gateway           查看 Gateway 日志

================================================================
[02] 项目检查 / Diagnostics
================================================================
  aip version                查看版本信息
  aip doctor                 一键诊断
  aip doctor env             检查 Node / npm / Python / Git
  aip doctor encoding        检查 Windows 中文编码与颜色支持
  aip doctor ports           检查 8787 等端口占用
  aip doctor stage-c         检查 Stage C 安全边界

================================================================
[03] 配置管理 / Config
================================================================
  aip config get             查看当前配置
  aip config init            初始化配置
  aip config set home <path> 设置 AIP 项目路径
  aip config set <key> <val> 设置配置项

================================================================
[04] 网关与模型 / Gateway & ML
================================================================
  aip gateway status         查看 Gateway 状态
  aip gateway start          启动 Gateway
  aip gateway stop           停止 Gateway
  aip gateway restart        重启 Gateway，需要人工确认
  aip ml                     本机模型命令大全
  aip ml status              查看本机模型状态

================================================================
[05] 开发验证 / Validation
================================================================
  aip check                  执行基础检查
  aip check full             typecheck + tests + build + diff check
  aip smoke                  执行 smoke tests
  aip smoke stage-c          检查 Stage C readonly 状态
  aip seal status            查看当前封板状态

================================================================
[06] 修复系统 / Repair
================================================================
  aip repair                 只生成修复计划，不修改文件
  aip repair check           检查可修复项
  aip repair plan            生成修复计划
  aip repair command-pack    修复命令包，不动源码
  aip repair restore-point   查看可用恢复点
  aip repair source          源码恢复，高风险，需要人工确认

================================================================
[07] Stage C 安全门 / Stage C Gate
================================================================
  aip stage-c status         查看 Stage C 状态
  aip stage-c gate           查看授权门状态
  aip stage-c auth-template  生成授权文本模板
  aip stage-c smoke          执行只读安全检查

Tips:
  aip help <command>         查看某个命令详情
  aip --plain                纯文本模式，适合乱码环境
  aip --no-color             禁用颜色
  aip --ascii                ASCII 兼容模式
  aip --lang zh              中文
  aip --lang en              English
```

## 颜色规则

| 元素 | 颜色 |
|---|---|
| 大标题、分区标题 | Cyan |
| 安全命令、PASS、readonly | Green |
| restart、repair source、需人工确认 | Yellow |
| 禁止项、FAILED、danger | Red |
| 路径、提示、补充说明 | Gray |
| 普通命令 | White |

不支持颜色时退回纯文本。

## 只修改范围

- `apps/aip-cli/src/index.ts` — default help output
- 不新增执行能力
- 不修改其他命令的实现
