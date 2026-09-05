---
name: development-skill-router
description: Route every website, Windows/macOS desktop, and Android/iOS mobile development task to a minimal compatible set of Agent Skills. Use at the start of development work and whenever its phase changes; report the capabilities actually used.
license: MIT
---

# Development Skill Router

Classify the product surface first, then the task. Preserve user requirements, the existing architecture, and approved project documents. Select one framework authority and only the specialists required now.

1. Identify `website`, `desktop`, or `mobile`. A WebView does not turn a desktop application into a website. Flutter requires an explicit target because it can be desktop or mobile.
2. Identify the framework and current task phase. Use `node scripts/cli.mjs report` from this repository when available.
3. Before substantive work, report `Skill bundle: development-skill-router -> ...`. Use the invocation names returned by the report and list only capabilities whose instructions are actually read and followed.
4. Read only the returned references and activate only the returned capabilities. Treat `full` mode as a larger available inventory, never as permission to load everything.
5. Keep ordinary tasks near two to five active capabilities. Explain why more than five are needed; provide a concrete justification above seven.
6. Never combine primary framework authorities. In Tauri/Electron, renderer guidance controls renderer code only.
7. Activate the security gate for authentication, authorization, payments, PII, location, identity, secrets/tokens, uploads, webhooks, database permissions, admin access, or account recovery.
8. Use design review and filter skills in separate passes. Project `DESIGN.md` decisions outrank filters.
9. Re-route when the phase changes. Before completing code or configuration changes, route `verify`, follow its capability, and report actual evidence.
10. In the final answer, report `Skill bundle used: ...`. Never claim an unavailable or unread capability was used.

Read the matching platform guide only: [website](references/website.md), [desktop](references/desktop.md), or [mobile](references/mobile.md). Read [security](references/security.md) only for sensitive work and [release](references/release.md) only for release work. Read [API guidance](references/api.md) only for API contracts.

This router references third-party projects; it does not include their instructions. Resolve each upstream dependency from `registry/skills.json`, preserving its author, license, notice, and pinned reviewed source. Current official documentation outranks a stale reviewed snapshot when APIs have changed.
