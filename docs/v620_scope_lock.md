# v6.2.0 范围锁定 — 标准输出体系

**版本**: 6.2.0  
**日期**: 2026-04-13  
**状态**: 🔒 锁定

---

## 目标

让系统具备标准化交付能力：任务完成后、训练完成后、模型归档后，都能产出统一格式的报告与说明。

---

## 必须完成（Must Have）

### 1. 文档规范
- `docs/output_template_spec.md` — 输出模板元规范（变量语法、分类体系、生成流程）
- `docs/report_template_spec.md` — 报告模板规范（字段结构、必填/可选、输出格式）

### 2. 标准模板目录（4 类）
- `templates/outputs/task_closure_report.md` — 任务收口报告模板
- `templates/outputs/evaluation_report.md` — 评估报告模板
- `templates/outputs/model_release_note.md` — 模型发布说明模板
- `templates/outputs/seal_backup_note.md` — 封板/备份说明模板

### 3. 后端接口
- `apps/local-api/src/outputs/index.ts` — 输出生成服务
- `POST /api/outputs/generate` — 生成标准输出（模板类型 + 参数 → Markdown 文本）
- `GET /api/outputs/templates` — 列出可用模板
- `GET /api/outputs/:type/preview` — 预览模板变量框架
- 审计留痕：OUTPUT_GENERATED（每条生成记录写入 audit_logs）

### 4. 最小 UI 入口
- 新建 `apps/web-ui/src/pages/Outputs.tsx` 或在现有页面嵌入
- 支持选择模板类型、填写参数、触发生成、预览结果、保存文件

### 5. 验收清单
- [ ] 4 类标准模板存在且可读
- [ ] POST /api/outputs/generate 返回标准 Markdown
- [ ] UI 可触发生成并显示结果
- [ ] 输出文件可保存到约定目录
- [ ] 审计日志记录生成动作
- [ ] 回退脚本存在且可执行
- [ ] 收口报告写入 audit/
- [ ] 备份包包含所有新文件

---

## 技术决策

1. **模板引擎**：使用 Python string.Template 风格的 `${variable}` 语法，简单可靠
2. **输出格式**：纯 Markdown（.md），后续可扩展 TXT/PDF
3. **存储位置**：`E:\AGI_Factory\repo\outputs\{type}\{date}\{filename}.md`
4. **审计**：OUTPUT_GENERATED 写入 audit_logs，detail_json 包含 template_type/params/output_path
5. **API 统一返回结构**：`{ ok, output_type, file_path, content, generated_at }`
