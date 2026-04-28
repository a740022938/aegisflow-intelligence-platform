export const ERROR_TYPES = {
  WORKER_TIMEOUT: 'worker_timeout',
  WORKER_CRASH: 'worker_crash',
  QUEUE_RECOVERED: 'queue_recovered',
  QUEUE_RECOVERY_FAILED: 'queue_recovery_failed',
  OPENCLAW_CIRCUIT_TRIGGERED: 'openclaw_circuit_triggered',
  VALIDATION_ERROR: 'validation_error',
  API_ERROR: 'api_error',
  PLUGIN_ERROR: 'plugin_error',
  WORKFLOW_STEP_FAILED: 'workflow_step_failed',
  UNKNOWN_ERROR: 'unknown_error',
} as const;

export type ErrorType = typeof ERROR_TYPES[keyof typeof ERROR_TYPES];

export interface ClassifiedError {
  type: ErrorType;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  source: string;
}

export function classifyError(error: any, source: string): ClassifiedError {
  const msg = error?.message || String(error);
  const ts = new Date().toISOString();
  
  if (msg.includes('worker_timeout') || msg.includes('timed out')) {
    return { type: 'worker_timeout', message: msg, context: { raw: error }, timestamp: ts, source };
  }
  if (msg.includes('worker_crash') || msg.includes('killed') || msg.includes('SIGTERM')) {
    return { type: 'worker_crash', message: msg, context: { raw: error }, timestamp: ts, source };
  }
  if (msg.includes('queue_recovered')) {
    return { type: 'queue_recovered', message: msg, context: { raw: error }, timestamp: ts, source };
  }
  if (msg.includes('queue_recovery_failed')) {
    return { type: 'queue_recovery_failed', message: msg, context: { raw: error }, timestamp: ts, source };
  }
  if (msg.includes('circuit_triggered') || msg.includes('openclaw_circuit')) {
    return { type: 'openclaw_circuit_triggered', message: msg, context: { raw: error }, timestamp: ts, source };
  }
  if (msg.includes('validation') || msg.includes('Invalid') || msg.includes('required')) {
    return { type: 'validation_error', message: msg, context: { raw: error }, timestamp: ts, source };
  }
  if (msg.includes('plugin') && (msg.includes('error') || msg.includes('fail'))) {
    return { type: 'plugin_error', message: msg, context: { raw: error }, timestamp: ts, source };
  }
  if (msg.includes('workflow') || msg.includes('step_failed')) {
    return { type: 'workflow_step_failed', message: msg, context: { raw: error }, timestamp: ts, source };
  }
  if (msg.includes('api_error') || msg.includes('status') || msg.includes('HTTP')) {
    return { type: 'api_error', message: msg, context: { raw: error }, timestamp: ts, source };
  }
  
  return { type: 'unknown_error', message: msg, context: { raw: error }, timestamp: ts, source };
}

export function formatErrorForLog(error: ClassifiedError): string {
  return `[${error.type}] in ${error.source}: ${error.message}`;
}

export default { ERROR_TYPES, classifyError, formatErrorForLog };
