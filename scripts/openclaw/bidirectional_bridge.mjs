/**
 * OpenClaw ↔ AIP 双向通信桥接脚本
 *
 * 运行方式: node scripts/openclaw/bidirectional_bridge.mjs [command] [args...]
 *
 * 命令:
 *   heartbeat   发送增强心跳 (heartbeat-v2)
 *   intent      "用户输入的自然语言"     → 解析意图并触发工作流
 *   command     <command> <target>        → 发送命令 (pause/resume/cancel/retry/inspect)
 *   workflow    <template>               → 触发工作流
 *   capabilities                         → 获取 AIP 能力清单
 *   watch                                 → 持续监听模式 (每 N 秒查询状态)
 *   script      <script_name>            → 在 AIP 侧运行脚本
 *   status                               → 获取 AIP 完整状态
 */

const AIP_API = process.env.AIP_API_BASE || 'http://127.0.0.1:8787';
const OPENCLAW_TOKEN = process.env.OPENCLAW_HEARTBEAT_TOKEN || '';
const ADMIN_TOKEN = process.env.OPENCLAW_ADMIN_TOKEN || '';

const args = process.argv.slice(2);
const command = args[0] || 'capabilities';

async function apiPost(path, body, useAdmin = false) {
  const token = useAdmin ? ADMIN_TOKEN : OPENCLAW_TOKEN;
  const headerKey = useAdmin ? 'x-openclaw-admin-token' : 'x-openclaw-token';
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers[headerKey] = token;

  const res = await fetch(`${AIP_API}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return { ok: res.ok, status: res.status, data: await res.json() };
}

async function apiGet(path) {
  const res = await fetch(`${AIP_API}${path}`);
  return { ok: res.ok, status: res.status, data: await res.json() };
}

// ─── Commands ─────────────────────────────────────────────────────────────

async function cmdHeartbeat() {
  const result = await apiPost('/api/openclaw/heartbeat-v2', {
    actor: 'openclaw_agent',
    runtime_online: true,
    execution_status: 'idle',
    capabilities_cache: true,
  });
  return result;
}

async function cmdIntent(prompt) {
  const result = await apiPost('/api/openclaw/intent', { prompt });
  if (!result.ok) return result;

  const { template, confidence, params } = result.data;
  console.log(`[Intent] 解析结果: "${prompt}"`);
  console.log(`[Intent]   → 模板: ${template || '(none, 直接执行)'}`);
  console.log(`[Intent]   → 置信度: ${(confidence * 100).toFixed(1)}%`);
  console.log(`[Intent]   → 参数: ${JSON.stringify(params)}`);

  // Only auto-execute if confidence > 70%
  if (template && confidence > 0.7) {
    console.log(`[Intent] 置信度足够，自动触发工作流...`);
    const execResult = await apiPost('/api/openclaw/workflow', {
      template,
      params: { source: 'openclaw_intent', original_prompt: prompt, ...params },
    }, true);
    return execResult;
  }

  return result;
}

async function cmdCommand(action, target) {
  const result = await apiPost('/api/openclaw/command', {
    command: action,
    target: target || 'system',
    params: {},
  }, true);
  return result;
}

async function cmdWorkflow(template) {
  const result = await apiPost('/api/openclaw/workflow', {
    template: template || 'dataset-flywheel',
    params: { source: 'openclaw_bridge' },
  }, true);
  return result;
}

async function cmdCapabilities() {
  return await apiGet('/api/openclaw/capabilities');
}

async function cmdScript(scriptName) {
  const result = await apiPost('/api/openclaw/run-script', {
    script: scriptName,
    params: {},
  }, true);
  return result;
}

async function cmdStatus() {
  return await apiGet('/api/system/status');
}

async function cmdWatch() {
  const interval = parseInt(args[1] || '15', 10);
  console.log(`[Watch] 启动持续监听模式，间隔 ${interval}s`);
  console.log(`[Watch] AIP API: ${AIP_API}\n`);

  const loop = async () => {
    try {
      const status = await cmdStatus();
      if (status.ok && status.data?.ok) {
        const s = status.data;
        console.log(`[${new Date().toISOString()}] AIP 状态:`);
        console.log(`  uptime: ${Math.floor(s.uptime / 60)}min`);
        console.log(`  workerPool: ${s.workerPool?.busyWorkers || 0}忙 / ${s.workerPool?.idleWorkers || 0}闲`);
        console.log(`  taskQueue: ${s.taskQueue?.queued || 0}排队 / ${s.taskQueue?.active || 0}执行中`);
        console.log(`  database: ${s.database?.totalQueries || 0}查询 / ${s.database?.totalErrors || 0}错误\n`);
      } else {
        console.log(`[${new Date().toISOString()}] AIP 连接失败: ${status.data?.error || status.status}`);
      }
    } catch (err) {
      console.log(`[${new Date().toISOString()}] 错误: ${err.message}`);
    }
  };

  await loop();
  setInterval(loop, interval * 1000);
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  let result;

  switch (command) {
    case 'heartbeat':
      result = await cmdHeartbeat();
      break;
    case 'intent':
      result = await cmdIntent(args.slice(1).join(' ') || '检查系统健康状态');
      break;
    case 'command':
      result = await cmdCommand(args[1], args[2]);
      break;
    case 'workflow':
      result = await cmdWorkflow(args[1]);
      break;
    case 'capabilities':
      result = await cmdCapabilities();
      break;
    case 'script':
      result = await cmdScript(args[1]);
      break;
    case 'status':
      result = await cmdStatus();
      break;
    case 'watch':
      await cmdWatch();
      return;
    default:
      console.error(`未知命令: ${command}`);
      console.error('可用命令: heartbeat, intent, command, workflow, capabilities, script, status, watch');
      process.exit(1);
  }

  if (result) {
    console.log(JSON.stringify(result.data, null, 2));
    if (!result.ok) process.exit(1);
  }
}

main().catch(err => {
  console.error(JSON.stringify({ ok: false, error: err.message }));
  process.exit(1);
});
