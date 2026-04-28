#!/usr/bin/env node
import { initConfig } from './config.js';
import { runStart } from './commands/start.js';
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

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const sub = args[1];
  const rest = args.slice(1);
  
  switch (cmd) {
    case 'start': await runStart(); break;
    case 'stop': await runStop(); break;
    case 'restart': await runRestart(); break;
    case 'status': await runStatus(); break;
    case 'health': await runHealth(); break;
    case 'logs': await runLogs(sub); break;
    case 'open': await runOpen(); break;
    case 'version': await runVersion(); break;
    case 'doctor': await runDoctor(); break;
    case 'config': await runConfig(sub, args.slice(2)); break;
    case 'gateway': await runGateway(sub); break;
    default:
      console.log(`AIP CLI v7.1.0`);
      console.log(`Usage: aip <command>`);
      console.log(``);
      console.log(`Commands:`);
      console.log(`  start        Start AIP services`);
      console.log(`  stop         Stop AIP services`);
      console.log(`  restart      Restart AIP services`);
      console.log(`  status       Show AIP status`);
      console.log(`  health       Check API health`);
      console.log(`  logs [type]  Show logs (api/web/gateway)`);
      console.log(`  open         Open Web UI in browser`);
      console.log(`  version      Show version info`);
      console.log(`  doctor       Run diagnostics`);
      console.log(`  config       Manage configuration`);
      console.log(`  gateway      Gateway lifecycle operations`);
      console.log(``);
      console.log(`Config:`);
      console.log(`  aip config init              Initialize config`);
      console.log(`  aip config get               Show current config`);
      console.log(`  aip config set <key> <val>   Set config value`);
      console.log(`  aip config set home <path>   Set AIP project path`);
      break;
  }
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
