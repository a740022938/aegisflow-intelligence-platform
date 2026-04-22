import * as tasks from '../tasks/index.js';
import * as taskSteps from '../task-steps/index.js';
import * as taskLogs from '../task-logs/index.js';
import * as templates from '../templates/index.js';

export interface ExecuteTaskResponse {
  ok: boolean;
  taskId: string;
  status: string;
  stepsCreated?: number;
  logsCreated?: number;
  error?: string;
}

type RuntimeTaskState = {
  cancelRequested: boolean;
};

const runtimeState = new Map<string, RuntimeTaskState>();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function isTerminalStatus(status: string) {
  return ['completed', 'success', 'failed', 'cancelled'].includes(status);
}

function requestCancel(taskId: string): boolean {
  const state = runtimeState.get(taskId);
  if (!state) {
    return false;
  }
  state.cancelRequested = true;
  return true;
}

export function isCancellationRequested(taskId: string): boolean {
  return runtimeState.get(taskId)?.cancelRequested === true;
}

async function finalizeAsCancelled(taskId: string) {
  await tasks.updateTask(taskId, {
    status: 'cancelled',
    finished_at: new Date().toISOString(),
    output_summary: '任务已取消'
  });
  taskLogs.createTaskLog(taskId, {
    level: 'warn',
    message: 'Task cancelled'
  });
}

async function runTaskExecution(taskId: string) {
  let logsCreated = 0;
  let stepsCreated = 0;

  try {
    const taskResult = tasks.getTaskById(taskId);
    if (!taskResult.ok || !taskResult.task) {
      runtimeState.delete(taskId);
      return;
    }

    if (taskResult.task.title.includes('[FAIL]') || taskResult.task.title.includes('失败测试')) {
      throw new Error('Simulated execution failure for diagnostics');
    }

    const stepsResult = taskSteps.getTaskSteps(taskId);
    const hasSteps = stepsResult.ok && stepsResult.steps.length > 0;

    if (!hasSteps) {
      let seededFromTemplate = false;

      if (taskResult.task.template_id || taskResult.task.template_code) {
        let templateRes: any = null;
        if (taskResult.task.template_id) {
          templateRes = templates.getTemplateById(taskResult.task.template_id);
        } else if (taskResult.task.template_code) {
          templateRes = templates.getTemplateByCode(taskResult.task.template_code);
        }

        if (templateRes?.ok && templateRes.template) {
          const steps = Array.isArray(templateRes.template.definition_json?.steps)
            ? templateRes.template.definition_json.steps
            : [];
          let index = 1;
          for (const s of steps) {
            const name = typeof s?.name === 'string' ? s.name : `步骤-${index}`;
            const action = typeof s?.action === 'string' ? s.action : 'action.unknown';
            const createStepResult = taskSteps.createTaskStep(taskId, {
              step_name: name,
              step_type: 'action',
              step_index: index
            });
            if (createStepResult.ok) {
              stepsCreated += 1;
              taskLogs.createTaskLog(taskId, {
                step_id: createStepResult.step?.id || null,
                level: 'info',
                message: `已展开模板步骤：${name}（${action}）`
              });
            }
            index += 1;
          }
          seededFromTemplate = steps.length > 0;
        }
      }

      if (!seededFromTemplate) {
        const createStepResult = taskSteps.createTaskStep(taskId, {
          step_name: 'default-execution-step',
          step_type: 'system',
          step_index: 1
        });
        if (createStepResult.ok) {
          stepsCreated = 1;
        }
      }
    }

    const freshSteps = taskSteps.getTaskSteps(taskId);
    const pendingSteps = freshSteps.ok ? freshSteps.steps.filter(step => step.status === 'pending') : [];

    for (const step of pendingSteps) {
      if (isCancellationRequested(taskId)) {
        await finalizeAsCancelled(taskId);
        runtimeState.delete(taskId);
        return;
      }

      taskSteps.updateStepStatus(taskId, step.id, 'running');
      taskLogs.createTaskLog(taskId, {
        step_id: step.id,
        level: 'info',
        message: `正在执行模板步骤：${step.step_name}`
      });
      await delay(2000);

      if (isCancellationRequested(taskId)) {
        await finalizeAsCancelled(taskId);
        runtimeState.delete(taskId);
        return;
      }

      taskSteps.updateStepStatus(taskId, step.id, 'completed');
      const logResult = taskLogs.createTaskLog(taskId, {
        step_id: step.id,
        level: 'info',
        message: `Step "${step.step_name}" execution completed`
      });
      if (logResult.ok) {
        logsCreated += 1;
      }
    }

    tasks.updateTask(taskId, {
      status: 'completed',
      finished_at: new Date().toISOString(),
      output_summary: `任务执行完成，共处理 ${pendingSteps.length + stepsCreated} 个步骤`,
      error_message: null
    });

    const endLogResult = taskLogs.createTaskLog(taskId, {
      level: 'info',
      message: 'Task execution completed'
    });
    if (endLogResult.ok) {
      logsCreated += 1;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    tasks.updateTask(taskId, {
      status: 'failed',
      finished_at: new Date().toISOString(),
      error_message: message
    });
    taskLogs.createTaskLog(taskId, {
      level: 'error',
      message: `Task execution failed: ${message}`
    });
  } finally {
    runtimeState.delete(taskId);
  }
}

export async function executeTask(taskId: string): Promise<ExecuteTaskResponse> {
  try {
    const taskResult = tasks.getTaskById(taskId);
    if (!taskResult.ok || !taskResult.task) {
      return {
        ok: false,
        taskId,
        status: 'error',
        error: `Task with id ${taskId} not found`
      };
    }

    if (runtimeState.has(taskId)) {
      return {
        ok: false,
        taskId,
        status: 'running',
        error: 'Task is already running'
      };
    }

    if (taskResult.task.status === 'running') {
      return {
        ok: false,
        taskId,
        status: 'running',
        error: 'Task is already running'
      };
    }

    if (isTerminalStatus(taskResult.task.status) || taskResult.task.status === 'pending' || taskResult.task.status === 'queued') {
      tasks.updateTask(taskId, {
        status: 'running',
        started_at: taskResult.task.started_at || new Date().toISOString(),
        finished_at: null,
        error_message: null
      });
    }

    const startLogResult = taskLogs.createTaskLog(taskId, {
      level: 'info',
      message: 'Task execution started'
    });

    runtimeState.set(taskId, { cancelRequested: false });
    void runTaskExecution(taskId);

    return {
      ok: true,
      taskId,
      status: 'running',
      stepsCreated: 0,
      logsCreated: startLogResult.ok ? 1 : 0
    };
  } catch (error) {
    return {
      ok: false,
      taskId,
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export function cancelTask(taskId: string): { ok: boolean; status: string; error?: string } {
  const taskResult = tasks.getTaskById(taskId);
  if (!taskResult.ok || !taskResult.task) {
    return { ok: false, status: 'error', error: `Task with id ${taskId} not found` };
  }

  const status = taskResult.task.status;
  if (!['running', 'pending', 'queued'].includes(status)) {
    return { ok: false, status, error: `Task status "${status}" cannot be cancelled` };
  }

  const requested = requestCancel(taskId);
  taskLogs.createTaskLog(taskId, { level: 'warn', message: 'Cancellation requested' });
  const stepsRes = taskSteps.getTaskSteps(taskId);
  if (stepsRes.ok) {
    stepsRes.steps
      .filter(step => step.status === 'running')
      .forEach(step => {
        taskSteps.updateStepStatus(taskId, step.id, 'failed');
      });
  }
  tasks.updateTask(taskId, {
    status: 'cancelled',
    finished_at: new Date().toISOString(),
    output_summary: '任务已取消'
  });
  taskLogs.createTaskLog(taskId, { level: 'warn', message: requested ? 'Task cancellation in progress' : 'Task cancelled' });

  return { ok: true, status: 'cancelled' };
}

export function getTaskExecutionStats(taskId: string): {
  ok: boolean;
  taskId: string;
  stepsCount: number;
  pendingSteps: number;
  completedSteps: number;
  logsCount: number;
  error?: string;
} {
  try {
    const taskResult = tasks.getTaskById(taskId);
    if (!taskResult.ok || !taskResult.task) {
      return {
        ok: false,
        taskId,
        stepsCount: 0,
        pendingSteps: 0,
        completedSteps: 0,
        logsCount: 0,
        error: `Task with id ${taskId} not found`
      };
    }

    const stepsResult = taskSteps.getTaskSteps(taskId);
    let stepsCount = 0;
    let pendingSteps = 0;
    let completedSteps = 0;

    if (stepsResult.ok && stepsResult.steps) {
      stepsCount = stepsResult.steps.length;
      pendingSteps = stepsResult.steps.filter(step => step.status === 'pending').length;
      completedSteps = stepsResult.steps.filter(step => step.status === 'completed').length;
    }

    const logsResult = taskLogs.getTaskLogs(taskId);
    const logsCount = logsResult.ok ? logsResult.count : 0;

    return { ok: true, taskId, stepsCount, pendingSteps, completedSteps, logsCount };
  } catch (error) {
    return {
      ok: false,
      taskId,
      stepsCount: 0,
      pendingSteps: 0,
      completedSteps: 0,
      logsCount: 0,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export default {
  executeTask,
  cancelTask,
  getTaskExecutionStats,
  isCancellationRequested
};
