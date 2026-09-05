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
node scripts/cli.mjs route --platform mobile --framework flutter --task implementation --target ios
```

Example output names the active skills, why each was selected, its authority, and the small set of references to read. For a database bug:

```bash
node scripts/cli.mjs route --platform mobile --framework flutter --task bug --scope database --database postgres
```

For a Tauri app with a React renderer:

```bash
node scripts/cli.mjs route --platform desktop --framework tauri --renderer react --task implementation --target windows
```

Use `--mode minimal`, `recommended`, or `full`. Full expands the available inventory; it does not activate every compatible skill. Add comma-separated overrides with `--enable`, `--disable`, and `--risks`. Sensitive gates cannot be disabled.

## Global installation

Install the self-contained router for both Codex and Google Antigravity:

```bash
npm run install:global
```

This installs `development-skill-router` into `$CODEX_HOME/skills` (or `~/.codex/skills`) and `~/.gemini/config/skills`. Install one target with:

```bash
node scripts/install-global.mjs --target codex
node scripts/install-global.mjs --target antigravity
```

The installer is idempotent when files match and refuses to overwrite a different or locally modified skill.

## Use as an Agent Skill

Point an Agent Skills-compatible client at [`router/SKILL.md`](router/SKILL.md). The entrypoint is intentionally small and loads one platform reference at a time. Agent-specific notes live in [`adapters/`](adapters/).

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

The check covers behavior, registry integrity, license metadata, generated attribution, and a local privacy/secret scan. See [`SECURITY.md`](SECURITY.md) for disclosure guidance and [`CONTRIBUTING.md`](CONTRIBUTING.md) for registry requirements.

## License

The original code and documentation in this repository are MIT-licensed. Third-party projects retain their own licenses; their content is not included here.
