import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';

const cliDir = 'E:\\AIP\\apps\\aip-cli';

function runCli(args) {
  return execFileSync('node', ['dist/index.js', ...args], { cwd: cliDir, encoding: 'utf8' });
}

function spawnCli(args) {
  return spawnSync('node', ['dist/index.js', ...args], { cwd: cliDir, encoding: 'utf8' });
}

test('commands catalog lists grouped command surfaces with safety tags', () => {
  const out = runCli(['commands', '--plain']);
  assert.match(out, /AIP Command Catalog/);
  assert.match(out, /Quick Start/);
  assert.match(out, /Service Control/);
  assert.match(out, /aip status/);
  assert.match(out, /aip start/);
  assert.match(out, /\[SAFE\]/);
  assert.match(out, /\[ASK\]|\[PROC\]/);
  assert.match(out, /Use "aip help <command>"/);
});

test('commands catalog can filter by command text', () => {
  const out = runCli(['commands', 'gateway', '--plain']);
  assert.match(out, /AIP Command Catalog/);
  assert.match(out, /aip gateway status/);
  assert.match(out, /aip execution-gateway status/);
  assert.doesNotMatch(out, /aip agents\s/);
});

test('help commands explains command discovery entrypoint', () => {
  const out = runCli(['help', 'commands']);
  assert.match(out, /aip commands \[query\]/);
  assert.match(out, /Searchable command catalog/);
});

test('unknown commands fail with suggestions instead of silently opening the homepage', () => {
  const result = spawnCli(['statuz']);
  assert.notEqual(result.status, 0);
  const combined = `${result.stdout}\n${result.stderr}`;
  assert.match(combined, /Unknown command: statuz/);
  assert.match(combined, /Did you mean: status/);
  assert.match(combined, /Run "aip commands"/);
});
