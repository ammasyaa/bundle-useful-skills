# Changelog

## 0.3.0 - 2026-09-05

- Add safe conversion of same-name existing capabilities to reviewed pinned copies, with timestamped backups and an explicit preserve option.
- Add SHA-256 file inventories to capability manifests and verify exact file sets in the installer and doctor.
- Make the doctor return one JSON document, require exact global-rule content, and fail readiness for unverified capabilities.
- Reject duplicate managed-rule blocks before installation.
- Add a deterministic `triage` command for non-development tasks.
- Add quick and full plug-and-play E2E commands plus one `npm run ready` release gate, and run that complete isolated install, routing, integrity, recovery, and readiness journey in CI.

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
