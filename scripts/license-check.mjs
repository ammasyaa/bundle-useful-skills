import { readFileSync } from 'node:fs';
import { validateEvidenceMetadata } from '../src/evidence.mjs';
const skills=JSON.parse(readFileSync('registry/skills.json','utf8'));
const invalid=[];
for(const skill of skills) {
  try { validateEvidenceMetadata(skill); }
  catch(error) { invalid.push(`${skill.id}: ${error.message}`); }
}
if(invalid.length) {console.error(`Unverified license metadata: ${invalid.join('; ')}`);process.exitCode=1;}
else console.log(`License evidence classified for ${skills.length} entries. Third-party content is not vendored.`);
