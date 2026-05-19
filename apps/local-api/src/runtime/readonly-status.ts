import type { FastifyInstance } from 'fastify';

const STATUS = {
  ok: true,
  scope: 'runtime_readonly_status',
  mode: 'readonly_skeleton',
  implementationStatus: 'skeleton',
  runtimeImplemented: false,
  stageCEnabled: false,
  dbWriteEnabled: false,
  externalControlEnabled: false,
  postEndpointsEnabled: false,
  allowedMethods: ['GET'],
  blockedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  source: 'static_contract_summary',
  version: 'v7.31.0-P1',
};

const READINESS = {
  ok: true,
  readiness: 'readonly_skeleton_ready',
  canExecuteRuntime: false,
  canWriteDb: false,
  canControlExternalTools: false,
  canEnableStageC: false,
  requiresHumanApprovalForNextPhase: true,
  blockedCapabilities: [
    'post_runtime_execute',
    'post_runtime_rollback',
    'post_runtime_dry_run',
    'approval_queue',
    'audit_store',
    'evidence_store',
    'db_write',
    'external_control',
    'stage_c_enable',
  ],
};

const GATES = {
  ok: true,
  gates: [
    { id: 'readonly_only', status: 'pass' },
    { id: 'post_endpoints_blocked', status: 'pass' },
    { id: 'db_write_disabled', status: 'pass' },
    { id: 'external_control_disabled', status: 'pass' },
    { id: 'stage_c_disabled', status: 'pass' },
  ],
};

const BLOCKERS = {
  ok: true,
  blockers: [
    { id: 'stage_c_disabled', severity: 'critical', blocked: true },
    { id: 'db_write_blocked', severity: 'critical', blocked: true },
    { id: 'external_control_blocked', severity: 'critical', blocked: true },
    { id: 'post_endpoints_blocked', severity: 'high', blocked: true },
  ],
};

export function registerReadonlyStatusRoutes(app: FastifyInstance): void {
  app.get('/api/runtime/status', async (_request, _reply) => STATUS);
  app.get('/api/runtime/readiness', async (_request, _reply) => READINESS);
  app.get('/api/runtime/gates', async (_request, _reply) => GATES);
  app.get('/api/runtime/blockers', async (_request, _reply) => BLOCKERS);
}
