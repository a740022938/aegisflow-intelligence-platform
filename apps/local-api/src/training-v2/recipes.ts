export const TRAINING_RECIPES: Record<string, {
  name: string; architecture: string; description: string;
  hyperparams: Record<string, any>; tags: string[];
}> = {
  'yolo-fast': {
    name: 'YOLO 快速验证',
    architecture: 'yolov8n',
    description: 'YOLOv8n 快速试跑 (5 epochs, 低分辨率) 验证数据质量',
    hyperparams: { epochs: 5, lr: 0.01, batch: 16, imgsz: 320, optimizer: 'SGD', warmup_epochs: 1, augment: false },
    tags: ['quick', 'validation', 'yolo'],
  },
  'yolo-standard': {
    name: 'YOLO 标准训练',
    architecture: 'yolov8n',
    description: 'YOLOv8n 标准训练 (100 epochs, 全数据增强)',
    hyperparams: { epochs: 100, lr: 0.01, batch: 16, imgsz: 640, optimizer: 'SGD', warmup_epochs: 3, augment: true, mosaic: 1.0, mixup: 0.1 },
    tags: ['standard', 'production', 'yolo'],
  },
  'yolo-high-res': {
    name: 'YOLO 高精度',
    architecture: 'yolov8l',
    description: 'YOLOv8l 高精度训练 (200 epochs, 高分辨率, 强增强)',
    hyperparams: { epochs: 200, lr: 0.005, batch: 8, imgsz: 1280, optimizer: 'AdamW', weight_decay: 0.0005, warmup_epochs: 5, augment: true, mosaic: 1.0, mixup: 0.2 },
    tags: ['high-accuracy', 'production', 'yolo'],
  },
  'vit-classifier': {
    name: 'ViT 分类器训练',
    architecture: 'vit-b-16',
    description: 'Vision Transformer 图像分类 (50 epochs)',
    hyperparams: { epochs: 50, lr: 0.0001, batch: 64, imgsz: 224, optimizer: 'AdamW', weight_decay: 0.1, warmup_epochs: 5, label_smoothing: 0.1, dropout: 0.1 },
    tags: ['vision', 'transformer', 'classify'],
  },
  'resnet-classifier': {
    name: 'ResNet 分类器训练',
    architecture: 'resnet50',
    description: 'ResNet50 图像分类 (50 epochs)',
    hyperparams: { epochs: 50, lr: 0.001, batch: 128, imgsz: 224, optimizer: 'SGD', momentum: 0.9, weight_decay: 0.0001, warmup_epochs: 3 },
    tags: ['vision', 'cnn', 'classify'],
  },
  'bert-finetune': {
    name: 'BERT 微调',
    architecture: 'bert-base',
    description: 'BERT-base 文本分类微调 (10 epochs)',
    hyperparams: { epochs: 10, lr: 2e-5, batch: 16, max_len: 512, optimizer: 'AdamW', weight_decay: 0.01, warmup_ratio: 0.1, scheduler: 'linear' },
    tags: ['nlp', 'transformer', 'finetune'],
  },
  'llm-lora': {
    name: 'LLM LoRA 微调',
    architecture: 'llama-lora',
    description: 'LLaMA/Qwen LoRA 高效微调 (5 epochs)',
    hyperparams: { epochs: 5, lr: 1e-4, batch: 4, max_len: 2048, optimizer: 'AdamW', lora_r: 16, lora_alpha: 32, lora_dropout: 0.05, target_modules: ['q_proj', 'v_proj'] },
    tags: ['llm', 'lora', 'finetune'],
  },
  'distill-vision': {
    name: '视觉模型蒸馏',
    architecture: 'vit-b-16',
    description: '用大 Teacher 模型蒸馏小 Student 模型',
    hyperparams: { epochs: 30, lr: 0.0001, batch: 64, temperature: 3.0, alpha: 0.7, loss: 'kl_div' },
    tags: ['distillation', 'vision'],
  },
};
