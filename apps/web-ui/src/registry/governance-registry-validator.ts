// Governance Registry Validator — validates GOVERNANCE_REGISTRY integrity
// READONLY. Does not execute real operations, write to database,
// trigger external calls, or enable Stage C.

import { GOVERNANCE_REGISTRY } from './governance-registry';
import type { GovernanceModuleDefinition, GovernanceStatus, GovernanceRiskLevel, GovernanceOwnerCenter, SafetyBoundaryTag, GovernanceModuleId, IssueSeverity } from './governance-registry';

const ALLOWED_STATUSES: GovernanceStatus[] = ['pass', 'warning', 'blocked', 'pending_review', 'approval_required', 'dry_run_only', 'disabled', 'deferred', 'unknown'];
const ALLOWED_RISK_LEVELS: GovernanceRiskLevel[] = ['low', 'medium', 'high', 'critical'];
const ALLOWED_OWNER_CENTERS: GovernanceOwnerCenter[] = ['governance', 'connector', 'lab', 'standalone', 'future'];
const ALLOWED_TAGS: SafetyBoundaryTag[] = ['readonly', 'dry_run', 'approval_required', 'external_write_blocked', 'dangerous_action_blocked'];
const STAGE_C_NOT_ALLOWED_STATUSES: GovernanceStatus[] = ['pass'];

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

  // 13. stage_c_gate must not be pass
  const stageCGateModules = modules.filter(m => m.gates?.some(g => g.gateId === 'stage_c_gate'));
  for (const mod of stageCGateModules) {
    const gate = mod.gates!.find(g => g.gateId === 'stage_c_gate')!;
    if (STAGE_C_NOT_ALLOWED_STATUSES.includes(gate.status as GovernanceStatus)) {
      issues.push({ severity: 'blocking', moduleId: mod.moduleId, field: 'gates.stage_c_gate', message: 'stage_c_gate must not be pass. Must be deferred/blocked/pending_review/approval_required' });
    }
  }

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
