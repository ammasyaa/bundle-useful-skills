---
name: development-skill-router
description: Route every task — website, desktop and mobile development, plus marketing, brand, content, automation, and venture work — to a minimal compatible set of Agent Skills. Use at the start of work and whenever its phase changes; report the capabilities actually used.
license: MIT
---

# Skill Router

Classify the domain first, then the surface, then the task. Preserve user requirements, the existing architecture, and approved project documents. Select one authority and only the specialists required now.

1. Identify the domain. `website`, `desktop`, `mobile` are engineering surfaces. `marketing`, `brand`, `content`, `automation`, `venture` are their own lanes with their own task vocabularies. A WebView does not turn a desktop application into a website. Flutter requires an explicit target because it can be desktop or mobile.
2. Identify the lane and current task phase. Use `node scripts/cli.mjs report` from this repository when available; `--platform` takes a surface or a domain.
3. Before substantive work, report `Skill bundle: development-skill-router -> ...`. Use the invocation names returned by the report and list only capabilities whose instructions are actually read and followed.
4. Read only the returned references and activate only the returned capabilities. Treat `full` mode as a larger available inventory, never as permission to load everything.
5. Keep ordinary tasks near two to five active capabilities. Explain why more than five are needed; provide a concrete justification above seven.
6. Never combine primary authorities. One framework authority per engineering route, one lane authority per domain route, one creative authority per design or brand pass. In Tauri/Electron, renderer guidance controls renderer code only.
7. Activate the security gate for authentication, authorization, payments, PII, location, identity, secrets/tokens, uploads, webhooks, database permissions, admin access, account recovery, and for any automation holding spend, publish, or delete authority.
8. Activate the compliance gate for audience-facing work involving regulated claims, personal data, testimonials and endorsements, or audiences including minors. Neither gate can be disabled once triggered.
9. Use design review and filter skills in separate passes. Project `DESIGN.md` and an approved brand bible outrank filters.
10. Re-route when the phase changes. Before completing work, route `verify`, follow its capability, and report actual evidence. Engineering verifies against tests; marketing, brand, and content verify against the brand consistency pass.
11. In the final answer, report `Skill bundle used: ...`. Never claim an unavailable or unread capability was used.

Read the matching lane guide only: [website](references/website.md), [desktop](references/desktop.md), [mobile](references/mobile.md), [marketing](references/marketing.md), [brand](references/brand.md), [content](references/content.md), [automation](references/automation.md), or [venture](references/venture.md). Read [security](references/security.md) and [compliance](references/compliance.md) only when a gate fires, [brand consistency](references/brand-consistency.md) only on an audience-facing verify route, [release](references/release.md) only for release work, and [API guidance](references/api.md) only for API contracts.

Engineering routing rules live in `src/router.mjs`; every other domain is data in `registry/domains.json`, so adding a lane is a registry change with a test, not a code change.

This router references third-party projects; it does not include their instructions. Resolve each upstream dependency from `registry/skills.json`, preserving its author, license, notice, and pinned reviewed source. Skills marked `bundled` are this repository's own MIT-licensed content in `skills/` and `router/references/`. Current official documentation outranks a stale reviewed snapshot when APIs have changed.
