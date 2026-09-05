import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const installer=join(process.cwd(),'scripts','install-global.mjs');
const doctor=join(process.cwd(),'scripts','doctor.mjs');

test('doctor emits one valid JSON document for both hosts', () => {
  const home=installRouterOnly('doctor-json-');
  const result=spawnSync(process.execPath,[doctor,'--target','all','--home',home],{encoding:'utf8'});
  const report=JSON.parse(result.stdout);
  assert.equal(report.length,2);
  assert.deepEqual(report.map(item=>item.target),['codex','antigravity']);
});

test('doctor rejects a stale managed global rule', () => {
  const home=installRouterOnly('doctor-rule-');
  const rule=join(home,'.codex','AGENTS.md');
  writeFileSync(rule,readFileSync(rule,'utf8').replace('For every task','For some tasks'));
  const result=spawnSync(process.execPath,[doctor,'--target','codex','--home',home],{encoding:'utf8'});
  const [report]=JSON.parse(result.stdout);
  assert.equal(report.globalRule,false);
  assert.notEqual(result.status,0);
});

test('doctor detects modified files in a managed pinned capability', () => {
  const home=installRouterOnly('doctor-hash-');
  const destination=join(home,'.codex','skills','test-driven-development');
  mkdirSync(destination,{recursive:true});
  const skillFile=join(destination,'SKILL.md');
  const original='---\nname: test-driven-development\ndescription: Test fixture\n---\n\nOriginal.\n';
  writeFileSync(skillFile,original);
  const source=JSON.parse(readFileSync(join(process.cwd(),'registry','skills.json'),'utf8')).find(item=>item.id==='test-driven-development').source;
  writeFileSync(join(destination,'BUNDLE_SOURCE.json'),JSON.stringify({
    id:'test-driven-development',
    commit:source.commit,
    files:[{path:'SKILL.md',sha256:createHash('sha256').update(original).digest('hex')}]
  }));
  writeFileSync(skillFile,original.replace('Original.','Modified.'));
  const result=spawnSync(process.execPath,[doctor,'--target','codex','--home',home],{encoding:'utf8'});
  const [report]=JSON.parse(result.stdout);
  assert.equal(report.capabilities.find(item=>item.id==='test-driven-development').status,'managed-modified');
});

test('doctor detects files added outside a managed capability manifest', () => {
  const home=installRouterOnly('doctor-extra-file-');
  const destination=join(home,'.codex','skills','test-driven-development');
  mkdirSync(destination,{recursive:true});
  const skillFile=join(destination,'SKILL.md');
  const original='---\nname: test-driven-development\ndescription: Test fixture\n---\n\nOriginal.\n';
  writeFileSync(skillFile,original);
  const source=JSON.parse(readFileSync(join(process.cwd(),'registry','skills.json'),'utf8')).find(item=>item.id==='test-driven-development').source;
  writeFileSync(join(destination,'BUNDLE_SOURCE.json'),JSON.stringify({
    id:'test-driven-development',
    commit:source.commit,
    files:[{path:'SKILL.md',sha256:createHash('sha256').update(original).digest('hex')}]
  }));
  writeFileSync(join(destination,'UNTRACKED.md'),'unexpected');
  const result=spawnSync(process.execPath,[doctor,'--target','codex','--home',home],{encoding:'utf8'});
  const [report]=JSON.parse(result.stdout);
  assert.equal(report.capabilities.find(item=>item.id==='test-driven-development').status,'managed-modified');
});

test('doctor rejects duplicate managed global rule blocks', () => {
  const home=installRouterOnly('doctor-duplicate-rule-');
  const rule=join(home,'.codex','AGENTS.md');
  const body=readFileSync(rule,'utf8');
  writeFileSync(rule,`${body}\n${body}`);
  const result=spawnSync(process.execPath,[doctor,'--target','codex','--home',home],{encoding:'utf8'});
  const [report]=JSON.parse(result.stdout);
  assert.equal(report.globalRule,false);
  assert.notEqual(result.status,0);
});

test('doctor detects a modified managed router', () => {
  const home=installRouterOnly('doctor-router-hash-');
  const skillFile=join(home,'.codex','skills','development-skill-router','SKILL.md');
  writeFileSync(skillFile,`${readFileSync(skillFile,'utf8')}\nmodified\n`);
  const result=spawnSync(process.execPath,[doctor,'--target','codex','--home',home],{encoding:'utf8'});
  const [report]=JSON.parse(result.stdout);
  assert.equal(report.router,true);
  assert.equal(report.routerStatus,'managed-modified');
  assert.equal(report.ready,false);
  assert.notEqual(result.status,0);
});

function installRouterOnly(prefix){
  const home=mkdtempSync(join(tmpdir(),prefix));
  const result=spawnSync(process.execPath,[installer,'--target','all','--home',home,'--router-only'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  return home;
}
