-- Migration: authorization foundation tables
-- Created at (UTC): 2026-05-18T00:00:00.000Z

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS authorization_requests (
  id TEXT PRIMARY KEY,
  request_type TEXT NOT NULL DEFAULT 'synthetic',
  requested_scope TEXT NOT NULL DEFAULT '',
  requested_action TEXT NOT NULL DEFAULT '',
  actor_id TEXT NOT NULL DEFAULT '',
  actor_role TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'internal',
  status TEXT NOT NULL DEFAULT 'draft',
  risk_level TEXT NOT NULL DEFAULT 'medium',
  payload_json TEXT NOT NULL DEFAULT '{}',
  production_action_allowed INTEGER NOT NULL DEFAULT 0,
  stage_c_allowed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS authorization_decisions (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  decision TEXT NOT NULL DEFAULT 'DENY',
  decision_mode TEXT NOT NULL DEFAULT 'synthetic',
  reason TEXT NOT NULL DEFAULT '',
  policy_snapshot_json TEXT NOT NULL DEFAULT '{}',
  runtime_allowed INTEGER NOT NULL DEFAULT 0,
  stage_c_allowed INTEGER NOT NULL DEFAULT 0,
  external_write_allowed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS authorization_audit_events (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL DEFAULT '',
  event_type TEXT NOT NULL DEFAULT '',
  event_source TEXT NOT NULL DEFAULT '',
  event_payload_json TEXT NOT NULL DEFAULT '{}',
  write_mode TEXT NOT NULL DEFAULT 'internal_only',
  external_sink TEXT NOT NULL DEFAULT 'disabled',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS authorization_dry_run_results (
  id TEXT PRIMARY KEY,
  fixture_id TEXT NOT NULL DEFAULT '',
  request_id TEXT NOT NULL DEFAULT '',
  result TEXT NOT NULL DEFAULT '',
  expected_result TEXT NOT NULL DEFAULT '',
  matched INTEGER NOT NULL DEFAULT 0,
  trace_json TEXT NOT NULL DEFAULT '{}',
  synthetic_only INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_req_status ON authorization_requests(status);
CREATE INDEX IF NOT EXISTS idx_auth_req_scope ON authorization_requests(requested_scope);
CREATE INDEX IF NOT EXISTS idx_auth_dec_request ON authorization_decisions(request_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_request ON authorization_audit_events(request_id);
CREATE INDEX IF NOT EXISTS idx_auth_dry_fixture ON authorization_dry_run_results(fixture_id);
