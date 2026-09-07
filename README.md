# Bundle Useful Skills (`bundle-useful-skills`)

> Production-ready, open-source Agent Skills router and orchestrator.

`bundle-useful-skills` is **not** an awesome-list or a skill dump. Its job is to discover, review, pin, route, and activate the **minimum sufficient set of high-quality Agent Skills** for any software engineering task.

Normal tasks activate **2–5 skills**. Complex multi-surface tasks activate **5–7 skills**. Never load the entire bundle.

---

## Core Optimizations

- **Authority Hierarchy**: Strict ordering ensures community skills never override official framework or platform guidance.
- **Skill Quality**: Every skill in the registry is audited, verified, and pinned.
- **Low Context Usage**: Progressive disclosure prevents context exhaustion and distraction.
- **Framework Isolation**: Exactly one primary framework authority per implementation surface; hard conflicts are caught and blocked.
- **Strong Product & UI Taste**: High-craft design and interaction principles without cargo-culting cross-platform visuals.
- **Backend Correctness**: Clear architectural boundaries, idempotency, transaction safety, and minimal unnecessary abstractions.
- **Security by Default & Deep Audit**: Dual-layer defense via OWASP secure-by-default development and Trail of Bits deep auditing.
- **SEO / GEO / AI Search**: Public routes optimized for semantic crawlability, entity clarity, and AI engine citation readiness.
- **Independent Auditing**: Separation of implementation authority and audit perspectives via the `audit-everything` profile.
- **Evidence-Backed Verification**: Completion requires measurable runtime and automated verification, never assumptions.

---

## 1. Core Routing Model

For every task, the router executes an 11-step pipeline:

```text
USER REQUEST
  ↓
PROJECT TYPE (Search/Research, Web, Desktop, Mobile, Mixed)
  ↓
TASK TYPE (requirements, frontend, backend, security, testing, audit, etc.)
  ↓
FRAMEWORK / PLATFORM (Next.js, WinUI, SwiftUI, Flutter, Expo, Tauri, etc.)
  ↓
PRIMARY AUTHORITY (Official framework / first-party guidance)
  ↓
RISK / CROSS-CUTTING NEEDS (Auth, payments, PII, migrations, etc.)
  ↓
MINIMUM SKILL STACK (2–5 skills strictly non-overlapping)
  ↓
CONFLICT CHECK (Deterministic evaluation of mutual exclusions)
  ↓
EXECUTION (Progressive disclosure: load -> execute -> unload)
  ↓
INDEPENDENT AUDIT (Selected audit perspectives based on risk depth)
  ↓
VERIFICATION (Evidence-backed release gates & completion standard)
```

---

## 2. Authority Order

When instructions or conventions conflict:

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

> **Hard Rule**: A generic or community skill must **never** override current platform/framework authority.

---

## 3. Context Efficiency Rules

Installed skills are **capabilities**, not automatically active instructions.

Progressive disclosure workflow:
```text
classify → select → load only needed skill → execute → unload mentally when done
```

- Prefer **2–5 strong non-overlapping skills** over 10+ partially relevant skills.
- Do **not** load full domain bundles by default.
- Do **not** duplicate instructions already covered by the primary authority.
- Do **not** run every auditor for low-risk work.
- Do **not** activate multiple creative directors simultaneously.
- Do **not** activate multiple framework authorities for one implementation surface.

---

## 4. Curated Registry & Profiles

The router provides curated profiles organized by domain:

| Profile | Primary Stack & Specialists | Typical Use Cases |
|---------|-----------------------------|-------------------|
| **`search-research`** | Firecrawl CLI, DeerFlow, Last30Days, Browser Use | Web search, doc scraping, synthesis, literature review |
| **`web-development`** | Vercel React, Addy Osmani Frontend/Web Quality, Supabase, Corey Haines SEO | Next.js, React, APIs, PostgreSQL, web performance, SEO/GEO |
| **`desktop-development`** | Microsoft WinUI, OpenAI macOS/SwiftUI, Flutter Desktop, Tauri, Electron | Windows Fluent, macOS native, cross-platform desktop |
| **`mobile-development`** | Android Skills, OpenAI iOS, Expo Skills, Flutter Mobile, Emil Kowalski | Native Android, iOS HIG, cross-platform mobile apps |
| **`security`** | OWASP Secure Agent Playbook, Trail of Bits, Snyk Agent Scan | Secure coding, static analysis, threat modeling, supply chain |
| **`audit-everything`** | Impeccable, Addy Quality, Compound Engineering, Trail of Bits, Supabase | Independent multi-perspective audits & release gates |

---

## 5. Hard Conflict Rules

The router strictly prevents incompatible skill combinations:

- ❌ **WinUI + Flutter Desktop** as simultaneous primary authority
- ❌ **Flutter + Expo** as simultaneous mobile authority
- ❌ **Android + iOS** as simultaneous implementation authority
- ❌ **React implementation patterns applied to Flutter**
- ❌ **SwiftUI recipes copied into Android**
- ❌ **Web CSS/GSAP recipes copied into native apps**
- ❌ **Electron security architecture applied to Tauri**
- ❌ **Multiple creative directors simultaneously** (e.g., Taste Skill + Anthropic frontend-design)
- ❌ **UI Craft + Impeccable simultaneous auto-activation** without explicit justification

---

## 6. CLI Usage

The router includes a standalone Python CLI that runs with zero external dependencies.

### Basic Routing
```bash
# Route by task description
python scripts/route.py "Build a Next.js e-commerce app with Supabase and Stripe payments"

# Route with JSON output for automated agent tooling
python scripts/route.py "Audit iOS SwiftUI app for memory leaks and accessibility" --json

# Route with specific framework or risk overrides
python scripts/route.py "Update user profile page" --framework react --risk low
```

### Registry Validation & Lock Verification
```bash
# Validate registry JSON files against schemas
python scripts/validate_registry.py

# Verify cryptographic lockfile integrity
python scripts/verify_lock.py

# Run comprehensive test suite
python -m unittest discover tests -v
```

### Auditing Workspace
```bash
# Run multi-perspective audit
python scripts/audit_everything.py
```

---

## 7. Repository Structure

```text
bundle-useful-skills/
├── README.md                               # Project overview and router manual
├── SECURITY.md                             # Supply chain security and admission policy
├── CONTRIBUTING.md                         # Skill review and contribution workflow
├── AGENTS.md                               # Operational instructions for AI agents
│
├── router/
│   ├── SKILL.md                            # Agent Skill definition for router
│   ├── __init__.py                         # Python package
│   ├── engine.py                           # 11-step routing orchestrator
│   ├── cli.py                              # CLI interface
│   ├── models.py                           # Dataclasses & types
│   ├── profiles/                           # Profile router documentation
│   ├── conflicts/                          # Conflict matrix & hard rules
│   └── verification/                       # Release gates & completion standard
│
├── registry/
│   ├── skills.json                         # Pinned skill catalog with rich metadata
│   ├── sources.json                        # Trusted source repositories
│   ├── compatibility.json                  # Platform & framework matrix
│   ├── conflicts.json                      # Machine-readable exclusions
│   └── lock.json                           # Cryptographic deterministic lockfile
│
├── profiles/                               # Domain profile definitions & READMEs
├── schemas/                                # JSON schemas for skills, locks, and conflicts
├── scripts/                                # Standalone CLI tools & validators
└── tests/                                  # Comprehensive automated test suite
```

---

## License

Apache-2.0. Upstream skills referenced in the registry retain their respective original licenses.
