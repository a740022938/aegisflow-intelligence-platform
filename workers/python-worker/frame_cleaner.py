#!/usr/bin/env python3
"""
frame_cleaner.py - Minimal real frame cleaning using OpenCV
v8E-2: AGI Model Factory - Real frame cleaning executor
"""

import argparse
import json
import os
import sys
import datetime
import shutil


def parse_args():
    parser = argparse.ArgumentParser(description='Frame Cleaning Runner')
    parser.add_argument('--frames-dir', type=str, required=True, help='Directory containing extracted frames')
    parser.add_argument('--output-dir', type=str, required=True, help='Output directory for cleaned frames')
    parser.add_argument('--output-json', type=str, default='', help='Path to write output JSON')
    parser.add_argument('--dry-run', type=str, default='false', help='Dry run: do not copy files')
    return parser.parse_args()


def main():
    args = parse_args()
    result = {'ok': False, 'error': None, 'raw_count': 0, 'cleaned_count': 0, 'dropped_count': 0,
              'dropped_reasons': {}, 'cleaned_files': [], 'dropped_files': []}

    try:
        import cv2

        # Step 1: Validate source directory
        if not os.path.isdir(args.frames_dir):
            result['error'] = 'Frames directory not found: %s' % args.frames_dir
            write_output(args, result)
            return

        # Step 2: List all JPEG files
        raw_files = sorted([f for f in os.listdir(args.frames_dir) if f.lower().endswith(('.jpg', '.jpeg'))])
        result['raw_count'] = len(raw_files)
        if not raw_files:
            result['error'] = 'No JPEG files found in %s' % args.frames_dir
            write_output(args, result)
            return

        # Step 3: Per-frame quality checks
        cleaned_files = []
        dropped_reasons = {}  # reason -> count

        if args.dry_run.lower() == 'true':
            # Dry run: just validate without copying
            for fname in raw_files:
                fpath = os.path.join(args.frames_dir, fname)
                check_result = check_frame(fpath)
                if check_result['ok']:
                    cleaned_files.append(fname)
                else:
                    reason = check_result['reason']
                    dropped_reasons[reason] = dropped_reasons.get(reason, 0) + 1
                    result['dropped_files'].append({'file': fname, 'reason': reason})
        else:
            # Real run: copy valid frames to output
            os.makedirs(args.output_dir, exist_ok=True)

            for fname in raw_files:
                fpath = os.path.join(args.frames_dir, fname)
                check_result = check_frame(fpath)
                if check_result['ok']:
                    out_path = os.path.join(args.output_dir, fname)
                    shutil.copy2(fpath, out_path)
                    cleaned_files.append(fname)
                else:
                    reason = check_result['reason']
                    dropped_reasons[reason] = dropped_reasons.get(reason, 0) + 1
                    result['dropped_files'].append({'file': fname, 'reason': reason})

        # Step 4: Build result
        result['ok'] = True
        result['cleaned_count'] = len(cleaned_files)
        result['dropped_count'] = len(raw_files) - len(cleaned_files)
        result['cleaned_files'] = cleaned_files
        result['dropped_reasons'] = dropped_reasons
        result['dropped_count_by_reason'] = dropped_reasons
        result['source_dir'] = os.path.abspath(args.frames_dir)
        result['output_dir'] = os.path.abspath(args.output_dir) if args.dry_run.lower() != 'true' else None

        print(json.dumps(result, indent=2))

    except Exception as e:
        result['ok'] = False
        result['error'] = str(e)

    write_output(args, result)
    sys.exit(0 if result.get('ok') else 1)


def check_frame(fpath: str) -> dict:
    """
    Check a single frame for validity.
    Returns {ok: bool, reason?: str}
    """
    import cv2

    # Check 1: File exists and is readable
    if not os.path.exists(fpath):
        return {'ok': False, 'reason': 'file_not_found'}

    # Check 2: File size > 100 bytes (avoid empty / too-small files)
    size = os.path.getsize(fpath)
    if size < 100:
        return {'ok': False, 'reason': 'file_too_small', 'size': size}

    # Check 3: JPEG magic bytes (\xFF\xD8\xFF)
    with open(fpath, 'rb') as f:
        header = f.read(3)
    if header[:2] != b'\xFF\xD8':
        return {'ok': False, 'reason': 'invalid_jpeg_header', 'header': header.hex()}

    # Check 4: OpenCV can decode and get valid dimensions
    frame = cv2.imread(fpath, cv2.IMREAD_UNCHANGED)
    if frame is None:
        return {'ok': False, 'reason': 'opencv_decode_failed'}

    h, w = frame.shape[:2]
    if h <= 0 or w <= 0:
        return {'ok': False, 'reason': 'invalid_dimensions', 'width': w, 'height': h}

    return {'ok': True, 'width': w, 'height': h}


def write_output(args, result):
    if args.output_json:
        os.makedirs(os.path.dirname(args.output_json) or '.', exist_ok=True)
        with open(args.output_json, 'w') as f:
            json.dump(result, f, indent=2, default=str)


if __name__ == '__main__':
    main()
