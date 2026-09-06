const allowed={
  platform:new Set(['website','desktop','mobile']),
  phase:new Set(['accessibility','api','architecture','brainstorm','bug','database','design','filter','implementation','motion','performance','plan','polish','refactor','release','research','review','security','testing','verify','visual-reference']),
  authority:new Set(['creative','design','domain','filter','framework','interaction','language','platform-ux','process','reference','release','review','security','verification']),
  trust:new Set(['community','experimental','internal','official','verified']),
  installMode:new Set(['bundled','documentation','upstream','upstream-pinned']),
  renderer:new Set(['react'])
};
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const safePath=/^[A-Za-z0-9._/-]+$/;

export function validateRegistryData(registry,profiles) {
  if(!Array.isArray(registry)||!registry.length||!Array.isArray(profiles)||!profiles.length) throw new Error('Registry and profiles must be non-empty arrays');
  const ids=new Set(),frameworks=new Set(profiles.map(profile=>profile.framework)),targets=new Set(profiles.flatMap(profile=>profile.targets??[]));
  for(const skill of registry) {
    if(!slug.test(skill.id??'')||ids.has(skill.id)) throw new Error(`Invalid or duplicate skill id: ${skill.id}`);
    ids.add(skill.id);
    enumArray(skill.platforms,allowed.platform,`platform for ${skill.id}`,true);
    enumArray(skill.phases,allowed.phase,`phase for ${skill.id}`,true);
    enumValue(skill.authority,allowed.authority,`authority for ${skill.id}`);
    enumValue(skill.trust,allowed.trust,`trust for ${skill.id}`);
    enumValue(skill.installMode,allowed.installMode,`install mode for ${skill.id}`);
    if(skill.renderer!==undefined) enumValue(skill.renderer,allowed.renderer,`renderer for ${skill.id}`);
    enumArray(skill.frameworks??[],frameworks,`framework for ${skill.id}`,false);
    enumArray(skill.targets??[],targets,`target for ${skill.id}`,false);
    if(!Array.isArray(skill.conflicts)||new Set(skill.conflicts).size!==skill.conflicts.length||skill.conflicts.some(id=>!slug.test(id))) throw new Error(`Invalid conflicts for ${skill.id}`);
    validateSource(skill);
  }
  for(const skill of registry) for(const conflict of skill.conflicts) if(!ids.has(conflict)) throw new Error(`${skill.id} has unknown conflict ${conflict}`);
  const lanes=new Set();
  for(const profile of profiles) {
    const key=`${profile.platform}/${profile.framework}`;
    if(lanes.has(key)) throw new Error(`Duplicate profile ${key}`);
    lanes.add(key);
    enumValue(profile.platform,allowed.platform,`profile platform for ${key}`);
    if(!slug.test(profile.framework??'')) throw new Error(`Invalid profile framework for ${key}`);
    if(!Array.isArray(profile.targets)||new Set(profile.targets).size!==profile.targets.length||profile.targets.some(target=>!targets.has(target))) throw new Error(`Invalid profile targets for ${key}`);
    const authority=registry.find(skill=>skill.id===profile.authority);
    if(!authority) throw new Error(`Profile ${key} has unknown authority`);
    const compatible=authority.authority==='framework'&&authority.platforms.includes(profile.platform)&&(!authority.frameworks?.length||authority.frameworks.includes(profile.framework));
    if(!compatible) throw new Error(`Profile ${key} authority is incompatible`);
  }
  return true;
}

function validateSource(skill) {
  const source=skill.source;
  if(!source||typeof source!=='object') throw new Error(`Invalid source for ${skill.id}`);
  if(skill.installMode.startsWith('upstream')) {
    if(typeof source.repository!=='string'||!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(source.repository)) throw new Error(`Invalid repository URL for ${skill.id}`);
    if(!/^[0-9a-f]{40}$/.test(source.commit??'')) throw new Error(`Invalid reviewed commit for ${skill.id}`);
    if(typeof source.path!=='string'||!safePath.test(source.path)||source.path.includes('..')||!source.path.endsWith('/SKILL.md')) throw new Error(`Invalid source path for ${skill.id}`);
  } else if(skill.installMode==='documentation') {
    if(typeof source.documentation!=='string'||!/^https:\/\//.test(source.documentation)) throw new Error(`Invalid documentation URL for ${skill.id}`);
  } else if(skill.installMode==='bundled') {
    if(typeof source.path!=='string'||!safePath.test(source.path)||source.path.includes('..')) throw new Error(`Invalid bundled source path for ${skill.id}`);
  }
}

function enumArray(values,choices,label,required) {
  if(!Array.isArray(values)||(required&&!values.length)||new Set(values).size!==values.length||values.some(value=>!choices.has(value))) throw new Error(`Invalid ${label}`);
}
function enumValue(value,choices,label) {
  if(!choices.has(value)) throw new Error(`Invalid ${label}`);
}
