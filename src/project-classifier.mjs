export function classifyProject(evidence={signals:[]}) {
  const signals=evidence.signals??[];
  const candidates=[];
  const unknowns=[],conflicts=[];
  const deps=new Map(signals.filter(item=>item.type==='dependency').map(item=>[item.value,item]));
  const files=signals.filter(item=>item.type==='file');
  const dirs=signals.filter(item=>item.type==='directory');
  const manifests=signals.filter(item=>item.type==='manifest');
  const hasFile=pattern=>files.find(item=>pattern.test(item.value));
  const hasDir=name=>dirs.find(item=>item.value===name);
  const dependency=name=>deps.get(name);
  const shell=[];

  if(dependency('@tauri-apps/api')||hasFile(/(?:^|\/)src-tauri\/(?:tauri\.conf\.json|Cargo\.toml)$/i)||hasDir('src-tauri')) {
    shell.push('tauri');
    add('desktop','tauri',{renderer:dependency('react')?'react':undefined},'Tauri shell evidence',matchEvidence(/tauri|src-tauri|react/i));
  }
  if(dependency('electron')||hasFile(/electron(?:-builder)?\.(?:json|ya?ml|js|cjs|mjs)$/i)) {
    shell.push('electron');
    add('desktop','electron',{renderer:dependency('react')?'react':undefined},'Electron shell evidence',matchEvidence(/electron|react/i));
  }
  if(manifests.some(item=>item.value==='winui')) add('desktop','winui',{target:'windows'},'WinUI project evidence',matchEvidence(/winui|csproj|windowsappsdk/i));

  const flutter=manifests.find(item=>item.value==='flutter');
  if(flutter) classifyFlutter();

  if(dependency('expo')) add('mobile','expo',singleMobileTarget(),'Expo dependency',matchEvidence(/expo|ios|android/i));
  else if(dependency('react-native')) add('mobile','react-native',singleMobileTarget(),'React Native dependency',matchEvidence(/react-native|ios|android/i));

  if(!dependency('expo')&&!dependency('react-native')&&!flutter) {
    if(hasFile(/(?:^|\/)AndroidManifest\.xml$/i)||hasFile(/(?:^|\/)build\.gradle(?:\.kts)?$/i)) add('mobile','native-android',{target:'android'},'Android native project files',matchEvidence(/android|gradle/i));
    if(hasFile(/(?:^|\/)(?:Podfile|Package\.swift)$/i)&&hasDir('ios')) add('mobile','native-ios',{target:'ios'},'iOS native project files',matchEvidence(/ios|Podfile|Package\.swift/i));
  }

  if(shell.length===0) {
    if(dependency('next')) add('website','next',{},'Next.js dependency',matchEvidence(/next/i));
    else if(dependency('react')&&!dependency('react-native')&&!dependency('expo')) add('website','react',{},'React dependency without a native shell',matchEvidence(/react/i));
    else if(hasFile(/(?:^|\/)index\.html$/i)) add('website','web',{},'Web entry document',matchEvidence(/index\.html/i));
  }

  const unique=dedupe(candidates);
  if(unique.length===0) unknowns.push('No supported platform/framework lane reached sufficient confidence.');
  if(unique.length>1) conflicts.push('Multiple viable product lanes were detected; choose the component or target to work on.');
  const needsInput=unique.length!==1||unknowns.length>0||conflicts.length>0;
  return {schemaVersion:1,candidates:unique,confidence:needsInput?(unique.length?'medium':'low'):'high',needsInput,conflicts,unknowns};

  function classifyFlutter() {
    const mobileTargets=['ios','android'].filter(hasDir);
    const desktopTargets=['windows','macos'].filter(hasDir);
    if(mobileTargets.length&&desktopTargets.length) {
      add('mobile','flutter',{},'Flutter manifest with mobile targets',[flutter,...mobileTargets.map(hasDir)]);
      add('desktop','flutter',{},'Flutter manifest with desktop targets',[flutter,...desktopTargets.map(hasDir)]);
      unknowns.push('Flutter product surface and target require an explicit choice.');
    } else if(mobileTargets.length) {
      add('mobile','flutter',mobileTargets.length===1?{target:mobileTargets[0]}:{},'Flutter mobile project evidence',[flutter,...mobileTargets.map(hasDir)]);
      if(mobileTargets.length!==1) unknowns.push('Flutter target requires an explicit iOS or Android choice.');
    } else if(desktopTargets.length) {
      add('desktop','flutter',desktopTargets.length===1?{target:desktopTargets[0]}:{},'Flutter desktop project evidence',[flutter,...desktopTargets.map(hasDir)]);
      if(desktopTargets.length!==1) unknowns.push('Flutter target requires an explicit Windows or macOS choice.');
    } else unknowns.push('Flutter manifest found without product target evidence.');
  }
  function add(platform,framework,extra,reason,matched) {
    candidates.push({platform,framework,...extra,confidence:'high',reason,evidence:(matched??[]).filter(Boolean).map(item=>item.path)});
  }
  function singleMobileTarget() {
    const values=['ios','android'].filter(hasDir);
    return values.length===1?{target:values[0]}:{};
  }
  function matchEvidence(pattern) { return signals.filter(item=>pattern.test(`${item.value} ${item.path}`)); }
}

function dedupe(candidates) {
  const result=new Map();
  for(const candidate of candidates) {
    const key=`${candidate.platform}/${candidate.framework}/${candidate.target??''}`;
    if(!result.has(key)) result.set(key,candidate);
  }
  return [...result.values()];
}
