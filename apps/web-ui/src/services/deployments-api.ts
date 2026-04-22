import {
  Deployment,
  DeploymentLog,
  DeploymentHealth,
  DeploymentStatus,
  DeploymentType,
  RuntimeType,
  GetDeploymentsParams,
} from '../pages/Deployments';

const BASE = '';

export const getDeployments = async (params?: GetDeploymentsParams) => {
  const qs = new URLSearchParams();
  if (params?.q) qs.set('q', params.q);
  if (params?.status) qs.set('status', params.status);
  if (params?.deployment_type) qs.set('deployment_type', params.deployment_type);
  if (params?.runtime) qs.set('runtime', params.runtime);
  if (params?.artifact_id) qs.set('artifact_id', params.artifact_id);
  const url = BASE + '/api/deployments' + (qs.toString() ? '?' + qs : '');
  const r = await fetch(url);
  return r.json();
};

export const getDeployment = async (id: string) => {
  const r = await fetch(BASE + '/api/deployments/' + id);
  return r.json();
};

export const createDeployment = async (data: Partial<Deployment>) => {
  const r = await fetch(BASE + '/api/deployments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return r.json();
};

export const updateDeployment = async (id: string, data: Partial<Deployment>) => {
  const r = await fetch(BASE + '/api/deployments/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return r.json();
};

export const deleteDeployment = async (id: string) => {
  const r = await fetch(BASE + '/api/deployments/' + id, { method: 'DELETE' });
  return r.json();
};

export const startDeployment = async (id: string) => {
  const r = await fetch(BASE + '/api/deployments/' + id + '/start', { method: 'POST' });
  return r.json();
};

export const stopDeployment = async (id: string) => {
  const r = await fetch(BASE + '/api/deployments/' + id + '/stop', { method: 'POST' });
  return r.json();
};

export const restartDeployment = async (id: string) => {
  const r = await fetch(BASE + '/api/deployments/' + id + '/restart', { method: 'POST' });
  return r.json();
};

export const getDeploymentLogs = async (id: string, params?: { level?: string; limit?: number }) => {
  const qs = new URLSearchParams();
  if (params?.level) qs.set('level', params.level);
  if (params?.limit) qs.set('limit', String(params.limit));
  const r = await fetch(BASE + '/api/deployments/' + id + '/logs' + (qs.toString() ? '?' + qs : ''));
  return r.json();
};

export const getDeploymentHealth = async (id: string) => {
  const r = await fetch(BASE + '/api/deployments/' + id + '/health');
  return r.json();
};
