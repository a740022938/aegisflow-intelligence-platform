/**
 * Intent Sandbox — 让 OpenClaw 用 LLM 预解析用户意图
 * 
 * 工作流:
 *   1. OpenClaw 收到用户消息
 *   2. 先用自身的 LLM 理解用户意图
 *   3. 调用本脚本将 LLM 理解的意图传给 AIP 的 intent engine
 *   4. AIP 返回匹配结果 + 是否需要澄清
 *   5. 如果置信度够高，自动执行；不够则向用户追问
 *
 * 用法:
 *   node intent_sandbox.mjs "用户说的一句话"
 *
 * 输出:
 *   { ok, intent_id, template, confidence, clarification_needed, ... }
 */

const AIP_API = process.env.AIP_API_BASE || 'http://127.0.0.1:8787';
const input = process.argv.slice(2).join(' ').trim();

if (!input) {
  console.log(JSON.stringify({
    ok: false,
    error: '需要输入用户消息',
    usage: 'node intent_sandbox.mjs "用户说的一句话"',
  }));
  process.exit(1);
}

async function main() {
  // Step 1: Call AIP intent engine
  const res = await fetch(`${AIP_API}/api/openclaw/intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: input }),
  });

  if (!res.ok) {
    console.log(JSON.stringify({ ok: false, error: `HTTP ${res.status}`, user_input: input }));
    process.exit(1);
  }

  const result = await res.json();

  // Step 2: Format output for OpenClaw LLM consumption
  const output = {
    ok: true,
    original_user_input: input,
    resolved: {
      intent_id: result.intent_id,
      template: result.template,
      confidence: result.confidence,
      matched_keywords: result.matched_keywords,
      source: result.source,
    },
    action_required: result.clarification_needed ? 'CLARIFY' : (result.template ? 'EXECUTE' : 'UNKNOWN'),
    clarification: result.clarification_needed ? {
      question: result.clarification_question,
      alternatives: result.alternatives || [],
    } : undefined,
    available_templates: result.available_templates,
    context: result.context,
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch(err => {
  console.log(JSON.stringify({ ok: false, error: err.message, user_input: input }));
  process.exit(1);
});
