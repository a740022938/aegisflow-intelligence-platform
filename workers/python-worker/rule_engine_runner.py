"""
rule_engine_runner.py — v4.1.0 First Rule Engine Template: Consistency Guardrails
Applies consistency rules to tracker results.

Rules:
  1. class_consistency      — same track_id class should not jump frequently
  2. confidence_guardrail   — low confidence + short track -> uncertain
  3. temporal_stability     — single-frame detections with low confidence -> transient
  4. overlap_conflict       — same-frame heavy overlap + class conflict -> conflict_flag
  5. ended_track_resolution — lost/ended tracks get final state resolved

Usage:
    python rule_engine_runner.py --tracker-manifest <tracker_manifest.json> --output-dir <dir>
"""

import argparse
import json
import os
import time
import uuid
from datetime import datetime
from pathlib import Path


# ── IoU helper ────────────────────────────────────────────────────────────────
def compute_iou(b1, b2):
    x1, y1 = max(b1[0], b2[0]), max(b1[1], b2[1])
    x2, y2 = min(b1[2], b2[2]), min(b1[3], b2[3])
    if x2 <= x1 or y2 <= y1:
        return 0.0
    inter = (x2 - x1) * (y2 - y1)
    a1 = (b1[2] - b1[0]) * (b1[3] - b1[1])
    a2 = (b2[2] - b2[0]) * (b2[3] - b2[1])
    union = a1 + a2 - inter
    return inter / union if union > 0 else 0.0


# ── Rule 1: class_consistency ─────────────────────────────────────────────────
def rule_class_consistency(track_items, config):
    """
    If a track has multiple frames and the class changes more than
    class_change_threshold times, mark as unstable_class.
    """
    decisions = []
    threshold = config.get('class_change_threshold', 1)

    # Group by track_id
    tracks = {}
    for item in track_items:
        tid = item['track_id']
        if tid not in tracks:
            tracks[tid] = []
        tracks[tid].append(item)

    for tid, items in tracks.items():
        if len(items) < 2:
            continue
        classes = [i['predicted_class'] for i in items]
        changes = sum(1 for a, b in zip(classes, classes[1:]) if a != b)
        if changes > threshold:
            best_class = max(set(classes), key=classes.count)
            decisions.append({
                'track_id': tid,
                'frame_index': items[0]['frame_index'],
                'rule_name': 'class_consistency',
                'input_snapshot': {
                    'classes_seen': list(set(classes)),
                    'class_changes': changes,
                    'track_length': len(items),
                },
                'decision': 'unstable_class',
                'action': 'keep_best_class',
                'confidence_before': round(sum(i['confidence'] for i in items) / len(items), 4),
                'confidence_after': None,
                'notes': f"Class changed {changes}x across {len(items)} frames; best={best_class}",
            })
    return decisions


# ── Rule 2: confidence_guardrail ──────────────────────────────────────────────
def rule_confidence_guardrail(track_items, config):
    """
    Low confidence + short track -> mark uncertain.
    """
    decisions = []
    conf_threshold = config.get('confidence_threshold', 0.5)
    min_track_length = config.get('min_track_length_for_confidence', 2)

    tracks = {}
    for item in track_items:
        tid = item['track_id']
        if tid not in tracks:
            tracks[tid] = []
        tracks[tid].append(item)

    for tid, items in tracks.items():
        avg_conf = sum(i['confidence'] for i in items) / len(items)
        if avg_conf < conf_threshold and len(items) < min_track_length:
            decisions.append({
                'track_id': tid,
                'frame_index': items[0]['frame_index'],
                'rule_name': 'confidence_guardrail',
                'input_snapshot': {
                    'avg_confidence': round(avg_conf, 4),
                    'track_length': len(items),
                    'conf_threshold': conf_threshold,
                },
                'decision': 'low_confidence_short_track',
                'action': 'uncertain',
                'confidence_before': round(avg_conf, 4),
                'confidence_after': None,
                'notes': f"avg_conf={avg_conf:.4f} < {conf_threshold}, track_len={len(items)} < {min_track_length}",
            })
    return decisions


# ── Rule 3: temporal_stability ────────────────────────────────────────────────
def rule_temporal_stability(track_items, config):
    """
    Single-frame detections with low confidence -> transient_detection.
    """
    decisions = []
    conf_threshold = config.get('transient_confidence_threshold', 0.3)

    tracks = {}
    for item in track_items:
        tid = item['track_id']
        if tid not in tracks:
            tracks[tid] = []
        tracks[tid].append(item)

    for tid, items in tracks.items():
        if len(items) != 1:
            continue
        conf = items[0]['confidence']
        if conf < conf_threshold:
            decisions.append({
                'track_id': tid,
                'frame_index': items[0]['frame_index'],
                'rule_name': 'temporal_stability',
                'input_snapshot': {
                    'confidence': round(conf, 4),
                    'track_length': 1,
                    'threshold': conf_threshold,
                },
                'decision': 'transient_detection',
                'action': 'reject',
                'confidence_before': round(conf, 4),
                'confidence_after': 0.0,
                'notes': f"Single-frame track, conf={conf:.4f} < {conf_threshold}",
            })
    return decisions


# ── Rule 4: overlap_conflict ──────────────────────────────────────────────────
def rule_overlap_conflict(track_items, config):
    """
    Same-frame detections with heavy IoU overlap AND different classes -> conflict_flag.
    """
    decisions = []
    iou_threshold = config.get('overlap_iou_threshold', 0.5)

    # Group by frame
    frames = {}
    for item in track_items:
        fi = item['frame_index']
        if fi not in frames:
            frames[fi] = []
        frames[fi].append(item)

    for fi, items in frames.items():
        if len(items) < 2:
            continue
        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                a, b = items[i], items[j]
                if a['predicted_class'] == b['predicted_class']:
                    continue
                iou = compute_iou(a['bbox'], b['bbox'])
                if iou >= iou_threshold:
                    decisions.append({
                        'track_id': a['track_id'],
                        'frame_index': fi,
                        'rule_name': 'overlap_conflict',
                        'input_snapshot': {
                            'track_a': a['track_id'],
                            'track_b': b['track_id'],
                            'class_a': a['predicted_class'],
                            'class_b': b['predicted_class'],
                            'iou': round(iou, 4),
                        },
                        'decision': 'overlap_conflict',
                        'action': 'conflict_flag',
                        'confidence_before': round(a['confidence'], 4),
                        'confidence_after': None,
                        'notes': f"IoU={iou:.3f} with {b['track_id']} ({b['predicted_class']})",
                    })
    return decisions


# ── Rule 5: ended_track_resolution ───────────────────────────────────────────
def rule_ended_track_resolution(track_items, config):
    """
    Tracks with status 'lost' or 'ended' that still have no final resolution
    get a clean ended_resolved decision.
    """
    decisions = []
    tracks = {}
    for item in track_items:
        tid = item['track_id']
        if tid not in tracks:
            tracks[tid] = []
        tracks[tid].append(item)

    for tid, items in tracks.items():
        last = items[-1]
        if last['track_status'] in ('lost', 'ended'):
            decisions.append({
                'track_id': tid,
                'frame_index': last['frame_index'],
                'rule_name': 'ended_track_resolution',
                'input_snapshot': {
                    'last_status': last['track_status'],
                    'last_frame': last['frame_index'],
                    'track_length': len(items),
                },
                'decision': 'ended_resolved',
                'action': 'mark_ended',
                'confidence_before': round(last['confidence'], 4),
                'confidence_after': None,
                'notes': f"Track ended at frame {last['frame_index']} with status={last['track_status']}",
            })
    return decisions


# ── Main runner ───────────────────────────────────────────────────────────────
def run_rule_engine(
    tracker_manifest_path: str,
    output_dir: str,
    config: dict = None,
):
    if not os.path.exists(tracker_manifest_path):
        raise FileNotFoundError(f"Tracker manifest not found: {tracker_manifest_path}")

    with open(tracker_manifest_path, encoding='utf-8') as f:
        tracker_manifest = json.load(f)

    tracked_items = tracker_manifest.get('tracked_items', [])
    source = tracker_manifest.get('source', {})
    tracker_run_id = tracker_manifest.get('tracker_run_id', '')

    if config is None:
        config = {
            'class_change_threshold': 1,
            'confidence_threshold': 0.5,
            'min_track_length_for_confidence': 2,
            'transient_confidence_threshold': 0.3,
            'overlap_iou_threshold': 0.5,
        }

    rule_run_id = f"rule-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:8]}"
    timestamp = datetime.now().isoformat()

    t_start = time.time()

    # Apply rules
    all_decisions = []
    all_decisions += rule_class_consistency(tracked_items, config)
    all_decisions += rule_confidence_guardrail(tracked_items, config)
    all_decisions += rule_temporal_stability(tracked_items, config)
    all_decisions += rule_overlap_conflict(tracked_items, config)
    all_decisions += rule_ended_track_resolution(tracked_items, config)

    total_time = time.time() - t_start

    # Summary
    unstable_class_count  = sum(1 for d in all_decisions if d['decision'] == 'unstable_class')
    low_confidence_count  = sum(1 for d in all_decisions if d['decision'] == 'low_confidence_short_track')
    transient_count       = sum(1 for d in all_decisions if d['decision'] == 'transient_detection')
    conflict_count        = sum(1 for d in all_decisions if d['decision'] == 'overlap_conflict')
    ended_resolved_count  = sum(1 for d in all_decisions if d['decision'] == 'ended_resolved')

    # Unique tracks affected
    affected_tracks = len(set(d['track_id'] for d in all_decisions))

    tracker_summary = tracker_manifest.get('summary', {})

    manifest = {
        'version': '4.1.0',
        'rule_run_id': rule_run_id,
        'timestamp': timestamp,
        'source_tracker_run_id': tracker_run_id,
        'source_verification_id': tracker_manifest.get('source_verification_id', ''),
        'source_segmentation_id': tracker_manifest.get('source_segmentation_id', ''),
        'source_segmentation_manifest': tracker_manifest.get('source_segmentation_manifest', ''),
        'source': {
            'experiment_id': source.get('experiment_id', ''),
            'model_id': source.get('model_id', ''),
            'dataset_id': source.get('dataset_id', ''),
            'dataset_version': source.get('dataset_version', ''),
        },
        'rule_config': config,
        'rules_applied': [
            'class_consistency',
            'confidence_guardrail',
            'temporal_stability',
            'overlap_conflict',
            'ended_track_resolution',
        ],
        'summary': {
            'total_tracks': tracker_summary.get('total_tracks', 0),
            'total_frames': tracker_summary.get('total_frames', 0),
            'total_decisions': len(all_decisions),
            'affected_tracks': affected_tracks,
            'unstable_class_count': unstable_class_count,
            'low_confidence_count': low_confidence_count,
            'transient_count': transient_count,
            'conflict_count': conflict_count,
            'ended_resolved_count': ended_resolved_count,
        },
        'rule_decisions': all_decisions,
        'total_time_s': round(total_time, 4),
    }

    manifest_path = os.path.join(output_dir, 'rule_engine_manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    return manifest


def main():
    parser = argparse.ArgumentParser(description='Rule Engine Runner')
    parser.add_argument('--tracker-manifest', type=str, required=True)
    parser.add_argument('--output-dir', type=str, default=None)
    parser.add_argument('--confidence-threshold', type=float, default=0.5)
    parser.add_argument('--transient-threshold', type=float, default=0.3)
    parser.add_argument('--overlap-iou', type=float, default=0.5)
    parser.add_argument('--class-change-threshold', type=int, default=1)
    args = parser.parse_args()

    if args.output_dir:
        output_dir = args.output_dir
    else:
        output_dir = os.path.join(
            os.path.dirname(args.tracker_manifest),
            f'rule_engine_{Path(args.tracker_manifest).stem}'
        )
    os.makedirs(output_dir, exist_ok=True)

    config = {
        'class_change_threshold': args.class_change_threshold,
        'confidence_threshold': args.confidence_threshold,
        'min_track_length_for_confidence': 2,
        'transient_confidence_threshold': args.transient_threshold,
        'overlap_iou_threshold': args.overlap_iou,
    }

    print(f"[INFO] Rule engine starting...")
    print(f"  tracker_manifest : {args.tracker_manifest}")
    print(f"  output           : {output_dir}")
    print(f"  config           : {config}")

    result = run_rule_engine(args.tracker_manifest, output_dir, config)
    s = result['summary']

    print(f"\n[OK] Rule engine complete in {result['total_time_s']:.4f}s")
    print(f"  rule_run_id        : {result['rule_run_id']}")
    print(f"  total_decisions    : {s['total_decisions']}")
    print(f"  affected_tracks    : {s['affected_tracks']}")
    print(f"  unstable_class     : {s['unstable_class_count']}")
    print(f"  low_confidence     : {s['low_confidence_count']}")
    print(f"  transient          : {s['transient_count']}")
    print(f"  conflict           : {s['conflict_count']}")
    print(f"  ended_resolved     : {s['ended_resolved_count']}")
    print(f"  manifest           : {os.path.join(output_dir, 'rule_engine_manifest.json')}")

    return result


if __name__ == '__main__':
    main()
