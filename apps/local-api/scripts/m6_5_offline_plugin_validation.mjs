import path from 'node:path';
import process from 'node:process';

const RUNS = 20;
const pluginDir = path.resolve(process.cwd(), '../../plugins/builtin');

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runOnce(iteration) {
  const mod = await import('@agi-factory/plugin-runtime');
  const PluginManager = mod?.PluginManager;
  if (!PluginManager) {
    throw new Error('PluginManager export is missing from @agi-factory/plugin-runtime');
  }

  const pm = new PluginManager({
    enabled: true,
    pluginDir,
    autoLoadBuiltin: true,
    logLevel: 'info',
  });

  // loadBuiltinPlugins 在构造器中异步触发，这里给一个很短的稳定窗口。
  await wait(60);
  const plugins = pm.listPlugins({ capability: 'vision' });

  if (!Array.isArray(plugins)) {
    throw new Error(`Iteration ${iteration}: listPlugins did not return an array`);
  }

  return {
    iteration,
    visionCount: plugins.length,
    stats: pm.getStats(),
  };
}

async function main() {
  console.log('[M6.5 Offline Validation] start');
  console.log(`Node: ${process.version}`);
  console.log(`CWD: ${process.cwd()}`);
  console.log(`pluginDir: ${pluginDir}`);
  console.log(`runs: ${RUNS}`);

  const results = [];
  for (let i = 1; i <= RUNS; i++) {
    try {
      const r = await runOnce(i);
      results.push(r);
      console.log(
        `[run ${String(i).padStart(2, '0')}] ok vision=${r.visionCount} total=${r.stats.total} enabled=${r.stats.enabled}`
      );
    } catch (err) {
      const e = err;
      const code = e && typeof e === 'object' ? e.code : undefined;
      console.error(`[run ${String(i).padStart(2, '0')}] failed`, e);
      if (code === 'ERR_MODULE_NOT_FOUND') {
        console.error('Encountered ERR_MODULE_NOT_FOUND (validation failed)');
      }
      process.exit(1);
    }
  }

  console.log('[M6.5 Offline Validation] passed');
  console.log(
    `Summary: ${results.length}/${RUNS} runs succeeded, lastVisionCount=${results.at(-1)?.visionCount ?? 0}`
  );
}

main().catch((err) => {
  console.error('[M6.5 Offline Validation] fatal', err);
  process.exit(1);
});
