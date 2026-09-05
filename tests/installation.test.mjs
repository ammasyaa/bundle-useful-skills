import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const installer=join(process.cwd(),'scripts','install-global.mjs');

test('global installer creates self-contained Codex and Antigravity skills', () => {
  const home=mkdtempSync(join(tmpdir(),'skill-router-install-'));
  const result=spawnSync(process.execPath,[installer,'--target','all','--home',home],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const destinations=[
    join(home,'.codex','skills','development-skill-router'),
    join(home,'.gemini','config','skills','development-skill-router')
  ];
  for(const dest of destinations) {
    for(const file of ['SKILL.md','references/mobile.md','scripts/cli.mjs','src/router.mjs','registry/skills.json','profiles/index.json','LICENSE']) {
      assert.ok(existsSync(join(dest,file)),`${file} missing from ${dest}`);
    }
    const route=spawnSync(process.execPath,[join(dest,'scripts','cli.mjs'),'route','--platform','mobile','--framework','flutter','--task','implementation'],{cwd:dest,encoding:'utf8'});
    assert.equal(route.status,0,route.stderr);
    assert.ok(JSON.parse(route.stdout).active.includes('flutter-architecture'));
  }
});

test('global installer refuses to overwrite a different existing skill', () => {
  const home=mkdtempSync(join(tmpdir(),'skill-router-collision-'));
  let result=spawnSync(process.execPath,[installer,'--target','codex','--home',home],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const installed=join(home,'.codex','skills','development-skill-router','SKILL.md');
  writeFileSync(installed,readFileSync(installed,'utf8')+'\nlocal change\n');
  result=spawnSync(process.execPath,[installer,'--target','codex','--home',home],{encoding:'utf8'});
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/refusing to overwrite/i);
  assert.match(readFileSync(installed,'utf8'),/local change/);
});
