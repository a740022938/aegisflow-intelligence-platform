// Runtime Readonly Status API Validator — pure validation checks for readonly status API registry
// Does not modify state, call APIs, or write to databases.

import {
  RUNTIME_READONLY_STATUS_API_ENDPOINTS,
  type RuntimeReadonlyStatusApiEndpoint,
} from './runtime-readonly-status-api-registry';

export interface RuntimeReadonlyStatusApiValidationResult {
  blocking: string[];
  warning: string[];
  info: string[];
}

export function validateRuntimeReadonlyStatusApi(): RuntimeReadonlyStatusApiValidationResult {
  const blocking: string[] = [];
  const warning: string[] = [];
  const info: string[] = [];

  for (const endpoint of RUNTIME_READONLY_STATUS_API_ENDPOINTS) {
    if (endpoint.method === 'GET' && endpoint.mutatesState) {
      blocking.push(`${endpoint.id}: GET endpoint must not mutatesState=true`);
    }
    if (endpoint.method === 'GET' && endpoint.writesDb) {
      blocking.push(`${endpoint.id}: GET endpoint must not writesDb=true`);
    }
    if (endpoint.method === 'GET' && endpoint.controlsExternalTool) {
      blocking.push(`${endpoint.id}: GET endpoint must not controlsExternalTool=true`);
    }
    if (endpoint.implementationStatus === 'not_implemented' && endpoint.currentAllowed) {
      blocking.push(`${endpoint.id}: not_implemented endpoint must not be currentAllowed=true`);
    }
    if (endpoint.requiresStageC && endpoint.currentAllowed) {
      blocking.push(`${endpoint.id}: requiresStageC=true must not be currentAllowed=true`);
    }
    if (endpoint.writesDb && endpoint.currentAllowed) {
      blocking.push(`${endpoint.id}: writesDb=true must not be currentAllowed=true`);
    }
    if (endpoint.controlsExternalTool && endpoint.currentAllowed) {
      blocking.push(`${endpoint.id}: controlsExternalTool=true must not be currentAllowed=true`);
    }
    if ((endpoint.risk === 'critical') && endpoint.currentAllowed) {
      blocking.push(`${endpoint.id}: critical endpoint must not be currentAllowed=true`);
    }

    const requiredForbiddenFields = ['token', 'apiKey', 'password', 'secret', 'privateKey', 'credential'];
    for (const field of requiredForbiddenFields) {
      if (!endpoint.forbiddenFields.includes(field)) {
        blocking.push(`${endpoint.id}: forbiddenFields must include '${field}'`);
      }
    }

    if (!endpoint.requestSchema) {
      warning.push(`${endpoint.id}: must have requestSchema`);
    }
    if (!endpoint.responseSchema) {
      warning.push(`${endpoint.id}: must have responseSchema`);
    }
    if (endpoint.gates.length === 0) {
      warning.push(`${endpoint.id}: must have gates defined`);
    }
    if (!endpoint.reason) {
      warning.push(`${endpoint.id}: must have reason`);
    }
    if (!endpoint.nextAction) {
      warning.push(`${endpoint.id}: must have nextAction`);
    }
  }

  info.push(`Runtime Readonly Status API registry has ${RUNTIME_READONLY_STATUS_API_ENDPOINTS.length} endpoints`);
  info.push(`GET endpoints: ${RUNTIME_READONLY_STATUS_API_ENDPOINTS.filter(e => e.method === 'GET').length}`);
  info.push(`POST endpoints: ${RUNTIME_READONLY_STATUS_API_ENDPOINTS.filter(e => e.method === 'POST').length}`);
  info.push(`contract_only: ${RUNTIME_READONLY_STATUS_API_ENDPOINTS.filter(e => e.implementationStatus === 'contract_only').length}`);
  info.push(`not_implemented: ${RUNTIME_READONLY_STATUS_API_ENDPOINTS.filter(e => e.implementationStatus === 'not_implemented').length}`);
  info.push(`currentAllowed: ${RUNTIME_READONLY_STATUS_API_ENDPOINTS.filter(e => e.currentAllowed).length}`);

  return { blocking, warning, info };
}

export function getRuntimeReadonlyStatusApiValidationSummary(): {
  blocking: number;
  warning: number;
  info: number;
  pass: boolean;
} {
  const result = validateRuntimeReadonlyStatusApi();
  return {
    blocking: result.blocking.length,
    warning: result.warning.length,
    info: result.info.length,
    pass: result.blocking.length === 0,
  };
}
