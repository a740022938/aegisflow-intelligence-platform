# Knowledge Center Architecture — 知识沉淀中心架构

**Project**: AGI Model Factory  
**Version**: 6.1.0  
**Date**: 2026-04-13

---

## 1. 设计目标

把任务经验、失败复盘、模型结论、处理建议沉淀成可查询、可挂接、可复用的知识资产。

关键词：Knowledge Asset / Failure Postmortem / Model Conclusion / Entity Linking / Audit Trail / Queryable

---

## 2. 数据模型

### 2.1 knowledge_entries — 知识条目表

每条知识记录包含：
- **标题**（title）：一句话概括
- **分类**（category）：failure_postmortem / model_conclusion / task_experience / general_note
- **来源**（source_type / source_id）：记录来自哪个任务/模型/实验
- **摘要**（summary）：快速了解
- **问题**（problem）：发生了什么
- **处理**（resolution）：怎么解决的
- **结论**（conclusion）：最终结论
- **建议**（recommendation）：后续行动建议
- **标签**（tags_json）：便于检索

### 2.2 knowledge_links — 知识关联表

知识条目与实体的多对多关系：
- knowledge_id → knowledge_entries.id
- target_type → task / model / experiment
- target_id → 实体 ID
- relation_type → relates_to / blocks / resolves / improves

---

## 3. API 设计

### 3.1 知识条目 CRUD

```
POST   /api/knowledge              — 新增知识条目
GET    /api/knowledge              — 查询列表（支持过滤）
GET    /api/knowledge/:id          — 详情
PUT    /api/knowledge/:id          — 更新
DELETE /api/knowledge/:id          — 删除
```

### 3.2 知识关联

```
POST   /api/knowledge/link         — 建立关联
POST   /api/knowledge/unlink        — 解除关联
GET    /api/knowledge/:id/links     — 查看某条目的所有关联
GET    /api/knowledge/by-entity/:type/:id  — 查看某实体的关联知识
```

### 3.3 查询参数

| 参数 | 说明 | 示例 |
|------|------|------|
| category | 按分类过滤 | category=failure_postmortem |
| source_type | 按来源类型 | source_type=task |
| source_id | 按来源ID | source_id=xxx |
| tag | 按标签 | tag=yolo |
| keyword | 全文搜索 | keyword=resnet |

---

## 4. 分类说明

| 分类 | 说明 | 典型场景 |
|------|------|----------|
| failure_postmortem | 失败复盘 | 某次 YOLO 训练失败根因分析 |
| model_conclusion | 模型结论 | ResNet18 在某数据集上的 mAP 结论 |
| task_experience | 任务经验 | 某类任务的最佳实践 |
| general_note | 通用笔记 | 任意记录 |

---

## 5. 关联类型说明

| 关联类型 | 说明 |
|----------|------|
| relates_to | 相关 |
| blocks | 阻塞 |
| resolves | 解决 |
| improves | 改进 |

---

## 6. 审计留痕

所有知识操作写入 audit_logs：
- KNOWLEDGE_CREATED
- KNOWLEDGE_UPDATED
- KNOWLEDGE_DELETED
- KNOWLEDGE_LINKED
- KNOWLEDGE_UNLINKED

---

## 7. 目录结构

```
repo/
├─ apps/local-api/src/
│  └─ knowledge/index.ts       — 知识中心路由 + 逻辑
│
├─ apps/local-api/src/db/
│  └─ builtin-sqlite.ts         — 新增 knowledge_entries + knowledge_links 表
│
├─ apps/web-ui/src/
│  ├─ pages/Knowledge.tsx      — 知识列表页（轻量入口）
│  └─ components/ui/KnowledgeCard.tsx — 知识卡片组件
│
└─ docs/
   ├─ v6.1.0_scope_lock.md
   ├─ v6.1.0_not_in_scope.md
   ├─ knowledge_center_architecture.md
   └─ knowledge_entry_spec.md
```

---

## 8. 回退方案

删除以下内容即可回退：
```
apps/local-api/src/knowledge/
apps/web-ui/src/pages/Knowledge.tsx
apps/web-ui/src/components/ui/KnowledgeCard.tsx
```
数据库表保留（不影响主功能）。审计日志保留历史记录。

---

**Status**: ARCHITECTURE DEFINED — 2026-04-13
