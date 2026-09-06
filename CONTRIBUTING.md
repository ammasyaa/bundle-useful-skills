# Contributing

Contributions should improve searching, routing, compatibility, validation, adapters, tests, or independently authored documentation. Do not copy or vendor an upstream skill into this repository by default.

## Development workflow

1. Clone the repository and install exactly the locked Node.js dependencies with `npm ci`.
2. Create a focused branch, normally with the `codex/` prefix for Codex-authored work.
3. Add a failing behavior test before changing search or routing behavior.
4. Make the smallest implementation change that satisfies that boundary while preserving one framework authority.
5. Update the relevant README/docs and generated attribution when metadata changes.
6. Run the focused test, `npm run check`, `npm run test:e2e:quick`, and `git diff --check`.
7. Run `npm run ready` for release-affecting, installer, registry, security, or cross-host changes.
8. Review the complete diff, commit only intended files, push the branch, and open a pull request.

```bash
git switch -c codex/short-description
node --test tests/relevant.test.mjs
# Implement the tested change.
node scripts/generate-credits.mjs
npm run check
npm run test:e2e:quick
git diff --check
git add <reviewed-files>
git commit -m "Explain the behavior change"
git push -u origin codex/short-description
gh pr create --fill
```

## Routing and registry changes

Add a behavior test for every new boundary, conflict, target rule, sensitive-feature signal, or activation-budget behavior. Classify product platform before task type, preserve exactly one implementation framework authority, and keep renderer guidance scoped to renderer code.

A registry addition must include a stable ID, display name, original author or organization, canonical HTTPS repository or official documentation, exact skill path, reviewed 40-character commit, repository-level license or notice evidence, applicable platforms and phases, authority, conflicts, trust level, install mode, and real invocation name. Verify these values at the upstream source. Popularity is not provenance and does not determine trust.

Regenerate `CREDITS.md`, `THIRD_PARTY_SKILLS.md`, and `catalog/` after registry changes:

```bash
node scripts/generate-credits.mjs
npm run check
```

## Pull requests and review

Keep pull requests focused. Describe:

- The project evidence or explicit input that triggers the behavior.
- The previous and resulting routes, including the preserved framework authority.
- Selected and rejected capability reasons.
- Security, privacy, installer, dependency, and compatibility effects.
- Upstream provenance and license evidence for registry changes.
- Exact verification commands and results, including any platform-specific skip.

All Ubuntu, Windows, and macOS checks plus the dependent full isolated installation must pass. Resolve review comments and unexpected generated changes before merge. A maintainer should not merge by bypassing a failing platform job.

## Repository hygiene

Do not commit third-party skill bodies, research scratchpads, conversation logs, real user profiles, machine-specific paths, credentials, environment values, caches, temporary homes, generated secrets, or unrelated formatting. Preserve user changes in a dirty worktree. Security reports belong in the private process described by `SECURITY.md`.
