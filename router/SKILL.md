---
name: bundle-useful-skills
description: Use when starting any software engineering, architecture, design, audit, or research task to select and activate the minimum sufficient set of pinned Agent Skills without context bloat.
---

# Bundle Useful Skills — Agent Router & Orchestrator

Activate the **minimum sufficient set of high-quality Agent Skills** (typically 2–5 skills for ordinary tasks, 5–7 for complex multi-surface tasks) and execute work stage-by-stage with progressive mental disclosure.

---

## 1. Quick Route Invocation

When a user task arrives, route it immediately using the built-in CLI:

```bash
python scripts/route.py "<user task description>" --json
```

The output provides:
- `project_type`: `web`, `desktop`, `mobile`, `search-research`, or `mixed`
- `task_type`: `frontend`, `backend`, `security`, `audit`, etc.
- `framework`: Detected framework authority
- `risk_level`: `LOW`, `MEDIUM`, `HIGH`, or `RELEASE`
- `recommended_bundle`: Specialized plugin bundle (e.g. `aas-accessibility-inclusive-ux`, `aas-web-app-builder`)
- `selected_skills`: The exact pinned skills to load for this task
- `execution_stages`: Progressive sequence of actions
- `independent_auditors`: Selected reviewers for independent critique
- `release_gate`: Concrete completion criteria

To inspect or activate a complete specialized plugin bundle:
```bash
python scripts/route.py --bundle aas-accessibility-inclusive-ux
python scripts/route.py --list-bundles
```

---

## 2. Core Authority Hierarchy

If instructions or conventions conflict:

1. **Explicit user requirements**
2. **Security / privacy / legal constraints**
3. **Existing repository architecture, ADRs, instructions**
4. **`PRODUCT.md`, `DESIGN.md`, `ARCHITECTURE.md`**
5. **Native platform conventions**
6. **Current official framework guidance**
7. **Official / first-party Agent Skills**
8. **Reviewed domain specialists**
9. **Design / interaction specialists**
10. **Polish / anti-slop / audit filters**

---

## 3. Hard Invariants

- **Single Framework Authority**: Exactly one framework authority per surface. Never mix WinUI with Flutter, Flutter with Expo, or React with Flutter.
- **Single Creative Director**: Never load `taste-skill-frontend` and `anthropic-frontend-design` simultaneously.
- **Progressive Disclosure**: Load only the skill needed for the current stage. Unload mentally when that stage concludes.
- **Separation of Build & Audit**: The skill used to write code cannot be the sole auditor of that code.
- **No Claims Without Evidence**: Never assert that tests pass or performance is optimized without terminal command output and metrics.

