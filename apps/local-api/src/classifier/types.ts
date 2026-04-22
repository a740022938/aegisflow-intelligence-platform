// apps/local-api/src/classifier/types.ts
// v3.9.x Classifier Verification — 类型定义

export interface ClassifierVerification {
  verification_id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  source_segmentation_id: string;
  source_handoff_id: string;
  source_experiment_id: string;
  source_model_id: string;
  source_dataset_id: string;
  manifest_path: string;
  model_type: string;
  classifier_model_path: string;
  execution_mode: string;
  total_items: number;
  accepted_count: number;
  rejected_count: number;
  uncertain_count: number;
  avg_confidence: number;
  avg_infer_time_s: number;
  // v3.9.x 新增 3 字段
  artifact_id: string;
  total_infer_time_s: number;
  error_message: string;
  created_at: string;
  updated_at: string;
}

export interface ItemResult {
  detection_index: number;
  roi_index: number;
  image_path: string;
  crop_path: string;
  mask_path: string;
  bbox: number[];
  mask_area: number;
  predicted_class: string;
  predicted_class_id: number;
  confidence: number;
  verification_status: 'accepted' | 'rejected' | 'uncertain';
  candidate_class?: string;
  top5_predictions: Array<{ class_name: string; class_idx: number; probability: number }>;
  infer_time_ms: number;
}

export interface ClassifierManifest {
  version: string;
  verification_id: string;
  timestamp: string;
  source_segmentation_id: string;
  source_segmentation_manifest: string;
  source_handoff_manifest: string;
  source: {
    experiment_id: string;
    model_id: string;
    dataset_id: string;
    dataset_version: string;
  };
  model_info: {
    model_type: string;
    architecture: string;
    classifier_checkpoint: string;
    checkpoint: string;
    device: string;
    framework: string;
    load_time_s: number;
    execution_mode: string;
    classes: number;
    weight_load_strategy: 'local-first' | 'torchvision-default';
  };
  summary: {
    total_items: number;
    accepted_count: number;
    rejected_count: number;
    uncertain_count: number;
    avg_confidence: number;
    total_infer_time_s: number;
    avg_infer_time_s: number;
    class_distribution: Record<string, number>;
  };
  item_results: ItemResult[];
  errors: string[];
  error_message?: string;
  output_dirs: { verified_crops: string };
  verification_notes: string[];
}

export interface CreateClassifierVerificationBody {
  segmentation_id: string;
  candidate_class?: string;
  classifier_model_type?: string;
  classifier_model_path?: string;
  device?: string;
  max_items?: number;
}

export interface UpdateClassifierVerificationBody {
  status?: string;
  name?: string;
}

export interface ListClassifierVerificationsQuery {
  segmentation_id?: string;
  experiment_id?: string;
  handoff_id?: string;
  status?: string;
  decision?: 'accepted' | 'rejected' | 'uncertain';
  limit?: number;
  offset?: number;
}
