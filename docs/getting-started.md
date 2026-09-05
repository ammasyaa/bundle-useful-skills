# Getting started

Start with an explicit route. Choose the product surface and framework, then name the current task rather than the entire project roadmap.

```bash
node scripts/cli.mjs report --platform website --framework next --task design
node scripts/cli.mjs report --platform desktop --framework winui --task bug --target windows
node scripts/cli.mjs report --platform mobile --framework expo --task release --target android --risks auth,payment
```

Use the first report line in the task's first progress update. Read the returned platform reference and each selected capability in order. Re-run the report when the phase changes, and route `verify` before completing code or configuration changes. Never report a capability as used unless its instructions were available and followed.

For a task outside the three development surfaces, run `node scripts/cli.mjs triage` and use its exact disclosure. This makes non-development handling deterministic without activating development capabilities.

Project detection accepts a JSON map of relative file names to contents. It only suggests a route and deliberately asks for input when a repository contains multiple targets.

## Global installation

Run `npm run install:global` to install the router and pinned upstream skill inventory for Codex and Antigravity. Codex uses `$CODEX_HOME/skills/development-skill-router`, defaulting to `~/.codex/skills/development-skill-router`. Antigravity uses `~/.gemini/config/skills/development-skill-router` for user-global discovery. The installer also maintains a bounded rule in Codex's active global `AGENTS.md` and Antigravity's `~/.gemini/GEMINI.md` so every task consults the router and reports its selected bundle.

The installer downloads executable upstream skills from the reviewed commits in `registry/skills.json`, copies their full skill directories, and adds `BUNDLE_README.md`, source metadata, available license/notice files, and a SHA-256 inventory. A matching router is left unchanged; a modified or unrelated router is rejected so local work cannot be overwritten accidentally.

An unverified same-name capability stops installation. Review the dry-run plan, then pass `--replace-existing` to back up that directory and install the pinned copy. Pass `--allow-existing` only to preserve it knowingly; the doctor will continue to report that host as not ready. Use `--adopt-legacy` once for reviewed copies installed by an older bundle version that have source manifests without file hashes.

```bash
node scripts/install-global.mjs --target all --dry-run --replace-existing --adopt-legacy
node scripts/install-global.mjs --target all --replace-existing --adopt-legacy
npm run doctor
```

The doctor emits one valid JSON array for one or both hosts. `ready: true` requires the current unmodified router, one exact managed global-rule block, and all 48 upstream capabilities at their reviewed commits with an exact matching file inventory and hashes. Restart each host after installation.

## One-command E2E checks

Use `npm run test:e2e:quick` for a fast offline check of dual-host installation, global rules, installed-router execution, and idempotency. Use `npm run ready` for the release path; it runs every repository check and then the full E2E journey. The full path downloads only reviewed commits into an isolated temporary home, checks the complete 49-directory inventory on each host, verifies author attribution, tampers with a test copy, confirms doctor rejection, repairs it through the backup flow, and requires final readiness.

Neither command writes to the real user profile. A successful run cleans up its temporary home. A failed run prints and retains that directory for inspection.
