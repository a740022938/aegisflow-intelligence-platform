export interface Task { id: string; status: string; title: string; }
export interface TaskStep { id: string; task_id: string; step_name: string; status: string; }
export async function executeTask(taskId: string): Promise<{ ok: boolean; taskId: string; status: string }> {
  return { ok: true, taskId, status: 'queued' };
}
export async function cancelTask(taskId: string): Promise<{ ok: boolean; status: string }> {
  return { ok: true, status: 'cancelled' };
}
export default { executeTask, cancelTask };

