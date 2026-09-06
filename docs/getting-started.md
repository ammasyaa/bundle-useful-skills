# Getting started

## 1. Validate the checkout

Requirements are Node.js 22 or later, Git, and internet access for a full upstream installation.

```bash
git clone https://github.com/ammasyaa/bundle-useful-skills.git
cd bundle-useful-skills
npm ci
npm run test:e2e:quick
```

The quick E2E uses temporary Codex and Antigravity homes and does not alter the real user profile.

## 2. Install and restart

```bash
npm run install:global
npm run doctor
```

The installer places the router and 48 capabilities in both supported hosts unless a target is specified. It retrieves executable upstream skills only from reviewed commits, validates repository license evidence and safe file boundaries, adds creator/source/license metadata and exact hashes, and preserves host rules outside its managed markers.

Codex uses `$CODEX_HOME/skills` or `~/.codex/skills` and the active global `AGENTS` file. Antigravity uses `~/.gemini/config/skills` and `~/.gemini/GEMINI.md`. Restart both hosts after installation so their global instructions are reloaded.

A healthy full installation returns `ready: true`, `integrityReady: true`, and `workflowReady: true`. Conditional host-tool gaps describe branches that need an extra runtime capability only if used; they do not make an otherwise complete installation unready.

## 3. Search the project

```bash
node scripts/cli.mjs search --root . --task implementation --description "describe the requested change"
```

Use the first report line in the task's first progress update. The search reads bounded project metadata, classifies platform/framework/renderer/targets, and searches only the reviewed local registry. If it returns `needsInput`, inspect the named conflict and supply the intended platform, framework, or target through an explicit report:

```bash
node scripts/cli.mjs report --platform website --framework next --task design
node scripts/cli.mjs report --platform desktop --framework winui --task bug --target windows
node scripts/cli.mjs report --platform mobile --framework expo --task release --target android --risks auth,payment
```

Read the returned platform reference and each selected capability in order. Re-run routing when the phase changes, and route `verify` before completing code or configuration changes. Never report a capability as used unless its instructions were available and followed.

For work outside website, desktop, and mobile development, run `node scripts/cli.mjs triage`. It reports deterministic triage without activating the development inventory.

## 4. Safe updates and replacement

An unverified same-name capability stops installation. First inspect the exact plan:

```bash
node scripts/install-global.mjs --target all --dry-run --replace-existing --adopt-legacy
```

Then apply only after reviewing the named destinations:

```bash
node scripts/install-global.mjs --target all --replace-existing --adopt-legacy
npm run doctor
```

`--replace-existing` moves old directories to a timestamped backup. `--adopt-legacy` adds hashes only to a reviewed older-bundle copy. `--allow-existing` knowingly preserves an unverified collision, and doctor keeps that host unready. `--router-only` installs no third-party inventory.

The installer is idempotent for current managed files and refuses modified routers, unsafe symlinks, source-path escapes, missing license evidence, and malformed registry/dependency metadata.

## 5. Verification levels

```bash
npm run check
npm run test:e2e:quick
npm run ready
```

- `npm run check` runs behavior/integration tests, registry validation, license validation, generated-credit checks, and privacy/secret scanning.
- `npm run test:e2e:quick` tests both hosts offline with router-only temporary homes.
- `npm run ready` runs the repository checks and the full networked E2E installation, route/search scenarios, attribution inspection, idempotency, tamper rejection, repair, and final readiness.

Successful E2E runs clean up automatically. Failed runs retain and print the temporary home for diagnosis. Use `--cleanup-on-failure` when that evidence is no longer needed, or `--keep-temp` to retain a successful fixture.

## Common failures

- `needsInput`: the scanner found ambiguous framework or target evidence. Provide explicit intent after examining entry points.
- `managed-policy-invalid`: a managed Codex skill lost explicit-only invocation policy. Inspect and reinstall the reviewed copy.
- `managed-modified`, `managed-stale`, or `managed-unverified`: do not overwrite blindly; review the manifest and use the dry-run backup flow.
- `workflowReady: false`: one or more unconditional skill dependencies are missing or invalid.
- Clone/license failure: preserve the current installation, restore network access or correct reviewed evidence, then retry.
- Cross-platform CI-only failure: reproduce on the named OS and inspect path, case, permission, symlink, and cleanup behavior.
