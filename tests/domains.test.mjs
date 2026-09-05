import test from 'node:test';
import assert from 'node:assert/strict';
import { route, domains, profiles, registry, invocations } from '../src/router.mjs';

const businessProfiles = profiles.filter(p => (p.domain ?? 'engineering') !== 'engineering');
const businessDomains = [...new Set(businessProfiles.map(p => p.domain))];

test('every non-engineering lane resolves for every task in its domain', () => {
  for (const profile of businessProfiles) {
    for (const task of domains[profile.domain].tasks) {
      const result = route({ platform: profile.platform, framework: profile.framework, task });
      assert.ok(result.active.length > 0, `${profile.platform}/${profile.framework}/${task} selected nothing`);
      assert.equal(result.domain, profile.domain);
      assert.ok(result.references.includes(domains[profile.domain].reference));
    }
  }
});

test('every skill named by a domain rule exists and is compatible with the lane it is named in', () => {
  for (const [domain, def] of Object.entries(domains)) {
    if (def.builtin) continue;
    const named = new Set([def.context, ...Object.values(def.process ?? {})]);
    for (const ids of Object.values(def.specialists ?? {})) ids.forEach(id => named.add(id));
    for (const id of [...named]) {
      if (!id) continue;
      assert.ok(registry.some(s => s.id === id), `${domain} names unknown skill ${id}`);
    }
    for (const [lane, tasks] of Object.entries(def.laneSpecialists ?? {})) {
      assert.ok(profiles.some(p => p.domain === domain && p.framework === lane), `${domain} has rules for unknown lane ${lane}`);
      for (const ids of Object.values(tasks)) for (const id of ids) {
        const skill = registry.find(s => s.id === id);
        assert.ok(skill, `${domain}/${lane} names unknown skill ${id}`);
        assert.ok(skill.platforms.includes(domain), `${id} is not available on ${domain}`);
        assert.ok(!skill.frameworks.length || skill.frameworks.includes(lane), `${id} is not compatible with lane ${lane}`);
      }
    }
  }
});

test('engineering routes are unchanged by the domain layer', () => {
  const r = route({ platform: 'website', framework: 'react', task: 'implementation' });
  assert.equal(r.domain, 'engineering');
  assert.ok(r.active.includes('react-best-practices'));
  assert.ok(r.references.includes('references/website.md'));
  assert.ok(!r.active.some(id => /marketing|brand-bible|venture/.test(id)));
});

test('business lanes never borrow engineering framework authorities', () => {
  for (const profile of businessProfiles) {
    const r = route({ platform: profile.platform, framework: profile.framework, task: domains[profile.domain].tasks[0] });
    assert.ok(!r.active.some(id => /flutter|react|expo|tauri|electron|winui/.test(id)), `${profile.platform}/${profile.framework} leaked an engineering authority`);
  }
});

test('regulated language in the task description forces the compliance gate', () => {
  for (const description of ['health claims for a supplement', 'collecting personal data with consent', 'influencer testimonials', 'guaranteed results in 30 days', 'ads targeting minors']) {
    const r = route({ platform: 'marketing', framework: 'paid', task: 'production', description });
    assert.ok(r.active.includes('compliance-gate'), `"${description}" did not trigger compliance`);
    assert.ok(r.references.includes('references/compliance.md'));
  }
});

test('the compliance gate cannot be disabled once triggered', () => {
  assert.throws(() => route({ platform: 'marketing', framework: 'paid', task: 'production', risks: ['health-claims'], disable: ['compliance-gate'] }), /compliance-gate/);
  assert.throws(() => route({ platform: 'brand', framework: 'messaging', task: 'compliance', disable: ['compliance-gate'] }), /compliance-gate/);
});

test('a compliance task activates the gate even in minimal mode', () => {
  for (const domain of businessDomains) {
    if (!domains[domain].tasks.includes('compliance')) continue;
    const lane = businessProfiles.find(p => p.domain === domain);
    const r = route({ platform: lane.platform, framework: lane.framework, task: 'compliance', mode: 'minimal' });
    assert.ok(r.active.includes(domains[domain].gate));
  }
});

test('verify routes carry the brand consistency pass and cannot drop it', () => {
  const r = route({ platform: 'content', framework: 'writing', task: 'verify' });
  assert.ok(r.active.includes('brand-consistency-gate'));
  assert.throws(() => route({ platform: 'content', framework: 'writing', task: 'verify', disable: ['brand-consistency-gate'] }), /brand-consistency-gate/);
});

test('automation routes treat spend and publish authority as a security matter', () => {
  const r = route({ platform: 'automation', framework: 'integration', task: 'implementation', description: 'store the webhook secret and admin token' });
  assert.ok(r.active.includes('security-gate'));
  assert.ok(r.references.includes('references/security.md'));
});

test('minimal mode drops specialists but keeps authority and process', () => {
  const min = route({ platform: 'marketing', framework: 'seo', task: 'strategy', mode: 'minimal' });
  const rec = route({ platform: 'marketing', framework: 'seo', task: 'strategy' });
  assert.ok(min.active.length < rec.active.length);
  assert.ok(min.active.includes('seo-audit'));
  assert.ok(!min.active.includes('product-marketing'));
});

test('full mode expands the available inventory without activating it', () => {
  const full = route({ platform: 'marketing', framework: 'cro', task: 'optimization', mode: 'full' });
  const rec = route({ platform: 'marketing', framework: 'cro', task: 'optimization' });
  assert.deepEqual(full.active, rec.active);
  assert.ok(full.available.length > full.active.length);
});

test('engineering-only options are rejected on business routes', () => {
  assert.throws(() => route({ platform: 'marketing', framework: 'seo', task: 'strategy', target: 'ios' }), /engineering/);
  assert.throws(() => route({ platform: 'venture', framework: 'blueprint', task: 'ideation', database: 'postgres' }), /engineering/);
});

test('unknown tasks and scopes fail closed per domain', () => {
  assert.throws(() => route({ platform: 'marketing', framework: 'seo', task: 'implementation' }), /Unknown task/);
  assert.throws(() => route({ platform: 'venture', framework: 'blueprint', task: 'ideation', scope: 'renderer' }), /Unknown scope/);
  assert.throws(() => route({ platform: 'marketing', framework: 'not-a-lane', task: 'strategy' }), /Unsupported platform\/framework/);
});

test('activation stays inside the budget on ordinary business routes', () => {
  for (const profile of businessProfiles) {
    for (const task of domains[profile.domain].tasks) {
      const r = route({ platform: profile.platform, framework: profile.framework, task });
      assert.ok(r.active.length <= 7, `${profile.platform}/${profile.framework}/${task} activated ${r.active.length}`);
    }
  }
});

test('every upstream entry keeps a pinned commit and a validated invocation name', () => {
  for (const skill of registry) {
    if (!skill.installMode.startsWith('upstream')) continue;
    assert.match(skill.source.commit, /^[0-9a-f]{40}$/, `${skill.id} is not pinned`);
    assert.match(invocations[skill.id] ?? '', /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${skill.id} has no invocation name`);
  }
});

test('bundled internal skills are the only entries without an upstream repository', () => {
  for (const skill of registry) {
    if (skill.installMode === 'bundled') assert.equal(skill.trust, 'internal', `${skill.id} is bundled but not internal`);
    else assert.ok(skill.source.repository || skill.source.documentation, `${skill.id} has no source`);
  }
});
