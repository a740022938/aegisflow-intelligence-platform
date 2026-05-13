export type AssistantStatusValue = 'online' | 'offline' | 'unknown';
export type AssistantRiskLevel = 'low' | 'medium' | 'high' | 'critical' | 'unknown';
export type AssistantCheckStatus = 'pass' | 'warn' | 'fail' | 'unknown';

export interface AssistantStatusItem {
  id: string;
  name: string;
  type: string;
  status: AssistantStatusValue;
  port: number | null;
  pid: number | null;
  path: string;
  version: string | null;
  detail: string;
  riskLevel: AssistantRiskLevel;
  suggestedAction: string;
  autoFixAllowed: false;
  readonly: true;
  freeBytes?: number | null;
}

export interface AssistantStatusResponse {
  ok: boolean;
  checkedAt: string;
  lastCheckedAt: string;
  items: AssistantStatusItem[];
  warnings: string[];
  readonly: true;
  autoFixAllowed: false;
  error?: string;
  message?: string;
}

export interface AssistantCheckItem {
  id: string;
  label: string;
  status: AssistantCheckStatus;
  detail: string;
  riskLevel: AssistantRiskLevel;
  readonly: true;
  autoFixAllowed: false;
}

export interface AssistantFullCheckResponse {
  ok: boolean;
  overallStatus: 'healthy' | 'warning' | 'degraded' | string;
  riskLevel: AssistantRiskLevel;
  checks: AssistantCheckItem[];
  warnings: string[];
  suggestedNextActions: string[];
  readonly: true;
  autoFixAllowed: false;
  requiresHumanApproval: true;
  fileWrites: string[];
  checkedAt: string;
  error?: string;
  message?: string;
}

export interface AssistantReportItem {
  fileName: string;
  project: string;
  type: string;
  mtime: string;
  sizeBytes: number;
  path: string;
  summary: string;
  riskLevel: AssistantRiskLevel;
  isSealReport: boolean;
  isCleanupReport: boolean;
  isTrainingReport: boolean;
  readonly: true;
}

export interface AssistantBackupItem {
  name: string;
  project: string;
  type: string;
  mtime: string;
  path: string;
  isDirectory: boolean;
  sizeBytes: number;
  sizeTruncated: boolean;
  scannedFiles: number;
  deleteAllowed: false;
  readonly: true;
}

export interface AssistantSafetyBoundary {
  path: string;
  type: string;
  riskLevel: AssistantRiskLevel;
  allowedActions: string[];
  forbiddenActions: string[];
  requiresUserConfirmation: string[];
  autoFixAllowed: false;
  readonly: true;
  note: string;
}

export interface AssistantListResponse<T> {
  ok: boolean;
  items: T[];
  limit?: number;
  readonly: true;
  deleteAllowed?: false;
  autoFixAllowed?: false;
  error?: string;
  message?: string;
}

export interface AssistantTaskPackageResponse {
  ok: boolean;
  taskType: string;
  text: string;
  warnings: string[];
  autoDispatchAllowed: false;
  readonly: true;
  error?: string;
  message?: string;
}
