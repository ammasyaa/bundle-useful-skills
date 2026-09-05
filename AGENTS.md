# Repository guidance

Keep the router agent-neutral, small, and dependency-free unless a dependency has a clear operational benefit.

- Classify product platform before task type.
- Preserve exactly one implementation framework authority.
- Keep renderer guidance scoped to renderer code.
- Add behavior tests before changing routing behavior.
- Do not vendor third-party skills by default.
- Verify repository identity, exact skill path, license evidence, and reviewed commit before adding an upstream entry.
- Regenerate credits after registry changes.
- Run `npm run check` before reporting completion.
- Do not commit research scratchpads, conversation history, local paths, credentials, caches, or generated secrets.
- Keep non-engineering routing as data in `registry/domains.json`; do not add per-domain branches to `src/router.mjs`.
- Every lane named in a domain rule must resolve to a compatible, registered skill; `tests/domains.test.mjs` enforces this.
- Security and compliance gates are non-optional once triggered. Do not add a path that disables either.
- Generalize before publishing: no client names, account identifiers, site identifiers, pixel identifiers, or tokens in bundled skills.
