import test from 'node:test';
import assert from 'node:assert/strict';
import { route, validateSelection, detect } from '../src/router.mjs';

const request = (extra = {}) => {
  const value={platform:'mobile',framework:'flutter',target:'ios',task:'implementation',...extra};
  if(value.framework!=='flutter'&&!Object.hasOwn(extra,'target')) delete value.target;
  return value;
};
test('Flutter mobile excludes React and has a bounded active set', () => {
  const result = route(request());
  assert.ok(result.active.includes('flutter-architecture'));
  assert.ok(result.active.includes('dart-static-analysis'));
  assert.ok(!result.active.some(id => /react|expo|taste/.test(id)));
  assert.ok(result.active.length <= 5);
  assert.match(result.report.line,/flutter-apply-architecture-best-practices/);
  assert.equal(result.selections.find(s=>s.id==='flutter-architecture').invocation,'flutter-apply-architecture-best-practices');
});
test('React website excludes Flutter', () => {
  const r = route(request({platform:'website', framework:'react'}));
  assert.ok(r.active.includes('react-best-practices'));
  assert.ok(!r.active.some(id => id.includes('flutter')));
});
test('Flutter desktop stays desktop', () => {
  const r = route(request({platform:'desktop',target:'windows'}));
  assert.equal(r.platform,'desktop');
  assert.ok(r.references.includes('references/desktop.md'));
});
test('Tauri React renderer is scoped separately', () => {
  const r = route(request({platform:'desktop',framework:'tauri',renderer:'react'}));
  assert.equal(r.frameworkAuthority,'tauri-docs');
  assert.ok(r.active.includes('react-best-practices'));
});
test('WinUI has no other framework', () => {
  const r = route(request({platform:'desktop',framework:'winui'}));
  assert.equal(r.frameworkAuthority,'winui-workflow');
  assert.ok(!r.active.some(id => /flutter|tauri|electron|react/.test(id)));
});
test('Database bug does not activate design or unrelated client authority', () => {
  const r = route(request({task:'bug',scope:'database',database:'postgres'}));
  assert.ok(r.active.includes('systematic-debugging'));
  assert.ok(r.active.includes('postgres-best-practices'));
  assert.ok(!r.active.some(id => /impeccable|taste|flutter/.test(id)));
});
test('UI polish does not activate configured database guidance', () => {
  const r = route(request({task:'polish',database:'postgres'}));
  assert.ok(r.active.includes('impeccable'));
  assert.ok(!r.active.includes('postgres-best-practices'));
});
for (const risk of ['auth','authorization','payment','location','pii','identity','secrets','uploads','webhooks','database-permissions','admin','account-recovery']) {
  test(`${risk} requires security even in minimal mode`, () => {
    assert.ok(route(request({risks:[risk],mode:'minimal'})).active.includes('security-gate'));
  });
}
test('Risk in task text activates security', () => {
  assert.ok(route(request({description:'Fix payment confirmation'})).active.includes('security-gate'));
});
test('Native product UI rejects website creative direction', () => {
  assert.throws(() => route(request({enable:['taste-frontend']})),/incompatible|website/i);
});
test('Only one creative director', () => {
  assert.throws(() => route(request({platform:'website',framework:'react',task:'design',enable:['taste-frontend','anthropic-frontend']})),/creative/i);
});
test('Only one framework authority', () => {
  assert.throws(() => validateSelection(['flutter-architecture','react-native'],request()),/framework|incompatible/i);
});
test('Filter is below project design authority', () => {
  const r = route(request({task:'filter'}));
  assert.ok(r.authorityOrder.indexOf('project-documents') < r.authorityOrder.indexOf('filter'));
});
test('Expo only applies to Expo', () => {
  assert.throws(() => route(request({framework:'react-native',enable:['expo-ui']})),/incompatible/i);
});
test('Mobile image generation stays a reference capability', () => {
  const r=route(request({task:'visual-reference'}));
  assert.ok(r.active.includes('taste-mobile-imagegen'));
  assert.ok(!r.active.includes('flutter-architecture'));
  assert.equal(r.selections.find(s=>s.id==='taste-mobile-imagegen').authority,'reference');
});
test('React architecture can add composition without changing framework authority', () => {
  const r=route(request({platform:'website',framework:'react',task:'architecture'}));
  assert.equal(r.frameworkAuthority,'react-best-practices');
  assert.ok(r.active.includes('react-composition-patterns'));
});
test('Full inventory never activates all skills', () => {
  assert.deepEqual(route(request({mode:'full'})).active,route(request()).active);
});
test('Security cannot be disabled for sensitive work', () => {
  assert.throws(() => route(request({risks:['auth'],disable:['security-gate']})),/security/i);
});
test('Invalid platform/framework fails closed', () => {
  assert.throws(() => route(request({platform:'website'})),/framework/i);
  assert.throws(() => route({platform:'mobile',framework:'flutter',task:'implementation'}),/target/i);
  assert.throws(() => route(request({task:'unknown'})),/task/i);
  assert.throws(() => route(request({enable:['missing-skill']})),/unknown/i);
});
test('API routes include the bundled API reference', () => {
  assert.ok(route(request({task:'api',scope:'api'})).references.includes('references/api.md'));
});
test('Expo design uses its UI skill and target platform review', () => {
  const design=route(request({framework:'expo',target:'android',task:'design'}));
  assert.ok(design.active.includes('expo-ui'));
  assert.ok(design.active.includes('mobile-android-design'));
  const review=route(request({framework:'expo',target:'ios',task:'review'}));
  assert.ok(review.active.includes('mobile-ios-design'));
});
test('Above seven active skills needs a justification', () => {
  const opts=request({platform:'website',framework:'react',task:'design',enable:['brainstorming','writing-plans','test-driven-development','systematic-debugging','verification-before-completion','requesting-code-review','impeccable','emil-design-eng']});
  assert.throws(() => route(opts),/justification/i);
  assert.ok(route({...opts,justification:'Separate expertise needed for explicit review request'}).warnings.length);
});
test('Detection distinguishes desktop shells from websites and refuses ambiguous Flutter target', () => {
  assert.equal(detect({'package.json':JSON.stringify({dependencies:{react:'1','@tauri-apps/api':'2'}}),'src-tauri/Cargo.toml':''}).platform,'desktop');
  assert.equal(detect({'pubspec.yaml':'dependencies:\n  flutter:\n    sdk: flutter','windows/CMakeLists.txt':''}).platform,'desktop');
  assert.equal(detect({'pubspec.yaml':'dependencies:\n  flutter:\n    sdk: flutter','windows/CMakeLists.txt':'','android/build.gradle':''}).needsInput,true);
});
