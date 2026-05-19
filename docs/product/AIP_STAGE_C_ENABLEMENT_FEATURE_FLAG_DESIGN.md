# Stage C Enablement Feature Flag Design

> **Phase:** v7.36.0-D1
> **Status:** Design only — not implemented

## Requirements
1. **Default off** — `stageC.enabled = false` on all environments
2. **Deny by default** — any enablement endpoint returns 403 when flag is off
3. **Explicit enable required** — cannot be toggled by UI button, only via API with auth
4. **Separate from UI visibility** — flag does not control route visibility
5. **Separate from route exposure** — flag does not affect hidden direct routes
6. **Cannot be enabled by hidden preview page** — no enable button in any Stage C preview
7. **Cannot be changed by AI assistant** — no automatic flag toggle

## Design
```typescript
interface StageCFeatureFlag {
  enabled: boolean;        // default: false
  enabledAt: string | null; // ISO timestamp
  enabledBy: string | null; // human owner name
  authorizationRef: string | null; // commit hash of auth artifact
}
```

## Implementation Notes
- Flag should be stored in backend config/ DB (not frontend)
- Flag value must be verified server-side on every enablement action
- Flag toggle must create audit event
- Flag cannot be overridden by env var in production without human approval

**This is design only. No feature flag code is implemented in this task.**
