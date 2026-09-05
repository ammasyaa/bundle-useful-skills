# Architecture

The system has four layers:

1. `router/SKILL.md` contains the compact decision policy.
2. `profiles/index.json` locks supported product/framework lanes to one framework authority.
3. `registry/skills.json` records provenance, compatibility, role, and installation metadata.
4. `src/router.mjs` returns a task-scoped activation plan and rejects incompatible combinations.

The authority order is user requirements, security/privacy/legal constraints, existing architecture, project documents, platform conventions, framework guidance, domain guidance, design guidance, and filters. A lower layer cannot silently override a higher one.

The runtime router does not download upstream content. The explicit global installer can fetch executable skills from pinned reviewed commits into each host's user skill directory. Pinned commits make installs reproducible while official current documentation remains the authority for APIs that changed after review.

Guaranteed discovery and task-specific loading are separate layers. A managed global host rule makes the router part of every task's instruction chain. The router then emits a small phase-specific bundle using the upstream skill's actual frontmatter invocation name. The full inventory stays dormant until selected.
