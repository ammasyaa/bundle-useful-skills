import { lstatSync, readdirSync } from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';

export function resolveInside(root,relativePath) {
  if(typeof relativePath!=='string'||!relativePath||isAbsolute(relativePath)||relativePath.includes('\0')) throw new Error(`Unsafe path: ${relativePath}`);
  const resolvedRoot=resolve(root);
  const result=resolve(resolvedRoot,relativePath);
  const rel=relative(resolvedRoot,result);
  if(!rel||rel.startsWith('..')||isAbsolute(rel)||rel.includes(':')) throw new Error(`Path resolves outside root: ${relativePath}`);
  return result;
}

export function listSafeFiles(root,prefix='') {
  const resolvedRoot=resolve(root);
  const directory=prefix?resolveInside(resolvedRoot,prefix):resolvedRoot;
  const directoryStat=lstatSync(directory);
  rejectIndirect(directoryStat,prefix||'.');
  if(!directoryStat.isDirectory()) throw new Error(`Expected directory: ${prefix||'.'}`);
  const out=[];
  const seen=new Set();
  for(const name of readdirSync(directory).sort()) {
    const relativeName=prefix?join(prefix,name):name;
    const normalized=relativeName.replaceAll('\\','/');
    const collisionKey=process.platform==='win32'?normalized.toLowerCase():normalized;
    if(seen.has(collisionKey)) throw new Error(`Path normalization collision: ${normalized}`);
    seen.add(collisionKey);
    const path=resolveInside(resolvedRoot,relativeName);
    const stat=lstatSync(path);
    rejectIndirect(stat,normalized);
    if(stat.isDirectory()) out.push(...listSafeFiles(resolvedRoot,relativeName));
    else if(stat.isFile()) out.push(normalized);
    else throw new Error(`Unsupported special file: ${normalized}`);
  }
  return out;
}

export function assertRegularFileInside(root,relativePath) {
  const path=resolveInside(root,relativePath);
  const stat=lstatSync(path);
  rejectIndirect(stat,relativePath);
  if(!stat.isFile()) throw new Error(`Expected regular file: ${relativePath}`);
  return path;
}

function rejectIndirect(stat,path) {
  if(stat.isSymbolicLink()) throw new Error(`Symbolic link or reparse point is not allowed: ${path}`);
}
