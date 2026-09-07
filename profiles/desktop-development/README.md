# Desktop Development Profile

The **Desktop Development** profile enforces strict framework isolation for native and cross-platform desktop environments.

---

## 1. Supported Framework Authorities

Select **exactly one** primary desktop authority:

1. **Windows / WinUI**: [`microsoft-winui`](../../registry/skills.json) — Fluent Design, XAML controls, Windows App SDK.
2. **macOS**: [`openai-build-macos-apps`](../../registry/skills.json) — Apple HIG, SwiftUI/AppKit, window lifecycle, menu bar.
3. **Flutter Desktop**: [`flutter-agent-plugins`](../../registry/skills.json) + [`dart-lang-skills`](../../registry/skills.json).
4. **Tauri**: [`tauri-official-guidance`](../../registry/skills.json) — Rust backend, capabilities, CSP, IPC command isolation.
5. **Electron**: [`electron-official-guidance`](../../registry/skills.json) — `contextIsolation`, preload safety, sandbox.

---

## 2. Platform Translation Rule

> **Apple taste ≠ copy Apple appearance.**

When applying design principles from `emilkowalski/skills` to non-Apple platforms:
- Windows applications must respect Fluent Design conventions, Mica/Acrylic backdrops, and Windows standard keyboard idioms.
- Linux/GTK or cross-platform desktop applications must respect native system density, fonts, and window chrome.
- Never force macOS traffic-light buttons or iOS style sheets onto Windows or Android.
