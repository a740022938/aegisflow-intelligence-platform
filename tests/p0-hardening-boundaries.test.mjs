import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const ROOT = 'E:\\AIP';

function read(path) {
  return fs.readFileSync(`${ROOT}\\${path}`, 'utf8');
}

test('web UI does not persist JWTs in localStorage or auto-login with legacy admin credentials', () => {
  const costRouting = read('apps\\web-ui\\src\\pages\\CostRouting.tsx');
  const modelGateway = read('apps\\web-ui\\src\\pages\\ModelGateway.tsx');
  const combined = `${costRouting}\n${modelGateway}`;

  assert.equal(combined.includes('aip_auth_token'), false);
  assert.equal(/localStorage\.(getItem|setItem)\([^)]*token/i.test(combined), false);
  assert.equal(combined.includes("password: 'aip-admin'"), false);
  assert.equal(combined.includes('password: "aip-admin"'), false);
});

test('START_HERE and README agree on the current v7.62 release baseline', () => {
  const startHere = read('START_HERE.md');
  const readme = read('README.md');

  assert.match(startHere, /AIP v7\.62\.0/);
  assert.match(startHere, /v7\.62\.0/);
  assert.match(startHere, /GitHub Release/);
  assert.equal(startHere.includes('No release/tag exists beyond v7.3.0'), false);
  assert.equal(startHere.includes('AIP v7.55 Release/Install/Restore Hardening'), false);

  assert.match(readme, /AIP v7\.62\.0/);
  assert.equal(readme.includes('### Current baseline (v7.55)'), false);
});

test('package, CLI, web, and product metadata versions share one v7.62 truth', () => {
  const rootPkg = JSON.parse(read('package.json'));
  const cliPkg = JSON.parse(read('apps\\aip-cli\\package.json'));
  const apiPkg = JSON.parse(read('apps\\local-api\\package.json'));
  const webPkg = JSON.parse(read('apps\\web-ui\\package.json'));
  const appVersion = read('apps\\web-ui\\src\\constants\\appVersion.ts');
  const productMetadata = read('apps\\web-ui\\src\\registry\\product-metadata-registry.ts');

  assert.equal(rootPkg.version, '7.62.0');
  assert.equal(cliPkg.version, rootPkg.version);
  assert.equal(apiPkg.version, rootPkg.version);
  assert.equal(webPkg.version, rootPkg.version);
  assert.match(appVersion, /APP_VERSION = 'v7\.62\.0'/);
  assert.match(productMetadata, /AIP_PRODUCT_VERSION = 'v7\.62\.0'/);
});

test('mock and fallback execution outputs carry an explicit SIMULATED marker', () => {
  const training = read('apps\\local-api\\src\\training\\index.ts');
  const workflow = read('apps\\local-api\\src\\workflow\\index.ts');

  assert.match(training, /simulation_label:\s*'SIMULATED'/);
  assert.match(workflow, /simulation_label:\s*'SIMULATED'/);
  assert.match(workflow, /Explicit mock simulation is required/);
});
