import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const installer=join(process.cwd(),'scripts','install-global.mjs');

test('global installer creates self-contained Codex and Antigravity skills', () => {
  const home=mkdtempSync(join(tmpdir(),'skill-router-install-'));
  const result=spawnSync(process.execPath,[installer,'--target','all','--home',home,'--router-only'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const destinations=[
    join(home,'.codex','skills','development-skill-router'),
    join(home,'.gemini','config','skills','development-skill-router')
  ];
  for(const dest of destinations) {
    for(const file of ['SKILL.md','references/mobile.md','scripts/cli.mjs','src/router.mjs','registry/skills.json','profiles/index.json','LICENSE']) {
      assert.ok(existsSync(join(dest,file)),`${file} missing from ${dest}`);
    }
    assert.ok(existsSync(join(dest,'.bundle-useful-skills-install.json')));
    const route=spawnSync(process.execPath,[join(dest,'scripts','cli.mjs'),'report','--platform','mobile','--framework','flutter','--task','implementation','--target','ios'],{cwd:dest,encoding:'utf8'});
    assert.equal(route.status,0,route.stderr);
    assert.match(route.stdout,/flutter-apply-architecture-best-practices/);
  }
  assert.match(readFileSync(join(home,'.codex','AGENTS.md'),'utf8'),/For every task/);
  assert.match(readFileSync(join(home,'.gemini','GEMINI.md'),'utf8'),/Skill bundle used/);
});

test('global installer refuses to overwrite a different existing skill', () => {
  const home=mkdtempSync(join(tmpdir(),'skill-router-collision-'));
  let result=spawnSync(process.execPath,[installer,'--target','codex','--home',home,'--router-only'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const installed=join(home,'.codex','skills','development-skill-router','SKILL.md');
  writeFileSync(installed,readFileSync(installed,'utf8')+'\nlocal change\n');
  result=spawnSync(process.execPath,[installer,'--target','codex','--home',home,'--router-only'],{encoding:'utf8'});
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/refusing to overwrite/i);
  assert.match(readFileSync(installed,'utf8'),/local change/);
});

test('global installer preserves existing host rules and updates its managed block idempotently', () => {
  const home=mkdtempSync(join(tmpdir(),'skill-router-rules-'));
  mkdirSync(join(home,'.codex'),{recursive:true});
  mkdirSync(join(home,'.gemini'),{recursive:true});
  writeFileSync(join(home,'.codex','AGENTS.md'),'# My Codex rule\n\nKeep this.\n');
  writeFileSync(join(home,'.gemini','GEMINI.md'),'# My Antigravity rule\n\nKeep this too.\n');
  for(let run=0;run<2;run++) {
    const result=spawnSync(process.execPath,[installer,'--target','all','--home',home,'--router-only'],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
  }
  for(const path of [join(home,'.codex','AGENTS.md'),join(home,'.gemini','GEMINI.md')]) {
    const body=readFileSync(path,'utf8');
    assert.match(body,/^# My /);
    assert.equal(body.match(/bundle-useful-skills:begin/g)?.length,1);
    assert.equal(body.match(/bundle-useful-skills:end/g)?.length,1);
  }
});

test('global installer can plan replacement of a valid pre-existing capability', () => {
  const home=mkdtempSync(join(tmpdir(),'skill-router-replace-'));
  const existing=join(home,'.codex','skills','test-driven-development');
  mkdirSync(existing,{recursive:true});
  writeFileSync(join(existing,'SKILL.md'),'---\nname: test-driven-development\ndescription: Existing fixture\n---\n');
  const result=spawnSync(process.execPath,[installer,'--target','codex','--home',home,'--dry-run','--replace-existing'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  assert.match(result.stdout,/47 install, 1 replace, 0 adopt, 0 keep/);
});

test('global installer rejects duplicate managed rule markers', () => {
  const home=mkdtempSync(join(tmpdir(),'skill-router-duplicate-rule-'));
  mkdirSync(join(home,'.codex'),{recursive:true});
  writeFileSync(join(home,'.codex','AGENTS.md'),'<!-- bundle-useful-skills:begin -->\none\n<!-- bundle-useful-skills:end -->\n<!-- bundle-useful-skills:begin -->\ntwo\n<!-- bundle-useful-skills:end -->\n');
  const result=spawnSync(process.execPath,[installer,'--target','codex','--home',home,'--router-only'],{encoding:'utf8'});
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/duplicate managed rule markers/i);
});

test('global installer refreshes a stale router manifest version', () => {
  const home=mkdtempSync(join(tmpdir(),'skill-router-stale-version-'));
  let result=spawnSync(process.execPath,[installer,'--target','codex','--home',home,'--router-only'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const manifestPath=join(home,'.codex','skills','development-skill-router','.bundle-useful-skills-install.json');
  const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
  manifest.version='0.0.0';
  writeFileSync(manifestPath,JSON.stringify(manifest,null,2));
  result=spawnSync(process.execPath,[installer,'--target','codex','--home',home,'--router-only'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  assert.match(result.stdout,/upgraded router/);
  const expected=JSON.parse(readFileSync(join(process.cwd(),'package.json'),'utf8')).version;
  assert.equal(JSON.parse(readFileSync(manifestPath,'utf8')).version,expected);
});

test('global installer refreshes an incomplete router manifest inventory', () => {
  const home=mkdtempSync(join(tmpdir(),'skill-router-bad-inventory-'));
  let result=spawnSync(process.execPath,[installer,'--target','codex','--home',home,'--router-only'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const manifestPath=join(home,'.codex','skills','development-skill-router','.bundle-useful-skills-install.json');
  const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
  manifest.files=manifest.files.map(()=>manifest.files[0]);
  writeFileSync(manifestPath,JSON.stringify(manifest,null,2));
  result=spawnSync(process.execPath,[installer,'--target','codex','--home',home,'--router-only'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  assert.match(result.stdout,/upgraded router/);
});
