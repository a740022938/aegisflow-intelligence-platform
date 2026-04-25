# 内存队列 → BullMQ/Redis 升级方案

## 动机

当前内存队列 (`apps/local-api/src/queue/index.ts`) 的限制：
- 进程重启后队列丢失
- 无法跨进程/跨机器共享
- 无持久化，宕机导致任务丢失

## 迁移步骤

### 1. 安装依赖

```bash
pnpm add bullmq ioredis
```

### 2. 替换队列实现

创建 `apps/local-api/src/queue/bullmq-adapter.ts`:

```typescript
import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

export const taskQueue = new Queue('aip-tasks', { connection });
export const taskEvents = new QueueEvents('aip-tasks', { connection });

// Worker 处理任务
new Worker('aip-tasks', async (job) => {
  const handler = getHandler(job.data.type);
  return await handler(job.data);
}, { connection });
```

### 3. 替换 getTaskQueue()

```typescript
// 之前:
export function getTaskQueue() { return queueInstance; }

// 之后:
export function getTaskQueue() { return taskQueue; }
```

### 4. 环境变量

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS=false
```

## 兼容层

当前内存队列的 API (enqueue/cancel/getStats) 保持兼容。
BullMQ 适配器实现同一接口即可无痛切换。
