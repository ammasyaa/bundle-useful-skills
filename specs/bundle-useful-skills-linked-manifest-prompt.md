# Bundle Useful Skills — Linked Bundle Manifest Prompt

Use this file to build `bundle-useful-skills`.

**Reference model:**  
https://github.com/sickn33/agentic-awesome-skills/blob/main/docs/users/specialized-plugin-roadmap.md

## Core rule

This project **bundles existing Agent Skills**. Do not rewrite them from scratch.

For every listed skill:

1. Open the linked upstream source.
2. Verify the exact current path and license.
3. Pin an exact commit/tag.
4. Record SHA-256.
5. Copy/package the upstream skill unchanged unless an adapter is strictly required.
6. Never fetch mutable `main` instructions at normal runtime.

A bundle is an **installable focused subset**, not a mega-skill.

**Context target:** 2–5 active skills normally; 5–7 only for complex work.

Legend:

- **CORE** = should be included in the bundle.
- **COND** = include/activate only when the task requires it.
- **ALT** = alternative; do not activate competing alternatives together.

---

# 1. Engineering Core

Bundle: `bus-engineering-core`

Source repo: https://github.com/obra/superpowers

| Skill | Mode | Use |
|---|---|---|
| [brainstorming](https://github.com/obra/superpowers/blob/main/skills/brainstorming/SKILL.md) | COND | Ambiguous/new feature design |
| [writing-plans](https://github.com/obra/superpowers/blob/main/skills/writing-plans/SKILL.md) | COND | Multi-step implementation plan |
| [test-driven-development](https://github.com/obra/superpowers/blob/main/skills/test-driven-development/SKILL.md) | COND | Feature/bug work suited to TDD |
| [systematic-debugging](https://github.com/obra/superpowers/blob/main/skills/systematic-debugging/SKILL.md) | CORE | Bugs, failures, unknown root causes |
| [requesting-code-review](https://github.com/obra/superpowers/blob/main/skills/requesting-code-review/SKILL.md) | COND | Pre-merge review |
| [verification-before-completion](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md) | CORE | Evidence before completion claims |
| [subagent-driven-development](https://github.com/obra/superpowers/blob/main/skills/subagent-driven-development/SKILL.md) | COND | Large parallelizable implementation |

Do not activate the entire Superpowers set for every task.

---

# 2. Search & Research

Bundle: `bus-research-intelligence`

## Retrieval

| Skill | Mode | Use |
|---|---|---|
| [firecrawl-search](https://github.com/firecrawl/cli/blob/main/skills/firecrawl-search/SKILL.md) | CORE | Web/developer/news/paper discovery |

Source repo: https://github.com/firecrawl/cli

## Deep Research

| Skill | Mode | Use |
|---|---|---|
| [deep-research](https://github.com/bytedance/deer-flow/blob/main/skills/public/deep-research/SKILL.md) | CORE | Multi-source deep synthesis |
| [github-deep-research](https://github.com/bytedance/deer-flow/blob/main/skills/public/github-deep-research/SKILL.md) | COND | GitHub repo/ecosystem comparison |
| [academic-paper-review](https://github.com/bytedance/deer-flow/tree/main/skills/public/academic-paper-review) | COND | Individual academic paper review |
| [systematic-literature-review](https://github.com/bytedance/deer-flow/tree/main/skills/public/systematic-literature-review) | COND | Literature synthesis |

Source repo: https://github.com/bytedance/deer-flow

## Interactive Research / QA

| Skill | Mode | Use |
|---|---|---|
| [browser-use](https://github.com/browser-use/browser-use/blob/main/skills/browser-use/SKILL.md) | COND | Interactive/JS/authenticated sites |
| [qa](https://github.com/browser-use/browser-use/blob/main/skills/qa/SKILL.md) | COND | Real-browser website/web-app QA |

Source repo: https://github.com/browser-use/browser-use

## Fresh Community Signal

| Skill | Mode | Use |
|---|---|---|
| [last30days](https://github.com/mvanhorn/last30days-skill/blob/main/skills/last30days/SKILL.md) | COND | Recent community/ecosystem sentiment |

Source repo: https://github.com/mvanhorn/last30days-skill

Research routing:

```text
simple lookup       → firecrawl-search
deep research       → firecrawl-search + deep-research
GitHub comparison   → github-deep-research
interactive website → browser-use
runtime website QA  → qa
recent sentiment    → last30days
```

---

# 3. Product UI / UX / Taste

Bundle: `bus-product-ui-taste`

## Creative Direction — choose one

| Skill | Mode | Use |
|---|---|---|
| [design-taste-frontend](https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md) | ALT | Expressive marketing/editorial/corporate web |
| [frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) | ALT | Distinctive production frontend direction |

Sources:
- https://github.com/Leonxlnx/taste-skill
- https://github.com/anthropics/skills

Never activate both creative directors by default.

## Interaction / Apple-Level Craft

| Skill | Mode | Use |
|---|---|---|
| [emil-design-eng](https://github.com/emilkowalski/skills/blob/main/skills/emil-design-eng/SKILL.md) | CORE | Interface craft and design engineering |
| [apple-design](https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md) | COND | Apple-like restraint, physical motion, feedback |
| [animate](https://github.com/emilkowalski/skills/blob/main/skills/animate/SKILL.md) | COND | Implement web/interface motion |
| [animate-expo](https://github.com/emilkowalski/skills/blob/main/skills/animate-expo/SKILL.md) | COND | Expo/React Native motion |
| [review-animations](https://github.com/emilkowalski/skills/blob/main/skills/review-animations/SKILL.md) | COND | Motion review |
| [improve-animations](https://github.com/emilkowalski/skills/blob/main/skills/improve-animations/SKILL.md) | COND | Codebase-level motion improvement |

Source repo: https://github.com/emilkowalski/skills

**Apple taste ≠ copy Apple UI.**  
Apply craft, restraint, hierarchy, feedback and motion quality through the target platform's native conventions.

## UI/UX Intelligence

| Skill | Mode | Use |
|---|---|---|
| [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md) | CORE | UX patterns, typography, palettes, product/UI research |

Source repo: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

## Final UI Critic

| Skill | Mode | Use |
|---|---|---|
| [impeccable](https://github.com/pbakaus/impeccable/blob/main/.vibe/skills/impeccable/SKILL.md) | CORE | UI/UX audit, critique, polish, anti-slop |

Source repo: https://github.com/pbakaus/impeccable

## Deep Design-System Work

| Skill | Mode | Use |
|---|---|---|
| [ui-craft](https://github.com/olzn/ui-craft/blob/main/ui-craft/SKILL.md) | COND | Route deep design-system work |
| [surface-motion](https://github.com/olzn/ui-craft/blob/main/surface/surface-motion/SKILL.md) | COND | Motion system |
| [surface-interaction](https://github.com/olzn/ui-craft/blob/main/surface/surface-interaction/SKILL.md) | COND | Interaction system |
| [surface-typography](https://github.com/olzn/ui-craft/blob/main/surface/surface-typography/SKILL.md) | COND | Typography system |
| [system-tokens](https://github.com/olzn/ui-craft/blob/main/system/system-tokens/SKILL.md) | COND | Design tokens |
| [system-components](https://github.com/olzn/ui-craft/blob/main/system/system-components/SKILL.md) | COND | Component-system architecture |
| [system-patterns](https://github.com/olzn/ui-craft/blob/main/system/system-patterns/SKILL.md) | COND | Reusable UI patterns |

Source repo: https://github.com/olzn/ui-craft

---

# 4. Web App Builder

Bundle: `bus-web-app-builder`

## General Web Engineering

Source repo: https://github.com/addyosmani/agent-skills

| Skill | Mode | Use |
|---|---|---|
| [source-driven-development](https://github.com/addyosmani/agent-skills/blob/main/skills/source-driven-development/SKILL.md) | CORE | Verify framework/library decisions against current sources |
| [frontend-ui-engineering](https://github.com/addyosmani/agent-skills/blob/main/skills/frontend-ui-engineering/SKILL.md) | CORE | Production UI implementation |
| [browser-testing-with-devtools](https://github.com/addyosmani/agent-skills/blob/main/skills/browser-testing-with-devtools/SKILL.md) | CORE | Runtime browser verification |
| [code-review-and-quality](https://github.com/addyosmani/agent-skills/blob/main/skills/code-review-and-quality/SKILL.md) | CORE | General engineering review |
| [api-and-interface-design](https://github.com/addyosmani/agent-skills/blob/main/skills/api-and-interface-design/SKILL.md) | COND | Public/module/API interfaces |
| [performance-optimization](https://github.com/addyosmani/agent-skills/blob/main/skills/performance-optimization/SKILL.md) | COND | Performance-sensitive code |
| [observability-and-instrumentation](https://github.com/addyosmani/agent-skills/blob/main/skills/observability-and-instrumentation/SKILL.md) | COND | Logs/metrics/tracing |
| [shipping-and-launch](https://github.com/addyosmani/agent-skills/blob/main/skills/shipping-and-launch/SKILL.md) | COND | Release |

## React / Next.js Authority

Source repo: https://github.com/vercel-labs/agent-skills

| Skill | Mode | Use |
|---|---|---|
| [react-best-practices](https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md) | CORE* | React/Next implementation |
| [vercel-composition-patterns](https://github.com/vercel-labs/agent-skills/blob/main/skills/composition-patterns/SKILL.md) | COND* | Component/API architecture |
| [web-design-guidelines](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md) | COND* | Web-interface review |

`*` React/web only. Never apply these as Flutter/SwiftUI/WinUI authority.

Recommended premium web UI route:

```text
frontend-ui-engineering
+ framework authority
+ emil-design-eng
+ impeccable
```

Add `design-taste-frontend` or `frontend-design` only when creative direction is actually needed.

---

# 5. Backend / API / Data

Bundle: `bus-backend-api-data`

## Core Backend/Interface Skills

| Skill | Mode | Source |
|---|---|---|
| [source-driven-development](https://github.com/addyosmani/agent-skills/blob/main/skills/source-driven-development/SKILL.md) | CORE | Addy Osmani |
| [api-and-interface-design](https://github.com/addyosmani/agent-skills/blob/main/skills/api-and-interface-design/SKILL.md) | CORE | Addy Osmani |
| [code-review-and-quality](https://github.com/addyosmani/agent-skills/blob/main/skills/code-review-and-quality/SKILL.md) | CORE | Addy Osmani |
| [observability-and-instrumentation](https://github.com/addyosmani/agent-skills/blob/main/skills/observability-and-instrumentation/SKILL.md) | COND | Addy Osmani |

## PostgreSQL / Supabase

Source repo: https://github.com/supabase/agent-skills

| Skill | Mode | Use |
|---|---|---|
| [supabase-postgres-best-practices](https://github.com/supabase/agent-skills#supabase-postgres-best-practices) | CORE* | PostgreSQL schema/query/index/RLS work |
| [supabase](https://github.com/supabase/agent-skills/blob/main/skills/supabase/SKILL.md) | COND | Actual Supabase projects |

`*` Activate for PostgreSQL work, not every backend.

## Conditional Provider Sources

Do not force these into the base bundle. Resolve current skill IDs only when the project uses the provider.

- Cloudflare skills: https://github.com/cloudflare/skills
- Neon skills: https://github.com/neondatabase/agent-skills
- Prisma skills: https://github.com/prisma/skills
- Laravel skills: https://github.com/laravel/agent-skills

---

# 6. SEO / GEO / Web Quality

Bundle: `bus-seo-geo-web-quality`

## Measured Web Quality

Source repo: https://github.com/addyosmani/web-quality-skills

| Skill | Mode | Use |
|---|---|---|
| [web-quality-audit](https://github.com/addyosmani/web-quality-skills/blob/main/skills/web-quality-audit/SKILL.md) | CORE | Complete evidence-led web audit |
| [performance](https://github.com/addyosmani/web-quality-skills/blob/main/skills/performance/SKILL.md) | COND | Loading/runtime performance |
| [core-web-vitals](https://github.com/addyosmani/web-quality-skills/blob/main/skills/core-web-vitals/SKILL.md) | CORE | LCP/INP/CLS |
| [accessibility](https://github.com/addyosmani/web-quality-skills/blob/main/skills/accessibility/SKILL.md) | CORE | WCAG 2.2 |
| [seo](https://github.com/addyosmani/web-quality-skills/blob/main/skills/seo/SKILL.md) | CORE | Technical/on-page SEO |
| [best-practices](https://github.com/addyosmani/web-quality-skills/blob/main/skills/best-practices/SKILL.md) | COND | Browser/security/quality baseline |

Evidence preference:

```text
field/RUM → DevTools/Lighthouse → runtime inspection → static source
```

## GEO / AEO / AI Search

Source repo: https://github.com/coreyhaines31/marketingskills

| Skill | Mode | Use |
|---|---|---|
| [seo-audit](https://github.com/coreyhaines31/marketingskills/blob/main/skills/seo-audit/SKILL.md) | CORE | SEO audit strategy |
| [ai-seo](https://github.com/coreyhaines31/marketingskills/blob/main/skills/ai-seo/SKILL.md) | CORE | GEO/AEO/LLM citation readiness |
| [schema](https://github.com/coreyhaines31/marketingskills/blob/main/skills/schema/SKILL.md) | CORE | Structured data |
| [site-architecture](https://github.com/coreyhaines31/marketingskills/blob/main/skills/site-architecture/SKILL.md) | CORE | IA, URLs, navigation, internal links |
| [programmatic-seo](https://github.com/coreyhaines31/marketingskills/blob/main/skills/programmatic-seo/SKILL.md) | COND | Scaled public pages with real differentiated value |

Web-app routing:

```text
public/indexable route → SEO + GEO/AEO + CWV
private/auth route     → normally exclude from search optimization
```

---

# 7. Windows / WinUI Desktop

Bundle: `bus-windows-app-builder`

Source repo: https://github.com/microsoft/win-dev-skills

| Skill | Mode | Use |
|---|---|---|
| [winui-dev-workflow](https://github.com/microsoft/win-dev-skills/blob/main/plugins/winui/skills/winui-dev-workflow/SKILL.md) | CORE | Build/run/fix WinUI |
| [winui-design](https://github.com/microsoft/win-dev-skills/blob/main/plugins/winui/skills/winui-design/SKILL.md) | CORE | Fluent UI/XAML/accessibility |
| [winui-code-review](https://github.com/microsoft/win-dev-skills/blob/main/plugins/winui/skills/winui-code-review/SKILL.md) | CORE | WinUI-specific code review |
| [winui-ui-testing](https://github.com/microsoft/win-dev-skills/blob/main/plugins/winui/skills/winui-ui-testing/SKILL.md) | CORE | Native UI automation |
| [winui-packaging](https://github.com/microsoft/win-dev-skills/blob/main/plugins/winui/skills/winui-packaging/SKILL.md) | COND | Packaging/release |
| [winui-setup](https://github.com/microsoft/win-dev-skills/blob/main/plugins/winui/skills/winui-setup/SKILL.md) | COND | Machine/toolchain setup |
| [winui-wpf-migration](https://github.com/microsoft/win-dev-skills/blob/main/plugins/winui/skills/winui-wpf-migration/SKILL.md) | COND | WPF migration |

Windows/Fluent remains platform authority.  
Taste skills may improve craft but must not make WinUI imitate macOS.

---

# 8. macOS Desktop

Bundle: `bus-macos-app-builder`

Source plugin: https://github.com/openai/plugins/tree/main/plugins/build-macos-apps

Default focused bundle:

| Skill | Mode | Use |
|---|---|---|
| [build-run-debug](https://github.com/openai/plugins/blob/main/plugins/build-macos-apps/skills/build-run-debug/SKILL.md) | CORE | Native build/run/debug |
| [swiftui-patterns](https://github.com/openai/plugins/blob/main/plugins/build-macos-apps/skills/swiftui-patterns/SKILL.md) | CORE | SwiftUI implementation |
| [window-management](https://github.com/openai/plugins/blob/main/plugins/build-macos-apps/skills/window-management/SKILL.md) | CORE | macOS windows/scenes |
| [appkit-interop](https://github.com/openai/plugins/blob/main/plugins/build-macos-apps/skills/appkit-interop/SKILL.md) | COND | SwiftUI/AppKit boundary |
| [view-refactor](https://github.com/openai/plugins/blob/main/plugins/build-macos-apps/skills/view-refactor/SKILL.md) | COND | View structure/refactor |
| [test-triage](https://github.com/openai/plugins/blob/main/plugins/build-macos-apps/skills/test-triage/SKILL.md) | CORE | Test/debug triage |
| [signing-entitlements](https://github.com/openai/plugins/blob/main/plugins/build-macos-apps/skills/signing-entitlements/SKILL.md) | COND | Signing/entitlements |
| [packaging-notarization](https://github.com/openai/plugins/blob/main/plugins/build-macos-apps/skills/packaging-notarization/SKILL.md) | COND | Distribution/notarization |
| [telemetry](https://github.com/openai/plugins/blob/main/plugins/build-macos-apps/skills/telemetry/SKILL.md) | COND | Native runtime telemetry |

Platform authority: current Apple HIG + native macOS conventions.

Design companion when needed:

- [emil-design-eng](https://github.com/emilkowalski/skills/blob/main/skills/emil-design-eng/SKILL.md)
- [apple-design](https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md)
- [impeccable](https://github.com/pbakaus/impeccable/blob/main/.vibe/skills/impeccable/SKILL.md)

---

# 9. Native Android

Bundle: `bus-android-app-builder`

Source repo/catalog: https://github.com/android/skills

Android skills evolve quickly. Keep the official catalog discoverable and pin selected skills per bundle revision.

| Skill | Mode | Use |
|---|---|---|
| [android-cli](https://github.com/android/skills/blob/main/devtools/android-cli/SKILL.md) | CORE | Official docs, SDK/device/project/skill discovery |
| [edge-to-edge](https://github.com/android/skills/blob/main/system/edge-to-edge/SKILL.md) | COND | Compose insets/system bars/IME |
| [play-policy-insights](https://github.com/android/skills/blob/main/play/play-policy-insights/SKILL.md) | COND | Play policy/data safety/release compliance |
| [android-intent-security](https://github.com/android/skills/tree/main/security/android-intent-security) | COND | Intent/component security |
| [camerax](https://github.com/android/skills/tree/main/media/camerax) | COND | CameraX work |
| [agp-9-upgrade](https://github.com/android/skills/tree/main/build/agp-9-upgrade) | COND | AGP upgrade |

Use `android-cli`/official catalog to discover newer Android skills before adding custom ones.

Android/Material remains implementation authority.

---

# 10. Native iOS

Bundle: `bus-ios-app-builder`

Source plugin: https://github.com/openai/plugins/tree/main/plugins/build-ios-apps

| Skill | Mode | Use |
|---|---|---|
| [swiftui-ui-patterns](https://github.com/openai/plugins/blob/main/plugins/build-ios-apps/skills/swiftui-ui-patterns/SKILL.md) | CORE | SwiftUI UI architecture |
| [swiftui-view-refactor](https://github.com/openai/plugins/blob/main/plugins/build-ios-apps/skills/swiftui-view-refactor/SKILL.md) | COND | Refactor large views |
| [ios-debugger-agent](https://github.com/openai/plugins/blob/main/plugins/build-ios-apps/skills/ios-debugger-agent/SKILL.md) | CORE | Simulator build/run/debug |
| [ios-simulator-browser](https://github.com/openai/plugins/blob/main/plugins/build-ios-apps/skills/ios-simulator-browser/SKILL.md) | CORE | Simulator visual/runtime inspection |
| [swiftui-performance-audit](https://github.com/openai/plugins/blob/main/plugins/build-ios-apps/skills/swiftui-performance-audit/SKILL.md) | COND | SwiftUI performance audit |
| [ios-ettrace-performance](https://github.com/openai/plugins/blob/main/plugins/build-ios-apps/skills/ios-ettrace-performance/SKILL.md) | COND | ETTrace profiling |
| [ios-memgraph-leaks](https://github.com/openai/plugins/blob/main/plugins/build-ios-apps/skills/ios-memgraph-leaks/SKILL.md) | COND | Memory/leak investigation |
| [swiftui-liquid-glass](https://github.com/openai/plugins/blob/main/plugins/build-ios-apps/skills/swiftui-liquid-glass/SKILL.md) | COND | Native current Liquid Glass APIs |
| [ios-app-intents](https://github.com/openai/plugins/blob/main/plugins/build-ios-apps/skills/ios-app-intents/SKILL.md) | COND | App Intents/System integrations |

Apple HIG remains platform authority.

---

# 11. Flutter — Mobile & Desktop

Bundle variants:
- `bus-flutter-app-builder`
- `bus-flutter-desktop-builder`

Flutter source: https://github.com/flutter/agent-plugins  
Dart source: https://github.com/dart-lang/skills

## Flutter Skills

| Skill | Mode | Use |
|---|---|---|
| [flutter-add-widget-preview](https://github.com/flutter/agent-plugins/blob/main/skills/flutter-add-widget-preview/SKILL.md) | CORE | Preview UI |
| [flutter-add-widget-test](https://github.com/flutter/agent-plugins/blob/main/skills/flutter-add-widget-test/SKILL.md) | CORE | Widget interaction/render testing |
| [flutter-add-integration-test](https://github.com/flutter/agent-plugins/blob/main/skills/flutter-add-integration-test/SKILL.md) | CORE | End-to-end user-flow testing |

## Dart Quality Skills

| Skill | Mode | Use |
|---|---|---|
| [dart-run-static-analysis](https://github.com/dart-lang/skills/blob/main/skills/dart-run-static-analysis/SKILL.md) | CORE | Analyze/fix lint/static issues |
| [dart-add-unit-test](https://github.com/dart-lang/skills/blob/main/skills/dart-add-unit-test/SKILL.md) | CORE | Dart unit testing |
| [dart-collect-coverage](https://github.com/dart-lang/skills/blob/main/skills/dart-collect-coverage/SKILL.md) | COND | Coverage |
| [dart-fix-runtime-errors](https://github.com/dart-lang/skills/blob/main/skills/dart-fix-runtime-errors/SKILL.md) | COND | Runtime errors |
| [dart-generate-test-mocks](https://github.com/dart-lang/skills/blob/main/skills/dart-generate-test-mocks/SKILL.md) | COND | Test mocks |
| [dart-resolve-package-conflicts](https://github.com/dart-lang/skills/blob/main/skills/dart-resolve-package-conflicts/SKILL.md) | COND | Package/dependency conflicts |

For mobile targets, validate Android and iOS separately.

---

# 12. Expo / React Native

Bundle: `bus-expo-app-builder`

Source repo: https://github.com/expo/skills

| Skill | Mode | Use |
|---|---|---|
| [expo-project-structure](https://github.com/expo/skills/blob/main/plugins/expo/skills/expo-project-structure/SKILL.md) | CORE | Project organization |
| [expo-router](https://github.com/expo/skills/blob/main/plugins/expo/skills/expo-router/SKILL.md) | CORE* | Navigation/routing |
| [expo-native-ui](https://github.com/expo/skills/blob/main/plugins/expo/skills/expo-native-ui/SKILL.md) | CORE | Native-feeling platform UI |
| [expo-ui](https://github.com/expo/skills/blob/main/plugins/expo/skills/expo-ui/SKILL.md) | COND | Native UI components |
| [expo-data-fetching](https://github.com/expo/skills/blob/main/plugins/expo/skills/expo-data-fetching/SKILL.md) | CORE* | Networking/cache/offline |
| [expo-design-system](https://github.com/expo/skills/blob/main/plugins/expo/skills/expo-design-system/SKILL.md) | CORE | Tokens/components/system consistency |
| [expo-dev-client](https://github.com/expo/skills/blob/main/plugins/expo/skills/expo-dev-client/SKILL.md) | COND | Dev-client workflow |
| [expo-module](https://github.com/expo/skills/blob/main/plugins/expo/skills/expo-module/SKILL.md) | COND | Native module development |
| [expo-upgrade](https://github.com/expo/skills/blob/main/plugins/expo/skills/expo-upgrade/SKILL.md) | COND | SDK upgrade |

`*` Activate when the project uses that capability.

Motion companion:

- [animate-expo](https://github.com/emilkowalski/skills/blob/main/skills/animate-expo/SKILL.md)

---

# 13. Secure App Builder

Bundle: `bus-secure-app-builder`

Source repo: https://github.com/OWASP/secure-agent-playbook

| Skill | Mode | Use |
|---|---|---|
| [security-guidance](https://github.com/OWASP/secure-agent-playbook/blob/main/plugins/code-security-skills/skills/security-guidance/SKILL.md) | CORE | Secure-by-default implementation |
| [code-review-security](https://github.com/OWASP/secure-agent-playbook/blob/main/plugins/code-security-skills/skills/code-review-security/SKILL.md) | CORE | General secure code review |
| [web-security-review](https://github.com/OWASP/secure-agent-playbook/blob/main/plugins/code-security-skills/skills/web-security-review/SKILL.md) | COND | Web app |
| [api-security-review](https://github.com/OWASP/secure-agent-playbook/blob/main/plugins/code-security-skills/skills/api-security-review/SKILL.md) | COND | REST/GraphQL/gRPC/API |
| [mobile-code-review](https://github.com/OWASP/secure-agent-playbook/blob/main/plugins/code-security-skills/skills/mobile-code-review/SKILL.md) | COND | Android/iOS |
| [sca-audit](https://github.com/OWASP/secure-agent-playbook/blob/main/plugins/code-security-skills/skills/sca-audit/SKILL.md) | COND | Dependency CVEs/reachability |
| [secrets-scan](https://github.com/OWASP/secure-agent-playbook/blob/main/plugins/code-security-skills/skills/secrets-scan/SKILL.md) | CORE | Hard-coded secrets |
| [iac-security-review](https://github.com/OWASP/secure-agent-playbook/blob/main/plugins/code-security-skills/skills/iac-security-review/SKILL.md) | COND | Terraform/K8s/CloudFormation |
| [securability-engineering](https://github.com/OWASP/secure-agent-playbook/blob/main/plugins/code-security-skills/skills/securability-engineering/SKILL.md) | COND | Security-focused architecture/code generation |

Activate security automatically when work touches auth, permissions, PII, payments, persistence, file I/O, networking, cryptography, IPC, WebViews, secrets or untrusted input.

---

# 14. Agent / MCP / LLM Security

Bundle: `bus-agent-security`

Source repo: https://github.com/OWASP/secure-agent-playbook

| Skill | Mode | Use |
|---|---|---|
| [agent-security-audit](https://github.com/OWASP/secure-agent-playbook/blob/main/plugins/ai-security-skills/skills/agent-security-audit/SKILL.md) | CORE | Agent-system security |
| [llm-risk-assess](https://github.com/OWASP/secure-agent-playbook/blob/main/plugins/ai-security-skills/skills/llm-risk-assess/SKILL.md) | COND | LLM application risk |
| [agentic-ai-risk-assess](https://github.com/OWASP/secure-agent-playbook/blob/main/plugins/ai-security-skills/skills/agentic-ai-risk-assess/SKILL.md) | COND | Agentic-system risk |
| [mcp-server-review](https://github.com/OWASP/secure-agent-playbook/blob/main/plugins/ai-security-skills/skills/mcp-server-review/SKILL.md) | COND | MCP server review |
| [prompt-injection-test](https://github.com/OWASP/secure-agent-playbook/blob/main/plugins/ai-security-skills/skills/prompt-injection-test/SKILL.md) | COND | Authorized prompt-injection testing |
| [multi-agentic-threat-model](https://github.com/OWASP/secure-agent-playbook/blob/main/plugins/ai-security-skills/skills/multi-agentic-threat-model/SKILL.md) | COND | Multi-agent threat modeling |

---

# 15. Deep Security Auditor

Bundle: `bus-security-auditor`

Source repo: https://github.com/trailofbits/skills

| Skill | Mode | Use |
|---|---|---|
| [audit-context-building](https://github.com/trailofbits/skills/blob/main/plugins/audit-context-building/skills/audit-context-building/SKILL.md) | CORE | Understand codebase before hunting bugs |
| [static-analysis](https://github.com/trailofbits/skills/blob/main/plugins/static-analysis/skills/static-analysis/SKILL.md) | CORE | Static-analysis workflows |
| [differential-review](https://github.com/trailofbits/skills/blob/main/plugins/differential-review/skills/differential-review/SKILL.md) | COND | Security-focused diff review |
| [variant-analysis](https://github.com/trailofbits/skills/blob/main/plugins/variant-analysis/skills/variant-analysis/SKILL.md) | COND | Find variants of known root cause |
| [fp-check](https://github.com/trailofbits/skills/blob/main/plugins/fp-check/skills/fp-check/SKILL.md) | CORE | Validate suspected findings |
| [insecure-defaults](https://github.com/trailofbits/skills/blob/main/plugins/insecure-defaults/skills/insecure-defaults/SKILL.md) | COND | Dangerous default analysis |
| [sharp-edges](https://github.com/trailofbits/skills/blob/main/plugins/sharp-edges/skills/sharp-edges/SKILL.md) | COND | Footgun/API misuse analysis |
| [supply-chain-risk-auditor](https://github.com/trailofbits/skills/blob/main/plugins/supply-chain-risk-auditor/skills/supply-chain-risk-auditor/SKILL.md) | CORE | Dependency takeover/health risk |
| [property-based-testing](https://github.com/trailofbits/skills/blob/main/plugins/property-based-testing/skills/property-based-testing/SKILL.md) | COND | Invariant/property-based tests |

Audit order:

```text
audit-context-building
→ static-analysis
→ domain security review
→ differential/variant analysis as relevant
→ fp-check
→ supply-chain-risk-auditor
```

---

# 16. Universal Audit / Release

Bundle: `bus-audit-release`

## General Review

| Skill | Mode | Source |
|---|---|---|
| [code-review-and-quality](https://github.com/addyosmani/agent-skills/blob/main/skills/code-review-and-quality/SKILL.md) | CORE | Normal code review |
| [verification-before-completion](https://github.com/obra/superpowers/blob/main/skills/verification-before-completion/SKILL.md) | CORE | Final evidence gate |
| [impeccable](https://github.com/pbakaus/impeccable/blob/main/.vibe/skills/impeccable/SKILL.md) | COND | UI/UX review |
| [web-quality-audit](https://github.com/addyosmani/web-quality-skills/blob/main/skills/web-quality-audit/SKILL.md) | COND | Web quality |
| [audit-context-building](https://github.com/trailofbits/skills/blob/main/plugins/audit-context-building/skills/audit-context-building/SKILL.md) | COND | Architecture/security context |
| [supply-chain-risk-auditor](https://github.com/trailofbits/skills/blob/main/plugins/supply-chain-risk-auditor/skills/supply-chain-risk-auditor/SKILL.md) | COND | Dependencies |

## Large / Risky Change Review

Source repo: https://github.com/EveryInc/compound-engineering-plugin

| Skill | Mode | Use |
|---|---|---|
| [ce-code-review](https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-code-review/SKILL.md) | COND | Deep independent multi-perspective code review |
| [ce-test-browser](https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-test-browser/SKILL.md) | COND | Browser testing |
| [ce-test-xcode](https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-test-xcode/SKILL.md) | COND | Apple/Xcode testing |
| [ce-polish](https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-polish/SKILL.md) | COND | Release polish |
| [ce-dogfood](https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-dogfood/SKILL.md) | COND | Product-use review |
| [ce-optimize](https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-optimize/SKILL.md) | COND | Optimization |
| [ce-simplify-code](https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-simplify-code/SKILL.md) | COND | Simplification after correctness |

Do not make Compound Engineering compete with Superpowers as the normal implementation process. Use these primarily as independent audit/release capabilities.

---

# 17. Bundle Supply-Chain Scanner

Tool source: https://github.com/snyk/agent-scan

This is supporting infrastructure rather than a normal development skill.

Run it during upstream admission:

```text
candidate skill
→ verify repo/path/license
→ Snyk Agent Scan
→ inspect scripts/hooks/MCP/network access
→ compatibility test
→ pin commit/tag
→ hash
→ publish in bundle
```

---

# 18. Bundle Runtime Rules

The implementation agent must encode these rules in bundle metadata.

## Web

Typical product UI:

```text
frontend-ui-engineering
+ framework authority
+ emil-design-eng
+ impeccable
```

Add:
- `design-taste-frontend` **or** `frontend-design` for new visual direction.
- SEO/GEO skills only for public/indexable content.
- OWASP skills only when the relevant security surface exists.

## Windows

```text
winui-dev-workflow
+ winui-design
+ winui-ui-testing
+ verification-before-completion
```

## macOS

```text
build-run-debug
+ swiftui-patterns
+ test-triage
+ verification-before-completion
```

## iOS

```text
swiftui-ui-patterns
+ ios-debugger-agent
+ ios-simulator-browser
+ verification-before-completion
```

## Flutter

```text
flutter-add-widget-test
+ dart-run-static-analysis
+ relevant implementation skill
+ verification-before-completion
```

## Expo

```text
expo-project-structure
+ expo-native-ui
+ expo-design-system
+ relevant router/data skill
```

## Security Audit

```text
audit-context-building
+ relevant OWASP review
+ static-analysis
+ fp-check
```

Do not exceed the context budget without a concrete task reason.

---

# 19. Bundle Manifest Shape

Store only compact metadata; do not duplicate upstream instructions.

```yaml
id: bus-web-app-builder
job: modern web application development
skills:
  - id: frontend-ui-engineering
    url: https://github.com/addyosmani/agent-skills/blob/main/skills/frontend-ui-engineering/SKILL.md
  - id: react-best-practices
    url: https://github.com/vercel-labs/agent-skills/blob/main/skills/react-best-practices/SKILL.md
    when: react
recommended_with:
  - bus-product-ui-taste
  - bus-seo-geo-web-quality
  - bus-secure-app-builder
```

Registry record:

```yaml
id:
url:
repo:
path:
license:
commit:
sha256:
last_reviewed:
platform:
framework:
status: trusted | conditional | pending-review | rejected
conflicts: []
```

---

# 20. Final Build Requirement

Implement the repository as:

```text
best existing skills
→ linked source registry
→ review + pin + hash
→ focused bundle manifests
→ generated plugins
→ progressive individual-skill activation
```

Do **not**:

- create replacement skills when a strong upstream skill already exists
- write a giant custom mega-skill
- duplicate upstream instructions in this prompt
- activate every installed skill
- mix competing framework authorities
- make Apple appearance universal
- optimize private app routes for SEO
- trust unpinned mutable upstream content

Success means:

> A user installs one focused bundle, and the agent can immediately see exactly which existing upstream skills are available, where they come from, and when to activate only the few relevant ones.
