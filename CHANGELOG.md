# Changelog

## 0.3.0 - 2026-09-05

- Add five non-engineering domains — marketing, brand, content, automation, and venture — with 20 lanes, their own task vocabularies, and their own scopes.
- Move all non-engineering routing rules into `registry/domains.json`, so a new lane is a registry change plus a test rather than a code change. Engineering routing is unchanged.
- Add a compliance gate for regulated claims, personal data, endorsements, and audiences including minors; it activates from declared risks or task text and cannot be disabled once triggered.
- Add a brand consistency gate as the verification pass for audience-facing work, including an explicit report of what was not checked.
- Grow the registry from 34 to 116 capabilities: 50 marketing skills, 16 Anthropic skills, and 4 further process skills as pinned reference entries, plus 12 bundled internal capabilities.
- Record per-skill licensing for mixed-license upstreams, distinguishing Apache-2.0 skills from source-available ones.
- Add `tests/domains.test.mjs`, which walks every declared lane and task and proves each resolves to a compatible, budgeted bundle.
- Copy bundled internal skills during global installation.

## 0.2.0 - 2026-09-05

- Enforce router consultation and bundle disclosure through preserved global Codex and Antigravity rules.
- Install all executable upstream capabilities and Expo's transitive skill family from pinned reviewed commits, with author and license attribution.
- Normalize Expo's unsupported `version` frontmatter while retaining that version in installed source metadata.
- Report actual upstream invocation names instead of internal aliases.
- Add safe upgrade manifests, installation diagnostics, and isolated global installation tests.
- Require explicit Flutter targets, route Expo UI guidance, include mobile UX review, and return the API reference for API work.

## 0.1.0 - 2026-09-05

- Add the agent-neutral router and command-line interface.
- Add 13 website, desktop, and mobile framework profiles.
- Add reviewed attribution metadata for 34 internal and upstream capabilities.
- Enforce framework, creative-authority, security, scope, and activation-budget rules.
- Add routing, validation, attribution, licensing, and privacy checks.
- Add one generated README attribution card for every referenced external capability.
- Add a collision-safe global installer for Codex and Google Antigravity.
