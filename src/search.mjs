import { scanProject } from './project-scanner.mjs';
import { classifyProject } from './project-classifier.mjs';
import { explainRegistrySelection } from './registry-search.mjs';
import { route } from './router.mjs';

export function searchProject({root,task='implementation',description=''}={}) {
  const evidence=scanProject(root);
  const classification=classifyProject(evidence);
  const base={schemaVersion:1,evidence,classification,needsInput:classification.needsInput,route:null,selected:[],rejected:[],missingCoverage:[]};
  if(classification.needsInput) return {...base,missingCoverage:classification.candidates.length?[]:['No supported route could be established from repository evidence.']};
  const candidate=classification.candidates[0];
  const routeResult=route({...candidate,task,description});
  const registryResult=explainRegistrySelection(candidate,task,routeResult);
  return {...base,needsInput:false,route:routeResult,...registryResult};
}

export function formatSearchReport(result) {
  const lines=['Skill bundle report',`- Task classification: ${result.route?`${result.route.platform}/${result.route.framework}/${result.route.task}`:'needs project choice'}`];
  lines.push(`- Project evidence: ${result.evidence.files.length} bounded files; confidence ${result.classification.confidence}`);
  lines.push(`- Route: ${result.route?`${result.route.platform}/${result.route.framework}${result.route.frameworkAuthority?`; authority ${result.route.frameworkAuthority}`:''}`:'not selected'}`);
  lines.push(`- Router: development-skill-router — ${result.route?'selected the smallest compatible bundle':'stopped before routing because evidence is incomplete or conflicting'}`);
  lines.push('- Skills used:');
  if(result.selected.length) for(const item of result.selected) lines.push(`  - ${item.invocation} — ${item.reason}`);
  else lines.push('  - None');
  lines.push('- Skills considered but not used:');
  if(result.rejected.length) for(const item of result.rejected.slice(0,12)) lines.push(`  - ${item.invocation} — ${item.reason}`);
  else lines.push('  - None');
  lines.push(`- Selection rationale: ${result.route?'One high-confidence project lane passed compatibility and authority checks.':'No bundle was activated.'}`);
  lines.push('- Verification evidence: repository evidence scan and registry compatibility checks');
  const gaps=[...result.classification.conflicts,...result.classification.unknowns,...result.missingCoverage];
  lines.push(`- Gaps: ${gaps.length?gaps.join(' '):'None'}`);
  return lines.join('\n');
}
