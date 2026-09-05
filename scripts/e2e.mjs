#!/usr/bin/env node
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const installer=join(projectRoot,'scripts','install-global.mjs');
const doctor=join(projectRoot,'scripts','doctor.mjs');
let options;
let testHome;
let passed=false;

try {
  options=parse(process.argv.slice(2));
  testHome=mkdtempSync(join(tmpdir(),'bundle-useful-skills-e2e-'));
  const installArgs=['--target','all','--home',testHome,...(options.routerOnly?['--router-only']:[])];
  console.log('E2E: install isolated hosts');
  runNode(installer,installArgs,0);

  console.log('E2E: check host rules and installation state');
  const initial=runDoctor(options.routerOnly?1:0);
  for(const report of initial) assertHost(report,options.routerOnly);

  console.log('E2E: run installed-router scenarios');
  let routeChecks=0;
  for(const [label,skillRoot] of hostRoots()) {
    routeChecks+=verifyInstalledRoutes(label,join(skillRoot,'development-skill-router'));
  }
  assert(routeChecks===8,`expected 8 installed route checks, received ${routeChecks}`);

  console.log('E2E: prove reinstall idempotency');
  const repeat=runNode(installer,installArgs,0);
  assert(occurrences(repeat.stdout,'router already current')===2,'repeat install did not keep both routers');
  if(!options.routerOnly) assert(occurrences(repeat.stdout,'48 current')===2,'repeat install did not keep all capabilities');

  if(!options.routerOnly) {
    console.log('E2E: inspect inventory, detect tampering, and repair from backup');
    for(const [label,skillRoot] of hostRoots()) inspectFullInventory(label,skillRoot);
    verifyTamperRepair();
  }

  console.log('E2E: confirm final host state');
  const finalReports=runDoctor(options.routerOnly?1:0);
  for(const report of finalReports) assertHost(report,options.routerOnly);

  for(const report of finalReports) {
    const label=report.target==='codex'?'Codex':'Antigravity';
    const suffix=options.routerOnly?'':`, pinned=${report.counts['managed-pinned']}`;
    console.log(`${label}: router=${report.routerStatus}, globalRule=${report.globalRule}${suffix}`);
  }
  console.log('Installed routes: 8/8 passed');
  console.log('Idempotent reinstall: passed');
  if(!options.routerOnly) console.log('Tamper detection and backup repair: passed');
  console.log(`E2E PASS (${options.routerOnly?'router-only':'full'})`);
  passed=true;
} catch(error) {
  console.error(`E2E FAIL: ${error.message}`);
  if(testHome) console.error(`Test home: ${testHome}`);
  process.exitCode=1;
} finally {
  if(testHome&&!options.keepTemp&&(passed||options.cleanupOnFailure)) safeRemoveTestHome(testHome);
  else if(testHome&&passed) console.log(`Test home retained: ${testHome}`);
}

function parse(values){
  const out={routerOnly:false,keepTemp:false,cleanupOnFailure:false};
  for(const value of values){
    if(value==='--router-only') out.routerOnly=true;
    else if(value==='--keep-temp') out.keepTemp=true;
    else if(value==='--cleanup-on-failure') out.cleanupOnFailure=true;
    else if(value==='--help') {
      console.log('Usage: node scripts/e2e.mjs [--router-only] [--keep-temp] [--cleanup-on-failure]');
      process.exit(0);
    } else throw new Error(`Unknown argument: ${value}`);
  }
  return out;
}

function hostRoots(){
  return [
    ['Codex',join(testHome,'.codex','skills')],
    ['Antigravity',join(testHome,'.gemini','config','skills')]
  ];
}

function runNode(script,args,expectedStatus){
  const result=spawnSync(process.execPath,[script,...args],{
    cwd:projectRoot,
    encoding:'utf8',
    maxBuffer:10*1024*1024,
    env:{...process.env,NO_COLOR:'1'}
  });
  if(result.error) throw result.error;
  if(result.status!==expectedStatus) {
    const output=[result.stdout,result.stderr].filter(Boolean).join('\n').trim();
    throw new Error(`${basename(script)} exited ${result.status}; expected ${expectedStatus}${output?`\n${output}`:''}`);
  }
  return result;
}

function runDoctor(expectedStatus){
  const result=runNode(doctor,['--target','all','--home',testHome],expectedStatus);
  try {
    const reports=JSON.parse(result.stdout);
    assert(Array.isArray(reports)&&reports.length===2,'doctor did not return two host reports');
    return reports;
  } catch(error) {
    if(error.message.startsWith('doctor did not')) throw error;
    throw new Error(`doctor returned invalid JSON: ${error.message}`);
  }
}

function assertHost(report,routerOnly){
  assert(report.routerStatus==='managed-current',`${report.target} router is ${report.routerStatus}`);
  assert(report.globalRule===true,`${report.target} global rule is not current`);
  if(routerOnly) {
    assert(report.ready===false,`${report.target} router-only install unexpectedly reported full readiness`);
    assert(report.counts.missing===48,`${report.target} router-only install did not report 48 missing capabilities`);
  } else {
    assert(report.ready===true,`${report.target} full install is not ready`);
    assert(report.counts['managed-pinned']===48,`${report.target} does not have 48 managed capabilities`);
  }
}

function verifyInstalledRoutes(label,routerRoot){
  const cli=join(routerRoot,'scripts','cli.mjs');
  const cases=[
    {args:['triage'],includes:['Skill bundle: development-skill-router (triage only; no development capability applies)']},
    {args:['report','--platform','mobile','--framework','flutter','--task','implementation','--target','ios'],includes:['flutter-apply-architecture-best-practices','test-driven-development']},
    {args:['report','--platform','website','--framework','next','--task','implementation'],includes:['vercel-react-best-practices'],excludes:['flutter-apply-architecture-best-practices']},
    {args:['report','--platform','desktop','--framework','winui','--task','verify','--target','windows'],includes:['winui-dev-workflow','verification-before-completion']}
  ];
  for(const scenario of cases){
    const result=runNode(cli,scenario.args,0);
    for(const expected of scenario.includes) assert(result.stdout.includes(expected),`${label} route omitted ${expected}`);
    for(const excluded of scenario.excludes??[]) assert(!result.stdout.includes(excluded),`${label} route unexpectedly included ${excluded}`);
  }
  return cases.length;
}

function inspectFullInventory(label,skillRoot){
  const directories=readdirSync(skillRoot,{withFileTypes:true}).filter(entry=>entry.isDirectory());
  assert(directories.length===49,`${label} installed ${directories.length} skill directories; expected 49`);
  for(const entry of directories){
    const root=join(skillRoot,entry.name);
    const skillPath=join(root,'SKILL.md');
    assert(existsSync(skillPath),`${label}/${entry.name} is missing SKILL.md`);
    assert(frontmatterName(readFileSync(skillPath,'utf8'))===entry.name,`${label}/${entry.name} has a mismatched frontmatter name`);
    if(entry.name==='development-skill-router') continue;
    assert(existsSync(join(root,'BUNDLE_README.md')),`${label}/${entry.name} is missing author attribution`);
    assert(readFileSync(join(root,'BUNDLE_README.md'),'utf8').includes('Thank you to'),`${label}/${entry.name} does not thank its author`);
    const source=JSON.parse(readFileSync(join(root,'BUNDLE_SOURCE.json'),'utf8'));
    assert(Array.isArray(source.files)&&source.files.length>0,`${label}/${entry.name} has no file inventory`);
  }
}

function verifyTamperRepair(){
  const skillPath=join(testHome,'.codex','skills','test-driven-development','SKILL.md');
  writeFileSync(skillPath,`${readFileSync(skillPath,'utf8')}\nE2E tamper fixture\n`);
  const tampered=runNode(doctor,['--target','codex','--home',testHome],1);
  const [report]=JSON.parse(tampered.stdout);
  const capability=report.capabilities.find(item=>item.invocation==='test-driven-development');
  assert(capability?.status==='managed-modified','doctor did not detect the modified capability');

  const repaired=runNode(installer,['--target','codex','--home',testHome,'--replace-existing'],0);
  assert(repaired.stdout.includes('1 replaced'),'repair did not replace exactly one capability');
  const backupRoot=join(testHome,'.codex','bundle-useful-skills-backups');
  const runs=readdirSync(backupRoot,{withFileTypes:true}).filter(entry=>entry.isDirectory());
  assert(runs.length===1,'repair did not create exactly one backup run');
  assert(existsSync(join(backupRoot,runs[0].name,'test-driven-development','SKILL.md')),'repair backup is missing the original skill');
}

function frontmatterName(body){return body.match(/^name:\s*["']?([^\r\n"']+)/m)?.[1]?.trim()}
function occurrences(body,needle){return body.split(needle).length-1}
function assert(condition,message){if(!condition) throw new Error(message)}
function safeRemoveTestHome(path){
  const temp=resolve(tmpdir()),resolved=resolve(path),rel=relative(temp,resolved);
  if(!rel||rel.startsWith('..')||rel.includes(':')||!basename(resolved).startsWith('bundle-useful-skills-e2e-')) throw new Error(`refusing to remove unsafe test path ${path}`);
  rmSync(resolved,{recursive:true,force:true});
}
