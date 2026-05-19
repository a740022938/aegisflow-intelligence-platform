import type { FastifyInstance, FastifyReply } from 'fastify';

const CONTRACT_VERSION = 'v7.31.0-P1';

function addReadonlyHeaders(reply: FastifyReply): void {
  reply.header('Cache-Control', 'no-store');
}

const STATUS = {
  ok: true,
  scope: 'runtime_readonly_status',
  mode: 'readonly_skeleton',
  contractVersion: CONTRACT_VERSION,
  implementationStatus: 'skeleton',
  runtimeImplemented: false,
  readonly: true,
  stageCEnabled: false,
  dbWriteEnabled: false,
  externalControlEnabled: false,
  postEndpointsEnabled: false,
  allowedMethods: ['GET'],
  blockedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  source: 'static_contract_summary',
  version: CONTRACT_VERSION,
};

const READINESS = {
  ok: true,
  readiness: 'readonly_skeleton_ready',
  contractVersion: CONTRACT_VERSION,
  readonly: true,
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
  contractVersion: CONTRACT_VERSION,
  readonly: true,
  gates: [
    { id: 'readonly_only', status: 'pass' },
    { id: 'get_only', status: 'pass' },
    { id: 'no_post', status: 'pass' },
    { id: 'no_db_write', status: 'pass' },
    { id: 'no_external_control', status: 'pass' },
    { id: 'stage_c_disabled', status: 'pass' },
  ],
};

const BLOCKERS = {
  ok: true,
  contractVersion: CONTRACT_VERSION,
  readonly: true,
  blockers: [
    { id: 'stage_c_disabled', severity: 'critical', blocked: true },
    { id: 'db_write_blocked', severity: 'critical', blocked: true },
    { id: 'external_control_blocked', severity: 'critical', blocked: true },
    { id: 'post_endpoints_blocked', severity: 'high', blocked: true },
  ],
};

export function registerReadonlyStatusRoutes(app: FastifyInstance): void {
  app.get('/api/runtime/status', async (_request, reply) => {
    addReadonlyHeaders(reply);
    return STATUS;
  });
  app.get('/api/runtime/readiness', async (_request, reply) => {
    addReadonlyHeaders(reply);
    return READINESS;
  });
  app.get('/api/runtime/gates', async (_request, reply) => {
    addReadonlyHeaders(reply);
    return GATES;
  });
  app.get('/api/runtime/blockers', async (_request, reply) => {
    addReadonlyHeaders(reply);
    return BLOCKERS;
  });
}
