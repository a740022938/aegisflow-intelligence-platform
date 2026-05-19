# AIP Runtime API Error Model

> **Error Model Version:** v0.1-draft
> **AIP Baseline:** v7.30.0-D2
> **Date:** 2026-05-19
> **Status:** draft — no HTTP endpoint implemented

## 1. Error Model Purpose

This document defines the standard error model for the Runtime API. All endpoints in the contract use this error model. Note that no HTTP endpoint is currently implemented — httpStatus values are contract sketches for future implementation.

## 2. Standard Error Envelope

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description",
    "httpStatus": 400,
    "safeToShow": true,
    "retryable": false,
    "requiresHumanAction": false,
    "stageCRelated": false,
    "details": {}
  }
}
```

## 3. Error Catalog

### 3.1 CONTRACT_ONLY

| Field | Value |
|-------|-------|
| Code | CONTRACT_ONLY |
| httpStatus sketch | 501 |
| Message | This endpoint is defined in the API contract but is not yet implemented |
| safeToShow | true |
| retryable | false |
| requiresHumanAction | false |
| stageCRelated | false |

### 3.2 NOT_IMPLEMENTED

| Field | Value |
|-------|-------|
| Code | NOT_IMPLEMENTED |
| httpStatus sketch | 501 |
| Message | This operation is not implemented |
| safeToShow | true |
| retryable | false |
| requiresHumanAction | false |
| stageCRelated | false |

### 3.3 STAGE_C_DISABLED

| Field | Value |
|-------|-------|
| Code | STAGE_C_DISABLED |
| httpStatus sketch | 403 |
| Message | This operation requires Stage C which is currently disabled |
| safeToShow | true |
| retryable | false |
| requiresHumanAction | true |
| stageCRelated | true |

### 3.4 HUMAN_APPROVAL_REQUIRED

| Field | Value |
|-------|-------|
| Code | HUMAN_APPROVAL_REQUIRED |
| httpStatus sketch | 403 |
| Message | This operation requires human approval which is not implemented |
| safeToShow | true |
| retryable | false |
| requiresHumanAction | true |
| stageCRelated | true |

### 3.5 DB_WRITE_BLOCKED

| Field | Value |
|-------|-------|
| Code | DB_WRITE_BLOCKED |
| httpStatus sketch | 403 |
| Message | This operation requires DB write which is currently blocked |
| safeToShow | true |
| retryable | false |
| requiresHumanAction | true |
| stageCRelated | true |

### 3.6 EXTERNAL_CONTROL_BLOCKED

| Field | Value |
|-------|-------|
| Code | EXTERNAL_CONTROL_BLOCKED |
| httpStatus sketch | 403 |
| Message | This operation requires external control which is currently blocked |
| safeToShow | true |
| retryable | false |
| requiresHumanAction | true |
| stageCRelated | true |

### 3.7 EVIDENCE_REQUIRED

| Field | Value |
|-------|-------|
| Code | EVIDENCE_REQUIRED |
| httpStatus sketch | 403 |
| Message | This operation requires evidence capture which is not implemented |
| safeToShow | true |
| retryable | false |
| requiresHumanAction | true |
| stageCRelated | true |

### 3.8 ROLLBACK_REQUIRED

| Field | Value |
|-------|-------|
| Code | ROLLBACK_REQUIRED |
| httpStatus sketch | 403 |
| Message | This operation requires rollback capability which is not implemented |
| safeToShow | true |
| retryable | false |
| requiresHumanAction | true |
| stageCRelated | true |

### 3.9 SECRET_FIELD_REJECTED

| Field | Value |
|-------|-------|
| Code | SECRET_FIELD_REJECTED |
| httpStatus sketch | 400 |
| Message | Request contains fields that are blocked: secret material is not allowed |
| safeToShow | true |
| retryable | false |
| requiresHumanAction | false |
| stageCRelated | false |

### 3.10 CANDIDATE_PROCESSING_BLOCKED

| Field | Value |
|-------|-------|
| Code | CANDIDATE_PROCESSING_BLOCKED |
| httpStatus sketch | 403 |
| Message | Candidate processing is blocked — requires DB write and Stage C |
| safeToShow | true |
| retryable | false |
| requiresHumanAction | true |
| stageCRelated | true |

### 3.11 RUNTIME_EXECUTION_BLOCKED

| Field | Value |
|-------|-------|
| Code | RUNTIME_EXECUTION_BLOCKED |
| httpStatus sketch | 403 |
| Message | Runtime execution is blocked — requires Stage C, runtime evaluator, and permission function |
| safeToShow | true |
| retryable | false |
| requiresHumanAction | true |
| stageCRelated | true |

### 3.12 VALIDATION_FAILED

| Field | Value |
|-------|-------|
| Code | VALIDATION_FAILED |
| httpStatus sketch | 400 |
| Message | Request validation failed |
| safeToShow | true |
| retryable | true |
| requiresHumanAction | false |
| stageCRelated | false |

## 4. Error Code Summary

| Code | httpStatus | retryable | requiresHumanAction | stageCRelated |
|------|------------|-----------|---------------------|---------------|
| CONTRACT_ONLY | 501 | false | false | false |
| NOT_IMPLEMENTED | 501 | false | false | false |
| STAGE_C_DISABLED | 403 | false | true | true |
| HUMAN_APPROVAL_REQUIRED | 403 | false | true | true |
| DB_WRITE_BLOCKED | 403 | false | true | true |
| EXTERNAL_CONTROL_BLOCKED | 403 | false | true | true |
| EVIDENCE_REQUIRED | 403 | false | true | true |
| ROLLBACK_REQUIRED | 403 | false | true | true |
| SECRET_FIELD_REJECTED | 400 | false | false | false |
| CANDIDATE_PROCESSING_BLOCKED | 403 | false | true | true |
| RUNTIME_EXECUTION_BLOCKED | 403 | false | true | true |
| VALIDATION_FAILED | 400 | true | false | false |

## 5. Error Response Examples

### Contract-only endpoint
```json
{
  "error": {
    "code": "CONTRACT_ONLY",
    "message": "This endpoint is defined in the API contract but is not yet implemented",
    "httpStatus": 501,
    "safeToShow": true,
    "retryable": false,
    "requiresHumanAction": false,
    "stageCRelated": false
  }
}
```

### Stage C blocked operation
```json
{
  "error": {
    "code": "STAGE_C_DISABLED",
    "message": "This operation requires Stage C which is currently disabled",
    "httpStatus": 403,
    "safeToShow": true,
    "retryable": false,
    "requiresHumanAction": true,
    "stageCRelated": true
  }
}
```

## 6. Implementation Notes

- No HTTP endpoint currently exists — httpStatus values are contract sketches only
- Error codes may be reused across multiple endpoints
- Error details object may contain additional context-specific fields
- All error responses use the standard envelope shown in section 2
- Errors are safe to display to end users unless explicitly marked
- Stage C related errors always require human action
