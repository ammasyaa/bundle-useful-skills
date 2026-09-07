# Desktop Release Gate Checklist

Before releasing a desktop application build (Windows, macOS, or Linux), verify each item:

- [ ] **Native Build**: Framework-native build succeeds without fatal compiler warnings.
- [ ] **Platform HIG Adherence**:
  - Windows: Follows Fluent Design, mica/acrylic conventions, and standard ribbon/command bar patterns.
  - macOS: Conforms to Apple HIG, titlebar standards, menu bar conventions, and unified toolbar.
- [ ] **Keyboard Interaction**: Full tab traversal, standard focus visual states, and platform shortcuts.
- [ ] **Screen Reader Support**: Narrator (Windows) / VoiceOver (macOS) correctly reads controls and labels.
- [ ] **Display & DPI Scaling**: Clean rendering at 100%, 125%, 150%, and 200% scaling factors without fuzziness.
- [ ] **Window Lifecycle**: Safe handling of minimize, maximize, snap, multi-monitor dragging, and state restoration.
- [ ] **Security & Sandboxing**:
  - IPC message handlers validate types, bounds, and origin
  - Minimal entitlements and capabilities requested
  - Context isolation enabled (Electron) or capability scopes enforced (Tauri)
- [ ] **Packaging & Signing**: Distribution binaries signed, notarized (macOS), or packaged with valid appx/msix manifest.
