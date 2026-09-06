#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { copyFileSync, cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyExplicitInvocationPolicy } from '../src/openai-policy.mjs';
import { assertRegularFileInside, listSafeFiles, resolveInside } from '../src/safe-tree.mjs';
import { requiredSkillNames, validateDependencyDocument } from '../src/dependencies.mjs';
import { classifyEvidence, validateEvidenceMetadata } from '../src/evidence.mjs';
import { validateRegistryData } from '../src/registry-validation.mjs';

const projectRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const packageInfo=JSON.parse(readFileSync(join(projectRoot,'package.json'),'utf8'));
const registry=JSON.parse(readFileSync(join(projectRoot,'registry','skills.json'),'utf8'));
const invocations=JSON.parse(readFileSync(join(projectRoot,'registry','invocations.json'),'utf8')).skills;
const profiles=JSON.parse(readFileSync(join(projectRoot,'profiles','index.json'),'utf8'));
const dependencyDocument=JSON.parse(readFileSync(join(projectRoot,'registry','dependencies.json'),'utf8'));
const dependencyGroups=dependencyDocument.groups;
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
  ['LICENSE','LICENSE']
];

main();

function main(){
  let workRoot;
  try {
    validateRegistryData(registry,profiles);
    validateDependencyDocument(dependencyDocument,registry);
    const options=parse(process.argv.slice(2));
    const runId=new Date().toISOString().replace(/[:.]/g,'-');
    const userHome=resolve(options.home||homedir());
    const codexRoot=options.home?join(userHome,'.codex'):resolve(process.env.CODEX_HOME||join(userHome,'.codex'));
    const targets={
      codex:{skillRoot:join(codexRoot,'skills'),rulePath:codexRulePath(codexRoot),backupRoot:join(codexRoot,'bundle-useful-skills-backups',runId)},
      antigravity:{skillRoot:join(userHome,'.gemini','config','skills'),rulePath:join(userHome,'.gemini','GEMINI.md'),backupRoot:join(userHome,'.gemini','bundle-useful-skills-backups',runId)}
    };
    const selected=options.target==='all'?Object.entries(targets):[[options.target,targets[options.target]]];
    for(const [name,target] of selected) {
      target.routerDestination=join(target.skillRoot,'development-skill-router');
      target.routerAction=routerAction(name,target.routerDestination,options.adoptLegacy);
      validateRuleFile(target.rulePath);
    }
    const upstream=options.routerOnly?[]:installableSkills();
    for(const [,target] of selected) target.capabilityPlans=upstream.map(skill=>({skill,action:capabilityAction(target.skillRoot,skill,options)}));
    const staged=upstream.filter(skill=>selected.some(([,target])=>['install','replace'].includes(target.capabilityPlans.find(plan=>plan.skill.id===skill.id).action)));
    if(options.dryRun) {
      for(const [name,target] of selected) {
        console.log(`${name}: ${target.routerAction} router at ${target.routerDestination}`);
        console.log(`${name}: would enforce global rule at ${target.rulePath}`);
        if(!options.routerOnly) console.log(`${name}: capability plan (${summarizePlan(target.capabilityPlans)})`);
      }
      return;
    }
    if(staged.length) {
      workRoot=mkdtempSync(join(tmpdir(),'bundle-useful-skills-'));
      prepareCapabilities(staged,workRoot);
    }
    for(const [name,target] of selected) {
      if(target.routerAction==='keep') console.log(`${name}: router already current at ${target.routerDestination}`);
      else {
        installRouter(target.routerDestination);
        console.log(`${name}: ${target.routerAction==='upgrade'?'upgraded':'installed'} router at ${target.routerDestination}`);
      }
      upsertManagedRule(target.rulePath);
      console.log(`${name}: enforced global routing rule at ${target.rulePath}`);
      if(!options.routerOnly) installCapabilities(name,target,workRoot);
    }
  } catch(error) {
    console.error(`skill-router installer: ${error.message}`);
    process.exitCode=1;
  } finally {
    if(workRoot) safeRemove(workRoot,dirname(workRoot));
  }
}

function parse(values){
  const out={target:'all',home:null,dryRun:false,routerOnly:false,adoptLegacy:false,replaceExisting:false,allowExisting:false};
  for(let i=0;i<values.length;i++){
    if(values[i]==='--dry-run'){out.dryRun=true;continue}
    if(values[i]==='--router-only'){out.routerOnly=true;continue}
    if(values[i]==='--adopt-legacy'){out.adoptLegacy=true;continue}
    if(values[i]==='--replace-existing'){out.replaceExisting=true;continue}
    if(values[i]==='--allow-existing'){out.allowExisting=true;continue}
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
  if(matchesPayload(destination)) return 'upgrade';
  if(isManagedClean(destination)) return 'upgrade';
  if(adoptLegacy&&looksLikeLegacyRouter(destination)) return 'upgrade';
  throw new Error(`refusing to overwrite a different or modified existing ${name} skill at ${destination}${looksLikeLegacyRouter(destination)?'; rerun with --adopt-legacy after reviewing it':''}`);
}

function isCurrent(destination){
  if(!existsSync(destination)) return false;
  if(!matchesPayload(destination)) return false;
  const manifestPath=join(destination,manifestName);
  if(!existsSync(manifestPath)||!isManagedClean(destination)) return false;
  try {
    const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
    return manifest.version===packageInfo.version;
  } catch { return false; }
}

function matchesPayload(destination){
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
    return verifyFiles(destination,manifest.files,manifestName);
  } catch { return false; }
}

function same(from,to){
  if(!existsSync(to)) return false;
  const fromStat=lstatSync(from),toStat=lstatSync(to);
  if(fromStat.isSymbolicLink()||toStat.isSymbolicLink()||fromStat.isDirectory()!==toStat.isDirectory()) return false;
  if(fromStat.isFile()) return toStat.isFile()&&readFileSync(from).equals(readFileSync(to));
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
      lstatSync(from).isDirectory()?cpSync(from,to,{recursive:true}):copyFileSync(from,to);
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
  validateEvidenceMetadata(skill);
  const sourcePath=sourceDirectory(skill.source.path);
  const from=resolveInside(checkout,sourcePath);
  if(!existsSync(join(from,'SKILL.md'))) throw new Error(`pinned skill path missing for ${skill.id}`);
  listSafeFiles(from);
  const destination=join(workRoot,'capabilities',invocationName(skill));
  cpSync(from,destination,{recursive:true});
  const skillFile=join(destination,'SKILL.md');
  const upstreamBody=readFileSync(skillFile,'utf8');
  const upstreamVersion=upstreamBody.match(/^version:\s*([^\r\n]+)$/m)?.[1]?.trim()??null;
  writeFileSync(skillFile,normalizeFrontmatter(upstreamBody));
  const sourceUrl=`${skill.source.repository}/tree/${skill.source.commit}/${sourceDirectory(skill.source.path)}`;
  const attribution=[`# ${skill.name}`,'',`Installed by Bundle Useful Skills. Thank you to **${skill.author}** for the original work.`,'',`- Original source: ${sourceUrl}`,`- Reviewed commit: \`${skill.source.commit}\``,`- License: ${skill.license}`,'','The upstream files remain under their original license. This attribution file was added by the bundle installer.',''].join('\n');
  writeFileSync(join(destination,'BUNDLE_README.md'),attribution);
  const evidenceRecords=[];
  for(const [kind,evidence,label] of [['license',skill.licenseEvidence,'BUNDLE_UPSTREAM_LICENSE'],['notice',skill.notice,'BUNDLE_UPSTREAM_NOTICE']]) {
    if(!evidence) continue;
    const evidenceType=classifyEvidence(evidence);
    if(evidenceType!=='repository') {
      evidenceRecords.push({kind,type:evidenceType,declaration:evidence});
      continue;
    }
    let source;
    try { source=assertRegularFileInside(checkout,evidence); }
    catch { throw new Error(`required upstream evidence missing or unsafe for ${skill.id}: ${evidence}`); }
    const installedPath=`${label}${extensionFor(evidence)}`;
    copyFileSync(source,join(destination,installedPath));
    evidenceRecords.push({kind,type:'repository',sourcePath:evidence,installedPath,sha256:hashFile(join(destination,installedPath))});
  }
  const files=listFiles(destination).map(path=>({path,sha256:hashFile(join(destination,path))}));
  writeFileSync(join(destination,sourceManifestName),JSON.stringify({id:skill.id,invocation:invocationName(skill),author:skill.author,repository:skill.source.repository,commit:skill.source.commit,path:skill.source.path,license:skill.license,evidence:evidenceRecords,upstreamVersion,files},null,2)+'\n');
}

function installCapabilities(name,target,workRoot){
  const counts={install:0,replace:0,adopt:0,keep:0};
  for(const {skill,action} of target.capabilityPlans){
    const destination=join(target.skillRoot,invocationName(skill));
    if(action==='keep'){counts.keep++;continue}
    if(action==='adopt'){
      adoptCapabilityManifest(destination);
      counts.adopt++;
      continue;
    }
    const staged=join(workRoot,'capabilities',invocationName(skill));
    if(!existsSync(staged)) throw new Error(`staged capability missing for ${skill.id}`);
    mkdirSync(target.skillRoot,{recursive:true});
    if(action==='replace') replaceCapability(staged,destination,target.backupRoot,name);
    else installCapability(staged,destination,target.skillRoot,name);
    counts[action]++;
  }
  console.log(`${name}: capability inventory ready (${counts.install} installed, ${counts.replace} replaced, ${counts.adopt} adopted, ${counts.keep} current)`);
}

function capabilityAction(skillRoot,skill,options){
  const destination=join(skillRoot,invocationName(skill));
  if(!existsSync(destination)) return 'install';
  const skillFile=join(destination,'SKILL.md');
  if(!existsSync(skillFile)||frontmatterName(readFileSync(skillFile,'utf8'))!==invocationName(skill)) throw new Error(`existing skill collision at ${destination}`);
  const manifestPath=join(destination,sourceManifestName);
  if(!existsSync(manifestPath)) return existingAction(destination,options);
  try {
    const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
    if(manifest.commit===skill.source.commit&&Array.isArray(manifest.files)&&verifyFiles(destination,manifest.files)) return 'keep';
    if(manifest.commit===skill.source.commit&&!Array.isArray(manifest.files)&&options.adoptLegacy) return 'adopt';
    if(options.replaceExisting) return 'replace';
    throw new Error(`managed capability is stale, modified, or unverified at ${destination}; use --replace-existing, or --adopt-legacy for a reviewed legacy manifest`);
  } catch(error) {
    if(options.replaceExisting) return 'replace';
    if(error instanceof SyntaxError) throw new Error(`invalid capability manifest at ${destination}; use --replace-existing after review`);
    throw error;
  }
}

function existingAction(destination,options){
  if(options.replaceExisting) return 'replace';
  if(options.allowExisting) return 'keep';
  throw new Error(`unverified existing skill at ${destination}; use --replace-existing to back it up and install the reviewed copy, or --allow-existing to preserve it`);
}

function summarizePlan(plans){
  const counts=Object.fromEntries(['install','replace','adopt','keep'].map(action=>[action,plans.filter(plan=>plan.action===action).length]));
  return `${counts.install} install, ${counts.replace} replace, ${counts.adopt} adopt, ${counts.keep} keep`;
}

function installCapability(staged,destination,skillRoot,host){
  const temp=join(skillRoot,`.bundle-capability-${basename(destination)}-${Date.now()}`);
  try {
    cpSync(staged,temp,{recursive:true});
    applyHostPolicy(host,temp);
    renameSync(temp,destination);
  }
  catch(error) { if(existsSync(temp)) safeRemove(temp,skillRoot); throw error; }
}

function replaceCapability(staged,destination,backupRoot,host){
  mkdirSync(backupRoot,{recursive:true});
  const backup=join(backupRoot,basename(destination));
  if(existsSync(backup)) throw new Error(`backup collision at ${backup}`);
  renameSync(destination,backup);
  try { installCapability(staged,destination,dirname(destination),host); }
  catch(error) { if(existsSync(destination)) safeRemove(destination,dirname(destination)); renameSync(backup,destination); throw error; }
  console.log(`backed up replaced skill to ${backup}`);
}

function adoptCapabilityManifest(destination){
  const manifestPath=join(destination,sourceManifestName);
  const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
  manifest.files=listFiles(destination).filter(path=>path!==sourceManifestName).map(path=>({path,sha256:hashFile(join(destination,path))}));
  const temp=`${manifestPath}.tmp`;
  writeFileSync(temp,JSON.stringify(manifest,null,2)+'\n');
  renameSync(temp,manifestPath);
}

function applyHostPolicy(host,destination){
  if(host!=='codex') return;
  const agents=join(destination,'agents');
  const metadata=join(agents,'openai.yaml');
  mkdirSync(agents,{recursive:true});
  const source=existsSync(metadata)?readFileSync(metadata,'utf8'):'';
  writeFileSync(metadata,applyExplicitInvocationPolicy(source));
  const manifestPath=join(destination,sourceManifestName);
  const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
  manifest.files=listSafeFiles(destination).filter(path=>path!==sourceManifestName).map(path=>({path,sha256:hashFile(resolveInside(destination,path))}));
  writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
}

function verifyFiles(root,files,excludedName=sourceManifestName){
  if(!files.length) return false;
  const actual=listFiles(root).filter(path=>path!==excludedName);
  const expected=files.map(file=>file?.path).sort();
  if(actual.length!==expected.length||actual.some((path,index)=>path!==expected[index])) return false;
  return files.every(file=>{
    if(!file||typeof file.path!=='string'||typeof file.sha256!=='string') return false;
    const path=resolve(root,file.path),rel=relative(resolve(root),path);
    return rel&&!rel.startsWith('..')&&!rel.includes(':')&&existsSync(path)&&hashFile(path)===file.sha256;
  });
}

function validateRuleFile(path){
  if(!existsSync(path)) return;
  const body=readFileSync(path,'utf8');
  const starts=occurrences(body,markerStart),ends=occurrences(body,markerEnd);
  if(starts!==ends) throw new Error(`incomplete managed rule markers in ${path}`);
  if(starts>1) throw new Error(`duplicate managed rule markers in ${path}`);
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
function occurrences(body,needle){return body.split(needle).length-1}
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
  for(const [parentId,record] of Object.entries(dependencyGroups)){
    const parent=registry.find(s=>s.id===parentId);
    if(!parent) throw new Error(`unknown dependency group parent ${parentId}`);
    for(const name of requiredSkillNames(record)){
      if(Object.values(invocations).includes(name)) continue;
      if(!record.sourcePathTemplate) throw new Error(`dependency ${parentId}/${name} requires a source path template`);
      const skill={...parent,id:`${parentId}/${name}`,name:`${parent.name} dependency: ${name}`,invocation:name,source:{...parent.source,path:record.sourcePathTemplate.replace('{name}',name)}};
      expanded.push(skill);
    }
  }
  return expanded;
}
function isRepositoryPath(value){return typeof value==='string'&&/^[A-Za-z0-9._/-]+$/.test(value)&&!value.includes('..')}
function extensionFor(path){const name=basename(path);const dot=name.lastIndexOf('.');return dot>=0?name.slice(dot):'.txt'}
function hashFile(path){return createHash('sha256').update(readFileSync(path)).digest('hex')}
function listFiles(root,prefix=''){
  return listSafeFiles(root,prefix);
}
function safeRemove(path,parent){
  const rel=relative(resolve(parent),resolve(path));
  if(!rel||rel.startsWith('..')||rel.includes(':')) throw new Error(`refusing to remove unsafe path ${path}`);
  rmSync(path,{recursive:true,force:true});
}
