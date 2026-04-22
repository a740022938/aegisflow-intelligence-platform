#!/usr/bin/env python3
"""
YOLO Evaluation Runner - Real evaluation execution for AGI Model Factory
v3.4.0 - Added report generation and badcase analysis

Usage:
    python eval_runner.py --weights <weights_path> --data <dataset_yaml> --output-json <path>
"""

import argparse
import json
import os
import sys
import subprocess
import time
import shutil
from pathlib import Path
from datetime import datetime

# Import local modules
SCRIPT_DIR = Path(__file__).parent
sys.path.insert(0, str(SCRIPT_DIR))

def parse_args():
    parser = argparse.ArgumentParser(description='YOLO Evaluation Runner')
    parser.add_argument('--weights', type=str, required=True, help='Path to model weights')
    parser.add_argument('--data', type=str, required=True, help='Path to dataset.yaml')
    parser.add_argument('--imgsz', type=int, default=640, help='Image size')
    parser.add_argument('--batch', type=int, default=16, help='Batch size')
    parser.add_argument('--device', type=str, default='', help='Device')
    parser.add_argument('--project', type=str, default='runs/val', help='Project directory')
    parser.add_argument('--name', type=str, default='', help='Run name')
    parser.add_argument('--split', type=str, default='val', help='Split to evaluate (val/test)')
    parser.add_argument('--output-json', type=str, help='Path to write output JSON')
    parser.add_argument('--skip-reports', action='store_true', help='Skip report generation')
    return parser.parse_args()

def resolve_yolo_cli():
    """Resolve official YOLO CLI entrypoint for current Python environment."""
    py_dir = Path(sys.executable).parent
    scripts_dir = py_dir / 'Scripts'
    for candidate in (scripts_dir / 'yolo.exe', scripts_dir / 'yolo'):
        if candidate.exists():
            return str(candidate)
    found = shutil.which('yolo')
    if found:
        return found
    raise RuntimeError('YOLO CLI not found. Expected Scripts/yolo(.exe) in current Python environment.')

def generate_evaluation_reports(eval_config, metrics, output_dir, eval_time=None, sample_count=0, class_count=0):
    """Generate evaluation reports"""
    
    # Build config for reports
    config = {
        'dataset_yaml': eval_config.get('data', ''),
        'weights': eval_config.get('weights', ''),
        'imgsz': eval_config.get('imgsz', 640),
        'batch': eval_config.get('batch', 16),
        'device': eval_config.get('device', ''),
        'split': eval_config.get('split', 'val'),
    }
    
    # Build metrics structure for report builder
    metrics_for_report = {
        'overall': {
            'precision': metrics.get('precision', 0),
            'recall': metrics.get('recall', 0),
            'map50': metrics.get('mAP50', 0),
            'map50_95': metrics.get('mAP50_95', 0),
            'fitness': metrics.get('mAP50_95', 0),  # Use mAP as fitness proxy
        },
        'per_class': {},
    }
    
    reports = {}
    
    # Generate reports
    if not eval_config.get('skip_reports'):
        try:
            from report_builder import build_reports
            reports = build_reports(
                metrics=metrics_for_report,
                config=config,
                output_dir=output_dir,
                eval_time=eval_time,
                sample_count=sample_count,
                class_count=class_count,
            )
        except Exception as e:
            reports['error'] = str(e)
    
    # Generate badcases/hardcases
    if not eval_config.get('skip_reports'):
        try:
            from badcase_builder import build_badcases
            bc_result = build_badcases(metrics_for_report, config, output_dir)
            reports.update(bc_result)
        except Exception as e:
            reports['badcase_error'] = str(e)
    
    return reports

def run_evaluation(args):
    """Execute YOLO validation using ultralytics"""
    
    # Build command
    yolo_cli = resolve_yolo_cli()
    cmd = [
        yolo_cli,
        'detect',
        'val',
        f'data={args.data}',
        f'model={args.weights}',
        f'imgsz={args.imgsz}',
        f'batch={args.batch}',
        f'project={args.project}',
        f'split={args.split}',
        'plots=False',
    ]
    
    if args.name:
        cmd.append(f'name={args.name}')
    if args.device:
        cmd.append(f'device={args.device}')
    
    print(f"[eval_runner] Starting YOLO evaluation...")
    print(f"[eval_runner] Command: {' '.join(cmd)}")
    
    start_time = time.time()
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=3600  # 1 hour max
        )
        
        elapsed = time.time() - start_time
        
        # Parse results
        run_name = args.name or datetime.now().strftime('%Y%m%d_%H%M%S')
        run_dir = Path(args.project) / run_name
        
        output = {
            'ok': result.returncode == 0,
            'execution_mode': 'real',
            'run_dir': str(run_dir),
            'run_name': run_name,
            'elapsed_seconds': elapsed,
            'returncode': result.returncode,
            'stdout': result.stdout[-5000:] if len(result.stdout) > 5000 else result.stdout,
            'stderr': result.stderr[-5000:] if len(result.stderr) > 5000 else result.stderr,
        }
        
        # Parse metrics from stdout (ultralytics prints them)
        metrics = {}
        
        # Look for standard YOLO metrics in output
        for line in result.stdout.split('\n'):
            line = line.strip()
            
            # Parse lines like "Class     Images  Instances      Box(P          R      mAP50  mAP50-95)"
            # and "all         500       1234      0.85      0.80      0.87      0.65"
            if line.startswith('all') and len(line.split()) >= 7:
                parts = line.split()
                try:
                    metrics['images'] = int(parts[1])
                    metrics['instances'] = int(parts[2])
                    metrics['precision'] = float(parts[3])
                    metrics['recall'] = float(parts[4])
                    metrics['mAP50'] = float(parts[5])
                    metrics['mAP50_95'] = float(parts[6])
                except (ValueError, IndexError):
                    pass
            
            # Parse "Results: ..." line
            if 'Results' in line and 'mAP' in line:
                try:
                    import re
                    # Extract mAP values
                    map50_match = re.search(r'mAP50[:\s]+([0-9.]+)', line)
                    map5095_match = re.search(r'mAP50-95[:\s]+([0-9.]+)', line)
                    if map50_match:
                        metrics['mAP50'] = float(map50_match.group(1))
                    if map5095_match:
                        metrics['mAP50_95'] = float(map5095_match.group(1))
                except Exception:
                    pass
        
        output['metrics'] = metrics
        
        # Check for output files
        if run_dir.exists():
            output['confusion_matrix'] = str(run_dir / 'confusion_matrix.png') if (run_dir / 'confusion_matrix.png').exists() else None
            output['results_png'] = str(run_dir / 'results.png') if (run_dir / 'results.png').exists() else None
        
        # v3.4.0: Generate evaluation reports
        sample_count = metrics.get('instances', 0)
        class_count = 0
        if run_dir.exists() and (run_dir / 'weights').exists():
            # Try to count classes from data.yaml
            try:
                import yaml
                with open(args.data) as f:
                    data = yaml.safe_load(f)
                    class_count = len(data.get('names', {}))
            except Exception:
                class_count = 0
        
        eval_config = {
            'data': args.data,
            'weights': args.weights,
            'imgsz': args.imgsz,
            'batch': args.batch,
            'device': args.device,
            'split': args.split,
        }
        
        if not args.skip_reports:
            output['reports'] = generate_evaluation_reports(
                eval_config=eval_config,
                metrics=metrics,
                output_dir=str(run_dir),
                eval_time=elapsed,
                sample_count=sample_count,
                class_count=class_count,
            )
        
        return output
        
    except subprocess.TimeoutExpired:
        return {
            'ok': False,
            'error': 'Evaluation timed out',
            'elapsed_seconds': time.time() - start_time,
        }
    except Exception as e:
        return {
            'ok': False,
            'error': str(e),
            'elapsed_seconds': time.time() - start_time,
        }

def main():
    args = parse_args()
    
    # Validate
    if not os.path.exists(args.weights):
        result = {'ok': False, 'error': f'Weights not found: {args.weights}'}
    elif not os.path.exists(args.data):
        result = {'ok': False, 'error': f'Dataset yaml not found: {args.data}'}
    else:
        result = run_evaluation(args)
    
    # Write output
    if args.output_json:
        os.makedirs(os.path.dirname(args.output_json) or '.', exist_ok=True)
        with open(args.output_json, 'w') as f:
            json.dump(result, f, indent=2, default=str)
    
    print(json.dumps(result, indent=2, default=str))
    sys.exit(0 if result.get('ok') else 1)

if __name__ == '__main__':
    main()
