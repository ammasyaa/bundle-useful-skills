# Searching Stage Design

Date: 2026-09-05
Status: Proposed for user review

## Purpose

Add a cross-cutting **Searching** stage to Bundle Useful Skills. The stage gives an agent enough verified project context to choose the correct website, desktop, or mobile route and the smallest compatible skill bundle. It also produces a detailed, auditable explanation of what the agent inspected, which skills it used, and why.

Searching is not a fourth product platform. It runs before platform routing and supports every existing development lane.

## Goals

1. Inspect the current repository before choosing development skills.
2. Distinguish website, desktop, mobile, backend-only, multi-component, and non-development work from evidence.
3. Search the reviewed skill registry using platform, framework, target, task, scope, database, renderer, and risk signals.
4. Escalate from a lightweight scan to focused investigation only when evidence is incomplete or conflicting.
5. Explain every selected capability in a detailed skill-bundle report.
6. Fail closed when the router cannot make a reliable choice.
7. Preserve the project's dependency-free, agent-neutral, and reviewed-source model.

## Non-goals

- Promise that every possible framework or repository layout can be detected.
- Install community skills automatically during task execution.
- Build or maintain a live marketplace index.
- Add semantic vector search or a database dependency.
- Read every repository file before every task.
- Replace framework authorities or task-specific specialists.

## Approaches considered

### 1. Install an upstream exploration or skill-finder package

This is the fastest way to gain a broad workflow, but the reviewed candidates bring Claude-specific agent fields, large static catalogs, external policy systems, generated artifacts, or runtime dependencies. They could also introduce instructions that conflict with the router. This approach does not fit the repository's small, agent-neutral core.

### 2. Expand the existing `detect` function only

This preserves a small implementation, but detection alone cannot show which repository instructions were read, identify conflicting evidence, search the skill registry, or explain confidence and gaps. It would make the current heuristic longer without creating a clear discovery boundary.

### 3. Add an internal Searching stage with progressive depth

This is the selected approach. A dependency-free project scanner gathers bounded evidence, a classifier proposes the product route, and the existing router selects reviewed skills. A focused search runs only when the lightweight scan cannot establish a reliable route. The stage remains useful across Codex and Antigravity and does not add an upstream execution dependency.

## Architecture

The routing flow becomes:

```text
User request
    |
    v
Searching: lightweight repository scan
    |
    +-- sufficient evidence ------> platform and framework classification
    |
    +-- incomplete/conflicting ---> focused repository investigation
                                      |
                                      v
                            platform and framework classification
                                      |
                                      v
                         reviewed skill-registry search
                                      |
                                      v
                              task-specific bundle
                                      |
                                      v
                                   work
                                      |
                                      v
                                verification
```

The implementation has four isolated responsibilities.

### Project scanner

The scanner accepts a repository root and produces a normalized evidence document. It inspects only bounded, high-signal inputs:

- Repository instruction files such as `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md`.
- Root documentation such as `README`, architecture, design, and contribution files.
- Package and build manifests.
- Framework configuration files.
- Top-level and second-level directory names.
- Git repository state and current revision when available.
- Test, migration, API, native-platform, and deployment indicators.

The scanner excludes dependency directories, build output, caches, credentials, environment-file contents, binary files, and generated artifacts. It records file paths and signal types without exposing secret values.

The scanner produces data; it does not select skills.

### Project classifier

The classifier converts evidence into zero or more route candidates. Each candidate contains:

- `platform`: `website`, `desktop`, or `mobile`.
- `framework` and optional renderer.
- Optional target, database, and scope.
- Evidence paths and reasons.
- Confidence: `high`, `medium`, or `low`.
- Conflicts and unknowns.

One high-confidence candidate may route automatically. Multiple viable candidates, incompatible signals, or a required target with no evidence produces `needsInput: true`. The classifier never treats React alone as proof that a project is a website because React can be a desktop renderer.

### Focused investigator

The focused investigator is a documented workflow, not a new external runtime. It activates when the scanner reports ambiguity or when the requested change needs more context than platform detection.

It searches the smallest relevant subsystem using file names, exact text, imports, callers, tests, entry points, configuration, and working examples. Claims are labeled:

- `verified`: direct code, configuration, test, or tool evidence.
- `inferred`: strong structural evidence that still needs confirmation.
- `unknown`: evidence is absent, inaccessible, or conflicting.

The investigator stops after it can support the route and task scope. It does not perform a full repository audit for a focused change.

### Skill registry search

The registry search uses only reviewed entries already present in `registry/skills.json` plus explicitly supplied reviewed extensions. It evaluates:

- Platform and framework compatibility.
- Renderer scope.
- Product target.
- Task phase.
- Client, native, API, backend, or database scope.
- Sensitive-feature and release gates.
- Authority conflicts.
- Explicit user enable and disable requests.

The result includes selected skills, rejected near-matches with reasons, missing coverage, and the smallest compatible bundle. Discovery does not bypass existing conflict, authority, security, or release rules.

## Command-line interface

Add a repository-aware command while keeping the current file-map detector for compatibility:

```text
node scripts/cli.mjs search --root <repository> [--task <phase>] [--description <text>]
```

The command returns a human-readable Searching report by default. A `--json` option returns a versioned machine-readable document suitable for tests and host integration.

`detect --file <file-map.json>` remains a pure classifier for callers that already provide a file map. `route` and `report` continue to accept explicit platform and framework inputs.

## Search depth rules

Every development task receives the lightweight scan. Focused investigation activates when any of these conditions is true:

- No route reaches high confidence.
- More than one platform or framework remains viable.
- Flutter does not have an established product target.
- Tauri or Electron renderer evidence is incomplete.
- The repository is a monorepo and the requested component is unclear.
- Repository instructions conflict with detected code.
- The requested task mentions a feature that cannot be located.
- Sensitive or release work lacks enough evidence to select mandatory gates.

Straightforward tasks do not pay the cost of deep exploration when high-signal evidence already establishes the route.

## Reporting contract

Replace the terse final `Skill bundle used: ...` line with this required structure:

```text
Skill bundle report
- Task classification: <what kind of task this was and why>
- Project evidence: <files, manifests, or signals used to understand the repository>
- Route: <platform/framework/target/task/scope, or non-development>
- Router: development-skill-router — <what decision it made>
- Skills used:
  - <invocation> — <why it was selected and what it influenced>
- Skills considered but not used:
  - <invocation or category> — <specific rejection reason>
- Selection rationale: <why this is the smallest compatible bundle>
- Verification evidence: <commands or checks and their results>
- Gaps: <unknown, unavailable, unread, or untested items; otherwise None>
```

The first progress update remains compact but adds the route and evidence level:

```text
Skill bundle: development-skill-router -> <active invocations>
Route: <platform/framework/task>; project evidence: <high|medium|low>
```

The report names only skills whose instructions were actually read and followed. A capability discovered in metadata but not loaded belongs under “considered but not used,” not “skills used.”

## Error handling

- An unreadable repository root returns a clear error and does not guess.
- Invalid or secret-bearing inputs are not echoed.
- Unsupported manifests become recorded unknowns rather than fabricated routes.
- Conflicting platform evidence returns all viable candidates and requests one focused user choice.
- A registry gap reports the missing capability and stops before implementation when the missing authority is required.
- External documentation or community skill search is advisory. Nothing is added until repository identity, exact skill path, license evidence, and reviewed commit are recorded and validated.

## Security and trust

Repository files are evidence, not higher-priority instructions unless the host explicitly designates them as instruction files. Discovered content cannot replace the router's mandatory security, conflict, or release rules.

The scanner must avoid reading secret values. Environment files contribute only their paths or variable names when that is safe and required; values are never included. Symlinks and paths outside the resolved repository root are rejected by default.

No upstream Searching skill is installed in this change. Candidate upstream workflows informed the design, but the bundle will keep the executable Searching stage internal until a third-party capability demonstrates a clear operational advantage over this dependency-free implementation.

## Testing strategy

Behavior tests are written before implementation. Required scenarios include:

1. Detect a Next.js website from manifest and configuration evidence.
2. Detect React as a Tauri or Electron renderer without reclassifying the product as a website.
3. Detect Expo and React Native mobile projects.
4. Require a target for ambiguous Flutter repositories.
5. Return multiple candidates for mixed monorepos instead of guessing.
6. Respect repository-root boundaries and ignore dependency/build directories.
7. Avoid exposing environment-file values in JSON and text reports.
8. Search the registry and explain selected and rejected skills.
9. Require security and release gates when their signals are present.
10. Produce the complete detailed skill-bundle report contract.
11. Preserve current explicit `route`, `report`, `detect`, and `triage` behavior where compatibility is intended.
12. Install the updated self-contained router and pass doctor integrity checks for Codex and Antigravity in isolated homes.

The final gate remains `npm run check`, followed by the appropriate E2E installation test and a real installed-router smoke test.

## Documentation changes

Update the README and architecture documentation to show Searching before the three product lanes. Document the lightweight and focused depth rules, command examples, report format, limitations, and trust policy. Regenerate credits only if a registry source is added; this design adds no upstream source.

## Success criteria

- The agent inspects project evidence before selecting a development route.
- Supported single-platform repositories route automatically from high-confidence evidence.
- Ambiguous repositories fail closed with specific candidates and missing evidence.
- Every selected and rejected skill has a concrete reason.
- Detailed reports distinguish loaded skills from metadata-only candidates.
- No new runtime dependency or unreviewed upstream executable skill is added.
- Existing website, desktop, and mobile compatibility rules remain enforced.
- Repository tests, registry validation, license checks, attribution checks, secret checks, E2E installation, doctor checks, and installed-router smoke tests pass.
