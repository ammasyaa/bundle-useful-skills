# Codex adapter

Run `node scripts/install-global.mjs --target codex` from the repository to install the router and pinned upstream inventory into `$CODEX_HOME/skills`, defaulting to `~/.codex/skills`. The installer adds a managed block to the active global `AGENTS.md`, which Codex reads at the start of a session. Run `node scripts/doctor.mjs --target codex`, then start a new session.
