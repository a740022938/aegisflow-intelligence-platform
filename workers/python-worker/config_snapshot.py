#!/usr/bin/env python3
"""
Config Snapshot Generator
v3.2.0

Generates config_snapshot.json for reproducibility.
"""

import json
import os
from datetime import datetime
from pathlib import Path

def generate_config_snapshot(
    dataset_yaml=None,
    model=None,
    weights=None,
    epochs=100,
    imgsz=640,
    batch=16,
    device='',
    optimizer='auto',
    patience=50,
    seed=None,
    lr0=0.01,
    lrf=0.01,
    momentum=0.937,
    weight_decay=0.0005,
    warmup_epochs=3,
    warmup_momentum=0.8,
    warmup_bias_lr=0.1,
    project='',
    name='',
    resume=False,
    **kwargs
):
    """Generate config snapshot"""
    
    config = {
        'timestamp': datetime.now().isoformat(),
        'version': '3.2.0',
        'training': {
            'dataset_yaml': dataset_yaml,
            'model': model,
            'weights': weights,
            'epochs': epochs,
            'imgsz': imgsz,
            'batch': batch,
            'device': device,
            'optimizer': optimizer,
            'patience': patience,
            'seed': seed,
        },
        'hyperparameters': {
            'lr0': lr0,
            'lrf': lrf,
            'momentum': momentum,
            'weight_decay': weight_decay,
            'warmup_epochs': warmup_epochs,
            'warmup_momentum': warmup_momentum,
            'warmup_bias_lr': warmup_bias_lr,
        },
        'output': {
            'project': project,
            'name': name,
            'resume': resume,
        },
        'extra': kwargs,
    }
    
    return config

def save_config_snapshot(config, output_path):
    """Save config snapshot to file"""
    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(config, f, indent=2, default=str)
    return output_path

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Generate config snapshot')
    parser.add_argument('--dataset-yaml', type=str)
    parser.add_argument('--model', type=str, default='yolov8n.pt')
    parser.add_argument('--weights', type=str)
    parser.add_argument('--epochs', type=int, default=100)
    parser.add_argument('--imgsz', type=int, default=640)
    parser.add_argument('--batch', type=int, default=16)
    parser.add_argument('--device', type=str, default='')
    parser.add_argument('--output-json', type=str, required=True)
    args = parser.parse_args()
    
    config = generate_config_snapshot(
        dataset_yaml=args.dataset_yaml,
        model=args.model,
        weights=args.weights,
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        device=args.device,
    )
    
    save_config_snapshot(config, args.output_json)
    print(json.dumps(config, indent=2))

if __name__ == '__main__':
    main()
