# YOLO 冻结态接入盘点

## 1. YOLO 插件当前状态

| 属性 | 值 |
|------|-----|
| plugin_id | vision-yolo |
| display_name | Official Vision YOLO |
| status | **frozen** |
| risk_level | MEDIUM |
| enabled | true |
| active | true |
| init_status | success |

## 2. YOLO 现有集成点

### 2.1 训练配置 (Training)
位置：`apps/local-api/src/training/index.ts`

| config_code | 名称 | 模型 | 用途 |
|-------------|------|------|------|
| yolo-detect-fast | YOLO Detect Fast | yolov8n | 快速验证 |
| yolo-detect-standard | YOLO Detect Standard | yolov8n | 标准训练 |
| yolo-detect-accurate | YOLO Detect Accurate | yolov8n | 高精度 |
| yolo-detect-debug | YOLO Detect Debug | yolov8n | 调试 |

### 2.2 数据集格式
位置：`apps/local-api/src/datasets/index.ts`

- label_format 支持: `coco`, `yolo`, `coco_person` 等
- 当前麻将数据集使用: `yolo` 格式

### 2.3 SAM Handoff
位置：`apps/local-api/src/experiments/sam_handoffs.ts`

- YOLO 检测结果传递给 SAM 进行精修
- 表: `sam_handoffs` (v3.7.0 引入)

### 2.4 Workers
位置：`workers/python-worker/`

| 文件 | 用途 |
|------|------|
| eval_runner.py | YOLO 评估执行 |
| trainer_runner.py | YOLO 训练执行 |
| mahjong_classify_train.py | YOLO→Classify 格式转换 |

### 2.5 模型文件
位置：`workers/python-worker/`

| 文件 | 用途 |
|------|------|
| yolov8n.pt | YOLOv8nano 检测模型 |
| yolov8n-cls.pt | YOLOv8nano 分类模型 |
| yolo26n.pt | YOLO26n 检测模型 |

## 3. 模板中的 YOLO

### 3.1 Vision Pipeline E2E
模板: `tpl-vision-pipeline-e2e`

步骤:
1. yolo_detect - YOLO 检测
2. sam_handoff - SAM 交接
3. sam_segment - SAM 分割
4. classifier_verify - 分类器验证
5. tracker_run - 跟踪
6. rule_engine - 规则引擎

### 3.2 Mahjong Detect
模板: `tpl-mahjong-detect` (status: planned)

步骤:
1. yolo_detect - 麻将牌面检测

## 4. F1 实施 - YOLO 支线注册

### 4.1 Task 注册
在 `apps/local-api/src/tasks/` 中注册 YOLO 相关任务类型:

```typescript
// 现有 task types:
- yolo_detect
- sam_handoff  
- sam_segment
- classifier_verify
- tracker_run
- rule_engine
```

### 4.2 Template 注册
在 `apps/local-api/src/templates/` 中已有 YOLO 模板:
- `tpl-vision-pipeline-e2e` (active)
- `tpl-mahjong-detect` (planned)

### 4.3 Audit 注册
在 `apps/local-api/src/audit/` 中记录 YOLO 相关操作:
- yolo_detect 执行日志
- 模型输入输出审计
- 质量指标审计

## 5. 冻结态约束

### 5.1 允许的操作
- 使用现有 YOLO 模板创建任务
- 执行 YOLO 训练/评估
- 查看 YOLO 相关审计日志

### 5.2 禁止的操作
- 修改 YOLO 插件核心逻辑
- 添加新的 YOLO 模型架构
- 修改 YOLO 与主程序的接口

### 5.3 后续解冻条件
- 完成最小飞轮样板验证
- 确认 YOLO 预标注在链路中稳定运行
- 完成插件化改造评估

---

*创建时间: 2026-04-16*
