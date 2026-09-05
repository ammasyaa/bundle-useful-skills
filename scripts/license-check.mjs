import { readFileSync } from 'node:fs';
const skills=JSON.parse(readFileSync('registry/skills.json','utf8'));
const invalid=skills.filter(s=>!s.license || /unknown|noassertion/i.test(s.license) || !s.licenseEvidence);
if(invalid.length) {console.error(`Unverified license metadata: ${invalid.map(s=>s.id).join(', ')}`);process.exitCode=1;}
else console.log(`License metadata present for ${skills.length} entries. Third-party content is not vendored.`);
