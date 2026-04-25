import type { FastifyInstance } from 'fastify';
import { getDatabase } from '../db/builtin-sqlite.js';
import { getWorkerPool } from '../worker-pool/index.js';
import { getTaskQueue } from '../queue/index.js';
import { getCoreStatus } from '../core-monitor.js';
import { APP_VERSION } from '../version.js';

interface WsClient {
  socket: any;
  subscribedTo: string[];
}

const clients = new Set<WsClient>();

function broadcast(type: string, channel: string, data: any) {
  const msg = JSON.stringify({ type, channel, data, timestamp: new Date().toISOString() });
  for (const c of clients) {
    if (c.subscribedTo.includes(channel) || c.subscribedTo.includes('*')) {
      try { c.socket.send(msg); } catch {}
    }
  }
}

export function emitWorkflowUpdate(jobId: string, data: any) {
  broadcast('workflow', jobId, data);
  broadcast('workflow', 'all', data);
}

export function emitSystemStatus() {
  const data = {
    uptime: process.uptime(),
    version: APP_VERSION,
    workerPool: getWorkerPool().getStats(),
    taskQueue: getTaskQueue().getStats(),
    core: getCoreStatus(),
  };
  broadcast('system', 'status', data);
}

export function registerWebSocketHub(app: FastifyInstance) {
  app.get('/api/ws/live', { websocket: true }, (socket: any, req: any) => {
    const client: WsClient = { socket, subscribedTo: ['*'] };
    clients.add(client);

    socket.on('message', (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.action === 'subscribe') {
          client.subscribedTo = Array.isArray(msg.channels) ? msg.channels : ['*'];
        }
      } catch {}
    });

    socket.on('close', () => {
      clients.delete(client);
    });

    // Send initial status
    socket.send(JSON.stringify({ type: 'connected', channel: 'system', data: { version: APP_VERSION, clients: clients.size } }));
  });

  // System status pusher (every 5 sec)
  setInterval(() => {
    if (clients.size > 0) emitSystemStatus();
  }, 5000);
}
