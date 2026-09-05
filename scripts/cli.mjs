#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { route, detect, formatRouteReport, formatTriageReport } from '../src/router.mjs';

function args(values) {
  const out={enable:[],disable:[],risks:[]};
  for(let i=0;i<values.length;i++) {
    const key=values[i];
    if(!key.startsWith('--')) continue;
    const name=key.slice(2).replace(/-([a-z])/g,(_,x)=>x.toUpperCase());
    const value=values[++i];
    if(value===undefined || value.startsWith('--')) throw new Error(`${key} needs a value`);
    out[name]=['enable','disable','risks'].includes(name)?value.split(',').filter(Boolean):value;
  }
  return out;
}
try {
  const [command,...rest]=process.argv.slice(2);
  if(command==='route') console.log(JSON.stringify(route(args(rest)),null,2));
  else if(command==='report') console.log(formatRouteReport(route(args(rest))));
  else if(command==='triage') console.log(formatTriageReport());
  else if(command==='detect') {
    const file=args(rest).file;
    if(!file) throw new Error('detect requires --file with a JSON map of relative file names to contents');
    console.log(JSON.stringify(detect(JSON.parse(readFileSync(file,'utf8'))),null,2));
  } else throw new Error('Usage: cli.mjs <route|report> --platform mobile --framework flutter --task implementation [--target ios]; cli.mjs detect --file files.json; or cli.mjs triage');
} catch(error) {
  console.error(`skill-router: ${error.message}`);
  process.exitCode=1;
}
