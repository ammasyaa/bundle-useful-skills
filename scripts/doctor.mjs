#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const packageInfo=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));
const registry=JSON.parse(readFileSync(join(root,'registry','skills.json'),'utf8'));
const invocations=JSON.parse(readFileSync(join(root,'registry','invocations.json'),'utf8')).skills;
const dependencyGroups=JSON.parse(readFileSync(join(root,'registry','dependencies.json'),'utf8')).groups;
const ruleTemplate=readFileSync(join(root,'rules','global-rule.md'),'utf8').trim();
const markerStart='<!-- bundle-useful-skills:begin -->';
const markerEnd='<!-- bundle-useful-skills:end -->';
const options=parse(process.argv.slice(2));
const userHome=resolve(options.home||homedir());
const codexRoot=options.home?join(userHome,'.codex'):resolve(process.env.CODEX_HOME||join(userHome,'.codex'));
const targets={
  codex:{skillRoot:join(codexRoot,'skills'),rulePath:codexRulePath(codexRoot)},
  antigravity:{skillRoot:join(userHome,'.gemini','config','skills'),rulePath:join(userHome,'.gemini','GEMINI.md')}
};
const selected=options.target==='all'?Object.entries(targets):[[options.target,targets[options.target]]];
const reports=selected.map(([name,target])=>inspectTarget(name,target));
console.log(JSON.stringify(reports,null,2));
if(reports.some(report=>!report.ready)) process.exitCode=1;

function inspectTarget(name,target){
  const rule=existsSync(target.rulePath)?readFileSync(target.rulePath,'utf8'):'';
  const capabilities=installableSkills().map(skill=>inspectCapability(target.skillRoot,skill));
  const statuses=['managed-pinned','present-existing','missing','managed-stale','managed-invalid','managed-unverified','managed-modified'];
  const counts=Object.fromEntries(statuses.map(status=>[status,capabilities.filter(capability=>capability.status===status).length]));
  const routerStatus=inspectRouter(target.skillRoot);
  const router=routerStatus!=='missing';
  const globalRule=managedRuleMatches(rule);
  return {
    target:name,
    ready:routerStatus==='managed-current'&&globalRule&&counts['managed-pinned']===capabilities.length,
    router,
    routerStatus,
    globalRule,
    rulePath:target.rulePath,
    counts,
    capabilities
  };
}

function inspectRouter(skillRoot){
  const path=join(skillRoot,'development-skill-router');
  if(!existsSync(join(path,'SKILL.md'))) return 'missing';
  const manifestPath=join(path,'.bundle-useful-skills-install.json');
  if(!existsSync(manifestPath)) return 'present-unverified';
  try {
    const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
    if(manifest.package!=='bundle-useful-skills') return 'managed-invalid';
    if(manifest.version!==packageInfo.version) return 'managed-stale';
    if(!Array.isArray(manifest.files)||!manifest.files.length) return 'managed-unverified';
    return verifyFiles(path,manifest.files,'.bundle-useful-skills-install.json')?'managed-current':'managed-modified';
  } catch { return 'managed-invalid'; }
}

function inspectCapability(skillRoot,skill){
  const invocation=invocationName(skill);
  const path=join(skillRoot,invocation);
  const base={id:skill.id,invocation};
  if(!existsSync(join(path,'SKILL.md'))) return {...base,status:'missing'};
  const manifestPath=join(path,'BUNDLE_SOURCE.json');
  if(!existsSync(manifestPath)) return {...base,status:'present-existing'};
  try {
    const source=JSON.parse(readFileSync(manifestPath,'utf8'));
    if(source.commit!==skill.source.commit) return {...base,status:'managed-stale'};
    if(!Array.isArray(source.files)||!source.files.length) return {...base,status:'managed-unverified'};
    if(!verifyFiles(path,source.files)) return {...base,status:'managed-modified'};
    return {...base,status:'managed-pinned'};
  } catch { return {...base,status:'managed-invalid'}; }
}

function managedRuleMatches(body){
  if(occurrences(body,markerStart)!==1||occurrences(body,markerEnd)!==1) return false;
  const start=body.indexOf(markerStart),end=body.indexOf(markerEnd,start+markerStart.length);
  if(start<0||end<start) return false;
  return body.slice(start,end+markerEnd.length).trim()===ruleTemplate;
}

function verifyFiles(root,files,manifestName='BUNDLE_SOURCE.json'){
  const actual=listFiles(root).filter(path=>path!==manifestName);
  const expected=files.map(file=>file?.path).sort();
  if(actual.length!==expected.length||actual.some((path,index)=>path!==expected[index])) return false;
  return files.every(file=>{
    if(!file||typeof file.path!=='string'||typeof file.sha256!=='string') return false;
    const path=resolve(root,file.path);
    const rel=relative(resolve(root),path);
    if(!rel||rel.startsWith('..')||rel.includes(':')||!existsSync(path)) return false;
    return createHash('sha256').update(readFileSync(path)).digest('hex')===file.sha256;
  });
}

function occurrences(body,needle){return body.split(needle).length-1}
function listFiles(root,prefix=''){
  const out=[];
  for(const name of readdirSync(join(root,prefix)).sort()){
    const rel=prefix?join(prefix,name):name;
    if(statSync(join(root,rel)).isDirectory()) out.push(...listFiles(root,rel));
    else out.push(rel.replaceAll('\\','/'));
  }
  return out;
}

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
  const primary=registry.filter(skill=>skill.installMode.startsWith('upstream'));
  const expanded=[...primary];
  for(const [parentId,names] of Object.entries(dependencyGroups)){
    const parent=registry.find(skill=>skill.id===parentId);
    for(const name of names){
      if(Object.values(invocations).includes(name)) continue;
      expanded.push({...parent,id:`${parentId}/${name}`,invocation:name,source:{...parent.source,path:`plugins/expo/skills/${name}/SKILL.md`}});
    }
  }
  return expanded;
}

function invocationName(skill){return skill.invocation??invocations[skill.id]}
