# P4 Scope Freeze — 范围冻结文档

**Project**: AGI Model Factory  
**Version**: 6.0.0  
**Phase**: P4 Phase 1 — Plugin Architecture Base  
**Date**: 2026-04-13

---

## 1. 本版定位

v6.0.0 的目标是建立插件化底座，让系统具备未来扩展能力，同时不破坏现有 P3 主链。

关键词：
- Plugin Architecture Base
- Plugin SDK & Runtime
- Plugin Manifest
- Audit Trail
- Disable-able / Auditable / Rollback-able

---

## 2. 本版必须完成

### A. 文档准备
- ✅ P4_scope_freeze.md（本文档）
- ✅ plugin_architecture.md（插件架构文档）
- ✅ plugin_manifest_spec.md（插件清单规范）

### B. Plugin SDK
- `packages/plugin-sdk/` — 插件开发 SDK
- 提供插件注册的 TypeScript/JavaScript 接口
- 包含类型定义、Manifest Schema、工具函数

### C. Plugin Runtime
- `packages/plugin-runtime/` — 插件运行时引擎
- 核心功能：注册、验证、加载、启用、禁用、列出
- 集成到 local-api，作为可选模块

### D. Builtin Demo Plugin
- `plugins/builtin/demo-plugin/` — 内置示例插件
- 仅做低风险 builtin 示例
- 只允许只读/报表类动作
- 不允许破坏性文件操作

### E. 审计留痕
- 插件注册审计
- 插件启用/禁用审计
- 插件执行审计
- 插件失败审计

---

## 3. 交付物清单

| 交付物 | 路径 | 说明 |
|--------|------|------|
| 范围冻结 | docs/P4_scope_freeze.md | 本文档 |
| 架构文档 | docs/plugin_architecture.md | 插件架构设计 |
| Manifest 规范 | docs/plugin_manifest_spec.md | 清单规范 |
| Plugin SDK | packages/plugin-sdk/ | 插件开发 SDK |
| Plugin Runtime | packages/plugin-runtime/ | 运行时引擎 |
| Demo Plugin | plugins/builtin/demo-plugin/ | 内置示例插件 |
| 审计说明 | docs/plugin_audit_spec.md | 审计规范 |

---

## 4. 本版明确不纳入

- ❌ YOLO 支线推进
- ❌ SAM 流水线扩张
- ❌ OpenClaw 深接实现
- ❌ 远程 worker
- ❌ 插件市场 UI
- ❌ 多角色权限体系
- ❌ 重构任务中心主链
- ❌ 破坏 P3 功能

---

## 5. 设计约束

### 5.1 可禁用
- 插件加载失败不影响主系统
- 可通过配置完全禁用插件系统
- 禁用后主链继续运行

### 5.2 可审计
- 所有插件操作写入 audit_logs
- 插件执行结果可追溯

### 5.3 可回退
- 插件代码独立目录
- 回退时删除插件目录即可
- 不影响数据库结构

---

## 6. 风险级别定义

| 级别 | 名称 | 说明 |
|------|------|------|
| LOW | 低风险 | 只读操作、报表生成 |
| MEDIUM | 中风险 | 文件读取、轻量计算 |
| HIGH | 高风险 | 文件写入、网络请求 |
| CRITICAL | 极高风险 | 数据库写入、系统命令执行 |

**Demo Plugin 限制**: 仅允许 LOW 级别

---

## 7. 完成判定

v6.0.0 视为完成当：
1. ✅ 三个架构文档已输出
2. ✅ Plugin SDK 可用
3. ✅ Plugin Runtime 可用
4. ✅ Demo Plugin 可演示
5. ✅ 审计留痕生效
6. ✅ P3 功能不回归
7. ✅ 新增内容可整体回退
