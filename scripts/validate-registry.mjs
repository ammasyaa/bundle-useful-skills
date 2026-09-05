import { existsSync, readFileSync } from 'node:fs';
import { registry, profiles, rules, invocations } from '../src/router.mjs';
const required=['id','name','author','source','license','licenseEvidence','platforms','phases','authority','conflicts','trust','installMode'];
const ids=new Set();
for(const s of registry) {
  for(const k of required) if(s[k]===undefined || s[k]===null && !['notice'].includes(k)) throw new Error(`${s.id??'entry'} missing ${k}`);
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.id)) throw new Error(`Invalid id ${s.id}`);
  if(ids.has(s.id)) throw new Error(`Duplicate id ${s.id}`); ids.add(s.id);
  if(!Array.isArray(s.platforms)||!s.platforms.length||!Array.isArray(s.conflicts)) throw new Error(`Invalid arrays for ${s.id}`);
  for(const conflict of s.conflicts) if(!registry.some(x=>x.id===conflict)) throw new Error(`${s.id} has unknown conflict ${conflict}`);
  if(s.installMode==='bundled' && !existsSync(s.source.path)) throw new Error(`${s.id} missing bundled source ${s.source.path}`);
  if(s.installMode.startsWith('upstream') && (!s.source.repository || !/^[0-9a-f]{40}$/.test(s.source.commit) || !s.source.path)) throw new Error(`${s.id} requires pinned upstream source`);
  if(s.installMode.startsWith('upstream') && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(invocations[s.id]??'')) throw new Error(`${s.id} requires a validated invocation name`);
}
for(const id of Object.keys(invocations)) if(!registry.some(s=>s.id===id && s.installMode.startsWith('upstream'))) throw new Error(`Unknown upstream invocation ${id}`);
for(const p of profiles) if(!ids.has(p.authority)) throw new Error(`Profile ${p.platform}/${p.framework} has unknown authority`);
if(new Set(profiles.map(p=>`${p.platform}/${p.framework}`)).size!==profiles.length) throw new Error('Duplicate profile');
if(rules.authorityOrder.at(-1)!=='filter') throw new Error('Filter must remain the lowest registered authority');
JSON.parse(readFileSync('registry/skills.json','utf8'));
const dependencies=JSON.parse(readFileSync('registry/dependencies.json','utf8'));
for(const [parent,names] of Object.entries(dependencies.groups)) {
  if(!ids.has(parent)) throw new Error(`Unknown dependency parent ${parent}`);
  if(!Array.isArray(names)||new Set(names).size!==names.length||names.some(name=>!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name))) throw new Error(`Invalid dependencies for ${parent}`);
}
console.log(`Registry valid: ${registry.length} skills, ${profiles.length} profiles.`);
