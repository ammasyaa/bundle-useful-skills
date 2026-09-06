const policyLine=/^policy:\s*(?:#.*)?$/;
const implicitLine=/^(\s{2})allow_implicit_invocation:\s*(?:true|false)\s*(?:#.*)?$/;

export function applyExplicitInvocationPolicy(source='') {
  const normalized=source.replace(/\r\n/g,'\n');
  const lines=normalized?normalized.replace(/\n+$/,'').split('\n'):[];
  const policyIndexes=lines.map((line,index)=>policyLine.test(line)?index:-1).filter(index=>index>=0);
  if(policyIndexes.length>1) throw new Error('Duplicate policy blocks in agents/openai.yaml');
  if(policyIndexes.length===0) {
    if(lines.length) lines.push('');
    lines.push('policy:','  allow_implicit_invocation: false');
    return `${lines.join('\n')}\n`;
  }
  const start=policyIndexes[0];
  let end=lines.length;
  for(let index=start+1;index<lines.length;index++) {
    if(/^\S/.test(lines[index])&&!/^#/.test(lines[index])) { end=index; break; }
  }
  const matches=[];
  for(let index=start+1;index<end;index++) if(implicitLine.test(lines[index])) matches.push(index);
  if(matches.length>1) throw new Error('Duplicate allow_implicit_invocation fields in agents/openai.yaml');
  if(matches.length===1) lines[matches[0]]='  allow_implicit_invocation: false';
  else lines.splice(start+1,0,'  allow_implicit_invocation: false');
  return `${lines.join('\n')}\n`;
}

export function hasExplicitInvocationPolicy(source='') {
  try {
    const lines=source.replace(/\r\n/g,'\n').split('\n');
    const policyIndexes=lines.map((line,index)=>policyLine.test(line)?index:-1).filter(index=>index>=0);
    if(policyIndexes.length!==1) return false;
    const start=policyIndexes[0];
    let matches=0;
    for(let index=start+1;index<lines.length;index++) {
      if(/^\S/.test(lines[index])&&!/^#/.test(lines[index])) break;
      if(/^\s{2}allow_implicit_invocation:\s*false\s*(?:#.*)?$/.test(lines[index])) matches++;
    }
    return matches===1;
  } catch { return false; }
}
