# F3 YOLO 训练闭环 - 设计方案

**阶段**: Phase-A / F3  
**目标**: 实现 YOLO 训练闭环，打通 dataset_version → training → checkpoint → artifact 链路  
**日期**: 2026-04-16

---

## 1. 背景与目标

### 1.1 当前状态
- F1: YOLO 链路注册 ✅
- F2: 数据集版本化 ✅
- F3: YOLO 训练闭环 ← 当前阶段

### 1.2 核心目标
实现从 dataset_version 到训练产物的完整闭环：
```
dataset_version (approved)
    ↓
training_job (绑定 dataset_version_id)
    ↓
trainer_runner (execution_mode=yolo)
    ↓
checkpoint + logs + metrics
    ↓
artifact (promotion ready)
```

---

## 2. 数据模型设计

### 2.1 training_jobs 表扩展

```sql
-- 新增/确认字段
ALTER TABLE training_jobs ADD COLUMN dataset_version_id TEXT DEFAULT '';
ALTER TABLE training_jobs ADD COLUMN execution_mode TEXT DEFAULT 'standard'; -- 'standard' | 'yolo'
ALTER TABLE training_jobs ADD COLUMN yolo_config_json TEXT DEFAULT '{}';
ALTER TABLE training_jobs ADD COLUMN env_snapshot_json TEXT DEFAULT '{}';
```

**字段说明**:
- `dataset_version_id`: 关联 dataset_versions 表
- `execution_mode`: 区分标准训练和 YOLO 专用训练
- `yolo_config_json`: YOLO 专用配置（超参、anchor、augmentation 等）
- `env_snapshot_json`: 环境快照（Python 版本、PyTorch 版本、CUDA 版本等）

### 2.2 training_checkpoints 表确认

已存在字段:
- `run_id`: 关联 training_jobs
- `step`, `epoch`: 训练进度
- `checkpoint_path`: 模型文件路径
- `metrics_json`: 训练指标
- `is_best`, `is_latest`: 标记位

### 2.3 关联关系

```
dataset_versions (1)
    ↓
training_jobs (N) [dataset_version_id]
    ↓
training_checkpoints (N) [run_id]
    ↓
artifacts (1) [training_job_id]
```

---

## 3. API 设计

### 3.1 创建 YOLO 训练任务

```http
POST /api/training-jobs
Content-Type: application/json

{
  "name": "YOLOv8-mahjong-v1-training",
  "dataset_version_id": "5bd446ad-18ed-443e-b4f8-b409794d2d08",
  "execution_mode": "yolo",
  "model_config": {
    "model_type": "yolov8n",
    "pretrained": true,
    "epochs": 100,
    "batch_size": 16,
    "imgsz": 640,
    "lr0": 0.01,
    "lrf": 0.01,
    "momentum": 0.937,
    "weight_decay": 0.0005
  },
  "resource_config": {
    "device": "cuda:0",
    "workers": 8
  }
}
```

### 3.2 查询训练任务（含 dataset_version 关联）

```http
GET /api/training-jobs/:id

Response:
{
  "ok": true,
  "job": {
    "id": "...",
    "name": "YOLOv8-mahjong-v1-training",
    "dataset_version_id": "5bd446ad-18ed-443e-b4f8-b409794d2d08",
    "dataset_version": {
      "version": "v1_f2_test_001",
      "dataset_id": "...",
      "status": "approved"
    },
    "execution_mode": "yolo",
    "status": "running",
    "yolo_config_json": {...},
    "env_snapshot_json": {...}
  }
}
```

### 3.3 查询训练日志

```http
GET /api/training-jobs/:id/logs

Response:
{
  "ok": true,
  "logs": [...],
  "exit_code": 0,
  "last_line": "Training completed, best mAP: 0.892"
}
```

### 3.4 查询 checkpoints

```http
GET /api/training-jobs/:id/checkpoints

Response:
{
  "ok": true,
  "checkpoints": [
    {
      "id": "...",
      "epoch": 100,
      "checkpoint_path": "/runs/train/exp/weights/best.pt",
      "metrics_json": {"mAP50": 0.892, "mAP50-95": 0.756},
      "is_best": true
    }
  ]
}
```

---

## 4. Trainer Runner 实现

### 4.1 execution_mode=yolo 支持

修改 `trainer_runner.py`:

```python
def run_training(job_config):
    execution_mode = job_config.get('execution_mode', 'standard')
    
    if execution_mode == 'yolo':
        return run_yolo_training(job_config)
    else:
        return run_standard_training(job_config)

def run_yolo_training(job_config):
    # 1. 获取 dataset_version
    dataset_version_id = job_config['dataset_version_id']
    dataset_version = fetch_dataset_version(dataset_version_id)
    
    # 2. 准备数据集路径
    data_yaml_path = dataset_version['dataset_yaml_path']
    if not data_yaml_path:
        data_yaml_path = generate_data_yaml(dataset_version)
    
    # 3. 构建 YOLO 训练命令
    yolo_config = job_config.get('yolo_config_json', {})
    cmd = build_yolo_command(yolo_config, data_yaml_path)
    
    # 4. 记录环境快照
    env_snapshot = capture_env_snapshot()
    save_env_snapshot(job_config['id'], env_snapshot)
    
    # 5. 执行训练
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    
    # 6. 实时日志记录
    for line in process.stdout:
        log_line(job_config['id'], line.decode())
    
    # 7. 等待完成
    exit_code = process.wait()
    
    # 8. 解析结果
    results = parse_training_results(job_config['id'])
    
    # 9. 保存 checkpoints
    checkpoints = save_checkpoints(job_config['id'], results)
    
    return {
        'exit_code': exit_code,
        'checkpoints': checkpoints,
        'metrics': results.get('metrics', {})
    }
```

### 4.2 环境快照捕获

```python
def capture_env_snapshot():
    import sys
    import torch
    import platform
    
    return {
        'python_version': sys.version,
        'pytorch_version': torch.__version__,
        'cuda_version': torch.version.cuda if torch.cuda.is_available() else None,
        'cuda_available': torch.cuda.is_available(),
        'gpu_count': torch.cuda.device_count() if torch.cuda.is_available() else 0,
        'platform': platform.platform(),
        'timestamp': datetime.now().isoformat()
    }
```

### 4.3 日志实时记录

```python
def log_line(job_id, line):
    # 写入 training_logs 表
    db.execute('''
        INSERT INTO training_logs (id, job_id, level, message, created_at)
        VALUES (?, ?, ?, ?, ?)
    ''', (uuid(), job_id, 'info', line.strip(), now()))
    
    # 解析关键指标
    if 'mAP50' in line:
        metrics = parse_metrics(line)
        update_job_metrics(job_id, metrics)
```

---

## 5. 训练产物管理

### 5.1 Checkpoint 保存

```python
def save_checkpoints(job_id, results):
    checkpoint_dir = f"/runs/train/{job_id}"
    checkpoints = []
    
    for pt_file in glob(f"{checkpoint_dir}/weights/*.pt"):
        epoch = parse_epoch_from_filename(pt_file)
        is_best = 'best' in pt_file
        is_latest = 'last' in pt_file
        
        checkpoint_id = uuid()
        db.execute('''
            INSERT INTO training_checkpoints 
            (id, run_id, epoch, checkpoint_path, is_best, is_latest, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (checkpoint_id, job_id, epoch, pt_file, is_best, is_latest, now()))
        
        checkpoints.append({
            'id': checkpoint_id,
            'path': pt_file,
            'is_best': is_best
        })
    
    return checkpoints
```

### 5.2 Artifact 生成

训练完成后，最佳 checkpoint 自动转为 artifact:

```python
def create_artifact_from_checkpoint(job_id, checkpoint_id):
    checkpoint = fetch_checkpoint(checkpoint_id)
    job = fetch_training_job(job_id)
    
    artifact_id = uuid()
    db.execute('''
        INSERT INTO artifacts
        (id, name, artifact_type, training_job_id, dataset_id, path, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        artifact_id,
        f"yolo-model-{job['name']}-epoch{checkpoint['epoch']}",
        'model',
        job_id,
        job['dataset_version_id'],
        checkpoint['checkpoint_path'],
        now(),
        now()
    ))
    
    return artifact_id
```

---

## 6. 验证清单

### 6.1 功能验证

| 验证项 | 方法 | 通过标准 |
|--------|------|----------|
| 创建训练任务 | POST /api/training-jobs | 返回 job_id, status=queued |
| 绑定 dataset_version | 查询 job 详情 | dataset_version_id 正确关联 |
| 启动训练 | 触发 runner | 进程启动，日志开始写入 |
| 实时日志 | GET /api/training-jobs/:id/logs | 返回日志流 |
| checkpoint 保存 | 查询 checkpoints 表 | 至少 1 条记录，路径有效 |
| 环境快照 | 查询 env_snapshot_json | 包含 Python/PyTorch/CUDA 版本 |
| 训练完成 | 查询 job status | status=completed, exit_code=0 |
| artifact 生成 | 查询 artifacts 表 | 关联 training_job_id |
| 回查关联 | GET /api/dataset-versions/:id | 返回关联的 training_jobs |

### 6.2 失败场景验证

| 场景 | 预期行为 |
|------|----------|
| dataset_version 不存在 | 返回 400 错误 |
| dataset_version 未 approved | 返回 400 错误 |
| 训练脚本崩溃 | exit_code != 0, status=failed, 日志保留 |
| CUDA OOM | 捕获异常，记录错误，status=failed |
| 磁盘满 | 捕获异常，记录错误，status=failed |

---

## 7. 实施步骤

### Step 1: 数据库扩展
- [ ] 添加 training_jobs 字段: dataset_version_id, execution_mode, yolo_config_json, env_snapshot_json
- [ ] 添加索引: idx_tj_dataset_version_id

### Step 2: API 实现
- [ ] 修改 POST /api/training-jobs 支持 dataset_version_id
- [ ] 修改 GET /api/training-jobs/:id 返回 dataset_version 关联
- [ ] 实现 GET /api/training-jobs/:id/logs
- [ ] 实现 GET /api/training-jobs/:id/checkpoints

### Step 3: Trainer Runner 改造
- [ ] 添加 execution_mode=yolo 分支
- [ ] 实现环境快照捕获
- [ ] 实现实时日志记录
- [ ] 实现 checkpoint 自动保存

### Step 4: 验证
- [ ] 创建训练任务并跑通
- [ ] 验证所有检查点
- [ ] 生成验收报告

---

## 8. 风险与边界

### 8.1 已知风险
1. **GPU 资源**: 需要确保训练机有可用 GPU
2. **数据集格式**: YOLO 需要特定格式的 data.yaml
3. **依赖版本**: ultralytics 版本兼容性

### 8.2 边界约束
1. 先实现单 GPU 训练，多 GPU 后续扩展
2. 先支持 YOLOv8，YOLOv5/v7 后续扩展
3. 分类器过滤和人工复核保持为插件能力，不进入主线

---

**设计者**: Agent 代可行-1  
**日期**: 2026-04-16
