# F4 评估与归档 - 设计方案

**阶段**: Phase-A / F4  
**目标**: 实现训练产物 → 评估 → 晋升闸门 → 归档 完整链路  
**日期**: 2026-04-16

---

## 1. 背景与目标

### 1.1 当前状态
- F1: YOLO 链路注册 ✅
- F2: 数据集版本化 ✅
- F3: YOLO 训练闭环 ✅
- F4: 评估与归档 ← 当前阶段

### 1.2 核心目标
实现从 artifact 到 model 的完整评估与归档链路：
```
artifact (training output)
    ↓
evaluation_job (绑定 artifact_id)
    ↓
eval_runner (execution_mode=yolo_eval)
    ↓
evaluation_metrics + evaluation_report
    ↓
promote_gate (threshold check)
    ↓
model (promoted) / artifact (archived)
    ↓
release_note
```

---

## 2. 数据模型设计

### 2.1 evaluations 表扩展

```sql
-- 新增/确认字段
ALTER TABLE evaluations ADD COLUMN artifact_id TEXT DEFAULT '';
ALTER TABLE evaluations ADD COLUMN dataset_version_id TEXT DEFAULT '';
ALTER TABLE evaluations ADD COLUMN execution_mode TEXT DEFAULT 'standard'; -- 'standard' | 'yolo_eval'
ALTER TABLE evaluations ADD COLUMN yolo_eval_config_json TEXT DEFAULT '{}';
ALTER TABLE evaluations ADD COLUMN env_snapshot_json TEXT DEFAULT '{}';
ALTER TABLE evaluations ADD COLUMN exit_code INTEGER DEFAULT 0;
ALTER TABLE evaluations ADD COLUMN evaluation_report_json TEXT DEFAULT '{}';
ALTER TABLE evaluations ADD COLUMN promote_gate_status TEXT DEFAULT 'pending'; -- 'pending' | 'passed' | 'failed'
ALTER TABLE evaluations ADD COLUMN promote_gate_checks_json TEXT DEFAULT '{}';
```

**字段说明**:
- `artifact_id`: 关联 artifacts 表（被评估的训练产物）
- `dataset_version_id`: 关联 dataset_versions 表（评估数据集）
- `execution_mode`: 区分标准评估和 YOLO 专用评估
- `yolo_eval_config_json`: YOLO 评估专用配置（conf, iou, max_det 等）
- `env_snapshot_json`: 环境快照
- `evaluation_report_json`: 完整评估报告
- `promote_gate_status`: 晋升闸门状态
- `promote_gate_checks_json`: 晋升检查项详情

### 2.2 models 表关联

```sql
-- 确认/新增字段
ALTER TABLE models ADD COLUMN evaluation_id TEXT DEFAULT '';
ALTER TABLE models ADD COLUMN artifact_id TEXT DEFAULT '';
ALTER TABLE models ADD COLUMN dataset_version_id TEXT DEFAULT '';
ALTER TABLE models ADD COLUMN training_run_id TEXT DEFAULT '';
ALTER TABLE models ADD COLUMN promotion_status TEXT DEFAULT 'draft'; -- 'draft' | 'candidate' | 'production' | 'archived'
ALTER TABLE models ADD COLUMN release_note_json TEXT DEFAULT '{}';
```

### 2.3 关联关系

```
artifact (1) [training output]
    ↓ artifact_id
evaluations (1) [evaluation job]
    ↓ evaluation_id
models (1) [promoted model]
    ↓ model_id
releases (1) [release package]
```

**来源链回查**:
```
model → evaluation → artifact → training_run → dataset_version → dataset
```

---

## 3. API 设计

### 3.1 创建评估任务

```http
POST /api/evaluations
Content-Type: application/json

{
  "name": "YOLOv8-mahjong-v1-eval",
  "artifact_id": "74dad608-6423-4f11-a1cf-e6a479cd1778",
  "dataset_version_id": "5bd446ad-18ed-443e-b4f8-b409794d2d08",
  "execution_mode": "yolo_eval",
  "eval_config": {
    "conf": 0.25,
    "iou": 0.45,
    "max_det": 300,
    "imgsz": 640,
    "split": "val"  // 'val' | 'test'
  },
  "promote_gate": {
    "mAP50_threshold": 0.85,
    "mAP50_95_threshold": 0.70,
    "precision_threshold": 0.80,
    "recall_threshold": 0.75
  }
}
```

### 3.2 查询评估任务（含 artifact 关联）

```http
GET /api/evaluations/:id

Response:
{
  "ok": true,
  "evaluation": {
    "id": "...",
    "name": "YOLOv8-mahjong-v1-eval",
    "artifact_id": "74dad608-6423-4f11-a1cf-e6a479cd1778",
    "artifact": {
      "name": "yolo_yolov8n_v1_f2_test_001_2026-04-15",
      "path": "/runs/train/.../weights/best.pt",
      "metrics_snapshot_json": {...}
    },
    "dataset_version_id": "5bd446ad-18ed-443e-b4f8-b409794d2d08",
    "dataset_version": {
      "version": "v1_f2_test_001",
      "dataset_id": "..."
    },
    "execution_mode": "yolo_eval",
    "status": "completed",
    "evaluation_report_json": {...},
    "promote_gate_status": "passed",
    "promote_gate_checks_json": {...}
  }
}
```

### 3.3 查询评估报告

```http
GET /api/evaluations/:id/report

Response:
{
  "ok": true,
  "report": {
    "summary": {
      "mAP50": 0.9172,
      "mAP50_95": 0.7796,
      "precision": 0.89,
      "recall": 0.85,
      "f1_score": 0.87
    },
    "per_class": [...],
    "confusion_matrix": [...],
    "promote_gate_result": {
      "status": "passed",
      "checks": [
        {"metric": "mAP50", "value": 0.9172, "threshold": 0.85, "passed": true},
        {"metric": "mAP50_95", "value": 0.7796, "threshold": 0.70, "passed": true}
      ]
    }
  }
}
```

### 3.4 晋升模型

```http
POST /api/evaluations/:id/promote
Content-Type: application/json

{
  "promotion_status": "candidate",  // 'candidate' | 'production'
  "release_note": {
    "version": "v1.0.0",
    "title": "YOLOv8 Mahjong Detection v1",
    "changes": ["Initial release with 34 classes"],
    "metrics": {"mAP50": 0.9172, "mAP50_95": 0.7796},
    "dataset_version": "v1_f2_test_001",
    "training_config": {...}
  }
}

Response:
{
  "ok": true,
  "model": {
    "id": "...",
    "name": "yolov8-mahjong-v1",
    "status": "candidate",
    "evaluation_id": "...",
    "artifact_id": "...",
    "release_note_json": {...}
  }
}
```

### 3.5 查询来源链

```http
GET /api/models/:id/lineage

Response:
{
  "ok": true,
  "lineage": {
    "model": {...},
    "evaluation": {...},
    "artifact": {...},
    "training_run": {...},
    "dataset_version": {...},
    "dataset": {...}
  }
}
```

---

## 4. Eval Runner 实现

### 4.1 execution_mode=yolo_eval 支持

修改 `eval_runner.py`:

```python
def run_evaluation(job_config):
    execution_mode = job_config.get('execution_mode', 'standard')
    
    if execution_mode == 'yolo_eval':
        return run_yolo_evaluation(job_config)
    else:
        return run_standard_evaluation(job_config)

def run_yolo_evaluation(job_config):
    # 1. 获取 artifact 和 dataset_version
    artifact_id = job_config['artifact_id']
    dataset_version_id = job_config['dataset_version_id']
    
    artifact = fetch_artifact(artifact_id)
    dataset_version = fetch_dataset_version(dataset_version_id)
    
    # 2. 准备评估配置
    eval_config = job_config.get('yolo_eval_config_json', {})
    model_path = artifact['path']
    data_yaml = dataset_version.get('dataset_yaml_path') or generate_data_yaml(dataset_version)
    
    # 3. 记录环境快照
    env_snapshot = capture_env_snapshot()
    save_env_snapshot(job_config['id'], env_snapshot)
    
    # 4. 执行 YOLO 评估
    cmd = build_yolo_val_command(model_path, data_yaml, eval_config)
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    
    # 5. 实时日志记录
    for line in process.stdout:
        log_line(job_config['id'], line.decode())
    
    # 6. 等待完成
    exit_code = process.wait()
    
    # 7. 解析评估结果
    results = parse_evaluation_results(job_config['id'])
    
    # 8. 生成评估报告
    report = generate_evaluation_report(results)
    
    # 9. 执行晋升闸门检查
    promote_gate = job_config.get('promote_gate', {})
    gate_result = check_promote_gate(results, promote_gate)
    
    return {
        'exit_code': exit_code,
        'metrics': results['metrics'],
        'report': report,
        'promote_gate_status': gate_result['status'],
        'promote_gate_checks': gate_result['checks']
    }
```

### 4.2 晋升闸门检查

```python
def check_promote_gate(results, promote_gate):
    checks = []
    all_passed = True
    
    metrics = results.get('metrics', {})
    
    check_items = [
        ('mAP50', metrics.get('mAP50', 0), promote_gate.get('mAP50_threshold', 0.85)),
        ('mAP50_95', metrics.get('mAP50_95', 0), promote_gate.get('mAP50_95_threshold', 0.70)),
        ('precision', metrics.get('precision', 0), promote_gate.get('precision_threshold', 0.80)),
        ('recall', metrics.get('recall', 0), promote_gate.get('recall_threshold', 0.75)),
    ]
    
    for metric_name, value, threshold in check_items:
        passed = value >= threshold
        checks.append({
            'metric': metric_name,
            'value': value,
            'threshold': threshold,
            'passed': passed
        })
        if not passed:
            all_passed = False
    
    return {
        'status': 'passed' if all_passed else 'failed',
        'checks': checks
    }
```

---

## 5. 模型归档流程

### 5.1 自动归档（评估通过后）

```python
def auto_archive_on_pass(evaluation_id):
    evaluation = fetch_evaluation(evaluation_id)
    
    if evaluation['promote_gate_status'] != 'passed':
        return {'ok': False, 'error': 'Promote gate not passed'}
    
    # 1. 创建 model 记录
    model_id = create_model_from_evaluation(evaluation)
    
    # 2. 更新 artifact 状态
    update_artifact_status(evaluation['artifact_id'], 'promoted')
    
    # 3. 生成 release note
    release_note = generate_release_note(evaluation)
    
    # 4. 更新 model 的 release_note
    update_model_release_note(model_id, release_note)
    
    return {
        'ok': True,
        'model_id': model_id,
        'release_note': release_note
    }
```

### 5.2 Release Note 格式

```json
{
  "version": "v1.0.0",
  "title": "YOLOv8 Mahjong Detection Model",
  "created_at": "2026-04-16T10:00:00Z",
  "model_info": {
    "architecture": "yolov8n",
    "input_size": 640,
    "num_classes": 34,
    "class_names": ["1w", "2w", ...]
  },
  "training_info": {
    "dataset_version": "v1_f2_test_001",
    "epochs": 100,
    "batch_size": 16,
    "training_duration": "2h 30m"
  },
  "evaluation_metrics": {
    "mAP50": 0.9172,
    "mAP50_95": 0.7796,
    "precision": 0.89,
    "recall": 0.85
  },
  "promote_gate_result": {
    "status": "passed",
    "summary": "All metrics exceed thresholds"
  },
  "artifacts": {
    "model_file": "/runs/train/.../weights/best.pt",
    "config_file": "/runs/train/.../args.yaml"
  },
  "changelog": [
    "Initial release with 34 mahjong tile classes",
    "Trained on v1_f2_test_001 dataset",
    "Achieved 91.72% mAP50 on validation set"
  ]
}
```

---

## 6. 验证清单

### 6.1 功能验证

| 验证项 | 方法 | 通过标准 |
|--------|------|----------|
| 创建评估任务 | POST /api/evaluations | 返回 eval_id, status=running |
| 绑定 artifact | 查询 eval 详情 | artifact_id 正确关联 |
| 绑定 dataset_version | 查询 eval 详情 | dataset_version_id 正确关联 |
| 启动评估 | 触发 eval_runner | 进程启动，日志开始写入 |
| 实时日志 | GET /api/evaluations/:id/logs | 返回日志流 |
| 评估报告 | GET /api/evaluations/:id/report | 返回完整报告 |
| 晋升闸门 | 查询 promote_gate_status | passed/failed 明确 |
| 模型归档 | 查询 models 表 | 记录存在，状态正确 |
| release note | 查询 model.release_note_json | 内容完整 |
| 来源链回查 | GET /api/models/:id/lineage | 返回完整链路 |

### 6.2 失败场景验证

| 场景 | 预期行为 |
|------|----------|
| artifact 不存在 | 返回 400 错误 |
| dataset_version 未 approved | 返回 400 错误 |
| 评估指标不达标 | promote_gate_status=failed |
| 评估脚本崩溃 | exit_code != 0, status=failed |

---

## 7. 实施步骤

### Step 1: 数据库扩展
- [ ] 添加 evaluations 字段: artifact_id, dataset_version_id, execution_mode, yolo_eval_config_json, env_snapshot_json, exit_code, evaluation_report_json, promote_gate_status, promote_gate_checks_json
- [ ] 添加 models 字段: evaluation_id, artifact_id, dataset_version_id, training_run_id, promotion_status, release_note_json
- [ ] 添加索引: idx_eval_artifact, idx_eval_dataset_version, idx_model_evaluation

### Step 2: API 实现
- [ ] 修改 POST /api/evaluations 支持 artifact_id 和 dataset_version_id
- [ ] 实现 GET /api/evaluations/:id/report
- [ ] 实现 POST /api/evaluations/:id/promote
- [ ] 实现 GET /api/models/:id/lineage

### Step 3: Eval Runner 改造
- [ ] 添加 execution_mode=yolo_eval 分支
- [ ] 实现环境快照捕获
- [ ] 实现实时日志记录
- [ ] 实现晋升闸门检查

### Step 4: 验证
- [ ] 创建评估任务并跑通
- [ ] 验证所有检查点
- [ ] 生成验收报告

---

## 8. 风险与边界

### 8.1 已知风险
1. **评估数据集**: 需要确保 dataset_version 有 val/test split
2. **YOLO 版本**: ultralytics 版本兼容性
3. **指标阈值**: promote_gate 阈值需要根据业务调整

### 8.2 边界约束
1. 先实现单模型评估，批量评估后续扩展
2. 先支持 YOLOv8，其他版本后续扩展
3. 评估报告先输出标准格式，可视化后续扩展

---

**设计者**: Agent 代可行-1  
**日期**: 2026-04-16
