import { runStart } from './start.js';
import { runStop } from './stop.js';
import { PATHS } from '../paths.js';
import { readPidFile, isProcessAlive } from '../process.js';
import { log, ok, warn } from '../logger.js';
import { loadConfig } from '../config.js';
import { checkHealth } from '../health.js';

export async function runGateway(sub?: string) {
  switch (sub) {
    case 'start': {
      await runStart();
      log('AIP Gateway online');
      break;
    }
    case 'stop': {
      await runStop();
      break;
    }
    case 'restart': {
      await runStop();
      await runStart();
      break;
    }
    case 'status': {
      const config = loadConfig();
      const gatewayPid = readPidFile(PATHS.gatewayPidFile);
      const gatewayAlive = gatewayPid ? isProcessAlive(gatewayPid) : false;

      let healthStatus = 'offline';
      try {
        const health = await checkHealth(config.apiHealthUrl);
        healthStatus = health.ok ? 'online' : 'offline';
      } catch {}

      log(`AIP Gateway ${healthStatus === 'online' ? 'online' : 'offline'}`);
      log(`Gateway PID  ${gatewayPid ?? 'none'} (${gatewayAlive ? 'running' : 'stopped'})`);
      break;
    }
    default:
      log('Usage: aip gateway <start|stop|restart|status>');
      log('');
      log('Commands:');
      log('  start    Start AIP gateway and all services');
      log('  stop     Stop AIP gateway and all services');
      log('  restart  Restart AIP gateway and all services');
      log('  status   Show gateway status');
      break;
  }
}
