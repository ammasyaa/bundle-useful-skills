# Getting started

Start with an explicit route. Choose the product surface and framework, then name the current task rather than the entire project roadmap.

```bash
node scripts/cli.mjs report --platform website --framework next --task design
node scripts/cli.mjs report --platform desktop --framework winui --task bug --target windows
node scripts/cli.mjs report --platform mobile --framework expo --task release --target android --risks auth,payment
```

Use the first report line in the task's first progress update. Read the returned platform reference and each selected capability in order. Re-run the report when the phase changes, and route `verify` before completing code or configuration changes. Never report a capability as used unless its instructions were available and followed.

Project detection accepts a JSON map of relative file names to contents. It only suggests a route and deliberately asks for input when a repository contains multiple targets.

## Global installation

Run `npm run install:global` to install the router and pinned upstream skill inventory for Codex and Antigravity. Codex uses `$CODEX_HOME/skills/development-skill-router`, defaulting to `~/.codex/skills/development-skill-router`. Antigravity uses `~/.gemini/config/skills/development-skill-router` for user-global discovery. The installer also maintains a bounded rule in Codex's active global `AGENTS.md` and Antigravity's `~/.gemini/GEMINI.md` so every task consults the router and reports its selected bundle.

The installer downloads executable upstream skills from the reviewed commits in `registry/skills.json`, copies their full skill directories, and adds `BUNDLE_README.md`, source metadata, and available license/notice files. Existing same-named valid skills are preserved. A matching router is left unchanged; a modified or unrelated router is rejected so local work cannot be overwritten accidentally. Use `npm run doctor` after installation, then restart each host.
