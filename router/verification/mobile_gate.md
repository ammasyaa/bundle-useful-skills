# Mobile Release Gate Checklist

Before releasing a mobile application build (iOS, Android, Flutter, or Expo), verify each item:

- [ ] **Native Compilation**: Target release build succeeds in Xcode / Gradle with release keystores/certificates.
- [ ] **Touch Target Standards**: All interactive elements measure at least 48x48dp (Android) or 44x44pt (iOS).
- [ ] **Dynamic Type & Font Scaling**: Layout remains functional and readable at maximum accessibility font scale.
- [ ] **Screen Readers**: VoiceOver and TalkBack test navigation flows and properly pronounce accessibility labels.
- [ ] **Edge-to-Edge & Safe Area**: Full view under system status bars, home indicators, and camera cutouts/notches.
- [ ] **Back Navigation**: Hardware/gesture back on Android and interactive swipe back on iOS operate predictably.
- [ ] **Permissions & Privacy**: Sensitive permissions (camera, location, contacts) requested just-in-time with user-facing explanation strings.
- [ ] **Memory & Resource Leak Audit**: Profiling confirms no view retain cycles or battery-draining background loops.
- [ ] **Dual-Platform QA**: For Flutter or Expo apps, functional validation performed on both Android and iOS devices or simulators.
