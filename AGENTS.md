# AGENTS.md — Operational Instructions for AI Agents

Welcome, Agent. You are operating within or using `bundle-useful-skills`.

Your primary mission is to solve the user's software engineering task with **maximum quality and minimal context waste**. Follow the directives below with absolute discipline.

---

## 1. Cardinal Rules

1. **Never dump or load the entire bundle**: The bundle contains dozens of specialized skills across all platforms and domains. Loading multiple skills simultaneously wastes context, dilutes attention, and creates instruction contradictions.
2. **Strict Budgeting**:
   - Standard tasks: **2 to 5 skills** maximum.
   - Complex multi-surface tasks: **5 to 7 skills** maximum.
3. **Progressive Disclosure**:
   ```text
   Classify task → Select minimum stack → Load skill for current stage → Execute stage → Unload mentally
   ```
4. **Authority Hierarchy**:
   - Explicit user instructions > Security/legal > Repo architecture/ADRs > Native platform HIG > Official framework > Reviewed specialist > Taste > Audit.
   - A community skill NEVER overrides native platform HIG or official framework documentation.
5. **No Cross-Platform Pollution**:
   - NEVER apply web DOM/CSS mental models to Flutter or SwiftUI.
   - NEVER apply SwiftUI paradigms to Android/Material.
   - NEVER activate multiple framework authorities for a single implementation surface.
6. **No Dual Creative Direction**:
   - Choose either `taste-skill` (for marketing/editorial) OR `anthropic/frontend-design` (for deliberate web visual direction). Never both.
   - For dense dashboards and native apps, rely on platform HIG + `emilkowalski/skills` craft + `ui-ux-pro-max-skill` reference.

---

## 2. Execution Lifecycle

When you receive a user task, execute this routing sequence:

### Phase 1: Classification & Stack Assembly
1. **Classify Project Type**: Search/Research, Web, Desktop, Mobile, or Mixed.
2. **Classify Task Type**: requirements, frontend, backend, database, security, audit, release, etc.
3. **Detect Platform / Framework**: Check `package.json`, `pubspec.yaml`, `Cargo.toml`, `.csproj`, etc.
4. **Identify Primary Authority**: Select the official first-party authority.
5. **Assess Risk Level**:
   - `LOW`: Isolated tweak, unit test, styling fix -> tests + verify.
   - `MEDIUM`: New component, API endpoint, non-critical query -> tests + specialist review.
   - `HIGH`: Auth, payments, migrations, crypto, IPC -> OWASP + Trail of Bits audit.
   - `RELEASE`: Version tag, public deploy, binary distribution -> Full release gate.
6. **Assemble Stack & Check Conflicts**: Ensure no mutual exclusions from `registry/conflicts.json`.

### Phase 2: Staged Execution
1. **Process Stage**: Use `obra/superpowers` (e.g. `brainstorming`, `writing-plans`, `test-driven-development`, or `systematic-debugging`) to structure work.
2. **Implementation Stage**: Load the primary framework authority and relevant design/craft specialist. Write code using TDD and clear boundaries.
3. **Audit Stage**: If the risk level calls for review, invoke the designated auditor (e.g. `impeccable` for UI/UX, `supabase-postgres-best-practices` for queries, `OWASP` for security).
4. **Verification Stage**: Run automated test suites, verify runtime behavior, inspect logs, and gather evidence.

---

## 3. Self-Audit Before Claiming Completion

Before asserting that a task is complete, verify the 14 standard completion criteria:

1. [ ] Did we solve the specific requested problem?
2. [ ] Is the implementation functionally and logically correct?
3. [ ] Does it respect official platform and framework idioms?
4. [ ] Is the UI intentionally designed with clear visual hierarchy?
5. [ ] Is interaction and motion purposeful, physical, and restrained?
6. [ ] Is accessibility verified (contrast, screen readers, keyboard navigation)?
7. [ ] Is backend, query, and data behavior correct (idempotency, transactions)?
8. [ ] Is security posture commensurate with the risk level?
9. [ ] Is performance measured or verified against regression?
10. [ ] Is SEO/GEO correctly configured on public routes?
11. [ ] Are all dependencies trusted, pinned, and scanned?
12. [ ] Does it work in the actual runtime environment?
13. [ ] Did an independent audit perspective inspect the implementation?
14. [ ] Is there concrete command output/test evidence proving completion?
