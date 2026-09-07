# Bundle Useful Skills (`bundle-useful-skills`)

> Production-ready, open-source Agent Skills router, bundle manifest system, and orchestrator.

`bundle-useful-skills` is **not** an awesome-list or a skill dump. Its job is to discover, review, pin, route, package, and activate the **minimum sufficient set of high-quality Agent Skills** for any software engineering task.

Normal tasks activate **2–5 skills**. Complex multi-surface tasks activate **5–7 skills**. Never load the entire bundle.

---

## Core Optimizations

- **Authority Hierarchy**: Strict ordering ensures community skills never override official framework or platform guidance.
- **Skill Quality**: Every skill in the registry is audited, verified, and pinned to an exact commit and SHA-256 hash.
- **Low Context Usage**: Progressive disclosure prevents context exhaustion and distraction.
- **Framework Isolation**: Exactly one primary framework authority per implementation surface; hard conflicts are caught and blocked.
- **Strong Product & UI Taste**: High-craft design and interaction principles without cargo-culting cross-platform visuals.
- **Backend Correctness**: Clear architectural boundaries, idempotency, transaction safety, and minimal unnecessary abstractions.
- **Security by Default & Deep Audit**: Dual-layer defense via OWASP secure-by-default development and Trail of Bits deep auditing.
- **SEO / GEO / AI Search**: Public routes optimized for semantic crawlability, entity clarity, and AI engine citation readiness.
- **Independent Auditing**: Separation of implementation authority and audit perspectives via the `audit-everything` profile.
- **Evidence-Backed Verification**: Completion requires measurable runtime and automated verification, never assumptions.
- **Supply Chain Security**: Built-in Snyk Agent Scan admission pipeline (Section 17) verifying repository origin, license, commit pins, cryptographic hashes, and command/secret safety.

---

## 1. Focused Bundles (`bus-*`)

In strict accordance with the **Linked Bundle Manifest Prompt**, `bundle-useful-skills` packages skills into 17 focused, installable bundles:

| Bundle ID | Domain & Focus | Upstream Authorities | Key Skills |
|-----------|----------------|----------------------|------------|
| **`bus-engineering-core`** | Process & Engineering Core | [obra/superpowers](https://github.com/obra/superpowers) | `systematic-debugging`, `verification-before-completion`, `brainstorming`, `writing-plans`, `test-driven-development` |
| **`bus-research-intelligence`** | Search & Deep Synthesis | Firecrawl, DeerFlow, Browser Use, Last30Days | `firecrawl-search`, `deep-research`, `github-deep-research`, `browser-use`, `qa`, `last30days` |
| **`bus-product-ui-taste`** | Product UI, Taste & Motion | Taste Skill, Anthropic, Emil Kowalski, UI UX Pro Max, Impeccable, UI Craft | `emil-design-eng`, `ui-ux-pro-max`, `impeccable`, `apple-design`, `animate`, `frontend-design`, `ui-craft` |
| **`bus-web-app-builder`** | Full-Stack Web & Next.js | [Addy Osmani](https://github.com/addyosmani/agent-skills), [Vercel Labs](https://github.com/vercel-labs/agent-skills) | `frontend-ui-engineering`, `source-driven-development`, `browser-testing-with-devtools`, `code-review-and-quality`, `react-best-practices` |
| **`bus-backend-api-data`** | Backend, APIs & PostgreSQL | [Addy Osmani](https://github.com/addyosmani/agent-skills), [Supabase](https://github.com/supabase/agent-skills) | `source-driven-development`, `api-and-interface-design`, `code-review-and-quality`, `supabase-postgres-best-practices`, `supabase` |
| **`bus-seo-geo-web-quality`** | Web Quality & AI Search | [Addy Osmani Web Quality](https://github.com/addyosmani/web-quality-skills), [Corey Haines](https://github.com/coreyhaines31/marketingskills) | `web-quality-audit`, `core-web-vitals`, `accessibility`, `seo`, `seo-audit`, `ai-seo`, `schema`, `site-architecture` |
| **`bus-windows-app-builder`** | Windows WinUI 3 & Fluent | [Microsoft Win Dev Skills](https://github.com/microsoft/win-dev-skills) | `winui-dev-workflow`, `winui-design`, `winui-code-review`, `winui-ui-testing`, `winui-packaging`, `winui-setup` |
| **`bus-macos-app-builder`** | macOS Native & SwiftUI | [OpenAI Build macOS Apps](https://github.com/openai/plugins) | `build-run-debug`, `swiftui-patterns`, `window-management`, `test-triage`, `appkit-interop`, `view-refactor` |
| **`bus-android-app-builder`** | Native Android & Compose | [Android Skills](https://github.com/android/skills) | `android-cli`, `edge-to-edge`, `play-policy-insights`, `android-intent-security`, `camerax`, `agp-9-upgrade` |
| **`bus-ios-app-builder`** | Native iOS & SwiftUI | [OpenAI Build iOS Apps](https://github.com/openai/plugins) | `swiftui-ui-patterns`, `ios-debugger-agent`, `ios-simulator-browser`, `swiftui-view-refactor`, `swiftui-liquid-glass` |
| **`bus-flutter-app-builder`** | Flutter Mobile Apps | [Flutter Plugins](https://github.com/flutter/agent-plugins), [Dart Lang](https://github.com/dart-lang/skills) | `flutter-add-widget-preview`, `flutter-add-widget-test`, `flutter-add-integration-test`, `dart-run-static-analysis`, `dart-add-unit-test` |
| **`bus-flutter-desktop-builder`** | Flutter Desktop Apps | [Flutter Plugins](https://github.com/flutter/agent-plugins), [Dart Lang](https://github.com/dart-lang/skills) | `flutter-add-widget-test`, `dart-run-static-analysis`, `dart-add-unit-test`, `dart-collect-coverage` |
| **`bus-expo-app-builder`** | Universal React Native / Expo | [Expo Skills](https://github.com/expo/skills), Emil Kowalski | `expo-project-structure`, `expo-native-ui`, `expo-design-system`, `expo-router`, `expo-data-fetching`, `animate-expo` |
| **`bus-secure-app-builder`** | Secure Coding & OWASP | [OWASP Secure Agent Playbook](https://github.com/OWASP/secure-agent-playbook) | `security-guidance`, `code-review-security`, `secrets-scan`, `web-security-review`, `api-security-review`, `mobile-code-review` |
| **`bus-agent-security`** | AI Agent & MCP Security | [OWASP Secure Agent Playbook](https://github.com/OWASP/secure-agent-playbook) | `agent-security-audit`, `llm-risk-assess`, `agentic-ai-risk-assess`, `mcp-server-review`, `prompt-injection-test` |
| **`bus-security-auditor`** | Deep Security Audit & SARIF | [Trail of Bits](https://github.com/trailofbits/skills) | `audit-context-building`, `static-analysis`, `fp-check`, `supply-chain-risk-auditor`, `variant-analysis`, `insecure-defaults` |
| **`bus-audit-release`** | Universal Release Gate | Addy Osmani, Superpowers, Impeccable, Trail of Bits, Compound Engineering | `code-review-and-quality`, `verification-before-completion`, `impeccable`, `web-quality-audit`, `ce-code-review`, `ce-test-browser` |

All 17 bundle manifests are stored as compact YAML manifests in `bundles/*.yaml` and generated as portable plugins in `plugins/bus-*/`.

---

## 2. Core Routing Model

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

## 3. Authority Order

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

## 4. Context Efficiency & Runtime Rules

Installed skills are **capabilities**, not automatically active instructions.

Progressive disclosure workflow:
```text
classify → select → load only needed skill → execute → unload mentally when done
```

### Runtime Rules by Domain (Section 18):
- **Web**: `frontend-ui-engineering` + framework authority + `emil-design-eng` + `impeccable`. Add `design-taste-frontend` or `frontend-design` only for new visual direction. SEO/GEO skills only for public/indexable content. OWASP skills only when relevant security surface exists.
- **Windows**: `winui-dev-workflow` + `winui-design` + `winui-ui-testing` + `verification-before-completion`. Windows/Fluent remains platform authority.
- **macOS**: `build-run-debug` + `swiftui-patterns` + `test-triage` + `verification-before-completion`. Apple HIG remains platform authority.
- **iOS**: `swiftui-ui-patterns` + `ios-debugger-agent` + `ios-simulator-browser` + `verification-before-completion`. Apple HIG remains platform authority.
- **Flutter**: `flutter-add-widget-test` + `dart-run-static-analysis` + relevant implementation skill + `verification-before-completion`.
- **Expo**: `expo-project-structure` + `expo-native-ui` + `expo-design-system` + relevant router/data skill. Companion: `animate-expo`.
- **Security Audit**: `audit-context-building` → `static-analysis` → domain security review → differential/variant analysis → `fp-check` → `supply-chain-risk-auditor`.

---

## 5. Hard Conflict Rules

The router strictly prevents incompatible skill combinations:

- ❌ **WinUI + Flutter Desktop** as simultaneous primary desktop authorities
- ❌ **Flutter + Expo** as simultaneous mobile authorities
- ❌ **Android + iOS** as simultaneous implementation authorities
- ❌ **React implementation patterns applied to Flutter**
- ❌ **SwiftUI recipes copied into Android**
- ❌ **Web CSS/GSAP recipes copied into native apps**
- ❌ **Electron security architecture applied to Tauri**
- ❌ **Multiple creative directors simultaneously** (`design-taste-frontend` vs `frontend-design`)
- ⚠️ **UI Craft + Impeccable simultaneous auto-activation** without explicit justification

---

## 6. CLI Usage

The router and toolchain run with zero external runtime dependencies.

### Inspecting Focused Bundles
```bash
# List all 17 focused bundles
python scripts/route.py --list-bundles

# Inspect a specific bundle (e.g. Web App Builder)
python scripts/route.py --bundle bus-web-app-builder

# Inspect in JSON format for agentic tool integration
python scripts/route.py --bundle bus-web-app-builder --json
```

### Basic Task Routing
```bash
# Route by task description
python scripts/route.py "Build a Next.js e-commerce app with Supabase and Stripe payments"

# Route with JSON output
python scripts/route.py "Audit iOS SwiftUI app for memory leaks and accessibility" --json

# Route with explicit framework and risk overrides
python scripts/route.py "Update user profile page" --framework react --risk low
```

### Conflict Checking
```bash
# Verify compatibility
python scripts/route.py --check-conflicts vercel-react-best-practices emil-design-eng

# Detect prohibited conflict (exit code 1)
python scripts/route.py --check-conflicts microsoft-winui flutter-agent-plugins
```

### Registry Validation, Lock Verification & Supply-Chain Scan
```bash
# Validate registry JSON files, schemas, and 17 bundle manifests
python scripts/validate_registry.py

# Verify cryptographic lockfile parity and SHA-256 hashes
python scripts/verify_lock.py

# Run Snyk Supply-Chain Scanner across all registered skills (Section 17)
python scripts/scan_supply_chain.py --check-all

# Run full automated test suite (34 tests)
python -m unittest discover tests -v
```

### Workspace Audit
```bash
# Run multi-perspective 14-point audit
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
├── bundles/                                # 17 focused bundle manifests (bus-*.yaml)
│   ├── bus-engineering-core.yaml
│   ├── bus-research-intelligence.yaml
│   ├── bus-product-ui-taste.yaml
│   ├── bus-web-app-builder.yaml
│   ├── bus-backend-api-data.yaml
│   ├── bus-seo-geo-web-quality.yaml
│   ├── bus-windows-app-builder.yaml
│   ├── bus-macos-app-builder.yaml
│   ├── bus-android-app-builder.yaml
│   ├── bus-ios-app-builder.yaml
│   ├── bus-flutter-app-builder.yaml
│   ├── bus-flutter-desktop-builder.yaml
│   ├── bus-expo-app-builder.yaml
│   ├── bus-secure-app-builder.yaml
│   ├── bus-agent-security.yaml
│   ├── bus-security-auditor.yaml
│   └── bus-audit-release.yaml
│
├── plugins/                                # Portable, installable bundle plugins (17 bundles)
│   ├── bus-web-app-builder/
│   │   ├── plugin.json
│   │   ├── .claude-plugin/plugin.json
│   │   ├── .codex-plugin/plugin.json
│   │   └── skills/
│   │       ├── frontend-ui-engineering/SKILL.md
│   │       ├── react-best-practices/SKILL.md
│   │       └── ...
│   └── ... (all 17 focused bundles)
│
├── router/
│   ├── SKILL.md                            # Agent Skill definition for router
│   ├── __init__.py                         # Python package
│   ├── engine.py                           # 11-step routing orchestrator & bundle loader
│   ├── cli.py                              # CLI interface
│   ├── models.py                           # Dataclasses & types
│   ├── profiles/                           # Profile router documentation
│   ├── conflicts/                          # Conflict matrix & hard rules
│   └── verification/                       # Release gates & completion standard
│
├── registry/
│   ├── skills.json                         # Pinned skill catalog with rich metadata (175 skills)
│   ├── sources.json                        # 25 trusted source repositories
│   ├── compatibility.json                  # Platform & framework matrix
│   ├── conflicts.json                      # Machine-readable exclusions
│   ├── lock.json                           # Cryptographic deterministic lockfile
│   └── plugins.json                        # Index of all 17 portable bundle plugins
│
├── profiles/                               # Domain profile definitions & READMEs
├── schemas/                                # JSON schemas for skills, bundles, plugins, locks, conflicts
├── scripts/                                # Standalone CLI tools, validators & generators
│   ├── build_full_registry.py              # Full registry and bundle builder
│   ├── generate_plugins.py                 # Portable plugin generator
│   ├── scan_supply_chain.py                # Snyk Agent Scan admission pipeline (Section 17)
│   ├── validate_registry.py                # Comprehensive registry and bundle validator
│   ├── verify_lock.py                      # Cryptographic lockfile verifier
│   ├── audit_everything.py                 # Multi-perspective workspace auditor
│   └── route.py                            # CLI entrypoint
└── tests/                                  # Comprehensive automated test suite (34 tests)
    ├── test_bundles.py                     # Bundle manifest & plugin parity tests
    ├── test_cli.py                         # CLI end-to-end tests
    ├── test_conflicts.py                   # Hard conflict & warning tests
    ├── test_registry.py                    # Registry integrity & lockfile parity tests
    └── test_router.py                      # Canonical routing & context budget tests
```

---

## License

Apache-2.0. Upstream skills referenced in the registry retain their respective original licenses.
