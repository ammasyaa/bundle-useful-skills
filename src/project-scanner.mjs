import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { resolveInside } from './safe-tree.mjs';

const excludedDirectories=new Set(['.git','.hg','.svn','.dart_tool','.expo','.next','.nuxt','.output','build','coverage','dist','node_modules','out','target','vendor']);
const instructionNames=new Set(['AGENTS.md','AGENTS.override.md','CLAUDE.md','GEMINI.md']);
const documentPattern=/^(?:README|CONTRIBUTING|SECURITY|ARCHITECTURE|DESIGN)(?:\.[^.]+)?$/i;
const maximumDepth=2;
const maximumEntries=1000;
const maximumManifestBytes=256*1024;

export function scanProject(root) {
  if(typeof root!=='string'||!root.trim()) throw new Error('search requires a repository root');
  const resolvedRoot=resolve(root);
  if(!existsSync(resolvedRoot)) throw new Error('repository root does not exist');
  const stat=lstatSync(resolvedRoot);
  if(stat.isSymbolicLink()||!stat.isDirectory()) throw new Error('repository root must be a real directory');
  const evidence={schemaVersion:1,root:resolvedRoot,files:[],instructions:[],documents:[],signals:[],excluded:[],warnings:[],git:null};
  let entries=0;
  walk('',0);
  evidence.files.sort();
  evidence.instructions.sort();
  evidence.documents.sort();
  evidence.signals.sort((a,b)=>`${a.path}:${a.type}:${a.value}`.localeCompare(`${b.path}:${b.type}:${b.value}`));
  evidence.git=gitMetadata(resolvedRoot);
  return evidence;

  function walk(prefix,depth) {
    const directory=prefix?resolveInside(resolvedRoot,prefix):resolvedRoot;
    for(const entry of readdirSync(directory,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
      if(++entries>maximumEntries) { evidence.warnings.push(`scan stopped after ${maximumEntries} entries`); return; }
      const rel=(prefix?join(prefix,entry.name):entry.name).replaceAll('\\','/');
      if(entry.isSymbolicLink()) { evidence.excluded.push({path:rel,reason:'symbolic link'}); continue; }
      if(entry.isDirectory()) {
        if(excludedDirectories.has(entry.name)) { evidence.excluded.push({path:rel,reason:'excluded directory'}); continue; }
        if(['ios','android','windows','macos','src-tauri'].includes(entry.name)) evidence.signals.push({type:'directory',value:entry.name,path:rel});
        if(depth<maximumDepth) walk(rel,depth+1);
        continue;
      }
      if(!entry.isFile()) { evidence.excluded.push({path:rel,reason:'special file'}); continue; }
      if(/^\.env(?:\.|$)/i.test(entry.name)) { evidence.excluded.push({path:rel,reason:'environment file values are never read'}); continue; }
      evidence.files.push(rel);
      evidence.signals.push({type:'file',value:rel,path:rel});
      if(instructionNames.has(entry.name)) evidence.instructions.push(rel);
      if(documentPattern.test(entry.name)) evidence.documents.push(rel);
      inspectManifest(rel);
    }
  }

  function inspectManifest(rel) {
    const name=basename(rel);
    const path=resolveInside(resolvedRoot,rel);
    const size=lstatSync(path).size;
    if(size>maximumManifestBytes) { evidence.warnings.push(`${rel} exceeds the manifest read limit`); return; }
    if(name==='package.json') {
      try {
        const parsed=JSON.parse(readFileSync(path,'utf8'));
        const dependencies={...parsed.dependencies,...parsed.devDependencies};
        for(const dependency of Object.keys(dependencies).sort()) evidence.signals.push({type:'dependency',value:dependency,path:rel});
        for(const script of Object.keys(parsed.scripts??{}).sort()) evidence.signals.push({type:'script',value:script,path:rel});
      } catch { evidence.warnings.push(`could not parse ${rel}`); }
    } else if(name==='pubspec.yaml') {
      const body=readFileSync(path,'utf8');
      if(/^\s*flutter\s*:/m.test(body)||/sdk:\s*flutter/.test(body)) evidence.signals.push({type:'manifest',value:'flutter',path:rel});
    } else if(/\.csproj$/i.test(name)) {
      const body=readFileSync(path,'utf8');
      if(/WinUI|Microsoft\.WindowsAppSDK/i.test(body)) evidence.signals.push({type:'manifest',value:'winui',path:rel});
    }
  }
}

function gitMetadata(root) {
  const inside=runGit(root,['rev-parse','--is-inside-work-tree']);
  if(inside!=='true') return null;
  return {branch:runGit(root,['branch','--show-current'])||null,revision:runGit(root,['rev-parse','HEAD'])||null};
}
function runGit(root,args) {
  const result=spawnSync('git',['-C',root,...args],{encoding:'utf8',timeout:3000});
  return result.status===0?result.stdout.trim():'';
}
