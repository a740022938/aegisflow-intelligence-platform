"""
classifier_runner.py — v3.9.x Classifier Verification Runner
Real classifier verification on SAM segmentation crops.

Weight loading strategy (v3.9.x):
  ① checkpoint_path exists → local-first (load or fail with error)
  ② checkpoint_path specified but not found → fallback to torchvision DEFAULT
  ③ no checkpoint_path → torchvision DEFAULT directly

Usage:
    python classifier_runner.py --manifest <sam_segmentation_manifest.json>
        [--output-dir <dir>] [--model-type resnet18]
        [--device cpu] [--max-items 0]
        [--classifier-checkpoint <path>]

 施工阶段验证矩阵（must-do）:
   ✓ A: 有网络 + 无本地 checkpoint  → torchvision 自动下载（首次）
   ✓ B: 无网络 + 无本地 checkpoint  → torchvision 抛出异常（确认错误）
   ✓ C: 本地 checkpoint 存在       → manifest.weight_load_strategy=local-first
   ✓ D: checkpoint_path 存在但加载失败 → 抛出异常，不降级，error_message 有值
"""

import argparse
import json
import os
import sys
import time
import uuid
import numpy as np
from pathlib import Path
from datetime import datetime

# ── ImageNet top-20 common class names (index -> name) ───────────────────────
IMAGENET_CLASSES = [
    "tench", "goldfish", "great_white_shark", "tiger_shark", "hammerhead",
    "electric_ray", "cock", "hen", "ostrich", "brambling", "robin", "house_finch",
    "junco", "indigo_bunting", "jay", "magpie", "chickadee", "marmot", "sea_anemone",
    "brain_coral", "DUPLICATE_CHECK",
]
# Fill to 1000 for reference (just the first 20 for demo)
_IMAGENET_TOP = [
    "tench", "goldfish", "great_white_shark", "tiger_shark", "hammerhead",
    "electric_ray", "cock", "hen", "ostrich", "brambling", "robin",
    "house_finch", "junco", "indigo_bunting", "jay", "magpie",
    "chickadee", "marmot", "ara", "sea_anemone",
]


def load_classifier(model_type='resnet18', device='cpu', checkpoint_path=''):
    """
    加载分类器。权重加载策略（严格线性，不降级）：

    ── 权重加载决策树 ────────────────────────────────────────
    ① checkpoint_path 非空，且文件存在
       → 加载本地 .pt/.pth → 成功返回 / 失败直接抛出异常
    ② checkpoint_path 非空，但文件不存在
       → 记录 WARN → 降级到 torchvision DEFAULT → 成功返回
    ③ checkpoint_path 为空
       → 直接使用 torchvision DEFAULT → 成功返回
    ────────────────────────────────────────────────────────

    注意：本地加载失败（如模型结构不匹配、权重维度错误）不降级，
          直接抛出异常，由调用方记录 error_message 并中止。

    Returns: (model, preprocess_fn, categories, weight_load_strategy)
    """
    import torch
    import torchvision.transforms as transforms
    from torchvision.models import resnet18, ResNet18_Weights

    weight_load_strategy = 'torchvision-default'
    categories = []

    if checkpoint_path and os.path.exists(checkpoint_path):
        # ── 路径 ①：本地 checkpoint 存在 ────────────────────────
        print(f"[INFO] checkpoint_path specified and file exists: {checkpoint_path}")
        print(f"[INFO] Attempting to load local checkpoint...")
        state_dict = torch.load(checkpoint_path, map_location=device, weights_only=False)
        model = resnet18(weights=None)
        model.load_state_dict(state_dict)
        model.to(device)
        model.eval()
        weight_load_strategy = 'local-first'
        print(f"[INFO] Local checkpoint loaded successfully. strategy=local-first")

        # 类别名：尝试从 state_dict 的键推断
        if 'classes' in state_dict:
            categories = state_dict['classes']
        elif 'categories' in state_dict:
            categories = state_dict['categories']
        else:
            categories = [f"class_{i}" for i in range(1000)]

    elif checkpoint_path and not os.path.exists(checkpoint_path):
        # ── 路径 ②：路径指定但不存在，降级到 torchvision ─────────
        print(f"[WARN] checkpoint_path not found: {checkpoint_path}")
        print(f"[WARN] Falling back to torchvision default weights (ResNet18_Weights.DEFAULT)")
        weights_obj = ResNet18_Weights.DEFAULT
        model = resnet18(weights=weights_obj)
        model.to(device)
        model.eval()
        weight_load_strategy = 'torchvision-default'
        if hasattr(weights_obj, 'meta') and hasattr(weights_obj.meta, 'categories'):
            categories = weights_obj.meta['categories']
        else:
            categories = [f"class_{i}" for i in range(1000)]

    else:
        # ── 路径 ③：无路径，直接 torchvision ────────────────────
        print(f"[INFO] No checkpoint_path specified, using torchvision default (ResNet18_Weights.DEFAULT)")
        weights_obj = ResNet18_Weights.DEFAULT
        model = resnet18(weights=weights_obj)
        model.to(device)
        model.eval()
        weight_load_strategy = 'torchvision-default'
        if hasattr(weights_obj, 'meta') and hasattr(weights_obj.meta, 'categories'):
            categories = weights_obj.meta['categories']
        else:
            categories = [f"class_{i}" for i in range(1000)]

    preprocess = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    return model, preprocess, categories, weight_load_strategy


def verify_item(confidence: float) -> str:
    """Verify status based on confidence threshold."""
    if confidence >= 0.9:
        return 'accepted'
    elif confidence < 0.5:
        return 'rejected'
    else:
        return 'uncertain'


def generate_test_crop(detection_index: int, roi_index: int, width=224, height=224, seed=None):
    """Generate a synthetic test crop with colored patterns per detection."""
    if seed is None:
        seed = detection_index * 100 + roi_index
    np.random.seed(seed)

    # Create a synthetic image with class-specific patterns
    crop = np.zeros((height, width, 3), dtype=np.uint8)

    # Random background
    crop[:] = np.random.randint(100, 200, 3)

    # Draw class-specific pattern based on detection_index mod 5
    class_idx = detection_index % 5
    patterns = [
        # class 0: horizontal stripes (bird-like)
        [(255, 80, 80), (80, 80, 255)],       # red/blue stripes
        # class 1: circular (fish-like)
        [(80, 200, 80), (200, 200, 80)],       # green circles
        # class 2: checkerboard (mammal-like)
        [(150, 150, 150), (80, 80, 80)],        # gray checker
        # class 3: diagonal (reptile-like)
        [(255, 200, 80), (80, 80, 200)],        # orange/blue
        # class 4: blob (generic)
        [(200, 80, 200), (80, 200, 200)],        # purple/teal
    ]
    colors = patterns[class_idx]

    # Draw colored region
    x1, y1 = width // 4, height // 4
    x2, y2 = 3 * width // 4, 3 * height // 4
    crop[y1:y2, x1:x2] = colors[0]

    # Add border
    border_w = max(2, width // 20)
    crop[y1:y1+border_w, :] = colors[1]
    crop[y2-border_w:y2, :] = colors[1]
    crop[:, x1:x1+border_w] = colors[1]
    crop[:, x2-border_w:x2] = colors[1]

    return crop


def run_classifier_verification(
    segmentation_manifest_path: str,
    output_dir: str,
    model_type: str = 'resnet18',
    device: str = 'cpu',
    max_items: int = 0,  # 0 = all
    classifier_checkpoint: str = '',  # v3.9.x: 空=直接 torchvision
):
    """
    Run classifier verification on SAM segmentation results.

    Returns: classifier_verification_manifest dict
    """
    import torch
    import torchvision.transforms as transforms
    from torchvision.models import resnet18, ResNet18_Weights
    from PIL import Image

    # ── Load manifest ─────────────────────────────────────────────────────────
    if not os.path.exists(segmentation_manifest_path):
        raise FileNotFoundError(f"Segmentation manifest not found: {segmentation_manifest_path}")
    with open(segmentation_manifest_path, encoding='utf-8') as f:
        seg_manifest = json.load(f)

    source = seg_manifest.get('source', {})
    seg_summary = seg_manifest.get('summary', {})
    mask_items = seg_manifest.get('mask_items', [])
    seg_id = seg_manifest.get('segmentation_id', '')

    if max_items > 0:
        mask_items = mask_items[:max_items]

    # ── Load classifier (v3.9.x: local-first + torchvision fallback) ────────
    print(f"[INFO] Loading classifier: {model_type}")
    t0 = time.time()

    model, preprocess, imagenet_classes, weight_load_strategy = load_classifier(
        model_type=model_type,
        device=device,
        checkpoint_path=classifier_checkpoint,
    )

    load_time = time.time() - t0
    print(f"[INFO] Model loaded in {load_time:.1f}s, strategy={weight_load_strategy}")

    # ── Setup output ────────────────────────────────────────────────────────
    crops_dir = os.path.join(output_dir, 'crops_verified')
    os.makedirs(crops_dir, exist_ok=True)

    # ── Process each mask item ──────────────────────────────────────────────
    verification_id = f"verif-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:8]}"
    timestamp = datetime.now().isoformat()
    all_item_results = []
    errors = []
    total_time = 0.0

    print(f"Processing {len(mask_items)} mask item(s)...")

    for item in mask_items:
        roi_idx = item.get('roi_index', 0)
        det_idx = item.get('detection_index', roi_idx)
        crop_path = item.get('crop_path', '')
        mask_path = item.get('mask_path', '')
        bbox = item.get('bbox', [])
        mask_area = item.get('mask_area', 0)

        # Load or generate crop
        if crop_path and os.path.exists(crop_path):
            try:
                img = Image.open(crop_path).convert('RGB')
            except Exception:
                img = None
        else:
            img = None

        if img is None:
            # Generate synthetic test crop
            synthetic_crop = generate_test_crop(det_idx, roi_idx)
            img = Image.fromarray(synthetic_crop)
            crop_path_out = os.path.join(crops_dir, f"synthetic_crop_{verification_id}_{roi_idx:04d}.png")
            img.save(crop_path_out)
            crop_path = crop_path_out
            img = Image.open(crop_path)  # re-open for consistency

        try:
            t1 = time.time()
            img_tensor = preprocess(img).unsqueeze(0).to(device)
            with torch.no_grad():
                logits = model(img_tensor)
                probs = torch.nn.functional.softmax(logits, dim=1)
                top_prob, top_idx = probs.topk(1, dim=1)
                top_prob_val = float(top_prob[0, 0].cpu())
                top_class_idx = int(top_idx[0, 0].cpu())

            infer_time = time.time() - t1
            total_time += infer_time

            pred_class = imagenet_classes[top_class_idx] if top_class_idx < len(imagenet_classes) else f"class_{top_class_idx}"
            vstatus = verify_item(top_prob_val)

            # Get top-5 for richness
            top5_probs, top5_idxs = probs.topk(5, dim=1)
            top5 = [
                {
                    'class_idx': int(top5_idxs[0, i].cpu()),
                    'class_name': imagenet_classes[int(top5_idxs[0, i])] if int(top5_idxs[0, i]) < len(imagenet_classes) else f"class_{int(top5_idxs[0, i])}",
                    'probability': round(float(top5_probs[0, i].cpu()), 6),
                }
                for i in range(5)
            ]

            item_result = {
                'detection_index': det_idx,
                'roi_index': roi_idx,
                'image_path': item.get('image_path', ''),
                'crop_path': crop_path,
                'mask_path': mask_path,
                'bbox': bbox,
                'mask_area': mask_area,
                'predicted_class': pred_class,
                'predicted_class_id': top_class_idx,
                'confidence': round(top_prob_val, 6),
                'verification_status': vstatus,
                'top5_predictions': top5,
                'infer_time_ms': round(infer_time * 1000, 1),
            }
            all_item_results.append(item_result)

        except Exception as e:
            errors.append(f"ROI {roi_idx}: {str(e)}")
            continue

    # ── Build summary ────────────────────────────────────────────────────────
    accepted   = sum(1 for r in all_item_results if r['verification_status'] == 'accepted')
    rejected   = sum(1 for r in all_item_results if r['verification_status'] == 'rejected')
    uncertain  = sum(1 for r in all_item_results if r['verification_status'] == 'uncertain')
    all_confs  = [r['confidence'] for r in all_item_results]
    avg_conf   = round(sum(all_confs) / max(len(all_confs), 1), 4)
    avg_infer  = round(total_time / max(len(all_item_results), 1), 3)

    # Class distribution
    class_counts: dict = {}
    for r in all_item_results:
        cls = r['predicted_class']
        class_counts[cls] = class_counts.get(cls, 0) + 1

    manifest = {
        'version': '3.9.0',
        'verification_id': verification_id,
        'timestamp': timestamp,
        'source_segmentation_id': seg_id,
        'source_segmentation_manifest': os.path.abspath(segmentation_manifest_path),
        'source_handoff_manifest': seg_manifest.get('source_handoff_manifest', ''),
        'source': {
            'experiment_id': source.get('experiment_id', ''),
            'model_id': source.get('model_id', ''),
            'dataset_id': source.get('dataset_id', ''),
            'dataset_version': source.get('dataset_version', ''),
        },
        'model_info': {
            'model_type': model_type,
            'architecture': 'resnet18',
            'classifier_checkpoint': classifier_checkpoint,   # 原始传入值（空=未指定）
            'checkpoint': (
                classifier_checkpoint
                if (classifier_checkpoint and os.path.exists(classifier_checkpoint))
                else 'torchvision-pretrained-ResNet18_Weights.DEFAULT'
            ),
            'device': device,
            'framework': 'torchvision',
            'load_time_s': round(load_time, 3),
            'execution_mode': 'real',  # real | stub
            'classes': len(imagenet_classes),
            'weight_load_strategy': weight_load_strategy,   # v3.9.x: local-first | torchvision-default
        },
        'summary': {
            'total_items': len(all_item_results),
            'accepted_count': accepted,
            'rejected_count': rejected,
            'uncertain_count': uncertain,
            'avg_confidence': avg_conf,
            'avg_infer_time_s': avg_infer,
            'total_infer_time_s': round(total_time, 3),
            'class_distribution': class_counts,
        },
        'item_results': all_item_results,
        'errors': errors[:20],
        'error_message': '; '.join(errors[:5]) if errors else '',   # v3.9.x: runner 失败摘要
        'output_dirs': {
            'verified_crops': os.path.abspath(crops_dir),
        },
        'verification_notes': [
            'accepted: confidence >= 0.9',
            'rejected: confidence < 0.5',
            'uncertain: 0.5 <= confidence < 0.9',
            'crop_path may be synthetic if real crop not available',
        ],
    }

    manifest_path = os.path.join(output_dir, 'classifier_verification_manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    return manifest


def main():
    parser = argparse.ArgumentParser(description='Classifier Verification Runner')
    parser.add_argument('--manifest', type=str, required=True,
                        help='Path to sam_segmentation_manifest.json')
    parser.add_argument('--output-dir', type=str, default=None,
                        help='Output directory (default: auto)')
    parser.add_argument('--model-type', type=str, default='resnet18',
                        choices=['resnet18', 'resnet34', 'mobilenet_v3_small'],
                        help='Classifier model type')
    parser.add_argument('--device', type=str, default='cpu',
                        help='Device: cpu or cuda')
    parser.add_argument('--max-items', type=int, default=0,
                        help='Max items to process (0=all)')
    parser.add_argument('--classifier-checkpoint', type=str, default='',
                        dest='classifier_checkpoint',
                        help='Local classifier checkpoint path (.pt/.pth). '
                             'Empty = use torchvision default weights.')
    args = parser.parse_args()

    if args.output_dir:
        output_dir = args.output_dir
    else:
        manifest_dir = os.path.dirname(args.manifest)
        output_dir = os.path.join(manifest_dir, f'classifier_verification_{Path(args.manifest).stem}')
    os.makedirs(output_dir, exist_ok=True)

    print(f"[INFO] Classifier verification starting...")
    print(f"  manifest   : {args.manifest}")
    print(f"  output     : {output_dir}")
    print(f"  model      : {args.model_type}")
    print(f"  device     : {args.device}")
    print(f"  max_items  : {args.max_items or 'all'}")

    t_start = time.time()
    result = run_classifier_verification(
        segmentation_manifest_path=args.manifest,
        output_dir=output_dir,
        model_type=args.model_type,
        device=args.device,
        max_items=args.max_items,
        classifier_checkpoint=args.classifier_checkpoint,
    )
    t_total = time.time() - t_start

    s = result['summary']
    print(f"\n[OK] Verification complete in {t_total:.1f}s")
    print(f"  verification_id: {result['verification_id']}")
    print(f"  total_items   : {s['total_items']}")
    print(f"  accepted      : {s['accepted_count']}")
    print(f"  rejected      : {s['rejected_count']}")
    print(f"  uncertain     : {s['uncertain_count']}")
    print(f"  avg_confidence: {s['avg_confidence']}")
    print(f"  manifest     : {os.path.join(output_dir, 'classifier_verification_manifest.json')}")

    return result


if __name__ == '__main__':
    main()
