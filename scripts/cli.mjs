#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { route, detect, formatRouteReport, formatTriageReport } from '../src/router.mjs';
import { parseCommandArgs, usageFor } from '../src/cli-options.mjs';
try {
  const [command,...rest]=process.argv.slice(2);
  const options=parseCommandArgs(command,rest);
  if(command==='route') console.log(JSON.stringify(route(options),null,2));
  else if(command==='report') console.log(formatRouteReport(route(options)));
  else if(command==='triage') console.log(formatTriageReport());
  else if(command==='detect') {
    const file=options.file;
    if(!file) throw new Error('detect requires --file with a JSON map of relative file names to contents');
    console.log(JSON.stringify(detect(JSON.parse(readFileSync(file,'utf8'))),null,2));
  } else throw new Error(usageFor(command));
} catch(error) {
  console.error(`skill-router: ${error.message}`);
  process.exitCode=1;
}
