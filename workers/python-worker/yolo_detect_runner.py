#!/usr/bin/env python3
"""
YOLO Detect Runner - Real inference execution for AIP Workflow Composer

Usage:
    python yolo_detect_runner.py --weights <path.pt> --source <image_or_dir> --output-json <path>
    python yolo_detect_runner.py --weights <path.pt> --source <image_or_dir> --output-json <path> --conf 0.25 --iou 0.45 --max-det 300 --device cpu
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(description='YOLO Inference Runner')
    parser.add_argument('--weights', required=True, help='Model weights path (.pt)')
    parser.add_argument('--source', required=True, help='Image path or directory')
    parser.add_argument('--output-json', required=True, help='Output JSON path')
    parser.add_argument('--conf', type=float, default=0.25, help='Confidence threshold')
    parser.add_argument('--iou', type=float, default=0.45, help='NMS IoU threshold')
    parser.add_argument('--max-det', type=int, default=300, help='Max detections per image')
    parser.add_argument('--device', default='auto', help='Device: auto/cpu/cuda:0')
    return parser.parse_args()


def main():
    args = parse_args()

    start_time = time.time()

    weights_path = os.path.abspath(args.weights)
    source_path = os.path.abspath(args.source)
    output_json_path = os.path.abspath(args.output_json)

    if not os.path.exists(weights_path):
        result = {
            'ok': False,
            'error': f'Model weights not found: {weights_path}',
            'detections': [],
            'total_detections': 0,
            'total_images': 0,
            'duration_ms': 0,
        }
        os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
        with open(output_json_path, 'w') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(json.dumps(result, ensure_ascii=False))
        return

    if not os.path.exists(source_path):
        result = {
            'ok': False,
            'error': f'Source not found: {source_path}',
            'detections': [],
            'total_detections': 0,
            'total_images': 0,
            'duration_ms': 0,
        }
        os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
        with open(output_json_path, 'w') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(json.dumps(result, ensure_ascii=False))
        return

    try:
        from ultralytics import YOLO
    except ImportError:
        result = {
            'ok': False,
            'error': 'ultralytics not installed. Run: pip install ultralytics',
            'detections': [],
            'total_detections': 0,
            'total_images': 0,
            'duration_ms': 0,
        }
        os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
        with open(output_json_path, 'w') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(json.dumps(result, ensure_ascii=False))
        return

    device = args.device
    if device == 'auto':
        try:
            import torch
            device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
        except ImportError:
            device = 'cpu'

    model = YOLO(weights_path)

    image_files = []
    if os.path.isfile(source_path):
        image_files = [source_path]
    else:
        exts = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.webp'}
        for f in sorted(Path(source_path).iterdir()):
            if f.suffix.lower() in exts:
                image_files.append(str(f))

    all_detections = []
    total_detections = 0
    per_image_results = []

    for img_path in image_files:
        results = model(
            img_path,
            conf=args.conf,
            iou=args.iou,
            max_det=args.max_det,
            device=device,
            verbose=False,
        )

        image_dets = []
        for r in results:
            if r.boxes is not None:
                for b in r.boxes:
                    cls_id = int(b.cls[0])
                    conf = float(b.conf[0])
                    xyxy = [float(x) for x in b.xyxy[0]]
                    image_dets.append({
                        'class_id': cls_id,
                        'class_name': model.names[cls_id],
                        'confidence': round(conf, 4),
                        'bbox': [round(v, 2) for v in xyxy],
                    })

        total_detections += len(image_dets)
        per_image_results.append({
            'image': img_path,
            'detections_count': len(image_dets),
            'detections': image_dets,
        })
        all_detections.extend(image_dets)

    duration_ms = int((time.time() - start_time) * 1000)

    result = {
        'ok': True,
        'model': weights_path,
        'source': source_path,
        'total_images': len(image_files),
        'total_detections': total_detections,
        'duration_ms': duration_ms,
        'device': device,
        'per_image': per_image_results,
        'detections': all_detections,
    }

    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
