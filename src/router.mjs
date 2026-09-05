import { readFileSync } from 'node:fs';
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
export const registry = read('../registry/skills.json');
export const profiles = read('../profiles/index.json');
export const rules = read('../registry/compatibility.json');
const tasks = ['brainstorm','plan','implementation','architecture','design','polish','motion','research','visual-reference','filter','bug','database','api','security','performance','refactor','testing','review','verify','release'];
const uiTasks = ['design','polish','motion','research','visual-reference','filter'];
const riskPattern = /\b(auth(?:entication|orization)?|payments?|pii|location|identity|secrets?|tokens?|uploads?|webhooks?|database permissions|admin|account recovery|password|login)\b/i;

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
export function route(options={},extensions=[]) {
  const ctx={task:'implementation',scope:'client',mode:'recommended',enable:[],disable:[],risks:[],...options};
  const profile=profiles.find(p=>p.platform===ctx.platform && p.framework===ctx.framework);
  if(!profile) throw new Error('Unsupported platform/framework. Choose an explicit supported profile.');
  if(!tasks.includes(ctx.task)) throw new Error(`Unknown task: ${ctx.task}`);
  if(!['minimal','recommended','full'].includes(ctx.mode)) throw new Error('Unknown mode');
  if(!['client','database','api','backend','renderer','native'].includes(ctx.scope)) throw new Error('Unknown scope');
  for(const key of ['enable','disable','risks']) if(!Array.isArray(ctx[key]) || !ctx[key].every(v=>typeof v==='string')) throw new Error(`${key} must be an array of strings`);
  if(ctx.renderer && !(ctx.platform==='desktop' && ['tauri','electron'].includes(ctx.framework) && ctx.renderer==='react')) throw new Error('Renderer applies only to React in Tauri/Electron');
  if(ctx.target && !profile.targets.includes(ctx.target)) throw new Error('Target incompatible with profile');
  if(ctx.database && !['postgres','firebase'].includes(ctx.database)) throw new Error('Unsupported database; add a reviewed custom specialist');
  if(extensions.some(s=>registry.some(r=>r.id===s.id))) throw new Error('Custom IDs must not replace built-in security or compatibility rules');
  const catalog=[...registry,...extensions];
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
    if(ctx.mode!=='minimal' && ctx.platform==='mobile' && ctx.target) add(ctx.target==='ios'?'mobile-ios-design':'mobile-android-design','Platform UX principles only');
  }
  if(ctx.task==='polish') add('impeccable','Review existing product design');
  if(ctx.task==='motion') add('emil-design-eng','Interaction judgment; translate to native framework');
  if(ctx.task==='research') add('ui-ux-pro-max','Reference research only');
  if(ctx.task==='visual-reference' && ctx.platform==='mobile') add('taste-mobile-imagegen','Mobile reference image generation only');
  if(ctx.task==='review' && ctx.platform==='website') add('web-design-guidelines','Website UX and accessibility review');
  if(ctx.task==='filter') add('antislop','Final filter below project design system');
  if(ctx.task==='release') add('release-gate','Platform release evidence');
  for(const id of ctx.enable) add(id,'Explicitly enabled');
  for(const id of ctx.disable) {
    if(!catalog.some(s=>s.id===id)) throw new Error(`Unknown disabled skill: ${id}`);
    if(sensitive && id==='security-gate') throw new Error('Cannot disable mandatory security gate');
    if(ctx.task==='release' && ['release-gate','verification-before-completion'].includes(id)) throw new Error('Cannot disable release verification');
    chosen.delete(id);
  }
  const active=[...chosen.keys()];
  const selected=validateSelection(active,ctx,catalog);
  const warnings=[];
  if(active.length>5) warnings.push('Above five active capabilities; consider sequential passes.');
  if(active.length>7 && !(typeof ctx.justification==='string' && ctx.justification.trim())) throw new Error('Above seven active capabilities requires a justification');
  if(backendOnly && !ctx.database && ctx.task!=='api') warnings.push('No data specialist selected: identify the actual backend before implementation.');
  const references=[`references/${ctx.platform}.md`];
  if(sensitive) references.push('references/security.md');
  if(ctx.task==='release') references.push('references/release.md');
  return {schemaVersion:1,platform:ctx.platform,framework:ctx.framework,task:ctx.task,frameworkAuthority:profile.authority,active,
    selections:selected.map(s=>({id:s.id,reason:chosen.get(s.id),authority:s.renderer && ctx.platform==='desktop'?'renderer':s.authority,source:s.source,installMode:s.installMode})),
    references,authorityOrder:rules.authorityOrder,warnings,justification:ctx.justification??null,
    available:ctx.mode==='full'?catalog.filter(s=>compatible(s,ctx)).map(s=>s.id):active,
    completion:['Run checks appropriate to the change','Report actual evidence and untested behavior']};
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
