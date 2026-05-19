# Stage C Audit Event Schema (Minimal, v7.39)

**Status:** Schema only
**Persistent write:** disabled
**External upload:** disabled

## Event Types

| Event ID | Type | Description |
|----------|------|-------------|
| stage-c.status.viewed | status_viewed | Stage C status API was accessed |
| stage-c.feature-flag.viewed | feature_flag_viewed | Feature flag state was viewed |
| stage-c.kill-switch.viewed | kill_switch_viewed | Kill switch state was viewed |
| stage-c.safety-boundary.viewed | safety_boundary_viewed | Safety boundary was viewed |

## Schema

```ts
type StageCAuditEventPreview = {
  eventId: string;
  eventType: 'status_viewed' | 'feature_flag_viewed' | 'kill_switch_viewed' | 'safety_boundary_viewed';
  timestampPolicy: 'preview_only';
  actorPolicy: 'not_captured';
  persistentWriteEnabled: false;
  externalUploadEnabled: false;
  summary: string;
};
```

## Constraints

- No persistent store write
- No external upload
- No actor capture
- Preview-only timestamps
