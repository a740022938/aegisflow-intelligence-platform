// Advanced Placeholder Registry — decision matrix for advanced placeholder pages
// READONLY METADATA ONLY. Does not change navigation, enable features, or execute operations.

export type AdvancedPlaceholderDecision =
  | 'KEEP_ADVANCED_ONLY'
  | 'HOLD_REVIEW'
  | 'MERGE_LATER'
  | 'ARCHIVE_CANDIDATE'
  | 'DO_NOT_EXPOSE';

export type AdvancedPlaceholderRisk = 'low' | 'medium' | 'high';

export type AdvancedPlaceholderCategory =
  | 'automation'
  | 'training'
  | 'model'
  | 'data'
  | 'workflow'
  | 'monitoring'
  | 'deployment'
  | 'inference'
  | 'unknown';

export interface AdvancedPlaceholderItem {
  id: string;
  label: string;
  path: string;
  category: AdvancedPlaceholderCategory;
  decision: AdvancedPlaceholderDecision;
  risk: AdvancedPlaceholderRisk;
  currentExposure: string;
  recommendedExposure: string;
  allowedNow: boolean;
  gates: string[];
  reason: string;
  nextAction: string;
  blockedActions: string[];
  notes: string;
}

export const ADVANCED_PLACEHOLDER_REGISTRY: AdvancedPlaceholderItem[] = [
  {
    id: 'digital-employee',
    label: 'Digital Employee',
    path: '/digital-employee',
    category: 'automation',
    decision: 'KEEP_ADVANCED_ONLY',
    risk: 'medium',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    allowedNow: true,
    gates: ['advanced_mode'],
    reason: 'ModulePage placeholder. No real implementation. Gate behind Advanced Mode.',
    nextAction: 'Keep in Advanced Mode until real module implemented',
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar'],
    notes: '',
  },
  {
    id: 'training-v2',
    label: 'Training V2',
    path: '/training-v2',
    category: 'training',
    decision: 'KEEP_ADVANCED_ONLY',
    risk: 'medium',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    allowedNow: true,
    gates: ['advanced_mode'],
    reason: 'ModulePage placeholder. No real implementation. Gate behind Advanced Mode.',
    nextAction: 'Keep in Advanced Mode until real module implemented',
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar'],
    notes: '',
  },
  {
    id: 'hpo',
    label: 'HPO',
    path: '/hpo',
    category: 'training',
    decision: 'KEEP_ADVANCED_ONLY',
    risk: 'low',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    allowedNow: true,
    gates: ['advanced_mode'],
    reason: 'ModulePage placeholder. Low risk. Gate behind Advanced Mode.',
    nextAction: 'Keep in Advanced Mode',
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar'],
    notes: '',
  },
  {
    id: 'distill',
    label: 'Distill',
    path: '/distill',
    category: 'training',
    decision: 'KEEP_ADVANCED_ONLY',
    risk: 'low',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    allowedNow: true,
    gates: ['advanced_mode'],
    reason: 'ModulePage placeholder. Low risk. Gate behind Advanced Mode.',
    nextAction: 'Keep in Advanced Mode',
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar'],
    notes: '',
  },
  {
    id: 'model-merge',
    label: 'Model Merge',
    path: '/model-merge',
    category: 'model',
    decision: 'KEEP_ADVANCED_ONLY',
    risk: 'medium',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    allowedNow: true,
    gates: ['advanced_mode'],
    reason: 'ModulePage placeholder. Gate behind Advanced Mode.',
    nextAction: 'Keep in Advanced Mode',
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'merge_model'],
    notes: '',
  },
  {
    id: 'inference',
    label: 'Inference',
    path: '/inference',
    category: 'inference',
    decision: 'HOLD_REVIEW',
    risk: 'high',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    allowedNow: false,
    gates: ['advanced_mode', 'human_approval_required', 'readonly_only'],
    reason: 'Model inference could trigger real compute. High risk. Must stay gated behind Advanced Mode and require human approval.',
    nextAction: 'Hold for review. Define inference safety boundary before any exposure.',
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'run_inference', 'execute_model'],
    notes: 'HIGH RISK — not allowedNow. Requires human approval and readonly gate.',
  },
  {
    id: 'annotation',
    label: 'Annotation',
    path: '/annotation',
    category: 'data',
    decision: 'KEEP_ADVANCED_ONLY',
    risk: 'low',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    allowedNow: true,
    gates: ['advanced_mode'],
    reason: 'ModulePage placeholder. Low risk. Gate behind Advanced Mode.',
    nextAction: 'Keep in Advanced Mode',
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar'],
    notes: '',
  },
  {
    id: 'huggingface',
    label: 'HuggingFace',
    path: '/huggingface',
    category: 'model',
    decision: 'KEEP_ADVANCED_ONLY',
    risk: 'low',
    currentExposure: 'primary_nav',
    recommendedExposure: 'connector_center',
    allowedNow: true,
    gates: ['advanced_mode'],
    reason: 'ModulePage placeholder. Future Connector Center candidate. Currently gate behind Advanced Mode.',
    nextAction: 'Consider moving to Connector Center when real integration planned',
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'call_api', 'upload_model'],
    notes: 'Future Connector Center candidate.',
  },
  {
    id: 'backflow-v2',
    label: 'Backflow V2',
    path: '/backflow-v2',
    category: 'automation',
    decision: 'KEEP_ADVANCED_ONLY',
    risk: 'medium',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    allowedNow: true,
    gates: ['advanced_mode'],
    reason: 'ModulePage placeholder. Gate behind Advanced Mode.',
    nextAction: 'Keep in Advanced Mode',
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar'],
    notes: '',
  },
  {
    id: 'scheduler',
    label: 'Scheduler',
    path: '/scheduler',
    category: 'automation',
    decision: 'HOLD_REVIEW',
    risk: 'high',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    allowedNow: false,
    gates: ['advanced_mode', 'human_approval_required'],
    reason: 'Scheduler could trigger automated execution. High risk. Must stay gated.',
    nextAction: 'Hold for review. Define scheduler safety boundary before any exposure.',
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'run_scheduler', 'execute_automation'],
    notes: 'HIGH RISK — not allowedNow.',
  },
  {
    id: 'alerting',
    label: 'Alerting',
    path: '/alerting',
    category: 'monitoring',
    decision: 'KEEP_ADVANCED_ONLY',
    risk: 'medium',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    allowedNow: true,
    gates: ['advanced_mode'],
    reason: 'ModulePage placeholder. Gate behind Advanced Mode.',
    nextAction: 'Keep in Advanced Mode',
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar'],
    notes: '',
  },
  {
    id: 'model-monitor',
    label: 'Model Monitor',
    path: '/model-monitor',
    category: 'monitoring',
    decision: 'KEEP_ADVANCED_ONLY',
    risk: 'medium',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    allowedNow: true,
    gates: ['advanced_mode'],
    reason: 'ModulePage placeholder. Gate behind Advanced Mode.',
    nextAction: 'Keep in Advanced Mode',
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar'],
    notes: '',
  },
  {
    id: 'deploy-v2',
    label: 'Deploy V2',
    path: '/deploy-v2',
    category: 'deployment',
    decision: 'HOLD_REVIEW',
    risk: 'high',
    currentExposure: 'primary_nav',
    recommendedExposure: 'advanced_mode',
    allowedNow: false,
    gates: ['advanced_mode', 'human_approval_required', 'readonly_only'],
    reason: 'Deploy action could trigger production deployment. High risk. Must stay gated.',
    nextAction: 'Hold for review. Define deployment safety boundary before any exposure.',
    blockedActions: ['enable_stage_c', 'write_database', 'modify_sidebar', 'deploy_production', 'release'],
    notes: 'HIGH RISK — not allowedNow.',
  },
];

export function getAdvancedPlaceholderCount(): number {
  return ADVANCED_PLACEHOLDER_REGISTRY.length;
}

export function getAdvancedPlaceholdersByDecision(decision: AdvancedPlaceholderDecision): AdvancedPlaceholderItem[] {
  return ADVANCED_PLACEHOLDER_REGISTRY.filter(item => item.decision === decision);
}

export function getAdvancedPlaceholdersByRisk(risk: AdvancedPlaceholderRisk): AdvancedPlaceholderItem[] {
  return ADVANCED_PLACEHOLDER_REGISTRY.filter(item => item.risk === risk);
}

export function getAdvancedPlaceholderHoldReviewItems(): AdvancedPlaceholderItem[] {
  return getAdvancedPlaceholdersByDecision('HOLD_REVIEW');
}

export function getAdvancedPlaceholderArchiveCandidates(): AdvancedPlaceholderItem[] {
  return getAdvancedPlaceholdersByDecision('ARCHIVE_CANDIDATE');
}
