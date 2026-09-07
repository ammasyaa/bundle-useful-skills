# Mobile Development Profile

The **Mobile Development** profile enforces platform-native excellence across Android, iOS, and mobile cross-platform stacks.

---

## 1. Supported Stacks

1. **Android**: [`android-skills`](../../registry/skills.json) — Jetpack Compose, Material Design 3, TalkBack, back navigation.
2. **iOS**: [`openai-build-ios-apps`](../../registry/skills.json) — Apple HIG, SwiftUI, VoiceOver, memory audits.
3. **Flutter Mobile**: [`flutter-agent-plugins`](../../registry/skills.json) + [`dart-lang-skills`](../../registry/skills.json) — Widget tests, integration tests.
4. **Expo / React Native**: [`expo-skills`](../../registry/skills.json) + [`emil-animate-expo`](../../registry/skills.json) — File routing, gestures, haptics.

---

## 2. Cross-Platform Validation Mandate

- Success on one platform does **not** prove cross-platform correctness.
- When working on Flutter or Expo, test behavior and visual appearance on **both** iOS and Android simulators.
- Verify platform-specific interactions: hardware back button on Android, interactive pop gesture on iOS, and dynamic type font scaling on both.
