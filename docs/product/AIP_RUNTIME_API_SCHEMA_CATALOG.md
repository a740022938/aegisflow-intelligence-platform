# AIP Runtime API Schema Catalog

> **Schema Version:** v0.1-draft
> **AIP Baseline:** v7.30.0-D2
> **Date:** 2026-05-19
> **Status:** draft schema catalog — no implementation

## 1. Schema Catalog

### 1.1 RuntimeStatus

| Field | Type | Required | Description | Sensitive? | Source | currentStatus |
|-------|------|----------|-------------|------------|--------|---------------|
| runtimeStatus | string | yes | Current runtime status enum (design_only, preview_ready, blocked) | no | contract | draft |
| overallHealth | string | yes | Overall health indicator (green, yellow, red) | no | contract | draft |
| implementationStatus | string | yes | Current implementation status | no | contract | draft |
| currentAllowed | string | yes | Whether endpoint is currently allowed | no | contract | draft |
| stageCEnabled | boolean | yes | Whether Stage C is enabled | no | contract | draft |
| dbWriteEnabled | boolean | yes | Whether DB write is enabled | no | contract | draft |
| externalControlEnabled | boolean | yes | Whether external control is enabled | no | contract | draft |
| lastUpdated | string (date-time) | yes | Last status update timestamp | no | contract | draft |

### 1.2 RuntimeReadiness

| Field | Type | Required | Description | Sensitive? | Source | currentStatus |
|-------|------|----------|-------------|------------|--------|---------------|
| overallReadiness | string | yes | Overall readiness level (not_ready, partially_ready, ready) | no | contract | draft |
| gateReadiness | object | yes | Gate readiness summary (totalGates, passed, blocked, notApplicable) | no | contract | draft |
| capabilityReadiness | object | yes | Capability readiness summary (totalCapabilities, readonlyReady, blocked) | no | contract | draft |
| stageCRequired | boolean | yes | Whether Stage C is required for full readiness | no | contract | draft |
| stageCEnabled | boolean | yes | Whether Stage C is currently enabled | no | contract | draft |

### 1.3 ValidatorSummary

| Field | Type | Required | Description | Sensitive? | Source | currentStatus |
|-------|------|----------|-------------|------------|--------|---------------|
| validatorId | string | yes | Unique validator identifier | no | contract | draft |
| name | string | yes | Human-readable validator name | no | contract | draft |
| blocking | integer | yes | Number of blocking issues | no | contract | draft |
| warning | integer | yes | Number of warnings | no | contract | draft |
| info | integer | yes | Number of info items | no | contract | draft |
| pass | boolean | yes | Whether validator passes | no | contract | draft |
| stageCRequired | boolean | yes | Whether Stage C is required | no | contract | draft |

### 1.4 GateSummary

| Field | Type | Required | Description | Sensitive? | Source | currentStatus |
|-------|------|----------|-------------|------------|--------|---------------|
| gateId | string | yes | Unique gate identifier | no | contract | draft |
| status | string | yes | Gate status (passed, blocked, not_applicable) | no | contract | draft |
| currentState | string | yes | Current gate state | no | contract | draft |
| blockingReason | string | no | Reason if gate is blocked | no | contract | draft |
| requiresHumanAction | boolean | yes | Whether gate requires human action | no | contract | draft |
| stageCRelated | boolean | yes | Whether gate is related to Stage C | no | contract | draft |

### 1.5 RiskSummary

| Field | Type | Required | Description | Sensitive? | Source | currentStatus |
|-------|------|----------|-------------|------------|--------|---------------|
| riskId | string | yes | Unique risk identifier | no | contract | draft |
| level | string | yes | Risk level (low, medium, high, critical) | no | contract | draft |
| category | string | yes | Risk category | no | contract | draft |
| status | string | yes | Current risk status | no | contract | draft |
| blockedBy | array | no | List of blockers | no | contract | draft |
| requiresStageC | boolean | yes | Whether Stage C is required | no | contract | draft |

### 1.6 BlockerSummary

| Field | Type | Required | Description | Sensitive? | Source | currentStatus |
|-------|------|----------|-------------|------------|--------|---------------|
| blockerId | string | yes | Unique blocker identifier | no | contract | draft |
| severity | string | yes | Blocker severity (blocking, warning, info) | no | contract | draft |
| status | string | yes | Current blocker status (active, resolved) | no | contract | draft |
| requiresHumanAction | boolean | yes | Whether human action is required | no | contract | draft |
| relatedCapabilities | array | no | Related capability identifiers | no | contract | draft |

### 1.7 PreviewRouteSummary

| Field | Type | Required | Description | Sensitive? | Source | currentStatus |
|-------|------|----------|-------------|------------|--------|---------------|
| route | string | yes | Preview route path | no | contract | draft |
| name | string | yes | Human-readable page name | no | contract | draft |
| hiddenDirect | boolean | yes | Whether route is hidden direct access only | no | contract | draft |
| inSidebar | boolean | yes | Whether route appears in sidebar | no | contract | draft |
| validatorPass | boolean | yes | Whether associated validator passes | no | contract | draft |
| blocking | integer | yes | Number of blocking issues | no | contract | draft |

### 1.8 AuditPreviewSummary

| Field | Type | Required | Description | Sensitive? | Source | currentStatus |
|-------|------|----------|-------------|------------|--------|---------------|
| auditId | string | yes | Unique audit identifier | no | contract | draft |
| source | string | yes | Audit source component | no | contract | draft |
| eventType | string | yes | Type of audit event | no | contract | draft |
| risk | string | yes | Event risk level | no | contract | draft |
| writeNow | boolean | yes | Whether audit write is enabled | no | contract | draft |

### 1.9 EvidenceSchemaSummary

| Field | Type | Required | Description | Sensitive? | Source | currentStatus |
|-------|------|----------|-------------|------------|--------|---------------|
| evidenceId | string | yes | Unique evidence identifier | no | contract | draft |
| evidenceType | string | yes | Type of evidence | no | contract | draft |
| required | boolean | yes | Whether evidence capture is required | no | contract | draft |
| sensitive | boolean | yes | Whether evidence contains sensitive data | no | contract | draft |
| storageImplemented | boolean | yes | Whether evidence storage is implemented | no | contract | draft |

### 1.10 RollbackReadinessSummary

| Field | Type | Required | Description | Sensitive? | Source | currentStatus |
|-------|------|----------|-------------|------------|--------|---------------|
| rollbackId | string | yes | Unique rollback identifier | no | contract | draft |
| reversible | boolean | yes | Whether operation is potentially reversible | no | contract | draft |
| estimatedImpact | string | no | Estimated impact description | no | contract | draft |
| executorImplemented | boolean | yes | Whether rollback executor is implemented | no | contract | draft |
| gitMutationRequired | boolean | yes | Whether git mutation is needed for rollback | no | contract | draft |

### 1.11 ApprovalRequirementSummary

| Field | Type | Required | Description | Sensitive? | Source | currentStatus |
|-------|------|----------|-------------|------------|--------|---------------|
| approvalId | string | yes | Unique approval requirement identifier | no | contract | draft |
| actionLevel | string | yes | Required action level for approval | no | contract | draft |
| humanApprovalRequired | boolean | yes | Whether human approval is required | no | contract | draft |
| queueImplemented | boolean | yes | Whether approval queue is implemented | no | contract | draft |
| dbWriteRequired | boolean | yes | Whether DB write is required for approval | no | contract | draft |

### 1.12 RuntimeApiError

| Field | Type | Required | Description | Sensitive? | Source | currentStatus |
|-------|------|----------|-------------|------------|--------|---------------|
| code | string | yes | Error code identifier | no | contract | draft |
| message | string | yes | Human-readable error message | no | contract | draft |
| httpStatus | integer | yes | HTTP status code sketch | no | contract | draft |
| safeToShow | boolean | yes | Whether error is safe to display to users | no | contract | draft |
| retryable | boolean | yes | Whether operation can be retried | no | contract | draft |
| requiresHumanAction | boolean | yes | Whether human action is needed | no | contract | draft |
| stageCRelated | boolean | yes | Whether error is related to Stage C | no | contract | draft |

### 1.13 RuntimeApiMeta

| Field | Type | Required | Description | Sensitive? | Source | currentStatus |
|-------|------|----------|-------------|------------|--------|---------------|
| contractVersion | string | yes | Runtime API contract version | no | contract | draft |
| aipBaseline | string | yes | Current AIP baseline version | no | contract | draft |
| implementationStatus | string | yes | Overall implementation status | no | contract | draft |
| stageCEnabled | boolean | yes | Whether Stage C is enabled | no | contract | draft |
| dbWriteEnabled | boolean | yes | Whether DB write is enabled | no | contract | draft |
| externalControlEnabled | boolean | yes | Whether external control is enabled | no | contract | draft |

## 2. Secret/Token Policy

- No token, API key, password, private key, or credential fields are defined in any schema
- Any future schema that requires secret material must be explicitly marked as sensitive
- Secret field values must be redacted by default in all responses
- Secret storage is blocked until Stage C activation + secret handling policy approval
- No endpoint shall return secrets in response bodies

## 3. Schema Status Legend

| Status | Meaning |
|--------|---------|
| draft | Schema is proposed but not finalized |
| frozen | Schema is frozen in current contract |
| implemented | Schema is backed by real implementation |
| deprecated | Schema is scheduled for removal |
