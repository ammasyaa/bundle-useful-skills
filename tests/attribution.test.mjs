import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('generated third-party links never contain null source segments', () => {
  const body=readFileSync('THIRD_PARTY_SKILLS.md','utf8');
  assert.doesNotMatch(body,/\/blob\/null\/null/);
});
