# Stage C Enablement Kill Switch Design

> **Phase:** v7.36.0-D1
> **Status:** Design only — not implemented

## Requirements
1. **One-command disable** — single API call to disable Stage C completely
2. **No DB destructive operation** — kill switch only sets flag, does not drop tables
3. **No external control during kill** — kill switch does not call external services
4. **Audit note required** — every kill must include human-provided reason
5. **Recovery checklist required** — after kill, verify Stage C is disabled

## Design
```typescript
interface KillSwitchRequest {
  reason: string;           // human-provided reason for kill
  authorizedBy: string;     // human owner name
  timestamp: string;        // ISO timestamp
}

interface KillSwitchResponse {
  success: boolean;
  previousState: boolean;
  currentState: boolean;    // always false after kill
  killedAt: string;
}
```

## Safety
- Kill switch must be tested in dry-run mode before production
- Kill switch must not trigger rollback automatically (rollback is separate)
- Kill switch must not destroy audit evidence
- Kill switch must notify human owner after execution

**This is design only. No kill switch code is implemented in this task.**
