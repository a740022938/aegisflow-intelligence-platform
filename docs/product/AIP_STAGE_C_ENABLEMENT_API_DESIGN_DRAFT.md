# Stage C Enablement API Design Draft

> **Phase:** v7.36.0-D1
> **Status:** Draft only — not implemented

**POST endpoints are design placeholders only. No POST runtime endpoint is implemented in this task.**

## Endpoints

### `POST /api/stage-c/enable`
Enable Stage C (requires authorization token).

### `POST /api/stage-c/disable`
Disable Stage C.

### `POST /api/stage-c/kill`
Emergency kill switch.

### `GET /api/stage-c/status`
Read-only status endpoint (no auth required).

### `GET /api/stage-c/dry-run`
Preview what enablement would do (no state change).

## Request/Response Design
All POST endpoints require:
- `Authorization: Bearer <token>` header (token from committed auth artifact)
- Request body with `reason` field

All responses include:
- `success: boolean`
- `state: { enabled: boolean, changedAt: string }`
- `auditRef: string`

## Safety
- No POST endpoint is implemented in this task
- All endpoints must be behind feature flag when implemented
- All endpoints must be idempotent
- All endpoints must log audit events

**This is a DRAFT only. No POST runtime endpoint is implemented.**
