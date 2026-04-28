export async function checkHealth(url: string): Promise<{ ok: boolean; version: string; db: string; error?: string }> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await res.json() as any;
    return { ok: data?.ok === true, version: data?.version || 'unknown', db: data?.database?.status || data?.database || 'unknown' };
  } catch (e: any) {
    return { ok: false, version: 'unknown', db: 'unknown', error: e.message || String(e) };
  }
}
