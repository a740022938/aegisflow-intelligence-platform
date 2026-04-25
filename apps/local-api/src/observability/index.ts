import type { FastifyInstance } from 'fastify';
import fs from 'node:fs';
import path from 'node:path';

interface MetricEntry {
  value: number;
  labels: Record<string, string>;
}

class MetricsCollector {
  private counters = new Map<string, MetricEntry[]>();
  private gauges = new Map<string, number>();
  private histograms = new Map<string, number[]>();
  private startTime = Date.now();

  counter(name: string, labels: Record<string, string> = {}) {
    const key = name;
    if (!this.counters.has(key)) this.counters.set(key, []);
    const entries = this.counters.get(key)!;
    const existing = entries.find(e =>
      Object.entries(labels).every(([k, v]) => e.labels[k] === v)
    );
    if (existing) existing.value++;
    else entries.push({ value: 1, labels });
  }

  gauge(name: string, value: number) {
    this.gauges.set(name, value);
  }

  observe(name: string, value: number, labels: Record<string, string> = {}) {
    const key = name;
    if (!this.histograms.has(key)) this.histograms.set(key, []);
    this.histograms.get(key)!.push(value);
  }

  snapshot() {
    const lines: string[] = [];
    lines.push(`# HELP aip_uptime_seconds Application uptime`);
    lines.push(`# TYPE aip_uptime_seconds gauge`);
    lines.push(`aip_uptime_seconds ${(Date.now() - this.startTime) / 1000}`);

    for (const [name, entries] of this.counters) {
      lines.push(`# HELP ${name} counter`);
      lines.push(`# TYPE ${name} counter`);
      for (const e of entries) {
        const labels = Object.entries(e.labels).map(([k, v]) => `${k}="${v}"`).join(',');
        lines.push(`${name}${labels ? `{${labels}}` : ''} ${e.value}`);
      }
    }

    for (const [name, value] of this.gauges) {
      lines.push(`# HELP ${name} gauge`);
      lines.push(`# TYPE ${name} gauge`);
      lines.push(`${name} ${value}`);
    }

    for (const [name, values] of this.histograms) {
      if (values.length === 0) continue;
      const sum = values.reduce((a, b) => a + b, 0);
      const sorted = [...values].sort((a, b) => a - b);
      lines.push(`# HELP ${name} histogram`);
      lines.push(`# TYPE ${name} histogram`);
      lines.push(`${name}_count ${values.length}`);
      lines.push(`${name}_sum ${sum}`);
      for (const le of [0.01, 0.05, 0.1, 0.5, 1, 5, 10]) {
        const count = sorted.filter(v => v <= le).length;
        lines.push(`${name}_bucket{le="${le}"} ${count}`);
      }
      const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
      const p90 = sorted[Math.floor(sorted.length * 0.9)] || 0;
      const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
      lines.push(`${name}_p50 ${p50}`);
      lines.push(`${name}_p90 ${p90}`);
      lines.push(`${name}_p99 ${p99}`);
    }

    return lines.join('\n');
  }

  middleware(app: FastifyInstance) {
    app.addHook('onRequest', (request, _reply, done) => {
      (request as any)._metricStart = Date.now();
      done();
    });

    app.addHook('onResponse', (request, reply, done) => {
      const start = (request as any)._metricStart as number | undefined;
      if (start) {
        const duration = (Date.now() - start) / 1000;
        const route = request.routeOptions?.url || request.url;
        const method = request.method;
        const status = Math.floor(reply.statusCode / 100) * 100;
        this.observe('aip_http_request_duration_seconds', duration, {
          method, route, status: String(status),
        });
        this.counter('aip_http_requests_total', {
          method, route, status: String(status),
        });
      }
      done();
    });
  }
}

export const metrics = new MetricsCollector();

export function formatMetrics(): string {
  try {
    const dbPath = path.resolve(__dirname, '../../../../packages/db');
    const dbSize = fs.existsSync(path.join(dbPath, 'agi_factory.db'))
      ? fs.statSync(path.join(dbPath, 'agi_factory.db')).size
      : 0;
    metrics.gauge('aip_db_size_bytes', dbSize);

    const logDir = path.resolve(__dirname, '../../../../logs');
    let logSize = 0;
    if (fs.existsSync(logDir)) {
      const files = fs.readdirSync(logDir).map(f => path.join(logDir, f));
      for (const f of files) {
        try { logSize += fs.statSync(f).size; } catch { }
      }
    }
    metrics.gauge('aip_log_size_bytes', logSize);
  } catch { }

  const mem = process.memoryUsage();
  metrics.gauge('aip_memory_rss_bytes', mem.rss);
  metrics.gauge('aip_memory_heap_used_bytes', mem.heapUsed);
  metrics.gauge('aip_memory_heap_total_bytes', mem.heapTotal);

  return metrics.snapshot();
}

export function registerMetricsRoute(app: FastifyInstance) {
  app.get('/api/metrics', async (_request, reply) => {
    reply.header('Content-Type', 'text/plain; charset=utf-8');
    return formatMetrics();
  });

  app.get('/api/health/detailed', async (_request, reply) => {
    const mem = process.memoryUsage();
    return {
      ok: true,
      uptime: process.uptime(),
      memory: {
        rss: mem.rss,
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
      },
      metrics: {
        dbSizeBytes: metrics.snapshot().includes('aip_db_size_bytes'),
        totalRequests: metrics.snapshot().includes('aip_http_requests_total'),
      },
      timestamp: new Date().toISOString(),
    };
  });
}
