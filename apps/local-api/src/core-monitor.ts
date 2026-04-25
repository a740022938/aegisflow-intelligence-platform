const status = {
  health: { lastCheck: '', ok: false, ms: 0 },
  masterSwitch: { lastCheck: '', ok: false, ms: 0 },
  heartbeat: { lastReceived: '', sent: 0, lastSent: '' },
  uptime: process.uptime(),
};

export function recordHealthCheck(ok: boolean, ms: number) {
  status.health = { lastCheck: new Date().toISOString(), ok, ms };
}

export function recordMasterSwitch(ok: boolean, ms: number) {
  status.masterSwitch = { lastCheck: new Date().toISOString(), ok, ms };
}

export function recordHeartbeatSent() {
  status.heartbeat.sent++;
  status.heartbeat.lastSent = new Date().toISOString();
}

export function recordHeartbeatReceived() {
  status.heartbeat.lastReceived = new Date().toISOString();
}

export function getCoreStatus() {
  status.uptime = process.uptime();
  const now = Date.now();
  const healthAge = status.health.lastCheck ? Math.round((now - new Date(status.health.lastCheck).getTime()) / 1000) : -1;
  const switchAge = status.masterSwitch.lastCheck ? Math.round((now - new Date(status.masterSwitch.lastCheck).getTime()) / 1000) : -1;
  return {
    ...status,
    healthAgeSec: healthAge,
    switchAgeSec: switchAge,
    allOk: status.health.ok && status.masterSwitch.ok,
    warnings: [
      healthAge > 60 ? 'Health check stale (>60s)' : null,
      healthAge > 0 && !status.health.ok ? 'Health check failed' : null,
      status.heartbeat.lastReceived && (now - new Date(status.heartbeat.lastReceived).getTime()) > 30000 ? 'No OpenClaw heartbeat in 30s' : null,
    ].filter(Boolean),
  };
}
