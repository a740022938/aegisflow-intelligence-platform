import { loadConfig, saveConfig, initConfig } from '../config.js';
import { log, ok, fail } from '../logger.js';

const VALID_KEYS = ['home', 'apiPort', 'webPort', 'host', 'apiCommand', 'webCommand', 'webUrl', 'apiHealthUrl'];

export async function runConfig(sub: string, args: string[]) {
  switch (sub) {
    case 'init': {
      const cfg = initConfig();
      log(`Config created: ~/.aip/config.json`);
      break;
    }
    case 'get': {
      const config = loadConfig();
      log(JSON.stringify(config, null, 2));
      break;
    }
    case 'set': {
      if (args.length < 2) {
        log('Usage: aip config set <key> <value>');
        log(`Keys: ${VALID_KEYS.join(', ')}`);
        return;
      }
      const key = args[0];
      const val = args[1];

      if (!VALID_KEYS.includes(key)) {
        fail(`Unknown config key: ${key}`);
        log(`Valid keys: ${VALID_KEYS.join(', ')}`);
        return;
      }

      const config = loadConfig();
      const typedVal = (key === 'apiPort' || key === 'webPort') ? parseInt(val, 10) : val;

      if ((key === 'apiPort' || key === 'webPort') && (isNaN(typedVal as number) || (typedVal as number) <= 0)) {
        fail(`Invalid port number: ${val}`);
        return;
      }

      (config as any)[key] = typedVal;
      saveConfig(config);
      ok(`Set ${key} = ${typedVal}`);
      break;
    }
    default:
      log('Usage: aip config <init|get|set>');
      log('');
      log('Commands:');
      log('  init              Initialize config file');
      log('  get               Show current config');
      log('  set <key> <val>   Set config value');
      log('');
      log(`Valid keys: ${VALID_KEYS.join(', ')}`);
      break;
  }
}
