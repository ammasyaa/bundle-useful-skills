import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { scanProject } from '../src/project-scanner.mjs';
import { classifyProject } from '../src/project-classifier.mjs';
import { searchProject, formatSearchReport } from '../src/search.mjs';

const cli=join(process.cwd(),'scripts','cli.mjs');

function project(t,prefix='bundle-search-') {
  const root=mkdtempSync(join(tmpdir(),prefix));
  t.after(()=>rmSync(root,{recursive:true,force:true}));
  return root;
}

function packageFile(root,dependencies) {
  writeFileSync(join(root,'package.json'),JSON.stringify({name:'fixture',dependencies}));
}

test('scanner extracts high-signal metadata without secret values or dependency trees',t=>{
  const root=project(t);
  packageFile(root,{next:'15',react:'19'});
  writeFileSync(join(root,'.env'),'SEARCH_SENTINEL_SECRET=never-return-this');
  mkdirSync(join(root,'node_modules','hidden'),{recursive:true});
  writeFileSync(join(root,'node_modules','hidden','package.json'),'SEARCH_SENTINEL_SECRET');
  writeFileSync(join(root,'AGENTS.md'),'Repository guidance');
  const evidence=scanProject(root);
  const serialized=JSON.stringify(evidence);
  assert.ok(evidence.files.includes('package.json'));
  assert.ok(evidence.instructions.includes('AGENTS.md'));
  assert.ok(evidence.excluded.some(item=>item.path==='.env'));
  assert.doesNotMatch(serialized,/SEARCH_SENTINEL_SECRET/);
  assert.doesNotMatch(serialized,/node_modules\/hidden/);
});

test('classifier gives desktop shells authority over React renderer evidence',()=>{
  const result=classifyProject({signals:[
    {type:'dependency',value:'react',path:'package.json'},
    {type:'dependency',value:'@tauri-apps/api',path:'package.json'},
    {type:'file',value:'src-tauri/tauri.conf.json',path:'src-tauri/tauri.conf.json'}
  ]});
  assert.equal(result.needsInput,false);
  assert.equal(result.candidates[0].platform,'desktop');
  assert.equal(result.candidates[0].framework,'tauri');
  assert.equal(result.candidates[0].renderer,'react');
});

test('classifier detects website and mobile framework lanes',()=>{
  const next=classifyProject({signals:[{type:'dependency',value:'next',path:'package.json'}]});
  assert.deepEqual([next.candidates[0].platform,next.candidates[0].framework],['website','next']);
  const expo=classifyProject({signals:[{type:'dependency',value:'expo',path:'package.json'}]});
  assert.deepEqual([expo.candidates[0].platform,expo.candidates[0].framework],['mobile','expo']);
});

test('classifier refuses mixed website and mobile evidence',()=>{
  const result=classifyProject({signals:[
    {type:'dependency',value:'next',path:'apps/web/package.json'},
    {type:'dependency',value:'expo',path:'apps/mobile/package.json'}
  ]});
  assert.equal(result.needsInput,true);
  assert.equal(result.candidates.length,2);
});

test('classifier requires a choice for multi-target Flutter evidence',()=>{
  const result=classifyProject({signals:[
    {type:'manifest',value:'flutter',path:'pubspec.yaml'},
    {type:'directory',value:'ios',path:'ios'},
    {type:'directory',value:'android',path:'android'}
  ]});
  assert.equal(result.needsInput,true);
  assert.match(result.unknowns.join('\n'),/Flutter target/i);
});

test('search composes evidence, classification, routing, and rejection reasons',t=>{
  const root=project(t);
  packageFile(root,{next:'15',react:'19'});
  const result=searchProject({root,task:'implementation',description:'Add OAuth provider'});
  assert.equal(result.needsInput,false);
  assert.equal(result.route.framework,'next');
  assert.ok(result.route.active.includes('security-gate'));
  assert.ok(result.selected.some(item=>item.invocation==='vercel-react-best-practices'));
  assert.ok(result.rejected.some(item=>item.reason));
  assert.match(formatSearchReport(result),/Project evidence:/);
  assert.match(formatSearchReport(result),/Skills considered but not used:/);
});

test('search CLI supports human and JSON reports',t=>{
  const root=project(t);
  packageFile(root,{next:'15',react:'19'});
  const json=spawnSync(process.execPath,[cli,'search','--root',root,'--task','implementation','--json'],{encoding:'utf8'});
  assert.equal(json.status,0,json.stderr);
  assert.equal(JSON.parse(json.stdout).route.framework,'next');
  const human=spawnSync(process.execPath,[cli,'search','--root',root,'--task','implementation'],{encoding:'utf8'});
  assert.equal(human.status,0,human.stderr);
  assert.match(human.stdout,/Skill bundle report/);
});
