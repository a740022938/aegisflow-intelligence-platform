#!/usr/bin/env python3
"""
YOLO Training Runner - Real training execution for AGI Model Factory
v3.2.0 - Added preflight, config/env snapshot, execution_mode

Usage:
    python trainer_runner.py --config <config_json_path>
    python trainer_runner.py --dataset-yaml <path> --model <model> --epochs <n> --imgsz <n> --batch <n> --project <path> --name <name>
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

def run_preflight(dataset_yaml, weights, output_dir):
    """Run preflight checks"""
    try:
        from preflight import run_preflight as _run_preflight
        return _run_preflight(
            dataset_yaml=dataset_yaml,
            weights_path=weights if weights and os.path.exists(weights) else None,
            output_dir=output_dir,
        )
    except Exception as e:
        return {'ok': False, 'errors': [str(e)]}

def generate_snapshots(args, run_dir):
    """Generate config and env snapshots"""
    snapshots = {}
    
    try:
        from config_snapshot import generate_config_snapshot, save_config_snapshot
        config = generate_config_snapshot(
            dataset_yaml=args.dataset_yaml,
            model=args.model,
            weights=args.resume if args.resume else None,
            epochs=args.epochs,
            imgsz=args.imgsz,
            batch=args.batch,
            device=args.device,
            project=args.project,
            name=args.name,
            resume=bool(args.resume),
        )
        config_path = str(Path(run_dir) / 'config_snapshot.json')
        save_config_snapshot(config, config_path)
        snapshots['config_snapshot'] = config_path
    except Exception as e:
        snapshots['config_snapshot_error'] = str(e)
    
    try:
        from env_snapshot import save_env_snapshot
        env_path = str(Path(run_dir) / 'env_snapshot.json')
        save_env_snapshot(env_path)
        snapshots['env_snapshot'] = env_path
    except Exception as e:
        snapshots['env_snapshot_error'] = str(e)
    
    return snapshots

def parse_args():
    parser = argparse.ArgumentParser(description='YOLO Training Runner')
    parser.add_argument('--config', type=str, help='Path to config JSON file')
    parser.add_argument('--dataset-yaml', type=str, help='Path to dataset.yaml')
    parser.add_argument('--model', type=str, default='yolov8n.pt', help='Model weights or model name')
    parser.add_argument('--epochs', type=int, default=100, help='Number of epochs')
    parser.add_argument('--imgsz', type=int, default=640, help='Image size')
    parser.add_argument('--batch', type=int, default=16, help='Batch size')
    parser.add_argument('--device', type=str, default='', help='Device (cpu, 0, 0,1, etc.)')
    parser.add_argument('--project', type=str, default='runs/train', help='Project directory')
    parser.add_argument('--name', type=str, default='', help='Run name')
    parser.add_argument('--resume', type=str, default='', help='Resume from checkpoint')
    parser.add_argument('--output-json', type=str, help='Path to write output JSON')
    parser.add_argument('--skip-preflight', action='store_true', help='Skip preflight checks')
    parser.add_argument('--timeout-seconds', type=int, default=0, help='Optional override timeout in seconds (0=auto)')
    return parser.parse_args()

def resolve_yolo_cli():
    """Resolve official YOLO CLI entrypoint for the current Python environment."""
    py_dir = Path(sys.executable).parent
    scripts_dir = py_dir / 'Scripts'
    for candidate in (scripts_dir / 'yolo.exe', scripts_dir / 'yolo'):
        if candidate.exists():
            return str(candidate)
    found = shutil.which('yolo')
    if found:
        return found
    raise RuntimeError('YOLO CLI not found. Expected Scripts/yolo(.exe) in current Python environment.')

def decode_process_output(raw):
    """Decode subprocess byte output safely across utf-8/gbk locales."""
    if raw is None:
        return ''
    if isinstance(raw, str):
        return raw
    if not isinstance(raw, (bytes, bytearray)):
        return str(raw)
    for enc in ('utf-8', 'gbk'):
        try:
            return raw.decode(enc)
        except Exception:
            pass
    return raw.decode('utf-8', errors='replace')

def run_training(args):
    """Execute YOLO training using ultralytics"""
    
    run_name = args.name or datetime.now().strftime('%Y%m%d_%H%M%S')
    run_dir = Path(args.project) / run_name
    
    # Ensure run_dir exists for snapshots
    run_dir.mkdir(parents=True, exist_ok=True)
    
    # ── Preflight Check ───────────────────────────────────────────────────────
    preflight_result = None
    if not args.skip_preflight:
        preflight_result = run_preflight(args.dataset_yaml, args.resume or args.model, str(run_dir))
        if not preflight_result['ok']:
            return {
                'ok': False,
                'execution_mode': 'preflight_failed',
                'preflight': preflight_result,
                'error': f"Preflight failed: {', '.join(preflight_result.get('errors', []))}",
            }
    
    # ── Generate Snapshots ───────────────────────────────────────────────────
    snapshots = generate_snapshots(args, run_dir)
    
    # Build command
    yolo_cli = resolve_yolo_cli()
    cmd = [
        yolo_cli,
        'detect',
        'train',
        f'data={args.dataset_yaml}',
        f'model={args.model}',
        f'epochs={args.epochs}',
        f'imgsz={args.imgsz}',
        f'batch={args.batch}',
        'plots=False',
        'exist_ok=True',
        f'project={args.project}',
    ]
    
    if args.name:
        cmd.append(f'name={args.name}')
    if args.device:
        cmd.append(f'device={args.device}')
    if args.resume:
        cmd.append(f'resume={args.resume}')
    
    print(f"[trainer_runner] Starting YOLO training...")
    print(f"[trainer_runner] Command: {' '.join(cmd)}")
    
    start_time = time.time()
    
    # Timeout strategy:
    # - explicit override when timeout_seconds > 0
    # - otherwise keep historical epochs*300, but enforce a floor to avoid killing 1-epoch runs too early
    if args.timeout_seconds and args.timeout_seconds > 0:
        timeout_seconds = int(args.timeout_seconds)
    else:
        timeout_seconds = max(int(args.epochs) * 300, 900)

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=False,
            timeout=timeout_seconds
        )

        stdout_text = decode_process_output(result.stdout)
        stderr_text = decode_process_output(result.stderr)
        
        elapsed = time.time() - start_time
        
        output = {
            'ok': result.returncode == 0,
            'execution_mode': 'real',
            'run_dir': str(run_dir),
            'run_name': run_name,
            'elapsed_seconds': elapsed,
            'timeout_seconds': timeout_seconds,
            'returncode': result.returncode,
            'stdout': stdout_text[-5000:] if len(stdout_text) > 5000 else stdout_text,
            'stderr': stderr_text[-5000:] if len(stderr_text) > 5000 else stderr_text,
            'preflight': preflight_result,
            'snapshots': snapshots,
            'resume': bool(args.resume),
        }
        
        # Check for outputs
        if run_dir.exists():
            best_pt = run_dir / 'weights' / 'best.pt'
            last_pt = run_dir / 'weights' / 'last.pt'
            results_csv = run_dir / 'results.csv'
            
            output['best_pt'] = str(best_pt) if best_pt.exists() else None
            output['last_pt'] = str(last_pt) if last_pt.exists() else None
            output['results_csv'] = str(results_csv) if results_csv.exists() else None
            
            # Parse final metrics from results.csv
            if results_csv.exists():
                try:
                    import pandas as pd
                    df = pd.read_csv(results_csv)
                    if len(df) > 0:
                        last_row = df.iloc[-1]
                        output['final_metrics'] = {
                            'epoch': int(last_row.get('epoch', args.epochs)),
                            'train_loss': float(last_row.get('train/box_loss', 0)),
                            'val_loss': float(last_row.get('val/box_loss', 0)),
                            'mAP50': float(last_row.get('metrics/mAP50(B)', 0)),
                            'mAP50_95': float(last_row.get('metrics/mAP50-95(B)', 0)),
                            'precision': float(last_row.get('metrics/precision(B)', 0)),
                            'recall': float(last_row.get('metrics/recall(B)', 0)),
                        }
                except Exception as e:
                    output['metrics_parse_error'] = str(e)
        
        return output
        
    except subprocess.TimeoutExpired:
        return {
            'ok': False,
            'error': 'Training timed out',
            'elapsed_seconds': time.time() - start_time,
            'timeout_seconds': timeout_seconds,
        }
    except Exception as e:
        return {
            'ok': False,
            'error': str(e),
            'elapsed_seconds': time.time() - start_time,
        }

def main():
    args = parse_args()
    
    # Load config if provided
    if args.config:
        with open(args.config, 'r') as f:
            config = json.load(f)
        
        # Apply config to args
        args.dataset_yaml = config.get('dataset_yaml', args.dataset_yaml)
        args.model = config.get('model', args.model)
        args.epochs = config.get('epochs', args.epochs)
        args.imgsz = config.get('imgsz', args.imgsz)
        args.batch = config.get('batch', args.batch)
        args.device = config.get('device', args.device)
        args.project = config.get('project', args.project)
        args.name = config.get('name', args.name)
        args.resume = config.get('resume', args.resume)
        args.output_json = config.get('output_json', args.output_json)
    
    # Validate required args
    if not args.dataset_yaml:
        result = {'ok': False, 'error': 'dataset_yaml is required'}
    elif not os.path.exists(args.dataset_yaml):
        result = {'ok': False, 'error': f'dataset_yaml not found: {args.dataset_yaml}'}
    else:
        result = run_training(args)
    
    # Write output
    if args.output_json:
        os.makedirs(os.path.dirname(args.output_json) or '.', exist_ok=True)
        with open(args.output_json, 'w') as f:
            json.dump(result, f, indent=2, default=str)
    
    print(json.dumps(result, indent=2, default=str))
    sys.exit(0 if result.get('ok') else 1)

if __name__ == '__main__':
    main()
