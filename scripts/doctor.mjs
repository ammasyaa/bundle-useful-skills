#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const registry=JSON.parse(readFileSync(join(root,'registry','skills.json'),'utf8'));
const invocations=JSON.parse(readFileSync(join(root,'registry','invocations.json'),'utf8')).skills;
const dependencyGroups=JSON.parse(readFileSync(join(root,'registry','dependencies.json'),'utf8')).groups;
const options=parse(process.argv.slice(2));
const userHome=resolve(options.home||homedir());
const codexRoot=options.home?join(userHome,'.codex'):resolve(process.env.CODEX_HOME||join(userHome,'.codex'));
const targets={
  codex:{skillRoot:join(codexRoot,'skills'),rulePath:codexRulePath(codexRoot)},
  antigravity:{skillRoot:join(userHome,'.gemini','config','skills'),rulePath:join(userHome,'.gemini','GEMINI.md')}
};
const selected=options.target==='all'?Object.entries(targets):[[options.target,targets[options.target]]];
let failed=false;
for(const [name,target] of selected){
  const rule=existsSync(target.rulePath)?readFileSync(target.rulePath,'utf8'):'';
  const capabilities=installableSkills().map(skill=>{
    const path=join(target.skillRoot,invocationName(skill));
    if(!existsSync(join(path,'SKILL.md'))) return {id:skill.id,invocation:invocationName(skill),status:'missing'};
    const manifest=join(path,'BUNDLE_SOURCE.json');
    if(!existsSync(manifest)) return {id:skill.id,invocation:invocationName(skill),status:'present-existing'};
    try {
      const source=JSON.parse(readFileSync(manifest,'utf8'));
      return {id:skill.id,invocation:invocationName(skill),status:source.commit===skill.source.commit?'managed-pinned':'managed-stale'};
    } catch { return {id:skill.id,invocation:invocationName(skill),status:'managed-invalid'}; }
  });
  const result={
    target:name,
    router:existsSync(join(target.skillRoot,'development-skill-router','SKILL.md')),
    globalRule:rule.includes('<!-- bundle-useful-skills:begin -->')&&rule.includes('<!-- bundle-useful-skills:end -->'),
    rulePath:target.rulePath,
    counts:Object.fromEntries(['managed-pinned','present-existing','missing','managed-stale','managed-invalid'].map(status=>[status,capabilities.filter(c=>c.status===status).length])),
    capabilities
  };
  if(!result.router||!result.globalRule||result.counts.missing||result.counts['managed-stale']||result.counts['managed-invalid']) failed=true;
  console.log(JSON.stringify(result,null,2));
}
if(failed) process.exitCode=1;

function parse(values){
  const out={target:'all',home:null};
  for(let i=0;i<values.length;i++){
    if(values[i]==='--target'||values[i]==='--home'){
      const key=values[i].slice(2);
      const value=values[++i];
      if(!value||value.startsWith('--')) throw new Error(`${values[i-1]} needs a value`);
      out[key]=value;
    } else throw new Error(`Unknown argument: ${values[i]}`);
  }
  if(!['all','codex','antigravity'].includes(out.target)) throw new Error('--target must be codex, antigravity, or all');
  return out;
}

function codexRulePath(path){
  const override=join(path,'AGENTS.override.md');
  return existsSync(override)&&readFileSync(override,'utf8').trim()?override:join(path,'AGENTS.md');
}

function installableSkills(){
  const primary=registry.filter(s=>s.installMode.startsWith('upstream'));
  const expanded=[...primary];
  for(const [parentId,names] of Object.entries(dependencyGroups)){
    const parent=registry.find(s=>s.id===parentId);
    for(const name of names){
      if(Object.values(invocations).includes(name)) continue;
      const skill={...parent,id:`${parentId}/${name}`,invocation:name,source:{...parent.source,path:`plugins/expo/skills/${name}/SKILL.md`}};
      expanded.push(skill);
    }
  }
  return expanded;
}

function invocationName(skill){return skill.invocation??invocations[skill.id]}
