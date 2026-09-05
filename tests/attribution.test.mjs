import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('generated third-party links never contain null source segments', () => {
  const body=readFileSync('THIRD_PARTY_SKILLS.md','utf8');
  assert.doesNotMatch(body,/\/blob\/null\/null/);
});

test('every external capability has a README attribution card thanking its author', () => {
  const skills=JSON.parse(readFileSync('registry/skills.json','utf8')).filter(s=>s.trust!=='internal');
  for(const skill of skills) {
    const path=`catalog/${skill.id}/README.md`;
    assert.ok(existsSync(path),`${path} must exist`);
    const body=readFileSync(path,'utf8');
    assert.match(body,new RegExp(`Thank you to \\*\\*${escape(skill.author)}\\*\\*`));
    assert.match(body,/\[Original source\]\(/);
    assert.match(body,/third-party instructions are not copied/i);
  }
});

function escape(value){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
