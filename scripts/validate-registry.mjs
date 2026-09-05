import { existsSync, readFileSync } from 'node:fs';
import { registry, profiles, rules } from '../src/router.mjs';
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
}
for(const p of profiles) if(!ids.has(p.authority)) throw new Error(`Profile ${p.platform}/${p.framework} has unknown authority`);
if(new Set(profiles.map(p=>`${p.platform}/${p.framework}`)).size!==profiles.length) throw new Error('Duplicate profile');
if(rules.authorityOrder.at(-1)!=='filter') throw new Error('Filter must remain the lowest registered authority');
JSON.parse(readFileSync('registry/skills.json','utf8'));
console.log(`Registry valid: ${registry.length} skills, ${profiles.length} profiles.`);
