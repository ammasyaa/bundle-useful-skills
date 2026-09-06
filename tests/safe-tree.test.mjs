import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { listSafeFiles, resolveInside } from '../src/safe-tree.mjs';

function fixture(t) {
  const root=mkdtempSync(join(tmpdir(),'bundle-safe-tree-'));
  t.after(()=>rmSync(root,{recursive:true,force:true}));
  return root;
}

test('lists only regular files under a root',t=>{
  const root=fixture(t);
  mkdirSync(join(root,'nested'));
  writeFileSync(join(root,'nested','a.txt'),'a');
  writeFileSync(join(root,'b.txt'),'b');
  assert.deepEqual(listSafeFiles(root),['b.txt','nested/a.txt']);
});

test('rejects absolute paths and parent traversal',t=>{
  const root=fixture(t);
  assert.throws(()=>resolveInside(root,'../outside.txt'),/outside|unsafe/i);
  assert.throws(()=>resolveInside(root,join(root,'inside.txt')),/absolute|unsafe/i);
});

test('rejects symbolic links when the operating system permits the fixture',t=>{
  const root=fixture(t);
  const outside=join(root,'outside.txt');
  writeFileSync(outside,'outside');
  try { symlinkSync(outside,join(root,'linked.txt'),'file'); }
  catch(error) {
    if(['EPERM','EACCES','UNKNOWN'].includes(error.code)) return t.skip(`symlink fixture unavailable: ${error.code}`);
    throw error;
  }
  assert.throws(()=>listSafeFiles(root),/symbolic link|reparse/i);
});
