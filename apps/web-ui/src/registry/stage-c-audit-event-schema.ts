// Stage C Audit Event Schema — minimal safe schema for first slice
// Schema only. No persistent write. No external upload.

export type StageCAuditEventType =
  | 'status_viewed'
  | 'feature_flag_viewed'
  | 'kill_switch_viewed'
  | 'safety_boundary_viewed';

export interface StageCAuditEventPreview {
  eventId: string;
  eventType: StageCAuditEventType;
  timestampPolicy: 'preview_only';
  actorPolicy: 'not_captured';
  persistentWriteEnabled: false;
  externalUploadEnabled: false;
  summary: string;
}

export const STAGE_C_AUDIT_EVENT_SCHEMAS: StageCAuditEventPreview[] = [
  {
    eventId: 'stage-c.status.viewed',
    eventType: 'status_viewed',
    timestampPolicy: 'preview_only',
    actorPolicy: 'not_captured',
    persistentWriteEnabled: false,
    externalUploadEnabled: false,
    summary: 'Stage C status API was accessed.',
  },
  {
    eventId: 'stage-c.feature-flag.viewed',
    eventType: 'feature_flag_viewed',
    timestampPolicy: 'preview_only',
    actorPolicy: 'not_captured',
    persistentWriteEnabled: false,
    externalUploadEnabled: false,
    summary: 'Stage C feature flag state was viewed.',
  },
  {
    eventId: 'stage-c.kill-switch.viewed',
    eventType: 'kill_switch_viewed',
    timestampPolicy: 'preview_only',
    actorPolicy: 'not_captured',
    persistentWriteEnabled: false,
    externalUploadEnabled: false,
    summary: 'Stage C kill switch state was viewed.',
  },
  {
    eventId: 'stage-c.safety-boundary.viewed',
    eventType: 'safety_boundary_viewed',
    timestampPolicy: 'preview_only',
    actorPolicy: 'not_captured',
    persistentWriteEnabled: false,
    externalUploadEnabled: false,
    summary: 'Stage C safety boundary was viewed.',
  },
];

export function getAuditEventSchemaCount(): number {
  return STAGE_C_AUDIT_EVENT_SCHEMAS.length;
}
