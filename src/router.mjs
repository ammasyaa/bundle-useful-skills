import { readFileSync } from 'node:fs';
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
export const registry = read('../registry/skills.json');
export const profiles = read('../profiles/index.json');
export const rules = read('../registry/compatibility.json');
export const invocations = read('../registry/invocations.json').skills;
export const domains = read('../registry/domains.json').domains;
const tasks = domains.engineering.tasks;
const uiTasks = ['design','polish','motion','research','visual-reference','filter'];
const riskPattern = /\b(auth(?:entication|orization)?|payments?|pii|location|identity|secrets?|tokens?|uploads?|webhooks?|database permissions|admin|account recovery|password|login)\b/i;
// Regulated-claim and personal-data triggers for audience-facing work.
const compliancePattern = /\b(gdpr|pdpa|ccpa|personal data|consent|opt[- ]?in|health claims?|medical|financial (?:advice|promotion|product)|investment|insurance|testimonials?|endorsements?|influencer disclosure|minors?|children|gambling|alcohol|tobacco|crypto(?:currency)?|before[- ]and[- ]after|guaranteed? results?|earnings claims?|pharmaceutical)\b/i;

function compatible(s,c) {
  if (!s.platforms.includes(c.platform)) return false;
  if (s.frameworks?.length && !s.frameworks.includes(c.framework)) {
    if (!(s.renderer === 'react' && c.platform === 'desktop' && ['tauri','electron'].includes(c.framework) && c.renderer === 'react')) return false;
  }
  if (s.database && s.database !== c.database) return false;
  if (s.targets?.length && c.target && !s.targets.includes(c.target)) return false;
  return true;
}
export function validateSelection(ids,ctx,catalog=registry) {
  const found=ids.map(id=>{
    const s=catalog.find(s=>s.id===id);
    if (!s) throw new Error(`Unknown skill: ${id}`);
    if (!compatible(s,ctx)) throw new Error(`Incompatible skill ${id} for ${ctx.platform}/${ctx.framework}`);
    return s;
  });
  for (const role of ['framework','creative']) {
    const owners=found.filter(s=>s.authority===role && !(s.renderer && ctx.platform==='desktop'));
    if (owners.length>1) throw new Error(`Multiple ${role} authorities: ${owners.map(s=>s.id).join(', ')}`);
  }
  for (const s of found) for (const conflict of s.conflicts) if(ids.includes(conflict)) throw new Error(`Conflict: ${s.id} / ${conflict}`);
  return found;
}

// Shared assembly: apply explicit overrides, validate, and build the disclosure report.
function finish(profile,ctx,catalog,chosen,references,gate,extra={}) {
  for(const id of ctx.enable) chosen.set(id,'Explicitly enabled');
  for(const id of ctx.disable) {
    if(!catalog.some(s=>s.id===id)) throw new Error(`Unknown disabled skill: ${id}`);
    if(extra.sensitive && id===gate) throw new Error(`Cannot disable mandatory ${gate}`);
    if(extra.lockedDisable?.includes(id)) throw new Error(`Cannot disable ${id} for a ${ctx.task} route`);
    chosen.delete(id);
  }
  const active=[...chosen.keys()];
  const selected=validateSelection(active,ctx,catalog);
  const warnings=[...(extra.warnings??[])];
  if(active.length>rules.activationBudget.warnAbove) warnings.push('Above five active capabilities; consider sequential passes.');
  if(active.length>rules.activationBudget.justifyAbove && !(typeof ctx.justification==='string' && ctx.justification.trim())) throw new Error('Above seven active capabilities requires a justification');
  const selections=selected.map(s=>({id:s.id,invocation:invocations[s.id]??s.id,reason:chosen.get(s.id),authority:s.renderer && ctx.platform==='desktop'?'renderer':s.authority,source:s.source,installMode:s.installMode}));
  const reportLine=`Skill bundle: development-skill-router -> ${selections.map(s=>s.invocation).join(', ') || '(router only)'}`;
  return {schemaVersion:2,domain:profile.domain,platform:ctx.platform,framework:ctx.framework,task:ctx.task,frameworkAuthority:profile.authority,active,
    selections,
    references,authorityOrder:rules.authorityOrder,warnings,justification:ctx.justification??null,
    available:ctx.mode==='full'?catalog.filter(s=>compatible(s,ctx)).map(s=>s.id):active,
    report:{line:reportLine,router:'development-skill-router',invocations:selections.map(s=>s.invocation)},
    completion:extra.completion??['Run checks appropriate to the change','Report actual evidence and untested behavior']};
}

export function route(options={},extensions=[]) {
  const ctx={task:'implementation',scope:'client',mode:'recommended',enable:[],disable:[],risks:[],...options};
  const profile=profiles.find(p=>p.platform===ctx.platform && p.framework===ctx.framework);
  if(!profile) throw new Error('Unsupported platform/framework. Choose an explicit supported profile.');
  if(!['minimal','recommended','full'].includes(ctx.mode)) throw new Error('Unknown mode');
  for(const key of ['enable','disable','risks']) if(!Array.isArray(ctx[key]) || !ctx[key].every(v=>typeof v==='string')) throw new Error(`${key} must be an array of strings`);
  if(extensions.some(s=>registry.some(r=>r.id===s.id))) throw new Error('Custom IDs must not replace built-in security or compatibility rules');
  const catalog=[...registry,...extensions];
  return (profile.domain??'engineering')==='engineering'
    ? routeEngineering(profile,ctx,catalog)
    : routeDomain(profile,ctx,catalog);
}

function routeEngineering(profile,ctx,catalog) {
  if(!tasks.includes(ctx.task)) throw new Error(`Unknown task: ${ctx.task}`);
  if(!domains.engineering.scopes.includes(ctx.scope)) throw new Error('Unknown scope');
  if(ctx.renderer && !(ctx.platform==='desktop' && ['tauri','electron'].includes(ctx.framework) && ctx.renderer==='react')) throw new Error('Renderer applies only to React in Tauri/Electron');
  if(ctx.framework==='flutter' && !ctx.target) throw new Error('Flutter requires an explicit target');
  if(ctx.target && !profile.targets.includes(ctx.target)) throw new Error('Target incompatible with profile');
  if(ctx.database && !['postgres','firebase'].includes(ctx.database)) throw new Error('Unsupported database; add a reviewed custom specialist');
  const chosen=new Map();
  const add=(id,why)=>chosen.set(id,why);
  const backendOnly=['database','api','backend'].includes(ctx.scope) || ['database','api'].includes(ctx.task);
  const sensitive=ctx.risks.length>0 || riskPattern.test(ctx.description??'') || ctx.task==='security';
  const process={brainstorm:'brainstorming',plan:'writing-plans',bug:'systematic-debugging',implementation:'test-driven-development',refactor:'test-driven-development',testing:'test-driven-development',review:'requesting-code-review',verify:'verification-before-completion',release:'verification-before-completion'}[ctx.task];
  if(process) add(process,`Process for ${ctx.task}`);
  if(!backendOnly && !uiTasks.includes(ctx.task) && !['brainstorm','plan','security'].includes(ctx.task)) {
    add(profile.authority,'Selected framework authority');
    if(profile.authority==='flutter-architecture') add('dart-static-analysis','Dart language analysis for Flutter code');
  }
  if(!backendOnly && ctx.renderer==='react' && !uiTasks.includes(ctx.task)) add('react-best-practices','React renderer only; native core stays under desktop authority');
  if(ctx.task==='architecture' && ((ctx.platform==='website' && ['react','next'].includes(ctx.framework)) || ctx.renderer==='react')) add('react-composition-patterns','React component API architecture');
  if(backendOnly && ctx.database) add(ctx.database==='postgres'?'postgres-best-practices':'firebase-basics','Configured data technology for this task');
  if(ctx.task==='api' || ctx.scope==='api') add('api-design','API contract work');
  if(sensitive) add('security-gate','Sensitive feature requires security verification');
  if(ctx.task==='design') {
    add(ctx.platform==='website'?(ctx.director==='anthropic'?'anthropic-frontend':'taste-frontend'):'impeccable','Primary design responsibility for this surface');
    if(ctx.framework==='expo') add('expo-ui','Expo-native UI guidance');
    if(ctx.mode!=='minimal' && ctx.platform==='mobile' && ctx.target) add(ctx.target==='ios'?'mobile-ios-design':'mobile-android-design','Platform UX principles only');
  }
  if(ctx.task==='polish') add('impeccable','Review existing product design');
  if(ctx.task==='motion') add('emil-design-eng','Interaction judgment; translate to native framework');
  if(ctx.task==='research') add('ui-ux-pro-max','Reference research only');
  if(ctx.task==='visual-reference' && ctx.platform==='mobile') add('taste-mobile-imagegen','Mobile reference image generation only');
  if(ctx.task==='review' && ctx.platform==='website') add('web-design-guidelines','Website UX and accessibility review');
  if(ctx.task==='review' && ctx.platform==='mobile' && ctx.target) add(ctx.target==='ios'?'mobile-ios-design':'mobile-android-design','Target platform UX review');
  if(ctx.task==='filter') add('antislop','Final filter below project design system');
  if(ctx.task==='release') add('release-gate','Platform release evidence');
  const references=[`references/${ctx.platform}.md`];
  if(sensitive) references.push('references/security.md');
  if(ctx.task==='api' || ctx.scope==='api') references.push('references/api.md');
  if(ctx.task==='release') references.push('references/release.md');
  const warnings=[];
  if(backendOnly && !ctx.database && ctx.task!=='api') warnings.push('No data specialist selected: identify the actual backend before implementation.');
  return finish(profile,ctx,catalog,chosen,references,'security-gate',{
    sensitive,warnings,
    lockedDisable:ctx.task==='release'?['release-gate','verification-before-completion']:[]
  });
}

// Non-engineering lanes are data-driven: rules live in registry/domains.json, not in code.
function routeDomain(profile,ctx,catalog) {
  const def=domains[profile.domain];
  if(!def) throw new Error(`Unknown domain: ${profile.domain}`);
  if(!def.tasks.includes(ctx.task)) throw new Error(`Unknown task: ${ctx.task} for domain ${profile.domain}`);
  if(!def.scopes.includes(ctx.scope)) throw new Error(`Unknown scope: ${ctx.scope} for domain ${profile.domain}`);
  if(ctx.renderer||ctx.target||ctx.database) throw new Error(`renderer, target and database apply to engineering routes only`);
  const gate=def.gate;
  const sensitive=ctx.risks.length>0 || compliancePattern.test(ctx.description??'') || riskPattern.test(ctx.description??'') || ctx.task==='compliance';
  const chosen=new Map();
  const add=(id,why)=>{ if(id) chosen.set(id,why); };
  if(ctx.mode!=='minimal' && def.context) add(def.context,'Shared positioning and audience context');
  const process=def.process?.[ctx.task];
  if(process) add(process,`Process for ${ctx.task}`);
  if(ctx.task!=='compliance') add(profile.authority,'Selected lane authority');
  if(ctx.mode!=='minimal') {
    for(const id of def.specialists?.[ctx.task]??[]) add(id,`Domain specialist for ${ctx.task}`);
    for(const id of def.laneSpecialists?.[ctx.framework]?.[ctx.task]??[]) add(id,`${ctx.framework} specialist for ${ctx.task}`);
  }
  if(sensitive) add(gate,gate==='compliance-gate'
    ? 'Regulated claim or personal-data handling requires a compliance pass'
    : 'Sensitive feature requires security verification');
  if(ctx.task==='verify' && def.verification) add(def.verification,'Evidence pass before the work is called done');
  const references=[def.reference];
  if(sensitive) references.push(gate==='compliance-gate'?'references/compliance.md':'references/security.md');
  const warnings=[];
  if(ctx.task!=='compliance' && !sensitive && ['marketing','brand','content'].includes(profile.domain))
    warnings.push('No regulated-claim risk declared: confirm claims, consent, and disclosure before publishing.');
  return finish(profile,ctx,catalog,chosen,references,gate,{
    sensitive,warnings,
    lockedDisable:ctx.task==='verify' && def.verification?[def.verification]:[],
    completion:['Show the evidence behind every claim and number','Name what was not measured or verified']
  });
}

export function formatRouteReport(result) {
  return [
    result.report.line,
    `Route: ${result.platform}/${result.framework}/${result.task}`,
    `References: ${result.references.join(', ')}`,
    ...result.selections.map(s=>`- ${s.invocation}: ${s.reason}`),
    ...result.warnings.map(w=>`Warning: ${w}`)
  ].join('\n');
}
// Detection suggests a lane; it never writes configuration or resolves ambiguous targets.
export function detect(files) {
  const names=Object.keys(files);
  const pkg=files['package.json']?JSON.parse(files['package.json']):{};
  const deps={...pkg.dependencies,...pkg.devDependencies};
  const candidates=[];
  const add=(platform,framework,reason)=>candidates.push({platform,framework,reason});
  if(names.some(n=>n.startsWith('src-tauri/')) || deps['@tauri-apps/api']) add('desktop','tauri','Tauri native shell');
  if(deps.electron || names.some(n=>/^electron\./.test(n))) add('desktop','electron','Electron shell');
  if(files['pubspec.yaml'] && /sdk:\s*flutter/.test(files['pubspec.yaml'])) {
    const desktop=names.some(n=>/^(windows|macos)\//.test(n));
    const mobile=names.some(n=>/^(android|ios)\//.test(n));
    if(desktop) add('desktop','flutter','Flutter desktop target');
    if(mobile) add('mobile','flutter','Flutter mobile target');
    if(!desktop && !mobile) return {needsInput:true,candidates:[],reason:'Flutter target must be specified'};
  } else if(deps.expo) add('mobile','expo','Expo dependency');
  else if(deps['react-native']) add('mobile','react-native','React Native dependency');
  if(names.some(n=>n.endsWith('.csproj') && /Microsoft.WindowsAppSDK|UseWinUI/.test(files[n]))) add('desktop','winui','WinUI project');
  if(!candidates.length && (deps.next || deps.react)) add('website',deps.next?'next':'react','Web dependency; confirm website purpose');
  if(candidates.length!==1) return {needsInput:true,candidates,reason:'Choose target component and platform explicitly'};
  return {...candidates[0],needsInput:false,candidates};
}
