# Output Template Spec — 标准输出模板规范

**版本**: 1.0  
**日期**: 2026-04-13

---

## 概述

标准输出体系为 AGI Model Factory 提供统一的文本产物生成能力。每次生成均基于模板 + 参数，产生确定性的 Markdown 文件。

---

## 模板分类

| 模板类型 | 用途 | 典型触发时机 |
|---------|------|------------|
| `task_closure_report` | 任务收口报告 | 任务完成或取消后 |
| `evaluation_report` | 评估报告 | 模型评估完成后 |
| `model_release_note` | 模型发布说明 | 模型归档/发布时 |
| `seal_backup_note` | 封板/备份说明 | 系统封板或备份完成后 |

---

## 变量语法

使用 `${variable}` Python string.Template 风格：

```
## ${title}

**任务**: ${task_name}  
**执行时间**: ${executed_at}  
**执行者**: ${executed_by}

### 执行摘要

${summary}

### 关键结果

${key_results}

### 建议

${recommendations}
```

**所有变量均需在 API 调用时提供**，类型为 `Record<string, string>`。

---

## 模板元数据头

每个模板文件顶部包含 YAML front matter：

```markdown
---
template_id: task_closure_report
template_name: 任务收口报告
version: 1.0
description: 标准化任务收口报告模板
required_vars:
  - task_name
  - executed_at
  - executed_by
  - summary
  - key_results
  - recommendations
optional_vars:
  - tags
  - linked_artifacts
  - linked_models
---
```

---

## 生成流程

1. 用户选择模板类型
2. 前端获取模板预览（`GET /api/outputs/:type/preview`）
3. 用户填写必填参数
4. 前端调用 `POST /api/outputs/generate`
5. 后端读取模板文件，替换变量，写入输出目录
6. 审计日志写入 `audit_logs`
7. 返回 `{ ok, file_path, content }`
8. 前端展示预览 + 下载链接

---

## 输出目录结构

```
E:\AGI_Factory\repo\outputs\
└─ {type}\
   └─ {YYYY-MM-DD}\
      └─ {timestamp}_{type}_{slug}.md
```

示例：
```
E:\AGI_Factory\repo\outputs\task_closure_report\2026-04-13\1744500000_task_closure_report_eval_v410.md
```

---

## 审计留痕

每次生成写入 audit_logs：
- `category`: `output`
- `action`: `OUTPUT_GENERATED`
- `target`: `{output_type}:{file_path}`
- `result`: `success`
- `detail_json`: `{ template_type, params, output_path, file_size, generated_at, generated_by }`

---

## 安全约束

1. 输出路径强制在 `outputs/` 子目录下，禁止路径穿越（`..`）
2. 文件名只允许 `[a-zA-Z0-9_-.]`
3. 模板文件只读，由管理员维护
4. 用户输入的变量值做 HTML 转义
