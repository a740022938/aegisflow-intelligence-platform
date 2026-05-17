// Governance Registry Validator — validates GOVERNANCE_REGISTRY integrity
// READONLY. Does not execute real operations, write to database,
// trigger external calls, or enable Stage C.

import { GOVERNANCE_REGISTRY } from './governance-registry';
import type { GovernanceModuleDefinition, GovernanceStatus, GovernanceRiskLevel, GovernanceOwnerCenter, SafetyBoundaryTag, GovernanceModuleId, IssueSeverity } from './governance-registry';

const ALLOWED_STATUSES: GovernanceStatus[] = ['pass', 'warning', 'blocked', 'pending_review', 'approval_required', 'dry_run_only', 'disabled', 'deferred', 'unknown'];
const ALLOWED_RISK_LEVELS: GovernanceRiskLevel[] = ['low', 'medium', 'high', 'critical'];
const ALLOWED_OWNER_CENTERS: GovernanceOwnerCenter[] = ['governance', 'connector', 'lab', 'standalone', 'future'];
const ALLOWED_TAGS: SafetyBoundaryTag[] = ['readonly', 'dry_run', 'approval_required', 'external_write_blocked', 'dangerous_action_blocked'];
const ALLOWED_GATE_STATUSES: string[] = ['pass', 'fail', 'warn', 'pending', 'unknown', 'deferred', 'blocked', 'approval_required'];
const ALLOWED_STAGE_C_STATUSES: string[] = ['deferred', 'blocked', 'pending_review', 'approval_required'];
const REQUIRED_GATE_IDS: string[] = [
  'code_quality_gate', 'typecheck_gate', 'build_gate', 'smoke_gate',
  'db_doctor_gate', 'secret_scan_gate', 'menu_parity_gate', 'render_preview_gate',
  'menu_move_dry_run_gate', 'release_readiness_gate', 'human_approval_gate', 'stage_c_gate',
];

export interface GovernanceRegistryIssue {
  severity: IssueSeverity;
  moduleId?: string;
  field?: string;
  message: string;
}

export interface GovernanceRegistryValidationResult {
  pass: boolean;
  issues: GovernanceRegistryIssue[];
  blockingCount: number;
  warningCount: number;
  infoCount: number;
}

export interface GovernanceRegistrySummary {
  totalModules: number;
  byStatus: Record<string, number>;
  byRiskLevel: Record<string, number>;
  byMaturity: Record<string, number>;
  byOwnerCenter: Record<string, number>;
  dryRunOnlyCount: number;
  approvalRequiredCount: number;
  externalWriteBlockedCount: number;
  dangerousActionBlockedCount: number;
  blockedCount: number;
  warningCount: number;
  relatedRouteCount: number;
  missingArtifactWarningCount: number;
}

export function validateGovernanceRegistry(): GovernanceRegistryValidationResult {
  const issues: GovernanceRegistryIssue[] = [];
  const modules = GOVERNANCE_REGISTRY;

  // 1. module count === 13
  if (modules.length !== 13) {
    issues.push({ severity: 'blocking', message: `Module count is ${modules.length}, expected 13` });
  }

  // 2a. moduleId uniqueness
  const ids = modules.map(m => m.moduleId);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    issues.push({ severity: 'blocking', message: 'Duplicate moduleId found' });
  }

  // 2b. Expected IDs present
  const expectedIds: GovernanceModuleId[] = [
    'cost-routing', 'menu-governance', 'registry-parity', 'registry-render-preview',
    'menu-move-dry-run', 'self-check-quality-gate', 'release-readiness',
    'human-approval-gates', 'feature-flag-review', 'risk-audit',
    'assistant-center-boundary', 'memory-hub-boundary', 'connector-lab-boundary',
  ];
  for (const eid of expectedIds) {
    if (!ids.includes(eid)) {
      issues.push({ severity: 'blocking', moduleId: eid, message: `Required module "${eid}" is missing` });
    }
  }

  for (const mod of modules) {
    // 3. safetyBoundaryTags all belong to unified 5
    for (const tag of mod.safetyBoundaryTags) {
      if (!ALLOWED_TAGS.includes(tag)) {
        issues.push({ severity: 'blocking', moduleId: mod.moduleId, field: 'safetyBoundaryTags', message: `Invalid tag "${tag}"` });
      }
    }

    // 4. Each module must include readonly
    if (!mod.safetyBoundaryTags.includes('readonly')) {
      issues.push({ severity: 'blocking', moduleId: mod.moduleId, field: 'safetyBoundaryTags', message: 'Module must include readonly tag' });
    }

    // 5. forbiddenActions must not be empty
    if (!mod.actionPolicy.forbiddenActions || mod.actionPolicy.forbiddenActions.length === 0) {
      issues.push({ severity: 'blocking', moduleId: mod.moduleId, field: 'forbiddenActions', message: 'forbiddenActions must not be empty' });
    }

    // 6. status belongs to allowed enum
    if (!ALLOWED_STATUSES.includes(mod.status)) {
      issues.push({ severity: 'blocking', moduleId: mod.moduleId, field: 'status', message: `Invalid status "${mod.status}"` });
    }

    // 7. riskLevel belongs to allowed enum
    if (!ALLOWED_RISK_LEVELS.includes(mod.riskLevel)) {
      issues.push({ severity: 'blocking', moduleId: mod.moduleId, field: 'riskLevel', message: `Invalid riskLevel "${mod.riskLevel}"` });
    }

    // 8. ownerCenter belongs to allowed enum
    if (!ALLOWED_OWNER_CENTERS.includes(mod.ownerCenter)) {
      issues.push({ severity: 'blocking', moduleId: mod.moduleId, field: 'ownerCenter', message: `Invalid ownerCenter "${mod.ownerCenter}"` });
    }

    // 9. high/critical must have approvalRequired or dangerous_action_blocked
    if (mod.riskLevel === 'high' || mod.riskLevel === 'critical') {
      if (!mod.approvalRequired && !mod.safetyBoundaryTags.includes('dangerous_action_blocked')) {
        issues.push({
          severity: 'blocking', moduleId: mod.moduleId, field: 'riskLevel',
          message: `Risk level "${mod.riskLevel}" requires approvalRequired=true or dangerous_action_blocked tag`,
        });
      }
    }

    // 10. writesDatabase=true produces blocking issue
    if (mod.writesDatabase) {
      issues.push({ severity: 'blocking', moduleId: mod.moduleId, field: 'writesDatabase', message: 'Module writes to database — this must be independently authorized' });
    }

    // 11. writesExternalSystem=true must include external_write_blocked
    if (mod.writesExternalSystem && !mod.safetyBoundaryTags.includes('external_write_blocked')) {
      issues.push({ severity: 'warning', moduleId: mod.moduleId, field: 'writesExternalSystem', message: 'writesExternalSystem=true should include external_write_blocked tag' });
    }

    // 12. No real execution functions (checked by code review, documented in notes)
    // This is a documentation-level check
  }

  // ── Gate validations ──
  const allGates = modules.flatMap(m => m.gates || []);

  // G1. Total gate count must be exactly 12
  if (allGates.length !== 12) {
    issues.push({ severity: 'blocking', message: `Total gate count is ${allGates.length}, expected 12` });
  }

  // G2. All required gateIds must be present
  const existingGateIds = allGates.map(g => g.gateId);
  for (const gid of REQUIRED_GATE_IDS) {
    if (!existingGateIds.includes(gid)) {
      issues.push({ severity: 'blocking', message: `Required gate "${gid}" is missing` });
    }
  }

  // G3. Gate ID uniqueness across all modules
  const uniqueGateIds = new Set(existingGateIds);
  if (uniqueGateIds.size !== existingGateIds.length) {
    issues.push({ severity: 'blocking', message: 'Duplicate gateId found across modules' });
  }

  // G4. All gate statuses must belong to allowed enum
  for (const gate of allGates) {
    if (!ALLOWED_GATE_STATUSES.includes(gate.status)) {
      issues.push({ severity: 'blocking', field: `gates.${gate.gateId}`, message: `Invalid gate status "${gate.status}"` });
    }
  }

  // G5–G7. stage_c_gate specific validations
  const stageCGate = allGates.find(g => g.gateId === 'stage_c_gate');
  if (!stageCGate) {
    issues.push({ severity: 'blocking', message: 'stage_c_gate is not defined — must exist with deferred/blocked/pending_review/approval_required status' });
  } else {
    if (stageCGate.status === 'pass') {
      issues.push({ severity: 'blocking', field: 'gates.stage_c_gate', message: 'stage_c_gate must not be pass. Must be deferred/blocked/pending_review/approval_required' });
    }
    if (!ALLOWED_STAGE_C_STATUSES.includes(stageCGate.status)) {
      issues.push({ severity: 'blocking', field: 'gates.stage_c_gate', message: `stage_c_gate status "${stageCGate.status}" is not allowed. Must be deferred/blocked/pending_review/approval_required` });
    }
  }

  // G8. release-readiness module must forbid publish_release
  const rrModule = modules.find(m => m.moduleId === 'release-readiness');
  if (rrModule && !rrModule.actionPolicy.forbiddenActions.includes('publish_release')) {
    issues.push({ severity: 'blocking', moduleId: 'release-readiness', field: 'actionPolicy.forbiddenActions', message: 'release-readiness must include publish_release in forbiddenActions' });
  }

  // G9. human-approval-gates module must not allow approve/reject/archive in allowedActions
  const haModule = modules.find(m => m.moduleId === 'human-approval-gates');
  if (haModule && haModule.actionPolicy.allowedActions.some(a => a.startsWith('approve_') || a.startsWith('reject_') || a.startsWith('archive_'))) {
    issues.push({ severity: 'blocking', moduleId: 'human-approval-gates', field: 'actionPolicy.allowedActions', message: 'human-approval-gates must not include approve/reject/archive in allowedActions' });
  }

  // G10. All gates must be display-only — no actionPolicy on gates
  // (GovernanceGate has no actionPolicy field; enforcement is by interface definition)

  // 14. cost-routing currentEntry must be /cost-routing
  const cr = modules.find(m => m.moduleId === 'cost-routing');
  if (cr && cr.currentEntry !== '/cost-routing') {
    issues.push({ severity: 'blocking', moduleId: 'cost-routing', field: 'currentEntry', message: `cost-routing currentEntry is "${cr.currentEntry}", expected "/cost-routing"` });
  }

  // 15. cost-routing not marked as moved (migrationStage 0)
  if (cr && cr.migrationStage !== 0) {
    issues.push({ severity: 'warning', moduleId: 'cost-routing', field: 'migrationStage', message: `cost-routing migrationStage is ${cr.migrationStage}, expected 0 (not moved)` });
  }

  // 16. menu-move-dry-run must have dryRunSupport=true
  const mmdr = modules.find(m => m.moduleId === 'menu-move-dry-run');
  if (mmdr && !mmdr.dryRunSupport) {
    issues.push({ severity: 'blocking', moduleId: 'menu-move-dry-run', field: 'dryRunSupport', message: 'menu-move-dry-run must have dryRunSupport=true' });
  }

  // Info: missing artifact warning
  for (const mod of modules) {
    if (!mod.sourceArtifacts || mod.sourceArtifacts.length === 0) {
      issues.push({ severity: 'info', moduleId: mod.moduleId, field: 'sourceArtifacts', message: 'No source artifacts documented' });
    }
  }

  // 17–20. Subtotal consistency checks
  const summary = getGovernanceRegistrySummary();
  const total = modules.length;
  const subtotalStatus = Object.values(summary.byStatus).reduce((a: number, b: number) => a + b, 0);
  const subtotalRisk = Object.values(summary.byRiskLevel).reduce((a: number, b: number) => a + b, 0);
  const subtotalMaturity = Object.values(summary.byMaturity).reduce((a: number, b: number) => a + b, 0);
  const subtotalOwner = Object.values(summary.byOwnerCenter).reduce((a: number, b: number) => a + b, 0);

  if (subtotalStatus !== total) {
    issues.push({ severity: 'blocking', message: `byStatus subtotal (${subtotalStatus}) !== total (${total})` });
  }
  if (subtotalRisk !== total) {
    issues.push({ severity: 'blocking', message: `byRiskLevel subtotal (${subtotalRisk}) !== total (${total})` });
  }
  if (subtotalMaturity !== total) {
    issues.push({ severity: 'blocking', message: `byMaturity subtotal (${subtotalMaturity}) !== total (${total})` });
  }
  if (subtotalOwner !== total) {
    issues.push({ severity: 'blocking', message: `byOwnerCenter subtotal (${subtotalOwner}) !== total (${total})` });
  }

  const blockingCount = issues.filter(i => i.severity === 'blocking').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;

  return {
    pass: blockingCount === 0,
    issues,
    blockingCount,
    warningCount,
    infoCount,
  };
}

export function getGovernanceRegistrySummary(): GovernanceRegistrySummary {
  const modules = GOVERNANCE_REGISTRY;
  const byStatus: Record<string, number> = {};
  const byRiskLevel: Record<string, number> = {};
  const byMaturity: Record<string, number> = {};
  const byOwnerCenter: Record<string, number> = {};

  let dryRunOnlyCount = 0;
  let approvalRequiredCount = 0;
  let externalWriteBlockedCount = 0;
  let dangerousActionBlockedCount = 0;
  let blockedCount = 0;
  let warningCount = 0;
  let relatedRouteCount = 0;
  let missingArtifactWarningCount = 0;

  for (const mod of modules) {
    byStatus[mod.status] = (byStatus[mod.status] || 0) + 1;
    byRiskLevel[mod.riskLevel] = (byRiskLevel[mod.riskLevel] || 0) + 1;
    byMaturity[mod.maturity] = (byMaturity[mod.maturity] || 0) + 1;
    byOwnerCenter[mod.ownerCenter] = (byOwnerCenter[mod.ownerCenter] || 0) + 1;

    if (mod.status === 'dry_run_only') dryRunOnlyCount++;
    if (mod.approvalRequired) approvalRequiredCount++;
    if (mod.safetyBoundaryTags.includes('external_write_blocked')) externalWriteBlockedCount++;
    if (mod.safetyBoundaryTags.includes('dangerous_action_blocked')) dangerousActionBlockedCount++;
    if (mod.status === 'blocked') blockedCount++;
    if (mod.status === 'warning') warningCount++;
    relatedRouteCount += mod.relatedRoutes.length;
    if (!mod.sourceArtifacts || mod.sourceArtifacts.length === 0) missingArtifactWarningCount++;
  }

  return {
    totalModules: modules.length,
    byStatus, byRiskLevel, byMaturity, byOwnerCenter,
    dryRunOnlyCount, approvalRequiredCount,
    externalWriteBlockedCount, dangerousActionBlockedCount,
    blockedCount, warningCount, relatedRouteCount, missingArtifactWarningCount,
  };
}

export function getGovernanceModuleById(id: GovernanceModuleId): GovernanceModuleDefinition | undefined {
  return GOVERNANCE_REGISTRY.find(m => m.moduleId === id);
}

export function listGovernanceModulesByCategory(category: string): GovernanceModuleDefinition[] {
  return GOVERNANCE_REGISTRY.filter(m => m.category === category);
}

export function listGovernanceModulesByRiskLevel(level: GovernanceRiskLevel): GovernanceModuleDefinition[] {
  return GOVERNANCE_REGISTRY.filter(m => m.riskLevel === level);
}
