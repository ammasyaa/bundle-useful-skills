import { invocations, registry } from './router.mjs';

export function explainRegistrySelection(candidate,task,routeResult,catalog=registry) {
  const active=new Set(routeResult?.active??[]);
  const selected=routeResult?.selections??[];
  const rejected=[];
  for(const skill of catalog) {
    if(active.has(skill.id)) continue;
    rejected.push({id:skill.id,invocation:invocations[skill.id]??skill.id,reason:rejectionReason(skill,candidate,task)});
  }
  return {selected,rejected,missingCoverage:routeResult?[]:[`No executable route for ${candidate.platform}/${candidate.framework}`]};
}

function rejectionReason(skill,candidate,task) {
  if(!skill.platforms.includes(candidate.platform)) return `platform mismatch: supports ${skill.platforms.join(', ')}`;
  if(skill.frameworks?.length&&!skill.frameworks.includes(candidate.framework)) return `framework mismatch: supports ${skill.frameworks.join(', ')}`;
  if(skill.targets?.length&&(!candidate.target||!skill.targets.includes(candidate.target))) return `target mismatch: requires ${skill.targets.join(' or ')}`;
  if(skill.phases?.length&&!skill.phases.includes(task)) return `phase mismatch: intended for ${skill.phases.join(', ')}`;
  return 'compatible metadata but not required by the smallest bundle';
}
