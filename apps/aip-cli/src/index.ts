#!/usr/bin/env node
import { initConfig } from './config.js';
import { runStart } from './commands/start.js';
import { runMl } from './commands/ml.js';
import { runStop } from './commands/stop.js';
import { runRestart } from './commands/restart.js';
import { runStatus } from './commands/status.js';
import { runHealth } from './commands/health.js';
import { runLogs } from './commands/logs.js';
import { runOpen } from './commands/open.js';
import { runVersion } from './commands/version.js';
import { runDoctor } from './commands/doctor.js';
import { runConfig } from './commands/config.js';
import { runGateway } from './commands/gateway.js';
import { runRepair } from './commands/repair.js';
import { runWhere } from './commands/where.js';
import { runSafeStatus } from './commands/safe-status.js';
import { runReceiptTemplate } from './commands/receipt.js';
import { runNext } from './commands/next.js';
import { runAgents } from './commands/agents.js';
import { runIntegrations } from './commands/integrations.js';
import { runProviders } from './commands/providers.js';
import { runApps } from './commands/apps.js';
import { runRuntime } from './commands/runtime.js';
import { runReleaseStatus } from './commands/release-status.js';
import { getCliVersion } from './version.js';
import { renderBanner, renderStatusLines } from './banner.js';

export interface AipConfig {
  home: string;
  apiPort: number;
  webPort: number;
  host: string;
  apiCommand: string;
  webCommand: string;
  webUrl: string;
  apiHealthUrl: string;
}

const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const GRAY = '\x1b[90m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';
const WHITE = '\x1b[97m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

let noColor = false;
let plainMode = false;
let asciiMode = false;
let noBanner = false;

function c(color: string, text: string): string {
  if (noColor || plainMode || asciiMode) return text;
  return `${color}${text}${RESET}`;
}

function faint(text: string): string {
  return c(GRAY, text);
}

function accent(text: string): string {
  return c(BOLD + CYAN, text);
}

function sectionDivider(label: string, subtitle?: string): string {
  const width = 76;
  const line = '─'.repeat(width);
  if (plainMode || asciiMode) {
    const asciiLine = '-'.repeat(width);
    return `${asciiLine}\n${label}${subtitle ? `  ${subtitle}` : ''}\n${asciiLine}`;
  }
  const title = `${c(BOLD + CYAN, label)}${subtitle ? `  ${c(GRAY, subtitle)}` : ''}`;
  return `${c(GRAY, line)}\n${title}\n${c(GRAY, line)}`;
}

function badge(text: string, color: string): string {
  const label = `[${text}]`.padEnd(8);
  if (plainMode || asciiMode || noColor) return label.padEnd(11);
  return `${color}${BOLD}${label}${RESET}`;
}

function helpCmd(cmd: string, desc: string, style: 'normal' | 'safe' | 'warn' | 'danger' | 'dim' | 'process' = 'normal'): string {
  const padded = cmd.padEnd(32);
  const styleMeta = {
    normal: { tag: 'READ', color: BLUE, text: WHITE },
    safe: { tag: 'SAFE', color: GREEN, text: GREEN },
    warn: { tag: 'ASK', color: YELLOW, text: YELLOW },
    danger: { tag: 'BLOCK', color: RED, text: RED },
    dim: { tag: 'INFO', color: GRAY, text: GRAY },
    process: { tag: 'PROC', color: MAGENTA, text: MAGENTA },
  }[style];
  return `  ${badge(styleMeta.tag, styleMeta.color)} ${c(BOLD + styleMeta.text, padded)} ${c(styleMeta.text, desc)}`;
}

function tipLine(text: string): string {
  return faint(`  ${text}`);
}

function statusValue(label: string, value: string, color: string): string {
  return `${faint(label.padEnd(10))}${c(BOLD + color, value)}`;
}

function statusLine(label: string, value: string, color: string): string {
  return `  ${statusValue(label, value, color)}`;
}

function printStatusPanel(version: string) {
  const statusLines = renderStatusLines(version);
  const values = Object.fromEntries(statusLines.map((line) => {
    const idx = line.indexOf(':');
    return idx > -1 ? [line.slice(0, idx), line.slice(idx + 1).trim()] : ['AIP CLI', line.replace(/^AIP CLI\s+/, '')];
  }));

  if (plainMode || asciiMode) {
    console.log('Runtime Summary');
    console.log(`  Version   ${values['AIP CLI'] || `v${version}`}`);
    console.log(`  Track     ${values.Track || 'unknown'}`);
    console.log(`  Mode      ${values.Mode || 'unknown'}`);
    console.log(`  Release   ${values.Release || 'unknown'}`);
    console.log(`  Project   ${values.Project || process.cwd()}`);
    console.log(`  Git       ${values.Git || 'unknown'}`);
    return;
  }

  console.log(accent('Runtime Summary'));
  console.log(statusLine('Version', values['AIP CLI'] || `v${version}`, CYAN));
  console.log(statusLine('Track', values.Track || 'unknown', MAGENTA));
  console.log(statusLine('Mode', values.Mode || 'unknown', GREEN));
  console.log(statusLine('Release', values.Release || 'unknown', YELLOW));
  console.log(statusLine('Project', values.Project || process.cwd(), WHITE));
  console.log(statusLine('Git', values.Git || 'unknown', values.Git?.includes('DIRTY') ? YELLOW : GREEN));
}

function printQuickStart() {
  console.log(sectionDivider('[00] 推荐入口 / Quick Start', '先看状态，再做动作'));
  console.log(helpCmd('aip status', '运行态总览：API / Web / PID / 端口', 'safe'));
  console.log(helpCmd('aip health', 'API 健康检查，适合确认服务是否可用', 'safe'));
  console.log(helpCmd('aip open', '打开 Web UI 控制台', 'safe'));
  console.log(helpCmd('aip next', '只读给出下一步建议', 'safe'));
}

function printCommandCenter() {
  const ver = getCliVersion();
  const bannerOpts = { noColor, plainMode, asciiMode, noBanner };

  const bannerLines = renderBanner(bannerOpts);
  for (const line of bannerLines) {
    console.log(line);
  }

  printStatusPanel(ver);
  console.log('');

  printQuickStart();
  console.log('');

  console.log(sectionDivider('[01] 服务控制 / Service Control', '会影响 AIP 进程'));
  console.log(helpCmd('aip start', '启动 AIP 服务', 'process'));
  console.log(helpCmd('aip stop', '停止 AIP 服务', 'process'));
  console.log(helpCmd('aip restart', '重启 AIP 服务，需要人工确认', 'warn'));
  console.log(helpCmd('aip logs api', '查看 API 日志'));
  console.log(helpCmd('aip logs web', '查看 Web UI 日志'));
  console.log(helpCmd('aip logs gateway', '查看 Gateway 日志'));
  console.log('');

  console.log(sectionDivider('[02] 项目检查 / Diagnostics', '只读优先'));
  console.log(helpCmd('aip version', '查看版本信息'));
  console.log(helpCmd('aip doctor', '一键诊断'));
  console.log(helpCmd('aip doctor env', '检查 Node / npm / Python / Git'));
  console.log(helpCmd('aip doctor encoding', '检查 Windows 中文编码与颜色支持'));
  console.log(helpCmd('aip doctor ports', '检查 8787 等端口占用'));
  console.log(helpCmd('aip doctor stage-c', '检查 Stage C 安全边界'));
  console.log(helpCmd('aip release-status', '查看发布状态', 'safe'));
  console.log(helpCmd('aip safe-status', '查看安全状态摘要', 'safe'));
  console.log(helpCmd('aip where', '查看项目位置与 Git 状态', 'safe'));
  console.log('');

  console.log(sectionDivider('[03] 配置管理 / Config', '修改前先 get'));
  console.log(helpCmd('aip config get', '查看当前配置'));
  console.log(helpCmd('aip config init', '初始化配置'));
  console.log(helpCmd('aip config set home <path>', '设置 AIP 项目路径', 'warn'));
  console.log(helpCmd('aip config set <key> <val>', '设置配置项', 'warn'));
  console.log('');

  console.log(sectionDivider('[04] 网关与模型 / Gateway & ML', 'OpenClaw / 本地模型 / Claude 代理相关'));
  console.log(helpCmd('aip gateway status', '查看 Gateway 状态', 'safe'));
  console.log(helpCmd('aip gateway start', '启动 Gateway', 'warn'));
  console.log(helpCmd('aip gateway stop', '停止 Gateway', 'warn'));
  console.log(helpCmd('aip gateway restart', '重启 Gateway，需要人工确认，不自动 taskkill', 'warn'));
  console.log(helpCmd('aip ml', '本机模型命令大全', 'safe'));
  console.log('');

  console.log(sectionDivider('[05] 修复系统 / Repair', '默认 plan-only，不直接改源码'));
  console.log(helpCmd('aip repair', '只生成修复计划，不修改文件', 'safe'));
  console.log(helpCmd('aip repair check', '检查可修复项', 'safe'));
  console.log(helpCmd('aip repair plan', '生成修复计划', 'safe'));
  console.log(helpCmd('aip repair command-pack', '修复命令包，不动源码', 'safe'));
  console.log(helpCmd('aip repair restore-point', '查看可用恢复点'));
  console.log(helpCmd('aip repair source', 'BLOCKED by default，需人工确认', 'danger'));
  console.log('');

  console.log(sectionDivider('[06] 系统工具 / Utilities'));
  console.log(helpCmd('aip receipt template', '生成回执模板', 'safe'));
  console.log('');

  console.log(sectionDivider('[07] OpenAIP v8 / 新功能 (预览)', 'Stub commands — 正式实现在 v8'));
  console.log(helpCmd('aip agents', 'Agent Center — 代理生命周期管理', 'dim'));
  console.log(helpCmd('aip integrations', 'Integration Center — 外部服务绑定', 'dim'));
  console.log(helpCmd('aip providers', 'Provider Manager — 模型提供商路由', 'dim'));
  console.log(helpCmd('aip apps', 'Local Apps — 本地微应用运行时', 'dim'));
  console.log(helpCmd('aip runtime', 'Runtime Kernel — 服务编排与健康', 'dim'));
  console.log('');

  console.log(c(BOLD + CYAN, '  Tips'));
  console.log(tipLine('  aip help <command>         查看某个命令详情'));
  console.log(tipLine('  aip --plain                纯文本模式，适合乱码环境'));
  console.log(tipLine('  aip --no-color             禁用颜色'));
  console.log(tipLine('  aip --ascii                ASCII 兼容模式'));
  console.log(tipLine('  aip --no-banner            隐藏 OPENAIP 横幅'));
  console.log(tipLine('  aip --lang zh              中文'));
  console.log(tipLine('  aip --lang en              English'));
}

function printHelpFor(cmd: string) {
  const tips: Record<string, string> = {
    start: 'aip start\n  启动 AIP 服务（API + Web）',
    stop: 'aip stop\n  停止 AIP 服务',
    restart: 'aip restart\n  重启 AIP 服务，需要人工确认',
    status: 'aip status\n  查看运行状态',
    health: 'aip health\n  检查 API 健康',
    open: 'aip open\n  打开 Web UI',
    version: 'aip version\n  查看版本信息',
    where: 'aip where\n  查看项目位置与 Git 状态',
    'next': 'aip next\n  查看建议的下一步（只读）',
    'release-status': 'aip release-status\n  查看发布状态（只读）',
    'safe-status': 'aip safe-status\n  查看安全状态（Stage C / 运行时 / 边界）',
    doctor: 'aip doctor [sub]\n  sub: env, encoding, ports, stage-c\n  一键诊断',
    config: 'aip config <init|get|set>\n  管理配置',
    gateway: 'aip gateway <start|stop|restart|status>\n  网关管理',
    ml: 'aip ml\n  本机模型命令大全',
    repair: 'aip repair [check|plan|command-pack|restore-point|source]\n  修复系统（plan-only）',
    receipt: 'aip receipt template\n  生成回执模板',
    runtime: 'aip runtime\n  OpenAIP v8 Runtime Kernel 只读基础命令（not implemented）',
    agents: 'aip agents\n  OpenAIP v8 Agent Center 只读基础命令（not implemented）',
    integrations: 'aip integrations\n  OpenAIP v8 Integration Center 只读基础命令（not implemented）',
    providers: 'aip providers\n  OpenAIP v8 Provider Manager 只读基础命令（not implemented）',
    apps: 'aip apps\n  OpenAIP v8 Local Apps Center 只读基础命令（not implemented）',
  };
  const text = tips[cmd] || `未知命令: ${cmd}`;
  console.log(text);
}

async function main() {
  const allArgs = process.argv.slice(2);

  noColor = process.env.NO_COLOR === '1' || allArgs.includes('--no-color');
  plainMode = allArgs.includes('--plain') || allArgs.includes('--no-color');
  asciiMode = allArgs.includes('--ascii');
  noBanner = process.env.AIP_NO_BANNER === '1' || allArgs.includes('--no-banner');
  const langZh = allArgs.includes('--lang') && allArgs[allArgs.indexOf('--lang') + 1] === 'zh';
  const langEn = allArgs.includes('--lang') && allArgs[allArgs.indexOf('--lang') + 1] === 'en';
  const helpIndex = allArgs.indexOf('help');

  const cmd = helpIndex >= 0 ? 'help' : allArgs[0];
  const sub = helpIndex >= 0 ? allArgs[helpIndex + 1] : allArgs[1];
  const rest = helpIndex >= 0 ? allArgs.slice(helpIndex + 2) : allArgs.slice(1);

  if (cmd === 'help' && sub) {
    printHelpFor(sub);
    return;
  }

  if (cmd === 'help') {
    printCommandCenter();
    return;
  }

  switch (cmd) {
    case 'start': await runStart(); break;
    case 'stop': await runStop(); break;
    case 'restart': await runRestart(); break;
    case 'status': await runStatus(); break;
    case 'health': await runHealth(); break;
    case 'logs': await runLogs(sub); break;
    case 'open': await runOpen(); break;
    case 'version': await runVersion(); break;
    case 'doctor': await runDoctor(sub); break;
    case 'config': await runConfig(sub, allArgs.filter(a => !a.startsWith('--')).slice(2)); break;
    case 'repair': await runRepair(sub, rest); break;
    case 'gateway': await runGateway(sub); break;
    case 'where': await runWhere(); break;
    case 'next': await runNext(); break;
    case 'release-status': await runReleaseStatus(); break;
    case 'safe-status': await runSafeStatus(); break;
    case 'receipt': await runReceiptTemplate(); break;
    case 'agents': await runAgents(); break;
    case 'integrations': await runIntegrations(); break;
    case 'providers': await runProviders(); break;
    case 'apps': await runApps(); break;
    case 'runtime': await runRuntime(); break;
    case 'ml':
    case 'manual':
    case 'commands':
      await runMl(); break;
    default:
      printCommandCenter();
      break;
  }
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});

