# AIP Backend Readonly API Security Boundary

> **Phase:** v7.31.0-D1
> **Status:** Design-only — no security controls implemented
> **Purpose:** Define the security boundary for future readonly backend API implementation

## 1. Threat Model

| Threat | Impact | Mitigation |
|--------|--------|------------|
| Unauthorized access to status data | Low (readonly, no secrets) | Future: API key or token auth |
| Injection via query parameters | Low (no DB, no mutation) | Input validation and sanitization |
| Denial of service | Medium (affects availability) | Rate limiting (future) |
| Information disclosure | Medium (registry data is internal) | Keep behind internal network or auth |
| Unauthorized endpoint access | Medium | Whitelist enforcement |

## 2. Forbidden Inputs

The following inputs must NEVER be accepted by any backend endpoint:

- `token`
- `apiKey`
- `api_key`
- `password`
- `secret`
- `privateKey`
- `private_key`
- `credential`
- `auth_token`
- `refresh_token`

## 3. Forbidden Operations

The backend implementation must NEVER perform:

- Write to any database
- Execute runtime operations
- Call external tools or APIs
- Process candidates or approvals
- Enable Stage C
- Store secrets, tokens, or credentials
- Mutate file system (except log files)
- Git operations

## 4. Allowed Outputs

Allowed response data types:

- Status summaries (enum values, counts, percentages)
- Validator summaries (blocking/warning/info counts)
- Blocker summaries (blocker IDs, descriptions, severities)
- Route summaries (route paths, statuses)
- Schema metadata (field names, types, descriptions)
- Error model codes (error code enums, descriptions)

## 5. Error Model

Future endpoints should return errors using the existing error model:

- Standard HTTP status codes (200, 400, 403, 404, 500)
- Error response body includes `code`, `message`, `details`
- No stack traces exposed in production
- No sensitive data in error messages

## 6. Redaction Policy

All responses must automatically redact:

- Token values (any field matching `*token*`, `*key*`, `*secret*`)
- Credential values
- Private key values
- Password values

Current registries already include `forbiddenFields` arrays defining which fields must be redacted.

## 7. Audit Policy (Future)

When implemented, readonly API should include:

- Access logging (request path, timestamp, source IP — no payload logging)
- No audit database write (log to stdout/stderr only)
- Logs must not contain secrets or tokens
- Log retention managed by deployment infrastructure
