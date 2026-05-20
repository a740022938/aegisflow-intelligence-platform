# AIP v7.41 Roadmap

**生成日期**: 2026-05-20
**基线**: main @ 27c8634 (v7.40 Final Seal Ready with Stage C Disabled)
**状态**: Planning / Blueprint Phase

---

## 概览

v7.41 是 AIP 控制台与记忆标准化版本。不是 Stage C 启用版本。不是 runtime 变更版本。

| Phase | 名称 | 性质 | 交付 |
|---|---|---|---|
| D1 | Blueprint + Memory Normalization | docs-first | 蓝图与记忆基线文档 |
| P1 | CLI Command Center Help Refresh | CLI help/UI 文案 | 升级 aip 首页输出 |
| P2 | Windows Encoding Doctor | CLI diagnostics | aip doctor encoding |
| P3 | Repair Plan-only System | plan-only repair | aip repair check/plan |
| P4 | Memory Knowledge Base Preview | readonly registry/preview | 记忆知识库预览 |
| P5 | v7.41 Final Seal Recheck | verification | 封板检查 |

## 禁止项

1. 不启用 Stage C
2. 不 toggle feature flag
3. 不新增 POST runtime
4. 不写 DB
5. 不更新 runtime memory
6. 不新增 executor
7. 不控制外部工具
8. 不执行 connector action
9. 不执行真实 rollback/source restore
10. 不添加隐藏预览页到 sidebar
11. 不打 tag/不 release
12. 不重启服务（除非 human owner 明确授权）

## 后续版本

v7.42 在此基础上构建 Operator Runtime Readiness Console，汇总 v7.41 所有模块状态。

## 最终目标

AIP 具备更好的命令中心、更完整的 PowerShell 操作包、更安全的修复系统设计、更明确的 Stage C 授权门、更可靠的项目记忆基线。

Stage C remains DISABLED.
Feature flag remains OFF.
No DB write. No executor. No external control. No connector action.
