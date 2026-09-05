#!/usr/bin/env node
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const payload=[
  ['router/SKILL.md','SKILL.md'],
  ['router/references','references'],
  ['scripts/cli.mjs','scripts/cli.mjs'],
  ['src','src'],
  ['registry','registry'],
  ['profiles','profiles'],
  ['LICENSE','LICENSE']
];

try {
  const options=parse(process.argv.slice(2));
  const userHome=resolve(options.home||homedir());
  const codexRoot=options.home?join(userHome,'.codex'):resolve(process.env.CODEX_HOME||join(userHome,'.codex'));
  const targets={
    codex:join(codexRoot,'skills','development-skill-router'),
    antigravity:join(userHome,'.gemini','config','skills','development-skill-router')
  };
  const selected=options.target==='all'?Object.entries(targets):[[options.target,targets[options.target]]];
  for(const [name,destination] of selected) preflight(name,destination);
  for(const [name,destination] of selected) {
    if(isCurrent(destination)){console.log(`${name}: already current at ${destination}`);continue}
    if(options.dryRun){console.log(`${name}: would install at ${destination}`);continue}
    install(destination);
    console.log(`${name}: installed at ${destination}`);
  }
} catch(error) {
  console.error(`skill-router installer: ${error.message}`);
  process.exitCode=1;
}

function parse(values){
  const out={target:'all',home:null,dryRun:false};
  for(let i=0;i<values.length;i++){
    if(values[i]==='--dry-run'){out.dryRun=true;continue}
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

function preflight(name,destination){
  if(existsSync(destination)&&!isCurrent(destination)) throw new Error(`refusing to overwrite a different existing ${name} skill at ${destination}`);
}

function isCurrent(destination){
  if(!existsSync(destination)) return false;
  for(const [source,relativeDestination] of payload){
    const from=join(projectRoot,source),to=join(destination,relativeDestination);
    if(!same(from,to)) return false;
  }
  return true;
}

function same(from,to){
  if(!existsSync(to)||statSync(from).isDirectory()!==statSync(to).isDirectory()) return false;
  if(statSync(from).isFile()) return readFileSync(from).equals(readFileSync(to));
  const left=readdirSync(from).sort(),right=readdirSync(to).sort();
  return left.length===right.length&&left.every((name,index)=>name===right[index]&&same(join(from,name),join(to,name)));
}

function install(destination){
  const parent=dirname(destination);
  mkdirSync(parent,{recursive:true});
  const temp=mkdtempSync(join(parent,'.development-skill-router-'));
  try {
    for(const [source,relativeDestination] of payload){
      const from=join(projectRoot,source),to=join(temp,relativeDestination);
      mkdirSync(dirname(to),{recursive:true});
      statSync(from).isDirectory()?cpSync(from,to,{recursive:true}):copyFileSync(from,to);
    }
    renameSync(temp,destination);
  } catch(error) {
    const rel=relative(resolve(parent),resolve(temp));
    if(rel&&!rel.startsWith('..')&&!rel.includes(':')) rmSync(temp,{recursive:true,force:true});
    throw error;
  }
}
