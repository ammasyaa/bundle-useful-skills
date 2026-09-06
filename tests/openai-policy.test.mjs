import test from 'node:test';
import assert from 'node:assert/strict';
import { applyExplicitInvocationPolicy, hasExplicitInvocationPolicy } from '../src/openai-policy.mjs';

test('creates explicit-only policy when metadata is absent',()=>{
  const result=applyExplicitInvocationPolicy('');
  assert.equal(result,'policy:\n  allow_implicit_invocation: false\n');
  assert.equal(hasExplicitInvocationPolicy(result),true);
});

test('preserves interface and dependencies while appending policy',()=>{
  const source='interface:\n  display_name: Demo\ndependencies:\n  tools:\n    - type: mcp\n';
  const result=applyExplicitInvocationPolicy(source);
  assert.match(result,/interface:\n  display_name: Demo/);
  assert.match(result,/dependencies:\n  tools:\n    - type: mcp/);
  assert.match(result,/policy:\n  allow_implicit_invocation: false/);
});

test('replaces an enabled policy and preserves adjacent fields',()=>{
  const source='policy:\n  allow_implicit_invocation: true\n  another_setting: keep\n';
  const result=applyExplicitInvocationPolicy(source);
  assert.match(result,/allow_implicit_invocation: false/);
  assert.match(result,/another_setting: keep/);
});

test('rejects duplicate policy blocks rather than guessing',()=>{
  assert.throws(()=>applyExplicitInvocationPolicy('policy:\n  one: true\npolicy:\n  two: true\n'),/duplicate policy/i);
});
