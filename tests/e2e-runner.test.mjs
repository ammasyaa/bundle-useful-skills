import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const runner=join(process.cwd(),'scripts','e2e.mjs');

test('plug-and-play E2E runner verifies both hosts without touching the user home', () => {
  const result=spawnSync(process.execPath,[runner,'--router-only'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||result.stdout);
  assert.match(result.stdout,/E2E: install isolated hosts/);
  assert.match(result.stdout,/E2E: run installed-router scenarios/);
  assert.match(result.stdout,/Codex: router=managed-current, globalRule=true/);
  assert.match(result.stdout,/Antigravity: router=managed-current, globalRule=true/);
  assert.match(result.stdout,/Installed routes: 8\/8 passed/);
  assert.match(result.stdout,/Idempotent reinstall: passed/);
  assert.match(result.stdout,/E2E PASS \(router-only\)/);
});

test('plug-and-play E2E runner reports invalid options without a stack trace', () => {
  const result=spawnSync(process.execPath,[runner,'--unknown'],{encoding:'utf8'});
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/^E2E FAIL: Unknown argument: --unknown/m);
  assert.doesNotMatch(result.stderr,/\n\s+at /);
});
