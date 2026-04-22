"""
tracker_runner.py — v4.0.0 First Tracker Template: Temporal Consistency
IoU-based multi-object tracker on classifier verification results.

Usage:
    python tracker_runner.py --manifest <classifier_verification_manifest.json> --output-dir <dir>
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


def compute_iou(bbox1, bbox2):
    """Compute IoU between two bboxes [x1, y1, x2, y2]."""
    x1 = max(bbox1[0], bbox2[0])
    y1 = max(bbox1[1], bbox2[1])
    x2 = min(bbox1[2], bbox2[2])
    y2 = min(bbox1[3], bbox2[3])
    if x2 <= x1 or y2 <= y1:
        return 0.0
    inter = (x2 - x1) * (y2 - y1)
    area1 = (bbox1[2] - bbox1[0]) * (bbox1[3] - bbox1[1])
    area2 = (bbox2[2] - bbox2[0]) * (bbox2[3] - bbox2[1])
    union = area1 + area2 - inter
    return inter / union if union > 0 else 0.0


def compute_centroid(bbox):
    """Compute centroid of bbox [x1, y1, x2, y2] -> [cx, cy]."""
    return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2]


def centroid_distance(c1, c2):
    """Euclidean distance between two centroids."""
    return ((c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2) ** 0.5


def greedy_match(detections, tracks, iou_threshold=0.3, dist_threshold=50.0):
    """
    Greedy matching: match detections to existing tracks by IoU + centroid distance.
    Returns: dict {detection_idx: track_id} for matched detections.
    """
    matched = {}
    for det_idx, det in enumerate(detections):
        best_track = None
        best_score = -1
        for track in tracks:
            if track['class_name'] != det.get('predicted_class', ''):
                continue
            iou = compute_iou(det['bbox'], track['last_bbox'])
            if iou < iou_threshold:
                continue
            dist = centroid_distance(compute_centroid(det['bbox']), compute_centroid(track['last_bbox']))
            if dist > dist_threshold:
                continue
            # Score = IoU * 0.7 + (1 - normalized_dist) * 0.3
            norm_dist = min(dist / dist_threshold, 1.0)
            score = iou * 0.7 + (1 - norm_dist) * 0.3
            if score > best_score:
                best_score = score
                best_track = track
        if best_track is not None:
            matched[det_idx] = best_track['track_id']
    return matched


def extract_frame_index(image_path, default=0):
    """Extract frame index from image path like 'images/val/image_0000.jpg'."""
    import re
    m = re.search(r'image_(\d+)', image_path or '')
    if m:
        return int(m.group(1))
    return default


def get_item_frame(item):
    """Get frame index from item, preferring image_path over crop_path."""
    import re
    # image_path is the canonical source
    ip = item.get('image_path', '')
    if ip:
        m = re.search(r'image_(\d+)', ip)
        if m:
            return int(m.group(1))
    # Fallback to crop_path (careful: segmentation_id may contain 'image_XXX')
    cp = item.get('crop_path', '')
    if cp:
        # Only use crop_path if it contains images/val/image_XXX pattern
        m = re.search(r'images[/\\]val[/\\]image_(\d+)', cp)
        if m:
            return int(m.group(1))
    return 0


def run_tracker(
    verification_manifest_path: str,
    output_dir: str,
    iou_threshold: float = 0.3,
    dist_threshold: float = 80.0,
    lost_threshold: int = 2,  # frames to wait before ending track
    max_new_per_frame: int = 100,
):
    """Run IoU-based tracker on classifier verification items."""

    # ── Load manifest ─────────────────────────────────────────────────────────
    if not os.path.exists(verification_manifest_path):
        raise FileNotFoundError(f"Verification manifest not found: {verification_manifest_path}")
    with open(verification_manifest_path, encoding='utf-8') as f:
        verif_manifest = json.load(f)

    item_results = verif_manifest.get('item_results', [])
    source = verif_manifest.get('source', {})
    seg_source = verif_manifest.get('source_segmentation_id', '')
    seg_manifest_path = verif_manifest.get('source_segmentation_manifest', '')

    # ── Group items by frame ─────────────────────────────────────────────────
    frame_items: dict = {}
    for item in item_results:
        frame_idx = get_item_frame(item)
        if frame_idx not in frame_items:
            frame_items[frame_idx] = []
        frame_items[frame_idx].append(item)

    sorted_frames = sorted(frame_items.keys())
    print(f"[INFO] {len(sorted_frames)} frames, {len(item_results)} total detections")

    # ── Tracking ──────────────────────────────────────────────────────────────
    tracker_run_id = f"track-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:8]}"
    timestamp = datetime.now().isoformat()

    tracks: dict = {}      # track_id -> {track_id, class_name, frames, last_frame_idx, last_bbox, status, appearances}
    track_counter = 0
    all_tracked_items = []
    errors = []

    t_start = time.time()

    for frame_idx in sorted_frames:
        detections = frame_items[frame_idx]

        # Get active/live tracks (not yet ended)
        live_tracks = [t for t in tracks.values() if t['status'] in ('new', 'active')]

        # Greedy match
        matched = greedy_match(detections, live_tracks, iou_threshold, dist_threshold)

        used_det_indices = set(matched.keys())

        for det_idx, det in enumerate(detections):
            det_class = det.get('predicted_class', 'unknown')
            det_bbox  = det.get('bbox', [0, 0, 0, 0])

            if det_idx in matched:
                # Matched to existing track
                track_id = matched[det_idx]
                track = tracks[track_id]
                track['status'] = 'active'
                track['last_frame_idx'] = frame_idx
                track['last_bbox'] = det_bbox
                track['frames'].append(frame_idx)
                track['appearances'] += 1
                track_status = 'active'
            else:
                # New track
                if len([t for t in tracks.values() if t['status'] == 'new']) >= max_new_per_frame:
                    continue
                track_counter += 1
                track_id = f"{tracker_run_id}-T{track_counter:04d}"
                tracks[track_id] = {
                    'track_id': track_id,
                    'class_name': det_class,
                    'status': 'new',
                    'last_frame_idx': frame_idx,
                    'last_bbox': det_bbox,
                    'frames': [frame_idx],
                    'appearances': 1,
                    'started_at': frame_idx,
                }
                track_status = 'new'

            all_tracked_items.append({
                'track_id': track_id,
                'frame_index': frame_idx,
                'detection_index': det.get('detection_index', det_idx),
                'roi_index': det.get('roi_index', 0),
                'bbox': det_bbox,
                'predicted_class': det_class,
                'confidence': det.get('confidence', 0),
                'verification_status': det.get('verification_status', ''),
                'mask_path': det.get('mask_path', ''),
                'crop_path': det.get('crop_path', ''),
                'track_status': track_status,
            })

        # Check for lost tracks
        for track in tracks.values():
            if track['status'] in ('new', 'active') and track['last_frame_idx'] < frame_idx:
                gap = frame_idx - track['last_frame_idx']
                if gap >= lost_threshold:
                    track['status'] = 'ended'
                elif gap >= 1:
                    track['status'] = 'lost'

    total_time = time.time() - t_start

    # ── Summary ──────────────────────────────────────────────────────────────
    track_list = list(tracks.values())
    total_tracks = len(track_list)
    active_count  = sum(1 for t in track_list if t['status'] in ('new', 'active', 'lost'))
    ended_count  = sum(1 for t in track_list if t['status'] == 'ended')

    all_lengths = [len(t['frames']) for t in track_list]
    avg_track_length = round(sum(all_lengths) / max(len(all_lengths), 1), 2)
    max_track_length = max(all_lengths) if all_lengths else 0
    min_track_length = min(all_lengths) if all_lengths else 0

    # Per-class summary
    class_tracks: dict = {}
    for t in track_list:
        cls = t['class_name']
        if cls not in class_tracks:
            class_tracks[cls] = {'count': 0, 'total_frames': 0, 'active': 0, 'ended': 0}
        class_tracks[cls]['count'] += 1
        class_tracks[cls]['total_frames'] += len(t['frames'])
        if t['status'] == 'ended':
            class_tracks[cls]['ended'] += 1
        else:
            class_tracks[cls]['active'] += 1

    manifest = {
        'version': '4.0.0',
        'tracker_run_id': tracker_run_id,
        'timestamp': timestamp,
        'source_verification_id': verif_manifest.get('verification_id', ''),
        'source_segmentation_id': seg_source,
        'source_segmentation_manifest': seg_manifest_path,
        'source': {
            'experiment_id': source.get('experiment_id', ''),
            'model_id': source.get('model_id', ''),
            'dataset_id': source.get('dataset_id', ''),
            'dataset_version': source.get('dataset_version', ''),
        },
        'tracking_config': {
            'iou_threshold': iou_threshold,
            'dist_threshold': dist_threshold,
            'lost_threshold': lost_threshold,
            'max_new_per_frame': max_new_per_frame,
            'matching_strategy': 'greedy_iou_centroid',
            'execution_mode': 'real',
        },
        'summary': {
            'total_tracks': total_tracks,
            'total_frames': len(sorted_frames),
            'total_detections': len(all_tracked_items),
            'avg_track_length': avg_track_length,
            'max_track_length': max_track_length,
            'min_track_length': min_track_length,
            'active_count': active_count,
            'ended_count': ended_count,
            'class_tracks': class_tracks,
        },
        'tracked_items': all_tracked_items,
        'track_summary': [
            f"total_tracks={total_tracks}",
            f"avg_length={avg_track_length}",
            f"active={active_count}",
            f"ended={ended_count}",
        ],
        'total_time_s': round(total_time, 3),
    }

    manifest_path = os.path.join(output_dir, 'tracker_manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    return manifest


def main():
    parser = argparse.ArgumentParser(description='IoU-based Tracker')
    parser.add_argument('--manifest', type=str, required=True,
                        help='Path to classifier_verification_manifest.json')
    parser.add_argument('--output-dir', type=str, default=None,
                        help='Output directory (default: auto)')
    parser.add_argument('--iou-threshold', type=float, default=0.3,
                        help='IoU threshold for matching (default: 0.3)')
    parser.add_argument('--dist-threshold', type=float, default=80.0,
                        help='Centroid distance threshold in pixels (default: 80)')
    parser.add_argument('--lost-threshold', type=int, default=2,
                        help='Frames to wait before ending track (default: 2)')
    args = parser.parse_args()

    if args.output_dir:
        output_dir = args.output_dir
    else:
        output_dir = os.path.join(
            os.path.dirname(args.manifest),
            f'tracker_{Path(args.manifest).stem}'
        )
    os.makedirs(output_dir, exist_ok=True)

    print(f"[INFO] Tracker starting...")
    print(f"  manifest       : {args.manifest}")
    print(f"  output         : {output_dir}")
    print(f"  iou_threshold  : {args.iou_threshold}")
    print(f"  dist_threshold : {args.dist_threshold}")
    print(f"  lost_threshold : {args.lost_threshold}")

    t_start = time.time()
    result = run_tracker(
        verification_manifest_path=args.manifest,
        output_dir=output_dir,
        iou_threshold=args.iou_threshold,
        dist_threshold=args.dist_threshold,
        lost_threshold=args.lost_threshold,
    )
    t_total = time.time() - t_start

    s = result['summary']
    print(f"\n[OK] Tracking complete in {t_total:.2f}s")
    print(f"  tracker_run_id : {result['tracker_run_id']}")
    print(f"  total_tracks   : {s['total_tracks']}")
    print(f"  total_frames   : {s['total_frames']}")
    print(f"  avg_track_len  : {s['avg_track_length']}")
    print(f"  active         : {s['active_count']}")
    print(f"  ended          : {s['ended_count']}")
    print(f"  manifest       : {os.path.join(output_dir, 'tracker_manifest.json')}")

    return result


if __name__ == '__main__':
    main()
