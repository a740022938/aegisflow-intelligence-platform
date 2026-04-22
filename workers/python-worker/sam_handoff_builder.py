"""
sam_handoff_builder.py — v3.7.0 YOLO→SAM Handoff Foundation
Generates a SAM handoff manifest from YOLO detection results (real or mock).
Output format is SAM-inference-ready: bbox prompts per ROI item.

Usage:
    python sam_handoff_builder.py --metrics <metrics.json> --config <config.json> --output-dir <dir>
    python sam_handoff_builder.py --metrics-file <path> --config-file <path> --output-dir <dir>
"""

import argparse
import json
import os
import sys
import random
from pathlib import Path
from datetime import datetime

# ── Standard dataset classes (default YOLO coco-style) ─────────────────────
DEFAULT_CLASSES = ["person", "bicycle", "car", "motorcycle", "airplane",
                   "bus", "train", "truck", "boat", "traffic light",
                   "fire hydrant", "stop sign", "parking meter", "bench",
                   "bird", "cat", "dog", "horse", "sheep", "cow",
                   "elephant", "bear", "zebra", "giraffe", "backpack"]

# ── ROI generation helpers ───────────────────────────────────────────────────

# ── Real detection loading ────────────────────────────────────────────────────

def load_dataset_classes(dataset_yaml_path: str) -> list:
    """Load class names from YOLO dataset.yaml."""
    try:
        import yaml
        with open(dataset_yaml_path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        names = data.get('names', {})
        if isinstance(names, dict):
            return [names[i] for i in sorted(names.keys())]
        elif isinstance(names, list):
            return names
        return DEFAULT_CLASSES
    except Exception:
        return DEFAULT_CLASSES


def load_yolo_labels(dataset_yaml_path: str, split: str = 'val') -> tuple:
    """
    Load YOLO label files for a given split and return
    (detections, image_paths, img_width, img_height).
    Reads images/val/*.jpg to get image sizes.
    YOLO label format: class_id cx cy w h (normalized 0-1).
    Converts to xyxy absolute pixels.
    Standard layout: dataset_yaml_path.parent/images/{split}/ + dataset_yaml_path.parent/labels/{split}/
    """
    import glob, yaml

    detections = []

    # Resolve images_dir and label_dir from dataset.yaml
    images_dir = None
    label_dir  = None
    try:
        with open(dataset_yaml_path, 'r', encoding='utf-8') as f:
            data = yaml.safe_load(f)
        base = data.get('path', '') or str(Path(dataset_yaml_path).parent)
        val_rel = data.get(split, '')  # e.g. "images/val"
        if val_rel:
            images_subdir = Path(val_rel).name  # "val"
            images_dir = Path(base) / "images" / images_subdir
            label_dir  = Path(base) / "labels"  / images_subdir
        else:
            images_dir = Path(base) / split
            label_dir  = Path(base) / "labels"  / split
    except Exception:
        images_dir = Path(dataset_yaml_path).parent / "images" / split
        label_dir  = Path(dataset_yaml_path).parent / "labels"  / split

    images_dir = Path(images_dir)
    label_dir  = Path(label_dir)

    if not images_dir.exists() or not label_dir.exists():
        return [], [], 640, 640

    # get image sizes
    img_sizes = {}
    for img_path in glob.glob(os.path.join(images_dir, '*.jpg')):
        try:
            from PIL import Image
            with Image.open(img_path) as im:
                img_sizes[Path(img_path).name] = (im.width, im.height)
        except Exception:
            img_sizes[Path(img_path).name] = (640, 640)

    # also check png
    for img_path in glob.glob(os.path.join(images_dir, '*.png')):
        if Path(img_path).name not in img_sizes:
            try:
                from PIL import Image
                with Image.open(img_path) as im:
                    img_sizes[Path(img_path).name] = (im.width, im.height)
            except Exception:
                img_sizes[Path(img_path).name] = (640, 640)

    classes = load_dataset_classes(dataset_yaml_path)

    label_files = glob.glob(os.path.join(label_dir, '*.txt'))
    all_detections = []
    all_image_paths = set()

    for lbl_file in label_files:
        img_name = Path(lbl_file).stem + '.jpg'
        img_path = os.path.join(images_dir, img_name)
        if not os.path.exists(img_path):
            img_name = Path(lbl_file).stem + '.png'
            img_path = os.path.join(images_dir, img_name)

        w_img, h_img = img_sizes.get(Path(img_name).name, (640, 640))

        with open(lbl_file, 'r', encoding='utf-8') as f:
            for det_idx, line in enumerate(f):
                line = line.strip()
                if not line:
                    continue
                parts = line.split()
                if len(parts) < 5:
                    continue
                cls_id = int(parts[0])
                cx_n, cy_n, w_n, h_n = map(float, parts[:4])
                # convert normalized YOLO to absolute xyxy
                cx = cx_n * w_img
                cy = cy_n * h_img
                bw = w_n * w_img
                bh = h_n * h_img
                x1 = max(0, cx - bw / 2)
                y1 = max(0, cy - bh / 2)
                x2 = min(w_img, cx + bw / 2)
                y2 = min(h_img, cy + bh / 2)
                if x2 <= x1 or y2 <= y1:
                    continue

                # use 1.0 as confidence since these are ground truth
                all_detections.append({
                    "image_path": img_path,
                    "detection_index": det_idx,
                    "image_index": 0,
                    "class_id": cls_id,
                    "class_name": classes[cls_id] if cls_id < len(classes) else f"class_{cls_id}",
                    "confidence": 1.0,
                    "bbox_xyxy": [round(x1, 2), round(y1, 2), round(x2, 2), round(y2, 2)],
                    "bbox_cxcywh": [round(cx, 2), round(cy, 2), round(bw, 2), round(bh, 2)],
                    "area": round(bw * bh, 2),
                    "_source": "yolo_label",
                })
                all_image_paths.add(img_path)

    return all_detections, sorted(list(all_image_paths)), img_sizes.get(list(img_sizes.keys())[0], (640, 640))[0] if img_sizes else 640, \
        img_sizes.get(list(img_sizes.keys())[0], (640, 640))[1] if img_sizes else 640


def load_eval_predictions(eval_output_json_path: str) -> list:
    """
    Load per-detection predictions from YOLO eval output JSON.
    YOLO eval doesn't natively output per-box results; this reads from
    the eval directory's image predictions if saved.
    Returns list of detection dicts (same format as load_yolo_labels).
    Currently returns [] — caller falls back to label files.
    """
    # YOLO eval by default doesn't save per-box predictions.
    # If the eval runner saves a predictions.json, load it here.
    try:
        if not eval_output_json_path or not os.path.exists(eval_output_json_path):
            return []
        # Future: parse a predictions.json if the eval runner saves one
        return []
    except Exception:
        return []


def generate_mock_detections(sample_count: int, class_count: int, classes: list) -> list:
    """Generate realistic-looking YOLO detections from mock metrics."""
    detections = []
    imgsz = 640
    detected_classes = classes[:class_count] if class_count else DEFAULT_CLASSES[:5]

    for img_idx in range(min(sample_count, 50)):  # Cap at 50 images
        img_path = f"images/val/image_{img_idx:04d}.jpg"
        num_dets = random.randint(1, min(8, class_count * 2 + 3))

        for det_idx in range(num_dets):
            cls_id = random.randint(0, len(detected_classes) - 1)
            cls_name = detected_classes[cls_id]

            # Generate realistic bbox (x1, y1, x2, y2) in image coords
            w = random.randint(40, int(imgsz * 0.6))
            h = random.randint(40, int(imgsz * 0.6))
            x1 = random.randint(5, imgsz - w - 5)
            y1 = random.randint(5, imgsz - h - 5)
            x2 = x1 + w
            y2 = y1 + h

            conf = round(random.uniform(0.3, 0.98), 4)

            detections.append({
                "image_path": img_path,
                "detection_index": det_idx,
                "image_index": img_idx,
                "class_id": cls_id,
                "class_name": cls_name,
                "confidence": conf,
                "bbox_xyxy": [x1, y1, x2, y2],
                "bbox_cxcywh": [round((x1 + x2) / 2, 2), round((y1 + y2) / 2, 2), w, h],
                "area": w * h,
            })
    return detections


def build_roi_items(detections: list, crop_dir: str = None, output_dir: str = None) -> list:
    """Convert detections to SAM-ready ROI items."""
    roi_items = []
    seen = {}

    for det in detections:
        key = f"{det['image_path']}_{det['detection_index']}"
        if key in seen:
            continue
        seen[key] = True

        bbox = det["bbox_xyxy"]
        x1, y1, x2, y2 = bbox

        roi_item = {
            "roi_index": len(roi_items),
            "image_path": det["image_path"],
            "bbox_xyxy": bbox,
            "bbox_cxcywh": det["bbox_cxcywh"],
            "detection_index": det["detection_index"],
            "detection_confidence": det["confidence"],
            "detection_class_id": det["class_id"],
            "detection_class_name": det["class_name"],
            "crop_path": "",
            "prompt_type": "box",
            "prompt_payload": {
                "type": "bbox",
                "bbox": [float(x) for x in bbox],
                # SAM accepts [x1, y1, x2, y2] format
            },
            "sam_input_type": "box",
        }
        roi_items.append(roi_item)
    return roi_items


def generate_handoff_manifest(
    metrics: dict,
    config: dict,
    detections: list,
    roi_items: list,
    output_dir: str,
    source_task_id: str = "",
    source_experiment_id: str = "",
    source_model_id: str = "",
    source_dataset_id: str = "",
    source_dataset_version: str = "",
) -> dict:
    """Build the full SAM handoff manifest."""
    manifest_path = os.path.join(output_dir, "sam_handoff_manifest.json")

    # Build bboxes by image
    image_bboxes: dict = {}
    for det in detections:
        img = det["image_path"]
        if img not in image_bboxes:
            image_bboxes[img] = []
        image_bboxes[img].append({
            "bbox": det["bbox_xyxy"],
            "class_name": det["class_name"],
            "confidence": det["confidence"],
        })

    # Build prompt summary per image
    prompt_summary = {}
    for img_path, bboxes in image_bboxes.items():
        all_classes = [b["class_name"] for b in bboxes]
        all_confs = [b["confidence"] for b in bboxes]
        prompt_summary[img_path] = {
            "prompt_count": len(bboxes),
            "classes": list(dict.fromkeys(all_classes)),
            "avg_confidence": round(sum(all_confs) / len(all_confs), 4),
            "high_confidence_count": len([c for c in all_confs if c >= 0.7]),
            "low_confidence_count": len([c for c in all_confs if c < 0.5]),
        }

    manifest = {
        "version": "3.7.0",
        "handoff_id": f"handoff-{datetime.now().strftime('%Y%m%d%H%M%S')}-{random.randint(1000, 9999)}",
        "timestamp": datetime.now().isoformat(),
        "source": {
            "task_id": source_task_id,
            "experiment_id": source_experiment_id,
            "model_id": source_model_id,
            "dataset_id": source_dataset_id,
            "dataset_version": source_dataset_version,
            "dataset_yaml": config.get("dataset_yaml", config.get("yaml", "")),
            "weights": config.get("weights", config.get("model_path", "")),
        },
        "summary": {
            "total_images": len(image_bboxes),
            "total_detections": len(detections),
            "roi_count": len(roi_items),
            "prompt_count": len(roi_items),  # 1 prompt per ROI
            "unique_classes": len(set(d["class_name"] for d in detections)),
            "avg_confidence": round(sum(d["confidence"] for d in detections) / max(len(detections), 1), 4),
            "high_confidence_ratio": round(
                len([d for d in detections if d["confidence"] >= 0.7]) / max(len(detections), 1), 4
            ),
        },
        "prompt_summary": prompt_summary,
        "detections": detections,
        "roi_items": roi_items,
        "sam_format_notes": [
            "prompt_payload.bbox format: [x1, y1, x2, y2] — SAM standard box prompt",
            "crop_path is empty string if crops not pre-generated",
            "For SAM inference: iterate roi_items, feed prompt_payload to SamPredictor",
            "Recommended: batch by image_path for efficiency",
        ],
    }
    return manifest


def main():
    parser = argparse.ArgumentParser(description="Build SAM handoff manifest from YOLO results")
    parser.add_argument("--metrics", type=str, help="Metrics dict as JSON string")
    parser.add_argument("--metrics-file", type=str, help="Path to metrics.json")
    parser.add_argument("--config", type=str, help="Config dict as JSON string")
    parser.add_argument("--config-file", type=str, help="Path to config JSON/YAML")
    parser.add_argument("--output-dir", type=str, default="E:\\AGI_Factory\\runs\\handoff",
                        help="Output directory")
    parser.add_argument("--sample-count", type=int, default=20,
                        help="Number of images to generate mock detections for")
    parser.add_argument("--class-count", type=int, default=3,
                        help="Number of classes for mock detections")
    parser.add_argument("--source-task-id", type=str, default="", help="Source task ID")
    parser.add_argument("--source-experiment-id", type=str, default="", help="Source experiment ID")
    parser.add_argument("--source-model-id", type=str, default="", help="Source model ID")
    parser.add_argument("--source-dataset-id", type=str, default="", help="Source dataset ID")
    parser.add_argument("--source-dataset-version", type=str, default="", help="Source dataset version")
    parser.add_argument("--dataset-yaml", type=str, default="",
                        help="Path to dataset.yaml — loads real YOLO labels if provided")
    parser.add_argument("--split", type=str, default="val",
                        help="Dataset split to load labels from (val/train)")

    args = parser.parse_args()

    # Load metrics
    if args.metrics_file:
        with open(args.metrics_file) as f:
            metrics = json.load(f)
    elif args.metrics:
        metrics = json.loads(args.metrics)
    else:
        metrics = {}

    # Load config
    if args.config_file:
        with open(args.config_file) as f:
            config = json.load(f)
    elif args.config:
        config = json.loads(args.config)
    else:
        config = {}

    # Resolve dataset_yaml: prefer explicit arg, then config
    dataset_yaml = args.dataset_yaml or config.get("dataset_yaml") or config.get("data") or ""

    # Resolve sample_count and class_count
    sample_count = args.sample_count or metrics.get("sample_count", 20) or 20
    class_count = args.class_count or metrics.get("class_count", 3) or 3

    # ── Real data path: load from YOLO label files ────────────────────────────
    if dataset_yaml and os.path.exists(dataset_yaml):
        print(f"[handoff_builder] Loading real detections from labels: {dataset_yaml}")
        split = args.split or config.get("split", "val")
        detections, img_paths, _, _ = load_yolo_labels(dataset_yaml, split=split)

        if detections:
            # Re-index image_index per image
            img_to_idx = {p: i for i, p in enumerate(sorted(img_paths))}
            for det in detections:
                det["image_index"] = img_to_idx.get(det["image_path"], 0)

            sample_count = len(img_paths)
            class_count = len(set(d["class_name"] for d in detections))
            print(f"[handoff_builder] OK Real detections: {len(detections)} boxes from {sample_count} images, {class_count} classes")
        else:
            print(f"[handoff_builder] WARN: Label files not found, falling back to mock")
            detections = generate_mock_detections(sample_count, class_count, DEFAULT_CLASSES)
    else:
        if dataset_yaml:
            print(f"[handoff_builder] ⚠ dataset.yaml not found: {dataset_yaml}, using mock")
        else:
            print(f"[handoff_builder] No dataset.yaml, using mock detections")
        detections = generate_mock_detections(sample_count, class_count, DEFAULT_CLASSES)

    # Build ROI items
    roi_items = build_roi_items(detections, output_dir=args.output_dir)

    # Patch dataset_yaml into config for manifest source
    if dataset_yaml:
        config["dataset_yaml"] = dataset_yaml

    # Ensure output dir
    os.makedirs(args.output_dir, exist_ok=True)

    # Build manifest
    manifest = generate_handoff_manifest(
        metrics=metrics,
        config=config,
        detections=detections,
        roi_items=roi_items,
        output_dir=args.output_dir,
        source_task_id=args.source_task_id,
        source_experiment_id=args.source_experiment_id,
        source_model_id=args.source_model_id,
        source_dataset_id=args.source_dataset_id,
        source_dataset_version=args.source_dataset_version,
    )

    manifest_path = os.path.join(args.output_dir, "sam_handoff_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"[OK] SAM handoff manifest: {manifest_path}")
    print(f"   handoff_id={manifest['handoff_id']}")
    print(f"   roi_count={manifest['summary']['roi_count']}")
    print(f"   prompt_count={manifest['summary']['prompt_count']}")
    print(f"   total_detections={manifest['summary']['total_detections']}")
    print(f"   unique_classes={manifest['summary']['unique_classes']}")

    return manifest


if __name__ == "__main__":
    main()
