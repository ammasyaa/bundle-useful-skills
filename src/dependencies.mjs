const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function requiredSkillNames(record) {
  if(Array.isArray(record)) return record;
  return record?.requiredSkills??[];
}

export function validateDependencyDocument(document,catalog) {
  if(document?.schemaVersion!==2||!document.groups||typeof document.groups!=='object'||Array.isArray(document.groups)) throw new Error('Invalid dependency document');
  const ids=new Set(catalog.map(item=>item.id));
  for(const [parent,record] of Object.entries(document.groups)) {
    if(!ids.has(parent)) throw new Error(`Unknown dependency parent ${parent}`);
    validateRecord(parent,record);
  }
  const visiting=new Set(),visited=new Set();
  const visit=id=>{
    if(visiting.has(id)) throw new Error(`Dependency cycle involving ${id}`);
    if(visited.has(id)||!document.groups[id]) return;
    visiting.add(id);
    for(const child of requiredSkillNames(document.groups[id])) if(document.groups[child]) visit(child);
    visiting.delete(id);
    visited.add(id);
  };
  for(const id of Object.keys(document.groups)) visit(id);
  return document;
}

export function evaluateWorkflowDependencies(groups,statusByName) {
  const missingRequired=[],optionalGaps=[],conditionalGaps=[];
  for(const [parent,record] of Object.entries(groups)) {
    if(statusByName.get(parent)!=='managed-pinned') continue;
    for(const name of requiredSkillNames(record)) if(statusByName.get(name)!=='managed-pinned') missingRequired.push(`${parent} -> ${name}`);
    for(const name of record.optionalSkills??[]) if(statusByName.get(name)!=='managed-pinned') optionalGaps.push(`${parent} -> ${name}`);
    for(const tool of record.hostTools??[]) if(tool.required==='conditional') conditionalGaps.push({parent,tool:tool.id,when:tool.when});
  }
  return {workflowReady:missingRequired.length===0,missingRequired,optionalGaps,conditionalGaps};
}

function validateRecord(parent,record) {
  if(!record||typeof record!=='object'||Array.isArray(record)) throw new Error(`Invalid dependency record for ${parent}`);
  for(const key of ['requiredSkills','optionalSkills','hostTools']) if(!Array.isArray(record[key])) throw new Error(`Invalid ${key} for ${parent}`);
  if(typeof record.reason!=='string'||!record.reason.trim()) throw new Error(`Missing dependency reason for ${parent}`);
  const names=[...record.requiredSkills,...record.optionalSkills];
  if(new Set(names).size!==names.length||names.some(name=>!slug.test(name))) throw new Error(`Invalid dependency skill for ${parent}`);
  if(record.sourcePathTemplate!==undefined&&(!/^[A-Za-z0-9._/{}/-]+$/.test(record.sourcePathTemplate)||!record.sourcePathTemplate.includes('{name}')||record.sourcePathTemplate.includes('..'))) throw new Error(`Invalid source path template for ${parent}`);
  const tools=new Set();
  for(const tool of record.hostTools) {
    if(!tool||!slug.test(tool.id??'')||!['required','conditional','optional'].includes(tool.required)||typeof tool.when!=='string'||!tool.when.trim()||tools.has(tool.id)) throw new Error(`Invalid host tool dependency for ${parent}`);
    tools.add(tool.id);
  }
}
