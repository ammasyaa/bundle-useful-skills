import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyEvidence, validateEvidenceMetadata } from '../src/evidence.mjs';

test('classifies repository, inline, and documentation evidence',()=>{
  assert.equal(classifyEvidence('LICENSE'),'repository');
  assert.equal(classifyEvidence('skills/example/LICENSE.txt'),'repository');
  assert.equal(classifyEvidence('README declaration; no standalone license file'),'inline');
  assert.equal(classifyEvidence('Official documentation'),'documentation');
});

test('rejects vague or unsafe evidence',()=>{
  assert.throws(()=>classifyEvidence('../LICENSE'),/invalid license evidence/i);
  assert.throws(()=>classifyEvidence('trust me'),/invalid license evidence/i);
});

test('requires repository notices and mode-compatible license evidence',()=>{
  assert.throws(()=>validateEvidenceMetadata({id:'x',installMode:'upstream',license:'MIT',licenseEvidence:'Official documentation',notice:null}),/upstream.*evidence/i);
  assert.throws(()=>validateEvidenceMetadata({id:'x',installMode:'upstream',license:'MIT',licenseEvidence:'LICENSE',notice:'See the website'}),/notice/i);
  assert.doesNotThrow(()=>validateEvidenceMetadata({id:'x',installMode:'documentation',license:'Reference only',licenseEvidence:'Official documentation',notice:null}));
});
