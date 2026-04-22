// ============================================================
// workflowSchema.ts — Workflow Composer 类型 & 节点注册
// ============================================================

// === Schema ===
export interface WorkflowDraft {
  id?: string;
  name: string;
  version: string;
  description?: string;
  nodes: ComposerNode[];
  edges: ComposerEdge[];
  params: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  status?: 'draft' | 'validated' | 'error';
}

export interface ComposerNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  collapsed?: boolean;
  label: string;
  params: Record<string, unknown>;
  executable?: boolean;
  frozenHint?: string;
}

export interface ComposerEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// === 节点类型注册 ===
export type NodeType =
  | 'video-source'
  | 'frame-extract'
  | 'frame-clean'
  | 'dataset-register'
  | 'dataset-split'
  | 'train-config-builder'
  | 'train-model'
  | 'evaluate-model'
  | 'archive-model'
  | 'dataset-snapshot'
  | 'dataset-stats'
  | 'compare-baseline'
  | 'badcase-mine'
  | 'export-model'
  | 'release-model'
  | 'release-validate'
  | 'feedback-backflow'
  | 'hardcase-feedback'
  | 'retrain-trigger'
  | 'dataset-loader'
  | 'yolo-detect'
  | 'sam-segment'
  | 'classifier-verify'
  | 'tracker'
  | 'eval-report'
  | 'output-archive'
| 'reroute';

export type PortType =
  | 'video'
  | 'image_batch'
  | 'image'
  | 'dataset'
  | 'split_manifest'
  | 'train_config'
  | 'checkpoint'
  | 'model'
  | 'metrics'
  | 'report'
  | 'labels'
  | 'annotations'
  | 'detections'
  | 'masks'
  | 'badcases'
  | 'artifact'
  | 'classifications'
  | 'tracks'
  | 'any';

export interface ParamValidation {
  min?: number;
  max?: number;
  pattern?: string;
  options?: { value: string; label: string }[];
}

export interface ParamConfig {
  key: string;
  label: string;
  labelZh: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'text';
  required: boolean;
  defaultValue?: unknown;
  default?: unknown;
  options?: { value: string; label: string }[];
  placeholder?: string;
  description?: string;
  validation?: ParamValidation;
  bindable?: boolean;
}

export type NodeStatus = 'executable' | 'experimental' | 'placeholder';
export type NodeCategory = 'input' | 'process' | 'output' | 'utility' | 'training' | 'evaluation' | 'visual';

export interface NodeExecution {
  stepKey?: string;
  enabled: boolean;
  dryRunSupported?: boolean;
  runtimeSupported?: boolean;
}

export interface PortSchema {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface OutputSchema {
  type: string;
  schema?: Record<string, unknown>;
}

export interface NodeConfig {
  type: NodeType;
  displayName?: string;
  version?: string;
  category?: NodeCategory;
  status?: NodeStatus;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  label?: string;
  labelZh?: string;
  inputs: string[];
  outputs: string[];
  params: ParamConfig[];
  execution?: NodeExecution;
  outputSchema?: OutputSchema;
  frozenHint?: string;
}

export const NODE_REGISTRY: Record<NodeType, NodeConfig> = {
'video-source': {
    type: 'video-source',
    displayName: 'Video Source',
    version: '1.0.0',
    category: 'input',
    status: 'executable',
    label: 'Video Source',
    labelZh: '视频源',
    icon: '🎬',
    color: '#60A5FA',
    bgColor: 'rgba(96, 165, 250, 0.08)',
    description: '视频或样本目录输入节点',
    inputs: [],
    outputs: ['video', 'image_batch'],
    params: [
      { key: 'source_path', label: 'Source Path', labelZh: '源路径', type: 'string', required: true, default: 'E:/AGI_Factory/datasets/raw/demo.mp4', placeholder: 'e.g. E:/datasets/raw_videos', bindable: true },
      { key: 'source_type', label: 'Source Type', labelZh: '源类型', type: 'select', required: true, defaultValue: 'video', options: [{ value: 'video', label: 'Video' }, { value: 'image_batch', label: 'Image Batch' }], bindable: false },
    ],
    execution: {
      stepKey: 'video_source',
      enabled: true,
      dryRunSupported: true,
      runtimeSupported: true,
    },
  },
  'frame-extract': {
    type: 'frame-extract',
    label: 'Frame Extract',
    labelZh: '抽帧',
    icon: '🧷',
    color: '#22D3EE',
    bgColor: 'rgba(34, 211, 238, 0.08)',
    description: '从视频抽取帧序列',
    inputs: ['video'],
    outputs: ['image_batch'],
    params: [
      { key: 'fps', label: 'FPS', labelZh: '抽帧频率', type: 'number', required: false, default: 2 },
      { key: 'max_frames', label: 'Max Frames', labelZh: '最大帧数', type: 'number', required: false, default: 0 },
    ],
    execution: { stepKey: 'frame_extract', enabled: true, dryRunSupported: true, runtimeSupported: true },
  },
  'frame-clean': {
    type: 'frame-clean',
    label: 'Frame Clean',
    labelZh: '清洗',
    icon: '🧹',
    color: '#14B8A6',
    bgColor: 'rgba(20, 184, 166, 0.08)',
    description: '去重、去模糊与质量过滤',
    inputs: ['image_batch'],
    outputs: ['image_batch'],
    params: [
      { key: 'blur_threshold', label: 'Blur Threshold', labelZh: '模糊阈值', type: 'number', required: false, default: 80 },
      { key: 'dedupe', label: 'Dedupe', labelZh: '去重', type: 'boolean', required: false, default: true },
    ],
    execution: { stepKey: 'frame_clean', enabled: true, dryRunSupported: true, runtimeSupported: true },
  },
  'dataset-register': {
    type: 'dataset-register',
    label: 'Dataset Register',
    labelZh: '数据集注册',
    icon: '🗂️',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.08)',
    description: '注册数据集并生成 dataset_id',
    inputs: ['image_batch', 'labels', 'annotations'],
    outputs: ['dataset'],
    params: [
      { key: 'dataset_id', label: 'Dataset ID', labelZh: '数据集 ID', type: 'string', required: true, placeholder: 'e.g. ds_yolo_v1' },
      { key: 'dataset_name', label: 'Dataset Name', labelZh: '数据集名称', type: 'string', required: false },
    ],
    execution: { stepKey: 'dataset_register', enabled: true, dryRunSupported: true, runtimeSupported: true },
  },
  'dataset-split': {
    type: 'dataset-split',
    label: 'Dataset Split',
    labelZh: '数据集切分',
    icon: '🧩',
    color: '#6366F1',
    bgColor: 'rgba(99, 102, 241, 0.08)',
    description: '按比例切分 train/val/test',
    inputs: ['dataset'],
    outputs: ['split_manifest'],
    params: [
      { key: 'train_ratio', label: 'Train Ratio', labelZh: '训练比例', type: 'number', required: false, default: 0.8 },
      { key: 'val_ratio', label: 'Val Ratio', labelZh: '验证比例', type: 'number', required: false, default: 0.1 },
      { key: 'test_ratio', label: 'Test Ratio', labelZh: '测试比例', type: 'number', required: false, default: 0.1 },
    ],
execution: { stepKey: 'dataset_split', enabled: true, dryRunSupported: true, runtimeSupported: true },
  },
  'train-config-builder': {
    type: 'train-config-builder',
    displayName: 'Train Config Builder',
    version: '1.0.0',
    category: 'training',
    status: 'executable',
    label: 'Train Config Builder',
    labelZh: '训练配置构建',
    icon: '⚙️',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    description: '构建训练配置，输入 dataset / split_manifest，输出 train_config',
    inputs: ['dataset', 'split_manifest'],
    outputs: ['train_config'],
    params: [
      { key: 'framework', label: 'Framework', labelZh: '框架', type: 'select', required: true, defaultValue: 'yolov8', options: [{ value: 'yolov8', label: 'YOLOv8' }], bindable: false },
      { key: 'model_variant', label: 'Model Variant', labelZh: '模型变体', type: 'select', required: true, defaultValue: 'yolov8n', options: [{ value: 'yolov8n', label: 'YOLOv8n' }, { value: 'yolov8s', label: 'YOLOv8s' }, { value: 'yolov8m', label: 'YOLOv8m' }, { value: 'yolov8l', label: 'YOLOv8l' }, { value: 'yolov8x', label: 'YOLOv8x' }], bindable: false },
      { key: 'epochs', label: 'Epochs', labelZh: '训练轮数', type: 'number', required: true, defaultValue: 100, validation: { min: 1, max: 1000 }, bindable: true },
      { key: 'imgsz', label: 'Image Size', labelZh: '图像尺寸', type: 'number', required: false, defaultValue: 640, validation: { min: 320, max: 1280 }, bindable: false },
      { key: 'batch', label: 'Batch Size', labelZh: '批大小', type: 'number', required: false, defaultValue: 16, validation: { min: 1, max: 256 }, bindable: false },
      { key: 'device', label: 'Device', labelZh: '设备', type: 'select', required: false, defaultValue: 'cuda', options: [{ value: 'cuda', label: 'CUDA' }, { value: 'cpu', label: 'CPU' }], bindable: false },
      { key: 'output_dir', label: 'Output Directory', labelZh: '输出目录', type: 'string', required: false, placeholder: 'runs/train', bindable: false },
      { key: 'template_version', label: 'Template Version', labelZh: '模板版本', type: 'string', required: true, defaultValue: '1.0.0', bindable: false },
    ],
    execution: {
      stepKey: 'train_config_builder',
      enabled: true,
      dryRunSupported: true,
      runtimeSupported: true,
    },
  },
  'train-model': {
    type: 'train-model',
    label: 'Train Model',
    labelZh: '训练模型',
    icon: '🏋️',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    description: '启动训练并输出 checkpoint/model',
    inputs: ['dataset', 'split_manifest', 'train_config'],
    outputs: ['checkpoint', 'model'],
    params: [
      { key: 'experiment_id', label: 'Experiment ID', labelZh: '实验 ID', type: 'string', required: true },
      { key: 'dataset_id', label: 'Dataset ID', labelZh: '数据集 ID', type: 'string', required: true },
      { key: 'template_version', label: 'Template Version', labelZh: '模板版本', type: 'string', required: true, default: '1.0.0' },
    ],
    execution: { stepKey: 'train_model', enabled: true, dryRunSupported: true, runtimeSupported: true },
  },
  'evaluate-model': {
    type: 'evaluate-model',
    label: 'Evaluate Model',
    labelZh: '模型评估',
    icon: '📈',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.08)',
    description: '评估模型并输出 metrics/report',
    inputs: ['model', 'dataset', 'split_manifest'],
    outputs: ['metrics', 'report'],
    params: [
      { key: 'experiment_id', label: 'Experiment ID', labelZh: '实验 ID', type: 'string', required: true },
      { key: 'model_id', label: 'Model ID', labelZh: '模型 ID', type: 'string', required: true, default: 'auto' },
      { key: 'dataset_id', label: 'Dataset ID', labelZh: '数据集 ID', type: 'string', required: true },
    ],
    execution: { stepKey: 'evaluate_model', enabled: true, dryRunSupported: true, runtimeSupported: true },
  },
  'archive-model': {
    type: 'archive-model',
    label: 'Archive Model',
    labelZh: '模型归档',
    icon: '🗄️',
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.08)',
    description: '归档模型、报告与关键元数据',
    inputs: ['model', 'metrics', 'report'],
    outputs: ['artifact'],
    params: [
      { key: 'model_id', label: 'Model ID', labelZh: '模型 ID', type: 'string', required: true, default: 'auto' },
      { key: 'artifact_name', label: 'Artifact Name', labelZh: '归档名称', type: 'string', required: false },
      { key: 'report_id', label: 'Report ID', labelZh: '报告 ID', type: 'string', required: false },
    ],
    execution: { stepKey: 'archive_model', enabled: true, dryRunSupported: true, runtimeSupported: true },
  },
  'dataset-snapshot': {
    type: 'dataset-snapshot',
    label: 'Dataset Snapshot',
    labelZh: '数据快照',
    icon: '📸',
    color: '#2563EB',
    bgColor: 'rgba(37, 99, 235, 0.08)',
    description: '固定当前数据集版本用于可追溯训练',
    inputs: ['dataset'],
    outputs: ['dataset'],
    params: [
      { key: 'dataset_id', label: 'Dataset ID', labelZh: '数据集 ID', type: 'string', required: true },
      { key: 'snapshot_version', label: 'Snapshot Version', labelZh: '快照版本', type: 'string', required: false },
    ],
    execution: { stepKey: 'dataset_snapshot', enabled: true },
  },
  'dataset-stats': {
    type: 'dataset-stats',
    label: 'Dataset Stats',
    labelZh: '数据集统计',
    icon: '📐',
    color: '#0EA5E9',
    bgColor: 'rgba(14, 165, 233, 0.08)',
    description: '计算样本与切分统计信息',
    inputs: ['dataset'],
    outputs: ['metrics', 'report'],
    params: [
      { key: 'dataset_id', label: 'Dataset ID', labelZh: '数据集 ID', type: 'string', required: true },
    ],
    execution: { stepKey: 'dataset_stats', enabled: true },
  },
  'compare-baseline': {
    type: 'compare-baseline',
    label: 'Compare Baseline',
    labelZh: '基线对比',
    icon: '⚖️',
    color: '#16A34A',
    bgColor: 'rgba(22, 163, 74, 0.08)',
    description: '对比新模型与基线模型指标差异',
    inputs: ['model', 'metrics'],
    outputs: ['report', 'metrics'],
    params: [
      { key: 'model_id', label: 'Model ID', labelZh: '模型 ID', type: 'string', required: true, default: 'auto' },
      { key: 'baseline_model_id', label: 'Baseline Model ID', labelZh: '基线模型 ID', type: 'string', required: true, default: 'auto-baseline' },
    ],
    execution: { stepKey: 'compare_baseline', enabled: true },
  },
  'badcase-mine': {
    type: 'badcase-mine',
    label: 'Badcase Mine',
    labelZh: '坏例挖掘',
    icon: '⛏️',
    color: '#DC2626',
    bgColor: 'rgba(220, 38, 38, 0.08)',
    description: '从评估结果中提取坏例样本',
    inputs: ['metrics', 'report'],
    outputs: ['badcases'],
    params: [
      { key: 'evaluation_id', label: 'Evaluation ID', labelZh: '评估 ID', type: 'string', required: true, default: 'auto' },
    ],
    execution: { stepKey: 'badcase_mine', enabled: true },
  },
  'export-model': {
    type: 'export-model',
    label: 'Export Model',
    labelZh: '模型导出',
    icon: '📤',
    color: '#EA580C',
    bgColor: 'rgba(234, 88, 12, 0.08)',
    description: '导出模型为部署格式（onnx/engine）',
    inputs: ['model'],
    outputs: ['artifact'],
    params: [
      { key: 'model_id', label: 'Model ID', labelZh: '模型 ID', type: 'string', required: true, default: 'auto' },
      { key: 'export_format', label: 'Export Format', labelZh: '导出格式', type: 'select', required: false, default: 'onnx', options: [{ value: 'onnx', label: 'ONNX' }, { value: 'engine', label: 'TensorRT Engine' }, { value: 'torchscript', label: 'TorchScript' }] },
    ],
    execution: { stepKey: 'export_model', enabled: true },
  },
  'release-model': {
    type: 'release-model',
    label: 'Release Model',
    labelZh: '模型发布',
    icon: '🚀',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.08)',
    description: '发布模型到生产环境，生成发布记录',
    inputs: ['artifact'],
    outputs: ['release'],
    params: [
      { key: 'model_id', label: 'Model ID', labelZh: '模型 ID', type: 'string', required: true, default: 'auto' },
      { key: 'release_note', label: 'Release Note', labelZh: '发布说明', type: 'text', required: false, placeholder: '发布说明' },
    ],
    execution: { stepKey: 'release_model', enabled: true, dryRunSupported: true, runtimeSupported: true },
  },
  'release-validate': {
    type: 'release-validate',
    label: 'Release Validate',
    labelZh: '发布校验',
    icon: '✅',
    color: '#4F46E5',
    bgColor: 'rgba(79, 70, 229, 0.08)',
    description: '发布前检查模型可发布性',
    inputs: ['model', 'report'],
    outputs: ['report'],
    params: [
      { key: 'model_id', label: 'Model ID', labelZh: '模型 ID', type: 'string', required: true, default: 'auto' },
    ],
    execution: { stepKey: 'release_validate', enabled: true },
  },
  'hardcase-feedback': {
    type: 'hardcase-feedback',
    label: 'Hardcase Feedback',
    labelZh: '难例回流',
    icon: '🔁',
    color: '#7C3AED',
    bgColor: 'rgba(124, 58, 237, 0.08)',
    description: '汇总难例并形成反馈包',
    inputs: ['badcases', 'dataset'],
    outputs: ['dataset', 'report'],
    params: [
      { key: 'dataset_id', label: 'Dataset ID', labelZh: '数据集 ID', type: 'string', required: true },
    ],
    execution: { stepKey: 'hardcase_feedback', enabled: true },
  },
  'feedback-backflow': {
    type: 'feedback-backflow',
    label: 'Feedback Backflow',
    labelZh: '反馈回流',
    icon: '🔄',
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.08)',
    description: '收集反馈并回流到训练数据集',
    inputs: ['release', 'report'],
    outputs: ['feedback'],
    params: [
      { key: 'model_id', label: 'Model ID', labelZh: '模型 ID', type: 'string', required: true, default: 'auto' },
      { key: 'release_id', label: 'Release ID', labelZh: '发布 ID', type: 'string', required: false },
    ],
    execution: { stepKey: 'feedback_backflow', enabled: true, dryRunSupported: true, runtimeSupported: true },
  },
  'retrain-trigger': {
    type: 'retrain-trigger',
    label: 'Retrain Trigger',
    labelZh: '再训练触发',
    icon: '🚀',
    color: '#0891B2',
    bgColor: 'rgba(8, 145, 178, 0.08)',
    description: '根据反馈结果触发新一轮训练',
    inputs: ['dataset', 'report'],
    outputs: ['train_config'],
    params: [
      { key: 'experiment_id', label: 'Experiment ID', labelZh: '实验 ID', type: 'string', required: true },
      { key: 'dataset_id', label: 'Dataset ID', labelZh: '数据集 ID', type: 'string', required: true },
    ],
    execution: { stepKey: 'retrain_trigger', enabled: true },
  },
'dataset-loader': {
    type: 'dataset-loader',
    displayName: 'Dataset Loader',
    version: '1.0.0',
    category: 'input',
    status: 'executable',
    label: 'Dataset Loader',
    labelZh: '数据集加载器',
    icon: '📦',
    color: '#38BDF8',
    bgColor: 'rgba(56, 189, 248, 0.08)',
    description: '从存储加载数据集，支持 train/val/test 分裂',
    inputs: [],
    outputs: ['dataset'],
    params: [
      { key: 'dataset_id', label: 'Dataset ID', labelZh: '数据集 ID', type: 'string', required: true, placeholder: 'e.g. coco-2017', description: '目标数据集的唯一标识', bindable: true },
      { key: 'split', label: 'Split', labelZh: '数据分裂', type: 'select', required: true, defaultValue: 'all', options: [{ value: 'train', label: 'Train' }, { value: 'val', label: 'Validation' }, { value: 'test', label: 'Test' }, { value: 'all', label: 'All' }], bindable: false },
      { key: 'batch_size', label: 'Batch Size', labelZh: '批大小', type: 'number', required: false, defaultValue: 8, description: '每批次样本数', bindable: false },
      { key: 'shuffle', label: 'Shuffle', labelZh: '打乱数据', type: 'boolean', required: false, defaultValue: false, bindable: false },
      { key: 'prefetch', label: 'Prefetch', labelZh: '预加载', type: 'boolean', required: false, defaultValue: true, bindable: false },
    ],
    execution: {
      stepKey: 'dataset_loader',
      enabled: true,
      dryRunSupported: true,
      runtimeSupported: true,
    },
  },

  'yolo-detect': {
    type: 'yolo-detect',
    label: 'YOLO Detector',
    labelZh: 'YOLO 目标检测',
    icon: '🎯',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    description: 'YOLO 系列目标检测模型推理',
    inputs: ['dataset', 'image', 'detections'],
    outputs: ['detections'],
    params: [
      { key: 'model_name', label: 'Model Name', labelZh: '模型名称', type: 'string', required: true, default: 'yolov8n.pt', placeholder: 'e.g. yolov8n.pt', description: 'YOLO 模型文件路径或名称' },
      { key: 'conf_threshold', label: 'Confidence Threshold', labelZh: '置信度阈值', type: 'number', required: false, default: 0.25, description: '检测结果最低置信度' },
      { key: 'iou_threshold', label: 'IoU Threshold', labelZh: 'IoU 阈值', type: 'number', required: false, default: 0.45, description: 'NMS IoU 阈值' },
      { key: 'max_det', label: 'Max Detections', labelZh: '最大检测数', type: 'number', required: false, default: 300, description: '单图最大检测框数' },
      { key: 'device', label: 'Device', labelZh: '运行设备', type: 'select', required: false, default: 'auto', options: [{ value: 'auto', label: 'Auto' }, { value: 'cpu', label: 'CPU' }, { value: 'cuda', label: 'CUDA' }] },
    ],
    execution: {
      stepKey: 'yolo_detect',
      enabled: true,
    },
  },

  'sam-segment': {
    type: 'sam-segment',
    label: 'SAM Segmenter',
    labelZh: 'SAM 图像分割',
    icon: '✂️',
    color: '#A78BFA',
    bgColor: 'rgba(167, 139, 250, 0.08)',
    description: 'Meta SAM 分段任意模型',
    inputs: ['dataset', 'image', 'detections'],
    outputs: ['masks'],
    params: [
      { key: 'model_type', label: 'Model Type', labelZh: '模型类型', type: 'select', required: true, default: 'vit_b', options: [{ value: 'vit_h', label: 'ViT-H' }, { value: 'vit_b', label: 'ViT-B' }, { value: 'vit_l', label: 'ViT-L' }] },
      { key: 'points_per_side', label: 'Points Per Side', labelZh: '每边采样点数', type: 'number', required: false, default: 32, description: '网格点密度' },
      { key: 'pred_iou_thresh', label: 'Pred IoU Threshold', labelZh: 'IoU 预测阈值', type: 'number', required: false, default: 0.88 },
      { key: 'stability_score_thresh', label: 'Stability Score Threshold', labelZh: '稳定性分数阈值', type: 'number', required: false, default: 0.95 },
    ],
    execution: {
      stepKey: 'sam_segment',
      enabled: true,
    },
  },

  'classifier-verify': {
    type: 'classifier-verify',
    label: 'Classifier Verify',
    labelZh: '分类器验证',
    icon: '🔍',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.08)',
    description: '图像分类与置信度验证',
    inputs: ['image', 'detections', 'masks'],
    outputs: ['detections', 'classifications'],
    params: [
      { key: 'model_name', label: 'Model Name', labelZh: '模型名称', type: 'string', required: true, default: 'resnet50', placeholder: 'e.g. resnet50', description: '分类模型名称或路径' },
      { key: 'threshold', label: 'Threshold', labelZh: '置信度阈值', type: 'number', required: false, default: 0.8 },
      { key: 'top_k', label: 'Top K', labelZh: 'Top K 结果', type: 'number', required: false, default: 5 },
      { key: 'labels', label: 'Labels', labelZh: '标签列表', type: 'text', required: false, default: '', placeholder: 'class1,class2,...', description: '逗号分隔的类别标签' },
    ],
    execution: {
      stepKey: 'classifier_verify',
      enabled: true,
    },
  },

  tracker: {
    type: 'tracker',
    label: 'Object Tracker',
    labelZh: '目标跟踪器',
    icon: '📡',
    color: '#06B6D4',
    bgColor: 'rgba(6, 182, 212, 0.08)',
    description: '多目标跟踪（ByteTrack / OC-Sort / DeepSort）',
    inputs: ['detections', 'classifications'],
    outputs: ['tracks'],
    params: [
      { key: 'tracker_type', label: 'Tracker Type', labelZh: '跟踪器类型', type: 'select', required: true, default: 'bytetrack', options: [{ value: 'bytetrack', label: 'ByteTrack' }, { value: 'ocsort', label: 'OCSort' }, { value: 'deepsort', label: 'DeepSort' }] },
      { key: 'max_time_ago', label: 'Max Time Ago', labelZh: '最大丢失帧数', type: 'number', required: false, default: 30 },
      { key: 'min_confidence', label: 'Min Confidence', labelZh: '最低置信度', type: 'number', required: false, default: 0.3 },
    ],
    execution: {
      stepKey: 'tracker_run',
      enabled: true,
    },
  },

  'eval-report': {
    type: 'eval-report',
    label: 'Eval Report',
    labelZh: '评估报告',
    icon: '📊',
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.08)',
    description: '生成评测指标报告',
    inputs: ['detections', 'classifications'],
    outputs: ['report'],
    params: [
      { key: 'metrics', label: 'Metrics', labelZh: '评测指标', type: 'select', required: true, default: 'precision,recall', options: [{ value: 'precision', label: 'Precision' }, { value: 'recall', label: 'Recall' }, { value: 'f1', label: 'F1 Score' }, { value: 'iou', label: 'IoU' }, { value: 'accuracy', label: 'Accuracy' }] },
      { key: 'save_path', label: 'Save Path', labelZh: '保存路径', type: 'string', required: false, placeholder: 'outputs/eval_results' },
      { key: 'format', label: 'Format', labelZh: '报告格式', type: 'select', required: false, default: 'json', options: [{ value: 'json', label: 'JSON' }, { value: 'csv', label: 'CSV' }, { value: 'pdf', label: 'PDF' }] },
      { key: 'include_vis', label: 'Include Visualization', labelZh: '包含可视化', type: 'boolean', required: false, default: true },
    ],
    execution: {
      enabled: false,
    },
  },

  'output-archive': {
    type: 'output-archive',
    label: 'Output Archive',
    labelZh: '输出归档',
    icon: '🗃️',
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.08)',
    description: '将流程产物归档至存储',
    inputs: ['any'],
    outputs: [],
    params: [
      { key: 'artifact_name', label: 'Artifact Name', labelZh: '产物名称', type: 'string', required: true, placeholder: 'my-run-output' },
      { key: 'artifact_type', label: 'Artifact Type', labelZh: '产物类型', type: 'select', required: true, default: 'model', options: [{ value: 'model', label: 'Model' }, { value: 'dataset', label: 'Dataset' }, { value: 'report', label: 'Report' }, { value: 'video', label: 'Video' }] },
      { key: 'compression', label: 'Compression', labelZh: '启用压缩', type: 'boolean', required: false, default: true },
      { key: 'tags', label: 'Tags', labelZh: '标签', type: 'string', required: false, default: '', placeholder: 'tag1,tag2' },
    ],
    execution: {
      enabled: false,
    },
  },

  'reroute': {
    type: 'reroute',
    label: 'Reroute',
    labelZh: '中继节点',
    icon: '🔀',
    color: '#9CA3AF',
    bgColor: 'rgba(255, 255, 255, 0.04)',
    description: '中继节点，用于线路规划',
    inputs: ['any'],
    outputs: ['any'],
    params: [],
    execution: {
      enabled: false,
    },
  },
};

export interface WorkflowRuntimeStep {
  step_key: string;
  step_name: string;
  step_order: number;
  params: Record<string, unknown>;
}

export interface WorkflowRuntimePayload {
  name: string;
  description: string;
  template_id: string | null;
  steps: WorkflowRuntimeStep[];
  input: Record<string, unknown>;
  graph?: {
    nodes: Array<{ id: string; type: string; order: number }>;
    edges?: Array<{ from: string; to: string }>;
  };
  resolved_params?: Record<string, Record<string, unknown>>;
  artifacts_plan?: Array<{ step_key: string; expected_outputs: string[] }>;
}

export function getNodeExecution(type: NodeType | string): NodeConfig['execution'] {
  const cfg = (NODE_REGISTRY as Record<string, NodeConfig>)[type];
  return cfg?.execution || { enabled: false };
}

export function buildRuntimePayloadFromDraft(args: {
  draftName?: string;
  steps: Array<{ order: number; label: string; nodeType: NodeType | string; nodeId: string; outputs?: string[]; dependencies?: string[] }>;
  nodeParamsById: Record<string, Record<string, unknown>>;
}): { payload?: WorkflowRuntimePayload; unsupported: string[] } {
  const unsupported: string[] = [];
  const runtimeSteps: WorkflowRuntimeStep[] = [];
  const runtimeInput: Record<string, unknown> = {};

  for (const s of args.steps) {
    const exec = getNodeExecution(s.nodeType);
    if (!exec?.enabled || !exec?.stepKey) {
      unsupported.push(`${s.label} (${s.nodeType})`);
      continue;
    }
    runtimeSteps.push({
      step_key: exec.stepKey,
      step_name: s.label,
      step_order: s.order,
      params: args.nodeParamsById[s.nodeId] || {},
    });

    // Keep AGI/OpenClaw input contract aligned:
    // flatten step params into payload.input so server-side required-input
    // validation can pass even when values are provided only in step params.
    const stepParams = args.nodeParamsById[s.nodeId] || {};
    for (const [k, v] of Object.entries(stepParams)) {
      const missing = v == null || (typeof v === 'string' && v.trim() === '');
      if (missing) continue;
      if (!(k in runtimeInput) || runtimeInput[k] == null || runtimeInput[k] === '') {
        runtimeInput[k] = v;
      }
    }
  }

  if (unsupported.length > 0) return { unsupported };

  return {
    unsupported,
    payload: {
      name: args.draftName || `workflow-${Date.now()}`,
      description: 'Run from Workflow Composer',
      template_id: null,
      steps: runtimeSteps,
      input: runtimeInput,
      graph: {
        nodes: args.steps.map((s) => ({ id: s.nodeId, type: String(s.nodeType), order: s.order })),
        edges: args.steps.flatMap((s) => (s.dependencies || []).map((dep) => ({ from: dep, to: s.nodeId }))),
      },
      resolved_params: args.nodeParamsById,
      artifacts_plan: runtimeSteps.map((s, i) => ({
        step_key: s.step_key,
        expected_outputs: args.steps[i]?.outputs || [],
      })),
    },
  };
}

// 从 ComposerNode 转换为 ReactFlow Node
export function composerNodeToRfNode(node: ComposerNode) {
  const config = NODE_REGISTRY[node.type];
  return {
    id: node.id,
    type: 'workflowComposerNode',
    position: node.position,
    data: {
      label: node.label,
      nodeType: node.type,
      config,
      params: node.params,
      executable: node.executable ?? false,
    },
  };
}
