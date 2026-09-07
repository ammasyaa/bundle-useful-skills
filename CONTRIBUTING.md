# Contributing to Bundle Useful Skills

Thank you for your interest in contributing to `bundle-useful-skills`!

We maintain a strict curation standard. **This repository is not an awesome-list, link collection, or skill directory.** Every addition to the registry must serve a distinct purpose within the routing matrix without bloating context or conflicting with official authorities.

---

## 1. Admission Principles

Before proposing a new Agent Skill, verify that it meets our core criteria:

1. **Authority**: Is the skill official (first-party) or an acknowledged domain specialist with proven real-world craft?
2. **Context Efficiency**: Is the skill concise, focused, and free of redundant boilerplate? High token counts increase activation cost.
3. **Non-Duplication**: Does the skill duplicate instructions already covered by existing primary authorities? If yes, it will be rejected.
4. **Platform Isolation**: Does the skill respect native conventions rather than forcing foreign paradigms (e.g. copying CSS web patterns into SwiftUI)?
5. **Deterministic Pinning**: Can the skill be pinned to an immutable git commit hash with a verifiable SHA-256 integrity hash?

---

## 2. Proposing a New Skill

To add a new skill to `registry/skills.json`:

### Step 1: Run the Admission Helper
Use the automated admission CLI script:
```bash
python scripts/admit_skill.py \
  --id "org-skillname" \
  --name "Official Skill Name" \
  --repo "https://github.com/org/repo" \
  --path "skills/skillname/SKILL.md" \
  --commit "<exact-git-commit-hash>" \
  --license "MIT" \
  --authority "first-party" \
  --domain "frontend" \
  --platform "web" \
  --framework "react" \
  --cost "low"
```

### Step 2: Ensure Complete Metadata
Every entry in `registry/skills.json` must provide:
```json
{
  "id": "vercel-react-best-practices",
  "name": "React & Next.js Best Practices",
  "source_repository": "https://github.com/vercel-labs/agent-skills",
  "source_path": "skills/react-best-practices/SKILL.md",
  "license": "MIT",
  "version": "1.0.0",
  "commit": "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678",
  "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "last_reviewed": "2026-09-08",
  "authority_level": "official",
  "platform": "web",
  "framework": "react",
  "domain": "frontend",
  "task_types": ["frontend", "architecture", "code review"],
  "activation_cost": "low",
  "dependencies": [],
  "conflicts": ["flutter", "winui"],
  "supersedes": [],
  "notes": "Primary official authority for React and Next.js applications."
}
```

### Step 3: Run Validation & Verification
Before submitting a PR, run the automated validation suite:
```bash
# Validate schemas and referential integrity
python scripts/validate_registry.py

# Verify lockfile checksums
python scripts/verify_lock.py

# Run all router tests
python -m unittest discover tests -v
```

---

## 3. Pull Request Checklist

Your PR must include:
- [ ] Updated `registry/skills.json` entry conforming to `schemas/skill.schema.json`.
- [ ] Updated `registry/lock.json` with commit hash and SHA-256.
- [ ] Updated `registry/compatibility.json` and `registry/conflicts.json` if applicable.
- [ ] At least one test case in `tests/test_router.py` verifying correct routing.
- [ ] Successful run of `python scripts/validate_registry.py`.
- [ ] Successful run of `python -m unittest discover tests -v`.
