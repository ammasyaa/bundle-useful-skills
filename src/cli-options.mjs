const common={
  platform:'value',framework:'value',target:'value',task:'value',scope:'value',mode:'value',renderer:'value',database:'value',
  description:'value',director:'value',justification:'value',enable:'list',disable:'list',risks:'list'
};

const schemas={
  route:common,
  report:common,
  detect:{file:'value'},
  triage:{},
  search:{root:'value',task:'value',description:'value',json:'boolean'}
};

export function parseCommandArgs(command,values=[]) {
  const schema=schemas[command];
  if(!schema) throw new Error(usageFor(command));
  const out={enable:[],disable:[],risks:[]};
  const seen=new Set();
  for(let i=0;i<values.length;i++) {
    const option=values[i];
    if(!option.startsWith('--')) throw new Error(`Unexpected positional argument for ${command}`);
    const raw=option.slice(2);
    const name=raw.replace(/-([a-z])/g,(_,letter)=>letter.toUpperCase());
    const type=schema[name];
    if(!type) throw new Error(`Unknown option --${raw} for ${command}`);
    if(type!=='list'&&seen.has(name)) throw new Error(`Duplicate option --${raw}`);
    seen.add(name);
    if(type==='boolean') {
      out[name]=true;
      continue;
    }
    const value=values[++i];
    if(value===undefined||value.startsWith('--')) throw new Error(`${option} needs a value`);
    if(type==='list') out[name].push(...value.split(',').map(item=>item.trim()).filter(Boolean));
    else out[name]=value;
  }
  return out;
}

export function usageFor(command) {
  const suffix={
    route:'route --platform <platform> --framework <framework> [options]',
    report:'report --platform <platform> --framework <framework> [options]',
    detect:'detect --file <file-map.json>',
    triage:'triage',
    search:'search --root <repository> [--task <phase>] [--description <text>] [--json]'
  }[command];
  return suffix?`Usage: cli.mjs ${suffix}`:'Usage: cli.mjs <route|report|detect|triage|search> [options]';
}
