#!/usr/bin/env python3
"""
Environment Snapshot Generator
v3.2.0

Generates env_snapshot.json for reproducibility.
"""

import json
import os
import sys
import platform
import subprocess
from datetime import datetime
from pathlib import Path

def get_package_version(package_name):
    """Get installed package version"""
    try:
        result = subprocess.run(
            [sys.executable, '-m', 'pip', 'show', package_name],
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result.returncode == 0:
            for line in result.stdout.split('\n'):
                if line.startswith('Version:'):
                    return line.split(':', 1)[1].strip()
        return None
    except Exception:
        return None

def get_cuda_info():
    """Get CUDA information"""
    try:
        import torch
        if torch.cuda.is_available():
            return {
                'available': True,
                'version': torch.version.cuda,
                'device_count': torch.cuda.device_count(),
                'devices': [
                    {
                        'index': i,
                        'name': torch.cuda.get_device_name(i),
                        'memory_total_gb': round(torch.cuda.get_device_properties(i).total_memory / (1024**3), 2),
                    }
                    for i in range(torch.cuda.device_count())
                ],
            }
    except Exception:
        pass
    return {'available': False}

def generate_env_snapshot():
    """Generate environment snapshot"""
    
    env = {
        'timestamp': datetime.now().isoformat(),
        'version': '3.2.0',
        'system': {
            'platform': platform.platform(),
            'system': platform.system(),
            'machine': platform.machine(),
            'processor': platform.processor(),
        },
        'python': {
            'version': platform.python_version(),
            'executable': sys.executable,
            'implementation': platform.python_implementation(),
        },
        'packages': {},
        'cuda': get_cuda_info(),
    }
    
    # Get key package versions
    packages = [
        'torch',
        'torchvision',
        'ultralytics',
        'numpy',
        'pandas',
        'opencv-python',
        'onnx',
        'onnxruntime',
    ]
    
    for pkg in packages:
        version = get_package_version(pkg)
        if version:
            env['packages'][pkg] = version
    
    return env

def save_env_snapshot(output_path):
    """Save environment snapshot to file"""
    env = generate_env_snapshot()
    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(env, f, indent=2, default=str)
    return env, output_path

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Generate environment snapshot')
    parser.add_argument('--output-json', type=str, required=True)
    args = parser.parse_args()
    
    env, path = save_env_snapshot(args.output_json)
    print(json.dumps(env, indent=2))

if __name__ == '__main__':
    main()
