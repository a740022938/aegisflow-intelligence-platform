# Plugin Architecture — 插件架构文档

**Project**: AGI Model Factory  
**Version**: 6.0.0  
**Date**: 2026-04-13

---

## 1. 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    AGI Model Factory                     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   │
│  │  local-api  │   │  plugin-    │   │  plugin-    │   │
│  │             │◄──│  runtime    │◄──│  sdk        │   │
│  │             │   │             │   │             │   │
│  └─────────────┘   └─────────────┘   └─────────────┘   │
│                          │                               │
│                    ┌─────┴─────┐                        │
│                    │ audit_logs│                        │
│                    └───────────┘                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │              Builtin Plugins                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────┐  │   │
│  │  │ demo-plugin│  │ future-    │  │ future-  │  │   │
│  │  │ (builtin)  │  │ plugin-1   │  │ plugin-2 │  │   │
│  │  └────────────┘  └────────────┘  └──────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 核心组件

### 2.1 Plugin SDK (`packages/plugin-sdk/`)
- **职责**: 插件开发接口定义
- **内容**:
  - TypeScript 类型定义
  - Manifest Schema (JSON Schema)
  - 工具函数
  - 注册 API 封装

### 2.2 Plugin Runtime (`packages/plugin-runtime/`)
- **职责**: 插件运行时管理
- **内容**:
  - PluginManager 类
  - Manifest 验证器
  - 插件加载器
  - 审计拦截器

### 2.3 Plugin Registry (`plugins/builtin/`)
- **职责**: 内置插件存放
- **内容**:
  - demo-plugin（示例插件）
  - 未来扩展插件

---

## 3. Plugin Runtime 核心 API

### 3.1 PluginManager 类

```typescript
class PluginManager {
  // 构造函数
  constructor(options?: PluginRuntimeOptions)

  // 注册插件
  async registerPlugin(manifest: PluginManifest): Promise<RegisterResult>

  // 验证 Manifest
  validateManifest(manifest: any): ValidationResult

  // 启用插件
  async enablePlugin(pluginId: string): Promise<EnableResult>

  // 禁用插件
  async disablePlugin(pluginId: string): Promise<DisableResult>

  // 列出所有插件
  listPlugins(options?: ListOptions): PluginInfo[]

  // 加载内置插件
  async loadBuiltinPlugins(): Promise<void>

  // 执行插件
  async executePlugin(pluginId: string, action: string, params?: any): Promise<ExecutionResult>

  // 获取插件状态
  getPluginStatus(pluginId: string): PluginStatus

  // 禁用/启用插件系统
  setPluginSystemEnabled(enabled: boolean): void
}
```

---

## 4. Plugin Manifest 结构

```typescript
interface PluginManifest {
  plugin_id: string;       // 唯一标识，如 "builtin-demo-plugin"
  name: string;           // 显示名称，如 "Demo Plugin"
  version: string;        // 版本号，如 "1.0.0"
  entry: string;          // 入口文件，如 "./index.js"
  capabilities: string[];  // 能力列表，如 ["report", "read"]
  permissions: string[];  // 权限列表，如 ["read:datasets"]
  risk_level: RiskLevel;  // 风险级别: LOW | MEDIUM | HIGH | CRITICAL
  config_schema: object;  // 配置 Schema (JSON Schema)
  enabled: boolean;        // 是否启用
  author?: string;        // 作者
  description?: string;   // 描述
}

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
```

---

## 5. 审计事件定义

| 事件类型 | 说明 | 审计字段 |
|----------|------|----------|
| PLUGIN_REGISTERED | 插件注册 | plugin_id, name, version, risk_level |
| PLUGIN_ENABLED | 插件启用 | plugin_id, name |
| PLUGIN_DISABLED | 插件禁用 | plugin_id, name |
| PLUGIN_EXECUTED | 插件执行 | plugin_id, action, params, result |
| PLUGIN_FAILED | 插件失败 | plugin_id, action, error |

---

## 6. 风险控制

### 6.1 HIGH/CRITICAL 风险插件默认禁用
```typescript
// 高风险插件需要显式启用
if (manifest.risk_level === 'HIGH' || manifest.risk_level === 'CRITICAL') {
  manifest.enabled = false;
}
```

### 6.2 执行前检查
```typescript
async executePlugin(pluginId: string, action: string, params?: any): Promise<ExecutionResult> {
  const plugin = this.getPlugin(pluginId);
  
  // 检查是否启用
  if (!plugin.enabled) {
    throw new Error(`Plugin ${pluginId} is not enabled`);
  }
  
  // 检查风险级别
  if (plugin.risk_level === 'HIGH' || plugin.risk_level === 'CRITICAL') {
    // 需要额外确认
  }
  
  // 记录执行日志
  await this.audit('PLUGIN_EXECUTED', { pluginId, action, params });
  
  // 执行
  return await plugin.execute(action, params);
}
```

---

## 7. 目录结构

```
repo/
├─ packages/
│ ├─ plugin-sdk/           # 插件开发 SDK
│ │  ├─ src/
│ │  │  ├─ index.ts        # 导出入口
│ │  │  ├─ types.ts         # 类型定义
│ │  │  ├─ manifest.ts      # Manifest Schema
│ │  │  └─ utils.ts         # 工具函数
│ │  ├─ package.json
│ │  └─ tsconfig.json
│ │
│ └─ plugin-runtime/       # 插件运行时
│    ├─ src/
│    │  ├─ index.ts         # 导出入口
│    │  ├─ PluginManager.ts # 核心管理器
│    │  ├─ Validator.ts     # Manifest 验证器
│    │  ├─ Loader.ts        # 插件加载器
│    │  ├─ AuditInterceptor.ts # 审计拦截器
│    │  └─ errors.ts        # 错误定义
│    ├─ package.json
│    └─ tsconfig.json
│
├─ plugins/
│ └─ builtin/
│    └─ demo-plugin/        # 内置示例插件
│       ├─ manifest.json    # 插件清单
│       ├─ index.ts         # 入口文件
│       └─ package.json
│
└─ docs/
  ├─ P4_scope_freeze.md
  ├─ plugin_architecture.md  # 本文档
  └─ plugin_manifest_spec.md
```

---

## 8. 与主系统集成

### 8.1 集成方式
Plugin Runtime 作为 local-api 的可选模块：
```typescript
// apps/local-api/src/index.ts
import { PluginManager } from '../packages/plugin-runtime';

// 初始化（可选，默认禁用）
const pluginManager = new PluginManager({
  enabled: process.env.PLUGIN_SYSTEM_ENABLED === 'true',
  pluginDir: './plugins/builtin'
});
```

### 8.2 API 端点
```
GET  /api/plugins           # 列出所有插件
GET  /api/plugins/:id       # 获取插件详情
POST /api/plugins/register   # 注册插件
POST /api/plugins/:id/enable  # 启用插件
POST /api/plugins/:id/disable # 禁用插件
POST /api/plugins/:id/execute # 执行插件
```

---

## 9. 回退方案

如需回退，删除以下目录即可：
```
rm -rf packages/plugin-sdk
rm -rf packages/plugin-runtime
rm -rf plugins/builtin/demo-plugin
```

数据库不受影响，audit_logs 保留历史记录。
