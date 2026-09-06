import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateWorkflowDependencies, requiredSkillNames, validateDependencyDocument } from '../src/dependencies.mjs';

const catalog=[{id:'expo-overview'},{id:'writing-plans'}];

test('reads required skill names from schema version 2 records',()=>{
  assert.deepEqual(requiredSkillNames({requiredSkills:['expo-router']}),['expo-router']);
});

test('dependency validation rejects unknown parents and cycles',()=>{
  assert.throws(()=>validateDependencyDocument({schemaVersion:2,groups:{missing:{requiredSkills:[],optionalSkills:[],hostTools:[],reason:'x'}}},catalog),/unknown dependency parent/i);
  const cyclic={schemaVersion:2,groups:{'expo-overview':{requiredSkills:['writing-plans'],optionalSkills:[],hostTools:[],reason:'x'},'writing-plans':{requiredSkills:['expo-overview'],optionalSkills:[],hostTools:[],reason:'x'}}};
  assert.throws(()=>validateDependencyDocument(cyclic,catalog),/cycle/i);
});

test('workflow readiness separates required, optional, and conditional gaps',()=>{
  const groups={
    'expo-overview':{requiredSkills:['expo-router'],optionalSkills:['expo-animation'],hostTools:[],reason:'Expo tools'},
    'writing-plans':{requiredSkills:[],optionalSkills:[],hostTools:[{id:'plan-execution',required:'conditional',when:'executing a plan'}],reason:'Plan execution'}
  };
  const result=evaluateWorkflowDependencies(groups,new Map([['expo-overview','managed-pinned'],['writing-plans','managed-pinned']]));
  assert.equal(result.workflowReady,false);
  assert.deepEqual(result.missingRequired,['expo-overview -> expo-router']);
  assert.deepEqual(result.optionalGaps,['expo-overview -> expo-animation']);
  assert.deepEqual(result.conditionalGaps,[{parent:'writing-plans',tool:'plan-execution',when:'executing a plan'}]);
});
