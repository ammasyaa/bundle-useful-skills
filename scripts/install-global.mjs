#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const packageInfo=JSON.parse(readFileSync(join(projectRoot,'package.json'),'utf8'));
const registry=JSON.parse(readFileSync(join(projectRoot,'registry','skills.json'),'utf8'));
const invocations=JSON.parse(readFileSync(join(projectRoot,'registry','invocations.json'),'utf8')).skills;
const dependencyGroups=JSON.parse(readFileSync(join(projectRoot,'registry','dependencies.json'),'utf8')).groups;
const ruleTemplate=readFileSync(join(projectRoot,'rules','global-rule.md'),'utf8').trim();
const markerStart='<!-- bundle-useful-skills:begin -->';
const markerEnd='<!-- bundle-useful-skills:end -->';
const manifestName='.bundle-useful-skills-install.json';
const sourceManifestName='BUNDLE_SOURCE.json';
const payload=[
  ['router/SKILL.md','SKILL.md'],
  ['router/references','references'],
  ['rules/global-rule.md','rules/global-rule.md'],
  ['scripts/cli.mjs','scripts/cli.mjs'],
  ['scripts/doctor.mjs','scripts/doctor.mjs'],
  ['src','src'],
  ['registry','registry'],
  ['profiles','profiles'],
  ['skills','skills'],
  ['LICENSE','LICENSE']
];

main();

function main(){
  let workRoot;
  try {
    const options=parse(process.argv.slice(2));
    const userHome=resolve(options.home||homedir());
    const codexRoot=options.home?join(userHome,'.codex'):resolve(process.env.CODEX_HOME||join(userHome,'.codex'));
    const targets={
      codex:{skillRoot:join(codexRoot,'skills'),rulePath:codexRulePath(codexRoot)},
      antigravity:{skillRoot:join(userHome,'.gemini','config','skills'),rulePath:join(userHome,'.gemini','GEMINI.md')}
    };
    const selected=options.target==='all'?Object.entries(targets):[[options.target,targets[options.target]]];
    for(const [name,target] of selected) {
      target.routerDestination=join(target.skillRoot,'development-skill-router');
      target.routerAction=routerAction(name,target.routerDestination,options.adoptLegacy);
      validateRuleFile(target.rulePath);
    }
    const upstream=options.routerOnly?[]:installableSkills();
    for(const [,target] of selected) for(const skill of upstream) validateCapabilityDestination(join(target.skillRoot,invocationName(skill)),skill);
    const missing=upstream.filter(skill=>selected.some(([,target])=>!existsSync(join(target.skillRoot,invocationName(skill)))));
    if(options.dryRun) {
      for(const [name,target] of selected) {
        console.log(`${name}: ${target.routerAction} router at ${target.routerDestination}`);
        console.log(`${name}: would enforce global rule at ${target.rulePath}`);
        if(!options.routerOnly) console.log(`${name}: would ensure ${upstream.length} pinned upstream skills (${upstream.filter(s=>!existsSync(join(target.skillRoot,invocationName(s)))).length} missing)`);
      }
      return;
    }
    if(missing.length) {
      workRoot=mkdtempSync(join(tmpdir(),'bundle-useful-skills-'));
      prepareCapabilities(missing,workRoot);
    }
    for(const [name,target] of selected) {
      if(target.routerAction==='keep') console.log(`${name}: router already current at ${target.routerDestination}`);
      else {
        installRouter(target.routerDestination);
        console.log(`${name}: ${target.routerAction==='upgrade'?'upgraded':'installed'} router at ${target.routerDestination}`);
      }
      upsertManagedRule(target.rulePath);
      console.log(`${name}: enforced global routing rule at ${target.rulePath}`);
      if(!options.routerOnly) installCapabilities(name,target.skillRoot,upstream,workRoot);
    }
  } catch(error) {
    console.error(`skill-router installer: ${error.message}`);
    process.exitCode=1;
  } finally {
    if(workRoot) safeRemove(workRoot,dirname(workRoot));
  }
}

function parse(values){
  const out={target:'all',home:null,dryRun:false,routerOnly:false,adoptLegacy:false};
  for(let i=0;i<values.length;i++){
    if(values[i]==='--dry-run'){out.dryRun=true;continue}
    if(values[i]==='--router-only'){out.routerOnly=true;continue}
    if(values[i]==='--adopt-legacy'){out.adoptLegacy=true;continue}
    if(values[i]==='--target'||values[i]==='--home'){
      const key=values[i].slice(2).replace('-','');
      const value=values[++i];
      if(!value||value.startsWith('--')) throw new Error(`${values[i-1]} needs a value`);
      out[key]=value;continue;
    }
    throw new Error(`Unknown argument: ${values[i]}`);
  }
  if(!['all','codex','antigravity'].includes(out.target)) throw new Error('--target must be codex, antigravity, or all');
  return out;
}

function codexRulePath(codexRoot){
  const override=join(codexRoot,'AGENTS.override.md');
  return existsSync(override)&&readFileSync(override,'utf8').trim()?override:join(codexRoot,'AGENTS.md');
}

function routerAction(name,destination,adoptLegacy){
  if(!existsSync(destination)) return 'install';
  if(isCurrent(destination)) return 'keep';
  if(isManagedClean(destination)) return 'upgrade';
  if(adoptLegacy&&looksLikeLegacyRouter(destination)) return 'upgrade';
  throw new Error(`refusing to overwrite a different or modified existing ${name} skill at ${destination}${looksLikeLegacyRouter(destination)?'; rerun with --adopt-legacy after reviewing it':''}`);
}

function isCurrent(destination){
  if(!existsSync(destination)) return false;
  return payload.every(([source,relativeDestination])=>same(join(projectRoot,source),join(destination,relativeDestination)));
}

function looksLikeLegacyRouter(destination){
  const skill=join(destination,'SKILL.md');
  return existsSync(skill)&&/^name:\s*development-skill-router\s*$/m.test(readFileSync(skill,'utf8'))&&existsSync(join(destination,'src','router.mjs'))&&existsSync(join(destination,'registry','skills.json'));
}

function isManagedClean(destination){
  const path=join(destination,manifestName);
  if(!existsSync(path)) return false;
  try {
    const manifest=JSON.parse(readFileSync(path,'utf8'));
    if(manifest.package!=='bundle-useful-skills'||!Array.isArray(manifest.files)) return false;
    const actual=listFiles(destination).filter(p=>p!==manifestName);
    if(actual.length!==manifest.files.length) return false;
    return manifest.files.every(file=>actual.includes(file.path)&&hashFile(join(destination,file.path))===file.sha256);
  } catch { return false; }
}

function same(from,to){
  if(!existsSync(to)||statSync(from).isDirectory()!==statSync(to).isDirectory()) return false;
  if(statSync(from).isFile()) return readFileSync(from).equals(readFileSync(to));
  const left=readdirSync(from).sort(),right=readdirSync(to).filter(name=>name!==manifestName).sort();
  return left.length===right.length&&left.every((name,index)=>name===right[index]&&same(join(from,name),join(to,name)));
}

function installRouter(destination){
  const parent=dirname(destination);
  mkdirSync(parent,{recursive:true});
  const temp=mkdtempSync(join(parent,'.development-skill-router-'));
  try {
    for(const [source,relativeDestination] of payload){
      const from=join(projectRoot,source),to=join(temp,relativeDestination);
      mkdirSync(dirname(to),{recursive:true});
      statSync(from).isDirectory()?cpSync(from,to,{recursive:true}):copyFileSync(from,to);
    }
    const files=listFiles(temp).map(path=>({path,sha256:hashFile(join(temp,path))}));
    writeFileSync(join(temp,manifestName),JSON.stringify({package:'bundle-useful-skills',version:packageInfo.version,files},null,2)+'\n');
    replaceDirectory(temp,destination);
  } catch(error) {
    if(existsSync(temp)) safeRemove(temp,parent);
    throw error;
  }
}

function prepareCapabilities(skills,workRoot){
  const groups=new Map();
  for(const skill of skills){
    const key=`${skill.source.repository}@${skill.source.commit}`;
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(skill);
  }
  let index=0;
  for(const grouped of groups.values()){
    const checkout=join(workRoot,`repo-${index++}`);
    mkdirSync(checkout,{recursive:true});
    runGit(['init',checkout]);
    runGit(['-C',checkout,'remote','add','origin',grouped[0].source.repository]);
    runGit(['-C',checkout,'config','core.sparseCheckout','true']);
    const patterns=new Set();
    for(const skill of grouped) {
      patterns.add(`/${sourceDirectory(skill.source.path)}/`);
      for(const evidence of [skill.licenseEvidence,skill.notice]) if(isRepositoryPath(evidence)) patterns.add(`/${evidence}`);
    }
    mkdirSync(join(checkout,'.git','info'),{recursive:true});
    writeFileSync(join(checkout,'.git','info','sparse-checkout'),[...patterns].join('\n')+'\n');
    runGit(['-C',checkout,'fetch','--depth','1','origin',grouped[0].source.commit]);
    runGit(['-C',checkout,'checkout','--detach','FETCH_HEAD']);
    for(const skill of grouped) stageCapability(skill,checkout,workRoot);
  }
}

function stageCapability(skill,checkout,workRoot){
  const from=join(checkout,...sourceDirectory(skill.source.path).split('/'));
  if(!existsSync(join(from,'SKILL.md'))) throw new Error(`pinned skill path missing for ${skill.id}`);
  const destination=join(workRoot,'capabilities',invocationName(skill));
  cpSync(from,destination,{recursive:true});
  const skillFile=join(destination,'SKILL.md');
  const upstreamBody=readFileSync(skillFile,'utf8');
  const upstreamVersion=upstreamBody.match(/^version:\s*([^\r\n]+)$/m)?.[1]?.trim()??null;
  writeFileSync(skillFile,normalizeFrontmatter(upstreamBody));
  const sourceUrl=`${skill.source.repository}/tree/${skill.source.commit}/${sourceDirectory(skill.source.path)}`;
  const attribution=[`# ${skill.name}`,'',`Installed by Bundle Useful Skills. Thank you to **${skill.author}** for the original work.`,'',`- Original source: ${sourceUrl}`,`- Reviewed commit: \`${skill.source.commit}\``,`- License: ${skill.license}`,'','The upstream files remain under their original license. This attribution file was added by the bundle installer.',''].join('\n');
  writeFileSync(join(destination,'BUNDLE_README.md'),attribution);
  writeFileSync(join(destination,sourceManifestName),JSON.stringify({id:skill.id,invocation:invocationName(skill),author:skill.author,repository:skill.source.repository,commit:skill.source.commit,path:skill.source.path,license:skill.license,upstreamVersion},null,2)+'\n');
  for(const [evidence,label] of [[skill.licenseEvidence,'BUNDLE_UPSTREAM_LICENSE'],[skill.notice,'BUNDLE_UPSTREAM_NOTICE']]) {
    if(!isRepositoryPath(evidence)) continue;
    const source=join(checkout,...evidence.split('/'));
    if(existsSync(source)&&statSync(source).isFile()) copyFileSync(source,join(destination,`${label}${extensionFor(evidence)}`));
  }
}

function installCapabilities(name,skillRoot,skills,workRoot){
  let installed=0,kept=0;
  for(const skill of skills){
    const destination=join(skillRoot,invocationName(skill));
    if(existsSync(destination)) {
      kept++; continue;
    }
    const staged=join(workRoot,'capabilities',invocationName(skill));
    if(!existsSync(staged)) throw new Error(`staged capability missing for ${skill.id}`);
    mkdirSync(skillRoot,{recursive:true});
    const temp=join(skillRoot,`.bundle-capability-${invocationName(skill)}-${Date.now()}`);
    try { cpSync(staged,temp,{recursive:true}); renameSync(temp,destination); }
    catch(error) { if(existsSync(temp)) safeRemove(temp,skillRoot); throw error; }
    installed++;
  }
  console.log(`${name}: capability inventory ready (${installed} installed, ${kept} already present, ${skills.length} total)`);
}

function validateCapabilityDestination(destination,skill){
  if(!existsSync(destination)) return;
  const skillFile=join(destination,'SKILL.md');
  if(!existsSync(skillFile)||frontmatterName(readFileSync(skillFile,'utf8'))!==invocationName(skill)) throw new Error(`existing skill collision at ${destination}`);
}

function validateRuleFile(path){
  if(!existsSync(path)) return;
  const body=readFileSync(path,'utf8');
  if(body.includes(markerStart)!==body.includes(markerEnd)) throw new Error(`incomplete managed rule markers in ${path}`);
}

function upsertManagedRule(path){
  mkdirSync(dirname(path),{recursive:true});
  const old=existsSync(path)?readFileSync(path,'utf8'):'';
  const start=old.indexOf(markerStart),end=old.indexOf(markerEnd);
  let next;
  if(start>=0&&end>=start) next=`${old.slice(0,start)}${ruleTemplate}${old.slice(end+markerEnd.length)}`;
  else next=old.trim()?`${old.trimEnd()}\n\n${ruleTemplate}\n`:`${ruleTemplate}\n`;
  if(next===old) return;
  const temp=`${path}.bundle-useful-skills.tmp`;
  writeFileSync(temp,next);
  renameSync(temp,path);
}

function replaceDirectory(temp,destination){
  if(!existsSync(destination)){renameSync(temp,destination);return}
  const parent=dirname(destination),backup=join(parent,`.development-skill-router-backup-${Date.now()}`);
  renameSync(destination,backup);
  try { renameSync(temp,destination); safeRemove(backup,parent); }
  catch(error) { if(existsSync(destination)) safeRemove(destination,parent); renameSync(backup,destination); throw error; }
}

function runGit(args){
  const result=spawnSync('git',args,{encoding:'utf8'});
  if(result.status!==0) throw new Error(`git ${args[0]} failed: ${(result.stderr||result.stdout).trim()}`);
}

function sourceDirectory(path){return path.replace(/\/SKILL\.md$/,'')}
function frontmatterName(body){return body.match(/^name:\s*["']?([^\r\n"']+)/m)?.[1]?.trim()}
function invocationName(skill){return skill.invocation??invocations[skill.id]}
function normalizeFrontmatter(body){
  const end=body.indexOf('\n---',4);
  if(!body.startsWith('---')||end<0) return body;
  return `${body.slice(0,end).replace(/^version:\s*[^\r\n]+\r?\n?/m,'')}${body.slice(end)}`;
}
function installableSkills(){
  const primary=registry.filter(s=>s.installMode.startsWith('upstream'));
  const expanded=[...primary];
  for(const [parentId,names] of Object.entries(dependencyGroups)){
    const parent=registry.find(s=>s.id===parentId);
    if(!parent) throw new Error(`unknown dependency group parent ${parentId}`);
    for(const name of names){
      if(Object.values(invocations).includes(name)) continue;
      const skill={...parent,id:`${parentId}/${name}`,name:`Expo skill: ${name}`,invocation:name,source:{...parent.source,path:`plugins/expo/skills/${name}/SKILL.md`}};
      expanded.push(skill);
    }
  }
  return expanded;
}
function isRepositoryPath(value){return typeof value==='string'&&/^[A-Za-z0-9._/-]+$/.test(value)&&!value.includes('..')}
function extensionFor(path){const name=basename(path);const dot=name.lastIndexOf('.');return dot>=0?name.slice(dot):'.txt'}
function hashFile(path){return createHash('sha256').update(readFileSync(path)).digest('hex')}
function listFiles(root,prefix=''){
  const out=[];
  for(const name of readdirSync(join(root,prefix)).sort()){
    const rel=prefix?join(prefix,name):name;
    if(statSync(join(root,rel)).isDirectory()) out.push(...listFiles(root,rel)); else out.push(rel.replaceAll('\\','/'));
  }
  return out;
}
function safeRemove(path,parent){
  const rel=relative(resolve(parent),resolve(path));
  if(!rel||rel.startsWith('..')||rel.includes(':')) throw new Error(`refusing to remove unsafe path ${path}`);
  rmSync(path,{recursive:true,force:true});
}
