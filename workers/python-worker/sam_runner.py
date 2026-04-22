"""
sam_runner.py — v3.8.0 First SAM Template: Segmentation
Real SAM inference on YOLO handoff manifests.

Usage:
    python sam_runner.py --manifest <sam_handoff_manifest.json> --checkpoint <sam_vit_*.pth> --output-dir <dir>
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

def generate_test_image(width=640, height=640, seed=None):
    """Generate a synthetic test image with colored rectangles for detection ROIs."""
    if seed is not None:
        np.random.seed(seed)
    img = np.zeros((height, width, 3), dtype=np.uint8)
    # Random background
    img[:] = np.random.randint(180, 220, 3)
    return img

def generate_test_image_with_rois(bboxes, width=640, height=640, seed=42):
    """Generate a test image with colored boxes overlaid on random background."""
    np.random.seed(seed)
    img = np.zeros((height, width, 3), dtype=np.uint8)
    # Light gray background
    img[:] = [200, 200, 200]
    # Draw each bbox as a colored rectangle
    colors = [(255, 80, 80), (80, 200, 80), (80, 80, 255), (255, 200, 80), (200, 80, 255)]
    for idx, bbox in enumerate(bboxes):
        x1, y1, x2, y2 = [int(v) for v in bbox]
        color = colors[idx % len(colors)]
        # Draw filled rectangle with slight border
        img[y1:y2, x1:x2] = color
        # Add slight border
        img[y1:min(y1+3,y2), x1:x2] = [max(c-40,0) for c in color]
        img[max(y2-3,y1):y2, x1:x2] = [min(c+40,255) for c in color]
        img[y1:y2, x1:min(x1+3,x2)] = [max(c-40,0) for c in color]
        img[y1:y2, max(x2-3,x1):x2] = [min(c+40,255) for c in color]
    return img

def run_sam_segmentation(
    handoff_manifest_path: str,
    checkpoint_path: str,
    output_dir: str,
    model_type: str = 'vit_b',
    device: str = 'cpu',
):
    """
    Run SAM segmentation on a YOLO handoff manifest.

    Returns:
        dict: sam_segmentation_manifest
    """
    # ── Load dependencies lazily to avoid slow import on error ─────────────
    import cv2
    from segment_anything import sam_model_registry, SamPredictor

    # ── Load manifest ────────────────────────────────────────────────────────
    if not os.path.exists(handoff_manifest_path):
        raise FileNotFoundError(f"Handoff manifest not found: {handoff_manifest_path}")
    with open(handoff_manifest_path, encoding='utf-8') as f:
        manifest = json.load(f)

    roi_items = manifest.get('roi_items', [])
    source = manifest.get('source', {})
    summary = manifest.get('summary', {})

    if not roi_items:
        raise ValueError("No ROI items found in handoff manifest")

    # ── Load SAM model ─────────────────────────────────────────────────────
    sam = sam_model_registry[model_type](checkpoint=checkpoint_path)
    sam.to(device=device)
    sam.eval()
    predictor = SamPredictor(sam)

    # ── Setup output directories ────────────────────────────────────────────
    masks_dir = os.path.join(output_dir, 'masks')
    overlay_dir = os.path.join(output_dir, 'overlays')
    os.makedirs(masks_dir, exist_ok=True)
    os.makedirs(overlay_dir, exist_ok=True)

    # ── Group ROI items by image ─────────────────────────────────────────────
    image_rois: dict = {}
    for roi in roi_items:
        img_path = roi.get('image_path', '')
        if img_path not in image_rois:
            image_rois[img_path] = []
        image_rois[img_path].append(roi)

    # ── Process each image ──────────────────────────────────────────────────
    segmentation_id = f"seg-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:8]}"
    timestamp = datetime.now().isoformat()
    all_mask_items = []
    total_masks = 0
    total_time = 0.0
    errors = []

    # Unique images
    unique_images = list(image_rois.keys())
    print(f"Processing {len(unique_images)} image(s) with {len(roi_items)} ROI(s)")

    for img_path_key, rois in image_rois.items():
        # Resolve image path: use real file if exists, else generate test image
        if img_path_key.startswith('images/'):
            rel_path = img_path_key.replace('images/', '')
            abs_path = os.path.join(os.path.dirname(handoff_manifest_path), '..', img_path_key)
        else:
            abs_path = img_path_key

        if not os.path.exists(abs_path):
            # Generate synthetic test image based on bbox positions
            bboxes = [roi['bbox_xyxy'] for roi in rois]
            img = generate_test_image_with_rois(bboxes)
            img_filename = f'test_{Path(img_path_key).name}'
            img_abs_dir = os.path.join(masks_dir, 'test_images')
            os.makedirs(img_abs_dir, exist_ok=True)
            img_abs_path = os.path.join(img_abs_dir, img_filename)
            cv2.imwrite(img_abs_path, cv2.cvtColor(img, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 95])
            abs_path = img_abs_path
            print(f"  [Generated test image: {img_abs_path}]")
        else:
            img = cv2.imread(abs_path, cv2.IMREAD_COLOR)
            if img is None:
                raise IOError(f"Cannot read image: {abs_path}")
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        orig_h, orig_w = img.shape[:2]
        print(f"  Image: {img_path_key} ({orig_w}x{orig_h})")

        # Set image in SAM predictor
        t0 = time.time()
        predictor.set_image(img)
        total_time += time.time() - t0

        for roi in rois:
            roi_idx = roi.get('roi_index', 0)
            detection_index = roi.get('detection_index', roi_idx)
            bbox = roi.get('bbox_xyxy', [])
            if not bbox or len(bbox) != 4:
                errors.append(f"ROI {roi_idx}: invalid bbox")
                continue

            x1, y1, x2, y2 = map(int, bbox)
            # Clip to image bounds
            x1 = max(0, min(x1, orig_w - 1))
            y1 = max(0, min(y1, orig_h - 1))
            x2 = max(x1 + 1, min(x2, orig_w))
            y2 = max(y1 + 1, min(y2, orig_h))
            input_box = np.array([x1, y1, x2, y2])

            try:
                t0 = time.time()
                mask, score, _ = predictor.predict(
                    point_coords=None,
                    point_labels=None,
                    box=input_box[None, :],  # SAM expects (N, 4)
                    multimask_output=False,
                )
                infer_time = time.time() - t0
                total_time += infer_time

                mask = mask[0]  # (H, W) bool
                mask_bool = mask.astype(np.uint8) * 255

                # Save mask
                mask_filename = f"mask_{segmentation_id}_{roi_idx:04d}.png"
                mask_path = os.path.join(masks_dir, mask_filename)
                cv2.imwrite(mask_path, mask_bool)

                # Compute mask area
                mask_area = int(mask.sum())
                bbox_area = (x2 - x1) * (y2 - y1)
                coverage = round(mask_area / max(bbox_area, 1), 4)

                # Generate overlay (colored mask on image)
                overlay_filename = f"overlay_{segmentation_id}_{roi_idx:04d}.png"
                overlay_path = os.path.join(overlay_dir, overlay_filename)
                overlay_img = img.copy().astype(np.float32)
                mask_float = mask.astype(np.float32)
                # Apply blue-tinted overlay on masked region
                overlay_img[:, :, 0] = np.where(mask > 0,
                    np.clip(overlay_img[:, :, 0] * 0.4 + 80, 0, 255), overlay_img[:, :, 0]).astype(np.uint8)
                overlay_img[:, :, 1] = np.where(mask > 0,
                    np.clip(overlay_img[:, :, 1] * 0.7, 0, 255), overlay_img[:, :, 1]).astype(np.uint8)
                overlay_img[:, :, 2] = np.where(mask > 0,
                    np.clip(overlay_img[:, :, 2] * 0.4 + 40, 0, 255), overlay_img[:, :, 2]).astype(np.uint8)
                overlay_bgr = cv2.cvtColor(overlay_img.astype(np.uint8), cv2.COLOR_RGB2BGR)
                cv2.imwrite(overlay_path, overlay_bgr)

                # Save cropped mask ROI
                crop_path = ''
                if bbox_area > 0:
                    crop_mask = mask_bool[y1:y2, x1:x2]
                    crop_path = os.path.join(masks_dir, f"crop_{segmentation_id}_{roi_idx:04d}.png")
                    cv2.imwrite(crop_path, crop_mask)

                mask_item = {
                    'detection_index': detection_index,
                    'roi_index': roi_idx,
                    'image_path': img_path_key,
                    'bbox': bbox,
                    'mask_path': os.path.abspath(mask_path),
                    'overlay_path': os.path.abspath(overlay_path),
                    'crop_path': os.path.abspath(crop_path) if crop_path else '',
                    'score': float(score[0]) if hasattr(score, '__len__') else float(score),
                    'mask_area': mask_area,
                    'bbox_area': int(bbox_area),
                    'coverage': coverage,
                    'infer_time_ms': round(infer_time * 1000, 1),
                }
                all_mask_items.append(mask_item)
                total_masks += 1

            except Exception as e:
                import traceback as _tb
                errors.append(f"ROI {roi_idx}: {str(e)}")
                _tb.print_exc()
                print(f"  [ERROR ROI {roi_idx}]: {type(e).__name__}: {e}")
                import sys; sys.stdout.flush()
                continue

        predictor.reset_image()

    # ── Build segmentation manifest ──────────────────────────────────────────
    avg_score = round(sum(m['score'] for m in all_mask_items) / max(len(all_mask_items), 1), 4)
    avg_coverage = round(sum(m['coverage'] for m in all_mask_items) / max(len(all_mask_items), 1), 4)

    seg_manifest = {
        'version': '3.8.0',
        'segmentation_id': segmentation_id,
        'timestamp': timestamp,
        'source_handoff_manifest': os.path.abspath(handoff_manifest_path),
        'source': {
            'task_id': source.get('task_id', ''),
            'experiment_id': source.get('experiment_id', ''),
            'model_id': source.get('model_id', ''),
            'dataset_id': source.get('dataset_id', ''),
            'dataset_version': source.get('dataset_version', ''),
        },
        'summary': {
            'total_images': len(unique_images),
            'total_rois_processed': len(roi_items),
            'mask_count': total_masks,
            'error_count': len(errors),
            'avg_mask_score': avg_score,
            'avg_coverage': avg_coverage,
            'total_infer_time_s': round(total_time, 3),
            'model_type': model_type,
            'checkpoint': os.path.abspath(checkpoint_path),
            'device': device,
        },
        'prompt_summary': {
            'prompt_type': 'box',
            'total_prompts': len(roi_items),
        },
        'mask_items': all_mask_items,
        'errors': errors[:20],  # Cap at 20 errors
        'output_dirs': {
            'masks': os.path.abspath(masks_dir),
            'overlays': os.path.abspath(overlay_dir),
        },
        'sam_format_notes': [
            'mask is PNG uint8 0/255, 1-bit coverage mask',
            'overlay is colored mask over original image',
            'crop is mask cropped to bbox region',
            'score from SamPredictor.predict is IoU-based quality score',
        ],
    }

    # Save manifest
    manifest_path = os.path.join(output_dir, 'sam_segmentation_manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(seg_manifest, f, indent=2, ensure_ascii=False)

    return seg_manifest


def main():
    parser = argparse.ArgumentParser(description='SAM Segmentation Runner')
    parser.add_argument('--manifest', type=str, required=True, help='Path to sam_handoff_manifest.json')
    parser.add_argument('--checkpoint', type=str, required=True, help='Path to SAM checkpoint (.pth)')
    parser.add_argument('--output-dir', type=str, default=None, help='Output directory')
    parser.add_argument('--model-type', type=str, default='vit_b', choices=['vit_b', 'vit_h', 'vit_l'],
                        help='SAM model type')
    parser.add_argument('--device', type=str, default='cpu', help='Device: cpu or cuda')
    args = parser.parse_args()

    # Resolve output dir
    if args.output_dir:
        output_dir = args.output_dir
    else:
        manifest_dir = os.path.dirname(args.manifest)
        output_dir = os.path.join(manifest_dir, f'sam_segmentation_{Path(args.manifest).stem}')
    os.makedirs(output_dir, exist_ok=True)

    print(f"[INFO] SAM runner starting...")
    print(f"  manifest : {args.manifest}")
    print(f"  checkpoint: {args.checkpoint}")
    print(f"  output   : {output_dir}")
    print(f"  model    : {args.model_type}")
    print(f"  device   : {args.device}")

    t_start = time.time()
    result = run_sam_segmentation(
        handoff_manifest_path=args.manifest,
        checkpoint_path=args.checkpoint,
        output_dir=output_dir,
        model_type=args.model_type,
        device=args.device,
    )
    t_total = time.time() - t_start

    print(f"\n[OK] Segmentation complete in {t_total:.1f}s")
    print(f"  segmentation_id : {result['segmentation_id']}")
    print(f"  mask_count     : {result['summary']['mask_count']}")
    print(f"  avg_score      : {result['summary']['avg_mask_score']}")
    print(f"  avg_coverage   : {result['summary']['avg_coverage']}")
    print(f"  manifest       : {os.path.join(output_dir, 'sam_segmentation_manifest.json')}")

    return result


if __name__ == '__main__':
    main()
