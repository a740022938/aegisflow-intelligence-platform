# YOLO 与视觉支线接入现状盘点

> 编号：INVENTORY-VISION-001  
> 时间：2026-04-15 16:52 GMT+8  
> 基线：v6.5.0 + YOLO frozen baseline (commit 2c84339)

---

## 一、YOLO 当前接入状态

### 1.1 冻结门分布

| 冻结位置 | 所在文件 | 触发条件 | 解冻方式 |
|----------|----------|----------|----------|
| train_model executor | workflow/index.ts | `task_type='vision_detect' && modelFamily='yolo' && ENABLE_LEGACY_YOLO≠true` | 手动设置环境变量 |
| evaluate_model executor | workflow/index.ts | 同上 | 手动设置环境变量 |
| yolo_detect step | workflow/index.ts | `!isLegacyYoloEnabled()` | 手动设置环境变量 |

**冻结机制**：3处冻结门均通过同一个函数`isLegacyYoloEnabled()`控制，代码结构干净，解冻只需改一处即可全部生效。

### 1.2 解冻门槛分析

```
ENABLE_LEGACY_YOLO=true  →  全部3个YOLO路径解锁
```

但解冻后**真实训练需满足**：
1. CUDA PyTorch 已安装（当前RTX 3060不可用）→ T4阻塞项
2. data.yaml 路径存在（当前依赖dataset表中的dataset_yaml字段）
3. trainer_runner.py 环境就绪（当前预检通过）

---

## 二、视觉 Pipeline 接入架构

### 2.1 模板层（workflow/index.ts seedWorkflowFactoryTemplates）

```
tpl-vision-pipeline-e2e
  Step 1: yolo_detect      [冻结]
  Step 2: sam_handoff     [解冻·真实]
  Step 3: sam_segment     [解冻·真实]
  Step 4: classifier_verify [解冻·真实·麻将已通]
  Step 5: tracker_run     [解冻·mock]
  Step 6: rule_engine     [解冻·mock]
```

### 2.2 Step Executor 实现矩阵

| Step Key | 真实/模拟 | 冻结门 | 麻将接入 | 工程状态 |
|----------|-----------|--------|----------|----------|
| yolo_detect | 模拟（runs表写记录） | ✅ | ⚠️ 模板预留 | 待解冻 |
| sam_handoff | 真实（sam_handoff_builder.py） | ❌ | ❌ | 稳定 |
| sam_segment | 真实（sam_runner.py） | ❌ | ❌ | 稳定 |
| classifier_verify | 真实（classifier_runner.py） | ❌ | ✅ T3已通 | 稳定 |
| tracker_run | mock | ❌ | ❌ | 弱·待升级 |
| rule_engine | mock | ❌ | ❌ | 弱·待升级 |

### 2.3 中间结果数据流

```
YOLO detect
  ↓ [写 runs 表]
SAM handoff builder.py
  ↓ [读 eval_manifest → dataset_yaml]
  → 写入 sam_handoffs 表 + sam_handoff_manifest.json
SAM runner.py
  ↓ [读 handoff manifest]
  → 写入 sam_segmentations 表 + sam_segmentation_manifest.json
classifier_runner.py
  ↓ [读 segmentation manifest]
  → 写入 classifier_verifications 表 + verification_manifest.json
tracker_runner.py
  ↓ [读 verification manifest]
  → 写入 tracker_runs 表 + tracker_manifest.json
rule_engine_runner.py
  ↓ [读 tracker manifest]
  → 写入 rule_engine_runs 表 + rule_manifest.json
```

**数据流完整性**：5个中间表全部存在，manifest链完整。  
**数据流弱点**：依赖eval_result_summary_json反查dataset_yaml路径（sam_handoff_builder），路径推导脆弱。

---

## 三、vision-bus（F10视觉能力总线）

### 3.1 Catalog 结构

vision-bus/index.ts 中定义了完整的 VisionCatalog：

```
Pipeline元数据（11个）
  ├─ yolo_detect          frozen
  ├─ sam_handoff          active ✅
  ├─ sam_segment          active ✅
  ├─ classifier_verification  active ✅
  ├─ tracker_run          frozen
  ├─ rule_engine          frozen
  ├─ mahjong_detect       planned
  ├─ mahjong_classify     planned
  └─ mahjong_fusion       planned

Artifact类型注册（11个）
  ├─ checkpoint / report
  ├─ detection_result / sam_handoff / sam_segmentation
  ├─ classifier_result / tracker_result / rule_result
  └─ 麻将3型（detection/classification/fusion）

中间结果查询API（5个）
  ├─ getVisionSamHandoffs
  ├─ getVisionSamSegmentations
  ├─ getVisionClassifierVerifications
  ├─ getVisionTrackerRuns
  └─ getVisionRuleEngineRuns
```

### 3.2 vision-bus 评价

| 维度 | 评分 | 说明 |
|------|------|------|
| 元数据设计 | ⭐⭐⭐⭐⭐ | 管线/artifact统一建模，非常适合插件发现 |
| API覆盖 | ⭐⭐⭐⭐ | 5个查询接口完整 |
| 与workflow耦合 | ⭐⭐⭐ | 静态hardcode，无动态发现 |
| plugin化潜力 | ⭐⭐⭐⭐⭐ | catalog机制天然适合作为插件发现层 |

---

## 四、麻将模块现状

### 4.1 T1~T3 完结状态

| 阶段 | 状态 | 说明 |
|------|------|------|
| T1 注册 | ✅ 完成 | catalog中planned状态，模板已seed |
| T2 数据集 | ✅ 完成 | clean 3214对，datasets表已登记 |
| T3 分类训练 | ✅ 完成 | ResNet18训练，weights在T3 dryrun |
| T4 训练 | ❌ 阻塞 | PyTorch CUDA未装（RTX 3060不可用） |

### 4.2 麻将代码分布

```
vision-bus catalog     → 3个planned管线（detect/classify/fusion）
workflow模板           → 3个麻将模板seed（detect/classify/fusion）
classifier_verify executor → execution_mode支持mahjong_detect
classifier_runner.py   → T3真实推理跑通
```

### 4.3 T4阻塞分析

**根因**：PyTorch为CPU-only版本（2.11.0+cpu），RTX 3060不可用。

**解决方案**（非本轮任务）：
1. 重装CUDA版PyTorch（pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118）
2. 或继续CPU训练（速度慢但可跑）

---

## 五、YOLO 是否应保留在主程序内

### 5.1 保留的理由

✅ **YOLO是机器学习平台的核心能力**，不是可选扩展  
✅ **与主程序深度集成**：dataset版本管理 + experiment追踪 + artifact存储 + 评测报告  
✅ **视觉pipeline已完整接入**：6步链路上游是YOLO，下游是SAM/classifier/tracker/rule  
✅ **vision-bus已完成建模**：管线发现机制已存在  
✅ **冻结门干净**：3处门控共享同一函数，解冻路径清晰  

### 5.2 不应保留的理由（插件化）

❌ **YOLO是重量级依赖**：CUDA/PyTorch/yolov8n.pt，约2~5GB  
❌ **专业用户需要自定义pipeline**：硬编码6步executor无法满足自定义组合  
❌ **tracker和rule_engine是弱项**：plugin化后可让专业团队提供更好实现  

### 5.3 结论

**当前阶段（v6.5.0）：应保留在主程序内**

理由：
1. **主线需要YOLO作为ML平台标杆能力展示**
2. **插件系统尚未激活**，拆出去反而是无人维护的悬空代码
3. **vision-bus是更好的插件化入口**：把catalog的静态定义升级为动态发现，插件化的是"发现层"而非"实现层"
4. **T4尚未完成**：现在拆插件是提前优化

**未来（插件系统激活后）：建议两步走**
- 第一步：vision-bus catalog升级为动态发现（插件发现层）
- 第二步：tracker/rule_engine作为第一批真实插件（实现层）

---

## 六、接入现状总结

| 维度 | 结论 |
|------|------|
| YOLO冻结态 | 3门干净，解冻路径清晰 |
| Pipeline接入 | 6步完整链路上线，2真实+2mock+1冻结+1麻将预留 |
| vision-bus | 设计优秀，catalog天然适合插件发现层 |
| 麻将模块 | T1~T3完成，T4阻塞于CUDA |
| YOLO去留建议 | 保留在主程序内，等插件系统激活后分两步插件化vision发现层 |
| 最大弱点 | tracker/rule_engine是mock，真实推理链在sam+classifier后断了一截 |

---

## 七、YOLO 扩展性评估

### 7.1 当前硬编码问题

workflow/index.ts 中：
```typescript
const STEP_EXECUTORS = {
  yolo_detect: executeYoloDetect,      // 写死
  sam_handoff: executeSamHandoff,        // 写死
  sam_segment: executeSamSegment,        // 写死
  classifier_verify: executeClassifierVerify,  // 写死
  tracker_run: executeTrackerRun,        // 写死
  rule_engine: executeRuleEngine,        // 写死
};
```

**问题**：想新增一个YOLO变体（如YOLOv10）或替换tracker算法，**必须改workflow/index.ts**。

### 7.2 扩展性方向（插件系统激活后）

```
PluginManager
  └─ plugin: yolo-yolov8n
       capabilities: ["training", "vision"]
  └─ plugin: yolo-yolov10
       capabilities: ["training", "vision"]
  └─ plugin: sam2-tracker
       capabilities: ["compute", "vision"]
  └─ plugin: deepsort-tracker
       capabilities: ["compute", "vision"]

workflow/index.ts（改造后）
  └─ STEP_EXECUTORS[step_key]
       ├─ 查 vision-bus catalog
       ├─ 查 PluginManager 已启用的同能力插件
       └─ 分发执行
```

---

*本报告为只读存档。*
