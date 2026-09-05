# Bundle Useful Skills

A lightweight, open-source router that selects the right Agent Skills for websites, Windows/macOS desktop applications, and Android/iOS mobile applications without loading everything into the model at once.

The project stores routing and attribution metadata. It does not vendor third-party skill instructions. Every upstream entry links to its original author, repository, license evidence, and reviewed commit.

## Why use it?

- Prevent Flutter mobile, Flutter desktop, React, React Native, Expo, WinUI, Tauri, and Electron guidance from colliding.
- Keep ordinary tasks near two to five active capabilities.
- Add security automatically for sensitive features.
- Separate implementation, design, motion, filter, and verification passes.
- Keep a full installation available without putting the full inventory into model context.

## Quick start

Requires Node.js 22 or later and has no package dependencies.

```bash
git clone https://github.com/ammasyaa/bundle-useful-skills.git
cd bundle-useful-skills
npm test
node scripts/cli.mjs report --platform mobile --framework flutter --task implementation --target ios
```

The first line is the bundle disclosure agents must show before work, followed by each real skill invocation name, its reason, and the references to read. JSON remains available through the `route` command. For a database bug:

```bash
node scripts/cli.mjs report --platform mobile --framework flutter --target ios --task bug --scope database --database postgres
```

For work outside website, desktop, or mobile development, emit the exact deterministic triage disclosure with:

```bash
node scripts/cli.mjs triage
```

For a Tauri app with a React renderer:

```bash
node scripts/cli.mjs report --platform desktop --framework tauri --renderer react --task implementation --target windows
```

Use `--mode minimal`, `recommended`, or `full`. Full expands the available inventory; it does not activate every compatible skill. Add comma-separated overrides with `--enable`, `--disable`, and `--risks`. Sensitive gates cannot be disabled.

## Global installation

Install the router, its 26 primary upstream skills, the 22 Expo skills required transitively by Expo's router, and a managed global rule for both Codex and Google Antigravity:

```bash
npm run install:global
```

This installs `development-skill-router` into `$CODEX_HOME/skills` (or `~/.codex/skills`) and `~/.gemini/config/skills`. It adds a marked block to Codex's active global `AGENTS.md` and Antigravity's `~/.gemini/GEMINI.md`, preserving instructions outside that block. Install one target with:

```bash
node scripts/install-global.mjs --target codex
node scripts/install-global.mjs --target antigravity
```

Use `--router-only` when you want the router and global rule without downloading upstream skills. Run `npm run doctor` to verify both hosts. The doctor returns one JSON array, checks the router version and hashes, checks the exact managed rule, and verifies every managed capability file name and SHA-256 hash.

The installer is strict and idempotent. It refuses an unverified same-name capability by default. After reviewing the plan with `--dry-run`, use `--replace-existing` to move each old copy into a timestamped backup directory and install the reviewed pinned copy. Use `--allow-existing` only when you intentionally accept a non-ready doctor result. An installation created by an older bundle release requires `--adopt-legacy` once after review so the installer can record its file hashes.

```bash
node scripts/install-global.mjs --target all --dry-run --replace-existing --adopt-legacy
node scripts/install-global.mjs --target all --replace-existing --adopt-legacy
```

Start a new Codex or Antigravity session after installation so the host reloads global instructions. Skills remain available globally, while the rule requires the router to disclose and load only the small bundle relevant to the current phase.

## End-to-end readiness

Run the fast, offline smoke test during development:

```bash
npm run test:e2e:quick
```

Before release, run the complete plug-and-play readiness gate:

```bash
npm run ready
```

`npm run ready` runs every behavior, registry, license, attribution, and secret check before starting the full E2E journey. The E2E command uses an isolated temporary home and never changes the real Codex or Antigravity profile. It installs both hosts from reviewed commits, executes eight installed-router scenarios, checks all 49 skill directories per host and author attribution, proves repeat-install idempotency, detects a modified capability, repairs it with a timestamped backup, and requires both final doctor reports to be ready. Successful runs clean up automatically. Failed runs retain the temporary home for diagnosis; pass `--cleanup-on-failure` to remove it or `--keep-temp` to retain a successful run.

## Use as an Agent Skill

Point an Agent Skills-compatible client at [`router/SKILL.md`](router/SKILL.md). The entrypoint is intentionally small and loads one platform reference at a time. The host-wide rule template is [`rules/global-rule.md`](rules/global-rule.md), and agent-specific notes live in [`adapters/`](adapters/).

## Supported profiles

| Product | Framework lanes |
|---|---|
| Website | React, Next.js, web platform |
| Desktop application | Flutter Desktop, Tauri, Electron, WinUI, native macOS |
| Mobile application | Flutter, React Native, Expo, native iOS, native Android |

Installed capabilities remain dormant until the selected phase requires them. Official framework guidance controls implementation. Product documents and platform conventions outrank design polish. Anti-slop guidance is a final filter rather than a design system.

## Trust and attribution

See [`CREDITS.md`](CREDITS.md) for the people and organizations behind the referenced work, the individual [`catalog/`](catalog/) attribution cards, and [`THIRD_PARTY_SKILLS.md`](THIRD_PARTY_SKILLS.md) for pinned technical records. Registry trust labels mean `official`, `verified`, `community`, `experimental`, or `internal`; popularity is not a trust level.

This independent project is not affiliated with or endorsed by any listed author or organization.

## Validation

```bash
npm run check
```

The check covers behavior, registry integrity, license metadata, generated attribution, and a local privacy/secret scan. CI runs the same `npm run ready` gate documented above. See [`SECURITY.md`](SECURITY.md) for disclosure guidance and [`CONTRIBUTING.md`](CONTRIBUTING.md) for registry requirements.

The current urgent, major, and minor findings, fixes, limits, and per-task bundle examples are in [`docs/audit-2026-09-05.md`](docs/audit-2026-09-05.md).

## License

The original code and documentation in this repository are MIT-licensed. Third-party projects retain their own licenses; their content is not included here.
