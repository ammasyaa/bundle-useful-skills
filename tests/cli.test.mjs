import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const cli=join(process.cwd(),'scripts','cli.mjs');
const run=(...values)=>spawnSync(process.execPath,[cli,...values],{encoding:'utf8'});

test('report rejects unknown options instead of silently dropping security input',()=>{
  const result=run('report','--platform','website','--framework','next','--task','implementation','--descripton','payment checkout');
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/unknown option --descripton/i);
});

test('report rejects stray positional arguments',()=>{
  const result=run('report','unexpected','--platform','website','--framework','next','--task','implementation');
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/unexpected positional argument/i);
});

test('report rejects duplicate scalar options',()=>{
  const result=run('report','--platform','website','--platform','mobile','--framework','next','--task','implementation');
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/duplicate option --platform/i);
});

test('list options merge repeated and comma-separated values',()=>{
  const result=run('route','--platform','website','--framework','next','--task','implementation','--risks','auth,payment','--risks','pii');
  assert.equal(result.status,0,result.stderr);
  const report=JSON.parse(result.stdout);
  assert.ok(report.active.includes('security-gate'));
});

test('triage rejects options',()=>{
  const result=run('triage','--mode','full');
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/unknown option --mode/i);
});

test('valid existing report syntax remains compatible',()=>{
  const result=run('report','--platform','mobile','--framework','flutter','--target','ios','--task','implementation');
  assert.equal(result.status,0,result.stderr);
  assert.match(result.stdout,/flutter-apply-architecture-best-practices/);
});
