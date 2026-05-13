export async function generateComfyGraph(graphObject: any, baseUrl: string, clientId: string = 'aip-comfy-bridge') {
  const base = (baseUrl || 'http://127.0.0.1:8188').replace(/\\+$/, '');
  const url = base + '/prompt';
  const payload = {
    prompt: graphObject,
    client_id: clientId
  };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    } as any);
    const status = res.status;
    if (res.ok) {
      const json = await res.json();
      const promptId = String(json?.prompt_id ?? json?.id ?? json?.promptId ?? json?.job_id ?? json?.result?.id ?? '');
      return { ok: true, prompt_id: promptId, urlUsed: url, status };
    } else {
      const text = await res.text();
      return { ok: false, status, text: text };
    }
  } catch (err: any) {
    return { ok: false, status: 500, text: err?.message ?? String(err) ?? 'unknown', stack: err?.stack ?? '' };
  }
}
