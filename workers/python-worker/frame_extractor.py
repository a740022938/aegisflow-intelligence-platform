#!/usr/bin/env python3
"""
frame_extractor.py - Minimal real frame extraction using OpenCV
v8E-1: AGI Model Factory - Real frame extraction executor
"""

import argparse
import json
import os
import sys
import datetime

def parse_args():
    parser = argparse.ArgumentParser(description='Frame Extraction Runner')
    parser.add_argument('--video', type=str, required=True, help='Path to video file')
    parser.add_argument('--output-dir', type=str, required=True, help='Output directory for frames')
    parser.add_argument('--fps', type=float, default=2.0, help='Frames per second to extract')
    parser.add_argument('--max-frames', type=int, default=0, help='Max frames to extract (0=all)')
    parser.add_argument('--output-json', type=str, default='', help='Path to write output JSON')
    return parser.parse_args()


def main():
    args = parse_args()
    
    result = {'ok': False, 'error': None, 'frames_extracted': 0, 'output_dir': args.output_dir, 'frames': []}
    
    try:
        import cv2
        
        # Validate video exists
        if not os.path.exists(args.video):
            result['error'] = 'Video file not found: %s' % args.video
            write_output(args, result)
            return
        
        cap = cv2.VideoCapture(args.video)
        if not cap.isOpened():
            result['error'] = 'Failed to open video: %s' % args.video
            write_output(args, result)
            return
        
        video_fps = cap.get(cv2.CAP_PROP_FPS)
        video_frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        video_duration = video_frame_count / video_fps if video_fps > 0 else 0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Calculate frame interval
        if args.fps <= 0:
            args.fps = 1.0
        
        # Frame interval: extract every Nth frame
        frame_interval = max(1, int(round(video_fps / args.fps))) if args.fps > 0 else 1
        
        os.makedirs(args.output_dir, exist_ok=True)
        
        frame_idx = 0
        extracted = 0
        saved_frames = []
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_idx % frame_interval == 0:
                out_path = os.path.join(args.output_dir, 'frame_%04d.jpg' % (extracted + 1))
                cv2.imwrite(out_path, frame)
                saved_frames.append(os.path.basename(out_path))
                extracted += 1
                
                if args.max_frames > 0 and extracted >= args.max_frames:
                    break
            
            frame_idx += 1
        
        cap.release()
        
        # Write manifest
        manifest = {
            'source_path': os.path.abspath(args.video),
            'video_fps': float(video_fps),
            'video_frame_count': video_frame_count,
            'video_duration_seconds': float(video_duration),
            'resolution': '%dx%d' % (width, height),
            'extracted_fps': float(args.fps),
            'frame_interval': frame_interval,
            'total_frames': extracted,
            'output_dir': os.path.abspath(args.output_dir),
            'extracted_at': datetime.datetime.now().isoformat(),
            'frames': saved_frames,
        }
        
        manifest_path = os.path.join(args.output_dir, 'frames_manifest.json')
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        
        result = {
            'ok': True,
            'frames_extracted': extracted,
            'video_fps': float(video_fps),
            'video_frame_count': video_frame_count,
            'video_duration_seconds': float(video_duration),
            'resolution': '%dx%d' % (width, height),
            'extracted_fps': float(args.fps),
            'frame_interval': frame_interval,
            'output_dir': os.path.abspath(args.output_dir),
            'manifest_path': manifest_path,
            'frames': saved_frames,
        }
        
    except Exception as e:
        result['ok'] = False
        result['error'] = str(e)
    
    write_output(args, result)
    print(json.dumps(result, indent=2, default=str))
    sys.exit(0 if result.get('ok') else 1)


def write_output(args, result):
    if args.output_json:
        os.makedirs(os.path.dirname(args.output_json) or '.', exist_ok=True)
        with open(args.output_json, 'w') as f:
            json.dump(result, f, indent=2, default=str)


if __name__ == '__main__':
    main()
