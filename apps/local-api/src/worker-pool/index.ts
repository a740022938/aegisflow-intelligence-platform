import { spawn, type ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';

interface PoolWorker {
  process: ChildProcess;
  busy: boolean;
  id: string;
  spawnedAt: number;
  taskCount: number;
  alive: boolean;
  lastStartedAt: number | null;
  lastFinishedAt: number | null;
  lastError: string | null;
}

interface PoolConfig {
  minWorkers: number;
  maxWorkers: number;
  idleTimeoutMs: number;
  maxTaskPerWorker: number;
  pythonCmd: string;
  workerDir: string;
  taskTimeoutMs: number;
}

interface TaskResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  code: number | null;
  durationMs: number;
}

const DEFAULT_CONFIG: PoolConfig = {
  minWorkers: 2,
  maxWorkers: 8,
  idleTimeoutMs: 300_000,
  maxTaskPerWorker: 50,
  pythonCmd: 'python',
  workerDir: '',
  taskTimeoutMs: 300_000,
};

class PythonWorkerPool extends EventEmitter {
  private config: PoolConfig;
  private workers: PoolWorker[] = [];
  private taskQueue: Array<{ script: string; args: string[]; resolve: (r: TaskResult) => void }> = [];
  private activeTasks = 0;
  private idleTimer: ReturnType<typeof setInterval> | null = null;
  private totalTasksCompleted = 0;
  private totalErrors = 0;

  constructor(config: Partial<PoolConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  getStats() {
    return {
      totalWorkers: this.workers.length,
      busyWorkers: this.workers.filter(w => w.busy).length,
      idleWorkers: this.workers.filter(w => !w.busy).length,
      queuedTasks: this.taskQueue.length,
      activeTasks: this.activeTasks,
      totalTasksCompleted: this.totalTasksCompleted,
      totalErrors: this.totalErrors,
      minWorkers: this.config.minWorkers,
      maxWorkers: this.config.maxWorkers,
      workers: this.workers.map(w => ({
        id: w.id,
        busy: w.busy,
        alive: w.alive,
        taskCount: w.taskCount,
        lastStartedAt: w.lastStartedAt,
        lastFinishedAt: w.lastFinishedAt,
        lastError: w.lastError,
      })),
    };
  }

  async start() {
    for (let i = 0; i < this.config.minWorkers; i++) {
      this.spawnWorker();
    }
    this.idleTimer = setInterval(() => this.reapIdle(), 30_000);
    this.idleTimer.unref();
  }

  async stop() {
    if (this.idleTimer) clearInterval(this.idleTimer);
    await Promise.all(this.workers.map(w => this.killWorker(w)));
    this.workers = [];
    this.taskQueue = [];
  }

  execute(script: string, args: string[] = []): Promise<TaskResult> {
    return new Promise(resolve => {
      this.taskQueue.push({ script, args, resolve });
      this.dispatchNext();
    });
  }

  private dispatchNext() {
    while (this.taskQueue.length > 0 && this.activeTasks < this.config.maxWorkers) {
      const available = this.workers.find(w => !w.busy);
      if (available) {
        this.runOnWorker(available);
      } else if (this.workers.length < this.config.maxWorkers) {
        this.spawnWorker();
        const fresh = this.workers[this.workers.length - 1];
        this.runOnWorker(fresh);
      } else {
        break;
      }
    }
  }

  private runOnWorker(worker: PoolWorker) {
    const task = this.taskQueue.shift();
    if (!task) return;

    worker.busy = true;
    worker.alive = true;
    worker.lastStartedAt = Date.now();
    this.activeTasks++;

    const { script, args, resolve } = task;
    const workerDir = this.config.workerDir;
    const fullArgs = [script, ...args];

    const startTime = Date.now();
    const child = spawn(this.config.pythonCmd, fullArgs, {
      cwd: workerDir || undefined,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timeoutMs = this.config.taskTimeoutMs;
    const timeoutHandle = setTimeout(() => {
      timedOut = true;
      try { child.kill(); } catch { }
      console.error('[worker_pool] worker_timeout:', { workerId: worker.id, timeoutMs, script });
      worker.lastError = 'worker_timeout';
      worker.lastFinishedAt = Date.now();
      worker.alive = false;
      this.totalErrors++;
      this.activeTasks--;
      worker.busy = false;
      resolve({ ok: false, stdout: '', stderr: 'Task timed out', code: null, durationMs: Date.now() - startTime });
      this.dispatchNext();
    }, timeoutMs);

    child.stdout?.on('data', (data: Buffer) => { stdout += data.toString(); });
    child.stderr?.on('data', (data: Buffer) => { stderr += data.toString(); });

    child.on('close', (code) => {
      clearTimeout(timeoutHandle);
      if (timedOut) return;
      const durationMs = Date.now() - startTime;
      worker.taskCount++;
      this.activeTasks--;
      this.totalTasksCompleted++;
      worker.lastFinishedAt = Date.now();
      worker.alive = false;

      if (code !== 0) this.totalErrors++;

      const result: TaskResult = {
        ok: code === 0,
        stdout,
        stderr,
        code,
        durationMs,
      };

      resolve(result);
      worker.busy = false;

      if (worker.taskCount >= this.config.maxTaskPerWorker) {
        this.killWorker(worker);
        this.spawnWorker();
      } else {
        this.dispatchNext();
      }
    });

    child.on('error', (err) => {
      clearTimeout(timeoutHandle);
      if (timedOut) return;
      this.totalErrors++;
      this.activeTasks--;
      worker.busy = false;
      worker.alive = false;
      worker.lastError = err.message;
      worker.lastFinishedAt = Date.now();
      resolve({ ok: false, stdout: '', stderr: err.message, code: -1, durationMs: Date.now() - startTime });
      this.dispatchNext();
    });

    child.stdin?.end();
  }

  private spawnWorker(): PoolWorker {
    const id = `w${this.workers.length + 1}-${Date.now()}`;
    const worker: PoolWorker = {
      process: spawn(process.argv[0], ['-e', 'process.stdin.resume()'], { stdio: 'ignore' }),
      busy: false,
      id,
      spawnedAt: Date.now(),
      taskCount: 0,
      alive: true,
      lastStartedAt: null,
      lastFinishedAt: null,
      lastError: null,
    };
    worker.process.unref();
    this.workers.push(worker);
    return worker;
  }

  private killWorker(worker: PoolWorker) {
    try { worker.process.kill(); } catch { }
    this.workers = this.workers.filter(w => w.id !== worker.id);
  }

  private reapIdle() {
    const now = Date.now();
    const idle = this.workers.filter(w => !w.busy);
    const targetIdleCount = Math.max(this.config.minWorkers, Math.ceil(this.workers.length / 2));

    let toReap = idle.length - targetIdleCount;
    if (toReap <= 0) return;

    for (const worker of idle.sort((a, b) => a.spawnedAt - b.spawnedAt)) {
      if (toReap <= 0) break;
      if (now - worker.spawnedAt > this.config.idleTimeoutMs) {
        this.killWorker(worker);
        toReap--;
      }
    }
  }
}

let poolInstance: PythonWorkerPool | null = null;

export function getWorkerPool(): PythonWorkerPool {
  if (!poolInstance) {
    poolInstance = new PythonWorkerPool({
      workerDir: process.env.PYTHON_WORKER_DIR || '',
      minWorkers: parseInt(process.env.WORKER_POOL_MIN || '2', 10),
      maxWorkers: parseInt(process.env.WORKER_POOL_MAX || '8', 10),
    });
  }
  return poolInstance;
}

export async function initWorkerPool() {
  const pool = getWorkerPool();
  await pool.start();
  return pool;
}

export async function shutdownWorkerPool() {
  if (poolInstance) {
    await poolInstance.stop();
    poolInstance = null;
  }
}

export type { PoolConfig, TaskResult, PythonWorkerPool };
export default { getWorkerPool, initWorkerPool, shutdownWorkerPool };
