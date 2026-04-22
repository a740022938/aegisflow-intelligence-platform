#!/usr/bin/env python3
"""
Preflight Check for YOLO Training/Evaluation
v3.2.0

Checks:
- Python available
- ultralytics importable
- torch importable
- CUDA availability
- dataset_yaml exists
- model weights exist (if specified)
- output_dir writable
- disk space available
"""

import sys
import os
import json
import platform
import subprocess
from pathlib import Path
from datetime import datetime

def check_python():
    """Check Python version"""
    return {
        'ok': True,
        'version': platform.python_version(),
        'executable': sys.executable,
    }

def check_ultralytics():
    """Check if ultralytics is importable"""
    try:
        import ultralytics
        return {
            'ok': True,
            'version': getattr(ultralytics, '__version__', 'unknown'),
        }
    except ImportError as e:
        return {
            'ok': False,
            'error': str(e),
        }

def check_torch():
    """Check if torch is importable and CUDA status"""
    try:
        import torch
        cuda_available = torch.cuda.is_available()
        cuda_version = torch.version.cuda if cuda_available else None
        device_count = torch.cuda.device_count() if cuda_available else 0
        device_name = torch.cuda.get_device_name(0) if cuda_available and device_count > 0 else None
        
        return {
            'ok': True,
            'version': torch.__version__,
            'cuda_available': cuda_available,
            'cuda_version': cuda_version,
            'device_count': device_count,
            'device_name': device_name,
        }
    except ImportError as e:
        return {
            'ok': False,
            'error': str(e),
        }

def check_file_exists(path, description):
    """Check if a file exists"""
    if not path:
        return {'ok': True, 'skipped': True, 'reason': 'Path not specified'}
    
    p = Path(path)
    if p.exists():
        return {'ok': True, 'path': str(p), 'size': p.stat().st_size}
    else:
        return {'ok': False, 'path': str(p), 'error': f'{description} not found'}

def check_dir_writable(path):
    """Check if a directory is writable"""
    if not path:
        return {'ok': True, 'skipped': True, 'reason': 'Path not specified'}
    
    p = Path(path)
    try:
        p.mkdir(parents=True, exist_ok=True)
        test_file = p / '.write_test'
        test_file.touch()
        test_file.unlink()
        return {'ok': True, 'path': str(p)}
    except Exception as e:
        return {'ok': False, 'path': str(p), 'error': str(e)}

def check_disk_space(path, min_gb=1):
    """Check if there's enough disk space"""
    if not path:
        return {'ok': True, 'skipped': True, 'reason': 'Path not specified'}
    
    try:
        import shutil
        p = Path(path)
        if not p.exists():
            p = p.parent
        total, used, free = shutil.disk_usage(p)
        free_gb = free / (1024 ** 3)
        
        return {
            'ok': free_gb >= min_gb,
            'free_gb': round(free_gb, 2),
            'total_gb': round(total / (1024 ** 3), 2),
            'min_required_gb': min_gb,
        }
    except Exception as e:
        return {'ok': False, 'error': str(e)}

def run_preflight(
    dataset_yaml=None,
    weights_path=None,
    output_dir=None,
    min_disk_gb=1,
):
    """Run all preflight checks"""
    
    results = {
        'timestamp': datetime.now().isoformat(),
        'checks': {},
        'ok': True,
        'errors': [],
    }
    
    # Python check
    results['checks']['python'] = check_python()
    
    # Ultralytics check
    results['checks']['ultralytics'] = check_ultralytics()
    if not results['checks']['ultralytics']['ok']:
        results['ok'] = False
        results['errors'].append(f"ultralytics: {results['checks']['ultralytics'].get('error')}")
    
    # Torch check
    results['checks']['torch'] = check_torch()
    if not results['checks']['torch']['ok']:
        results['ok'] = False
        results['errors'].append(f"torch: {results['checks']['torch'].get('error')}")
    
    # Dataset yaml check
    if dataset_yaml:
        results['checks']['dataset_yaml'] = check_file_exists(dataset_yaml, 'Dataset YAML')
        if not results['checks']['dataset_yaml']['ok']:
            results['ok'] = False
            results['errors'].append(f"dataset_yaml: {results['checks']['dataset_yaml'].get('error')}")
    
    # Weights check
    if weights_path:
        results['checks']['weights'] = check_file_exists(weights_path, 'Model weights')
        if not results['checks']['weights']['ok']:
            results['ok'] = False
            results['errors'].append(f"weights: {results['checks']['weights'].get('error')}")
    
    # Output dir check
    if output_dir:
        results['checks']['output_dir'] = check_dir_writable(output_dir)
        if not results['checks']['output_dir']['ok']:
            results['ok'] = False
            results['errors'].append(f"output_dir: {results['checks']['output_dir'].get('error')}")
    
    # Disk space check
    if output_dir:
        results['checks']['disk_space'] = check_disk_space(output_dir, min_disk_gb)
        if not results['checks']['disk_space']['ok']:
            results['ok'] = False
            results['errors'].append(f"disk_space: Insufficient (need {min_disk_gb}GB)")
    
    return results

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Preflight check for YOLO')
    parser.add_argument('--dataset-yaml', type=str, help='Path to dataset.yaml')
    parser.add_argument('--weights', type=str, help='Path to model weights')
    parser.add_argument('--output-dir', type=str, help='Output directory')
    parser.add_argument('--min-disk-gb', type=float, default=1, help='Minimum disk space in GB')
    parser.add_argument('--output-json', type=str, help='Output JSON path')
    args = parser.parse_args()
    
    results = run_preflight(
        dataset_yaml=args.dataset_yaml,
        weights_path=args.weights,
        output_dir=args.output_dir,
        min_disk_gb=args.min_disk_gb,
    )
    
    output = json.dumps(results, indent=2, default=str)
    
    if args.output_json:
        os.makedirs(os.path.dirname(args.output_json) or '.', exist_ok=True)
        with open(args.output_json, 'w') as f:
            f.write(output)
    
    print(output)
    sys.exit(0 if results['ok'] else 1)

if __name__ == '__main__':
    main()
