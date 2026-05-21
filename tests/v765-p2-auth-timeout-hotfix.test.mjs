import { readFileSync } from 'node:fs';

const failures = [];

// ===== Existing P1 checks =====

// 1. Token input is masked (type="password")
const tokenInput = readFileSync('apps/web-ui/src/components/ui/TokenInput.tsx', 'utf8');
if (!tokenInput.includes('type="password"')) {
  failures.push('TokenInput: missing type="password" (masked input)');
}
if (!tokenInput.includes('autoComplete="off"')) {
  failures.push('TokenInput: missing autoComplete="off"');
}
if (!tokenInput.includes('maxLength={4096}')) {
  failures.push('TokenInput: missing maxLength limit');
}

// 2. No localStorage usage for token storage
const useAuthContent = readFileSync('apps/web-ui/src/hooks/useAuth.tsx', 'utf8');
if (useAuthContent.includes('localStorage')) {
  failures.push('useAuth: must not use localStorage for token');
}

// 3. No token rendered to DOM in plaintext
if (tokenInput.includes('{token}') && !tokenInput.includes('value={token}')) {
  failures.push('TokenInput: token should not be rendered as text content');
}

// 4. No console.log of token
const allSource = [tokenInput, useAuthContent].join('\n');
let foundTokenLog = false;
if (allSource.includes('console.log') || allSource.includes('console.warn')) {
  const lines = allSource.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if ((lines[i].includes('console.log') || lines[i].includes('console.warn')) && lines[i].includes('token')) {
      failures.push(`Token/logging: console.log/warn with token at line ${i + 1}`);
      foundTokenLog = true;
    }
  }
}

// 5. PluginPool has TokenInput import
const pluginPool = readFileSync('apps/web-ui/src/pages/PluginPool.tsx', 'utf8');
if (!pluginPool.includes("TokenInput")) {
  failures.push('PluginPool: must have TokenInput component');
}
if (pluginPool.includes('Login at POST /api/auth/login')) {
  failures.push('PluginPool: must not show "Login at POST /api/auth/login" static text');
}
if (pluginPool.includes('Or configure OPENCLAW_HEARTBEAT_TOKEN in .env.local')) {
  failures.push('PluginPool: must not show "configure OPENCLAW_HEARTBEAT_TOKEN in .env.local" static text');
}

// 6. ModuleCenter has TokenInput import
const moduleCenter = readFileSync('apps/web-ui/src/pages/ModuleCenter.tsx', 'utf8');
if (!moduleCenter.includes("TokenInput")) {
  failures.push('ModuleCenter: must have TokenInput component');
}
if (moduleCenter.includes('当前身份信息已过期或不可用')) {
  failures.push('ModuleCenter: must not show hardcoded "当前身份信息已过期或不可用"');
}

// 7. No bare "unauthorized" in visible UI text
const checkForBareUnauthorized = (content, label) => {
  if (content.includes('"unauthorized"') || content.includes("'unauthorized'")) {
    failures.push(`${label}: contains bare "unauthorized" string`);
  }
};
checkForBareUnauthorized(pluginPool, 'PluginPool');
checkForBareUnauthorized(moduleCenter, 'ModuleCenter');

// 8. No AGI_FACTORY in visible UI text
if (pluginPool.includes('AGI_FACTORY')) failures.push('PluginPool: contains AGI_FACTORY');
if (moduleCenter.includes('AGI_FACTORY')) failures.push('ModuleCenter: contains AGI_FACTORY');

// 9. AuthRequiredState does not show OPENCLAW_HEARTBEAT_TOKEN in steps
const authReqState = readFileSync('apps/web-ui/src/components/ui/AuthRequiredState.tsx', 'utf8');
if (authReqState.includes('OPENCLAW_HEARTBEAT_TOKEN')) {
  failures.push('AuthRequiredState: must not display OPENCLAW_HEARTBEAT_TOKEN in UI');
}

// 10. Backend auth/status endpoint exists
const authIndex = readFileSync('apps/local-api/src/auth/index.ts', 'utf8');
if (!authIndex.includes('/api/auth/status')) {
  failures.push('Backend: missing /api/auth/status endpoint');
}

// 11. Backend auth/check endpoint exists
const apiIndex = readFileSync('apps/local-api/src/index.ts', 'utf8');
if (!apiIndex.includes('/api/openclaw/auth/check')) {
  failures.push('Backend: missing /api/openclaw/auth/check endpoint');
}

// 12. PUBLIC_PATHS includes endpoints
if (!apiIndex.includes("'/api/auth/status'")) {
  failures.push('Backend: /api/auth/status not in PUBLIC_PATHS');
}
if (!apiIndex.includes("'/api/openclaw/auth/check'")) {
  failures.push('Backend: /api/openclaw/auth/check not in PUBLIC_PATHS');
}

// 13. Gate is disabled when unauthorized in ModuleCenter
if (!moduleCenter.includes("authState !== 'authorized'")) {
  failures.push('ModuleCenter: gate button must be disabled when not authorized');
}

// 14. Backend auth check does not echo token back
const checkEndpoint = apiIndex.substring(apiIndex.indexOf("'/api/openclaw/auth/check'"));
if (checkEndpoint) {
  const endOfFunc = checkEndpoint.indexOf("'POST /api/openclaw/circuit/recover'");
  const funcBody = endOfFunc > 0 ? checkEndpoint.substring(0, endOfFunc) : checkEndpoint;
  const hasResponseBodyToken =
    funcBody.includes('"token"') || funcBody.includes("'token'") || funcBody.includes('token:');
  if (hasResponseBodyToken) {
    const lines = funcBody.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if ((trimmed.startsWith('"token"') || trimmed.startsWith("'token'") || trimmed.startsWith('token:')) &&
          !trimmed.includes('heartbeat_token') && !trimmed.includes('configuredToken') &&
          !trimmed.includes('expectedToken') && !trimmed.includes('providedAdminToken')) {
        // response body containing token value — should not echo
        failures.push(`Backend auth check: response may echo token: ${trimmed.substring(0, 60)}`);
      }
    }
  }
}

// ===== NEW P2 checks for timeout hotfix =====

// 15. AbortController present in verifyToken
if (!useAuthContent.includes('AbortController')) {
  failures.push('useAuth: verifyToken must use AbortController');
}

// 16. 8-second timeout for verifyToken
if (!useAuthContent.includes('8000')) {
  failures.push('useAuth: verifyToken must have 8s timeout (8000 ms)');
}

// 17. Timeout state exists in AuthState type
if (!useAuthContent.includes("'timeout'")) {
  failures.push('useAuth: AuthState must include "timeout"');
}

// 18. network_error state exists in AuthState type
if (!useAuthContent.includes("'network_error'")) {
  failures.push('useAuth: AuthState must include "network_error"');
}

// 19. TokenInput handles "timeout" state text
if (!tokenInput.includes('验证超时')) {
  failures.push('TokenInput: must show timeout message');
}

// 20. TokenInput handles "network_error" state text
if (!tokenInput.includes('无法连接认证服务')) {
  failures.push('TokenInput: must show network_error message');
}

// 21. abortVerify is exposed from useAuth context
if (!useAuthContent.includes('abortVerify')) {
  failures.push('useAuth: must expose abortVerify');
}

// 22. TokenInput aborts on unmount (useEffect return calls abortVerify)
if (!tokenInput.includes('abortVerify')) {
  failures.push('TokenInput: must call abortVerify on unmount');
}

// 23. TokenInput uses mountedRef to prevent state update after unmount
if (!tokenInput.includes('mountedRef')) {
  failures.push('TokenInput: must use mountedRef to guard setState after unmount');
}

// 24. Clear button not disabled during verifying
if (tokenInput.includes("disabled={state === 'unauthenticated' || state === 'unknown'}")) {
  failures.push('TokenInput: clear button must not be disabled based on old condition');
}
// 26. POST /api/openclaw/master-switch still returns 403
if (!apiIndex.includes('Stage C is not enabled')) {
  failures.push('Backend: master-switch POST must still return 403');
}
if (failures.length) {
  console.error('FAIL v7.65-P2 auth UX timeout hotfix tests:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('PASS v7.65-P2 auth UX timeout hotfix tests');
console.log(`  ${failures.length} failures`);
console.log('  Token input masked: ✅');
console.log('  No localStorage token: ✅');
console.log('  No token in DOM text: ✅');
console.log('  No console.log(token): ✅');
console.log('  PluginPool has TokenInput: ✅');
console.log('  ModuleCenter has TokenInput: ✅');
console.log('  No bare unauthorized text: ✅');
console.log('  No AGI_FACTORY: ✅');
console.log('  AuthRequiredState safe: ✅');
console.log('  Backend endpoints exist: ✅');
console.log('  PUBLIC_PATHS updated: ✅');
console.log('  Gate disabled when unauthorized: ✅');
console.log('  No token echo in error: ✅');
console.log('  AbortController present: ✅');
console.log('  8s timeout (8000ms): ✅');
console.log('  Timeout state in AuthState: ✅');
console.log('  network_error state in AuthState: ✅');
console.log('  TokenInput timeout message: ✅');
console.log('  TokenInput network_error message: ✅');
console.log('  abortVerify exposed: ✅');
console.log('  TokenInput abort on unmount: ✅');
console.log('  TokenInput mountedRef guard: ✅');
console.log('  Clear button not stuck: ✅');
console.log('  Master-switch still 403: ✅');
