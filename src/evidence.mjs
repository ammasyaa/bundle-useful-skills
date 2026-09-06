const repositoryPath=/^[A-Za-z0-9._/-]+$/;
const inlineEvidence=/^(?:SKILL\.md frontmatter and )?README declaration; no standalone license file$/;

export function classifyEvidence(value) {
  if(typeof value!=='string'||!value.trim()) throw new Error('Invalid license evidence');
  if(value==='Official documentation') return 'documentation';
  if(inlineEvidence.test(value)) return 'inline';
  if(repositoryPath.test(value)&&!value.includes('..')&&!value.startsWith('/')&&!/^[A-Za-z]:/.test(value)) return 'repository';
  throw new Error(`Invalid license evidence: ${value}`);
}

export function validateEvidenceMetadata(skill) {
  if(typeof skill.license!=='string'||!skill.license.trim()||/unknown|noassertion/i.test(skill.license)) throw new Error(`Invalid license for ${skill.id}`);
  const kind=classifyEvidence(skill.licenseEvidence);
  if(skill.installMode?.startsWith('upstream')&&!['repository','inline'].includes(kind)) throw new Error(`Upstream ${skill.id} requires repository or verified inline evidence`);
  if(skill.installMode==='documentation'&&kind!=='documentation') throw new Error(`Documentation ${skill.id} requires official documentation evidence`);
  if(skill.installMode==='bundled'&&kind!=='repository') throw new Error(`Bundled ${skill.id} requires repository evidence`);
  if(skill.notice!==null&&skill.notice!==undefined) {
    let noticeKind;
    try { noticeKind=classifyEvidence(skill.notice); }
    catch { throw new Error(`Invalid notice evidence for ${skill.id}`); }
    if(noticeKind!=='repository') throw new Error(`Invalid notice evidence for ${skill.id}`);
  }
  return kind;
}
