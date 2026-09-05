import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
const skills=JSON.parse(readFileSync('registry/skills.json','utf8'));
const external=skills.filter(s=>!['internal'].includes(s.trust));
const grouped=new Map();
for(const s of external) {
  const key=s.source.repository||s.source.documentation;
  if(!grouped.has(key)) grouped.set(key,{...s,uses:[]});
  grouped.get(key).uses.push(s.name);
}
const title='# Credits\n\nBundle Useful Skills is an independent routing project. Thank you to the original authors and maintainers whose work makes these workflows possible. Inclusion does not imply endorsement, sponsorship, partnership, or affiliation.\n\n';
const entries=[...grouped.values()].sort((a,b)=>a.name.localeCompare(b.name)).map(s=>`## ${s.author}\n\n- Project: [${s.source.repository||s.source.documentation}](${s.source.repository||s.source.documentation})\n- License/reference status: ${s.license}\n- Used for: ${s.uses.sort().join(', ')}${s.notice?`\n- Upstream notice: ${s.notice}`:''}\n`).join('\n');
const credits=title+entries;
const sourceLink=s=>s.source.commit && s.source.path
  ? `[pinned source](${s.source.repository}/blob/${s.source.commit}/${s.source.path})`
  : `[reference](${s.source.documentation||s.source.path})`;
const technical='# Third-Party Skills\n\nNo third-party skill content is vendored. The router stores metadata and pinned upstream links. Install or read a dependency from its original source only when the route activates it.\n\n'+skills.map(s=>`- **${s.id}** — ${s.author}; ${s.license}; ${s.installMode}; ${sourceLink(s)}`).join('\n')+'\n';
const catalogIndex='# Skill Catalog\n\nEach directory contains a short attribution card for one external capability. These files are generated from `registry/skills.json`; third-party instructions remain at their original sources.\n\n'+external.sort((a,b)=>a.name.localeCompare(b.name)).map(s=>`- [${s.name}](${s.id}/README.md) — ${s.author}`).join('\n')+'\n';
const outputs={'CREDITS.md':credits,'THIRD_PARTY_SKILLS.md':technical,'catalog/README.md':catalogIndex};
for(const s of external) {
  const original=s.source.commit && s.source.path
    ? `${s.source.repository}/blob/${s.source.commit}/${s.source.path}`
    : s.source.documentation;
  outputs[`catalog/${s.id}/README.md`]=`# ${s.name}\n\nThank you to **${s.author}** for creating and maintaining this work. Bundle Useful Skills references it for ${s.phases.join(', ')} tasks on ${s.platforms.join(', ')} projects.\n\n- [Original source](${original})\n- License/reference status: ${s.license}\n- License evidence: ${s.licenseEvidence}\n- Trust level: ${s.trust}\n- Router authority: ${s.authority}\n- Install mode: ${s.installMode}${s.notice?`\n- Upstream notice: ${s.notice}`:''}\n\nThe original project remains authoritative. Its third-party instructions are not copied into this repository, and this listing does not imply endorsement or affiliation.\n`;
}
let changed=false;
for(const [file,body] of Object.entries(outputs)) {
  if(process.argv.includes('--check')) {
    if(!exists(file)||readFileSync(file,'utf8')!==body) {console.error(`${file} is stale`);changed=true;}
  } else {mkdirSync(file.includes('/')?file.slice(0,file.lastIndexOf('/')):'.',{recursive:true});writeFileSync(file,body);}
}
if(changed) process.exitCode=1; else console.log(process.argv.includes('--check')?'Generated attribution is current.':'Generated attribution files.');
function exists(path){try{readFileSync(path);return true}catch{return false}}
