// Stage C First Slice Implementation Registry — defines the authorized first slice scope
// Does not execute API calls, modify state, write to databases, or enable Stage C.
// Authorization state: AUTHORIZATION_PENDING. Stage C remains disabled.

export type ImplementationCategory =
  | 'feature_flag_toggle'
  | 'kill_switch'
  | 'status_api'
  | 'audit_event'
  | 'validation';

export type ImplementationStatus = 'planned' | 'in_review' | 'ready' | 'blocked' | 'not_applicable';

export interface StageCFirstSliceImplementationItem {
  id: string;
  title: string;
  category: ImplementationCategory;
  status: ImplementationStatus;
  canEnableStageC: false;
  authorized: true;
  withinFirstSlice: true;
  description: string;
  implementationNotes: string;
  dependsOn: string[];
  blockedBy: string[];
}

export const STAGE_C_FIRST_SLICE_IMPLEMENTATION_REGISTRY: StageCFirstSliceImplementationItem[] = [
  // Feature Flag Toggle
  {
    id: 'ff-toggle-ui-component',
    title: 'Feature Flag Toggle UI Component',
    category: 'feature_flag_toggle',
    status: 'in_review',
    canEnableStageC: false,
    authorized: true,
    withinFirstSlice: true,
    description: 'Toggle UI for enable_stage_c feature flag. Readonly preview when authorization is PENDING.',
    implementationNotes: 'Shows current state. Toggle disabled when authorization is PENDING. Requires reason input on flip. Logs audit event on state change.',
    dependsOn: ['ff-toggle-store'],
    blockedBy: ['authorization-pending'],
  },
  {
    id: 'ff-toggle-store',
    title: 'Feature Flag Toggle State Store',
    category: 'feature_flag_toggle',
    status: 'planned',
    canEnableStageC: false,
    authorized: true,
    withinFirstSlice: true,
    description: 'Persistent store for enable_stage_c flag. Default: false.',
    implementationNotes: 'Settings store. Default false. Cannot be toggled when kill switch active or authorization PENDING.',
    dependsOn: [],
    blockedBy: [],
  },
  {
    id: 'ff-toggle-auth-gate',
    title: 'Feature Flag Toggle Authorization Gate',
    category: 'feature_flag_toggle',
    status: 'in_review',
    canEnableStageC: false,
    authorized: true,
    withinFirstSlice: true,
    description: 'Authorization check gate for feature flag toggle. Blocks toggle when authorization is PENDING.',
    implementationNotes: 'Checks authorization state before allowing toggle. Returns blocked status with reason.',
    dependsOn: ['ff-toggle-store'],
    blockedBy: ['authorization-pending'],
  },
  {
    id: 'ff-toggle-audit-event',
    title: 'Feature Flag Toggle Audit Event',
    category: 'feature_flag_toggle',
    status: 'in_review',
    canEnableStageC: false,
    authorized: true,
    withinFirstSlice: true,
    description: 'Audit event logged when feature flag state changes.',
    implementationNotes: 'Event: stage_c.feature_flag.toggled. Payload: from, to, reason, toggledBy.',
    dependsOn: ['ff-toggle-store'],
    blockedBy: [],
  },
  {
    id: 'ff-toggle-route',
    title: 'Feature Flag Toggle Route',
    category: 'feature_flag_toggle',
    status: 'in_review',
    canEnableStageC: false,
    authorized: true,
    withinFirstSlice: true,
    description: 'Route for feature flag toggle preview. Hidden direct route.',
    implementationNotes: 'Route: /stage-c-first-slice-implementation. Not in sidebar. Hidden direct access only.',
    dependsOn: [],
    blockedBy: [],
  },

  // Kill Switch
  {
    id: 'ks-ui-component',
    title: 'Kill Switch UI Component',
    category: 'kill_switch',
    status: 'in_review',
    canEnableStageC: false,
    authorized: true,
    withinFirstSlice: true,
    description: 'Kill switch UI for emergency_stage_c_disable. Readonly preview when authorization is PENDING.',
    implementationNotes: 'Always accessible. Red confirmation dialog on activate. Forces enable_stage_c to false when active.',
    dependsOn: ['ks-store'],
    blockedBy: [],
  },
  {
    id: 'ks-store',
    title: 'Kill Switch State Store',
    category: 'kill_switch',
    status: 'planned',
    canEnableStageC: false,
    authorized: true,
    withinFirstSlice: true,
    description: 'Persistent store for emergency_stage_c_disable flag. Default: false.',
    implementationNotes: 'Settings store. Overrides enable_stage_c when active. Cannot be overridden by any runtime path.',
    dependsOn: [],
    blockedBy: [],
  },
  {
    id: 'ks-auth-gate',
    title: 'Kill Switch Authorization Gate',
    category: 'kill_switch',
    status: 'in_review',
    canEnableStageC: false,
    authorized: true,
    withinFirstSlice: true,
    description: 'Authorization check gate for kill switch. Deactivate requires authorization.',
    implementationNotes: 'Activate always allowed (emergency). Deactivate requires authorization check.',
    dependsOn: ['ks-store'],
    blockedBy: ['authorization-pending'],
  },
  {
    id: 'ks-audit-event',
    title: 'Kill Switch Audit Event',
    category: 'kill_switch',
    status: 'in_review',
    canEnableStageC: false,
    authorized: true,
    withinFirstSlice: true,
    description: 'Audit event logged when kill switch state changes.',
    implementationNotes: 'Events: stage_c.kill_switch.activated, stage_c.kill_switch.deactivated. Payload: reason, toggledBy.',
    dependsOn: ['ks-store'],
    blockedBy: [],
  },

  // Status API
  {
    id: 'status-api-spec',
    title: 'Stage C Status API Specification',
    category: 'status_api',
    status: 'in_review',
    canEnableStageC: false,
    authorized: true,
    withinFirstSlice: true,
    description: 'Specification for GET /api/v1/stage-c/status endpoint. Readonly.',
    implementationNotes: 'Returns: enabled, killSwitchActive, authorizationState, lastToggleAt, lastToggleBy. No POST/PUT/DELETE.',
    dependsOn: [],
    blockedBy: ['no-post-runtime'],
  },
  {
    id: 'status-api-response-shape',
    title: 'Stage C Status API Response Shape',
    category: 'status_api',
    status: 'in_review',
    canEnableStageC: false,
    authorized: true,
    withinFirstSlice: true,
    description: 'Response shape for status API. Defined but not implemented.',
    implementationNotes: 'JSON shape: { enabled: boolean, killSwitchActive: boolean, authorizationState: string, lastToggleAt: string|null, lastToggleBy: string|null }',
    dependsOn: [],
    blockedBy: [],
  },
  {
    id: 'status-api-readonly-view',
    title: 'Stage C Status API Readonly View',
    category: 'status_api',
    status: 'in_review',
    canEnableStageC: false,
    authorized: true,
    withinFirstSlice: true,
    description: 'Readonly preview of what the status API would return.',
    implementationNotes: 'Simulated response display. No actual API call. Shows expected fields with placeholder values.',
    dependsOn: [],
    blockedBy: [],
  },

  // Audit Events
  {
    id: 'audit-event-schema',
    title: 'Audit Event Schema for Stage C',
    category: 'audit_event',
    status: 'in_review',
    canEnableStageC: false,
    authorized: true,
    withinFirstSlice: true,
    description: 'Audit event schema for Stage C state transitions.',
    implementationNotes: 'Events: flag_toggled, kill_switch_activated, kill_switch_deactivated, status_api_called, unauthorized_access_attempted.',
    dependsOn: [],
    blockedBy: [],
  },
  {
    id: 'audit-event-readonly-review',
    title: 'Audit Event Readonly Review',
    category: 'audit_event',
    status: 'in_review',
    canEnableStageC: false,
    authorized: true,
    withinFirstSlice: true,
    description: 'Readonly review of audit event definitions for Stage C.',
    implementationNotes: 'Lists all planned audit events with their trigger conditions and payload schemas.',
    dependsOn: [],
    blockedBy: [],
  },

  // Validation
  {
    id: 'validation-gate',
    title: 'Validation Gate for First Slice',
    category: 'validation',
    status: 'in_review',
    canEnableStageC: false,
    authorized: true,
    withinFirstSlice: true,
    description: 'Validation gate checklist for first slice implementation. Must pass before any merge.',
    implementationNotes: 'Checks: typecheck, tests, build, safety search, git diff, authorization state, kill switch state.',
    dependsOn: [],
    blockedBy: [],
  },
];

export function getFirstSliceItemCount(): number {
  return STAGE_C_FIRST_SLICE_IMPLEMENTATION_REGISTRY.length;
}
