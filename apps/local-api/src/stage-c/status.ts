import type { FastifyInstance, FastifyReply } from 'fastify';

const CONTRACT_VERSION = 'v7.39.first-slice';

function addReadonlyHeaders(reply: FastifyReply): void {
  reply.header('Cache-Control', 'no-store');
}

const STATUS = {
  ok: true,
  contractVersion: CONTRACT_VERSION,
  readonly: true,
  stageCEnabled: false,
  canEnableStageC: false,
  authorizationState: 'GRANTED_FOR_FIRST_SLICE_IMPLEMENTATION_REVIEW',
  featureFlag: {
    name: 'stage_c_enablement',
    defaultState: 'off',
    currentState: 'off',
    mutableFromUi: false,
  },
  killSwitch: {
    available: true,
    executableFromUi: false,
    state: 'not_triggered',
  },
  safetyBoundary: {
    postRuntimeAllowed: false,
    dbWriteAllowed: false,
    executorAllowed: false,
    externalControlAllowed: false,
    connectorActionAllowed: false,
  },
  audit: {
    schemaDefined: true,
    persistentWriteEnabled: false,
    externalUploadEnabled: false,
  },
  implementationStatus: 'first_slice_shell',
  allowedMethods: ['GET'],
  blockedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  source: 'static_first_slice_contract',
};

export function registerStageCStatusRoutes(app: FastifyInstance): void {
  app.get('/api/stage-c/status', async (_request, reply) => {
    addReadonlyHeaders(reply);
    return STATUS;
  });
}
