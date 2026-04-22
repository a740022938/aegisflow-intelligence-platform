# Plugin Manifest Specification — 插件清单规范

**Project**: AGI Model Factory  
**Version**: 6.0.0  
**Date**: 2026-04-13

---

## 1. Manifest 概述

Plugin Manifest 是插件的元数据声明文件，用于描述插件的身份、能力、权限和配置。每个插件必须包含一个 `manifest.json` 文件。

---

## 2. Manifest Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["plugin_id", "name", "version", "entry", "capabilities", "risk_level"],
  "properties": {
    "plugin_id": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "唯一标识符，只能包含小写字母、数字和连字符"
    },
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100,
      "description": "插件显示名称"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "语义化版本号，格式：major.minor.patch"
    },
    "entry": {
      "type": "string",
      "description": "入口文件路径，相对于插件目录"
    },
    "capabilities": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["report", "read", "compute", "notify", "transform", "export"]
      },
      "description": "插件能力列表"
    },
    "permissions": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "权限列表，格式：action:resource"
    },
    "risk_level": {
      "type": "string",
      "enum": ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      "description": "风险级别"
    },
    "config_schema": {
      "type": "object",
      "description": "配置项的 JSON Schema"
    },
    "enabled": {
      "type": "boolean",
      "default": true,
      "description": "是否默认启用"
    },
    "author": {
      "type": "string",
      "description": "作者"
    },
    "description": {
      "type": "string",
      "description": "插件描述"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "标签，用于分类"
    }
  }
}
```

---

## 3. 字段详解

### 3.1 plugin_id（必需）
- **类型**: string
- **格式**: 小写字母、数字、连字符
- **示例**: `builtin-demo-plugin`, `custom-model-reporter`
- **约束**: 必须唯一

### 3.2 name（必需）
- **类型**: string
- **长度**: 1-100 字符
- **示例**: `Demo Plugin`, `Model Reporter`

### 3.3 version（必需）
- **类型**: string
- **格式**: semver (major.minor.patch)
- **示例**: `1.0.0`, `0.1.0-beta`

### 3.4 entry（必需）
- **类型**: string
- **描述**: 入口文件路径，相对于插件根目录
- **示例**: `./index.js`, `./dist/index.js`

### 3.5 capabilities（必需）
- **类型**: array
- **枚举值**:
  - `report`: 报表生成
  - `read`: 只读数据访问
  - `compute`: 计算处理
  - `notify`: 通知推送
  - `transform`: 数据转换
  - `export`: 数据导出

### 3.6 permissions（可选）
- **类型**: array
- **格式**: `action:resource`
- **示例**:
  - `read:datasets` — 读取数据集
  - `read:models` — 读取模型
  - `read:evaluations` — 读取评估
  - `write:artifacts` — 写入产物（需要 MEDIUM+ 风险级别）

### 3.7 risk_level（必需）
- **类型**: string
- **枚举值**:
  - `LOW`: 只读操作、报表生成
  - `MEDIUM`: 文件读取、轻量计算
  - `HIGH`: 文件写入、网络请求
  - `CRITICAL`: 数据库写入、系统命令执行

### 3.8 config_schema（可选）
- **类型**: object (JSON Schema)
- **描述**: 插件配置项的 JSON Schema 定义

### 3.9 enabled（可选）
- **类型**: boolean
- **默认值**: true
- **说明**: HIGH/CRITICAL 风险插件默认 false

### 3.10 author（可选）
- **类型**: string
- **示例**: `AGI Factory Team`

### 3.11 description（可选）
- **类型**: string
- **示例**: `演示插件，展示只读报表能力`

### 3.12 tags（可选）
- **类型**: array
- **示例**: `["demo", "builtin", "report"]`

---

## 4. Demo Plugin Manifest 示例

```json
{
  "plugin_id": "builtin-demo-plugin",
  "name": "Demo Plugin",
  "version": "1.0.0",
  "entry": "./index.js",
  "capabilities": ["report", "read"],
  "permissions": ["read:datasets", "read:models", "read:evaluations"],
  "risk_level": "LOW",
  "config_schema": {
    "type": "object",
    "properties": {
      "report_format": {
        "type": "string",
        "enum": ["summary", "detailed"],
        "default": "summary"
      },
      "max_items": {
        "type": "number",
        "minimum": 1,
        "maximum": 1000,
        "default": 100
      }
    }
  },
  "enabled": true,
  "author": "AGI Factory Team",
  "description": "演示插件，展示只读报表能力",
  "tags": ["demo", "builtin", "report"]
}
```

---

## 5. 验证规则

### 5.1 必需字段验证
- `plugin_id`: 非空、格式正确、唯一
- `name`: 非空
- `version`: semver 格式
- `entry`: 非空
- `capabilities`: 非空数组
- `risk_level`: 有效枚举值

### 5.2 风险级别自动处理
```typescript
function applyRiskDefaults(manifest: PluginManifest): PluginManifest {
  // HIGH/CRITICAL 默认禁用
  if (manifest.risk_level === 'HIGH' || manifest.risk_level === 'CRITICAL') {
    manifest.enabled = false;
  }
  return manifest;
}
```

### 5.3 权限校验
- LOW: 只允许 `read:*` 权限
- MEDIUM: 允许 `read:*`, `compute:*` 权限
- HIGH: 允许 `read:*`, `compute:*`, `notify:*` 权限
- CRITICAL: 允许所有权限（需显式确认）

---

## 6. 清单文件位置

每个插件的 `manifest.json` 必须位于插件根目录：

```
plugins/
└─ builtin/
   └─ demo-plugin/
      ├─ manifest.json    ← 清单文件
      └─ index.js        ← 入口文件
```

---

## 7. 版本兼容性

Manifest Schema 版本与 Plugin Runtime 版本对应：

| Manifest Schema | Plugin Runtime | 说明 |
|-----------------|----------------|------|
| 1.0.0 | 1.0.0 | 初始版本 |
