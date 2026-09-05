import { readFileSync, writeFileSync } from 'node:fs';
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
const outputs={'CREDITS.md':credits,'THIRD_PARTY_SKILLS.md':technical};
let changed=false;
for(const [file,body] of Object.entries(outputs)) {
  if(process.argv.includes('--check')) {
    if(!exists(file)||readFileSync(file,'utf8')!==body) {console.error(`${file} is stale`);changed=true;}
  } else writeFileSync(file,body);
}
if(changed) process.exitCode=1; else console.log(process.argv.includes('--check')?'Generated attribution is current.':'Generated attribution files.');
function exists(path){try{readFileSync(path);return true}catch{return false}}
