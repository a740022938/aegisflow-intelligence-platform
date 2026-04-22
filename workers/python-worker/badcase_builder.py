#!/usr/bin/env python3
"""
Bad Cases / Hard Cases Builder for AGI Model Factory
v3.4.0

Generates:
- badcases_manifest.json
- hardcases_manifest.json

Rules for classification:
- Bad case: FP, FN, or very low confidence detection
- Hard case: Low mAP class, boundary conditions
"""

import json
import os
from datetime import datetime
from pathlib import Path

# Simple heuristics when real validation data is not available
DEFAULT_BADCASE_RULES = [
    {
        'type': 'low_confidence',
        'threshold': 0.3,
        'description': 'Detection confidence below threshold',
    },
    {
        'type': 'false_positive',
        'description': 'Predicted class has no ground truth overlap',
    },
    {
        'type': 'false_negative',
        'description': 'Ground truth has no matching prediction',
    },
]

DEFAULT_HARDCASE_RULES = [
    {
        'type': 'low_recall_class',
        'recall_threshold': 0.5,
        'description': 'Class recall below threshold',
    },
    {
        'type': 'high_variance',
        'description': 'Results vary significantly across runs',
    },
    {
        'type': 'occlusion',
        'description': 'Subject partially occluded',
    },
]

def generate_badcases_manifest(badcases, output_dir, rules=None):
    """Generate badcases_manifest.json"""
    
    manifest = {
        'timestamp': datetime.now().isoformat(),
        'version': '3.4.0',
        'type': 'badcases',
        'rules': rules or DEFAULT_BADCASE_RULES,
        'total_count': len(badcases),
        'cases': badcases[:100],  # Cap at 100 cases
    }
    
    output_path = os.path.join(output_dir, 'badcases_manifest.json')
    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(manifest, f, indent=2, default=str)
    
    return output_path

def generate_hardcases_manifest(hardcases, output_dir, rules=None):
    """Generate hardcases_manifest.json"""
    
    manifest = {
        'timestamp': datetime.now().isoformat(),
        'version': '3.4.0',
        'type': 'hardcases',
        'rules': rules or DEFAULT_HARDCASE_RULES,
        'total_count': len(hardcases),
        'cases': hardcases[:100],  # Cap at 100 cases
    }
    
    output_path = os.path.join(output_dir, 'hardcases_manifest.json')
    os.makedirs(os.path.dirname(output_path) or '.', exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(manifest, f, indent=2, default=str)
    
    return output_path

def build_badcases(metrics, config, output_dir, validation_results=None):
    """
    Build bad cases and hard cases manifests.
    
    validation_results: optional list of per-image results from eval_runner
    """
    
    badcases = []
    hardcases = []
    
    if validation_results:
        # Real validation data available - analyze each image
        for result in validation_results:
            image_path = result.get('image_path', '')
            predictions = result.get('predictions', [])
            ground_truths = result.get('ground_truths', [])
            
            # Analyze each prediction
            for pred in predictions:
                conf = pred.get('confidence', 0)
                
                # Low confidence detection -> bad case
                if conf < 0.3:
                    badcases.append({
                        'image_path': image_path,
                        'split': result.get('split', 'val'),
                        'predicted_class': pred.get('class', 'unknown'),
                        'confidence': conf,
                        'error_type': 'low_confidence',
                        'note': f'Confidence {conf:.3f} below 0.3 threshold',
                    })
                
                # No GT overlap -> potential FP
                gt_overlap = pred.get('gt_overlap', 0)
                if gt_overlap == 0 and conf > 0.5:
                    badcases.append({
                        'image_path': image_path,
                        'split': result.get('split', 'val'),
                        'predicted_class': pred.get('class', 'unknown'),
                        'confidence': conf,
                        'error_type': 'false_positive',
                        'note': f'Prediction with no GT overlap',
                    })
            
            # Unmatched GT -> potential FN
            for gt in ground_truths:
                matched = gt.get('matched', False)
                if not matched:
                    badcases.append({
                        'image_path': image_path,
                        'split': result.get('split', 'val'),
                        'ground_truth_class': gt.get('class', 'unknown'),
                        'error_type': 'false_negative',
                        'note': 'Ground truth with no matching prediction',
                    })
        
        # Analyze per-class metrics for hard cases
        per_class = metrics.get('per_class', {})
        for cls_name, cls_metrics in per_class.items():
            recall = cls_metrics.get('recall', 1)
            if recall < 0.5:
                hardcases.append({
                    'class_name': cls_name,
                    'recall': float(recall),
                    'reason': f'Recall {recall:.3f} below 0.5 threshold',
                    'error_type': 'low_recall_class',
                })
    else:
        # No real validation data - generate template manifests
        # Use overall metrics to estimate
        
        overall = metrics.get('overall', {})
        precision = overall.get('precision', 1)
        recall = overall.get('recall', 1)
        
        # Low precision -> many FPs -> bad cases
        if precision < 0.7:
            badcases.append({
                'class_name': 'overall',
                'precision': float(precision),
                'error_type': 'low_precision',
                'note': f'Overall precision {precision:.3f} < 0.7, potential false positives',
            })
        
        # Low recall -> many FNs -> bad cases
        if recall < 0.7:
            badcases.append({
                'class_name': 'overall',
                'recall': float(recall),
                'error_type': 'low_recall',
                'note': f'Overall recall {recall:.3f} < 0.7, potential false negatives',
            })
        
        # Low mAP classes are hard cases
        per_class = metrics.get('per_class', {})
        for cls_name, cls_metrics in per_class.items():
            ap50 = cls_metrics.get('ap50', 1)
            if ap50 < 0.5:
                hardcases.append({
                    'class_name': cls_name,
                    'ap50': float(ap50),
                    'error_type': 'low_ap_class',
                    'note': f'Class {cls_name} AP@0.5 = {ap50:.3f} < 0.5',
                })
    
    # Generate manifests
    badcases_path = generate_badcases_manifest(badcases, output_dir)
    hardcases_path = generate_hardcases_manifest(hardcases, output_dir)
    
    return {
        'badcases_manifest': badcases_path,
        'hardcases_manifest': hardcases_path,
        'badcases_count': len(badcases),
        'hardcases_count': len(hardcases),
    }

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Build bad cases and hard cases manifests')
    parser.add_argument('--metrics', type=str, required=True, help='JSON string or path to metrics')
    parser.add_argument('--config', type=str, required=True, help='JSON string or path to config')
    parser.add_argument('--output-dir', type=str, required=True, help='Output directory')
    parser.add_argument('--validation-results', type=str, help='JSON string or path to validation results')
    args = parser.parse_args()
    
    # Parse metrics (file path or JSON string)
    if os.path.exists(args.metrics):
        with open(args.metrics) as f:
            metrics = json.load(f)
    else:
        metrics = json.loads(args.metrics)
    
    # Parse config (file path or JSON string)
    if os.path.exists(args.config):
        with open(args.config) as f:
            config = json.load(f)
    else:
        config = json.loads(args.config)
    
    # Parse validation results (file path or JSON string)
    validation_results = None
    if args.validation_results:
        if os.path.exists(args.validation_results):
            with open(args.validation_results) as f:
                validation_results = json.load(f)
        else:
            validation_results = json.loads(args.validation_results)
    
    result = build_badcases(metrics, config, args.output_dir, validation_results)
    
    print(json.dumps(result, indent=2))
    return result

if __name__ == '__main__':
    main()
