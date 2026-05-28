import type { FastifyInstance } from 'fastify';
import os from 'node:os';
import { execSync } from 'node:child_process';

function nowIso() { return new Date().toISOString(); }

interface DiskInfo {
  drive: string;
  total: number;
  used: number;
  free: number;
  usedPercent: number;
}

interface GpuInfo {
  model: string;
  vramTotalMB: number;
  vramUsedMB: number;
  vramFreeMB: number;
  temperature: number;
  utilizationGPU: number;
  index: number;
  uuid: string;
}

function getDiskInfo(): DiskInfo[] {
  const disks: DiskInfo[] = [];
  try {
    if (process.platform === 'win32') {
      const result = execSync('wmic logicaldisk get size,freespace,caption', { encoding: 'utf8', timeout: 5000 });
      const lines = result.split('\n').filter(Boolean);
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts[0] && parts[1] && parts[2] && parts[0].includes(':')) {
          const free = parseInt(parts[1], 10);
          const size = parseInt(parts[2], 10);
          if (!isNaN(free) && !isNaN(size) && size > 0) {
            const total = size;
            const used = total - free;
            disks.push({
              drive: parts[0],
              total,
              used,
              free,
              usedPercent: Math.round((used / total) * 100),
            });
          }
        }
      }
    }
  } catch {}
  return disks;
}

function getGpuInfo(): GpuInfo[] {
  const gpus: GpuInfo[] = [];
  try {
    const cmd = process.platform === 'win32'
      ? 'nvidia-smi --query-gpu=name,memory.total,memory.used,memory.free,temperature.gpu,utilization.gpu,index,uuid --format=csv,noheader,nounits'
      : 'nvidia-smi --query-gpu=name,memory.total,memory.used,memory.free,temperature.gpu,utilization.gpu,index,uuid --format=csv,noheader,nounits';
    const result = execSync(cmd, { encoding: 'utf8', timeout: 5000 });
    const lines = result.trim().split('\n').filter(Boolean);
    for (const line of lines) {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length >= 8) {
        gpus.push({
          model: parts[0],
          vramTotalMB: parseFloat(parts[1]) || 0,
          vramUsedMB: parseFloat(parts[2]) || 0,
          vramFreeMB: parseFloat(parts[3]) || 0,
          temperature: parseFloat(parts[4]) || 0,
          utilizationGPU: parseFloat(parts[5]) || 0,
          index: parseInt(parts[6], 10) || 0,
          uuid: parts[7] || '',
        });
      }
    }
  } catch {}
  return gpus;
}

export function registerSystemMonitorRoutes(app: FastifyInstance) {
  app.get('/api/system/status', async (_request, reply) => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const cpus = os.cpus();
    const cpuModel = cpus[0]?.model || 'Unknown';
    const cpuCores = cpus.length;

    const loadAvg = os.loadavg();

    const diskInfo = getDiskInfo();
    const gpuInfo = getGpuInfo();

    const netInterfaces = os.networkInterfaces();
    const hostname = os.hostname();

    return {
      ok: true,
      timestamp: nowIso(),
      hostname,
      platform: os.platform(),
      arch: os.arch(),
      uptime: os.uptime(),
      cpu: {
        model: cpuModel,
        cores: cpuCores,
        usage_percent: loadAvg[0] ? Math.min(100, Math.round((loadAvg[0] / cpuCores) * 100)) : 0,
        load: loadAvg,
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        used_percent: Math.round((usedMem / totalMem) * 100),
        total_formatted: formatBytes(totalMem),
        used_formatted: formatBytes(usedMem),
        free_formatted: formatBytes(freeMem),
      },
      disk: diskInfo.map(d => ({
        ...d,
        total_formatted: formatBytes(d.total),
        used_formatted: formatBytes(d.used),
        free_formatted: formatBytes(d.free),
      })),
      gpu: gpuInfo,
      gpu_available: gpuInfo.length > 0,
      network: Object.entries(netInterfaces).map(([name, ifaces]) => ({
        name,
        interfaces: (ifaces || []).map(i => ({
          address: i.address,
          family: i.family,
          mac: i.mac,
          internal: i.internal,
        })),
      })),
    };
  });
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}
