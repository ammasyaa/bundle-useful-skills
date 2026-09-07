# Hard Conflict Rules & Invariants

This document establishes the non-negotiable architectural barriers enforced by `bundle-useful-skills`.

---

## Invariant 1: Single Framework Authority Per Surface

Never load competing framework authorities for the same platform target.

- **Desktop**: A Windows project cannot activate `flutter-agent-plugins` alongside `microsoft-winui`. A macOS project cannot activate `microsoft-winui` alongside `openai-build-macos-apps`.
- **Mobile**: A mobile project must choose either `flutter-agent-plugins` or `expo-skills`, or a native platform target (`android-skills` or `openai-build-ios-apps`).
- **Container**: A desktop shell cannot combine Tauri and Electron architectures.

---

## Invariant 2: Paradigm Separation

- **React vs Flutter**: React hooks, JSX idioms, and web DOM conventions must never be applied to Flutter widget trees.
- **SwiftUI vs Android**: SwiftUI view builders and Apple HIG materials must never be ported verbatim into Jetpack Compose or Material 3.
- **Web CSS vs Native**: Web CSS animations (GSAP, raw keyframes) must not be forced into native mobile or desktop runtimes; use native physics and driver animations.

---

## Invariant 3: Single Creative Director

Creative direction requires unity of aesthetic vision.
- `taste-skill-frontend` and `anthropic-frontend-design` are mutually exclusive.
- Activating both creates divergent guidance on typography, color temperature, and component hierarchy.
- Choose `taste-skill-frontend` for marketing/editorial or `anthropic-frontend-design` for bespoke application UI.

---

## Invariant 4: Token Context Economy

- Do not load `olzn-ui-craft` and `pbakaus-impeccable` simultaneously unless explicitly conducting design-system token drift remediation.
- Do not load `browser-use` when `firecrawl-cli` can retrieve the required information statically.
