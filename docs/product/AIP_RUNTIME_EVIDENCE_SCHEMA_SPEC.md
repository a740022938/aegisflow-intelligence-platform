# Runtime Evidence Schema Spec

**Status:** v7.28.0-P1 Preview Framework Available
**Stage C:** Disabled
**Implementation:** Not implemented (P1 preview shows evidence types as static model)

## 1. Goals

- Define evidence types and schema for runtime governance
- Establish redaction policy for sensitive fields
- Provide blueprint for future evidence collection

## 2. Non-Goals

- Implement evidence collection
- Write evidence to database
- Include token/API key in evidence
- Enable Stage C

## 3. Evidence Types

| Type | Description | Content |
|------|-------------|---------|
| `registry_snapshot` | Snapshot of runtime registry at a point in time | Full registry JSON |
| `validator_summary` | Validator output for runtime/dry-run/audit | blocking/warning/info counts |
| `dry_run_plan` | Generated dry-run plan | Plan steps, gates, risk |
| `audit_preview` | Audit event model preview | Event list, retention classes |
| `human_note` | Manual note from human reviewer | Free text |
| `report_path` | Path to generated report file | File path string |
| `git_commit` | Git commit hash for traceability | Commit SHA |
| `screenshot` | UI screenshot reference | Image path or URL |
| `validation_output` | Output of validation gates | Lint/typecheck/build results |

## 4. Evidence Schema Draft

```json
{
  "evidenceId": "string",
  "type": "registry_snapshot | validator_summary | ...",
  "createdAt": "ISO8601 timestamp",
  "source": "runtime_registry | dry_run_plan | audit_log_preview | report",
  "content": {},
  "redacted": false,
  "sensitiveFields": [],
  "gitCommit": "string | null",
  "reportPath": "string | null"
}
```

## 5. Redaction Policy

| Field Type | Action |
|------------|--------|
| Token / API Key | NEVER enter evidence |
| User identity | Redacted if PII |
| Internal IP | Redacted |
| DB credentials | NEVER enter evidence |
| External tool credentials | NEVER enter evidence |

## 6. Sensitive Fields

- `token` — never collected
- `apiKey` / `API key` — never collected
- `password` — never collected
- `secret` — redacted if present
- `privateKey` — never collected

## 7. Current Version Behavior

- Evidence is collected only in report files (Markdown/JSON)
- No database write
- No persistent storage
- No evidence retrieval API
- All evidence is ephemeral (report files only)

## 8. v7.28.0-P3 Evidence Schema Preview

**P3 Evidence Schema Preview** is available as a readonly preview at `/evidence-schema-preview` (hidden direct route, not in sidebar). The preview shows evidence types and schema draft only — there is **no evidence writer, no evidence store, no secret capture, no DB write, no external control, and Stage C is disabled**.
