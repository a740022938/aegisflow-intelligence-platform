// Lab Registry — static lab item definitions
// READONLY METADATA ONLY. Does not execute training, inference,
// labeling, dataset writes, or model modifications.

export type LabItemType =
  | 'vision_debug'
  | 'dataset_debug'
  | 'workflow_debug'
  | 'prototype'
  | 'placeholder_review'
  | 'local_tool'
  | 'future_lab';

export type LabMaturity = 'prototype' | 'preview' | 'lab' | 'hold_review' | 'future';
export type LabRiskLevel = 'low' | 'medium' | 'high';
export type LabRegistryStatus = 'available_route' | 'planned' | 'hold_review' | 'future';
export type LabSafetyStatus = 'safe' | 'watch' | 'risky' | 'blocked';
export type LabReviewStatus = 'passed' | 'preview_ok' | 'hold_review' | 'future_review';

export interface LabQualityGate {
  readonly: boolean;
  noTraining: boolean;
  noInference: boolean;
  noLabelSave: boolean;
  noDatasetWrite: boolean;
  noDbWrite: boolean;
}

export interface LabRegistryItem {
  id: string;
  name: string;
  type: LabItemType;
  status: LabRegistryStatus;
  maturity: LabMaturity;
  riskLevel: LabRiskLevel;
  currentRoute?: string;
  futureRoute?: string;
  capabilities: string[];
  safetyBoundary: string[];
  actionsAllowed: string[];
  actionsBlocked: string[];
  dataSource: 'static_registry' | 'existing_page' | 'future_integration';
  qualityGate: LabQualityGate;
  displayGroup: string;
  safetyStatus: LabSafetyStatus;
  reviewStatus: LabReviewStatus;
  notes: string;
}

export const LAB_REGISTRY_NEW: LabRegistryItem[] = [
  // ── Active / Available Lab Items ──

  {
    id: 'mahjong-debug',
    name: 'Mahjong Debug',
    type: 'vision_debug',
    status: 'available_route',
    maturity: 'lab',
    riskLevel: 'medium',
    currentRoute: '/vision-lab/mahjong-debug',
    capabilities: ['视觉调试', '麻将数据预览', '调试日志查看'],
    safetyBoundary: ['local-only', 'no_dataset_write', 'no_model_overwrite', 'no_training_run', 'no_label_save'],
    actionsAllowed: ['view_status', 'view_notes', 'generate_task_package'],
    actionsBlocked: ['train', 'predict', 'save_labels', 'overwrite_dataset', 'modify_model_files', 'write_database', 'enable_stage_c'],
    dataSource: 'existing_page',
    qualityGate: { readonly: true, noTraining: true, noInference: true, noLabelSave: true, noDatasetWrite: true, noDbWrite: true },
    displayGroup: 'active_lab_items',
    safetyStatus: 'safe',
    reviewStatus: 'preview_ok',
    notes: '麻将视觉调试台。当前位于视觉实验室分组。Lab Center 候选，仅只读评估，不允许直接执行训练或标注。',
  },

  // ── Hold Review Items ──

  {
    id: 'visual-debug',
    name: 'Visual Debug Tools',
    type: 'vision_debug',
    status: 'hold_review',
    maturity: 'hold_review',
    riskLevel: 'medium',
    futureRoute: '/lab/visual-debug',
    capabilities: ['视觉调试工具集', '图像预览'],
    safetyBoundary: ['local-only', 'no_dataset_write', 'no_training_run'],
    actionsAllowed: ['view_status', 'view_notes'],
    actionsBlocked: ['train', 'predict', 'save_labels', 'overwrite_dataset', 'modify_model_files', 'write_database'],
    dataSource: 'future_integration',
    qualityGate: { readonly: true, noTraining: true, noInference: true, noLabelSave: true, noDatasetWrite: true, noDbWrite: true },
    displayGroup: 'hold_review_items',
    safetyStatus: 'safe',
    reviewStatus: 'hold_review',
    notes: '未来视觉调试工具集。等待人工复核边界后确定实现范围。',
  },
  {
    id: 'dataset-lab',
    name: 'Dataset Lab',
    type: 'dataset_debug',
    status: 'hold_review',
    maturity: 'hold_review',
    riskLevel: 'medium',
    futureRoute: '/lab/dataset',
    capabilities: ['数据集预览', '样本检查'],
    safetyBoundary: ['no_dataset_write', 'no_label_save', 'readonly'],
    actionsAllowed: ['view_status', 'view_notes'],
    actionsBlocked: ['write_dataset', 'save_labels', 'modify_samples', 'train', 'write_database'],
    dataSource: 'future_integration',
    qualityGate: { readonly: true, noTraining: true, noInference: true, noLabelSave: true, noDatasetWrite: true, noDbWrite: true },
    displayGroup: 'hold_review_items',
    safetyStatus: 'watch',
    reviewStatus: 'hold_review',
    notes: '数据集实验工具。等待人工复核。仅只读预览，不允许写入数据集。',
  },
  {
    id: 'workflow-lab',
    name: 'Workflow Lab',
    type: 'workflow_debug',
    status: 'hold_review',
    maturity: 'hold_review',
    riskLevel: 'medium',
    futureRoute: '/lab/workflow',
    capabilities: ['工作流调试预览'],
    safetyBoundary: ['no_run_workflow', 'no_modify_pipeline', 'readonly'],
    actionsAllowed: ['view_status', 'view_notes'],
    actionsBlocked: ['run_workflow', 'modify_pipeline', 'write_database', 'enable_stage_c'],
    dataSource: 'future_integration',
    qualityGate: { readonly: true, noTraining: true, noInference: true, noLabelSave: true, noDatasetWrite: true, noDbWrite: true },
    displayGroup: 'hold_review_items',
    safetyStatus: 'watch',
    reviewStatus: 'hold_review',
    notes: '工作流调试 Lab。等待人工复核。不允许运行工作流。',
  },

  // ── Future Lab Items ──

  {
    id: 'prototype-module-review',
    name: 'Prototype Module Review',
    type: 'prototype',
    status: 'future',
    maturity: 'future',
    riskLevel: 'low',
    futureRoute: '/lab/prototype-review',
    capabilities: ['原型模块检查', '开发中功能预览'],
    safetyBoundary: ['readonly', 'no_write', 'no_execute'],
    actionsAllowed: ['view_status', 'view_notes'],
    actionsBlocked: ['write_database', 'modify_layout', 'execute', 'enable_stage_c'],
    dataSource: 'future_integration',
    qualityGate: { readonly: true, noTraining: true, noInference: true, noLabelSave: true, noDatasetWrite: true, noDbWrite: true },
    displayGroup: 'future_lab_items',
    safetyStatus: 'safe',
    reviewStatus: 'future_review',
    notes: '原型模块复核页面。未来 Lab 候选。仅只读查看。',
  },
  {
    id: 'advanced-placeholder-review',
    name: 'Advanced Placeholder Review',
    type: 'placeholder_review',
    status: 'future',
    maturity: 'future',
    riskLevel: 'low',
    futureRoute: '/lab/placeholder-review',
    capabilities: ['占位模块列表', 'Advanced Mode 候选状态'],
    safetyBoundary: ['readonly', 'no_execute'],
    actionsAllowed: ['view_status', 'view_notes'],
    actionsBlocked: ['write_database', 'modify_layout', 'execute', 'enable_stage_c'],
    dataSource: 'future_integration',
    qualityGate: { readonly: true, noTraining: true, noInference: true, noLabelSave: true, noDatasetWrite: true, noDbWrite: true },
    displayGroup: 'future_lab_items',
    safetyStatus: 'safe',
    reviewStatus: 'future_review',
    notes: 'Advanced Mode 占位页复核。未来 Lab 候选。仅只读查看。',
  },
];

export function getLabRegistryCount(): number {
  return LAB_REGISTRY_NEW.length;
}

export function getLabRegistryByRisk(riskLevel: LabRiskLevel): LabRegistryItem[] {
  return LAB_REGISTRY_NEW.filter(item => item.riskLevel === riskLevel);
}

export function getLabRegistryAvailableRoutes(): LabRegistryItem[] {
  return LAB_REGISTRY_NEW.filter(item => item.status === 'available_route');
}

export function getLabRegistryHoldReviewItems(): LabRegistryItem[] {
  return LAB_REGISTRY_NEW.filter(item => item.status === 'hold_review');
}

export function getLabRegistryFutureItems(): LabRegistryItem[] {
  return LAB_REGISTRY_NEW.filter(item => item.status === 'future');
}

export function getLabRegistryQualityGateSummary(): { total: number; passedAll: number; holdReview: number; future: number } {
  const passedAll = LAB_REGISTRY_NEW.filter(item => Object.values(item.qualityGate).every(v => v === true)).length;
  return {
    total: LAB_REGISTRY_NEW.length,
    passedAll,
    holdReview: LAB_REGISTRY_NEW.filter(item => item.reviewStatus === 'hold_review').length,
    future: LAB_REGISTRY_NEW.filter(item => item.reviewStatus === 'future_review').length,
  };
}

// ── Backward-compatible exports for existing LabCenter.tsx ──

export type LabCategory = string;
export type SafetyBoundaryTag = 'readonly' | 'dry_run' | 'approval_required' | 'external_write_blocked' | 'dangerous_action_blocked';
export type LabStatus = string;

export interface LabActionPolicy {
  allowedActions: string[];
  forbiddenActions: string[];
}

export interface LabPromotionCriteria {
  requiredGates: string[];
  requiredApprovals: string[];
  prerequisites?: string[];
  estimatedMilestone?: string;
  notes: string;
}

export interface LabArchiveCriteria {
  reason: string;
  automaticAfter: string;
  triggers?: string[];
}

export interface LabItemDefinition {
  id: string;
  displayName: string;
  category: LabCategory;
  description: string;
  currentEntry: string;
  path?: string;
  currentGroup?: string;
  relatedRoutes: string[];
  sourceArtifacts: string[];
  status: LabStatus;
  maturity: string;
  riskLevel: LabRiskLevel;
  safetyBoundaryTags: SafetyBoundaryTag[];
  reasonForLab?: string;
  labelKey?: string;
  migrationStage?: number;
  actionPolicy: LabActionPolicy;
  promotionCriteria: LabPromotionCriteria;
  archiveCriteria: LabArchiveCriteria;
  notes?: string;
  nextMilestone?: string;
}

export interface LabStatsResult {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  highRiskCount: number;
  placeholderCount: number;
  needsSpecCount: number;
  promotionCount: number;
  archiveCount: number;
}

export const LAB_REGISTRY: LabItemDefinition[] = [];

export function getLabStats(): LabStatsResult {
  return {
    total: 0, byStatus: { active: 0, inactive: 0, planned: 0, preview: 0 },
    byCategory: {}, highRiskCount: 0, placeholderCount: 0,
    needsSpecCount: 0, promotionCount: 0, archiveCount: 0,
  };
}
