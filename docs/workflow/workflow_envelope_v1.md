# Workflow Envelope v1

## Scope
- Applies to `workflow dry-run` and `workflow run` step outputs.
- Goal: keep one stable step result shape for UI render, tracing, and audit.

## Step Envelope
Each step should be normalized to:

```json
{
  "ok": true,
  "status": "success",
  "step_key": "train_model",
  "step_id": "wf-step-xxx",
  "duration_ms": 1234,
  "executed_at": "2026-04-20T00:00:00.000Z",
  "output": {},
  "error": null,
  "artifacts": [],
  "refs": {},
  "metrics": {},
  "trace": {}
}
```

## Dry-Run Response
- `stepResults[]` keeps UI-friendly view model.
- `stepResults[].envelope` mirrors normalized envelope.
- Top-level `step_envelopes` and `envelope_summary` are required for aggregate rendering.

## Run Response / Storage
- `job_steps.output_json` should store normalized envelope.
- `workflow_jobs.output_summary_json` should expose:
  - `contract_version: "workflow-envelope-v1"`
  - `step_envelopes`
  - `envelope_summary`

## Compatibility Rule
- If legacy non-envelope data is found, server normalizes on read path.
- UI should prefer envelope fields and fallback to legacy fields when missing.
