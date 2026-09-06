#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { route, detect, formatRouteReport, formatTriageReport } from '../src/router.mjs';
import { parseCommandArgs, usageFor } from '../src/cli-options.mjs';
import { formatSearchReport, searchProject } from '../src/search.mjs';
try {
  const [command,...rest]=process.argv.slice(2);
  const options=parseCommandArgs(command,rest);
  if(command==='route') console.log(JSON.stringify(route(options),null,2));
  else if(command==='report') console.log(formatRouteReport(route(options)));
  else if(command==='triage') console.log(formatTriageReport());
  else if(command==='search') {
    if(!options.root) throw new Error('search requires --root with a repository directory');
    const result=searchProject(options);
    console.log(options.json?JSON.stringify(result,null,2):formatSearchReport(result));
  }
  else if(command==='detect') {
    const file=options.file;
    if(!file) throw new Error('detect requires --file with a JSON map of relative file names to contents');
    console.log(JSON.stringify(detect(JSON.parse(readFileSync(file,'utf8'))),null,2));
  } else throw new Error(usageFor(command));
} catch(error) {
  console.error(`skill-router: ${error.message}`);
  process.exitCode=1;
}
