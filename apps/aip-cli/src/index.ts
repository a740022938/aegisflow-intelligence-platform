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
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

let noColor = false;
let plainMode = false;
let asciiMode = false;
let noBanner = false;

function c(color: string, text: string): string {
  if (noColor || plainMode) return text;
  return `${color}${text}${RESET}`;
}

function sectionDivider(label: string): string {
  const line = '='.repeat(64);
  if (plainMode || asciiMode) {
    return `${line}\n${label}\n${line}`;
  }
  return `${c(BOLD + CYAN, line)}\n${c(BOLD + CYAN, label)}\n${c(BOLD + CYAN, line)}`;
}

function helpCmd(cmd: string, desc: string, style: 'normal' | 'safe' | 'warn' | 'danger' | 'dim' = 'normal'): string {
  const padded = cmd.padEnd(30);
  if (style === 'safe') return `  ${c(GREEN, padded)}${c(GREEN, desc)}`;
  if (style === 'warn') return `  ${c(YELLOW, padded)}${c(YELLOW, desc)}`;
  if (style === 'danger') return `  ${c(RED, padded)}${c(RED, desc)}`;
  if (style === 'dim') return `  ${c(GRAY, padded)}${c(GRAY, desc)}`;
  return `  ${padded}${desc}`;
}

function tipLine(text: string): string {
  return c(GRAY, `  ${text}`);
}

function printCommandCenter() {
  const ver = getCliVersion();
  const bannerOpts = { noColor, plainMode, asciiMode, noBanner };

  const bannerLines = renderBanner(bannerOpts);
  for (const line of bannerLines) {
    console.log(line);
  }

  const statusLines = renderStatusLines(ver);
  for (const line of statusLines) {
    console.log(c(GREEN, line));
  }
  console.log('');

  console.log(sectionDivider('[01] 常用控制 / Daily Control'));
  console.log(helpCmd('aip start', '启动 AIP 服务', 'safe'));
  console.log(helpCmd('aip stop', '停止 AIP 服务', 'safe'));
  console.log(helpCmd('aip restart', '重启 AIP 服务，需要人工确认', 'warn'));
  console.log(helpCmd('aip status', '查看运行状态'));
  console.log(helpCmd('aip health', '检查 API 健康'));
  console.log(helpCmd('aip open', '打开 Web UI'));
  console.log(helpCmd('aip logs api', '查看 API 日志'));
  console.log(helpCmd('aip logs web', '查看 Web UI 日志'));
  console.log(helpCmd('aip logs gateway', '查看 Gateway 日志'));
  console.log(helpCmd('aip where', '查看项目位置与 Git 状态', 'safe'));
  console.log('');

  console.log(sectionDivider('[02] 项目检查 / Diagnostics'));
  console.log(helpCmd('aip version', '查看版本信息'));
  console.log(helpCmd('aip doctor', '一键诊断'));
  console.log(helpCmd('aip doctor env', '检查 Node / npm / Python / Git'));
  console.log(helpCmd('aip doctor encoding', '检查 Windows 中文编码与颜色支持'));
  console.log(helpCmd('aip doctor ports', '检查 8787 等端口占用'));
  console.log(helpCmd('aip doctor stage-c', '检查 Stage C 安全边界'));
  console.log(helpCmd('aip next', '查看建议的下一步', 'safe'));
  console.log(helpCmd('aip release-status', '查看发布状态', 'safe'));
  console.log(helpCmd('aip safe-status', '查看安全状态摘要', 'safe'));
  console.log('');

  console.log(sectionDivider('[03] 配置管理 / Config'));
  console.log(helpCmd('aip config get', '查看当前配置'));
  console.log(helpCmd('aip config init', '初始化配置'));
  console.log(helpCmd('aip config set home <path>', '设置 AIP 项目路径'));
  console.log(helpCmd('aip config set <key> <val>', '设置配置项'));
  console.log('');

  console.log(sectionDivider('[04] 网关与模型 / Gateway & ML'));
  console.log(helpCmd('aip gateway status', '查看 Gateway 状态'));
  console.log(helpCmd('aip gateway start', '启动 Gateway'));
  console.log(helpCmd('aip gateway stop', '停止 Gateway'));
  console.log(helpCmd('aip gateway restart', '重启 Gateway，需要人工确认，不自动 taskkill', 'warn'));
  console.log(helpCmd('aip ml', '本机模型命令大全'));
  console.log('');

  console.log(sectionDivider('[05] 修复系统 / Repair'));
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

  console.log(tipLine('Tips:'));
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
