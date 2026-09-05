import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const skills=JSON.parse(readFileSync('registry/skills.json','utf8'));
const invocations=JSON.parse(readFileSync('registry/invocations.json','utf8')).skills;
const dependencies=JSON.parse(readFileSync('registry/dependencies.json','utf8')).groups;

test('generated third-party links never contain null source segments', () => {
  const body=readFileSync('THIRD_PARTY_SKILLS.md','utf8');
  assert.doesNotMatch(body,/\/blob\/null\/null/);
});

test('every external capability has a README attribution card thanking its author', () => {
  for(const skill of skills.filter(item=>item.trust!=='internal')) {
    const path=`catalog/${skill.id}/README.md`;
    assert.ok(existsSync(path),`${path} must exist`);
    const body=readFileSync(path,'utf8');
    assert.match(body,new RegExp(`Thank you to \\*\\*${escape(skill.author)}\\*\\*`));
    assert.match(body,/\[Original source\]\(/);
    assert.match(body,/third-party instructions are not copied/i);
  }
});

test('README thanks every external creator and links every original source', () => {
  const readme=readFileSync('README.md','utf8');
  const unique=new Map();
  for(const skill of skills.filter(item=>item.trust!=='internal')) {
    const source=skill.source.repository||skill.source.documentation;
    unique.set(`${skill.author}|${source}`,{author:skill.author,source});
  }
  for(const {author,source} of unique.values()) {
    assert.ok(readme.includes(author),`README does not thank ${author}`);
    assert.ok(readme.includes(`](${source})`),`README does not link original source ${source}`);
  }
});

test('README names every installed and referenced capability', () => {
  const readme=readFileSync('README.md','utf8');
  const primary=skills.map(skill=>skill.installMode.startsWith('upstream')?(invocations[skill.id]??skill.id):skill.id);
  const transitive=Object.values(dependencies).flat();
  for(const name of [...primary,...transitive]) {
    assert.ok(readme.includes(`\`${name}\``),`README does not name ${name}`);
  }
});

function escape(value){return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
