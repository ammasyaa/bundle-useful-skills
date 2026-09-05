---
name: development-skill-router
description: Select a minimal, compatible set of Agent Skills for website, Windows/macOS desktop, and Android/iOS mobile development. Use before multi-step engineering work when platform, framework, task phase, design authority, security gates, or skill conflicts must be resolved.
license: MIT
---

# Development Skill Router

Classify the product surface first, then the task. Preserve user requirements, the existing architecture, and approved project documents. Select one framework authority and only the specialists required now.

1. Identify `website`, `desktop`, or `mobile`. A WebView does not turn a desktop application into a website. Flutter requires an explicit target because it can be desktop or mobile.
2. Identify the framework and task phase. Use `node scripts/cli.mjs route` from this repository when available.
3. Read only the returned references and activate only the returned capabilities. Treat `full` mode as a larger available inventory, never as permission to load everything.
4. Keep ordinary tasks near two to five active capabilities. Explain why more than five are needed; provide a concrete justification above seven.
5. Never combine primary framework authorities. In Tauri/Electron, renderer guidance controls renderer code only.
6. Activate the security gate for authentication, authorization, payments, PII, location, identity, secrets/tokens, uploads, webhooks, database permissions, admin access, or account recovery.
7. Use design review and filter skills in separate passes. Project `DESIGN.md` decisions outrank filters.
8. Verify behavior before reporting completion.

Read the matching platform guide only: [website](references/website.md), [desktop](references/desktop.md), or [mobile](references/mobile.md). Read [security](references/security.md) only for sensitive work and [release](references/release.md) only for release work. Read [API guidance](references/api.md) only for API contracts.

This router references third-party projects; it does not include their instructions. Resolve each upstream dependency from `registry/skills.json`, preserving its author, license, notice, and pinned reviewed source. Current official documentation outranks a stale reviewed snapshot when APIs have changed.
