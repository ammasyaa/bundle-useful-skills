import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateRegistryData } from '../src/registry-validation.mjs';

const registry=JSON.parse(readFileSync('registry/skills.json','utf8'));
const profiles=JSON.parse(readFileSync('profiles/index.json','utf8'));

const clone=value=>structuredClone(value);

test('current registry relationships are valid',()=>{
  assert.doesNotThrow(()=>validateRegistryData(registry,profiles));
});

test('rejects unknown enum values',()=>{
  const skills=clone(registry);
  skills[0].trust='popular';
  assert.throws(()=>validateRegistryData(skills,profiles),/trust/i);
});

test('rejects unsafe upstream source paths',()=>{
  const skills=clone(registry);
  skills.find(skill=>skill.installMode.startsWith('upstream')).source.path='../SKILL.md';
  assert.throws(()=>validateRegistryData(skills,profiles),/source path/i);
});

test('rejects profile authorities incompatible with their profile',()=>{
  const lanes=clone(profiles);
  lanes[0].authority='flutter-architecture';
  assert.throws(()=>validateRegistryData(registry,lanes),/authority.*incompatible/i);
});

test('rejects non-HTTPS documentation sources',()=>{
  const skills=clone(registry);
  skills.find(skill=>skill.installMode==='documentation').source.documentation='http://example.test/docs';
  assert.throws(()=>validateRegistryData(skills,profiles),/documentation url/i);
});
