import type { FastifyInstance } from 'fastify';
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

type RiskLevel = 'low' | 'medium' | 'high' | 'critical' | 'unknown';
type CheckStatus = 'pass' | 'warn' | 'fail' | 'unknown';

const HTTP_TIMEOUT_MS = 3500;
const COMMAND_TIMEOUT_MS = 5000;
const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 80;

const REPORT_ROOTS = [
  { root: 'E:\\_AIP_REPORTS', project: 'AIP' },
  { root: 'E:\\_AXIOM_REPORTS', project: 'OpenAxiom' },
  { root: 'E:\\_DISK_AUDIT_REPORTS', project: 'Disk Audit' },
  { root: 'E:\\Mahjong_V1_Project', project: 'Mahjong' },
];

const BACKUP_ROOTS = [
  { root: 'E:\\_AIP_BACKUPS', project: 'AIP' },
  { root: 'E:\\_AXIOM_BACKUPS', project: 'OpenAxiom' },
];

const TASK_TYPES: Record<string, { title: string; target: string; allowed: string[]; forbidden: string[] }> = {
  'aip-readonly-audit': {
    title: 'AIP 只读摸底',
    target: '检查 AIP 当前状态、路由、页面、报告、备份和风险边界',
    allowed: ['读取文件', '列目录', '调用只读 API', '生成报告'],
    forbidden: ['修改源码/配置', '安装依赖', '重启服务', '删除/移动文件'],
  },
  'aip-startup-forensic': {
    title: 'AIP 启动故障取证',
    target: '只读收集 AIP 启动失败证据和恢复建议',
    allowed: ['查看日志', '检查端口', '读取配置键名', '调用 health/status API'],
    forbidden: ['自动修复', '重启服务', '改 packageManager', '删除日志'],
  },
  'e-drive-readonly-audit': {
    title: 'E盘清理只读摸底',
    target: '只读盘点 E 盘空间、报告、备份和高风险目录',
    allowed: ['列目录', '统计大小', '生成清单', '标注风险'],
    forbidden: ['删除文件', '移动文件', '清空回收站', '处理受保护目录'],
  },
  'single-directory-safe-delete': {
    title: '单目录安全删除',
    target: '为单个明确目录生成删除前检查任务包',
    allowed: ['只读核验目标路径', '生成删除前报告', '列出二次确认项'],
    forbidden: ['直接删除', '模糊匹配删除', '递归处理未确认路径', '跨目录移动'],
  },
  'openaxiom-dataset-readonly-check': {
    title: 'OpenAxiom 数据集只读检查',
    target: '通过 readonly bridge 检查数据集结构和标签健康',
    allowed: ['调用 OpenAxiom readonly API', '读取 images/labels', '生成质检摘要'],
    forbidden: ['保存 label', '恢复 label', '批量保存', '修改 E:\\Axiom'],
  },
  'mahjong-dataset-quality': {
    title: 'Mahjong 数据集质检',
    target: '只读检查麻将数据集、labels、data.yaml、模型输出和报告',
    allowed: ['读取样本', '统计标签', '抽样质检', '生成报告'],
    forbidden: ['训练', '改 labels', '移动 images', '改 data.yaml'],
  },
  'yolo-evaluation': {
    title: 'YOLO 评估任务',
    target: '设计或执行经用户确认的 YOLO 评估取证',
    allowed: ['读取模型与数据集路径', '生成评估计划', '记录指标'],
    forbidden: ['训练', '覆盖权重', '自动修改数据集', '删除 runs'],
  },
  'github-release-check': {
    title: 'GitHub Release 检查',
    target: '只读检查发布记录、tag、asset 和报告一致性',
    allowed: ['读取 release 元数据', '核对报告', '生成差异清单'],
    forbidden: ['创建 release', '删除 tag', '上传 asset', '改远端仓库'],
  },
  'openclaw-status-check': {
    title: 'OpenClaw 状态检查',
    target: '只读检查 OpenClaw 监听、健康、版本和必要集成状态',
    allowed: ['检查端口', '调用 /health', '读取版本', '生成诊断摘要'],
    forbidden: ['openclaw doctor --fix', '重启 OpenClaw', '修改 .openclaw', '停止服务'],
  },
  'claude-proxy-status-check': {
    title: 'Claude Proxy 状态检查',
    target: '只读检查 Claude DeepSeek Proxy 监听、PID、脚本路径和 health',
    allowed: ['检查端口', '读取进程路径', '调用 /health', '生成安全摘要'],
    forbidden: ['停止 node.exe', '修改代理脚本', '读取或暴露 API Key', '显示 Authorization header'],
  },
};

const SAFETY_BOUNDARIES = [
  boundary('E:\\Mahjong_V1_Project\\dataset', 'dataset-root', 'critical', '真实训练数据集，永远默认只读'),
  boundary('images', 'dataset-images', 'critical', '所有 images 目录都禁止自动移动、删除或增强'),
  boundary('labels', 'dataset-labels', 'critical', '所有 labels 目录都禁止自动保存、恢复、批量保存或修复'),
  boundary('data.yaml', 'training-config', 'critical', '训练类别和路径配置，禁止自动改写'),
  boundary('models', 'model-artifacts', 'high', '模型权重和产物目录，禁止自动删除或覆盖'),
  boundary('E:\\AIP', 'aip-mainline', 'high', 'AIP 主程序目录，编码需明确任务授权'),
  boundary('E:\\Axiom', 'openaxiom-mainline', 'critical', 'OpenAxiom 主线，本模块只读展示'),
  boundary('E:\\Axiom_UI_Lab', 'openaxiom-ui-lab', 'critical', 'OpenAxiom UI Lab，本模块只读展示'),
  boundary('E:\\_AIP_TOOLS\\claude-deepseek-proxy', 'proxy-tool', 'high', '代理工具目录，禁止修改脚本或泄露密钥'),
  boundary('C:\\Users\\74002\\.openclaw', 'openclaw-runtime', 'high', 'OpenClaw 本地配置与运行态，禁止自动修复'),
  boundary('C:\\Users\\74002\\Desktop\\StartClaudeDeepSeekProxy.bat', 'startup-script', 'high', '代理启动脚本，禁止自动重写或执行'),
  boundary('E:\\_AIP_ASSETS', 'assets', 'high', 'AIP 资产目录，禁止自动清理'),
];

function boundary(targetPath: string, type: string, riskLevel: RiskLevel, note: string) {
  return {
    path: targetPath,
    type,
    riskLevel,
    allowedActions: ['list', 'read', 'copy path', 'readonly inspect'],
    forbiddenActions: ['delete', 'move', 'restart', 'stop process', 'train', 'save labels', 'batch save labels', 'auto fix'],
    requiresUserConfirmation: ['any write operation'],
    autoFixAllowed: false,
    readonly: true,
    note,
  };
}

function clampLimit(raw: unknown) {
  const value = Number(raw || DEFAULT_LIMIT);
  if (!Number.isFinite(value)) return DEFAULT_LIMIT;
  return Math.max(1, Math.min(MAX_LIMIT, Math.floor(value)));
}

function nowIso() {
  return new Date().toISOString();
}

function classifyStatus(ok: boolean | null): 'online' | 'offline' | 'unknown' {
  if (ok === true) return 'online';
  if (ok === false) return 'offline';
  return 'unknown';
}

async function httpJson(url: string, timeoutMs = HTTP_TIMEOUT_MS): Promise<{ ok: boolean; statusCode?: number; data?: any; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    const text = await response.text();
    let data: any = text;
    try { data = JSON.parse(text); } catch { /* non-json is still useful for web probes */ }
    return { ok: response.ok, statusCode: response.status, data };
  } catch (err: any) {
    return { ok: false, error: err?.name === 'AbortError' ? 'timeout' : String(err?.message || err) };
  } finally {
    clearTimeout(timer);
  }
}

async function runVersion(command: string, args: string[] = ['--version']) {
  const candidates: Array<{ command: string; args: string[] }> = [];
  if (process.platform === 'win32' && command === 'npm') {
    candidates.push({ command: 'npm.cmd', args });
    if (process.env.npm_execpath) {
      candidates.push({ command: process.execPath, args: [process.env.npm_execpath, ...args] });
    }
    const nodeDirNpm = path.join(path.dirname(process.execPath), 'npm.cmd');
    candidates.push({ command: nodeDirNpm, args });
    try {
      const { stdout } = await execFileAsync('where', ['npm'], {
        timeout: COMMAND_TIMEOUT_MS,
        windowsHide: true,
        maxBuffer: 128 * 1024,
      });
      for (const line of String(stdout || '').split(/\r?\n/).map(item => item.trim()).filter(Boolean)) {
        candidates.push({ command: line, args });
      }
    } catch {
      // PATH lookup is a readonly best-effort probe.
    }
  } else {
    const baseCandidates = process.platform === 'win32' && !/\.(cmd|exe|bat)$/i.test(command)
      ? [`${command}.cmd`, command]
      : [command];
    for (const candidate of baseCandidates) candidates.push({ command: candidate, args });
  }
  for (const candidate of candidates) {
    try {
      const { stdout } = await execFileAsync(candidate.command, candidate.args, {
        timeout: COMMAND_TIMEOUT_MS,
        windowsHide: true,
        maxBuffer: 128 * 1024,
      });
      const version = String(stdout || '').trim().split(/\r?\n/)[0];
      if (version) return version;
    } catch {
      // Try the next executable candidate; probes remain readonly.
    }
  }
  return 'unknown';
}

function rankRisk(riskLevel: RiskLevel) {
  switch (riskLevel) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'unknown': return 1;
    case 'low':
    default: return 0;
  }
}

function summarizeFullCheck(checks: ReturnType<typeof buildChecks>, warnings: string[]) {
  const failedChecks = checks.filter(item => item.status === 'fail');
  const highestFailedRisk = failedChecks.reduce((highest, item) => Math.max(highest, rankRisk(item.riskLevel)), 0);
  const hasHighFailure = highestFailedRisk >= rankRisk('high');
  const hasMediumFailure = highestFailedRisk >= rankRisk('medium');
  const hasWarn = checks.some(item => item.status === 'warn') || warnings.length > 0;
  const hasLowFailure = failedChecks.length > 0;

  return {
    overallStatus: hasHighFailure ? 'degraded' : hasMediumFailure || hasWarn || hasLowFailure ? 'warning' : 'healthy',
    riskLevel: hasHighFailure ? 'high' : hasMediumFailure || hasWarn ? 'medium' : hasLowFailure ? 'low' : 'low',
  };
}

async function powershellJson(script: string): Promise<any[]> {
  try {
    const { stdout } = await execFileAsync('powershell.exe', [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      script,
    ], {
      timeout: COMMAND_TIMEOUT_MS,
      windowsHide: true,
      maxBuffer: 512 * 1024,
    });
    const trimmed = stdout.trim();
    if (!trimmed) return [];
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

async function getPortInfo(port: number) {
  const rows = await powershellJson(
    `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | ` +
    `Select-Object LocalAddress,LocalPort,OwningProcess,State | ConvertTo-Json -Compress`
  );
  const first = rows[0];
  return first ? {
    listening: true,
    port,
    pid: Number(first.OwningProcess) || null,
    localAddress: String(first.LocalAddress || ''),
    state: String(first.State || 'Listen'),
  } : {
    listening: false,
    port,
    pid: null,
    localAddress: '',
    state: 'Closed',
  };
}

async function getProcessCommandLine(pid: number | null) {
  if (!pid) return null;
  const rows = await powershellJson(
    `Get-CimInstance Win32_Process -Filter "ProcessId=${pid}" | ` +
    `Select-Object ProcessId,Name,ExecutablePath,CommandLine | ConvertTo-Json -Compress`
  );
  return rows[0] || null;
}

function safeStat(targetPath: string) {
  try {
    return fs.statSync(targetPath);
  } catch {
    return null;
  }
}

function inferReportType(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.includes('seal') || lower.includes('封板')) return 'seal';
  if (lower.includes('cleanup') || lower.includes('清理')) return 'cleanup';
  if (lower.includes('train') || lower.includes('eval') || lower.includes('yolo')) return 'training-evaluation';
  if (lower.includes('openclaw')) return 'openclaw';
  if (lower.includes('proxy') || lower.includes('claude')) return 'claude-proxy';
  if (lower.includes('github') || lower.includes('release')) return 'github-release';
  if (lower.includes('disk')) return 'disk-audit';
  if (lower.includes('mahjong')) return 'mahjong';
  return 'report';
}

function inferBackupType(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('source_only')) return 'source-only';
  if (lower.includes('rc')) return 'rc-backup';
  if (lower.includes('seal') || lower.includes('stable') || lower.includes('hotfix')) return 'seal-backup';
  if (lower.includes('label')) return 'label-backup';
  if (lower.includes('quarantine')) return 'quarantine';
  return 'backup';
}

function listFilesLimited(root: string, maxEntries: number, recursive = false) {
  const results: string[] = [];
  const stack = [root];
  while (stack.length && results.length < maxEntries) {
    const current = stack.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (results.length >= maxEntries) break;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (recursive) stack.push(full);
        continue;
      }
      results.push(full);
    }
  }
  return results;
}

function getDirectorySizeLimited(root: string, maxFiles = 300) {
  let sizeBytes = 0;
  let scannedFiles = 0;
  const files = listFilesLimited(root, maxFiles, true);
  for (const file of files) {
    const stat = safeStat(file);
    if (stat?.isFile()) {
      sizeBytes += stat.size;
      scannedFiles += 1;
    }
  }
  return { sizeBytes, scannedFiles, sizeTruncated: scannedFiles >= maxFiles };
}

function collectReports(limit: number) {
  const items: any[] = [];
  for (const source of REPORT_ROOTS) {
    const rootStat = safeStat(source.root);
    if (!rootStat?.isDirectory()) continue;
    const recursive = source.root.includes('Mahjong_V1_Project');
    const files = listFilesLimited(source.root, recursive ? 250 : 120, recursive);
    for (const file of files) {
      const stat = safeStat(file);
      if (!stat?.isFile()) continue;
      const ext = path.extname(file).toLowerCase();
      const name = path.basename(file);
      if (!['.md', '.txt', '.json', '.csv', '.log'].includes(ext)) continue;
      if (source.root.includes('Mahjong_V1_Project') && !/(report|summary|audit|eval|result|报告)/i.test(name)) continue;
      const type = inferReportType(name);
      items.push({
        fileName: name,
        project: source.project,
        type,
        mtime: stat.mtime.toISOString(),
        sizeBytes: stat.size,
        path: file,
        summary: name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '),
        riskLevel: type === 'cleanup' ? 'medium' : 'low',
        isSealReport: type === 'seal',
        isCleanupReport: type === 'cleanup',
        isTrainingReport: type === 'training-evaluation',
        readonly: true,
      });
    }
  }
  return items.sort((a, b) => Date.parse(b.mtime) - Date.parse(a.mtime)).slice(0, limit);
}

function collectBackups(limit: number) {
  const items: any[] = [];
  for (const source of BACKUP_ROOTS) {
    const rootStat = safeStat(source.root);
    if (!rootStat?.isDirectory()) continue;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(source.root, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(source.root, entry.name);
      const stat = safeStat(full);
      if (!stat) continue;
      const isDirectory = entry.isDirectory();
      const size = isDirectory ? getDirectorySizeLimited(full, 250) : { sizeBytes: stat.size, scannedFiles: 1, sizeTruncated: false };
      items.push({
        name: entry.name,
        project: source.project,
        type: inferBackupType(entry.name),
        mtime: stat.mtime.toISOString(),
        path: full,
        isDirectory,
        sizeBytes: size.sizeBytes,
        sizeTruncated: size.sizeTruncated,
        scannedFiles: size.scannedFiles,
        deleteAllowed: false,
        readonly: true,
      });
    }
  }
  return items.sort((a, b) => Date.parse(b.mtime) - Date.parse(a.mtime)).slice(0, limit);
}

async function collectStatus() {
  const checkedAt = nowIso();
  const [aipApiPort, aipWebPort, openClawPort, proxyPort] = await Promise.all([
    getPortInfo(8787),
    getPortInfo(5173),
    getPortInfo(18789),
    getPortInfo(15721),
  ]);

  const [aipHealth, webHealth, openAxiom, openClawHealth, proxyHealth, nodeVersion, npmVersion, pnpmVersion, pythonVersion] = await Promise.all([
    httpJson('http://127.0.0.1:8787/api/health'),
    httpJson('http://127.0.0.1:5173'),
    httpJson('http://127.0.0.1:8787/api/openaxiom/status'),
    httpJson('http://127.0.0.1:18789/health'),
    httpJson('http://127.0.0.1:15721/health'),
    runVersion('node', ['-v']),
    runVersion('npm', ['-v']),
    runVersion('pnpm', ['-v']),
    runVersion('python', ['--version']),
  ]);

  const proxyProcess = await getProcessCommandLine(proxyPort.pid);
  const eFreeBytes = os.freemem();
  let eDriveFreeBytes: number | null = null;
  const driveRows = await powershellJson(`Get-PSDrive -Name E | Select-Object Name,Used,Free | ConvertTo-Json -Compress`);
  if (driveRows[0]?.Free !== undefined) eDriveFreeBytes = Number(driveRows[0].Free);

  const items = [
    {
      id: 'aip-api',
      name: 'AIP Local API',
      type: 'service',
      status: classifyStatus(aipApiPort.listening && aipHealth.ok),
      port: 8787,
      pid: aipApiPort.pid,
      path: 'E:\\AIP\\apps\\local-api',
      version: aipHealth.data?.version || 'unknown',
      detail: aipHealth.statusCode ? `HTTP ${aipHealth.statusCode}` : aipHealth.error || '',
      riskLevel: aipHealth.ok ? 'low' : 'high',
      suggestedAction: aipHealth.ok ? '保持只读观察' : '仅做日志取证，不自动重启',
      autoFixAllowed: false,
      readonly: true,
    },
    {
      id: 'aip-web',
      name: 'AIP Web',
      type: 'web',
      status: classifyStatus(aipWebPort.listening && webHealth.ok),
      port: 5173,
      pid: aipWebPort.pid,
      path: 'E:\\AIP\\apps\\web-ui',
      version: aipHealth.data?.version || '7.3.0',
      detail: webHealth.statusCode ? `HTTP ${webHealth.statusCode}` : webHealth.error || '',
      riskLevel: webHealth.ok ? 'low' : 'high',
      suggestedAction: webHealth.ok ? '保持只读观察' : '仅做前端日志取证',
      autoFixAllowed: false,
      readonly: true,
    },
    {
      id: 'openaxiom',
      name: 'OpenAxiom',
      type: 'readonly-bridge',
      status: classifyStatus(openAxiom.ok && openAxiom.data?.mode === 'readonly'),
      port: 8787,
      pid: aipApiPort.pid,
      path: openAxiom.data?.home || 'E:\\Axiom\\tools\\openaxiom',
      version: openAxiom.data?.apiVersion || 'readonly',
      detail: openAxiom.data?.issues?.length ? openAxiom.data.issues.join('; ') : 'mode readonly',
      riskLevel: openAxiom.ok ? 'low' : 'medium',
      suggestedAction: '仅展示概要，不加入保存/恢复/批量保存',
      autoFixAllowed: false,
      readonly: true,
    },
    {
      id: 'openclaw',
      name: 'OpenClaw',
      type: 'assistant-runtime',
      status: classifyStatus(openClawPort.listening && openClawHealth.ok),
      port: 18789,
      pid: openClawPort.pid,
      path: 'C:\\Users\\74002\\.openclaw',
      version: 'unknown',
      detail: openClawHealth.statusCode ? `HTTP ${openClawHealth.statusCode}` : openClawHealth.error || '',
      riskLevel: openClawHealth.ok ? 'low' : 'high',
      suggestedAction: openClawHealth.ok ? '保持只读观察' : '只做状态取证，禁止 doctor --fix',
      autoFixAllowed: false,
      readonly: true,
    },
    {
      id: 'claude-proxy',
      name: 'Claude DeepSeek Proxy',
      type: 'proxy',
      status: classifyStatus(proxyPort.listening && proxyHealth.ok),
      port: 15721,
      pid: proxyPort.pid,
      path: String(proxyProcess?.CommandLine || '').includes('cc-switch-proxy.js')
        ? 'E:\\_AIP_TOOLS\\claude-deepseek-proxy\\cc-switch-proxy.js'
        : 'unknown',
      version: 'unknown',
      detail: proxyHealth.statusCode ? `HTTP ${proxyHealth.statusCode}` : proxyHealth.error || '',
      riskLevel: proxyHealth.ok ? 'low' : 'high',
      suggestedAction: '只展示 PID/路径/health，禁止展示密钥或 header',
      autoFixAllowed: false,
      readonly: true,
    },
    {
      id: 'node',
      name: 'Node.js',
      type: 'tool',
      status: classifyStatus(nodeVersion !== 'unknown'),
      port: null,
      pid: null,
      path: 'PATH',
      version: nodeVersion,
      detail: 'readonly version probe',
      riskLevel: 'low',
      suggestedAction: '保持当前版本',
      autoFixAllowed: false,
      readonly: true,
    },
    {
      id: 'npm',
      name: 'npm',
      type: 'tool',
      status: classifyStatus(npmVersion !== 'unknown'),
      port: null,
      pid: null,
      path: 'PATH',
      version: npmVersion,
      detail: 'readonly version probe',
      riskLevel: 'low',
      suggestedAction: '不修改 packageManager',
      autoFixAllowed: false,
      readonly: true,
    },
    {
      id: 'pnpm',
      name: 'pnpm',
      type: 'tool',
      status: classifyStatus(pnpmVersion !== 'unknown'),
      port: null,
      pid: null,
      path: 'PATH',
      version: pnpmVersion,
      detail: 'readonly version probe',
      riskLevel: 'low',
      suggestedAction: '不修改 packageManager',
      autoFixAllowed: false,
      readonly: true,
    },
    {
      id: 'python',
      name: 'Python',
      type: 'tool',
      status: classifyStatus(pythonVersion !== 'unknown'),
      port: null,
      pid: null,
      path: 'PATH',
      version: pythonVersion.replace(/^Python\s+/i, ''),
      detail: 'readonly version probe',
      riskLevel: 'low',
      suggestedAction: '保持当前解释器',
      autoFixAllowed: false,
      readonly: true,
    },
    {
      id: 'e-drive',
      name: 'E Drive',
      type: 'storage',
      status: classifyStatus(eDriveFreeBytes !== null),
      port: null,
      pid: null,
      path: 'E:\\',
      version: null,
      detail: eDriveFreeBytes === null ? 'unknown' : `${(eDriveFreeBytes / 1024 / 1024 / 1024).toFixed(2)} GB free`,
      riskLevel: eDriveFreeBytes !== null && eDriveFreeBytes < 30 * 1024 * 1024 * 1024 ? 'medium' : 'low',
      suggestedAction: '需要清理时先做只读摸底',
      autoFixAllowed: false,
      readonly: true,
      freeBytes: eDriveFreeBytes,
      systemFreeBytes: eFreeBytes,
    },
  ];

  const warnings = items
    .filter(item => item.status !== 'online' || item.riskLevel === 'medium' || item.riskLevel === 'high')
    .map(item => `${item.name}: ${item.detail || item.status}`);

  return { ok: true, checkedAt, lastCheckedAt: checkedAt, items, warnings, readonly: true, autoFixAllowed: false };
}

function buildChecks(statusPayload: Awaited<ReturnType<typeof collectStatus>>) {
  return statusPayload.items.map((item: any) => {
    let status: CheckStatus = 'unknown';
    if (item.status === 'online') status = item.riskLevel === 'medium' ? 'warn' : 'pass';
    if (item.status === 'offline') status = 'fail';
    if (item.type === 'tool' && item.riskLevel === 'low' && item.status === 'offline') status = 'warn';
    return {
      id: item.id,
      label: item.name,
      status,
      detail: item.detail || item.version || '',
      riskLevel: item.riskLevel,
      readonly: true,
      autoFixAllowed: false,
    };
  });
}

function buildTaskPackage(taskType: string, targetPath = '', outputReportPath = '') {
  const template = TASK_TYPES[taskType];
  if (!template) return null;
  const safetyLines = SAFETY_BOUNDARIES.map(item => `- ${item.path}: ${item.riskLevel}, autoFixAllowed=false`).join('\n');
  return [
    `【任务名称】`,
    template.title,
    ``,
    `【目标】`,
    template.target,
    ``,
    `【当前背景】`,
    `目标路径：${targetPath || '按任务上下文确认'}`,
    `输出报告：${outputReportPath || '由执行者在允许目录内生成'}`,
    ``,
    `【允许动作】`,
    ...template.allowed.map(item => `- ${item}`),
    ``,
    `【禁止动作】`,
    ...template.forbidden.map(item => `- ${item}`),
    `- 泄露 API Key/token/Authorization header`,
    ``,
    `【安全边界】`,
    safetyLines,
    ``,
    `【验收标准】`,
    `- 明确说明是否完成`,
    `- 汇报改了哪些文件；如无修改，写“无”`,
    `- 汇报每个文件改了什么；如无修改，写“无”`,
    `- 汇报是否触及主线/核心逻辑`,
    `- 汇报是否新增/删除文件`,
    `- 汇报验证结果和剩余问题`,
    ``,
    `【最终回复格式】`,
    `- 是否完成：`,
    `- 改了哪些文件：`,
    `- 每个文件改了什么：`,
    `- 是否触及主线/核心逻辑：`,
    `- 是否新增/删除文件：`,
    `- 验证结果：`,
  ].join('\n');
}

export function registerAssistantCenterRoutes(app: FastifyInstance) {
  app.get('/api/assistant-center/status', async (_request, reply) => {
    try {
      return await collectStatus();
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: 'ASSISTANT_STATUS_FAILED', message: String(err?.message || err), readonly: true });
    }
  });

  app.get('/api/assistant-center/tools', async (_request, reply) => {
    try {
      const statusPayload = await collectStatus();
      const tools = statusPayload.items.filter((item: any) => item.type === 'tool');
      return { ok: true, items: tools, readonly: true, autoFixAllowed: false };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: 'TOOLS_STATUS_FAILED', message: String(err?.message || err), readonly: true });
    }
  });

  app.get('/api/assistant-center/version', async (_request, _reply) => {
    return {
      ok: true,
      version: '7.3.0',
      module: 'assistant-center',
      readonly: true,
      autoFixAllowed: false,
    };
  });

  app.post('/api/assistant-center/full-check', async (_request, reply) => {
    try {
      const statusPayload = await collectStatus();
      const checks = buildChecks(statusPayload);
      const warnings = [
        ...statusPayload.warnings,
        ...checks.filter(item => item.riskLevel === 'medium').map(item => `${item.label}: ${item.detail}`),
      ];
      const summary = summarizeFullCheck(checks, warnings);
      return {
        ok: true,
        overallStatus: summary.overallStatus,
        riskLevel: summary.riskLevel,
        checks,
        warnings: Array.from(new Set(warnings)),
        suggestedNextActions: [
          '保持本轮只读边界',
          '需要修复时先生成任务包并由用户确认',
          '不要加入删除、重启、停止、训练、保存 label 或自动修复能力',
        ],
        readonly: true,
        autoFixAllowed: false,
        requiresHumanApproval: true,
        fileWrites: [],
        checkedAt: nowIso(),
      };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: 'FULL_CHECK_FAILED', message: String(err?.message || err), readonly: true, autoFixAllowed: false });
    }
  });

  app.get('/api/assistant-center/reports', async (request: any, reply) => {
    try {
      const limit = clampLimit(request.query?.limit);
      return { ok: true, items: collectReports(limit), limit, readonly: true, deleteAllowed: false };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: 'REPORT_SCAN_FAILED', message: String(err?.message || err), readonly: true });
    }
  });

  app.get('/api/assistant-center/backups', async (request: any, reply) => {
    try {
      const limit = clampLimit(request.query?.limit);
      return { ok: true, items: collectBackups(limit), limit, readonly: true, deleteAllowed: false };
    } catch (err: any) {
      return reply.code(500).send({ ok: false, error: 'BACKUP_SCAN_FAILED', message: String(err?.message || err), readonly: true });
    }
  });

  app.get('/api/assistant-center/safety-boundaries', async (_request, _reply) => {
    return { ok: true, items: SAFETY_BOUNDARIES, readonly: true, autoFixAllowed: false };
  });

  app.get('/api/assistant-center/safety-boundary', async (_request, _reply) => {
    return { ok: true, items: SAFETY_BOUNDARIES, readonly: true, autoFixAllowed: false };
  });

  app.post('/api/assistant-center/task-package', async (request: any, reply) => {
    const body = request.body || {};
    const taskType = String(body.taskType || '');
    const text = buildTaskPackage(taskType, String(body.targetPath || ''), String(body.outputReportPath || ''));
    if (!text) {
      return reply.code(400).send({
        ok: false,
        error: 'UNKNOWN_TASK_TYPE',
        message: `Unsupported taskType: ${taskType}`,
        supportedTaskTypes: Object.keys(TASK_TYPES),
        readonly: true,
        autoDispatchAllowed: false,
      });
    }
    return {
      ok: true,
      taskType,
      text,
      warnings: ['该任务包只生成文本，不会自动执行', '所有写操作都需要用户另行确认'],
      autoDispatchAllowed: false,
      readonly: true,
    };
  });

  app.post('/api/assistant-center/audit/save', async (_request, reply) => {
    return reply.code(501).send({
      ok: false,
      error: 'AUDIT_SAVE_DISABLED',
      message: 'Assistant Center final release does not save audit logs automatically.',
      readonly: true,
      autoFixAllowed: false,
      requiresHumanApproval: true,
    });
  });
}
